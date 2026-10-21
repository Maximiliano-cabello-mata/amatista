# 12 · Plataforma multiplataforma y accesible

21 de octubre de 2026 (T-116 a T-120). Reemplaza la organización «Cursos · Blender · Mi panel» del [doc 11](11_recorrido_y_fusion.md); lo demás de ese documento (recorrido, página Blender, «Conoce Amatista Motor») sigue vigente.

> «Blender no es el centro… vamos a hacer multiplataforma, vamos a enseñar A-Frame, estamos enseñando Blender, vamos a enseñar Maya, vamos a enseñar 3ds Max… ¿Por qué no ofrecer todo lo que tenemos desde un inicio de una forma muy accesible?» (Maximiliano, 21 oct 2026)

## Qué cambió

| Antes | Ahora |
|---|---|
| Barra **Cursos · Blender · Mi panel** (· Admin) | Barra **Inicio · Explorar · Mi panel** (· Admin) y una lupa que abre el buscador. Ningún programa tiene pestaña propia. |
| Los módulos solo se veían bajando por la página de cada curso | **Explorar** (`#/explorar`): todos los programas, módulos y lecciones en una sola página, con buscador y filtros. |
| La portada hablaba de Blender | Portada multiplataforma: «Aprende 3D creando, en el programa que elijas», un **mapa del contenido** (un mosaico por programa, buscador y disciplinas) y después los cursos. |
| A-Frame con 1 módulo | A-Frame con **5 módulos** y el **Estudio A-Frame** (`#/estudio`). |
| Mi panel con una sección «Blender» | Mi panel con **«Tu avance en cada programa»** y, dentro, «Prácticas en Blender». |

La página Blender (`#/blender`) sigue igual, pero ya no está en la barra: se llega desde el curso de Blender, desde Explorar › Herramientas y desde el pie («Amatista Motor para Blender»).

## Explorar (`#/explorar`)

- **Buscador** que encuentra programas, módulos y lecciones sin importar acentos ni mayúsculas. Muestra 12 lecciones y un botón «Ver las N».
- **Filtros** por programa (Blender, A-Frame) y por disciplina (modelado, diseño, render, animación, interacción, XR). Quedan en la dirección (`#/explorar?software=aframe&disciplina=xr&q=luz`), así un enlace o un profesor pueden mandar a una búsqueda exacta. La portada usa esos mismos enlaces.
- **Índice lateral** (fijo en escritorio, plegable en el teléfono) con cada programa y sus módulos; con varios niveles (Blender) muestra el nivel.
- **Tarjeta por módulo** con su mascota, sus disciplinas, sus lecciones a un clic (con candado si aún no se abren) y «Abrir el módulo», que lleva directo al módulo dentro del curso (`#/curso/<id>?modulo=N`).
- **Los siguientes programas**: Maya y 3ds Max aparecen como «Próximamente».
- **Herramientas**: Amatista Motor (Blender) y Estudio A-Frame.

Código: `frontend/src/pages/Explorar.jsx`; el índice es puro y tiene pruebas en `frontend/src/catalogo/indice.js`.

## Estudio A-Frame (`#/estudio`)

Un editor libre con la escena en vivo al lado: cinco plantillas (escena vacía, galería de modelos, sistema solar, botón que reacciona, bosque con niebla), seis piezas que se insertan en el cursor, la escena que se redibuja al dejar de escribir y **«Descargar página»**, que baja un `.html` listo para abrir o subir a cualquier hosting. Lo escrito se guarda en el navegador.

- El código nunca se ejecuta: la vista copia solo las etiquetas `<a-…>` (igual que en las lecciones).
- **Modelos propios** en `frontend/public/modelos/` (cristal, árbol y casa, low poly con caras planas, 5–6 KB cada uno). Los genera `npm run modelos` (`frontend/scripts/modelos.mjs`, sin dependencias) y entran en la caché de la PWA, así funcionan sin conexión. `<a-text>` sí descarga su letra de Internet.
- Código: `frontend/src/pages/Estudio.jsx`, `frontend/src/estudio/plantillas.js`.

## Curso de A-Frame: «Mundos 3D y WebXR en el navegador»

| Módulo | Insignia | Disciplinas | Mascota y jefe |
|---|---|---|---|
| 1 · La web en 3D | (la de siempre) | XR | (la de siempre) |
| 2 · Construye tu escena | Escenógrafo web | modelado, diseño | Taco · el Arquitecto Desordenado |
| 3 · Modelos GLB y texturas | Curador de modelos | modelado, diseño | Glib · el Coleccionista de Polígonos |
| 4 · Animación e interacción | Titiritero digital | animación, interacción | Muelle · el Titiritero de Hilos |
| 5 · Experiencias WebXR | Explorador XR | XR, interacción | Nébula · el Guardián del Horizonte |

Cada módulo nuevo tiene cinco lecciones: un gancho, una exploración, una práctica guiada, un **reto de código que se revisa solo** (una habitación, una galería con modelos, una puerta que se abre con un clic, un mundo WebXR completo) y el **jefe final** (examen, aprueba con 80). Cada lección termina con un enlace al Estudio. El módulo 3, «De tu programa 3D a la web», es el puente con Blender (y, después, con Maya y 3ds Max): exportar a glTF/GLB y cargarlo en A-Frame.

Las cuatro temáticas nuevas (maqueta, museo, feria, órbita) viven en `practices/blender/temas.json` como las demás, con sus sprites en la plataforma y en el add-on.

## Accesibilidad

- Enlace **«Saltar al contenido»** al principio de cada página (visible con el teclado) que lleva el foco al contenido.
- Los filtros son botones con `aria-pressed`; el número de resultados se anuncia (`aria-live`); el buscador es un `role="search"`.
- Las anclas (`modulo-…`, `software-…`) dejan espacio para la barra fija al saltar.
- Todo probado sin desbordes a 390 px y sin errores de consola en Inicio, Explorar, Estudio, curso, lección y Mi panel.
- Los enlaces dentro del texto de las lecciones (`[texto](#/ruta)`) solo aceptan rutas internas.

## Cómo se agrega un programa nuevo (por ejemplo, Maya)

1. En `frontend/src/data/software.js`, cambiar la entrada `maya` de `proximamente` a `disponible` y darle su `ruta` (id del curso) y, si tiene, su herramienta.
2. Crear el curso en `frontend/src/data/cursos.js` y sus módulos en `frontend/src/data/modulos/` (`python herramientas/contenido.py nuevo-modulo maya 1 "Título"` desde `backend/`), con `"disciplinas"` en cada módulo.
3. Si tiene logo, agregarlo a `LogoCurso`; si no, `LogoSoftware` dibuja el monograma en un hexágono.
4. Explorar, la portada, el pie y Mi panel lo recogen solos.
5. Para prácticas dentro del programa, el motor ya está casi listo: ver [lo que le falta al motor](../motor/2026-10-21_lo_que_le_falta_al_motor.md) §4 y T-121.
