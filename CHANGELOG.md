# Changelog

Todas las versiones de Amatista. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [versionado semántico](https://semver.org/lang/es/).

| Versión | Fecha | Fase | Commit |
|---|---|---|---|
| [2.0.1] | 2026-10-01 | Repositorio oficial | `573ea89` |
| [2.0.0] | 2026-09-29 | **V2 · Plataforma educativa** | `0ea0e8a` |
| [1.0.0] | 2026-09-28 | **V1 · Integración** | `cde262b` |
| [0.1.0] | 2026-09-27 | Prototipo | `0772159` |

Los tags se crean con `bash herramientas/crear-tags.sh` (ver `docs/2026-10-01_versiones-y-tablero.txt`).

## [Sin publicar]

### Agregado
- Tags de versión organizados por fases y script `herramientas/crear-tags.sh`.
- Tablero Kanban con roadmap que se actualiza solo con los commits (`tablero/`, `KANBAN.md`).

## [2.0.1] - 2026-10-01

### Cambiado
- El repositorio oficial pasa a ser `Maximiliano-cabello-mata/amatista`; enlaces actualizados.
- Los commits se firman con SSH.
- Reemplaza al tag `v0.2.0`, que apuntaba a esta misma versión.

## [2.0.0] - 2026-09-29

V2: Amatista pasa de prototipo técnico a **plataforma educativa**: identidad low poly, PWA que funciona sin conexión, primeras lecciones y progreso.

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

### Cambiado
- La lección "El Pipeline" usa una ilustración en lugar de un video con URL de ejemplo.
- A-Frame se descarga solo al usar el laboratorio o una vista 3D, y queda en caché para usarse sin conexión.

## [1.0.0] - 2026-09-28

V1: primera versión con integración completa **React → FastAPI → Oracle**.

### Agregado
- Tailwind v4 con la paleta Amatista.
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

### Documentación
- `docs/` organizado en carpetas: arquitectura, bitácora, incidencias y propuestas.
- Los documentos de `docs/` se nombran con su fecha de creación (`AAAA-MM-DD_tema.txt`).
- `CHANGELOG.md` y política de tags de versión.
- Investigación sobre cómo avanza el desarrollo (`docs/bitacora/2026-09-27_investigacion_desarrollo.txt`).

## [0.1.0] - 2026-09-27

Prototipo: estructura del monorepo y primera pantalla.

### Agregado
- Monorepo con `frontend/`, `backend/`, `ai_tutor/` y `docs/`.
- App Shell con React, Vite y Tailwind, con un visor A-Frame integrado.
- Documentación inicial, mapa mental y convención de commits.

[Sin publicar]: https://github.com/Maximiliano-cabello-mata/amatista/compare/v2.0.1...HEAD
[2.0.1]: https://github.com/Maximiliano-cabello-mata/amatista/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/Maximiliano-cabello-mata/amatista/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/Maximiliano-cabello-mata/amatista/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/Maximiliano-cabello-mata/amatista/releases/tag/v0.1.0
