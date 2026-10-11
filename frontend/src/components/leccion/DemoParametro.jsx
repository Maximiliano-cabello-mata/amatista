// Un control que cambia una figura (bloque «param_demo»): mueves el valor como en el panel de un
// modificador de Blender y la figura responde al instante. Demos: array, bevel, subdivision,
// mirror, light y resolution (recursos.js › DEMOS).
// Bloque: {"type": "param_demo", "demo", "title"?, "caption"?, "value"?}.
import { useId, useState } from 'react';
import { TextoEnLinea } from './Markdown';
import { DEMOS, limitarValor } from './recursos';

function Figura({ f }) {
  const clase = `demo__${f.rol}`;
  switch (f.tipo) {
    case 'rect':
      return <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="2" className={clase} />;
    case 'poligono':
      return <polygon points={f.puntos} className={clase} />;
    case 'linea':
      return <line x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} className={clase} />;
    case 'punto':
      return <circle cx={f.x} cy={f.y} r="4.5" className={clase} />;
    case 'sol':
      return (
        <g className={clase}>
          <circle cx={f.x} cy={f.y} r="13" className="demo__halo" />
          <circle cx={f.x} cy={f.y} r="8" />
        </g>
      );
    default:
      return null;
  }
}

function DemoParametro({ bloque }) {
  const idTitulo = useId();
  const idControl = useId();
  const demo = DEMOS[bloque.demo];
  const [valor, setValor] = useState(() => (demo ? limitarValor(demo.control, bloque.value ?? demo.control.inicial) : 0));
  if (!demo) return null;
  const { control } = demo;
  const figuras = demo.figuras(valor);
  const relleno = ((valor - control.min) / (control.max - control.min)) * 100;

  return (
    <section aria-labelledby={idTitulo} className="demo corte-poly border border-white/10 bg-superficie/90 p-5 sm:p-7">
      <h3 id={idTitulo} className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-neon">
        {bloque.title ?? demo.titulo}
      </h3>
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] sm:items-center">
        <svg viewBox="0 0 240 160" className="demo__lienzo corte-poly-sm w-full" role="img" aria-label={`${demo.titulo}: ${control.nombre} = ${valor}`}>
          <defs>
            <pattern id={`${idTitulo}-rejilla`} width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M16,0 H0 V16" className="demo__rejilla" />
            </pattern>
          </defs>
          <rect width="240" height="160" fill={`url(#${idTitulo}-rejilla)`} />
          {figuras.map((f, i) => (
            <Figura key={`${f.tipo}-${i}`} f={f} />
          ))}
        </svg>
        <div>
          <label htmlFor={idControl} className="flex items-baseline justify-between gap-3 font-mono text-[11px] uppercase tracking-widest text-white/60">
            {control.nombre}
            <output htmlFor={idControl} className="demo__valor text-2xl font-extrabold text-white">
              {valor}
            </output>
          </label>
          <input
            id={idControl}
            type="range"
            min={control.min}
            max={control.max}
            step={control.paso}
            value={valor}
            onChange={(e) => setValor(limitarValor(control, e.target.value))}
            className="demo__control mt-2 w-full"
            style={{ '--relleno': `${relleno}%` }}
          />
          <p key={valor} className="mt-3 leading-relaxed text-texto/85" aria-live="polite">
            <TextoEnLinea texto={demo.texto(valor)} />
          </p>
          {bloque.caption && (
            <p className="mt-3 text-sm text-texto/60">
              <TextoEnLinea texto={bloque.caption} />
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default DemoParametro;
