# Kit del video de Hack4Edu

> **El video para presentar es la película** ([pelicula/](pelicula/README.md)): 4:14, con una historia (Valeria y los tres muros), la plataforma real grabada, Geoda como proyecto hermano y música de prueba. Lo de esta página es el primer corte (2:09) y el material suelto: escenas, capturas y fotogramas, útiles para el pitch.

Todo lo necesario para el video de la plataforma: guion, escenas gráficas con la identidad de Amatista, capturas reales de la PWA y un script que monta el primer corte.

| Carpeta o archivo | Qué hay |
|---|---|
| [GUION.md](GUION.md) | Guion de 2:09 con voz en off, tiempos, de dónde sale cada cifra y avisos honestos |
| `escenas/index.html` | Las 9 escenas gráficas animadas (1920×1080): título, problema, solución, Blender conectado, G7B, Geoda, ciclo, evidencia y cierre. Se abren en el navegador con `?e=1` … `?e=9&play` |
| `fotogramas/e1.jpg` … `e9.jpg` | Cada escena como imagen fija, lista para Canva, Visme, PowerPoint o DaVinci (sirven también como diapositivas del pitch) |
| `capturas/` | La PWA real en escritorio (1920×1080) y celular (390×844), con un alumno de demostración |
| `generar.cjs` | Regenera todo lo anterior y monta `salida/amatista_hack4edu_borrador.mp4` |
| `salida/` | Los clips y el video montado. **No se sube a Git** (pesa unos 35 MB): se regenera |

## Regenerar

```bash
cd frontend && npm ci && npm run build && npx vite preview --port 4173 &   # la PWA real
cd ..
npm i -g playwright && npx playwright install chromium                   # si no está instalado
NODE_PATH="$(npm root -g)" node docs/hack4edu/video/generar.cjs                    # todo (≈ 4 min)
NODE_PATH="$(npm root -g)" node docs/hack4edu/video/generar.cjs --solo-fotogramas  # solo las 9 imágenes
```

Necesita `ffmpeg`. Las fuentes (Outfit y JetBrains Mono, SIL OFL 1.1) y los logos están en `escenas/`, así que el resultado es igual en cualquier computadora.

## Editar

- **Un texto o una cifra:** se cambia en `escenas/index.html` y se vuelve a generar.
- **El orden o la duración:** se cambia la lista `PARTES` de `generar.cjs`.
- **Rótulos de los clips de la PWA:** el campo `texto` de cada parte `pwa` en `PARTES`.
- **Para un montaje fino** (voz, música, transiciones), conviene llevar los clips de `salida/clips/` y los fotogramas a DaVinci Resolve, Canva o Visme. Visme viene en el GitHub Student Developer Pack.
