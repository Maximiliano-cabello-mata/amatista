# Sistema de diseño «Facetas» (CSS v4.0) · plan

Pedido de Maximiliano (11 oct 2026, 05:28 UTC): «reorganiza los recursos de la plataforma, que evolucione a una organización a nivel de páginas empresariales, un diseño CSS mejorado en general y que nuestro tema low poly brille; organízalo todo de una manera planificada, meticulosamente planeada».

Se mantiene lo que ya funciona: la paleta (fondo `#121212`, amatista `#9B59B6`, neón `#00E5FF`, Blender `#F5792A`), las fuentes Outfit y JetBrains Mono, las esquinas cortadas (`corte-poly`) y los mundos de cada módulo. Lo que cambia es **el orden**: hoy cada página arma su propio contenedor, su encabezado, su enlace de regreso y sus títulos de sección, con cinco anchos distintos y un pie de página que solo existe en la portada.

## 1. Principios

1. **Una sola anatomía de página.** Todas las páginas tienen las mismas piezas en el mismo orden; cambia el contenido, no la estructura.
2. **Saber siempre dónde estás.** Migas de pan en cada página interior y la pestaña activa en la barra.
3. **El low poly es la marca, no el adorno.** Facetas en los encabezados, bordes de gema en lo importante y un brillo que cruza una vez; nada que distraiga al leer.
4. **Ligero primero.** Solo `transform` y `opacity` en las animaciones; todo se apaga en modo ligero (`html.ligero`) y con movimiento reducido. Sin librerías nuevas.
5. **Accesible.** Contraste AA, foco visible, `aria-current` en migas y barra, todo usable con teclado y a 390 px.

## 2. Anatomía de una página

```
┌ Barra superior (fija) ── Cursos · Blender · Mi panel · Admin ── ? · XP · conexión · cuenta ┐
│ Franja de vista (solo equipo)                                                               │
├ <main> ─────────────────────────────────────────────────────────────────────────────────────┤
│  Migas: Inicio ◆ Cursos ◆ Blender                                                            │
│  ┌ Encabezado de página (facetas + borde de gema) ─────────────────────────────────────────┐ │
│  │ [hexágono con ícono]  ANTETÍTULO · Título · descripción · chips de estado    [acciones] │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘ │
│  Secciones: ◆ TÍTULO DE SECCIÓN (antetítulo mono + h2) → contenido                           │
├ Pie de página global ── Aprender · Blender · Tu cuenta · Ayuda ── versión y estado ──────────┤
```

## 3. Anchos (de cinco a cuatro, con nombre)

| Nombre | Clase | Para |
|---|---|---|
| `estrecho` | `max-w-md` | Entrar, crear cuenta, confirmar, recuperar, vincular. |
| `lectura` | `max-w-3xl` | Lección y perfil: texto largo, línea cómoda. |
| `contenido` | `max-w-5xl` | Curso, Blender y Ayuda. |
| `amplio` | `max-w-6xl` | Inicio y Mi panel. Admin usa `max-w-7xl` por sus tablas (`admin`). |

## 4. Mapa de páginas

| Página | Ruta | Ancho | Migas | Encabezado |
|---|---|---|---|---|
| Inicio | `#/` | amplio | — | Héroe propio (es la portada). |
| Curso | `#/curso/…` | contenido | Inicio ◆ Cursos ◆ *curso* | Logo del curso, avance y ▶ Continuar. |
| Lección | `#/curso/…/leccion/…` | lectura | Cursos ◆ *curso* ◆ Módulo N | El del mundo del módulo (no cambia). |
| Blender | `#/blender` | contenido | Inicio ◆ Blender | Estado del enlace como chips. |
| Mi panel | `#/panel` | amplio | Inicio ◆ Mi panel | El de nivel y racha (no cambia). |
| Ayuda | `#/guia` | contenido | Inicio ◆ Ayuda | Con «Empezar el recorrido». |
| Perfil | `#/perfil` | lectura | Inicio ◆ Mi cuenta | Nombre y rol. |
| Admin | `#/admin/…` | admin | Admin ◆ *sección* | Sección y aviso de solo lectura. |
| Cuenta y vincular | `#/entrar`… | estrecho | — | Formulario (no cambia). |

## 5. Recursos de la interfaz (dónde vive cada cosa)

Nueva carpeta `frontend/src/components/estructura/` para las piezas comunes de todas las páginas:

| Pieza | Qué hace |
|---|---|
| `Pagina.jsx` | `<main>` con el ancho y los márgenes de su tipo; dibuja las migas y el encabezado. |
| `EncabezadoPagina.jsx` | Encabezado facetado: ícono en hexágono, antetítulo, título, descripción, chips y acciones; tono amatista, neón o Blender. |
| `Migas.jsx` | Migas de pan con `aria-current="page"` en la última. |
| `TituloSeccion.jsx` | Antetítulo mono con un rombo + `h2`, con acción opcional a la derecha. |
| `PiePagina.jsx` | Pie global en cuatro columnas, con la versión del add-on y el estado de conexión. |

Las piezas propias de un área se quedan en su carpeta (`panel/`, `blender/`, `admin/`, `leccion/`, `temas/`, `graficas/`). El pie de la portada sale de `Inicio.jsx` y pasa a ser el global.

## 6. CSS «Facetas» (v4.0)

En `index.css`, sección propia y con fichas en `:root`:

- **Fichas nuevas**: `--gema` (degradado amatista → neón → Blender), `--gema-suave`, `--faceta-luz`, `--sombra-gema` y la escala de espacios de sección (`--espacio-seccion`).
- **`.encabezado-faceta`**: borde de gema de 1.5 px, fondo con facetas (SVG en línea, dibujado una vez por tono), luz en la esquina superior derecha y un **brillo que cruza una sola vez** al entrar.
- **`.borde-gema`**: borde degradado para lo destacado (la tarjeta de la fusión, la invitación al recorrido, el siguiente paso).
- **`.titulo-seccion`**: rombo neón antes del antetítulo y una línea facetada que se desvanece.
- **`.migas`**: separador ◆, recorte con «…» en pantallas estrechas.
- **`.pie-pagina`**: borde superior facetado (una fila de triángulos en SVG) y columnas.
- **Fondo que brilla**: el fondo low poly gana aristas de luz muy tenues cerca de la luz y unos pocos destellos que titilan (opacidad), apagados en modo ligero y con movimiento reducido.
- **Escala tipográfica fija**: h1 de página `text-3xl sm:text-4xl`, h2 de sección `text-2xl`, h3 `text-lg`; antetítulos siempre mono, mayúsculas y `tracking-[0.3em]`.

## 7. Orden de trabajo

1. Fichas y CSS «Facetas».
2. `components/estructura/` con sus cinco piezas.
3. Pie global en `App.jsx`; la portada pierde el suyo.
4. Páginas, una por una: Blender, Ayuda, Perfil, Curso, Mi panel, Lección (migas), Admin, Inicio (títulos de sección).
5. Fondo con aristas y destellos.
6. Comprobación: lint, vitest, build, recorrido de todas las páginas y las 48 lecciones a 390 y 1280 px sin desbordes ni errores, recorrido guiado completo, capturas antes y después.

## 8. Aceptación

- Todas las páginas interiores tienen migas, el mismo encabezado y el pie global.
- Ningún `<main>` arma su ancho a mano fuera de `Pagina.jsx` (salvo la lección, que conserva su mundo).
- Cero desbordes a 390 px, cero errores de consola, build sin avisos.
- Modo ligero y movimiento reducido: sin animaciones nuevas.
