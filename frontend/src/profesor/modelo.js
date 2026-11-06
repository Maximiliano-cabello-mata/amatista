// El modelo ligero de una entrega (formato amatista.modelo/1) y compilador de
// código de modelo (Python Blender, A-Frame HTML y JSON declarativo).
//
// En Amatista NO se sube un archivo binario .blend o .glb pesado: se captura
// EL CÓDIGO DEL MODELO (unos pocos bytes o kilobytes) y la interfaz del
// profesor recrea la geometría 3D completa en su navegador.
import { crearMalla } from '../components/graficas/malla.js';

export const FORMATO = 'amatista.modelo/1';
const COORDENADA = 32767;
const GRADOS = Math.PI / 180;

export const PLANTILLAS_CODIGO_MODELO = [
  {
    id: 'tren_python',
    nombre: 'Tren Low-Poly (Código Python Blender)',
    lenguaje: 'python',
    practica_id: 'blender.bp.m1.tren',
    descripcion: 'Script declarativo de Blender (bpy) con chasis, cabina, caldera, chimenea y 4 ruedas.',
    codigo: `# Código del modelo: Tren de juguete Low-Poly (Módulo 1)
import bpy

# Chasis principal y cabina (color: #e74c3c)
bpy.ops.mesh.primitive_cube_add(name="Chasis", location=(0, 0, 0.45), scale=(1.6, 0.65, 0.22), color="#e74c3c")
bpy.ops.mesh.primitive_cube_add(name="Cabina", location=(-0.85, 0, 1.15), scale=(0.65, 0.62, 0.55), color="#c0392b")
bpy.ops.mesh.primitive_cube_add(name="TechoCabina", location=(-0.85, 0, 1.75), scale=(0.72, 0.68, 0.08), color="#f5792a")

# Caldera cilíndrica y chimenea (color: #2c3e50 y #f5792a)
bpy.ops.mesh.primitive_cylinder_add(name="Caldera", location=(0.55, 0, 0.98), rotation=(0, 90, 0), scale=(0.45, 0.45, 0.85), color="#34495e")
bpy.ops.mesh.primitive_cylinder_add(name="Chimenea", location=(1.05, 0, 1.62), scale=(0.16, 0.16, 0.32), color="#f5792a")
bpy.ops.mesh.primitive_cone_add(name="Frente", location=(1.55, 0, 0.45), rotation=(0, 90, 0), scale=(0.35, 0.55, 0.3), color="#00e5ff")

# Cuatro ruedas (color: #9b59b6)
bpy.ops.mesh.primitive_cylinder_add(name="Rueda_DI", location=(0.85, 0.72, 0.32), rotation=(90, 0, 0), scale=(0.32, 0.32, 0.08), color="#9b59b6")
bpy.ops.mesh.primitive_cylinder_add(name="Rueda_DD", location=(0.85, -0.72, 0.32), rotation=(90, 0, 0), scale=(0.32, 0.32, 0.08), color="#9b59b6")
bpy.ops.mesh.primitive_cylinder_add(name="Rueda_TI", location=(-0.85, 0.72, 0.32), rotation=(90, 0, 0), scale=(0.32, 0.32, 0.08), color="#9b59b6")
bpy.ops.mesh.primitive_cylinder_add(name="Rueda_TD", location=(-0.85, -0.72, 0.32), rotation=(90, 0, 0), scale=(0.32, 0.32, 0.08), color="#9b59b6")`,
  },
  {
    id: 'faro_aframe',
    nombre: 'Faro y Cristal en Isla (Código A-Frame HTML)',
    lenguaje: 'aframe',
    practica_id: 'aframe.m1.isla',
    descripcion: 'Escena declarativa A-Frame (<a-scene>) con isla, torre del faro, cúpula y cristal amatista.',
    codigo: `<a-scene>
  <!-- Isla base y plataforma de roca -->
  <a-cylinder id="IslaBase" position="0 0.2 0" radius="2.2" height="0.4" color="#2ecc71"></a-cylinder>
  <a-cylinder id="RocaFaro" position="0 0.55 0" radius="1.1" height="0.35" color="#7f8c8d"></a-cylinder>

  <!-- Torre del faro y linterna -->
  <a-cylinder id="TorreFaro" position="0 1.65 0" radius="0.52" height="1.9" color="#f5792a"></a-cylinder>
  <a-cylinder id="LinternaLuz" position="0 2.8 0" radius="0.42" height="0.45" color="#00e5ff"></a-cylinder>
  <a-cone id="CupulaFaro" position="0 3.35 0" radius-bottom="0.58" height="0.65" color="#9b59b6"></a-cone>

  <!-- Cristal Amatista flotante junto al faro -->
  <a-octahedron id="CristalAmatista" position="1.35 1.4 0.6" radius="0.42" color="#c39bd3"></a-octahedron>
</a-scene>`,
  },
  {
    id: 'mesa_json',
    nombre: 'Mesa de Taller con Lámpara (Código JSON Estructural)',
    lenguaje: 'json',
    practica_id: 'blender.n1.mesa',
    descripcion: 'Receta JSON declarativa con tablero biselado, 4 patas, travesaño y lámpara.',
    codigo: JSON.stringify(
      {
        nombre: 'Mesa de taller con lámpara',
        blender: '4.2 LTS',
        piezas: [
          { nombre: 'Tablero', forma: 'cube', posicion: [0, 0, 0.78], escala: [1.2, 0.7, 0.05], color: '#c67d3b', mods: ['BEVEL'] },
          { nombre: 'Pata_NO', forma: 'cube', posicion: [-1.05, 0.55, 0.38], escala: [0.06, 0.06, 0.38], color: '#8b5a2b' },
          { nombre: 'Pata_NE', forma: 'cube', posicion: [1.05, 0.55, 0.38], escala: [0.06, 0.06, 0.38], color: '#8b5a2b' },
          { nombre: 'Pata_SO', forma: 'cube', posicion: [-1.05, -0.55, 0.38], escala: [0.06, 0.06, 0.38], color: '#8b5a2b' },
          { nombre: 'Pata_SE', forma: 'cube', posicion: [1.05, -0.55, 0.38], escala: [0.06, 0.06, 0.38], color: '#8b5a2b' },
          { nombre: 'Travesano', forma: 'cube', posicion: [0, 0, 0.2], escala: [1.0, 0.05, 0.04], color: '#8b5a2b' },
          { nombre: 'BaseLampara', forma: 'cylinder', posicion: [0.65, 0.25, 0.86], escala: [0.18, 0.18, 0.03], color: '#9b59b6' },
          { nombre: 'PantallaLuz', forma: 'cone', posicion: [0.65, 0.25, 1.18], escala: [0.22, 0.22, 0.18], color: '#00e5ff' },
        ],
      },
      null,
      2,
    ),
  },
];

