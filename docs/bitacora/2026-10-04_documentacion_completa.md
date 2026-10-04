# Bitácora · 4 de octubre de 2026 · Documentación completa

**En tres líneas**
- **Hecho:** toda la documentación quedó organizada en diez secciones, con historia del proyecto, manual del código, esquema SQL, manual del desarrollador, herramientas de la plataforma, guía de despliegue en OCI y un README nuevo.
- **Estado:** rama `claude/documentacion-completa-s4sztc`, en un PR que espera la revisión de Maximiliano. Solo documentación: no cambia el comportamiento de la plataforma, la base de datos ni el piloto.
- **Siguiente:** fusionar, crear el tag `v3.0.0-alpha.4` sobre la fusión y seguir con el piloto del 8 de octubre.

## 1. Qué se pidió

Ordenar toda la documentación por secciones claras y dejar registrado absolutamente todo lo realizado: cómo llegamos hasta aquí, una cronología exacta, las ideas y cómo se implementaron, una carpeta nueva con el código explicado como manual de uso, las herramientas que usa la plataforma, un esquema SQL, un manual del desarrollador con todas sus herramientas, una revisión de la plataforma en los commits antiguos, un tag, esta bitácora y el README rehecho.

## 2. Qué se hizo

| Pedido | Resultado |
|---|---|
| Secciones claras | [`docs/README.md`](../README.md) reescrito: diez secciones, para quién es cada una y por dónde empezar; estado de cada documento; reglas de la documentación. Cada sección nueva tiene su `README.md` |
| Cómo llegamos y cronología exacta | [`historia/01_cronologia.md`](../historia/01_cronologia.md): los dos historiales (repositorio original y oficial), cada commit y PR con hora de México, quién lo hizo, tags y números del proyecto |
| Ideas y cómo se implementaron | [`historia/02_ideas_y_como_se_implementaron.md`](../historia/02_ideas_y_como_se_implementaron.md): 153 ideas en 16 temas (85 implementadas, 30 parciales, 28 pendientes, 10 descartadas o reemplazadas), cada una con origen, estado, archivos y tarea |
| Revisar la plataforma en commits antiguos | [`historia/03_la_plataforma_en_cada_version.md`](../historia/03_la_plataforma_en_cada_version.md): el código de cada versión, de `v0.1.0` a `d004071` |
| Folder nuevo: el código como manual de uso | [`manual-del-codigo/`](../manual-del-codigo/README.md): mapa del repositorio, frontend, backend (72 rutas), motor, add-on y prácticas, con recetas |
| Herramientas de la plataforma | [`herramientas-de-la-plataforma.md`](../herramientas-de-la-plataforma.md): cada tecnología, para qué y dónde, más las 20 herramientas de enseñanza |
| Esquema SQL | [`base-de-datos/`](../base-de-datos/README.md): diagrama entidad-relación de las 18 tablas, cada columna, vistas, paquete `AMATISTA_AUTOR` y un `esquema_completo.sql` de referencia |
| Manual del desarrollador | [`desarrollador/`](../desarrollador/README.md): primer día, entorno local, las 13 herramientas de terminal con todas sus opciones, herramientas dentro de la plataforma, pruebas y CI, flujo de trabajo |
| Optimizar la documentación | Guía de despliegue en OCI que faltaba desde el 2 de octubre (T-031); referencias del `Caddyfile` y la unidad systemd apuntando a ella; `PROYECTO.md` sin la lista duplicada de documentos; datos viejos corregidos en `docs/motor/` (estado de la etapa 2, prueba en Blender, `level` obligatorio, paquete del instalador, autenticación de `GET /practicas`), en `backend/README.md` (`/docs` en el servidor) y en `tablero/README.md` (rama `dev`) |
| Tag | `v3.0.0-alpha.3` (`d004071`) agregado a `herramientas/crear-tags.sh`; `v3.0.0-alpha.4` se crea sobre la fusión de este PR |
| README | Reescrito: estado, cómo llegamos, qué hace, arquitectura, estructura, base de datos, tecnologías, ejecución local, herramientas, forma de trabajo, versiones, qué sigue y mapa de la documentación |
| Tablero | T-061 (esta entrega); T-031 en revisión con la evidencia nueva; T-057 y T-058 en hecho (fusionadas con el PR #14) |

**Decisión:** no se movieron carpetas existentes de `docs/`. El panel de administración, el add-on y los scripts SQL citan rutas `docs/...` en su código; moverlas habría obligado a tocar código. Las secciones se organizan en el índice y las carpetas nuevas se suman a las que ya había.

## 3. Hallazgos al revisar el código (no corregidos: son código)

Cada documento los registra en su sección de inconsistencias. Los que importan para el piloto van primero.

1. **La PWA apunta por defecto a la IP de producción por HTTP.** `frontend/src/services/api.js:4` usa `http://158.101.118.222:8000` si falta `VITE_API_URL`. Publicada por HTTPS sin esa variable, dejaría de sincronizar sin avisar. Revisar en T-005.
2. **`004` falla hasta que se aplique `007`.** El script del usuario de aplicación exige las 18 tablas (ORA-20001). Correrlo después de 007, como ya dice el orden de `LEEME.txt`.
3. **`actualizar.sh` se detendría hoy en la VM**: el 3 de octubre estaba en la rama local `despliegue/v3-2026-10-03` y el script exige `main` sin cambios. Además `main` ya trae código que necesita 007: no actualizar hasta después del piloto (T-055).
4. **`amatista-api.service` no sirve tal cual en la VM** (`/opt/amatista`, usuario `amatista`, `ProtectHome=true`, mientras la VM usa `/home/opc/amatista`). La guía de OCI explica las dos salidas (T-003).
5. **`contenido.py nueva-leccion` rompe un módulo con práctica**: agrega la lección después de la práctica de Blender y `validar` falla. El ejemplo del docstring y del manual de Oracle usa justo el módulo 2.
6. **`engine/herramientas/run_in_blender.py`** es del prototipo y no funciona sin editar rutas.
7. **La versión del add-on está en tres lugares** (manifiesto, `bl_info`, `ajustes.VERSION_ADDON`) y la prueba solo compara los dos primeros.
8. **`#/laboratorio`** descarga A-Frame antes de comprobar el rol.
9. **Encabezados de SQL**: 007 remite a la sección 7 del manual de Oracle (es la 10); 001 y 005 muestran un orden de scripts anterior al de `LEEME.txt`.
10. **Base de datos**: `EVENTOS_APRENDIZAJE.DATOS` no tiene `IS JSON`; varias referencias sin llave foránea; `EVALUACIONES_RUBRICA` sin API.
11. **T-022 (la Fórmula)** está en hecho, pero solo el módulo 2 marca el paso de la Fórmula en sus lecciones.

## 4. Pendiente para Maximiliano

1. Revisar y fusionar el PR.
2. Desde la PC, después de fusionar:
   ```bash
   git switch main && git pull
   git push origin --delete claude/documentacion-completa-s4sztc
   bash herramientas/crear-tags.sh
   git tag -s v3.0.0-alpha.4 -m "v3.0.0-alpha.4 — Documentación completa: historia, manual del código, esquema SQL, manual del desarrollador y README" origin/main
   git push origin --tags
   ```
   (`-s` firma con SSH; sin firma configurada usa `-a`.)
3. Decidir si los hallazgos 1, 3, 4 y 5 entran como tareas antes del piloto.
