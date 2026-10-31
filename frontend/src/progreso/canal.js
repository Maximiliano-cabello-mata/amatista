// Por dónde se envía el progreso. El backend nuevo tiene /api/sincronizar
// (todo en una petición, comprimida con gzip); uno anterior solo
// /api/progreso + /api/eventos. La PWA lo descubre sola y lo recuerda:
//
// - desconocido: prueba /api/sincronizar SIN comprimir (un backend anterior
//   rechazaría la cabecera Content-Encoding en el preflight de CORS y el
//   envío parecería un fallo de red).
// - unico: /api/sincronizar respondió → el siguiente envío ya va comprimido.
// - gzip: /api/sincronizar comprimido.
// - legado: el servidor no tiene /api/sincronizar. Se vuelve a probar al día
//   siguiente por si lo actualizaron.
const UN_DIA = 24 * 60 * 60 * 1000;
const MODOS = ['desconocido', 'unico', 'gzip', 'legado'];

export function comoEnviar(canal, ahora = Date.now()) {
  const modo = MODOS.includes(canal?.modo) ? canal.modo : 'desconocido';
  if (modo === 'legado' && ahora - (canal.revisado ?? 0) < UN_DIA) return { ruta: 'legado' };
  return { ruta: 'unico', comprimir: modo === 'gzip' };
}

// Canal que queda después de una respuesta de /api/sincronizar.
export function trasRespuesta(canal, { status, comprimido }, ahora = Date.now()) {
  if (status === 404 || status === 405) return { modo: 'legado', revisado: ahora };
  // Un proxy que no deja pasar el cuerpo comprimido: se sigue sin comprimir.
  if (comprimido && (status === 400 || status === 415)) return { modo: 'unico', revisado: ahora };
  if (status >= 200 && status < 300) return { modo: 'gzip', revisado: ahora };
  return canal ?? { modo: 'desconocido', revisado: 0 };
}

const clave = (api) => `amatista:canal-sync:${api}`;

export function leerCanal(api) {
  try {
    return JSON.parse(localStorage.getItem(clave(api))) ?? null;
  } catch {
    return null;
  }
}

export function guardarCanal(api, canal) {
  try {
    localStorage.setItem(clave(api), JSON.stringify(canal));
  } catch {
    // Sin almacenamiento: se vuelve a descubrir en la siguiente visita.
  }
}
