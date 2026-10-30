// Amatista Taller en la plataforma (motor 5): lógica pura, sin React (pruebas en taller.test.js).
// La unidad es la habilidad y cada una pasa por el mismo ciclo:
//   Mira → Hazlo conmigo → Hazlo tú → Úsalo → Recuérdalo
// El servidor arma el plan (GET /talleres/{id}) con el modelo del alumno; el add-on manda en su
// latido lo que pasa en Blender (detalle.taller). Aquí solo se decide qué mostrar y qué botones
// tienen sentido. Nunca se muestra el dominio como número: se dice con palabras y una barra.
import { estadoBlender } from './logica';

// --- El ciclo de cada habilidad ---------------------------------------------------------

export const CICLO = [
  { id: 'mira', nombre: 'Mira', texto: 'Amatista lo hace en tu vista 3D, con las teclas en pantalla.' },
  { id: 'conmigo', nombre: 'Hazlo conmigo', texto: 'Lo haces tú sobre un molde; las teclas, solo si las pides.' },
  { id: 'tu', nombre: 'Hazlo tú', texto: 'Otras piezas cortas, sin molde ni teclas.' },
  { id: 'proyecto', nombre: 'Úsalo', texto: 'El proyecto del módulo, que queda en tu isla.' },
  { id: 'repaso', nombre: 'Recuérdalo', texto: 'Un reto de un minuto, días después.' },
];

// Tipo de actividad del plan → paso del ciclo. «Demuéstralo» es hacerlo sin ayuda; el reto
// final del módulo es usar lo aprendido.
const PASO_DE_TIPO = {
  mira: 'mira',
  conmigo: 'conmigo',
  tu: 'tu',
  prueba: 'tu',
  proyecto: 'proyecto',
  reto: 'proyecto',
  repaso: 'repaso',
};

// Nombre de cada tipo de actividad (el servidor ya lo manda en nombre_tipo; esto es el respaldo).
export const NOMBRE_TIPO = {
  mira: 'Mira',
  conmigo: 'Hazlo conmigo',
  tu: 'Hazlo tú',
  proyecto: 'Úsalo',
  reto: 'Reto',
  repaso: 'Recuérdalo',
  prueba: 'Demuéstralo',
};
export const nombreTipo = (actividad) => actividad?.nombre_tipo || NOMBRE_TIPO[actividad?.tipo] || '';

// «esta lección», «Teoría» → «esta lección y «Teoría»».
export function unirConY(lista = []) {
  const partes = lista.filter(Boolean);
  if (partes.length <= 1) return partes.join('');
  return `${partes.slice(0, -1).join(', ')} y ${partes.at(-1)}`;
}

// En qué paso del ciclo está el alumno: lo que pasa en Blender gana sobre el plan guardado.
export function pasoDelCiclo(plan, vivo = null) {
  const tipo = vivo?.actividad?.tipo || plan?.actual?.tipo;
  if (PASO_DE_TIPO[tipo]) return PASO_DE_TIPO[tipo];
  if (!plan) return null;
  // Sin nada pendiente solo queda repasar.
  if (plan.completo || (plan.proyecto_hecho && plan.reto_hecho) || plan.repasos?.length) return 'repaso';
  return null;
}

// --- Fases de una habilidad (modelo del alumno) -----------------------------------------

export const FASES = {
  nueva: 'Nueva',
  acompanada: 'Con ayuda',
  sola: 'Ya te sale',
  dominada: 'Dominada',
};

// Mismos cortes que engine/amatista_engine/taller/modelo.py (por si llega p sin fase).
export function faseDeDominio(p) {
  const valor = Number(p);
  if (!Number.isFinite(valor) || valor < 0.3) return 'nueva';
  if (valor < 0.7) return 'acompanada';
  if (valor < 0.95) return 'sola';
  return 'dominada';
}

export const textoFase = (fase) => FASES[fase] ?? FASES.nueva;

// Ancho de la barra de dominio (0 a 100). Es solo para dibujar: no se muestra como número.
export function anchoDominio(p) {
  const valor = Number(p);
  if (!Number.isFinite(valor)) return 0;
  return Math.round(Math.min(1, Math.max(0, valor)) * 100);
}

