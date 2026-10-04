// Módulos con práctica en Blender (v3.1, docs/plataforma/02_modulos_y_practica.md).
// Cada módulo cierra con su práctica: primero las lecciones y luego la
// práctica dentro de Blender. La práctica es una lección que contiene un
// bloque blender_practice; el servidor exige que vaya al final del módulo
// (solo el examen puede ir después). Funciones puras: se prueban sin React.
import { estaCompletada, estaDesbloqueada } from '../progreso/reglas';

const leccionesDe = (modulo) => modulo?.contenido?.lessons ?? modulo?.lessons ?? [];

export const bloquePractica = (leccion) =>
  (leccion?.contentBlocks ?? []).find((bloque) => bloque?.type === 'blender_practice') ?? null;

export const esPracticaBlender = (leccion) => Boolean(bloquePractica(leccion));

// {leccion, indice, bloque} de la práctica del módulo (la primera, si hubiera varias) o null.
export function practicaDelModulo(modulo) {
  const lecciones = leccionesDe(modulo);
  const indice = lecciones.findIndex(esPracticaBlender);
  return indice < 0 ? null : { leccion: lecciones[indice], indice, bloque: bloquePractica(lecciones[indice]) };
}

// Divide el módulo en lo que se dibuja: las lecciones antes de la práctica,
// la práctica y lo que va después (el examen final).
export function partesDelModulo(modulo) {
  const lecciones = leccionesDe(modulo).map((leccion, indice) => ({ leccion, indice }));
  const practica = practicaDelModulo(modulo);
  if (!practica) return { antes: lecciones, practica: null, despues: [] };
  return {
    antes: lecciones.filter(({ indice, leccion }) => indice < practica.indice && !esPracticaBlender(leccion)),
    practica,
    despues: lecciones.filter(({ indice }) => indice > practica.indice),
  };
}

// Estado de la práctica del módulo para el mapa del curso:
//   hecha · abierta · bloqueada (faltan N lecciones) · sin práctica (null).
export function estadoPractica(progreso, cursoId, modulo) {
  const { antes, practica } = partesDelModulo(modulo);
  if (!practica) return null;
  const faltan = antes.filter(({ leccion }) => !estaCompletada(progreso, cursoId, leccion)).length;
  if (estaCompletada(progreso, cursoId, practica.leccion)) return { estado: 'hecha', faltan: 0, practica };
  const abierta = estaDesbloqueada(progreso, cursoId, modulo, practica.indice) && faltan === 0;
  return { estado: abierta ? 'abierta' : 'bloqueada', faltan, practica };
}

// Prácticas de todos los módulos publicados del catálogo (panel del alumno).
export function practicasDelCatalogo(cursos = []) {
  return cursos.flatMap((curso) =>
    (curso.modulos ?? []).flatMap((modulo) => {
      const practica = modulo.contenido ? practicaDelModulo(modulo) : null;
      return practica ? [{ curso, modulo, ...practica }] : [];
    }),
  );
}
