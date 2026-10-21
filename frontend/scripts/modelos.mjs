// Modelos GLB low poly del curso de A-Frame (public/modelos/*.glb).
// Los genera este script, sin Blender ni dependencias: así el repositorio no
// guarda binarios de origen desconocido y cualquiera puede regenerarlos.
//   npm run modelos
// Cada figura es una lista de partes {forma, color, ...}; cada cara lleva su
// propia normal (sombreado plano, el estilo low poly de Amatista).
// Unidades en metros y el eje Y hacia arriba, como en glTF y A-Frame.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SALIDA = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'modelos');

// --- Geometría --------------------------------------------------------------

const resta = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unitario = (v) => {
  const largo = Math.hypot(...v) || 1;
  return v.map((x) => x / largo);
};

// Triángulos [[a, b, c], …] en sentido antihorario visto desde fuera.
function anillo(radio, y, lados, giro = 0) {
  return Array.from({ length: lados }, (_, i) => {
    const angulo = giro + (i / lados) * Math.PI * 2;
    return [Math.cos(angulo) * radio, y, Math.sin(angulo) * radio];
  });
}

// Prisma o tronco de cono entre dos anillos, con tapas.
function tronco({ radioAbajo, radioArriba, abajo, arriba, lados, giro = 0 }) {
  const a = anillo(radioAbajo, abajo, lados, giro);
  const b = anillo(radioArriba, arriba, lados, giro);
  const caras = [];
  for (let i = 0; i < lados; i += 1) {
    const j = (i + 1) % lados;
    caras.push([a[i], b[j], a[j]], [a[i], b[i], b[j]]);
  }
  const centroAbajo = [0, abajo, 0];
  const centroArriba = [0, arriba, 0];
  for (let i = 0; i < lados; i += 1) {
    const j = (i + 1) % lados;
    caras.push([centroAbajo, a[i], a[j]]);
    if (radioArriba > 0) caras.push([centroArriba, b[j], b[i]]);
  }
  return caras;
}

// Pirámide: anillo abajo y una punta.
function piramide({ radio, abajo, punta, lados, giro = 0 }) {
  const a = anillo(radio, abajo, lados, giro);
  const cima = [0, punta, 0];
  const centro = [0, abajo, 0];
  const caras = [];
  for (let i = 0; i < lados; i += 1) {
    const j = (i + 1) % lados;
    caras.push([a[i], cima, a[j]], [centro, a[i], a[j]]);
  }
  return caras;
}

// Caja centrada en (x, y, z).
function caja({ ancho, alto, fondo, x = 0, y = 0, z = 0 }) {
  const [w, h, d] = [ancho / 2, alto / 2, fondo / 2];
  const v = (sx, sy, sz) => [x + sx * w, y + sy * h, z + sz * d];
  const quad = (p, q, r, s) => [
    [p, q, r],
    [p, r, s],
  ];
  return [
    ...quad(v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1)),
    ...quad(v(1, -1, -1), v(-1, -1, -1), v(-1, 1, -1), v(1, 1, -1)),
    ...quad(v(-1, -1, -1), v(-1, -1, 1), v(-1, 1, 1), v(-1, 1, -1)),
    ...quad(v(1, -1, 1), v(1, -1, -1), v(1, 1, -1), v(1, 1, 1)),
    ...quad(v(-1, 1, 1), v(1, 1, 1), v(1, 1, -1), v(-1, 1, -1)),
    ...quad(v(-1, -1, -1), v(1, -1, -1), v(1, -1, 1), v(-1, -1, 1)),
  ];
}

const mover = (caras, [dx, dy, dz]) => caras.map((cara) => cara.map(([x, y, z]) => [x + dx, y + dy, z + dz]));

// --- Figuras ----------------------------------------------------------------

