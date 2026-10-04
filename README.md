# Amatista 💎

**Plataforma educativa para aprender creación 3D con Blender y llevarla a la web (GLB, A-Frame, WebXR), que sigue funcionando sin conexión.**

El alumno avanza por cursos y módulos en una PWA; cada módulo termina con una **práctica en Blender** que el motor **Amatista Engine** revisa y acompaña paso a paso dentro de Blender mediante un add-on. El progreso se guarda primero en el dispositivo y se sincroniza con el servidor (FastAPI + Oracle) cuando hay Internet.

> **Local primero, servicios externos después.** El backend, el add-on y el tutor IA amplían la experiencia; ninguno es requisito para estudiar lo que ya se descargó.

---

## Estado al 4 de octubre de 2026

| Frente | Dónde está |
|---|---|
| **Plataforma v2.2** («Plataforma unificada») | En `main` y en producción con Oracle. El **piloto del 8 de octubre** se hace con ella; faltan servicio con HTTPS, SMTP, prueba de punta a punta y revisión de seguridad (versión `v2.2.0` del [tablero](KANBAN.md)). |
| **v3 «Reestructuración»** | Fase A (niveles, habilidades, versiones de Blender, herramientas de autor) en `main` y con 005 y 006 aplicados en Oracle. Fases B y C (contenido por niveles) sin empezar. [Plan maestro](docs/reestructuracion/00_plan_maestro.md). |
| **Amatista Engine** | Etapa 1 (evalúa) en `main` desde el PR #13; etapa 2 (acompaña paso a paso) en el PR #14. Oracle 007 se aplica después del piloto (T-055). [Documentación](docs/motor/README.md). |
| **Plataforma por módulos** | Sin pestaña Blender: la práctica cierra cada módulo. Estructura fija: Cursos · Mi panel · Admin. [Documentación](docs/plataforma/README.md). |

El estado de cada tarea vive en [KANBAN.md](KANBAN.md) (generado por los commits) y la dirección del proyecto en [PROYECTO.md](PROYECTO.md).

---

## Qué ve cada persona

| Rol | Qué hace en Amatista |
|---|---|
| **Alumno** | Elige un curso, recorre la ruta de cada módulo (lecciones interactivas, práctica en Blender, examen) y ve su nivel, racha e insignias en **Mi panel**. La práctica descarga el add-on, revisa su versión de Blender y vincula su cuenta. |
| **Profesor** | Ve el panel de administración completo en solo lectura: módulos, prácticas, herramientas de enseñanza y alumnos. |
| **Administrador** | Crea módulos con la Fórmula Amatista, edita lecciones con 20 herramientas de enseñanza, publica prácticas de Blender, gestiona usuarios y revisa el estado del sistema y el diagnóstico técnico. |

Detalle por pantalla: [mapa de la plataforma](docs/plataforma/01_mapa_de_la_plataforma.md).

---

## Arquitectura

```text
            Alumno / Profesor / Admin
                       │
              ┌────────▼────────┐        ┌──────────────────────┐
              │   PWA (React)   │        │ Blender + add-on     │
              │ IndexedDB local │        │ Amatista Engine      │
              └────────┬────────┘        └──────────┬───────────┘
                       │  /api                      │  /api/addon/v1
                       └─────────────┬──────────────┘
                              ┌──────▼──────┐
                              │   FastAPI   │
                              └──────┬──────┘
                              ┌──────▼──────┐
                              │   Oracle    │  (SQLite en desarrollo y pruebas)
                              └─────────────┘
```

---

## Estructura del monorepo

