// Entornos generados del Motor Web de Amatista: terreno low poly con relieve, cielo, agua y
// objetos repartidos (árboles, rocas, cristales, edificios…) a partir de un tipo y una semilla.
// Aquí solo están los números (alturas, posiciones, colores): componentes.js los vuelve
// geometría con una malla para el terreno y una malla instanciada por pieza, así un bosque de
// cientos de árboles cuesta pocas llamadas de dibujo. Funciones puras: pruebas en motor3d.test.js.
import { crearAzar, entre, semillaDe } from './azar';

// Cada entorno: colores del suelo (de bajo a alto), cielo (arriba, horizonte), niebla, relieve
// (metros), agua (color o null), forma («isla» baja hacia el borde) y qué piezas reparte.
export const ENTORNOS = {
  pradera: {
    nombre: 'Pradera',
    suelo: ['#3d6b35', '#5b8f43', '#86b35c'],
    cielo: ['#5fb4ff', '#d8f0ff'],
    niebla: '#cfe6ff',
    relieve: 1.4,
    agua: null,
    piezas: { arbol: 0.45, roca: 0.25, flor: 0.3 },
  },
  bosque: {
    nombre: 'Bosque',
    suelo: ['#26452a', '#365e33', '#4f7a3c'],
    cielo: ['#7fb2d9', '#d6e6d0'],
    niebla: '#b8cdb5',
    relieve: 2,
    agua: null,
    piezas: { pino: 0.7, roca: 0.2, hongo: 0.1 },
  },
  isla: {
    nombre: 'Isla',
    suelo: ['#d9c38a', '#7fae4f', '#4d7f38'],
    cielo: ['#4fb0ff', '#e2f6ff'],
    niebla: '#d9f0ff',
    relieve: 2.6,
    agua: '#2b86c4',
    forma: 'isla',
    piezas: { palmera: 0.55, roca: 0.45 },
  },
  desierto: {
    nombre: 'Desierto',
    suelo: ['#c38a4f', '#d9a566', '#ebc58d'],
    cielo: ['#f2a65a', '#ffe3b8'],
    niebla: '#f7d7a8',
    relieve: 1.8,
    agua: null,
    piezas: { cactus: 0.6, roca: 0.4 },
  },
  nieve: {
    nombre: 'Montaña nevada',
    suelo: ['#9fb6c9', '#d5e3ee', '#ffffff'],
    cielo: ['#8fb7e6', '#eef5ff'],
    niebla: '#e6eef7',
    relieve: 3,
    agua: null,
    piezas: { pino: 0.6, roca: 0.25, cristal: 0.15 },
  },
  ciudad: {
    nombre: 'Ciudad',
    suelo: ['#3a3a42', '#45454f', '#50505c'],
    cielo: ['#2b2f55', '#f29e7a'],
    niebla: '#6b5f7a',
    relieve: 0,
    agua: null,
    piezas: { edificio: 0.85, arbol: 0.15 },
  },
  cristal: {
    nombre: 'Valle de amatista',
    suelo: ['#2c1d3d', '#4a2d66', '#7d3c98'],
    cielo: ['#120c22', '#5b2c7a'],
    niebla: '#3a2452',
    relieve: 2.2,
    agua: '#00a9c2',
    piezas: { cristal: 0.6, roca: 0.4 },
  },
  espacio: {
    nombre: 'Planeta lejano',
    suelo: ['#2a2238', '#3c2f52', '#5a4778'],
    cielo: ['#04030a', '#1b1340'],
    niebla: null,
    relieve: 2.4,
    agua: null,
    estrellas: true,
    piezas: { cristal: 0.5, roca: 0.5 },
  },
  vacio: {
    nombre: 'Estudio vacío',
    suelo: ['#1e1b26', '#24202e', '#2a2536'],
    cielo: ['#121018', '#2a2536'],
    niebla: null,
    relieve: 0,
    agua: null,
    rejilla: true,
    piezas: {},
  },
};

export const TIPOS_ENTORNO = Object.keys(ENTORNOS);

