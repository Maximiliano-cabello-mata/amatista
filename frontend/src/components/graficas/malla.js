// Mallas low poly para el visor «mesh_viewer» (VisorMalla.jsx), sin WebGL.
// Funciones puras: generan las primitivas de Blender con sus mismas cuentas
// de vértices, aristas y caras, y proyectan la malla a 2D para dibujarla en
// SVG. Ejes como en Blender: X a la derecha, Y hacia el fondo, Z arriba.
// Las caras van en sentido antihorario vistas desde fuera (normal hacia afuera).

export const FORMAS = ['cube', 'plane', 'cylinder', 'cone', 'uv_sphere', 'ico_sphere', 'torus', 'custom'];
export const MAX_CARAS = 600;

const restar = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const punto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// Normal de un polígono (método de Newell): sirve también para caras de más
// de tres lados que no son del todo planas.
export function normalCara(vertices, cara) {
  let nx = 0;
  let ny = 0;
  let nz = 0;
  for (let i = 0; i < cara.length; i++) {
    const a = vertices[cara[i]];
    const b = vertices[cara[(i + 1) % cara.length]];
    nx += (a[1] - b[1]) * (a[2] + b[2]);
    ny += (a[2] - b[2]) * (a[0] + b[0]);
    nz += (a[0] - b[0]) * (a[1] + b[1]);
  }
  const largo = Math.hypot(nx, ny, nz) || 1;
  return [nx / largo, ny / largo, nz / largo];
}

function centroCara(vertices, cara) {
  const c = [0, 0, 0];
  for (const i of cara) for (let k = 0; k < 3; k++) c[k] += vertices[i][k];
  return c.map((v) => v / cara.length);
}

// Voltea las caras cuya normal apunta hacia `referencia(centro)`.
function orientar(vertices, caras, referencia) {
  return caras.map((cara) => {
    const centro = centroCara(vertices, cara);
    const n = normalCara(vertices, cara);
    return punto(n, restar(centro, referencia(centro))) < 0 ? [...cara].reverse() : cara;
  });
}

const entero = (valor, minimo, maximo, porDefecto) =>
  Number.isInteger(valor) ? Math.min(maximo, Math.max(minimo, valor)) : porDefecto;

function cubo() {
  const vertices = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) vertices.push([x, y, z]);
  // índice = x*4 + y*2 + z (cada eje 0 o 1)
  const caras = [
    [0, 1, 3, 2],
    [4, 6, 7, 5],
    [0, 4, 5, 1],
    [2, 3, 7, 6],
    [0, 2, 6, 4],
    [1, 5, 7, 3],
  ];
  return { vertices, caras };
}

function plano() {
  return { vertices: [[-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0]], caras: [[0, 1, 2, 3]] };
}

function anillo(n, radio, z) {
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n;
    return [radio * Math.cos(a), radio * Math.sin(a), z];
  });
}

function cilindro(n) {
  const vertices = [...anillo(n, 1, -1), ...anillo(n, 1, 1)];
  const caras = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    caras.push([i, j, n + j, n + i]);
  }
  caras.push(Array.from({ length: n }, (_, i) => n - 1 - i));
  caras.push(Array.from({ length: n }, (_, i) => n + i));
  return { vertices, caras };
}

function cono(n) {
  const vertices = [...anillo(n, 1, -1), [0, 0, 1]];
  const caras = [];
  for (let i = 0; i < n; i++) caras.push([i, (i + 1) % n, n]);
  caras.push(Array.from({ length: n }, (_, i) => n - 1 - i));
  return { vertices, caras };
}

function esferaUV(segmentos, anillos) {
  const vertices = [[0, 0, 1]];
  for (let k = 1; k < anillos; k++) {
    const polar = (Math.PI * k) / anillos;
    vertices.push(...anillo(segmentos, Math.sin(polar), Math.cos(polar)));
  }
  vertices.push([0, 0, -1]);
  const sur = vertices.length - 1;
  const v = (k, i) => 1 + (k - 1) * segmentos + (i % segmentos);
  const caras = [];
  for (let i = 0; i < segmentos; i++) caras.push([0, v(1, i), v(1, i + 1)]);
  for (let k = 1; k < anillos - 1; k++) {
    for (let i = 0; i < segmentos; i++) caras.push([v(k, i), v(k + 1, i), v(k + 1, i + 1), v(k, i + 1)]);
  }
  for (let i = 0; i < segmentos; i++) caras.push([v(anillos - 1, i), sur, v(anillos - 1, i + 1)]);
  return { vertices, caras };
}

