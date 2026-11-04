# PWA para escuelas con pocos datos (T-160)

Muchas escuelas se conectan con datos móviles: pocos megas, señal que va y viene. La PWA de Amatista ya funcionaba sin conexión (todo se guarda en el dispositivo, en IndexedDB). Con esta actualización, **cuando hay una pizca de señal, el progreso llega al servidor rápido y gastando lo mínimo**, y desde ahí lo ven la administración, los profesores y Mi panel.

## Qué cambió

| Antes | Ahora |
|---|---|
| Dos peticiones por envío (`/api/progreso` y `/api/eventos`) | **Una sola**: `POST /api/sincronizar`, en una transacción (llega todo o nada) |
| Cuerpo JSON sin comprimir | **gzip** (`Content-Encoding: gzip`): un lote de 40 actividades pasa de **12,5 KB a 2,3 KB** |
| Si fallaba la red, se esperaba al siguiente cambio | **Reintentos solos** a los 5 s, 15 s, 45 s, 2 min y 5 min (con azar para que un aula entera no golpee al mismo tiempo) |
| Lo pendiente se quedaba si el alumno cerraba la app | **Al salir** (cambiar de pestaña, bloquear el teléfono, cerrar) se envía con `keepalive` |
| Al abrir la app se bajaba todo el progreso de la cuenta | Solo **lo cambiado** desde la última vez (`GET /api/progreso?desde=`), y todo una vez por semana |
| El panel de administración se precacheaba para todos | Solo lo baja quien lo abre (−105 KB del precache del alumno); igual para los paneles del profesor (`Profesor*`) |
| Tiempo máximo fijo de 8 s | En 3G el doble, en 2G el triple: cortar a medias gasta los datos igual |

## Ahorro de datos

Mi panel › tarjeta de cuenta › **Ahorro de datos**: *Automático* (por defecto), *Siempre* o *Nunca*.

- *Automático* lo enciende el ahorro de datos del sistema (Android/Chrome) o una red 2G.
- Con el ahorro activo: las imágenes se cargan solo si el alumno las pide, el catálogo se revisa como mucho cada 6 horas, los cambios se juntan hasta 20 s en un solo envío (nunca se aplazan más: la espera cuenta desde el primer cambio pendiente) y el modo ligero apaga animaciones.
- El estado de guardado muestra cuánto pesó el último envío («último envío 2.3 KB»).

## Compatibilidad con un backend anterior

La PWA descubre sola qué tiene el servidor (`frontend/src/progreso/canal.js`):

1. Primer envío a `/api/sincronizar` **sin comprimir** (un backend viejo rechazaría la cabecera `Content-Encoding` en el preflight de CORS y parecería un fallo de red).
2. Si responde, los siguientes van comprimidos.
3. Si responde 404, usa `/api/progreso` + `/api/eventos` como siempre y vuelve a probar al día siguiente.

Así se puede publicar la PWA antes o después de actualizar la VM sin perder nada. Probado contra el backend de `main` anterior: cae a las rutas de siempre y sigue guardando.

## Servidor

- `backend/api/sincronizar.py`: `POST /api/sincronizar` con `progreso`, `insignias` y `eventos` (mismos límites y reglas que las rutas separadas: progreso monotónico, eventos con id del dispositivo, reenvíos sin duplicar). Ruta pública como `/api/progreso` (los anónimos sincronizan con su id).
- `backend/main.py` › `DescomprimirCuerpo`: acepta cuerpos gzip en cualquier ruta; mide lo comprimido (LimitarCuerpo) y vuelve a medir al descomprimir, así una «bomba» de gzip se corta en `AMATISTA_MAX_CUERPO`. Otra codificación → 415, gzip roto → 400.
- `GET /api/progreso?desde=<servidor_en>` devuelve solo las lecciones cambiadas (con 2 minutos de margen) más todas las insignias, y `servidor_en` para la próxima vez. La fusión de un anónimo con su cuenta ahora marca las filas como cambiadas en ese momento.
- Sin SQL nuevo.

## Desplegar (T-161)

1. En la VM: actualizar el backend (`despliegue/actualizar.sh`) y reiniciar `amatista-backend`.
2. Comprobar: `curl -s -o /dev/null -w "%{http_code}" -X POST https://api.amatista-3d.tech/api/sincronizar -H 'Content-Type: application/json' -d '{}'` → `422` (con el backend viejo da `404`).
3. Publicar la PWA como siempre.

## Lo que no hace (todavía)

- **Background Sync** con la app totalmente cerrada: el service worker no tiene el token de la cuenta. Hoy cubre el envío al salir y el reintento al volver a abrir.
- Las actualizaciones de la PWA siguen bajando los archivos que cambiaron en cada versión publicada.
