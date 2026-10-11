# Publicar «Primeros pasos con Amatista» y Amatista Motor 5.1

Trae el curso de introducción, los recursos gráficos nuevos y el add-on 5.1 con los primeros pasos dentro de Blender. **No necesita SQL**: el recorrido viaja en `ADDON_ENLACES.DETALLE` (010/011), que ya existe. Siguiente script libre: 013.

1. **Actualizar código y dependencias** en la VM (`despliegue/actualizar.sh`) y ejecutar las pruebas.
2. **Reiniciar** `sudo systemctl restart amatista-backend`.
3. **Importar el contenido**: `python herramientas/contenido.py validar` y luego `importar`. Crea el curso `primeros_pasos` (número 00, orden 0, ruta blender) si falta, su módulo `mod_pp_001` y los bloques nuevos intercalados en los 9 módulos de Blender. Los ids de lecciones de siempre no cambian: el progreso se conserva.
4. **Comprobar** `/api/salud`, `/api/addon/v1/estado` (`version_addon` 5.1.0) y que el catálogo trae el curso «Primeros pasos con Amatista».
5. **Frontend**: publicar el build nuevo.
6. **Blender**: en «Mi Blender», descargar **Amatista Motor 5.1**, reinstalarlo y reiniciar Blender. En la pestaña Amatista aparece «Empezar los primeros pasos». Con la lección «Tus primeros pasos en Blender» abierta, «Empezar en Blender ▶» abre el recorrido y la lección lo muestra en vivo.

**Orden seguro**: backend antes que el add-on. Un add-on 5.1 con el backend anterior sigue funcionando, pero el servidor viejo descarta `detalle.recorrido` y rechaza la orden `recorrido`, así que la lección no lo vería en vivo.

**Reversión**: volver al código anterior y reiniciar. El curso `primeros_pasos` puede quedar en la base (archivarlo desde Admin si se quiere ocultar). El add-on 5.0 sigue funcionando con el backend nuevo: la lección le pide reinstalar para hacer los primeros pasos.

**Validación automatizada**: `backend/tests/test_enlace.py` (detalle del recorrido sin práctica, límites y orden), `backend/tests/test_contenido.py` (los 7 bloques nuevos), `addon/tests/test_recorrido.py`, `addon/tests/en_blender.py › probar_recorrido` y `frontend` (`recursos.test.js`, catálogo con el nivel 0). Falta probar en Blender con ventana: abrir la barra con N y orbitar solo se comprueban con una ventana real.
