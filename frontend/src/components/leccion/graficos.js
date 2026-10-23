// Recursos gráficos v4.2 (2026-10-23): lo que se aprendía con listas, verdadero/falso y ordenar
// ahora se aprende manipulando la figura. Funciones puras de los tres bloques nuevos (pruebas
// en graficos.test.js):
//   image_choice  «Elige la figura»: las respuestas son figuras 3D dibujadas (figuraMalla)
//   viewport_sim  «Simulador de la vista 3D»: orbitar, acercar y vistas 1, 3, 7 (VISTAS, misiones)
//   keyframe_sim  «Línea de tiempo»: claves de una pelota e interpolación (interpolarClaves)
import { aristasDe, crearMalla, normalCara } from '../graficas/malla';

// --- Figuras -------------------------------------------------------------------------------

const centro = (vertices) => vertices.reduce((s, v) => [s[0] + v[0], s[1] + v[1], s[2] + v[2]], [0, 0, 0]).map((x) => x / vertices.length);

// Cada cara con su normal hacia afuera de su propia pieza (piezas convexas).
function haciaAfuera(vertices, caras) {
  const c = centro(vertices);
  return caras.map((cara) => {
    const n = normalCara(vertices, cara);
    const m = centro(cara.map((i) => vertices[i]));
    return n[0] * (m[0] - c[0]) + n[1] * (m[1] - c[1]) + n[2] * (m[2] - c[2]) < 0 ? [...cara].reverse() : cara;
  });
}

function caja([cx, cy, cz] = [0, 0, 0], [sx, sy, sz] = [1, 1, 1]) {
  const vertices = [];
  for (const z of [-1, 1]) for (const y of [-1, 1]) for (const x of [-1, 1]) vertices.push([cx + x * sx, cy + y * sy, cz + z * sz]);
  const caras = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]];
  return { vertices, caras: haciaAfuera(vertices, caras) };
}

// Cubo con bisel de un segmento: 6 caras grandes, 12 de arista y 8 triángulos en las esquinas.
function cuboBisel(b = 0.28) {
  const esquinas = [];
  for (const z of [-1, 1]) for (const y of [-1, 1]) for (const x of [-1, 1]) esquinas.push([x, y, z]);
  const vertices = [];
  const indice = new Map();
  esquinas.forEach((c, ci) =>
    [0, 1, 2].forEach((k) => {
      indice.set(`${ci}:${k}`, vertices.length);
      vertices.push(c.map((s, j) => (j === k ? s : s * (1 - b))));
    }),
  );
  const v = (ci, k) => indice.get(`${ci}:${k}`);
  const caras = [];
  for (const k of [0, 1, 2]) {
    for (const s of [-1, 1]) {
      const otros = [0, 1, 2].filter((j) => j !== k);
      const lista = esquinas.map((c, ci) => ({ c, ci })).filter(({ c }) => c[k] === s);
      // Orden alrededor de la cara: por ángulo en el plano de los otros dos ejes.
      lista.sort((a, z) => Math.atan2(a.c[otros[1]], a.c[otros[0]]) - Math.atan2(z.c[otros[1]], z.c[otros[0]]));
      caras.push(lista.map(({ ci }) => v(ci, k)));
    }
  }
  esquinas.forEach((c, ci) => caras.push([v(ci, 0), v(ci, 1), v(ci, 2)]));
  for (let a = 0; a < 8; a += 1) {
    for (let z = a + 1; z < 8; z += 1) {
      const dif = [0, 1, 2].filter((j) => esquinas[a][j] !== esquinas[z][j]);
      if (dif.length !== 1) continue;
      const [k, j] = [0, 1, 2].filter((x) => x !== dif[0]);
      caras.push([v(a, k), v(a, j), v(z, j), v(z, k)]);
    }
  }
  return { vertices, caras: haciaAfuera(vertices, caras) };
}

