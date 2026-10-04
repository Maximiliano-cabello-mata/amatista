# Manual del desarrollador

Todo lo que necesita quien programa en Amatista: preparar el entorno, cada herramienta (de terminal y dentro de la plataforma), las pruebas y la forma de trabajar en el repositorio. Para quien llega al proyecto o vuelve después de un tiempo.

Actualizado: 4 de octubre de 2026 (main en c730c0e)

## Índice

| Documento | Qué tiene |
|---|---|
| [01 · Entorno local](01_entorno_local.md) | Requisitos, variables de entorno, SQLite u Oracle local, crear el primer admin |
| [02 · Herramientas de línea de comandos](02_herramientas_de_linea_de_comandos.md) | Cada script del repositorio con todos sus subcomandos y opciones |
| [03 · Herramientas dentro de la plataforma](03_herramientas_dentro_de_la_plataforma.md) | Panel de administración, Diagnóstico técnico, editor de lecciones, modo Desarrollador del add-on, paquete `AMATISTA_AUTOR` |
| [04 · Pruebas y CI](04_pruebas_y_ci.md) | Todas las suites, cómo correrlas y qué hace cada workflow de GitHub Actions |
| [05 · Flujo de trabajo](05_flujo_de_trabajo.md) | Ramas, commits, tablero Kanban, tags, bitácora, despliegue en la VM y checklist del PR |

Documentación relacionada (no se repite aquí): [`docs/README.md`](../README.md) (índice general), [`backend/README.md`](../../backend/README.md), [`frontend/README.md`](../../frontend/README.md), [`docs/plataforma/`](../plataforma/README.md), [`docs/motor/`](../motor/README.md) y el [manual de Oracle v3](../reestructuracion/02_manual_oracle.md).

---

## Tu primer día