function aBytes(base64) {
  const texto = atob(base64);
  const bytes = new Uint8Array(texto.length);
  for (let i = 0; i < texto.length; i++) bytes[i] = texto.charCodeAt(i);
  return bytes;
}

function bytesABase64(bytes) {
  let binario = '';
  for (let i = 0; i < bytes.length; i++) binario += String.fromCharCode(bytes[i]);
  return btoa(binario);
}

// Convierte un color hexadecimal (#rrggbb) o nombre básico a [r, g, b] lineal (0..1).
function hexALineal(texto = '#9b59b6') {
  const limpio = String(texto).trim().toLowerCase();
  const mapa = {
    white: '#ffffff',
    red: '#e74c3c',
    orange: '#f5792a',
    yellow: '#f1c40f',
    green: '#2ecc71',
    cyan: '#00e5ff',
    blue: '#3498db',
    purple: '#9b59b6',
    violet: '#c39bd3',
    gray: '#7f8c8d',
    grey: '#7f8c8d',
  };
  const hex = (mapa[limpio] || limpio).replace(/^#/, '');
  const completo = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  if (!/^[0-9a-f]{6}$/i.test(completo)) return [0.55, 0.3, 0.72];
  const srgb = [
    parseInt(completo.slice(0, 2), 16) / 255,
    parseInt(completo.slice(2, 4), 16) / 255,
    parseInt(completo.slice(4, 6), 16) / 255,
  ];
  return srgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
}

function rotarPunto([x, y, z], [rx = 0, ry = 0, rz = 0]) {
  const ax = rx * GRADOS;
  const ay = ry * GRADOS;
  const az = rz * GRADOS;
  // Rotación X
  const y1 = y * Math.cos(ax) - z * Math.sin(ax);
  const z1 = y * Math.sin(ax) + z * Math.cos(ax);
  // Rotación Y
  const x2 = x * Math.cos(ay) + z1 * Math.sin(ay);
  const z2 = -x * Math.sin(ay) + z1 * Math.cos(ay);
  // Rotación Z
  const x3 = x2 * Math.cos(az) - y1 * Math.sin(az);
  const y3 = x2 * Math.sin(az) + y1 * Math.cos(az);
  return [x3, y3, z2];
}

// Convierte una lista de piezas declarativas [{nombre, forma, posicion, rotacion, escala, color, mods}]
// en un diccionario válido del formato amatista.modelo/1.
export function construirModeloDesdePiezas(piezas, { codigoFuente = '', lenguaje = 'codigo', blender = '4.2 LTS (Código)' } = {}) {
  const materiales = [];
  const indiceMat = new Map();
  const mallas = [];

  for (let idx = 0; idx < piezas.length; idx++) {
    const p = piezas[idx];
    const forma = p.forma || 'cube';
    const base = crearMalla({
      shape: forma,
      segments: p.segmentos ?? (forma === 'cylinder' || forma === 'cone' ? 14 : 16),
      rings: p.anillos ?? 8,
      subdivisions: p.subdivisiones ?? 1,
    });
    if (!base) continue;
    const pos = Array.isArray(p.posicion) && p.posicion.length === 3 ? p.posicion.map(Number) : [0, 0, 0];
    const rot = Array.isArray(p.rotacion) && p.rotacion.length === 3 ? p.rotacion.map(Number) : [0, 0, 0];
    const esc = Array.isArray(p.escala) && p.escala.length === 3 ? p.escala.map(Number) : [1, 1, 1];
    const verticesMundo = base.vertices.map(([vx, vy, vz]) => {
      const escalado = [vx * (esc[0] || 1), vy * (esc[1] || 1), vz * (esc[2] || 1)];
      const girado = rotarPunto(escalado, rot);
      return [girado[0] + (pos[0] || 0), girado[1] + (pos[1] || 0), girado[2] + (pos[2] || 0)];
    });
    const triangulos = [];
    for (const cara of base.caras) {
      for (let i = 1; i < cara.length - 1; i++) {
        triangulos.push([cara[0], cara[i], cara[i + 1]]);
      }
    }
    const claveColor = String(p.color || '#9b59b6').toLowerCase();
    if (!indiceMat.has(claveColor)) {
      indiceMat.set(claveColor, materiales.length);
      materiales.push({
        nombre: p.materialNombre || `Material_${materiales.length + 1}`,
        color: Array.isArray(p.color) && p.color.length === 3 ? p.color.map(Number) : hexALineal(claveColor),
      });
    }
    mallas.push({
      nombre: String(p.nombre || `${forma}_${idx + 1}`).slice(0, 60),
      tipo: 'MESH',
      material: indiceMat.get(claveColor),
      vertices: verticesMundo,
      triangulos,
      mods: Array.isArray(p.mods) ? p.mods : [],
    });
  }

  if (!mallas.length) {
    throw new Error('No se encontraron figuras 3D válidas en el código del modelo.');
  }

  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  for (const m of mallas) {
    for (const v of m.vertices) {
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], v[k]);
        max[k] = Math.max(max[k], v[k]);
      }
    }
  }
  const centro = min.map((m, k) => +((m + max[k]) / 2).toFixed(4));
  const escala = +(Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 2 || 1).toFixed(4);
  const cuantizar = (punto) =>
    punto.map((c, k) => Math.max(-COORDENADA, Math.min(COORDENADA, Math.round(((c - centro[k]) / escala) * COORDENADA))));

  const objetos = mallas.map((m) => ({
    nombre: m.nombre,
    tipo: 'MESH',
    material: m.material,
    v: m.vertices.flatMap(cuantizar),
    t: m.triangulos.flat(),
    mods: m.mods,
  }));

  return {
    formato: FORMATO,
    blender,
    lenguaje,
    codigo_fuente: codigoFuente.slice(0, 12000),
    centro,
    escala,
    materiales,
    objetos,
    resumido: false,
  };
}

