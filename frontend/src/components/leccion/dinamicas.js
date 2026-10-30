// Dinámicas v4.3 (docs/plataforma/14_refinamiento_y_dinamicas.md): la lógica sin React.
//
//   shortcut_drill       «Entrena tus teclas»: pulsa en el navegador las mismas teclas que en Blender
//   transform_challenge  «Ajusta el valor»: lleva el cubo al molde con el campo de Blender (N › Elemento)
//   spot_error           «Encuentra el error»: marca los pasos mal hechos de una receta y entiende por qué
//
// y la vista del cubo que comparten las dos primeras (proyección isométrica de seis caras).

// --- Teclas -------------------------------------------------------------------------------

const NOMBRES = { ' ': 'Espacio', Control: 'Ctrl', Escape: 'Esc', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
const MODIFICADORES = ['Shift', 'Ctrl', 'Alt'];

// «shift + a», «CTRL+R», «tab» → «Shift+A», «Ctrl+R», «Tab» (como lo escribe el autor).
export function normalizarCombinacion(texto) {
  const partes = String(texto ?? '')
    .split('+')
    .map((p) => p.trim())
    .filter(Boolean);
  if (!partes.length) return '';
  const tecla = partes.pop();
  const mods = MODIFICADORES.filter((m) => partes.some((p) => p.toLowerCase() === m.toLowerCase() || (m === 'Ctrl' && /^control$/i.test(p))));
  const base = tecla.length === 1 ? tecla.toUpperCase() : (NOMBRES[tecla] ?? tecla.charAt(0).toUpperCase() + tecla.slice(1).toLowerCase());
  return [...mods, base].join('+');
}

// Un KeyboardEvent → «G», «Shift+A», «Ctrl+R», «Tab». Las teclas modificadoras solas → null.
export function teclaDeEvento(evento) {
  const { key } = evento ?? {};
  if (!key || ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(key)) return null;
  const mods = [];
  if (evento.shiftKey && key.length === 1 && /[a-z]/i.test(key)) mods.push('Shift');
  if (evento.ctrlKey || evento.metaKey) mods.push('Ctrl');
  if (evento.altKey) mods.push('Alt');
  return normalizarCombinacion([...mods, NOMBRES[key] ?? (key === '+' ? 'Plus' : key)].join('+'));
}

// Un intento de la secuencia: {hechas, estado}. estado: sigue · listo · error (se vuelve a empezar).
export function avanzarTeclas(esperadas, hechas, tecla) {
  const lista = (esperadas ?? []).map(normalizarCombinacion);
  if (!tecla) return { hechas, estado: 'sigue' };
  if (lista[hechas.length] === tecla) {
    const nuevas = [...hechas, tecla];
    return { hechas: nuevas, estado: nuevas.length === lista.length ? 'listo' : 'sigue' };
  }
  return { hechas: [], estado: 'error' };
}

// Las teclas del teclado en pantalla (táctil): las que pide la actividad más algunas que suelen
// confundirse en Blender, sin repetir y en un orden estable.
const DISTRACTORES = ['G', 'R', 'S', 'X', 'Y', 'Z', 'Tab', 'E'];
export function tecladoEnPantalla(ejercicios, maximo = 10) {
  const pedidas = [...new Set((ejercicios ?? []).flatMap((e) => (e.keys ?? []).map(normalizarCombinacion)))];
  const resto = DISTRACTORES.filter((t) => !pedidas.includes(t));
  return [...pedidas, ...resto].slice(0, Math.max(maximo, pedidas.length));
}

const EJES = { X: 0, Y: 1, Z: 2 };

// Qué le pasa al cubo con una secuencia de Blender (para verlo al terminar): G mueve, R gira,
// S escala (con eje si viene X, Y o Z), Tab cambia a Modo Edición, Shift+A agrega otro cubo.
export function efectoDeTeclas(teclas) {
  const t = { posicion: [0, 0, 0], giro: [0, 0, 0], escala: [1, 1, 1], edicion: false, copia: false };
  const lista = (teclas ?? []).map(normalizarCombinacion);
  for (let i = 0; i < lista.length; i += 1) {
    const tecla = lista[i];
    const eje = EJES[lista[i + 1]];
    if (tecla === 'G') {
      if (eje === undefined) t.posicion = [0.6, 0.4, 0];
      else t.posicion[eje] = 0.9;
    } else if (tecla === 'R') {
      if (eje === undefined) t.giro = [0, 0, 30];
      else t.giro[eje] = 45;
    } else if (tecla === 'S') {
      if (eje === undefined) t.escala = [1.4, 1.4, 1.4];
      else t.escala[eje] = 1.8;
    } else if (tecla === 'Tab') t.edicion = !t.edicion;
    else if (tecla === 'Shift+A') t.copia = true;
  }
  return t;
}

// --- Ajusta el valor ---------------------------------------------------------------------------

export const PROPIEDADES = {
  location: { nombre: 'Ubicación', unidad: 'm', min: -3, max: 3, paso: 0.1, inicial: 0 },
  rotation: { nombre: 'Rotación', unidad: '°', min: -180, max: 180, paso: 5, inicial: 0 },
  scale: { nombre: 'Escala', unidad: '', min: 0.2, max: 3, paso: 0.1, inicial: 1 },
};

// Los límites del campo: los del bloque o los de la propiedad.
export function campoDe(bloque) {
  const base = PROPIEDADES[bloque?.property] ?? PROPIEDADES.location;
  const min = Number.isFinite(bloque?.min) ? bloque.min : base.min;
  const max = Number.isFinite(bloque?.max) ? bloque.max : base.max;
  const paso = Number.isFinite(bloque?.step) ? bloque.step : base.paso;
  const tolerancia = Number.isFinite(bloque?.tolerance) ? bloque.tolerance : paso / 2 + 1e-9;
  return { ...base, min, max, paso, tolerancia, unidad: bloque?.unit ?? base.unidad };
}

export const dentroDeTolerancia = (valor, meta, tolerancia) =>
  Number.isFinite(Number(valor)) && Math.abs(Number(valor) - Number(meta)) <= tolerancia;

// «Te falta», «te pasaste» o «¡justo!»: la pista que da el campo sin decir el número.
export function pistaValor(valor, meta, tolerancia) {
  if (dentroDeTolerancia(valor, meta, tolerancia)) return 'justo';
  return Number(valor) < Number(meta) ? 'falta' : 'sobra';
}

// La transformación del cubo para una propiedad, un eje y un valor.
export function transformacionDe(propiedad, eje, valor) {
  const t = { posicion: [0, 0, 0], giro: [0, 0, 0], escala: [1, 1, 1] };
  const i = EJES[eje] ?? 2;
  if (propiedad === 'rotation') t.giro[i] = Number(valor) || 0;
  else if (propiedad === 'scale') t.escala[i] = Number(valor) || 0.01;
  else t.posicion[i] = Number(valor) || 0;
  return t;
}

// --- Encuentra el error ------------------------------------------------------------------------

// elegidos: índices que el alumno marcó como mal. correcto: marcó todos los malos y ninguno bueno.
export function revisarErrores(pasos, elegidos) {
  const marcados = new Set(elegidos ?? []);
  const malos = (pasos ?? []).map((p, i) => (p?.wrong ? i : -1)).filter((i) => i >= 0);
  const encontrados = malos.filter((i) => marcados.has(i));
  const falsos = [...marcados].filter((i) => !pasos?.[i]?.wrong);
  return {
    total: malos.length,
    encontrados: encontrados.length,
    falsos: falsos.length,
    correcto: encontrados.length === malos.length && falsos.length === 0,
  };
}

// --- El cubo (isométrico) ----------------------------------------------------------------------

const VERTICES = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];
// Caras con su luz (arriba más clara, como el sombreado sólido de Blender).
const CARAS = [
  { v: [4, 5, 6, 7], luz: 1 },
  { v: [0, 1, 5, 4], luz: 0.72 },
  { v: [1, 2, 6, 5], luz: 0.55 },
  { v: [2, 3, 7, 6], luz: 0.62 },
  { v: [3, 0, 4, 7], luz: 0.5 },
  { v: [0, 3, 2, 1], luz: 0.35 },
];

