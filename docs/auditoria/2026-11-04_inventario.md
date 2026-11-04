# Inventario del repositorio, archivo por archivo (4 de noviembre de 2026)

Revisa qué hay en el repo y qué falta en cada parte. Es la foto del día 2 de Hack4Edu, ya con Geoda, la biblioteca de recursos y la app de escritorio.

- **Archivo por archivo:** [`2026-11-04_inventario.csv`](2026-11-04_inventario.csv). Cada fila trae ruta, área, tipo, bytes, líneas, si es prueba, si alguna prueba lo cubre y cuántas marcas pendientes tiene. Se abre en Excel, Sheets o Deepnote.
- **Para regenerarlo:** `python herramientas/auditoria/inventario.py --csv docs/auditoria/inventario.csv --md resumen.md`.
- **Peso y consumo:** van aparte, en [la auditoría de peso](../rendimiento/2026-11-04_auditoria_peso.md).

## 1. Cifras globales

| | |
|---|--:|
| Archivos versionados | **1,472** |
| Peso en Git | **34.4 MB** (19.5 MB son la biblioteca de recursos) |
| Líneas de texto (código, documentación, datos) | **≈182,000** |
| Pruebas automáticas | **≈1,600**: 394 frontend, 446 backend, 594 motor y tablero, 48 biblioteca, más las del add-on dentro de Blender |
| Marcas TODO, FIXME, XXX o HACK en el código | **3**, todas en `frontend/scripts/revisar-publicacion.mjs`, donde son a propósito (es el detector de esas marcas) |

## 2. Mapa por áreas: qué hay y qué falta

**«Sin prueba que lo cubra»** quiere decir que ningún archivo de prueba lo nombra ni lo importa. Es una pista para revisar, no un veredicto: muchos módulos del motor se prueban a través de otros.

### Plataforma web (`frontend/`)

| Área | Qué hay | Estado | Qué falta |
|---|---|---|---|
| `src/pages` (31) | Portada, cursos, lección, panel, estudio, laboratorio, cuenta, administración y, **nuevas, Geoda y Biblioteca** | ✅ | 20 páginas sin prueba directa (Inicio, Curso, Panel, Estudio, Entrar, Registro…). Se prueban sus piezas, no la página entera. Conviene una prueba de humo por ruta con Playwright |
| `src/components` (151) | Lección (65), panel (20), gráficas (14), temas (12), administración (10), estructura y logos | 🟡 | Solo 17 pruebas para 134 componentes; los interactivos de la lección son los más expuestos |
| `src/geoda` (6, **nuevo**) | Huella del equipo, nivel N0–N4, perfiles, plan, script reversible para Blender, aplicar y deshacer en Amatista | ✅ 4 pruebas | Leer los perfiles medidos de G7B (`/api/g7b/v1/recomendacion`, T-198) en vez de solo las reglas base |
| `src/motor3d`, `src/estudio` | Motor web sobre A-Frame, Estudio con plantillas | ✅ | `componentes.js` tiene 863 líneas: partirlo por familia (cámaras, interacción, entorno) |
| `src/progreso`, `src/services`, `src/auth`, `src/lib` | Progreso local en IndexedDB, sincronización comprimida, sesión | ✅ | El proveedor de progreso (`ProgresoProvider.jsx`) no tiene prueba propia |
| `src/blender`, `src/goliat`, `src/avatares` | Puente con el add-on, asistente Goliat, avatares | 🟡 | Los hooks `useLanzador`, `useTaller` y `useLeccionEnBlender` no tienen prueba |
| `public/biblioteca` (430, **nuevo**) | 45 texturas (color, normal, rugosidad; 512 y 1K), 38 modelos y 19 animaciones glTF, todo CC0 | ✅ | Se pueden sumar texturas curadas de Poly Haven o ambientCG (T-193); la red del contenedor no las alcanzó |
| `pelicula/` | La película de Hack4Edu (solo en desarrollo) | ✅ | — |

### API (`backend/`)

| Área | Qué hay | Estado | Qué falta |
|---|---|---|---|
| `api` (20) | Cuentas, progreso, sincronización, contenido, add-on, taller, administración, buzón | ✅ 446 pruebas | `comun.py`, `dependencias.py`, `fusion.py` y `sesiones.py` se prueban de forma indirecta. `addon.py` y `contenido.py` superan las 1,100 líneas |
| `contenido` | Validación y plantillas de la Fórmula Amatista | ✅ 15/15 módulos | `validacion.py` tiene 1,495 líneas; partirlo por regla |
| `sql` (14) | Migraciones de Oracle | ✅ | `014_g7b.sql` con la tabla G7B_CACHE (T-196) |
| — | — | ⬜ | El puente con G7B: sincronización cada 6 h (T-197) y `/api/g7b/v1/*` (T-198) |