function extraerAtributosHTML(fragmento) {
  const attrs = {};
  const re = /([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = re.exec(fragmento)) !== null) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? '';
  }
  return attrs;
}

function vectorAttr(texto, def = [0, 0, 0]) {
  if (!texto) return def;
  const nums = String(texto).trim().split(/[\s,]+/).map(Number);
  return nums.length >= 3 && nums.every(Number.isFinite) ? nums.slice(0, 3) : def;
}

function parsearAFrame(codigo) {
  const piezas = [];
  const mapaEtiqueta = {
    'a-box': 'cube',
    'a-cube': 'cube',
    'a-cylinder': 'cylinder',
    'a-cone': 'cone',
    'a-sphere': 'uv_sphere',
    'a-icosahedron': 'ico_sphere',
    'a-octahedron': 'ico_sphere',
    'a-dodecahedron': 'ico_sphere',
    'a-torus': 'torus',
    'a-plane': 'plane',
  };
  const re = /<(a-[a-z0-9-]+)\b([^>]*?)>/gi;
  let m;
  let idx = 0;
  while ((m = re.exec(codigo)) !== null) {
    const tag = m[1].toLowerCase();
    const attrs = extraerAtributosHTML(m[2]);
    let forma = mapaEtiqueta[tag];
    if (tag === 'a-entity' && attrs.geometry) {
      const prim = attrs.geometry.match(/primitive\s*:\s*([a-z]+)/i)?.[1]?.toLowerCase();
      forma = mapaEtiqueta[`a-${prim}`] || (prim === 'box' ? 'cube' : prim);
    }
    if (!forma) continue;
    idx += 1;
    // En A-Frame Y es arriba; en Blender/VisorModelo Z es arriba: (x, -z, y)
    const [ax, ay, az] = vectorAttr(attrs.position, [0, 0, 0]);
    const [rx, ry, rz] = vectorAttr(attrs.rotation, [0, 0, 0]);
    const [sx, sy, sz] = vectorAttr(attrs.scale, [1, 1, 1]);
    const w = Number(attrs.width) || Number(attrs.radius) * 2 || Number(attrs['radius-bottom']) * 2 || 1;
    const h = Number(attrs.height) || Number(attrs.radius) * 2 || 1;
    const d = Number(attrs.depth) || Number(attrs.radius) * 2 || Number(attrs['radius-bottom']) * 2 || 1;
    const colorMat = attrs.color || attrs.material?.match(/color\s*:\s*([^;]+)/i)?.[1]?.trim() || '#00e5ff';
    piezas.push({
      nombre: attrs.id || attrs.name || `${tag.replace(/^a-/, '')}_${idx}`,
      forma,
      posicion: [ax, -az, ay],
      rotacion: [rx, -rz, ry],
      escala: [(w / 2) * sx, (d / 2) * sz, (h / 2) * sy],
      subdivisiones: tag === 'a-octahedron' ? 1 : 2,
      color: colorMat,
    });
  }
  return piezas;
}

