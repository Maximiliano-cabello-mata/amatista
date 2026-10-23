// Escenas del Motor Web de Amatista: una descripción corta (JSON) se vuelve una escena A-Frame
// completa con los componentes del motor (am-entorno, am-arrastrable, am-zona, am-orbita…).
// La misma descripción sirve para el bloque «motor_scene» de las lecciones y para la página que
// el alumno descarga desde el Estudio. Funciones puras: pruebas en motor3d.test.js.
//
// Descripción: {
//   entorno: {tipo, semilla, tamano, densidad} | null,
//   camara: {modo: 'orbita' | 'caminar', distancia},
//   objetos: [{id, forma, color, posicion: [x, y?, z], escala, rotacion, movible, tocable, flotar, modelo}],
//   zonas: [{id, posicion: [x, z], radio, color}],
//   generar: [{forma, patron, cantidad, radio, separacion, color, semilla, variar}],
//   retos: [{tipo, objeto, zona, ...}] (motor3d/retos.js)
// }
import { TIPOS_ENTORNO, PATRONES } from './entorno';
import { TIPOS_RETO } from './retos';

export const FORMAS = {
  caja: { geometria: 'primitive: box; width: 1; height: 1; depth: 1', alto: 1 },
  esfera: { geometria: 'primitive: sphere; radius: 0.5; segmentsWidth: 10; segmentsHeight: 7', alto: 1 },
  cilindro: { geometria: 'primitive: cylinder; radius: 0.5; height: 1; segmentsRadial: 8', alto: 1 },
  cono: { geometria: 'primitive: cone; radiusBottom: 0.5; radiusTop: 0; height: 1; segmentsRadial: 8', alto: 1 },
  toro: { geometria: 'primitive: torus; radius: 0.4; radiusTubular: 0.14; segmentsRadial: 6; segmentsTubular: 14', alto: 0.28 },
  cristal: { geometria: 'primitive: octahedron; radius: 0.55', alto: 1.1 },
  plano: { geometria: 'primitive: box; width: 1; height: 0.1; depth: 1', alto: 0.1 },
};
// Modelos GLB propios (public/modelos/, scripts/modelos.mjs): funcionan sin conexión.
export const MODELOS = { arbol: '/modelos/arbol.glb', casa: '/modelos/casa.glb', cristal: '/modelos/cristal.glb' };
export const LIMITES = { objetos: 40, zonas: 8, generar: 6, retos: 8 };

const COLOR = /^#[0-9a-f]{3}([0-9a-f]{3})?$/i;
const ID = /^[a-z][a-z0-9_-]{0,30}$/i;
const numero = (valor, respaldo, min = -100, max = 100) => {
  const n = Number(valor);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : respaldo;
};
const color = (valor, respaldo) => (typeof valor === 'string' && COLOR.test(valor) ? valor : respaldo);
const tres = (lista, respaldo) => [0, 1, 2].map((i) => numero(Array.isArray(lista) ? lista[i] : undefined, respaldo[i]));
const PALETA = ['#9B59B6', '#00E5FF', '#F5792A', '#2ECC71', '#F1C40F', '#E74C3C'];

