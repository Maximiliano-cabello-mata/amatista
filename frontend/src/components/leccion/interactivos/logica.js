// Lógica pura de los bloques interactivos (pruebas en logica.test.js).
// Los componentes solo dibujan: aquí se decide qué está bien y qué no.

export const TIPOS_INTERACTIVOS = [
  'quiz_inline',
  'ordering',
  'matching',
  'fill_blanks',
  'hotspots',
  'scene_explorer',
  'code_challenge',
];

// Bloques que hay que resolver para completar la lección. Las tarjetas de
// concepto (anteriores a los interactivos) también cuentan.
export const esActividad = (bloque) => TIPOS_INTERACTIVOS.includes(bloque?.type) || bloque?.type === 'concept_cards';

// Actividades de una lección: {clave, indice, bloque, requerida, registrable}.
// `registrable` = se envía al progreso con registrarActividad (necesita id).
export function actividadesDe(bloques = []) {
  return bloques.flatMap((bloque, indice) =>
    esActividad(bloque)
      ? [
          {
            clave: bloque.id || `bloque-${indice}`,
            indice,
            bloque,
            requerida: bloque.required !== false,
            registrable: Boolean(bloque.id) && TIPOS_INTERACTIVOS.includes(bloque.type),
          },
        ]
      : [],
  );
}

// --- Mezclas con semilla ---------------------------------------------------------

// Misma semilla, mismo orden: la lista no "salta" al volver a dibujarse.
export function mezclar(lista, semilla) {
  const copia = [...lista];
  let estado = semilla >>> 0;
  const azar = () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return estado / 4294967296;
  };
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export const semillaDe = (texto = '') => [...texto].reduce((hash, letra) => (hash * 31 + letra.charCodeAt(0)) >>> 0, 7);

// Mezcla que nunca deja la lista ya resuelta (si coincide, la rota un lugar).
export function mezclarDistinto(lista, semilla) {
  const mezclada = mezclar(lista, semilla);
  if (lista.length > 1 && mezclada.every((elemento, i) => elemento === lista[i])) {
    return [...mezclada.slice(1), mezclada[0]];
  }
  return mezclada;
}

// --- ordering ----------------------------------------------------------------

// Mueve el elemento de `desde` a `hasta` (devuelve una lista nueva).
export function mover(lista, desde, hasta) {
  if (desde === hasta || desde < 0 || hasta < 0 || desde >= lista.length || hasta >= lista.length) return lista;
  const copia = [...lista];
  const [elemento] = copia.splice(desde, 1);
  copia.splice(hasta, 0, elemento);
  return copia;
}

// Para cada posición, ¿el id es el que va ahí? (el orden correcto es el del JSON).
export const posicionesCorrectas = (orden, items) => orden.map((id, i) => items[i]?.id === id);

// --- fill_blanks -------------------------------------------------------------

const PATRON_HUECO = /\[\[([\s\S]*?)\]\]/g;

// "Texto con [[respuesta|alternativa]]" → partes de texto y huecos.
export function partesPlantilla(plantilla = '') {
  const partes = [];
  let ultimo = 0;
  let numero = 0;
  for (const coincidencia of plantilla.matchAll(PATRON_HUECO)) {
    if (coincidencia.index > ultimo) partes.push({ tipo: 'texto', texto: plantilla.slice(ultimo, coincidencia.index) });
    const respuestas = coincidencia[1]
      .split('|')
      .map((respuesta) => respuesta.trim())
      .filter(Boolean);
    partes.push({ tipo: 'hueco', indice: numero++, respuestas });
    ultimo = coincidencia.index + coincidencia[0].length;
  }
  if (ultimo < plantilla.length) partes.push({ tipo: 'texto', texto: plantilla.slice(ultimo) });
  return partes;
}

