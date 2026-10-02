"""Límite de peticiones por IP para las rutas de autenticación.

Vive en memoria del proceso (un solo uvicorn en el servidor ARM): frena
ataques de fuerza bruta sin escribir en Oracle. El bloqueo por cuenta
(USUARIOS.intentos_fallidos) protege aunque el atacante cambie de IP.
AMATISTA_SIN_LIMITES=1 lo desactiva (pruebas).
"""
import os
import threading
import time
from collections import defaultdict, deque
from typing import Callable, Deque, Dict, Tuple

from fastapi import HTTPException, Request

_ventanas: Dict[Tuple[str, str], Deque[float]] = defaultdict(deque)
_candado = threading.Lock()


def ip_cliente(request: Request) -> str:
    # Detrás de un proxy (Cloudflare, nginx) la IP real llega en X-Forwarded-For.
    # Solo se confía en ella con AMATISTA_DETRAS_DE_PROXY=1: sin proxy,
    # cualquiera podría inventarla para saltarse el límite.
    reenviada = request.headers.get("x-forwarded-for", "")
    if reenviada and os.getenv("AMATISTA_DETRAS_DE_PROXY") == "1":
        return reenviada.split(",")[0].strip()
    return request.client.host if request.client else "desconocida"


def limitar(nombre: str, maximo: int, segundos: int) -> Callable[[Request], None]:
    """Dependencia que permite `maximo` peticiones por IP cada `segundos`."""

    def verificar(request: Request) -> None:
        if os.getenv("AMATISTA_SIN_LIMITES") == "1":
            return
        clave = (nombre, ip_cliente(request))
        momento = time.monotonic()
        with _candado:
            ventana = _ventanas[clave]
            while ventana and momento - ventana[0] > segundos:
                ventana.popleft()
            if len(ventana) >= maximo:
                raise HTTPException(status_code=429, detail="Demasiados intentos. Espera unos minutos.")
            ventana.append(momento)

    return verificar


def reiniciar() -> None:
    with _candado:
        _ventanas.clear()
