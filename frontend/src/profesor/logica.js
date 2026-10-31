// Reglas del panel del profesor evaluador: funciones puras (pruebas en logica.test.js).

// Cómo va un alumno en una práctica asignada, para la tabla de entregas.
// fila: {entrega|null, avance|null} de GET /api/evaluacion/asignaciones/{id}.
export function estadoAlumno(fila) {
  const { entrega, avance } = fila;
  if (entrega?.estado === 'evaluada') return { clave: 'evaluada', texto: 'Evaluada', tono: 'bg-emerald-400/10 text-emerald-300', orden: 3 };
  if (entrega?.estado === 'rehacer') return { clave: 'rehacer', texto: 'Por rehacer', tono: 'bg-amber-300/10 text-amber-200', orden: 2 };
  if (entrega) return { clave: 'entregada', texto: entrega.tarde ? 'Entregó tarde' : 'Por evaluar', tono: 'bg-neon/10 text-neon', orden: 0 };
  if (avance) return { clave: 'trabajando', texto: `Trabajando · ${avance.progreso} %`, tono: 'bg-amatista/15 text-amatista-claro', orden: 1 };
  return { clave: 'sin_empezar', texto: 'Sin empezar', tono: 'bg-white/5 text-white/50', orden: 4 };
}

// Primero lo que espera al profesor (por evaluar), al final quien no ha empezado.
export function ordenarAlumnos(filas) {
  return [...filas].sort((a, b) => estadoAlumno(a).orden - estadoAlumno(b).orden || (a.alumno.nombre ?? '').localeCompare(b.alumno.nombre ?? '', 'es'));
}

export function contarEstados(filas) {
  const cuenta = { entregada: 0, evaluada: 0, rehacer: 0, trabajando: 0, sin_empezar: 0 };
  for (const fila of filas) cuenta[estadoAlumno(fila).clave] += 1;
  return cuenta;
}

// Lo que el alumno ve de una práctica que le dejaron (Mi panel › Mi grupo).
export function estadoParaAlumno(asignacion, ahora = new Date()) {
  const entrega = asignacion.entrega;
  if (entrega?.estado === 'evaluada') return { texto: entrega.calificacion != null ? `Evaluada · ${entrega.calificacion}/10` : 'Evaluada', tono: 'text-emerald-300' };
  if (entrega?.estado === 'rehacer') return { texto: 'Tu profesor te pide rehacerla', tono: 'text-amber-200' };
  if (entrega) return { texto: 'Entregada: tu profesor la revisará', tono: 'text-neon' };
  if (asignacion.estado === 'cerrada') return { texto: 'Cerrada', tono: 'text-white/45' };
  if (asignacion.fecha_limite && new Date(asignacion.fecha_limite) < ahora) return { texto: 'Se pasó la fecha: entrégala igual', tono: 'text-blender' };
  return { texto: 'Por entregar', tono: 'text-amatista-claro' };
}

const FORMATO_FECHA = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const FORMATO_DIA = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });

// El servidor guarda la hora en UTC sin zona: se le agrega para mostrarla en la hora local.
export function fecha(iso, { soloDia = false } = {}) {
  if (!iso) return '';
  const momento = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
  if (Number.isNaN(momento.getTime())) return '';
  return (soloDia ? FORMATO_DIA : FORMATO_FECHA).format(momento);
}

// <input type="date"> da «2026-11-05»: la fecha límite es el final de ese día, hora local.
export function finDelDia(valor) {
  if (!valor) return null;
  const [anio, mes, dia] = valor.split('-').map(Number);
  if (!anio || !mes || !dia) return null;
  return new Date(anio, mes - 1, dia, 23, 59, 0).toISOString();
}

// Código del grupo para dictarlo en el salón: «AMA-7K2P» → «AMA · 7 K 2 P».
export function codigoDictado(codigo = '') {
  const [prefijo, resto = ''] = codigo.split('-');
  return `${prefijo} · ${resto.split('').join(' ')}`;
}
