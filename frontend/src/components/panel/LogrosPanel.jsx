// Insignias complementarias progresivas (progreso/logros.js): pocas, con
// grados bronce, plata y oro, y que se revelan conforme avanza el curso.
import { logrosDelAlumno, TOTAL_LOGROS } from '../../progreso/logros';
import Seccion from './Seccion';

// Símbolo de cada logro, en blanco sobre la medalla.
function Simbolo({ id }) {
  switch (id) {
    case 'racha':
      return <path d="M32 14c4 8 12 11 12 22a12 12 0 0 1-24 0c0-6 3-9 5-12 1 4 3 6 5 6-2-6 0-12 2-16z" fill="#fff" />;
    case 'blender':
      return (
        <g fill="#fff">
          <circle cx="36" cy="34" r="10" />
          <rect x="16" y="22" width="18" height="5" rx="2.5" />
          <rect x="21" y="31" width="10" height="4" rx="2" />
          <circle cx="37" cy="33.5" r="4.5" fill="#265787" />
        </g>
      );
    case 'jefes':
      return <polygon points="20,42 22,22 28,30 32,18 36,30 42,22 44,42" fill="#fff" />;
    case 'precision':
      return (
        <g fill="none" stroke="#fff" strokeWidth="3">
          <circle cx="32" cy="32" r="11" />
          <circle cx="32" cy="32" r="4" fill="#fff" />
        </g>
      );
    case 'niveles':
    default:
      return <polygon points="18,44 18,38 26,38 26,31 34,31 34,24 42,24 42,18 46,18 46,44" fill="#fff" />;
  }
}

// Medalla hexagonal facetada; sin ganar es una silueta.
export function Medalla({ id, grado, ganado, visible, className = '' }) {
  if (!visible) {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <polygon points="32,3 57,17.5 57,46.5 32,61 7,46.5 7,17.5" fill="#2a2a2e" stroke="#ffffff22" strokeDasharray="3 3" />
        <text x="32" y="40" textAnchor="middle" fontSize="20" fontWeight="800" fill="#ffffff40">?</text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className={`${className} ${ganado ? '' : 'opacity-45 grayscale'}`} aria-hidden="true">
      <polygon points="32,3 57,17.5 32,32" fill={grado.claro} />
      <polygon points="57,17.5 57,46.5 32,32" fill={grado.color} />
      <polygon points="57,46.5 32,61 32,32" fill={grado.color} opacity="0.8" />
      <polygon points="32,61 7,46.5 32,32" fill={grado.color} opacity="0.65" />
      <polygon points="7,46.5 7,17.5 32,32" fill={grado.color} opacity="0.85" />
      <polygon points="7,17.5 32,3 32,32" fill={grado.claro} opacity="0.9" />
      <circle cx="32" cy="32" r="17" fill="#121212" opacity="0.55" />
      <Simbolo id={id} />
    </svg>
  );
}

function Logro({ logro, indice }) {
  const { siguiente } = logro;
  return (
    <li
      className="corte-poly-sm animar-entrar flex flex-col gap-3 border border-white/10 bg-base/60 p-4"
      style={{ animationDelay: `${indice * 90}ms` }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-bold text-white">{logro.nombre}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">{logro.ganados} / 3</p>
      </div>
      <ul className="flex items-center gap-2">
        {logro.grados.map((g) => (
          <li key={g.id} title={g.visible ? `${g.nombre}: ${g.texto}` : 'Se revela al acercarte'}>
            <Medalla
              id={logro.id}
              grado={g}
              ganado={g.ganado}
              visible={g.visible}
              className={`h-12 w-12 ${g.ganado ? 'animar-aparecer drop-shadow-[0_0_10px_rgba(244,208,63,0.35)]' : ''}`}
            />
            <span className="sr-only">
              {g.visible ? `${g.nombre}: ${g.texto}${g.ganado ? ' (ganado)' : ''}` : 'Grado oculto'}
            </span>
          </li>
        ))}
      </ul>
      {siguiente ? (
        <div>
          <p className="text-xs text-texto/70">
            Siguiente: <strong className="text-white">{siguiente.nombre}</strong> · {siguiente.texto}
          </p>
          <div className="barra mt-1.5 h-1.5" aria-hidden="true">
            <div className="relleno" style={{ width: `${Math.round(logro.avance * 100)}%`, background: siguiente.color }} />
          </div>
          <p className="mt-1 font-mono text-[10px] text-white/45">
            {logro.valor} de {siguiente.meta} {logro.unidad}
          </p>
        </div>
      ) : (
        <p className="text-xs font-bold text-amber-200">¡Oro conseguido! Logro completo.</p>
      )}
    </li>
  );
}

function LogrosPanel({ progreso, cursos, hoy, className = '' }) {
  const logros = logrosDelAlumno(progreso, cursos, hoy);
  const ganados = logros.reduce((suma, l) => suma + l.ganados, 0);
  const ocultos = 5 - logros.length;
  return (
    <Seccion
      id="panel-logros"
      etiqueta="Logros progresivos"
      titulo="Medallas"
      className={className}
      accion={
        <p className="font-mono text-xs uppercase tracking-widest text-white/55">
          <strong className="text-lg text-white">{ganados}</strong> de {TOTAL_LOGROS}
        </p>
      }
    >
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {logros.map((logro, i) => (
          <Logro key={logro.id} logro={logro} indice={i} />
        ))}
      </ul>
      {ocultos > 0 && (
        <p className="mt-4 text-sm text-white/55">
          {ocultos === 1 ? 'Queda 1 logro secreto' : `Quedan ${ocultos} logros secretos`}: aparecen conforme avanzas en el curso.
        </p>
      )}
    </Seccion>
  );
}

export default LogrosPanel;