function parsearPythonBlender(codigo) {
  const piezas = [];
  const mapaOp = {
    cube: 'cube',
    cylinder: 'cylinder',
    cone: 'cone',
    uv_sphere: 'uv_sphere',
    ico_sphere: 'ico_sphere',
    torus: 'torus',
    plane: 'plane',
    monkey: 'ico_sphere',
  };
  const re = /primitive_([a-z_]+)_add\s*\(([^)]*)\)/gi;
  let m;
  let idx = 0;
  while ((m = re.exec(codigo)) !== null) {
    const tipo = m[1].toLowerCase();
    const args = m[2];
    const forma = mapaOp[tipo] || 'cube';
    idx += 1;
    const vec = (clave, def) => {
      const hallado = args.match(new RegExp(`${clave}\\s*=\\s*[\\(\\[]\\s*([-+0-9.eE]+)\\s*,\\s*([-+0-9.eE]+)\\s*,\\s*([-+0-9.eE]+)\\s*[\\)\\]]`));
      return hallado ? [Number(hallado[1]), Number(hallado[2]), Number(hallado[3])] : def;
    };
    const num = (clave, def) => {
      const hallado = args.match(new RegExp(`${clave}\\s*=\\s*([-+0-9.eE]+)`));
      return hallado ? Number(hallado[1]) : def;
    };
    const str = (clave) => args.match(new RegExp(`${clave}\\s*=\\s*["']([^"']+)["']`))?.[1];
    const pos = vec('location', [0, 0, 0]);
    const rot = vec('rotation', [0, 0, 0]);
    const r = num('radius', num('size', 2) / 2);
    const depth = num('depth', r * 2);
    const esc = vec('scale', [r, r, forma === 'cylinder' || forma === 'cone' ? depth / 2 : r]);
    const color = str('color') || '#f5792a';
    piezas.push({
      nombre: str('name') || `${forma}_${idx}`,
      forma,
      posicion: pos,
      rotacion: rot,
      escala: esc,
      color,
    });
  }
  return piezas;
}

