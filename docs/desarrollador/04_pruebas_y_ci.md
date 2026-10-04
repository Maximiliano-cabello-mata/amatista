# 04 · Pruebas y CI

Todas las suites de pruebas del repositorio, cómo correrlas, qué cubren y qué hace cada workflow de GitHub Actions. Para desarrolladores antes de abrir un PR o cuando CI falla.

Actualizado: 4 de octubre de 2026 (main en c730c0e)

1. [Resumen](#1-resumen)
2. [Frontend (Vitest)](#2-frontend-vitest)
3. [Backend (pytest)](#3-backend-pytest)
4. [Tablero](#4-tablero)
5. [Motor y constructor del add-on](#5-motor-y-constructor-del-add-on)
6. [Add-on dentro de Blender (`addon/tests/en_blender.py`)](#6-add-on-dentro-de-blender-addontestsen_blenderpy)
7. [Workflow CI (`.github/workflows/ci.yml`)](#7-workflow-ci-githubworkflowsciyml)
8. [Workflow Tablero Kanban (`.github/workflows/tablero.yml`)](#8-workflow-tablero-kanban-githubworkflowstableroyml)
9. [Cuando CI falla](#9-cuando-ci-falla)

---

## 1. Resumen

| Suite | Dónde | Comando | Desde | Necesita | Job de CI |
|---|---|---|---|---|---|
| Backend | `backend/tests/` (10 archivos, ~198 funciones de prueba) | `python -m pytest -q` | `backend/` | `requirements-dev.txt` | `backend` |
| Validación de contenido | `frontend/src/data/modulos/*.json` | `python herramientas/contenido.py validar` | `backend/` | — | `backend` |
| Tablero | `tablero/test_actualizar.py` (8) | `python -m pytest -q tablero` | raíz | pytest + PyYAML | `backend` |
| Motor | `engine/tests/` (4 archivos) | `python -m pytest -q engine/tests` | raíz | pytest | `backend` |
| Constructor del add-on | `addon/tests/test_construir.py` (7) | `python -m pytest -q addon/tests` | raíz | pytest | `backend` |
| Add-on en Blender | `addon/tests/en_blender.py` | `python addon/tests/en_blender.py` | raíz | Python 3.11 + `bpy==5.0.1` (o Blender) | `addon-blender` |
| Frontend | `frontend/src/**/*.test.js` (14 archivos, ~158 casos) | `npm test` | `frontend/` | `npm ci` | `frontend` |
| Lint | todo `frontend/` | `npm run lint` | `frontend/` | `npm ci` | `frontend` |
| Build | — | `npm run build` | `frontend/` | `npm ci` | `frontend` |

Todo de una vez: ver [«Tu primer día», paso 6](README.md#6-correr-todas-las-comprobaciones-de-ci). Ninguna prueba toca Oracle ni la red.

## 2. Frontend (Vitest)

`npm test` = `vitest run` (sin configuración aparte: Vitest toma los `*.test.js` de `src/`). Observador: `npx vitest`. Un archivo: `npx vitest run src/rutas.test.js`.

| Archivo | Qué cubre |
|---|---|
| `src/rutas.test.js` | `analizarRuta`, rutas del panel y redirección tras entrar |
| `src/auth/validacion.test.js` | Validación de correo y contraseña en los formularios |
| `src/catalogo/combinar.test.js` | Catálogo combinado (JSON empaquetados + servidor), búsqueda de lecciones e insignias |
| `src/progreso/estado.test.js`, `reglas.test.js` | Progreso v2: estado, reglas de acople, XP, nivel y racha |
| `src/modulos/practica.test.js` | La práctica de Blender que cierra cada módulo |
| `src/blender/logica.test.js` | Conexión con Blender; usa `practices/archivo/v2/mesa.json` (los `steps` del bloque deben coincidir con los objetivos) |
| `src/components/leccion/interactivos/logica.test.js` | Bloques interactivos (quiz, ordenar, emparejar…) con los módulos reales |
| `src/components/leccion/atajos.test.js` | Atajos de teclado practicables |
| `src/components/panel/datos.test.js`, `retos.test.js` | Datos y retos del panel del alumno |
| `src/components/admin/logica.test.js` | Lógica del panel de administración (consultas, armado de lecciones) |
| `src/components/graficas/graficas.test.js` | Escalas de las gráficas SVG |
| `src/data/herramientas.test.js` | Catálogo de herramientas de enseñanza |

## 3. Backend (pytest)

```bash
cd backend && source venv/bin/activate
python -m pytest -q                       # todo
python -m pytest -q tests/test_auth.py    # un archivo
python -m pytest -q -k purga              # por nombre
```

`backend/pytest.ini` fija `pythonpath = .` y `testpaths = tests`. `tests/conftest.py` crea la API con **SQLite temporal** por prueba (`cliente`), baja PBKDF2 a 1000 iteraciones, pone `AMATISTA_SIN_LIMITES=1`, quita `AMATISTA_ADMINS` y `SMTP_HOST`, y ofrece `crear_cuenta(rol=...)` para probar permisos.

| Archivo | Qué cubre |
|---|---|
| `test_auth.py` | Registro, sesiones, códigos, bloqueo, fusión del anónimo y límites por IP |
| `test_progreso.py` | `/api/progreso`: identidad, upsert monotónico, insignias |
| `test_eventos.py` | `/api/eventos`: deduplicación, validación, `es_prueba` |
| `test_api.py` | `/` y `/api/salud`, sesión heredada (`/api/iniciar-sesion`), progreso básico, errores de base, CORS en `localhost` y `dsn_oracle()` |
| `test_contenido.py` | Validación, plantillas de la Fórmula, catálogo con ETag, edición y la CLI `contenido.py` |
| `test_niveles.py` | v3: niveles, ficha, mapa, versiones de Blender y CLI |
| `test_admin.py` | `/api/admin`: métricas, usuarios, permisos y purga |
| `test_addon.py` | API del add-on: vínculo, prácticas, intentos evaluados en el servidor y descargas armadas al vuelo |
| `test_esquema.py` | `database/modelos.py`, los scripts `sql/` y `diagnostico_oracle.py` describen las mismas tablas |
| `test_diagnostico.py` | Las comparaciones y recomendaciones de `diagnostico_oracle.py` (qué script pedir según la base: 001, 002, 005–007, `DB_ESQUEMA`), espacio contra 20 GB y aviso con SQLite |

Regla: una columna nueva va en `modelos.py`, en un script SQL nuevo y en `ESPERADO` del diagnóstico; `test_esquema.py` falla si falta alguno. `despliegue/actualizar.sh` corre esta suite en la VM antes de reiniciar.

## 4. Tablero

`tablero/test_actualizar.py`: `tareas.yml` válido, el histórico existe, estados por commits (`cierra` fuera de `main` queda en Revisión), sección de contenido determinista y notas del YAML (`bloqueo`, `evidencia`, `aceptacion`). Requiere PyYAML. `python -m pytest -q tablero` desde la raíz.

## 5. Motor y constructor del add-on

- `engine/tests/` (`test_engine.py`, `test_loader.py`, `test_motor_mesa.py`, `test_guia.py`): Python puro, sin Blender. `conftest.py` agrega `engine/` al `sys.path`. Cubren el motor, el cargador de prácticas (errores en español), la práctica de la mesa y la etapa 2 (guía y acompañante). Detalle: [docs/motor/](../motor/README.md).
- `addon/tests/test_construir.py`: el constructor sin Blender (contenido del `.zip`, determinismo, `config.json`).

```bash
python -m pytest -q engine/tests addon/tests
```

## 6. Add-on dentro de Blender (`addon/tests/en_blender.py`)

No es pytest: un script que registra el add-on en un Blender real y revisa unas 40 condiciones (✓/✗), sin red. Sale con código 1 si algo falla. Cubre: registro y preferencias; catálogo con la práctica de la mesa; escena vacía al 0 %; guía (proponer cubo, rol, escala `S › Z`), **Hazlo conmigo**, **Muéstrame**, pistas; 3 de 4 patas; duplicar conserva el rol; mesa completa al 100 % y la misma evaluación desde la foto (lo que hace el servidor); aviso de herramientas de nivel 3 (Booleano); modo Author (declarar rol, compilar el borrador, Live Validation al 60 %, exportar `practice.json`); dibujo de paneles y vista 3D; desregistro limpio.

```bash
# Con el módulo bpy de PyPI (Python 3.11), como CI:
pip install bpy==5.0.1
python addon/tests/en_blender.py

# Con un Blender instalado:
blender --background --factory-startup --python addon/tests/en_blender.py
```

En Linux `bpy` necesita algunas bibliotecas del sistema (las instala CI: `libxi6 libxxf86vm1 libxfixes3 libxrender1 libxkbcommon0 libsm6 libgl1 libegl1`).

## 7. Workflow CI (`.github/workflows/ci.yml`)

- **Cuándo**: cada push a cualquier rama, cada pull request y a mano (`workflow_dispatch`). Ignora los cambios que solo tocan `KANBAN.md` (los commits del bot no disparan CI).
- **Concurrencia**: `ci-<ref>` con `cancel-in-progress`: un push nuevo a la misma rama cancela la corrida anterior.
- **Permisos**: solo lectura.

| Job | Python / Node | Pasos |
|---|---|---|
| `backend` | Python 3.12, caché de pip | `pip install -r requirements-dev.txt pyyaml` → `python -m pytest -q` (con `AMATISTA_SIN_LIMITES=1`) → `python herramientas/contenido.py validar` → (en la raíz) `python -m pytest -q tablero` → `python -m pytest -q engine/tests addon/tests` |
| `addon-blender` | Python 3.11 | bibliotecas de sistema para `bpy` → `pip install bpy==5.0.1` → `python addon/tests/en_blender.py` |
| `frontend` | Node 22, caché de npm | `npm ci` → `npm run lint` → `npm test` → `npm run build` |

Los tres jobs corren en paralelo y los tres deben quedar en verde para fusionar.

## 8. Workflow Tablero Kanban (`.github/workflows/tablero.yml`)

- **Cuándo**: cada push a cualquier rama (salvo los que solo tocan `KANBAN.md`) y a mano. No corre en pull requests.
- **Concurrencia**: grupo único `tablero-kanban` sin cancelar: las corridas se encolan.
- **Permisos**: `contents: write` (publica en `main`).
- **Pasos**: checkout de **`main`** con `fetch-depth: 0` (todas las ramas y tags: el estado sale del historial) → Python 3.12 + PyYAML → `python tablero/actualizar.py` → si `KANBAN.md` cambió, commit `chore(repo): actualizar tablero Kanban [skip ci]` como `github-actions[bot]` y `git push origin main`.

Consecuencias: el tablero siempre se publica en `main`, las ramas de trabajo nunca tocan `KANBAN.md` (no hay conflictos al fusionar) y un commit en tu rama con `T-xxx` mueve la tarjeta en `main` a los pocos segundos. Requisitos en GitHub (permisos de escritura de Actions y bypass si `main` está protegida): [tablero/README.md](../../tablero/README.md#requisitos-en-github).

## 9. Cuando CI falla

| Paso que falla | Qué revisar |
|---|---|
| `Pruebas del backend` | Corre `python -m pytest -q` localmente; si es `test_esquema.py`, faltó alinear `modelos.py`, `sql/` y `diagnostico_oracle.py` |
| `Validar los módulos de contenido` | `python herramientas/contenido.py validar` muestra archivo, ruta del campo y error |
| `Pruebas del tablero` | Cambiaste `tablero/actualizar.py` o `tareas.yml` quedó con YAML inválido |
| `Pruebas del motor y del constructor del add-on` | `python -m pytest -q engine/tests addon/tests` |
| `Add-on dentro de Blender` | Corre `en_blender.py` con `bpy` 5.0.1; el ✗ dice qué condición falló |
| `Lint` | `npm run lint` (reglas de React Hooks y React Refresh) |
| `Pruebas` (frontend) | `npx vitest run <archivo>`; cambiar `mesa.json` puede romper `blender/logica.test.js` |
| `Build de producción` | `npm run build` localmente |