const rad = (g) => (g * Math.PI) / 180;
function girar([x, y, z], [gx, gy, gz]) {
  let [a, b, c] = [x, y, z];
  [b, c] = [b * Math.cos(rad(gx)) - c * Math.sin(rad(gx)), b * Math.sin(rad(gx)) + c * Math.cos(rad(gx))];
  [a, c] = [a * Math.cos(rad(gy)) + c * Math.sin(rad(gy)), -a * Math.sin(rad(gy)) + c * Math.cos(rad(gy))];
  [a, b] = [a * Math.cos(rad(gz)) - b * Math.sin(rad(gz)), a * Math.sin(rad(gz)) + b * Math.cos(rad(gz))];
  return [a, b, c];
}

// Un punto del mundo (Z arriba, como Blender) en la pantalla: isométrica clásica.
export function proyectar([x, y, z], escala = 40) {
  const px = (x - y) * Math.cos(Math.PI / 6);
  const py = (x + y) * Math.sin(Math.PI / 6) - z;
  return [px * escala, py * escala];
}

// Las caras visibles del cubo transformado, de atrás hacia adelante: [{puntos, luz}].
export function carasDelCubo({ posicion = [0, 0, 0], giro = [0, 0, 0], escala = [1, 1, 1] } = {}, tam = 0.5, px = 40) {
  const mundo = VERTICES.map((v) => {
    const g = girar([v[0] * tam * escala[0], v[1] * tam * escala[1], v[2] * tam * escala[2]], giro);
    return [g[0] + posicion[0], g[1] + posicion[1], g[2] + posicion[2]];
  });
  // Hacia la cámara isométrica: (1, 1, 1) normalizado.
  const vista = [1, 1, 1].map((n) => n / Math.sqrt(3));
  return CARAS.map((cara) => {
    const [a, b, c] = cara.v.map((i) => mundo[i]);
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const largo = Math.hypot(...n) || 1;
    const haciaVista = (n[0] * vista[0] + n[1] * vista[1] + n[2] * vista[2]) / largo;
    const profundidad = cara.v.reduce((s, i) => s + mundo[i][0] + mundo[i][1] + mundo[i][2], 0) / 4;
    return { puntos: cara.v.map((i) => proyectar(mundo[i], px)), luz: cara.luz, visible: haciaVista > 1e-6, profundidad };
  })
    .filter((c) => c.visible)
    .sort((p, q) => p.profundidad - q.profundidad);
}
