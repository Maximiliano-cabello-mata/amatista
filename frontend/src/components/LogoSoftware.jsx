import LogoCurso from './LogoCurso';
import { LOGOS } from './logos';

// Logo de un programa del catálogo (data/software.js). Los que ya tienen curso
// usan su logotipo; los que vienen después (Maya, 3ds Max) muestran un
// monograma propio dentro de un hexágono, sin usar marcas ajenas.
function LogoSoftware({ software, className = 'h-8 w-9', decorativo = true }) {
  if (software?.logo && LOGOS[software.logo]) return <LogoCurso logo={software.logo} className={className} decorativo={decorativo} />;
  return (
    <span
      className={`hexagono grid place-items-center bg-white/10 font-mono text-[0.7em] font-extrabold uppercase tracking-tight text-white/80 ${className}`}
      role={decorativo ? undefined : 'img'}
      aria-hidden={decorativo || undefined}
      aria-label={decorativo ? undefined : software?.nombre}
    >
      {software?.monograma ?? software?.nombre?.slice(0, 2) ?? '?'}
    </span>
  );
}

export default LogoSoftware;
