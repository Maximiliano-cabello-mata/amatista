> **ESTADO: PROPUESTA TÉCNICA (NO INCLUIDA EN LA VERSIÓN FINAL).**
> La opción de sesiones en la nube fue retirada de la interfaz y de las rutas activas de producción para enfocar Amatista al 100 % en ejecución local, offline-first y adaptación de hardware con Geoda. Consulta el documento consolidado en [`docs/propuestas/2026-11-05_propuesta_amatista_cloud.md`](../propuestas/2026-11-05_propuesta_amatista_cloud.md).

# Amatista Cloud

Amatista Cloud presta **una hora de Blender en un equipo mejor** a cada alumno de la UTN, desde el navegador y sin instalar nada. Las sesiones corren en dos lugares:
- la nube de Oracle;
- las computadoras del equipo que ejecutan un programa pequeño, el **nodo**.

La API de Amatista coordina quién entra, dónde y por cuánto tiempo.

- **Instrucciones paso a paso por dispositivo:** [INSTRUCCIONES.md](INSTRUCCIONES.md)
- **Código:**
  - `backend/api/nube.py`: el coordinador.
  - `nube/nodo/amatista_nodo.py`: el nodo.
  - `nube/imagen/`: la sesión con Blender.
  - `frontend/src/pages/Nube.jsx`: la página `#/nube`.
- **Base de datos:** `backend/sql/014_nube.sql` crea la tabla `NUBE_SESIONES`.

## 1. Cómo funciona

```
 Alumno (navegador)                 API de Amatista (Oracle VM)            Nodo (Oracle VM o PC local)
 ──────────────────                 ───────────────────────────            ───────────────────────────
 #/nube → «Abrir mi Blender» ──────► ¿cuenta @utn.mx confirmada?
                                     ¿sin sesión abierta? ¿cuota del día?
                                     elige el nodo con más lugar
                                     guarda NUBE_SESIONES (hash del token)
           ◄── token de 60 min ───── (el token solo se muestra esta vez)
                                                          ◄──── latido cada 3–5 s (el nodo llama;
                                     «abre nube-…» + hash del token ──►     no se abren puertos)
                                                                            docker run (aislado)
                                     ◄──────────────────────────── «lista»
 «Entrar a Blender»: formulario POST con el token ───────────────────────► /entrar → cookie de la sesión
 Blender en el navegador (KasmVNC, WebSocket) ◄══════ túnel de Cloudflare ══ proxy del nodo ⇄ contenedor
```

- **El token** es de una sola sesión y vale **60 minutos**, nunca menos (`AMATISTA_NUBE_MINUTOS`, mínimo 60).
  - La API guarda solo su SHA-256; el nodo también.
  - El token viaja en el cuerpo de un formulario, no en la URL, y el nodo lo cambia por una cookie `HttpOnly` limitada a `/s/<sesión>/`.
  - Desde otro dispositivo se pide un token nuevo y el anterior deja de servir.
- **Los nodos** se anuncian solos. Su estado vive en la memoria de la API, que corre en un solo proceso de uvicorn; si la API se reinicia, los nodos se vuelven a anunciar en segundos.
- **Al vencer la hora**, la sesión se cierra sola. También se cierra si nadie se conecta durante 15 minutos o si el alumno la termina. Al cerrarse, el contenedor y su carpeta se borran.

## 2. Investigación: qué recursos hay de verdad

