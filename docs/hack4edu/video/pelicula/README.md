# La película de Hack4Edu

El video para el jurado: **4:14** a 1920×1080 y 30 cuadros por segundo, con una historia, la plataforma real y música de prueba.

| Archivo | Qué es |
|---|---|
| [LOCUCION.md](LOCUCION.md) | La historia escena por escena, la locución sugerida para grabar y los avisos honestos |
| `../../../../frontend/pelicula/` | **La película misma:** una página de React que usa los componentes gráficos reales de Amatista (fondo low poly, escenarios, mascotas, jefes, avatares, el generador de mallas). Solo existe en desarrollo y no entra a la PWA |
| `metraje.cjs` | Graba la plataforma real con demostraciones de verdad: vence al jefe, corta la red y sigue, camina por los mundos 3D del Estudio |
| `render.cjs` | Renderiza la película cuadro por cuadro. Cada cuadro es una función del tiempo, así que el resultado es exacto y no salta |
| `musica.py` | Compone la música y los efectos con síntesis (numpy), siguiendo los tiempos de cada escena |
| `armar.sh` | Hace todo lo anterior y entrega `salida/amatista_hack4edu_pelicula.mp4` |
| `salida/` | Cuadros, música y video. **No se sube a Git:** se regenera |

## Verla mientras se edita

```bash
cd frontend && npx vite --port 5173
# abrir http://localhost:5173/pelicula/        (o …/pelicula/?t=150 para empezar en el segundo 150)
```

El metraje real (`frontend/pelicula/media/`) también se regenera y está en `.gitignore`. Si falta, las tomas salen en negro: primero corre `metraje.cjs` o `armar.sh`.

## Cambiar algo

- **Un texto, un tiempo dentro de una escena o un elemento:** `frontend/pelicula/escenas.jsx`.
- **El orden, la duración o la transición de las escenas:** `frontend/pelicula/linea.js`. La música se ajusta sola, porque lee los mismos tiempos.
- **Una toma de la plataforma:** el objeto `TOMAS` de `metraje.cjs`.
- **La música:** `musica.py`. Cada acto es una llamada (`acto_intimo`, `acto_ritmo`, `latidos`…).

## Requisitos

Node 20+, Playwright con Chromium, Python 3 con numpy y ffmpeg. El render completo tarda unos 15 minutos en un contenedor sin GPU.
