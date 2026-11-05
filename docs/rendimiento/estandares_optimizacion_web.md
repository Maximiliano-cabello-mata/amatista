# Estándares de Optimización Web y Presupuestos de Rendimiento · Amatista

Este documento establece las normas técnicas obligatorias, la arquitectura de carga sin pérdida de calidad y las herramientas automatizadas que mantienen la plataforma web (`frontend/`), sus activos estáticos (`public/`) y su distribución (`Cloudflare Workers / Caddy`) dentro de los presupuestos de velocidad y consumo de datos.

## 1. Principios rectores (optimización sin pérdida de calidad)

1. **Cero pérdida visual o pedagógica:** ninguna optimización reduce la nitidez de los gráficos low-poly, la precisión de los mapas PBR, las animaciones de las mascotas ni la capacidad de funcionar 100 % sin conexión.
2. **Desacoplamiento entre índice y contenido pesado (`T-080`):** la portada (`#/`), el panel (`#/panel`), los cursos (`#/curso/...`) y las barras de navegación arrancan con `frontend/src/data/indice-modulos.json` (**26.9 KB** en bruto, **5.0 KB** con gzip). Los bloques completos de teoría, actividades interactivas y exámenes de los 15 módulos (**344.1 KB** en bruto) se dividen por curso (`modulos-<cursoId>-*.js`) mediante `frontend/src/data/catalogoInicial.js` y `frontend/src/data/catalogoBase.js`, y solo se descargan cuando el alumno entra al curso o abre una lección.
3. **Ruta crítica limpia en el primer pintado (FCP / LCP):**
   - Todas las páginas (`Inicio`, `Curso`, `Leccion`, `Panel`, `Estudio`, `Biblioteca`, `Geoda`, `Blender`, `Admin`, etc.) se cargan bajo demanda con `React.lazy`. Si la URL inicial es `#/`, `Inicio` inicia su descarga en paralelo sin bloquear el resto de las rutas.
   - El asistente **Goliat** (`54 KB`) y el SDK de **Sentry** (`367 KB`) se posponen mediante `requestIdleCallback` hasta después del primer pintado (`programarSentry()` en `frontend/src/lib/sentry.js` y `useDiferidoEnReposo()` en `frontend/src/App.jsx`).
4. **Cero saltos de diseño (`CLS = 0.000`):** toda imagen declara `width` y `height` explícitos o contenedor con `aspect-ratio`, las fuentes variables usan `@font-face` de respaldo con métricas ajustadas (`size-adjust`, `ascent-override`, `descent-override`), y los indicadores asíncronos de red/servidor (como la versión del paquete y las insignias de conexión en `frontend/src/pages/Blender.jsx`) reservan su altura mínima (`min-h-[1.25rem]` y `min-h-[1.75rem]`) desde el primer cuadro.
5. **Trabajo en el hilo principal acotado (`TBT` y `fps`):**
   - Los paisajes SVG (`<Escenario>`) de la portada (`frontend/src/pages/Inicio.jsx`) solo se montan para el paso activo (`siguiente`), los pasos desplegados o aquellos que el alumno explora con el puntero/teclado (`onPointerEnter` / `onFocusCapture`), evitando montar 8 mundos invisibles (`opacity-0`) en el arranque.
   - Todas las instancias de `<Personaje>` (`frontend/src/components/temas/Personaje.jsx`) comparten un único `IntersectionObserver` y un único bucle `pointermove` + `requestAnimationFrame` en dos fases (primero todas las lecturas geométricas `getBoundingClientRect()`, después todas las escrituras CSS `--mirar-x`, `--mirar-y`, `--inclinar`), eliminando el *layout thrashing*.
   - Las grillas extensas como `#/biblioteca` (`frontend/src/pages/Biblioteca.jsx`) aplican `content-visibility: auto; contain-intrinsic-size: auto 220px` y un `IntersectionObserver` compartido (`rootMargin: '160px'`) con dimensiones explícitas `width="320" height="240"` para descargar solo las miniaturas visibles en pantalla.

## 2. Presupuestos de peso y rendimiento (Performance Budgets)

Cualquier cambio que supere estos umbrales rompe automáticamente el build (`npm run build`) o la auditoría en CI (`herramientas/auditoria/estandares_web.py`):

