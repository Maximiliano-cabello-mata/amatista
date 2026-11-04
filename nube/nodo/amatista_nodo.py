#!/usr/bin/env python3
"""Nodo de Amatista Cloud: presta los núcleos y la memoria de una computadora para que alumnos de la
UTN usen Blender desde el navegador, una hora a la vez.

Se ejecuta en cada computadora que aporta recursos (la VM de Oracle, la PC del laboratorio, la tuya):

    python amatista_nodo.py diagnostico            # qué tiene la máquina y cuántas sesiones caben
    python amatista_nodo.py construir              # construye la imagen de la sesión (una vez)
    python amatista_nodo.py ejecutar               # se anuncia ante Amatista y atiende sesiones

Cómo funciona:
  1. Cada pocos segundos le avisa a la API de Amatista (el coordinador) cuántos lugares tiene. No abre
     puertos en el módem: es él quien llama.
  2. Cuando la API le asigna una sesión, abre un contenedor aislado con Blender (sin internet, con CPU,
     memoria, procesos y disco limitados) y avisa que está lista.
  3. El alumno entra por https://<este nodo>/entrar con el token de su sesión. Este programa revisa el
     token (solo conoce su hash) y le pasa el escritorio de Blender. Sin token válido no hay nada que ver.
  4. Al vencer la hora del token, si nadie se conecta en 15 minutos o si el alumno la termina, el
     contenedor se borra con todo lo que tenía. Antes, el alumno descarga sus archivos desde «Archivos».

Configuración (variables de entorno o un archivo nodo.env con CLAVE=valor, que se lee con --config):
  AMATISTA_NODO_SERVIDOR   https://api.amatista-3d.tech
  AMATISTA_NODO_TOKEN      el token de este nodo (lo da `nuevo-token`; nunca va en la línea de comandos)
  AMATISTA_NODO_URL        la dirección pública de este nodo, por ejemplo https://nodo-casa.amatista-3d.tech
  AMATISTA_NODO_PUERTO     puerto local del proxy (8730); cloudflared lo publica en la URL de arriba

Requisitos: Python 3.9+, aiohttp, Docker (o Docker Engine dentro de WSL2 en Windows).
Guía completa: docs/nube/INSTRUCCIONES.md
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import hmac
import html
import json
import logging
import math
import os
import platform
import re
import secrets
import shutil
import signal
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import quote

VERSION = "1.0.0"
IMAGEN = "amatista-nube-sesion:1"
RED = "amatista-nube"
ETIQUETA = "amatista.nube=1"
PUERTO_VNC = 6901
EXTENSIONES = {".blend", ".blend1", ".png", ".jpg", ".jpeg", ".webp", ".exr", ".hdr", ".obj", ".mtl", ".fbx", ".glb",
               ".gltf", ".stl", ".ply", ".abc", ".usd", ".usdc", ".usdz", ".svg", ".txt", ".py", ".mp4"}
SUBIDA_MAX = 100 * 1024 * 1024
ID_SESION = re.compile(r"^nube-[0-9a-f]{24}$")
LOG = logging.getLogger("amatista.nodo")


# =============================================================================================
# 1. Recursos de la máquina y plan de sesiones
# =============================================================================================


@dataclass
class Recursos:
    hilos: int
    nucleos: int
    ram_gb: float
    arquitectura: str
    grupos: List[List[int]] = field(default_factory=list)  # hilos hermanos de cada núcleo físico

    @property
    def smt(self) -> bool:
        return self.hilos > self.nucleos


@dataclass
class Plan:
    sesiones: int
    cpus: float  # núcleos por sesión (cuota de cgroups)
    ram_gb: float  # memoria por sesión (incluye su /home en tmpfs)
    hilos_llvmpipe: int
    cpusets: List[Optional[str]]
    explicacion: List[str]


PERFILES = {
    # Un núcleo físico completo por alumno (con sus dos hilos en Intel/AMD). Fluido y parejo.
    "equilibrado": {"cpu_smt": 2.0, "cpu": 1.0, "ram": 3.0},
    # El doble de alumnos: medio núcleo cada uno. Bien para modelar; los renders tardan el doble.
    "denso": {"cpu_smt": 1.0, "cpu": 0.75, "ram": 2.0},
}


def _leer(ruta: str) -> str:
    try:
        return Path(ruta).read_text().strip()
    except OSError:
        return ""


def _lista_cpus(texto: str) -> List[int]:
    cpus: List[int] = []
    for parte in texto.split(","):
        if "-" in parte:
            a, b = parte.split("-", 1)
            cpus.extend(range(int(a), int(b) + 1))
        elif parte.strip():
            cpus.append(int(parte))
    return cpus


def detectar_recursos() -> Recursos:
    permitidos = sorted(os.sched_getaffinity(0)) if hasattr(os, "sched_getaffinity") else list(range(os.cpu_count() or 1))
    grupos: List[List[int]] = []
    vistos = set()
    for cpu in permitidos:
        hermanos = _leer(f"/sys/devices/system/cpu/cpu{cpu}/topology/thread_siblings_list")
        grupo = tuple(c for c in (_lista_cpus(hermanos) if hermanos else [cpu]) if c in permitidos)
        if grupo and grupo not in vistos:
            vistos.add(grupo)
            grupos.append(list(grupo))
    ram_kb = 0
    for linea in _leer("/proc/meminfo").splitlines():
        if linea.startswith("MemTotal:"):
            ram_kb = int(linea.split()[1])
    ram_gb = ram_kb / 1048576 if ram_kb else 4.0
    limite = _leer("/sys/fs/cgroup/memory.max")
    if limite.isdigit():
        ram_gb = min(ram_gb, int(limite) / 1073741824)
    return Recursos(hilos=len(permitidos), nucleos=len(grupos) or len(permitidos), ram_gb=round(ram_gb, 1),
                    arquitectura=platform.machine(), grupos=grupos)


def planear(r: Recursos, perfil: str = "equilibrado", reserva_cpu: float = 0.0, reserva_ram: float = 2.0,
            sesiones: Optional[int] = None) -> Plan:
    """Cuántas sesiones caben sin que ninguna se quede sin aire.

    Lo que más pesa con llvmpipe es el procesador. La RAM sobra: una sesión con Blender abierto ocupa
    unos 550 MB (medido en docs/nube/README.md) y se le dan 2 o 3 GB de techo para escenas grandes.
    """
    datos = PERFILES[perfil]
    cpu = datos["cpu_smt"] if r.smt else datos["cpu"]
    ram = datos["ram"]
    por_cpu = max(0, math.floor((r.hilos - reserva_cpu) / cpu + 1e-9))
    por_ram = max(0, math.floor((r.ram_gb - reserva_ram) / ram + 1e-9))
    n = min(por_cpu, por_ram)
    explicacion = [
        f"{r.hilos} hilos en {r.nucleos} núcleos ({r.arquitectura}), {r.ram_gb} GB de RAM.",
        f"Perfil {perfil}: {cpu:g} {'hilos' if r.smt else 'núcleos'} y {ram:g} GB por sesión; "
        f"reservados {reserva_cpu:g} para el sistema y {reserva_ram:g} GB.",
        f"Caben {por_cpu} por procesador y {por_ram} por memoria → {n}.",
    ]
    if sesiones is not None:
        if sesiones > por_ram:
            explicacion.append(f"Pediste {sesiones}, pero la memoria solo alcanza para {por_ram}.")
        n = max(0, min(sesiones, por_ram))
        if sesiones <= por_ram:
            explicacion.append(f"Fijado a mano en {n}.")
    # Fijar cada sesión a su núcleo físico evita que una le robe caché a otra (perfil equilibrado, Intel/AMD).
    cpusets: List[Optional[str]] = [None] * n
    if perfil == "equilibrado" and r.smt and reserva_cpu == 0 and n <= len(r.grupos):
        cpusets = [",".join(map(str, r.grupos[i])) for i in range(n)]
        explicacion.append("Cada sesión queda fijada a un núcleo físico con sus dos hilos.")
    return Plan(sesiones=n, cpus=cpu, ram_gb=ram, hilos_llvmpipe=max(1, math.ceil(cpu)), cpusets=cpusets,
                explicacion=explicacion)


# =============================================================================================
# 2. Lanzadores: Docker (de verdad) y simulado (pruebas sin Docker)
# =============================================================================================


async def _ejecutar(*args: str, timeout: float = 120) -> tuple:
    proceso = await asyncio.create_subprocess_exec(*args, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    try:
        salida, error = await asyncio.wait_for(proceso.communicate(), timeout)
    except asyncio.TimeoutError:
        proceso.kill()
        return 124, "", "tiempo agotado"
    return proceso.returncode, salida.decode(errors="replace").strip(), error.decode(errors="replace").strip()


class LanzadorDocker:
    def __init__(self, plan: Plan, imagen: str = IMAGEN, red: str = RED, disco_gb: float = 1.0):
        self.plan = plan
        self.imagen = imagen
        self.red = red
        self.disco_gb = disco_gb

    def nombre(self, sesion_id: str) -> str:
        return f"amatista-{sesion_id}"

    def argumentos(self, sesion_id: str, ranura: int, expira: float, carpeta: Path) -> List[str]:
        """La línea de `docker run` de una sesión. Cada opción es una capa de aislamiento."""
        p = self.plan
        args = [
            "docker", "run", "-d", "--rm",
            "--name", self.nombre(sesion_id),
            "--label", ETIQUETA, "--label", f"amatista.sesion={sesion_id}",
            # Red interna de Docker: el proxy del nodo la alcanza, internet no (ni DNS).
            "--network", self.red,
            # Procesador: cuota dura y, si hay, un núcleo físico propio.
            "--cpus", f"{p.cpus:g}",
            # Memoria: techo duro sin swap (su /home en tmpfs cuenta dentro).
            "--memory", f"{p.ram_gb:g}g", "--memory-swap", f"{p.ram_gb:g}g", "--oom-score-adj", "500",
            # Nada de bombas de procesos ni de escribir fuera de lo permitido.
            "--pids-limit", "256", "--read-only",
            "--tmpfs", "/tmp:size=256m,mode=1777", "--tmpfs", "/home/alumno:size=512m,uid=1000,gid=1000",
            "--shm-size", "256m",
            "--cap-drop", "ALL", "--security-opt", "no-new-privileges",
            "--ulimit", "nofile=4096:4096", "--ulimit", f"fsize={int(self.disco_gb * 1073741824)}",
            "-v", f"{carpeta}:/home/alumno/Proyectos",
            "-e", f"AMATISTA_EXPIRA={int(expira)}",
            "-e", f"LP_NUM_THREADS={p.hilos_llvmpipe}",
            "-e", f"AMATISTA_HILOS={p.hilos_llvmpipe}",
        ]
        if ranura < len(p.cpusets) and p.cpusets[ranura]:
            args += ["--cpuset-cpus", p.cpusets[ranura]]
        return args + [self.imagen]

    async def preparar(self) -> None:
        codigo, _, error = await _ejecutar("docker", "image", "inspect", self.imagen)
        if codigo != 0:
            raise SystemExit(f"Falta la imagen {self.imagen}. Ejecuta: python amatista_nodo.py construir\n{error}")
        codigo, _, _ = await _ejecutar("docker", "network", "inspect", self.red)
        if codigo != 0:
            codigo, _, error = await _ejecutar("docker", "network", "create", "--internal", self.red)
            if codigo != 0:
                raise SystemExit(f"No se pudo crear la red interna {self.red}: {error}")
        # Contenedores que quedaron de una ejecución anterior (corte de luz, reinicio).
        _, salida, _ = await _ejecutar("docker", "ps", "-aq", "--filter", f"label={ETIQUETA}")
        for contenedor in salida.split():
            await _ejecutar("docker", "rm", "-f", contenedor)

    async def abrir(self, sesion_id: str, ranura: int, expira: float, carpeta: Path) -> str:
        codigo, _, error = await _ejecutar(*self.argumentos(sesion_id, ranura, expira, carpeta))
        if codigo != 0:
            raise RuntimeError(error[-200:] or "docker run falló")
        _, ip, _ = await _ejecutar("docker", "inspect", "-f", "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}",
                                   self.nombre(sesion_id))
        if not ip:
            raise RuntimeError("el contenedor no tiene dirección en la red interna")
        return f"http://{ip}:{PUERTO_VNC}"

    async def cerrar(self, sesion_id: str) -> None:
        await _ejecutar("docker", "rm", "-f", self.nombre(sesion_id), timeout=60)

    async def vivo(self, sesion_id: str) -> bool:
        codigo, salida, _ = await _ejecutar("docker", "inspect", "-f", "{{.State.Running}}", self.nombre(sesion_id))
        return codigo == 0 and salida == "true"


class LanzadorSimulado:
    """Un «escritorio» de mentira (página + WebSocket de eco) para probar todo sin Docker."""

    def __init__(self):
        self.servidores: Dict[str, object] = {}

    async def preparar(self) -> None:
        return None

    async def abrir(self, sesion_id: str, ranura: int, expira: float, carpeta: Path) -> str:
        from aiohttp import WSMsgType, web

        async def pagina(_):
            return web.Response(text=f"<title>Sesión simulada</title><p>Escritorio simulado de {sesion_id}</p>",
                                content_type="text/html")

        async def eco(request):
            ws = web.WebSocketResponse(protocols=("binary",))
            await ws.prepare(request)
            async for mensaje in ws:
                if mensaje.type == WSMsgType.BINARY:
                    await ws.send_bytes(mensaje.data)
                elif mensaje.type == WSMsgType.TEXT:
                    await ws.send_str(mensaje.data)
            return ws

        app = web.Application()
        app.router.add_get("/index.html", pagina)
        app.router.add_get("/websockify", eco)
        corredor = web.AppRunner(app)
        await corredor.setup()
        sitio = web.TCPSite(corredor, "127.0.0.1", 0)
        await sitio.start()
        puerto = sitio._server.sockets[0].getsockname()[1]
        self.servidores[sesion_id] = corredor
        return f"http://127.0.0.1:{puerto}"

    async def cerrar(self, sesion_id: str) -> None:
        corredor = self.servidores.pop(sesion_id, None)
        if corredor is not None:
            await corredor.cleanup()

    async def vivo(self, sesion_id: str) -> bool:
        return sesion_id in self.servidores


# =============================================================================================
# 3. Sesiones y conversación con el coordinador
# =============================================================================================


@dataclass
class Sesion:
    id: str
    token_hash: str
    expira: float
    ranura: int
    carpeta: Path
    estado: str = "abriendo"  # abriendo → lista → cerrando
    destino: str = ""
    ultima_actividad: float = field(default_factory=time.time)
    conexiones: int = 0


def token_valido(token: str, token_hash: str) -> bool:
    return bool(token) and hmac.compare_digest(hashlib.sha256(token.encode()).hexdigest(), token_hash)


def tamano_carpeta(carpeta: Path) -> int:
    total = 0
    for raiz, _, archivos in os.walk(carpeta):
        for nombre in archivos:
            try:
                total += os.path.getsize(os.path.join(raiz, nombre))
            except OSError:
                pass
    return total


class Nodo:
    def __init__(self, servidor: str, token: str, url_publica: str, plan: Plan, lanzador, carpeta: Path,
                 inactividad_s: int = 900, disco_gb: float = 1.0):
        self.servidor = servidor.rstrip("/")
        self.token = token
        self.url_publica = url_publica.rstrip("/")
        self.plan = plan
        self.lanzador = lanzador
        self.carpeta = carpeta
        self.inactividad_s = inactividad_s
        self.disco_bytes = int(disco_gb * 1073741824)
        self.sesiones: Dict[str, Sesion] = {}
        self.http = None  # aiohttp.ClientSession
        self.parar = asyncio.Event()

    # --- coordinador ---------------------------------------------------------------------

    def _cabeceras(self) -> dict:
        return {"Authorization": f"Bearer {self.token}", "User-Agent": f"amatista-nodo/{VERSION}"}

    def metricas(self) -> dict:
        datos = {"arquitectura": platform.machine(), "nucleos": os.cpu_count(), "version": VERSION}
        try:
            datos["carga"] = round(os.getloadavg()[0], 2)
        except OSError:
            pass
        libre = 0
        for linea in _leer("/proc/meminfo").splitlines():
            if linea.startswith("MemAvailable:"):
                libre = int(linea.split()[1])
            if linea.startswith("MemTotal:"):
                datos["ram_gb"] = round(int(linea.split()[1]) / 1048576, 1)
        if libre:
            datos["ram_libre_gb"] = round(libre / 1048576, 1)
        return datos

    async def latir(self) -> float:
        cuerpo = {"url": self.url_publica, "capacidad": self.plan.sesiones, "sesiones": sorted(self.sesiones), **self.metricas()}
        async with self.http.post(f"{self.servidor}/api/nube/v1/nodo/latido", json=cuerpo, headers=self._cabeceras()) as r:
            if r.status == 401:
                raise SystemExit("La API no reconoce el token de este nodo (AMATISTA_NUBE_NODOS en el servidor).")
            if r.status != 200:
                LOG.warning("Latido rechazado (%s): %s", r.status, (await r.text())[:200])
                return 10.0
            trabajo = await r.json()
        for orden in trabajo.get("tokens", []):
            sesion = self.sesiones.get(orden["id"])
            if sesion:
                sesion.token_hash = orden["token_hash"]
                LOG.info("Token renovado: %s", orden["id"])
        for sesion_id in trabajo.get("cerrar", []):
            if sesion_id in self.sesiones and self.sesiones[sesion_id].estado != "cerrando":
                asyncio.create_task(self.cerrar(sesion_id, "la cerró Amatista", reportar=True))
        for pedido in trabajo.get("abrir", []):
            if pedido["id"] not in self.sesiones and ID_SESION.match(pedido["id"]):
                asyncio.create_task(self.abrir(pedido))
        return float(trabajo.get("latido_s", 5))

    async def reportar(self, sesion_id: str, estado: str, motivo: Optional[str] = None) -> None:
        for intento in range(3):
            try:
                async with self.http.post(f"{self.servidor}/api/nube/v1/nodo/sesiones/{sesion_id}",
                                          json={"estado": estado, "motivo": (motivo or "")[:40] or None},
                                          headers=self._cabeceras()) as r:
                    if r.status < 500:
                        return
            except Exception as error:  # noqa: BLE001 - la red de una casa se cae; se reintenta
                LOG.warning("No se pudo reportar %s (%s)", sesion_id, error)
            await asyncio.sleep(2 * (intento + 1))

    # --- ciclo de vida -------------------------------------------------------------------

    def _ranura_libre(self) -> Optional[int]:
        ocupadas = {s.ranura for s in self.sesiones.values()}
        return next((i for i in range(self.plan.sesiones) if i not in ocupadas), None)

    async def abrir(self, pedido: dict) -> None:
        ranura = self._ranura_libre()
        if ranura is None:
            await self.reportar(pedido["id"], "fallida", "nodo lleno")
            return
        carpeta = self.carpeta / pedido["id"]
        carpeta.mkdir(parents=True, exist_ok=True)
        os.chmod(carpeta, 0o777)  # el alumno dentro del contenedor es el UID 1000
        sesion = Sesion(id=pedido["id"], token_hash=pedido["token_hash"], expira=float(pedido["expira"]), ranura=ranura,
                        carpeta=carpeta)
        self.sesiones[sesion.id] = sesion
        LOG.info("Abriendo %s en la ranura %s (vence en %s min)", sesion.id, ranura, pedido.get("minutos"))
        try:
            sesion.destino = await self.lanzador.abrir(sesion.id, ranura, sesion.expira, carpeta)
            await self._esperar_escritorio(sesion)
        except Exception as error:  # noqa: BLE001
            LOG.error("No se pudo abrir %s: %s", sesion.id, error)
            await self.cerrar(sesion.id, "no abrió", reportar=False)
            await self.reportar(sesion.id, "fallida", str(error)[:40])
            return
        if sesion.estado == "abriendo":
            sesion.estado = "lista"
            sesion.ultima_actividad = time.time()
            await self.reportar(sesion.id, "lista")
            LOG.info("Lista %s", sesion.id)

    async def _esperar_escritorio(self, sesion: Sesion, segundos: float = 90) -> None:
        limite = time.time() + segundos
        while time.time() < limite:
            if sesion.estado == "cerrando":
                raise RuntimeError("se canceló")
            try:
                async with self.http.get(f"{sesion.destino}/index.html", timeout=aiohttp_timeout(3)) as r:
                    if r.status == 200:
                        return
            except Exception:  # noqa: BLE001 - todavía arrancando
                pass
            await asyncio.sleep(1)
        raise RuntimeError("el escritorio no arrancó a tiempo")

    async def cerrar(self, sesion_id: str, motivo: str, reportar: bool = True) -> None:
        sesion = self.sesiones.get(sesion_id)
        if sesion is None:
            return
        sesion.estado = "cerrando"
        try:
            await self.lanzador.cerrar(sesion_id)
        finally:
            shutil.rmtree(sesion.carpeta, ignore_errors=True)
            self.sesiones.pop(sesion_id, None)
        LOG.info("Cerrada %s (%s)", sesion_id, motivo)
        if reportar:
            await self.reportar(sesion_id, "terminada", motivo)

    async def vigilar(self) -> None:
        """Hora vencida, inactividad, contenedor caído o disco lleno: la sesión se cierra."""
        while not self.parar.is_set():
            ahora = time.time()
            for sesion in list(self.sesiones.values()):
                if sesion.estado != "lista":
                    continue
                motivo = None
                if ahora >= sesion.expira:
                    motivo = "tiempo"
                elif sesion.conexiones == 0 and ahora - sesion.ultima_actividad > self.inactividad_s:
                    motivo = "inactiva"
                elif not await self.lanzador.vivo(sesion.id):
                    motivo = "se cerró el escritorio"
                elif tamano_carpeta(sesion.carpeta) > self.disco_bytes:
                    motivo = "disco lleno"
                if motivo:
                    asyncio.create_task(self.cerrar(sesion.id, motivo))
            try:
                await asyncio.wait_for(self.parar.wait(), 5)
            except asyncio.TimeoutError:
                pass

    async def ciclo_de_latidos(self) -> None:
        espera = 1.0
        while not self.parar.is_set():
            try:
                espera = await self.latir()
            except SystemExit:
                raise
            except Exception as error:  # noqa: BLE001 - sin red: se reintenta sin tumbar las sesiones
                LOG.warning("Sin conexión con %s: %s", self.servidor, error)
                espera = 10.0
            try:
                await asyncio.wait_for(self.parar.wait(), espera)
            except asyncio.TimeoutError:
                pass

    async def apagar(self) -> None:
        self.parar.set()
        await asyncio.gather(*(self.cerrar(s, "nodo apagado") for s in list(self.sesiones)), return_exceptions=True)


def aiohttp_timeout(segundos: float):
    import aiohttp

    return aiohttp.ClientTimeout(total=segundos)


# =============================================================================================
# 4. El proxy: lo único que se publica a internet
# =============================================================================================

CABECERAS_SEGURAS = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "frame-ancestors 'self' https://amatista-3d.tech https://*.amatista-3d.tech",
}
ESTILO = ("<style>body{font-family:system-ui,sans-serif;background:#16131c;color:#eee;max-width:720px;margin:40px auto;"
          "padding:0 16px}a{color:#2de2e6}table{width:100%;border-collapse:collapse}td{padding:6px;border-bottom:"
          "1px solid #333}button,input{font:inherit}</style>")


def crear_app(nodo: Nodo):
    import aiohttp
    from aiohttp import WSMsgType, web

    intentos: Dict[str, List[float]] = {}

    @web.middleware
    async def seguridad(request, handler):  # aiohttp exige este nombre
        respuesta = await handler(request)
        for clave, valor in CABECERAS_SEGURAS.items():
            respuesta.headers.setdefault(clave, valor)
        return respuesta

    def sesion_de(request) -> Sesion:
        sesion = nodo.sesiones.get(request.match_info["sid"])
        if sesion is None or sesion.estado != "lista" or time.time() >= sesion.expira:
            raise web.HTTPNotFound(text="Esta sesión no existe o ya terminó. Vuelve a Amatista Cloud.")
        if not token_valido(request.cookies.get(f"amatista_{sesion.id[-8:]}", ""), sesion.token_hash):
            raise web.HTTPForbidden(text="Entra desde Amatista Cloud para usar esta sesión.")
        return sesion

    async def inicio(_):
        libres = nodo.plan.sesiones - len(nodo.sesiones)
        return web.Response(text=f"<!doctype html><title>Amatista Cloud</title>{ESTILO}<h1>Nodo de Amatista Cloud</h1>"
                                 f"<p>Este equipo presta Blender a alumnos de la UTN. Lugares libres: {libres}.</p>"
                                 f"<p>Para usarlo entra a <a href='https://amatista-3d.tech/#/nube'>Amatista Cloud</a>.</p>",
                            content_type="text/html")

    async def salud(_):
        return web.json_response({"version": VERSION, "capacidad": nodo.plan.sesiones, "sesiones": len(nodo.sesiones)})

    async def entrar(request):
        ip = request.headers.get("CF-Connecting-IP") or request.remote or "?"
        ventana = [t for t in intentos.get(ip, []) if time.time() - t < 60]
        if len(ventana) >= 20:
            raise web.HTTPTooManyRequests(text="Demasiados intentos. Espera un minuto.")
        intentos[ip] = ventana + [time.time()]
        datos = await request.post()
        sesion = nodo.sesiones.get(str(datos.get("sesion", "")))
        token = str(datos.get("token", ""))
        if sesion is None or sesion.estado != "lista" or not token_valido(token, sesion.token_hash):
            raise web.HTTPForbidden(text="El token no es válido o la sesión ya terminó. Vuelve a Amatista Cloud.")
        respuesta = web.Response(status=303, headers={"Location": f"/s/{sesion.id}/", "Cache-Control": "no-store"})
        respuesta.set_cookie(f"amatista_{sesion.id[-8:]}", token, path=f"/s/{sesion.id}/", httponly=True,
                             secure=nodo.url_publica.startswith("https://"), samesite="Lax",
                             max_age=max(60, int(sesion.expira - time.time())))
        return respuesta

    async def escritorio(request):
        sesion = sesion_de(request)
        ruta = quote(f"s/{sesion.id}/websockify", safe="/")
        raise web.HTTPFound(f"/s/{sesion.id}/index.html?path={ruta}&autoconnect=1&resize=remote&reconnect=1"
                            f"&show_dot=1&idle_disconnect=0")

    def ruta_segura(sesion: Sesion, nombre: str) -> Path:
        destino = (sesion.carpeta / nombre).resolve()
        if sesion.carpeta.resolve() not in destino.parents or not destino.is_file():
            raise web.HTTPNotFound(text="No existe ese archivo.")
        return destino

    async def archivos(request):
        sesion = sesion_de(request)
        filas = []
        for archivo in sorted(sesion.carpeta.rglob("*")):
            if archivo.is_file():
                relativo = archivo.relative_to(sesion.carpeta).as_posix()
                filas.append(f"<tr><td><a href='archivos/{quote(relativo)}'>{html.escape(relativo)}</a></td>"
                             f"<td>{archivo.stat().st_size / 1048576:.1f} MB</td></tr>")
        minutos = max(0, int((sesion.expira - time.time()) // 60))
        cuerpo = (f"<!doctype html><title>Archivos · Amatista Cloud</title>{ESTILO}<h1>Tus archivos</h1>"
                  f"<p>Quedan {minutos} minutos. Al terminar la sesión se borra todo: descarga lo que quieras conservar."
                  f"</p><table>{''.join(filas) or '<tr><td>Todavía no hay archivos. En Blender, guarda en Proyectos.</td></tr>'}"
                  f"</table><h2>Subir un archivo</h2><form method='post' enctype='multipart/form-data'>"
                  f"<input type='file' name='archivo' required> <button>Subir</button></form>"
                  f"<p>.blend, imágenes y modelos 3D de hasta 100 MB. <a href='./'>Volver a Blender</a></p>")
        return web.Response(text=cuerpo, content_type="text/html", headers={"Cache-Control": "no-store"})

    async def descargar(request):
        sesion = sesion_de(request)
        archivo = ruta_segura(sesion, request.match_info["nombre"])
        return web.FileResponse(archivo, headers={"Content-Disposition": f'attachment; filename="{quote(archivo.name)}"',
                                                  "Cache-Control": "no-store"})

    async def subir(request):
        sesion = sesion_de(request)
        lector = await request.multipart()
        parte = await lector.next()
        if parte is None or parte.name != "archivo" or not parte.filename:
            raise web.HTTPBadRequest(text="Elige un archivo.")
        nombre = re.sub(r"[^\w.\- ]", "_", Path(parte.filename).name)[:120]
        if Path(nombre).suffix.lower() not in EXTENSIONES:
            raise web.HTTPBadRequest(text="Ese tipo de archivo no se puede subir.")
        if tamano_carpeta(sesion.carpeta) > nodo.disco_bytes:
            raise web.HTTPRequestEntityTooLarge(max_size=nodo.disco_bytes, actual_size=0)
        destino = sesion.carpeta / nombre
        escritos = 0
        with open(destino, "wb") as salida:
            while True:
                trozo = await parte.read_chunk(1 << 20)
                if not trozo:
                    break
                escritos += len(trozo)
                if escritos > SUBIDA_MAX:
                    salida.close()
                    destino.unlink(missing_ok=True)
                    raise web.HTTPRequestEntityTooLarge(max_size=SUBIDA_MAX, actual_size=escritos)
                salida.write(trozo)
        os.chmod(destino, 0o666)
        raise web.HTTPSeeOther("archivos")

    async def pasar(request):
        sesion = sesion_de(request)
        cola = request.match_info["cola"]
        if request.headers.get("Upgrade", "").lower() == "websocket":
            return await pasar_websocket(request, sesion, cola)
        if request.method not in ("GET", "HEAD"):
            raise web.HTTPMethodNotAllowed(request.method, ["GET", "HEAD"])
        url = f"{sesion.destino}/{cola}"
        if request.query_string:
            url += "?" + request.query_string
        async with nodo.http.request(request.method, url, timeout=aiohttp_timeout(30)) as r:
            cuerpo = await r.read()
            cabeceras = {k: v for k, v in r.headers.items() if k.lower() in ("content-type", "cache-control", "etag", "last-modified")}
            return web.Response(body=cuerpo, status=r.status, headers=cabeceras)

    async def pasar_websocket(request, sesion: Sesion, cola: str):
        protocolos = [p.strip() for p in request.headers.get("Sec-WebSocket-Protocol", "").split(",") if p.strip()]
        cliente = web.WebSocketResponse(protocols=protocolos or ("binary",), max_msg_size=0, heartbeat=30)
        await cliente.prepare(request)
        destino = sesion.destino.replace("http://", "ws://", 1) + f"/{cola}"
        sesion.conexiones += 1
        try:
            # KasmVNC rechaza el WebSocket sin Origin: se le da el suyo (el del navegador es el dominio del nodo).
            async with nodo.http.ws_connect(destino, protocols=protocolos or ("binary",), max_msg_size=0,
                                            origin=sesion.destino) as servidor:
                async def subir_mensajes():
                    async for mensaje in cliente:
                        sesion.ultima_actividad = time.time()
                        if mensaje.type == WSMsgType.BINARY:
                            await servidor.send_bytes(mensaje.data)
                        elif mensaje.type == WSMsgType.TEXT:
                            await servidor.send_str(mensaje.data)
                    await servidor.close()

                async def bajar_mensajes():
                    async for mensaje in servidor:
                        if mensaje.type == WSMsgType.BINARY:
                            await cliente.send_bytes(mensaje.data)
                        elif mensaje.type == WSMsgType.TEXT:
                            await cliente.send_str(mensaje.data)
                    await cliente.close()

                tareas = [asyncio.create_task(subir_mensajes()), asyncio.create_task(bajar_mensajes())]
                _, pendientes = await asyncio.wait(tareas, return_when=asyncio.FIRST_COMPLETED)
                for tarea in pendientes:
                    tarea.cancel()
        except aiohttp.ClientError as error:
            LOG.warning("WebSocket de %s: %s", sesion.id, error)
        finally:
            sesion.conexiones -= 1
            sesion.ultima_actividad = time.time()
        return cliente

    app = web.Application(middlewares=[seguridad], client_max_size=SUBIDA_MAX + 1048576)
    app.router.add_get("/", inicio)
    app.router.add_get("/salud", salud)
    app.router.add_post("/entrar", entrar)
    app.router.add_get("/s/{sid}/", escritorio)
    app.router.add_get("/s/{sid}/archivos", archivos)
    app.router.add_post("/s/{sid}/archivos", subir)
    app.router.add_get("/s/{sid}/archivos/{nombre:.+}", descargar)
    app.router.add_route("*", "/s/{sid}/{cola:.*}", pasar)
    return app


# =============================================================================================
# 5. Línea de comandos
# =============================================================================================


def leer_config(ruta: Optional[str]) -> None:
    """Carga CLAVE=valor de un archivo (no pisa variables que ya existan)."""
    if not ruta:
        return
    for linea in Path(ruta).read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if linea and not linea.startswith("#") and "=" in linea:
            clave, valor = linea.split("=", 1)
            os.environ.setdefault(clave.strip(), valor.strip().strip('"').strip("'"))


def opciones_de_plan(sub) -> None:
    sub.add_argument("--perfil", choices=sorted(PERFILES), default=os.getenv("AMATISTA_NODO_PERFIL", "equilibrado"))
    sub.add_argument("--reserva-cpu", type=float, default=float(os.getenv("AMATISTA_NODO_RESERVA_CPU", "0")),
                     help="núcleos o hilos que se dejan libres (0.5 en la VM de Oracle, que también corre la API)")
    sub.add_argument("--reserva-ram", type=float, default=float(os.getenv("AMATISTA_NODO_RESERVA_RAM", "2")),
                     help="GB que se dejan al sistema (2; 2.5 en la VM de Oracle)")
    sub.add_argument("--sesiones", type=int, default=int(os.getenv("AMATISTA_NODO_SESIONES") or 0) or None,
                     help="fija el número de sesiones (por defecto, las que caben)")


def plan_desde(args) -> Plan:
    return planear(detectar_recursos(), args.perfil, args.reserva_cpu, args.reserva_ram, args.sesiones)


def cmd_nuevo_token(args) -> int:
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{1,40}", args.nombre):
        print("El nombre va en minúsculas, con números o guiones: casa, oracle, lab-utn-1.")
        return 2
    token = secrets.token_urlsafe(32)
    print(f"Token del nodo «{args.nombre}» (guárdalo en nodo.env de ese equipo; no se vuelve a mostrar):\n")
    print(f"  AMATISTA_NODO_TOKEN={token}\n")
    print("En el servidor de la API agrega esto a AMATISTA_NUBE_NODOS (separado por comas si ya hay otros):\n")
    print(f"  {args.nombre}:{hashlib.sha256(token.encode()).hexdigest()}")
    return 0


def cmd_diagnostico(args) -> int:
    recursos = detectar_recursos()
    plan = planear(recursos, args.perfil, args.reserva_cpu, args.reserva_ram, args.sesiones)
    print(f"Amatista Cloud · nodo {VERSION}\n")
    for linea in plan.explicacion:
        print("  " + linea)
    print(f"\n  → Este equipo puede atender {plan.sesiones} sesiones a la vez.")
    docker = shutil.which("docker")
    print(f"\n  Docker: {'sí' if docker else 'NO ENCONTRADO (ver docs/nube/INSTRUCCIONES.md)'}")
    if docker:
        codigo, _, _ = asyncio.run(_ejecutar("docker", "image", "inspect", args.imagen))
        print(f"  Imagen {args.imagen}: {'lista' if codigo == 0 else 'falta (python amatista_nodo.py construir)'}")
    try:
        import aiohttp  # noqa: F401

        print("  aiohttp: sí")
    except ImportError:
        print("  aiohttp: NO (pip install -r requirements.txt)")
    faltan = [v for v in ("AMATISTA_NODO_SERVIDOR", "AMATISTA_NODO_TOKEN", "AMATISTA_NODO_URL") if not os.getenv(v)]
    print(f"  Configuración: {'completa' if not faltan else 'faltan ' + ', '.join(faltan)}")
    return 0


def cmd_construir(args) -> int:
    contexto = Path(__file__).resolve().parent.parent / "imagen"
    print(f"Construyendo {args.imagen} desde {contexto} (la primera vez tarda unos minutos)…")
    return os.spawnvp(os.P_WAIT, "docker", ["docker", "build", "-t", args.imagen, str(contexto)])


async def ejecutar_nodo(args) -> int:
    import aiohttp
    from aiohttp import web

    servidor = os.getenv("AMATISTA_NODO_SERVIDOR", "https://api.amatista-3d.tech")
    token = os.getenv("AMATISTA_NODO_TOKEN", "")
    url = os.getenv("AMATISTA_NODO_URL", "")
    if not token or not url:
        print("Falta AMATISTA_NODO_TOKEN o AMATISTA_NODO_URL (en nodo.env). Ver docs/nube/INSTRUCCIONES.md.")
        return 2
    plan = plan_desde(args)
    for linea in plan.explicacion:
        LOG.info(linea)
    if plan.sesiones == 0:
        LOG.error("No cabe ninguna sesión en este equipo con el perfil %s.", args.perfil)
        return 2
    lanzador = LanzadorSimulado() if args.simulado else LanzadorDocker(plan, args.imagen, disco_gb=args.disco_gb)
    await lanzador.preparar()
    carpeta = Path(args.carpeta).expanduser()
    shutil.rmtree(carpeta, ignore_errors=True)  # lo de una ejecución anterior ya no tiene dueño
    carpeta.mkdir(parents=True, exist_ok=True)
    nodo = Nodo(servidor, token, url, plan, lanzador, carpeta, inactividad_s=args.inactividad_min * 60, disco_gb=args.disco_gb)
    nodo.http = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=20))
    corredor = web.AppRunner(crear_app(nodo))
    await corredor.setup()
    await web.TCPSite(corredor, args.escuchar, args.puerto).start()
    LOG.info("Nodo listo: %s sesiones, proxy en %s:%s, público en %s", plan.sesiones, args.escuchar, args.puerto, url)

    bucle = asyncio.get_running_loop()
    for senal in (signal.SIGINT, signal.SIGTERM):
        try:
            bucle.add_signal_handler(senal, nodo.parar.set)
        except NotImplementedError:
            pass
    tareas = [asyncio.create_task(nodo.ciclo_de_latidos()), asyncio.create_task(nodo.vigilar())]
    await nodo.parar.wait()
    LOG.info("Apagando: cerrando las sesiones abiertas…")
    await nodo.apagar()
    for tarea in tareas:
        tarea.cancel()
    await nodo.http.close()
    await corredor.cleanup()
    return 0


def main(argv: Optional[List[str]] = None) -> int:
    general = argparse.ArgumentParser(description="Nodo de Amatista Cloud")
    general.add_argument("--config", default=os.getenv("AMATISTA_NODO_CONFIG"), help="archivo nodo.env")
    general.add_argument("--imagen", default=os.getenv("AMATISTA_NODO_IMAGEN", IMAGEN))
    comandos = general.add_subparsers(dest="comando", required=True)
    token = comandos.add_parser("nuevo-token", help="crea el token de un nodo nuevo")
    token.add_argument("nombre")
    opciones_de_plan(comandos.add_parser("diagnostico", help="recursos, sesiones que caben y lo que falta"))
    comandos.add_parser("construir", help="construye la imagen de la sesión con Docker")
    correr = comandos.add_parser("ejecutar", help="atiende sesiones")
    opciones_de_plan(correr)
    correr.add_argument("--puerto", type=int, default=int(os.getenv("AMATISTA_NODO_PUERTO", "8730")))
    correr.add_argument("--escuchar", default=os.getenv("AMATISTA_NODO_ESCUCHAR", "127.0.0.1"))
    correr.add_argument("--carpeta", default=os.getenv("AMATISTA_NODO_CARPETA", "~/.amatista-nodo/sesiones"))
    correr.add_argument("--inactividad-min", type=int, default=int(os.getenv("AMATISTA_NODO_INACTIVIDAD_MIN", "15")))
    correr.add_argument("--disco-gb", type=float, default=float(os.getenv("AMATISTA_NODO_DISCO_GB", "1")))
    correr.add_argument("--simulado", action="store_true", help="sin Docker: escritorios de prueba (solo para probar)")
    # --config se lee antes de que los valores por defecto consulten el entorno.
    previo, _ = general.parse_known_args(argv)
    leer_config(previo.config)
    args = general.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", stream=sys.stdout)
    if args.comando == "nuevo-token":
        return cmd_nuevo_token(args)
    if args.comando == "diagnostico":
        return cmd_diagnostico(args)
    if args.comando == "construir":
        return cmd_construir(args)
    return asyncio.run(ejecutar_nodo(args))


if __name__ == "__main__":
    sys.exit(main())
