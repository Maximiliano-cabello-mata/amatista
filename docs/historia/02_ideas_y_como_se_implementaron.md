# Ideas del proyecto y cómo se implementaron

Inventario de todas las ideas que surgieron en Amatista (propuestas, bitácoras, documentos de arquitectura, plan de lanzamiento, especificaciones del motor, tableros y commits) y qué pasó con cada una: si está en el código, a medias, pendiente o si se descartó. Para quien necesite saber «¿esto ya existe?» antes de proponerlo o retomarlo.

Actualizado: 4 de octubre de 2026 (main en c730c0e)

**Cómo leer las fichas.** Cada idea tiene un código (`PP-01`, `OR-03`…) y cinco campos: **Idea**, **Origen** (fecha y documento o commit donde aparece por primera vez), **Estado**, **Cómo se implementó** y **Qué falta**. Estados:

| Estado | Significado |
|---|---|
| ✅ Implementada | Está en `main` y funciona (con pruebas o verificada en la bitácora). |
| 🟡 Parcial | Existe una parte (código, tabla, script) pero falta otra para que el alumno o el equipo la use completa. |
| ⏳ Pendiente | Solo existe en documentos; puede tener tarea en el tablero (`T-xxx`). |
| 🔁 Descartada o reemplazada | Se decidió no hacerla así; se dice por qué y qué la reemplazó. |

Las rutas de los archivos son relativas a la raíz del repositorio. Los commits se citan por su hash corto de `main` (historia del repositorio oficial, desde el 1 de octubre) o del tag `v2.0.1` (historia anterior, del 27 de septiembre al 1 de octubre, repositorio `MAXIMILIANO1234345/amatista`). Los PR #1 a #11 de septiembre pertenecen al repositorio anterior; los PR #1 a #14 de octubre, al oficial. La cronología completa está en [01_cronologia.md](01_cronologia.md).

## Índice

