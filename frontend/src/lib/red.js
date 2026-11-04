// Red con pocos datos (escuelas que se conectan con datos móviles). Decide
// cuándo activar el «ahorro de datos» y cuánto esperar a un servidor lento.
// Las funciones de decisión son puras para probarlas; las que leen el
// navegador están al final.

export const PREFERENCIAS_AHORRO = ['auto', 'si', 'no'];
const CLAVE_PREFERENCIA = 'amatista:ahorro-datos';
export const EVENTO_RED = 'amatista:red';

// Tipos de red que el navegador reporta (Network Information API).
const REDES_MUY_LENTAS = ['slow-2g', '2g'];
const REDES_LENTAS = [...REDES_MUY_LENTAS, '3g'];

// ¿Ahorrar datos? «si» y «no» mandan; en «auto», el ahorro de datos del
// sistema (Android, Chrome) o una red 2G lo encienden.
export function decidirAhorro({ preferencia = 'auto', ahorroSistema = false, tipoRed } = {}) {
  if (preferencia === 'si') return true;
  if (preferencia === 'no') return false;
  return Boolean(ahorroSistema) || REDES_MUY_LENTAS.includes(tipoRed);
}

export const esRedLenta = (tipoRed) => REDES_LENTAS.includes(tipoRed);

// Tiempo máximo de una petición: en 2G/3G se le da más margen al servidor
// antes de darla por perdida (cortarla a medias gasta los datos igual).
export function esperaSegunRed(base, tipoRed) {
  if (REDES_MUY_LENTAS.includes(tipoRed)) return base * 3;
  if (tipoRed === '3g') return base * 2;
  return base;
}

// Reintentos cuando el envío falla por la red: cada vez se espera más (no se
// gasta batería ni datos golpeando una red que no responde) hasta 5 minutos.
// `azar` (0..1) reparte los reintentos de un aula entera en el tiempo.
const ESPERAS_REINTENTO = [5_000, 15_000, 45_000, 120_000, 300_000];
export function esperaReintento(fallos, azar = Math.random()) {
  const base = ESPERAS_REINTENTO[Math.min(Math.max(fallos, 1), ESPERAS_REINTENTO.length) - 1];
  return Math.round(base * (0.8 + 0.4 * azar));
}

// --- Navegador ---------------------------------------------------------------------

export function leerPreferenciaAhorro() {
  try {
    const valor = localStorage.getItem(CLAVE_PREFERENCIA);
    return PREFERENCIAS_AHORRO.includes(valor) ? valor : 'auto';
  } catch {
    return 'auto';
  }
}

export function guardarPreferenciaAhorro(valor) {
  try {
    if (valor === 'auto') localStorage.removeItem(CLAVE_PREFERENCIA);
    else localStorage.setItem(CLAVE_PREFERENCIA, valor);
  } catch {
    // Sin almacenamiento: la preferencia dura hasta cerrar la pestaña.
  }
  preferenciaEnMemoria = valor;
  window.dispatchEvent(new Event(EVENTO_RED));
}

let preferenciaEnMemoria = null;

export function senalesRed() {
  const conexion = typeof navigator === 'undefined' ? null : navigator.connection;
  return {
    preferencia: preferenciaEnMemoria ?? leerPreferenciaAhorro(),
    ahorroSistema: conexion?.saveData === true,
    tipoRed: conexion?.effectiveType,
  };
}

export const ahorroActivo = () => decidirAhorro(senalesRed());

export const esperaPorRed = (base) => esperaSegunRed(base, senalesRed().tipoRed);

// Avisa cuando cambia la red o la preferencia. Devuelve la función para dejar de escuchar.
export function escucharRed(aviso) {
  const conexion = typeof navigator === 'undefined' ? null : navigator.connection;
  window.addEventListener(EVENTO_RED, aviso);
  conexion?.addEventListener?.('change', aviso);
  return () => {
    window.removeEventListener(EVENTO_RED, aviso);
    conexion?.removeEventListener?.('change', aviso);
  };
}
