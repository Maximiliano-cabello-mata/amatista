// Amatista es una plataforma educativa de creación 3D enfocada al 100 % en
// software libre y estándares abiertos que ya tenemos integrados: Blender (GPL)
// para modelado, materiales, render y animación en escritorio, y A-Frame (MIT)
// para escenas interactivas, WebGL y realidad virtual WebXR en el navegador.
//
// `ruta` es el campo `ruta` de los cursos (data/cursos.js, catalogo/agrupar.js):
// así se sabe qué cursos pertenecen a cada programa y cuál es su herramienta
// de práctica (Amatista Motor en Blender y el Estudio A-Frame en la web).
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
    descripcion: 'Construye mundos 3D libres con etiquetas HTML y publícalos con un enlace: se ven en el navegador, el móvil y los visores de VR.',
    disciplinas: ['modelado', 'diseno', 'animacion', 'interaccion', 'xr'],
    herramienta: { nombre: 'Estudio A-Frame', texto: 'Crea una escena ahora', href: rutas.estudio },
  },
];

export const softwarePorId = (id) => SOFTWARE.find((software) => software.id === id) ?? null;

// El programa de un curso o de una ruta (su campo `ruta`, o el id si no tiene).
export function softwareDeCurso(curso) {
  const ruta = curso?.ruta || curso?.id;
  return SOFTWARE.find((software) => software.ruta === ruta) ?? null;
}

export const disciplinaPorId = (id) => DISCIPLINAS.find((disciplina) => disciplina.id === id) ?? null;
