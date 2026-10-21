// Índice de todo el contenido (#/explorar): cada módulo y cada lección de
// todos los programas, listos para filtrar por programa, disciplina y texto.
// Así nadie tiene que recorrer la plataforma a fondo para descubrir lo que
// hay: todo se ve y se busca desde una sola página.
// Funciones puras: pruebas en indice.test.js.
import { SOFTWARE, softwareDeCurso } from '../data/software';
import { CURSOS_ARCHIVADOS } from './combinar';

// Minúsculas y sin acentos: «animación» encuentra «Animacion».
export function normalizar(texto = '') {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

// Lo que se puede buscar dentro de una lección: título, objetivo y textos de sus bloques.
function textoDeLeccion(leccion) {
  const partes = [leccion.title, leccion.ficha?.objetivo];
  for (const bloque of leccion.contentBlocks ?? []) {
    partes.push(bloque.title, bloque.body, bloque.prompt, bloque.question);
  }
  return normalizar(partes.filter((parte) => typeof parte === 'string').join(' '));
}

const minutosDe = (lecciones) => Math.round(lecciones.reduce((suma, l) => suma + (Number(l.durationSeconds) || 0), 0) / 60);

// [{id, software, curso, modulo, titulo, descripcion, disciplinas, lecciones, minutos, publicado, buscable}]
export function modulosDelCatalogo(cursos = []) {
  const entradas = [];
  for (const curso of cursos) {
    if (CURSOS_ARCHIVADOS.includes(curso.id)) continue;
    const software = softwareDeCurso(curso)?.id ?? curso.ruta ?? curso.id;
    for (const modulo of curso.modulos ?? []) {
      const lecciones = modulo.contenido?.lessons ?? [];
      const publicado = Boolean(modulo.contenido) && curso.estado !== 'bloqueado';
      const descripcion = modulo.contenido?.description ?? '';
      entradas.push({
        id: modulo.id,
        software,
        curso,
        modulo,
        titulo: modulo.titulo,
        descripcion,
        disciplinas: modulo.disciplinas ?? [],
        lecciones: lecciones.length,
        minutos: modulo.contenido?.estimatedTimeMinutes ?? minutosDe(lecciones),
        publicado,
        buscable: normalizar([modulo.titulo, descripcion, curso.titulo, curso.nivel, modulo.insignia].filter(Boolean).join(' ')),
      });
    }
  }
  return entradas;
}

// [{id, software, curso, modulo, leccion, indice, buscable}] de los módulos publicados.
export function leccionesDelCatalogo(modulos) {
  return modulos
    .filter((entrada) => entrada.publicado)
    .flatMap((entrada) =>
      entrada.modulo.contenido.lessons.map((leccion, indice) => ({
        id: `${entrada.curso.id}:${leccion.id}`,
        software: entrada.software,
        disciplinas: entrada.disciplinas,
        curso: entrada.curso,
        modulo: entrada.modulo,
        leccion,
        indice,
        buscable: textoDeLeccion(leccion),
      })),
    );
}

const pasaFiltros = (entrada, { software, disciplina }) =>
  (!software || entrada.software === software) && (!disciplina || entrada.disciplinas.includes(disciplina));

// Todas las palabras de la búsqueda deben aparecer (en cualquier orden).
export function coincide(buscable, texto) {
  const palabras = normalizar(texto).split(/\s+/).filter(Boolean);
  return palabras.every((palabra) => buscable.includes(palabra));
}

// Filtra el índice. Devuelve {modulos, lecciones}: con texto, las lecciones que lo
// contienen (en el título, el objetivo o la teoría) y los módulos que lo nombran o
// que tienen alguna de esas lecciones.
export function filtrarIndice(modulos, lecciones, filtros = {}) {
  const base = modulos.filter((entrada) => pasaFiltros(entrada, filtros));
  if (!normalizar(filtros.texto)) return { modulos: base, lecciones: [] };
  const encontradas = lecciones.filter((entrada) => pasaFiltros(entrada, filtros) && coincide(entrada.buscable, filtros.texto));
  const conLeccion = new Set(encontradas.map((entrada) => entrada.modulo.id));
  return {
    modulos: base.filter((entrada) => conLeccion.has(entrada.id) || coincide(entrada.buscable, filtros.texto)),
    lecciones: encontradas,
  };
}

// Cifras por programa para las tarjetas: {[softwareId]: {cursos, modulos, publicados, lecciones}}.
export function cifrasPorSoftware(modulos) {
  const cifras = Object.fromEntries(SOFTWARE.map((s) => [s.id, { cursos: 0, modulos: 0, publicados: 0, lecciones: 0 }]));
  const cursosVistos = new Set();
  for (const entrada of modulos) {
    const c = (cifras[entrada.software] ??= { cursos: 0, modulos: 0, publicados: 0, lecciones: 0 });
    if (!cursosVistos.has(entrada.curso.id)) {
      cursosVistos.add(entrada.curso.id);
      c.cursos += 1;
    }
    c.modulos += 1;
    if (entrada.publicado) {
      c.publicados += 1;
      c.lecciones += entrada.lecciones;
    }
  }
  return cifras;
}

// Filtros válidos que llegan en la consulta del enlace (#/explorar?software=…&disciplina=…&q=…).
export function filtrosDeConsulta(consulta = {}, softwareIds = SOFTWARE.map((s) => s.id), disciplinaIds = []) {
  return {
    software: softwareIds.includes(consulta.software) ? consulta.software : '',
    disciplina: disciplinaIds.includes(consulta.disciplina) ? consulta.disciplina : '',
    texto: typeof consulta.q === 'string' ? consulta.q.slice(0, 80) : '',
  };
}
