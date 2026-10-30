// Invitación al recorrido por la plataforma para quien aún no lo hace. Desaparece al hacerlo o al
// pulsar «Ahora no»; el recorrido sigue a mano en Ayuda (botón «?» de la barra).
import { useRecorrido } from '../recorrido/contexto';
import { TOTAL_RECORRIDO } from '../recorrido/pasos';
import { CristalLogo } from './Iconos';

function InvitacionRecorrido({ className = '' }) {
  const { visto, empezar, descartar } = useRecorrido();
  if (visto) return null;

  return (
    <aside
      className={`corte-poly-sm flex flex-col gap-4 border border-neon/30 bg-gradient-to-r from-neon/10 via-superficie/95 to-superficie/95 p-4 sm:flex-row sm:items-center ${className}`}
      aria-label="Recorrido por la plataforma"
    >
      <span className="hexagono grid h-12 w-14 shrink-0 place-items-center bg-base">
        <CristalLogo className="h-7 w-7" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon">¿Primera vez en Amatista?</p>
        <p className="font-bold text-white">Te muestro la plataforma en un minuto</p>
        <p className="mt-0.5 text-sm text-texto/70">
          {TOTAL_RECORRIDO} paradas por las páginas de verdad: dónde está todo el contenido, cómo se une cada programa con la plataforma y dónde ves tu
          avance. No es un curso ni cuenta para tu progreso.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => empezar(0)}
          className="corte-poly-sm destello bg-neon px-4 py-2.5 text-center font-mono text-xs font-bold uppercase tracking-widest text-base hover:brightness-110"
        >
          ▶ Empezar el recorrido
        </button>
        <button
          type="button"
          onClick={descartar}
          className="corte-poly-sm px-3 py-2.5 font-mono text-xs uppercase tracking-widest text-white/55 hover:text-white"
        >
          Ahora no
        </button>
      </div>
    </aside>
  );
}

export default InvitacionRecorrido;
