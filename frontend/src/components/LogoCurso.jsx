import { CristalLogo } from './Iconos';
import { LOGOS } from './logos';

// Logo de un curso (components/logos.js).
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
