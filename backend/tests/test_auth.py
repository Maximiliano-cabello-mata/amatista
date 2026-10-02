"""Cuentas, sesiones, roles y protección del progreso."""
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from database import conexion
from database.modelos import ProgresoLeccion, Sesion, Usuario, ahora
from seguridad import hash_token

PASSWORD = "clave-segura-123"


def registrar(cliente, email="ana@amatista.local", **extra):
    datos = {"nombre": "Ana", "email": email, "password": PASSWORD, **extra}
    respuesta = cliente.post("/api/auth/registro", json=datos)
    assert respuesta.status_code == 201, respuesta.text
    return respuesta.json()


def entrar(cliente, email="ana@amatista.local", password=PASSWORD, **extra):
    return cliente.post("/api/auth/iniciar-sesion", json={"email": email, "password": password, **extra})


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


def leer_usuario(usuario_id):
    with Session(conexion.motor()) as db:
        return db.get(Usuario, usuario_id)


def enviar_progreso(cliente, eventos, usuario_id=None, cabeceras=None):
    cuerpo = {"eventos": eventos}
    if usuario_id:
        cuerpo["usuario_id"] = usuario_id
    return cliente.post("/api/progreso", json=cuerpo, headers=cabeceras or {})


# --- Registro e inicio de sesión ------------------------------------------


def test_registro_crea_cuenta_y_sesion(cliente, codigos):
    datos = registrar(cliente, email="  Ana@Amatista.LOCAL ")
    assert datos["usuario"]["email"] == "ana@amatista.local"
    assert datos["usuario"]["rol"] == "alumno"
    assert datos["usuario"]["correo_confirmado"] is False
    assert "password_hash" not in datos["usuario"]

    yo = cliente.get("/api/auth/yo", headers=bearer(datos["token"]))
    assert yo.status_code == 200
    assert yo.json()["id"] == datos["usuario"]["id"]

    # En la base no queda el token ni la contraseña en claro.
    usuario = leer_usuario(datos["usuario"]["id"])
    assert usuario.password_hash.startswith("pbkdf2_sha256$")
    with Session(conexion.motor()) as db:
        assert db.get(Sesion, hash_token(datos["token"])) is not None
        assert db.get(Sesion, datos["token"]) is None
    assert ("ana@amatista.local", "correo") in codigos


def test_registro_rechaza_correo_repetido_y_datos_invalidos(cliente, codigos):
    registrar(cliente)
    repetido = cliente.post(
        "/api/auth/registro", json={"nombre": "Otra", "email": "ANA@amatista.local", "password": PASSWORD}
    )
    assert repetido.status_code == 409
    corta = cliente.post("/api/auth/registro", json={"nombre": "B", "email": "b@amatista.local", "password": "123"})
    assert corta.status_code == 422
    sin_arroba = cliente.post("/api/auth/registro", json={"nombre": "B", "email": "b.amatista", "password": PASSWORD})
    assert sin_arroba.status_code == 422


def test_registro_conserva_el_progreso_del_alumno_anonimo(cliente, codigos):
    evento = {"curso_id": "blender", "leccion_id": "les_001", "completada": True, "puntaje": 80}
    assert enviar_progreso(cliente, [evento], usuario_id="alumno-local-1").status_code == 200

    datos = registrar(cliente, usuario_id="alumno-local-1")
    assert datos["usuario"]["id"] == "alumno-local-1"

    # La cuenta ya no acepta escrituras sin sesión, ni lecturas ajenas.
    assert enviar_progreso(cliente, [evento], usuario_id="alumno-local-1").status_code == 401
    assert cliente.get("/api/progreso/alumno-local-1").status_code == 401
    propio = cliente.get("/api/progreso/alumno-local-1", headers=bearer(datos["token"])).json()
    assert propio["lecciones"][0]["puntaje"] == 80


def test_registro_no_adopta_el_id_de_otra_cuenta(cliente, codigos):
    primera = registrar(cliente, usuario_id="alumno-x")
    segunda = registrar(cliente, email="beto@amatista.local", usuario_id="alumno-x")
    assert primera["usuario"]["id"] == "alumno-x"
    assert segunda["usuario"]["id"] != "alumno-x"


def test_inicio_de_sesion(cliente, codigos):
    registrar(cliente)
    correcto = entrar(cliente, email="ANA@amatista.local")
    assert correcto.status_code == 200
    assert correcto.json()["usuario"]["email"] == "ana@amatista.local"

    incorrecta = entrar(cliente, password="otra-clave-123")
    no_existe = entrar(cliente, email="nadie@amatista.local")
    # Mismo mensaje: no revela qué correos están registrados.
    assert incorrecta.status_code == no_existe.status_code == 401
    assert incorrecta.json() == no_existe.json()


