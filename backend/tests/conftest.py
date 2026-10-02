"""Fixtures compartidas: API con SQLite temporal y cuentas con sesión.

Contra Oracle real (con las tablas de sql/001 y sql/002 ya creadas):
    AMATISTA_PRUEBAS_ORACLE=1 DB_USER=... DB_PASSWORD=... DB_DSN=... python -m pytest
Las pruebas BORRAN todas las filas de las tablas: úsalo solo con un esquema de pruebas.
"""
import os
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from database import conexion
from database.modelos import Base, Sesion, Usuario, ahora
from seguridad import DURACION_SESION, hash_password, hash_token, nuevo_token


@pytest.fixture(autouse=True)
def entorno_pruebas(monkeypatch):
    # PBKDF2 rápido en pruebas y sin límites de peticiones por IP.
    monkeypatch.setenv("AMATISTA_PBKDF2_ITER", "1000")
    monkeypatch.setenv("AMATISTA_SIN_LIMITES", "1")
    monkeypatch.delenv("AMATISTA_ADMINS", raising=False)
    monkeypatch.delenv("SMTP_HOST", raising=False)


EN_ORACLE = os.getenv("AMATISTA_PRUEBAS_ORACLE") == "1"
solo_sqlite = pytest.mark.skipif(EN_ORACLE, reason="solo aplica a SQLite")


def vaciar_tablas():
    with conexion.motor().begin() as c:
        for tabla in reversed(Base.metadata.sorted_tables):
            c.execute(tabla.delete())


@pytest.fixture()
def cliente(tmp_path, monkeypatch):
    if EN_ORACLE:
        monkeypatch.delenv("DATABASE_URL", raising=False)
    else:
        monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path / 'prueba.db'}")
    conexion.motor.cache_clear()
    from api import limites
    from main import app

    limites.reiniciar()
    if EN_ORACLE:
        vaciar_tablas()
    with TestClient(app) as c:
        yield c
    if EN_ORACLE:
        vaciar_tablas()
    conexion.motor.cache_clear()


@pytest.fixture()
def codigos(monkeypatch):
    """Captura los códigos que se enviarían por correo: {(email, proposito): codigo}."""
    enviados = {}
    monkeypatch.setattr("api.auth.enviar_codigo", lambda email, codigo, proposito: enviados.__setitem__((email, proposito), codigo))
    return enviados


@pytest.fixture()
def crear_cuenta(cliente):
    """Crea directo en la base una cuenta con sesión y devuelve (id, cabeceras).

    No depende de /api/auth: sirve para probar permisos de otras rutas.
    Uso: usuario_id, cabeceras = crear_cuenta(rol="admin")
    """

    def crear(rol="alumno", email=None, password="clave-segura-123", nombre="Prueba", es_prueba=0):
        usuario_id = f"usr-{uuid.uuid4()}"
        email = email or f"{usuario_id}@amatista.local"
        token = nuevo_token()
        with Session(conexion.motor()) as db:
            db.add(
                Usuario(
                    id=usuario_id,
                    nombre=nombre,
                    email=email.lower(),
                    rol=rol,
                    password_hash=hash_password(password),
                    correo_confirmado=1,
                    es_prueba=es_prueba,
                )
            )
            db.flush()
            db.add(
                Sesion(
                    id=hash_token(token),
                    usuario_id=usuario_id,
                    dispositivo="pytest",
                    activa=1,
                    expira_en=ahora() + DURACION_SESION,
                )
            )
            db.commit()
        return usuario_id, {"Authorization": f"Bearer {token}"}

    return crear
