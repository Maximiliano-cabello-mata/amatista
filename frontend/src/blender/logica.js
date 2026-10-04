// Lógica pura de la integración con Blender (pruebas en logica.test.js).

export const SISTEMAS = {
  windows: { id: 'windows', nombre: 'Windows', lanzador: 'Instalar Amatista.bat', pista: 'Doble clic en «Instalar Amatista».' },
  macos: {
    id: 'macos',
    nombre: 'macOS',
    lanzador: 'Instalar Amatista.command',
    pista: 'Clic derecho en «Instalar Amatista» › Abrir (la primera vez macOS lo pide).',
  },
  linux: { id: 'linux', nombre: 'Linux', lanzador: 'instalar-amatista.sh', pista: 'En una terminal: bash instalar-amatista.sh' },
};

// Blender 4.2 es la primera versión con extensiones (blender_manifest.toml).
export const BLENDER_MINIMO = '4.2';

// Sistema del visitante a partir del navegador. null en celulares y tabletas:
// Blender solo corre en computadores.
export function detectarSistema({ userAgent = '', plataforma = '' } = {}) {
  const texto = `${plataforma} ${userAgent}`.toLowerCase();
  if (/android|iphone|ipad|ipod|mobile/.test(texto)) return null;
  if (texto.includes('win')) return 'windows';
  if (texto.includes('mac')) return 'macos';
  if (texto.includes('linux') || texto.includes('x11') || texto.includes('cros')) return 'linux';
  return null;
}

// "abcd 2345" → "ABCD-2345"; null si no tiene la forma de un código.
export function normalizarCodigo(texto = '') {
  const limpio = String(texto).replace(/[\s-]/g, '').toUpperCase();
  if (!/^[A-Z0-9]{8}$/.test(limpio)) return null;
  return `${limpio.slice(0, 4)}-${limpio.slice(4)}`;
}

// "4.2.3" ≥ "4.2"; textos raros cuentan como 0.
export function compararVersiones(a = '', b = '') {
  const partes = (v) => String(v).split('.').map((n) => Number.parseInt(n, 10) || 0);
  const [x, y] = [partes(a), partes(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) {
    const diferencia = (x[i] ?? 0) - (y[i] ?? 0);
    if (diferencia) return Math.sign(diferencia);
  }
  return 0;
}

export const blenderCompatible = (version) => compararVersiones(version, BLENDER_MINIMO) >= 0;

// Pasos de la práctica con su estado para dibujarlos en la lección:
//   pasos: [{id, titulo}] (del servidor) o textos (bloque.steps, sin conexión)
//   progreso: fila de /mi-progreso (objetivos cumplidos y paso actual)
export function pasosConEstado(pasos = [], progreso = null) {
  const cumplidos = new Set(progreso?.objetivos ?? []);
  const completa = Boolean(progreso?.completada);
  return pasos.map((paso, indice) => {
    const id = typeof paso === 'string' ? `paso-${indice}` : paso.id;
    const titulo = typeof paso === 'string' ? paso : paso.titulo;
    let estado = 'pendiente';
    if (completa || cumplidos.has(id)) estado = 'completado';
    else if (progreso?.paso_actual === id) estado = 'actual';
    return { id, titulo, estado };
  });
}

const TEXTOS_AUTONOMIA = {
  autonoma: 'Sin pistas: ¡autonomía!',
  con_pistas: 'Con pistas',
  con_guia: 'Con la guía paso a paso',
};

export const textoAutonomia = (autonomia) => TEXTOS_AUTONOMIA[autonomia] ?? null;

// Mensaje corto del estado de una práctica para tarjetas y listas.
export function resumenPractica(progreso) {
  if (!progreso) return 'Sin empezar';
  if (progreso.completada) return 'Completada';
  if (!progreso.intentos) return 'Abierta: continúa en Blender';
  return `${progreso.progreso} % en Blender`;
}
