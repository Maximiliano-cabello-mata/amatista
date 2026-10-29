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
de administración; publicado).

Estado verificado el 18 de octubre de 2026: publicados los tags hasta `v3.0.0-alpha.10`; pendientes de publicación `alpha.11` a `alpha.15`. `v2.2.0-alpha.2`, `v3.0.0-alpha.1` (`2337fd5`, reestructuración), `v3.0.0-alpha.2` (`ec849d8`, Amatista Engine etapa 1) y `v3.0.0-alpha.3` (`d004071`, motor etapa 2 y plataforma por módulos), `v3.0.0-alpha.4` (`fe209e0`), `alpha.5` (`34af6f3`), `alpha.6` (`191a888`), `alpha.7` (`927248c`), `alpha.8` (`2402549`, `main` al 5 de octubre), `alpha.9` (`255d054`, Motor 3.4), `alpha.10` (`1b26416`, ya publicado), `alpha.11` (`a9df7e9`, Motor 4.0), `alpha.12` (`48025f7`, Amatista Taller), `alpha.13` (`7d17f81`, guía y vista de administrador), `alpha.14` (`70064b2`, Motor 5.1) y `alpha.15` (`28b8772`, auditoría, Motor 5.2 y diseño «Facetas») están definidos en `herramientas/crear-tags.sh`; el script omite los existentes y prepara localmente los pendientes, que después se publican desde la computadora del usuario (ver `docs/guias/2026-10-01_versiones-y-tablero.txt`).

## [Sin publicar]

### Agregado

