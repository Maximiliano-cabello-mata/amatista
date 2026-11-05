# Makefile — Comandos de orquestación y mantenimiento de Amatista

.PHONY: up down restart logs health ia-pull-model test audit clean

up:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

health:
	@echo "==> Verificando API principal:"
	@curl -s http://127.0.0.1:8000/api/salud || echo "API no disponible en localhost:8000"
	@echo "\n==> Verificando IA Tutor:"
	@curl -s http://127.0.0.1:8090/salud || echo "IA Tutor no disponible en localhost:8090"

ia-pull-model:
	docker compose exec ollama ollama pull qwen2.5-coder:3b

audit:
	python3 herramientas/auditoria/estandares_web.py

test-frontend:
	cd frontend && npm run test

test-backend:
	cd backend && python3 -m pytest -q

test: test-frontend test-backend audit
