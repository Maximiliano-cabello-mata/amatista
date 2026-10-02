// Retos semanales y logros del panel: funciones puras derivadas del progreso
// local (pruebas en retos.test.js). No se guarda nada aparte: si llega
// progreso de otro dispositivo, los retos se recalculan solos.
//
// Fuentes (todas reales del estado v2):
//   - lecciones completadas en una fecha → registro.completadaEn (fecha local)
//   - días activos y "actividades" → progreso.actividad {"YYYY-MM-DD": n}; n
//     suma 1 por actividad resuelta, intento de examen o lección completada
//   - actividades perfectas (a la primera) → datos.p de cada lección (sin
//     fecha: por eso cuentan como logro acumulado y no como reto semanal)
//   - racha → calcularRacha(actividad, hoy)
import { diaSemana, inicioSemana } from '../graficas/fechas';
import { calcularRacha, fechaLocal, sumarDias } from '../../progreso/reglas';

const entero = (valor) => Math.max(0, Math.floor(Number(valor) || 0));

// Día local en que se completó la lección, o null si no hay dato válido.
export function diaCompletada(registro) {
  if (!registro?.completada || !registro.completadaEn) return null;
  const tiempo = Date.parse(registro.completadaEn);
  return Number.isNaN(tiempo) ? null : fechaLocal(new Date(tiempo));
}

// Días que faltan para que se renueven los retos (incluye hoy): lunes → 7, domingo → 1.
export const diasRestantesSemana = (hoy) => 7 - diaSemana(hoy);

// {diasActivos, lecciones, actividades} entre dos fechas "YYYY-MM-DD" (inclusive).
export function resumenPeriodo(progreso, desde, hasta) {
  let diasActivos = 0;
  let actividades = 0;
  for (const [dia, cantidad] of Object.entries(progreso?.actividad ?? {})) {
    if (dia < desde || dia > hasta || entero(cantidad) === 0) continue;
    diasActivos += 1;
    actividades += entero(cantidad);
  }
  let lecciones = 0;
  for (const registro of Object.values(progreso?.lecciones ?? {})) {
    const dia = diaCompletada(registro);
    if (dia && dia >= desde && dia <= hasta) lecciones += 1;
  }
  return { diasActivos, lecciones, actividades };
}

// Semana actual (lunes a domingo) y la anterior, para comparar.
export function resumenSemana(progreso, hoy = new Date()) {
  const desde = inicioSemana(hoy);
  const hasta = sumarDias(desde, 6);
  const desdeAnterior = sumarDias(desde, -7);
  return {
    desde,
    hasta,
    ...resumenPeriodo(progreso, desde, hasta),
    anterior: { desde: desdeAnterior, hasta: sumarDias(desde, -1), ...resumenPeriodo(progreso, desdeAnterior, sumarDias(desde, -1)) },
  };
}

// Serie de las últimas `semanas` semanas (la más antigua primero) para la gráfica de barras.
export function seriePorSemana(progreso, hoy = new Date(), semanas = 12) {
  const actual = inicioSemana(hoy);
  return Array.from({ length: semanas }, (_, i) => {
    const desde = sumarDias(actual, -7 * (semanas - 1 - i));
    const hasta = sumarDias(desde, 6);
    return { desde, hasta, actual: desde === actual, ...resumenPeriodo(progreso, desde, hasta) };
  });
}

// --- Totales acumulados -------------------------------------------------------

export function totales(progreso) {
  const registros = Object.values(progreso?.lecciones ?? {});
  return {
    lecciones: registros.filter((registro) => registro?.completada).length,
    perfectas: registros.reduce((suma, registro) => suma + entero(registro?.datos?.p), 0),
    resueltas: registros.reduce((suma, registro) => suma + entero(registro?.datos?.a), 0),
    insignias: Object.keys(progreso?.insignias ?? {}).length,
  };
}

// --- Retos y logros -----------------------------------------------------------

function medir(valor, meta) {
  const numero = entero(valor);
  return { valor: numero, meta, actual: Math.min(numero, meta), avance: Math.min(1, numero / meta), completado: numero >= meta };
}

