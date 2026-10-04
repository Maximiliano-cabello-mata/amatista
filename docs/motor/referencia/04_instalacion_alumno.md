# 04 · Instalación para el alumno

## Lo que hace el alumno

1. Entra a Amatista › **Blender** (menú superior o la tarjeta «Prácticas en Blender» del panel).
2. La página detecta su sistema (Windows, macOS o Linux; en celular avisa que necesita una computadora) y ofrece **Descargar para …**. Si escribe su versión de Blender, la página le dice si es compatible (4.2 o más nuevo).
3. Descomprime el `.zip` y abre **Instalar Amatista** (`.bat` en Windows, `.command` en macOS, `instalar-amatista.sh` en Linux).
4. El instalador busca Blender, lo ejecuta sin ventana con `instalar_en_blender.py`, comprueba la versión, instala y activa la extensión, enciende **Permitir acceso en línea** y guarda las preferencias. Termina con «Listo».
5. Abre Blender, pulsa **N**, pestaña **Amatista**. Si descargó con su sesión abierta, ya está conectado; si no, pulsa **Vincular con mi cuenta** y escribe el código en la página que se abre (`#/vincular?codigo=…`).
6. En la lección «Práctica: construye una mesa» pulsa **Abrir en Blender**: la práctica aparece sola en Blender.

## Dónde busca Blender el instalador

| Sistema | Orden |
|---|---|
| Windows | `AMATISTA_BLENDER` → `Archivos de programa\Blender Foundation\Blender*` → Steam → `where blender` → pregunta la ruta (se puede arrastrar `blender.exe`) |
| macOS | `AMATISTA_BLENDER` → `/Applications/Blender.app` y `~/Applications` (las `Blender*.app`, la más nueva primero) → `PATH` → pregunta |
| Linux | `AMATISTA_BLENDER` → `PATH` → `/snap/bin/blender` → descargas sueltas de blender.org en `~/blender-*`, `~/Descargas/blender-*`, `~/Downloads/blender-*` y `/opt/blender*` (la más nueva) → Flatpak `org.blender.Blender`. Si no lo encuentra, no pregunta: termina e indica usar `AMATISTA_BLENDER=/ruta/a/blender bash instalar-amatista.sh` |

## Códigos de salida de `instalar_en_blender.py`

La última línea siempre es `AMATISTA_RESULTADO=<texto>`.

| Código | Significado | Qué ve el alumno |
|---|---|---|
| 0 | Instalado y activado | «Listo. Abre Blender.» |
| 3 | Blender anterior a 4.2 | Su versión, la mínima y el enlace de descarga. No se cambia nada. |
| 4 | Error al instalar | El error y las instrucciones para instalar a mano. |
| 9 | Error de Python dentro de Blender | Igual que 4. |

## El paquete

`GET /api/addon/v1/descargas/{windows|macos|linux}` arma al vuelo `Amatista-<versión>-<sistema>.zip` (con `addon/herramientas/construir.py` desde la terminal el nombre sale en minúsculas, `amatista-…`). Dentro, todo va en la carpeta `Amatista/`:

```
Amatista/
├─ Instalar Amatista.bat         (o .command / instalar-amatista.sh)
├─ instalar_en_blender.py
├─ amatista-0.3.0.zip            la extensión (add-on + motor + prácticas)
└─ LEEME.txt                     instalar, qué cambia, instalar a mano, desinstalar
```

Con sesión abierta, `config.json` dentro de la extensión trae un **vínculo de un solo uso pre-confirmado** (7 días). Al abrir Blender el add-on lo canjea por su propia sesión. Si alguien más usa ese paquete después, el vínculo ya está gastado y le pide un código. Sin sesión, el paquete es público y se conecta con código.

Actualizaciones: Blender puede añadir `…/api/addon/v1/extensiones/index.json` como repositorio remoto (*Preferencias › Obtener extensiones › Repositorios*) y avisará cuando haya una versión nueva.

## Problemas frecuentes

| Síntoma | Solución |
|---|---|
| Windows: «Windows protegió su PC» | **Más información › Ejecutar de todas formas** (el `.bat` no está firmado). |
| macOS: «no se puede abrir» | Clic derecho › **Abrir › Abrir**. |
| «No encontré Blender» | Arrastrar `blender.exe` / indicar la ruta, o `AMATISTA_BLENDER=/ruta/blender`. |
| Blender 4.1 o anterior | Instalar Blender 4.2+ desde blender.org. Las versiones anteriores no tienen extensiones. |
| El panel dice «sin acceso en línea» | Botón **Permitir acceso en línea** (o *Preferencias › Sistema › Red*). El progreso se guarda en cola mientras tanto. |
| «Necesitas actualizar Amatista» en un objetivo | La práctica usa un validador nuevo: descargar el paquete otra vez. |
| La lección no se actualiza | La lección consulta cada 6 s; comprobar que Blender muestre la cuenta conectada y pulsar **Enviar mi progreso**. |

Probado con `bpy` 5.0.1 en Linux (instalación real de la extensión, en desarrollo y en CI) y con las pruebas del constructor. Falta probar los instaladores en un Windows y un macOS reales, por ejemplo con el Blender 5.1.1 del equipo: T-056.
