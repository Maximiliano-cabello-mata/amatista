from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from api.comun import asegurar_usuario, error_bd
from api.dependencias import puede_ver_alumno, resolver_alumno, usuario_opcional
from database.conexion import obtener_db
from database.modelos import ProgresoLeccion, Usuario, ahora

router = APIRouter(prefix="/api", tags=["progreso"])


class EventoProgreso(BaseModel):
    curso_id: str = Field(min_length=1, max_length=50)
    leccion_id: str = Field(min_length=1, max_length=50)
    completada: bool = False
    puntaje: Optional[int] = Field(default=None, ge=0, le=100)
    intentos: int = Field(default=0, ge=0, le=99999)
    actualizado_en: Optional[datetime] = None


class SolicitudProgreso(BaseModel):
    # Con sesión se ignora: el progreso siempre es del usuario de la sesión.
    usuario_id: Optional[str] = Field(default=None, max_length=100)
    eventos: List[EventoProgreso] = Field(min_length=1, max_length=500)


def combinar(a: EventoProgreso, b: EventoProgreso) -> EventoProgreso:
    """Une dos eventos de la misma lección sin perder avance."""
    puntajes = [p for p in (a.puntaje, b.puntaje) if p is not None]
    return a.model_copy(
        update={
            "completada": a.completada or b.completada,
            "puntaje": max(puntajes) if puntajes else None,
            "intentos": max(a.intentos, b.intentos),
        }
    )


@router.post("/progreso")
def guardar_progreso(
    datos: SolicitudProgreso,
    actual: Optional[Usuario] = Depends(usuario_opcional),
    db: Session = Depends(obtener_db),
):
    """Guarda el progreso enviado desde el dispositivo del alumno.

    El progreso nunca retrocede: una lección completada sigue completada y
    se conserva el mejor puntaje, aunque lleguen eventos viejos o repetidos.
    """
    por_leccion = {}
    for evento in datos.eventos:
        clave = (evento.curso_id, evento.leccion_id)
        por_leccion[clave] = combinar(por_leccion[clave], evento) if clave in por_leccion else evento

    try:
        alumno_id = resolver_alumno(db, actual, datos.usuario_id)
        asegurar_usuario(db, alumno_id)
        for (curso_id, leccion_id), evento in por_leccion.items():
            fila = db.get(ProgresoLeccion, (alumno_id, curso_id, leccion_id))
            if fila is None:
                fila = ProgresoLeccion(
                    usuario_id=alumno_id,
                    curso_id=curso_id,
                    leccion_id=leccion_id,
                    completada=0,
                    intentos=0,
                )
                db.add(fila)
            if evento.completada and not fila.completada:
                fila.completada_en = ahora()
            fila.completada = 1 if (fila.completada or evento.completada) else 0
            if evento.puntaje is not None:
                fila.puntaje = max(fila.puntaje or 0, evento.puntaje)
            fila.intentos = max(fila.intentos or 0, evento.intentos)
            fila.actualizado_en = ahora()
        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise error_bd(error, "/api/progreso")

    return {"guardados": len(por_leccion), "usuario_id": alumno_id}


@router.get("/progreso/{usuario_id}")
def leer_progreso(
    usuario_id: str,
    actual: Optional[Usuario] = Depends(usuario_opcional),
    db: Session = Depends(obtener_db),
):
    try:
        if not puede_ver_alumno(db, actual, usuario_id):
            if actual is None:
                raise HTTPException(status_code=401, detail="Inicia sesión para ver este progreso.")
            raise HTTPException(status_code=403, detail="No tienes permiso para ver este progreso.")
        filas = db.scalars(
            select(ProgresoLeccion).where(ProgresoLeccion.usuario_id == usuario_id)
        ).all()
    except SQLAlchemyError as error:
        raise error_bd(error, "/api/progreso")

    return {
        "usuario_id": usuario_id,
        "lecciones": [
            {
                "curso_id": fila.curso_id,
                "leccion_id": fila.leccion_id,
                "completada": bool(fila.completada),
                "puntaje": fila.puntaje,
                "intentos": fila.intentos,
                "actualizado_en": fila.actualizado_en.isoformat() if fila.actualizado_en else None,
            }
            for fila in filas
        ],
    }