| Indicador | Antes de optimizar | Después de optimizar | Presupuesto máximo (CI) | Herramienta que lo vigila |
|---|---:|---:|---:|---|
| Grafo síncrono JS/JSON de `main.jsx` (fuente) | 700.1 KB (83 archivos) | **242.6 KB** (53 archivos) | **≤ 280 KB** | `estandares_web.py` |
| Chunk principal compilado (`assets/index-*.js`) | 627.0 KB (185 KB gzip) | **≈ 145 KB** (≈ 45 KB gzip) | **≤ 260 KB** | `revisar-publicacion.mjs` |
| Índice de módulos en arranque (`indice-modulos.json`) | 344.1 KB (los 15 JSON) | **26.9 KB** (**5.0 KB** gzip) | **≤ 32 KB** (**≤ 7 KB** gzip) | `indice-modulos.mjs` + `estandares_web.py` |
| Hoja de estilos (`assets/index-*.css`) | 97.7 KB fuente | **97.8 KB** fuente (~18 KB gzip) | **≤ 120 KB** | `revisar-publicacion.mjs` |
| Ilustraciones SVG (`public/ilustraciones/*.svg`) | 151.0 KB | **107.8 KB** (−28.6 %) | **≤ 120 KB** | `ilustraciones.mjs` + `estandares_web.py` |
| Mapas PBR de rugosidad (`rugosidad_{512,1k}.jpg`) | 957.6 KB (RGB 3 canales) | **808.6 KB** (Grises `L` 1 canal) | **90/90 en modo `L`** | `generar.py` + `estandares_web.py` |
| Precache inicial del Service Worker (`sw.js`) | 1.70 MB (90 entradas) | **≈ 1.35 MB** (sin `ilustraciones/**`) | **≤ 1.60 MB** | `revisar-publicacion.mjs` |
| Primera visita a `#/biblioteca` | 722 KB (87 peticiones) | **≈ 145 KB** (≈ 20 peticiones) | Miniaturas bajo demanda | `peso.cjs` + `estandares_web.py` |
| Salto de diseño (CLS) en `#/blender` y `#/` | 0.087 en móvil | **0.000** | **≤ 0.05** | `rendimiento.mjs` |

## 3. Estándares de activos estáticos sin pérdida

- **Ilustraciones SVG (`frontend/scripts/ilustraciones.mjs`):** los atributos heredables comunes (`stroke-width="0.7" stroke-linejoin="round"`) se declaran una sola vez en la etiqueta raíz `<svg>` en lugar de repetirse en miles de nodos `<polygon>`. Al modificar una ilustración, regenerar con `npm run ilustraciones`.
- **Mapas PBR de la biblioteca (`herramientas/biblioteca/generar.py`):** los mapas de un solo canal escalar (`rugosidad`) se codifican como JPEG en escala de grises monocanal (`mode='L'`), nunca como RGB de 3 canales idénticos (`R=G=B`). Esto ahorra 149 KB con fidelidad matemática exacta en el canal de luminancia.
- **Íconos y capturas PNG:** todo archivo PNG versionado en `frontend/` o `addon/` se guarda con compresión DEFLATE máxima sin pérdida (`optimize=True, compress_level=9`).
- **Sincronía del índice de módulos:** cada vez que se edite un archivo en `frontend/src/data/modulos/*.json`, se debe ejecutar `npm run indice` en `frontend/`. El hook `prebuild` (`node scripts/indice-modulos.mjs --verificar`) impide compilar si el índice quedó desfasado.

## 4. Estándares de red, caché HTTP y seguridad (`frontend/public/_headers`)

- **Activos con hash (`/assets/*`) y recursos CC0 (`/biblioteca/{texturas,modelos,animaciones}/*`):** `Cache-Control: public, max-age=31536000, immutable`.
- **Catálogo de biblioteca (`/biblioteca/catalogo.json`):** `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`.
- **Shell de la aplicación (`/`, `/index.html`, `/sw.js`, `/manifest.webmanifest`):** `Cache-Control: public, max-age=0, must-revalidate` para garantizar actualizaciones instantáneas del Service Worker.
- **Content-Security-Policy (CSP · `T-082`):** declarada en `frontend/public/_headers`, restringiendo orígenes a `'self'`, la API oficial (`https://api.amatista-3d.tech`), Sentry opcional y el puente local con Blender (`127.0.0.1` / `localhost`).

## 5. Herramientas de verificación y comandos

```bash
# 1. Regenerar y verificar el índice ligero de módulos (Node)
cd frontend && npm run indice
node scripts/indice-modulos.mjs --verificar

# 2. Auditoría estática integral de estándares y presupuestos (Python, corre en CI)
python3 herramientas/auditoria/estandares_web.py --md docs/rendimiento/ultimo_reporte_estandares.md

# 3. Validación post-build de seguridad, cabeceras y presupuestos de bundles (Node)
cd frontend && npm run build   # ejecuta prebuild + vite build + postbuild (revisar-publicacion.mjs)

# 4. Medición en navegador real (Playwright / Chromium)
NODE_PATH="$(npm root -g)" node herramientas/auditoria/peso.cjs --json peso.json
node frontend/scripts/rendimiento.mjs --salida rendimiento-web.json
```
