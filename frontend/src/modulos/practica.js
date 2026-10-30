// Módulos con Blender (v3.2, docs/plataforma/02_modulos_y_practica.md; motor 5).
// Teoría y Blender se intercalan: teoría, el taller de habilidades del módulo
// en Blender, más teoría y el proyecto que cierra el módulo. El taller es una
// lección con un bloque blender_taller (cada habilidad: Mira, Hazlo conmigo y
// Hazlo tú); el proyecto, una lección con un bloque blender_practice (Úsalo,
// queda en tu isla) y un blender_taller con vista «proyecto» que muestra la
// pieza de la isla y el reto final. Todo se hace con Blender conectado: el
// motor registra el avance. Funciones puras: se prueban sin React.
import { estaCompletada, estaDesbloqueada } from '../progreso/reglas';

const leccionesDe = (modulo) => modulo?.contenido?.lessons ?? modulo?.lessons ?? [];
const bloquesDe = (leccion) => leccion?.contentBlocks ?? [];

export const bloquePractica = (leccion) => bloquesDe(leccion).find((bloque) => bloque?.type === 'blender_practice') ?? null;

// El taller de la lección (la vista «proyecto» no cuenta: es la tarjeta del proyecto).
export const bloqueTaller = (leccion) =>
  bloquesDe(leccion).find((bloque) => bloque?.type === 'blender_taller' && bloque.vista !== 'proyecto') ?? null;

// Lo que hace de la lección una estación de Blender: su práctica o su taller.
export const bloqueBlender = (leccion) => bloquePractica(leccion) ?? bloqueTaller(leccion);

export const esPracticaBlender = (leccion) => Boolean(bloqueBlender(leccion));

export const esTallerBlender = (leccion) => !bloquePractica(leccion) && Boolean(bloqueTaller(leccion));

// Todas las estaciones de Blender del módulo en orden: [{leccion, indice, bloque, taller, cierre}].
// `taller` es el id del taller (null en una práctica); `cierre` es la última (el proyecto).
export function practicasDelModulo(modulo) {
  const lista = leccionesDe(modulo)
    .map((leccion, indice) => {
      const bloque = bloqueBlender(leccion);
      return { leccion, indice, bloque, taller: bloque?.type === 'blender_taller' ? bloque.taller : null };
    })
    .filter(({ bloque }) => bloque);
  return lista.map((practica, i) => ({ ...practica, cierre: i === lista.length - 1 }));
}

// Estado de la estación de la lección `indice` (hecha · abierta · bloqueada):
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
// [{tipo: 'leccion' | 'practica', leccion, indice, bloque?, taller?, cierre?}]
export function secuenciaDelModulo(modulo) {
  const practicas = new Map(practicasDelModulo(modulo).map((p) => [p.indice, p]));
  return leccionesDe(modulo).map((leccion, indice) =>
    practicas.has(indice) ? { tipo: 'practica', ...practicas.get(indice) } : { tipo: 'leccion', leccion, indice },
  );
}

// Estaciones de todos los módulos publicados del catálogo (panel del alumno),
// talleres y proyectos, en el orden del curso.
export function practicasDelCatalogo(cursos = []) {
  return cursos.flatMap((curso) =>
    (curso.modulos ?? []).flatMap((modulo) =>
      modulo.contenido ? practicasDelModulo(modulo).map((practica) => ({ curso, modulo, ...practica })) : [],
    ),
  );
}

// Dónde vive un taller en el catálogo: su curso, su módulo, la lección del
// taller y la del proyecto (la que lleva la vista «proyecto» del mismo taller o,
// si no la tiene, la práctica que cierra el módulo). null si no está publicado.
export function ubicarTaller(cursos = [], tallerId) {
  if (!tallerId) return null;
  for (const curso of cursos ?? []) {
    for (const modulo of curso.modulos ?? []) {
      const lecciones = leccionesDe(modulo);
      const delTaller = (leccion) =>
        bloquesDe(leccion).filter((b) => b?.type === 'blender_taller' && b.vista !== 'proyecto' && b.taller === tallerId);
      // Motor 6: la lección del taller es la de su práctica (donde se terminan las habilidades); la
      // exploración va antes, en su propia lección.
      const indicePractica = lecciones.findIndex((leccion) => delTaller(leccion).some((b) => b.etapa !== 'exploracion'));
      const indiceExploracion = lecciones.findIndex((leccion) => delTaller(leccion).some((b) => b.etapa === 'exploracion'));
      const indiceTaller = indicePractica >= 0 ? indicePractica : indiceExploracion;
      if (indiceTaller < 0) continue;
      const conVista = lecciones.findIndex((leccion) =>
        bloquesDe(leccion).some((b) => b?.type === 'blender_taller' && b.vista === 'proyecto' && b.taller === tallerId),
      );
      const cierre = practicasDelModulo(modulo).filter((p) => !p.taller).at(-1)?.indice ?? -1;
      const indiceProyecto = conVista >= 0 ? conVista : cierre;
      return {
        curso,
        modulo,
        leccionTaller: lecciones[indiceTaller],
        indiceTaller,
        leccionExploracion: indiceExploracion >= 0 ? lecciones[indiceExploracion] : null,
        leccionProyecto: indiceProyecto >= 0 ? lecciones[indiceProyecto] : null,
        indiceProyecto,
      };
    }
  }
  return null;
}

// La lección (y su curso) donde vive un bloque, por su id y su tipo: la orden del taller dice a qué
// lección vuelve Blender al cumplir la etapa (motor 6). null si no está en el catálogo.
export function leccionDelBloque(cursos = [], bloque = null) {
  if (!bloque?.id) return null;
  for (const curso of cursos ?? []) {
    for (const modulo of curso.modulos ?? []) {
      const leccion = leccionesDe(modulo).find((l) =>
        bloquesDe(l).some((b) => b?.id === bloque.id && b?.type === bloque.type && b?.taller === bloque.taller),
      );
      if (leccion) return { curso, modulo, leccion };
    }
  }
  return null;
}
