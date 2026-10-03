# Amatista PWA 💎

**Plataforma educativa offline-first para el aprendizaje práctico de creación 3D orientada a WebXR.**

Amatista integra **Blender**, modelos **GLB**, **A-Frame**, **WebXR**, una **PWA**, persistencia local y asistencia mediante **IA** para construir una experiencia educativa que pueda seguir funcionando incluso cuando el estudiante pierde conexión a Internet.

---

## 📌 Descripción

Amatista nace como una plataforma educativa enfocada en el flujo de trabajo:

```text
Blender
   ↓
Modelado y creación 3D
   ↓
Exportación GLB
   ↓
A-Frame / WebXR
   ↓
Experiencia educativa interactiva
   ↓
PWA Offline
   ↓
Sincronización de progreso
   ↓
Tutor IA
```

El objetivo del proyecto es permitir que los estudiantes aprendan conceptos relacionados con creación 3D y experiencias web inmersivas dentro de una plataforma accesible desde navegador y preparada para trabajar con conectividad limitada.

---

## 🎯 Objetivo

Construir una plataforma educativa capaz de:

- ofrecer rutas de aprendizaje;
- presentar lecciones prácticas;
- visualizar modelos y escenas 3D;
- ejecutar experiencias con A-Frame y WebXR;
- almacenar contenido y progreso localmente;
- funcionar sin conexión mediante tecnologías PWA;
- sincronizar el progreso cuando se recupera Internet;
- ofrecer asistencia mediante un Tutor IA.

---

## 🧠 Filosofía del proyecto

Amatista está diseñado bajo un principio principal:

> **Local primero, servicios externos después.**

La funcionalidad educativa principal debe poder seguir disponible aunque servicios externos no estén temporalmente accesibles.

```text
Usuario
   ↓
Amatista PWA
   ↓
IndexedDB
   ↓
Contenido + progreso local
```

Cuando existe conexión:

```text
PWA
   ↓
FastAPI
   ↓
Oracle Database
```

Cuando el Tutor IA está disponible:

```text
PWA
   ↓
FastAPI
   ↓
Ollama
```

El backend y la inteligencia artificial deben ampliar la experiencia, no convertirse en un requisito para acceder a contenido previamente descargado.

---

## 🏗️ Arquitectura general

```text
                         AMATISTA
                            │
                     ┌──────▼──────┐
                     │     PWA     │
                     │ React/Vite  │
                     └──────┬──────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
      Lecciones          WebXR             Offline
                         A-Frame           IndexedDB
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
                      Sincronización
                            │
                     ┌──────▼──────┐
                     │   FastAPI   │
                     │   Python    │
                     └────┬───┬────┘
                          │   │
                ┌─────────┘   └─────────┐
                ▼                       ▼
         Oracle Database              Ollama
        usuarios/progreso            Tutor IA
```

---

## 🗂️ Estructura del monorepo

```text
amatista/
│
├── frontend/              # PWA React + Vite (ver frontend/README.md)
│   ├── public/            # íconos e ilustraciones
│   ├── scripts/           # generador de ilustraciones low poly
│   └── src/               # páginas, lecciones interactivas, panel del alumno y admin
│
├── backend/               # API FastAPI (ver backend/README.md)
│   ├── api/               # auth, progreso, eventos, contenido, admin, sesiones
│   ├── database/          # conexión (Oracle o SQLite) y los 8 modelos
│   ├── contenido/         # validación y plantillas de la Fórmula
│   ├── herramientas/      # CLI de contenido y crear_admin.py
│   ├── sql/               # esquema de Oracle 001–004 (orden en sql/LEEME.txt)
│   ├── tests/
│   └── diagnostico_oracle.py
│
├── ai_tutor/prompts/      # Tutor IA (reservado)
├── despliegue/            # systemd, Caddy (HTTPS) y script de actualización
├── herramientas/          # crear-tags.sh
├── tablero/               # generador del Kanban (tareas.yml → KANBAN.md)
├── docs/                  # documentación por carpetas (índice: docs/README.md)
│   ├── arquitectura/      # decisiones técnicas vigentes
│   ├── bitacora/          # avance por sesión y plan siguiente
│   ├── incidencias/       # fallas resueltas (registro: incidencias/README.md)
│   ├── planeacion/        # plan de lanzamiento
│   ├── propuestas/        # 3D Lab y motor generativo
│   └── guias/             # convención de commits, versiones y tablero
│
├── PROYECTO.md            # centro de dirección: qué sigue y dónde está cada cosa
├── KANBAN.md              # tablero generado (no se edita a mano)
├── CHANGELOG.md
└── README.md
```

