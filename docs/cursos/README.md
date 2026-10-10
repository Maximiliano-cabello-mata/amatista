# Cursos de Amatista

Qué cursos tiene Amatista, para quién es cada uno y cómo el plan de estudios de Blender se convirtió en cursos, módulos, lecciones y prácticas. Para quien diseña contenido o quiere saber qué aprende un alumno.

Actualizado: 10 de octubre de 2026 (cada práctica con su ejemplo resuelto, Amatista Motor 3.5)

## Índice

1. [Cuatro cursos de Blender](#1-cuatro-cursos-de-blender)
2. [Del plan de estudios a los cursos](#2-del-plan-de-estudios-a-los-cursos)
3. [Cómo es un módulo](#3-cómo-es-un-módulo)
4. [Curso Principiante](#4-curso-principiante)
5. [Curso Principiante-Intermedio](#5-curso-principiante-intermedio) y [Curso Intermedio](#5b-curso-intermedio)
6. [Dónde vive cada curso en el código](#6-dónde-vive-cada-curso-en-el-código)
7. [Agregar un módulo o un curso](#7-agregar-un-módulo-o-un-curso)

---

## 1. Cuatro cursos de Blender

| # | Curso | Para quién | Estado |
|---|---|---|---|
| 01 | **Blender Principiante** | Gente que no sabe nada de 3D ni de Blender | Publicado: 3 módulos |
| 02 | **Blender Principiante-Intermedio** | Quien ya se mueve y modela: color, luz, render y animación | Publicado: 3 módulos |
| 03 | **Blender Intermedio** | Quien ya renderiza y anima: precisión, orden y portafolio | Publicado: 3 módulos |
| 04 | Blender Avanzado | Topología, UV, nodos y rig | Bloqueado: le falta teoría ([ruta §8](03_ruta_de_aprendizaje_blender.md#8-nivel-4--avanzado-bloqueado)) |
| 05 | A-Frame | Llevar los modelos a la web | Sin cambios |

En la plataforma, los cuatro niveles son **una sola tarjeta «Blender»** que se ramifica por dentro (`frontend/src/catalogo/agrupar.js`); la página `#/curso/blender` muestra el árbol de niveles y cada nivel abre su mapa de módulos. A-Frame recibe el mismo trato con su propia tarjeta. Por qué la ruta está armada así: [Ruta de aprendizaje de Blender](03_ruta_de_aprendizaje_blender.md).

Los cuatro cursos de Blender forman la **ruta** `blender`. El orden se recomienda pero no se impone: quien ya sabe lo básico puede empezar en el 02. El curso `blender` de la v2 (sus módulos 1 a 3 y la práctica de la mesa) quedó **archivado**: no se ofrece a alumnos nuevos y quien avanzó en él conserva su progreso.

## 2. Del plan de estudios a los cursos

El [plan de estudios de Blender](plan_de_estudios_blender.txt) tiene 6 módulos. Se repartieron en dos cursos de 3 módulos:

| Plan | Curso › módulo | Práctica en Blender |
|---|---|---|
| Módulo 1 · Fundamentos y navegación espacial | Principiante › 1 | Tren de juguete |
| Módulo 2 · Modelado (esculpiendo formas) | Principiante › 2 | Espada low-poly |
| Módulo 3 · Modificadores | Principiante › 3 | Nave espacial simétrica |
| Módulo 4 · Materiales, texturas y color | Principiante-Intermedio › 1 | Pinta tu nave |
| Módulo 5 · Iluminación y cámara | Principiante-Intermedio › 2 | Tres puntos y render final |
| Módulo 6 · Animación básica | Principiante-Intermedio › 3 | La pelota que rebota |

Los principios del plan se volvieron mecánicas del motor v3 ([etapa 3](../motor/etapas/etapa-3.md)):

| Principio del plan | Cómo quedó |
|---|---|
| Andamiaje (scaffolding) | Objetivos en orden con `requires`, guía paso a paso con teclas, «Hazlo conmigo» y escenas de inicio preparadas. |
| Aprendizaje espaciado | Repaso con cajas de Leitner (1, 3, 7, 14, 30 días) de las píldoras con pregunta de prácticas anteriores. |
| Teoría en píldoras visuales que aparecen cuando se necesitan | `pills` con disparos (al empezar, al llegar a un paso, al entrar a un modo, cuando algo se rompe) y la franja TEORÍA del HUD. |
| Corregir errores típicos (por ejemplo, vértices duplicados) | Vigilantes que pausan el progreso y ofrecen arreglarlo. |
| Mini-proyecto por módulo | Una práctica guiada en Blender al final de cada módulo. |

## 3. Cómo es un módulo

Desde la v3.2 cada módulo intercala teoría y Blender: **5 lecciones**, dos de ellas en Blender con el add-on conectado (una exploración corta y la práctica de cierre):

| Lección | Tipo | Qué hace |
|---|---|---|
| `…_gancho` | teoría interactiva | La pregunta o el problema que abre el módulo. |
| `…_blender` | bloque `blender_practice` (exploración) | Unos minutos en Blender para probar la herramienta nueva antes de la teoría. Se registra. |
| `…_explora` | teoría interactiva | Las herramientas del módulo, con sus teclas. |
| `…_practica` | teoría + bloque `blender_practice` (cierre) | Prepara Blender y abre la práctica guiada; al terminarla, la lección se completa. |
| `…_jefe` | examen (aprueba con 80) | El jefe final del módulo: cada acierto le quita vida. Da la insignia. |

Ninguna lección de Blender se puede marcar a mano (`allowManual: false`): solo cuenta lo que registra el add-on. En `practices/blender/cursos.json` cada módulo declara su `explore` y su `practice`, y el motor los recorre en ese orden (`ModuleEntry.sequence`).

La primera lección de cada curso está desbloqueada; las demás se abren en orden.

## 4. Curso Principiante

`blender_principiante` · archivos `frontend/src/data/modulos/blender_principiante-modulo-{1,2,3}.json`

| Módulo | Insignia | Lecciones | Práctica | Aprende |
|---|---|---|---|---|
| 1 · La interfaz y navegación 3D | Maquinista 3D | ¿Dónde estoy? El espacio 3D · Muévete y transforma: rueda, G, R y S · Práctica · Jefe final | `blender.bp.m1.tren` | Ejes X/Y/Z, órbita y zoom, agregar objetos (Shift+A), mover, rotar y escalar (G, R, S), guardar. |
| 2 · Modelado poligonal básico | Forjador low-poly | Objeto o Edición · Extruir, cortar y limpiar · Práctica · Jefe final | `blender.bp.m2.espada` | Modo Edición (Tab), vértices, aristas y caras (1, 2, 3), B y C, extruir (E), corte de bucle (Ctrl+R), fusionar por distancia (M). |
| 3 · Modificadores | Ingeniero de naves | Filtros que no rompen nada · Espejo, Subdivisión y escala aplicada · Práctica · Jefe final | `blender.bp.m3.nave` | Modificadores no destructivos, Espejo con recorte, Subdivisión de superficie, aplicar escala (Ctrl+A). |

## 5. Curso Principiante-Intermedio

`blender_principiante_intermedio` · archivos `frontend/src/data/modulos/blender_principiante_intermedio-modulo-{1,2,3}.json`

| Módulo | Insignia | Lecciones | Práctica | Aprende |
|---|---|---|---|---|
| 1 · Materiales y sombreado | Pintor de naves | ¿Por qué el metal brilla? · Tres controles del Principled BSDF · Práctica · Jefe final | `blender.bpi.m1.pinta-nave` (parte de la nave del curso anterior) | Materiales, Color base, Metálico, Rugosidad, Transmisión (cristal). |
| 2 · Iluminación y cámara | Director de foto | Sin luz no hay imagen · Tres puntos, cámara y EEVEE · Práctica · Jefe final | `blender.bpi.m2.tres-puntos` | Luz de área, iluminación de tres puntos, cámara activa y encuadre, motor EEVEE, render (F12). |
| 3 · Animación básica | Animador | 24 fotos por segundo · El rebote y el encoger y estirar · Práctica · Jefe final | `blender.bpi.m3.pelota` | Fotogramas clave (I), línea de tiempo, rebote, aplastar y estirar. |

## 5b. Curso Intermedio

`blender_intermedio` · archivos `frontend/src/data/modulos/blender_intermedio-modulo-{1,2,3}.json`

| Módulo | Insignia | Exploración · Práctica | Aprende |
|---|---|---|---|
| 1 · Modelado con precisión | Arquitecto de puentes | `blender.bi.m1.explora` · `blender.bi.m1.puente` | Medidas en el panel N, Snap, Array, Bisel. |
| 2 · Organiza tu escena | Cartógrafo de escenas | `blender.bi.m2.explora` · `blender.bi.m2.aldea` | Nombres, colecciones, materiales compartidos. |
| 3 · Render de portafolio | Curador de galería | `blender.bi.m3.explora` · `blender.bi.m3.diorama` | Composición, Cycles, muestras, repaso de tres puntos. |

## 6. Dónde vive cada curso en el código

| Pieza | Archivo |
|---|---|
| Catálogo de la PWA | `frontend/src/data/cursos.js` (`CURSOS_BASE`) |
| Lecciones | `frontend/src/data/modulos/<curso>-modulo-<n>.json` (archivados en `modulos/archivo/`) |
| Cursos al importar a Oracle | `backend/contenido/plantillas.py` (`CURSOS_BASE`) |
| Mapa del add-on | `practices/blender/cursos.json` |
| Prácticas | `practices/blender/<curso>/m<n>-<nombre>/` |
| Base de datos | `CURSOS` (con `RUTA` y `REQUISITO_ID`, `sql/008`) y `MODULOS`, `LECCIONES`, `PRACTICAS` |

## 7. Agregar un módulo o un curso

1. Práctica: `python engine/herramientas/practicas.py nueva …` ([herramientas de autor](../motor/referencia/08_practicas_v3_y_herramientas.md)). La plantilla ya trae un bloque `example`: cámbialo por la solución de tu práctica (la solución en pasos, [cómo](../../engine/README.md#escribir-el-ejemplo-de-una-práctica)) y corre `python engine/herramientas/practicas.py probar <carpeta>`: comprueba los casos de `pruebas.json` y que el ejemplo complete la práctica.
2. Módulo en `practices/blender/cursos.json`.
3. Lecciones: copia un módulo existente o usa `python backend/herramientas/contenido.py nuevo-modulo`, y valida con `contenido.py validar`.
4. Curso nuevo: los cuatro lugares de la §6, con el mismo id.
5. En el servidor: `contenido.py importar` y `contenido.py practicas --publicar`.
