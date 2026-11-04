#!/usr/bin/env node
/*
  Renderiza la película (frontend/pelicula) cuadro por cuadro: para cada cuadro fija el tiempo t en la página
  (window.__pelicula.ir), espera a que carguen las imágenes y lo captura. El resultado es exacto y sin saltos.

  Requiere el servidor de desarrollo:  cd frontend && npx vite --port 5173
  Uso:
    node render.cjs --salida <carpeta> [--fps 30] [--desde 0] [--hasta <fin>]     cuadros 000001.jpg…
    node render.cjs --salida <carpeta> --muestras 3,40,95                          solo esas imágenes
  Siempre escribe <carpeta>/linea.json (escenas y tiempos) para la música.
*/
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opcion = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const URL = opcion('--url', 'http://127.0.0.1:5173/pelicula/?render');
const SALIDA = path.resolve(opcion('--salida', 'cuadros'));
const FPS = Number(opcion('--fps', 30));
const MUESTRAS = opcion('--muestras', null);

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const navegador = await chromium.launch({ args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
  const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  pagina.on('pageerror', (e) => console.error('error de página:', e.message));
  await pagina.goto(URL, { waitUntil: 'networkidle' });
  await pagina.waitForFunction(() => window.__pelicula?.lista, null, { timeout: 60000 });
  const { duracion, escenas } = await pagina.evaluate(() => ({ duracion: window.__pelicula.duracion, escenas: window.__pelicula.escenas }));
  fs.writeFileSync(path.join(SALIDA, 'linea.json'), JSON.stringify({ duracion, fps: FPS, escenas }, null, 2));
  const cdp = await pagina.context().newCDPSession(pagina);
  const capturar = async (archivo) => {
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, optimizeForSpeed: true });
    fs.writeFileSync(archivo, Buffer.from(data, 'base64'));
  };

  if (MUESTRAS) {
    for (const t of MUESTRAS.split(',').map(Number)) {
      await pagina.evaluate((s) => window.__pelicula.ir(s), t);
      await capturar(path.join(SALIDA, `muestra_${String(t).replace('.', '_')}.jpg`));
      console.log('muestra', t);
    }
  } else {
    const desde = Number(opcion('--desde', 0));
    const hasta = Number(opcion('--hasta', duracion));
    const primero = Math.round(desde * FPS);
    const ultimo = Math.round(hasta * FPS);
    const t0 = Date.now();
    for (let i = primero; i < ultimo; i += 1) {
      await pagina.evaluate((s) => window.__pelicula.ir(s), i / FPS);
      await capturar(path.join(SALIDA, `${String(i + 1).padStart(6, '0')}.jpg`));
      if ((i - primero) % 300 === 0) {
        const hechos = i - primero + 1;
        const resta = ((Date.now() - t0) / hechos) * (ultimo - i) / 1000;
        console.log(`cuadro ${i + 1}/${ultimo} (${(i / FPS).toFixed(1)} s) · faltan ~${Math.round(resta)} s`);
      }
    }
  }
  await navegador.close();
})().catch((e) => { console.error(e); process.exit(1); });
