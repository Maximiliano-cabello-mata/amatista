// El cerebro de Goliat: un asistente por reglas que corre completo en el
// navegador (sin servicios externos ni modelos que descargar). Entiende lo que
// escribe el alumno con palabras clave, sinónimos y tolerancia a faltas de
// ortografía, y responde con un texto corto, un gesto y botones que llevan a
// donde hace falta. Funciones puras: pruebas en cerebro.test.js.
import { ATAJOS, IDEAS, INTENCIONES, PASOS_PROYECTO } from './conocimiento';

// «¿Cómo EXTRUYO?» → ['como', 'extruyo']: minúsculas, sin acentos ni signos.
export function normalizar(texto = '') {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9+\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// Distancia de edición con tope: basta saber si es 0, 1 o 2.
export function distancia(a, b, tope = 2) {
  if (Math.abs(a.length - b.length) > tope) return tope + 1;
  let previa = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const fila = [i];
    let menor = i;
    for (let j = 1; j <= b.length; j += 1) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      fila[j] = Math.min(previa[j] + 1, fila[j - 1] + 1, previa[j - 1] + costo);
      menor = Math.min(menor, fila[j]);
    }
    if (menor > tope) return tope + 1;
    previa = fila;
  }
  return previa[b.length];
}

// Una palabra del alumno coincide con una clave si es igual, si empieza igual
// (raíz: «extru» cubre extruir, extruyo, extrusión) o si tiene una falta.
function coincide(palabra, clave) {
  if (palabra === clave) return 1;
  if (clave.length >= 4 && palabra.startsWith(clave)) return 0.9;
  if (clave.length >= 5 && palabra.length >= 5 && distancia(palabra, clave, 1) <= 1) return 0.75;
  return 0;
}

// Puntaje de una intención: cada clave suma su peso una sola vez. Las claves
// de varias palabras («me rindo») deben aparecer seguidas.
export function puntuar(palabras, claves = []) {
  let total = 0;
  for (const [clave, peso = 1] of claves.map((c) => (Array.isArray(c) ? c : [c, 1]))) {
    const partes = clave.split(' ');
    let mejor = 0;
    for (let i = 0; i + partes.length <= palabras.length; i += 1) {
      let suma = 0;
      for (let k = 0; k < partes.length; k += 1) {
        const valor = coincide(palabras[i + k], partes[k]);
        if (!valor) {
          suma = 0;
          break;
        }
        suma += valor;
      }
      mejor = Math.max(mejor, suma / partes.length);
    }
    total += mejor * peso;
  }
  return total;
}

// Busca un atajo de Blender por lo que se quiere hacer («extruir», «girar»).
export function buscarAtajo(palabras) {
  let mejor = null;
  for (const atajo of ATAJOS) {
    const puntos = puntuar(palabras, atajo.claves);
    if (puntos >= 0.75 && (!mejor || puntos > mejor.puntos)) mejor = { atajo, puntos };
  }
  return mejor?.atajo ?? null;
}

// Nivel del alumno para proponer proyectos a su medida (0, 1 o 2), según las
// lecciones que ya completó en todo el catálogo.
export function nivelDeProyecto(completadas = 0) {
  if (completadas >= 25) return 2;
  if (completadas >= 8) return 1;
  return 0;
}

// Idea de proyecto: se elige por nivel y se va rotando con `vuelta` para que
// «otra idea» siempre traiga una distinta.
export function ideaDeProyecto(nivel = 0, vuelta = 0) {
  const lista = IDEAS.filter((idea) => idea.nivel <= nivel).sort((a, b) => b.nivel - a.nivel || a.id.localeCompare(b.id));
  const idea = lista[((vuelta % lista.length) + lista.length) % lista.length];
  return { ...idea, pasos: PASOS_PROYECTO.map((paso) => ({ ...paso, texto: paso.texto.replace('{que}', idea.que) })) };
}

