"""Inicio de sesión con Google: sin la variable de pruebas, nadie entra escribiendo solo un correo."""
import json

import pytest
from fastapi import HTTPException

from api import auth


def test_un_token_sintetico_no_entra_fuera_de_pruebas(cliente, crear_cuenta, monkeypatch):
    crear_cuenta(rol="admin", email="admin@amatista.local")
    monkeypatch.delenv("AMATISTA_GOOGLE_PRUEBAS", raising=False)
    r = cliente.post("/api/auth/google", json={"credencial": "test_google_admin@amatista.local"})
    assert r.status_code == 401 and "token" not in r.json()


def test_sin_client_id_no_se_acepta_ningun_token_real(monkeypatch):
    monkeypatch.delenv("AMATISTA_GOOGLE_PRUEBAS", raising=False)
    with pytest.raises(HTTPException) as error:
        auth.verificar_token_google("eyJ.token.real", None)
    assert error.value.status_code == 401 and "no está configurado" in error.value.detail


class _Respuesta:
    def __init__(self, datos):
        self.datos = datos

    def read(self):
        return json.dumps(self.datos).encode()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


@pytest.mark.parametrize("cambio, estado", [
    ({"aud": "otra-app"}, 401),
    ({"email_verified": "false"}, 401),
    ({"iss": "malo.example.com"}, 401),
    ({}, None),
])
def test_token_real_exige_aplicacion_emisor_y_correo_verificado(monkeypatch, cambio, estado):
    datos = {"iss": "accounts.google.com", "aud": "mi-app", "email": "ana@alumnos.utn.edu.mx",
             "email_verified": "true", "name": "Ana", "sub": "1"}
    datos.update(cambio)
    monkeypatch.setattr(auth.urllib.request, "urlopen", lambda *a, **k: _Respuesta(datos))
    if estado is None:
        assert auth.verificar_token_google("eyJ.token.real", "mi-app")["email"] == "ana@alumnos.utn.edu.mx"
    else:
        with pytest.raises(HTTPException) as error:
            auth.verificar_token_google("eyJ.token.real", "mi-app")
        assert error.value.status_code == estado
