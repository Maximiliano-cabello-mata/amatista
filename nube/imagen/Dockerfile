# Imagen de una sesión de Amatista Cloud: Blender en un escritorio que se ve en el navegador.
#
#   - Ubuntu 24.04: trae Blender 4.0 igual en x86_64 (la PC local) y en ARM64 (Oracle Ampere A1),
#     porque blender.org no publica Blender para Linux ARM64.
#   - KasmVNC 1.4: el escritorio llega al navegador por WebSocket, con imágenes WebP/JPEG y
#     calidad dinámica. No hace falta instalar nada en la computadora del alumno.
#   - Sin tarjeta gráfica: Mesa llvmpipe dibuja OpenGL 4.5 con el procesador.
#
# Construir:  docker build -t amatista-nube-sesion:1 nube/imagen
FROM ubuntu:24.04

ARG KASMVNC=1.4.0
ARG TARGETARCH
ENV DEBIAN_FRONTEND=noninteractive LANG=C.UTF-8 LC_ALL=C.UTF-8

# paquetes/kasmvnc_<arq>.deb (opcional): si ya lo descargaste, se usa ese y no se baja de GitHub.
COPY paquetes/ /tmp/paquetes/
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates wget \
      blender openbox libgl1-mesa-dri mesa-utils x11-xserver-utils fonts-dejavu-core \
 && ARQ="${TARGETARCH:-$(dpkg --print-architecture)}" \
 && if [ -f "/tmp/paquetes/kasmvnc_${ARQ}.deb" ]; then cp "/tmp/paquetes/kasmvnc_${ARQ}.deb" /tmp/kasmvnc.deb; \
    else wget -q -O /tmp/kasmvnc.deb "https://github.com/kasmtech/KasmVNC/releases/download/v${KASMVNC}/kasmvncserver_noble_${KASMVNC}_${ARQ}.deb"; fi \
 && apt-get install -y --no-install-recommends /tmp/kasmvnc.deb \
 && rm -rf /tmp/kasmvnc.deb /tmp/paquetes \
 # Nada para salir a internet ni para abrir terminales: la sesión es solo Blender.
 && apt-get purge -y wget \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/* /usr/share/doc/* /usr/share/man/* \
 && (userdel -r ubuntu 2>/dev/null || true) \
 && useradd -m -u 1000 -s /usr/sbin/nologin alumno

COPY openbox-rc.xml /etc/xdg/openbox/rc.xml
COPY amatista_nube.py /opt/amatista/amatista_nube.py
COPY inicio.sh /opt/amatista/inicio.sh
RUN chmod 755 /opt/amatista/inicio.sh

# llvmpipe: cuántos hilos dibujan la vista 3D. El nodo lo ajusta según los núcleos de cada sesión.
ENV LP_NUM_THREADS=2 GALLIUM_DRIVER=llvmpipe MESA_GL_VERSION_OVERRIDE=4.5 MESA_GLSL_VERSION_OVERRIDE=450 \
    HOME=/home/alumno DISPLAY=:1 AMATISTA_MINUTOS=60

USER alumno
WORKDIR /home/alumno
EXPOSE 6901
ENTRYPOINT ["/opt/amatista/inicio.sh"]
