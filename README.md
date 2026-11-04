# Amatista 💎

**🌐 Plataforma pública: [https://amatista-3d.tech](https://amatista-3d.tech)** · **API: [https://api.amatista-3d.tech](https://api.amatista-3d.tech)** · [Guía del despliegue público (Cloudflare Workers + Oracle Cloud)](docs/despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md)

> **Despliegue verificado con registros del 23 de octubre de 2026; código en `main` actualizado al 2 de noviembre de 2026 (`99d6ea2`).** La PWA pública utiliza Cloudflare Workers; la API funciona en Oracle Cloud con Caddy y Oracle Database. El dominio anterior `.me` es histórico. SMTP, las migraciones `007`–`013` en producción y las pruebas con ventana en Blender siguen pendientes.

> **Hack4Edu 2026:** la etiqueta `hack4edu` separa lo que ya teníamos de lo construido durante la competencia. Requisitos, evidencia comprobable y el kit del video: **[docs/hack4edu/](docs/hack4edu/README.md)**.

**Plataforma educativa para aprender creación 3D con Blender y llevarla a la web (GLB, A-Frame, WebXR), que sigue funcionando sin conexión.**

El alumno avanza por cursos y módulos en una PWA. Cada módulo de Blender combina exploración interactiva, teoría visual con fichas de herramientas y un **proyecto práctico en Blender** que **Amatista Engine** (**Corazón Amatista 1.0** + **Amatista Motor 7.1 «Guion»**) evalúa y acompaña paso a paso dentro de Blender mediante un add-on. El progreso se guarda primero en el dispositivo y se sincroniza en una sola petición comprimida con el servidor (FastAPI + Oracle) cuando hay Internet.

> **Local primero, servicios externos después.** El backend, el add-on y el asistente Goliat amplían la experiencia; ninguno es requisito para estudiar lo que ya se descargó.

**Todo el proyecto en un vistazo:** [índice de la documentación](docs/README.md) · [cronología](docs/historia/01_cronologia.md) · [mapa del repositorio](docs/manual-del-codigo/01_mapa_del_repositorio.md) · [manual del código](docs/manual-del-codigo/README.md) · [manual del desarrollador](docs/desarrollador/README.md) · [esquema SQL](docs/base-de-datos/README.md) · [tablero](KANBAN.md) · [dirección](PROYECTO.md) · [versiones](CHANGELOG.md)

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

## 1. Estado actual

Código revisado al **2 de noviembre de 2026** (`main` en `99d6ea2`):

| Frente | Dónde está |
|---|---|
| **Producción** | Verificada en `amatista-3d.tech` (Cloudflare Workers) y `api.amatista-3d.tech` (Oracle Cloud + Caddy + FastAPI + Oracle). [Bitácora pública](docs/despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md). La fusión en `main` no implica despliegue automático en la VM. |
| **Corazón Amatista 1.0 y Motor 7.1** | Núcleo determinista en Python puro (`engine/amatista_engine/corazon/`, contrato `amatista.corazon/1`) con director, andamio por herramienta, señales comprobadas cada 0,5 s, perfiles (Blender y A-Frame estables; Maya y 3ds Max en borrador) y ramas con herencia (`practices/ramas/`). Add-on **Amatista Motor 7.1** (`addon/amatista_blender/guion/` y `corazon/`): pasos con verbo evaluados por el estado real de la escena (99/100 alumnos simulados completan el tren). [Corazón](docs/motor/referencia/23_corazon.md) · [Motor 7 Guion](docs/motor/referencia/22_motor_7.md). |
| **Amatista Taller y Fichas (Motor 5 a 6.2)** | 33 habilidades en 9 talleres (`practices/blender/habilidades.json`), 26 fichas de herramientas y 9 zonas de Blender (`practices/blender/fichas.json`), termómetro de ánimo, autosanación de copias instaladas, plantilla «Blender Amatista», enlace `amatista://` e instaladores `.exe` y `.deb`. [Motor 6.2](docs/motor/referencia/21_motor_6_2.md) · [Motor 6.1](docs/motor/referencia/20_motor_6_1.md) · [Motor 6](docs/motor/referencia/19_motor_6.md). |
| **Cursos publicados (15 módulos)** | **Blender** en tres niveles publicados (**Principiante**, **Principiante-Intermedio** e **Intermedio**: 9 módulos, 9 talleres y 9 prácticas de proyecto; **Avanzado** bloqueado) y **A-Frame** en dos cursos (**Inicial** con 3 módulos e **Interactivo** con 3 módulos, incluido «Mundos con el Motor Amatista» y WebXR). [Ruta de Blender](docs/cursos/03_ruta_de_aprendizaje_blender.md) · [Camino y Motor Web](docs/plataforma/13_camino_graficos_y_motor_web.md). |
| **Estudio A-Frame y Motor Web** | Editor libre en `#/estudio` con vista 3D en vivo, 8 plantillas, piezas insertables, modelos GLB low poly offline y el Motor Web (`frontend/src/motor3d/`) para entornos generados, objetos arrastrables y retos. [Multiplataforma](docs/plataforma/12_multiplataforma_y_accesible.md). |
| **Goliat, Avatares y Buzón** | **Goliat** (`frontend/src/goliat/`), compañero low poly basado en reglas locales que apoya cuando una práctica se complica y guía proyectos propios; **avatares low poly** por cuenta (con el pavo real exclusivo del creador) y **Buzón del creador** (`#/buzon`, SQL `013`). [Goliat](docs/plataforma/15_goliat.md) · [Avatares y buzón](docs/plataforma/16_avatares_y_buzon.md). |
| **Escuelas con pocos datos y Sentry** | Sincronización en una sola petición comprimida con gzip (`POST /api/sincronizar`), reintentos con espera creciente, carga incremental (`GET /api/progreso?desde=`) y modo «Ahorro de datos». Observabilidad opcional con Sentry sin datos personales (`backend/observabilidad.py`). [Pocos datos](docs/plataforma/17_pocos_datos.md) · [Sentry](docs/despliegue/2026-10-31_sentry.md). |
| **Centro 3D y G7B (v3.5.0)** | Integración planificada con el repositorio hermano [amatista-g7b-etl](https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl) para adaptar perfiles (N0–N4) y prácticas al equipo del alumno como proyecto de estadía, manteniendo los datos personales exclusivamente en Amatista. [Propuesta](docs/propuestas/2026-11-01_centro_3d_y_g7b.md). |

## 2. Cómo llegamos hasta aquí

Amatista nació el **27 de septiembre de 2026** y en cinco semanas evolucionó de un prototipo a una plataforma educativa multiplataforma con su propio motor 3D declarativo.

| Fecha | Etapa | Qué se logró | Tag / Hito |
|---|---|---|---|
| 27 sep | Prototipo | Monorepo, App Shell en React + Tailwind y visor A-Frame | `v0.1.0` |
| 27–28 sep | Integración | La PWA habla con FastAPI y Oracle Autonomous; ORA-01400 y CORS resueltos | `v1.0.0` |
| 28–29 sep | Plataforma educativa | Identidad low poly, «Elige tu curso», Módulo 1, lecciones, progreso offline | `v2.0.0` |
| 1–2 oct | Plataforma unificada | Cuentas y roles, Oracle para 20 GB, bloques interactivos, panel del alumno, Admin y CI | `v2.2.0-alpha.2` |
| 3–4 oct | Reestructuración y Amatista Engine | Niveles, habilidades, Amatista Engine (etapas 1 a 3), add-on 3.0 y plan de estudios | `v3.0.0-alpha.1` a `alpha.6` |
| 5–10 oct | Seguridad, enlace en vivo y ejemplo | Auditoría (1,449 ataques), reconocimiento de figura y silueta, enlace en vivo (SQL 010/011) y «el ejemplo manda» | `v3.0.0-alpha.7` a `alpha.10` |
| 10–11 oct | Amatista Taller, Auditoría y Facetas | Motor 5 (aprendizaje por habilidades, SQL 012), auditoría de 270 commits, recorrido guiado y CSS «Facetas» | `alpha.11` a `alpha.15` |
| 21–29 oct | Multiplataforma, Motor Web y `.tech` | Estudio A-Frame (`#/estudio`), Motor Web 3D, 6 módulos de A-Frame y despliegue en `amatista-3d.tech` | PR #37 a #39 |
| 30–31 oct | Motores 6 a 7.1, Corazón, Goliat y Pocos datos | Blender Amatista, fichas (`fichas.json`), Goliat, avatares y buzón (SQL 013), ahorro de datos, Motor 7 «Guion» y **Corazón Amatista 1.0** | PR #41 a #50 |
| 1–2 nov | Centro 3D y G7B | Diseño de perfiles por hardware (N0–N4) y experimento de estadía conectado con `amatista-g7b-etl` | `v3.5.0` |

Detalle con hora y commit: [cronología exacta](docs/historia/01_cronologia.md). Cómo se veía la plataforma en cada versión: [la plataforma en cada versión](docs/historia/03_la_plataforma_en_cada_version.md).

## 3. Qué hace la plataforma

### Para cada persona

| Rol | Qué hace en Amatista |
|---|---|
| **Alumno** | Sigue el camino guiado de **Blender** (9 módulos) y **A-Frame** (6 módulos), practica en el **Estudio A-Frame** (`#/estudio`), recibe apoyo de **Goliat**, elige su avatar low poly, escribe al **Buzón del creador** (`#/buzon`) y consulta su avance en **Mi panel**. Funciona sin cuenta y sin conexión; al registrarse, fusiona su progreso local. |
| **Profesor** | Consulta el panel de administración en solo lectura: resumen, módulos, prácticas, herramientas, auditoría y alumnos. |
| **Administrador** | Crea y publica módulos con la Fórmula Amatista, edita lecciones con más de 25 bloques interactivos y gráficos, responde el buzón del creador, audita contenido y practica en Blender sin guardar progreso (cada sesión arranca de cero). |

Detalle por pantalla: [mapa de la plataforma](docs/plataforma/01_mapa_de_la_plataforma.md).

## 4. Arquitectura

```text
             Alumno / Profesor / Admin
                        │
               ┌────────▼────────┐        ┌──────────────────────────┐
               │   PWA (React)   │        │ Blender + add-on 7.1     │
               │ IndexedDB local │        │ Corazón + Amatista Engine│
               └────────┬────────┘        └────────────┬─────────────┘
                        │  /api (/sincronizar gzip)    │  /api/addon/v1
                        │                              │  (/enlace, /ordenes, /habilidades)
                        └──────────────┬───────────────┘
                                ┌──────▼──────┐
                                │ Cloudflare  │  Workers (PWA) + Proxy HTTPS
                                └──────┬──────┘
                                ┌──────▼──────┐
                                │    Caddy    │  Certificado de origen
                                └──────┬──────┘
                                ┌──────▼──────┐
                                │   FastAPI   │  systemd en VM de Oracle Cloud
                                └──────┬──────┘
                                ┌──────▼──────┐
                                │   Oracle    │  Autonomous 23ai (SQLite en local y CI)
                                └─────────────┘
```

Las piezas y cómo se conectan, archivo por archivo: [mapa del repositorio](docs/manual-del-codigo/01_mapa_del_repositorio.md).

## 5. Estructura del repositorio

```text
amatista/
├── frontend/                  PWA React 19 + Vite 8 + Tailwind 4 (310 archivos en src/)
│   ├── src/pages/             Inicio, Curso, Leccion, Estudio, Panel, Blender, Vincular, Guia, Buzon, cuenta/*, admin/*
│   ├── src/components/        estructura/ (Facetas), leccion/, modulo/, panel/, admin/, etiquetas/, graficas/
│   ├── src/motor3d/           Motor Web de Amatista sobre A-Frame (escenas, física ligera, retos)
│   ├── src/estudio/           Estudio A-Frame (#/estudio): plantillas, piezas y modelos GLB offline
│   ├── src/goliat/            Goliat: asistente por reglas en el navegador y proyectos guiados
│   ├── src/avatares/          Avatares low poly por cuenta (zorro, búho, ajolote… y pavo real del creador)
│   ├── src/buzon/             Cliente del buzón del creador
│   ├── src/progreso/          Sincronización offline-first, compresión gzip y modo Ahorro de datos
│   └── src/data/modulos/      15 módulos publicados en JSON (9 de Blender + 6 de A-Frame) y archivo/
├── backend/                   API FastAPI + SQLAlchemy 2 (82 archivos)
│   ├── api/                   14 routers: auth, sesiones, progreso, eventos, sincronizar, admin, contenido,
│   │                          niveles, blender, addon, enlace, taller, perfil, buzon
│   ├── contenido/             Motor de validación, plantillas y cálculo de Amatista Taller en servidor
│   ├── database/              Conexión dual (Oracle / SQLite) y 24 tablas en modelos.py
│   ├── sql/                   Scripts aditivos de Oracle 001–013 (orden en sql/LEEME.txt)
│   ├── herramientas/          contenido.py, crear_admin.py, migrar.py, auditoria_seguridad.py, rendimiento.py, verificar_licencia.py
│   └── observabilidad.py      Integración opcional con Sentry sin datos personales
├── engine/                    Amatista Engine en Python puro, sin bpy (129 archivos)
│   ├── amatista_engine/
│   │   ├── corazon/           Corazón Amatista 1.0 (amatista.corazon/1): director, andamio, señales, perfiles y ramas
│   │   ├── guion/             Motor 7 «Guion»: pasos con verbo, pistas reales y evaluación sin orden fijo
│   │   ├── taller/            Motor 5 «Amatista Taller»: habilidades BKT, molde, demostraciones y repaso Leitner
│   │   ├── ruta/              Motor 4: ruta de misiones y medidas amables por nivel
│   │   ├── validators/        43 validadores declarativos (incluidos example.matches y taller.molde)
│   │   ├── figures/           Reconocimiento geométrico de piezas (recognize) y silueta en malla única (silhouette)
│   │   ├── ejemplo/           Construcción y comparación autónoma contra el ejemplo resuelto
│   │   └── blender/           Adaptador de captura de escena con bpy
│   └── herramientas/          corazon.py, practicas.py, referencias.py, formato_json.py, run_in_blender.py
├── addon/                     Extensión Amatista Motor 7.1.0 para Blender 4.2+ (101 archivos)
│   ├── amatista_blender/      corazon/, guion/, taller/, interfaz/, plantilla_amatista/, fichas.py, protocolo.py, saneamiento.py…
│   ├── herramientas/          construir.py, generar_iconos.py, generar_splash.py, instaladores.py (.exe y .deb)
│   └── tests/                 Pruebas unitarias, en_blender.py y simular_alumnos.py (100 alumnos)
├── practices/                 Contenido declarativo del motor
│   ├── blender/               9 prácticas de proyecto, cursos.json, habilidades.json, fichas.json, palabras.json, temas.json
│   ├── ramas/                 Ramas del Corazón (blender-principiante.json, blender-reto.json, aframe-web.json)
│   └── archivo/               Prácticas exploratorias anteriores y archivo v2
├── despliegue/                amatista-api.service, Caddyfile y actualizar.sh
├── tablero/                   tareas.yml, generador actualizar.py e histórico de la v2
├── herramientas/              crear-tags.sh
├── ai_tutor/                  Carpeta reservada para prompts del tutor IA
├── docs/                      214 documentos organizados en 10 secciones → docs/README.md
├── wrangler.jsonc             Configuración de compilación y despliegue en Cloudflare Workers
├── PROYECTO.md                Centro de dirección: prioridades y reglas de trabajo
├── KANBAN.md                  Tablero generado automáticamente desde tareas.yml y git log
└── CHANGELOG.md               Historial detallado de entregas
```

## 6. Base de datos

Oracle Autonomous Database 23ai en producción (esquema `ADMIN`); SQLite en desarrollo y en todas las pruebas. Los scripts de `backend/sql/` son aditivos e idempotentes y se ejecutan en el orden de [`backend/sql/LEEME.txt`](backend/sql/LEEME.txt). Nunca se ejecuta `001` sobre una base con datos.

| Script | Qué agrega |
|---|---|
| `001` | Esquema inicial (solo instalación desde cero) |
| `002` | Autenticación, contenido y eventos particionados |
| `003` | Mantenimiento (purga diaria y vista `V_AMATISTA_ESPACIO`) |
| `004` | Usuario de aplicación `AMATISTA_APP` con permisos mínimos (opcional, T-004) |
| `005` | Niveles, habilidades, rúbrica y versiones de Blender |
| `006` | Vistas y paquete PL/SQL `AMATISTA_AUTOR` |
| `007` | Motor de prácticas (`ADDON_VINCULOS`, `PRACTICAS`, `PRACTICA_VERSIONES`, `PROGRESO_PRACTICAS`: **18 tablas**) |
| `008` | Cursos por ruta (`CURSOS.RUTA` y `CURSOS.REQUISITO_ID`) |
| `009` | Archiva el curso `blender` de la v2 sin borrar progreso |
| `010` | Enlace en vivo con Blender (`ADDON_ENLACES` y `ADDON_AJUSTES`: **20 tablas**) |
| `011` | Detalle del instructor compartido entre procesos (`ADDON_ENLACES.DETALLE`) |
| `012` | Amatista Taller: modelo BKT por habilidad y `TALLERES_ALUMNO` (**21 tablas**) |
| `013` | Avatares y buzón del creador (`PERFILES`, `SUGERENCIAS`, `SUGERENCIA_MENSAJES`: **24 tablas**) |

Para verificar el estado real en el servidor se ejecuta `python diagnostico_oracle.py`, que compara las 24 tablas esperadas en `backend/database/modelos.py` contra Oracle. Para migrar o respaldar en JSONL/PostgreSQL se usa `backend/herramientas/migrar.py` ([migración](docs/base-de-datos/03_migracion.md)).

## 7. Tecnologías

| Capa | Herramientas |
|---|---|
| PWA | React 19, Vite 8, Tailwind CSS 4, vite-plugin-pwa, IndexedDB, A-Frame 1.8, `@sentry/react` (opcional), Vitest, ESLint |
| API | FastAPI, Uvicorn, SQLAlchemy 2, python-oracledb, PBKDF2, compresión GZip bidireccional, `sentry-sdk` (opcional), pytest |
| Datos | Oracle Autonomous Database 23ai (24 tablas), SQLite, PL/SQL (`AMATISTA_AUTOR`) |
| Blender | Blender 4.2+ (probado en 4.2 y 5.0), add-on **Amatista Motor 7.1.0**, **Corazón Amatista 1.0** y **Amatista Engine** (Python puro) |
| Servidor | Cloudflare Workers (PWA), VM en Oracle Cloud, systemd, Caddy y Cloudflare SSL (Full strict) |
| Proceso | GitHub Actions (CI, instaladores y tablero), commits firmados con SSH |

## 8. Ejecutar en local

Requisitos: Node.js 22, npm, Python 3.12 y Git.

```bash
git clone https://github.com/Maximiliano-cabello-mata/amatista.git
cd amatista

# Backend con SQLite (crea las 24 tablas automáticamente)
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

Comprobaciones completas (las mismas que ejecuta CI):

```bash
cd backend && python -m pytest -q && python herramientas/contenido.py validar && cd ..
cd frontend && npm run lint && npm test && npm run build && cd ..
python -m pytest -q tablero engine/tests addon/tests
```

## 9. Herramientas del desarrollador

| Herramienta | Para qué |
|---|---|
| `backend/herramientas/contenido.py` | Validar, importar, exportar y crear módulos y lecciones; niveles; publicar prácticas |
| `backend/herramientas/crear_admin.py` | Dar el rol de administrador a una cuenta |
| `backend/diagnostico_oracle.py` | Comparar las 24 tablas de Oracle con `modelos.py` |
| `engine/herramientas/corazon.py` | Inspeccionar ramas, perfiles, extensiones y simular turnos del Corazón Amatista sin Blender |
| `engine/herramientas/practicas.py` | Crear, revisar, probar (58 casos) y simular prácticas sin Blender |
| `engine/herramientas/referencias.py` | Construir en Blender (`bpy`) el modelo de referencia de cada práctica y generar su imagen y plano |
| `backend/herramientas/auditoria_seguridad.py` | Auditar todas las rutas de la API contra inyección SQL, XSS, permisos y fuerza bruta |
| `backend/herramientas/rendimiento.py` y `frontend/scripts/rendimiento.mjs` | Medir latencia del backend con alumnos simultáneos y rendimiento de la PWA |
| `backend/herramientas/verificar_licencia.py` | Verificar la firma y marca de agua de una copia descargada del add-on |
| `backend/herramientas/migrar.py` | Respaldo JSONL, carga en otra base y generación de DDL para PostgreSQL |
| `addon/herramientas/construir.py` e `instaladores.py` | Construir `dist/amatista-7.1.0.zip`, paquetes por sistema e instaladores `.exe` / `.deb` |
| `addon/tests/simular_alumnos.py` | Simular 100 alumnos distintos resolviendo prácticas con Motor 6 o Motor 7 |
| `tablero/actualizar.py` | Regenerar `KANBAN.md` a partir de `tablero/tareas.yml` y el historial de Git |

## 10. Cómo se trabaja

- **Ramas**: `main` más una sola rama de trabajo a la vez; todo entra por PR y Maximiliano decide cada fusión.
- **Commits**: `type(scope): descripción` ([convención](docs/guias/2026-09-27_convencion_commits.txt)), firmados con SSH.
- **Tareas**: [`tablero/tareas.yml`](tablero/tareas.yml); las tarjetas se mueven con los commits (`T-xxx`, `cierra T-xxx`) y [KANBAN.md](KANBAN.md) se regenera solo.
- **Bitácora**: cada sesión deja su registro en [`docs/bitacora/`](docs/bitacora/); las fallas, en el [registro de incidencias](docs/incidencias/README.md).
- **Base de datos**: cambios de esquema solo con scripts nuevos y aditivos (`014` en adelante), ejecutados antes del código que los necesita.

## 11. Versiones

Tags publicados en GitHub hasta `v3.0.0-alpha.10`; preparados en `herramientas/crear-tags.sh` desde `v3.0.0-alpha.11` hasta `v3.0.0-alpha.15`. Detalle completo de cada entrega en [CHANGELOG.md](CHANGELOG.md).

## 12. Qué sigue

1. **Cerrar despliegue en producción y pruebas con ventana en Blender**: aplicar `007` a `013` en Oracle, actualizar el backend en la VM, reinstalar el add-on 7.1 y ejecutar las pruebas visuales pendientes (`T-113`, `T-143`, `T-178`, `T-182`).
2. **Seguridad y operación del servidor**: pasar al usuario `AMATISTA_APP` (`004`, `T-004`), cerrar el puerto 8000 directo en OCI (`T-130`), configurar SMTP (`T-032`) y activar Sentry (`T-185`).
3. **Centro 3D y experimento de estadía con G7B (`v3.5.0`)**: detección de nivel de equipo (`N0`–`N4`) en el add-on (`T-188`), telemetría agregada con consentimiento (`T-187`, `T-189`, `T-190`) y recomendaciones adaptadas en Mi panel (`T-192`).

Orden vigente y razones: [PROYECTO.md](PROYECTO.md).

## 13. Documentación

| Sección | Qué encuentras |
|---|---|
| [Historia](docs/historia/README.md) | Cronología exacta, ideas y cómo se implementaron, la plataforma en cada versión |
| [Plataforma](docs/plataforma/README.md) | Mapa por rol, herramientas de enseñanza, Estudio A-Frame, Motor Web, Goliat, avatares, buzón y pocos datos |
| [Amatista Engine](docs/motor/README.md) | Corazón Amatista 1.0, Motor 7 «Guion», Amatista Taller (Motor 5), fichas y referencia técnica del add-on |
| [Manual del código](docs/manual-del-codigo/README.md) | Mapa del repositorio, frontend, backend, motor y add-on explicados con recetas |
| [Manual del desarrollador](docs/desarrollador/README.md) | Entorno, herramientas CLI, pruebas, CI y flujo de trabajo |
| [Base de datos](docs/base-de-datos/README.md) | Esquema SQL completo (24 tablas), diagrama entidad-relación y migración |
| [Despliegue público .tech](docs/despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md) | Cloudflare Workers, OCI, Caddy, Oracle, Motor 6/7 y Sentry |
| [Diseño «Facetas»](docs/diseno/2026-10-11_sistema_facetas.md) | Anatomía de página, anchos, piezas comunes y CSS v4.1 |
| [Auditoría y Seguridad](docs/auditoria/2026-10-11_auditoria_completa.md) | Auditoría completa del repositorio, [seguridad](docs/seguridad/01_auditoria_2026-10-05.md) y [rendimiento](docs/rendimiento/2026-10-05_informe.md) |
| [Dirección y Propuestas](docs/reestructuracion/00_plan_maestro.md) | Plan maestro v3, [Centro 3D y G7B](docs/propuestas/2026-11-01_centro_3d_y_g7b.md) y [bitácoras](docs/bitacora/) |

## Licencia

La plataforma todavía no tiene licencia definida (decisión pendiente de Maximiliano); cuando se elija, se agrega como `LICENSE` en la raíz. El add-on de Blender (`addon/`) se declara `GPL-3.0-or-later` en su manifiesto porque usa `bpy`.