// Errores de una descripción (para el validador del backend y el editor): lista de textos.
export function revisarEscena(desc) {
  const errores = [];
  if (!desc || typeof desc !== 'object') return ['la escena debe ser un objeto'];
  if (desc.entorno && !TIPOS_ENTORNO.includes(desc.entorno.tipo)) errores.push(`entorno.tipo «${desc.entorno.tipo}» no existe (hay: ${TIPOS_ENTORNO.join(', ')})`);
  const ids = new Set();
  for (const [i, o] of (desc.objetos ?? []).entries()) {
    if (!ID.test(o?.id ?? '')) errores.push(`objetos[${i}].id debe ser una palabra sin espacios`);
    else if (ids.has(o.id)) errores.push(`objetos[${i}].id «${o.id}» está repetido`);
    else ids.add(o.id);
    if (o?.forma && !FORMAS[o.forma] && o.forma !== 'modelo') errores.push(`objetos[${i}].forma «${o.forma}» no existe`);
    if (o?.forma === 'modelo' && !MODELOS[o.modelo]) errores.push(`objetos[${i}].modelo debe ser ${Object.keys(MODELOS).join(', ')}`);
  }
  for (const [i, z] of (desc.zonas ?? []).entries()) {
    if (!ID.test(z?.id ?? '')) errores.push(`zonas[${i}].id debe ser una palabra sin espacios`);
    else if (ids.has(z.id)) errores.push(`zonas[${i}].id «${z.id}» ya lo usa otro objeto`);
    else ids.add(z.id);
  }
  for (const [i, g] of (desc.generar ?? []).entries()) {
    if (g?.patron && !PATRONES.includes(g.patron)) errores.push(`generar[${i}].patron «${g.patron}» no existe`);
  }
  for (const [i, r] of (desc.retos ?? []).entries()) {
    if (!TIPOS_RETO.includes(r?.tipo)) errores.push(`retos[${i}].tipo «${r?.tipo}» no existe (hay: ${TIPOS_RETO.join(', ')})`);
    for (const campo of ['objeto', 'zona', 'de']) {
      if (r?.[campo] && !ids.has(String(r[campo]).replace(/^#/, ''))) errores.push(`retos[${i}].${campo} «${r[campo]}» no está en la escena`);
    }
    for (const id of r?.objetos ?? []) if (!ids.has(id)) errores.push(`retos[${i}].objetos: «${id}» no está en la escena`);
  }
  for (const [lista, maximo] of Object.entries(LIMITES)) {
    if ((desc[lista] ?? []).length > maximo) errores.push(`${lista}: máximo ${maximo}`);
  }
  return errores;
}

// Descripción con todos los valores puestos y dentro de los límites.
export function normalizarEscena(desc = {}) {
  const entorno = desc.entorno === null ? null : {
    tipo: TIPOS_ENTORNO.includes(desc.entorno?.tipo) ? desc.entorno.tipo : 'pradera',
    semilla: desc.entorno?.semilla ?? 1,
    tamano: numero(desc.entorno?.tamano, 40, 10, 120),
    densidad: numero(desc.entorno?.densidad, 0.5, 0, 1),
  };
  const objetos = (desc.objetos ?? []).slice(0, LIMITES.objetos).map((o, i) => {
    const forma = FORMAS[o.forma] || o.forma === 'modelo' ? o.forma : 'caja';
    const escala = Array.isArray(o.escala) ? tres(o.escala, [1, 1, 1]) : Array(3).fill(numero(o.escala, 1, 0.05, 20));
    const alto = (FORMAS[forma]?.alto ?? 1) * escala[1];
    const [x, y, z] = tres(o.posicion, [0, null, 0]);
    return {
      id: ID.test(o.id ?? '') ? o.id : `objeto${i + 1}`,
      forma,
      modelo: forma === 'modelo' && MODELOS[o.modelo] ? o.modelo : null,
      color: color(o.color, PALETA[i % PALETA.length]),
      posicion: [x, y ?? (forma === 'modelo' ? 0 : alto / 2), z],
      // Distancia del centro al suelo: el arrastre la conserva para que el objeto quede apoyado.
      base: forma === 'modelo' ? 0 : alto / 2,
      escala,
      rotacion: tres(o.rotacion, [0, 0, 0]),
      movible: Boolean(o.movible),
      tocable: Boolean(o.tocable),
      flotar: Boolean(o.flotar),
    };
  });
  const zonas = (desc.zonas ?? []).slice(0, LIMITES.zonas).map((zona, i) => ({
    id: ID.test(zona.id ?? '') ? zona.id : `zona${i + 1}`,
    posicion: [numero(zona.posicion?.[0], 0), numero(zona.posicion?.[1], 0)],
    radio: numero(zona.radio, 1, 0.3, 10),
    color: color(zona.color, '#00E5FF'),
  }));
  const generar = (desc.generar ?? []).slice(0, LIMITES.generar).map((g, i) => ({
    forma: FORMAS[g.forma] ? g.forma : 'caja',
    patron: PATRONES.includes(g.patron) ? g.patron : 'circulo',
    cantidad: Math.round(numero(g.cantidad, 8, 1, 200)),
    radio: numero(g.radio, 4, 0.5, 50),
    separacion: numero(g.separacion, 1.5, 0.2, 20),
    escala: numero(g.escala, 1, 0.05, 10),
    color: color(g.color, PALETA[(i + 2) % PALETA.length]),
    semilla: g.semilla ?? i + 1,
    variar: numero(g.variar, 0, 0, 0.9),
    centro: [numero(g.centro?.[0], 0), numero(g.centro?.[1], 0)],
  }));
  const camara = {
    modo: desc.camara?.modo === 'caminar' ? 'caminar' : 'orbita',
    distancia: numero(desc.camara?.distancia, 9, 2, 60),
  };
  const retos = (desc.retos ?? []).slice(0, LIMITES.retos).filter((r) => TIPOS_RETO.includes(r?.tipo));
  return { entorno, objetos, zonas, generar, camara, retos };
}

const texto3 = (lista) => lista.map((n) => Math.round(n * 1000) / 1000).join(' ');

// Entidades A-Frame de la escena: [{etiqueta, atributos, hijos}]. `calidad` viene de calidad.js.
export function entidadesEscena(desc, { calidad = 'media', vr = true } = {}) {
  const e = normalizarEscena(desc);
  const entidades = [];
  if (e.entorno) {
    entidades.push({ etiqueta: 'a-entity', atributos: { id: 'am-entorno', 'am-entorno': `tipo: ${e.entorno.tipo}; semilla: ${e.entorno.semilla}; tamano: ${e.entorno.tamano}; densidad: ${e.entorno.densidad}; calidad: ${calidad}` } });
  }
  entidades.push(
    { etiqueta: 'a-entity', atributos: { light: 'type: hemisphere; color: #ffffff; groundColor: #4a3b5c; intensity: 0.9' } },
    { etiqueta: 'a-entity', atributos: { light: 'type: directional; color: #fff4e0; intensity: 1.1', position: '-4 8 5' } },
  );
  for (const z of e.zonas) {
    entidades.push({ etiqueta: 'a-entity', atributos: { id: z.id, position: `${z.posicion[0]} 0 ${z.posicion[1]}`, 'am-zona': `radio: ${z.radio}; color: ${z.color}` } });
  }
  e.generar.forEach((g, i) => {
    entidades.push({
      etiqueta: 'a-entity',
      atributos: {
        id: `am-generar-${i + 1}`,
        position: `${g.centro[0]} 0 ${g.centro[1]}`,
        'am-generar': `forma: ${g.forma}; patron: ${g.patron}; cantidad: ${g.cantidad}; radio: ${g.radio}; separacion: ${g.separacion}; escala: ${g.escala}; color: ${g.color}; semilla: ${g.semilla}; variar: ${g.variar}`,
      },
    });
  });
  for (const o of e.objetos) {
    const atributos = {
      id: o.id,
      position: texto3(o.posicion),
      rotation: texto3(o.rotacion),
      scale: texto3(o.escala),
    };
    if (o.forma === 'modelo') atributos['gltf-model'] = `url(${MODELOS[o.modelo]})`;
    else {
      atributos.geometry = FORMAS[o.forma].geometria;
      atributos.material = `color: ${o.color}; flatShading: true; roughness: 0.75`;
    }
    if (o.movible) atributos['am-arrastrable'] = `base: ${Math.round(o.base * 1000) / 1000}`;
    if (o.tocable) atributos['am-tocable'] = '';
    if (o.flotar) atributos['am-flotar'] = '';
    entidades.push({ etiqueta: 'a-entity', atributos });
  }
  e.retos.forEach((r, i) => {
    const partes = Object.entries(r)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(',') : String(v).replace(/;/g, ',')}`);
    entidades.push({ etiqueta: 'a-entity', atributos: { [`am-reto__${i + 1}`]: partes.join('; ') } });
  });
  if (e.camara.modo === 'caminar') {
    entidades.push({
      etiqueta: 'a-entity',
      atributos: { id: 'am-jugador', position: '0 0 6', 'am-caminar': '' },
      hijos: [{ etiqueta: 'a-entity', atributos: { camera: '', position: '0 1.6 0', 'look-controls': 'pointerLockEnabled: false' } }],
    });
  } else {
    entidades.push({
      etiqueta: 'a-entity',
      atributos: { id: 'am-camara', camera: '', 'look-controls': 'enabled: false', 'wasd-controls': 'enabled: false', 'am-orbita': `distancia: ${e.camara.distancia}` },
    });
  }
  if (vr) {
    entidades.push(
      { etiqueta: 'a-entity', atributos: { 'laser-controls': 'hand: right; model: false', 'am-mano': '' } },
      { etiqueta: 'a-entity', atributos: { 'laser-controls': 'hand: left; model: false', 'am-mano': '' } },
    );
  }
  return entidades;
}

// Atributos de <a-scene> del motor.
export const ATRIBUTOS_ESCENA = {
  renderer: 'antialias: false; colorManagement: true; maxCanvasWidth: 1920; maxCanvasHeight: 1920',
  'am-rendimiento': '',
  'loading-screen': 'enabled: false',
  'device-orientation-permission-ui': 'enabled: false',
};

const escapar = (valor) => String(valor).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function htmlDe(entidad, sangria) {
  const atributos = Object.entries(entidad.atributos)
    .map(([k, v]) => (v === '' ? ` ${k}` : ` ${k}="${escapar(v)}"`))
    .join('');
  const hijos = (entidad.hijos ?? []).map((h) => htmlDe(h, `${sangria}  `)).join('\n');
  return hijos
    ? `${sangria}<${entidad.etiqueta}${atributos}>\n${hijos}\n${sangria}</${entidad.etiqueta}>`
    : `${sangria}<${entidad.etiqueta}${atributos}></${entidad.etiqueta}>`;
}

// El <a-scene> como texto (para el Estudio y la página que se descarga).
export function escenaAHTML(desc, opciones = {}) {
  const atributos = Object.entries(ATRIBUTOS_ESCENA)
    .map(([k, v]) => (v === '' ? ` ${k}` : ` ${k}="${escapar(v)}"`))
    .join('');
  const cuerpo = entidadesEscena(desc, opciones).map((e) => htmlDe(e, '  ')).join('\n');
  return `<a-scene${atributos}>\n${cuerpo}\n</a-scene>`;
}
