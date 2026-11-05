"""ai_tutor/motor_ia.py — Motor RAG local y diagnóstico 3D para Blender y WebXR.

Indexa las fichas de herramientas de practices/blender/fichas.json y conecta
opcionalmente con un LLM local (Ollama) sin depender de servicios externos.
"""
import json
import logging
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional

log = logging.getLogger("amatista.ai_tutor")


def normalizar_texto(texto: str) -> List[str]:
    """Limpia y tokeniza texto para coincidencia semántica básica."""
    texto = texto.lower()
    for acento, normal in [("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ú", "u"), ("ñ", "n")]:
        texto = texto.replace(acento, normal)
    tokens = re.findall(r"[a-z0-9+]+", texto)
    return [t for t in tokens if len(t) > 1]


class MotorIALocal:
    def __init__(
        self,
        ruta_fichas: Optional[Path] = None,
        url_llm: Optional[str] = None,
        modelo_llm: str = "qwen2.5-coder:3b",
    ):
        self.url_llm = url_llm or os.getenv("AMATISTA_LLM_URL", "http://ollama:11434")
        self.modelo_llm = modelo_llm or os.getenv("AMATISTA_LLM_MODELO", "qwen2.5-coder:3b")

        if ruta_fichas is None:
            # Buscar practices/blender/fichas.json desde la raíz del repo
            raiz = Path(__file__).resolve().parent.parent
            self.ruta_fichas = raiz / "practices" / "blender" / "fichas.json"
        else:
            self.ruta_fichas = ruta_fichas

        self.fichas: List[Dict[str, Any]] = []
        self.zonas: Dict[str, Dict[str, Any]] = {}
        self.cargar_conocimiento()

    def cargar_conocimiento(self) -> None:
        """Carga e indexa en memoria las fichas técnicas oficiales."""
        if not self.ruta_fichas.exists():
            log.warning("No se encontró fichas.json en %s", self.ruta_fichas)
            return

        try:
            with open(self.ruta_fichas, "r", encoding="utf-8") as f:
                datos = json.load(f)
            self.fichas = datos.get("fichas", [])
            self.zonas = {z["id"]: z for z in datos.get("zonas", [])}
            log.info("Motor IA cargó %d fichas y %d zonas de Blender", len(self.fichas), len(self.zonas))
        except Exception as err:
            log.error("Error al cargar conocimiento 3D: %s", err)

    def buscar_ficha_relevante(self, pregunta: str) -> Optional[Dict[str, Any]]:
        """Recupera la ficha técnica más afín a la pregunta (RAG local)."""
        tokens_pregunta = set(normalizar_texto(pregunta))
        if not tokens_pregunta:
            return None

        mejor_ficha = None
        max_puntaje = 0

        for ficha in self.fichas:
            puntaje = 0
            texto_ficha = f"{ficha.get('id', '')} {ficha.get('nombre', '')} {ficha.get('ingles', '')} {ficha.get('para_que', '')} {ficha.get('error', '')}"
            tokens_ficha = set(normalizar_texto(texto_ficha))

            for t_preg in tokens_pregunta:
                for t_ficha in tokens_ficha:
                    if t_preg == t_ficha:
                        puntaje += 3
                    elif len(t_preg) >= 4 and len(t_ficha) >= 4 and (t_preg.startswith(t_ficha[:4]) or t_ficha.startswith(t_preg[:4])):
                        puntaje += 2

            # Bonificación si coincide con teclas o atajos directos (evitando colisión de letras sueltas)
            for tecla in ficha.get("teclas", []):
                t = tecla.lower()
                if "+" in t:
                    if t in pregunta.lower():
                        puntaje += 5
                else:
                    if re.search(rf"\b{re.escape(t)}\b", pregunta, re.IGNORECASE):
                        puntaje += 4

            if puntaje > max_puntaje:
                max_puntaje = puntaje
                mejor_ficha = ficha

        return mejor_ficha if max_puntaje >= 2 else None

    def consultar_llm(self, prompt: str, timeout: float = 2.5) -> Optional[str]:
        """Consulta Ollama local si está disponible con timeout estricto."""
        if not self.url_llm:
            return None

        endpoint = f"{self.url_llm.rstrip('/')}/api/generate"
        payload = {
            "model": self.modelo_llm,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.2, "num_predict": 120},
        }

        try:
            req = urllib.request.Request(
                endpoint,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                resultado = json.loads(resp.read().decode("utf-8"))
                return resultado.get("response", "").strip()
        except Exception:
            return None

    def consultar(self, pregunta: str, contexto: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Responde la duda del estudiante combinando RAG + LLM local (o RAG directo)."""
        ficha = self.buscar_ficha_relevante(pregunta)

        if not ficha:
            return {
                "texto": "No encontré una herramienta exacta para esa consulta. Revisa el catálogo de lecciones o prueba consultar por atajo (como E, G, R, S o Ctrl+R).",
                "ficha": None,
                "zona": None,
                "origen": "ia-rag-local",
            }

        zona_info = self.zonas.get(ficha.get("zona", ""), {})
        zona_nombre = zona_info.get("nombre", ficha.get("zona", ""))

        # Generar respuesta contextual RAG
        teclas = ", ".join(ficha.get("teclas", []))
        atajo_str = f" (Atajo: {teclas})" if teclas else ""
        pasos = " ".join(ficha.get("como", []))

        # Intentar síntesis con LLM si responde en tiempo
        prompt = (
            f"Eres el tutor de Blender y 3D de Amatista. Responde en 2 oraciones breves y claras al alumno.\n"
            f"Pregunta: {pregunta}\n"
            f"Herramienta: {ficha.get('nombre')}{atajo_str}\n"
            f"Dónde: {zona_nombre}\n"
            f"Para qué: {ficha.get('para_que')}\n"
            f"Error típico: {ficha.get('error')}\n"
            f"Pasos: {pasos}"
        )

        respuesta_llm = self.consultar_llm(prompt)
        if respuesta_llm and len(respuesta_llm) > 20:
            texto_final = respuesta_llm
        else:
            texto_final = (
                f"{ficha.get('nombre')}{atajo_str} en {zona_nombre}: {ficha.get('para_que')} "
                f"Cuidado común: {ficha.get('error')}"
            )

        return {
            "texto": texto_final,
            "ficha": ficha.get("id"),
            "nombre": ficha.get("nombre"),
            "zona": zona_nombre,
            "error_tipico": ficha.get("error"),
            "origen": "ia-rag-local",
        }

    def estado_salud(self) -> Dict[str, Any]:
        """Reporta la disponibilidad del motor RAG y LLM local."""
        return {
            "estado": "ok",
            "fichas_cargadas": len(self.fichas),
            "zonas_cargadas": len(self.zonas),
            "llm_url": self.url_llm,
            "llm_modelo": self.modelo_llm,
        }


MOTOR_IA_GLOBAL = MotorIALocal()
