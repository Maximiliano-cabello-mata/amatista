import { createElement } from 'react';
import { CristalLogo } from './Iconos';
import LogoCurso, { LOGOS } from './LogoCurso';

// Ícono de un curso: el logo de su ruta (los cuatro niveles de Blender llevan
// el de Blender). Un curso sin logo propio usa el cristal de Amatista.
const iconos = {};
export function iconoCurso(curso) {
  const logo = curso?.ruta || curso?.id;
  if (!LOGOS[logo]) return CristalLogo;
  iconos[logo] ??= function IconoLogo({ className = '' }) {
    return createElement(LogoCurso, { logo, className });
  };
  return iconos[logo];
}

// Tailwind necesita las clases completas escritas en el código.
export const ACENTOS = {
  blender: {
    borde: 'from-blender via-amatista to-amatista-oscuro',
    texto: 'text-blender',
    fondo: 'bg-blender',
    brillo: 'shadow-[0_0_40px_-8px_rgba(245,121,42,0.55)]',
  },
  neon: {
    borde: 'from-neon via-amatista to-amatista-oscuro',
    texto: 'text-neon',
    fondo: 'bg-neon',
    brillo: 'shadow-[0_0_40px_-8px_rgba(0,229,255,0.45)]',
  },
};
