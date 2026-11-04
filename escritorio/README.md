# Amatista de escritorio

La PWA completa en una ventana propia, con **Geoda** y la **biblioteca de recursos**, para Windows y sin instalar nada. Es una carpeta portátil que se puede llevar en una USB a un laboratorio sin internet.

| Parte | Peso |
|---|--:|
| Electron 33 (Chromium + Node), solo en español e inglés | 229 MB |
| PWA + Geoda | 3.6 MB |
| Biblioteca con texturas 512, 1K y 2K | 68 MB |
| **Total instalado** | **301 MB** (límite: 512 MB) |
| **Descarga `.zip`** | **159 MB** |

## Cómo funciona

- `main.js` levanta un servidor local en `http://127.0.0.1:47821` y abre la PWA ahí. No usa `file://`, para que el service worker, IndexedDB y las cachés funcionen igual que en el navegador.
- El puerto es fijo, así que el progreso y la caché sobreviven entre aperturas.
- Solo se abre una ventana; los enlaces externos van al navegador del sistema.
- La ventana usa `contextIsolation` y `sandbox`, sin Node en la página.
- Si Windows bloquea la gráfica, el 3D sigue con WebGL por software.
- La API es la de producción (`https://api.amatista-3d.tech`). Su CORS ya acepta `127.0.0.1`.

## Empaquetar

```bash
cd escritorio
npm ci
node empaquetar.mjs            # texturas 512 y 1K
node empaquetar.mjs --con-2k   # también 2K (necesita Python 3 con numpy y Pillow)
```

El script:
1. compila la PWA;
2. descarga Electron para `win32-x64`, o usa `ELECTRON_ZIP=/ruta/electron-v33.2.1-win32-x64.zip`;
3. renombra `electron.exe` a `Amatista.exe` y quita los idiomas que no se usan;
4. copia la app a `resources/app`;
5. deja `salida/Amatista-<versión>-win-x64/` y su `.zip`, con el desglose del peso en `salida/peso.json`.

Falla si el total pasa de 512 MB. No necesita wine: no modifica el `.exe`.

## Pendiente

- Probarlo en una Windows real. En Linux se probó el mismo `main.js` con Electron 33.
- Firmar el `.exe` para que SmartScreen no avise.
- Ponerle el ícono de Amatista con `rcedit` o `electron-builder`, desde GitHub Actions `windows-latest`.