1. [Resumen: todas las ideas y su estado](#resumen-todas-las-ideas-y-su-estado)
2. [Producto y pedagogía](#1-producto-y-pedagogía)
3. [Contenido y la Fórmula Amatista](#2-contenido-y-la-fórmula-amatista)
4. [Niveles y versiones de Blender](#3-niveles-y-versiones-de-blender)
5. [Identidad visual](#4-identidad-visual)
6. [PWA y offline](#5-pwa-y-offline)
7. [Cuentas y roles](#6-cuentas-y-roles)
8. [Base de datos Oracle](#7-base-de-datos-oracle)
9. [Panel de administración](#8-panel-de-administración)
10. [Herramientas de enseñanza](#9-herramientas-de-enseñanza)
11. [Amatista Engine y add-on](#10-amatista-engine-y-add-on)
12. [Tablero, versiones y forma de trabajo](#11-tablero-versiones-y-forma-de-trabajo)
13. [Despliegue](#12-despliegue)
14. [Tutor IA](#13-tutor-ia)
15. [3D Lab y motor generativo](#14-3d-lab-y-motor-generativo)
16. [Otras](#15-otras)
17. [Ideas pendientes ordenadas por prioridad según el tablero](#ideas-pendientes-ordenadas-por-prioridad-según-el-tablero)
18. [Inconsistencias encontradas al revisar](#inconsistencias-encontradas-al-revisar)

## Resumen: todas las ideas y su estado

| Código | Idea | Estado | Tarea |
|---|---|---|---|
| PP-01 | Plataforma educativa offline-first Blender → GLB → A-Frame/WebXR | ✅ | — |
| PP-02 | Elegir una sola visión y reflejarla en README | ✅ | — |
| PP-03 | Gamificación: XP, niveles con título, racha, insignias, retos | ✅ | T-016 |
| PP-04 | Lecciones que se desbloquean en orden; curso A-Frame bloqueado | 🟡 | — |
| PP-05 | Un curso, cinco niveles (curso › nivel › módulo › lección › actividad) | 🟡 | T-039, T-041 |
| PP-06 | Diagnóstico opcional de entrada que recomienda un nivel | ⏳ | T-043 |
| PP-07 | Avance, experiencia y habilidades por separado | 🟡 | T-042 |
| PP-08 | Rúbrica común de proyecto A–E | 🟡 | T-042, T-048 |
| PP-09 | Primera entrega «Mi primer espacio 3D» (lecciones 01–12) | ⏳ | T-009, T-045…T-048 |
| PP-10 | Nivel 5 por especialidades | ⏳ | T-054 |
| PP-11 | Aula con pantalla dividida (teoría + visor + chat IA) | 🔁 | — |
| PP-12 | Galería de proyectos y Retos de la comunidad | ⏳ | — |
| PP-13 | Accesibilidad de los recursos (alt, no depender del color, menos movimiento) | 🟡 | — |
| PP-14 | Recorrido mínimo de punta a punta como MVP | 🟡 | T-029 |
| CF-01 | Contenido en JSON, un archivo por módulo, reproductor desacoplado | ✅ | — |
| CF-02 | Nueve bloques de contenido (markdown, tarjetas, línea de tiempo…) | ✅ | — |
| CF-03 | Ilustraciones low poly generadas en código | ✅ | — |
| CF-04 | Video en la lección «El Pipeline» | 🔁 | — |
| CF-05 | Editor de código con vista A-Frame en vivo y filtrada | ✅ | — |
| CF-06 | Examen con opciones barajadas, retroalimentación e insignia | ✅ | — |
| CF-07 | La Fórmula Amatista (Ciclo del Cristal, 5 pasos) | 🟡 | T-022 |
| CF-08 | Contenido administrable borrador → publicado → archivado | ✅ | T-019, T-033 |
| CF-09 | Progreso que se acopla al contenido nuevo (`replaces`, % recalculado) | ✅ | T-015 |
| CF-10 | Ficha de lección (objetivo, habilidades, versión verificada…) | 🟡 | T-039, T-044 |
| CF-11 | Estructura mínima de 10 pasos por lección y lección modelo | 🟡 | T-040 |
| CF-12 | Sección «Contenido» en el Kanban | ✅ | — |
| CF-13 | Módulo 2 de Blender y de A-Frame | 🟡 | T-009, T-010 |
| CF-14 | La práctica en Blender cierra cada módulo | ✅ | T-058 |
| NB-01 | Política de versiones de Blender y matriz de compatibilidad | 🟡 | T-038 |
| NB-02 | «Verificada en…» en cada lección | 🟡 | T-041 |
| NB-03 | Niveles de Blender en Oracle y `sembrar-niveles` | ✅ | T-034, T-035 |
| NB-04 | Herramientas de autor en Oracle (006, `AMATISTA_AUTOR`) | ✅ | T-036 |
| NB-05 | Registrar verificaciones de compatibilidad desde Blender | ✅ | T-053 |
| NB-06 | Blender 4.2 como versión mínima del add-on | ✅ | — |
| IV-01 | Paleta «Dark Mode» (#121212, #9B59B6, #00E5FF…) | ✅ | — |
| IV-02 | Tipografía Outfit/Inter y Fira Code/JetBrains Mono | ✅ | — |
| IV-03 | Bordes redondeados de 8 px, estilo «Flat Dark» | 🔁 | — |
| IV-04 | Concepto «Cristal de amatista low poly»: logo, fondo y cortes diagonales | ✅ | — |
| IV-05 | Pantalla de inicio estilo videojuego «Elige tu curso» | ✅ | — |
| IV-06 | Borde con resplandor morado para lecciones guardadas sin conexión | ⏳ | — |
| IV-07 | Sistema de etiquetas low poly común | ✅ | T-058 |
| IV-08 | Gráficas SVG propias sin dependencias | ✅ | T-016 |
| IV-09 | Compendio de herramientas visuales para reutilizar | 🟡 | — |
| PW-01 | Local primero: la plataforma funciona sin backend ni IA | ✅ | — |
| PW-02 | PWA instalable: manifest, service worker y precache | ✅ | — |
| PW-03 | A-Frame y fuentes con npm, carga bajo demanda y caché | ✅ | — |
| PW-04 | Progreso en IndexedDB que se sincroniza al volver la conexión | ✅ | T-015 |
| PW-05 | Botón «Instalar app» | ✅ | — |
| PW-06 | Gestor offline (almacenamiento, borrar caché) y descarga por módulo | ⏳ | (P04 en T-025) |
| PW-07 | Contratos tolerantes para PWA viejas en caché | ✅ | — |
| PW-08 | Catálogo combinado (empaquetado + servidor) guardado offline | ✅ | T-015 |
| PW-09 | WebXR (AR/VR) en móviles | ⏳ | — |
| PW-10 | Físicas en A-Frame | ⏳ | — |
| CR-01 | Autenticación real (contraseña, token, confirmación, recuperación) | ✅ | T-006 |
| CR-02 | Roles alumno / profesor / admin | ✅ | T-006 |
| CR-03 | Fusión del progreso anónimo con la cuenta | ✅ | T-006 |
| CR-04 | Correo SMTP y primer administrador | 🟡 | T-032 |
| CR-05 | Bloqueo tras intentos y límites por IP | ✅ | — |
| CR-06 | Profesor autenticado con cabecera `X-Sesion-Id` | 🔁 | — |
| CR-07 | El servidor toma la identidad de la sesión (un alumno no ve a otro) | ✅ | T-017, T-030 |
| OR-01 | Subir el backend al repositorio | ✅ | — |
| OR-02 | Oracle sin wallet: ACL por IP y TLS (`protocol="tcps"`) | ✅ | — |
| OR-03 | Migraciones con Alembic | 🔁 | — |
| OR-04 | Esquema 001 con ids de texto y diagnóstico | ✅ | — |
| OR-05 | Esquema optimizado para 20 GB (002) | ✅ | T-014, T-002 |
| OR-06 | Purga diaria y vista de espacio (003) | ✅ | T-014 |
| OR-07 | Usuario de aplicación con permisos mínimos (004) | 🟡 | T-004 |
| OR-08 | Migraciones solo aditivas e idempotentes | ✅ | — |
| OR-09 | Prohibido guardar binarios en Oracle | ✅ | — |
| OR-10 | Respaldo y restauración ensayada | ⏳ | T-023 |
| OR-11 | Reestructuración en Oracle (005 y 006) | ✅ | T-034…T-036 |
| OR-12 | Motor de prácticas en Oracle (007) | 🟡 | T-055 |
| OR-13 | Guardar las ayudas usadas en cada práctica (008) | ⏳ | T-060 |
| OR-14 | Probar contra Oracle real en contenedor | ✅ | — |
| PA-01 | Panel de administración con métricas del lanzamiento | ✅ | T-018 |
| PA-02 | Gestión de usuarios | ✅ | T-018 |
| PA-03 | Gestor de contenido y editor de lecciones con vista previa | ✅ | T-020 |
| PA-04 | Sistema: salud y purga | ✅ | — |
| PA-05 | Profesor en solo lectura | ✅ | — |
| PA-06 | Panel agrupado por tareas y página Herramientas | ✅ | T-058 |
| PA-07 | Admin › Prácticas de Blender | ✅ | T-050 |
| PA-08 | Laboratorio técnico → Diagnóstico técnico solo para el equipo | ✅ | — |
| PA-09 | Editor con ficha de lección y nivel del módulo | ⏳ | T-044 |
| PA-10 | Pantalla de gestión del desarrollador dentro de la PWA | ⏳ | — |
| HE-01 | Siete bloques interactivos | ✅ | T-021 |
| HE-02 | Paso a paso, Atajos de teclado (Pruébate) y Comparar | ✅ | T-058 |
| HE-03 | Catálogo de herramientas con «para qué» y «cuándo usarla» | ✅ | T-058 |
| HE-04 | Bloque `blender_practice` con «Prepara tu Blender» dentro | ✅ | T-058 |
| HE-05 | Mismas teclas en la web y en el add-on | ✅ | — |
| EN-01 | Add-on de Blender conectado a la plataforma | 🟡 | T-013 |
| EN-02 | Enviar scripts de Python desde la nube a Blender | 🔁 | — |
| EN-03 | Motor declarativo: «el motor se programa; las prácticas se describen» | ✅ | — |
| EN-04 | Tres modos: Author, Preview y Student | ✅ | T-051 |
| EN-05 | Representación intermedia (Practice IR) separada | 🟡 | — |
| EN-06 | Roles y etiquetas educativas en los objetos | ✅ | — |
| EN-07 | Detección automática de roles por geometría | 🟡 | — |
| EN-08 | Validadores reutilizables registrados | ✅ | — |
| EN-09 | Herramientas por nivel: ALLOW / WARN / BLOCK | 🟡 | — |
| EN-10 | Evaluación por eventos, no continua | 🟡 | — |
| EN-11 | Progreso ponderado y grafo de objetivos (`requires`) | ✅ | — |
| EN-12 | Pistas progresivas y medición de autonomía | ✅ | — |
| EN-13 | Diálogos y mensajes automáticos | ✅ | — |
| EN-14 | Evidencia: resumen de la escena, nunca el `.blend` | ✅ | — |
| EN-15 | El servidor vuelve a evaluar la escena | ✅ | — |
| EN-16 | Funciona sin conexión con cola de envíos | ✅ | — |
| EN-17 | Vincular la cuenta con un código (como un televisor) | ✅ | T-050 |
| EN-18 | Subir no es publicar; versiones de práctica | ✅ | — |
| EN-19 | Paquete con instalador por sistema | 🟡 | T-056 |
| EN-20 | Distribución por GitHub Releases | 🔁 | — |
| EN-21 | Motor de Desarrollo (Tagger, Inspector, Constructor, Depurador, Compilador) | ✅ | T-051 |
| EN-22 | Paquete de práctica (`starter.blend`, miniatura, media) | ⏳ | — |
| EN-23 | Etapa 2: guía paso a paso, acompañante y «Hazlo conmigo» | ✅ | T-057, T-059 |
| EN-24 | Ideas de la etapa 3 del motor | ⏳ | T-060 |
| EN-25 | Publicar en extensions.blender.org y licencia | 🟡 | — |
| EN-26 | Prueba del add-on dentro de `bpy` en CI | ✅ | — |
| EN-27 | Hacer la práctica sin Blender (`allowManual`) | 🟡 | — |
| TV-01 | Convención de commits `tipo(ámbito): descripción` | ✅ | — |
| TV-02 | Documentos fechados en carpetas por tipo | ✅ | — |
| TV-03 | CHANGELOG y tags por fases firmados | 🟡 | (INC-009) |
| TV-04 | Tablero Kanban movido por commits | ✅ | — |
| TV-05 | CI con lint, build y pruebas | ✅ | T-007 |
| TV-06 | Proteger `main` | ⏳ | T-008 |
| TV-07 | Revisión de PR por la otra persona | 🔁 | — |
| TV-08 | Rama `dev` de integración y `feature/motor-generativo` | 🔁 | — |
| TV-09 | Centro de dirección y una tarea a la vez | ✅ | — |
| TV-10 | Archivar el tablero al cambiar de etapa | ✅ | T-037 |
| TV-11 | Bloqueo, evidencia y aceptación en las tareas | ✅ | — |
| TV-12 | Registro numerado de incidencias | ✅ | — |
| TV-13 | Pruebas automáticas | ✅ | — |
| TV-14 | README completo, CONTRIBUTING, capturas, licencia | 🟡 | T-031 |
| TV-15 | Estructura fija: no reorganizar la página ni el repositorio cada vez | ✅ | — |
| DE-01 | Frontend en Cloudflare Pages | ⏳ | T-024 |
| DE-02 | API en VM de OCI (Always Free) | ✅ | — |
| DE-03 | Backend como servicio systemd | 🟡 | T-003 |
| DE-04 | HTTPS con proxy (Caddy) y DNS | ⏳ | T-005 |
| DE-05 | CORS limitado al frontend autorizado | 🟡 | T-005 |
| DE-06 | Script de actualización con vuelta atrás | ✅ | — |
| DE-07 | API en Render como alternativa | 🔁 | — |
| DE-08 | Entorno de pruebas con datos separados | ⏳ | — |
| DE-09 | Pruebas P01–P10, piloto y beta | ⏳ | T-025…T-027 |
| DE-10 | Guía de despliegue en OCI | ✅ | T-031 |
| DE-11 | Almacenamiento institucional para `.glb` y `.blend` | ⏳ | — |
| IA-01 | Tutor IA local con Ollama | ⏳ | T-012 |
| IA-02 | Tutor que genera y depura scripts `bpy` y corrige A-Frame | ⏳ | T-012 |
| IA-03 | Unir el tutor con el motor generativo | ⏳ | — |
| IA-04 | La IA nunca es requisito del núcleo | ✅ | — |
| LG-01 | Amatista 3D Lab (tres pilares) | 🟡 | T-011, T-012, T-013 |
| LG-02 | Visor GLB, escena de ejemplo y lección 12 | ⏳ | T-011, T-049 |
| LG-03 | Motor generativo 3D (texto → `bpy` → Blender headless → GLB) | ⏳ | — |
| OT-01 | Instrumentación de eventos y definición de alumno activo | ✅ | T-017 |
| OT-02 | Captación de alumnos y metas de activos | ⏳ | T-026…T-028 |
| OT-03 | Presupuesto de USD 0 al mes | 🟡 | — |
| OT-04 | Privacidad de los datos y solicitud de eliminación | ⏳ | — |

**Totales:** 153 ideas · 85 implementadas · 30 parciales · 28 pendientes · 10 descartadas o reemplazadas.

---

## 1. Producto y pedagogía

### PP-01 · Plataforma educativa offline-first del flujo Blender → GLB → A-Frame/WebXR
- **Idea:** enseñar a crear en 3D con Blender y llevarlo a la web con A-Frame, funcionando sin conexión. Definición propuesta: «plataforma educativa offline-first para aprendizaje práctico de creación 3D orientada a WebXR».
- **Origen:** 27 sep 2026, [`docs/arquitectura/2026-09-27_arquitectura_general.txt`](../arquitectura/2026-09-27_arquitectura_general.txt) y [recomendaciones de arquitectura](../arquitectura/2026-09-27_recomendaciones_arquitectura.txt) §13.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** PWA en `frontend/` con dos cursos (Blender y A-Frame), progreso local y sincronización (ver PW-01 a PW-04). Es la «dirección» vigente en [`PROYECTO.md`](../../PROYECTO.md) §1.
- **Qué falta:** la parte «GLB» del flujo (LG-02) y WebXR real (PW-09).

### PP-02 · Elegir una sola visión del producto
- **Idea:** el alcance cambió tres veces el 27 de septiembre (plataforma offline → motor generativo → 3D Lab); elegir una visión y reflejarla en el README.
- **Origen:** 27 sep, [`docs/bitacora/2026-09-27_investigacion_desarrollo.txt`](../bitacora/2026-09-27_investigacion_desarrollo.txt) §5–6.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `PROYECTO.md` fija el «producto principal» (plataforma educativa) y deja Tutor IA y motor generativo como «incrementos independientes»; el plan de lanzamiento del 1 oct dice que el motor generativo «no será requisito de apertura».
- **Qué falta:** nada.

### PP-03 · Gamificación: XP, niveles con título, racha, insignias y retos
- **Idea:** XP por lección y examen, insignia por módulo, racha diaria, niveles con títulos (Aprendiz, Modelador, Escultor, Arquitecto, Maestro del Cristal, Leyenda del Cristal) y retos semanales.
- **Origen:** 29 sep (XP e insignia, commit `f187051`); niveles y racha en el [contrato técnico](../arquitectura/2026-10-02_contrato_tecnico_plataforma.md) §4–5 del 2 oct.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/progreso/reglas.js` (`calcularXP`, `calcularNivel`, `calcularRacha`), `frontend/src/components/panel/retos.js` y `RetosPanel.jsx`; panel `#/panel` (`frontend/src/pages/Panel.jsx`). Tabla `LOGROS` en Oracle para las insignias. Commit `cd7c7bc` (PR #7), T-016.
- **Qué falta:** el XP del panel de administración no suma las actividades perfectas (decisión registrada en la [bitácora del 2 oct](../bitacora/2026-10-02_estado_plataforma_unificada.txt) §4).

### PP-04 · Lecciones que se desbloquean en orden y cursos como «mundos» bloqueados
- **Idea:** cada lección se abre al terminar la anterior; el curso de A-Frame bloqueado hasta terminar Blender.
- **Origen:** 28 sep, [`docs/arquitectura/2026-09-28_identidad_visual_interfaz.txt`](../arquitectura/2026-09-28_identidad_visual_interfaz.txt) §1 y §3.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** el desbloqueo de lecciones existe (`estaDesbloqueada` en `frontend/src/progreso/reglas.js`, con la regla de acople: una lección insertada no bloquea a quien ya avanzó). El bloqueo del curso de A-Frame se quitó el 29 sep: «El curso de A-Frame pasa de "bloqueado" a "disponible"» ([bitácora del 29 sep](../bitacora/2026-09-29_lecciones-y-progreso.txt)).
- **Qué falta:** nada planeado; la propuesta del 3 oct pide que los prerrequisitos **no** bloqueen la exploración.

### PP-05 · Un curso, cinco niveles
- **Idea:** jerarquía curso › nivel › módulo › lección › actividad; niveles 1 Desde cero, 2 Básico, 3 Consolidación, 4 Intermedio y 5 por especialidad; cada nivel cierra con proyecto y revisión de habilidades.
- **Origen:** 3 oct, [`docs/propuestas/2026-10-03_propuesta_contenido_blender.txt`](../propuestas/2026-10-03_propuesta_contenido_blender.txt) §3.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** tabla `NIVELES` y columna `MODULOS.NIVEL_ID` (`backend/sql/005_niveles_habilidades_versiones.sql`), `NIVELES_BLENDER` en `backend/contenido/plantillas.py`, API `backend/api/niveles.py` (`/api/contenido/niveles`, `/mapa/{curso}`), CLI `sembrar-niveles`. En producción desde el 3 oct: 8 niveles en **borrador** (T-035, [bitácora técnica](../bitacora/2026-10-03_bitacora_tecnica_v3_servidor.md) §18). Los módulos 1 y 2 de Blender llevan `"nivel": "blender-n1"` y la PWA solo muestra una etiqueta «Nivel N» en el encabezado del módulo (`textoNivel` en `frontend/src/components/etiquetas/catalogo.js`).
- **Qué falta:** asignar el contenido a niveles y llenar fichas (T-039), mapa de niveles en la PWA (T-041), publicar los niveles.

### PP-06 · Diagnóstico opcional de entrada
- **Idea:** preguntas breves y una práctica que recomiendan un nivel; el alumno puede elegir otro y el mapa completo sigue visible.
- **Origen:** 3 oct, propuesta de contenido §4.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** no existe código. Tarea T-043 (depende de T-041).
- **Qué falta:** todo.

### PP-07 · Avance, experiencia y habilidades por separado
- **Idea:** mostrar aparte avance (lecciones), experiencia (XP, racha) y habilidades demostradas, con estados sin practicar → con guía → con pistas → autónoma.
- **Origen:** 3 oct, propuesta §9; [modelo de contenido](../reestructuracion/01_modelo_de_contenido.md) §5.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** tablas `HABILIDADES` y `HABILIDADES_ALUMNO` (005). El add-on las actualiza al completar una práctica (`subir_habilidades` en `backend/api/addon.py`, como mucho hasta `con_pistas`); 007 siembra 4 habilidades `bl-*` del nivel 1. La práctica de la mesa calcula la autonomía (EN-12).
- **Qué falta:** API del alumno para habilidades y su vista en el panel (T-042).

### PP-08 · Rúbrica común A–E
- **Idea:** A cumple el objetivo · B aplica herramientas · C entrega revisable · D identifica y corrige un problema · E explica o adapta; cada criterio «pendiente / con ayuda / autónomo».
- **Origen:** 3 oct, propuesta §9.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** tabla `EVALUACIONES_RUBRICA` (005) y su modelo en `backend/database/modelos.py`. No hay endpoint ni pantalla que la use.
- **Qué falta:** T-042 (API y panel), T-048 (lecciones 10–11 con rúbrica).

### PP-09 · «Mi primer espacio 3D»
- **Idea:** primera entrega de 12 lecciones: preparar el entorno, navegar, transformar, habitación, guardar, mesa, edición de malla, lámpara y colores, cámara e iluminación, error preparado y variante, rúbrica, y exportar al laboratorio.
- **Origen:** 3 oct, propuesta §10.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** nada como tal. Lo más cercano es `frontend/src/data/modulos/blender-modulo-2.json` («Módulo 2: Interfaz y navegación», `estado: revision`, 3 lecciones con la práctica de la mesa al final).
- **Qué falta:** T-009 (01–03), T-045 (04–05), T-046 (06–07), T-047 (08–09), T-048 (10–11); la lección 12 va con el laboratorio (T-049).

### PP-10 · Nivel 5 por especialidad
- **Idea:** ramas web y videojuegos (prioridad), animación y rigging, visualización de producto, procedimientos y automatización.
- **Origen:** 3 oct, propuesta §3.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** solo existen los cuatro niveles vacíos `blender-n5-web`, `-animacion`, `-producto`, `-procedural` en borrador.
- **Qué falta:** decidir la primera rama (T-054, «decisión pendiente»).

### PP-11 · Aula interactiva con pantalla dividida
- **Idea:** en móvil pestañas; en escritorio pantalla dividida con teoría, visor 3D/código y chat IA.
- **Origen:** 27 sep, arquitectura general §2.3; App Shell con «Sidebar IA» en [reporte del App Shell](../bitacora/2026-09-27_reporte_app_shell.txt).
- **Estado:** 🔁 Reemplazada.
- **Cómo se implementó:** el aula se convirtió en el reproductor de lecciones por bloques (`frontend/src/pages/Leccion.jsx`) con vistas A-Frame dentro de los bloques. El chat IA nunca se conectó; el recuadro de tutor del Laboratorio se quitó el 4 oct (commit `0017a46`).
- **Qué falta:** si vuelve el tutor, entra como IA-01.

### PP-12 · Galería de proyectos y Retos de la comunidad
- **Idea:** espacios sociales en el panel del alumno.
- **Origen:** 2 oct, commit `cd7c7bc` («espacios para Tutor IA, Galería y Retos de la comunidad»).
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** solo tarjetas «Próximamente» en `frontend/src/components/panel/Proximamente.jsx`.
- **Qué falta:** todo; no tiene tarea en el tablero.

### PP-13 · Accesibilidad de recursos y de la interfaz
- **Idea:** texto alternativo, no depender solo del color, controles accesibles, alternativas a videos, instrucciones por menú además de atajos; animaciones que respeten «reducir movimiento».
- **Origen:** 28 sep (reducir movimiento, identidad visual §2); 3 oct, propuesta §7.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** animaciones que se desactivan con `prefers-reduced-motion` (identidad visual §2); gráficas accesibles por teclado y con tabla para lectores de pantalla (`frontend/src/components/graficas/`); el validador exige `alt` en las imágenes de los bloques que las usan (`backend/contenido/validacion.py`).
- **Qué falta:** la revisión de accesibilidad de cada recurso que pide la propuesta no tiene tarea propia; P07 (dispositivos y teclado) está dentro de T-025.

### PP-14 · Recorrido mínimo de punta a punta como MVP
- **Idea:** abrir → descargar lección → perder conexión → estudiar → ver 3D → actividad → guardar → reconectar → sincronizar. Desarrollar «verticalmente».
- **Origen:** 27 sep, recomendaciones de arquitectura §8, §14 y §15.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** todas las piezas existen y se probaron por separado (bitácora del 29 sep §3; 206+ pruebas el 2 oct). El recorrido completo anónimo → cuenta → offline → admin publica → acople no se ha ejecutado en navegador.
- **Qué falta:** T-029 (prueba de punta a punta) y P04 de T-025.

## 2. Contenido y la Fórmula Amatista

### CF-01 · Contenido en JSON y reproductor desacoplado
- **Idea:** un archivo JSON por módulo; agregar un módulo no exige tocar el reproductor. Ids de lección inmutables.
- **Origen:** 29 sep, [`docs/arquitectura/2026-09-29_formato-lecciones.txt`](../arquitectura/2026-09-29_formato-lecciones.txt); 1 oct, [informe de optimización](../arquitectura/2026-10-01_optimizacion_bd_autenticacion_y_escalabilidad.txt) §5.C.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/data/modulos/*.json` cargados con `import.meta.glob`; commit `f187051` (29 sep) y luego `b2a0eb0`. El id inmutable lo vigila la API (CF-08).
- **Qué falta:** nada.

### CF-02 · Nueve bloques de contenido
- **Idea:** `markdown_text`, `image`, `concept_cards` (se voltean), `timeline`, `pipeline`, `layers`, `callout`, `code_snippet`, `video_player`.
- **Origen:** 29 sep, formato de lecciones §3.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/components/leccion/` (`BloqueContenido.jsx` despacha). Commit `f187051`.
- **Qué falta:** nada.

### CF-03 · Ilustraciones low poly generadas en código
- **Idea:** SVG ligeros que funcionan sin conexión.
- **Origen:** 29 sep, bitácora de lecciones y progreso §1.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/scripts/ilustraciones.mjs` (`npm run ilustraciones`), salida en `frontend/public/ilustraciones/` (unos 150 KB en total según la bitácora).
- **Qué falta:** nada.

### CF-04 · Video en la lección «El Pipeline»
- **Idea:** un video explicativo en la lección.
- **Origen:** contenido del equipo del 29 sep (URL de ejemplo `cdn.plataforma.edu`).
- **Estado:** 🔁 Reemplazada.
- **Cómo se implementó:** la URL no existía; se reemplazó por una ilustración de los 6 pasos ([bitácora del 29 sep](../bitacora/2026-09-29_lecciones-y-progreso.txt) §2). El bloque `video_player` sigue disponible «solo con videos reales».
- **Qué falta:** un video real, si se quiere.

### CF-05 · Editor de código con vista 3D en vivo
- **Idea:** el alumno edita HTML de A-Frame y ve la escena; solo se copian etiquetas `<a-…>`, sin eventos ni scripts.
- **Origen:** 29 sep, commit `f187051`.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `code_snippet` con `"preview": true` y `frontend/src/components/leccion/VistaAFrame.jsx`; probado que un `onclick` o `<script>` no llegan a la escena (bitácora del 29 sep §3).
- **Qué falta:** nada.

### CF-06 · Examen con retroalimentación
- **Idea:** opciones barajadas en cada intento, retroalimentación por pregunta, aprobar con 80 % desbloquea la insignia.
- **Origen:** 29 sep, commit `f187051`.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/components/leccion/Examen.jsx`, `quizData.passingScore`.
- **Qué falta:** nada.

### CF-07 · La Fórmula Amatista (Ciclo del Cristal)
- **Idea:** cada módulo en cinco pasos: gancho (2–4 min), explora (5–8), práctica (6–10), reto (8–15) y jefe (examen); una idea por lección, ≤10 min, una interacción cada ~2 bloques de texto. El 4 oct se agregó: la práctica en Blender va después del reto y solo el examen puede seguirla.
- **Origen:** 2 oct, [contrato técnico](../arquitectura/2026-10-02_contrato_tecnico_plataforma.md) §4 y [`docs/arquitectura/2026-10-02_formula_modulos.txt`](../arquitectura/2026-10-02_formula_modulos.txt).
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** plantillas por paso en `backend/contenido/plantillas.py`; «generar esqueleto» al crear un módulo (`POST /api/contenido/modulos` con `generar_esqueleto`, botón en `#/admin/contenido`) y `contenido.py nuevo-modulo`. El módulo 2 de Blender usa `formula` en sus 3 lecciones. Bloques interactivos aplicados al módulo 1 (T-022, `cd7c7bc`).
- **Qué falta:** las lecciones del módulo 1 de Blender y de A-Frame **no** tienen el campo `formula` (la columna «Fórmula» del Kanban muestra «—»), aunque T-022 figura como hecha. Ver [inconsistencias](#inconsistencias-encontradas-al-revisar).

### CF-08 · Contenido administrable
- **Idea:** cursos, módulos y lecciones en la base con estados borrador / publicado / archivado; publicar solo si valida; archivar en vez de borrar; CLI para validar, importar y exportar.
- **Origen:** 2 oct, contrato técnico §2 («/api/contenido»).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `backend/api/contenido.py`, `backend/contenido/validacion.py`, `backend/herramientas/contenido.py` (`validar`, `importar`, `exportar`, `nuevo-modulo`, luego `nueva-leccion`, `mapa`, `sembrar-niveles`, `practicas`); catálogo público con ETag/304. Tablas `CURSOS`, `MODULOS`, `LECCIONES` (002). Commit `b2a0eb0`, T-019. Catálogo importado en producción el 2 oct (T-033, [INC-010](../incidencias/2026-10-02_despliegue-sql-v2.2-en-produccion.txt)).
- **Qué falta:** nada para esta idea.

### CF-09 · Progreso que se acopla al contenido nuevo
- **Idea:** una lección agregada no bloquea a quien ya avanzó; `replaces` traslada lo completado; el % se recalcula y aparece «Nueva»; lo ganado nunca se pierde.
- **Origen:** 2 oct, contrato técnico §5.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/progreso/reglas.js` con pruebas en `reglas.test.js`; validación de `replaces` en `backend/contenido/validacion.py`. Commit `b2a0eb0`, T-015.
- **Qué falta:** probarlo en el recorrido completo (T-029).

### CF-10 · Ficha de lección
- **Idea:** objetivo observable, habilidades, prerrequisitos, versión de Blender verificada, edición, archivo de práctica, comprobación, disponibilidad offline.
- **Origen:** 3 oct, propuesta §11 (campos de planificación); [modelo de contenido](../reestructuracion/01_modelo_de_contenido.md) §3.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** objeto `ficha` opcional validado en `backend/contenido/validacion.py`; `amatista_autor.guardar_ficha` (006); vista `V_AMATISTA_FICHAS_INCOMPLETAS`; `contenido.py mapa`. El módulo 2 de Blender trae fichas con habilidades.
- **Qué falta:** fichas del contenido publicado (T-039) y formulario en el editor (T-044). Publicar todavía no exige ficha completa (decisión documentada).

### CF-11 · Estructura de 10 pasos por lección y lección modelo
- **Idea:** objetivo, antes de empezar, resultado esperado, conceptos, práctica guiada, variante, errores y pistas, comprobación, evidencia, repaso.
- **Origen:** 3 oct, propuesta §6.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** el esqueleto existe en tres lugares que una prueba mantiene iguales: `leccion_estructurada()` (Python), `contenido.py nueva-leccion` y `amatista_autor.nueva_leccion` (Oracle 006).
- **Qué falta:** la lección modelo completa con recursos, rúbrica y verificación (T-040, depende de T-038).

### CF-12 · Kanban de contenido
- **Idea:** ver en el tablero el estado de cada módulo (borrador → revisión → publicado), lecciones, bloques interactivos y pasos de la Fórmula.
- **Origen:** 2 oct, commit `cd7c7bc`.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** sección «Contenido» que `tablero/actualizar.py` genera desde `frontend/src/data/modulos/*.json`.
- **Qué falta:** nada.

### CF-13 · Módulo 2 de Blender y de A-Frame
- **Idea:** segundo módulo de cada curso (Blender: interfaz y navegación; A-Frame: cargar modelos GLB).
- **Origen:** 29 sep (siguientes pasos, bitácora del 29 sep §4); T-009 y T-010 del tablero v2 (1 oct).
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** Blender: `blender-modulo-2.json` en revisión (no visible para alumnos) con «Amatista dentro de tu Blender», «Muévete por la vista 3D» y «Práctica: construye una mesa» (commit `46294cf`). A-Frame: nada.
- **Qué falta:** T-009 se replanteó como «Mi primer espacio 3D: lecciones 01–03»; T-010 pasó a la v3.2 (Laboratorio 3D). Publicar el módulo 2 de Blender va con T-055.

### CF-14 · La práctica en Blender cierra cada módulo
- **Idea:** «primero el módulo, luego la práctica»: en vez de una pestaña Blender suelta, cada módulo termina con su práctica; después solo el examen.
- **Origen:** 4 oct, pedido citado en [`docs/plataforma/README.md`](../plataforma/README.md) y [bitácora del 4 oct](../bitacora/2026-10-04_motor_etapa_2_y_plataforma.md).
- **Estado:** ✅ Implementada (en revisión en el tablero).
- **Cómo se implementó:** regla en `validar_modulo` (`backend/contenido/validacion.py`); `frontend/src/modulos/practica.js`, `components/modulo/RutaModulo.jsx` y `EstacionBlender.jsx`, `pages/Curso.jsx`. Commit `0127f20` (PR #14), T-058. Detalle: [02 · Módulos con práctica](../plataforma/02_modulos_y_practica.md).
- **Qué falta:** que el módulo 2 se publique (T-055).

## 3. Niveles y versiones de Blender

### NB-01 · Política de versiones de Blender y matriz de compatibilidad
- **Idea:** separar versión del software, del contenido y del add-on; categorías principal / compatible / sin verificar / retirada; matriz con sistema, versión de la lección, del add-on, resultado y evidencia.
- **Origen:** 3 oct, propuesta §5.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** tablas `VERSIONES_BLENDER` y `VERIFICACIONES_BLENDER` (005), vista `V_AMATISTA_COMPATIBILIDAD` (006), API `backend/api/blender.py` (`/api/blender/versiones`, `/verificaciones`, `/compatibilidad`). En producción `/api/blender/versiones` responde `{"principal": null, "versiones": []}` a propósito (bitácora técnica §21).
- **Qué falta:** elegir la versión LTS principal con nota del soporte oficial (T-038, bloqueada por decisión de Maximiliano).

### NB-02 · «Verificada en…» en cada lección
- **Idea:** cada lección indica la versión de Blender con la que se probó y sus diferencias.
- **Origen:** 3 oct, propuesta §5.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** campo `ficha.blender.verificadaEn` validado; cuenta para «ficha completa» en cursos de Blender.
- **Qué falta:** mostrarlo en la PWA (T-041).

### NB-03 · Niveles en Oracle
- **Idea:** crear los niveles en la base sin sobrescribir lo editado después.
- **Origen:** 3 oct, plan maestro §2.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `contenido.py sembrar-niveles` (y al `importar`), `POST /api/contenido/niveles/sembrar`, `amatista_autor.guardar_nivel`. Commit `486f5b5` (T-034); en producción el 3 oct (T-035).
- **Qué falta:** publicar los niveles cuando tengan contenido.

### NB-04 · Herramientas de autor en Oracle
- **Idea:** crear niveles, asignar módulos, registrar habilidades, generar lecciones, llenar fichas, copiar lecciones y registrar versiones desde Database Actions.
- **Origen:** 3 oct, pedido de Maximiliano registrado en la [bitácora del 3 oct](../bitacora/2026-10-03_estado_y_reestructuracion.md) §2.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `backend/sql/006_herramientas_autor.sql`: paquete `AMATISTA_AUTOR` y vistas `V_AMATISTA_MAPA`, `V_AMATISTA_FICHAS_INCOMPLETAS`, `V_AMATISTA_COMPATIBILIDAD`; `VALID` en producción. Recetas en el [manual de Oracle](../reestructuracion/02_manual_oracle.md) §5. Publicar lecciones desde Oracle **no** se permite a propósito (publicar valida en el backend). T-036.
- **Qué falta:** nada.

### NB-05 · Registrar verificaciones desde Blender
- **Idea:** el equipo anota en la matriz qué versión de Blender, sistema y add-on probó.
- **Origen:** 3 oct, [guía del add-on](../reestructuracion/03_addon_blender.md) §9 (paso E4).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** Amatista Author › Registrar verificación envía `POST /api/blender/verificaciones` (PR #13). T-053.
- **Qué falta:** nada.

### NB-06 · Blender 4.2 como mínimo
- **Idea:** usar la plataforma de extensiones (`blender_manifest.toml`) de Blender 4.2+.
- **Origen:** 3 oct, guía del add-on §3.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `addon/amatista_blender/blender_manifest.toml`; el instalador comprueba la versión (`addon/herramientas/instalador/`).
- **Qué falta:** la versión principal del curso sigue abierta (T-038).

## 4. Identidad visual

### IV-01 · Paleta «Dark Mode»
- **Idea:** fondo #121212 (OLED), superficie #1E1E1E, amatista #9B59B6, neón #00E5FF, texto #E0E0E0; el 28 sep se sumaron amatista claro #C39BD3 y naranja Blender #F5792A.
- **Origen:** 27 sep, arquitectura general §3 y [mapa mental](../arquitectura/2026-09-27_mindmap.png).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/tailwind.config.js` con Tailwind v4 (commit `965f005`, 27/28 sep).
- **Qué falta:** nada.

### IV-02 · Tipografía
- **Idea:** Outfit o Inter para la interfaz; Fira Code o JetBrains Mono para el código.
- **Origen:** 27 sep, arquitectura general §3.
- **Estado:** ✅ Implementada (se eligió Outfit y JetBrains Mono).
- **Cómo se implementó:** paquetes `@fontsource-variable` importados en `frontend/src/main.jsx`, sin Google Fonts (commit `bfa28f6`).
- **Qué falta:** nada.

### IV-03 · Bordes redondeados de 8 px y «Flat Dark»
- **Idea:** componentes con radio de 8 px y sin sombras.
- **Origen:** 27 sep, arquitectura general §3.
- **Estado:** 🔁 Reemplazada.
- **Cómo se implementó:** el 28 sep la identidad pasó a esquinas cortadas en diagonal (`.corte-poly`, `.corte-poly-sm`) y hexágonos ([identidad visual](../arquitectura/2026-09-28_identidad_visual_interfaz.txt) §2).
- **Qué falta:** nada.

### IV-04 · «Cristal de amatista low poly»
- **Idea:** logo de cristal de 6 caras con filo neón; fondo de triángulos generado en código con semilla fija; íconos propios sin logotipos de terceros.
- **Origen:** 27 sep (concepto); 28 sep (identidad visual).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/public/icons/amatista.svg`, `frontend/src/components/FondoLowPoly.jsx`, `frontend/src/components/Iconos.jsx`. Commit `bfa28f6`.
- **Qué falta:** nada.

### IV-05 · Inicio estilo videojuego «Elige tu curso»
- **Idea:** los cursos como mundos en una pantalla de selección de nivel.
- **Origen:** 28 sep, identidad visual §1 y §3.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/pages/Inicio.jsx` (commit `bfa28f6`); rediseñado el 2 oct con la propuesta de valor, «Continuar» y la Fórmula (`cd7c7bc`).
- **Qué falta:** nada.

### IV-06 · Resplandor morado para lo guardado localmente
- **Idea:** borde con resplandor #9B59B6 cuando una lección está disponible en almacenamiento local.
- **Origen:** 27 sep, arquitectura general §3 («Estados»).
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** no encontré ese estado visual en `frontend/src/`; hoy todo el contenido empaquetado está disponible offline, así que no hay lecciones «descargadas» y «no descargadas» que distinguir. Depende de PW-06.
- **Qué falta:** sin tarea.

### IV-07 · Sistema de etiquetas común
- **Idea:** la misma etiqueta (tipo de lección, práctica, guía, nivel, duración, estado) para alumno, profesor y administrador.
- **Origen:** 4 oct, pedido «diseñar etiquetas y gráficos nuevos» (bitácora del 4 oct).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/components/etiquetas/` (`Etiqueta.jsx`, `catalogo.js`, `IconosEtiqueta.jsx`). Commit `0127f20`. Documentado en [03 · Etiquetas y gráficos](../plataforma/03_etiquetas_y_graficos.md).
- **Qué falta:** nada.

### IV-08 · Gráficas SVG propias
- **Idea:** anillo, barras, mapa de calor y medidor sin librerías pesadas, accesibles.
- **Origen:** 2 oct, contrato técnico §5 («gráficas en SVG propio»).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/components/graficas/` con pruebas (`cd7c7bc`).
- **Qué falta:** nada.

### IV-09 · Compendio de herramientas visuales
- **Idea:** reunir el código de las piezas visuales y un recetario JSON por bloque para reutilizarlos en otras lecciones o proyectos.
- **Origen:** documento `compendio/herramientas-visuales.md` de la carpeta compartida del proyecto (copiado de `main` en `f68c704`, 2 oct).
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** existe solo en la carpeta compartida, fuera del repositorio. Dentro del repositorio cumplen esa función `GET /api/contenido/plantillas`, `frontend/src/data/herramientas.js` y la página Admin › Herramientas (HE-03).
- **Qué falta:** el compendio está desactualizado: describe 9 + 7 bloques y no los 20 actuales ni las etiquetas, la ruta del módulo o las herramientas del 4 oct.

## 5. PWA y offline

### PW-01 · Local primero
- **Idea:** las funciones educativas no dependen del backend ni del tutor IA.
- **Origen:** 27 sep, recomendaciones de arquitectura §2 y §15.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** catálogo empaquetado, progreso en IndexedDB (`frontend/src/lib/almacen.js`), alumnos anónimos con id del dispositivo `alumno-<uuid>` que siguen funcionando sin cuenta (contrato técnico §1).
- **Qué falta:** nada.

### PW-02 · PWA instalable con service worker
- **Idea:** manifest, service worker y caché del App Shell; antes estaban vacíos.
- **Origen:** 27 sep (riesgo «la PWA aún no funciona sin conexión», [resumen del 27 sep](../bitacora/2026-09-27_resumen.txt)); meta v0.2.0 de la investigación.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `vite-plugin-pwa` en `frontend/vite.config.js`, precache de ~380 KB (commit `bfa28f6`, 28/29 sep).
- **Qué falta:** probar la actualización del service worker sin perder progreso en producción (T-024, P06).

### PW-03 · A-Frame y fuentes empaquetados, carga bajo demanda
- **Idea:** dejar el CDN; A-Frame (~1,3 MB) solo donde se usa y en caché para usarlo offline; recursos pesados fuera del precache con `runtimeCaching` CacheFirst.
- **Origen:** 27 sep (meta v0.2.0) y 1 oct (informe de optimización §5.C).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `aframe` con npm, chunk aparte; `runtimeCaching` con `handler: 'CacheFirst'` en `frontend/vite.config.js`.
- **Qué falta:** nada.

### PW-04 · Progreso local que se sincroniza
- **Idea:** guardar en el dispositivo, sumar XP y enviar a `/api/progreso` cuando hay conexión, sin duplicar ni perder.
- **Origen:** 27 sep (recomendaciones §8); primera versión el 29 sep.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** v1 en `f187051`; v2 con migración sin pérdida, almacenamiento por identidad, token y cola de eventos en `frontend/src/progreso/ProgresoProvider.jsx` (`b2a0eb0`). Servidor con upsert monotónico (`backend/api/progreso.py`) y eventos deduplicados por id (`backend/api/eventos.py`).
- **Qué falta:** P05 (sincronización con cortes y dos dispositivos) dentro de T-025.

### PW-05 · Botón «Instalar app»
- **Idea:** ofrecer la instalación cuando el navegador lo permite.
- **Origen:** 28 sep, identidad visual §3.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/hooks/useInstalarPWA.js` (`beforeinstallprompt`) y `BarraSuperior.jsx`.
- **Qué falta:** nada.

### PW-06 · Gestor offline y descarga por módulo
- **Idea:** pantalla para controlar el almacenamiento local y borrar caché; botones de descarga por módulo; «preparación explícita del contenido que se promete offline».
- **Origen:** 27 sep, arquitectura general §2 (secciones 2 y 4) y recomendaciones §9; 1 oct, plan de lanzamiento §3 y P04.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** no hay página de gestor offline (`frontend/src/pages/` no la tiene). El contenido empaquetado ya funciona offline sin descargarlo aparte.
- **Qué falta:** la prueba P04 (T-025) debe confirmar qué se promete offline; la pantalla no tiene tarea.

### PW-07 · Contratos tolerantes
- **Idea:** todo campo nuevo es opcional para que una PWA vieja en caché siga sincronizando sin errores 422.
- **Origen:** 1 oct, informe de optimización §5.A.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** esquemas de `backend/api/progreso.py` y `eventos.py` con campos opcionales (contrato técnico §2); `POST /api/iniciar-sesion` heredado se conserva para PWA viejas (`backend/api/sesiones.py`).
- **Qué falta:** nada.

### PW-08 · Catálogo combinado y guardado offline
- **Idea:** el catálogo empaquetado más el del servidor, guardado en IndexedDB.
- **Origen:** 28 sep («después vendrán del backend y se guardarán en IndexedDB», identidad visual §4); contrato técnico §5.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/catalogo/CatalogoProvider.jsx` (`combinarCatalogos`) y ETag del servidor. T-015.
- **Qué falta:** nada.

### PW-09 · WebXR en móviles (AR/VR)
- **Idea:** visualización inmersiva en el navegador.
- **Origen:** 27 sep, [propuesta 3D Lab](../propuestas/2026-09-27_amatista_3d_lab.txt) pilar A.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** las escenas A-Frame de las lecciones son `embedded`; el explorador 3D desactiva el botón VR (`'vr-mode-ui': 'enabled: false'` en `EscenaAFrame.jsx`). El plan de lanzamiento dejó fuera «promesas de AR/VR en todos los dispositivos».
- **Qué falta:** sin tarea propia; encaja en la v3.2 (Laboratorio 3D).

### PW-10 · Físicas en A-Frame
- **Idea:** «renderizado en tiempo real de modelos, iluminación y físicas».
- **Origen:** 27 sep, propuesta 3D Lab; el resumen del 27 sep advierte que necesita un componente adicional.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** nada.
- **Qué falta:** sin tarea.

## 6. Cuentas y roles

### CR-01 · Autenticación real
- **Idea:** el 27 sep `/api/iniciar-sesion` pedía solo un correo; hacía falta contraseña y token antes de sincronizar progreso o conectar el add-on.
- **Origen:** 27 sep, resumen del 27 sep §3; diseño el 1 oct (informe de optimización §4).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `backend/api/auth.py` (registro, iniciar y cerrar sesión, cerrar todas, `/yo`, confirmar correo, reenviar código, recuperar, restablecer, cambiar contraseña), `backend/seguridad.py` (PBKDF2-SHA256 de 600 000 iteraciones, tokens opacos guardados como SHA-256, códigos de 6 dígitos con hash y caducidad). Páginas `frontend/src/pages/cuenta/`. Commits `e88624b`, `f11c97b`, `b2a0eb0` (PR #4, #6, #7). T-006. El PR #5 (otra versión en rama aparte) se cerró sin fusionar.
- **Qué falta:** revisión de seguridad (T-030).

### CR-02 · Roles alumno / profesor / admin
- **Idea:** alumno ve lo suyo; profesor lee alumnos y métricas; admin todo.
- **Origen:** 1 oct, informe de optimización §4.C.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** columna `ROL` en `USUARIOS` (002), `requiere_rol` en `backend/api/dependencias.py`.
- **Qué falta:** nada.

### CR-03 · Fusión offline → cuenta
- **Idea:** al registrarse, la fila anónima del dispositivo se convierte en la cuenta; al entrar desde otro dispositivo su progreso anónimo se une sin retroceder.
- **Origen:** 1 oct, informe de optimización §4.A.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `backend/api/fusion.py` (reglas monotónicas, `fusionado_en`). T-006.
- **Qué falta:** probar con dos dispositivos reales (T-029, P05).

### CR-04 · Correo SMTP y primer administrador
- **Idea:** códigos por SMTP con STARTTLS; primer admin por variable `AMATISTA_ADMINS` o CLI.
- **Origen:** 1 oct (SMTP, informe §4.B); 2 oct (contrato técnico §1).
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** `backend/api/correo.py`, `backend/herramientas/crear_admin.py`. Sin `SMTP_HOST` no se envía nada; `AMATISTA_MOSTRAR_CODIGOS=1` solo para desarrollo.
- **Qué falta:** configurar `SMTP_*` y `AMATISTA_ADMINS` en el servidor (T-032).

### CR-05 · Bloqueo y límites por IP
- **Idea:** 5 contraseñas incorrectas → 15 min de bloqueo; límites por IP con 429.
- **Origen:** 2 oct, contrato técnico §1.
- **Estado:** ✅ Implementada (límites más amplios que los 10/min del contrato, porque un salón sale con una sola IP).
- **Cómo se implementó:** `backend/api/limites.py`, constantes `LIMITE_*` en `backend/api/auth.py`.
- **Qué falta:** nada.

### CR-06 · Profesor autenticado con `X-Sesion-Id`
- **Idea:** el profesor leería `GET /api/usuarios` enviando la cabecera `X-Sesion-Id`.
- **Origen:** 1 oct, informe de optimización §4.C.
- **Estado:** 🔁 Reemplazada.
- **Cómo se implementó:** se usa `Authorization: Bearer <token>` para todos los roles (contrato técnico §2) y las rutas de profesor están bajo `/api/admin`.
- **Qué falta:** nada.

### CR-07 · La identidad la pone el servidor
- **Idea:** un alumno no puede leer ni escribir el progreso de otro cambiando `usuario_id` (prueba P02).
- **Origen:** 1 oct, plan de lanzamiento §7 (P02).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `resolver_alumno` y `puede_ver_alumno` en `backend/api/dependencias.py`; pruebas del backend. T-017.
- **Qué falta:** la evidencia formal de P02 va en T-025 y T-030.

## 7. Base de datos Oracle

### OR-01 · El backend en el repositorio
- **Idea:** el 27 sep `main.py`, los modelos y `connection.py` solo vivían en la VM: «es la prioridad número 1».
- **Origen:** 27 sep, resumen del 27 sep §2 e investigación §5.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** commit `f187051` (29 sep): FastAPI + SQLAlchemy (Oracle o SQLite), 14 pruebas, `backend/sql/001_esquema_amatista.sql` y `diagnostico_oracle.py`.
- **Qué falta:** nada.

### OR-02 · Oracle sin wallet
- **Idea:** ACL que admite solo la IP de la VM para pasar de mTLS a TLS, con `protocol="tcps"`.
- **Origen:** 27 sep, [backend y base de datos](../arquitectura/2026-09-27_backend_y_base_de_datos.txt) fases 1–3.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** en la configuración de OCI y en `backend/database/conexion.py`. Consecuencia: no se puede probar contra el Oracle real fuera de la VM (INC-008).
- **Qué falta:** nada.

### OR-03 · Migraciones con Alembic
- **Idea:** dejar de cambiar el esquema borrando tablas (`force_reset.py`) y usar Alembic.
- **Origen:** 27 sep, resumen del 27 sep §3.
- **Estado:** 🔁 Reemplazada.
- **Cómo se implementó:** scripts SQL numerados, incrementales e idempotentes (`backend/sql/002`…`007`) que se ejecutan en Database Actions; `tests/test_esquema.py` mantiene alineados modelos, SQL y diagnóstico.
- **Qué falta:** nada.

### OR-04 · Esquema 001 con ids de texto
- **Idea:** unificar los ids en `VARCHAR2` para evitar ORA-01722 y ORA-02267.
- **Origen:** 29 sep, [diagnóstico](../incidencias/2026-09-29_diagnostico-oracle-progreso.txt) (INC-003/004); 1 oct, informe §3.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `backend/sql/001_esquema_amatista.sql`. Regla: **nunca** ejecutar 001 sobre datos reales (`backend/sql/LEEME.txt`).
- **Qué falta:** nada.

### OR-05 · Esquema optimizado para 20 GB
- **Idea:** texto plano estructurado, una fila por alumno y lección, `datos_ligeros` ≤250 caracteres, logros como IOT, eventos particionados por mes, contenido JSON con `IS JSON`; presupuesto de ~12 KB por alumno.
- **Origen:** 1 oct, informe de optimización §2–3.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `backend/sql/002_autenticacion_contenido_eventos.sql` (commit `30348e0`), corregido en `3374d51` (ampliar `SESIONES.ID` a 64, INC-005). En producción desde el 2 oct (T-002, INC-010).
- **Qué falta:** nada.

### OR-06 · Purga y vigilancia del espacio
- **Idea:** purgar sesiones viejas y meses de eventos; ver el % usado de los 20 GB.
- **Origen:** 1 oct, informe §6.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `backend/sql/003_mantenimiento.sql` (job `DBMS_SCHEDULER`, vista `V_AMATISTA_ESPACIO`); purga también desde `POST /api/admin/mantenimiento/purgar`. En producción desde el 2 oct.
- **Qué falta:** nada.

### OR-07 · Usuario de aplicación (dejar de usar ADMIN)
- **Idea:** la API se conecta con un usuario con permisos mínimos.
- **Origen:** 27 sep, resumen §3; plan de lanzamiento §6 paso 4.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** `backend/sql/004_usuario_aplicacion.sql` (`AMATISTA_APP`) y `DB_ESQUEMA` en `backend/database/conexion.py`; 005 y 007 dan permisos a ese usuario si existe. Probado en contenedor.
- **Qué falta:** producción sigue con `ADMIN` (T-004).

### OR-08 · Migraciones solo aditivas
- **Idea:** con alumnos reales, prohibido `DROP TABLE`; todo cambio es un script numerado con `ALTER … ADD`.
- **Origen:** 1 oct, informe §5.B.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** 002 a 007 verifican el diccionario antes de cada cambio y se pueden repetir; 005 y 006 se aplicaron en producción conservando los datos (bitácora técnica §15).
- **Qué falta:** nada.

### OR-09 · Nada de binarios en Oracle
- **Idea:** ni `.glb`, ni imágenes, ni `.blend`, ni logs crudos.
- **Origen:** 1 oct, informe §2.A.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** se respeta en todo el diseño: la evidencia del add-on son datos de la escena (EN-14) y los paquetes del add-on se arman al vuelo.
- **Qué falta:** decidir dónde irían los archivos pesados (DE-11).

### OR-10 · Respaldo y restauración ensayada
- **Idea:** respaldo diario y restauración en menos de dos horas, ensayada.
- **Origen:** 1 oct, plan de lanzamiento §6 pasos 1 y 15.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** el manual pide un respaldo antes de cada script; el ensayo no se ha hecho.
- **Qué falta:** T-023.

### OR-11 · Reestructuración en Oracle (005 y 006)
- **Idea:** niveles, habilidades, rúbrica, versiones de Blender y herramientas de autor sin perder datos.
- **Origen:** 3 oct, pedido de Maximiliano (bitácora del 3 oct §2).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** 6 tablas y `MODULOS.NIVEL_ID` (005), vistas y paquete (006). Commits `486f5b5` y `53dec44` (PR #12, fusión `2337fd5`). Producción: 14 tablas el 3 oct. Tres errores de Oracle corregidos antes de entregar (INC-011).
- **Qué falta:** nada.

### OR-12 · Motor de prácticas en Oracle (007)
- **Idea:** registrar en Oracle los vínculos del add-on, las prácticas con sus versiones y el progreso por práctica.
- **Origen:** 3 oct 23:53, pedido de Maximiliano ([bitácora del 4 oct](../bitacora/2026-10-04_amatista_engine.md)).
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** `backend/sql/007_motor_practicas.sql`: `ADDON_VINCULOS`, `PRACTICAS`, `PRACTICA_VERSIONES`, `PROGRESO_PRACTICAS`, vista `V_AMATISTA_PRACTICAS` (18 tablas). Commit `32371fc`. Probado en Oracle 23ai en contenedor.
- **Qué falta:** ejecutarlo en producción después del piloto (T-055).

### OR-13 · Guardar las ayudas usadas (008)
- **Idea:** registrar cuántas veces cada alumno usó «Hazlo conmigo» o «Muéstrame» y mostrarlo al profesor.
- **Origen:** 4 oct, [etapa 2 del motor](../motor/etapas/etapa-2.md) («Qué sigue»).
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** las ayudas viajan en el intento como dato informativo y el servidor hoy las ignora.
- **Qué falta:** T-060 (script 008 aditivo).

### OR-14 · Probar contra Oracle real en contenedor
- **Idea:** como la ACL impide conectarse al Oracle de producción desde fuera de la VM, reproducir los errores con un Oracle local.
- **Origen:** 2 oct, [INC-008](../incidencias/2026-10-02_oracle-sesiones-id-json-y-enlaces.txt).
- **Estado:** ✅ Implementada (como práctica de trabajo).
- **Cómo se implementó:** contenedor `gvenzl/oracle-free:23-slim-faststart`; así se probaron 002, 005, 006 y 007 ([manual de Oracle](../reestructuracion/02_manual_oracle.md)).
- **Qué falta:** nada.

## 8. Panel de administración

### PA-01 · Resumen con métricas del lanzamiento
- **Idea:** registros, activaciones, activos semanales, retención de semana 2, embudo, serie diaria y avance por curso, con las definiciones del plan.
- **Origen:** 1 oct, plan de lanzamiento §9 y §11; contrato técnico §2 (`/api/admin/resumen`).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `backend/api/admin.py` y `frontend/src/pages/admin/Resumen.jsx` (commits `b2a0eb0` y `9171822`, PR #8). T-018.
- **Qué falta:** el informe semanal con datos reales (T-028).

### PA-02 · Gestión de usuarios
- **Idea:** buscar, filtrar, ver detalle, cambiar rol, marcar cuentas de prueba, confirmar correo.
- **Origen:** 2 oct, contrato técnico §2.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/pages/admin/Usuarios.jsx` y `Usuario.jsx`.
- **Qué falta:** nada.

### PA-03 · Gestor de contenido y editor de lecciones
- **Idea:** árbol cursos → módulos → lecciones; crear módulo con la Fórmula; editor con paleta de bloques, JSON por bloque y vista previa.
- **Origen:** 2 oct, contrato técnico §2.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/pages/admin/Contenido.jsx` y `EditorLeccion.jsx` (PR #8). T-020.
- **Qué falta:** ficha y nivel como formulario (PA-09).

### PA-04 · Sistema: salud y purga
- **Origen:** 2 oct, contrato técnico §2 (`/salud-detallada`, `/mantenimiento/purgar`).
- **Idea:** ver filas por tabla y purgar sesiones y eventos viejos.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/pages/admin/Sistema.jsx` (`#/admin/sistema`, solo admin).
- **Qué falta:** nada.

### PA-05 · Profesor en solo lectura
- **Idea:** el profesor ve todo el panel pero no modifica; el servidor revisa el rol en cada petición.
- **Origen:** 2 oct, contrato técnico §2.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `requiere_rol` en el backend y botones ocultos en `pages/admin/`.
- **Qué falta:** nada.

### PA-06 · Panel agrupado y página Herramientas
- **Idea:** organizar por lo que se viene a hacer (Enseñanza, Personas, Sistema) y mostrar cada herramienta con vista previa y JSON.
- **Origen:** 4 oct, pedido «organizar mejor el panel» (bitácora del 4 oct).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/components/admin/NavAdmin.jsx`, `pages/admin/Herramientas.jsx`, `frontend/src/data/herramientas.js`. Commit `0127f20`. [05 · Panel de administración](../plataforma/05_panel_de_administracion.md).
- **Qué falta:** nada.

### PA-07 · Admin › Prácticas de Blender
- **Idea:** ver las prácticas registradas, su historial de versiones y publicar.
- **Origen:** 3 oct 23:53, pedido del motor.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/pages/admin/Practicas.jsx` sobre `/api/addon/v1` (commit `46294cf`).
- **Qué falta:** publicar la mesa en producción (T-055).

### PA-08 · Del Laboratorio técnico al Diagnóstico técnico
- **Idea:** la página de pruebas con el panel de Oracle, una sesión de prueba y un recuadro de tutor IA sin conectar no debe verse como parte del producto.
- **Origen:** 28 sep (nace como «Laboratorio técnico», identidad visual §3); 4 oct, pedido «no poner cosas solo para probar».
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/pages/Laboratorio.jsx` solo para profesor y admin (`esProfesor`), sin botones de prueba, enlazada desde Admin › Estado. Commit `0017a46`.
- **Qué falta:** nada. El «laboratorio 3D» para alumnos es otra idea (LG-02).

### PA-09 · Editor con ficha y nivel
- **Idea:** llenar la ficha y asignar el nivel sin tocar JSON.
- **Origen:** 3 oct, plan maestro fase B.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** hoy se edita el JSON a mano en el editor.
- **Qué falta:** T-044.

### PA-10 · Pantalla de gestión del desarrollador en la PWA
- **Idea:** llevar el centro de dirección (tareas, prioridades) a una pantalla de la PWA.
- **Origen:** 1 oct, [`PROYECTO.md`](../../PROYECTO.md) §9 («ampliación posterior si aporta valor»).
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** nada; la gestión se hace con `tablero/` y `KANBAN.md`.
- **Qué falta:** sin tarea.

## 9. Herramientas de enseñanza

### HE-01 · Siete bloques interactivos
- **Idea:** `quiz_inline`, `ordering`, `matching`, `fill_blanks`, `hotspots`, `scene_explorer` (A-Frame con controles y meta) y `code_challenge` (checks con DOMParser); la lección se completa al resolver los requeridos.
- **Origen:** 2 oct, contrato técnico §3.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/components/leccion/interactivos/` y validación en `backend/contenido/validacion.py`. Commit `cd7c7bc`. T-021.
- **Qué falta:** capturas en navegador de cada bloque (pendiente desde la bitácora del 2 oct §2.3).

### HE-02 · Paso a paso, Atajos de teclado y Comparar
- **Idea:** herramientas que preparan para Blender: procedimiento con teclas, tabla de atajos con modo «Pruébate» y comparación lado a lado.
- **Origen:** 4 oct, pedido «mejores herramientas de enseñanza en el administrador».
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** bloques `step_by_step`, `shortcuts` y `compare` en el frontend y validados en el servidor; ejemplos en `backend/contenido/plantillas.py`. Commit `0127f20`. [04 · Herramientas de enseñanza](../plataforma/04_herramientas_de_ensenanza.md).
- **Qué falta:** nada.

### HE-03 · Catálogo con «para qué» y «cuándo usarla»
- **Idea:** cada herramienta con su categoría, uso y paso de la Fórmula.
- **Origen:** 4 oct.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/data/herramientas.js` y `GET /api/contenido/plantillas`.
- **Qué falta:** nada.

### HE-04 · Bloque `blender_practice` con «Prepara tu Blender»
- **Idea:** la práctica de Blender es una lección; descargar, abrir Blender y escribir el código se hace dentro de la misma tarjeta.
- **Origen:** 3 oct 23:53 (bloque) y 4 oct (preparación dentro de la práctica).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/components/leccion/interactivos/PracticaBlender.jsx`, `frontend/src/blender/PrepararBlender.jsx`; el avance se consulta cada pocos segundos. Commits `46294cf` y `0127f20`.
- **Qué falta:** nada.

### HE-05 · Las mismas teclas en la web y en Blender
- **Idea:** dibujar las teclas igual en la lección y en la tarjeta del add-on.
- **Origen:** 4 oct, [03 · Etiquetas y gráficos](../plataforma/03_etiquetas_y_graficos.md).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `frontend/src/components/leccion/Tecla.jsx` y la tarjeta de `addon/amatista_blender/interfaz/hud.py`.
- **Qué falta:** nada.

## 10. Amatista Engine y add-on

### EN-01 · Add-on de Blender conectado a la plataforma
- **Idea:** puente entre la PWA y Blender de escritorio, con cuentas sincronizadas («la idea más valiosa», resumen del 27 sep).
- **Origen:** 27 sep, propuesta 3D Lab pilar B; diseño el 3 oct en la [guía del add-on](../reestructuracion/03_addon_blender.md).
- **Estado:** 🟡 Parcial (código completo, sin publicar).
- **Cómo se implementó:** `addon/amatista_blender/` (extensión «Amatista» 0.3.0), API `backend/api/addon.py` (`/api/addon/v1`). PR #13 (`ec849d8`) y PR #14 (`d004071`). Se adelantó a las fases B y C a pedido de Maximiliano (plan maestro §3).
- **Qué falta:** T-013 (MVP publicado), que espera T-055, T-056 y T-052.

### EN-02 · Enviar scripts de Python desde la nube a Blender
- **Idea:** el add-on recibiría y ejecutaría scripts y modelos enviados desde la nube (con confirmación, según el resumen del 27 sep).
- **Origen:** 27 sep, propuesta 3D Lab pilar B.
- **Estado:** 🔁 Descartada.
- **Cómo se implementó:** descartada por seguridad en la guía del add-on §1 («un servidor comprometido podría ejecutar cualquier cosa») y en el concepto del motor §29: «las prácticas contienen datos, no código remoto ejecutable». Un validador desconocido no se ejecuta: el add-on pide actualizarse.
- **Qué falta:** nada.

### EN-03 · Motor declarativo
- **Idea:** «el motor se programa; las prácticas se describen»: una práctica nueva no exige código.
- **Origen:** 3 oct, [concepto de Amatista Engine](../motor/especificaciones/2026-10-03_amatista_engine_concepto.md) §1; el prototipo llegó con `9eb1f86` y `161d85a` («Add files via upload»).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `engine/amatista_engine/` en Python puro (sin `bpy`), formato `amatista.practice/1`, primera práctica `practices/blender/level_1/mesa.json`. Commit `9abf1fd`. Referencia: [docs/motor/](../motor/README.md).
- **Qué falta:** nada para la idea; más prácticas.

### EN-04 · Tres modos sobre un solo motor
- **Idea:** Author (diseñar), Preview (simular al alumno) y Student (hacer la práctica).
- **Origen:** 3 oct, concepto §4–7.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** modos Alumno, Vista previa y Author en el add-on (commit `914f033`); el modo Desarrollador lo ve un profesor o admin, y subir exige ese rol.
- **Qué falta:** nada.

### EN-05 · Representación intermedia (Practice IR)
- **Idea:** compilar el JSON de autor a un formato de ejecución aparte (`amatista.practice.runtime/1`) para poder cambiar el editor sin tocar el runtime.
- **Origen:** 3 oct, concepto §9.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** hay cargador y compilador con errores en español (`engine/amatista_engine/practice/loader.py`, `compiler.py`); `PRACTICA_VERSIONES` guarda la «definición compilada». No encontré un esquema `runtime/1` separado.
- **Qué falta:** sin tarea; no se ha necesitado.

### EN-06 · Roles y etiquetas educativas
- **Idea:** marcar objetos con `amatista_role`, etiquetas e «ignorar», para no depender de nombres como `Cube.001`.
- **Origen:** 3 oct, concepto §10 y [Motor de Desarrollo v0.1](../motor/especificaciones/2026-10-03_motor_de_desarrollo_v0.1.md) §6–9.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `engine/amatista_engine/blender/tagger.py` (`amatista_role`, `amatista_tags`, `amatista_ignore`) y el Tagger del modo Author; los roles se declaran en la práctica.
- **Qué falta:** nada.

### EN-07 · Detección automática de roles
- **Idea:** proponer roles por geometría (vertical, debajo de la cubierta, dimensiones) con confianza determinista.
- **Origen:** 3 oct, concepto §11.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** la guía de la etapa 2 resalta en neón «lo que podría servir» y busca un candidato a cubierta (`engine/amatista_engine/guide/coach.py`, pruebas en `engine/tests/test_guia.py`). No hay una clasificación `role_candidate` que el autor corrija.
- **Qué falta:** sin tarea.

### EN-08 · Validadores reutilizables
- **Idea:** capacidades genéricas registradas una vez (objeto existe, cantidad por rol, dimensión, modificador, archivo guardado…).
- **Origen:** 3 oct, concepto §12.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** 18 validadores en `engine/amatista_engine/validators/builtin.py`: `object.exists`, `object.count`, `role.exists`, `role.count`, `dimension.range`, `object.position`, `object.rotation`, `transform.scale_applied`, `spatial.below`, `mesh.vertex_count`, `mesh.face_count`, `modifier.exists`, `material.exists`, `collection.contains`, `scene.camera_exists`, `scene.light_exists`, `file.saved`, `file.named`.
- **Qué falta:** los que pidan prácticas futuras (el concepto pone de ejemplo `uv.exists`).

### EN-09 · Herramientas por nivel (ALLOW / WARN / BLOCK)
- **Idea:** catálogo central de herramientas con atajo y nivel mínimo; advertir (no bloquear) si se usa una de un nivel posterior; bloquear solo si una actividad lo exige.
- **Origen:** 3 oct, concepto §13–14.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** `engine/amatista_engine/tools/catalogo.json` y `registry.py` con `ALLOW` y `WARN`; el add-on muestra el diálogo de herramienta de otro nivel.
- **Qué falta:** `BLOCK` no existe (la política declarada es «advertir, no bloquear»).

### EN-10 · Evaluación por eventos
- **Idea:** no evaluar 60 veces por segundo; cada validador declara qué eventos lo invalidan.
- **Origen:** 3 oct, concepto §16.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** los validadores declaran `watch` y el motor ofrece `targets_for_event` (`engine/amatista_engine/engine.py`). El add-on escucha el depsgraph y reevalúa tras 0,4 s de calma (`addon/amatista_blender/practicas.py`), además de al guardar y abrir.
- **Qué falta:** sin tarea; funciona con la escena pequeña de la mesa.

### EN-11 · Progreso ponderado y grafo de objetivos
- **Idea:** pesos por objetivo y dependencias `requires` que deciden cuál es el paso actual.
- **Origen:** 3 oct, concepto §17, §23–24.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `engine/amatista_engine/progress.py`, `pedagogy/graph.py`; el compilador detecta ciclos y pesos incorrectos.
- **Qué falta:** nada.

### EN-12 · Pistas progresivas y autonomía
- **Idea:** pistas de la general al paso a paso; registrar hasta qué pista llegó el alumno y clasificar con guía / con pistas / autónomo.
- **Origen:** 3 oct, concepto §18–20.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `engine/amatista_engine/pedagogy/hints.py` y `skills.py`; el servidor sube las habilidades como mucho a `con_pistas`.
- **Qué falta:** nada.

### EN-13 · Diálogos y mensajes automáticos
- **Idea:** mensajes generados por plantillas («2 / 4 patas, te faltan dos») que el autor puede sustituir; diálogos educativos.
- **Origen:** 3 oct, concepto §21–22; Motor de Desarrollo §15.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** campo `messages {pass, fail}` por objetivo (`practice/loader.py`); entrenadores por validador con frases y «números amables» (`guide/coach.py`); diálogos del add-on (bienvenida, pista, completada, herramienta de otro nivel, «Así se hace este paso», «¿Te ayudo?»). Los diálogos son fijos del add-on, no un formato `trigger` en el JSON.
- **Qué falta:** nada.

### EN-14 · Evidencia sin subir el `.blend`
- **Idea:** enviar un resumen educativo de la escena, nunca el archivo ni imágenes.
- **Origen:** 3 oct, concepto §25; guía del add-on §1.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** foto de la escena con nombres, medidas, roles, materiales, modificadores y si el archivo está guardado (`engine/amatista_engine/snapshot.py`).
- **Qué falta:** nada.

### EN-15 · El servidor vuelve a evaluar
- **Idea:** que el resultado guardado no dependa de lo que diga el cliente.
- **Origen:** 4 oct, al construir (guía del add-on §11).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `POST /api/addon/v1/intentos` evalúa la foto con el mismo motor; Oracle guarda el resultado del servidor y la versión de práctica usada.
- **Qué falta:** nada.

### EN-16 · Sin conexión y cola de envíos
- **Idea:** la práctica descargada funciona offline y los resultados se sincronizan al volver.
- **Origen:** 3 oct, concepto §26; guía del add-on §2.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `addon/amatista_blender/red.py` y `cuenta.py` (red en hilos, cola en la carpeta de datos de la extensión, respeta `bpy.app.online_access`).
- **Qué falta:** nada.

### EN-17 · Vincular con un código
- **Idea:** como en las televisiones: Blender muestra un código, el alumno lo confirma en la PWA; Blender nunca ve la contraseña.
- **Origen:** 3 oct, guía del add-on §5.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** tabla `ADDON_VINCULOS` (007), `#/vincular` (`frontend/src/pages/Vincular.jsx`), sesión propia del add-on limitada a `/api/addon/` y `/api/blender/`; consulta con un secreto que solo conoce el add-on; el paquete descargado con sesión trae un vínculo de un solo uso (7 días). T-050.
- **Qué falta:** nada.

### EN-18 · Subir no es publicar
- **Idea:** cada subida desde Author crea una versión en borrador; solo un admin publica.
- **Origen:** 4 oct, al construir.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `PRACTICAS.VERSION_PUBLICADA` y `PRACTICA_VERSIONES`; `contenido.py practicas --publicar` y Admin › Prácticas.
- **Qué falta:** nada.

### EN-19 · Paquete con instalador por sistema
- **Idea:** descargar un paquete que encuentre Blender, compruebe la versión, instale y conecte solo.
- **Origen:** 3 oct 23:53, pedido «paquete descargable con instalación automática y comprobación de compatibilidad».
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** `addon/herramientas/construir.py` (extensión `.zip` con el motor dentro y paquetes Windows `.bat`, macOS `.command`, Linux `.sh` con bytes reproducibles) y `addon/herramientas/instalador/`. Commit `ee51067`. Probado instalando en Blender 5.0.1.
- **Qué falta:** probar en Windows y macOS reales (T-056).

### EN-20 · Distribución por GitHub Releases
- **Idea:** publicar el `.zip` del add-on en Releases.
- **Origen:** 3 oct, concepto §31; guía del add-on §10.
- **Estado:** 🔁 Reemplazada.
- **Cómo se implementó:** la API arma los paquetes al vuelo y ofrece un repositorio de extensiones (`…/api/addon/v1/extensiones/index.json`) para que Blender avise de actualizaciones. Sin binarios en git.
- **Qué falta:** nada.

### EN-21 · Motor de Desarrollo
- **Idea:** Tagger, Inspector, Constructor de objetivos, pistas y consejos, grafo, Depurador, validación en vivo, Compilador y exportación a `practice.json`.
- **Origen:** 3 oct, [Motor de Desarrollo v0.1](../motor/especificaciones/2026-10-03_motor_de_desarrollo_v0.1.md) (DEV-01 a DEV-09).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** modo Desarrollador del add-on (`addon/amatista_blender/autor.py`, `desarrollo.py`), con borrador dentro del `.blend`, «Usar sus medidas», 1 a 6 pistas y **Subir a Amatista**. Commit `914f033`. [06 · Modo desarrollador](../motor/referencia/06_modo_desarrollador.md).
- **Qué falta:** nada.

### EN-22 · Paquete de práctica
- **Idea:** que una práctica traiga `starter.blend`, `reference.blend`, miniatura y media.
- **Origen:** 3 oct, Motor de Desarrollo §22–23.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** hoy una práctica es solo JSON.
- **Qué falta:** sin tarea.

### EN-23 · Etapa 2: el motor que acompaña
- **Idea:** «que sea un acompañamiento más que una exigencia»: explicar el paso con teclas, señalar en la escena, ofrecer ayuda.
- **Origen:** 4 oct 03:04, pedido citado en [etapa 2](../motor/etapas/etapa-2.md).
- **Estado:** ✅ Implementada (en `main` desde el PR #14).
- **Cómo se implementó:** `engine/amatista_engine/guide/` (entrenadores por validador y acompañante), campo `guide {why, steps}` en los objetivos, mesa versión 2; add-on 0.3.0 con tarjeta «Ahora», guía dibujada en la vista 3D (`interfaz/visor3d.py`), «Hazlo conmigo», «Muéstrame» y tres modos de acompañamiento. Commit `fb0b8ef`. T-057.
- **Qué falta:** probarla en un Blender real con GPU y poner capturas reales (T-059); las imágenes actuales son maquetas.

### EN-24 · Ideas de la etapa 3
- **Idea:** guardar las ayudas en Oracle, entrenadores para `mesh.*`, `collection.contains`, cámara y luz, vista web de la guía en el bloque `blender_practice`, narración por voz y capturas reales.
- **Origen:** 4 oct, etapa 2 («Qué sigue»).
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** nada.
- **Qué falta:** T-060 (ayudas) y T-059 (capturas); el resto sin tarea.

### EN-25 · Publicar en extensions.blender.org y licencia
- **Idea:** decidir distribución pública y licencia compatible con GPL.
- **Origen:** 3 oct, guía del add-on §3 y §10.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** `addon/` declara `GPL-3.0-or-later` en el manifiesto.
- **Qué falta:** publicar en extensions.blender.org (sin tarea); el resto del repositorio sigue sin licencia (no hay `LICENSE`).

### EN-26 · Probar el add-on dentro de `bpy` en CI
- **Idea:** probar sin instalar Blender completo.
- **Origen:** 3 oct, guía del add-on §8.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** job `addon-blender` en `.github/workflows/ci.yml` con `pip install bpy==5.0.1` y `addon/tests/en_blender.py`.
- **Qué falta:** nada.

### EN-27 · Practicar sin Blender (`allowManual`)
- **Idea:** «el primer recorrido debe poder completarse sin add-on».
- **Origen:** 3 oct, propuesta §8 y plan maestro §3.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** el bloque `blender_practice` admite `allowManual` (validado en `backend/contenido/validacion.py`); en la mesa está en `false`.
- **Qué falta:** decidirlo antes de publicar el módulo 2 (plan maestro §3).

## 11. Tablero, versiones y forma de trabajo

### TV-01 · Convención de commits
- **Idea:** `tipo(ámbito): descripción` con tipos feat, fix, docs, refactor, chore y ámbitos pwa, api, db, ia, repo.
- **Origen:** 27 sep, [`docs/guias/2026-09-27_convencion_commits.txt`](../guias/2026-09-27_convencion_commits.txt) (commit `edca5a4`).
- **Estado:** ✅ Implementada (cumplimiento parcial).
- **Cómo se implementó:** la mayoría de los commits de código la sigue; varios commits de subida web («Add files via upload») y algunos de octubre («Plataforma por módulos: …») no.
- **Qué falta:** nada obligatorio.

### TV-02 · Documentos fechados en carpetas
- **Idea:** `docs/` dividido en arquitectura, bitácora, incidencias, propuestas…; nombres `AAAA-MM-DD_tema`.
- **Origen:** 27 sep, investigación §6.d.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** commits `17c7b0a` y `3b3e7c1`; `docs/guias/` y `docs/README.md` el 2 oct (`54edda8`).
- **Qué falta:** nada.

### TV-03 · CHANGELOG y tags por fases
- **Idea:** un tag al final de cada fase, firmado con SSH; MAYOR = cambio de fase.
- **Origen:** 1 oct, [`docs/guias/2026-10-01_versiones-y-tablero.txt`](../guias/2026-10-01_versiones-y-tablero.txt).
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** `CHANGELOG.md` y `herramientas/crear-tags.sh`. Publicados `v0.1.0`, `v1.0.0`, `v2.0.0`, `v2.0.1`, `v2.2.0-alpha.1`.
- **Qué falta:** publicar `v2.2.0-alpha.2`, `v3.0.0-alpha.1` y `v3.0.0-alpha.2` desde la computadora del usuario (la nube recibe 403, INC-009).

### TV-04 · Kanban movido por commits
- **Idea:** tareas en YAML; mencionar `T-xxx`, `cierra T-xxx` o `reabre T-xxx` mueve las tarjetas; `KANBAN.md` se genera.
- **Origen:** 1 oct, guía de versiones y tablero §4.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `tablero/tareas.yml`, `tablero/actualizar.py` con pruebas, `.github/workflows/tablero.yml` que publica `KANBAN.md` en `main` (commits «actualizar tablero Kanban [skip ci]»).
- **Qué falta:** nada.

### TV-05 · CI
- **Idea:** lint y build del frontend y pytest del backend en cada PR.
- **Origen:** 27 sep, investigación §6.b.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `.github/workflows/ci.yml` (backend, validar contenido, tablero, motor y add-on, add-on en `bpy`, lint, vitest y build). Commit `cd7c7bc`. T-007.
- **Qué falta:** nada.

### TV-06 · Proteger `main`
- **Idea:** solo cambios por PR con CI verde.
- **Origen:** 27 sep, investigación §6.a.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** nada; hay que permitir el bypass del workflow del tablero, que hace push directo a `main`.
- **Qué falta:** T-008.

### TV-07 · Revisión de PR por la otra persona
- **Idea:** la persona que no escribió el código revisa al menos 5 minutos antes de fusionar.
- **Origen:** 27 sep, investigación §6.e (había dos personas: Kaneda343 y Maximiliano).
- **Estado:** 🔁 Reemplazada.
- **Cómo se implementó:** con un solo desarrollador, `PROYECTO.md` §5 pide «revisión propia» y confirmación de Maximiliano antes de fusionar.
- **Qué falta:** nada.

### TV-08 · Rama `dev` y `feature/motor-generativo`
- **Idea:** integrar en `dev`; desarrollar el motor generativo en su rama.
- **Origen:** 27 sep, propuesta del motor generativo §5; 1 oct, plan de lanzamiento §4.
- **Estado:** 🔁 Descartada.
- **Cómo se implementó:** `dev` quedó sin contenido propio y se marcó «por borrar» ([ramas y cronología](../bitacora/2026-10-02_ramas_y_cronologia.txt)); se trabaja con ramas cortas desde `main`. `feature/motor-generativo` nunca se creó.
- **Qué falta:** borrar las ramas sobrantes desde la computadora del usuario.

### TV-09 · Centro de dirección y una tarea a la vez
- **Idea:** un punto de entrada que dice qué sigue; una tarea en ejecución y hasta tres preparadas.
- **Origen:** 1 oct, `PROYECTO.md`.
- **Estado:** ✅ Implementada (como política manual; el generador no la impone).
- **Cómo se implementó:** [`PROYECTO.md`](../../PROYECTO.md).
- **Qué falta:** nada.

### TV-10 · Archivar el tablero por etapa
- **Idea:** al cambiar de etapa MAYOR, guardar el tablero anterior y empezar uno nuevo.
- **Origen:** 3 oct, pedido de Maximiliano.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `tablero/historico/2026-10-03_v2_*` con la revisión del estado real agregada el 4 oct; bloque `etapa` en `tareas.yml`. T-037.
- **Qué falta:** nada.

### TV-11 · Bloqueo, evidencia y aceptación
- **Idea:** campos manuales que dicen por qué está detenida una tarea y cómo se comprueba.
- **Origen:** 1 oct, `PROYECTO.md` §5; se muestran desde el 4 oct.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `tablero/actualizar.py` los imprime debajo de cada tarea en `KANBAN.md` (commit `0017a46`).
- **Qué falta:** el generador no valida `depende_de`.

### TV-12 · Registro de incidencias
- **Idea:** cada falla con causa, solución y resultado; un índice numerado.
- **Origen:** 27 sep (primeras incidencias); índice el 2 oct (`06912d8`).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** [`docs/incidencias/README.md`](../incidencias/README.md), INC-001 a INC-012.
- **Qué falta:** nada.

### TV-13 · Pruebas automáticas
- **Idea:** el 27 sep había 0 pruebas.
- **Origen:** 27 sep, investigación §3.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** 14 pruebas el 29 sep; al 4 oct, backend 265, motor y add-on 43, tablero 8 y frontend 158 ([bitácora del 4 oct](../bitacora/2026-10-04_motor_etapa_2_y_plataforma.md)).
- **Qué falta:** nada.

### TV-14 · README completo, CONTRIBUTING, capturas, licencia
- **Idea:** README que explique el proyecto en dos minutos, roadmap, capturas, guía de instalación, `CONTRIBUTING.md`, licencia.
- **Origen:** 27 sep, recomendaciones §11–12.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** `README.md` reescrito el 4 oct; READMEs por carpeta; documentos de la v2.2 en parte.
- **Qué falta:** no existen `CONTRIBUTING.md` ni `LICENSE`; T-031 quedó en revisión el 4 oct con `docs/base-de-datos/`, `docs/manual-del-codigo/03_backend.md` y la guía de despliegue en OCI.

### TV-15 · Estructura fija
- **Idea:** «no reorganizar continuamente el repositorio» (27 sep) y «no reorganizar la página cada vez, sino dejarle una estructura fija» (4 oct).
- **Origen:** 27 sep, recomendaciones §10; 4 oct 03:07, pedido de seguimiento.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** navegación definitiva **Cursos · Mi panel · Admin**, «Mi Blender» en el menú de la cuenta; `docs/README.md` con el estado de cada documento. Commit `0017a46`.
- **Qué falta:** nada.

## 12. Despliegue

### DE-01 · Frontend en Cloudflare Pages
- **Idea:** publicar la PWA en Pages (subdominio gratuito).
- **Origen:** 27 sep, arquitectura general §1; 1 oct, plan de lanzamiento §5.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** nada; necesita la API en HTTPS para evitar contenido mixto.
- **Qué falta:** T-024 (depende de T-005).

### DE-02 · API en VM de OCI (Always Free)
- **Idea:** FastAPI en la VM ARM de 50 GB junto a Oracle Autonomous Database de 20 GB.
- **Origen:** 27 sep, backend y base de datos §1.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** la VM corre la API con Oracle 23.26 (bitácora técnica §13).
- **Qué falta:** confirmar el costo cero en la consola (plan §5).

### DE-03 · Backend como servicio systemd
- **Idea:** evitar procesos huérfanos (INC-002) y arrancar solo tras reiniciar.
- **Origen:** 27 sep, resumen §2.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** `despliegue/amatista-api.service` en el repositorio; la VM usa otra unidad, `amatista-backend` (INC-012).
- **Qué falta:** decidir el nombre y comprobar el arranque tras reiniciar (T-003, en progreso).

### DE-04 · HTTPS
- **Idea:** proxy HTTPS (Caddy, Nginx o Cloudflare Tunnel) y nombre DNS.
- **Origen:** 27 sep, resumen §3 («mixed content»).
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** `despliegue/Caddyfile` listo, sin instalar.
- **Qué falta:** T-005.

### DE-05 · CORS limitado
- **Idea:** cambiar `allow_origins=["*"]` por el dominio del frontend.
- **Origen:** 27 sep, resumen §3.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** `backend/main.py` lee `CORS_ORIGINS` (lista vacía si no se define).
- **Qué falta:** fijar el valor de producción junto con HTTPS (T-005, T-024).

### DE-06 · Actualizar con vuelta atrás
- **Idea:** desplegar el commit aprobado, correr pruebas y volver al anterior si falla.
- **Origen:** 1 oct, plan de lanzamiento §6 paso 14.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `despliegue/actualizar.sh` (detecta `amatista-backend` o `AMATISTA_SERVICIO`).
- **Qué falta:** nada.

### DE-07 · Render como alternativa
- **Idea:** API en Render (USD 7 o gratis con suspensión) si OCI no pasaba el diagnóstico.
- **Origen:** 1 oct, plan de lanzamiento §5 opciones B y C.
- **Estado:** 🔁 Descartada.
- **Cómo se implementó:** OCI pasó el diagnóstico (INC-010, bitácora técnica), así que se quedó la opción A.
- **Qué falta:** nada.

### DE-08 · Entorno de pruebas con datos separados
- **Idea:** las vistas previas no escriben en producción; usuarios ficticios.
- **Origen:** 1 oct, plan de lanzamiento §6 paso 2.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** se prueba con SQLite local y Oracle en contenedor; las cuentas de prueba se marcan con `es_prueba`. No hay un entorno de pruebas desplegado.
- **Qué falta:** sin tarea.

### DE-09 · Pruebas P01–P10, piloto y beta
- **Idea:** diez pruebas con evidencia (construcción, cuentas, aprendizaje, offline, sincronización, actualización, dispositivos, carga de 20 alumnos, seguridad y conteo); piloto el 8 oct, beta el 15 oct.
- **Origen:** 1 oct, plan de lanzamiento §7–8.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** nada ejecutado con evidencia.
- **Qué falta:** T-025, T-026, T-027.

### DE-10 · Guía de despliegue en OCI
- **Idea:** documento para usar `despliegue/*`.
- **Origen:** 2 oct, enlazado antes de existir (INC-007).
- **Estado:** ✅ Implementada (4 oct, documentación completa).
- **Cómo se implementó:** [`docs/despliegue/2026-10-04_despliegue_oci.md`](../despliegue/2026-10-04_despliegue_oci.md), junto a la guía de Oracle ([`docs/despliegue/2026-10-02_oracle_paso_a_paso.md`](../despliegue/2026-10-02_oracle_paso_a_paso.md)); el `Caddyfile` y la unidad ya la citan.
- **Qué falta:** ejecutar en la VM los pasos marcados «Sin ejecutar» (T-003, T-005).

### DE-11 · Almacenamiento para archivos pesados
- **Idea:** cuenta institucional para `.glb` y `.blend`.
- **Origen:** 27 sep, arquitectura general §1.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** nada; las imágenes viven en `frontend/public/`.
- **Qué falta:** sin tarea; lo necesitará el visor GLB (T-011).

## 13. Tutor IA

### IA-01 · Tutor IA local con Ollama
- **Idea:** asistente con Ollama (Phi-3 o LLaMA) en una PC conectada por túnel o en la VM, con contexto de la lección actual.
- **Origen:** 27 sep, arquitectura general §1, recomendaciones §4.3 y §7, App Shell («Esperando conexión con túnel Ollama»).
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** solo `ai_tutor/prompts/.gitkeep` y una tarjeta «Próximamente» en el panel del alumno.
- **Qué falta:** T-012 (v3.4.0). La bitácora del 27 sep advierte que Phi-3 en ARM es lento: medir antes de comprometerse.

### IA-02 · Tutor de scripts `bpy` y A-Frame
- **Idea:** generar y depurar scripts de la API de Blender, corregir HTML de A-Frame y enseñar prompt engineering para 3D.
- **Origen:** 27 sep, propuesta 3D Lab pilar C.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** nada.
- **Qué falta:** dentro de T-012.

### IA-03 · Unir tutor y motor generativo
- **Idea:** «el tutor escribe el script, Blender lo ejecuta y A-Frame muestra el resultado».
- **Origen:** 27 sep, resumen del 27 sep §4.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** nada.
- **Qué falta:** sin tarea.

### IA-04 · La IA nunca es requisito del núcleo
- **Idea:** la plataforma y el motor funcionan sin IA.
- **Origen:** 27 sep (recomendaciones §2); 3 oct (concepto del motor §2 y §35: «Amatista Engine no será una IA»).
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** el motor es determinista (reglas, validadores y plantillas); la beta «puede abrir sin IA» (plan §3).
- **Qué falta:** nada.

## 14. 3D Lab y motor generativo

### LG-01 · Amatista 3D Lab
- **Idea:** pasar de plataforma de cursos a laboratorio con tres pilares: laboratorio web (A-Frame/WebXR), ecosistema nativo (add-on + FastAPI + Oracle) y tutor IA.
- **Origen:** 27 sep, [`docs/propuestas/2026-09-27_amatista_3d_lab.txt`](../propuestas/2026-09-27_amatista_3d_lab.txt).
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** el pilar B existe como Amatista Engine y add-on (EN-01). Los pilares A y C están pendientes. En el tablero v2 era la versión v3.0.0 «Amatista 3D Lab»; en la v3 se repartió entre v3.2.0 (laboratorio), v3.3.0 (add-on) y v3.4.0 (tutor).
- **Qué falta:** T-011, T-049, T-012.

### LG-02 · Laboratorio web y visor GLB
- **Idea:** visor GLB en las lecciones, escena de ejemplo con reinicio, avisos cuando falta un recurso y la lección 12 (exportar y comprobar).
- **Origen:** 27 sep (recomendaciones §9, prioridad 3); 3 oct (propuesta §8).
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** hay vistas A-Frame dentro de las lecciones (`VistaAFrame.jsx`, `EscenaAFrame.jsx`) pero ningún cargador de `.glb`.
- **Qué falta:** T-011, T-049, T-010.

### LG-03 · Motor generativo 3D
- **Idea:** prompt → LLM local (Ollama) escribe `bpy` → Blender headless construye y renderiza → `.glb` + vista previa en A-Frame; script visible para el alumno; sandbox sin red, con límites y lista blanca de módulos; cola de trabajos.
- **Origen:** 27 sep, [`docs/propuestas/2026-09-27_motor_generativo_3d.txt`](../propuestas/2026-09-27_motor_generativo_3d.txt) (commit `965f005`).
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** nada. El plan de lanzamiento lo limita al 10 % del tiempo y solo tras dos semanas estables; el concepto del motor lo deja fuera del núcleo.
- **Qué falta:** sin tarea en el tablero; `PROYECTO.md` §7 propone empezar con una escena simple y un GLB visible.

## 15. Otras

### OT-01 · Instrumentación y definición de alumno activo
- **Idea:** eventos `account_created`, `learning_session_started`, `lesson_completed`, `activity_submitted`, `sync_succeeded` con id único; activo semanal = interacción en dos días distintos y al menos una lección o actividad; excluir pruebas y equipo.
- **Origen:** 1 oct, plan de lanzamiento §9 y §11.
- **Estado:** ✅ Implementada.
- **Cómo se implementó:** `TIPOS_EVENTO` en `backend/database/modelos.py`, tabla `EVENTOS_APRENDIZAJE` particionada, `backend/api/eventos.py` y el resumen de `backend/api/admin.py`. T-017.
- **Qué falta:** datos reales (T-028).

### OT-02 · Captación de alumnos
- **Idea:** estudiantes de UTN y contactos; embudo 120 invitaciones → 20 activos al 22 oct; 30 activos al 29 oct; sin anuncios.
- **Origen:** 1 oct, plan de lanzamiento §10.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** nada técnico.
- **Qué falta:** T-026, T-027, T-028.

### OT-03 · Presupuesto USD 0 al mes
- **Idea:** todo dentro de cuotas gratuitas, con techo de USD 15 para una API alternativa.
- **Origen:** 1 oct, plan de lanzamiento §5.
- **Estado:** 🟡 Parcial.
- **Cómo se implementó:** OCI Always Free y Oracle ATP en uso; ningún servicio de pago en el repositorio.
- **Qué falta:** verificar en la consola de OCI (no documentado) y sumar Cloudflare Pages.

### OT-04 · Privacidad
- **Idea:** informar para qué se recogen datos, reducirlos y ofrecer contacto para pedir su eliminación; no publicar datos identificables.
- **Origen:** 1 oct, plan de lanzamiento §11.
- **Estado:** ⏳ Pendiente.
- **Cómo se implementó:** el diseño reduce datos (sin binarios, sin el `.blend`); no hay aviso de privacidad ni flujo de eliminación.
- **Qué falta:** sin tarea.

## Ideas pendientes ordenadas por prioridad según el tablero

El orden sale de `PROYECTO.md` §4 («Orden vigente, 4 de octubre») y de las dependencias de `tablero/tareas.yml`: primero el piloto, después lo que espera al piloto, luego la fase B y las versiones v3.1 a v3.4. Las ideas sin tarea van al final.

| # | Tarea | Idea | Por qué en este lugar |
|---|---|---|---|
| 1 | T-003 | DE-03 Servicio systemd (en progreso) | Piloto; T-032 depende de ella |
| 2 | T-005 | DE-04 HTTPS · DE-05 CORS | Piloto; desbloquea T-024 |
| 3 | T-032 | CR-04 SMTP y primer admin | Piloto |
| 4 | T-029 | PP-14 Prueba de punta a punta | Piloto |
| 5 | T-030 | CR-07 Revisión de seguridad e integridad | Piloto |
| 6 | T-004 | OR-07 Usuario de aplicación | v2.2.0; producción sigue con ADMIN |
| 7 | T-023 | OR-10 Respaldo y restauración | v2.2.0; requisito del plan antes de abrir |
| 8 | T-024 | DE-01 Cloudflare Pages | v2.2.0; depende de T-005 |
| 9 | T-025 | DE-09 Pruebas P01–P10 (incluye PW-06/P04) | Depende de T-002, T-003, T-005, T-024 |
| 10 | T-026 → T-027 → T-028 | OT-02 Piloto, beta e informe | Cadena del lanzamiento |
| 11 | T-008 | TV-06 Proteger `main` | v2.2.0, sin fecha |
| 12 | T-031 | TV-14 / DE-10 Documentos de la v2.2 y guía OCI | v2.2.0 |
| 13 | T-055 | OR-12 Ejecutar 007, publicar la mesa y el módulo 2 | «Después del piloto» |
| 14 | T-056 | EN-19 Instalador en Windows y macOS reales | Después del piloto |
| 15 | T-059 | EN-23 Guía en Blender con GPU y capturas | Después del piloto |
| 16 | T-038 | NB-01 Versión principal de Blender | Fase B; bloqueada por decisión; desbloquea T-040 |
| 17 | T-039 | PP-05 / CF-10 Inventario → niveles y fichas | Fase B |
| 18 | T-044 | PA-09 Editor con ficha y nivel | Fase B |
| 19 | T-041 | PP-05 / NB-02 Mapa de niveles y «Verificada en…» | Fase B; desbloquea T-043 |
| 20 | T-042 | PP-07 / PP-08 Habilidades y rúbrica | Fase B; T-048 depende de ella |
| 21 | T-043 | PP-06 Diagnóstico de entrada | Fase B |
| 22 | T-040 | CF-11 Lección modelo | Fase B; depende de T-038 |
| 23 | T-009, T-045…T-048 | PP-09 «Mi primer espacio 3D» | v3.1.0, en cadena |
| 24 | T-052 → T-013 | EN-01 Comprobaciones de la lección 03 y MVP del add-on | v3.3.0; T-052 espera a T-009 |
| 25 | T-011 → T-049, T-010 | LG-02 Visor GLB, laboratorio y lección 12; módulo 2 de A-Frame | v3.2.0 |
| 26 | T-060 | OR-13 / EN-24 Ayudas en Oracle (008) | v3.4.0; depende de T-055 y T-057 |
| 27 | T-054 | PP-10 Primera rama del nivel 5 | v3.4.0; decisión pendiente |
| 28 | T-012 | IA-01 / IA-02 Tutor IA | v3.4.0 |
| — | sin tarea | LG-03 motor generativo, IA-03, PP-12 galería y retos, PW-06 gestor offline, PW-09 WebXR, PW-10 físicas, IV-06 resplandor offline, EN-07 detección de roles, EN-22 paquete de práctica, EN-24 resto de la etapa 3, EN-25 extensions.blender.org, EN-27 `allowManual`, DE-08 entorno de pruebas, DE-11 almacenamiento, PA-10 pantalla de gestión, OT-04 privacidad | Entran como propuesta fechada en `docs/propuestas/` antes de tener tarea (`PROYECTO.md` §5 y §7) |

T-057 y T-058 (etapa 2 del motor y plataforma por módulos) figuran «en revisión» en el tablero aunque su código ya está en `main` (PR #14); no se listan como pendientes.

## Inconsistencias encontradas al revisar

- **T-022 «hecha» pero sin `formula`.** `tablero/tareas.yml` marca T-022 como hecha, y la Fórmula sigue diciendo «Pendiente: los módulo 1 todavía no llevan el campo "formula"». Comprobado: las lecciones de `blender-modulo-1.json` y `aframe-modulo-1.json` no tienen `formula`; solo `blender-modulo-2.json` lo usa.
- **Etapa 2 «sin fusionar».** [`docs/motor/etapas/etapa-2.md`](../motor/etapas/etapa-2.md) dice «PR abierto, sin fusionar» y la bitácora del 4 oct «un PR, sin fusionar»; el PR #14 está en `main` (`d004071`). `PROYECTO.md` §3 también dice «etapa 2 en el PR #14». T-057 y T-058 siguen «en revisión».
- **Mapa de la plataforma y niveles.** [`docs/plataforma/01_mapa_de_la_plataforma.md`](../plataforma/01_mapa_de_la_plataforma.md) dice que el mapa del curso muestra «niveles»; en el código solo hay una etiqueta «Nivel N» en el encabezado de cada módulo. El mapa de niveles es T-041, pendiente.
- **Rama `main` local desactualizada.** En este clon, la rama local `main` apunta a `573ea89` (historia del repositorio anterior, igual que `v2.0.1`) y no a `c730c0e`; los comandos que usen `main` en vez de `HEAD` u `origin/main` muestran otra historia.
- **Compendio desactualizado.** `compendio/herramientas-visuales.md` (carpeta compartida) se copió en `f68c704` y describe 16 bloques, no los 20 actuales.
- **Fecha del commit de fusión del PR #14.** `d004071` tiene fecha 2026-10-03 aunque fusiona commits del 4 de octubre (zona horaria del autor).
