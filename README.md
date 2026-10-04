# Amatista 💎

**Plataforma educativa para aprender creación 3D con Blender y llevarla a la web (GLB, A-Frame, WebXR), que sigue funcionando sin conexión.**

El alumno avanza por cursos y módulos en una PWA. Cada módulo termina con una **práctica en Blender** que el motor **Amatista Engine** revisa y acompaña paso a paso dentro de Blender mediante un add-on. El progreso se guarda primero en el dispositivo y se sincroniza con el servidor (FastAPI + Oracle) cuando hay Internet.

> **Local primero, servicios externos después.** El backend, el add-on y el tutor IA amplían la experiencia; ninguno es requisito para estudiar lo que ya se descargó.

**Todo el proyecto en un vistazo:** [índice de la documentación](docs/README.md) · [cronología](docs/historia/01_cronologia.md) · [manual del código](docs/manual-del-codigo/README.md) · [manual del desarrollador](docs/desarrollador/README.md) · [esquema SQL](docs/base-de-datos/README.md) · [tablero](KANBAN.md) · [dirección](PROYECTO.md) · [versiones](CHANGELOG.md)

---

## Contenido

1. [Estado actual](#1-estado-actual)
2. [Cómo llegamos hasta aquí](#2-cómo-llegamos-hasta-aquí)
3. [Qué hace la plataforma](#3-qué-hace-la-plataforma)
4. [Arquitectura](#4-arquitectura)
5. [Estructura del repositorio](#5-estructura-del-repositorio)
6. [Base de datos](#6-base-de-datos)
7. [Tecnologías](#7-tecnologías)
8. [Ejecutar en local](#8-ejecutar-en-local)
9. [Herramientas del desarrollador](#9-herramientas-del-desarrollador)
10. [Cómo se trabaja](#10-cómo-se-trabaja)
11. [Versiones](#11-versiones)
12. [Qué sigue](#12-qué-sigue)
13. [Documentación](#13-documentación)

---

## 1. Estado actual

Al 4 de octubre de 2026 (`main` en `c730c0e`):

| Frente | Dónde está |
|---|---|
| **Plataforma v2.2** («Plataforma unificada») | En `main` y en producción con Oracle. El **piloto del 8 de octubre** se hace con ella. Falta: servicio con HTTPS, SMTP, prueba de punta a punta y revisión de seguridad (versión `v2.2.0` del [tablero](KANBAN.md)). |
| **v3 «Reestructuración»** | Fase A (niveles, habilidades, versiones de Blender, herramientas de autor) en `main`, con los scripts 005 y 006 aplicados en Oracle. Fases B y C (contenido por niveles) sin empezar. [Plan maestro](docs/reestructuracion/00_plan_maestro.md). |
| **Amatista Engine** | Etapa 1 (evalúa) y etapa 2 (acompaña paso a paso) en `main` (PR #13 y #14). **Motor v3** (etapa 3, en PR): add-on 3.0 con pestañas Aprender · Practicar · Mi curso, píldoras de teoría, repaso espaciado, vigilantes y herramientas de autor; probado en Blender 4.2 y 5.0. Oracle 007, 008 y 009 se aplican después del piloto (T-055, T-064). [Documentación](docs/motor/README.md). |
| **Cursos de Blender** | El [plan de estudios](docs/cursos/plan_de_estudios_blender.txt) en dos cursos: **Principiante** y **Principiante-Intermedio**, 3 módulos cada uno, con teoría en la plataforma y una práctica guiada en Blender. Intermedio y Avanzado, próximamente. El curso de la v2 quedó archivado. [Cursos](docs/cursos/README.md). |
| **Dominio** | `amatista-3d.me` (Namecheap, 1 año). Plan con Cloudflare: PWA en `amatista-3d.me` y API en `api.amatista-3d.me` (T-065). [Guía](docs/despliegue/2026-10-04_dominio_amatista-3d.md). |
| **Plataforma por módulos** | Estructura fija **Cursos · Mi panel · Admin**; la práctica de Blender cierra cada módulo. [Documentación](docs/plataforma/README.md). |
| **Documentación** | Organizada por secciones, con historia, manual del código, esquema SQL y manual del desarrollador. [Índice](docs/README.md). |

Contenido (con el motor v3): Blender Principiante y Principiante-Intermedio (6 módulos de 4 lecciones, cada uno con su práctica en Blender) y Módulo 1 de A-Frame publicados. Los módulos de Blender de la v2 están en `frontend/src/data/modulos/archivo/`.

## 2. Cómo llegamos hasta aquí

Amatista nació el **27 de septiembre de 2026** y en ocho días pasó de una pantalla de prueba a una plataforma con cuentas, Oracle, panel de administración y un motor de prácticas dentro de Blender.

| Fecha | Etapa | Qué se logró | Tag |
|---|---|---|---|
| 27 sep | Prototipo | Monorepo, App Shell en React + Tailwind y visor A-Frame | `v0.1.0` |
| 27–28 sep | Integración | La PWA habla con FastAPI y Oracle Autonomous; ORA-01400 y CORS resueltos | `v1.0.0` |
| 28–29 sep | Plataforma educativa | Identidad low poly, «Elige tu curso», Módulo 1, lecciones, progreso offline, backend en el repo | `v2.0.0` |
| 1 oct | Repositorio oficial | `Maximiliano-cabello-mata/amatista`, commits firmados con SSH, tablero Kanban | `v2.0.1` |
| 1–2 oct | Plataforma unificada | Cuentas y roles, Oracle para 20 GB, lecciones interactivas, panel del alumno, panel de administración, CI | `v2.2.0-alpha.1`, `alpha.2` |
| 2–3 oct | Producción | Oracle 23ai en la VM: 002, 003, 005 y 006 aplicados (14 tablas) | — |
| 3 oct | Reestructuración v3 | Niveles, habilidades, versiones de Blender, herramientas de autor en Oracle | `v3.0.0-alpha.1` |
| 3 oct | Amatista Engine | Motor de prácticas, add-on de Blender, instalador por sistema, Oracle 007, la práctica de la mesa | `v3.0.0-alpha.2` |
| 3 oct | Motor etapa 2 | Guía paso a paso, acompañante, «Hazlo conmigo», práctica al cierre de cada módulo | `v3.0.0-alpha.3` |
| 4 oct | Documentación completa | Historia, manuales, esquema SQL, este README | `v3.0.0-alpha.4` |
| 4 oct | Motor v3 y plan de estudios | Add-on 3.0 como aula, 2 cursos y 6 prácticas, herramientas de autor, Oracle 008/009, migración portable y dominio `amatista-3d.me` | `v3.0.0-alpha.5` (propuesto) |

Detalle con hora y commit: [cronología exacta](docs/historia/01_cronologia.md). Cómo se veía la plataforma en cada versión: [la plataforma en cada versión](docs/historia/03_la_plataforma_en_cada_version.md). De dónde salió cada idea: [ideas y cómo se implementaron](docs/historia/02_ideas_y_como_se_implementaron.md).

## 3. Qué hace la plataforma

### Para cada persona

| Rol | Qué hace en Amatista |
|---|---|
| **Alumno** | Elige un curso, recorre la ruta de cada módulo (lecciones interactivas, práctica en Blender, examen) y ve su nivel, racha e insignias en **Mi panel**. Puede estudiar sin cuenta y sin conexión; al crear su cuenta, su progreso local se une a ella. La práctica descarga el add-on, revisa su versión de Blender y vincula su cuenta. |
| **Profesor** | Ve el panel de administración completo en solo lectura: módulos, prácticas, herramientas de enseñanza y alumnos. |
| **Administrador** | Crea módulos con la Fórmula Amatista, edita lecciones con 20 herramientas de enseñanza, publica prácticas de Blender, gestiona usuarios y revisa el estado del sistema y el diagnóstico técnico. |

Detalle por pantalla: [mapa de la plataforma](docs/plataforma/01_mapa_de_la_plataforma.md).

### El recorrido de un módulo

```mermaid
flowchart LR
  A["Lecciones<br/>(Fórmula: gancho, explora,<br/>práctica, reto, jefe final)"] --> B["Práctica en Blender<br/>add-on + Amatista Engine"]
  B --> C["Examen"]
  C --> D["Insignia y XP<br/>Mi panel"]
```

- **20 herramientas de enseñanza** en cuatro categorías: explicar (texto, imagen, video, aviso, código), visualizar (paso a paso, atajos, comparar, tarjetas, línea de tiempo, pipeline, capas), practicar en el navegador (pregunta rápida, ordenar, emparejar, completar, puntos en imagen, explorador 3D, reto de código) y practicar en Blender. [Detalle](docs/plataforma/04_herramientas_de_ensenanza.md).
- **Amatista Engine** lee prácticas declarativas (`amatista.practice/1` y `/2`), comprueba la escena de Blender con 35 validadores, da pistas, en la etapa 2 guía paso a paso, felicita, avisa y ofrece «Hazlo conmigo», y en la etapa 3 enseña teoría en píldoras con repaso espaciado y pausa el progreso cuando algo se rompe. [Detalle](docs/motor/README.md).

## 4. Arquitectura

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
                              │    Caddy    │  HTTPS
                              └──────┬──────┘
                              ┌──────▼──────┐
                              │   FastAPI   │  systemd en una VM de Oracle Cloud
                              └──────┬──────┘
                              ┌──────▼──────┐
                              │   Oracle    │  Autonomous 23ai (SQLite en desarrollo y pruebas)
                              └─────────────┘
```

Las piezas y cómo se conectan, archivo por archivo: [mapa del repositorio](docs/manual-del-codigo/01_mapa_del_repositorio.md).

## 5. Estructura del repositorio

```text
amatista/
├── frontend/      PWA React 19 + Vite 8 + Tailwind 4 → docs/manual-del-codigo/02_frontend.md
│   └── src/       páginas, lecciones, panel, admin, progreso offline, data/modulos/*.json
├── backend/       API FastAPI → docs/manual-del-codigo/03_backend.md
│   ├── api/       auth, sesiones, progreso, eventos, admin, contenido, niveles, blender, addon
│   ├── database/  conexión y modelos SQLAlchemy
│   ├── sql/       scripts de Oracle 001–007 (orden en sql/LEEME.txt)
│   └── herramientas/  contenido.py (CLI de contenido) y crear_admin.py
├── engine/        Amatista Engine, Python puro → docs/manual-del-codigo/04_motor_addon_y_practicas.md
├── addon/         add-on de Blender, constructor del .zip e instaladores por sistema
├── practices/     prácticas declarativas (la mesa del módulo 2)
├── despliegue/    unidad systemd, Caddyfile y actualizar.sh
├── herramientas/  crear-tags.sh
├── tablero/       generador del Kanban (tareas.yml → KANBAN.md) e histórico de la v2
├── ai_tutor/      prompts del tutor IA (reservado)
├── docs/          documentación por secciones → docs/README.md
├── PROYECTO.md    centro de dirección: qué sigue y por qué
├── KANBAN.md      tablero generado (no se edita a mano)
└── CHANGELOG.md   qué trajo cada versión
```

## 6. Base de datos

Oracle Autonomous Database 23ai en producción (esquema `ADMIN`); SQLite en desarrollo y en todas las pruebas. Los scripts de `backend/sql/` son aditivos y se ejecutan a mano en Database Actions en el orden de [`backend/sql/LEEME.txt`](backend/sql/LEEME.txt). Nunca se ejecuta `001` sobre una base con datos (borra las tablas).

| Script | Qué agrega |
|---|---|
| `001` | Esquema inicial (instalación desde cero) |
| `002` | Autenticación, contenido y eventos |
| `003` | Mantenimiento (purga) |
| `004` | Usuario de aplicación `AMATISTA_APP` (opcional) |
| `005` | Niveles, habilidades, rúbrica y versiones de Blender |
| `006` | Vistas y paquete `AMATISTA_AUTOR` para autores |
| `007` | Motor de prácticas: con él son **18 tablas** |
| `008` | Cursos por ruta: `CURSOS.RUTA` y `CURSOS.REQUISITO_ID` |
| `009` | Archiva el curso `blender` de la v2 (no borra el progreso) |

Producción: 002, 003, 005 y 006 aplicados (14 tablas); 007, 008 y 009 después del piloto (T-055, T-064). Para cambiar de base algún día, `backend/herramientas/migrar.py` exporta e importa en JSONL y genera el esquema para PostgreSQL ([migración](docs/base-de-datos/03_migracion.md)). `backend/diagnostico_oracle.py` compara las tablas reales con las que espera el backend. Diagrama entidad-relación y cada columna: [esquema SQL](docs/base-de-datos/esquema.md).

## 7. Tecnologías

| Capa | Herramientas |
|---|---|
| PWA | React 19, Vite 8, Tailwind CSS 4, vite-plugin-pwa, IndexedDB, A-Frame 1.8, Vitest, ESLint |
| API | FastAPI, Uvicorn, SQLAlchemy 2, python-oracledb, PBKDF2, SMTP, pytest |
| Datos | Oracle Autonomous Database 23ai, SQLite, PL/SQL (`AMATISTA_AUTOR`) |
| Blender | Blender 4.2+ (extensión, probada en 4.2 y 5.0), add-on Amatista 3.0.0, Amatista Engine (Python puro) |
| Servidor | VM de Oracle Cloud, systemd, Caddy (HTTPS con Let's Encrypt) |
| Proceso | GitHub, GitHub Actions (CI y tablero), commits firmados con SSH |

Para qué sirve cada una y dónde está: [herramientas que usa la plataforma](docs/herramientas-de-la-plataforma.md).

## 8. Ejecutar en local

Requisitos: Node.js 22, npm, Python 3.12 y Git.

```bash
git clone https://github.com/Maximiliano-cabello-mata/amatista.git
cd amatista

# Backend con SQLite (sin Oracle)
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements-dev.txt
DATABASE_URL=sqlite:///./amatista_local.db AMATISTA_MOSTRAR_CODIGOS=1 uvicorn main:app --reload

# Frontend, en otra terminal
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

> Copia `frontend/.env`: sin `VITE_API_URL`, la PWA usa por defecto la dirección del servidor de producción que está escrita en `frontend/src/services/api.js`.

Para tener un administrador: desde `backend/`, `DATABASE_URL=sqlite:///./amatista_local.db python herramientas/crear_admin.py tu-correo@ejemplo.com --crear` (crea la cuenta y pide la contraseña), o pon `AMATISTA_ADMINS=tu-correo@ejemplo.com` antes de registrarte. Variables de entorno: `backend/.env.example`, `frontend/.env.example` y `.env.example`. Nunca se suben contraseñas, wallets, tokens ni archivos `.env` reales.

Comprobaciones (las mismas que corre CI):

```bash
cd backend && python -m pytest -q && python herramientas/contenido.py validar && cd ..
cd frontend && npm run lint && npm test && npm run build && cd ..
python -m pytest -q tablero engine/tests addon/tests
```

Paso a paso: [entorno local](docs/desarrollador/01_entorno_local.md). Servidor: [despliegue en OCI](docs/despliegue/2026-10-04_despliegue_oci.md).

## 9. Herramientas del desarrollador

| Herramienta | Para qué |
|---|---|
| `backend/herramientas/contenido.py` | Validar, importar, exportar y crear módulos y lecciones; niveles; publicar prácticas |
| `backend/herramientas/crear_admin.py` | Dar el rol de administrador a una cuenta |
| `backend/diagnostico_oracle.py` | Comparar las tablas de Oracle con el backend |
| `engine/herramientas/practicas.py` | Crear, revisar, probar y simular prácticas sin Blender; mapa del plan de estudios |
| `engine/demo.py` | Probar el motor sin Blender |
| `backend/herramientas/migrar.py` | Respaldo JSONL, carga en otra base y esquema para PostgreSQL |
| `addon/herramientas/construir.py` | Construir el `.zip` del add-on y los paquetes por sistema |
| `tablero/actualizar.py` | Regenerar `KANBAN.md` |
| `herramientas/crear-tags.sh` | Crear los tags de versión |
| `despliegue/actualizar.sh` | Actualizar la API en la VM con prueba de salud y reversión |
| Admin › Estado › Diagnóstico técnico | Revisar backend, base de datos y visor 3D desde la PWA |
| Modo Desarrollador del add-on (Amatista Author) | Crear y probar prácticas dentro de Blender |

Todas, con cada opción y ejemplos: [manual del desarrollador](docs/desarrollador/README.md).

## 10. Cómo se trabaja

- **Ramas**: `main` más una sola rama de trabajo a la vez; todo entra por PR y Maximiliano decide cada fusión.
- **Commits**: `type(scope): descripción` ([convención](docs/guias/2026-09-27_convencion_commits.txt)), firmados con SSH.
- **Tareas**: [`tablero/tareas.yml`](tablero/tareas.yml); las tarjetas se mueven con los commits (`T-xxx`, `cierra T-xxx`) y [KANBAN.md](KANBAN.md) se regenera solo.
- **Bitácora**: cada sesión deja su registro en [`docs/bitacora/`](docs/bitacora/); las fallas, en el [registro de incidencias](docs/incidencias/README.md).
- **Base de datos**: cambios de esquema solo con scripts nuevos y aditivos (`010` en adelante), ejecutados antes del código que los necesita.

Flujo completo y checklist antes de un PR: [flujo de trabajo](docs/desarrollador/05_flujo_de_trabajo.md).

## 11. Versiones

Tags `v*` con `bash herramientas/crear-tags.sh` desde la computadora de Maximiliano (la nube no puede publicar tags). Publicados: `v0.1.0`, `v1.0.0`, `v2.0.0`, `v2.0.1`, `v2.2.0-alpha.1`. Preparados en el script: `v2.2.0-alpha.2` y `v3.0.0-alpha.1` a `v3.0.0-alpha.4`; `v3.0.0-alpha.5` (motor v3) se agrega al fusionar. Qué trajo cada una: [CHANGELOG.md](CHANGELOG.md).

## 12. Qué sigue

1. **Piloto del 8 de octubre** con la v2.2: servicio y HTTPS (T-003, T-005), SMTP (T-032), seguridad y prueba de punta a punta (T-029, T-030).
2. **Después del piloto**: Oracle 007 (T-055), 008 y 009 con los cursos nuevos (T-064), dominio con Cloudflare (T-065), instalador en Windows y Mac reales (T-056) y el add-on 3.0 con alumnos (T-066).
3. **Fase B de la v3**: decidir la versión LTS de Blender (T-038), pasar el contenido a niveles y el mapa de niveles en la PWA.
4. **Más adelante**: «Mi primer espacio 3D», laboratorio GLB, especialidades y un tutor IA local (Ollama) como capa opcional.

Las ideas grandes entran primero como propuesta fechada en [`docs/propuestas/`](docs/propuestas/). Orden vigente y razones: [PROYECTO.md](PROYECTO.md).

## 13. Documentación

| Sección | Qué encuentras |
|---|---|
| [Historia](docs/historia/README.md) | Cronología exacta, ideas y cómo se implementaron, la plataforma en cada versión |
| [Plataforma](docs/plataforma/README.md) | Qué ve cada rol, módulos con práctica, etiquetas, herramientas de enseñanza, panel |
| [Amatista Engine](docs/motor/README.md) | Etapas del motor y referencia técnica del add-on |
| [Manual del código](docs/manual-del-codigo/README.md) | Frontend, backend, motor y add-on explicados con recetas |
| [Manual del desarrollador](docs/desarrollador/README.md) | Entorno, herramientas, pruebas, CI y flujo de trabajo |
| [Base de datos](docs/base-de-datos/README.md) | Esquema SQL completo y diagrama entidad-relación |
| [Herramientas de la plataforma](docs/herramientas-de-la-plataforma.md) | Tecnologías y servicios |
| [Despliegue](docs/despliegue/2026-10-04_despliegue_oci.md) | Servidor, HTTPS y actualizaciones |
| [Dirección](docs/reestructuracion/00_plan_maestro.md) | Plan maestro, arquitectura, propuestas, lanzamiento |
| [Registros](docs/bitacora/) | Bitácora de cada sesión e incidencias |

## Licencia

La plataforma todavía no tiene licencia definida; cuando se elija, se agrega como `LICENSE` en la raíz. El add-on de Blender (`addon/`) se declara GPL-3.0-or-later en su manifiesto porque usa `bpy`.