function icoesfera(subdivisiones) {
  const t = (1 + Math.sqrt(5)) / 2;
  let vertices = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map((p) => p.map((c) => c / Math.hypot(1, t)));
  let caras = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  // Blender: 1 subdivisión = icosaedro (12 vértices); 2 = 42 vértices.
  for (let s = 1; s < subdivisiones; s++) {
    const medios = new Map();
    const medio = (a, b) => {
      const clave = a < b ? `${a}_${b}` : `${b}_${a}`;
      if (!medios.has(clave)) {
        const m = vertices[a].map((c, k) => (c + vertices[b][k]) / 2);
        const largo = Math.hypot(...m);
        vertices = [...vertices, m.map((c) => c / largo)];
        medios.set(clave, vertices.length - 1);
      }
      return medios.get(clave);
    };
    caras = caras.flatMap(([a, b, c]) => {
      const ab = medio(a, b);
      const bc = medio(b, c);
      const ca = medio(c, a);
      return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]];
    });
  }
  return { vertices, caras };
}

function toroide(mayor, menor) {
  const R = 1;
  const r = 0.25;
  const vertices = [];
  for (let i = 0; i < mayor; i++) {
    const a = (2 * Math.PI * i) / mayor;
    for (let j = 0; j < menor; j++) {
      const b = (2 * Math.PI * j) / menor;
      const d = R + r * Math.cos(b);
      vertices.push([d * Math.cos(a), d * Math.sin(a), r * Math.sin(b)]);
    }
  }
  const v = (i, j) => (i % mayor) * menor + (j % menor);
  const caras = [];
  for (let i = 0; i < mayor; i++) for (let j = 0; j < menor; j++) caras.push([v(i, j), v(i + 1, j), v(i + 1, j + 1), v(i, j + 1)]);
  return { vertices, caras };
}

const centroide = (vertices) => {
  const c = [0, 0, 0];
  for (const p of vertices) for (let k = 0; k < 3; k++) c[k] += p[k];
  return c.map((v) => v / (vertices.length || 1));
};

// Malla de un bloque {shape, segments, rings, subdivisions, mesh}.
// Devuelve {vertices, caras, aristas} o null si la malla no sirve.
export function crearMalla({ shape = 'cube', segments, rings, subdivisions, mesh } = {}) {
  let base;
  switch (shape) {
    case 'plane':
      base = plano();
      break;
    case 'cylinder':
      base = cilindro(entero(segments, 3, 64, 16));
      break;
    case 'cone':
      base = cono(entero(segments, 3, 64, 16));
      break;
    case 'uv_sphere': {
      const s = entero(segments, 3, 48, 16);
      base = esferaUV(s, Math.min(entero(rings, 3, 24, 8), Math.floor(MAX_CARAS / s)));
      break;
    }
    case 'ico_sphere':
      base = icoesfera(entero(subdivisions, 1, 3, 2));
      break;
    case 'torus': {
      const m = entero(segments, 3, 48, 24);
      base = toroide(m, Math.min(entero(rings, 3, 24, 8), Math.floor(MAX_CARAS / m)));
      break;
    }
    case 'custom':
      base = mallaPropia(mesh);
      if (!base) return null;
      break;
    default:
      base = cubo();
  }
  let { vertices, caras } = base;
  if (shape === 'torus') {
    caras = orientar(vertices, caras, ([x, y]) => {
      const d = Math.hypot(x, y) || 1;
      return [x / d, y / d, 0];
    });
  } else if (shape !== 'plane' && shape !== 'custom') {
    const c = centroide(vertices);
    caras = orientar(vertices, caras, () => c);
  }
  return { vertices, caras, aristas: aristasDe(caras), dobleCara: shape === 'plane' || shape === 'custom' };
}

function mallaPropia(mesh) {
  const vertices = mesh?.vertices;
  const caras = mesh?.faces;
  if (!Array.isArray(vertices) || !Array.isArray(caras) || !caras.length || caras.length > MAX_CARAS) return null;
  if (!vertices.every((p) => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite))) return null;
  if (!caras.every((c) => Array.isArray(c) && c.length >= 3 && c.every((i) => Number.isInteger(i) && i >= 0 && i < vertices.length))) {
    return null;
  }
  return { vertices, caras };
}

// Aristas únicas [a, b] (a < b) a partir del contorno de cada cara.
export function aristasDe(caras) {
  const vistas = new Map();
  for (const cara of caras) {
    for (let i = 0; i < cara.length; i++) {
      const a = cara[i];
      const b = cara[(i + 1) % cara.length];
      const clave = a < b ? `${a}_${b}` : `${b}_${a}`;
      if (!vistas.has(clave)) vistas.set(clave, a < b ? [a, b] : [b, a]);
    }
  }
  return [...vistas.values()];
}

