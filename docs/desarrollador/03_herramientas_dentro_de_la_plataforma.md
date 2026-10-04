# 03 · Herramientas dentro de la plataforma

Las herramientas para el equipo que viven dentro de la PWA, de Blender y de Oracle: panel de administración, Diagnóstico técnico, editor de lecciones, modo Desarrollador del add-on y el paquete `AMATISTA_AUTOR`. Para desarrolladores, profesores y administradores.

Actualizado: 4 de octubre de 2026 (main en c730c0e)

1. [Panel de administración (`#/admin`)](#1-panel-de-administración-admin)
2. [Diagnóstico técnico (`#/laboratorio`)](#2-diagnóstico-técnico-laboratorio)
3. [Modo Desarrollador (Amatista Author) en Blender](#3-modo-desarrollador-amatista-author-en-blender)
4. [Oracle Database Actions: paquete `AMATISTA_AUTOR` y vistas](#4-oracle-database-actions-paquete-amatista_autor-y-vistas)
5. [Qué herramienta usar para cada tarea](#5-qué-herramienta-usar-para-cada-tarea)

La descripción funcional completa del panel (para profesores) está en [docs/plataforma/05_panel_de_administracion.md](../plataforma/05_panel_de_administracion.md); aquí se resume y se agrega lo que importa a quien programa: archivos, rutas de la API y permisos.

---

## 1. Panel de administración (`#/admin`)

- **Quién entra**: `profesor` ve todo en **solo lectura**; `admin` además modifica. `App.jsx` (`RutaAdmin`) solo lo muestra a `esProfesor`, pero la protección real está en el servidor: cada ruta de `backend/api/admin.py`, `contenido.py`, `niveles.py` y `addon.py` revisa el rol.
- **Cómo se carga**: `frontend/src/pages/admin/Admin.jsx` recibe `{seccion, params}` de `analizarRuta` (`frontend/src/rutas.js`) y elige la página. El panel se descarga bajo demanda (`lazy`) solo para quien tiene permiso.
- **Navegación**: `frontend/src/components/admin/NavAdmin.jsx` (`SECCIONES`): Resumen · *Enseñanza*: Módulos, Prácticas de Blender, Herramientas · *Personas*: Usuarios · *Sistema*: Estado (solo admin).
- **Servicios**: `frontend/src/services/admin.js` (resumen, usuarios, purga, salud) y `frontend/src/services/blender.js` (prácticas).

| Página | Ruta | Archivo | API |
|---|---|---|---|
| Resumen | `#/admin` | `pages/admin/Resumen.jsx` | `GET /api/admin/resumen` |
| Módulos | `#/admin/contenido` | `pages/admin/Contenido.jsx` | `GET /api/contenido/admin/arbol`, CRUD, `publicar`, `archivar`, `mover`, `exportar` |
| Editar / nueva lección | `#/admin/contenido/:curso/:leccion` · `#/admin/contenido/nueva/:modulo` | `pages/admin/EditorLeccion.jsx` | `plantillas`, `validar`, CRUD de lecciones, `publicar` |
| Prácticas de Blender | `#/admin/practicas` | `pages/admin/Practicas.jsx` | `/api/addon/v1/practicas` (listar, versiones, publicar, archivar, sincronizar) |
| Herramientas | `#/admin/herramientas` | `pages/admin/Herramientas.jsx` | `plantillas` (ejemplo de cada bloque) |
| Usuarios | `#/admin/usuarios` | `pages/admin/Usuarios.jsx` | `GET /api/admin/usuarios` |
| Usuario | `#/admin/usuarios/:id` | `pages/admin/Usuario.jsx` | `GET` y `PATCH /api/admin/usuarios/{id}` |
| Estado | `#/admin/sistema` | `pages/admin/Sistema.jsx` | `GET /api/admin/salud-detallada`, `POST /api/admin/mantenimiento/purgar` |

Contratos de cada ruta: [backend/README.md](../../backend/README.md#rutas), [contrato técnico](../arquitectura/2026-10-02_contrato_tecnico_plataforma.md) y [API del add-on](../motor/referencia/05_api.md).

### 1.1 Resumen (`#/admin`)

Indicadores del plan de lanzamiento: selector de periodo (7, 14 o 30 días; `PERIODOS` en `components/admin/logica.js`), activos semanales, retención de la semana 2, alumnos (y anónimos), correos confirmados, equipo, **serie diaria** de los últimos 30 días con selector de métrica, **embudo** y avance **por curso**. Las cuentas marcadas como prueba no cuentan.

### 1.2 Módulos (`#/admin/contenido`)

Árbol cursos → módulos → lecciones con su estado. El admin puede:

- **Crear módulo**: curso, título, número, insignia y esqueleto con la Fórmula (5 lecciones en borrador), lo mismo que `contenido.py nuevo-modulo`.
- **Publicar** y **Archivar** módulos y lecciones (con confirmación).
- **Subir / Bajar** lecciones (`mover`). Si la práctica en Blender no queda al final, el servidor responde qué lección mover.
- **Exportar JSON** de un módulo, para guardarlo en `frontend/src/data/modulos/` y hacer commit (igual que `contenido.py exportar`).
- Ver las etiquetas **Incluye práctica en Blender / Sin práctica** y el tipo de cada lección.

### 1.3 Editor de lecciones con vista previa

`EditorLeccion.jsx` (545 líneas):

- **Metadatos** de la lección y, para lecciones nuevas, **elegir plantilla** de la Fórmula (gancho, explora, practica, reto, jefe) o una lectura vacía.
- **Bloques en JSON**, uno por tarjeta, con la **paleta Agregar bloque** agrupada por categoría (Explicar, Visualizar, Practicar en el navegador, Practicar en Blender); el bloque nuevo sale del ejemplo del servidor. Reordenar con flechas. El JSON del examen se edita aparte.
- **Vista previa · así la ve el alumno**: usa los mismos componentes que la lección real (`BloqueContenido`, `Examen`), así que lo que se ve es lo que verá el alumno.
- **Validar** (validación del servidor, la misma de `backend/contenido/validacion.py`; el error señala el bloque y el campo), **Guardar** / **Crear lección** y **Publicar**. El profesor lo ve en solo lectura.

Catálogo de bloques y sus campos: [docs/plataforma/04](../plataforma/04_herramientas_de_ensenanza.md).

### 1.4 Prácticas de Blender (`#/admin/practicas`)

Prácticas del motor registradas en Oracle (tablas de `sql/007`). Por cada una: estado, versión publicada y última, autor, alumnos y completadas; KPI **Por publicar** (versiones nuevas que subió Amatista Author).

- **Versiones**: historial con la nota de cada subida.
- **Publicar vN**: la última versión pasa a ser la que ven los alumnos.
- **Archivar**: la retira del catálogo sin borrar el progreso.
- **Registrar las del repositorio** (borrador) y **Registrar y publicar**: lo mismo que `python herramientas/contenido.py practicas [--publicar]` ([02 §1](02_herramientas_de_linea_de_comandos.md#1-backendherramientascontenidopy)).

Flujo completo: [docs/motor/referencia/06_modo_desarrollador.md](../motor/referencia/06_modo_desarrollador.md#publicar-admin).

### 1.5 Herramientas (`#/admin/herramientas`)

Catálogo de herramientas de enseñanza (bloques de lección) de `frontend/src/data/herramientas.js`, por categoría. Para cada una: **Para qué**, **Cuándo usarla**, pasos de la Fórmula donde encaja, **vista previa** con el ejemplo del servidor y **Ver JSON** / **Copiar JSON** para pegar en el editor. Sirve también a profesores (solo lectura).

### 1.6 Usuarios y detalle de usuario

- **Usuarios**: búsqueda por nombre, correo o id; filtro por rol; orden; 25 por página. Pastillas: Anónimo, correo sin confirmar, cuenta de prueba (no cuenta en las métricas), Fusionado.
- **Usuario**: ficha, lecciones, XP, insignias, sesiones activas, progreso por curso, insignias y eventos recientes. Acciones (solo admin): **Cambiar rol**, **Marcar / Quitar marca de prueba**, **Confirmar correo**.

### 1.7 Estado (`#/admin/sistema`)

Solo admin (un profesor ve «Solo un administrador puede ver el estado del sistema»). En la navegación se llama **Estado**; el título de la página dice **Sistema**.

- **Base de datos**: motor (Oracle o «SQLite (desarrollo)»), versión de la API, tablas presentes / esperadas y filas por tabla. Una tabla que falta dice «No existe: falta una migración (backend/sql/LEEME.txt)». Es la versión web de `diagnostico_oracle.py`, más ligera.
- **Purgar datos viejos**: borra sesiones cerradas, vencidas o sin uso en N días (90 por defecto) y eventos de aprendizaje de más de N días (400). No toca usuarios, progreso, insignias ni contenido. En Oracle ya corre la purga diaria del job de `sql/003`; esto libera espacio de inmediato.
- **Diagnóstico técnico**: botón **Abrir diagnóstico ▸** hacia `#/laboratorio` (§2).

## 2. Diagnóstico técnico (`#/laboratorio`)

`frontend/src/pages/Laboratorio.jsx`. No aparece en la navegación de los alumnos; se abre desde Admin › Estado. La página comprueba `esProfesor` y, si no, muestra un aviso. Se carga bajo demanda porque incluye A-Frame (~1.3 MB).

Muestra, para **este navegador**:

- Backend: `VITE_API_URL` en uso y la respuesta de `/api/salud` (motor de la base).
- Cuenta con sesión y su rol (o «sin sesión (anónimo)»).
- Catálogo: origen (empaquetado o del servidor) y versión; botón **Actualizar catálogo**.
- Sincronización del progreso: cambios pendientes y último error; botón **Sincronizar ahora**.
- Una escena **A-Frame** embebida para comprobar que el visor 3D funciona en el dispositivo.

Úsalo cuando un alumno o profesor reporte que «no guarda» o «no carga»: abre la página en su dispositivo.

## 3. Modo Desarrollador (Amatista Author) en Blender

El add-on (`addon/amatista_blender/`) tiene dos modos en la pestaña **Amatista** de la barra lateral (N): **Alumno** y **Desarrollador** (`MODOS` en `estado.py`).

- **Cómo activarlo**: aparece solo si la cuenta vinculada es `profesor` o `admin`; cualquiera puede activarlo en *Preferencias › Extensiones › Amatista › Modo desarrollador* (`ajustes.py`, `es_desarrollador()`). **Subir a Amatista** exige cuenta de profesor o admin (403 si no).
- **Paneles**: Borrador de práctica (crear, partir de la abierta, abrir `practice.json`; se guarda en el bloque de texto `amatista_practica.json` del `.blend`) · Tagger (roles y etiquetas) · Inspector (lo que ve el motor del objeto activo) · Constructor de objetivos (plantillas de validadores, pistas 1 a 6) · Validación y depurador · **Vista previa como alumno** · Exportar y publicar (**Exportar practice.json**, **Subir a Amatista** → borrador en `PRACTICA_VERSIONES`, **Registrar verificación** → matriz de compatibilidad).
- **Vista previa como alumno** (`desarrollo.py`, operador «Vista previa como alumno»): carga el borrador en el modo Alumno, con tarjetas, pistas y diálogos, **sin enviar nada a la plataforma**. Es la forma de probar la experiencia del alumno antes de subir.
- **Después**: el admin publica la versión en Admin › Prácticas (§1.4); la práctica exportada va al repositorio en `practices/blender/level_<n>/` y se enlaza con su lección con un bloque `blender_practice` al final del módulo.

Guía paso a paso: [docs/motor/referencia/06_modo_desarrollador.md](../motor/referencia/06_modo_desarrollador.md). Add-on completo: [03_addon.md](../motor/referencia/03_addon.md) · Guía y acompañamiento: [07_guia_y_acompanamiento.md](../motor/referencia/07_guia_y_acompanamiento.md) · Formato: [02_formato_de_practica.md](../motor/referencia/02_formato_de_practica.md).

Para probarlo contra tu backend local, ver [01 §6](01_entorno_local.md#6-el-add-on-de-blender-contra-tu-backend-local).

## 4. Oracle Database Actions: paquete `AMATISTA_AUTOR` y vistas

Solo en Oracle (en SQLite no existen; el equivalente está en [02 §1](02_herramientas_de_linea_de_comandos.md#1-backendherramientascontenidopy)). Se ejecutan en **Database Actions › SQL** con «Ejecutar script (F5)» y `SET SERVEROUTPUT ON`, con el dueño de las tablas (ADMIN).

### Paquete `AMATISTA_AUTOR` (`backend/sql/006_herramientas_autor.sql`)

Cada procedimiento valida, hace `COMMIT` y escribe lo que hizo.

| Procedimiento | Para qué |
|---|---|
| `guardar_nivel(curso, numero, titulo, ...)` | Crea o actualiza un nivel (`blender-n2`; rama del nivel 5 con `p_rama`) |
| `publicar_nivel(nivel_id)` | Publica un nivel |
| `asignar_nivel(modulo_id, nivel_id)` | Pone un módulo en un nivel (NULL lo saca) |
| `guardar_habilidad(id, curso, nombre, nivel, ...)` | Habilidad observable que citan las fichas |
| `nueva_leccion(modulo_id, leccion_id, titulo, objetivo, habilidades)` | Lección en borrador al final del módulo con los 10 pasos y su ficha |
| `duplicar_leccion(curso, origen, nueva, ...)` | Copia una lección (variante o transferencia) |
| `guardar_ficha(curso, leccion, ...)` | Versión de Blender, notas, criterios de comprobación (`|`), offline |
| `guardar_version_blender(version, categoria, ...)` | Versiones de Blender (una sola `principal`) |
| `registrar_verificacion(curso, leccion, version, sistema, resultado, ...)` | Una prueba de la lección en una versión: `verificada`, `con_diferencias`, `falla` |

**No publica lecciones a propósito**: publicar pasa por la validación de `backend/contenido/validacion.py` (panel o `contenido.py importar`).

### Vistas y objetos de consulta

| Objeto | Script | Qué muestra |
|---|---|---|
| `V_AMATISTA_MAPA` | 006 | Curso › nivel › módulo › lección con la ficha y lo que falta |
| `V_AMATISTA_FICHAS_INCOMPLETAS` | 006 | Solo las lecciones con ficha incompleta |
| `V_AMATISTA_COMPATIBILIDAD` | 006 | Matriz lección × versión de Blender con la prueba más reciente |
| `V_AMATISTA_PRACTICAS` | 007 | Prácticas del motor con sus versiones y avance |
| `V_AMATISTA_ESPACIO` | 003 | Espacio usado contra los 20 GB |
| `AMATISTA_PURGAR` (procedimiento) y job `AMATISTA_PURGA_DIARIA` | 003 | Purga diaria de sesiones y eventos (la misma que Admin › Estado) |

Ejemplos de uso y consultas útiles: [manual de Oracle v3, §5](../reestructuracion/02_manual_oracle.md#5-crear-lecciones-desde-oracle-herramientas-de-autor) y §10 (007). Orden y propósito de cada script: [`backend/sql/LEEME.txt`](../../backend/sql/LEEME.txt).

## 5. Qué herramienta usar para cada tarea

| Quiero… | En la plataforma | En la terminal | En Oracle |
|---|---|---|---|
| Crear un módulo | Admin › Módulos › Crear módulo | `contenido.py nuevo-modulo` | — |
| Agregar una lección | Módulos › Nueva lección (editor) | `contenido.py nueva-leccion` | `amatista_autor.nueva_leccion` |
| Escribir el contenido | Editor de lecciones (vista previa) | editar el JSON y `validar` | — |
| Publicar contenido | Módulos / Editor › Publicar | `estado: publicado` + `importar` | (no se puede, a propósito) |
| Ver qué falta | — | `contenido.py mapa` | `V_AMATISTA_FICHAS_INCOMPLETAS` |
| Crear una práctica de Blender | — | escribir `practices/blender/...json` | — |
| … sin escribir JSON | Blender › Modo Desarrollador | — | — |
| Publicar una práctica | Admin › Prácticas | `contenido.py practicas --publicar` | — |
| Dar rol admin | Admin › Usuarios › Cambiar rol | `crear_admin.py` | — |
| Revisar la base | Admin › Estado | `diagnostico_oracle.py` | `V_AMATISTA_ESPACIO` |
| Revisar un dispositivo | `#/laboratorio` | — | — |
