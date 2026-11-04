#!/usr/bin/env node
/*
  Metraje real de la PWA para la película de Hack4Edu.

  Graba la plataforma con el screencast de Chromium (cuadros JPEG a la velocidad real de pantalla) y los
  pasa a 30 cuadros por segundo en frontend/pelicula/media/<toma>/00001.jpg… (carpeta ignorada por Git).
  Cada toma es una demostración de verdad: se vence al jefe con las respuestas correctas, se corta la
  red y la PWA sigue funcionando, se camina por un mundo generado por el Motor Amatista.

  Uso (con la PWA servida: cd frontend && npm run build && npx vite preview --port 4173):
    NODE_PATH="$(npm root -g)" node docs/hack4edu/video/pelicula/metraje.cjs [--pwa http://127.0.0.1:4173/] [--toma jefe]
*/
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '../../../..');
const MEDIA = path.join(RAIZ, 'frontend', 'pelicula', 'media');
const args = process.argv.slice(2);
const opcion = (nombre, porOmision) => (args.includes(nombre) ? args[args.indexOf(nombre) + 1] : porOmision);
const PWA = opcion('--pwa', 'http://127.0.0.1:4173/');
const SOLO = opcion('--toma', null);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// Alumno de DEMOSTRACIÓN (la película lo dice en pantalla): avance sembrado en el navegador.
const PRIMER_MODULO = ['bp1_gancho', 'bp1_blender', 'bp1_explora', 'bp1_practica'].map((l) => `blender_principiante:${l}`);
const AVANCE = {
  antes_del_jefe: [...PRIMER_MODULO, 'aframe:les_af_001'],
  con_insignia: [...PRIMER_MODULO, 'blender_principiante:bp1_jefe', 'aframe:les_af_001', 'aframe:les_af_002'],
};

async function sembrar(pagina, hechas, insignias = []) {
  await pagina.goto(PWA, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await pagina.evaluate(([lista, medallas]) => new Promise((resolver, rechazar) => {
    const dia = (n) => new Date(Date.now() - n * 86400000).toISOString();
    const lecciones = Object.fromEntries(lista.map((k, i) => [k, { completada: true, intentos: 1, puntaje: 100,
      actualizadoEn: dia(0), completadaEn: dia(lista.length - i) }]));
    const actividad = Object.fromEntries([6, 5, 4, 3, 2, 1, 0].map((n) => [dia(n).slice(0, 10), 1 + (n % 2)]));
    const estado = { version: 2, alumnoId: 'alumno_demostracion', cuentaId: null, lecciones,
      insignias: Object.fromEntries(medallas.map((m) => [m, dia(1)])), actividad, pendientes: [],
      insigniasPendientes: [], eventos: [],
      marcas: { dia: null, sesiones: [], eventoSync: null, sincronizado: null, descargado: null, descargaCompleta: null } };
    const peticion = indexedDB.open('amatista', 1);
    peticion.onupgradeneeded = () => peticion.result.createObjectStore('estado');
    peticion.onerror = () => rechazar(peticion.error);
    peticion.onsuccess = () => {
      const tx = peticion.result.transaction('estado', 'readwrite');
      tx.objectStore('estado').put(estado, 'progreso');
      tx.oncomplete = () => { peticion.result.close(); resolver(); };
    };
  }), [hechas, insignias]);
}

async function deslizar(pagina, px, ms) {
  await pagina.evaluate(([dy, duracion]) => new Promise((fin) => {
    const desde = window.scrollY, t0 = performance.now();
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / duracion);
      window.scrollTo(0, desde + dy * (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2));
      if (k < 1) requestAnimationFrame(paso); else fin();
    };
    requestAnimationFrame(paso);
  }), [px, ms]);
}

async function pasear(pagina, desde, hasta, pasos = 30) {
  for (let i = 0; i <= pasos; i += 1) {
    const k = i / pasos;
    await pagina.mouse.move(desde[0] + (hasta[0] - desde[0]) * k, desde[1] + (hasta[1] - desde[1]) * k + Math.sin(k * 6) * 30);
    await esperar(16);
  }
}

