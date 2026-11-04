// El avatar de una cuenta dentro de su hexágono: el busto low poly del
// personaje elegido o, si todavía no eligió, la inicial de su nombre.
import { ANIMALES } from './animales';
import { AVATAR_CREADOR, datosAvatar } from './catalogo';
import PavoReal from './PavoReal';

export function BustoAvatar({ id, className = '' }) {
  if (id === AVATAR_CREADOR.id) return <PavoReal encuadre="busto" gesto="abierto" className={className} />;
  const caras = ANIMALES[id];
  if (!caras) return null;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {caras.map(([color, puntos], i) => (
        <polygon key={i} points={puntos} fill={color} />
      ))}
    </svg>
  );
}

function Avatar({ id, inicial = '?', className = 'h-7 w-8', titulo }) {
  const datos = datosAvatar(id);
  return (
    <span
      className={`avatar hexagono grid shrink-0 place-items-center overflow-hidden font-bold ${datos ? '' : 'bg-amatista'} ${className}`}
      style={datos ? { background: `radial-gradient(circle at 70% 25%, rgb(255 255 255 / 0.14), ${datos.fondo} 70%)` } : undefined}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : 'true'}
    >
      {datos ? <BustoAvatar id={id} className="h-[88%] w-[88%]" /> : inicial}
    </span>
  );
}

export default Avatar;