// Varias piezas convexas en una sola malla (cada una orientada por su cuenta).
function unir(...piezas) {
  const vertices = [];
  const caras = [];
  for (const pieza of piezas) {
    const base = vertices.length;
    vertices.push(...pieza.vertices);
    caras.push(...pieza.caras.map((cara) => cara.map((i) => i + base)));
  }
  return { vertices, caras };
}

// Cuña (para el espejo): media figura con un lado inclinado.
function cuna(lado) {
  const s = lado;
  const vertices = [[0, -0.6, -1], [s * 1.4, -0.6, -1], [0, 0.6, -1], [s * 1.4, 0.6, -1], [0, -0.6, 1], [0, 0.6, 1], [s * 0.5, -0.6, 1], [s * 0.5, 0.6, 1]];
  const caras = [[0, 2, 3, 1], [4, 6, 7, 5], [0, 1, 6, 4], [2, 5, 7, 3], [0, 4, 5, 2], [1, 3, 7, 6]];
  return { vertices, caras: haciaAfuera(vertices, caras) };
}

export const FIGURAS = {
  cubo: { nombre: 'Cubo', crear: () => caja() },
  cubo_bisel: { nombre: 'Cubo con bisel', crear: () => cuboBisel() },
  cubo_suave: { nombre: 'Cubo suavizado', crear: () => crearMalla({ shape: 'ico_sphere', subdivisions: 2 }) },
  cilindro: { nombre: 'Cilindro', crear: () => crearMalla({ shape: 'cylinder', segments: 12 }) },
  cono: { nombre: 'Cono', crear: () => crearMalla({ shape: 'cone', segments: 12 }) },
  esfera: { nombre: 'Esfera', crear: () => crearMalla({ shape: 'uv_sphere', segments: 12, rings: 8 }) },
  plano: { nombre: 'Plano', crear: () => crearMalla({ shape: 'plane' }) },
  toro: { nombre: 'Dona (toroide)', crear: () => crearMalla({ shape: 'torus', segments: 16, rings: 8 }) },
  fila_array: { nombre: 'Copias en fila (Array)', crear: () => unir(caja([-2.6, 0, 0], [0.8, 0.8, 0.8]), caja([0, 0, 0], [0.8, 0.8, 0.8]), caja([2.6, 0, 0], [0.8, 0.8, 0.8])) },
  espejo: { nombre: 'Mitad y su reflejo (Espejo)', crear: () => unir(cuna(1), cuna(-1)), espejo: true },
  alambre: { nombre: 'Malla en alambre', crear: () => caja(), alambre: true },
  extruido: { nombre: 'Cara extruida', crear: () => unir(caja([0, 0, -0.4], [1, 1, 0.6]), caja([0, 0, 0.75], [0.5, 0.5, 0.55])) },
};

export const NOMBRES_FIGURA = Object.keys(FIGURAS);

// {vertices, caras, aristas, alambre, espejo} de una figura (cubo si no existe).
export function figuraMalla(nombre) {
  const figura = FIGURAS[nombre] ?? FIGURAS.cubo;
  const malla = figura.crear();
  return { ...malla, aristas: malla.aristas ?? aristasDe(malla.caras), dobleCara: Boolean(malla.dobleCara), alambre: Boolean(figura.alambre), espejo: Boolean(figura.espejo) };
}

// --- Simulador de la vista 3D --------------------------------------------------------------

const mover = (malla, [dx, dy, dz]) => ({ ...malla, vertices: malla.vertices.map(([x, y, z]) => [x + dx, y + dy, z + dz]) });

// La escena del simulador: un cubo, un cono y una esfera sobre el suelo, como al abrir Blender
// con algo más que el cubo. `piezas` dice de qué objeto es cada cara (para su color).
export function escenaSimulador() {
  const partes = [
    { nombre: 'Cubo', color: '#9B59B6', malla: mover(crearMalla({ shape: 'cube' }), [-2.6, 0.6, 0]) },
    { nombre: 'Cono', color: '#F5792A', malla: mover(crearMalla({ shape: 'cone', segments: 10 }), [0.4, -1.4, 0]) },
    { nombre: 'Esfera', color: '#00B8D4', malla: mover(crearMalla({ shape: 'uv_sphere', segments: 12, rings: 7 }), [2.6, 1.2, 0]) },
  ];
  const malla = unir(...partes.map((p) => p.malla));
  const piezas = partes.flatMap((p, i) => p.malla.caras.map(() => i));
  return { ...malla, aristas: aristasDe(malla.caras), dobleCara: false, partes, piezas };
}

