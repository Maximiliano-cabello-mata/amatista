# Herramientas gráficas: estado actual y catálogo educativo v2

Investigación de las herramientas gráficas que mejor encajan en la PWA de Amatista, con lo que ya está activo y el plan inmediato para ampliar la lectura pedagógica sin romper el modo ligero.

Actualizado: 10 de octubre de 2026 (v3.6: medición real de 17 librerías, tres herramientas propias nuevas y diseño CSS para condiciones difíciles; secciones 8 y 9)

## Índice

1. [Criterios](#1-criterios)
2. [Lo que ya tenemos](#2-lo-que-ya-tenemos)
3. [Nuevo en la v3.2](#3-nuevo-en-la-v32)
4. [Opciones evaluadas](#4-opciones-evaluadas)
5. [Catálogo gráfico educativo v2](#5-catálogo-gráfico-educativo-v2)
6. [Recomendación y orden](#6-recomendación-y-orden)
7. [Reglas para equipos modestos](#7-reglas-para-equipos-modestos)
8. [Investigación v3.6: medición real y filtro](#8-investigación-v36-medición-real-y-filtro)
9. [Diseño CSS v3.6](#9-diseño-css-v36)

---

## 1. Criterios

Cada herramienta se juzgó con cuatro preguntas, en este orden:

1. **¿Corre bien en un equipo modesto?** Muchos alumnos usan computadoras o teléfonos de gama baja.
2. **¿Cuánto pesa?** La PWA se instala y debe funcionar sin conexión.
3. **¿Encaja con la identidad low poly?** Polígonos facetados, cortes en las esquinas y la paleta actual.
4. **¿La puede mantener el equipo?** Mejor código propio pequeño que una dependencia grande.

## 2. Lo que ya tenemos

El detalle de cada pieza está en [03 Etiquetas y gráficos](03_etiquetas_y_graficos.md) y en los componentes de `frontend/src/components/graficas/`.

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

Pesos aproximados (minificado y comprimido) según la documentación pública de cada proyecto; varían por versión. **La sección 8 los reemplaza con mediciones propias** (10 oct 2026).

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

## 5. Catálogo gráfico educativo v2

Objetivo: pasar de “progreso general” a “progreso pedagógico observable”.

| Pieza v2 | Para qué | Estado |
|---|---|---|
| Tendencia de constancia (línea) | Ver si el ritmo semanal/subdiario mejora o cae | **Activo** (panel alumno + admin) |
| Progreso por habilidad | Ver avance por habilidad declarada en ficha | Diseñado |
| Dominio por objetivo | Ver qué objetivos están dominados, en riesgo o sin evidencia | Diseñado |
| Errores recurrentes por práctica | Detectar en qué paso/aspecto se repite el fallo | Diseñado |
| Evolución alumno ↔ grupo | Comparar ritmo individual con cohorte equivalente | Diseñado |

Notas:
- Las piezas “diseñadas” dependen de telemetría pedagógica más fina del motor y backend.
- Todo el catálogo v2 debe mantener degradación para modo ligero y carga diferida.

## 6. Recomendación y orden

1. **Visor del modelo del alumno** con `<model-viewer>`: al terminar una práctica, el add-on sube una exportación glTF ligera y la plataforma la muestra girando en el mapa del módulo y en el panel. Es lo que más conecta Blender con la plataforma. Necesita: exportar en el add-on, guardar el archivo en el backend y un bloque nuevo `model_viewer`. Carga diferida y apagado en modo ligero (se muestra el render fijo).
2. **Transiciones entre páginas** con View Transitions: la tarjeta «Blender» se expande hacia la página del curso. Sin dependencias.
3. **Celebraciones** con canvas-confetti al vencer al jefe y al ganar una medalla de oro.
4. ~~**Ilustraciones por temática**~~: hecho en la v3.3 con `Escenario.jsx` (SVG propio, sin librerías).
5. **Jefes con Rive**, solo si después de probar con alumnos el SVG se queda corto.

Las tareas están en el tablero (`tablero/tareas.yml`).

## 7. Reglas para equipos modestos

- Todo lo pesado se carga **solo donde se usa** (`import()` diferido), nunca en la portada.
- `html.ligero` (lo pone `lib/rendimiento.js`) apaga: fondo low poly, sombras grandes, brillos en barras y animaciones continuas (flotar, pulso, llama, latido).
- Se respeta `prefers-reduced-motion`: sin flotar, sin sacudidas, sin brillo.
- Animar solo `transform` y `opacity`, que no recalculan el diseño de la página.
- Listas largas con `.cv-auto` (`content-visibility: auto`) para no pintar lo que no se ve.

## 8. Investigación v3.6: medición real y filtro

10 de octubre de 2026. La tabla de la sección 4 usaba los pesos que publica cada proyecto. Esta vez se midieron: cada librería se instaló en limpio y se empaquetó con esbuild (minificado, ESM, solo lo que importa un uso típico, React aparte) y se comprimió con gzip -9. Es lo que de verdad descargaría un alumno.

| Librería (uso medido) | Minificado | gzip | Filtro |
|---|---:|---:|---|
| ThumbHash (decodificador) | 2 KB | 1.2 KB | **Útil más adelante**: necesita generar el hash al construir; hoy el relleno facetado de `ImagenLigera` cumple sin datos extra. |
| Lucide (5 iconos) | 5 KB | 2.3 KB | **Útil como fuente, no como dependencia**: copiar el SVG del icono que falte a `Iconos.jsx` (licencia ISC). |
| canvas-confetti | 11 KB | 4.3 KB | Útil (sigue en T-072), apagado en modo ligero. |
| Motion «mini» (`animate`) | 8 KB | 3.4 KB | No hace falta: la API de animación del navegador hace lo mismo. |
| Rough.js | 27 KB | 9.2 KB | No: rompe la identidad low poly. |
| uPlot (gráfica de líneas) | 52 KB | 23 KB | No: `LineaTendencia` propia pesa menos de 2 KB. |
| GSAP (núcleo) | 71 KB | 27.5 KB | No: es gratis desde 2025 (incluso los plugins), pero las animaciones caben en CSS. |
| Motion para React | 130 KB | 43 KB | No. |
| Lottie (reproductor ligero) | 172 KB | 49 KB | No: más que todo el panel del alumno. |
| Chart.js (solo líneas) | 139 KB | 49 KB | No. |
| Rive (canvas-lite) | 201 KB + 768 KB WASM | 57 KB + WASM | No por ahora (jefes en SVG). |
| React Flow (`@xyflow/react`) | 180 KB | 59 KB | No: el diagrama de nodos propio pesa 2.9 KB (abajo). |
| Recharts | 312 KB | 95 KB | No. |
| three.js (cubo con luz) | 531 KB | 132 KB | Solo dentro de A-Frame. |
| ECharts (líneas en SVG) | 498 KB | 172 KB | No. |
| `<model-viewer>` | 1,073 KB | **301 KB** | **Revisar T-071**: pesa más de lo que decía la sección 4 (~250 KB). Ver «visor del modelo del alumno» abajo. |
| Mermaid (diagramas) | 5,253 KB | 1,483 KB | No: 1.5 MB para dibujar cajas y flechas. |

Para comparar: toda la portada de Amatista (JavaScript) pesa 128 KB comprimida.

### Lo que no existía y se creó

Para enseñar Blender en el navegador faltaban dos cosas que ninguna librería cubre bien: ver y tocar una malla como en el Modo Edición, y leer un árbol de nodos como el del editor de shaders. Las dos son bloques nuevos de lección, en SVG propio, cargados solo en las lecciones que los usan (`lazy()` en `BloqueContenido.jsx`; el service worker los guarda igual, así que funcionan sin conexión).

| Herramienta | Bloque | Peso (gzip) | Qué hace |
|---|---|---:|---|
| **Visor de malla** (`leccion/VisorMalla.jsx`, `graficas/malla.js`) | `mesh_viewer` | 5.3 KB | Malla low poly que se gira arrastrando (o con flechas) y se selecciona por vértices, aristas o caras con 1, 2 y 3, como en Blender. Sólido o alambre (Z), rejilla del suelo, gizmo de ejes con los colores de Blender y el panel «Estadísticas» (vértices, aristas, caras y triángulos con las mismas cuentas que Blender: el cubo 8/12/6, la esfera UV 32×16 482/992/512). Primitivas: `cube`, `plane`, `cylinder`, `cone`, `uv_sphere`, `ico_sphere`, `torus` o `custom` (hasta 400 vértices y 600 caras). Sin WebGL: algoritmo del pintor y luz plana; se dibuja una vez por cuadro como máximo mientras se arrastra. |
| **Diagrama de nodos** (`leccion/DiagramaNodos.jsx`, `graficas/nodos.js`) | `node_graph` | 2.9 KB | Árbol de nodos con los colores de encabezado y de conector de Blender (color amarillo, shader verde, vector morado…), acomodado solo en columnas según los enlaces. Al tocar un nodo se ilumina su camino y se lee su nota; «Recorrer el flujo» lo explica nodo por nodo de las entradas a la salida. En el teléfono el lienzo se desplaza de lado en vez de achicar el texto. |
| **Imagen ligera** (`components/ImagenLigera.jsx`) | (la usan `image`, `compare`, `step_by_step` y «Así se debe ver») | < 1 KB | Guarda el espacio de la imagen desde el inicio (la página no salta), muestra un relleno facetado mientras carga, aparece con un fundido y, si falla sin conexión, lo dice con «Reintentar». Con «Ahorro de datos» activo no descarga la imagen hasta que el alumno toca «Ver imagen». |

Ya se usan en el curso: `mesh_viewer` en «Objeto o Edición» (Blender Principiante, módulo 2) y `node_graph` en «Tres controles del Principled BSDF» (Principiante-Intermedio, módulo 1). Los campos y ejemplos están en [04 Herramientas de enseñanza](04_herramientas_de_ensenanza.md).

### Visor del modelo del alumno (T-071), revisado

`<model-viewer>` pesa 301 KB comprimido, más que toda la portada. El visor de malla abre otro camino: que el add-on mande la malla del alumno simplificada (vértices y caras, menos de 600 caras) como JSON y la plataforma la muestre con `mesh_viewer` (`shape: "custom"`). Pesaría unos KB en vez de 300 y funcionaría en los equipos más modestos; a cambio, sin texturas ni materiales. Queda como decisión: `<model-viewer>` para ver el modelo con materiales, o el visor de malla para verlo en cualquier equipo.

### Revisado y sin cambio

- **View Transitions** (T-072): sigue recomendada, 0 KB. Chrome y Safari la tienen; donde falta, la página cambia como hoy (la app ya tiene su fundido `animar-pagina`).
- **Fuentes**: los alfabetos que no usamos (cirílico, griego, vietnamita) ya no se precachean y el navegador no los descarga.

## 9. Diseño CSS v3.6

Misma identidad (paleta, cortes en diagonal, hexágonos, mundos y mascotas): la investigación no dio ninguna razón para cambiarla. Lo nuevo está en `frontend/src/index.css` y va a las condiciones difíciles:

- **Fichas de diseño** (`:root`): `--fondo`, `--superficie`, `--borde`, `--texto-suave`, `--amatista`, `--neon`, `--blender`, `--corte`, curvas y sombra. Las piezas nuevas las usan en vez de colores sueltos.
- **El texto no salta al llegar la fuente**: fuentes de respaldo «Outfit respaldo» y «JetBrains Mono respaldo» (Arial y Courier New del sistema) ajustadas con `size-adjust` y `ascent-override` a las medidas de nuestras fuentes, sacadas de los woff2 con fontTools. En una red lenta, la página se lee de inmediato y no cambia de largo cuando la fuente termina de bajar.
- **Lectura**: títulos con `text-wrap: balance` y párrafos con `pretty` (sin palabras huérfanas); `scrollbar-gutter: stable` (la barra no empuja la página); `touch-action: manipulation` en botones y enlaces (sin la espera del doble toque en teléfonos viejos).
- **Esqueleto facetado** (`.esqueleto`): relleno low poly con un destello mientras algo carga; lo usan la imagen ligera y los bloques diferidos.
- **Pantallas con poco contraste** (`prefers-contrast: more`): sol directo o pantallas baratas; los textos tenues y los bordes suben de opacidad y se quitan las partículas.
- **Alto contraste de Windows** (`forced-colors`): se quitan los cortes en diagonal, que ocultarían los bordes del sistema.
- **Imprimir una lección**: papel blanco, texto negro, sin fondos, mascota, barra ni botones de herramientas, con la dirección de los enlaces escrita. Sirve para estudiar sin pantalla ni conexión.
- **Modo ligero y movimiento reducido** también apagan los destellos del esqueleto y el flujo animado de los cables del diagrama.