### Blender (`addon/`, `engine/`, `practices/`)

| Área | Qué hay | Estado | Qué falta |
|---|---|---|---|
| `addon/amatista_blender` (73) | Paneles, HUD, prácticas en vivo, taller, cuenta | 🟡 | 18 módulos sin prueba fuera de Blender (operadores, diálogos, visor). Su prueba real es `addon/tests/en_blender.py` (1,857 líneas) |
| — | — | ⬜ | Geoda dentro del add-on: leer `perfiles.json` y aplicar el perfil la primera vez, preguntando (T-188). Hoy el script se descarga desde la PWA |
| `engine/amatista_engine` (98) | Corazón 1.0, director, guía, currículo, adaptadores (Blender, Maya, 3ds Max simulados) | ✅ 594 pruebas | 60 módulos no se nombran en ninguna prueba; revisar los adaptadores `maya.py` y `max3ds.py` |
| `practices` (79) | 58 prácticas con su ejemplo resuelto, más el archivo histórico | ✅ 58/58 | — |

### Herramientas, escritorio y documentación

| Área | Qué hay | Estado | Qué falta |
|---|---|---|---|
| `herramientas/biblioteca` (**nuevo**) | Generador procedural de texturas, modelos y animaciones con su catálogo | ✅ 48 pruebas | — |
| `herramientas/auditoria` (**nuevo**) | `peso.cjs` (peso y consumo) e `inventario.py` (este documento) | ✅ | — |
| `escritorio` (**nuevo**) | App de escritorio con Electron: `main.js` y `empaquetar.mjs` | ✅ probado en Linux | Probar en Windows, firmar el `.exe` y ponerle su ícono |
| `tablero` | Tablero del Kanban | ✅ | — |
| `docs` (258) | Arquitectura, bitácora, despliegue, motor, plataforma, Hack4Edu | ✅ | `docs/historia` y `docs/investigacion` suman casi 1.8 MB, sobre todo imágenes; están bien ahí, solo hay que tenerlo en cuenta |
| `ai_tutor` | Solo `prompts/.gitkeep` | ⚪ | Carpeta vacía: Goliat vive en `frontend/src/goliat`. Borrarla o documentarla |
| `LICENSE` | — | ⬜ | **La plataforma no tiene licencia.** Hack4Edu suele pedir código abierto; hay que decidirla antes del viernes |

## 3. Huecos priorizados para el cierre de Hack4Edu (viernes 6)

1. **Licencia** del repo. Es una decisión de Maximiliano y la puede pedir el jurado.
2. **Consentimiento** antes de medir el equipo (T-187). Geoda ya funciona sin enviar nada, pero el aviso hace falta antes de mandar mediciones a G7B.
3. **Puente G7B → Amatista** (T-196 a T-198), para que Geoda use perfiles medidos y no solo las reglas base.
4. **Geoda en el add-on** (T-188). El script reversible ya existe; falta que el add-on lo aplique solo.
5. **Pruebas de humo por ruta** con Playwright: una por página. `peso.cjs` ya recorre las rutas clave y sirve de base.
6. **`.exe` en Windows real:** ejecutarlo, firmarlo y ponerle su ícono (GitHub Actions `windows-latest`).

## 4. Archivos de código con 600 líneas o más (candidatos a dividir)

| Archivo | Líneas |
|---|--:|
| `addon/tests/en_blender.py` | 1,857 |
| `backend/contenido/validacion.py` | 1,495 |
| `addon/amatista_blender/interfaz/paneles.py` | 1,374 |
| `backend/api/addon.py` | 1,159 |
| `backend/api/contenido.py` | 1,126 |
| `addon/amatista_blender/taller/sesion.py` | 1,055 |
| `backend/contenido/plantillas.py` | 995 |
| `addon/amatista_blender/practicas.py` | 989 |
| `engine/amatista_engine/practice/loader.py` | 959 |
| `frontend/src/motor3d/componentes.js` | 863 |
| `addon/amatista_blender/interfaz/hud.py` | 842 |

No es urgente: todos tienen pruebas. Conviene dividirlos al tocarlos.
