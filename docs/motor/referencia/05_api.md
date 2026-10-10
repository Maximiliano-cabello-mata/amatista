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

Límites por minuto, contados por ruta: crear vínculo 20, consultar vínculo 60, confirmar código 10 y descargas 60, por IP; intentos 60 por cuenta (un aula comparte una sola IP pública, así que contar por IP frenaría a todo el curso). El enlace en vivo tiene los suyos, también por cuenta: latido 40, y órdenes y cambios de ajustes 30 cada uno ([`backend/api/enlace.py`](../../../backend/api/enlace.py)).

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
| `GET /practicas` | opcional | Catálogo. Sin sesión: solo publicadas. Alumnos: solo publicadas, en su versión publicada, con `mi_progreso`. Equipo: también borradores. |
| `GET /practicas/{id}` | opcional (sin sesión, solo publicadas) | Definición compilada (`?version=` para el equipo). Desde el motor 3.5 trae `ejemplo`: `{titulo, descripcion, pasos, revisa, codigo}` (los pasos en palabras, los aspectos que se comparan y el código del ejemplo). |
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

## Enlace en vivo (motor 3.4, script 010)

Motor 3.5: el latido acepta `detalle` (paso, mensaje del instructor, lista de la figura, modo, pistas y «Hazlo conmigo», con límites de tamaño) y `GET /enlace` lo devuelve en cada Blender en línea. Desde el 3.5.1 se guarda en `ADDON_ENLACES.DETALLE` (script 011), no en la memoria del proceso: lo ven todos los procesos del backend, solo se reescribe cuando cambia y deja de mostrarse a los 25 s sin latido. `POST /ordenes` acepta además `comprobar`, `pista`, `hazlo_conmigo`, `guardar` y `reiniciar` (este último con `confirmar: true`); con `practica_id`, Blender solo la cumple si sigue en esa práctica.

Motor 3.5 (el ejemplo manda, [14](14_ejemplo_y_revision.md)): `POST /ordenes` acepta `ver_ejemplo` (Blender arma el ejemplo resuelto en su propia escena) y `volver_practica` (vuelve a la escena del alumno). Cada punto de la lista del `detalle` puede llevar `aspecto` (hasta 40 caracteres: `figura`, `materiales`, `animacion`…), y `detalle.modo` es `EJEMPLO` mientras Blender muestra el ejemplo.

Código: [`backend/api/enlace.py`](../../../backend/api/enlace.py). Pruebas: `backend/tests/test_enlace.py`. Detalle en [12_plataforma_y_blender.md](12_plataforma_y_blender.md) y [13_instructor_y_silueta.md](13_instructor_y_silueta.md).

| Método y ruta | Quién | Qué hace |
|---|---|---|
| `POST /enlace` | add-on | Latido: `{practica_id, paso, progreso, enfocado, version_addon, version_blender, orden_hecha}`. Responde `{enlace, intervalo, orden, ajustes}`. 40 por minuto por cuenta. |
| `GET /enlace` | alumno | `{enlace, en_linea, blender: [{practica_id, practica, paso, progreso, enfocado, version_addon, version_blender, en_linea, orden_pendiente}], ajustes}` |
| `POST /ordenes` | alumno | `{tipo: abrir_practica \| enfocar \| ver_todo \| actualizar, practica_id?}` → `{entregada}` (false si no hay Blender abierto). |
| `GET /ajustes` · `PUT /ajustes` | alumno (PUT: solo la plataforma) | `enfoque`, `acompanamiento`, `avisos_herramientas`, `tarjeta_3d`. PUT deja una orden `actualizar` y responde 503 sin 010. |

`POST /practicas/{id}/abrir` (desde la plataforma) además deja la orden `abrir_practica` y responde `abierta_en_blender`. Sin 010 todo responde con `enlace: false` y nada se rompe.

## Tablas (Oracle, script 007)

| Tabla | Una fila por | Columnas principales |
|---|---|---|
| `ADDON_VINCULOS` | código pedido | `CODIGO`, `SECRETO_HASH`, `USUARIO_ID`, `DISPOSITIVO`, `ESTADO` (pendiente, listo, canjeado), `EXPIRA_EN` |
| `PRACTICAS` | práctica | `TITULO`, `NIVEL`, `VERSION`, `VERSION_PUBLICADA`, `ESTADO` (borrador, publicado, archivado), `ORIGEN` (repositorio, addon, panel), `CURSO_ID`, `LECCION_ID`, `DEFINICION` |
| `PRACTICA_VERSIONES` | versión subida | `DEFINICION`, `HUELLA`, `NOTA`, `AUTOR_ID`, `VERSION_ADDON`, `VERSION_BLENDER` |
| `PROGRESO_PRACTICAS` | alumno y práctica | `VERSION`, `PROGRESO`, `COMPLETADA`, `AUTONOMIA`, `PISTAS`, `CORRECCIONES`, `INTENTOS`, `PASO_ACTUAL`, `OBJETIVOS`, `ABIERTA_EN`, `COMPLETADA_EN` |

Script 010: `ADDON_ENLACES` (una fila por sesión de Blender: `SESION_ID`, `USUARIO_ID`, `VISTO_EN`, `PRACTICA_ID`, `PASO`, `PROGRESO`, `ENFOCADO`, `VERSION_ADDON`, `VERSION_BLENDER`, `ORDEN`, `ORDEN_EN`; se borra con la sesión; el script 011 del motor 3.5.1 le agrega `DETALLE`, un JSON anulable con el último mensaje del instructor) y `ADDON_AJUSTES` (una fila por alumno: `DATOS` en JSON).

Vista `V_AMATISTA_PRACTICAS`: cada práctica con su lección, autor, versión publicada, alumnos que la abrieron, cuántos la completaron y el progreso promedio.
