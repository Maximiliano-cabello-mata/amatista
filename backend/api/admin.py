"""Padrón de cuentas y roles (matriz del informe del 1 de octubre, sec. 4C).

- profesor y admin: leen el padrón de cuentas registradas.
- admin: cambia roles y marca cuentas de prueba.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from api.comun import error_bd, usuario_publico
from api.dependencias import es_cuenta_registrada, requiere_rol
from database.conexion import obtener_db
from database.modelos import ROLES, Usuario

router = APIRouter(prefix="/api/admin", tags=["administracion"])


class CambioCuenta(BaseModel):
    rol: Optional[str] = None
    es_prueba: Optional[bool] = None


@router.get("/usuarios")
def listar_usuarios(
    rol: Optional[str] = Query(default=None),
    limite: int = Query(default=50, ge=1, le=200),
    desde: int = Query(default=0, ge=0),
    _: Usuario = Depends(requiere_rol("profesor", "admin")),
    db: Session = Depends(obtener_db),
):
    """Cuentas registradas (con correo), las más nuevas primero."""
    consulta = select(Usuario).where(Usuario.email.is_not(None))
    if rol:
        consulta = consulta.where(Usuario.rol == rol)
    consulta = consulta.order_by(Usuario.creado_en.desc(), Usuario.id).offset(desde).limit(limite)
    try:
        usuarios = db.scalars(consulta).all()
    except SQLAlchemyError as error:
        raise error_bd(error, "/api/admin/usuarios")
    return {"usuarios": [usuario_publico(u) for u in usuarios], "desde": desde, "limite": limite}


@router.patch("/usuarios/{usuario_id}")
def cambiar_cuenta(
    usuario_id: str,
    datos: CambioCuenta,
    admin: Usuario = Depends(requiere_rol("admin")),
    db: Session = Depends(obtener_db),
):
    if datos.rol is not None and datos.rol not in ROLES:
        raise HTTPException(status_code=422, detail=f"Rol inválido. Usa uno de: {', '.join(ROLES)}.")
    if datos.rol is not None and usuario_id == admin.id and datos.rol != "admin":
        raise HTTPException(status_code=400, detail="No puedes quitarte el rol de administrador.")
    try:
        usuario = db.get(Usuario, usuario_id)
        if usuario is None or not es_cuenta_registrada(usuario) or usuario.fusionado_en:
            raise HTTPException(status_code=404, detail="No existe esa cuenta.")
        # El rol se lee de la base en cada petición: el cambio aplica de inmediato.
        if datos.rol is not None:
            usuario.rol = datos.rol
        if datos.es_prueba is not None:
            usuario.es_prueba = 1 if datos.es_prueba else 0
        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise error_bd(error, f"/api/admin/usuarios/{usuario_id}")
    return usuario_publico(usuario)
