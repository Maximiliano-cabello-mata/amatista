# Película de Hack4Edu (solo desarrollo)

Página de React que dibuja la película del video de Hack4Edu con los componentes gráficos reales de Amatista. Se sirve con el servidor de desarrollo (`npx vite`, en `/pelicula/`); `npm run build` no la incluye, porque solo construye `index.html`.

- `linea.js`: escenas, duración y transiciones.
- `escenas.jsx`: las 16 escenas (cada una recibe `t`, sus segundos).
- `piezas.jsx`: texto cinético, metraje, laptop, gema, geoda, barrido de facetas, iconos.
- `Pelicula.jsx`: el montaje.
- `main.jsx` y `Reproductor.jsx`: la vista previa y `window.__pelicula.ir(t)` para el renderizador.
- `media/`: metraje real grabado (ignorado por Git).

Cómo grabar, renderizar y montar: [docs/hack4edu/video/pelicula/](../../docs/hack4edu/video/pelicula/README.md).
