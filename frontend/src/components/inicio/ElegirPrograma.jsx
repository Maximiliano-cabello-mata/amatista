import LogoSoftware from '../LogoSoftware';
import { QUE_CREAS, plural } from './constantes';

export default function ElegirPrograma({ lista, elegido, elegir }) {
  return (
    <div role="tablist" aria-label="¿Qué quieres crear?" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" data-recorrido="programas">
      {lista.map((camino) => {
        const { software } = camino;
        const activo = software.id === elegido;
        return (
          <button
            key={software.id}
            type="button"
            role="tab"
            id={`tab-${software.id}`}
            aria-selected={activo}
            aria-controls="camino-programa"
            onClick={() => elegir(software.id)}
            className={`corte-poly-sm flex items-center gap-3 border p-3 text-left transition-colors ${
              activo
                ? 'border-neon bg-neon/10'
                : camino.disponible
                  ? 'border-white/10 bg-superficie/90 hover:border-white/30'
                  : 'border-dashed border-white/10 bg-superficie/50 hover:border-white/25'
            }`}
          >
            <span className="hexagono grid h-11 w-12 shrink-0 place-items-center bg-black/40">
              <LogoSoftware software={software} className="h-6 w-7 text-[11px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold leading-snug text-white">{QUE_CREAS[software.id] ?? software.lema}</span>
              <span className={`block font-mono text-[11px] uppercase tracking-widest ${activo ? 'text-neon' : 'text-white/45'}`}>
                {software.nombre}
                {camino.disponible ? ` · ${plural(camino.total, 'paso', 'pasos')}` : ' · pronto'}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
