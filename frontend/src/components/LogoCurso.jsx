// Logotipos de los cursos (assets/logos/*.svg). Vite los incrusta en el
// paquete (son de menos de 1 KB): no hacen peticiones y funcionan sin conexión.
import logoAFrame from '../assets/logos/aframe.svg';
import logoBlender from '../assets/logos/blender.svg';
import { CristalLogo } from './Iconos';

export const LOGOS = {
  blender: { src: logoBlender, nombre: 'Blender', proporcion: 128 / 104 },
  aframe: { src: logoAFrame, nombre: 'A-Frame', proporcion: 1 },
};

// Un curso del servidor sin logo propio usa el cristal de Amatista.
function LogoCurso({ logo, className = '', decorativo = true }) {
  const datos = LOGOS[logo];
  if (!datos) return <CristalLogo className={className} />;
  return (
    <img
      src={datos.src}
      alt={decorativo ? '' : `Logo de ${datos.nombre}`}
      aria-hidden={decorativo || undefined}
      className={`object-contain ${className}`}
      draggable="false"
      decoding="async"
    />
  );
}

export default LogoCurso;
