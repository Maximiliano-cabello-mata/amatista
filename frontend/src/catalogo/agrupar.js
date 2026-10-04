// Un curso por tarjeta (v3.2): los cursos de una misma ruta (campo `ruta`,
// sql/008 CURSOS.RUTA) se muestran juntos. La ruta «blender» es una sola
// tarjeta «Blender» y dentro se ramifica en sus niveles: Principiante,
// Principiante-Intermedio, Intermedio y Avanzado. Cada nivel sigue siendo un
// curso con su id (el progreso, el servidor y el motor no cambian).
// Funciones puras: pruebas en agrupar.test.js.
import { resumenCurso } from '../progreso/reglas';

// Datos de cada ruta para su tarjeta. Una ruta que no esté aquí toma los del
// primer curso que la compone.
export const RUTAS = {
  blender: {
    titulo: 'Blender',
    subtitulo: 'De cero a crear tus propios mundos 3D',
    descripcion:
      'Todo Blender en un solo lugar: cuatro niveles que se ramifican desde tu primer cubo hasta proyectos completos. Teoría corta y práctica real dentro de Blender, con Amatista conectada y registrando tu avance.',
    acento: 'blender',
    logo: 'blender',
    recurso: { texto: 'Descarga Blender gratis', url: 'https://www.blender.org/download/' },
  },
  aframe: {
    titulo: 'A-Frame',
    subtitulo: 'Mundos WebXR en el navegador',
    descripcion:
      'Lleva tus modelos a la web: crea escenas 3D con HTML, agrega interacción y visítalas en realidad virtual o aumentada.',
    acento: 'neon',
    logo: 'aframe',
    recurso: { texto: 'Documentación de A-Frame', url: 'https://aframe.io/docs/' },
  },
};

// Cursos retirados que el servidor puede seguir enviando hasta correr sql/009:
// no se muestran como nivel (su progreso se conserva).
export const CURSOS_ARCHIVADOS = ['blender'];

const rutaDe = (curso) => curso.ruta || curso.id;

// [{id, titulo, subtitulo, descripcion, acento, logo, recurso, numero, niveles: [curso]}]
// en el orden del catálogo (por el primer nivel de cada ruta).
export function agruparPorRuta(cursos = []) {
  const grupos = new Map();
  for (const curso of cursos) {
    const id = rutaDe(curso);
    if (!grupos.has(id)) grupos.set(id, []);
    grupos.get(id).push(curso);
  }
  return [...grupos.entries()].map(([id, todos], indice) => {
    const niveles = todos.length > 1 ? todos.filter((curso) => !CURSOS_ARCHIVADOS.includes(curso.id)) : todos;
    const primero = niveles[0] ?? todos[0];
    const datos = RUTAS[id] ?? {};
    return {
      id,
      numero: String(indice + 1).padStart(2, '0'),
      titulo: datos.titulo ?? primero.titulo,
      subtitulo: datos.subtitulo ?? primero.subtitulo ?? '',
      descripcion: datos.descripcion ?? primero.descripcion ?? '',
      acento: datos.acento ?? primero.acento ?? 'neon',
      logo: datos.logo ?? id,
      recurso: datos.recurso ?? primero.recurso ?? null,
      niveles,
    };
  });
}

// La ruta de un id: el de la ruta («blender») o el de uno de sus niveles
// («blender_principiante»). Devuelve {ruta, nivel} (nivel puede ser null) o null.
export function buscarRuta(cursos, id) {
  const grupos = agruparPorRuta(cursos);
  const porRuta = grupos.find((grupo) => grupo.id === id);
  if (porRuta) return { ruta: porRuta, nivel: porRuta.niveles.length === 1 ? porRuta.niveles[0] : null };
  for (const grupo of grupos) {
    const nivel = grupo.niveles.find((curso) => curso.id === id);
    if (nivel) return { ruta: grupo, nivel };
  }
  return null;
}

// Avance de toda la ruta: suma de sus niveles disponibles, el nivel en curso
// (el primero con lecciones pendientes) y cuántos niveles están terminados.
export function resumenRuta(progreso, ruta) {
  let total = 0;
  let completadas = 0;
  let enCurso = null;
  let terminados = 0;
  for (const curso of ruta.niveles) {
    if (curso.estado === 'bloqueado') continue;
    const resumen = resumenCurso(progreso, curso);
    total += resumen.total;
    completadas += resumen.completadas;
    if (resumen.total > 0 && resumen.completadas === resumen.total) terminados += 1;
    else if (!enCurso && resumen.total > 0) enCurso = { curso, resumen };
  }
  return {
    total,
    completadas,
    porcentaje: total ? Math.round((completadas / total) * 100) : 0,
    enCurso,
    terminados,
    disponibles: ruta.niveles.filter((curso) => curso.estado !== 'bloqueado').length,
  };
}

// Estado de un nivel en el árbol: completado · en-curso · disponible · bloqueado.
export function estadoNivel(progreso, curso) {
  if (curso.estado === 'bloqueado') return 'bloqueado';
  const { total, completadas } = resumenCurso(progreso, curso);
  if (total > 0 && completadas === total) return 'completado';
  return completadas > 0 ? 'en-curso' : 'disponible';
}
