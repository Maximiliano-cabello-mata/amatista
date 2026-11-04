#!/usr/bin/env bash
# Arma la película de Hack4Edu de punta a punta:
#   1. metraje real de la PWA (frontend/pelicula/media)      metraje.cjs   (PWA servida en :4173)
#   2. la película cuadro por cuadro (frontend/pelicula)      render.cjs    (servidor de desarrollo en :5173)
#   3. la música sintetizada con los tiempos de cada escena   musica.py
#   4. el video final con ffmpeg                              salida/amatista_hack4edu_pelicula.mp4
#
# Uso:  bash docs/hack4edu/video/pelicula/armar.sh [--sin-metraje]
# Requiere: Node 20+, Playwright con Chromium, Python 3 con numpy, ffmpeg.
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$AQUI/../../../.." && pwd)"
SALIDA="$AQUI/salida"
CUADROS="$SALIDA/cuadros"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
export NO_PROXY="127.0.0.1,localhost${NO_PROXY:+,$NO_PROXY}"
mkdir -p "$SALIDA"

esperar() { for _ in $(seq 1 60); do curl -s -o /dev/null --noproxy '*' "$1" && return 0; sleep 1; done; echo "No responde $1" >&2; exit 1; }

cd "$RAIZ/frontend"
if [[ "${1:-}" != "--sin-metraje" ]]; then
  npm run build >/dev/null
  npx vite preview --port 4173 --strictPort >/dev/null 2>&1 & PREVIA=$!
  esperar http://127.0.0.1:4173/
  node "$AQUI/metraje.cjs" --pwa http://127.0.0.1:4173/
  kill "$PREVIA"
fi

npx vite --port 5173 --strictPort >/dev/null 2>&1 & DEV=$!
trap 'kill $DEV 2>/dev/null || true' EXIT
esperar http://127.0.0.1:5173/pelicula/
rm -rf "$CUADROS"
node "$AQUI/render.cjs" --salida "$CUADROS"

python3 "$AQUI/musica.py" "$CUADROS/linea.json" "$SALIDA/musica.wav"
ffmpeg -y -loglevel error -framerate 30 -i "$CUADROS/%06d.jpg" -i "$SALIDA/musica.wav" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart \
  "$SALIDA/amatista_hack4edu_pelicula.mp4"
echo "Listo: $SALIDA/amatista_hack4edu_pelicula.mp4"