```text
amatista/
├── frontend/      PWA React 19 + Vite + Tailwind 4 (frontend/README.md)
│   └── src/       páginas del alumno, panel de administración, lecciones,
│                  data/modulos/*.json (contenido), data/herramientas.js
├── backend/       API FastAPI (backend/README.md)
│   ├── api/       auth, progreso, eventos, contenido, admin, niveles, blender, addon
│   ├── sql/       scripts de Oracle 001–007 (orden en sql/LEEME.txt)
│   └── herramientas/  CLI de contenido (contenido.py) y crear_admin.py
├── engine/        Amatista Engine: motor de prácticas en Python puro (engine/README.md)
├── addon/         add-on de Blender que usa el motor (addon/README.md)
├── practices/     prácticas declarativas amatista.practice/1 (practices/README.md)
├── despliegue/    unidad systemd, Caddy (HTTPS) y actualizar.sh
├── herramientas/  crear-tags.sh
├── tablero/       generador del Kanban (tareas.yml → KANBAN.md) e histórico
├── ai_tutor/      prompts del tutor IA (reservado)
├── docs/          documentación (índice y estado de cada documento: docs/README.md)
├── PROYECTO.md    centro de dirección: qué sigue y dónde está cada cosa
├── KANBAN.md      tablero generado (no se edita a mano)
└── CHANGELOG.md   qué trajo cada versión
```

---

## Base de datos

Oracle Autonomous Database. Los scripts de `backend/sql/` son aditivos y se ejecutan a mano en el orden de [`backend/sql/LEEME.txt`](backend/sql/LEEME.txt) (nunca `001`, que borra las tablas):

- `002` autenticación, contenido y eventos · `003` mantenimiento · `004` usuario de aplicación (opcional);
- `005` niveles, habilidades y versiones de Blender · `006` herramientas de autor (paquete `AMATISTA_AUTOR`);
- `007` motor de prácticas: con él son **18 tablas**.

Producción (3 de octubre): 002, 003, 005 y 006 aplicados (14 tablas); 007 después del piloto (T-055). `backend/diagnostico_oracle.py` compara las tablas con el backend. Paso a paso: [manual de Oracle](docs/reestructuracion/02_manual_oracle.md).

---

## Ejecución local

Requisitos: Node.js, npm, Python 3.12+ y Git.

```bash
git clone https://github.com/Maximiliano-cabello-mata/amatista.git
cd amatista

# Backend con SQLite (sin Oracle)
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements-dev.txt
DATABASE_URL=sqlite:///./amatista_local.db uvicorn main:app --reload

# Frontend, en otra terminal
cd frontend
npm install
npm run dev
```

Comprobaciones (las mismas que corre CI):

```bash
cd backend && python -m pytest -q && python herramientas/contenido.py validar
cd frontend && npm run lint && npm test && npm run build
python -m pytest -q tablero engine/tests addon/tests
```

Servidor y Oracle: [`backend/README.md`](backend/README.md) y [`despliegue/`](despliegue/).

### Variables de entorno

`backend/.env.example` (Oracle o SQLite, CORS, correo, URLs del add-on), `frontend/.env.example` (`VITE_API_URL`) y `.env.example` (tutor IA). Se copian sin el `.example`. Nunca se publican contraseñas, wallets, tokens ni archivos `.env` reales.

---

## Cómo se trabaja

- **Tareas y versiones**: [`tablero/tareas.yml`](tablero/tareas.yml); las tarjetas se mueven con los commits (`T-xxx`, `cierra T-xxx`). [Cómo se usa el tablero](tablero/README.md).
- **Commits**: `type(scope): descripción` ([convención](docs/guias/2026-09-27_convencion_commits.txt)).
- **Ramas**: `main` más una sola rama de trabajo a la vez; todo entra por PR.
- **Versiones**: tags `v*` con `bash herramientas/crear-tags.sh` ([versiones y tablero](docs/guias/2026-10-01_versiones-y-tablero.txt)). Fases: `v0.1.0` prototipo · `v1.0.0` integración · `v2.0.0` plataforma educativa · `v2.2.0-alpha.*` plataforma unificada · `v3.0.0-alpha.*` reestructuración y motor.
- **Bitácora**: cada sesión deja su registro en [`docs/bitacora/`](docs/bitacora/); las fallas, en el [registro de incidencias](docs/incidencias/README.md).

---

## Hacia dónde va

Contenido por niveles («Mi primer espacio 3D»), laboratorio GLB en el navegador, más prácticas de Blender con acompañamiento, especialidades y un tutor IA local (Ollama) como capa opcional. Las ideas grandes entran primero como propuesta fechada en [`docs/propuestas/`](docs/propuestas/) (3D Lab, motor generativo 3D) y solo pasan al tablero con una demostración mínima definida.

## Licencia

Todavía no se define. Cuando se elija, se agrega como `LICENSE` en la raíz.