// El mundo del Estudio a pantalla completa (sin barra ni botones): así se ve lo que el alumno construye.
async function mundoCompleto(p, plantilla) {
  await p.getByRole('button', { name: plantilla }).first().click({ timeout: 5000 }).catch(() => {});
  await esperar(3200);
  await p.evaluate(() => {
    const escena = document.querySelector('a-scene');
    if (!escena) return;
    const caja = escena.parentElement;
    caja.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483646;margin:0;border:0';
    escena.style.cssText = 'width:100vw;height:100vh';
    document.documentElement.style.overflow = 'hidden';
    const estilo = document.createElement('style');
    estilo.textContent = 'header, nav, .goliat-boton, .a-enter-vr, .a-enter-vr-button, .a-orientation-modal { display: none !important; }';
    document.head.appendChild(estilo);
    window.dispatchEvent(new Event('resize'));
  });
  await esperar(1200);
}

async function girar(p, dx, ms) {
  await p.mouse.move(960, 540);
  await p.mouse.down();
  const pasos = Math.round(ms / 16);
  for (let i = 1; i <= pasos; i += 1) { await p.mouse.move(960 + (dx * i) / pasos, 540); await esperar(16); }
  await p.mouse.up();
}

// Cada toma: avance que necesita, la ruta y lo que se hace mientras se graba.
const TOMAS = {
  portada: { avance: [], hash: '#/', async accion(p) {
    await esperar(800);
    await pasear(p, [300, 400], [1500, 250]);
    await p.mouse.click(521, 171);
    await esperar(1600);
    await pasear(p, [1500, 250], [700, 640]);
    await deslizar(p, 520, 2600);
    await esperar(900);
  } },
  curso: { avance: 'antes_del_jefe', hash: '#/curso/blender_principiante', async accion(p) {
    await esperar(700);
    await deslizar(p, 560, 3800);
    await esperar(700);
  } },
  leccion: { avance: 'antes_del_jefe', hash: '#/curso/blender_principiante/leccion/bp1_gancho', async accion(p) {
    await esperar(600);
    await deslizar(p, 1500, 6500);
    await esperar(600);
  } },
  jefe: { avance: 'antes_del_jefe', hash: '#/curso/blender_principiante/leccion/bp1_jefe', async accion(p) {
    await esperar(600);
    await deslizar(p, 330, 900);
    const respuestas = ['Z', 'Arrastrando con el botón central', 'R y luego Y', 'Duplica el objeto', 'Outliner'];
    for (const [i, texto] of respuestas.entries()) {
      await esperar(700);
      // Las opciones se llaman «A Y», «B Z»… y cambian de orden: se busca por el texto tras la letra.
      const opcion = new RegExp(`^[A-D] ${texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
      await p.getByRole('button', { name: opcion }).first().click({ timeout: 4000 }).catch(() => {});
      await esperar(1300);
      const boton = i < respuestas.length - 1 ? /Siguiente ataque/i : /Ver el resultado/i;
      await p.getByRole('button', { name: boton }).first().click({ timeout: 4000 }).catch(() => {});
    }
    await esperar(3500);
  } },
  sin_conexion: { avance: 'antes_del_jefe', hash: '#/curso/blender_principiante/leccion/bp1_explora', async accion(p, ctx) {
    await esperar(1800);
    await ctx.setOffline(true);           // se corta la red (la insignia cambia a «Sin conexión»)…
    await esperar(1400);
    await deslizar(p, 700, 2200);
    // …y la alumna sigue a la siguiente lección: la PWA la sirve desde el equipo.
    await p.evaluate(() => { location.hash = '#/curso/blender_principiante/leccion/bp1_practica'; });
    await esperar(1800);
    await deslizar(p, 600, 2400);
    await esperar(700);
  } },
  ciudad: { avance: 'antes_del_jefe', hash: '#/estudio', async accion(p) {
    await p.getByRole('button', { name: /^Camina por tu mundo/ }).first().click({ timeout: 5000 }).catch(() => {});
    await esperar(2500);
    await deslizar(p, 380, 1200);
    const lienzo = p.locator('a-scene canvas, canvas').first();
    await lienzo.click({ position: { x: 300, y: 200 }, timeout: 4000 }).catch(() => {});
    await p.keyboard.down('w'); await esperar(2600); await p.keyboard.up('w');
    await p.keyboard.down('d'); await esperar(900); await p.keyboard.up('d');
    await p.keyboard.down('w'); await esperar(2200); await p.keyboard.up('w');
  } },
  bosque: { avance: 'antes_del_jefe', hash: '#/estudio', async accion(p) {
    await p.getByRole('button', { name: /^Mundo generado/ }).first().click({ timeout: 5000 }).catch(() => {});
    await esperar(2500);
    await deslizar(p, 380, 1200);
    await esperar(3500);
  } },
  mundo_ciudad: { avance: 'antes_del_jefe', hash: '#/estudio', async accion(p) {
    await mundoCompleto(p, /^Camina por tu mundo/);
    await p.keyboard.down('w'); await esperar(3000);
    await girar(p, -260, 1800);
    await esperar(1500); await p.keyboard.up('w');
    await girar(p, 380, 2200);
  } },
  mundo_bosque: { avance: 'antes_del_jefe', hash: '#/estudio', async accion(p) {
    await mundoCompleto(p, /^Mundo generado/);
    await esperar(1000);
    await girar(p, -420, 3800);
    await p.keyboard.down('w'); await esperar(2600); await p.keyboard.up('w');
  } },
  panel: { avance: 'con_insignia', insignias: ['blender_principiante:mod_bp_001'], hash: '#/panel', async accion(p) {
    await esperar(1200);
    await deslizar(p, 420, 3000);
    await esperar(1200);
  } },
};

async function grabar(navegador, nombre, toma) {
  const ctx = await navegador.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, locale: 'es-MX' });
  const p = await ctx.newPage();
  await sembrar(p, Array.isArray(toma.avance) ? toma.avance : AVANCE[toma.avance], toma.insignias || []);
  await p.goto(PWA + toma.hash, { waitUntil: 'networkidle' }).catch(() => {});
  // La primera visita instala el service worker; la segunda ya la sirve él (necesario para «sin conexión»).
  await p.evaluate(() => navigator.serviceWorker?.ready).catch(() => {});
  await p.reload({ waitUntil: 'networkidle' }).catch(() => {});
  await esperar(1800);

  const cdp = await ctx.newCDPSession(p);
  const cuadros = [];
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    cuadros.push({ data, t: metadata.timestamp });
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080 });
  const inicio = Date.now() / 1000;
  await toma.accion(p, ctx);
  const fin = Date.now() / 1000;
  await cdp.send('Page.stopScreencast');
  await ctx.close();

  const dir = path.join(MEDIA, nombre);
  const crudos = path.join(MEDIA, '_crudo_' + nombre);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(crudos, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(crudos, { recursive: true });
  const lista = [];
  cuadros.forEach((c, i) => {
    const archivo = path.join(crudos, `${String(i).padStart(5, '0')}.jpg`);
    fs.writeFileSync(archivo, Buffer.from(c.data, 'base64'));
    const siguiente = i + 1 < cuadros.length ? cuadros[i + 1].t : Math.max(fin, c.t + 0.04);
    lista.push(`file '${archivo}'\nduration ${Math.max(0.001, siguiente - c.t).toFixed(4)}`);
  });
  lista.push(`file '${path.join(crudos, `${String(cuadros.length - 1).padStart(5, '0')}.jpg`)}'`);
  fs.writeFileSync(path.join(crudos, 'lista.txt'), lista.join('\n') + '\n');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(crudos, 'lista.txt'),
    '-vf', 'fps=30,scale=1920:1080', '-q:v', '3', path.join(dir, '%05d.jpg')]);
  fs.rmSync(crudos, { recursive: true, force: true });
  const n = fs.readdirSync(dir).length;
  fs.writeFileSync(path.join(dir, 'toma.json'), JSON.stringify({ toma: nombre, cuadros: n, segundos: n / 30,
    grabado: new Date().toISOString(), duracion_real: fin - inicio }, null, 2));
  console.log(`toma ${nombre}: ${n} cuadros (${(n / 30).toFixed(1)} s), ${cuadros.length} cuadros de pantalla`);
}

(async () => {
  const navegador = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  for (const [nombre, toma] of Object.entries(TOMAS)) {
    if (SOLO && SOLO !== nombre) continue;
    await grabar(navegador, nombre, toma);
  }
  await navegador.close();
})().catch((e) => { console.error(e); process.exit(1); });
