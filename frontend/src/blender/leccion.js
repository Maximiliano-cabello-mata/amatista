// Motor 6.1: la plataforma y Blender son una sola cosa. La lección abierta le dice a Blender dónde
// va el alumno (orden «leccion»: al abrirse, al volver a la pestaña y cada 90 s), y cuando Blender
// cumple la etapa de la lección la plataforma pasa sola a la siguiente (evento EVENTO_LISTO).
// Lógica pura; el hook está en useLeccionEnBlender.js.
import { esPracticaBlender } from '../modulos/practica';

export const REPETIR_MS = 90_000; // Blender da la plataforma por cerrada si no sabe de ella en 240 s
export const EVENTO_LISTO = 'amatista:blender-listo';
export const CUENTA_REGRESIVA = 6; // s antes de pasar sola a la siguiente lección

export function claseDeLeccion(leccion) {
  if (leccion?.type === 'exam') return 'examen';
  if (esPracticaBlender(leccion)) return 'blender';
  return 'teoria';
}

// Los datos de la orden «leccion» (los mismos campos que valida el servidor en api/enlace.py › Orden).
export function datosLeccion(curso, ubicacion) {
  if (!curso?.id || !ubicacion?.leccion?.id) return null;
  const lecciones = ubicacion.modulo?.contenido?.lessons ?? [];
  return {
    curso: curso.id,
    leccion: ubicacion.leccion.id,
    titulo: String(ubicacion.leccion.title ?? '').slice(0, 120),
    clase: claseDeLeccion(ubicacion.leccion),
    numero: Math.min(99, (ubicacion.indice ?? 0) + 1),
    total: Math.min(99, lecciones.length),
  };
}

// ¿A dónde va la lección cuando Blender termina? Pasa sola solo si nada lo impide.
//   'siguiente'  cuenta regresiva y siguiente lección
//   'pendiente'  quedan actividades: se lleva al alumno a la que falta
export const queSigue = ({ bloqueado }) => (bloqueado ? 'pendiente' : 'siguiente');
