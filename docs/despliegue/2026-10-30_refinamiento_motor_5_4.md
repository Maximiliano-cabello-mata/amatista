# Publicar el refinamiento, las dinámicas v4.3 y Amatista Motor 5.4 (30 de octubre de 2026)

Trae «Abrir en Blender» que abre Blender aunque esté cerrado (enlace `amatista://`), **Amatista dentro de Blender** (add-on 5.4: menú arriba, botón en la vista 3D, barra de estado y espacio de trabajo «Amatista»), los botones Facetas 4.1, las tarjetas para elegir nivel y tres dinámicas nuevas (Entrena tus teclas, Ajusta el valor, Encuentra el error). Tareas T-132 a T-136; detalle en `docs/plataforma/14_refinamiento_y_dinamicas.md`. **No hay SQL nuevo** (el siguiente libre sigue siendo 013) ni rutas nuevas en la API; el validador del backend conoce los bloques nuevos, así que el backend se actualiza **antes** de importar.

## Pasos (en la VM)

1. **Actualizar el código** (`despliegue/actualizar.sh`) y reiniciar `sudo systemctl restart amatista-backend`.
2. **Validar e importar el contenido** (cuatro lecciones con dinámicas nuevas: `bp1_explora`, `bp3_explora`, `bi1_explora`, `af2_practica`):
   ```
   cd backend
   python herramientas/contenido.py validar
   python herramientas/contenido.py importar
   ```
   Debe decir `15 archivo(s), 0 con errores`.
3. **Comprobar** `/api/salud` y `/api/addon/v1/estado` (`version_addon` 5.4.0, nombre «Amatista Motor 5.4»).
4. **Frontend**: publicar el build nuevo (desde `frontend/`: `npm ci` y `npm run build`; en Cloudflare, el despliegue de `main`).
5. **Blender, en tu computadora**: en la página **Blender**, descargar **Amatista Motor 5.4** con la sesión iniciada y ejecutar el instalador. Debe decir «Enlace con la plataforma: …» y «Listo». Después pulsa **«Abrir Blender ahora»** en la misma página: con Blender cerrado, el navegador pregunta si puede abrir «Amatista para Blender» (elige Abrir y «Permitir siempre») y Blender arranca en el espacio **Amatista**.
6. **Probar en Blender** (T-134): arriba aparece el menú **Amatista** junto a Ayuda; en la cabecera de la vista 3D, el botón **Amatista** despliega el taller; al empezar una actividad, la barra de estado (abajo) la nombra.
7. **Probar en el navegador**: en `#/curso/blender_principiante/leccion/bp1_explora`, «Entrena tus teclas» responde a G › X; en `#/curso/blender_intermedio/leccion/bi1_explora`, «Ajusta el valor» dice «te falta» o «te pasaste»; en `bp3_explora`, «Encuentra el error» explica cada paso.

**Si «Abrir en Blender» no abre Blender**: abre Blender a mano y elige **Amatista › Reparar «Abrir en Blender»** (o Preferencias › Extensiones › Amatista). En macOS, la app queda en `~/Applications/Amatista para Blender.app`; en Linux, `~/.local/share/applications/amatista-blender.desktop`; en Windows, `HKCU\Software\Classes\amatista`. La lección siempre muestra «¿No se abrió Blender?» con los arreglos.

**Orden y compatibilidad**: backend y contenido antes que el frontend. Un add-on 5.3 sigue funcionando con todo lo nuevo (solo que la plataforma no puede arrancarlo: con Blender cerrado, la lección muestra «¿No se abrió Blender?» e invita a instalar el 5.4). Una PWA vieja con el backend nuevo ignora los bloques nuevos.

**Reversión**: volver al build y al código anteriores. El enlace `amatista://` se puede dejar (sin el 5.4, Blender se abre y no hace nada más); para quitarlo, borra la clave, la app o el `.desktop` de arriba.

**Validación automatizada**: backend 413, tablero, motor y add-on 575, add-on dentro de Blender 5.0.1 sin ventana (`addon/tests/en_blender.py`, sin fallas, con la sección «Amatista dentro de Blender»), vitest 332, lint y build. Capturas en Chromium de la elección de nivel, el camino, la página Blender y las tres dinámicas.