// Las habilidades del plan, con lo último que mandó Blender encima (p, fase, lista).
export function habilidadesConVivo(habilidades = [], enVivo = []) {
  const vivas = new Map((Array.isArray(enVivo) ? enVivo : []).filter((h) => h?.id).map((h) => [h.id, h]));
  return (Array.isArray(habilidades) ? habilidades : [])
    .filter((h) => h?.id)
    .map((h) => {
      const viva = vivas.get(h.id);
      const p = Number.isFinite(Number(viva?.p)) ? Number(viva.p) : Number(h.p) || 0;
      const fase = FASES[viva?.fase] ? viva.fase : FASES[h.fase] ? h.fase : faseDeDominio(p);
      const lista = typeof viva?.lista === 'boolean' ? viva.lista : typeof h.lista === 'boolean' ? h.lista : fase === 'dominada';
      return { ...h, p, fase, lista, titulo: h.titulo || viva?.titulo || tituloDeId(h.id) };
    });
}

// «bl-escalar-eje» → «Escalar eje» (para repasos de habilidades de otros talleres).
export function tituloDeId(id = '') {
  const texto = String(id).replace(/^bl-/, '').replace(/[-_]+/g, ' ').trim();
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
}

// --- Lo que pasa en Blender (detalle.taller del latido) ---------------------------------

export const ESTADOS_PIEZA = {
  llena: 'Lista',
  casi: 'Casi',
  equivocada: 'Otra forma',
  vacia: 'Falta',
};

const ESTADOS_TALLER = ['trabajando', 'mirando', 'lograda', 'pausa'];
const entero = (valor) => (Number.isFinite(Number(valor)) ? Math.max(0, Math.round(Number(valor))) : 0);
const textos = (lista) => (Array.isArray(lista) ? lista.filter((t) => t !== null && t !== undefined && t !== '').map(String) : []);

export function vivoDelTaller(d) {
  if (!d || typeof d !== 'object') return null;
  const actividad = d.actividad && typeof d.actividad === 'object' ? d.actividad : null;
  const nivelPista = entero(d.pista?.nivel);
  const pista =
    d.pista && nivelPista > 0
      ? { nivel: Math.min(nivelPista, 4), titulo: d.pista.titulo || '', texto: d.pista.texto || '', teclas: textos(d.pista.teclas) }
      : null;
  const pieza = d.pieza?.nombre
    ? { nombre: String(d.pieza.nombre), estado: ESTADOS_PIEZA[d.pieza.estado] ? d.pieza.estado : 'vacia', mensaje: d.pieza.mensaje || '' }
    : null;
  return {
    taller: d.taller || '',
    actividad,
    pieza,
    pista,
    llenas: entero(d.llenas),
    total: entero(d.total),
    mensaje: d.mensaje || '',
    estado: ESTADOS_TALLER.includes(d.estado) ? d.estado : 'trabajando',
    habilidades: Array.isArray(d.habilidades) ? d.habilidades : [],
    proyectoAbierto: Boolean(d.proyecto_abierto),
    repasos: textos(d.repasos),
    // Motor 6: la etapa que mandó la lección y si Blender ya la dio por cumplida.
    etapa: ETAPAS.includes(d.etapa) ? d.etapa : '',
    etapaCumplida: Boolean(d.etapa_cumplida),
  };
}

// El Blender del alumno para un taller:
//   sin_enlace  el servidor no tiene el enlace en vivo
//   cerrado     ningún Blender abierto
//   otra        Blender abierto en otra cosa
//   aqui        Blender abierto en este taller (vivo = detalle.taller normalizado)
export function enlaceDelTaller(datos, tallerId) {
  const base = estadoBlender(datos);
  if (base.estado === 'sin_enlace') return { ...base, vivo: null };
  if (base.estado === 'cerrado') {
    return { ...base, vivo: null, texto: 'Tu Blender está cerrado: el botón lo abre directo en el taller.' };
  }
  const abiertos = (datos.blender ?? []).filter((b) => b?.en_linea);
  const aqui = tallerId ? abiertos.find((b) => b?.detalle?.taller?.taller === tallerId) : null;
  if (aqui) return { estado: 'aqui', blender: aqui, vivo: vivoDelTaller(aqui.detalle.taller), texto: 'Tu Blender está en este taller.' };
  return { ...base, vivo: null };
}