def test_bloqueo_tras_cinco_intentos_fallidos(cliente, codigos):
    usuario_id = registrar(cliente)["usuario"]["id"]
    for _ in range(5):
        assert entrar(cliente, password="mala-clave-000").status_code == 401
    # Bloqueada aunque ahora la contraseña sea correcta.
    assert entrar(cliente).status_code == 429

    with Session(conexion.motor()) as db:
        db.get(Usuario, usuario_id).bloqueado_hasta = ahora() - timedelta(seconds=1)
        db.commit()
    assert entrar(cliente).status_code == 200
    assert leer_usuario(usuario_id).intentos_fallidos == 0


def test_inicio_de_sesion_fusiona_el_progreso_del_dispositivo(cliente, codigos):
    token = registrar(cliente)["token"]
    enviar_progreso(
        cliente,
        [{"curso_id": "blender", "leccion_id": "les_001", "completada": False, "puntaje": 90, "intentos": 2}],
        cabeceras=bearer(token),
    )
    # Otro dispositivo avanzó sin cuenta.
    enviar_progreso(
        cliente,
        [
            {"curso_id": "blender", "leccion_id": "les_001", "completada": True, "puntaje": 60, "intentos": 4},
            {"curso_id": "aframe", "leccion_id": "les_af_001", "completada": True},
        ],
        usuario_id="alumno-tablet",
    )

    respuesta = entrar(cliente, usuario_id="alumno-tablet")
    assert respuesta.json()["fusionado"] is True
    cuenta = respuesta.json()["usuario"]["id"]
    lecciones = {
        l["leccion_id"]: l for l in cliente.get(f"/api/progreso/{cuenta}", headers=bearer(token)).json()["lecciones"]
    }
    assert lecciones["les_001"]["completada"] is True  # nunca retrocede
    assert lecciones["les_001"]["puntaje"] == 90  # se queda el mejor
    assert lecciones["les_001"]["intentos"] == 4
    assert lecciones["les_af_001"]["completada"] is True

    assert leer_usuario("alumno-tablet").fusionado_en == cuenta
    # El id fusionado ya no acepta escrituras anónimas.
    assert enviar_progreso(cliente, [{"curso_id": "a", "leccion_id": "b"}], usuario_id="alumno-tablet").status_code == 401
    # Fusionar dos veces no hace nada.
    assert entrar(cliente, usuario_id="alumno-tablet").json()["fusionado"] is False


# --- Sesiones -----------------------------------------------------------------


def test_cerrar_sesion_invalida_el_token(cliente, codigos):
    token = registrar(cliente)["token"]
    assert cliente.post("/api/auth/cerrar-sesion", headers=bearer(token)).status_code == 200
    assert cliente.get("/api/auth/yo", headers=bearer(token)).status_code == 401


def test_cerrar_todas(cliente, codigos):
    uno = registrar(cliente)["token"]
    dos = entrar(cliente).json()["token"]
    assert cliente.post("/api/auth/cerrar-todas", headers=bearer(uno)).status_code == 200
    assert cliente.get("/api/auth/yo", headers=bearer(uno)).status_code == 401
    assert cliente.get("/api/auth/yo", headers=bearer(dos)).status_code == 401


def test_token_vencido_o_inventado(cliente, codigos):
    token = registrar(cliente)["token"]
    with Session(conexion.motor()) as db:
        db.get(Sesion, hash_token(token)).expira_en = ahora() - timedelta(seconds=1)
        db.commit()
    assert cliente.get("/api/auth/yo", headers=bearer(token)).status_code == 401
    assert cliente.get("/api/auth/yo", headers=bearer("inventado")).status_code == 401
    assert cliente.get("/api/auth/yo").status_code == 401


def test_cabecera_x_sesion_id(cliente, codigos):
    token = registrar(cliente)["token"]
    assert cliente.get("/api/auth/yo", headers={"X-Sesion-Id": token}).status_code == 200


def test_sesion_heredada_no_sirve_para_cuentas(cliente, codigos):
    registrar(cliente, usuario_id="alumno-y")
    respuesta = cliente.post("/api/iniciar-sesion", json={"usuario_id": "alumno-y"})
    assert respuesta.status_code == 401


# --- Correo y contraseña ----------------------------------------------------------


def test_confirmar_correo(cliente, codigos):
    registrar(cliente)
    mal = cliente.post("/api/auth/confirmar-correo", json={"email": "ana@amatista.local", "codigo": "000000"})
    if codigos[("ana@amatista.local", "correo")] != "000000":
        assert mal.status_code == 400

    # Ruta del informe del 1 de octubre.
    bien = cliente.post(
        "/api/confirmar-correo",
        json={"email": "ana@amatista.local", "codigo": codigos[("ana@amatista.local", "correo")]},
    )
    assert bien.status_code == 200
    assert bien.json()["usuario"]["correo_confirmado"] is True
    usuario = leer_usuario(bien.json()["usuario"]["id"])
    assert usuario.codigo_verificacion is None  # no se puede reutilizar


