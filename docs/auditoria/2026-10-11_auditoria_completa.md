# Auditoría completa de Amatista · 11 de octubre de 2026

Pedido de Maximiliano: revisar todo lo construido desde el primer commit (historial, tags, pruebas, cada página y cada lección), corregir los errores gráficos, de código y de seguridad, y darle a la plataforma un sentido y un diseño claros: que se sienta un solo producto, que un alumno no necesite saber programar, que el curso de introducción deje de ser un curso y que el add-on se explique entero.

Rama `claude/auditoria-orden-plataforma-wfzu65`. Tablero: T-110 (auditoría), T-111 (plataforma), T-112 (add-on 5.2), T-113 (prueba con ventana), T-114 (tags).

## 1. Resumen

- **16 errores corregidos** en esta rama (sección 4), de ellos 1 alto («¿Verdad o mito?» no volteaba) y 6 medios.
- **La plataforma se reorganizó** (sección 5): barra **Cursos · Blender · Mi panel**, un **recorrido guiado** de 10 paradas por las páginas reales en lugar del curso «Primeros pasos», la **tarjeta de la fusión** plataforma ↔ add-on, **Ayuda** sin candados y **Mi panel** un 38 % más corto.
- **El add-on se explica entero**: Amatista Motor 5.2 trae **«Conoce Amatista Motor»**, tres prácticas cortas (no un curso) que recorren todas sus herramientas; se empiezan y se ven en vivo desde la página Blender.
- **Historial limpio**: 270 commits y 49 merges revisados; ninguna clave, contraseña real, wallet de Oracle ni archivo grande en la historia. Los tags publicados apuntan a commits de `main`. Faltaban 4 tags (alpha.11 a alpha.14), ya agregados al script.
- **Quedan 5 puntos abiertos** que no se arreglan desde el código (sección 6); el más importante es que la API de producción sigue en HTTP.

## 2. Qué se revisó y cómo