// Texto sin marcas de Markdown en línea (**, *, `), para aria-label y lectores de pantalla.
export const textoPlano = (texto = '') => String(texto).replace(/\*\*|[*`]/g, '');

// Comparación sin mayúsculas ni espacios extra.
export const normalizarRespuesta = (texto = '') => String(texto).trim().replace(/\s+/g, ' ').toLowerCase();

export const respuestaCorrecta = (valor, respuestas) =>
  respuestas.some((respuesta) => normalizarRespuesta(respuesta) === normalizarRespuesta(valor));

// --- scene_explorer ----------------------------------------------------------

// Tipo de control, rango y valor inicial de cada parámetro cuando el bloque no lo indica.
export const PARAMETROS_ESCENA = {
  segments: { tipo: 'range', min: 3, max: 32, step: 1, defecto: 16 },
  color: { tipo: 'color', defecto: '#9B59B6' },
  wireframe: { tipo: 'toggle', defecto: false },
  metalness: { tipo: 'range', min: 0, max: 1, step: 0.05, defecto: 0 },
  roughness: { tipo: 'range', min: 0, max: 1, step: 0.05, defecto: 0.6 },
  scale: { tipo: 'range', min: 0.5, max: 2, step: 0.1, defecto: 1 },
  rotationSpeed: { tipo: 'range', min: 0, max: 180, step: 5, defecto: 20 },
};

// Control con todos sus campos resueltos: {param, label, tipo, min, max, step, defecto}.
export function normalizarControl(control) {
  const base = PARAMETROS_ESCENA[control.param] ?? { tipo: 'range', min: 0, max: 1, step: 0.1, defecto: 0 };
  const tipo = control.type ?? base.tipo;
  if (tipo === 'range') {
    const min = control.min ?? base.min ?? 0;
    const max = control.max ?? base.max ?? 1;
    const step = control.step ?? base.step ?? 1;
    const defecto = Math.min(max, Math.max(min, control.default ?? base.defecto ?? min));
    return { param: control.param, label: control.label, tipo, min, max, step, defecto };
  }
  if (tipo === 'color') return { param: control.param, label: control.label, tipo, defecto: control.default ?? base.defecto ?? '#9B59B6' };
  return { param: control.param, label: control.label, tipo: 'toggle', defecto: Boolean(control.default ?? base.defecto) };
}

export function valoresIniciales(controles = []) {
  const valores = {};
  for (const [param, base] of Object.entries(PARAMETROS_ESCENA)) valores[param] = base.defecto;
  for (const control of controles.map(normalizarControl)) valores[control.param] = control.defecto;
  return valores;
}

function comparar(valor, operador, meta) {
  if (operador === '<=') return valor <= meta;
  if (operador === '>=') return valor >= meta;
  if (operador === '!=') return valor !== meta;
  return valor === meta;
}

// ¿Se cumple la meta del bloque con estos valores? Sin meta: nunca.
export function metaCumplida(meta, valores) {
  if (!meta || !(meta.param in valores)) return false;
  const valor = valores[meta.param];
  if (typeof meta.value === 'number') return comparar(Number(valor), meta.op, meta.value);
  if (typeof meta.value === 'boolean') return comparar(Boolean(valor), meta.op, meta.value);
  return comparar(normalizarColor(valor), meta.op, normalizarColor(meta.value));
}

// Geometría de A-Frame para la primitiva con N segmentos (menos segmentos = más low poly).
export function geometriaDe(primitiva, segmentos = 16) {
  const n = Math.round(Number(segmentos) || 0);
  switch (primitiva) {
    case 'box': {
      const lados = Math.min(20, Math.max(1, n));
      return { primitive: 'box', width: 1.4, height: 1.4, depth: 1.4, segmentsWidth: lados, segmentsHeight: lados, segmentsDepth: lados };
    }
    case 'cylinder':
      return { primitive: 'cylinder', radius: 0.8, height: 1.6, segmentsRadial: Math.max(3, n), segmentsHeight: 1 };
    case 'cone':
      return { primitive: 'cone', radiusBottom: 0.9, radiusTop: 0.01, height: 1.6, segmentsRadial: Math.max(3, n), segmentsHeight: 1 };
    case 'torus':
      return { primitive: 'torus', radius: 0.8, radiusTubular: 0.15, segmentsRadial: Math.max(2, Math.round(n / 2)), segmentsTubular: Math.max(3, n) };
    case 'icosahedron':
      return { primitive: 'icosahedron', radius: 1, detail: Math.min(5, Math.max(0, n)) };
    default:
      return { primitive: 'sphere', radius: 1, segmentsWidth: Math.max(3, n), segmentsHeight: Math.max(2, Math.round(n / 2)) };
  }
}

// --- code_challenge ----------------------------------------------------------

// Colores con nombre más comunes: "red", "#f00" y "#FF0000" valen lo mismo.
const COLORES = {
  red: '#ff0000',
  green: '#008000',
  lime: '#00ff00',
  blue: '#0000ff',
  yellow: '#ffff00',
  orange: '#ffa500',
  purple: '#800080',
  pink: '#ffc0cb',
  white: '#ffffff',
  black: '#000000',
  gray: '#808080',
  grey: '#808080',
  cyan: '#00ffff',
  magenta: '#ff00ff',
};

export function normalizarColor(valor) {
  const texto = normalizarRespuesta(valor);
  if (COLORES[texto]) return COLORES[texto];
  const corto = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(texto);
  if (corto) return `#${corto[1]}${corto[1]}${corto[2]}${corto[2]}${corto[3]}${corto[3]}`;
  return texto;
}

const esColor = (texto) => /^#[0-9a-f]{6}$/.test(normalizarColor(texto));

function valorIgual(valor, esperado) {
  if (typeof esperado === 'number') return valor.trim() !== '' && Number(valor) === esperado;
  // Atributo sin valor (<a-box visible>) cuenta como true.
  if (typeof esperado === 'boolean') return (valor.trim() === '' ? true : normalizarRespuesta(valor) === 'true') === esperado;
  if (esColor(valor) && esColor(esperado)) return normalizarColor(valor) === normalizarColor(esperado);
  return normalizarRespuesta(valor) === normalizarRespuesta(esperado);
}

// Un check se cumple si al menos `min` (1 por defecto) elementos del selector
// cumplen sus condiciones. Con `attr` se mira ese atributo; sin él, el texto
// del elemento. `documento` es lo que devuelve DOMParser (o algo con querySelectorAll).
export function cumpleRevision(documento, revision) {
  let elementos;
  try {
    elementos = [...documento.querySelectorAll(revision.selector)];
  } catch {
    return false; // selector inválido
  }
  const conCondiciones = revision.attr != null || revision.equals != null || revision.contains != null;
  const validos = conCondiciones
    ? elementos.filter((elemento) => {
        const valor = revision.attr != null ? elemento.getAttribute(revision.attr) : elemento.textContent;
        if (valor == null) return false;
        if (revision.equals != null && !valorIgual(valor, revision.equals)) return false;
        if (revision.contains != null && !normalizarRespuesta(valor).includes(normalizarRespuesta(revision.contains))) {
          return false;
        }
        return true;
      })
    : elementos;
  return validos.length >= (revision.min ?? 1);
}

// Evalúa el código sin ejecutarlo: DOMParser crea un documento inerte.
export function evaluarCodigo(codigo, revisiones = []) {
  const documento = new DOMParser().parseFromString(codigo, 'text/html');
  return revisiones.map((revision) => cumpleRevision(documento, revision));
}

// ¿El navegador puede dibujar 3D? Sin WebGL, A-Frame no muestra nada.
export function webglDisponible() {
  try {
    const lienzo = document.createElement('canvas');
    const contexto = window.WebGLRenderingContext && (lienzo.getContext('webgl2') || lienzo.getContext('webgl'));
    // Se libera enseguida: el navegador admite pocos contextos WebGL a la vez.
    contexto?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(contexto);
  } catch {
    return false;
  }
}
