// Vista del equipo (profesores y administradores): funciones puras, sin React
// (pruebas en reglas.test.js).
//
// Quien es del equipo puede recorrer la plataforma de dos formas:
//   · «admin»: ve la pestaña Admin y todas las lecciones abiertas (modo
//     revisión), para saltar a cualquier curso, módulo, lección, estación de
//     Blender o jefe sin completar lo anterior.
//   · «alumno»: ve exactamente lo que ve un alumno, con sus candados.
// Solo cambia lo que se muestra en este dispositivo: no toca el progreso de
// nadie y el servidor sigue validando el rol en cada petición.

export const MODOS = ['admin', 'alumno'];
export const CLAVE_VISTA = 'amatista:vista-equipo';

export function normalizarModo(valor) {
  return MODOS.includes(valor) ? valor : 'admin';
}

// {equipo, modo, comoAlumno, revision}: `revision` abre todas las lecciones.
export function calcularVista(esEquipo, modoGuardado) {
  if (!esEquipo) return { equipo: false, modo: 'alumno', comoAlumno: true, revision: false };
  const modo = normalizarModo(modoGuardado);
  return { equipo: true, modo, comoAlumno: modo === 'alumno', revision: modo === 'admin' };
}

// Estado de una estación de Blender visto por el equipo en modo revisión:
// una bloqueada se muestra abierta y marcada como «abierta por revisión».
export function estacionConRevision(estado, revision) {
  if (!estado || !revision || estado.estado !== 'bloqueada') return estado;
  return { ...estado, estado: 'abierta', porRevision: true };
}
