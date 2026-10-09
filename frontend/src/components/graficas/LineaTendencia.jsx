import { useId, useMemo } from 'react';
import { COLORES } from './colores';

const MARGEN = { izquierda: 4, derecha: 4, arriba: 8, abajo: 8 };

function lineaSuavizada(puntos) {
  if (puntos.length < 2) return '';
  let d = `M ${puntos[0].x} ${puntos[0].y}`;
  for (let i = 1; i < puntos.length; i += 1) {
    const previo = puntos[i - 1];
    const actual = puntos[i];
    const cx = (previo.x + actual.x) / 2;
    d += ` C ${cx} ${previo.y}, ${cx} ${actual.y}, ${actual.x} ${actual.y}`;
  }
  return d;
}

// Línea compacta para mostrar tendencia (sube, baja o se mantiene).
function LineaTendencia({ datos = [], titulo, altura = 72, color = COLORES.neon, className = '' }) {
  const id = useId();
  const ancho = 320;

  const { puntos, ultimo, variacion, minimo, maximo } = useMemo(() => {
    const lista = datos.map((n) => Number(n) || 0);
    const min = Math.min(...lista, 0);
    const max = Math.max(...lista, 1);
    const rango = Math.max(1, max - min);
    const areaX = ancho - MARGEN.izquierda - MARGEN.derecha;
    const areaY = altura - MARGEN.arriba - MARGEN.abajo;
    const puntosCalculados = lista.map((valor, i) => ({
      x: MARGEN.izquierda + (i / Math.max(1, lista.length - 1)) * areaX,
      y: MARGEN.arriba + areaY - ((valor - min) / rango) * areaY,
      valor,
    }));
    const fin = lista.at(-1) ?? 0;
    const inicio = lista[0] ?? 0;
    return {
      puntos: puntosCalculados,
      ultimo: fin,
      variacion: fin - inicio,
      minimo: min,
      maximo: max,
    };
  }, [datos, altura]);

  if (datos.length < 2) return null;

  const ruta = lineaSuavizada(puntos);
  const tendencia = variacion > 0 ? 'Sube' : variacion < 0 ? 'Baja' : 'Se mantiene';

  return (
    <figure className={`m-0 ${className}`}>
      <figcaption id={id} className="mb-2 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/55">{titulo}</span>
        <span className="text-xs text-white/60">
          {tendencia} · {ultimo}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${ancho} ${altura}`} width="100%" height={altura} role="img" aria-labelledby={id}>
        <path d={ruta} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {puntos.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === puntos.length - 1 ? '3.2' : '2.2'} fill={i === puntos.length - 1 ? color : '#FFFFFF90'} />
        ))}
      </svg>
      <p className="sr-only">
        {titulo}: mínimo {minimo}, máximo {maximo}, último valor {ultimo}, tendencia {tendencia.toLowerCase()}.
      </p>
    </figure>
  );
}

export default LineaTendencia;
