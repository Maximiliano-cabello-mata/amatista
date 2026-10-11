# Publicar la auditoría del 11 de octubre y Amatista Motor 5.2

Trae la plataforma reorganizada (pestaña Blender, recorrido guiado, Ayuda, Mi panel más corto), las correcciones de la auditoría (`docs/auditoria/2026-10-11_auditoria_completa.md`) y el add-on 5.2 con «Conoce Amatista Motor». **No necesita SQL**: las tres prácticas viajan en `ADDON_ENLACES.DETALLE` (010/011), que ya existe. Siguiente script libre: 013.

1. **Actualizar código y dependencias** en la VM (`despliegue/actualizar.sh`) y ejecutar las pruebas.
2. **Reiniciar** `sudo systemctl restart amatista-backend`.
3. **Archivar el curso «Primeros pasos»** en la base (sale del árbol de Blender sin borrar el progreso de nadie):
   ```
   cd backend
   python herramientas/contenido.py importar ../frontend/src/data/modulos/archivo/primeros_pasos-modulo-1.json
   ```
   Debe decir `módulo mod_pp_001 (actualizado, archivado)`.
4. **Importar el resto del contenido**: `python herramientas/contenido.py validar` y luego `importar` (trae la duración del jefe final de A-Frame módulo 1).
5. **Comprobar** `/api/salud`, `/api/addon/v1/estado` (`version_addon` 5.2.0), que el catálogo ya no trae «Primeros pasos con Amatista» y que Admin › Resumen ya no lo lista en «Por curso».
6. **Frontend**: publicar el build nuevo.
7. **Blender**: en la pestaña **Blender** de la plataforma, descargar **Amatista Motor 5.2**, reinstalarlo y reiniciar Blender. En la pestaña Amatista (tecla N) aparecen las tres prácticas; desde la plataforma, «Empezar en Blender ▶» abre la primera y la página la muestra en vivo.

**Orden seguro**: backend antes que el add-on. Un add-on 5.2 con el backend anterior funciona, pero el servidor viejo descarta el id de la práctica y la página no sabría cuál está en curso.

**Reversión**: volver al código anterior y reiniciar. Para devolver el curso «Primeros pasos», cambiar `"estado": "archivado"` por `"publicado"` en su JSON, moverlo a `data/modulos/` e importarlo. El add-on 5.1 sigue funcionando con el backend nuevo: la página Blender le pide reinstalar para ver las tres prácticas.

**Validación automatizada**: backend 391, motor y add-on 553, add-on en Blender 5.0.1 sin ventana (`addon/tests/en_blender.py`), vitest 282, lint y build. Falta la prueba con ventana: T-113.