// Compila cualquier código de modelo (Python bpy, A-Frame <a-scene>, JSON de piezas o amatista.modelo/1)
// y devuelve el objeto estructurado en formato amatista.modelo/1 listo para armarEscena().
export function compilarCodigoModelo(entrada) {
  if (entrada && typeof entrada === 'object' && entrada.formato === FORMATO) {
    return entrada;
  }
  const texto = String(entrada ?? '').trim();
  if (!texto) throw new Error('Escribe o pega el código de tu modelo para recrearlo.');

  // 1. JSON directo (amatista.modelo/1 o receta {"piezas": [...]})
  if (texto.startsWith('{') || texto.startsWith('[')) {
    let json;
    try {
      json = JSON.parse(texto);
    } catch {
      throw new Error('El código JSON tiene un error de sintaxis: revisa comillas y llaves.');
    }
    if (json?.formato === FORMATO) {
      return { ...json, codigo_fuente: json.codigo_fuente || JSON.stringify(json, null, 2), lenguaje: json.lenguaje || 'json' };
    }
    const lista = Array.isArray(json) ? json : json?.piezas || json?.objetos;
    if (Array.isArray(lista) && lista.length) {
      return construirModeloDesdePiezas(lista, {
        codigoFuente: texto,
        lenguaje: 'json',
        blender: json?.blender || 'JSON Declarativo',
      });
    }
    throw new Error('El JSON debe tener una lista "piezas" o el formato amatista.modelo/1.');
  }

  // 2. Etiquetas declarativas A-Frame (<a-scene>, <a-box>, <a-cylinder>…)
  if (/<\s*a-[a-z0-9-]+/i.test(texto)) {
    const piezas = parsearAFrame(texto);
    if (!piezas.length) throw new Error('No se encontraron etiquetas 3D (<a-box>, <a-cylinder>, <a-sphere>, <a-cone>…) en el código.');
    return construirModeloDesdePiezas(piezas, {
      codigoFuente: texto,
      lenguaje: 'aframe',
      blender: 'A-Frame Web 3D',
    });
  }

  // 3. Script Python de Blender (bpy.ops.mesh.primitive_*_add)
  if (/primitive_[a-z_]+_add/i.test(texto)) {
    const piezas = parsearPythonBlender(texto);
    if (!piezas.length) throw new Error('No se encontraron llamadas primitive_*_add(...) en el script de Python.');
    return construirModeloDesdePiezas(piezas, {
      codigoFuente: texto,
      lenguaje: 'python',
      blender: 'Blender Python (bpy)',
    });
  }

  throw new Error('Formato de código no reconocido. Usa etiquetas A-Frame (<a-box>, <a-cylinder>…), Python de Blender (primitive_cube_add…) o JSON de piezas.');
}

// Empaqueta un objeto amatista.modelo/1 o un código fuente en el paquete comprimido zlib+base64.
export async function empaquetarCodigoModelo(entrada) {
  const datos = typeof entrada === 'object' && entrada?.formato === FORMATO ? entrada : compilarCodigoModelo(entrada);
  const texto = JSON.stringify(datos);
  const bytesTexto = new TextEncoder().encode(texto);
  if (typeof CompressionStream !== 'undefined') {
    const flujo = new Blob([bytesTexto]).stream().pipeThrough(new CompressionStream('deflate'));
    const comprimido = new Uint8Array(await new Response(flujo).arrayBuffer());
    const paquete = bytesABase64(comprimido);
    return { paquete, datos, bytes: paquete.length, bytesCodigo: bytesTexto.length };
  }
  return { paquete: texto, datos, bytes: bytesTexto.length, bytesCodigo: bytesTexto.length };
}

// base64 (zlib) o código directo → JSON amatista.modelo/1.
export async function desempaquetar(paquete) {
  if (paquete && typeof paquete === 'object' && paquete.formato === FORMATO) return paquete;
  const texto = String(paquete ?? '').trim();
  if (!texto) throw new Error('Este modelo viene en un formato que la plataforma no conoce.');
  // Si es código legible directo (JSON, A-Frame o Python), lo compila en el acto.
  if (texto.startsWith('{') || texto.startsWith('[') || /<\s*a-[a-z0-9-]+/i.test(texto) || /primitive_[a-z_]+_add/i.test(texto)) {
    const datos = compilarCodigoModelo(texto);
    if (datos?.formato !== FORMATO) throw new Error('Este modelo viene en un formato que la plataforma no conoce.');
    return datos;
  }
  let datos;
  try {
    const flujo = new Blob([aBytes(texto)]).stream().pipeThrough(new DecompressionStream('deflate'));
    datos = JSON.parse(await new Response(flujo).text());
  } catch {
    throw new Error('Este modelo viene en un formato que la plataforma no conoce.');
  }
  if (datos?.formato !== FORMATO) throw new Error('Este modelo viene en un formato que la plataforma no conoce.');
  return datos;
}

