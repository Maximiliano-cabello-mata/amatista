# Bitácora · Camino guiado, recursos gráficos, Motor Web y A-Frame en dos cursos (23 oct 2026)

**Pedido (Maximiliano, 01:20 UTC):** volver atrás del diseño «tipo buscador» (Explorar): compactar todos los cursos en listas guiadas para quien no conoce la plataforma. Mejorar los elementos gráficos de las lecciones (demasiadas listas, verdadero/falso y ordenar). Un motor de Blender muy intuitivo: los primeros cursos asumen que el alumno no sabe nada. Un motor gráfico propio en A-Frame, optimizado y diverso, para interactuar con escenarios generados por nosotros, mover objetos y generar entornos, con dos cursos compactos de A-Frame. Revisar el contenido para que sea útil, opcional, moderno y cuente cómo se usa Blender hoy en las empresas.

**Decisiones por defecto (reversibles):** «regresa a la versión anterior» se leyó como quitar Explorar y el buscador, conservando lo demás de la v4.1 (Estudio A-Frame, temáticas, accesibilidad) y la visión multiplataforma; las listas guiadas son la portada «Cursos»; los dos cursos de A-Frame se arman con los cinco módulos que ya había más uno nuevo del motor, sin cambiar ids de lección; la lectura de la industria es plegable y no cuenta como actividad; sin SQL nuevo.

## Qué se hizo (un commit por tema, rama `claude/project-thread-kz2kwm`)

1. **Camino guiado** (T-123): fuera Explorar, barra **Cursos · Mi panel**; la portada muestra cada programa como una lista numerada de pasos con el siguiente marcado, para quién es cada nivel y las lecciones a un clic.
2. **Motor Web de Amatista** (T-124, `frontend/src/motor3d/`): 11 componentes `am-*` (entornos con semilla, copias instanciadas, arrastrar con ratón, dedo o visor, zonas, retos que celebran, órbita, paseo, rendimiento en vivo) y el bloque «Mundo 3D». Tres plantillas y seis piezas nuevas en el Estudio; la página descargada lleva el motor.
3. **Recursos gráficos v4.2** (T-125): simulador de la vista 3D, elige la figura, línea de tiempo y la lectura «En la industria».
4. **Contenido de Blender** (T-126): 9 módulos con actividades gráficas en lugar de varias listas y verdadero/falso, más una lectura de industria por módulo.
5. **A-Frame Inicial e Interactivo** (T-127): 3 + 3 módulos; el nuevo «Mundos con el Motor Amatista» (5 lecciones, dos mundos, reto de código, jefe). Avance e insignias trasladados; temática «El semillero de mundos» con Pepita.
6. **Add-on 5.3** (T-122): las rutas de menú salen en el idioma del Blender del alumno («Add (Agregar) › Mesh (Malla)») y «Palabras de Blender» (17 palabras) en la pestaña Aprender y en la página Blender.

## Errores encontrados y corregidos en el camino

- Los cuatro tipos interactivos nuevos no contaban como actividades de la lección (faltaban en `TIPOS_INTERACTIVOS`).
- `markdown_text` no dibuja bloques de código con ```: se pasaron a `code_snippet`.
- `buscarRuta('aframe')` devolvía la ruta y no el curso, porque «aframe» es a la vez ruta y nivel: ahora gana el curso.
- La portada desbordaba a 390 px con una lista de lecciones abierta (grilla sin `min-w-0`).
- La cámara del motor apuntaba al revés y no se activaba al agregarse después de cargar la escena.

## Pruebas

Vitest 318, backend 405, motor y add-on 559, add-on dentro de Blender 5.0.1 (`addon/tests/en_blender.py`) sin fallas, contenido 15 archivos sin errores, lint y build. En Chromium: el camino, cada bloque gráfico nuevo, un mundo del motor (arrastrar la caja a la meta celebra) y la lección nueva; sin desbordes a 390 px en portada, Blender, cursos, lecciones, Estudio y Mi panel.

## Pendiente del usuario

Confirmar la fusión del PR. Después, publicar según `docs/despliegue/2026-10-23_camino_y_motor_web.md` (T-128, depende de T-119). Lo de siempre: tags y ramas viejas desde la computadora, T-113 en Blender con ventana, HTTPS de la API.
