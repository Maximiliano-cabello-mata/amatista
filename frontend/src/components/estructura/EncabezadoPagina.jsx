// Encabezado de página (v4.0 · Facetas): borde de gema, facetas low poly con la luz arriba a la
// derecha y un brillo que cruza una vez. Ícono en hexágono, antetítulo, título, descripción,
// `children` (chips de estado, una barra de avance…) y `acciones` (botones a la derecha).
import { facetasEncabezado } from './facetas';

const TONOS = {
  amatista: { ante: 'text-neon', hexagono: 'bg-amatista-oscuro' },
  neon: { ante: 'text-neon', hexagono: 'bg-[#0b2a33]' },
  blender: { ante: 'text-blender', hexagono: 'bg-[#3a1d0c]' },
};
const FACETAS = Object.fromEntries(Object.keys(TONOS).map((tono) => [tono, facetasEncabezado({ tono })]));

function EncabezadoPagina({ antetitulo, titulo, descripcion, icono, acciones, children, tono = 'amatista', idTitulo, className = '' }) {
  const estilo = TONOS[tono] ?? TONOS.amatista;
  return (
    <header className={`encabezado-faceta encabezado-faceta--${tono} corte-poly animar-entrar ${className}`}>
      <div className="encabezado-faceta__interior corte-poly">
        <svg className="encabezado-faceta__facetas" viewBox="0 0 1000 260" preserveAspectRatio="none" aria-hidden="true">
          {FACETAS[tono in FACETAS ? tono : 'amatista'].map((f, i) => (
            <polygon key={i} points={f.puntos} fill={f.color} fillOpacity={f.opacidad} stroke={f.color} strokeOpacity={f.opacidad * 0.6} strokeWidth="0.6" />
          ))}
        </svg>
        <span className="encabezado-faceta__brillo" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
          {icono && (
            <span className={`hexagono grid h-20 w-24 shrink-0 place-items-center ${estilo.hexagono}`} aria-hidden="true">
              {icono}
            </span>
          )}
          <div className="min-w-0 flex-1">
            {antetitulo && <p className={`font-mono text-xs uppercase tracking-[0.3em] ${estilo.ante}`}>{antetitulo}</p>}
            <h1 id={idTitulo} className="mt-1 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              {titulo}
            </h1>
            {descripcion && <div className="mt-2 max-w-2xl leading-relaxed text-texto/80">{descripcion}</div>}
            {children}
          </div>
          {acciones && <div className="flex shrink-0 flex-col gap-2 sm:items-end">{acciones}</div>}
        </div>
      </div>
    </header>
  );
}

export default EncabezadoPagina;