// Retos de la semana: se reinician cada lunes (la racha sigue su propia regla).
const RETOS_SEMANALES = [
  {
    id: 'lecciones-semana',
    titulo: 'Completa 3 lecciones esta semana',
    descripcion: 'Cada lección nueva que termines cuenta.',
    meta: 3,
    medir: ({ semana }) => semana.lecciones,
  },
  {
    id: 'dias-semana',
    titulo: 'Estudia 3 días distintos esta semana',
    descripcion: 'Un poco cada día rinde más que todo de golpe.',
    meta: 3,
    medir: ({ semana }) => semana.diasActivos,
  },
  {
    id: 'racha-3',
    titulo: 'Mantén una racha de 3 días',
    descripcion: 'Practica días seguidos: si hoy no practicas, la racha de ayer sigue viva hasta la medianoche.',
    meta: 3,
    medir: ({ racha }) => racha.actual,
  },
  {
    id: 'actividades-semana',
    titulo: 'Suma 10 actividades esta semana',
    descripcion: 'Actividades resueltas, intentos de examen y lecciones completadas.',
    meta: 10,
    medir: ({ semana }) => semana.actividades,
  },
];

// Logros acumulados por niveles: al cumplir una meta aparece la siguiente.
const LOGROS = [
  {
    id: 'perfectas',
    titulo: (meta) => `Resuelve ${meta} actividades perfectas`,
    descripcion: 'Actividades interactivas resueltas al primer intento (+10 XP cada una).',
    niveles: [5, 15, 40, 100],
    medir: ({ total }) => total.perfectas,
  },
  {
    id: 'lecciones',
    titulo: (meta) => (meta === 1 ? 'Completa tu primera lección' : `Completa ${meta} lecciones`),
    descripcion: 'Lecciones terminadas en todos los cursos (+100 XP cada una).',
    niveles: [1, 5, 10, 25, 50],
    medir: ({ total }) => total.lecciones,
  },
  {
    id: 'mejor-racha',
    titulo: (meta) => `Logra una racha de ${meta} días`,
    descripcion: 'Tu mejor racha de días seguidos con actividad.',
    niveles: [3, 7, 14, 30],
    medir: ({ racha }) => racha.mejor,
  },
  {
    id: 'insignias',
    titulo: (meta) => (meta === 1 ? 'Gana tu primera insignia' : `Gana ${meta} insignias`),
    descripcion: 'Aprueba el examen final de un módulo para ganar su insignia.',
    niveles: [1, 2, 4, 8],
    medir: ({ total }) => total.insignias,
  },
];

function logro(definicion, contexto) {
  const valor = entero(definicion.medir(contexto));
  const alcanzados = definicion.niveles.filter((nivel) => valor >= nivel).length;
  const terminado = alcanzados === definicion.niveles.length;
  const meta = terminado ? definicion.niveles[definicion.niveles.length - 1] : definicion.niveles[alcanzados];
  return {
    id: definicion.id,
    tipo: 'logro',
    titulo: definicion.titulo(meta),
    descripcion: definicion.descripcion,
    ...medir(valor, meta),
    completado: terminado,
    nivel: alcanzados,
    niveles: definicion.niveles.length,
  };
}

// {semana, semanales: [reto], logros: [logro], renuevaEn: días}
// reto = {id, tipo, titulo, descripcion, valor, meta, actual (≤ meta), avance 0-1, completado}
// logro = reto + {nivel: metas cumplidas, niveles: metas en total}
export function calcularRetos(progreso, hoy = new Date()) {
  const hoyTexto = fechaLocal(hoy);
  const contexto = {
    semana: resumenSemana(progreso, hoyTexto),
    racha: calcularRacha(progreso?.actividad ?? {}, hoyTexto),
    total: totales(progreso),
  };
  return {
    semana: contexto.semana,
    semanales: RETOS_SEMANALES.map((reto) => ({
      id: reto.id,
      tipo: 'semanal',
      titulo: reto.titulo,
      descripcion: reto.descripcion,
      ...medir(reto.medir(contexto), reto.meta),
    })),
    logros: LOGROS.map((definicion) => logro(definicion, contexto)),
    renuevaEn: diasRestantesSemana(hoyTexto),
  };
}
