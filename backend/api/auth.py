"""Cuentas: registro, inicio de sesión, confirmación de correo y recuperación.

Flujo (informe del 1 de octubre, sección 4):
- El alumno empieza sin cuenta con un id local ("alumno-<uuid>"). Al
  registrarse manda ese usuario_id y la misma fila recibe correo y
  contraseña: no pierde las lecciones ya completadas.
- Si inicia sesión en otro dispositivo, el progreso anónimo de ese
  dispositivo se fusiona con su cuenta (nunca retrocede).
- El correo se confirma con un código de 6 dígitos que llega por SMTP (o se
  escribe en la terminal en desarrollo). El mismo mecanismo recupera la
  contraseña.

El navegador recibe un token opaco; en SESIONES solo queda su SHA-256.
"""
import os
import re
import uuid
from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from api.comun import error_bd, usuario_publico
from api.dependencias import es_cuenta_registrada, usuario_requerido
from api.limites import limitar
from correo import enviar_codigo
from database.conexion import obtener_db
from database.modelos import EventoAprendizaje, Logro, ProgresoLeccion, Sesion, Usuario, ahora
from seguridad import (
    DURACION_CODIGO,
    DURACION_SESION,
    MAX_INTENTOS_CODIGO,
    codigos_iguales,
    hash_codigo,
    hash_password,
    hash_token,
    normalizar_email,
    nuevo_codigo,
    nuevo_token,
    requiere_rehash,
    verificar_password,
    verificar_password_señuelo,
)

router = APIRouter(prefix="/api/auth", tags=["autenticacion"])
# POST /api/confirmar-correo es la ruta que nombra el informe del 1 de octubre.
router_heredado = APIRouter(prefix="/api", tags=["autenticacion"])

MAX_INTENTOS_PASSWORD = 5
DURACION_BLOQUEO = timedelta(minutes=15)
PATRON_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

MENSAJE_CREDENCIALES = "Correo o contraseña incorrectos."
MENSAJE_CODIGO = "El código no es correcto o ya venció. Pide uno nuevo."
MENSAJE_CODIGO_ENVIADO = "Si el correo está registrado, te enviamos un código."

limite_cuentas = limitar("auth-cuentas", maximo=10, segundos=600)
limite_login = limitar("auth-login", maximo=20, segundos=300)
limite_codigos = limitar("auth-codigos", maximo=10, segundos=600)


# --- Esquemas ---------------------------------------------------------------


class ConEmail(BaseModel):
    email: str = Field(max_length=100)

    @field_validator("email")
    @classmethod
    def validar_email(cls, valor: str) -> str:
        valor = normalizar_email(valor)
        if not PATRON_EMAIL.match(valor):
            raise ValueError("Escribe un correo válido.")
        return valor


class Registro(ConEmail):
    nombre: str = Field(min_length=1, max_length=150)
    password: str = Field(min_length=8, max_length=128)
    telefono: Optional[str] = Field(default=None, max_length=25)
    # Id local del alumno anónimo: la cuenta conserva su progreso.
    usuario_id: Optional[str] = Field(default=None, max_length=100)
    dispositivo: Optional[str] = Field(default=None, max_length=500)


class InicioSesion(ConEmail):
    password: str = Field(min_length=1, max_length=128)
    usuario_id: Optional[str] = Field(default=None, max_length=100)
    dispositivo: Optional[str] = Field(default=None, max_length=500)


class Confirmacion(ConEmail):
    codigo: str = Field(min_length=1, max_length=12)


class Restablecer(Confirmacion):
    password_nueva: str = Field(min_length=8, max_length=128)
    dispositivo: Optional[str] = Field(default=None, max_length=500)


class CambioPassword(BaseModel):
    password_actual: str = Field(min_length=1, max_length=128)
    password_nueva: str = Field(min_length=8, max_length=128)


# --- Ayudantes --------------------------------------------------------------


def por_email(db: Session, email: str) -> Optional[Usuario]:
    return db.scalars(select(Usuario).where(Usuario.email == email)).first()


def crear_sesion(db: Session, usuario: Usuario, dispositivo: Optional[str]) -> str:
    token = nuevo_token()
    momento = ahora()
    db.add(
        Sesion(
            id=hash_token(token),
            usuario_id=usuario.id,
            dispositivo=(dispositivo or "web")[:200],
            activa=1,
            creado_en=momento,
            ultimo_acceso=momento,
            expira_en=momento + DURACION_SESION,
        )
    )
    usuario.ultimo_acceso = momento
    return token


