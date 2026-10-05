# Herramientas gráficas: qué tenemos y qué conviene desarrollar

Investigación de las herramientas gráficas que mejor encajan en la PWA de Amatista, con lo que ya se hizo en la v3.2 y un orden recomendado para lo que sigue. Para quien desarrolla la interfaz.

Actualizado: 4 de octubre de 2026

## Índice

1. [Criterios](#1-criterios)
2. [Lo que ya tenemos](#2-lo-que-ya-tenemos)
3. [Nuevo en la v3.2](#3-nuevo-en-la-v32)
4. [Opciones evaluadas](#4-opciones-evaluadas)
5. [Recomendación y orden](#5-recomendación-y-orden)
6. [Reglas para equipos modestos](#6-reglas-para-equipos-modestos)

---

## 1. Criterios

Cada herramienta se juzgó con cuatro preguntas, en este orden:

1. **¿Corre bien en un equipo modesto?** Muchos alumnos usan computadoras o teléfonos de gama baja.
2. **¿Cuánto pesa?** La PWA se instala y debe funcionar sin conexión.
3. **¿Encaja con la identidad low poly?** Polígonos facetados, cortes en las esquinas y la paleta actual.
4. **¿La puede mantener el equipo?** Mejor código propio pequeño que una dependencia grande.

## 2. Lo que ya tenemos

El detalle de cada pieza está en el compendio (`/mnt/project-files/compendio/herramientas-visuales.md`) y en [03 Etiquetas y gráficos](03_etiquetas_y_graficos.md).

| Familia | Piezas | Tecnología |
|---|---|---|
| Identidad | Fondo low poly, cortes poligonales, hexágonos, iconos | SVG + CSS |
| Gráficas | Anillo de progreso, barras, medidor, mapa de calor | SVG propio, sin librería |
| Lecciones | Tarjetas, línea de tiempo, pipeline, capas, avisos, código | React + CSS |
| Interactivos | Quiz, ordenar, emparejar, completar, puntos en imagen, explorador de escena, reto de código | React + SVG |
| 3D | Vista y escena A-Frame (curso de A-Frame) | A-Frame, cargado solo donde se usa |

## 3. Nuevo en la v3.2

| Pieza | Archivo | Qué hace |
|---|---|---|
| Logos de curso | `frontend/src/assets/logos/*.svg`, `components/LogoCurso.jsx` | Logo de Blender y de A-Frame en tarjetas, página del curso y panel. |
| Árbol de niveles | `pages/Curso.jsx`, `components/TarjetaCurso.jsx` | Un curso, sus niveles como ramas, cada uno con su estado. |
| Temáticas por módulo | `practices/blender/temas.json` (compartido con el add-on), `components/temas/temas.js` | Nombre, colores, escenario, mascota y jefe de cada módulo. |
| Escenarios animados (v3.3) | `components/temas/Escenario.jsx` | Paisaje low poly por temática (engranes, chispas, estrellas, gotas, reflectores, carpa, aldea, mapa, galería, portal, cristales) detrás del módulo, la lección y la arena del jefe. |
| Mascotas (v3.3) | `components/temas/Mascota.jsx`, `sprites.js` | Un personaje original en pixel art por módulo que da consejos y datos curiosos. |
| Personaje interactivo (v3.4) | `components/temas/Personaje.jsx`, `personaje.js` | El personaje de cada módulo parpadea, sigue el puntero con la mirada, se mueve solo y responde al tocarlo (salto, giro, baile, saludo) con chispas del color del módulo. `Paseo`: camina por su carril en la página del curso. Reacciona a aciertos, fallos y al final de la lección, y festeja los golpes al jefe. |
| Mundo de la lección (v3.4) | `components/temas/MundoTema.jsx` | Cielo, luz, suelo y partículas propias del módulo detrás de toda la lección y dentro de la tarjeta del módulo. |
| Compañero de la lección (v3.4) | `components/temas/CompaneroMascota.jsx` | El personaje en la esquina durante toda la lección: saluda, platica (`charla` de `temas.json`), reacciona y se puede callar. |
| Jefes con silueta propia (v3.3) | `components/temas/Jefe.jsx` | Cinco siluetas (bloque, robusto, flotante, redondo, alto) además de colores y adornos. |
| «Un mundo por módulo» (v3.3) | `components/temas/MundosModulos.jsx` | En la portada, cada módulo con su escenario, guía y jefe. |
| Destello y transición de página (v3.3) | `index.css` (`.destello`, `.animar-pagina`) | Brillo al pasar sobre los botones principales y fundido corto al cambiar de página. |
| Jefe final | `components/temas/Jefe.jsx`, `leccion/Examen.jsx` | Criatura low poly paramétrica (un solo SVG, 10 adornos) con barra de vida; se sacude con cada acierto y cae al aprobar. |
| Medallas progresivas | `components/panel/LogrosPanel.jsx`, `progreso/logros.js` | 5 logros con bronce, plata y oro (15 en total) que se revelan al acercarse. |
| Racha animada | `components/panel/EncabezadoPanel.jsx` | Llama que late, franja de 7 días y la siguiente meta. |
| Animaciones CSS | `src/index.css` | `aparecer`, `llama`, `latido`, `dibujar`, brillo en barras de progreso. |
| Modo ligero | `lib/rendimiento.js` | Detecta equipos modestos y apaga el fondo pesado, las sombras grandes y las animaciones continuas. |

## 4. Opciones evaluadas

Pesos aproximados (minificado y comprimido) según la documentación pública de cada proyecto; varían por versión.

| Herramienta | Para qué serviría | Peso aprox. | Equipos modestos | Veredicto |
|---|---|---|---|---|
| **SVG + CSS propio** | Ilustraciones, jefes, medallas, transiciones | 0 KB extra | Excelente | **Seguir siendo la base.** |
| **`<model-viewer>`** (Google) | Ver en la plataforma el modelo glTF que el alumno exportó de Blender: girarlo, hacer zoom | ~ 250 KB, carga diferida | Bueno con modelos pequeños | **Recomendado**: conecta la plataforma con lo hecho en Blender. |
| **API de View Transitions** | Transición suave entre la tarjeta del curso y su página | 0 KB (nativa) | Bueno; si el navegador no la tiene, no pasa nada | **Recomendado.** |
| **canvas-confetti** | Celebrar al derrotar al jefe o ganar una medalla | ~ 5 KB | Bueno, si se limita la cantidad | Recomendado, apagado en modo ligero. |
| **Lottie / dotLottie** | Animaciones hechas en After Effects | 60 a 250 KB el reproductor + cada animación | Regular | No por ahora: pesa más que el SVG propio y no encaja con la identidad. |
| **Rive** | Personajes animados con máquina de estados (jefes «vivos») | ~ 150 KB (WebAssembly) + archivo | Regular | Para después, si los jefes necesitan más que SVG. |
| **three.js directo** | Escenas 3D propias en lecciones | ~ 150 KB o más | Regular a malo | Solo dentro de A-Frame, que ya lo trae. |
| **GSAP / Motion** | Animación por código con línea de tiempo | 25 a 70 KB | Bueno | No hace falta: las animaciones actuales caben en CSS. |
| **Rough.js** | Dibujos a mano alzada | ~ 9 KB | Bueno | No: rompe la identidad low poly. |
| **D3 completo** | Gráficas | ~ 90 KB | Bueno | No: las gráficas propias ya cubren lo necesario. |

## 5. Recomendación y orden

1. **Visor del modelo del alumno** con `<model-viewer>`: al terminar una práctica, el add-on sube una exportación glTF ligera y la plataforma la muestra girando en el mapa del módulo y en el panel. Es lo que más conecta Blender con la plataforma. Necesita: exportar en el add-on, guardar el archivo en el backend y un bloque nuevo `model_viewer`. Carga diferida y apagado en modo ligero (se muestra el render fijo).
2. **Transiciones entre páginas** con View Transitions: la tarjeta «Blender» se expande hacia la página del curso. Sin dependencias.
3. **Celebraciones** con canvas-confetti al vencer al jefe y al ganar una medalla de oro.
4. ~~**Ilustraciones por temática**~~: hecho en la v3.3 con `Escenario.jsx` (SVG propio, sin librerías).
5. **Jefes con Rive**, solo si después de probar con alumnos el SVG se queda corto.

Las tareas están en el tablero (`tablero/tareas.yml`).

## 6. Reglas para equipos modestos

- Todo lo pesado se carga **solo donde se usa** (`import()` diferido), nunca en la portada.
- `html.ligero` (lo pone `lib/rendimiento.js`) apaga: fondo low poly, sombras grandes, brillos en barras y animaciones continuas (flotar, pulso, llama, latido).
- Se respeta `prefers-reduced-motion`: sin flotar, sin sacudidas, sin brillo.
- Animar solo `transform` y `opacity`, que no recalculan el diseño de la página.
- Listas largas con `.cv-auto` (`content-visibility: auto`) para no pintar lo que no se ve.