const GRADO = Math.PI / 180;
// Vistas del teclado numérico de Blender (giro alrededor de Z, inclinación de la cámara).
export const VISTAS = {
  frente: { tecla: '1', nombre: 'Frente', giro: 0, inclinacion: 0 },
  lado: { tecla: '3', nombre: 'Derecha', giro: -90 * GRADO, inclinacion: 0 },
  arriba: { tecla: '7', nombre: 'Arriba', giro: 0, inclinacion: 89.9 * GRADO },
};
export const MISIONES = {
  orbitar: 'Gira la vista para ver la parte de atrás',
  acercar: 'Acércate a los objetos',
  frente: 'Ponte de frente (tecla 1)',
  arriba: 'Mira desde arriba (tecla 7)',
  lado: 'Mira de lado (tecla 3)',
  encuadrar: 'Encuadra todo de nuevo (tecla Inicio)',
};
export const MISIONES_POR_DEFECTO = ['orbitar', 'acercar', 'frente', 'arriba'];

export const misionesDe = (bloque) => {
  const lista = Array.isArray(bloque?.missions) ? bloque.missions.filter((m) => MISIONES[m]) : [];
  return lista.length ? [...new Set(lista)] : MISIONES_POR_DEFECTO;
};

// Tecla → acción del simulador ('1' frente, '3' lado, '7' arriba, Inicio o '.' encuadrar, + y - zoom).
export function accionDeTecla(tecla) {
  if (tecla === '1') return 'frente';
  if (tecla === '3') return 'lado';
  if (tecla === '7') return 'arriba';
  if (tecla === 'Home' || tecla === '.') return 'encuadrar';
  if (tecla === '+' || tecla === '=') return 'acercar';
  if (tecla === '-') return 'alejar';
  return null;
}

export const limitarInclinacion = (valor) => Math.min(89.9 * GRADO, Math.max(-60 * GRADO, valor));
export const limitarZoom = (valor) => Math.min(3, Math.max(0.5, valor));

// --- Línea de tiempo -----------------------------------------------------------------------

// Claves {cuadro: altura}: la altura en un cuadro cualquiera, con la curva suave de Blender
// (entra y sale despacio de cada clave). Antes de la primera y después de la última se queda quieta.
export function interpolarClaves(claves, cuadro) {
  const lista = Object.entries(claves ?? {})
    .map(([c, h]) => [Number(c), h])
    .sort((a, b) => a[0] - b[0]);
  if (!lista.length) return null;
  if (cuadro <= lista[0][0]) return lista[0][1];
  const ultima = lista[lista.length - 1];
  if (cuadro >= ultima[0]) return ultima[1];
  const i = lista.findIndex(([c]) => c > cuadro);
  const [c0, h0] = lista[i - 1];
  const [c1, h1] = lista[i];
  const t = (cuadro - c0) / (c1 - c0);
  const suave = t * t * (3 - 2 * t);
  return h0 + (h1 - h0) * suave;
}

// ¿Cada meta {frame, height} tiene su clave con una altura parecida? Devuelve [{meta, ok}].
export function revisarClaves(claves, metas, tolerancia = 0.15) {
  return (metas ?? []).map((meta) => {
    const h = claves?.[meta.frame];
    return { meta, ok: typeof h === 'number' && Math.abs(h - meta.height) <= tolerancia };
  });
}

export function textoMeta(meta) {
  const donde = meta.height >= 0.8 ? 'arriba' : meta.height <= 0.2 ? 'en el suelo' : 'a media altura';
  return `Fotograma ${meta.frame}: pelota ${donde}`;
}