// Las piezas que se reparten: cuánto espacio piden (radio) y su tamaño base.
export const PIEZAS = {
  arbol: { radio: 1.1, escala: [0.8, 1.3] },
  pino: { radio: 0.9, escala: [0.8, 1.5] },
  palmera: { radio: 1.2, escala: [0.9, 1.3] },
  roca: { radio: 0.7, escala: [0.4, 1.1] },
  flor: { radio: 0.35, escala: [0.6, 1.1] },
  hongo: { radio: 0.4, escala: [0.6, 1.2] },
  cactus: { radio: 0.8, escala: [0.7, 1.3] },
  cristal: { radio: 0.8, escala: [0.6, 1.6] },
  edificio: { radio: 2.2, escala: [0.8, 2.6] },
};

const limitar = (valor, min, max) => Math.min(max, Math.max(min, valor));

// Ruido de valor suave (sin tablas grandes): base del relieve.
function ruido2D(semilla) {
  const s = semillaDe(semilla);
  const valor = (x, z) => {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(z | 0, 668265263) ^ s;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const suave = (t) => t * t * (3 - 2 * t);
  return (x, z) => {
    const x0 = Math.floor(x);
    const z0 = Math.floor(z);
    const fx = suave(x - x0);
    const fz = suave(z - z0);
    const a = valor(x0, z0);
    const b = valor(x0 + 1, z0);
    const c = valor(x0, z0 + 1);
    const d = valor(x0 + 1, z0 + 1);
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
  };
}

// Terreno de (resolucion + 1)² vértices sobre un cuadrado de `tamano` metros centrado en 0.
// `claro`: radio del centro que queda casi plano (ahí se pone la actividad).
export function generarTerreno({ semilla = 1, tamano = 40, resolucion = 32, relieve = 1.5, forma = null, claro = 4 } = {}) {
  const res = limitar(Math.round(resolucion), 4, 96);
  const lado = limitar(Number(tamano) || 40, 8, 200);
  const ruido = ruido2D(semilla);
  const alturas = new Float32Array((res + 1) * (res + 1));
  const paso = lado / res;
  const mitad = lado / 2;
  for (let j = 0; j <= res; j += 1) {
    for (let i = 0; i <= res; i += 1) {
      const x = -mitad + i * paso;
      const z = -mitad + j * paso;
      // Tres octavas: colinas, lomas y piedritas.
      let h = ruido(x / 9, z / 9) * 1 + ruido(x / 4, z / 4) * 0.45 + ruido(x / 1.7, z / 1.7) * 0.15;
      h = (h / 1.6 - 0.35) * relieve * 2;
      const distancia = Math.hypot(x, z);
      if (forma === 'isla') h = h * 0.6 + relieve * 1.2 * (1 - Math.min(1, distancia / (mitad * 0.85)) * 1.7);
      // El claro del centro: plano en y = 0 y una transición suave hasta el relieve.
      const t = limitar((distancia - claro) / Math.max(1, claro), 0, 1);
      alturas[j * (res + 1) + i] = h * t * t;
    }
  }
  const altura = (x, z) => {
    const fi = limitar((x + mitad) / paso, 0, res);
    const fj = limitar((z + mitad) / paso, 0, res);
    const i = Math.min(res - 1, Math.floor(fi));
    const j = Math.min(res - 1, Math.floor(fj));
    const u = fi - i;
    const v = fj - j;
    const a = alturas[j * (res + 1) + i];
    const b = alturas[j * (res + 1) + i + 1];
    const c = alturas[(j + 1) * (res + 1) + i];
    const d = alturas[(j + 1) * (res + 1) + i + 1];
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  };
  return { resolucion: res, tamano: lado, alturas, altura };
}

// Color de un punto del terreno según su altura (del más bajo al más alto de la paleta).
export function colorDeAltura(paleta, h, relieve) {
  if (!paleta?.length) return '#444444';
  if (relieve <= 0) return paleta[1] ?? paleta[0];
  const t = limitar((h / (relieve * 1.4) + 0.5), 0, 0.999);
  return paleta[Math.floor(t * paleta.length)];
}

// Reparte piezas en una rejilla con jitter (parejo, sin amontonarse y barato). `densidad` va de
// 0 a 1; `nivelAgua` evita poner árboles bajo el agua; el claro del centro queda libre.
export function repartirPiezas({ semilla = 1, tamano = 40, densidad = 0.5, piezas = {}, altura = () => 0, claro = 4, nivelAgua = null, maximo = 600 } = {}) {
  const tipos = Object.entries(piezas).filter(([tipo, peso]) => PIEZAS[tipo] && peso > 0);
  if (!tipos.length || densidad <= 0) return [];
  const azar = crearAzar(semillaDe(semilla) + 17);
  const suma = tipos.reduce((total, [, peso]) => total + peso, 0);
  const elegir = () => {
    let r = azar() * suma;
    for (const [tipo, peso] of tipos) {
      r -= peso;
      if (r <= 0) return tipo;
    }
    return tipos[0][0];
  };
  const celda = limitar(4.2 - limitar(densidad, 0, 1) * 2.6, 1.4, 6);
  const mitad = tamano / 2 - 1;
  const resultado = [];
  for (let z = -mitad; z <= mitad && resultado.length < maximo; z += celda) {
    for (let x = -mitad; x <= mitad && resultado.length < maximo; x += celda) {
      if (azar() > 0.35 + densidad * 0.55) continue;
      const tipo = elegir();
      const px = x + entre(azar, -0.45, 0.45) * celda;
      const pz = z + entre(azar, -0.45, 0.45) * celda;
      if (Math.hypot(px, pz) < claro + PIEZAS[tipo].radio) continue;
      const py = altura(px, pz);
      if (nivelAgua !== null && py < nivelAgua + 0.15) continue;
      const [min, max] = PIEZAS[tipo].escala;
      resultado.push({ tipo, x: px, y: py, z: pz, escala: entre(azar, min, max), giro: azar() * Math.PI * 2 });
    }
  }
  return resultado;
}

// Copias de una forma en un patrón (am-generar): fila, rejilla, círculo, espiral o azar.
export const PATRONES = ['fila', 'rejilla', 'circulo', 'espiral', 'azar'];
export function generarPatron({ patron = 'circulo', cantidad = 8, radio = 4, separacion = 1.5, semilla = 1, variar = 0 } = {}) {
  const n = limitar(Math.round(cantidad), 1, 400);
  const azar = crearAzar(semillaDe(semilla));
  const lado = Math.ceil(Math.sqrt(n));
  const puntos = [];
  for (let i = 0; i < n; i += 1) {
    let x;
    let z = 0;
    if (patron === 'fila') x = (i - (n - 1) / 2) * separacion;
    else if (patron === 'rejilla') {
      x = ((i % lado) - (lado - 1) / 2) * separacion;
      z = (Math.floor(i / lado) - (lado - 1) / 2) * separacion;
    } else if (patron === 'espiral') {
      const a = i * 0.6;
      const r = (radio * (i + 1)) / n;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
    } else if (patron === 'azar') {
      x = entre(azar, -radio, radio);
      z = entre(azar, -radio, radio);
    } else {
      const a = (i / n) * Math.PI * 2;
      x = Math.cos(a) * radio;
      z = Math.sin(a) * radio;
    }
    const escala = 1 + (variar ? entre(azar, -variar, variar) : 0);
    puntos.push({ x, z, escala: Math.max(0.1, escala), giro: patron === 'circulo' ? -(i / n) * Math.PI * 2 : variar ? azar() * Math.PI * 2 : 0 });
  }
  return puntos;
}

// Datos completos de un entorno (lo que dibuja am-entorno).
export function datosEntorno({ tipo = 'pradera', semilla = 1, tamano = 40, densidad = 0.5, claro = 4, calidad = 'media' } = {}) {
  const preset = ENTORNOS[tipo] ?? ENTORNOS.pradera;
  const factor = calidad === 'baja' ? 0.5 : calidad === 'alta' ? 1 : 0.75;
  const resolucion = Math.round((calidad === 'baja' ? 20 : calidad === 'alta' ? 48 : 32) * Math.min(1.5, tamano / 40));
  const terreno = generarTerreno({ semilla, tamano, resolucion, relieve: preset.relieve, forma: preset.forma, claro });
  const nivelAgua = preset.agua ? -0.25 : null;
  const piezas = repartirPiezas({
    semilla,
    tamano,
    densidad: densidad * factor,
    piezas: preset.piezas,
    altura: terreno.altura,
    claro,
    nivelAgua,
    maximo: calidad === 'baja' ? 150 : 600,
  });
  return { preset, terreno, piezas, nivelAgua };
}
