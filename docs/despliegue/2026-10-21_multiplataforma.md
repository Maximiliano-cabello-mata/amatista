# Publicar la plataforma multiplataforma (21 de octubre de 2026)

Trae la barra **Inicio · Explorar · Mi panel**, la página Explorar, el Estudio A-Frame, los módulos 2 a 5 de A-Frame y cuatro temáticas nuevas (T-116 a T-119; detalle en `docs/plataforma/12_multiplataforma_y_accesible.md`). **No hay SQL nuevo** (el siguiente libre sigue siendo 013) ni cambios en la API.

## Pasos (en la VM, después de los prerrequisitos de la guía del 11 de octubre)

1. **Actualizar el código** (`despliegue/actualizar.sh`) y reiniciar `sudo systemctl restart amatista-backend`. El backend no cambia, pero el importador lee los JSON del repositorio.
2. **Validar e importar el contenido**:
   ```
   cd backend
   python herramientas/contenido.py validar
   python herramientas/contenido.py importar
   ```
   Debe decir `0 errores` al validar y, al importar, crear `mod_aframe_002` a `mod_aframe_005` y actualizar `mod_aframe_001` (ahora trae sus disciplinas y A-Frame 1.7.0).
3. **Comprobar** `/api/salud` y que el catálogo de la API trae los cinco módulos de A-Frame.
4. **Frontend**: publicar el build nuevo (desde `frontend/`: `npm ci` y `npm run build`). Incluye los modelos de `public/modelos/` (cristal, árbol y casa), que la PWA guarda para usarlos sin conexión.
5. **Probar en el navegador**: `#/explorar` lista Blender y A-Frame con sus módulos; el buscador encuentra «luz»; `#/estudio` muestra la galería de modelos; una lección del módulo 4 de A-Frame revisa su reto.

**Add-on**: no hace falta reinstalarlo. Las temáticas nuevas (`practices/blender/temas.json`) son de A-Frame; el add-on las trae en su próximo paquete, sin efecto para el alumno de Blender.

**Orden**: cualquiera. Una PWA nueva con un catálogo viejo muestra los módulos de A-Frame desde sus JSON (modo sin conexión) hasta que se importen.

**Reversión**: volver al build anterior. Los módulos importados se pueden archivar cambiando `"estado"` a `"archivado"` en su JSON e importándolos de nuevo; no se borra el progreso de nadie.

**Validación automatizada**: backend 395, motor y add-on 553, vitest 301, lint y build; los cinco retos de A-Frame comprobados en Chromium (la solución pasa y el código inicial falla).