const RESPUESTA_NO_ENTENDI = {
  intencion: 'no-entendi',
  gesto: 'atento',
  texto: 'Grr… eso no lo olfateo todavía. Prueba con otras palabras o toca uno de estos:',
  acciones: [
    { texto: 'Seguir donde me quedé', intencion: 'continuar' },
    { texto: 'Idea de proyecto', intencion: 'proyecto' },
    { texto: 'Me atoré', intencion: 'atorado' },
    { texto: 'Ver la ayuda', href: '#/guia' },
  ],
};

// Respuesta a lo que escribió el alumno. `contexto` trae lo que Goliat sabe
// de la visita: {siguiente: {titulo, href}, completadas, pagina, nombre}.
export function responder(texto, contexto = {}) {
  const palabras = normalizar(texto);
  if (!palabras.length) return RESPUESTA_NO_ENTENDI;

  // 1. Un atajo concreto de Blender gana si la pregunta va de «cómo hago X».
  const atajo = buscarAtajo(palabras);
  const pideAtajo = puntuar(palabras, ['atajo', 'tecla', 'como', 'hago', 'hacer', 'blender', 'shortcut']) > 0;
  if (atajo && (pideAtajo || palabras.length <= 3)) {
    return {
      intencion: 'atajo',
      gesto: 'atento',
      texto: `${atajo.que}: ${atajo.teclas}. ${atajo.consejo}`,
      acciones: [{ texto: 'Más atajos', intencion: 'atajos' }],
    };
  }

  // 2. La intención con más puntos (con un mínimo para no adivinar de más).
  let mejor = null;
  for (const intencion of INTENCIONES) {
    const puntos = puntuar(palabras, intencion.claves);
    if (puntos >= (intencion.minimo ?? 1) && (!mejor || puntos > mejor.puntos)) mejor = { intencion, puntos };
  }
  if (!mejor) return atajo ? responder(`atajo ${texto}`, contexto) : RESPUESTA_NO_ENTENDI;
  return porIntencion(mejor.intencion.id, contexto);
}

// La respuesta de una intención conocida (también la usan los botones).
export function porIntencion(id, contexto = {}) {
  if (id === 'continuar') {
    const siguiente = contexto.siguiente;
    if (!siguiente) {
      return {
        intencion: id,
        gesto: 'contento',
        texto: 'No tienes nada a medias. Elige un curso y yo te sigo; o mejor, ¡inventa un proyecto propio!',
        acciones: [
          { texto: 'Ver los cursos', href: '#/' },
          { texto: 'Idea de proyecto', intencion: 'proyecto' },
        ],
      };
    }
    return {
      intencion: id,
      gesto: 'atento',
      texto: `Te quedaste en «${siguiente.titulo}». Vamos, que eso no se termina solo.`,
      acciones: [{ texto: 'Abrir la lección ▶', href: siguiente.href }],
    };
  }
  if (id === 'proyecto') {
    const idea = ideaDeProyecto(nivelDeProyecto(contexto.completadas), contexto.vuelta ?? 0);
    return {
      intencion: id,
      gesto: 'contento',
      idea,
      texto: `${idea.titulo}. ${idea.porque}`,
      acciones: [
        { texto: 'Lo hago ▶', intencion: 'adoptar' },
        { texto: 'Otra idea', intencion: 'proyecto' },
      ],
    };
  }
  if (id === 'atajos') {
    const lista = ATAJOS.filter((a) => a.basico)
      .map((a) => `${a.teclas} ${a.corto}`)
      .join(' · ');
    return {
      intencion: id,
      gesto: 'atento',
      texto: `Los que más uso: ${lista}. Pregúntame por cualquiera, por ejemplo «¿cómo extruyo?».`,
      acciones: [],
    };
  }
  const intencion = INTENCIONES.find((i) => i.id === id);
  if (!intencion) return RESPUESTA_NO_ENTENDI;
  const textos = intencion.respuestas;
  const texto = textos[(contexto.vuelta ?? 0) % textos.length].replace('{nombre}', contexto.nombre ?? 'compa');
  return { intencion: id, gesto: intencion.gesto ?? 'gruñon', texto, acciones: intencion.acciones ?? [] };
}
