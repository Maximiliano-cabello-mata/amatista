// Amatista de escritorio: la misma PWA dentro de una ventana propia, sin instalar nada.
//
// La app se sirve desde un servidor local en 127.0.0.1 (no con file://) para que el service
// worker, IndexedDB y la caché de la biblioteca funcionen igual que en el navegador. El puerto es
// fijo para que la caché y el progreso sobrevivan entre aperturas: el "origen" no cambia.
const { app, BrowserWindow, shell, Menu } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PUERTO = 47821;
// Si Windows bloquea la gráfica (drivers viejos, equipos modestos), el 3D sigue con WebGL por
// software en vez de quedarse en negro. Es seguro aquí: solo se carga contenido propio de 127.0.0.1.
app.commandLine.appendSwitch('enable-unsafe-swiftshader');

const RAIZ = path.join(__dirname, 'dist');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json', '.wasm': 'application/wasm', '.zip': 'application/zip', '.txt': 'text/plain; charset=utf-8',
};

function servidor() {
  return http.createServer((pet, res) => {
    let ruta = decodeURIComponent(new URL(pet.url, 'http://x').pathname);
    if (ruta.endsWith('/')) ruta += 'index.html';
    const archivo = path.normalize(path.join(RAIZ, ruta));
    // Nunca salir de dist/.
    if (!archivo.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
    fs.stat(archivo, (error, info) => {
      const final = !error && info.isFile() ? archivo : path.join(RAIZ, 'index.html');
      const tipo = TIPOS[path.extname(final).toLowerCase()] ?? 'application/octet-stream';
      const cabeceras = { 'Content-Type': tipo, 'X-Content-Type-Options': 'nosniff' };
      if (final.endsWith('sw.js') || final.endsWith('index.html')) cabeceras['Cache-Control'] = 'no-cache';
      res.writeHead(200, cabeceras);
      fs.createReadStream(final).pipe(res);
    });
  });
}

function escuchar(srv, puerto) {
  return new Promise((ok, mal) => {
    srv.once('error', mal);
    srv.listen(puerto, '127.0.0.1', () => ok(srv.address().port));
  });
}

async function arrancar() {
  let puerto;
  try { puerto = await escuchar(servidor(), PUERTO); }
  catch { puerto = await escuchar(servidor(), 0); } // Puerto ocupado por otra cosa: uno libre (la caché empieza de cero).

  Menu.setApplicationMenu(null);
  const ventana = new BrowserWindow({
    width: 1366, height: 860, minWidth: 380, minHeight: 600,
    backgroundColor: '#16131c', title: 'Amatista', autoHideMenuBar: true, show: false,
    icon: path.join(RAIZ, 'icons', 'pwa-512.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false },
  });
  const origen = `http://127.0.0.1:${puerto}`;
  // Los enlaces de fuera (Blender, Poly Haven, GitHub…) se abren en el navegador del sistema.
  ventana.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  ventana.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(origen)) { e.preventDefault(); shell.openExternal(url); } });
  ventana.once('ready-to-show', () => ventana.show());
  await ventana.loadURL(`${origen}/`);
}

// Una sola ventana: si ya está abierta, se trae al frente.
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { const v = BrowserWindow.getAllWindows()[0]; if (v) { if (v.isMinimized()) v.restore(); v.focus(); } });
  app.whenReady().then(arrancar);
  app.on('window-all-closed', () => app.quit());
}