def test_codigo_se_anula_tras_cinco_fallos(cliente, codigos):
    registrar(cliente)
    correcto = codigos[("ana@amatista.local", "correo")]
    incorrecto = "111111" if correcto != "111111" else "222222"
    for _ in range(5):
        cliente.post("/api/auth/confirmar-correo", json={"email": "ana@amatista.local", "codigo": incorrecto})
    respuesta = cliente.post("/api/auth/confirmar-correo", json={"email": "ana@amatista.local", "codigo": correcto})
    assert respuesta.status_code == 400

    # Se puede pedir otro.
    assert cliente.post("/api/auth/reenviar-codigo", json={"email": "ana@amatista.local"}).status_code == 200
    nuevo = codigos[("ana@amatista.local", "correo")]
    assert cliente.post("/api/auth/confirmar-correo", json={"email": "ana@amatista.local", "codigo": nuevo}).status_code == 200


def test_codigo_vencido(cliente, codigos):
    usuario_id = registrar(cliente)["usuario"]["id"]
    with Session(conexion.motor()) as db:
        db.get(Usuario, usuario_id).codigo_expira = ahora() - timedelta(seconds=1)
        db.commit()
    codigo = codigos[("ana@amatista.local", "correo")]
    respuesta = cliente.post("/api/auth/confirmar-correo", json={"email": "ana@amatista.local", "codigo": codigo})
    assert respuesta.status_code == 400


def test_recuperar_y_restablecer_password(cliente, codigos):
    viejo = registrar(cliente)["token"]
    # Misma respuesta exista o no la cuenta.
    a = cliente.post("/api/auth/recuperar", json={"email": "ana@amatista.local"})
    b = cliente.post("/api/auth/recuperar", json={"email": "nadie@amatista.local"})
    assert a.json() == b.json()
    assert ("nadie@amatista.local", "password") not in codigos

    codigo = codigos[("ana@amatista.local", "password")]
    # El código de correo no sirve para cambiar la contraseña.
    otro = codigos[("ana@amatista.local", "correo")]
    if otro != codigo:
        cruzado = cliente.post(
            "/api/auth/restablecer",
            json={"email": "ana@amatista.local", "codigo": otro, "password_nueva": "nueva-clave-456"},
        )
        assert cruzado.status_code == 400

    respuesta = cliente.post(
        "/api/auth/restablecer",
        json={"email": "ana@amatista.local", "codigo": codigo, "password_nueva": "nueva-clave-456"},
    )
    assert respuesta.status_code == 200
    assert respuesta.json()["usuario"]["correo_confirmado"] is True
    assert cliente.get("/api/auth/yo", headers=bearer(viejo)).status_code == 401  # sesiones viejas cerradas
    assert cliente.get("/api/auth/yo", headers=bearer(respuesta.json()["token"])).status_code == 200
    assert entrar(cliente).status_code == 401
    assert entrar(cliente, password="nueva-clave-456").status_code == 200


def test_cambiar_password_cierra_otras_sesiones(cliente, codigos):
    actual = registrar(cliente)["token"]
    otra = entrar(cliente).json()["token"]
    mala = cliente.post(
        "/api/auth/cambiar-password",
        json={"password_actual": "no-es-esta", "password_nueva": "nueva-clave-456"},
        headers=bearer(actual),
    )
    assert mala.status_code == 400
    buena = cliente.post(
        "/api/auth/cambiar-password",
        json={"password_actual": PASSWORD, "password_nueva": "nueva-clave-456"},
        headers=bearer(actual),
    )
    assert buena.status_code == 200
    assert cliente.get("/api/auth/yo", headers=bearer(actual)).status_code == 200
    assert cliente.get("/api/auth/yo", headers=bearer(otra)).status_code == 401
    assert entrar(cliente, password="nueva-clave-456").status_code == 200


def test_rehash_al_subir_iteraciones(cliente, codigos, monkeypatch):
    usuario_id = registrar(cliente)["usuario"]["id"]
    monkeypatch.setenv("AMATISTA_PBKDF2_ITER", "2000")
    assert entrar(cliente).status_code == 200
    assert leer_usuario(usuario_id).password_hash.split("$")[1] == "2000"


# --- Roles -----------------------------------------------------------------------


