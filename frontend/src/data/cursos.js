// Catálogo completo de cursos (con teoría, código y exámenes).
// Para el arranque inicial ligero de la aplicación, véase catalogoInicial.js.
export * from './catalogoBase';
import { armarCatalogo, CURSOS_BASE, buscarCurso as buscarCursoBase } from './catalogoBase';

const archivos = import.meta.glob('./modulos/*.json', { eager: true });
export const cursos = armarCatalogo(CURSOS_BASE, archivos);
export function buscarCurso(id, lista = cursos) {
  return buscarCursoBase(id, lista);
}
export default cursos;