def cerrar_sesiones(db: Session, usuario_id: str, excepto: Optional[str] = None) -> None:
    consulta = update(Sesion).where(Sesion.usuario_id == usuario_id, Sesion.activa == 1)
    if excepto:
        consulta = consulta.where(Sesion.id != excepto)
    db.execute(consulta.values(activa=0))


def emitir_codigo(usuario: Usuario, proposito: str) -> str:
    codigo = nuevo_codigo()
    usuario.codigo_verificacion = hash_codigo(usuario.email, codigo)
    usuario.codigo_proposito = proposito
    usuario.codigo_expira = ahora() + DURACION_CODIGO
    usuario.codigo_intentos = 0
    return codigo


def limpiar_codigo(usuario: Usuario) -> None:
    usuario.codigo_verificacion = None
    usuario.codigo_proposito = None
    usuario.codigo_expira = None
    usuario.codigo_intentos = 0


def codigo_valido(usuario: Optional[Usuario], codigo: str, proposito: str) -> bool:
    """Revisa el código y cuenta el intento. Tras 5 fallos el código se anula."""
    if usuario is None or not usuario.codigo_verificacion or usuario.codigo_proposito != proposito:
        return False
    if usuario.codigo_expira is None or usuario.codigo_expira <= ahora():
        limpiar_codigo(usuario)
        return False
    if codigos_iguales(usuario.codigo_verificacion, hash_codigo(usuario.email, codigo)):
        limpiar_codigo(usuario)
        return True
    usuario.codigo_intentos = (usuario.codigo_intentos or 0) + 1
    if usuario.codigo_intentos >= MAX_INTENTOS_CODIGO:
        limpiar_codigo(usuario)
    return False


def promover_admin_inicial(usuario: Usuario) -> None:
    """AMATISTA_ADMINS: correos (separados por comas) que reciben el rol admin.

    Solo con el correo confirmado: así nadie se adelanta registrando el
    correo del administrador.
    """
    admins = {normalizar_email(e) for e in os.getenv("AMATISTA_ADMINS", "").split(",") if e.strip()}
    if usuario.correo_confirmado and usuario.email in admins:
        usuario.rol = "admin"


def fusionar_anonimo(db: Session, anonimo_id: Optional[str], cuenta: Usuario) -> bool:
    """Pasa el progreso de un alumno anónimo a la cuenta, sin retroceder.

    Devuelve True si había algo que fusionar.
    """
    anonimo_id = (anonimo_id or "").strip()
    anonimo = db.get(Usuario, anonimo_id) if anonimo_id else None
    if anonimo is None or anonimo.id == cuenta.id or es_cuenta_registrada(anonimo):
        return False

    for fila in db.scalars(select(ProgresoLeccion).where(ProgresoLeccion.usuario_id == anonimo.id)).all():
        destino = db.get(ProgresoLeccion, (cuenta.id, fila.curso_id, fila.leccion_id))
        if destino is None:
            db.add(
                ProgresoLeccion(
                    usuario_id=cuenta.id,
                    curso_id=fila.curso_id,
                    leccion_id=fila.leccion_id,
                    completada=fila.completada,
                    puntaje=fila.puntaje,
                    intentos=fila.intentos,
                    datos_ligeros=fila.datos_ligeros,
                    completada_en=fila.completada_en,
                    actualizado_en=ahora(),
                )
            )
        else:
            destino.completada = 1 if (destino.completada or fila.completada) else 0
            if fila.puntaje is not None:
                destino.puntaje = max(destino.puntaje or 0, fila.puntaje)
            destino.intentos = max(destino.intentos or 0, fila.intentos or 0)
            destino.datos_ligeros = destino.datos_ligeros or fila.datos_ligeros
            fechas = [f for f in (destino.completada_en, fila.completada_en) if f is not None]
            destino.completada_en = min(fechas) if fechas else None
            destino.actualizado_en = ahora()
        db.delete(fila)

    for logro in db.scalars(select(Logro).where(Logro.usuario_id == anonimo.id)).all():
        if db.get(Logro, (cuenta.id, logro.insignia_id)) is None:
            db.add(Logro(usuario_id=cuenta.id, insignia_id=logro.insignia_id, obtenido_en=logro.obtenido_en))
        db.delete(logro)

    db.execute(
        update(EventoAprendizaje).where(EventoAprendizaje.usuario_id == anonimo.id).values(usuario_id=cuenta.id)
    )
    anonimo.fusionado_en = cuenta.id
    return True


