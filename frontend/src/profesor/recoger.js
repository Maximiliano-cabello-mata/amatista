// Trae el modelo de una entrega a esta computadora.
//
// 1. Si ya está en esta computadora (IndexedDB), se usa ese: no gasta datos.
// 2. Si no, se baja del servidor (unos KB), se revisa que se pueda armar y
//    se guarda aquí; SOLO entonces se avisa al servidor, que lo borra.
// Si este navegador no puede guardar, el modelo se muestra pero el servidor
// lo conserva (así no se pierde).
import { confirmarModeloRecibido, recogerModelo } from '../services/evaluacion';
import { guardarModelo, hayAlmacen, leerModelo, pedirPersistencia } from './almacen';
import { armarEscena, desempaquetar } from './modelo';

// → {ok, escena, origen: 'computadora'|'servidor', guardado, bytes, error}
export async function traerModelo({ token, profesorId, asignacion, fila }) {
  const alumnoId = fila.alumno.id;
  if (hayAlmacen()) {
    try {
      const local = await leerModelo(profesorId, asignacion.id, alumnoId);
      // Si el alumno volvió a entregar después, el de la computadora ya es viejo.
      const vigente = local && !(fila.entrega?.modelo_en_servidor && fila.entrega.entregada_en !== local.entregada_en);
      if (vigente) {
        return { ok: true, escena: armarEscena(await desempaquetar(local.paquete)), origen: 'computadora', guardado: true, bytes: local.bytes };
      }
    } catch {
      // Sin acceso a IndexedDB: se intenta con el servidor.
    }
  }
  const r = await recogerModelo(token, asignacion.id, alumnoId);
  if (!r.ok) return { ok: false, error: r.error };
  let escena;
  try {
    escena = armarEscena(await desempaquetar(r.datos.modelo));
  } catch (error) {
    return { ok: false, error: error.message || 'No pudimos armar el modelo.' };
  }
  let guardado = false;
  if (hayAlmacen()) {
    try {
      await guardarModelo({
        profesorId,
        asignacionId: asignacion.id,
        alumnoId,
        alumno: fila.alumno.nombre,
        practica: asignacion.titulo,
        paquete: r.datos.modelo,
        bytes: r.datos.bytes,
        entregada_en: r.datos.entregada_en,
      });
      guardado = true;
      pedirPersistencia();
      await confirmarModeloRecibido(token, asignacion.id, alumnoId);
    } catch {
      guardado = false;
    }
  }
  return { ok: true, escena, origen: 'servidor', guardado, bytes: r.datos.bytes };
}