- **Dominio público `amatista-3d.tech`** (22–23 oct 2026, documentado el 29 oct, PR #39 y T-065, `docs/despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md`). Sustituye al `.me`: la PWA se publica en **Cloudflare Workers** (`amatista-3d.tech`, compilada con `VITE_API_URL=https://api.amatista-3d.tech`) y la API en `api.amatista-3d.tech` por Cloudflare (Full strict) y Caddy con certificado de origen, con uvicorn solo en `127.0.0.1`. El frontend reconoce el dominio nuevo y, fuera de él, usa `http://localhost:8000` en lugar de la IP de la VM. Plantillas `.env.example`, Caddyfile y guías al día; los planes del `.me` quedan como históricos. Pendientes en el tablero: `www` (T-129), puerto 8000 en OCI y cabeceras (T-130) y correo del dominio (T-131).
- **Camino guiado, recursos gráficos v4.2, Motor Web y dos cursos de A-Frame** (23 oct 2026, T-122 a T-128, `docs/plataforma/13_camino_graficos_y_motor_web.md`). Sale **Explorar** (buscador y filtros): la portada **Cursos** muestra cada programa como una lista numerada de pasos con el siguiente marcado, para quien no conoce la plataforma; barra **Cursos · Mi panel**. Bloques nuevos que se resuelven con la figura: **simulador de la vista 3D**, **elige la figura**, **línea de tiempo** y **Mundo 3D**, más la lectura opcional plegable **«En la industria»**. **Motor Web de Amatista** sobre A-Frame (`frontend/src/motor3d/`): entornos generados con semilla, objetos arrastrables con ratón, dedo o visor, zonas, retos que celebran, copias instanciadas, paseo y calidad automática; tres plantillas y seis piezas nuevas en el Estudio. Los 9 módulos de Blender, con menos listas y una lectura sobre cómo se usa Blender hoy en las empresas. A-Frame en **dos cursos compactos**: **Inicial** (3 módulos) e **Interactivo** (animación, el módulo nuevo «Mundos con el Motor Amatista» y WebXR), sin perder el avance. **Add-on 5.3**: menús en el idioma de tu Blender («Add (Agregar) › Mesh (Malla)») y «Palabras de Blender». Sin SQL. Guía: `docs/despliegue/2026-10-23_camino_y_motor_web.md`.
- **Plataforma 3D multiplataforma y accesible** (21 oct 2026, T-116 a T-120, `docs/plataforma/12_multiplataforma_y_accesible.md`). Blender deja de ser el centro: la barra queda en **Inicio · Explorar · Mi panel** (· Admin) y la página **Explorar** (`#/explorar`) reúne todos los programas, módulos y lecciones en una sola pantalla, con buscador, filtros por programa y disciplina que quedan en la dirección, índice lateral y tarjetas de módulo con sus lecciones a un clic. Maya y 3ds Max aparecen como próximos. Portada con el mapa del contenido, Mi panel con «Tu avance en cada programa», pie multiplataforma y «Saltar al contenido». **Estudio A-Frame** (`#/estudio`): editor libre con vista en vivo, cinco plantillas, piezas para insertar, descarga de la página y tres modelos GLB low poly propios que funcionan sin conexión. **Curso de A-Frame con cinco módulos** (cuatro nuevos: escena, modelos GLB y texturas, animación e interacción, WebXR), cada uno con reto de código revisado, jefe final y temática con mascota nueva. Revisión de lo que le falta al motor de Blender en `docs/motor/2026-10-21_lo_que_le_falta_al_motor.md`. Sin SQL. Guía: `docs/despliegue/2026-10-21_multiplataforma.md`.
- **Sistema de diseño «Facetas» (CSS v4.0)** (11 oct 2026, T-115, plan en `docs/diseno/2026-10-11_sistema_facetas.md`). Todas las páginas comparten la misma anatomía: migas de pan, un encabezado facetado con borde de gema y un brillo que cruza una vez, títulos de sección con rombo neón y un **pie de página global** (Aprender · Blender · Tu cuenta · Ayuda). Cuatro anchos con nombre en lugar de cinco a mano. Piezas nuevas en `frontend/src/components/estructura/` (`Pagina`, `EncabezadoPagina`, `Migas`, `TituloSeccion`, `PiePagina`, `facetas.js`). La portada suma «Tres lugares, un solo producto» (Cursos, Blender, Mi panel). El fondo low poly gana aristas de luz y destellos que titilan; todo se apaga en modo ligero y con movimiento reducido. Misma paleta y mismas mascotas.
- **Auditoría completa y plataforma en orden** (11 oct 2026, T-110 a T-112, informe en `docs/auditoria/2026-10-11_auditoria_completa.md`, `docs/plataforma/11_recorrido_y_fusion.md`). Revisión de los 270 commits, los tags, todas las pruebas, cada página y las 48 lecciones; 16 errores corregidos. La plataforma queda en **Cursos · Blender · Mi panel**: el curso «Primeros pasos con Amatista» sale del árbol de Blender (archivado sin perder progreso) y lo reemplaza un **recorrido guiado** de 10 paradas por las páginas reales; la página **Blender** vuelve a la barra con la tarjeta **«Cómo se unen la plataforma y Blender»** (el proceso paso a paso y qué viaja entre los dos); **Ayuda** (`#/guia`) sin candados ni preguntas; **Mi panel** con una tarjeta por curso y listas cortas (de ~6700 a ~4200 px). **Add-on 5.2 «Conoce Amatista Motor»**: tres prácticas cortas dentro de Blender que explican todas sus herramientas (pestaña, cuenta, plataforma, lección, ajustes, guardar, vista, mover/girar/escalar, herramientas, ayuda, enfoque y el ciclo del taller), empezadas y vistas en vivo desde la página Blender. Sin SQL. Guía: `docs/despliegue/2026-10-11_auditoria_y_motor_5_2.md`.

### Corregido

- El check «Workers Builds» de Cloudflare fallaba en las ramas de vista previa: el comando de esas ramas (`wrangler versions upload`) no tenía `wrangler.jsonc` del que leer la carpeta `frontend/dist`. Nuevos `wrangler.jsonc` y `.node-version` (Node 22) en la raíz; guía `docs/despliegue/2026-10-29_cloudflare_workers_builds.md` (29 oct).
- La vista A-Frame de las lecciones no cargaba modelos `gltf-model="#id"` (agregaba las etiquetas antes de tener sus `a-assets`) e ignoraba `fog`, `cursor` y `raycaster` de la escena (21 oct).
- Auditoría del 11 oct: «¿Verdad o mito?» no volteaba; el formulario del código de Blender desbordaba a 390 px (18 lecciones y `#/vincular`); el curso v2 archivado aparecía en Mi panel; el código de vinculación tiene 8 caracteres, no «6 letras»; Admin › Resumen contaba lecciones de módulos archivados; el jefe final de A-Frame módulo 1 no tenía duración; Vite 8 ignoraba `esbuild.legalComments` (ahora `build.rolldownOptions.output.comments: false`); desbordes en `#/blender` y Mi panel a 390 px; nombre y rol montados en Admin › Auditoría.
- Esta sección «3.5.1» estaba antes del título del archivo; se movió aquí.

### Corregido · Motor 3.5.1 (Codex, PR #26): correcciones de evaluación y detalle del instructor

- Siluetas sin evidencia quedan pendientes, también al comparar con el ejemplo.
- El complemento conserva la silueta en intentos con `example.matches`.
- Detalle del instructor compartido en la base, sin caché por proceso. Requiere 011 antes del backend.
- Documentación delimita los aspectos que el motor puede evaluar.

### Agregado

- **Primeros pasos con Amatista y recursos gráficos nuevos** (11 oct 2026, T-106 a T-108, `docs/plataforma/10_primeros_pasos_y_recursos.md`). Curso nuevo de introducción (nivel 0 de la ruta Blender, módulo «La estación del enlace» con su guía Bip y su jefe El Nudo de Cables): seis lecciones que enseñan la plataforma, una lección, el add-on y cómo se conectan, y terminan con los primeros pasos dentro de Blender. **Add-on 5.1**: un recorrido de diez paradas dentro de Blender (abrir la barra N, vincular la cuenta, orbitar, elegir y mover el cubo, la tarjeta, las pistas y el enlace) que se marcan solas; la lección lo empieza, lo avanza y lo ve en vivo (`detalle.recorrido` del latido y orden `recorrido`, sin SQL nuevo). El motor de los talleres no cambia. Siete bloques nuevos, ligeros y sin librerías: recorrido por la pantalla, flujo de la conexión, ejes de Blender, demo de parámetros (array, bisel, subdivisión, espejo, luz y resolución), Clasifica, ¿Verdad o mito? y Primeros pasos en Blender; 20 de ellos intercalados en los 9 módulos de Blender. CSS v3.7: bloques que entran al hacer scroll, barra de lectura, teoría con más ritmo; todo se apaga en modo ligero. Guía: `docs/despliegue/2026-10-11_primeros_pasos_motor_5_1.md`.
- **Amatista Taller: motor 5 y add-on 5.0** (10 oct 2026, T-100, `docs/motor/referencia/16_amatista_taller.md`). Reestructuración completa a partir de la investigación «Un add-on que enseñe»: la unidad deja de ser la práctica y pasa a ser la **habilidad**. Cada una se aprende con el mismo ciclo, **Mira → Hazlo conmigo → Hazlo tú → Úsalo → Recuérdalo**, y un **modelo del alumno** (BKT con olvido y cajas de repaso de 1 a 30 días) decide en qué paso está cada quien. 33 habilidades con 62 variaciones cortas y 9 talleres, uno por módulo de Blender (`practices/blender/habilidades.json`, `amatista.skill/1`). En Blender: la tarjeta de la vista 3D con botones que se tocan, la demostración «Mira» con las teclas en pantalla, el **molde** translúcido que se pinta pieza por pieza (azul vacía, ámbar la que toca, verde llena, coral equivocada) y habla sin números, **pistas con freno** (qué falta, con qué, cómo y mírame), «¿Ya sabes esto? Demuéstralo», «Saltar», un panel N mínimo y **Mi isla**, donde cada proyecto terminado deja su pieza. El proyecto del módulo sigue siendo la práctica de siempre y se abre como «Úsalo». En la plataforma, la lección «Taller en Blender» de cada módulo muestra el ciclo, lo que sigue, las habilidades con su fase y la actividad en vivo con los botones que tienen sentido en ese momento; la lección del proyecto muestra la pieza de la isla y el reto, y la página del curso muestra **Tu isla**. Las prácticas «explora» pasan a `practices/archivo/blender/`. El servidor vuelve a calcular el modelo con el mismo motor y revisa la escena de cada intento (`/api/addon/v1/habilidades`, `/talleres`). **Requiere Oracle 012** (`backend/sql/012_taller.sql`, siguiente libre 013); sin 012 el add-on guarda el avance en la computadora y lo envía después. Guía: `docs/despliegue/2026-10-10_amatista_taller_motor_5.md`.
- **Amatista Motor 4.0: la experiencia del alumno** (10 oct 2026, T-098, `docs/motor/referencia/15_experiencia_del_alumno.md`). La práctica se recorre como una **ruta de misiones**: partes con nombre («La locomotora y el vagón», «Las ruedas»…) y una sola misión explicada a la vez; lo hecho antes de tiempo queda «¡ya lo tenías!». **Medidas amables**: las tolerancias se aflojan según el nivel (× 1.6 en el nivel 1, como las escribió el autor en el 4 y 5) sin perder el sentido de la figura, y el instructor habla sin decimales en los niveles 1 a 3. En Blender, **una sola tarjeta** con la misión, la ruta en bolitas, teclas que se encienden al usarlas y **herramientas iluminadas** (la de ahora brilla, las usadas llevan ✓ y las que vienen, borde), con **animaciones** al empezar (entra deslizándose) y al cumplir cada misión (sello y chispas); en los niveles 1 y 2 la herramienta de la misión queda elegida en la barra T. La barra lateral muestra solo la misión con «Muéstrame cómo» grande y deja lo demás cerrado («Tu ruta», «Tus herramientas», «Comparado con el ejemplo», «Más»). «Tu misión» al abrir una práctica y sin diálogo por cada paso. La lección muestra la misma misión con sus teclas. Las 9 prácticas de proyecto traen sus partes (`stage`). Sin cambios en Oracle.
- **Herramientas gráficas v3.6** (10 oct 2026, T-096, `docs/plataforma/07_herramientas_graficas.md` §8 y §9): se midieron 17 librerías gráficas (de 1.2 KB a 1.5 MB comprimidas) y se filtró qué sirve. Tres herramientas propias: **Visor de malla** (`mesh_viewer`, 5.3 KB: girar una malla y seleccionar vértices, aristas o caras con 1, 2 y 3, con las cuentas de Blender), **Diagrama de nodos** (`node_graph`, 2.9 KB: árbol de nodos con los colores de Blender y «Recorrer el flujo») e **Imagen ligera** (espacio reservado, relleno facetado, «Reintentar» sin conexión y «Ver imagen» con ahorro de datos). Los dos bloques se cargan solo en las lecciones que los usan y ya están en «Objeto o Edición» y en «Tres controles del Principled BSDF». **Diseño CSS**: fichas de diseño, fuentes de respaldo con las medidas de Outfit y JetBrains Mono (el texto no salta al llegar la fuente), títulos y párrafos sin palabras huérfanas, esqueleto de carga facetado, alto contraste, modo de colores forzados e impresión de lecciones. Misma paleta e identidad.

### Corregido

- **Renovación del repositorio** (10 oct 2026, T-095, bitácora `docs/bitacora/2026-10-10_renovacion_del_repositorio.md`): revisión completa de la documentación y del código contra «el ejemplo manda» y Motor 3.5.1. **Add-on:** el ejemplo usa nombres «Ejemplo · …» y ya no le roba a la aldea sus colecciones «Casas» y «Techos»; tres puntos de luz arma su propia nave; los intentos sin conexión no se pierden con un 401/409/429 ni se envían con otra cuenta; «Volver a mi práctica» sale del Modo Edición; los avisos ya no muestran ids internos; los temporizadores se quitan al desactivar el add-on; la orden «pista» ya no falla. **Backend:** un alumno ya no se califica contra un borrador; las órdenes de la plataforma esperan en una cola (abrir en Blender ya no se pierde con un cambio de ajustes); el límite de 2 MB vale también para cuerpos sin Content-Length; «Desconectar» ya no acepta comodines; un token del add-on no puede dar órdenes; las plantillas de Blender se aplican a los cursos actuales. **Motor:** toda práctica mal escrita da un error en español con la ruta del campo (nunca «Error interno»); `example.matches` ya no aprueba sin aspectos; la cámara del ejemplo debe ser la activa; validador nuevo `scene.mode` (42 en total); nombres de modificadores en una sola tabla (`terminos.py`); las plantillas de `practicas.py nueva` traen ejemplo. **PWA:** «Cambiar a esta práctica» completa la lección; la consulta del enlace no se encima, se pausa con la pestaña oculta y se detiene al completar; los pasos de cada lección coinciden con los del servidor (prueba nueva); se puede restaurar una práctica archivada. **Repositorio:** texto de la GPL en el add-on, `actualizar.sh` revisa el esquema con `diagnostico_oracle.py` antes de reiniciar, `LEEME.txt` con 011 y el siguiente libre 012, archivos de archivo con su LEEME, `.editorconfig`, y la documentación al día (conteos, rutas, 011, plataforma y manual del código).

### Agregado

- **El ejemplo manda: revisión autónoma de cualquier práctica (Motor 3.5)** (9 oct 2026, `docs/motor/referencia/14_ejemplo_y_revision.md`, T-093): cada una de las 18 prácticas trae su **ejemplo resuelto escrito en código** (`example.steps`, el mismo idioma que `pruebas.json`). El motor arma con él la escena esperada y **revisa sola** la escena del alumno contra ella, aspecto por aspecto y solo en lo que el ejemplo tiene (figura o silueta, malla, modificadores, materiales, colecciones, luces, cámara, animación, render y archivo), con libertad en nombres, lugar, tamaño y colores hasta el nivel 3. Validador `example.matches`, que el cargador agrega al final de toda práctica («Tu práctica coincide con el ejemplo»), y CI comprueba que cada ejemplo complete su práctica. En Blender, **«Ver el ejemplo»** lo arma en su propia escena sin tocar la tuya, y la lista «Comparado con el ejemplo» se agrupa por aspecto. En la lección, la tarjeta **El ejemplo resuelto** muestra los pasos, qué compara Amatista y el código. Órdenes nuevas desde la plataforma: `ver_ejemplo` y `volver_practica`. La documentación del motor se corrigió al nuevo enfoque. Sin cambios en Oracle.
- **Blender como instructor y Amatista Motor 3.5** (9 oct 2026, `docs/motor/referencia/13_instructor_y_silueta.md`): **cada práctica abre en su propia escena** (antes, abrir otra práctica dejaba lo de la anterior; nada se borra y «De nuevo» empieza en una escena limpia). El motor **reconoce la silueta** de una figura hecha en una sola malla (`figure.silhouette`): corta la malla en rebanadas y la compara parte por parte con el modelo (pomo, mango, guarda, hoja, punta), dice qué falta y con qué tecla se arregla, exige la guarda y la punta en todos los niveles y las medidas según el nivel. **La espada** se rehízo con una ruta clara (cubo › alargar con E › silueta › low-poly › guardar), sin taza ni roles a mano. **Lista del instructor** «Tu figura» (`details.checklist`, también en `figure.recognize`) en Blender y en la lección. **La plataforma maneja la práctica**: la tarjeta «Ahora en Blender» muestra el paso, lo que dice el instructor y la lista, con los botones Comprobar, Pista, Hazlo conmigo, Guardar y Empezar de nuevo. Sin cambios en Oracle. Descarga `Amatista-Motor-3.5-<sistema>.zip`.
- **La plataforma maneja Blender y Amatista Motor 3.4** (9 oct 2026, PR #24, `v3.0.0-alpha.9` en `255d054`; estudio en `docs/motor/especificaciones/2026-10-09_plataforma_y_blender_integrados.md`): el motor **reconoce la figura** (`figure.recognize`): deduce qué es cada pieza por su forma (el alumno ya no pone roles), revisa que tenga sentido (ruedas en el suelo y a los dos lados, chimenea encima, nada flotando) y exige según el nivel, desde «una forma identificable» en el 1 hasta las medidas reales en el 4 y 5; los adornos no restan y si la figura parece otra (una mesa) lo dice; tren, muñeco de nieve y puente lo usan. **Enlace en vivo**: Blender late cada 5 s, la lección muestra «Tu Blender está en esta práctica (40 %)», «Abrir en Blender» la abre sola en el Blender abierto y «Mi Blender» decide cómo se ve Blender (enfoque, acompañamiento, tarjeta 3D, avisos). **Modo enfocado** en Blender (niveles 1 y 2 por defecto): sin barra T, menús y Shift+A solo con lo de la práctica, panel «Tus herramientas» con «Usar» y «¿Cómo se usa?» (pasos y error típico) y «Ver todo Blender». Oracle `010_enlace_blender.sql` (`ADDON_ENLACES`, `ADDON_AJUSTES`; sin 010 todo sigue funcionando). Arreglos del add-on: la tarjeta de la vista 3D ya no queda tapada por el panel «Ajustar última operación» ni por la barra T y no se desborda con tres teclas; «Hazlo conmigo» deja el cubo con su rol; «Sin plantilla» del modo desarrollador se puede elegir. Descarga `Amatista-Motor-3.4-<sistema>.zip`.
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