---

## 🖥️ Frontend

El frontend representa el núcleo de la experiencia del estudiante.

### Tecnologías actuales

- React
- Vite
- Tailwind CSS
- A-Frame
- WebXR
- JavaScript

### Responsabilidades previstas

- Dashboard.
- Ruta de aprendizaje.
- Lecciones.
- Visor 3D.
- Experiencias WebXR.
- Estado Online / Offline.
- Descarga de contenido.
- Gestión de progreso.
- Comunicación con backend.
- Comunicación con Tutor IA.

Hoy la PWA tiene la pantalla de cursos, el mapa de cada módulo, el reproductor de lecciones con 7 tipos de actividades interactivas (quiz, ordenar, relacionar, completar, puntos en imagen, explorador de escenas y retos de código), cuentas de alumno (entrar, registro, confirmar, recuperar y perfil), el panel del alumno (`#/panel`: nivel, racha, retos e insignias) y el panel de administración (`#/admin`: métricas, usuarios, gestor de contenido y editor de lecciones). El formato de las lecciones está en `docs/arquitectura/2026-09-29_formato-lecciones.txt` y el diseño de módulos en `docs/arquitectura/2026-10-02_formula_modulos.txt`.

---

## 🌐 PWA y funcionamiento offline

Uno de los objetivos principales de Amatista es que el estudiante pueda continuar trabajando aunque pierda conexión.

La arquitectura offline contempla:

- Service Worker;
- caché del App Shell;
- IndexedDB;
- descarga de lecciones;
- almacenamiento de progreso;
- detección de conectividad;
- sincronización posterior con el servidor.

El flujo esperado es:

```text
Abrir Amatista
   ↓
Descargar una lección
   ↓
Guardar contenido localmente
   ↓
Perder conexión
   ↓
Continuar estudiando
   ↓
Guardar progreso en IndexedDB
   ↓
Recuperar conexión
   ↓
Sincronizar progreso
```

---

## 🎮 WebXR y contenido 3D

Amatista utiliza A-Frame como base para integrar contenido 3D directamente en navegador.

El flujo de contenido planteado es:

```text
Blender
   ↓
Modelo 3D
   ↓
Exportación GLB
   ↓
A-Frame
   ↓
WebXR
```

Esto permitirá desarrollar actividades donde el estudiante pueda visualizar e interactuar con modelos directamente desde la plataforma.

---

## ⚙️ Backend

La arquitectura de backend está planteada alrededor de:

- Python;
- FastAPI;
- SQLAlchemy;
- Oracle Database;
- API REST;
- sincronización de progreso.

El backend tendrá responsabilidades como:

- gestión de usuarios;
- sesiones;
- progreso de lecciones;
- sincronización;
- validación;
- metadatos;
- comunicación con servicios externos.

El código del backend ya está en `backend/`. Cómo ejecutarlo, probarlo y dejar Oracle funcionando: `backend/README.md`.

---

## 🗄️ Base de datos

Oracle Autonomous Database (presupuesto de 20 GB) con 8 tablas: `USUARIOS`, `SESIONES`, `PROGRESO_LECCIONES`, `LOGROS`, `EVENTOS_APRENDIZAJE` (particionada por mes), `CURSOS`, `MODULOS` y `LECCIONES` (contenido JSON). En desarrollo y en las pruebas se usa SQLite con los mismos modelos.

Los scripts están en `backend/sql/` y se ejecutan en el orden de `backend/sql/LEEME.txt`: con datos reales, `002` → `003` → `004` (nunca `001`, que borra las tablas). `diagnostico_oracle.py` comprueba que las tablas coinciden con el backend. Historial: `docs/arquitectura/2026-09-27_backend_y_base_de_datos.txt` y el [registro de incidencias](docs/incidencias/README.md).

---

## 🤖 Tutor IA

Amatista contempla un Tutor IA basado en Ollama.

Su función será asistir al estudiante dentro del contexto de las lecciones.

Funciones previstas:

- explicar conceptos;
- resolver dudas;
- ofrecer ayuda paso a paso;
- orientar sobre Blender;
- apoyar con A-Frame;
- detectar errores comunes;
- utilizar el contexto de la lección actual.

El Tutor IA debe funcionar como una capa adicional.

La plataforma educativa no debe depender de su disponibilidad.

---

## 🧪 Motor generativo 3D (rama aparte)

