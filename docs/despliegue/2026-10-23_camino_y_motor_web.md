# Publicar el camino guiado, el Motor Web y los dos cursos de A-Frame (23 de octubre de 2026)

Trae la portada **Cursos** como camino guiado (sin Explorar ni buscador), el **Motor Web de Amatista** sobre A-Frame, los recursos gráficos v4.2 de las lecciones, el contenido de Blender revisado, **A-Frame Inicial** y **A-Frame Interactivo**, y el **add-on 5.3** (menús en el idioma de tu Blender y «Palabras de Blender»). Tareas T-122 a T-128; detalle en `docs/plataforma/13_camino_graficos_y_motor_web.md`. **No hay SQL nuevo** (el siguiente libre sigue siendo 013) ni cambios en la API; el validador del backend sí conoce los bloques nuevos, así que el backend se actualiza **antes** de importar.

## Pasos (en la VM, después de los prerrequisitos de las guías del 11 y del 21 de octubre)

1. **Actualizar el código** (`despliegue/actualizar.sh`) y reiniciar `sudo systemctl restart amatista-backend`.
2. **Validar e importar el contenido nuevo**:
   ```
   cd backend
   python herramientas/contenido.py validar
   python herramientas/contenido.py importar
   ```
   Debe decir `15 archivo(s), 0 con errores` y, al importar, crear el curso `aframe_interactivo` con `mod_afi_001` a `mod_afi_003` y actualizar los módulos de Blender y de A-Frame 1 a 3.
3. **Archivar los módulos 4 y 5 del curso «aframe»** (su contenido ya vive en A-Frame Interactivo; no se borra el progreso de nadie):
   ```
   python herramientas/contenido.py importar ../frontend/src/data/modulos/archivo/aframe-modulo-4.json
   python herramientas/contenido.py importar ../frontend/src/data/modulos/archivo/aframe-modulo-5.json
   ```
4. **Comprobar** `/api/salud`, `/api/addon/v1/estado` (`version_addon` 5.3.0) y que el catálogo de la API trae **A-Frame Inicial** (3 módulos) y **A-Frame Interactivo** (3 módulos).
5. **Frontend**: publicar el build nuevo (desde `frontend/`: `npm ci` y `npm run build`).
6. **Blender**: en la página **Blender**, descargar **Amatista Motor 5.3**, reinstalarlo y reiniciar Blender. Con Blender en inglés, la tarjeta dice «Shift + A › Mesh (Malla) › Cube (Cubo)»; la pestaña Aprender muestra «Palabras de Blender».
7. **Probar en el navegador**: `#/` muestra el camino con los programas Blender y A-Frame; `#/explorar` lleva a la portada; la lección `#/curso/aframe_interactivo/leccion/afm_gancho` abre su isla y la bandera se arrastra a la cima.

**Avance de los alumnos**: quien ya había hecho lecciones de los módulos 4 o 5 de A-Frame las ve hechas en A-Frame Interactivo: la PWA traslada las claves `aframe:af4_*` y `aframe:af5_*` (y sus insignias) al abrir. Los registros del servidor siguen con el curso viejo y se leen igual.

**Orden**: backend y contenido antes que el frontend. Una PWA nueva con el catálogo viejo funciona (oculta los módulos 4 y 5 aunque el servidor todavía los envíe). Un add-on 5.2 sigue funcionando con el backend nuevo.

**Reversión**: volver al build y al código anteriores. Para devolver los módulos viejos, cambiar su `"estado"` a `"publicado"` e importarlos; los de `aframe_interactivo` se archivan igual.

**Validación automatizada**: backend 405, motor y add-on 559, add-on dentro de Blender 5.0.1 sin ventana (`addon/tests/en_blender.py`, sin fallas), vitest 318, lint y build. Capturas en Chromium del camino, de cada bloque gráfico nuevo y de una lección del Motor Amatista.
