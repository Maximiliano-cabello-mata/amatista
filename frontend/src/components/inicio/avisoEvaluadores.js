// Aviso efímero para el corte de evaluación Hack4Edu.
// Solo 5 y 6 de noviembre de 2026 (hora de Ciudad de México).
// La versión en la clave evita reabrir el aviso después de verlo.
export const CLAVE_AVISO_EVALUADORES = 'amatista:aviso-evaluadores:2026-11-05';
const PRIMER_DIA = '2026-11-05';
const ULTIMO_DIA = '2026-11-06';

export function fechaCiudadMexico(ahora = new Date()) {
  const partes = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(ahora);
  const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${valores.year}-${valores.month}-${valores.day}`;
}

export function avisoVigente(ahora = new Date()) {
  const fecha = fechaCiudadMexico(ahora);
  return fecha >= PRIMER_DIA && fecha <= ULTIMO_DIA;
}

function almacenamientoLocal() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function debeMostrarAviso(ahora = new Date(), almacenamiento = almacenamientoLocal()) {
  if (!avisoVigente(ahora)) return false;
  try {
    return almacenamiento?.getItem(CLAVE_AVISO_EVALUADORES) !== 'visto';
  } catch {
    return true;
  }
}

export function marcarAvisoVisto(almacenamiento = almacenamientoLocal()) {
  try {
    almacenamiento?.setItem(CLAVE_AVISO_EVALUADORES, 'visto');
  } catch {
    // La guía también se puede cerrar cuando el navegador bloquea almacenamiento.
  }
}