const FIGURAS = {
  // El cristal de Amatista: una gema de seis caras con su base.
  cristal: [
    { color: [0.61, 0.35, 0.71], caras: tronco({ radioAbajo: 0.22, radioArriba: 0.3, abajo: 0.12, arriba: 0.75, lados: 6 }) },
    { color: [0.76, 0.61, 0.83], caras: piramide({ radio: 0.3, abajo: 0.75, punta: 1.15, lados: 6 }) },
    { color: [0.12, 0.12, 0.14], caras: tronco({ radioAbajo: 0.42, radioArriba: 0.36, abajo: 0, arriba: 0.12, lados: 6, giro: Math.PI / 6 }) },
  ],
  // Un árbol low poly: tronco y dos copas.
  arbol: [
    { color: [0.42, 0.26, 0.15], caras: tronco({ radioAbajo: 0.12, radioArriba: 0.09, abajo: 0, arriba: 0.6, lados: 5 }) },
    { color: [0.18, 0.55, 0.34], caras: piramide({ radio: 0.6, abajo: 0.45, punta: 1.35, lados: 7 }) },
    { color: [0.24, 0.66, 0.42], caras: piramide({ radio: 0.45, abajo: 0.95, punta: 1.8, lados: 7, giro: 0.4 }) },
  ],
  // Una casita: paredes, techo de dos aguas (pirámide de cuatro lados) y puerta.
  casa: [
    { color: [0.93, 0.87, 0.76], caras: caja({ ancho: 1, alto: 0.8, fondo: 1, y: 0.4 }) },
    { color: [0.96, 0.47, 0.16], caras: piramide({ radio: 0.78, abajo: 0.8, punta: 1.45, lados: 4, giro: Math.PI / 4 }) },
    { color: [0.36, 0.22, 0.14], caras: caja({ ancho: 0.24, alto: 0.42, fondo: 0.04, y: 0.21, z: 0.51 }) },
    { color: [0.0, 0.9, 1.0], caras: mover(caja({ ancho: 0.22, alto: 0.2, fondo: 0.04 }), [0.28, 0.52, 0.51]) },
  ],
};

// --- glTF binario -----------------------------------------------------------

function glb(partes) {
  const buffers = [];
  const accessors = [];
  const bufferViews = [];
  const meshes = [];
  const materials = [];
  const nodes = [];
  let desplazamiento = 0;

  const vista = (datos) => {
    bufferViews.push({ buffer: 0, byteOffset: desplazamiento, byteLength: datos.byteLength, target: 34962 });
    buffers.push(Buffer.from(datos.buffer));
    desplazamiento += datos.byteLength;
    return bufferViews.length - 1;
  };

  partes.forEach(({ color, caras }, i) => {
    const posiciones = new Float32Array(caras.length * 9);
    const normales = new Float32Array(caras.length * 9);
    caras.forEach((cara, c) => {
      const normal = unitario(cruz(resta(cara[1], cara[0]), resta(cara[2], cara[0])));
      cara.forEach((punto, v) => {
        posiciones.set(punto, c * 9 + v * 3);
        normales.set(normal, c * 9 + v * 3);
      });
    });
    const min = [0, 1, 2].map((eje) => Math.min(...caras.flat().map((p) => p[eje])));
    const max = [0, 1, 2].map((eje) => Math.max(...caras.flat().map((p) => p[eje])));
    accessors.push({ bufferView: vista(posiciones), componentType: 5126, count: caras.length * 3, type: 'VEC3', min, max });
    accessors.push({ bufferView: vista(normales), componentType: 5126, count: caras.length * 3, type: 'VEC3' });
    materials.push({ pbrMetallicRoughness: { baseColorFactor: [...color, 1], metallicFactor: 0, roughnessFactor: 0.85 } });
    meshes.push({ primitives: [{ attributes: { POSITION: i * 2, NORMAL: i * 2 + 1 }, material: i }] });
    nodes.push({ mesh: i });
  });

  const binario = Buffer.concat(buffers);
  const json = {
    asset: { version: '2.0', generator: 'Amatista scripts/modelos.mjs' },
    scene: 0,
    scenes: [{ nodes: [nodes.length] }],
    nodes: [...nodes, { name: 'modelo', children: nodes.map((_, i) => i) }],
    meshes,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: binario.length }],
  };
  const relleno = (buffer, byte) => Buffer.concat([buffer, Buffer.alloc((4 - (buffer.length % 4)) % 4, byte)]);
  const trozoJson = relleno(Buffer.from(JSON.stringify(json)), 0x20);
  const trozoBin = relleno(binario, 0);
  const cabecera = Buffer.alloc(12);
  cabecera.writeUInt32LE(0x46546c67, 0);
  cabecera.writeUInt32LE(2, 4);
  cabecera.writeUInt32LE(12 + 8 + trozoJson.length + 8 + trozoBin.length, 8);
  const titulo = (largo, tipo) => {
    const b = Buffer.alloc(8);
    b.writeUInt32LE(largo, 0);
    b.writeUInt32LE(tipo, 4);
    return b;
  };
  return Buffer.concat([cabecera, titulo(trozoJson.length, 0x4e4f534a), trozoJson, titulo(trozoBin.length, 0x004e4942), trozoBin]);
}

mkdirSync(SALIDA, { recursive: true });
for (const [nombre, partes] of Object.entries(FIGURAS)) {
  const archivo = join(SALIDA, `${nombre}.glb`);
  const datos = glb(partes);
  writeFileSync(archivo, datos);
  const triangulos = partes.reduce((suma, parte) => suma + parte.caras.length, 0);
  console.log(`${nombre}.glb · ${triangulos} triángulos · ${(datos.length / 1024).toFixed(1)} KB`);
}