def test_admin_inicial_requiere_correo_confirmado(cliente, codigos, monkeypatch):
    monkeypatch.setenv("AMATISTA_ADMINS", "jefa@amatista.local")
    datos = registrar(cliente, email="jefa@amatista.local")
    assert entrar(cliente, email="jefa@amatista.local").json()["usuario"]["rol"] == "alumno"
    confirmado = cliente.post(
        "/api/auth/confirmar-correo",
        json={"email": "jefa@amatista.local", "codigo": codigos[("jefa@amatista.local", "correo")]},
    )
    assert confirmado.json()["usuario"]["rol"] == "admin"
    assert cliente.get("/api/admin/usuarios", headers=bearer(datos["token"])).status_code == 200


def test_permisos_del_padron(cliente, crear_cuenta):
    _, alumno = crear_cuenta(rol="alumno")
    _, profesor = crear_cuenta(rol="profesor")
    _, admin = crear_cuenta(rol="admin")
    crear_cuenta(rol="alumno")

    assert cliente.get("/api/admin/usuarios").status_code == 401
    assert cliente.get("/api/admin/usuarios", headers=alumno).status_code == 403
    padron = cliente.get("/api/admin/usuarios", headers=profesor)
    assert padron.status_code == 200
    assert len(padron.json()["usuarios"]) == 4
    solo_alumnos = cliente.get("/api/admin/usuarios", params={"rol": "alumno"}, headers=admin).json()["usuarios"]
    assert {u["rol"] for u in solo_alumnos} == {"alumno"}
    assert all("password_hash" not in u for u in padron.json()["usuarios"])


def test_admin_cambia_roles(cliente, crear_cuenta):
    alumno_id, alumno = crear_cuenta(rol="alumno")
    profesor_id, profesor = crear_cuenta(rol="profesor")
    admin_id, admin = crear_cuenta(rol="admin")

    assert cliente.patch(f"/api/admin/usuarios/{alumno_id}", json={"rol": "admin"}, headers=profesor).status_code == 403
    assert cliente.patch(f"/api/admin/usuarios/{alumno_id}", json={"rol": "rey"}, headers=admin).status_code == 422
    assert cliente.patch(f"/api/admin/usuarios/{admin_id}", json={"rol": "alumno"}, headers=admin).status_code == 400
    assert cliente.patch("/api/admin/usuarios/no-existe", json={"rol": "profesor"}, headers=admin).status_code == 404

    respuesta = cliente.patch(f"/api/admin/usuarios/{alumno_id}", json={"rol": "profesor", "es_prueba": True}, headers=admin)
    assert respuesta.status_code == 200
    assert respuesta.json()["rol"] == "profesor"
    assert respuesta.json()["es_prueba"] is True
    # El cambio aplica de inmediato con la misma sesión.
    assert cliente.get("/api/admin/usuarios", headers=alumno).status_code == 200
    cliente.patch(f"/api/admin/usuarios/{profesor_id}", json={"rol": "alumno"}, headers=admin)
    assert cliente.get("/api/admin/usuarios", headers=profesor).status_code == 403


# --- Progreso con sesión -----------------------------------------------------------


def test_progreso_usa_la_identidad_de_la_sesion(cliente, crear_cuenta):
    ana_id, ana = crear_cuenta()
    beto_id, beto = crear_cuenta()
    evento = {"curso_id": "blender", "leccion_id": "les_002", "completada": True}

    # Ana intenta escribir en el progreso de Beto: se guarda en el suyo.
    respuesta = enviar_progreso(cliente, [evento], usuario_id=beto_id, cabeceras=ana)
    assert respuesta.json()["usuario_id"] == ana_id
    with Session(conexion.motor()) as db:
        assert db.scalars(select(ProgresoLeccion).where(ProgresoLeccion.usuario_id == beto_id)).first() is None

    # Y no puede leer el de Beto.
    assert cliente.get(f"/api/progreso/{beto_id}", headers=ana).status_code == 403
    assert cliente.get(f"/api/progreso/{ana_id}", headers=ana).status_code == 200


def test_profesor_lee_progreso_de_alumnos(cliente, crear_cuenta):
    alumno_id, alumno = crear_cuenta()
    _, profesor = crear_cuenta(rol="profesor")
    enviar_progreso(cliente, [{"curso_id": "aframe", "leccion_id": "les_af_003", "puntaje": 70}], cabeceras=alumno)
    lecciones = cliente.get(f"/api/progreso/{alumno_id}", headers=profesor).json()["lecciones"]
    assert lecciones[0]["puntaje"] == 70


def test_progreso_sin_usuario_ni_sesion(cliente):
    respuesta = cliente.post("/api/progreso", json={"eventos": [{"curso_id": "a", "leccion_id": "b"}]})
    assert respuesta.status_code == 422
