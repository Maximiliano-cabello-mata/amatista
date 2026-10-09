# Changelog

Todas las versiones de Amatista. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [versionado semántico](https://semver.org/lang/es/).

| Versión | Fecha | Fase | Commit |
|---|---|---|---|
| [2.0.1] | 2026-10-01 | Repositorio oficial | `573ea89` |
| [2.0.0] | 2026-09-29 | **V2 · Plataforma educativa** | `0ea0e8a` |
| [1.0.0] | 2026-09-28 | **V1 · Integración** | `cde262b` |
| [0.1.0] | 2026-09-27 | Prototipo | `0772159` |

Pre-lanzamientos de la v2.2.0: `v2.2.0-alpha.1` (`f68c704`: cuentas, Oracle 20 GB, progreso adaptable,
contenido administrable, lecciones interactivas y panel del alumno) y `v2.2.0-alpha.2` (`88dd539`: panel
de administración; se publica con `crear-tags.sh`).

Los tags hasta `v2.2.0-alpha.1` están publicados y firmados con SSH. `v2.2.0-alpha.2`, `v3.0.0-alpha.1` (`2337fd5`, reestructuración), `v3.0.0-alpha.2` (`ec849d8`, Amatista Engine etapa 1) y `v3.0.0-alpha.3` (`d004071`, motor etapa 2 y plataforma por módulos), `v3.0.0-alpha.4` (`fe209e0`), `alpha.5` (`34af6f3`), `alpha.6` (`191a888`), `alpha.7` (`927248c`) y `alpha.8` (`2402549`, `main` al 5 de octubre) ya están en `bash herramientas/crear-tags.sh` y se publican desde la computadora del usuario (ver `docs/guias/2026-10-01_versiones-y-tablero.txt`).

## [Sin publicar]

### Agregado

- **El ejemplo manda: revisión autónoma de cualquier práctica (Motor 3.5)** (9 oct 2026, `docs/motor/referencia/14_ejemplo_y_revision.md`, T-093): cada una de las 18 prácticas trae su **ejemplo resuelto escrito en código** (`example.steps`, el mismo idioma que `pruebas.json`). El motor arma con él la escena esperada y **revisa sola** la escena del alumno contra ella, aspecto por aspecto y solo en lo que el ejemplo tiene (figura o silueta, malla, modificadores, materiales, colecciones, luces, cámara, animación, render y archivo), con libertad en nombres, lugar, tamaño y colores hasta el nivel 3. Validador `example.matches`, que el cargador agrega al final de toda práctica («Tu práctica coincide con el ejemplo»), y CI comprueba que cada ejemplo complete su práctica. En Blender, **«Ver el ejemplo»** lo arma en su propia escena sin tocar la tuya, y la lista «Comparado con el ejemplo» se agrupa por aspecto. En la lección, la tarjeta **El ejemplo resuelto** muestra los pasos, qué compara Amatista y el código. Órdenes nuevas desde la plataforma: `ver_ejemplo` y `volver_practica`. La documentación del motor se corrigió al nuevo enfoque. Sin cambios en Oracle.
- **Blender como instructor y Amatista Motor 3.5** (9 oct 2026, `docs/motor/referencia/13_instructor_y_silueta.md`): **cada práctica abre en su propia escena** (antes, abrir otra práctica dejaba lo de la anterior; nada se borra y «De nuevo» empieza en una escena limpia). El motor **reconoce la silueta** de una figura hecha en una sola malla (`figure.silhouette`): corta la malla en rebanadas y la compara parte por parte con el modelo (pomo, mango, guarda, hoja, punta), dice qué falta y con qué tecla se arregla, exige la guarda y la punta en todos los niveles y las medidas según el nivel. **La espada** se rehízo con una ruta clara (cubo › alargar con E › silueta › low-poly › guardar), sin taza ni roles a mano. **Lista del instructor** «Tu figura» (`details.checklist`, también en `figure.recognize`) en Blender y en la lección. **La plataforma maneja la práctica**: la tarjeta «Ahora en Blender» muestra el paso, lo que dice el instructor y la lista, con los botones Comprobar, Pista, Hazlo conmigo, Guardar y Empezar de nuevo. Sin cambios en Oracle. Descarga `Amatista-Motor-3.5-<sistema>.zip`.
- **La plataforma maneja Blender y Amatista Motor 3.4** (9 oct 2026, estudio en `docs/motor/especificaciones/2026-10-09_plataforma_y_blender_integrados.md`): el motor **reconoce la figura** (`figure.recognize`): deduce qué es cada pieza por su forma (el alumno ya no pone roles), revisa que tenga sentido (ruedas en el suelo y a los dos lados, chimenea encima, nada flotando) y exige según el nivel, desde «una forma identificable» en el 1 hasta las medidas reales en el 4 y 5; los adornos no restan y si la figura parece otra (una mesa) lo dice; tren, muñeco de nieve y puente lo usan. **Enlace en vivo**: Blender late cada 5 s, la lección muestra «Tu Blender está en esta práctica (40 %)», «Abrir en Blender» la abre sola en el Blender abierto y «Mi Blender» decide cómo se ve Blender (enfoque, acompañamiento, tarjeta 3D, avisos). **Modo enfocado** en Blender (niveles 1 y 2 por defecto): sin barra T, menús y Shift+A solo con lo de la práctica, panel «Tus herramientas» con «Usar» y «¿Cómo se usa?» (pasos y error típico) y «Ver todo Blender». Oracle `010_enlace_blender.sql` (`ADDON_ENLACES`, `ADDON_AJUSTES`; sin 010 todo sigue funcionando). Arreglos del add-on: la tarjeta de la vista 3D ya no queda tapada por el panel «Ajustar última operación» ni por la barra T y no se desborda con tres teclas; «Hazlo conmigo» deja el cubo con su rol; «Sin plantilla» del modo desarrollador se puede elegir. Descarga `Amatista-Motor-3.4-<sistema>.zip`.
- **Seguridad, rendimiento, Motor 3.3 y mundos por módulo (v3.4)** (5 oct 2026, PR #20, `v3.0.0-alpha.8`): auditoría automática de seguridad (`backend/herramientas/auditoria_seguridad.py`: 1,449 ataques a 69 rutas, 0 hallazgos tras los arreglos) y de rendimiento (`backend/herramientas/rendimiento.py`, `frontend/scripts/rendimiento.mjs`), con informe en `docs/rendimiento/` y `docs/seguridad/`. Arreglos: errores de Oracle sin detalles del esquema, cabeceras de seguridad, `no-store` en datos personales, `/docs` ocultable, límite de cuerpo, límites por cuenta para aulas detrás de una IP. Optimizaciones: catálogo con 40 alumnos 747 → 77 ms, panel de administración 97 → 7 ms, descarga del add-on con caché, GZip, animaciones a 55–60 fps y portada y panel ligeros en teléfono. Protección del add-on: integridad por archivo, marca de agua firmada por cuenta y `verificar_licencia.py`. **Amatista Motor 3.3**: modelo de referencia por práctica (imagen y plano, «Así se debe ver» en la lección y en Blender) y `figure.resembles`, que califica que la figura tenga sentido con medidas aproximadas; tren, muñeco de nieve, cojín, puente y aldea rehechos. Cada lección se viste con el mundo de su módulo y la mascota la acompaña. Plan de despliegue por fases (`docs/despliegue/2026-10-05_plan_de_despliegue.md`). Sin cambios en Oracle.
- **Temáticas completas y Amatista Motor 3.2 (v3.3)** (5 oct 2026, PR #19, `v3.0.0-alpha.7`): el servidor registra y publica solo, al arrancar, las prácticas de `practices/blender/` (antes había que correr `contenido.py practicas`; por eso solo aparecía la mesa) y `contenido.py practicas --revisar` dice cuáles faltan. Cada módulo tiene escenario animado, mascota original en pixel art con consejos y datos curiosos, y jefe con silueta propia (`practices/blender/temas.json`, compartido con el add-on). Portada «Un mundo por módulo», destello en botones y transición de página. Add-on **Amatista Motor 3.2**: tarjeta de la vista 3D con la temática, la mascota y el jefe de la práctica, fondo de la vista con el color del módulo, paneles rediseñados; descarga `Amatista-Motor-3.2-<sistema>.zip` y aviso en «Mi Blender» si el servidor entrega una versión vieja. Sin cambios en Oracle.
- **Curso de Blender unificado y ruta de aprendizaje (v3.2)** (4 oct 2026, PR #18, `v3.0.0-alpha.6`, docs/cursos/03_ruta_de_aprendizaje_blender.md): una sola tarjeta «Blender» con árbol de niveles y página del curso (A-Frame igual), logos SVG; teoría y Blender intercalados en cada módulo (exploración corta y práctica de cierre, siempre con el add-on conectado; `explore` en el plan de estudios, add-on 3.1.0); curso **Blender Intermedio** publicado (puente, aldea y diorama) y Avanzado bloqueado; temática por módulo y examen con jefe final que pierde vida; medallas progresivas (15) y racha animada; emparejar con más contraste; animaciones CSS y modo ligero para equipos modestos; investigación de herramientas gráficas (docs/plataforma/07_herramientas_graficas.md). Sin cambios en Oracle.
- **Motor v3 y plan de estudios de Blender** (4 oct 2026, PR #17, `v3.0.0-alpha.5`, docs/motor/etapas/etapa-3.md): el plan de estudios en dos cursos, **Blender Principiante** y **Blender Principiante-Intermedio**, con 6 módulos (teoría en la plataforma y práctica guiada en Blender: tren, espada, nave, pinta la nave, tres puntos y pelota); Intermedio y Avanzado como «próximamente». Formato `amatista.practice/2` (píldoras de teoría, vigilantes que pausan el progreso, escena de inicio, curso y repaso), repaso espaciado de Leitner, plan `amatista.curriculum/1` y 35 validadores. Add-on 3.0.0 con pestañas Aprender · Practicar · Mi curso, HUD con teoría y pausa, probado en Blender 4.2 y 5.0. Herramientas de autor: plantillas, `pruebas.json` (29 casos), `engine/herramientas/practicas.py` y el panel Teoría y pruebas. Oracle `008` (`CURSOS.RUTA`, `CURSOS.REQUISITO_ID`) y `009` (archiva el curso v2 sin borrar progreso); `backend/herramientas/migrar.py` para migrar a otra base (JSONL y esquema PostgreSQL). Despliegue con el dominio `amatista-3d.me` detrás de Cloudflare (Caddyfile, servicio y `actualizar.sh` alineados con la VM). Lo anterior se archivó: prácticas en `practices/archivo/v2/` y módulos en `frontend/src/data/modulos/archivo/`.
- **Documentación completa** (4 oct 2026, PR #15, `v3.0.0-alpha.4`): `docs/` organizado en diez secciones con su índice (`docs/README.md`); `docs/historia/` (cronología exacta commit por commit, ideas y cómo se implementaron, la plataforma en cada versión revisando los commits antiguos); `docs/manual-del-codigo/` (mapa del repositorio, frontend, backend, motor y add-on con recetas); `docs/base-de-datos/` (esquema SQL completo con diagrama entidad-relación y esquema consolidado de referencia); `docs/desarrollador/` (manual del desarrollador con todas las herramientas); `docs/herramientas-de-la-plataforma.md`; guía de despliegue en OCI; README de la raíz reescrito. Sin cambios de comportamiento.
- **Amatista Engine, etapa 2** (4 oct 2026, docs/motor/etapas/etapa-2.md): guía paso a paso en el motor (`guide/`: qué hacer, teclas, resaltados, señales en la escena y acción «Hazlo conmigo») y acompañante que felicita, avisa y ofrece ayuda; campo opcional `guide` en los objetivos; add-on 0.3.0 con tarjeta del acompañante, guía dibujada en la vista 3D, diálogos y preferencias de acompañamiento. Sin cambios en Oracle.
- **Plataforma por módulos (v3.1)** (docs/plataforma/): la práctica de Blender cierra cada módulo (ruta del módulo y estación de Blender, preparación de Blender dentro de la práctica, regla validada en el servidor); sistema de etiquetas común; herramientas nuevas Paso a paso, Atajos de teclado y Comparar; panel de administración agrupado con página Herramientas.
- **Amatista Engine** (4 oct 2026, docs/motor/): motor declarativo `amatista.practice/1` en `engine/`; add-on «Amatista» para Blender 4.2+ con modos Alumno y Desarrollador (Amatista Author), tarjetas y diálogos; paquete descargable con instalador por sistema que comprueba la versión de Blender y conecta la cuenta; Oracle 007 (`ADDON_VINCULOS`, `PRACTICAS`, `PRACTICA_VERSIONES`, `PROGRESO_PRACTICAS`); API `/api/addon/v1`; página Blender, vinculación por código, bloque de lección `blender_practice` y Admin › Prácticas; primera práctica «Construir una mesa» en el módulo 2 de Blender (en revisión).
- **Reestructuración (v3.0.0, en curso; primer tag `v3.0.0-alpha.1`):** el curso se organiza por niveles.
  Oracle `005` (aditivo, conserva usuarios y progreso): tablas `NIVELES`, `HABILIDADES`,
  `HABILIDADES_ALUMNO`, `EVALUACIONES_RUBRICA`, `VERSIONES_BLENDER`, `VERIFICACIONES_BLENDER` y
  `MODULOS.NIVEL_ID`. Oracle `006`: vistas `V_AMATISTA_MAPA`, `V_AMATISTA_FICHAS_INCOMPLETAS`,
  `V_AMATISTA_COMPATIBILIDAD` y paquete `AMATISTA_AUTOR` para crear niveles y lecciones desde Database
  Actions. API `/api/contenido/niveles`, `/api/contenido/mapa/{curso}` y `/api/blender/*`; el catálogo
  incluye los niveles publicados. Ficha opcional de lección validada; CLI `sembrar-niveles`, `mapa` y
  `nueva-leccion` (estructura de 10 pasos). Documentación en `docs/reestructuracion/` (plan maestro,
  modelo de contenido, manual de Oracle, guía del add-on de Blender) y bitácora del 3 de octubre.
- Tablero de la etapa v3 (roadmap v2.2.0 piloto → v3.4.0) con el de la v2 archivado en `tablero/historico/`;
  el generador muestra la etapa y su histórico.
- **Plataforma unificada (v2.2.0, en curso):** cuentas con roles (alumno, profesor, admin), fusión del
  progreso offline con la cuenta, esquema Oracle incremental para 20 GB (`backend/sql/002`–`004`),
  contenido administrable por API y CLI, progreso que se adapta al contenido nuevo, 7 bloques
  interactivos aplicados al Módulo 1, panel del alumno, métricas de alumnos activos, CI y archivos de
  despliegue. Estado y pendientes: `docs/bitacora/2026-10-02_estado_plataforma_unificada.txt`.
- **Panel de administración en la PWA** (`#/admin`): resumen con métricas del lanzamiento, usuarios
  (búsqueda, detalle, rol, cuentas de prueba, confirmar correo), gestor de contenido (crear módulo con la
  Fórmula, publicar, archivar, reordenar, exportar), editor de lecciones con vista previa y sistema (salud
  y purga).
- Tags de versión organizados por fases y script `herramientas/crear-tags.sh` (incluye `v2.2.0-alpha.2`).
- Índice de la documentación (`docs/README.md`), registro de incidencias (`docs/incidencias/README.md`),
  la Fórmula Amatista (`docs/arquitectura/2026-10-02_formula_modulos.txt`) y bitácora del cierre del 2 de octubre.
- Tareas T-029 a T-033 en el tablero: prueba de punta a punta, revisión de seguridad, documentación de la v2.2,
  SMTP e importación del catálogo a Oracle.

### Cambiado
- **Estructura fija de la plataforma y orden del repositorio** (4 oct 2026): navegación Cursos · Mi panel · Admin, sin pestañas sueltas; el «Laboratorio técnico» de prueba (botón de sesión de prueba y caja de tutor IA sin conectar) pasa a ser el **Diagnóstico técnico**, solo para el equipo, desde Admin › Estado. Revisión de la documentación documento por documento: README de la raíz reescrito, PROYECTO.md al día, estado de cada documento en `docs/README.md`, notas de actualización en los documentos de arquitectura y estado de producción en los manuales de Oracle. Tablero: estados reales con evidencia y bloqueos (el generador los muestra en el detalle) y el tablero de la v2 archivado con su revisión del estado real al cierre. `despliegue/actualizar.sh` detecta la unidad `amatista-backend` de la VM; `backend/.env.example` documenta `AMATISTA_URL_API` y `AMATISTA_URL_PWA`; `crear-tags.sh` incluye `v3.0.0-alpha.1` y `v3.0.0-alpha.2`.
- La pestaña **Blender** sale de la barra superior: la conexión pasa a «Mi Blender» (menú de la cuenta) y a la práctica de cada módulo. «Contenido» del panel se llama **Módulos**.
- La documentación de referencia del motor pasa a `docs/motor/referencia/`.
- `INCIDENCIAS.txt` de la raíz pasa a `docs/incidencias/` (INC-010); INC-005 y INC-006 quedan resueltas.
- La convención de commits y la guía de versiones y tablero pasan a `docs/guias/`.
- README, `backend/README.md` (rutas nuevas, despliegue con `despliegue/`) y `frontend/README.md` (estructura,
  rutas y pruebas) actualizados al estado de la v2.2.
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
