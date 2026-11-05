// Catálogo inicial ligero para el primer pintado (FCP / LCP · T-080).
// Utiliza indice-modulos.json (≤ 32 KB raw, ≤ 7 KB gzip) en lugar de los 15 JSONs pesados.
import indiceModulos from './indice-modulos.json';
import { armarCatalogo, CURSOS_BASE, buscarCurso as buscarCursoBase } from './catalogoBase';

export const cursosIniciales = armarCatalogo(CURSOS_BASE, indiceModulos);
export const buscarCurso = (id, lista = cursosIniciales) => buscarCursoBase(id, lista);
export default cursosIniciales;
