import Medidor from '../graficas/Medidor';
import { COLORES } from '../graficas/colores';
import { IconoDiana, IconoPalomita } from './IconosPanel';
import { calcularRetos } from './retos';
import Seccion from './Seccion';

function Reto({ reto }) {
  const { titulo, descripcion, actual, meta, completado, tipo, nivel, niveles } = reto;
  return (
    <li className="flex gap-3">
      <span
        className={`hexagono grid h-9 w-10 shrink-0 place-items-center ${completado ? 'bg-amatista text-white' : 'bg-white/5 text-white/45'}`}
        aria-hidden="true"
      >
        {completado ? <IconoPalomita className="h-4 w-4" /> : <IconoDiana className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className={`font-semibold leading-snug ${completado ? 'text-white' : 'text-white/85'}`}>
            {titulo}
            {completado && <span className="sr-only"> (cumplido)</span>}
          </p>
          <span className="shrink-0 font-mono text-xs tabular-nums text-white/60">
            {actual}/{meta}
          </span>
        </div>
        <Medidor
          className="mt-1.5"
          alto={6}
          valor={actual}
          maximo={meta}
          color={completado ? COLORES.amatistaClaro : COLORES.amatista}
          etiqueta={titulo}
          textoValor={`${actual} de ${meta}`}
        />
        <p className="mt-1.5 text-xs leading-snug text-white/45">
          {descripcion}
          {tipo === 'logro' && (
            <span className="ml-1 font-mono uppercase tracking-wider text-white/55">
              · Nivel {nivel} de {niveles}
            </span>
          )}
        </p>
      </div>
    </li>
  );
}

// Retos de la semana (se renuevan cada lunes) y logros acumulados por niveles,
// calculados del progreso real en retos.js.
function RetosPanel({ progreso, hoy, className = '' }) {
  const { semanales, logros, renuevaEn } = calcularRetos(progreso, hoy);
  const cumplidos = semanales.filter((reto) => reto.completado).length;

  return (
    <Seccion
      id="panel-retos"
      etiqueta="Retos"
      titulo="Retos de la semana"
      className={className}
      accion={
        <p className="font-mono text-xs uppercase tracking-widest text-white/55">
          <strong className="text-lg text-white">{cumplidos}</strong> de {semanales.length}
        </p>
      }
    >
      <p className="-mt-3 mb-4 font-mono text-[11px] uppercase tracking-wider text-white/45">
        Se renuevan el lunes · {renuevaEn === 1 ? 'queda 1 día' : `quedan ${renuevaEn} días`}
      </p>
      <ul className="grid gap-4">
        {semanales.map((reto) => (
          <Reto key={reto.id} reto={reto} />
        ))}
      </ul>

      <h3 className="mb-3 mt-7 border-t border-white/5 pt-5 font-mono text-xs uppercase tracking-[0.2em] text-white/55">Logros</h3>
      <ul className="grid gap-4">
        {logros.map((logro) => (
          <Reto key={logro.id} reto={logro} />
        ))}
      </ul>
    </Seccion>
  );
}

export default RetosPanel;
