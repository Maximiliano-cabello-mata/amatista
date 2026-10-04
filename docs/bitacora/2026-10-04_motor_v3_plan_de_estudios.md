# Bitácora · 4 de octubre de 2026 · Motor v3, plan de estudios, base de datos y dominio

Pedido de Maximiliano (4 oct, 20:37):

- una versión 3 del motor de Blender, más interactiva e intuitiva, con una interfaz que parezca una plataforma educativa y herramientas que faciliten a los desarrolladores crear prácticas;
- implementar el plan de estudios de Blender (teoría y práctica en Blender) y archivar lo anterior;
- cuatro cursos (principiante, principiante-intermedio, intermedio y avanzado), por ahora solo los dos primeros;
- revisar el dominio nuevo con SSL y planear su integración con «Cloud Fly» o la plataforma de despliegue;
- rediseñar y optimizar la base de datos pensando en una migración futura;
- documentarlo todo.

## Decisiones tomadas sin preguntar (se pueden cambiar)

| Tema | Decisión | Por qué |
|---|---|---|
| «Cloud Fly» | **Cloudflare** (DNS, proxy, Pages) delante de la VM de OCI; Fly.io como apéndice | Cloudflare ya estaba en el plan de lanzamiento para la PWA; la API necesita estar junto a Oracle por la ACL. |
| Reparto del plan | Módulos 1 a 3 → Principiante; 4 a 6 → Principiante-Intermedio | El plan tiene 6 módulos; Intermedio y Avanzado quedan «próximamente». |
| Archivar | Mover, no borrar: prácticas a `practices/archivo/v2/`, módulos a `modulos/archivo/`, curso Oracle `blender` a `archivado` con 009 | Quien avanzó en la v2 conserva progreso e insignias. |
| Base de datos | Dos columnas en CURSOS (008) y no tablas nuevas | Lo nuevo cabe en el esquema; una tabla sin lector es costo sin uso ([rediseño §4](../base-de-datos/01_rediseno_v3.md#4-qué-se-revisó-y-qué-se-decidió-no-hacer)). |
| Producción | Nada se tocó | El piloto del 8 de octubre corre sobre la v2.2. Todo va como scripts y guías para después. |

## Hecho (rama `claude/motor-v3-plan-estudios-ankwl7`, un PR, sin fusionar)

### Motor v3 (etapa 3)
- Formato `amatista.practice/2`:
  - píldoras de teoría con disparos (inicio, objetivo, modo, vigilante…) y pregunta opcional;
  - vigilantes que pausan el progreso y ofrecen arreglarlo;
  - escena de inicio y curso, con la práctica siguiente;
  - repaso de prácticas anteriores.
- Repaso espaciado de Leitner (1, 3, 7, 14 y 30 días) y plan de estudios `amatista.curriculum/1` (`practices/blender/cursos.json`).
- 35 validadores, entre ellos los nuevos de modificadores, materiales, luces, cámara, render y animación. Mensajes en español natural (singular y plural, modificadores traducidos, nombres del alumno).
- Herramientas de autor:
  - 7 plantillas;
  - `pruebas.json` con escenas descritas en JSON;
  - `engine/herramientas/practicas.py` (`nueva`, `revisar`, `probar`, `simular`, `validadores`, `plan`).

### Add-on 3.0.0
- Pestañas **Aprender** (píldoras y repaso), **Practicar** (guía, pausa y siguiente práctica) y **Mi curso** (mapa).
- HUD con la franja TEORÍA y el aviso PROGRESO EN PAUSA.
- Escenas de inicio: `nave_basica`, `estudio_foto` y `pelota_y_suelo`.
- «Hazlo conmigo» con acciones nuevas: agregar modificador, luz o cámara, cambiar el motor de render, render, material, keyframe y fusionar por distancia.
- Modo Desarrollador con el panel **Teoría y pruebas** (agregar píldora, guardar caso de prueba).
- Probado con `en_blender.py` en Blender 4.2.0 y 5.0.1. Para Blender 5.0 se cubrió: acciones por ranuras, EEVEE con su id nuevo y «Transmission Weight».

### Plan de estudios
- 6 prácticas con 29 casos de prueba:
  - Principiante: tren, espada, nave;
  - Principiante-Intermedio: pinta la nave, tres puntos, pelota.
- 6 módulos en la plataforma con 4 lecciones cada uno (gancho, explora, práctica y jefe).
- Cursos 01 y 02 publicados; 03 y 04 bloqueados como «próximamente».
- El curso `blender` v2 se archivó en el repositorio. En Oracle se archiva con 009, después del piloto.

### Base de datos
- `sql/008_cursos_por_ruta.sql`: `CURSOS.RUTA` y `CURSOS.REQUISITO_ID`, con la verificación vigente de las 18 tablas.
- `sql/009_archivar_blender_v2.sql`: archiva el curso v2, sus niveles, sus módulos y las prácticas `blender.n1.*`. Se detiene si el curso nuevo no está publicado y trae los UPDATE para deshacerlo.
- `diagnostico_oracle.py` recomienda «007 y luego 008» en el estado actual de producción.
- `sql/004` ya no falla si 007 todavía no se ejecutó.
- Revisión de índices contra las consultas reales: no falta ninguno.
- `backend/herramientas/migrar.py`:
  - genera el esquema para PostgreSQL, MySQL, SQLite u Oracle;
  - exporta a JSONL con manifiesto y huellas;
  - importa en una base vacía (todo o nada) y verifica los conteos.
- `docs/base-de-datos/`: rediseño v3, manual de 008 y 009, guía de migración y `esquema_postgresql.sql` generado.

### Despliegue y dominio
- Guía [`docs/despliegue/2026-10-04_dominio_amatista-3d.md`](../despliegue/2026-10-04_dominio_amatista-3d.md):
  - nameservers de Namecheap a Cloudflare;
  - modo Full (strict) con certificado de origen;
  - PWA en Pages en `amatista-3d.me` y API en `api.amatista-3d.me`;
  - firewall solo para Cloudflare, correo y Fly.io.
- PositiveSSL: no hace falta, queda reclamado.
- El registro de la compra se movió a `docs/despliegue/`.
- Hallazgos de código corregidos:
  - `Caddyfile` con el dominio, el certificado de origen y la IP real del alumno desde Cloudflare (validado con `caddy validate` 2.8.4);
  - `amatista-api.service` con las rutas reales de la VM;
  - `actualizar.sh` ya no se queda trabado en la rama local de la VM;
  - `api.js` ya no apunta por defecto a la IP por http cuando la PWA está en el dominio.

### Documentación y tablero
- `docs/motor/`:
  - [etapa 3](../motor/etapas/etapa-3.md);
  - [prácticas v3 y herramientas de autor](../motor/referencia/08_practicas_v3_y_herramientas.md);
  - catálogo de validadores regenerado.
- [`docs/cursos/`](../cursos/README.md): los cuatro cursos y el plan de estudios, movido desde la raíz.
- READMEs de la raíz, del motor, del add-on y de las prácticas; manual del código; `backend/sql/LEEME.txt`; CHANGELOG; `crear-tags.sh` con `v3.0.0-alpha.4`.
- Tablero:
  - T-062 y T-063 (motor v3 y herramientas de autor);
  - T-064 (aplicar 008 y 009 después del piloto);
  - T-065 (dominio con Cloudflare);
  - T-066 (add-on 3.0 con alumnos);
  - T-067 (cursos Intermedio y Avanzado);
  - T-068 (repaso en el servidor);
  - T-069 (ensayo de migración a PostgreSQL).
  - T-060 ya no habla de «008».

## Pruebas

| Suite | Resultado |
|---|---|
| `engine` (pytest) | 74 |
| `practicas.py probar` | 29 casos |
| `addon` (pytest) | 9 |
| `en_blender.py` en Blender 4.2.0 y 5.0.1 | OK |
| `backend` (pytest) | 289 |
| `frontend` (vitest, eslint, build) | 161 |
| `tablero` (pytest) | 8 |

**Sin probar contra Oracle real.** No se pudo levantar un contenedor de Oracle en la nube (Docker Hub y GHCR rechazaron la descarga). `test_esquema.py` revisa 008 y 009 como texto: comillas, bloques PL/SQL, columnas contra modelos y diagnóstico, y que no haya DELETE ni DROP.

## Para Maximiliano (desde su computadora)

- Tags: `bash herramientas/crear-tags.sh && git push origin --tags` (incluye `v3.0.0-alpha.4`). `v3.0.0-alpha.5` se agrega cuando este PR se fusione.
- Ramas viejas por borrar: las de la lista de memoria (reestructuración, motor, motor etapa 2, documentación completa) y, después de fusionar, esta.
- Antes del piloto se pueden hacer los pasos 1 a 4 de la guía del dominio (Cloudflare y Pages), porque no tocan la VM.
