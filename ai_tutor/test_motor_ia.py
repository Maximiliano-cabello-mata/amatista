"""ai_tutor/test_motor_ia.py — Pruebas del motor RAG local y microservicio IA Tutor."""
import pytest
from starlette.testclient import TestClient
from ai_tutor.motor_ia import MotorIALocal, normalizar_texto
from ai_tutor.servicio import app


def test_normalizar_texto():
    assert normalizar_texto("¿Cómo EXTRUYO una cara?") == ["como", "extruyo", "una", "cara"]
    assert normalizar_texto("Bisel con Ctrl+B") == ["bisel", "con", "ctrl+b"]


def test_motor_ia_carga_conocimiento():
    motor = MotorIALocal()
    assert len(motor.fichas) >= 20
    assert len(motor.zonas) >= 5
    salud = motor.estado_salud()
    assert salud["estado"] == "ok"
    assert salud["fichas_cargadas"] >= 20


def test_motor_ia_busqueda_rag_extruir():
    motor = MotorIALocal()
    ficha = motor.buscar_ficha_relevante("como extruyo con E")
    assert ficha is not None
    assert "extrude" in ficha["id"] or "extruir" in ficha["nombre"].lower()


def test_motor_ia_busqueda_rag_corte_bucle():
    motor = MotorIALocal()
    ficha = motor.buscar_ficha_relevante("hacer un corte de bucle con Ctrl+R")
    assert ficha is not None
    assert "loopcut" in ficha["id"] or "corte" in ficha["nombre"].lower()


def test_motor_ia_consulta_rag_directa():
    motor = MotorIALocal()
    res = motor.consultar("¿Cómo extruyo una cara?")
    assert res["ficha"] is not None
    assert "origen" in res
    assert res["origen"] == "ia-rag-local"
    assert len(res["texto"]) > 10


def test_servicio_endpoints():
    cliente = TestClient(app)
    resp_salud = cliente.get("/salud")
    assert resp_salud.status_code == 200
    datos = resp_salud.json()
    assert datos["estado"] == "ok"

    resp_consultar = cliente.post("/consultar", json={"pregunta": "¿Cómo extruyo con E?"})
    assert resp_consultar.status_code == 200
    datos_consulta = resp_consultar.json()
    assert datos_consulta["ficha"] is not None
    assert "texto" in datos_consulta
