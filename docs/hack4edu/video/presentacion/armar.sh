#!/usr/bin/env bash
# Arma la presentación de Hack4Edu (4:20) de punta a punta:
#   0. (una vez) tomas suavizadas y capturas del add-on       suavizar.sh, grabar_addon.py (ver README)
#   1. cuadros 1920×1080 a 30 fps de frontend/presentacion   ../pelicula/render.cjs (servidor de desarrollo en :5173)
#   2. voz seguida (sin pausas) con los empalmes reparados    voz.py
#   3. música y diseño sonoro con la misma línea de tiempo     musica.py
#   4. mezcla: música bajo la voz (sidechain) y −16 LUFS       ffmpeg
#   5. video final y versión solo voz                           salida/
#
# Uso:  bash docs/hack4edu/video/presentacion/armar.sh
# Requiere frontend/presentacion/media/ (fotos, capturas y voz_mejorada.wav; no se versiona) y
# frontend/pelicula/media/ (metraje), Node 20+, Playwright con Chromium, Python 3 con numpy, ffmpeg.
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$AQUI/../../../.." && pwd)"
SALIDA="$AQUI/salida"
CUADROS="$SALIDA/cuadros"
URL='http://127.0.0.1:5173/presentacion/?render'
export NO_PROXY="127.0.0.1,localhost${NO_PROXY:+,$NO_PROXY}"
mkdir -p "$SALIDA"

esperar() { for _ in $(seq 1 60); do curl -s -o /dev/null --noproxy '*' "$1" && return 0; sleep 1; done; echo "No responde $1" >&2; exit 1; }

cd "$RAIZ/frontend"
npx vite --port 5173 --strictPort >/dev/null 2>&1 & DEV=$!
trap 'kill $DEV 2>/dev/null || true' EXIT
esperar http://127.0.0.1:5173/presentacion/
rm -rf "$CUADROS"
# Tres tramos en paralelo: cada cuadro es una función pura del tiempo, el orden no importa.
for tramo in "0 87" "87 174" "174 260"; do
  set -- $tramo
  node "$AQUI/../pelicula/render.cjs" --url "$URL" --salida "$CUADROS" --desde "$1" --hasta "$2" & 
done
wait

python3 "$AQUI/voz.py" "$RAIZ/frontend/presentacion/media/voz_mejorada.wav" "$SALIDA/voz.wav"
python3 "$AQUI/musica.py" "$SALIDA/musica.wav"
# La música sube 4 dB en el prólogo y en la tarjeta final, donde no hay voz.
VOL="volume='0.32*if(lt(t,20.1)+gt(t,253.8),1.6,1)':eval=frame"
MEZCLA="[0]aresample=48000,pan=stereo|c0=c0|c1=c0,asplit=2[v][key];[1]aresample=48000,$VOL[m];\
[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=40:release=900:knee=4[md];[v][md]amix=inputs=2:normalize=0[out]"
ffmpeg -y -loglevel error -i "$SALIDA/voz.wav" -i "$SALIDA/musica.wav" -filter_complex "$MEZCLA" -map '[out]' "$SALIDA/mezcla_cruda.wav"
MEDIDA=$(ffmpeg -i "$SALIDA/mezcla_cruda.wav" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p' \
  | python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
ffmpeg -y -loglevel error -i "$SALIDA/mezcla_cruda.wav" -af "loudnorm=I=-16:TP=-1.5:LRA=11:linear=true:$MEDIDA" -ar 48000 "$SALIDA/mezcla.wav"
ffmpeg -y -loglevel error -i "$SALIDA/voz.wav" -af 'pan=stereo|c0=c0|c1=c0' -ar 48000 "$SALIDA/solo_voz.wav"

for VERSION in mezcla solo_voz; do
  ffmpeg -y -loglevel error -framerate 30 -i "$CUADROS/%06d.jpg" -i "$SALIDA/$VERSION.wav" \
    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart \
    "$SALIDA/amatista_hack4edu_presentacion_${VERSION}.mp4"
done
echo "Listo: $SALIDA/amatista_hack4edu_presentacion_mezcla.mp4 (y _solo_voz.mp4)"