| Qué | Cómo |
|---|---|
| Historial | Clon completo (`git fetch --unshallow`): 270 commits en `main`, 49 merges, PR #1 a #34. Autores: Claude 96, bot del tablero 95, Maximiliano 68 (con tres identidades distintas), Kaneda343 7, Copilot 4. |
| Secretos | Búsqueda en todo el historial (`git log -p`) de llaves privadas, tokens de GitHub/AWS/Slack/OpenAI, contraseñas literales y archivos `.env`, wallets o `tnsnames`. Solo aparecen contraseñas de prueba en `backend/tests/`. |
| Archivos pesados | Ningún blob de más de 2 MB en la historia. |
| Tags | `v0.1.0` a `v3.0.0-alpha.10` publicados y todos dentro de `main`. Sin tag: `ee22e5e` (#29), `a9df7e9` (#30), `0d171df` (#31), `48025f7` (#32), `7d17f81` (#33), `70064b2` (#34). |
| Pruebas | Backend, motor, add-on (también dentro de Blender 5.0.1 sin ventana), vitest, lint, build y validación del contenido, antes y después de los cambios. |
| Pantallas | Playwright sobre la PWA real con backend local (SQLite): todas las páginas de alumno, anónimo y administrador a 390 y 1280 px, y **las 48 lecciones** del catálogo a 390 px. Por página: errores de consola, peticiones fallidas, respuestas 4xx/5xx y desborde horizontal. Capturas revisadas a mano. |
| Interacciones | Tarjetas «¿Verdad o mito?» (voltear y seguir), formulario del código de Blender, recorrido guiado completo en escritorio y teléfono, prácticas del add-on con un Blender simulado que late y cumple órdenes. |
| Admin | Resumen, Ver la plataforma, Auditoría, Módulos, Prácticas, Herramientas, Usuarios y Estado. |

## 3. Pruebas

| Suite | Al empezar (`main` 7530b80) | Al terminar |
|---|---|---|
| Backend (`backend/`, pytest) | 392 ✓ | 391 ✓ (una menos: la validación parametrizada por JSON de módulo ya no incluye el de «Primeros pasos», que pasó a `archivo/`) |
| Motor y add-on (`engine/tests addon/tests`) | 551 ✓ | 553 ✓ |
| Add-on dentro de Blender 5.0.1 sin ventana (`addon/tests/en_blender.py`) | OK | OK (incluye las tres prácticas nuevas) |
| Frontend (vitest) | 277 ✓ | 282 ✓ |
| Lint | ✓ | ✓ |
| Build | ✓ con aviso de Vite 8 | ✓ sin avisos |
| Contenido (`contenido.py validar`) | 0 errores | 0 errores |
| Recorrido de pantallas | 18 lecciones y `#/vincular` desbordaban a 390 px | 0 problemas (solo avisos de WebGL por software en el Diagnóstico técnico, propios del navegador sin GPU) |

## 4. Hallazgos corregidos

Gravedad: **alta** rompe algo que el alumno necesita; **media** confunde o se ve mal; **baja** detalle o riesgo menor.

| # | Área | Gravedad | Hallazgo | Corrección |
|---|---|---|---|---|
| A-01 | Gráfico | Alta | **«¿Verdad o mito?» no volteaba.** La animación de entrada (`animar-entrar`, `fill-mode: both`) fijaba `transform` en la misma tarjeta que debía girar con `rotateY`, así que el giro nunca se veía y la respuesta quedaba oculta. | La animación pasa a un contenedor; la cara oculta es `inert`. Probado clic a clic. `c6c5de4` |
| A-02 | Gráfico | Media | El formulario del código de Blender desbordaba a 390 px en 18 lecciones y en `#/vincular` (el botón se salía de la pantalla). | Campo y botón que se acomodan en dos filas. `c6c5de4` |
| A-03 | Gráfico | Baja | Admin › Auditoría: en «Equipo con acceso» el nombre se montaba sobre la etiqueta del rol. | Nombre recortado con «…». `c6c5de4` |
| A-04 | Conflicto | Media | El curso v2 `blender` (archivado) aparecía en Mi panel y en Admin › Ver la plataforma como «Blender, 0 de 0 lecciones». | El catálogo quita los cursos archivados en un solo lugar (`sinArchivados`). `8af56a8` |
| A-05 | Diseño | Alta (pedido) | El curso de introducción «Primeros pasos con Amatista» era un curso más del árbol de Blender (nivel 0, con jefe final) y además se listaba al final. | Retirado del árbol; su JSON queda en `data/modulos/archivo/` sin borrar el progreso de nadie. Lo reemplaza el recorrido guiado. `8af56a8`, `e1c1287` |
| A-06 | Contenido | Media | Las lecciones decían «un código de 6 letras»; el código real tiene **8 caracteres** (`ABCD-2345`) y vale 10 minutos. | Textos corregidos. `62f48ee` |
| A-07 | Add-on | Alta (pedido) | El recorrido del add-on 5.1 explicaba solo vista, mover y la tarjeta: no explicaba cuenta, plataforma, lección, ajustes, guardar, herramientas, ayuda, enfoque, molde, pistas, pausa, isla ni el enlace. | Add-on 5.2: tres prácticas que cubren 24 temas (sección 5.3). `4d45128`, `efe01e3` |
| A-08 | Navegación | Media | La página de Blender estaba escondida en el menú de la cuenta como «Mi Blender»; los alumnos no la encontraban y la plataforma se sentía separada del add-on. | Pestaña **Blender** en la barra. `e1c1287` |
| A-09 | Diseño | Media | La «Guía» tenía capítulos con candado y preguntas: se sentía como otro curso. | Pasa a **Ayuda**: el recorrido, la tarjeta de la fusión y preguntas rápidas que se abren de a una. `e1c1287` |
| A-10 | Gráfico | Baja | `#/blender` desbordaba 17 px a 390 px (fila de Blender conectados y cuadrícula de ajustes). | `e1c1287` |
| A-11 | Diseño | Media | Mi panel medía ~6700 px: cinco tarjetas de curso sueltas y todos los talleres, exámenes e insignias a la vez. | Una tarjeta por ruta y listas con «Ver todos»: ~4200 px. `970b88d`, `fb3955d` |
| A-12 | Código | Baja | Admin › Resumen contaba lecciones de módulos archivados («primeros_pasos, 6 lecciones»). | Solo cuentan módulos no archivados, como en el catálogo. Prueba nueva. `e93545b` |
| A-13 | Contenido | Baja | El jefe final de A-Frame módulo 1 no indicaba su duración (Admin › Auditoría lo marcaba). | `durationSeconds: 300`. `e07bb30` |
| A-14 | Seguridad | Baja | Vite 8 ignoraba `esbuild.legalComments: 'none'` (avisaba en cada build): la protección de comentarios del JS publicado dependía de una opción muerta. | `build.rolldownOptions.output.comments: false`. `57475fe` |
| A-15 | Documentación | Baja | `CHANGELOG.md` tenía la sección «3.5.1» (Codex, PR #26) antes del título del archivo. | Movida a su lugar. Commit de documentación de esta rama. |
| A-16 | Repositorio | Baja | Faltaban los tags de las versiones fusionadas después de alpha.10. | `herramientas/crear-tags.sh` trae alpha.10 (ya publicado, se salta) y alpha.11 a alpha.14. |

## 5. Lo que se reorganizó

### 5.1 Tres lugares

| Antes | Ahora |
|---|---|
| Barra: Cursos · Mi panel (· Admin). Blender en el menú de la cuenta. | Barra: **Cursos · Blender · Mi panel** (· Admin). Menú de la cuenta: Perfil, Ayuda, Cerrar sesión. |
| Introducción: un curso de 6 lecciones con jefe final. | **Recorrido guiado**: 10 paradas por las páginas reales, un minuto, no da XP. |
| Guía con 5 capítulos y candados. | **Ayuda**: recorrido, tarjeta de la fusión y preguntas rápidas. |

### 5.2 La página Blender (`#/blender`)

En orden: **Cómo se unen la plataforma y Blender** (la tarjeta de la fusión: las dos partes, los 7 pasos del proceso marcados según lo que el alumno ya tiene y qué viaja entre ellas), **1 · Prepárate (una sola vez)** (instalar y vincular; se pliega cuando ya está), **2 · Conoce el add-on** (las tres prácticas) y **3 · Tu Blender y tus prácticas** (ajustes y conectados).

### 5.3 Conoce Amatista Motor (add-on 5.2)

| Práctica | Enseña |
|---|---|
| 1 · Tu pestaña Amatista | La barra N, vincular la cuenta, abrir la plataforma, abrir la lección actual, ajustes (enfocado y acompañamiento) y guardar el avance. |
| 2 · Muévete y usa tus herramientas | Orbitar, acercar, elegir, mover (G), girar (R), escalar (S), «Tus herramientas › Usar», «¿Cómo se usa?», «Ver todo Blender» y «Enfocar». |
| 3 · Así te enseña el taller | El ciclo Mira → Hazlo conmigo → Hazlo tú → Úsalo → Recuérdalo, la tarjeta 3D, el molde, las pistas y «Mírame», pausa, saltar y demostrarlo, Mi isla y la lección en vivo. |

Las paradas que piden hacer algo se comprueban solas (por ejemplo, mover el cubo o pulsar «Usar» en una herramienta). La página Blender las empieza («Empezar en Blender ▶») y muestra en vivo el mismo paso que la pestaña Amatista, con Anterior, Siguiente y Salir. Viaja en el latido que ya existe (`detalle.recorrido`) y en la orden `recorrido`: **no necesita SQL**.

### 5.4 Mi panel

Índice de secciones arriba; **Cursos** con una tarjeta por ruta (Blender con sus niveles dentro); **Talleres y proyectos**, **Exámenes** e **Insignias** muestran lo que toca ahora y el resto con «Ver todos»; fuera la sección de relleno «Enfoque de aprendizaje».

## 6. Puntos abiertos

| # | Gravedad | Qué | Por qué no se arregla aquí |
|---|---|---|---|
| P-01 | Alta | La API de producción sigue en **HTTP** (`http://158.101.118.222:8000`): las contraseñas y los tokens viajan sin cifrar. | Se hace en la VM: fase 2 de `docs/despliegue/2026-10-05_plan_de_despliegue.md` (Cloudflare + certificado de origen, T-065). |
| P-02 | Baja | CORS acepta cualquier origen `localhost` también en producción. | Se mantiene a propósito: el desarrollo local del usuario apunta a la VM. El riesgo es bajo porque la API usa tokens Bearer, no cookies. Cuando la PWA viva en Cloudflare Pages conviene volver configurable `allow_origin_regex` en `backend/main.py` (hoy fijo) y apagarlo en producción; el dominio de Pages entra por `CORS_ORIGINS`. |
| P-03 | Media | El repositorio es público: el código de la PWA y del add-on se puede leer completo. | Decisión del usuario, prevista tras mover la PWA a Cloudflare Pages (fase 4 del plan). |
| P-04 | Media | El add-on 5.2 y el recorrido no se han probado en Blender **con ventana** (abrir la barra N y orbitar solo se comprueban con una ventana real). | Lo prueba el usuario: T-113. |
| P-05 | Baja | Tres identidades de git para Maximiliano (`MAXIMILIANO CABELLO MATA`, `MAXIMILIANO1234345`, `MAXIMILIANO`) y `Kaneda343`. GitKraken las muestra como personas distintas. | Opcional: un `.mailmap` las une sin reescribir la historia. Necesita saber qué correos son de quién. |

## 7. Qué tiene que hacer el usuario

1. Revisar y fusionar el PR de esta rama.
2. Publicar en producción: `docs/despliegue/2026-10-11_auditoria_y_motor_5_2.md` (backend, archivar el módulo de «Primeros pasos» en la base, PWA y reinstalar Amatista Motor 5.2). **Sin SQL.**
3. Probar con ventana (T-113).
4. Desde su computadora: `bash herramientas/crear-tags.sh && git push origin --tags` (T-114) y borrar la rama `claude/auditoria-orden-plataforma-wfzu65` después de fusionar.
