#!/usr/bin/env node
/*
  Genera el material del video de Hack4Edu, de punta a punta:

    1. fotogramas/   una imagen fija (1920×1080) de cada escena gráfica, para editar en Canva, Visme o DaVinci
       capturas/     la PWA real en escritorio y celular, con un alumno de demostración
    2. salida/clips  cada escena animada y cada recorrido por la PWA real, grabados con Playwright
    3. salida/amatista_hack4edu_borrador.mp4   el primer corte montado con ffmpeg (sin voz ni música)

  Requisitos: Node 20+, Playwright con Chromium (npm i -g playwright && npx playwright install chromium),
  ffmpeg, y la PWA corriendo:  cd frontend && npm run build && npx vite preview --port 4173

  Uso:  NODE_PATH="$(npm root -g)" node docs/hack4edu/video/generar.cjs [--pwa http://127.0.0.1:4173/] [--solo-fotogramas]

  El orden y la duración de cada parte están en PARTES y coinciden con GUION.md.
*/
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const AQUI = __dirname;
const ESCENAS = 'file://' + path.join(AQUI, 'escenas', 'index.html');
const SALIDA = path.join(AQUI, 'salida');
const CLIPS = path.join(SALIDA, 'clips');
const FOTOGRAMAS = path.join(AQUI, 'fotogramas');
const args = process.argv.slice(2);
const PWA = (args[args.indexOf('--pwa') + 1] && args.includes('--pwa')) ? args[args.indexOf('--pwa') + 1] : 'http://127.0.0.1:4173/';
const TAM = { width: 1920, height: 1080 };

// [nombre, tipo, duración en s, detalle]; tipo «escena» usa escenas/index.html, «pwa» graba la plataforma real.
const PARTES = [
  ['e1', 'escena', 6],
  ['e2', 'escena', 9],
  ['e3', 'escena', 8],
  ['p_portada', 'pwa', 8, { hash: '#/', texto: 'Portada viva: elige qué quieres crear y sigue los pasos en orden', clic: [521, 171] }],
  ['p_curso', 'pwa', 6, { hash: '#/curso/blender_principiante', texto: 'Cuatro niveles de Blender, de tu primer cubo a proyectos completos' }],
  ['p_leccion', 'pwa', 8, { hash: '#/curso/blender_principiante/leccion/bp1_gancho', texto: 'Lecciones de menos de diez minutos, con actividades', bajar: 1700 }],
  ['p_practica', 'pwa', 6, { hash: '#/curso/blender_principiante/leccion/bp1_practica', texto: 'Cada módulo cierra con una práctica real en Blender', bajar: 900 }],
  ['p_jefe', 'pwa', 5, { hash: '#/curso/blender_principiante/leccion/bp1_jefe', texto: 'El «jefe final» del módulo: al vencerlo ganas la insignia', bajar: 500 }],
  ['p_estudio', 'pwa', 8, { hash: '#/estudio', texto: 'Estudio A‑Frame: escribe una escena 3D y mírala al instante', plantilla: 'Sistema solar' }],
  ['e4', 'escena', 9],
  ['p_blender', 'pwa', 6, { hash: '#/blender', texto: 'Amatista Motor: conecta Blender con tu cuenta en un clic', bajar: 600 }],
  ['e5', 'escena', 10],
  ['e6', 'escena', 10],
  ['p_panel', 'pwa', 6, { hash: '#/panel', texto: 'Mi panel: tu avance y tu racha, también sin conexión (alumno de demostración)', bajar: 500 }],
  ['e7', 'escena', 8],
  ['e8', 'escena', 9],
  ['e9', 'escena', 7],
];

const CAPTION = `
  #video-caption { position: fixed; left: 50%; bottom: 46px; transform: translateX(-50%); z-index: 2147483647;
    padding: 18px 34px; background: rgb(18 18 18 / .9); border: 1px solid rgb(0 229 255 / .55); color: #f1eef6;
    font: 600 30px Outfit, system-ui, sans-serif; letter-spacing: .01em; white-space: nowrap;
    clip-path: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
    animation: cap .6s cubic-bezier(.2,.8,.2,1) both; }
  @keyframes cap { from { opacity: 0; transform: translate(-50%, 24px); } to { opacity: 1; transform: translate(-50%, 0); } }`;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// Alumno de DEMOSTRACIÓN: avance sembrado en el navegador para que las lecciones se abran en orden y
