// Módulos con prácticas en Blender (v3.2, docs/plataforma/02_modulos_y_practica.md).
// Teoría y Blender se intercalan: teoría, una exploración corta en Blender,
// más teoría y la práctica que cierra el módulo. Cada práctica es una lección
// con un bloque blender_practice y se hace con Blender conectado: el motor
// registra el avance. Funciones puras: se prueban sin React.
import { estaCompletada, estaDesbloqueada } from '../progreso/reglas';

const leccionesDe = (modulo) => modulo?.contenido?.lessons ?? modulo?.lessons ?? [];

export const bloquePractica = (leccion) =>
  (leccion?.contentBlocks ?? []).find((bloque) => bloque?.type === 'blender_practice') ?? null;

export const esPracticaBlender = (leccion) => Boolean(bloquePractica(leccion));

// Todas las prácticas del módulo en orden: [{leccion, indice, bloque, cierre}].
// `cierre` es la última (la que cierra el módulo); las anteriores son exploraciones.
export function practicasDelModulo(modulo) {
  const lista = leccionesDe(modulo)
    .map((leccion, indice) => ({ leccion, indice, bloque: bloquePractica(leccion) }))
    .filter(({ bloque }) => bloque);
  return lista.map((practica, i) => ({ ...practica, cierre: i === lista.length - 1 }));
}

// Estado de la práctica de la lección `indice` (hecha · abierta · bloqueada):
// se abre al terminar las lecciones anteriores del módulo.
export function estadoPracticaEn(progreso, cursoId, modulo, indice) {
  const practica = practicasDelModulo(modulo).find((p) => p.indice === indice);
  if (!practica) return null;
  const faltan = leccionesDe(modulo)
    .slice(0, indice)
    .filter((leccion) => !estaCompletada(progreso, cursoId, leccion)).length;
  if (estaCompletada(progreso, cursoId, practica.leccion)) return { estado: 'hecha', faltan: 0, practica };
  const abierta = estaDesbloqueada(progreso, cursoId, modulo, indice) && faltan === 0;
  return { estado: abierta ? 'abierta' : 'bloqueada', faltan, practica };
}

// El módulo como se dibuja, en orden: lecciones de teoría y estaciones de Blender.
// [{tipo: 'leccion' | 'practica', leccion, indice, bloque?, cierre?}]
export function secuenciaDelModulo(modulo) {
  const practicas = new Map(practicasDelModulo(modulo).map((p) => [p.indice, p]));
  return leccionesDe(modulo).map((leccion, indice) =>
    practicas.has(indice) ? { tipo: 'practica', ...practicas.get(indice) } : { tipo: 'leccion', leccion, indice },
  );
}

// Prácticas de todos los módulos publicados del catálogo (panel del alumno),
// exploraciones y cierres, en el orden del curso.
export function practicasDelCatalogo(cursos = []) {
  return cursos.flatMap((curso) =>
    (curso.modulos ?? []).flatMap((modulo) =>
      modulo.contenido ? practicasDelModulo(modulo).map((practica) => ({ curso, modulo, ...practica })) : [],
    ),
  );
}
