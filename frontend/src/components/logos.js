// Logotipos de los cursos (assets/logos/*.svg). Vite los incrusta en el
// paquete (menos de 1 KB cada uno): no hacen peticiones y funcionan sin conexión.
import logoAFrame from '../assets/logos/aframe.svg';
import logoBlender from '../assets/logos/blender.svg';

export const LOGOS = {
  blender: { src: logoBlender, nombre: 'Blender' },
  aframe: { src: logoAFrame, nombre: 'A-Frame' },
};