// --- Botones según el momento (como máximo tres a la vez) ------------------------------

export const MAX_BOTONES = 3;

// Hasta qué escalón de la escalera de pistas llega cada tipo (engine/.../taller/ayudas.py):
// 1 qué falta · 2 con qué · 3 cómo (teclas) · 4 mírame.
const TECHO_POR_TIPO = { mira: 0, conmigo: 4, tu: 2, proyecto: 2, reto: 1, repaso: 1, prueba: 1 };

function techoDe(actividad, plan) {
  if (!actividad) return 4;
  if (plan?.actual?.id && plan.actual.id === actividad.id && Number.isFinite(Number(plan.actual.techo))) {
    return Number(plan.actual.techo);
  }
  if (Number.isFinite(Number(actividad.techo))) return Number(actividad.techo);
  return TECHO_POR_TIPO[actividad.tipo] ?? 4;
}

const empezado = (plan) =>
  Boolean(plan?.listas) || (plan?.habilidades ?? []).some((h) => h?.intentos > 0 || h?.vio_demo) || Boolean(plan?.proyecto_hecho);

// [{tipo, texto}] en orden de importancia; el primero es el principal.
export function controlesTaller(plan, enlace) {
  if (enlace?.estado !== 'aqui' || !enlace.vivo) {
    return [{ tipo: 'taller_abrir', texto: empezado(plan) ? 'Continuar en Blender' : 'Abrir el taller en Blender' }];
  }
  const { vivo } = enlace;
  const continuar = { tipo: 'taller_continuar', texto: 'Continuar' };
  const pausa = { tipo: 'taller_pausa', texto: 'Pausa' };
  const mirame = { tipo: 'taller_mirame', texto: 'Mírame' };
  if (vivo.estado === 'pausa' || vivo.estado === 'lograda') return [continuar];
  const tipo = vivo.actividad?.tipo;
  if (vivo.estado === 'mirando' || tipo === 'mira') return [continuar, mirame, pausa];
  const techo = techoDe(vivo.actividad, plan);
  const lista = [];
  if ((vivo.pista?.nivel ?? 0) < techo) lista.push({ tipo: 'taller_pista', texto: vivo.pista ? 'Otra pista' : 'Pista' });
  if (techo >= 4) lista.push(mirame);
  lista.push(pausa);
  return lista.slice(0, MAX_BOTONES);
}

// Qué decirle al alumno después de mandar una orden a Blender (POST /ordenes).
export function textoOrden(respuesta) {
  if (respuesta?.ok && respuesta.datos?.entregada) return 'Enviado a tu Blender.';
  if (respuesta?.ok) return 'Tu Blender no respondió: ábrelo (menú Amatista, arriba) y vuelve a intentarlo.';
  // Un servidor de antes del taller no conoce estas órdenes (422) o la ruta (404).
  if (respuesta?.status === 404 || respuesta?.status === 422) {
    return 'El servidor todavía no conoce las órdenes del taller: hay que actualizarlo.';
  }
  return respuesta?.error || 'No se pudo enviar a tu Blender.';
}

// --- Camino rápido y repasos ------------------------------------------------------------

// «¿Ya sabes esto? Demuéstralo»: las habilidades que aún necesitan guía.
export function habilidadesParaProbar(plan) {
  if (!plan?.puede_probar) return [];
  return habilidadesConVivo(plan.habilidades).filter((h) => !h.lista && h.fase !== 'dominada');
}

// «Recuérdalo»: los repasos vencidos con su nombre (pueden ser de talleres anteriores).
export function repasosDelPlan(plan, vivo = null) {
  const titulos = new Map((plan?.habilidades ?? []).filter((h) => h?.id).map((h) => [h.id, h.titulo]));
  const ids = vivo?.repasos?.length ? vivo.repasos : (plan?.repasos ?? []);
  return [...new Set(textos(ids))].map((id) => ({ id, titulo: titulos.get(id) || tituloDeId(id) }));
}

