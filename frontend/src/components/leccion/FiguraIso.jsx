// Una figura 3D low poly dibujada en SVG (sin WebGL), para «Elige la figura» y otros recursos.
// Caras con la luz de malla.js en tonos de amatista; aristas en neón. Con `alambre`, solo aristas.
import { useMemo } from 'react';
import { aristasVisibles, proyectar } from '../graficas/malla';
import { figuraMalla } from './graficos';

const OSCURO = [43, 22, 61];
const CLARO = [205, 160, 236];
const tono = (luz) => `rgb(${OSCURO.map((o, i) => Math.round(o + (CLARO[i] - o) * (0.25 + luz * 0.75))).join(',')})`;

function FiguraIso({ figura, giro = -0.65, inclinacion = 0.5, ancho = 160, alto = 130, className = '' }) {
  const malla = useMemo(() => figuraMalla(figura), [figura]);
  const vista = useMemo(() => proyectar(malla, { giro, inclinacion, ancho, alto }), [malla, giro, inclinacion, ancho, alto]);
  const visibles = useMemo(() => aristasVisibles(malla, vista), [malla, vista]);
  const espejo = malla.espejo ? [vista.aPantalla([0, -1.2, -1.3], { centrado: false }), vista.aPantalla([0, -1.2, 1.4], { centrado: false })] : null;
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className={className} aria-hidden="true">
      <ellipse cx={ancho / 2} cy={alto * 0.86} rx={ancho * 0.32} ry={alto * 0.06} fill="#000" opacity="0.35" />
      {!malla.alambre &&
        vista.caras
          .filter((c) => c.frente)
          .map((c) => <polygon key={c.i} points={c.puntos} fill={tono(c.luz)} stroke="#120a1a" strokeWidth="0.6" strokeLinejoin="round" />)}
      {malla.aristas.map(([a, b], i) =>
        malla.alambre || visibles[i] ? (
          <line
            key={i}
            x1={vista.puntos[a].x}
            y1={vista.puntos[a].y}
            x2={vista.puntos[b].x}
            y2={vista.puntos[b].y}
            stroke="#00E5FF"
            strokeOpacity={malla.alambre ? (visibles[i] ? 0.95 : 0.35) : 0.35}
            strokeWidth={malla.alambre ? 1.4 : 0.8}
          />
        ) : null,
      )}
      {malla.alambre && vista.puntos.map((p, i) => <rect key={i} x={p.x - 1.6} y={p.y - 1.6} width="3.2" height="3.2" fill="#E0E0E0" />)}
      {espejo && <line x1={espejo[0].x} y1={espejo[0].y} x2={espejo[1].x} y2={espejo[1].y} stroke="#8BDC00" strokeWidth="1.4" strokeDasharray="4 3" />}
    </svg>
  );
}

export default FiguraIso;
