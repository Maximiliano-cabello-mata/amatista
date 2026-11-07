#!/usr/bin/env bash
# suavizar.sh <toma>: quita cuadros repetidos e interpola el movimiento a 30 fps → <toma>_s/
set -e
M="$(cd "$(dirname "$0")/../../../.." && pwd)/frontend/pelicula/media"
T=$1; O=$M/${T}_s
rm -rf $O; mkdir -p $O
ffmpeg -loglevel error -framerate 30 -i $M/$T/%05d.jpg -vf "mpdecimate=hi=200:lo=100:frac=0.1,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale=1440:-2" -q:v 3 $O/%05d.jpg
N=$(ls $O/*.jpg | wc -l)
echo "{\"toma\": \"${T}_s\", \"cuadros\": $N, \"suavizada\": true}" > $O/toma.json
echo "$T → $N cuadros"
