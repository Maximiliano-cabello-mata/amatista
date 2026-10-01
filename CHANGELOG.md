# Changelog

Todas las versiones de Amatista. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [versionado semántico](https://semver.org/lang/es/).

## [Sin publicar]

### Cambiado
- La lección "El Pipeline" usa una ilustración en lugar de un video con URL de ejemplo.
- A-Frame se descarga solo al usar el laboratorio o una vista 3D, y queda en caché para usarse sin conexión.
- Los documentos de `docs/` se nombran con su fecha de creación (`AAAA-MM-DD_tema.txt`).
- La bitácora del 27/09 se fechó en hora local (UTC-6).

### Agregado
- Módulo 1 de Blender ("El mundo 3D y la magia de Blender") y de A-Frame ("La web en 3D"), con el contenido del equipo. A-Frame pasa a estar disponible.
- Mapa del módulo con lecciones que se desbloquean en orden, y reproductor de lecciones: markdown, línea de tiempo, tarjetas de concepto que se voltean, pipeline ilustrado, capas, avisos, código con vista 3D en vivo de A-Frame y examen.
- Progreso local en IndexedDB con XP e insignias; se sincroniza con `/api/progreso` cuando el backend responde.
- Ilustraciones low poly en SVG generadas con `npm run ilustraciones`.
- Backend en el repositorio: FastAPI + SQLAlchemy (Oracle o SQLite), rutas de sesiones, progreso y salud, 14 pruebas.
- `backend/sql/001_esquema_amatista.sql` y `backend/diagnostico_oracle.py` para dejar Oracle consistente.
- Laboratorio técnico: muestra por separado el estado del backend y el de la base de datos.
- Identidad visual low poly estilo videojuego y pantalla de inicio "Elige tu curso".
- PWA instalable: manifest, íconos y service worker con `vite-plugin-pwa`. La pantalla de cursos funciona sin conexión.
- A-Frame y las fuentes (Outfit, JetBrains Mono) instalados con npm en lugar de CDN.
- Laboratorio técnico en `#/laboratorio`: el panel de Oracle y el visor A-Frame se cargan bajo demanda.
- `CHANGELOG.md` y política de tags de versión.
- Investigación sobre cómo avanza el desarrollo (`docs/bitacora/2026-09-27_investigacion_desarrollo.txt`).

## [0.1.0] - 2026-09-27

Primera versión con integración completa **React → FastAPI → Oracle**.

### Agregado
- App Shell PWA con React 19, Vite y Tailwind v4 con la paleta Amatista.
- Visor 3D con A-Frame integrado.
- Conexión con el backend FastAPI y Oracle Autonomous DB (CORS resuelto).
- Flujo de sesiones: el usuario recibe un ID autoincremental y la sesión un UUID.
- Documentación de arquitectura, backend y base de datos, convención de commits e incidencias.
- Propuestas de producto: Amatista 3D Lab y motor generativo 3D.

### Corregido
- `Errno 98` (puerto 8000 ocupado) y bloqueo de CORS en el servidor.
- `ORA-01400` al insertar usuarios (llaves primarias con `Identity`).
- El indicador de estado mostraba "Conectado" aunque el backend fallara.

### Pendiente conocido
- El código del backend todavía no está en el repositorio.
- `manifest.json` y `sw.js` vacíos: la PWA aún no funciona sin conexión.
- No hay autenticación real (las sesiones se crean solo con un email).

[Sin publicar]: https://github.com/Maximiliano-cabello-mata/amatista/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Maximiliano-cabello-mata/amatista/releases/tag/v0.1.0
