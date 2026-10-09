# Cronología exacta de Amatista

Cómo avanzó el proyecto, commit por commit, desde el primer archivo (27 de septiembre de 2026) hasta hoy. Para quien quiera saber **qué se hizo, cuándo, quién y en qué orden**.

Actualizado: 9 de octubre de 2026.

- [Cómo leer esta cronología](#cómo-leer-esta-cronología)
- [Resumen en una tabla](#resumen-en-una-tabla)
- [Etapa 0 · Prototipo (27 sep)](#etapa-0--prototipo-27-de-septiembre)
- [Etapa 1 · Integración (27–28 sep)](#etapa-1--integración-27-y-28-de-septiembre)
- [Etapa 2 · Plataforma educativa (28–29 sep)](#etapa-2--plataforma-educativa-28-y-29-de-septiembre)
- [Pausa y cambio de repositorio (30 sep – 1 oct)](#pausa-y-cambio-de-repositorio-30-de-septiembre-y-1-de-octubre)
- [Etapa 3 · Plataforma unificada v2.2 (1–2 oct)](#etapa-3--plataforma-unificada-v22-1-y-2-de-octubre)
- [Oracle en producción (2–3 oct)](#oracle-en-producción-2-y-3-de-octubre)
- [Etapa 4 · Reestructuración v3 (3 oct)](#etapa-4--reestructuración-v3-3-de-octubre)
- [Etapa 5 · Amatista Engine (3 oct)](#etapa-5--amatista-engine-3-de-octubre-tarde)
- [Etapa 6 · Motor etapa 2 y plataforma por módulos (3 oct)](#etapa-6--motor-etapa-2-y-plataforma-por-módulos-3-de-octubre-noche)
- [Etapa 7 · Documentación completa (4 oct)](#etapa-7--documentación-completa-4-de-octubre)
- [Etapa 10 · Integración plataforma-Blender (9 oct)](#etapa-10--integración-plataforma-blender-9-de-octubre)
- [Lo que viene](#lo-que-viene)
- [Números del proyecto](#números-del-proyecto)

---

## Cómo leer esta cronología

- **Horas en horario del centro de México (UTC−6)**, sacadas de la fecha de autor de cada commit (`TZ=America/Mexico_City git log`). Las bitácoras se nombran con la fecha UTC, por eso algunas dicen «2 de octubre» o «4 de octubre» para trabajo que en México fue la noche anterior.
- **Dos historiales.** El repositorio original (`MAXIMILIANO1234345/amatista`) vive en los tags `v0.1.0` a `v2.0.1`. El 1 de octubre el proyecto se volvió a subir al repositorio oficial `Maximiliano-cabello-mata/amatista` como un commit raíz nuevo (`71bdbb1`); desde ahí empieza la historia de `main`. Los tags antiguos siguen publicados y se pueden revisar con `git log v2.0.1`.
- Se omiten los 40 commits automáticos `chore(repo): actualizar tablero Kanban [skip ci]` del bot del tablero.
- **Personas.** `Kaneda343` y `MAXIMILIANO1234345` en el repositorio original; `MAXIMILIANO` / `MAXIMILIANO CABELLO MATA` (Maximiliano) en el oficial; `Claude` son las sesiones de Claude Code que trabajan en ramas `claude/*` y entran por PR.
- Cómo se veía la plataforma en cada punto: [la plataforma en cada versión](03_la_plataforma_en_cada_version.md). Qué idea originó cada cosa: [ideas y cómo se implementaron](02_ideas_y_como_se_implementaron.md).

## Resumen en una tabla

| Fecha | Etapa | Hito | Commit / PR | Tag |
|---|---|---|---|---|
| 27 sep | Prototipo | Monorepo, App Shell React + Tailwind y visor A-Frame | `0772159` (PR #4 original) | `v0.1.0` |
| 27 sep | Integración | React → FastAPI → Oracle, CORS, ORA-01400 resuelto | `87f6729` | — |
| 28 sep | Integración | Documentos fechados, CHANGELOG, investigación | `cde262b` (PR #9 original) | `v1.0.0` |
| 28–29 sep | Plataforma educativa | Identidad low poly, cursos, Módulo 1, progreso local, backend en el repo | `0ea0e8a` (PR #11 original) | `v2.0.0` |
| 1 oct | Repositorio oficial | Firma SSH y enlaces nuevos | `573ea89` | `v2.0.1` |
| 1 oct | Plataforma unificada | Proyecto subido al repositorio oficial con el tablero Kanban | `71bdbb1` | — |
| 1 oct | Plataforma unificada | Identidad, roles, Oracle 20 GB, cuentas, progreso adaptable, lecciones interactivas, panel del alumno, CI | PR #4, #6, #7 | `v2.2.0-alpha.1` (`f68c704`) |
| 1 oct | Plataforma unificada | Panel de administración | PR #8 | `v2.2.0-alpha.2` (`88dd539`, sin publicar) |
| 1–2 oct | Oracle | 002 corregida, JSON como texto, guía paso a paso, cierre del día | PR #11 | — |
| 3 oct | Reestructuración v3 | Niveles, versiones de Blender, herramientas de autor (005, 006), tablero nuevo | PR #12 (`2337fd5`) | `v3.0.0-alpha.1` (sin publicar) |
| 3 oct | Amatista Engine 1 | Motor, add-on de Blender, Oracle 007, práctica de la mesa | PR #13 (`ec849d8`) | `v3.0.0-alpha.2` (sin publicar) |
| 3 oct | Motor 2 y módulos | Guía paso a paso, acompañante, práctica al cierre de cada módulo, navegación fija | PR #14 (`d004071`) | `v3.0.0-alpha.3` (sin publicar) |
| 4 oct | Documentación | Historia, manual del código, esquema SQL, manual del desarrollador, README nuevo | PR #15 (`fe209e0`) | `v3.0.0-alpha.4` (sin publicar) |
| 4 oct | Contenido | Módulo 3 de Blender y la práctica del podio (luego archivados por el plan de estudios v3) | PR #16 (`81e9103`) | — |
| 4 oct | Motor v3 | Plan de estudios en dos cursos, add-on 3.0, Oracle 008/009, migración portable, dominio | PR #17 (`34af6f3`) | `v3.0.0-alpha.5` (sin publicar) |
| 4 oct | Curso unificado | Una tarjeta por curso con niveles, Intermedio publicado, jefes y medallas | PR #18 (`191a888`) | `v3.0.0-alpha.6` (sin publicar) |
| 4 oct | Temáticas | Un mundo por módulo, mascotas originales, Amatista Motor 3.2, prácticas registradas al arrancar | PR #19 (`927248c`) | `v3.0.0-alpha.7` (sin publicar) |
| 4 oct, noche | Seguridad, rendimiento y Motor 3.3 | Auditoría y rendimiento automáticos, modelo de referencia, personajes interactivos, plan de despliegue | PR #20 (`de22ee6`) | — |
| 4 oct, noche | Historia | Archivo histórico de la plataforma | PR #22 (`4576463`), `main` en `2402549` | `v3.0.0-alpha.8` (sin publicar) |

---

## Etapa 0 · Prototipo (27 de septiembre)

Repositorio original `MAXIMILIANO1234345/amatista`. Primer día de trabajo, todo en una tarde.

| Hora | Commit | Quién | Qué pasó |
|---|---|---|---|
| 11:24 | `5afb842` | Kaneda343 | **Primer commit**: inicialización de la PWA y arquitectura del backend (6 archivos, solo estructura) |
| 14:16 | `e2310d0` | MAXIMILIANO1234345 | Primer documento del proyecto |
| 14:24 | `53ebd97` | MAXIMILIANO1234345 | Mapa mental (`docs/arquitectura/2026-09-27_mindmap.png`) |
| 14:45 | `edca5a4` | MAXIMILIANO1234345 | Estándar de commits (hoy `docs/guias/2026-09-27_convencion_commits.txt`) |
| 15:00 | `d14a57f` → PR #1 | Kaneda343 | Estructura base del monorepo |
| 16:45 | `1a8955b` → PR #2 | Kaneda343 | `.gitkeep`, README inicial y plantilla `.env` |
| 17:22 | `7652a6c` → PR #3 | Kaneda343 | **App Shell**: React + Vite + Tailwind con visor 3D A-Frame (24 archivos, 3 600 líneas) |
| 17:28 | `ec00279` → PR #4 (`0772159`) | Kaneda343 | Documentación del App Shell. **Tag `v0.1.0`** |

## Etapa 1 · Integración (27 y 28 de septiembre)

La misma noche se conectó la PWA con un backend real y una base Oracle Autonomous.

| Fecha y hora | Commit | Quién | Qué pasó |
|---|---|---|---|
| 27/09 17:44 | `bf0a87f` | MAXIMILIANO1234345 | Recomendaciones de arquitectura (549 líneas) |
| 27/09 20:05 | `621b6f1` | MAXIMILIANO1234345 | Arquitectura de base de datos y backend |
| 27/09 20:34 | `5014c33` | MAXIMILIANO1234345 | README largo del proyecto (600 líneas) |
| 27/09 20:43 | `67f36a0` → PR #5 | Kaneda343 | **Conexión React → FastAPI → Oracle** con CORS resuelto |
| 27/09 20:54 | `965f005` → PR #6 | Claude | Primera sesión de Claude: indicador de estado corregido, migración a **Tailwind v4**, limpieza de duplicados |
| 27/09 22:15–23:12 | `af5b3ba`, `68e9893`, `c81344b` | MAXIMILIANO1234345 | Reportes subidos a mano (incidencias de puerto ocupado y CORS, investigación) |
| 27/09 22:55 | `87f6729` → PR #7 | Kaneda343 | **ORA-01400 resuelto** (llaves con `Identity`) y flujo de sesiones: usuario con ID autoincremental, sesión con UUID ([INC-001](../incidencias/2026-09-27_ora-01400-autoincremento.txt)) |
| 27/09 23:16 | `17c7b0a` → PR #8 | Claude | `docs/` organizado en carpetas; regresión del indicador corregida |
| 28/09 11:36 | `3b3e7c1` → PR #9 (`cde262b`) | Claude | Documentos con fecha en el nombre, `CHANGELOG.md`, investigación del desarrollo. **Tag `v1.0.0`** |

En esta versión el código del backend todavía no estaba en el repositorio (vivía en el servidor) y la PWA no funcionaba sin conexión.

## Etapa 2 · Plataforma educativa (28 y 29 de septiembre)

Amatista deja de ser una prueba técnica y se vuelve una plataforma para aprender.

| Fecha y hora | Commit | Quién | Qué pasó |
|---|---|---|---|
| 28/09 20:12 | `bfa28f6` → PR #10 | Claude | **Identidad low poly** estilo videojuego y pantalla «Elige tu curso»; PWA instalable con `vite-plugin-pwa`; A-Frame y fuentes por npm (30 archivos, 7 681 líneas) |
| 29/09 02:03 | `f187051` → PR #11 (`0ea0e8a`) | Claude | **Módulo 1** de Blender y de A-Frame, reproductor de lecciones (markdown, línea de tiempo, tarjetas, pipeline, código con vista 3D, examen), **progreso local** en IndexedDB con XP e insignias, y **el backend entra al repo** (FastAPI + SQLAlchemy, 14 pruebas, `001_esquema_amatista.sql`, `diagnostico_oracle.py`). **Tag `v2.0.0`** |

## Pausa y cambio de repositorio (30 de septiembre y 1 de octubre)

No hubo commits el 30 de septiembre. El 1 de octubre el proyecto pasa a la cuenta oficial.

| Fecha y hora | Commit / PR | Qué pasó |
|---|---|---|
| 01/10 14:38 | `7f24b05` → PR #1 (oficial) | Primer commit firmado con **SSH** |
| 01/10 17:15 | `6f3473a` → PR #2 (oficial, `573ea89`) | Enlaces al repositorio oficial `Maximiliano-cabello-mata/amatista`. **Tag `v2.0.1`** (reemplaza a un `v0.2.0` que apuntaba al mismo commit) |
| 01/10 17:44 | PR #3 (oficial) | Registro de la publicación de los tags (cierra T-001). Su commit quedó en el historial anterior |
| 01/10 18:58 | `71bdbb1` | **Nuevo inicio de `main`**: Maximiliano sube el proyecto completo (107 archivos, 16 302 líneas): lo de `v2.0.1` más el **tablero Kanban** (`tablero/actualizar.py`, `tablero/tareas.yml`) y la guía de versiones |
| 01/10 20:31 | `9b2e802` | Documento de optimización de BD, autenticación y escalabilidad (diseño de lo que serían 002–004) |

## Etapa 3 · Plataforma unificada v2.2 (1 y 2 de octubre)

Una sola noche de trabajo de Claude en la rama `claude/intelligent-darwin-3r4e2f` y luego en `claude/project-thread-*`.

| Hora (1 oct) | Commit / PR | Qué pasó |
|---|---|---|
| 20:47 | `e88624b` → **PR #4** | Identidad, roles (alumno, profesor, admin) y los 8 modelos de la plataforma unificada |
| 21:10 | `30348e0` | **Esquema Oracle para 20 GB** con migración incremental (`002`, `003`, `004`) |
| 21:13 | `f11c97b` | Punto de control de autenticación |
| 21:18 | PR #5 (rama `claude/project-thread-tclvj3`) | Autenticación en una rama paralela. **Se cerró sin fusionar** a las 22:32: `main` ya tenía una versión más completa |
| 22:10 | `b2a0eb0` → **PR #6** | **Cuentas de alumnos** (registro, inicio de sesión, confirmar correo, recuperar contraseña), fusión del progreso offline con la cuenta, **progreso adaptable** y **contenido administrable** por API y CLI (70 archivos, 11 512 líneas) |
| 22:27 | `cd7c7bc` → **PR #7** | **7 bloques interactivos** en el Módulo 1, **panel del alumno**, Kanban de contenido y **CI** en GitHub Actions. Tag **`v2.2.0-alpha.1`** en `f68c704` (publicado) |
| 23:04 | `9171822` → **PR #8** | **Panel de administración**: resumen, usuarios, contenido, editor de lecciones y sistema. Tag propuesto **`v2.2.0-alpha.2`** en `88dd539` |

## Oracle en producción (2 y 3 de octubre)

| Fecha y hora | Commit / PR | Qué pasó |
|---|---|---|
| 01/10 23:23 | `3374d51` (PR #9) | Probando contra un Oracle real en contenedor aparecieron dos fallas que SQLite no muestra: `SESIONES.ID` se quedaba en 36 caracteres (ORA-12899 al iniciar sesión) y las columnas `IS JSON` llegaban como diccionario. Ambas corregidas; guía [Oracle paso a paso](../despliegue/2026-10-02_oracle_paso_a_paso.md) |
| 02/10 00:20 | `54edda8`, `06912d8`, `a45d80c` (PR #10) | Documentación ordenada, bitácora del cierre, [registro de incidencias](../incidencias/README.md), tareas T-029 a T-033 para el piloto |
| 02/10 00:29–00:34 | `b1bbbc4`, `da47067`, `e3a430a` → **PR #11** (`ec52200`) | Los PR #9 y #10 se cierran y se juntan en **una sola rama de Claude**; desde aquí la regla es `main` + una rama de trabajo. [Bitácora de ramas](../bitacora/2026-10-02_ramas_y_cronologia.txt) |
| 02/10 00:39 | `7f4106a` | Maximiliano sube `INCIDENCIAS.txt` con lo que pasó al desplegar en la VM (hoy INC-010 en `docs/incidencias/`) |
| 2–3 oct | (servidor) | En la VM de Oracle Cloud se aplican 002 y 003 y se importa el catálogo; luego 005 y 006. Producción queda con **14 tablas** en el esquema `ADMIN` de Oracle 23.26 ([bitácora técnica del servidor](../bitacora/2026-10-03_bitacora_tecnica_v3_servidor.md)) |

## Etapa 4 · Reestructuración v3 (3 de octubre)

Ampliación, no reinicio: el curso se organiza por niveles y cada lección declara su versión de Blender.

| Hora (3 oct) | Commit / PR | Qué pasó |
|---|---|---|
| 14:34 | `486f5b5` | Oracle **005** (niveles, habilidades, rúbrica, versiones de Blender) y **006** (vistas y paquete `AMATISTA_AUTOR`), API de niveles y Blender, CLI `sembrar-niveles`, `mapa`, `nueva-leccion` |
| 14:44 | `53dec44` | [Plan maestro](../reestructuracion/00_plan_maestro.md), modelo de contenido, manual de Oracle, diseño del add-on; **tablero nuevo** (v2.2.0 piloto → v3.4.0) y el de la v2 archivado |
| 14:45 | **PR #12** (`2337fd5`) | Fusión. Tag propuesto **`v3.0.0-alpha.1`** |
| 15:58 | `9eb1f86` | Maximiliano sube su bitácora técnica completa del servidor (938 líneas) |

## Etapa 5 · Amatista Engine (3 de octubre, tarde)

| Hora (3 oct) | Commit / PR | Qué pasó |
|---|---|---|
| 17:49 | `161d85a` | Maximiliano sube el **prototipo del motor** (`amatista_engine/`, `demo.py`, `run_in_blender.py`, `practices/sandbox/table.json`) en la raíz del repo; el README de la raíz quedó sustituido por el del prototipo |
| 18:08 | `9abf1fd` | El motor se reorganiza en `engine/`, se amplía el núcleo y se recupera el README |
| 18:22 | `914f033` | **Add-on «Amatista» para Blender 4.2+**: modos Alumno, Vista previa y Author |
| 18:25 | `ee51067` | Constructor del `.zip` e **instalador por sistema** (Windows, macOS, Linux) |
| 18:36 | `32371fc` | Oracle **007** (vínculos, prácticas, versiones, progreso de prácticas) y API `/api/addon/v1` |
| 18:45 | `46294cf` | Página Blender, vinculación por código, bloque `blender_practice`, Admin › Prácticas y la práctica **«Construir una mesa»** en el módulo 2 |
| 18:52–19:15 | `96502b1`, `9c85396`, `d7dba28` | `docs/motor/`, manual de Oracle §10 y **007 probado en Oracle 23ai real** |
| 19:16 | **PR #13** (`ec849d8`) | Fusión. Tag propuesto **`v3.0.0-alpha.2`** |

## Etapa 6 · Motor etapa 2 y plataforma por módulos (3 de octubre, noche)

| Hora (3 oct) | Commit / PR | Qué pasó |
|---|---|---|
| 21:19 | `fb0b8ef` | **Motor etapa 2**: guía paso a paso, acompañante que felicita y avisa, acción «Hazlo conmigo»; add-on 0.3.0 |
| 21:31 | `0127f20` | **Plataforma por módulos**: la práctica de Blender cierra cada módulo (sin pestaña Blender), etiquetas comunes, herramientas Paso a paso, Atajos y Comparar (20 en total), panel agrupado |
| 21:42 | `81a17ff` | `docs/motor/etapas/` y `docs/plataforma/` |
| 21:56 | `0017a46` | **Estructura fija** Cursos · Mi panel · Admin; el «Laboratorio» pasa a Diagnóstico técnico en Admin › Estado; revisión de todos los documentos; tableros con estado real |
| 22:20 | **PR #14** (`d004071`) | Fusión. Tag propuesto **`v3.0.0-alpha.3`** |

## Etapa 7 · Documentación completa (4 de octubre)

Esta entrega: toda la documentación organizada por secciones ([índice](../README.md)), esta cronología, el documento de ideas, la revisión de cómo era la plataforma en los commits antiguos, el [manual del código](../manual-del-codigo/README.md), el [esquema SQL](../base-de-datos/README.md), las [herramientas de la plataforma](../herramientas-de-la-plataforma.md), el [manual del desarrollador](../desarrollador/README.md), la [bitácora del día](../bitacora/2026-10-04_documentacion_completa.md) y el README de la raíz reescrito. Tag propuesto **`v3.0.0-alpha.4`**. No cambia el comportamiento de la plataforma.

## Etapa 8 · Motor v3, cursos por niveles y temáticas (4 de octubre)

En un solo día, cuatro entregas sobre el motor y los cursos. El **PR #17** (16:02) llevó el plan de estudios de Blender a dos cursos con el add-on 3.0 como aula (Aprender · Practicar · Mi curso), los scripts 008 y 009, `migrar.py` y el dominio `amatista-3d.me`. El **PR #18** (16:58) juntó todo en una tarjeta «Blender» con árbol de niveles, publicó Intermedio, intercaló teoría y Blender y agregó jefes finales y medallas. El **PR #19** (18:21) arregló que solo apareciera la práctica de la mesa (el servidor ahora registra las prácticas al arrancar) y dio a cada módulo su mundo, su mascota y su jefe, con el add-on renombrado **Amatista Motor 3.2**. Detalle: [bitácora del motor v3](../bitacora/2026-10-04_motor_v3_plan_de_estudios.md) y [bitácora de temáticas](../bitacora/2026-10-05_temas_y_motor_3_2.md).

## Etapa 9 · Seguridad, rendimiento y Motor 3.3 (4 de octubre, noche)

El **PR #20** (23:20, hora de México; 5 de octubre en UTC) respondió a un pedido largo de Maximiliano: auditoría de seguridad automática (1,449 ataques, 0 hallazgos tras los arreglos), informe de rendimiento con optimizaciones (catálogo con 40 alumnos de 747 a 77 ms), protección del código del add-on y de la PWA, **Motor 3.3** con modelo de referencia (las figuras deben tener sentido y las medidas son aproximadas), cada lección vestida con el mundo de su módulo y un personaje interactivo, y un [plan de despliegue por fases](../despliegue/2026-10-05_plan_de_despliegue.md). El **PR #22** (23:35, de Copilot) agregó el [archivo histórico](04_archivo_historico_hasta_hoy.md). Detalle: [bitácora](../bitacora/2026-10-05_seguridad_rendimiento_motor.md).

## Etapa 10 · Integración plataforma-Blender (9 de octubre)

Bitácoras del 9 de octubre documentan tres avances seguidos:

- **Motor 3.4**: plataforma y Blender conectados con más control desde la PWA y modo enfocado para practicar.
- **Motor 3.5**: Blender como instructor, checklist de figura y práctica por escena.
- **Motor 3.5.1 / enfoque “el ejemplo manda”**: cada práctica con ejemplo resuelto en código y revisión autónoma contra ese ejemplo.

Referencias:
- [plataforma y Blender integrados](../bitacora/2026-10-09_plataforma_y_blender_integrados.md)
- [Blender como instructor](../bitacora/2026-10-09_blender_como_instructor.md)
- [el ejemplo manda](../bitacora/2026-10-09_el_ejemplo_manda.md)

## Lo que viene

| Fecha | Qué |
|---|---|
| 9 oct (estado actual) | Motor 3.4, 3.5 y 3.5.1 documentados en bitácora; foco en integración educativa plataforma-Blender |
| próximo bloque | Cierre operativo y despliegue: T-065, T-078, T-079, T-032 |
| siguiente versión | Examen final en servidor (T-083), optimización de portada móvil (T-080), varias aulas (T-081), curso avanzado (T-067) |

## Números del proyecto

| Dato | Valor (5 oct, `main` en `2402549`) |
|---|---|
| Días con commits | 7 (27, 28 y 29 de septiembre; 1, 2, 3 y 4 de octubre, en hora de México) |
| Commits en el repositorio original (`v2.0.1`) | 36 |
| Commits en `main` | 176, de ellos 70 del bot del tablero |
| PR fusionados en el repositorio oficial | 19 de 22 (#5 cerrado sin fusionar; #9 y #10 reunidos en #11; #21, del bot, cerrado) |
| Scripts de Oracle | 9 (`001`–`009`); 18 tablas con 007 |
| Tags publicados | `v0.1.0`, `v1.0.0`, `v2.0.0`, `v2.0.1`, `v2.2.0-alpha.1` |
| Tags preparados en `herramientas/crear-tags.sh` | `v2.2.0-alpha.2` y `v3.0.0-alpha.1` a `v3.0.0-alpha.8` |

Para reproducir cualquier dato: `TZ=America/Mexico_City git log --date=format-local:'%Y-%m-%d %H:%M' --format='%h %ad %an %s' v2.0.1` (historial original) y lo mismo con `main`.