// --- Cuándo cuenta la lección ------------------------------------------------------------

// --- Motor 6: la etapa de la lección (engine/amatista_engine/taller/etapas.py) -------------
// La guía de aprendizaje pone dos momentos en Blender por módulo: la exploración (las primeras
// habilidades, Mira y un Hazlo conmigo, antes de la teoría) y la práctica de cierre (el resto del
// ciclo hasta el proyecto). La lección manda su etapa y Blender no sale de ella.
export const ETAPAS = ['exploracion', 'practica'];
export const EXPLORAR = 2;

export const etapaDe = (bloque) => (bloque?.etapa === 'exploracion' ? 'exploracion' : 'practica');

// Las habilidades que prueba la exploración: las que diga la lección (del taller) o las primeras dos.
export function habilidadesDeExploracion(plan, bloque) {
  const delTaller = (plan?.habilidades ?? []).map((h) => h?.id).filter(Boolean);
  const pedidas = textos(bloque?.habilidades).filter((id) => !delTaller.length || delTaller.includes(id));
  return (pedidas.length ? [...new Set(pedidas)] : delTaller.slice(0, EXPLORAR)).slice(0, 4);
}

// Ya la vio hacer y la intentó una vez (o ya la sabía).
export const explorada = (h) =>
  Boolean(h) && (Boolean(h.lista) || (entero(h.intentos) > 0 && (Boolean(h.vio_demo) || (h.fase && h.fase !== 'nueva'))));

export function exploracionHecha(plan, ids) {
  const porId = new Map((plan?.habilidades ?? []).filter((h) => h?.id).map((h) => [h.id, h]));
  return ids.length > 0 && ids.every((id) => explorada(porId.get(id)));
}

// Lo que la orden «taller_abrir» lleva de la etapa (y la lección a la que Blender vuelve).
export function datosDeEtapa(bloque, plan, leccionId = '') {
  const etapa = etapaDe(bloque);
  return {
    etapa,
    ...(etapa === 'exploracion' ? { habilidades: habilidadesDeExploracion(plan, bloque) } : {}),
    ...(leccionId ? { leccion: leccionId } : {}),
  };
}

// La lección del taller se da por hecha: en la exploración, cuando sus habilidades se probaron (o
// Blender avisa que la etapa se cumplió); en la práctica, cuando el proyecto del módulo se abre.
export function tallerResuelto(plan, vivo = null, bloque = null) {
  if (etapaDe(bloque) === 'exploracion') {
    return Boolean(vivo?.etapa === 'exploracion' && vivo.etapaCumplida) || exploracionHecha(plan, habilidadesDeExploracion(plan, bloque));
  }
  return Boolean(plan?.proyecto_abierto || vivo?.proyectoAbierto);
}

// Un servidor que no conoce el taller (404) no traba la lección: se puede seguir sin él.
export const tallerNoDisponible = (respuesta) => Boolean(respuesta && !respuesta.ok && respuesta.status === 404);

// --- El proyecto (Úsalo) y el reto final -------------------------------------------------

export function estadoProyecto(plan) {
  if (!plan) return null;
  const proyecto = plan.proyecto_hecho ? 'hecho' : plan.proyecto_abierto ? 'abierto' : 'cerrado';
  const reto = plan.reto_hecho && plan.proyecto_hecho ? 'hecho' : plan.proyecto_hecho ? 'disponible' : 'despues';
  return { proyecto, reto };
}

export const ordenReto = (plan) => ({ tipo: 'taller_abrir', taller: plan.taller, actividad: `reto:${plan.taller}` });

// Avance de un taller para tarjetas y listas (0 a 100) y su frase.
export function avanceTaller(t) {
  if (!t) return 0;
  if (t.proyecto_abierto || t.proyecto_hecho) return 100;
  const total = entero(t.total);
  return total ? Math.round((100 * Math.min(entero(t.listas), total)) / total) : 0;
}

