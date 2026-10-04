# Bitácora · 4 de octubre de 2026 · Curso de Blender unificado, ruta de aprendizaje y gráficos

Pedido de Maximiliano (4 oct, 22:10 a 22:25):

- una sola tarjeta «Blender» que se ramifica por dentro en Principiante, Principiante-Intermedio, Intermedio y Avanzado; cada curso centralizado en su tarjeta y su página (A-Frame igual), con logo de Blender;
- el ejercicio de emparejar más claro;
- intercalar teoría y práctica en Blender, sin suponer que el alumno está en Blender: todo lo que haga en Blender, registrado en la plataforma y en el motor;
- más recursos gráficos, CSS mejor y más ligero para equipos modestos, sin cambiar el diseño ni la paleta; logos en los cursos; insignias y racha mejor diseñadas, con animaciones; insignias progresivas y finitas;
- una ruta de aprendizaje propia e innovadora, con curva baja: primeros cursos muy prácticos y divertidos, más serios después; centrarse en principiante, principiante-intermedio e intermedio y bloquear avanzado; el laboratorio, después;
- cada sesión una experiencia nueva: examen con jefe final que pierde vida con cada acierto, una temática por módulo, investigar las mejores herramientas gráficas y mejorar todo lo gráfico.

## Decisiones tomadas sin preguntar (se pueden cambiar)

| Tema | Decisión | Por qué |
|---|---|---|
| Unificar cursos | Agrupar por `ruta` en la plataforma; los ids de los cursos de nivel no cambian | No se pierde progreso ni hay que tocar Oracle ni el backend. |
| Intercalar | Una **exploración** corta en Blender después del gancho y la **práctica de cierre** al final, en cada módulo | Tocar antes de estudiar baja la carga y la teoría llega con algo concreto en mente. |
| Validación del servidor | Ya no exige que la práctica sea la última lección; rechaza que una práctica se repita en el módulo | La regla vieja impedía intercalar. |
| Intermedio | Publicado con 3 módulos: precisión (puente), orden (aldea) y render de portafolio (diorama) | Pedido explícito; el diorama reúne los tres niveles. |
| Avanzado | Bloqueado, con 3 módulos planeados y la teoría que les falta | Pedido explícito; queda en T-067. |
| Jefe final | Vida = respuestas correctas que pide aprobar; aprobar = derrotarlo | No cambia cómo se califica, solo cómo se ve. |
| Medallas | 5 logros × bronce, plata y oro = 15, que se revelan al acercarse | Finitas y progresivas, como se pidió. |
| Gráficos | SVG y CSS propios, sin librerías nuevas; modo ligero automático | Peso cero y funciona en equipos modestos. Lo que conviene sumar está en la investigación. |
| Producción | Nada se tocó y no hay script SQL nuevo | El curso Intermedio se crea solo al importar (`asegurar_cursos_base`). |

## Hecho (rama `claude/curso-blender-unificado-8rjww7`, un PR)

### Plataforma (v3.2)
- Una tarjeta por curso con árbol de niveles (`catalogo/agrupar.js`, `TarjetaCurso.jsx`) y página del curso `#/curso/blender` con árbol, «Tu Blender» y mapa de cada nivel intercalando teoría y estaciones de Blender (`pages/Curso.jsx`).
- Logos SVG de Blender y A-Frame (`assets/logos/`, `LogoCurso.jsx`).
- Temática por módulo (`components/temas/temas.js`) y examen con jefe final low poly que pierde vida (`Jefe.jsx`, `Examen.jsx`).
- Medallas progresivas (`progreso/logros.js`, `LogrosPanel.jsx`) y racha animada con franja de 7 días (`EncabezadoPanel.jsx`).
- Emparejar con más contraste y una pista que cambia.
- Animaciones CSS nuevas, brillo en barras de progreso, `content-visibility` y modo ligero automático (`lib/rendimiento.js`).

### Motor, add-on y contenido
- `explore` en el plan de estudios y `ModuleEntry.sequence`; el desbloqueo y la pestaña «Mi curso» del add-on (3.1.0) recorren exploración y cierre.
- 12 prácticas nuevas: 9 exploraciones y 3 de cierre del Intermedio (puente, aldea, diorama). 18 en total, 63 de 63 casos de `pruebas.json` correctos.
- 9 módulos de Blender con 5 lecciones cada uno (3 nuevos del Intermedio).

### Documentación
- [Ruta de aprendizaje de Blender](../cursos/03_ruta_de_aprendizaje_blender.md): el plan propio, sus reglas y los cuatro niveles.
- [Herramientas gráficas](../plataforma/07_herramientas_graficas.md): lo que hay y la investigación de lo que conviene desarrollar.
- Actualizados: `docs/cursos/README.md`, `docs/plataforma/README.md` y `02`, `practices/README.md`, `CHANGELOG.md`, tablero (T-070 a T-073; T-064 y T-067 ajustadas).

## Pruebas

| Suite | Resultado |
|---|---|
| Frontend (vitest) | 174 pasadas; ESLint limpio; build correcto |
| Motor (pytest) | 100 pasadas |
| Backend (pytest) | 292 pasadas; `contenido.py validar`: 10 archivos, 0 errores |
| Add-on (pytest) | 9 pasadas |
| Prácticas | `revisar` sin errores; `probar` 63 de 63 |

No se probó dentro de Blender real (no hay Blender en la nube): las prácticas nuevas pasan sus casos simulados. Queda en T-066.

## Después del piloto (8 de octubre)

1. Seguir `docs/base-de-datos/02_manual_008_009.md` (T-064).
2. `python herramientas/contenido.py importar` con los 9 módulos de Blender (crea el curso Intermedio si falta).
3. `python herramientas/contenido.py practicas --publicar` (18 prácticas).
4. Reinstalar el add-on 3.1.0 en los equipos de prueba.
