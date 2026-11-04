# Auditoría de peso y consumo (4 de noviembre de 2026)

La pregunta es cuánto pesa Amatista y cuánto consume, ahora que entran **Geoda** y la **biblioteca de recursos**. La meta es que la app completa quepa en **medio gigabyte**, también como programa de escritorio (`.exe`).

**Respuesta corta:**
- **Web (PWA):** la primera visita descarga unos **300 KB**. Lo que se instala para usar sin conexión son **1.7 MB**. La biblioteca (19.5 MB) solo baja lo que se abre.
- **Escritorio (Windows):** **301 MB** instalado con texturas hasta 2K y **159 MB** de descarga en `.zip`. Es el **59 %** del límite de 512 MB.

## 1. Lo que hay en `frontend/dist` (la PWA compilada)

| Parte | Archivos | Peso | ¿Se instala al abrir la app? |
|---|--:|--:|---|
| Biblioteca de recursos (texturas 512 y 1K, modelos, animaciones) | 430 | 19.5 MB | No: se guarda en caché lo que el alumno abre |
| JavaScript de la plataforma (incluye Geoda) | 73 | 1.7 MB | Sí |
| A-Frame (motor 3D web) | 2 | 1.3 MB | No: se guarda la primera vez que se usa el 3D |
| Imágenes, íconos e ilustraciones | 28 | 0.3 MB | Sí (PNG y SVG) |
| CSS | 1 | 0.2 MB | Sí |
| Fuentes (Outfit, JetBrains Mono) | 7 | 0.1 MB | Sí |
| Modelos 3D del curso de A-Frame | 3 | 18 KB | Sí |
| **Total** | **546** | **23.2 MB** | **Precache: 90 archivos, 1.7 MB** |

**La biblioteca, por dentro:**
- texturas en 512: 3.5 MB;
- texturas en 1K: 14.4 MB;
- 38 modelos: 0.4 MB (de 42 a 256 triángulos, 114 en promedio);
- 19 animaciones: 0.3 MB.

El catálogo (`catalogo.json`) pesa 40 KB. Las vistas previas se cargan a medida que aparecen en pantalla.

**Decisiones de PWA tomadas en esta auditoría:**
- `biblioteca/**` queda fuera del precache (`globIgnores`). Si no, cada alumno descargaría 19.5 MB al instalar la app.
- La biblioteca tiene su propia caché en tiempo de ejecución: `CacheFirst` para los archivos (hasta 800, un año) y `StaleWhileRevalidate` para el catálogo. Así, lo que se abre una vez queda disponible sin conexión.
- Geoda recomienda la resolución de texturas según el equipo: **512** en N0 y N1, **1K** en N2 o más. La página de la biblioteca resalta esa descarga.

## 2. Consumo al navegar (Chromium, 1366×768, sin GPU)

Se midió con `herramientas/auditoria/peso.cjs`, que usa el protocolo de DevTools: bytes transferidos ya comprimidos, peticiones, memoria JavaScript y tiempos.

### Primera visita (navegador limpio, como un alumno nuevo)

| Ruta | Transferido | Peticiones | Memoria JS | Primer contenido | Lista |
|---|--:|--:|--:|--:|--:|
| Portada `#/` | 300 KB | 13 | 5.1 MB | 164 ms | 2.3 s |
| Curso de Blender | 326 KB | 24 | 5.4 MB | 140 ms | 2.2 s |
| Mi panel | 332 KB | 22 | 4.7 MB | 152 ms | 2.2 s |
| Estudio A-Frame (mundo 3D) | 656 KB | 22 | 8.9 MB | 188 ms | 2.6 s |
| **Geoda** | **309 KB** | 16 | 5.0 MB | 148 ms | 2.2 s |
| **Biblioteca** | **722 KB** | 87 | 5.0 MB | 140 ms | 2.6 s |
| **Biblioteca + abrir un modelo 3D** | **1.6 MB** | 125 | 12.3 MB | 148 ms | 6.8 s* |

\* Incluye 4 s de espera a propósito para que cargue A-Frame y gire el modelo.

### Segunda visita (con el service worker ya instalado)

Todas las rutas transfieren **0 KB** de la red: todo sale del service worker. La memoria y los tiempos son iguales o menores (primer contenido entre 116 y 136 ms).

**Lectura:**
- Geoda cuesta casi lo mismo que la portada: su código pesa 14 KB (sin comprimir) y se carga solo al abrir `#/geoda`.
- La biblioteca es la ruta más pesada de la primera visita (722 KB), por las vistas previas de los recursos (87 peticiones).
- Abrir un modelo 3D suma A-Frame (354 KB comprimido), que se guarda para siempre en la caché.
- La memoria JavaScript nunca pasa de 12.3 MB. Un Chromebook de 4 GB lo resiste sin problema.

## 3. La app de escritorio (`escritorio/`)

Es la misma PWA dentro de Electron 33. Se sirve desde `http://127.0.0.1:47821`, así que el service worker, IndexedDB, Geoda y la biblioteca funcionan igual que en la web. Funciona sin conexión desde el primer arranque, porque todo va en la carpeta.

| Parte | Peso |
|---|--:|
| Electron (Chromium + Node), solo con los idiomas español e inglés | 229.3 MB |
| PWA + Geoda | 3.6 MB |
| Biblioteca con texturas **512, 1K y 2K** | 68.2 MB |
| **Total instalado** | **301.1 MB** (límite 512 MB) |
| **Descarga (`.zip`)** | **158.8 MB** |

**Margen:** quedan unos 210 MB. Caben, por ejemplo, Blender Portable para N1 (3.6 LTS, unos 200 MB comprimido) o una segunda biblioteca de 2K.

**Comprobado en este contenedor:** el mismo `main.js` con Electron 33 para Linux. El servidor local responde, el service worker se registra, Geoda detecta el equipo (N2) y la biblioteca muestra los 102 recursos con resoluciones 512, 1K y 2K.

**Falta probarlo** en una Windows real.

## 4. Cómo repetir las mediciones

```bash
cd frontend && npm ci && npm run build && npx vite preview --port 4173 &
cd ..
NODE_PATH="$(npm root -g)" node herramientas/auditoria/peso.cjs --json peso.json
cd escritorio && npm ci && node empaquetar.mjs --con-2k     # el .exe y su peso (salida/peso.json)
```

## 5. Pendientes que salen de la auditoría

1. **Firmar el `.exe`.** Sin firma, Windows SmartScreen muestra un aviso. Opciones: un certificado de firma de código o publicarlo en Microsoft Store.
2. **Ícono propio de `Amatista.exe`.** Hoy la ventana usa el ícono de Amatista, pero el archivo conserva el de Electron. Cambiarlo requiere `rcedit`, que en Linux necesita wine. Se puede hacer desde Windows o en GitHub Actions con `windows-latest`.
3. **Instalador opcional** (NSIS con `electron-builder`) en GitHub Actions `windows-latest`. La carpeta portátil ya funciona sin él.
4. **El chunk principal (`index-*.js`) pesa 627 KB** (185 KB comprimido). Se puede partir más por rutas.
5. **Sentry pesa 367 KB.** Se puede cargar después del primer contenido.
