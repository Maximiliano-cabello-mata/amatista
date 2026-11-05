// Los modelos que recogió el profesor viven SOLO en su computadora (IndexedDB).
//
// El servidor guarda el modelo ligero de una entrega únicamente hasta que el
// profesor lo abre: el panel lo guarda aquí, confirma al servidor y el
// servidor lo borra. Base aparte de la del progreso (lib/almacen.js), así
// borrar los modelos nunca toca el avance de nadie. Si este navegador no
// tiene IndexedDB (modo privado de algunos navegadores), el modelo se ve
// igual pero NO se confirma al servidor, para no perderlo.
const BASE = 'amatista-profesor';
const TIENDA = 'modelos';
const ESPERA_MAXIMA = 4000;

let conexion;

export function hayAlmacen() {
  return typeof indexedDB !== 'undefined';
}

function abrir() {
  conexion ??= new Promise((resolver, rechazar) => {
    const peticion = indexedDB.open(BASE, 1);
    peticion.onupgradeneeded = () => {
      const tienda = peticion.result.createObjectStore(TIENDA, { keyPath: 'clave' });
      tienda.createIndex('profesor', 'profesorId');
    };
    peticion.onsuccess = () => resolver(peticion.result);
    peticion.onerror = () => rechazar(peticion.error);
    setTimeout(() => rechazar(new Error('IndexedDB no respondió')), ESPERA_MAXIMA);
  }).catch((error) => {
    conexion = undefined;
    throw error;
  });
  return conexion;
}

async function operar(modo, accion) {
  const base = await abrir();
  return new Promise((resolver, rechazar) => {
    const transaccion = base.transaction(TIENDA, modo);
    const peticion = accion(transaccion.objectStore(TIENDA));
    transaccion.oncomplete = () => resolver(peticion.result);
    transaccion.onerror = () => rechazar(transaccion.error);
    transaccion.onabort = () => rechazar(transaccion.error ?? new Error('Sin espacio en este navegador'));
  });
}

export const claveModelo = (profesorId, asignacionId, alumnoId) => `${profesorId}|${asignacionId}|${alumnoId}`;

// registro: {profesorId, asignacionId, alumnoId, alumno, practica, grupo, paquete, bytes, entregada_en}
export async function guardarModelo(registro) {
  const completo = { ...registro, clave: claveModelo(registro.profesorId, registro.asignacionId, registro.alumnoId), guardado_en: new Date().toISOString() };
  await operar('readwrite', (tienda) => tienda.put(completo));
  return completo;
}

export const leerModelo = (profesorId, asignacionId, alumnoId) =>
  operar('readonly', (tienda) => tienda.get(claveModelo(profesorId, asignacionId, alumnoId)));

export const listarModelos = (profesorId) => operar('readonly', (tienda) => tienda.index('profesor').getAll(profesorId));

export const borrarModelo = (clave) => operar('readwrite', (tienda) => tienda.delete(clave));

// Pide al navegador que no borre estos datos cuando le falte espacio (sin preguntar al profesor).
export async function pedirPersistencia() {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true;
    return Boolean(await navigator.storage?.persist?.());
  } catch {
    return false;
  }
}