Necesitas Git, Python 3.12 (CI usa 3.12 para el backend; el motor pide 3.11+) y Node.js 22 con npm (la versión que usa CI). Detalle en [01](01_entorno_local.md#1-requisitos).

### 1. Clonar

```bash
git clone https://github.com/Maximiliano-cabello-mata/amatista.git
cd amatista
```

Si vas a crear tags (ver [05](05_flujo_de_trabajo.md#4-tags-y-versiones)), el clon debe ser completo, no superficial.

### 2. Backend con venv y SQLite

```bash
cd backend
python3 -m venv venv
source venv/bin/activate              # Windows: venv\Scripts\activate
pip install -r requirements-dev.txt   # requirements.txt + pytest + httpx
cp .env.example .env                  # opcional; con DATABASE_URL no hace falta Oracle
DATABASE_URL=sqlite:///./amatista_local.db uvicorn main:app --reload
```

- Con `DATABASE_URL` definido se ignora todo lo de Oracle (`backend/database/conexion.py:92`) y, en SQLite, `main.py` crea las tablas al arrancar.
- Comprueba: `http://localhost:8000/api/salud` responde `{"estado": "ok", "motor": "sqlite"}` y la documentación interactiva queda en `http://localhost:8000/docs`.
- Para no repetir `DATABASE_URL` en cada comando, escríbela en `backend/.env` (está en `.gitignore`).

### 3. Contenido en la base local (opcional pero recomendado)

Sin importar, la PWA usa los JSON empaquetados de `frontend/src/data/modulos/`; el panel de administración y el add-on trabajan con lo que hay en la base:

```bash
# desde backend/, con el venv activo y DATABASE_URL en .env o en la línea
python herramientas/contenido.py importar            # módulos de frontend/src/data/modulos
python herramientas/contenido.py practicas --publicar # prácticas de practices/blender/
python herramientas/crear_admin.py tu@correo.com --crear --nombre "Tu nombre"
```

### 4. Frontend con npm

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:8000
npm run dev              # http://localhost:5173
```

El backend acepta cualquier puerto de `localhost` sin configurar CORS (`backend/main.py`, `allow_origin_regex`).

### 5. Correr todo

Dos terminales: `uvicorn main:app --reload` en `backend/` y `npm run dev` en `frontend/`. Entra a `http://localhost:5173`, inicia sesión con la cuenta del paso 3 y abre `#/admin`.

### 6. Correr todas las comprobaciones de CI

Lo mismo que corre [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) (detalle en [04](04_pruebas_y_ci.md)):

```bash
# Backend (desde backend/, con el venv activo)
pip install pyyaml                                   # CI la instala para el tablero
AMATISTA_SIN_LIMITES=1 python -m pytest -q
python herramientas/contenido.py validar

# Tablero, motor y constructor del add-on (desde la raíz, mismo venv)
python -m pytest -q tablero
python -m pytest -q engine/tests addon/tests

# Frontend (desde frontend/)
npm ci && npm run lint && npm test && npm run build

# Add-on dentro de Blender (opcional en tu PC: Python 3.11 y bpy 5.0.1)
pip install bpy==5.0.1 && python addon/tests/en_blender.py
```

`AMATISTA_SIN_LIMITES=1` es lo que pone CI; `backend/tests/conftest.py` también lo fija en cada prueba, así que localmente funciona igual sin él.

---

## Todas las herramientas de un vistazo

### En la terminal

| Herramienta | Para qué | Comando (desde) | Documento |
|---|---|---|---|
| `backend/herramientas/contenido.py` | Validar, importar y exportar módulos; crear módulos y lecciones; mapa; sembrar niveles; registrar prácticas | `python herramientas/contenido.py <validar\|importar\|exportar\|nuevo-modulo\|nueva-leccion\|mapa\|sembrar-niveles\|practicas>` (`backend/`) | [02 §1](02_herramientas_de_linea_de_comandos.md#1-backendherramientascontenidopy) |
| `backend/herramientas/crear_admin.py` | Dar rol admin o profesor; crear la cuenta | `python herramientas/crear_admin.py correo [--crear] [--nombre N] [--rol R]` (`backend/`) | [02 §2](02_herramientas_de_linea_de_comandos.md#2-backendherramientascrear_adminpy) |
| `backend/diagnostico_oracle.py` | Comparar las tablas de Oracle con lo que espera el backend, filas y espacio | `python diagnostico_oracle.py` (`backend/`) | [02 §3](02_herramientas_de_linea_de_comandos.md#3-backenddiagnostico_oraclepy) |
| `uvicorn` | Levantar la API | `uvicorn main:app --reload` (`backend/`) | [01](01_entorno_local.md) |
| `tablero/actualizar.py` | Generar `KANBAN.md` desde `tareas.yml` y los commits | `python tablero/actualizar.py` (raíz) | [02 §4](02_herramientas_de_linea_de_comandos.md#4-tableroactualizarpy) |
| `herramientas/crear-tags.sh` | Crear los tags de versión sobre el historial | `bash herramientas/crear-tags.sh [--reemplazar-v0.2.0]` (raíz) | [02 §5](02_herramientas_de_linea_de_comandos.md#5-herramientascrear-tagssh) |
| `despliegue/actualizar.sh` | Actualizar la API en la VM con pruebas y vuelta atrás | `bash despliegue/actualizar.sh [rama]` (VM) | [02 §6](02_herramientas_de_linea_de_comandos.md#6-despliegueactualizarsh) |
| `despliegue/amatista-api.service`, `despliegue/Caddyfile` | Unidad systemd y HTTPS de la API | se copian a `/etc/` (VM) | [02 §6](02_herramientas_de_linea_de_comandos.md#otros-archivos-de-despliegue) · [05 §6](05_flujo_de_trabajo.md#6-despliegue-en-la-vm) |
| `engine/demo.py` | Ver el motor evaluando la mesa sin Blender | `python engine/demo.py` (raíz) | [02 §7](02_herramientas_de_linea_de_comandos.md#7-enginedemopy) |
| `engine/herramientas/run_in_blender.py` | Probar el motor a mano dentro de Blender | Blender › Scripting › Run Script | [02 §8](02_herramientas_de_linea_de_comandos.md#8-engineherramientasrun_in_blenderpy) |
| `addon/herramientas/construir.py` | Armar la extensión `.zip` o el paquete con instalador | `python addon/herramientas/construir.py [--sistema S] [--servidor U] [--plataforma U] [--canal C] [--salida D]` (raíz) | [02 §9](02_herramientas_de_linea_de_comandos.md#9-addonherramientasconstruirpy) |
| `addon/herramientas/generar_iconos.py` | Regenerar los íconos PNG del add-on | `python addon/herramientas/generar_iconos.py` (raíz) | [02 §10](02_herramientas_de_linea_de_comandos.md#10-addonherramientasgenerar_iconospy) |
| `addon/herramientas/instalador/*` | Instaladores que van dentro del paquete del alumno | `.bat`, `.command`, `instalar-amatista.sh`, `instalar_en_blender.py` | [02 §11](02_herramientas_de_linea_de_comandos.md#11-addonherramientasinstalador) |
| `frontend/scripts/ilustraciones.mjs` | Regenerar los SVG low poly de las lecciones | `npm run ilustraciones` (`frontend/`) | [02 §12](02_herramientas_de_linea_de_comandos.md#12-frontendscriptsilustracionesmjs) |
| Scripts npm | Desarrollo, build, vista previa, lint y pruebas de la PWA | `npm run dev\|build\|preview\|lint\|ilustraciones`, `npm test` (`frontend/`) | [02 §13](02_herramientas_de_linea_de_comandos.md#13-scripts-npm-del-frontend) |
| `pytest` | Pruebas del backend, tablero, motor y constructor del add-on | `python -m pytest -q` (`backend/`); `python -m pytest -q tablero engine/tests addon/tests` (raíz) | [04](04_pruebas_y_ci.md) |
| `addon/tests/en_blender.py` | El add-on dentro de Blender real | `python addon/tests/en_blender.py` (con `bpy`) | [04 §6](04_pruebas_y_ci.md#6-add-on-dentro-de-blender-addontestsen_blenderpy) |
| Scripts SQL `backend/sql/001`–`007` | Esquema de Oracle (se ejecutan a mano en Database Actions) | F5 en Database Actions, en el orden de [`LEEME.txt`](../../backend/sql/LEEME.txt) | [01 §4](01_entorno_local.md#4-oracle-local-opcional) · [manual Oracle](../reestructuracion/02_manual_oracle.md) |

### Dentro de la plataforma y de Blender

| Herramienta | Para qué | Dónde | Documento |
|---|---|---|---|
| Admin › Resumen | Indicadores del lanzamiento, actividad, embudo, avance por curso | `#/admin` | [03 §1.1](03_herramientas_dentro_de_la_plataforma.md#11-resumen-admin) |
| Admin › Módulos | Árbol cursos → módulos → lecciones: crear, publicar, archivar, reordenar, exportar | `#/admin/contenido` | [03 §1.2](03_herramientas_dentro_de_la_plataforma.md#12-módulos-admincontenido) |
| Editor de lecciones con vista previa | Editar bloques en JSON con la paleta, validar, guardar, publicar | `#/admin/contenido/:curso/:leccion` | [03 §1.3](03_herramientas_dentro_de_la_plataforma.md#13-editor-de-lecciones-con-vista-previa) |
| Admin › Prácticas de Blender | Versiones de las prácticas del motor, publicar, archivar, registrar las del repositorio | `#/admin/practicas` | [03 §1.4](03_herramientas_dentro_de_la_plataforma.md#14-prácticas-de-blender-adminpracticas) |
| Admin › Herramientas | Catálogo de bloques con vista previa y JSON listo para copiar | `#/admin/herramientas` | [03 §1.5](03_herramientas_dentro_de_la_plataforma.md#15-herramientas-adminherramientas) |
| Admin › Usuarios y detalle | Buscar, cambiar rol, confirmar correo, cuentas de prueba | `#/admin/usuarios[/:id]` | [03 §1.6](03_herramientas_dentro_de_la_plataforma.md#16-usuarios-y-detalle-de-usuario) |
| Admin › Estado | Motor, filas por tabla, purga | `#/admin/sistema` (solo admin) | [03 §1.7](03_herramientas_dentro_de_la_plataforma.md#17-estado-adminsistema) |
| Diagnóstico técnico | Backend, cuenta, catálogo, sincronización y visor A-Frame de este dispositivo | `#/laboratorio` (se abre desde Admin › Estado) | [03 §2](03_herramientas_dentro_de_la_plataforma.md#2-diagnóstico-técnico-laboratorio) |
| Modo Desarrollador (Amatista Author) | Diseñar, validar, exportar y subir prácticas desde Blender | Blender › N › pestaña Amatista › Modo | [03 §3](03_herramientas_dentro_de_la_plataforma.md#3-modo-desarrollador-amatista-author-en-blender) |
| Vista previa como alumno | Probar el borrador como lo verá el alumno, sin enviar nada | Modo Desarrollador del add-on | [03 §3](03_herramientas_dentro_de_la_plataforma.md#3-modo-desarrollador-amatista-author-en-blender) |
| Paquete `AMATISTA_AUTOR` y vistas `V_AMATISTA_*` | Crear y revisar niveles, lecciones, fichas y verificaciones desde Oracle | Database Actions › SQL | [03 §4](03_herramientas_dentro_de_la_plataforma.md#4-oracle-database-actions-paquete-amatista_autor-y-vistas) |
| `/docs` de FastAPI | Probar cualquier ruta de la API a mano | `http://localhost:8000/docs` | [`backend/README.md`](../../backend/README.md) |
