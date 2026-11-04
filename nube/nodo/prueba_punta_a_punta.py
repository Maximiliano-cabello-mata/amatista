"""Prueba de punta a punta de Amatista Cloud en una sola máquina.

Levanta la API de Amatista (SQLite temporal), crea una cuenta @utn.mx, arranca este nodo y recorre lo
que hace un alumno: pedir la sesión, esperar a que esté lista, entrar con su token, hablar con el
escritorio por WebSocket, intentar entrar sin token y terminarla.

    python nube/nodo/prueba_punta_a_punta.py              # con Docker y la imagen real (Blender)
    python nube/nodo/prueba_punta_a_punta.py --simulado   # sin Docker (escritorio de mentira)

Necesita las dependencias del backend (backend/requirements.txt) y aiohttp.
"""
import argparse
import asyncio
import hashlib
import os
import secrets
import subprocess
import sys
import tempfile
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
API, NODO = "http://127.0.0.1:8099", "http://127.0.0.1:8730"


def esperar(url: str, segundos: float = 60) -> None:
    import urllib.request

    limite = time.time() + segundos
    while time.time() < limite:
        try:
            urllib.request.urlopen(url, timeout=2)
            return
        except Exception:  # noqa: BLE001
            time.sleep(0.5)
    raise SystemExit(f"No respondió {url}")


def crear_alumno(base: str) -> str:
    """Cuenta @utn.mx con correo confirmado y sesión iniciada; devuelve su token."""
    sys.path.insert(0, str(RAIZ / "backend"))
    os.environ["DATABASE_URL"] = base
    from sqlalchemy.orm import Session

    from database import conexion
    from database.modelos import Base, Sesion, Usuario, ahora
    from seguridad import DURACION_SESION, hash_password, hash_token, nuevo_token

    Base.metadata.create_all(conexion.motor())
    token = nuevo_token()
    with Session(conexion.motor()) as db:
        db.add(Usuario(id="usr-prueba-nube", nombre="Valeria", email="valeria@utn.mx", rol="alumno",
                       password_hash=hash_password("clave-segura-123"), correo_confirmado=1))
        db.flush()
        db.add(Sesion(id=hash_token(token), usuario_id="usr-prueba-nube", dispositivo="prueba", activa=1,
                      expira_en=ahora() + DURACION_SESION))
        db.commit()
    return token


CAPTURA_JS = """
const { chromium } = require('playwright');
(async () => {
  const [entrada, sesion, token, salida] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await p.setContent(`<form method="post" action="${entrada}"><input name="sesion" value="${sesion}"><input name="token" value="${token}"></form>`);
  await Promise.all([p.waitForNavigation(), p.evaluate(() => document.forms[0].submit())]);
  await p.waitForTimeout(9000);
  console.log('URL del alumno:', p.url().replace(/\\?.*/, '?…'));
  await p.screenshot({ path: salida });
  await b.close();
})();
"""


def capturar(entrada: str, sesion: dict, salida: str) -> None:
    """Un navegador de verdad entra como lo haría el alumno (formulario con su token) y toma una foto."""
    guion = Path(tempfile.mkdtemp()) / "captura.cjs"
    guion.write_text(CAPTURA_JS)
    raiz_npm = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip()
    subprocess.run(["node", str(guion), entrada, sesion["id"], sesion["token"], salida], check=True,
                   env={**os.environ, "NODE_PATH": raiz_npm, "NO_PROXY": "*"})
    print(f"   Captura del escritorio en el navegador: {salida}")


