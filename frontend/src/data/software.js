// Amatista es una plataforma de 3D multiplataforma: enseña modelado, diseño,
// animación y 3D para la web en varios programas. Blender fue el primero y
// A-Frame el segundo; Maya y 3ds Max vienen después. Ningún programa es el
// centro: cada uno es una entrada más del catálogo (#/explorar) con sus
// cursos y, si la tiene, su herramienta propia (el add-on de Blender, el
// Estudio A-Frame).
//
// `ruta` es el campo `ruta` de los cursos (data/cursos.js, catalogo/agrupar.js):
// así se sabe qué cursos son de cada programa. Un programa «proximamente»
// todavía no tiene cursos y solo anuncia lo que enseñará.
import { rutas } from '../rutas';

export const DISCIPLINAS = [
  { id: 'modelado', nombre: 'Modelado', texto: 'Formas, mallas y precisión' },
  { id: 'diseno', nombre: 'Materiales y diseño', texto: 'Color, superficies y composición' },
  { id: 'render', nombre: 'Luz y render', texto: 'Iluminar, encuadrar y presentar' },
  { id: 'animacion', nombre: 'Animación', texto: 'Movimiento, tiempo y vida' },
  { id: 'interaccion', nombre: 'Interacción', texto: 'Escenas que responden al usuario' },
  { id: 'xr', nombre: 'Web y realidad virtual', texto: 'Publicar en el navegador, VR y AR' },
];

export const SOFTWARE = [
  {
    id: 'blender',
    nombre: 'Blender',
    estado: 'disponible',
    ruta: 'blender',
    logo: 'blender',
    acento: 'blender',
    lema: 'Modelado, materiales, render y animación',
    descripcion: 'El programa libre y gratuito para crear en 3D. Practicas dentro de Blender con Amatista Motor a tu lado.',
    disciplinas: ['modelado', 'diseno', 'render', 'animacion'],
    herramienta: { nombre: 'Amatista Motor', texto: 'Conecta tu Blender', href: rutas.blender },
  },
  {
    id: 'aframe',
    nombre: 'A-Frame',
    estado: 'disponible',
    ruta: 'aframe',
    logo: 'aframe',
    acento: 'neon',
    lema: 'Escenas 3D, interacción y realidad virtual en la web',
    descripcion: 'Construye mundos 3D con etiquetas HTML y publícalos con un enlace: se ven en el navegador, el celular y los visores de VR.',
    disciplinas: ['modelado', 'diseno', 'animacion', 'interaccion', 'xr'],
    herramienta: { nombre: 'Estudio A-Frame', texto: 'Crea una escena ahora', href: rutas.estudio },
  },
  {
    id: 'maya',
    nombre: 'Maya',
    estado: 'proximamente',
    monograma: 'Ma',
    acento: 'neon',
    lema: 'Animación de personajes y rigging',
    descripcion: 'El estándar de la animación en cine y videojuegos: rigging, animación de personajes y flujos de estudio.',
    disciplinas: ['animacion', 'modelado'],
  },
  {
    id: '3dsmax',
    nombre: '3ds Max',
    estado: 'proximamente',
    monograma: '3ds',
    acento: 'blender',
    lema: 'Visualización arquitectónica y modelado técnico',
    descripcion: 'Muy usado en arquitectura, interiores y diseño de producto: modelado preciso, materiales y render fotorrealista.',
    disciplinas: ['modelado', 'render'],
  },
];

export const softwarePorId = (id) => SOFTWARE.find((software) => software.id === id) ?? null;

// El programa de un curso o de una ruta (su campo `ruta`, o el id si no tiene).
export function softwareDeCurso(curso) {
  const ruta = curso?.ruta || curso?.id;
  return SOFTWARE.find((software) => software.ruta === ruta) ?? null;
}

export const disciplinaPorId = (id) => DISCIPLINAS.find((disciplina) => disciplina.id === id) ?? null;