def respuesta_sesion(token: str, usuario: Usuario, **extra) -> dict:
    return {"token": token, "tipo": "bearer", "usuario": usuario_publico(usuario), **extra}


# --- Rutas ------------------------------------------------------------------


@router.post("/registro", status_code=201, dependencies=[Depends(limite_cuentas)])
def registrar(datos: Registro, tareas: BackgroundTasks, db: Session = Depends(obtener_db)):
    try:
        if por_email(db, datos.email) is not None:
            raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese correo. Inicia sesión.")

        local_id = (datos.usuario_id or "").strip()
        local = db.get(Usuario, local_id) if local_id else None
        if local is not None and not es_cuenta_registrada(local):
            usuario = local  # el alumno anónimo se convierte en cuenta
        else:
            # Un id local que ya es de otra cuenta no se reutiliza.
            nuevo_id = local_id if local_id and local is None else f"usr-{uuid.uuid4()}"
            usuario = Usuario(id=nuevo_id, rol="alumno", creado_en=ahora())
            db.add(usuario)

        usuario.nombre = datos.nombre.strip()
        usuario.email = datos.email
        usuario.telefono = (datos.telefono or "").strip() or None
        usuario.password_hash = hash_password(datos.password)
        usuario.rol = usuario.rol or "alumno"
        usuario.correo_confirmado = 0
        usuario.intentos_fallidos = 0
        codigo = emitir_codigo(usuario, "correo")
        db.flush()
        token = crear_sesion(db, usuario, datos.dispositivo)
        db.commit()
    except IntegrityError:
        db.rollback()  # dos registros simultáneos con el mismo correo
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese correo. Inicia sesión.")
    except SQLAlchemyError as error:
        db.rollback()
        raise error_bd(error, "/api/auth/registro")

    tareas.add_task(enviar_codigo, usuario.email, codigo, "correo")
    return respuesta_sesion(token, usuario)


@router.post("/iniciar-sesion", dependencies=[Depends(limite_login)])
def iniciar_sesion(datos: InicioSesion, db: Session = Depends(obtener_db)):
    try:
        usuario = por_email(db, datos.email)
        if usuario is None or not usuario.password_hash:
            verificar_password_señuelo(datos.password)  # mismo tiempo de respuesta
            raise HTTPException(status_code=401, detail=MENSAJE_CREDENCIALES)

        momento = ahora()
        if usuario.bloqueado_hasta is not None and usuario.bloqueado_hasta > momento:
            raise HTTPException(status_code=429, detail="Demasiados intentos fallidos. Espera 15 minutos.")

        if not verificar_password(datos.password, usuario.password_hash):
            usuario.intentos_fallidos = (usuario.intentos_fallidos or 0) + 1
            if usuario.intentos_fallidos >= MAX_INTENTOS_PASSWORD:
                usuario.bloqueado_hasta = momento + DURACION_BLOQUEO
                usuario.intentos_fallidos = 0
            db.commit()
            raise HTTPException(status_code=401, detail=MENSAJE_CREDENCIALES)

        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None
        if requiere_rehash(usuario.password_hash):
            usuario.password_hash = hash_password(datos.password)
        promover_admin_inicial(usuario)
        fusionado = fusionar_anonimo(db, datos.usuario_id, usuario)
        token = crear_sesion(db, usuario, datos.dispositivo)
        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise error_bd(error, "/api/auth/iniciar-sesion")

    return respuesta_sesion(token, usuario, fusionado=fusionado)


@router.post("/cerrar-sesion")
def cerrar_sesion(request: Request, usuario: Usuario = Depends(usuario_requerido), db: Session = Depends(obtener_db)):
    try:
        sesion = db.get(Sesion, request.state.sesion_id)
        sesion.activa = 0
        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise error_bd(error, "/api/auth/cerrar-sesion")
    return {"mensaje": "Sesión cerrada."}


@router.post("/cerrar-todas")
def cerrar_todas(usuario: Usuario = Depends(usuario_requerido), db: Session = Depends(obtener_db)):
    """Cierra la sesión en todos los dispositivos (también en este)."""
    try:
        cerrar_sesiones(db, usuario.id)
        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise error_bd(error, "/api/auth/cerrar-todas")
    return {"mensaje": "Cerraste la sesión en todos tus dispositivos."}