export function resumenTaller(t) {
  if (!t) return 'Sin empezar';
  if (t.proyecto_hecho && t.reto_hecho) return 'Proyecto y reto hechos: ya está en tu isla.';
  if (t.proyecto_hecho) return 'Proyecto hecho y en tu isla. Te queda el reto.';
  if (t.proyecto_abierto) return 'Tus habilidades ya te salen: el proyecto está abierto.';
  const total = entero(t.total);
  if (!total) return 'Sin empezar';
  return `${Math.min(entero(t.listas), total)} de ${total} habilidades ya te salen`;
}

// --- Tu isla ----------------------------------------------------------------------------

const COLOR_POR_DEFECTO = '#9b59b6';
const esColor = (valor) => typeof valor === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(valor);
const lugarDe = (t) => {
  const lugar = t?.isla?.lugar;
  if (!Array.isArray(lugar) || lugar.length < 2) return null;
  const [x, y] = lugar.map(Number);
  return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : null;
};

// Un punto por taller en un lienzo de ancho × alto. isla.lugar viene en metros de la escena de
// Blender vista desde arriba (+Y hacia el fondo = hacia arriba en la pantalla). Sin lugar, el
// taller se acomoda en una ronda alrededor del centro. Las etiquetas van debajo del punto; si
// chocan con otra ya puesta, arriba.
export function disenoIsla(talleres = [], { ancho = 320, alto = 180, margen = 40 } = {}) {
  const lista = (Array.isArray(talleres) ? talleres : []).filter((t) => t?.taller);
  const lugares = lista.map(lugarDe);
  const validos = lugares.filter(Boolean);
  const xs = validos.map((p) => p[0]);
  const ys = validos.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = validos.length ? [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)] : [0, 0, 0, 0];
  const escala = Math.min((ancho - 2 * margen) / (maxX - minX || 1), (alto - 2 * margen) / (maxY - minY || 1));
  const [cx, cy] = [ancho / 2, alto / 2];
  const sinLugar = lugares.filter((l) => !l).length;
  let ronda = 0;
  const puestas = [];
  return lista.map((t, i) => {
    let x;
    let y;
    if (lugares[i]) {
      x = cx + (lugares[i][0] - (minX + maxX) / 2) * escala;
      y = cy - (lugares[i][1] - (minY + maxY) / 2) * escala;
    } else {
      const angulo = (2 * Math.PI * ronda) / Math.max(sinLugar, 1) - Math.PI / 2;
      ronda += 1;
      x = cx + Math.cos(angulo) * (ancho / 2 - margen);
      y = cy + Math.sin(angulo) * (alto / 2 - margen);
    }
    x = Math.round(Math.min(ancho - margen / 2, Math.max(margen / 2, x)) * 10) / 10;
    y = Math.round(Math.min(alto - margen / 2, Math.max(margen / 2, y)) * 10) / 10;
    const choca = (ly) => puestas.some((p) => Math.abs(p.x - x) < 70 && Math.abs(p.ly - ly) < 12);
    const abajo = y + 20;
    const etiqueta = choca(abajo) && !choca(y - 14) ? 'arriba' : 'abajo';
    puestas.push({ x, ly: etiqueta === 'abajo' ? abajo : y - 14 });
    return {
      id: t.taller,
      x,
      y,
      etiqueta,
      color: esColor(t.isla?.color) ? t.isla.color : COLOR_POR_DEFECTO,
      pieza: t.isla?.pieza || t.titulo || t.taller,
      texto: t.isla?.texto || '',
      titulo: t.titulo || '',
      curso: t.curso || '',
      modulo: t.modulo ?? null,
      hecho: Boolean(t.proyecto_hecho),
      estrella: Boolean(t.proyecto_hecho && t.reto_hecho),
      abierto: Boolean(t.proyecto_abierto),
    };
  });
}

// «La estación y el tren» → cabe en la etiqueta del mapa (el nombre completo va en el título).
export function etiquetaCorta(texto = '', maximo = 18) {
  const limpio = String(texto).trim();
  return limpio.length > maximo ? `${limpio.slice(0, maximo - 1).trimEnd()}…` : limpio;
}
