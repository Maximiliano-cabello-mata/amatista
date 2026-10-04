# 05 · API del add-on (`/api/addon/v1`)

Código: [`backend/api/addon.py`](../../../backend/api/addon.py). Pruebas: `backend/tests/test_addon.py`. Todas las respuestas son JSON salvo las descargas. Los errores siguen el formato del resto de la API (`{"detail": …}`); una práctica que no compila responde 422 con `{"mensaje", "errores": [...]}`.

## Permisos

| Quién | Cómo se identifica | Qué puede usar |
|---|---|---|
| Público | sin token | `GET /estado`, `POST /vinculos`, `POST /vinculos/{id}/estado`, descargas públicas |
| Alumno (PWA) | sesión normal | todo lo de alumno |
| Add-on | sesión con `DISPOSITIVO` que empieza con `blender-addon` | solo `/api/addon/` y `/api/blender/` (403 en otras rutas: `api/dependencias.py`) |
| Profesor / admin | rol | subir prácticas y ver versiones y borradores |
| Admin | rol | publicar, archivar, sincronizar el repositorio |

Límites por IP y ruta, por minuto: crear vínculo 20, consultar vínculo 60, confirmar código 10, intentos 120, descargas 20.

## Vínculo (como en un televisor)

| Método y ruta | Quién | Qué hace |
|---|---|---|
| `GET /estado` | público | Versiones del add-on y del motor, Blender mínimo, URL de descargas y del repositorio de extensiones. |
| `POST /vinculos` `{dispositivo}` | add-on | Crea un código `ABCD-2345` (sin I, L, O, 0, 1) válido 10 min y un secreto que solo conoce el add-on. |
| `POST /vinculos/confirmar` `{codigo}` | alumno | Lo escribe en `#/vincular`. Acepta minúsculas, espacios y sin guion. |
| `POST /vinculos/{id}/estado` `{secreto, dispositivo}` | add-on | `pendiente` (con segundos restantes), `vencido`, `canjeado` o, una sola vez, `listo` con la sesión del add-on y la cuenta. |
| `GET /yo` | add-on | Usuario de la sesión. |
| `POST /salir` | add-on | Cierra su sesión. |
| `GET /dispositivos` | alumno | Blenders conectados (nombre, sistema, último uso). |
| `DELETE /dispositivos/{id}` | alumno | Desconecta uno. |

El paquete descargado con sesión trae un vínculo ya confirmado (7 días, un uso): el add-on llama a `/vinculos/{id}/estado` al abrir Blender y queda conectado sin código.

## Prácticas

| Método y ruta | Quién | Qué hace |
|---|---|---|
| `GET /practicas` | sesión | Catálogo. Alumnos: solo publicadas, en su versión publicada, con `mi_progreso`. Equipo: también borradores. |
| `GET /practicas/{id}` | sesión | Definición compilada (`?version=` para el equipo). |
| `POST /practicas` `{definicion, curso_id?, leccion_id?, nota?, version_addon?, version_blender?}` | profesor/admin | Compila con el motor y crea la versión siguiente en `PRACTICA_VERSIONES`. Si la huella es igual a la última, no crea nada (`sin_cambios: true`). **Nunca publica.** |
| `GET /practicas/{id}/versiones` | profesor/admin | Historial: versión, nota, autor, add-on y Blender con que se subió, cuál está publicada. |
| `POST /practicas/{id}/publicar` `{version?}` | admin | Publica la última (o la indicada). |
| `POST /practicas/{id}/archivar` | admin | La saca del catálogo de alumnos (el progreso se conserva). |
| `POST /practicas/sincronizar?publicar=` | admin | Registra las de `practices/blender/` (origen `repositorio`) y enlaza cada práctica con la lección que tiene su bloque `blender_practice`. |

## Progreso

| Método y ruta | Quién | Qué hace |
|---|---|---|
| `POST /practicas/{id}/abrir` `{origen}` | alumno | Crea o toca su fila de progreso para que sea la más reciente (botón **Abrir en Blender** de la lección). |
| `GET /practica-actual` | add-on | La última práctica sin terminar que el alumno abrió o trabajó, con su definición, para abrirla sola. |
| `POST /intentos` | add-on | `{practica_id, version?, escena, pistas, correcciones, version_addon?, version_motor?, sistema?}`. El servidor evalúa la escena con el motor y guarda en `PROGRESO_PRACTICAS` el mejor resultado (un intento peor no baja objetivos ni paso actual). Al completar: lección enlazada completada, habilidades hasta `con_pistas`, evento `activity_submitted`. |
| `GET /mi-progreso` | sesión | Progreso del alumno en todas sus prácticas. |

## Descargas

| Ruta | Qué entrega |
|---|---|
| `GET /descargas/{windows\|macos\|linux}` | Paquete con instalador. Con sesión: personal, con vínculo, `Cache-Control: private, no-store`. Sin sesión: público, cacheado 5 min. |
| `GET /extension.zip` | Solo la extensión (para instalar a mano). |
| `GET /extensiones/index.json` | Índice de repositorio de extensiones de Blender (esquema v1, con `archive_hash` sha256). |

Las URL que van dentro del paquete salen de `AMATISTA_URL_API` y `AMATISTA_URL_PWA` (en `backend/.env`). Si no están, se usa la dirección de la petición y, para la PWA, el `Origin` si está en la lista de CORS.

## Tablas (Oracle, script 007)

| Tabla | Una fila por | Columnas principales |
|---|---|---|
| `ADDON_VINCULOS` | código pedido | `CODIGO`, `SECRETO_HASH`, `USUARIO_ID`, `DISPOSITIVO`, `ESTADO` (pendiente, listo, canjeado), `EXPIRA_EN` |
| `PRACTICAS` | práctica | `TITULO`, `NIVEL`, `VERSION`, `VERSION_PUBLICADA`, `ESTADO` (borrador, publicado, archivado), `ORIGEN` (repositorio, addon, panel), `CURSO_ID`, `LECCION_ID`, `DEFINICION` |
| `PRACTICA_VERSIONES` | versión subida | `DEFINICION`, `HUELLA`, `NOTA`, `AUTOR_ID`, `VERSION_ADDON`, `VERSION_BLENDER` |
| `PROGRESO_PRACTICAS` | alumno y práctica | `VERSION`, `PROGRESO`, `COMPLETADA`, `AUTONOMIA`, `PISTAS`, `CORRECCIONES`, `INTENTOS`, `PASO_ACTUAL`, `OBJETIVOS`, `ABIERTA_EN`, `COMPLETADA_EN` |

Vista `V_AMATISTA_PRACTICAS`: cada práctica con su lección, autor, versión publicada, alumnos que la abrieron, cuántos la completaron y el progreso promedio.
