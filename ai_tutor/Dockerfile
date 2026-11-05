# ai_tutor/Dockerfile — Microservicio de IA local RAG en modo read-only
FROM python:3.11-slim AS ejecutor-ia

RUN groupadd -g 10001 amatista && \
    useradd -u 10001 -g amatista -m -s /usr/sbin/nologin amatista

WORKDIR /app

RUN pip install --no-cache-dir fastapi uvicorn pydantic

COPY --chown=amatista:amatista practices/blender/fichas.json ./practices/blender/fichas.json
COPY --chown=amatista:amatista ai_tutor/ ./ai_tutor/

USER amatista:amatista

EXPOSE 8090
CMD ["uvicorn", "ai_tutor.servicio:app", "--host", "0.0.0.0", "--port", "8090"]