// «Mi panel» muestre algo. No son datos de alumnos reales (GUION.md lo dice en pantalla).
const HECHAS = ['blender_principiante:bp1_gancho', 'blender_principiante:bp1_blender', 'blender_principiante:bp1_explora',
  'blender_principiante:bp1_practica', 'aframe:les_af_001'];
async function sembrarAlumno(pagina, base) {
  await pagina.goto(base, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await pagina.evaluate((hechas) => new Promise((resolver, rechazar) => {
    const ahora = new Date().toISOString();
    const lecciones = Object.fromEntries(hechas.map((k, i) => [k, { completada: true, intentos: 1, puntaje: 100,
      actualizadoEn: ahora, completadaEn: new Date(Date.now() - (hechas.length - i) * 86400000).toISOString() }]));
    const dia = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
    const estado = { version: 2, alumnoId: 'alumno_demostracion', cuentaId: null, lecciones, insignias: {},
      actividad: { [dia(4)]: 1, [dia(3)]: 2, [dia(1)]: 1, [dia(0)]: 1 }, pendientes: [], insigniasPendientes: [],
      eventos: [], marcas: { dia: null, sesiones: [], eventoSync: null, sincronizado: null, descargado: null, descargaCompleta: null } };
    const peticion = indexedDB.open('amatista', 1);
    peticion.onupgradeneeded = () => peticion.result.createObjectStore('estado');
    peticion.onerror = () => rechazar(peticion.error);
    peticion.onsuccess = () => {
      const tx = peticion.result.transaction('estado', 'readwrite');
      tx.objectStore('estado').put(estado, 'progreso');
      tx.oncomplete = () => { peticion.result.close(); resolver(); };
      tx.onerror = () => rechazar(tx.error);
    };
  }), HECHAS);
}

async function grabar(navegador, nombre, preparar, duracion, actuar) {
  const dir = path.join(CLIPS, 'tmp_' + nombre);
  fs.rmSync(dir, { recursive: true, force: true });
  const ctx = await navegador.newContext({ viewport: TAM, recordVideo: { dir, size: TAM }, locale: 'es-MX' });
  const inicio = Date.now();
  const pagina = await ctx.newPage();
  await preparar(pagina);
  const desfase = (Date.now() - inicio) / 1000;
  await actuar(pagina);
  await esperar(duracion * 1000 + 400);
  const video = pagina.video();
  await ctx.close();
  const crudo = await video.path();
  const destino = path.join(CLIPS, nombre + '.mp4');
  const fundido = `fade=t=in:st=0:d=0.35,fade=t=out:st=${(duracion - 0.35).toFixed(2)}:d=0.35`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', desfase.toFixed(2), '-i', crudo, '-t', String(duracion),
    '-vf', `fps=30,scale=1920:1080,${fundido}`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-pix_fmt', 'yuv420p', '-an', destino]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('clip', nombre, `${duracion}s`);
  return destino;
}

const CAPTURAS = [
  ['01_portada', '#/'], ['02_curso_blender', '#/curso/blender_principiante'],
  ['03_leccion_blender', '#/curso/blender_principiante/leccion/bp1_gancho'],
  ['04_leccion_practica', '#/curso/blender_principiante/leccion/bp1_practica'],
  ['05_jefe', '#/curso/blender_principiante/leccion/bp1_jefe'], ['06_curso_aframe', '#/curso/aframe'],
  ['07_leccion_aframe_codigo', '#/curso/aframe/leccion/les_af_002'], ['08_estudio_aframe', '#/estudio'],
  ['09_mi_panel', '#/panel'], ['10_blender_addon', '#/blender'], ['11_guia', '#/guia'],
];
const MOVIL = ['01_portada', '03_leccion_blender', '09_mi_panel'];

async function capturas(navegador) {
  const dir = path.join(AQUI, 'capturas');
  fs.mkdirSync(dir, { recursive: true });
  for (const [ancho, alto, sufijo, movil] of [[1920, 1080, '', false], [390, 844, '_movil', true]]) {
    const ctx = await navegador.newContext({ viewport: { width: ancho, height: alto }, isMobile: movil, hasTouch: movil,
      locale: 'es-MX' });
    const p = await ctx.newPage();
    await sembrarAlumno(p, PWA);
    for (const [nombre, hash] of CAPTURAS) {
      if (movil && !MOVIL.includes(nombre)) continue;
      await p.goto(PWA + hash, { waitUntil: 'networkidle' }).catch(() => {});
      await p.reload({ waitUntil: 'networkidle' }).catch(() => {});
      await esperar(2500);
      await p.screenshot({ path: path.join(dir, `${nombre}${sufijo}.jpg`), type: 'jpeg', quality: 88 });
      console.log('captura', nombre + sufijo);
    }
    await ctx.close();
  }
}

async function fotogramas(navegador) {
  fs.mkdirSync(FOTOGRAMAS, { recursive: true });
  const pagina = await navegador.newPage({ viewport: TAM });
  for (const [nombre, tipo] of PARTES) {
    if (tipo !== 'escena') continue;
    await pagina.goto(`${ESCENAS}?play&e=${nombre.slice(1)}`);
    await esperar(6500);
    await pagina.screenshot({ path: path.join(FOTOGRAMAS, `${nombre}.jpg`), type: 'jpeg', quality: 90 });
    console.log('fotograma', nombre);
  }
  await pagina.close();
}

async function principal() {
  const navegador = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  await fotogramas(navegador);
  if (args.includes('--solo-fotogramas')) return navegador.close();
  await capturas(navegador);
  fs.mkdirSync(CLIPS, { recursive: true });
  const lista = [];
  for (const [nombre, tipo, duracion, d] of PARTES) {
    if (tipo === 'escena') {
      lista.push(await grabar(navegador, nombre, async (p) => {
        await p.goto(`${ESCENAS}?e=${nombre.slice(1)}`);
        await p.evaluate(() => document.fonts.ready);
        await esperar(300);
      }, duracion, (p) => p.evaluate(() => window.correr())));
    } else {
      lista.push(await grabar(navegador, nombre, async (p) => {
        await sembrarAlumno(p, PWA);
        await p.goto(PWA + d.hash, { waitUntil: 'networkidle' }).catch(() => {});
        await p.reload({ waitUntil: 'networkidle' }).catch(() => {});
        await esperar(2200);
        await p.addStyleTag({ content: CAPTION });
      }, duracion, async (p) => {
        await p.evaluate((texto) => {
          const c = document.createElement('div');
          c.id = 'video-caption';
          c.textContent = texto;
          document.body.appendChild(c);
        }, d.texto);
        if (d.clic) {
          for (let i = 0; i <= 20; i++) await p.mouse.move(400 + i * 40, 300 + Math.sin(i / 3) * 120);
          await p.mouse.click(...d.clic);
        }
        if (d.plantilla) await p.getByText(d.plantilla, { exact: true }).first().click().catch(() => {});
        if (d.bajar) {
          await p.evaluate(([px, ms]) => {
            const desde = window.scrollY, t0 = performance.now();
            const paso = (t) => { const k = Math.min(1, (t - t0) / ms); const e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
              window.scrollTo(0, desde + px * e); if (k < 1) requestAnimationFrame(paso); };
            requestAnimationFrame(paso);
          }, [d.bajar, (duracion - 1.5) * 1000]);
        }
      }));
    }
  }
  await navegador.close();
  const listaTxt = path.join(SALIDA, 'lista.txt');
  fs.writeFileSync(listaTxt, lista.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
  const final = path.join(SALIDA, 'amatista_hack4edu_borrador.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listaTxt,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', final]);
  const segundos = PARTES.reduce((s, p) => s + p[2], 0);
  console.log(`\nListo: ${final} (${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')})`);
}

principal().catch((e) => { console.error(e); process.exit(1); });