Amatista también podrá funcionar como un **motor gratuito de generación de modelos 3D con IA**, de forma parecida a como herramientas como Nano Banana o GPT generan imágenes, pero usando **Blender** como motor gráfico:

```text
Prompt en lenguaje natural
   ↓
IA local (Ollama) genera un script bpy
   ↓
Blender headless construye y renderiza
   ↓
Exportación GLB
   ↓
Visor A-Frame / WebXR
```

Este módulo se desarrollará en una **rama independiente** y no cambia el roadmap principal. Detalles en:

```text
docs/propuestas/2026-09-27_motor_generativo_3d.txt
```

---

## 🧰 Stack tecnológico

| Área | Tecnología |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Estilos | Tailwind CSS |
| 3D Web | A-Frame |
| Experiencias inmersivas | WebXR |
| PWA | Service Worker / Manifest |
| Almacenamiento local | IndexedDB |
| Backend | FastAPI |
| Lenguaje backend | Python |
| ORM | SQLAlchemy |
| Base de datos | Oracle |
| IA | Ollama |
| Control de versiones | Git / GitHub |
| Despliegue frontend | Cloudflare Pages |

---

## 📌 Tablero y versiones

- **[PROYECTO.md](PROYECTO.md)**: centro de dirección (qué sigue, por qué y dónde está cada cosa).
- **[KANBAN.md](KANBAN.md)**: roadmap de las próximas versiones y tablero Kanban que se actualiza solo con los commits ([cómo se usa](tablero/README.md)).
- **[CHANGELOG.md](CHANGELOG.md)**: qué trajo cada versión. Fases: `v0.1.0` prototipo · `v1.0.0` integración · `v2.0.0` plataforma educativa · `v2.2.0-alpha.*` plataforma unificada · `v3.0.0-alpha.*` **reestructuración** (en curso).
- **[Reestructuración v3](docs/reestructuracion/README.md)**: plan maestro, modelo de contenido por niveles, manual de Oracle y guía del add-on de Blender.
- Tags: `bash herramientas/crear-tags.sh` (ver `docs/guias/2026-10-01_versiones-y-tablero.txt`).
- Estado y plan más recientes: [`docs/bitacora/2026-10-03_estado_y_reestructuracion.md`](docs/bitacora/2026-10-03_estado_y_reestructuracion.md).

---

## 🚧 Estado actual

Al 3 de octubre de 2026 la **plataforma unificada (v2.2)** está en `main` y en producción con Oracle (002 y 003 aplicados). Empieza la etapa **v3 «Reestructuración»**: curso por niveles, versiones de Blender verificadas, habilidades y un add-on de Blender conectado ([plan](docs/reestructuracion/00_plan_maestro.md)). El piloto del 8 de octubre sigue con la v2.2. El estado de cada tarea vive en [KANBAN.md](KANBAN.md).

### Implementado

- [x] PWA instalable que funciona sin conexión (React, Vite, Tailwind, A-Frame).
- [x] Identidad visual low poly y pantalla de selección de cursos.
- [x] Módulo 1 de Blender y de A-Frame con lecciones, actividades interactivas y examen.
- [x] Progreso local en IndexedDB (XP, niveles, racha, insignias) que se sincroniza con el backend.
- [x] Progreso que se adapta cuando cambia el contenido (lecciones nuevas, `replaces`, % recalculado).
- [x] Cuentas de alumno con roles (alumno, profesor, admin) y fusión del progreso offline con la cuenta.
- [x] Panel del alumno y panel de administración (métricas, usuarios, gestor y editor de contenido).
- [x] API FastAPI: auth, progreso, eventos, contenido administrable y administración.
- [x] Esquema Oracle incremental para 20 GB (002–004) y diagnóstico.
- [x] CI en GitHub Actions y tablero Kanban automático.
- [x] Base de la v3: niveles, habilidades, rúbrica y versiones de Blender en Oracle (005), herramientas de autor (006), API de niveles y Blender, CLI `nueva-leccion` y `mapa`.

### Pendiente

- [ ] Ejecutar 005 y 006 en Oracle y sembrar los niveles (T-035).
- [ ] Backend como servicio con HTTPS y SMTP.
- [ ] Prueba de punta a punta y revisión de seguridad.
- [ ] Frontend publicado en Cloudflare Pages; piloto (8/10) y beta (15/10).
- [ ] Contenido por niveles («Mi primer espacio 3D»), visor GLB, add-on de Blender y tutor IA (roadmap v3.1–v3.4).

---

## 🗺️ Roadmap inicial

### Fase 1 — PWA Offline