async def recorrido(token_alumno: str, simulado: bool, captura: str = "") -> None:
    import aiohttp

    alumno = {"Authorization": f"Bearer {token_alumno}"}
    async with aiohttp.ClientSession() as http:
        estado = await (await http.get(f"{API}/api/nube/v1/estado", headers=alumno)).json()
        print(f"1. Estado: {estado['libres']} lugares libres en {estado['nodos']} nodo(s); puede entrar: {estado['puede']}")
        assert estado["puede"] and estado["libres"] >= 1

        r = await http.post(f"{API}/api/nube/v1/sesiones", headers=alumno)
        sesion = await r.json()
        assert r.status == 201, sesion
        print(f"2. Sesión pedida: {sesion['id']} en «{sesion['nodo']}», vence en {sesion['segundos_restantes'] // 60} min")

        inicio = time.time()
        while True:
            actual = (await (await http.get(f"{API}/api/nube/v1/sesiones/actual", headers=alumno)).json())["sesion"]
            if actual and actual["estado"] == "lista":
                break
            assert time.time() - inicio < 120, actual
            await asyncio.sleep(1)
        print(f"3. Lista en {time.time() - inicio:.1f} s; entrada: {actual['entrada']}")

    # Sin token: nada.
    async with aiohttp.ClientSession() as intruso:
        r = await intruso.get(f"{NODO}/s/{sesion['id']}/index.html")
        assert r.status == 403, r.status
        r = await intruso.post(f"{NODO}/entrar", data={"sesion": sesion["id"], "token": "inventado"}, allow_redirects=False)
        assert r.status == 403, r.status
        print("4. Sin token o con un token inventado: 403 (bien)")

    # Con token: cookie y escritorio.
    async with aiohttp.ClientSession(cookie_jar=aiohttp.CookieJar(unsafe=True)) as navegador:
        r = await navegador.post(actual["entrada"], data={"sesion": sesion["id"], "token": sesion["token"]}, allow_redirects=False)
        assert r.status == 303, r.status
        r = await navegador.get(f"{NODO}/s/{sesion['id']}/", allow_redirects=False)
        assert r.status == 302 and "path=s/" in r.headers["Location"], r.headers
        r = await navegador.get(f"{NODO}{r.headers['Location']}")
        pagina = await r.text()
        assert r.status == 200 and len(pagina) > 50
        async with navegador.ws_connect(f"{NODO.replace('http', 'ws')}/s/{sesion['id']}/websockify", protocols=("binary",)) as ws:
            if simulado:
                await ws.send_bytes(b"hola")
                saludo = (await ws.receive(timeout=10)).data
            else:
                saludo = (await ws.receive(timeout=10)).data  # el servidor VNC saluda primero: «RFB 003.008»
        print(f"5. Entró con su token: página de {len(pagina)} bytes y WebSocket que responde {saludo[:12]!r}")
        assert saludo.startswith(b"RFB") or simulado
        r = await navegador.get(f"{NODO}/s/{sesion['id']}/archivos")
        assert r.status == 200 and "Tus archivos" in await r.text()
        print("6. Página de archivos: lista")
    if captura:
        await asyncio.to_thread(capturar, actual["entrada"], sesion, captura)

    async with aiohttp.ClientSession() as http:
        r = await http.post(f"{API}/api/nube/v1/sesiones/{sesion['id']}/terminar", headers=alumno)
        assert (await r.json())["estado"] == "terminada"
        inicio = time.time()
        while time.time() - inicio < 60:
            salud = await (await http.get(f"{NODO}/salud")).json()
            if salud["sesiones"] == 0:
                break
            await asyncio.sleep(1)
        assert salud["sesiones"] == 0, salud
        print(f"7. Terminada por el alumno: el nodo cerró el contenedor en {time.time() - inicio:.1f} s")
        r = await http.post(f"{API}/api/nube/v1/sesiones", headers=alumno)
        print(f"8. Segunda sesión del día: {r.status}; tercera: ", end="")
        sesion2 = await r.json()
        await http.post(f"{API}/api/nube/v1/sesiones/{sesion2['id']}/terminar", headers=alumno)
        r = await http.post(f"{API}/api/nube/v1/sesiones", headers=alumno)
        print(f"{r.status} ({(await r.json())['detail']})")
        assert r.status == 429


def main() -> int:
    opciones = argparse.ArgumentParser()
    opciones.add_argument("--simulado", action="store_true")
    opciones.add_argument("--captura", default="", help="ruta .png: foto del escritorio en un navegador (Playwright)")
    args = opciones.parse_args()
    carpeta = Path(tempfile.mkdtemp(prefix="amatista-nube-"))
    base = f"sqlite:///{carpeta / 'nube.db'}"
    token_nodo = secrets.token_urlsafe(32)
    entorno = {**os.environ, "DATABASE_URL": base, "AMATISTA_SIN_LIMITES": "1", "AMATISTA_SINCRONIZAR_PRACTICAS": "0",
               "AMATISTA_NUBE_NODOS": "prueba:" + hashlib.sha256(token_nodo.encode()).hexdigest(),
               "AMATISTA_NUBE_DOMINIOS": "utn.mx", "NO_PROXY": "127.0.0.1,localhost"}
    token_alumno = crear_alumno(base)
    procesos = [subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--port", "8099"], cwd=RAIZ / "backend", env=entorno,
                                 stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)]
    try:
        esperar(f"{API}/api/salud")
        nodo = {**entorno, "AMATISTA_NODO_SERVIDOR": API, "AMATISTA_NODO_TOKEN": token_nodo, "AMATISTA_NODO_URL": NODO}
        orden = [sys.executable, str(Path(__file__).with_name("amatista_nodo.py")), "ejecutar", "--sesiones", "2",
                 "--carpeta", str(carpeta / "sesiones")] + (["--simulado"] if args.simulado else [])
        procesos.append(subprocess.Popen(orden, env=nodo, stdout=open(carpeta / "nodo.log", "w"), stderr=subprocess.STDOUT))
        esperar(f"{NODO}/salud")
        time.sleep(2)
        asyncio.run(recorrido(token_alumno, args.simulado, args.captura))
        print("\nTodo bien: Amatista Cloud funciona de punta a punta.")
        return 0
    finally:
        for proceso in reversed(procesos):
            proceso.terminate()
            try:
                proceso.wait(30)
            except subprocess.TimeoutExpired:
                proceso.kill()
        print(f"(bitácora del nodo: {carpeta / 'nodo.log'})")


if __name__ == "__main__":
    sys.exit(main())
