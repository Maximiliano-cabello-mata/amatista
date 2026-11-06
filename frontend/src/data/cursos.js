// Catálogo completo de cursos (con teoría, código y exámenes).
// Para el arranque inicial ligero de la aplicación, véase catalogoInicial.js.
export * from './catalogoBase';
import { armarCatalogo, CURSOS_BASE, buscarCurso as buscarCursoBase, buscarLeccion as buscarLeccionBase } from './catalogoBase';

const archivos = import.meta.glob('./modulos/*.json', { eager: true });
export const cursos = armarCatalogo(CURSOS_BASE, archivos);
export function buscarCurso(id, lista = cursos) {
  return buscarCursoBase(id, lista);
}
export default cursos;

// El catálogo inicial (catalogoInicial.js) trae las lecciones sin sus bloques para pintar rápido.
// Si el servidor no respondió todavía (o nunca: sin conexión, app de escritorio), la lección se
// completa con el contenido empaquetado en la app. Sin esto, la lección se abría vacía.
export function conContenido(ubicacion, cursoId) {
  if (!ubicacion || !ubicacion.leccion?._ligera) return ubicacion;
  const completo = buscarCurso(cursoId);
  const local = completo && buscarLeccionBase(completo, ubicacion.leccion.id);
  return local ? { ...ubicacion, leccion: local.leccion } : ubicacion;
}