- Manifest.
- Service Worker.
- IndexedDB.
- detección de conectividad;
- almacenamiento local;
- descarga de contenido.

### Fase 2 — Plataforma educativa

- Dashboard.
- Rutas de aprendizaje.
- Lecciones.
- Actividades.
- Progreso.

### Fase 3 — 3D y WebXR

- Carga de modelos GLB.
- Escenas reutilizables.
- Interacción con modelos.
- Actividades inmersivas.

### Fase 4 — Backend

- FastAPI.
- Usuarios.
- Sesiones.
- Progreso.
- Oracle.
- Sincronización.

### Fase 5 — Tutor IA

- Integración con Ollama.
- Prompts especializados.
- Contexto de lecciones.
- Historial.
- Manejo de disponibilidad.

---

## 🚀 Ejecución local

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
python -m pytest -q tablero
```

Para dejar Oracle y el servidor funcionando: `backend/README.md` y `despliegue/`.

---

## 🔐 Variables de entorno

El repositorio incluye:

```text
backend/.env.example     # Oracle (o SQLite para desarrollo) y CORS
frontend/.env.example    # VITE_API_URL: dirección del backend
.env.example             # Tutor IA (Ollama)
```

Cada uno se copia sin el `.example` y se completa con los valores reales.

> Nunca deben publicarse contraseñas, tokens, wallets, claves privadas o credenciales reales dentro del repositorio.

---

## 📝 Convención de commits

Amatista utiliza la estructura:

```text
type(scope): descripción
```

Ejemplos:

```text
feat(pwa): implementar almacenamiento de lecciones con indexeddb
fix(pwa): corregir detección del estado offline
feat(api): agregar endpoint de progreso
feat(db): crear modelo de progreso de lecciones
feat(ia): integrar cliente de ollama
docs(repo): actualizar arquitectura del proyecto
chore(repo): actualizar dependencias
```

La documentación completa se encuentra en:

```text
docs/guias/2026-09-27_convencion_commits.txt
```

---

## 📚 Documentación

El índice completo está en **[docs/README.md](docs/README.md)**:

- `docs/arquitectura/`: decisiones técnicas vigentes (contrato técnico, formato de lecciones, la Fórmula);
- `docs/bitacora/`: avance de cada sesión y plan siguiente;
- `docs/incidencias/`: fallas resueltas, con su [registro](docs/incidencias/README.md);
- `docs/planeacion/`: plan de lanzamiento;
- `docs/reestructuracion/`: etapa v3 (plan, modelo de contenido, manual de Oracle, add-on de Blender);
- `docs/propuestas/`: Amatista 3D Lab, motor generativo 3D y propuesta de contenido por niveles;
- `docs/guias/`: convención de commits, versiones y tablero.

Todos los archivos dentro de `docs/` se nombran con su fecha de creación al inicio: `AAAA-MM-DD_tema.txt`. Así se ordenan solos por fecha dentro de cada carpeta.

El historial de versiones está en `CHANGELOG.md`. Cada versión se marca con un tag de Git (`v1.0.0`, `v2.0.1`, `v2.2.0-alpha.1`, `v3.0.0-alpha.1`, ...).

---

## 🔒 Seguridad

El proyecto sigue como principio evitar la publicación de:

- contraseñas;
- tokens;
- IPs sensibles;
- credenciales de infraestructura;
- secretos de Oracle;
- wallets;
- claves SSH;
- archivos `.env` reales.

Toda configuración sensible debe realizarse mediante variables de entorno.

---

## 🤝 Contribución

Amatista se encuentra actualmente en desarrollo.

Antes de contribuir se recomienda consultar:

```text
docs/guias/2026-09-27_convencion_commits.txt
```

Las contribuciones deben mantener la separación de responsabilidades del monorepo y evitar introducir dependencias innecesarias entre frontend, backend e IA.

---

## 📄 Licencia

El proyecto todavía no define una licencia. Cuando se elija una (por ejemplo MIT), debe agregarse como archivo `LICENSE` en la raíz del repositorio.

---

## 💎 Visión

Amatista busca evolucionar hacia un entorno de aprendizaje práctico donde un estudiante pueda:

```text
aprender
   ↓
crear en Blender
   ↓
exportar contenido
   ↓
visualizarlo en WebXR
   ↓
trabajar offline
   ↓
guardar su progreso
   ↓
sincronizarlo
   ↓
recibir apoyo de un Tutor IA
```

El objetivo no es únicamente construir una plataforma de cursos.

El objetivo es construir un **entorno educativo práctico para creación 3D orientada a WebXR**.