@router.get("/yo")
def yo(usuario: Usuario = Depends(usuario_requerido)):
    return usuario_publico(usuario)


def _confirmar_correo(datos: Confirmacion, db: Session) -> dict:
    try:
        usuario = por_email(db, datos.email)
        if usuario is not None and usuario.correo_confirmado:
            return {"mensaje": "Tu correo ya estaba confirmado.", "usuario": usuario_publico(usuario)}
        valido = codigo_valido(usuario, datos.codigo, "correo")
        if valido:
            usuario.correo_confirmado = 1
            promover_admin_inicial(usuario)
        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise error_bd(error, "/api/auth/confirmar-correo")
    if not valido:
        raise HTTPException(status_code=400, detail=MENSAJE_CODIGO)
    return {"mensaje": "Correo confirmado.", "usuario": usuario_publico(usuario)}


@router.post("/confirmar-correo", dependencies=[Depends(limite_codigos)])
def confirmar_correo(datos: Confirmacion, db: Session = Depends(obtener_db)):
    return _confirmar_correo(datos, db)


@router_heredado.post("/confirmar-correo", dependencies=[Depends(limite_codigos)])
def confirmar_correo_heredado(datos: Confirmacion, db: Session = Depends(obtener_db)):
    return _confirmar_correo(datos, db)


def _enviar_si_corresponde(datos: ConEmail, tareas: BackgroundTasks, db: Session, proposito: str, ruta: str) -> dict:
    """Responde lo mismo exista o no la cuenta: no revela qué correos están registrados."""
    try:
        usuario = por_email(db, datos.email)
        corresponde = usuario is not None and bool(usuario.password_hash)
        if proposito == "correo":
            corresponde = corresponde and not usuario.correo_confirmado
        if corresponde:
            codigo = emitir_codigo(usuario, proposito)
            db.commit()
            tareas.add_task(enviar_codigo, usuario.email, codigo, proposito)
    except SQLAlchemyError as error:
        db.rollback()
        raise error_bd(error, ruta)
    return {"mensaje": MENSAJE_CODIGO_ENVIADO}


@router.post("/reenviar-codigo", dependencies=[Depends(limite_codigos)])
def reenviar_codigo(datos: ConEmail, tareas: BackgroundTasks, db: Session = Depends(obtener_db)):
    return _enviar_si_corresponde(datos, tareas, db, "correo", "/api/auth/reenviar-codigo")


@router.post("/recuperar", dependencies=[Depends(limite_codigos)])
def recuperar(datos: ConEmail, tareas: BackgroundTasks, db: Session = Depends(obtener_db)):
    return _enviar_si_corresponde(datos, tareas, db, "password", "/api/auth/recuperar")


@router.post("/restablecer", dependencies=[Depends(limite_codigos)])
def restablecer(datos: Restablecer, db: Session = Depends(obtener_db)):
    """Contraseña nueva con el código de /recuperar. Cierra las demás sesiones."""
    try:
        usuario = por_email(db, datos.email)
        valido = codigo_valido(usuario, datos.codigo, "password")
        if not valido:
            db.commit()  # guarda el intento fallido
            raise HTTPException(status_code=400, detail=MENSAJE_CODIGO)
        usuario.password_hash = hash_password(datos.password_nueva)
        usuario.correo_confirmado = 1  # el código llegó a ese buzón
        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None
        promover_admin_inicial(usuario)
        cerrar_sesiones(db, usuario.id)
        token = crear_sesion(db, usuario, datos.dispositivo)
        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise error_bd(error, "/api/auth/restablecer")
    return respuesta_sesion(token, usuario)


@router.post("/cambiar-password")
def cambiar_password(
    datos: CambioPassword,
    request: Request,
    usuario: Usuario = Depends(usuario_requerido),
    db: Session = Depends(obtener_db),
):
    """Cambia la contraseña y cierra las sesiones de los otros dispositivos."""
    if not verificar_password(datos.password_actual, usuario.password_hash):
        raise HTTPException(status_code=400, detail="La contraseña actual no es correcta.")
    try:
        usuario.password_hash = hash_password(datos.password_nueva)
        cerrar_sesiones(db, usuario.id, excepto=request.state.sesion_id)
        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise error_bd(error, "/api/auth/cambiar-password")
    return {"mensaje": "Contraseña actualizada. Cerramos la sesión en tus otros dispositivos."}
