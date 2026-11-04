// Auditoría de peso y consumo de la PWA.
//   1. Desglose de frontend/dist por tipo (JS, CSS, fuentes, imágenes, biblioteca…) y lo que precachea el service worker.
//   2. Visita las rutas clave con Chromium: bytes transferidos, peticiones, memoria JS y tiempos.
//   3. Una segunda visita con el service worker activo, para ver qué sale de la caché.
//
// Uso:  cd frontend && npm run build && npx vite preview --port 4173 &
//       NODE_PATH="$(npm root -g)" node herramientas/auditoria/peso.cjs [--pwa http://127.0.0.1:4173/] [--json salida.json]
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const PWA = arg('--pwa', 'http://127.0.0.1:4173/');
const DIST = path.resolve(__dirname, '../../frontend/dist');
const SALIDA = arg('--json', null);

const RUTAS = [
  ['Portada', '#/'],
  ['Curso de Blender', '#/curso/blender'],
  ['Mi panel', '#/panel'],
  ['Estudio A-Frame (mundo 3D)', '#/estudio'],
  ['Geoda', '#/geoda'],
  ['Biblioteca', '#/biblioteca'],
];

function recorrer(dir, base = dir, lista = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) recorrer(p, base, lista);
    else lista.push({ ruta: path.relative(base, p).split(path.sep).join('/'), bytes: fs.statSync(p).size });
  }
  return lista;
}

function clase(ruta) {
  if (ruta.startsWith('biblioteca/')) return 'Biblioteca de recursos';
  if (ruta.startsWith('modelos/') || ruta.endsWith('.glb')) return 'Modelos 3D de la PWA';
  if (/aframe/.test(ruta)) return 'A-Frame (motor 3D web)';
  if (ruta.endsWith('.js')) return 'JavaScript';
  if (ruta.endsWith('.css')) return 'CSS';
  if (/\.(woff2?|ttf)$/.test(ruta)) return 'Fuentes';
  if (/\.(png|jpe?g|webp|svg|ico|avif)$/.test(ruta)) return 'Imágenes';
  if (/\.(zip)$/.test(ruta)) return 'Descargas (add-on)';
  return 'Otros (HTML, JSON, manifiesto)';
}

function desglose() {
  const archivos = recorrer(DIST);
  const grupos = {};
  for (const a of archivos) {
    const g = (grupos[clase(a.ruta)] ??= { archivos: 0, bytes: 0 });
    g.archivos += 1; g.bytes += a.bytes;
  }
  const sw = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8');
  const precache = [...sw.matchAll(/url:"([^"]+)"/g)].map((m) => m[1]);
  const porRuta = Object.fromEntries(archivos.map((a) => [a.ruta, a.bytes]));
  const bytesPrecache = precache.reduce((s, r) => s + (porRuta[r] ?? 0), 0);
  const grandes = [...archivos].filter((a) => !a.ruta.startsWith('biblioteca/')).sort((a, b) => b.bytes - a.bytes).slice(0, 12);
  return {
    total: { archivos: archivos.length, bytes: archivos.reduce((s, a) => s + a.bytes, 0) },
    grupos,
    precache: { entradas: precache.length, bytes: bytesPrecache, incluyeBiblioteca: precache.some((r) => r.startsWith('biblioteca/')) },
    grandes,
  };
}

async function medir(contexto, nombre, hash, { abrirRecurso = false } = {}) {
  const pagina = await contexto.newPage();
  const cdp = await contexto.newCDPSession(pagina);
  await cdp.send('Network.enable');
  await cdp.send('Performance.enable');
  let bytes = 0; let peticiones = 0; let desdeCache = 0;
  cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; peticiones += 1; });
  cdp.on('Network.requestServedFromCache', () => { desdeCache += 1; });
  const sw = { n: 0 };
  pagina.on('response', (r) => { if (r.fromServiceWorker()) sw.n += 1; });
  const t0 = Date.now();
  await pagina.goto(new URL(hash, PWA).href, { waitUntil: 'load' });
  await pagina.waitForLoadState('networkidle').catch(() => {});
  if (abrirRecurso) {
    await pagina.locator('button:has(img)').nth(60).click().catch(() => {});
    await pagina.waitForTimeout(4000);
  }
  await pagina.waitForTimeout(1500);
  const listo = Date.now() - t0;
  const tiempos = await pagina.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    return { dom: Math.round(nav?.domContentLoadedEventEnd ?? 0), fcp: Math.round(fcp?.startTime ?? 0) };
  });
  const { metrics } = await cdp.send('Performance.getMetrics');
  const m = Object.fromEntries(metrics.map((x) => [x.name, x.value]));
  await pagina.close();
  return { nombre, ruta: hash, kb: Math.round(bytes / 1024), peticiones, desdeServiceWorker: sw.n, heapMb: +(m.JSHeapUsedSize / 1048576).toFixed(1), nodos: m.Nodes, domMs: tiempos.dom, fcpMs: tiempos.fcp, listoMs: listo };
}

(async () => {
  const resultado = { fecha: new Date().toISOString(), pwa: PWA, dist: desglose(), primeraVisita: [], segundaVisita: [] };
  const navegador = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [nombre, hash] of RUTAS) {
    // Primera visita: navegador limpio (sin caché ni service worker), como un alumno nuevo.
    const limpio = await navegador.newContext({ viewport: { width: 1366, height: 768 } });
    resultado.primeraVisita.push(await medir(limpio, nombre, hash));
    await limpio.close();
  }
  const biblio = await navegador.newContext({ viewport: { width: 1366, height: 768 } });
  resultado.primeraVisita.push(await medir(biblio, 'Biblioteca + abrir un modelo 3D', '#/biblioteca', { abrirRecurso: true }));
  await biblio.close();

  // Segunda visita: mismo navegador, con el service worker ya instalado.
  const conSw = await navegador.newContext({ viewport: { width: 1366, height: 768 } });
  const p = await conSw.newPage();
  await p.goto(PWA, { waitUntil: 'load' });
  await p.evaluate(() => navigator.serviceWorker?.ready);
  await p.waitForTimeout(4000);
  await p.close();
  for (const [nombre, hash] of RUTAS) resultado.segundaVisita.push(await medir(conSw, nombre, hash));
  await conSw.close();
  await navegador.close();

  const kb = (b) => `${(b / 1024).toFixed(0)} KB`;
  const mb = (b) => `${(b / 1048576).toFixed(1)} MB`;
  console.log(`dist: ${resultado.dist.total.archivos} archivos, ${mb(resultado.dist.total.bytes)}`);
  for (const [g, v] of Object.entries(resultado.dist.grupos).sort((a, b) => b[1].bytes - a[1].bytes)) console.log(`  ${g.padEnd(32)} ${String(v.archivos).padStart(4)} archivos  ${mb(v.bytes)}`);
  console.log(`precache: ${resultado.dist.precache.entradas} entradas, ${kb(resultado.dist.precache.bytes)}, ¿incluye biblioteca? ${resultado.dist.precache.incluyeBiblioteca}`);
  console.table(resultado.primeraVisita);
  console.table(resultado.segundaVisita);
  if (SALIDA) fs.writeFileSync(SALIDA, JSON.stringify(resultado, null, 2));
})();
