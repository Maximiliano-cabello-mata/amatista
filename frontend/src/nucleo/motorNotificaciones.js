/**
 * Motor de Notificaciones Personalizadas Estilo Duolingo para Amatista 3D.
 *
 * Reacciona dinámicamente al estado del alumno (racha diaria, progreso en módulos
 * y hora preferida de estudio) invocando a los personajes del universo Amatista:
 * - BRASA: Alerta de racha en riesgo antes de medianoche.
 * - CHISPA: Celebración de meta diaria cumplida (+XP).
 * - MUSGO: Alerta de hito (a un paso del Jefe Final / Insignia).
 * - GOLIAT: Bienvenida y reactivación sin regaños tras inactividad.
 */

const CLAVE_HORA = 'amatista:hora_notif';
const HORA_PREDETERMINADA = '19:00';
let memoriaHora = null;

export function primerNombre(usuario) {
  const nombre = (usuario?.nombre ?? '').trim();
  return nombre ? nombre.split(/\s+/)[0] : 'Creador';
}

export const ESCENARIOS_NOTIFICACION = {
  RIESGO: 'riesgo',
  CUMPLIDA: 'cumplida',
  JEFE: 'jefe',
  REGRESO: 'regreso',
};

/**
 * Evalúa las condiciones del usuario y determina la notificación activa más prioritaria.
 */
export function evaluarNotificacion({ usuario = null, racha = {}, leccionSiguiente = null } = {}) {
  const nombre = primerNombre(usuario);
  const diasRacha = racha?.actual ?? 0;
  const hoyPracticado = Boolean(racha?.hoy);

  // 1. Racha en riesgo: tiene racha viva (>0) pero no ha practicado hoy
  if (diasRacha > 0 && !hoyPracticado) {
    return {
      clave: ESCENARIOS_NOTIFICACION.RIESGO,
      icono: '🔥',
      colorAcento: '#f5792a',
      personaje: 'BRASA · FORJA DE COBRE',
      etiqueta: `Racha: ${diasRacha}d en riesgo`,
      titulo: `🔥 ¡No dejes que tu racha de ${diasRacha} días se apague!`,
      mensaje: `Oye ${nombre}, la forja sigue tibia pero se apaga a medianoche. Dedícale 5 minutos a tu lección pendiente para salvar tu racha de ${diasRacha} días.`,
      cta: 'Salvar mi racha ▶',
      href: leccionSiguiente?.href ?? '#/',
      urgencia: 'alta',
    };
  }

  // 2. Meta diaria cumplida hoy
  if (hoyPracticado && diasRacha > 0) {
    return {
      clave: ESCENARIOS_NOTIFICACION.CUMPLIDA,
      icono: '⚡',
      colorAcento: '#00e5ff',
      personaje: 'CHISPA · CIUDAD NEÓN',
      etiqueta: `+XP hoy · Racha de ${diasRacha}d encendida`,
      titulo: `⚡ ¡Racha de ${diasRacha} días encendida, ${nombre}!`,
      mensaje: `Hoy ya sumaste actividad. Si avanzas una lección más te acercas al siguiente nivel del taller.`,
      cta: 'Seguir creando ▸',
      href: leccionSiguiente?.href ?? '#/',
      urgencia: 'baja',
    };
  }

  // 3. Regreso tras inactividad (racha en 0)
  return {
    clave: ESCENARIOS_NOTIFICACION.REGRESO,
    icono: '🐾',
    colorAcento: '#c39bd3',
    personaje: 'GOLIAT · GUARDIÁN DEL TALLER',
    etiqueta: 'Enciende tu racha',
    titulo: `🐾 Goliat cuidó tu mesa de trabajo, ${nombre}`,
    mensaje: `Hacer aunque sea una práctica corta de 5 minutos hoy enciende una nueva racha en tu panel.`,
    cta: 'Retomar en 5 min ▶',
    href: leccionSiguiente?.href ?? '#/',
    urgencia: 'media',
  };
}

export function leerHoraPreferencia() {
  if (memoriaHora) return memoriaHora;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(CLAVE_HORA) || HORA_PREDETERMINADA;
    }
  } catch {
    // Ignorar si modo privado
  }
  return HORA_PREDETERMINADA;
}

export function guardarHoraPreferencia(hora) {
  memoriaHora = hora;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(CLAVE_HORA, hora);
    }
  } catch {
    // Ignorar si modo privado
  }
}

/**
 * Solicita permisos de notificaciones del sistema en el navegador.
 */
export async function solicitarPermisoWeb() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'no_soportado';
  }
  if (window.Notification.permission === 'granted') {
    return 'concedido';
  }
  if (window.Notification.permission !== 'denied') {
    const estado = await window.Notification.requestPermission();
    return estado === 'granted' ? 'concedido' : 'denegado';
  }
  return 'denegado';
}

/**
 * Emite una notificación nativa del navegador si hay permisos concedidos.
 */
export function emitirNotificacionWeb(notificacion) {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (window.Notification.permission !== 'granted') return false;

  try {
    new window.Notification(notificacion.titulo, {
      body: notificacion.mensaje,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: `amatista-${notificacion.clave}`,
    });
    return true;
  } catch {
    return false;
  }
}
