# Plataforma Amatista (v3.5.1 · 9 de octubre de 2026)

Cómo está organizada la plataforma para alumnos, profesores y administradores en el estado actual de integración con Blender. Lo técnico del motor y del add-on está en [`docs/motor/`](../motor/README.md).

> «La plataforma la siento muy dispersa… esa parte que le agregamos como una pestaña a Blender no está bien, sino hacerlo en una integración en los módulos: que cada módulo cuente con una práctica de Blender en la cual primero realices el módulo y ya luego realices la práctica en Blender.» (Maximiliano, 4 oct 2026)

| Documento | Qué explica |
|---|---|
| [01 · Mapa de la plataforma](01_mapa_de_la_plataforma.md) | Qué ve cada persona (alumno, profesor, administrador) y dónde está cada cosa. |
| [02 · Módulos con práctica en Blender](02_modulos_y_practica.md) | La regla «primero el módulo, luego la práctica», cómo se ve y cómo se arma. |
| [03 · Etiquetas y gráficos](03_etiquetas_y_graficos.md) | El sistema de etiquetas low poly, la ruta del módulo y la estación de Blender. |
| [04 · Herramientas de enseñanza](04_herramientas_de_ensenanza.md) | Los 20 bloques con los que se arma una lección, con sus campos y cuándo usar cada uno (3 nuevos). |
| [05 · Panel de administración](05_panel_de_administracion.md) | Cómo se organiza el panel y el flujo para subir un módulo con su práctica. |
| [06 · Módulo 3: modelado con precisión](06_modulo_3_modelado_precision.md) | El módulo de precisión de la v2 como ejemplo completo. |
| [07 · Herramientas gráficas](07_herramientas_graficas.md) | Qué gráficos tenemos, qué se agregó en la v3.2 y qué conviene desarrollar (investigación). |
| [08 · Auditoría educativa (9 oct)](08_auditoria_educativa_2026-10-09.md) | Qué está bien, qué está fallando y qué se corrige primero en documentación y producto. |

![Un módulo con su práctica en Blender](img/modulo_ruta.svg)

## Resumen de cambios (v3.2 · curso unificado)

- **Una tarjeta por curso.** «Blender» es una sola tarjeta que se ramifica en Principiante, Principiante-Intermedio, Intermedio y Avanzado; la página del curso (`#/curso/blender`) muestra el árbol de niveles, «Tu Blender» (equipos conectados y prácticas registradas) y el mapa de cada nivel. A-Frame tiene el mismo trato. Logos SVG de Blender y A-Frame.
- **Teoría y Blender intercalados** ([02](02_modulos_y_practica.md)): exploración corta en Blender y práctica de cierre en cada módulo, todo registrado con el add-on conectado.
- **Cada módulo con su temática** y un **jefe final** en el examen que pierde vida con cada acierto.
- **Medallas progresivas** (5 logros × bronce, plata y oro) que se revelan al avanzar, y **racha animada**.
- **Curso Intermedio publicado**; Avanzado bloqueado hasta tener su teoría ([ruta de aprendizaje](../cursos/03_ruta_de_aprendizaje_blender.md)).
- **Más claro y más ligero:** el ejercicio de emparejar con más contraste, animaciones CSS nuevas y un modo ligero para equipos modestos ([07](07_herramientas_graficas.md)). Mismo diseño y misma paleta.
- **Sin cambios en Oracle.** El curso Intermedio se crea solo al importar (`asegurar_cursos_base`).

## Estado vigente (9 de octubre)

- La plataforma y Blender se trabajan como un flujo único de aprendizaje: la plataforma guía el recorrido y Blender ejecuta práctica con acompañamiento.
- El motor ya incluye etapas 3.4, 3.5 y 3.5.1 (reconocimiento de figura, instructor por checklist y revisión contra ejemplo).
- El panel del alumno se centra en estado real de avance y práctica, sin promesas visuales de funciones no cerradas.
- El roadmap histórico (piloto y fases previas) se mantiene en bitácora y cronología; la operación diaria vive en `KANBAN.md` y `PROYECTO.md`.

## Resumen de cambios (v3.1)

- **Estructura fija, sin pestañas sueltas.** La barra superior queda en Cursos, Mi panel y Admin (para profesores y administradores); salen Blender y el Laboratorio técnico (que era una página de pruebas y pasa a ser un diagnóstico solo para el equipo). La conexión con Blender pasa a **Mi Blender** (menú de la cuenta) y, sobre todo, a la propia práctica.
- **Cada módulo cierra con su práctica en Blender.** En el mapa del curso, la práctica es una estación al final de la ruta del módulo; se abre al terminar las lecciones. Solo el examen puede ir después.
- **Preparar Blender dentro de la práctica.** Descargar, abrir Blender y escribir el código se hace en la misma tarjeta de la lección, en tres pasos.
- **Etiquetas comunes.** El mismo idioma visual (tipo de lección, práctica, guía, nivel, duración, estado) en el mapa, la lección, el panel del alumno y el panel de administración.
- **Tres herramientas nuevas:** Paso a paso, Atajos de teclado (con modo «Pruébate») y Comparar.
- **Panel de administración por tareas:** Enseñanza (Módulos, Prácticas de Blender, Herramientas), Personas y Sistema, con una página de Herramientas que muestra cada bloque como lo ve el alumno.
- **Sin cambios en Oracle.** Todo vive en el JSON de las lecciones y en el frontend; la única regla nueva (orden de la práctica) la valida el servidor.
