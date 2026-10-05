// Rendimiento de la PWA en un navegador real (Chromium con Playwright).
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/rendimiento.mjs [--url http://localhost:4173] [--salida rendimiento-web.json]
//
// Mide cada página dos veces: en una computadora normal y simulando un
// teléfono modesto (CPU 4 veces más lenta y red 4G lenta). Anota FCP, LCP,
// cambio de diseño (CLS), tiempo bloqueado por tareas largas (TBT), bytes
// descargados, memoria de JavaScript y los cuadros por segundo de las
// animaciones durante 3 segundos (lo que más cuesta en equipos viejos).
// Playwright: se usa el instalado en el sistema (npm root -g) si no está en el proyecto.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
function cargarPlaywright() {
  try {
    return require('playwright');
  } catch {
    const global = execSync('npm root -g').toString().trim();
    return require(path.join(global, 'playwright'));
  }
}
const { chromium } = cargarPlaywright();

const argumentos = Object.fromEntries(
  process.argv.slice(2).reduce((pares, valor, i, lista) => {
    if (valor.startsWith('--')) pares.push([valor.slice(2), lista[i + 1]]);
    return pares;
  }, []),
);
const URL_BASE = argumentos.url || 'http://localhost:4173';
const SALIDA = argumentos.salida || 'rendimiento-web.json';
const PAGINAS = (argumentos.paginas || '#/,#/curso/blender,#/curso/blender_principiante,#/panel,#/blender').split(',');

const PERFILES = {
  computadora: { cpu: 1, red: null },
  'teléfono modesto': {
    cpu: 4,
    red: { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 },
  },
};

async function medir(navegador, ruta, perfil) {
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
  const pagina = await contexto.newPage();
  const cdp = await contexto.newCDPSession(pagina);
  await cdp.send('Performance.enable');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: perfil.cpu });
  if (perfil.red) await cdp.send('Network.emulateNetworkConditions', perfil.red);
  let bytes = 0;
  pagina.on('response', async (r) => {
    const largo = Number(r.headers()['content-length'] || 0);
    bytes += largo || (await r.body().catch(() => Buffer.alloc(0))).length;
  });
  await pagina.addInitScript(() => {
    window.__m = { lcp: 0, cls: 0, tbt: 0, largas: 0 };
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__m.lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__m.cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__m.tbt += Math.max(0, e.duration - 50); window.__m.largas += 1; })).observe({ type: 'longtask', buffered: true });
  });
  const inicio = Date.now();
  await pagina.goto(`${URL_BASE}/${ruta}`, { waitUntil: 'load', timeout: 120000 });
  const carga = Date.now() - inicio;
  await pagina.waitForTimeout(1500);
  // Cuadros por segundo durante 3 s (animaciones de fondo, mascotas, escenarios).
  const fps = await pagina.evaluate(
    () => new Promise((listo) => {
      let cuadros = 0;
      const t0 = performance.now();
      const paso = () => {
        cuadros += 1;
        if (performance.now() - t0 < 3000) requestAnimationFrame(paso);
        else listo((cuadros * 1000) / (performance.now() - t0));
      };
      requestAnimationFrame(paso);
    }),
  );
  const datos = await pagina.evaluate(() => {
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;
    const nav = performance.getEntriesByType('navigation')[0];
    return { fcp, dcl: nav?.domContentLoadedEventEnd || 0, nodos: document.getElementsByTagName('*').length, ...window.__m };
  });
  const metricas = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
  await contexto.close();
  return {
    pagina: ruta,
    carga_ms: carga,
    fcp_ms: Math.round(datos.fcp),
    lcp_ms: Math.round(datos.lcp),
    dcl_ms: Math.round(datos.dcl),
    cls: Number(datos.cls.toFixed(3)),
    tbt_ms: Math.round(datos.tbt),
    tareas_largas: datos.largas,
    fps: Math.round(fps),
    kb_descargados: Math.round(bytes / 1024),
    heap_mb: Number(((metricas.JSHeapUsedSize || 0) / 1048576).toFixed(1)),
    nodos_dom: datos.nodos,
  };
}

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const resultado = { url: URL_BASE, fecha: new Date().toISOString(), perfiles: {} };
for (const [nombre, perfil] of Object.entries(PERFILES)) {
  resultado.perfiles[nombre] = [];
  for (const ruta of PAGINAS) {
    const fila = await medir(navegador, ruta, perfil);
    resultado.perfiles[nombre].push(fila);
    console.log(`${nombre.padEnd(17)} ${ruta.padEnd(30)} FCP ${String(fila.fcp_ms).padStart(5)} ms  LCP ${String(fila.lcp_ms).padStart(5)} ms  TBT ${String(fila.tbt_ms).padStart(4)} ms  CLS ${fila.cls}  ${fila.fps} fps  ${fila.kb_descargados} KB`);
  }
}
await navegador.close();
writeFileSync(SALIDA, JSON.stringify(resultado, null, 2) + '\n');
console.log(`Resultados en ${SALIDA}`);