// Blender guarda los colores en espacio lineal; la pantalla espera sRGB.
export function aSRGB(lineal) {
  const c = Math.max(0, Math.min(1, lineal));
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
}

const GRIS = [0.8, 0.8, 0.8];

// {objetos: [{nombre, tipo, color: [r, g, b] en sRGB, posiciones: Float32Array, triangulos: Uint32Array, p}],
//  centro, radio, suelo, cuentas, codigoFuente, lenguaje}. Las coordenadas quedan en metros, con Z hacia arriba.
export function armarEscena(datos) {
  const [cx, cy, cz] = datos.centro;
  const k = datos.escala / COORDENADA;
  const materiales = datos.materiales ?? [];
  let minimo = [Infinity, Infinity, Infinity];
  let maximo = [-Infinity, -Infinity, -Infinity];
  let vertices = 0;
  let triangulos = 0;
  const objetos = (datos.objetos ?? []).map((objeto, indice) => {
    const material = materiales[objeto.material];
    const lineal = material?.color ?? GRIS;
    const uno = {
      indice,
      nombre: objeto.nombre,
      tipo: objeto.tipo,
      material: material?.nombre ?? null,
      color: lineal.map(aSRGB),
      mods: objeto.mods ?? [],
      p: objeto.p ?? null,
      posiciones: null,
      triangulos: null,
    };
    if (Array.isArray(objeto.v) && Array.isArray(objeto.t) && objeto.t.length) {
      const posiciones = new Float32Array(objeto.v.length);
      for (let i = 0; i < objeto.v.length; i += 3) {
        posiciones[i] = cx + objeto.v[i] * k;
        posiciones[i + 1] = cy + objeto.v[i + 1] * k;
        posiciones[i + 2] = cz + objeto.v[i + 2] * k;
        for (let e = 0; e < 3; e++) {
          minimo[e] = Math.min(minimo[e], posiciones[i + e]);
          maximo[e] = Math.max(maximo[e], posiciones[i + e]);
        }
      }
      uno.posiciones = posiciones;
      uno.triangulos = Uint32Array.from(objeto.t);
      vertices += objeto.v.length / 3;
      triangulos += objeto.t.length / 3;
    }
    return uno;
  });
  if (!Number.isFinite(minimo[0])) {
    minimo = [cx - 1, cy - 1, cz - 1];
    maximo = [cx + 1, cy + 1, cz + 1];
  }
  const centro = minimo.map((m, e) => (m + maximo[e]) / 2);
  const radio = Math.max(Math.hypot(maximo[0] - minimo[0], maximo[1] - minimo[1], maximo[2] - minimo[2]) / 2, 0.01);
  // Si viene de Blender sin codigo_fuente textual, generamos la vista legible del descriptor capturado.
  const codigoFuente =
    datos.codigo_fuente ||
    JSON.stringify(
      {
        formato: datos.formato,
        blender: datos.blender ?? '4.2 LTS',
        centro: datos.centro,
        escala: datos.escala,
        materiales: datos.materiales,
        objetos: (datos.objetos ?? []).map((o) => ({
          nombre: o.nombre,
          tipo: o.tipo,
          material: o.material,
          vertices: o.v ? o.v.length / 3 : 0,
          triangulos: o.t ? o.t.length / 3 : 0,
          mods: o.mods ?? [],
        })),
      },
      null,
      2,
    );
  return {
    objetos,
    centro,
    radio,
    suelo: minimo[2],
    medidas: maximo.map((m, e) => m - minimo[e]),
    cuentas: {
      objetos: objetos.length,
      mallas: objetos.filter((o) => o.triangulos).length,
      vertices,
      triangulos,
      materiales: materiales.length,
    },
    resumido: Boolean(datos.resumido),
    blender: datos.blender ?? null,
    lenguaje: datos.lenguaje ?? 'amatista.modelo/1',
    codigoFuente,
  };
}

export function bytesLegibles(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Medida legible en metros (Blender trabaja en metros por defecto).
export function medidaLegible(metros) {
  if (metros >= 1) return `${metros.toFixed(2)} m`;
  return `${Math.round(metros * 100)} cm`;
}