| Recurso | Lo que hay | Fuente |
|---|---|---|
| **Oracle Always Free, Ampere A1** | **2 OCPU y 12 GB** desde mediados de 2026. Antes eran 4 OCPU y 24 GB. Oracle lo cambió en su documentación sin anuncio; las fechas que circulan (15 de junio y 18 de agosto) no están confirmadas | [Linuxiac](https://linuxiac.com/oracle-quietly-cuts-free-tier-ampere-a1-resources-in-half/), [heise](https://www.heise.de/en/news/Oracle-halves-free-cloud-resources-11334516.html), [InfoQ](https://www.infoq.com/news/2026/07/oracle-cloud-free-tier-limits/), [Hacker News](https://news.ycombinator.com/item?id=49183750) |
| Almacenamiento de bloques Always Free | 200 GB en total, incluidos los discos de arranque | [fullmetalbrackets](https://fullmetalbrackets.com/blog/oci-free-tier-breakdown) |
| **Tu PC local** | Intel Core i3 de 10.ª generación (4 núcleos, 8 hilos), 40 GB de RAM, sin tarjeta gráfica | Dato tuyo |
| Blender para Linux ARM64 | blender.org no lo publica. Ubuntu 24.04 trae **Blender 4.0.2** en x86_64 y ARM64 (Debian 13: 4.3.2) | [BlenderKit](https://www.blenderkit.com/articles/blenderkit-on-arm64-linux/), [Debian](https://packages.debian.org/trixie/blender) |
| Blender sin tarjeta gráfica | Mesa **llvmpipe** dibuja OpenGL 4.3 o más con el procesador, que es lo que pide Blender 4 | [Phoronix](https://www.phoronix.com/news/OpenGL-4.3-LLVMpipe) |
| Escritorio en el navegador | **KasmVNC 1.4**: paquetes para Ubuntu 24.04 en amd64 y arm64, WebP/JPEG con calidad dinámica y modo video | [KasmVNC](https://kasm.com/kasmvnc/docs/latest/install.html) |

**Conclusión:**
- La RAM sobra.
- **El procesador es el límite**, porque sin tarjeta gráfica la vista 3D la dibuja la CPU.
- Por eso la sesión usa el perfil «mínimo» de Geoda: vista sólida, sin suavizado, subdivisión 1 y texturas de 1K.

## 3. Mediciones reales

Medido en este repositorio con la imagen `amatista-nube-sesion:1`, en un contenedor x86_64 de 4 núcleos sin GPU, con 2 hilos de llvmpipe por sesión:

| Qué | Resultado |
|---|--:|
| Imagen de la sesión (Ubuntu 24.04 + Blender 4.0.2 + KasmVNC 1.4) | 1.66 GB (una vez por nodo) |
| De pedir la sesión a tenerla lista | **3 s** |
| RAM de una sesión con Blender abierto | **≈ 535 MB** (4 sesiones: 2.1 GB) |
| CPU de una sesión quieta | 1–2 % de un núcleo |
| CPU girando la vista sin parar | ≈ 0.55 núcleos |
| Ancho de banda girando la vista sin parar (1600×900) | ≈ 4.2 Mbit/s; quieta, casi 0 |
| Render 1280×720, EEVEE, 32 muestras (cubo inicial) | 9.3 s |
| Render 1280×720, Cycles, 32 muestras (CPU, 2 hilos) | 5.5 s |
| Render 1280×720, Workbench | 0.8 s |

## 4. Dimensionamiento: al menos 5 sesiones

`amatista_nodo.py diagnostico` hace esta cuenta en cada máquina. El perfil **equilibrado** da un núcleo físico por alumno; el **denso**, medio núcleo.

| Equipo | Equilibrado | Denso | Notas |
|---|--:|--:|---|
| **PC local** (i3-10.ª, 8 hilos, WSL2 con 32 GB) | **4** (un núcleo con sus 2 hilos, fijado con `--cpuset-cpus`) | 8 | Cada sesión con 3 GB de techo |
| **Oracle A1 2 OCPU / 12 GB** (con la API corriendo) | **1** (reserva 0.5 OCPU y 2.5 GB) | 2 | Si tu cuenta conserva 4 OCPU / 24 GB: 3 y 6 |
| **Total** | **5** | **10** | Los 5 se cumplen en equilibrado |

**Ancho de banda de subida en tu casa:** 5 alumnos girando la vista a la vez son unos 20 Mbit/s en el peor caso. Modelando normal, la imagen casi no cambia y bajan a 1–2 Mbit/s cada uno.

**Optimización aplicada:**
- **Sesión:**
  - llvmpipe con 2 hilos;
  - vista sólida sin suavizado ni filtrado anisotrópico;
  - texturas de 1K como máximo;
  - simplificar subdivisión a 1;
  - 24 deshacer;
  - autoguardado comprimido.
- **Video:**
  - KasmVNC a 24 cuadros por segundo como máximo;
  - calidad dinámica de 4 a 8;
  - pasa a «modo video» a 1280×720 cuando cambia media pantalla (girar la vista);
  - un hilo de compresión por sesión.
- **Nodo:**
  - un núcleo físico por sesión (no se roban caché entre ellas);
  - cuotas duras de CPU y memoria;
  - las sesiones inactivas se cierran a los 15 minutos para liberar el lugar.
- **API:**
  - el estado de los nodos vive en memoria;
  - Oracle solo se toca al abrir, cerrar o vencer una sesión;
  - unos 250 bytes por sesión.

## 5. Seguridad: que no sea una granja de render

| Capa | Qué hace |
|---|---|
| **Quién entra** | Solo cuentas con correo de la UTN (`AMATISTA_NUBE_DOMINIOS=utn.mx`, también sus subdominios) **y correo confirmado**. Los administradores entran para probar |
| **Cuánto** | Una sesión viva por cuenta, 2 sesiones al día (`AMATISTA_NUBE_POR_DIA`) y 6 pedidos por hora como máximo. El token y la sesión vencen a los 60 minutos |
| **El token** | Uno por sesión, de 256 bits, guardado solo como hash. Se compara en tiempo constante y se cambia por una cookie `HttpOnly` y `Secure` limitada a la ruta de esa sesión. `/entrar` acepta 20 intentos por minuto por IP |
| **Los nodos** | Cada uno tiene su token (en la API solo su hash, en `AMATISTA_NUBE_NODOS`). La URL pública debe ser `https`. Un nodo no puede tocar sesiones de otro. Nadie entra a la red del nodo: el túnel sale de él |
| **El contenedor** | Red interna de Docker **sin internet ni DNS**; usuario sin privilegios (UID 1000); sistema de archivos de **solo lectura**; `--cap-drop ALL`; `no-new-privileges`; techo de CPU (`--cpus`); memoria sin swap; 256 procesos; `/home` y `/tmp` en memoria, con tamaño fijo. Comprobado: «Network is unreachable», `CapEff: 0`, `NoNewPrivs: 1`, `/usr` de solo lectura |
| **Blender** | Renders de 1280×720 y 32 muestras como máximo, con 2 hilos. Sin «Render Animation» en el menú ni en Ctrl+F12 |
| **Archivos** | Solo la carpeta Proyectos (1 GB) sale por «Mis archivos». Subidas de hasta 100 MB y solo tipos de 3D o imagen. Al terminar la sesión se borra todo |
| **Bitácora** | `NUBE_SESIONES` guarda quién, en qué nodo, cuándo y por qué terminó. En `#/nube`, el equipo ve los nodos y las sesiones vivas |

**Lo que no se puede impedir del todo:** dentro de su hora, alguien puede escribir Python en Blender y renderizar cuadro por cuadro. Lo que lo frena es lo de afuera:
- solo tiene una hora y 2 núcleos;
- no hay internet para sacar resultados en automático;
- solo puede descargar 1 GB;
- tiene 2 sesiones al día;
- y la bitácora muestra quién fue.

## 6. Pendientes

- **Probarlo en tus equipos.** Aquí se probó en x86_64; la imagen ARM64 se construye en la VM de Oracle con el mismo Dockerfile.
- **Cuentas `@utn.mx`:** confirma el dominio real de los correos de la UTN (por ejemplo `utn.mx` o `alumno.utn.mx`) y ajústalo en `AMATISTA_NUBE_DOMINIOS`.
- **El add-on de Amatista dentro de la sesión:** necesitaría salida solo a `api.amatista-3d.tech`, por un proxy con lista blanca. Hoy la sesión no tiene internet.
- **Cola de espera** cuando todos los lugares están ocupados. Hoy se responde «inténtalo en unos minutos».
