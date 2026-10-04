# Plataforma Amatista (v3.1 · 4 de octubre de 2026)

Cómo está organizada la plataforma para alumnos, profesores y administradores después de la integración de Blender en los módulos. Lo técnico del motor y del add-on está en [`docs/motor/`](../motor/README.md).

> «La plataforma la siento muy dispersa… esa parte que le agregamos como una pestaña a Blender no está bien, sino hacerlo en una integración en los módulos: que cada módulo cuente con una práctica de Blender en la cual primero realices el módulo y ya luego realices la práctica en Blender.» (Maximiliano, 4 oct 2026)

| Documento | Qué explica |
|---|---|
| [01 · Mapa de la plataforma](01_mapa_de_la_plataforma.md) | Qué ve cada persona (alumno, profesor, administrador) y dónde está cada cosa. |
| [02 · Módulos con práctica en Blender](02_modulos_y_practica.md) | La regla «primero el módulo, luego la práctica», cómo se ve y cómo se arma. |
| [03 · Etiquetas y gráficos](03_etiquetas_y_graficos.md) | El sistema de etiquetas low poly, la ruta del módulo y la estación de Blender. |
| [04 · Herramientas de enseñanza](04_herramientas_de_ensenanza.md) | Los 20 bloques con los que se arma una lección, con sus campos y cuándo usar cada uno (3 nuevos). |
| [05 · Panel de administración](05_panel_de_administracion.md) | Cómo se organiza el panel y el flujo para subir un módulo con su práctica. |

![Un módulo con su práctica en Blender](img/modulo_ruta.svg)

## Resumen de cambios (v3.1)

- **Estructura fija, sin pestañas sueltas.** La barra superior queda en Cursos, Mi panel y Admin (para profesores y administradores); salen Blender y el Laboratorio técnico (que era una página de pruebas y pasa a ser un diagnóstico solo para el equipo). La conexión con Blender pasa a **Mi Blender** (menú de la cuenta) y, sobre todo, a la propia práctica.
- **Cada módulo cierra con su práctica en Blender.** En el mapa del curso, la práctica es una estación al final de la ruta del módulo; se abre al terminar las lecciones. Solo el examen puede ir después.
- **Preparar Blender dentro de la práctica.** Descargar, abrir Blender y escribir el código se hace en la misma tarjeta de la lección, en tres pasos.
- **Etiquetas comunes.** El mismo idioma visual (tipo de lección, práctica, guía, nivel, duración, estado) en el mapa, la lección, el panel del alumno y el panel de administración.
- **Tres herramientas nuevas:** Paso a paso, Atajos de teclado (con modo «Pruébate») y Comparar.
- **Panel de administración por tareas:** Enseñanza (Módulos, Prácticas de Blender, Herramientas), Personas y Sistema, con una página de Herramientas que muestra cada bloque como lo ve el alumno.
- **Sin cambios en Oracle.** Todo vive en el JSON de las lecciones y en el frontend; la única regla nueva (orden de la práctica) la valida el servidor.
