"""ai_tutor/servicio.py — Microservicio FastAPI de IA y Diagnóstico Local (puerto 8090).

Diseñado para correr en el servidor del aula o red local con aislamiento Docker.
"""
from typing import Any, Dict, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_tutor.motor_ia import MOTOR_IA_GLOBAL

app = FastAPI(title="Amatista IA Tutor Local", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SolicitudConsulta(BaseModel):
    pregunta: str
    contexto: Optional[Dict[str, Any]] = None


@app.get("/salud")
def salud():
    return MOTOR_IA_GLOBAL.estado_salud()


@app.post("/consultar")
def consultar(solicitud: SolicitudConsulta):
    return MOTOR_IA_GLOBAL.consultar(solicitud.pregunta, solicitud.contexto)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ai_tutor.servicio:app", host="0.0.0.0", port=8090, reload=False)
