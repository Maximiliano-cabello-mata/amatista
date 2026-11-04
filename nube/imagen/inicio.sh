#!/bin/sh
# Arranque de una sesión de Amatista Cloud: escritorio KasmVNC en :1 (puerto 6901) y Blender.
#
# La sesión termina sola, y el contenedor con ella, cuando:
#   - nadie está conectado durante AMATISTA_INACTIVIDAD_S segundos (900 = 15 min), o
#   - el nodo la cierra al vencer la hora del token.
set -eu
RES="${AMATISTA_RESOLUCION:-1600x900}"
mkdir -p "$HOME/Proyectos" /tmp/.X11-unix 2>/dev/null || true

# KasmVNC sin contraseña propia: solo lo alcanza el proxy del nodo, que exige el token de la sesión.
# -publicIP fijo: la sesión no tiene internet y KasmVNC se cierra si no puede preguntar su IP (STUN).
# Calidad dinámica (JPEG/WebP 4-8), 24 cuadros por segundo como máximo y video a 1280x720 cuando
# media pantalla cambia (girar la vista): menos ancho de banda y menos CPU para comprimir.
Xvnc :1 -geometry "$RES" -depth 24 -interface 0.0.0.0 -websocketPort 6901 \
  -DisableBasicAuth -SecurityTypes None -sslOnly 0 -httpd /usr/share/kasmvnc/www -AlwaysShared \
  -publicIP 127.0.0.1 \
  -FrameRate "${AMATISTA_FPS:-24}" -RectThreads 1 -DynamicQualityMin 4 -DynamicQualityMax 8 \
  -VideoArea 45 -VideoTime 2 -MaxVideoResolution 1280x720 \
  -DLP_ClipDelay 0 -DLP_ClipSendMax 65536 -DLP_ClipAcceptMax 65536 \
  -MaxDisconnectionTime "${AMATISTA_INACTIVIDAD_S:-900}" -Log '*:stderr:0' &
XVNC=$!
for _ in $(seq 1 50); do [ -e /tmp/.X11-unix/X1 ] && break; sleep 0.1; done

openbox >/dev/null 2>&1 &
cd "$HOME/Proyectos"
# Blender vuelve a abrir si el alumno lo cierra, mientras la sesión siga viva.
(
  while kill -0 "$XVNC" 2>/dev/null; do
    blender --python /opt/amatista/amatista_nube.py >/tmp/blender.log 2>&1 || true
    sleep 1
  done
) &

# Cuando Xvnc termina (inactividad), termina la sesión.
wait "$XVNC" || true
