# 13 · Camino guiado, recursos gráficos v4.2 y Motor Web (23 de octubre de 2026)

Pedido del usuario: volver atrás del diseño «tipo buscador» (Explorar, 21 de octubre), compactar todos los cursos en listas guiadas para quien no conoce la plataforma, salir de las listas, verdadero/falso y ordenar, hacer Blender intuitivo para quien nunca lo abrió, un motor gráfico propio en A-Frame y dos cursos compactos de A-Frame, y contenido útil y opcional sobre cómo se usa Blender hoy en las empresas. Tareas T-122 a T-128.

## 1. La portada «Cursos» es un camino (T-123)

- Sale **Explorar** (`#/explorar`, buscador, filtros e índice). La dirección vieja lleva a la portada.
- La barra queda en **Cursos · Mi panel** (· Admin). Sin ícono de búsqueda.
- `catalogo/camino.js` arma, por programa, una **lista numerada de pasos**: cada paso es un módulo con una línea de qué vas a lograr (`resumenCorto`), sus minutos, su insignia y sus lecciones a un clic. Los pasos se agrupan por nivel (cada nivel es un curso) y uno solo queda marcado como **Siguiente**.
- Arriba, pestañas grandes por programa («¿Qué quieres crear?»): Blender, A-Frame y, como próximos, Maya y 3ds Max. Cada nivel dice para quién es (campo `para` de `data/cursos.js`).
- El recorrido de la plataforma (botón «?») se actualizó a la nueva portada.

## 2. Recursos gráficos v4.2 (T-125)

Bloques nuevos que se resuelven manipulando la figura (`components/leccion/graficos.js`, validados en `backend/contenido/validacion.py`):

| Bloque | Qué hace |
|---|---|
| `viewport_sim` | Simulador de la vista 3D de Blender: orbitar, acercar y vistas 1, 3 y 7 con misiones. |
| `image_choice` | «Elige la figura»: las respuestas son figuras 3D dibujadas (bisel, espejo, array, extruido…). |
| `keyframe_sim` | Línea de tiempo: el alumno pone las claves de una pelota y ve la interpolación. |
| `motor_scene` | «Mundo 3D»: una escena del Motor Web con objetos que se arrastran y retos (ver §4). |
| `callout` con `variant: "estudio"` | Lectura opcional plegable **«En la industria»**: no cuenta como actividad. |

Todos los interactivos se cargan bajo demanda (`BloqueContenido.jsx`).

## 3. Contenido (T-126, T-127)

- **Blender**: los 9 módulos cambian varias listas, verdadero/falso y ordenar por los bloques nuevos, y suman una lectura «En la industria» por módulo (presupuesto de polígonos, trabajo no destructivo, PBR, iluminación de tres puntos, 12 principios de animación, unidades reales, organización de archivos, EEVEE y Cycles). La primera lección avisa que Blender viene en inglés.
- **A-Frame en dos cursos compactos** (misma ruta `aframe`, dos niveles):
  - **A-Frame Inicial** (`aframe`): La web en 3D · Construye tu escena · Modelos GLB y texturas.
  - **A-Frame Interactivo** (`aframe_interactivo`): Animación e interacción (antiguo módulo 4) · **Mundos con el Motor Amatista** (nuevo, `mod_afi_002`) · Experiencias WebXR (antiguo módulo 5).
  - Las lecciones movidas conservan sus ids (`af4_*`, `af5_*`). `progreso/estado.js` traslada el avance y las insignias (`TRASLADOS_LECCION`, `TRASLADOS_INSIGNIA`) y `catalogo/combinar.js` oculta `mod_aframe_004` y `mod_aframe_005` si el servidor aún los envía. Los JSON viejos están en `data/modulos/archivo/`.
  - Temática nueva **«El semillero de mundos»** con su mascota original, Pepita.

## 4. Motor Web de Amatista (T-124)

`frontend/src/motor3d/`: componentes A-Frame propios (`am-*`) que funcionan con ratón, dedo y visor.

| Componente | Para qué |
|---|---|
| `am-entorno` | Terreno low poly, cielo, agua y piezas repartidas con semilla (pradera, bosque, isla, desierto, nieve, ciudad, cristal, espacio, vacío). |
| `am-generar` | Copias en fila, rejilla, círculo, espiral o azar, en una sola malla instanciada. |
| `am-arrastrable`, `am-mano` | Mover objetos apoyados en el suelo; agarrar con el láser del visor. |
| `am-tocable`, `am-zona`, `am-reto` | Clic o toque, metas en el suelo y retos (`en_zona`, `todos_en_zona`, `tocar`, `cerca`, `altura`) que celebran. |
| `am-orbita`, `am-caminar` | Cámara que orbita o paseo con W A S D (y mantener el dedo en el celular). |
| `am-flotar`, `am-rendimiento` | Animación barata y resolución ajustada en vivo según los cuadros por segundo. |

La descripción de escena (`motor3d/escena.js`) es la misma para el bloque `motor_scene` y para el Estudio; la página que descarga el alumno incluye el motor (`motor3d/fuente.js`).

## 5. Blender más intuitivo (T-122, add-on 5.3)

- Blender se instala en inglés. El motor reescribe las rutas de menú según el idioma de la interfaz (`engine/amatista_engine/terminos.py`: `menus`, `tecla`), y el add-on lo aplica en la tarjeta del taller, el HUD y los paneles: «Shift + A › Mesh (Malla) › Cube (Cubo)».
- **Palabras de Blender** (`practices/blender/palabras.json`): 17 palabras en simple con su nombre en inglés. Las muestran la página **Blender** de la plataforma y la pestaña **Aprender** del add-on.