// Las cifras del panel «Estadísticas» de Blender.
export function estadisticas(malla) {
  return {
    vertices: malla.vertices.length,
    aristas: malla.aristas.length,
    caras: malla.caras.length,
    triangulos: malla.caras.reduce((t, c) => t + c.length - 2, 0),
  };
}

// Luz desde la cámara, arriba a la izquierda (en coordenadas de la vista).
const LUZ = (() => {
  const l = [-0.45, -1, 0.65];
  const largo = Math.hypot(...l);
  return l.map((c) => c / largo);
})();

// Proyecta la malla vista desde la cámara. `giro` gira alrededor de Z y
// `inclinacion` levanta la cámara (radianes; 90° = vista superior).
// Devuelve los puntos 2D y las caras ordenadas del fondo hacia el frente
// (algoritmo del pintor), con su luz (0..1) y si miran a la cámara.
export function proyectar(malla, { giro = 0, inclinacion = 0.5, ancho = 320, alto = 240, perspectiva = true } = {}) {
  const c = centroide(malla.vertices);
  const radio = Math.max(...malla.vertices.map((p) => Math.hypot(...restar(p, c)))) || 1;
  const escala = (Math.min(ancho, alto) * 0.4) / radio;
  const distancia = radio * 4.5;
  const [sg, cg, si, ci] = [Math.sin(giro), Math.cos(giro), Math.sin(inclinacion), Math.cos(inclinacion)];
  // (x, profundidad, arriba): rotación propia, así las normales giran igual.
  const rotar = ([x, y, z]) => {
    const rx = x * cg - y * sg;
    const ry = x * sg + y * cg;
    return [rx, ry * ci - z * si, ry * si + z * ci];
  };
  const vista = malla.vertices.map((p) => rotar(restar(p, c)));
  const camara = [0, -distancia, 0];
  const puntos = vista.map(([x, p, u]) => {
    const f = perspectiva ? distancia / (distancia + p) : 1;
    return { x: ancho / 2 + x * f * escala, y: alto / 2 - u * f * escala, p };
  });
  const caras = malla.caras.map((cara, i) => {
    const n = rotar(normalCara(malla.vertices, cara));
    const centro = centroCara(vista, cara);
    const mira = punto(n, restar(camara, centro));
    // Plano y mallas propias: se ven por los dos lados (como en Blender).
    const frente = malla.dobleCara || mira > 0;
    const luz = punto(n, LUZ) * (mira < 0 && malla.dobleCara ? -1 : 1);
    return {
      i,
      puntos: cara.map((v) => `${puntos[v].x.toFixed(1)},${puntos[v].y.toFixed(1)}`).join(' '),
      profundidad: centro[1],
      frente,
      luz: frente ? Math.max(0, luz) : 0,
    };
  });
  caras.sort((a, b) => b.profundidad - a.profundidad);
  // Un vértice o una arista se ven si tocan una cara que mira a la cámara.
  const vistos = new Set();
  for (const cara of caras) if (cara.frente) for (const v of malla.caras[cara.i]) vistos.add(v);
  // Para dibujar otras cosas con la misma cámara (rejilla del suelo, ejes).
  const aPantalla = (p, { centrado = true, soloGiro = false } = {}) => {
    const [x, d, u] = rotar(centrado ? restar(p, c) : p);
    const f = perspectiva && !soloGiro ? distancia / (distancia + d) : 1;
    return { x: ancho / 2 + x * f * escala, y: alto / 2 - u * f * escala, p: d };
  };
  // Altura del suelo: la base de la malla (el cubo se apoya en la rejilla).
  const suelo = Math.min(...malla.vertices.map((p) => p[2] - c[2]));
  return { puntos, caras, vistos, aPantalla, radio, suelo };
}

// Arista visible en modo sólido: al menos una cara vecina mira a la cámara.
export function aristasVisibles(malla, proyeccion) {
  const frente = new Set();
  for (const cara of proyeccion.caras) {
    if (!cara.frente) continue;
    const loop = malla.caras[cara.i];
    for (let i = 0; i < loop.length; i++) {
      const a = loop[i];
      const b = loop[(i + 1) % loop.length];
      frente.add(a < b ? `${a}_${b}` : `${b}_${a}`);
    }
  }
  return malla.aristas.map(([a, b]) => frente.has(`${a}_${b}`));
}
