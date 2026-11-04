// Empaqueta Amatista para Windows como una carpeta portátil con Amatista.exe (sin instalador ni wine).
//
//   1. Compila la PWA con la API de producción (VITE_API_URL=https://api.amatista-3d.tech).
//   2. Descarga Electron para win32-x64 (o usa ELECTRON_ZIP si ya lo tienes).
//   3. Lo descomprime, renombra electron.exe → Amatista.exe y deja solo los idiomas español e inglés.
//   4. Copia main.js + package.json + la PWA compilada (con la biblioteca) a resources/app.
//   5. Comprime todo en salida/Amatista-<versión>-win-x64.zip y revisa que quepa en 0.5 GB.
//
// Uso:  cd escritorio && npm ci && node empaquetar.mjs [--con-2k] [--sin-compilar]
// Necesita los comandos `unzip` y `zip` (Linux, macOS o Git Bash en Windows) y Python 3 con numpy y
// Pillow si se pide --con-2k (genera las texturas en 2K).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const FRONTEND = path.join(RAIZ, 'frontend');
const SALIDA = path.join(AQUI, 'salida');
const paquete = JSON.parse(fs.readFileSync(path.join(AQUI, 'package.json'), 'utf8'));
const ELECTRON = process.env.ELECTRON_VERSION ?? '33.2.1';
const LIMITE = 512 * 1024 * 1024; // medio gigabyte
const IDIOMAS = new Set(['es.pak', 'es-419.pak', 'en-US.pak']);
const con2k = process.argv.includes('--con-2k');

const correr = (cmd, args, opciones = {}) => execFileSync(cmd, args, { stdio: 'inherit', ...opciones });
const peso = (dir) => {
  let total = 0;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    total += f.isDirectory() ? peso(p) : fs.statSync(p).size;
  }
  return total;
};
const mb = (b) => `${(b / 1048576).toFixed(1)} MB`;

async function zipDeElectron() {
  if (process.env.ELECTRON_ZIP) return process.env.ELECTRON_ZIP;
  const { downloadArtifact } = await import('@electron/get');
  return downloadArtifact({ version: ELECTRON, platform: 'win32', arch: 'x64', artifactName: 'electron' });
}

if (con2k) correr('python3', [path.join(RAIZ, 'herramientas/biblioteca/generar.py'), '--con-2k'], { cwd: RAIZ });
if (!process.argv.includes('--sin-compilar')) {
  correr('npm', ['run', 'build'], { cwd: FRONTEND, env: { ...process.env, VITE_API_URL: process.env.VITE_API_URL ?? 'https://api.amatista-3d.tech' } });
}

const nombre = `Amatista-${paquete.version}-win-x64`;
const carpeta = path.join(SALIDA, nombre);
fs.rmSync(carpeta, { recursive: true, force: true });
fs.mkdirSync(carpeta, { recursive: true });

const zip = await zipDeElectron();
console.log(`Electron ${ELECTRON}: ${zip}`);
correr('unzip', ['-q', zip, '-d', carpeta]);
fs.renameSync(path.join(carpeta, 'electron.exe'), path.join(carpeta, 'Amatista.exe'));
fs.rmSync(path.join(carpeta, 'resources', 'default_app.asar'), { force: true });
for (const f of fs.readdirSync(path.join(carpeta, 'locales'))) if (!IDIOMAS.has(f)) fs.rmSync(path.join(carpeta, 'locales', f));

const app = path.join(carpeta, 'resources', 'app');
fs.mkdirSync(app, { recursive: true });
fs.copyFileSync(path.join(AQUI, 'main.js'), path.join(app, 'main.js'));
const { devDependencies, scripts, ...paqueteApp } = paquete; // eslint-disable-line no-unused-vars
fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify(paqueteApp, null, 2));
fs.cpSync(path.join(FRONTEND, 'dist'), path.join(app, 'dist'), { recursive: true });
fs.writeFileSync(path.join(carpeta, 'LEEME.txt'), [
  'Amatista de escritorio',
  '',
  'Abre Amatista.exe. No necesita instalarse: puedes llevar esta carpeta en una USB.',
  'Funciona sin conexión; para entrar a tu cuenta y sincronizar tu progreso necesita internet.',
  'Geoda (menú Herramientas, o #/geoda) ajusta Amatista y Blender a tu equipo.',
  'La biblioteca de recursos (#/biblioteca) trae texturas, modelos y animaciones CC0.',
  '',
  'Windows puede avisar que el programa no está firmado: «Más información» → «Ejecutar de todas formas».',
  '',
].join('\r\n'));

const zipFinal = path.join(SALIDA, `${nombre}.zip`);
fs.rmSync(zipFinal, { force: true });
correr('zip', ['-qr9', zipFinal, nombre], { cwd: SALIDA });

const resumen = {
  carpeta: peso(carpeta),
  electron: peso(carpeta) - peso(app),
  pwa: peso(path.join(app, 'dist')) - peso(path.join(app, 'dist', 'biblioteca')),
  biblioteca: peso(path.join(app, 'dist', 'biblioteca')),
  zip: fs.statSync(zipFinal).size,
};
console.log(`\nAmatista para Windows (${nombre})`);
console.log(`  Electron (Chromium + Node):  ${mb(resumen.electron)}`);
console.log(`  PWA + Geoda:                 ${mb(resumen.pwa)}`);
console.log(`  Biblioteca de recursos:      ${mb(resumen.biblioteca)}`);
console.log(`  Total instalado:             ${mb(resumen.carpeta)}  (límite ${mb(LIMITE)})`);
console.log(`  Descarga (.zip):             ${mb(resumen.zip)}`);
fs.writeFileSync(path.join(SALIDA, 'peso.json'), JSON.stringify({ version: paquete.version, electron: ELECTRON, con2k, bytes: resumen }, null, 2));
if (resumen.carpeta > LIMITE) { console.error('¡Se pasa de medio gigabyte!'); process.exit(1); }
