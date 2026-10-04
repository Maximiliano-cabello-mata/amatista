import { useState } from 'react';

// Herramienta «Comparar» (compare, v3.1): antes y después lado a lado o, con
// mode: "slider" y dos imágenes, una cortina que se arrastra.
function Lado({ lado, tono }) {
  return (
    <figure className={`corte-poly-sm border bg-base/70 p-4 ${tono}`}>
      <figcaption className="font-mono text-[11px] font-bold uppercase tracking-widest">{lado.label}</figcaption>
      {lado.image && <img src={lado.image} alt={lado.alt} className="mt-3 w-full object-contain" />}
      {lado.text && <p className="mt-2 leading-relaxed text-texto/85">{lado.text}</p>}
    </figure>
  );
}

function Cortina({ before, after }) {
  const [corte, setCorte] = useState(50);
  return (
    <div className="corte-poly-sm relative mt-4 select-none overflow-hidden bg-black/40">
      <img src={after.image} alt={after.alt} className="block w-full" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${corte}%` }}>
        <img src={before.image} alt={before.alt} className="block h-full max-w-none object-cover object-left" style={{ width: `${10000 / Math.max(corte, 1)}%` }} />
      </div>
      <span className="pointer-events-none absolute inset-y-0 w-0.5 bg-neon" style={{ left: `${corte}%` }} aria-hidden="true" />
      <span className="absolute left-2 top-2 bg-black/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white">{before.label}</span>
      <span className="absolute right-2 top-2 bg-black/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white">{after.label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={corte}
        onChange={(e) => setCorte(Number(e.target.value))}
        aria-label={`Deslizar entre ${before.label} y ${after.label}`}
        className="absolute inset-x-0 bottom-2 mx-auto w-2/3 accent-[#00E5FF]"
      />
    </div>
  );
}

function Comparar({ title, before, after, mode = 'columns', caption }) {
  if (!before || !after) return null;
  const cortina = mode === 'slider' && before.image && after.image;
  return (
    <section className="corte-poly border border-white/10 bg-superficie/90 p-5 sm:p-7">
      {title && <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-neon">{title}</h3>}
      {cortina ? (
        <Cortina before={before} after={after} />
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <Lado lado={before} tono="border-white/10 text-white/60" />
          <span className="text-center text-2xl text-neon" aria-hidden="true">
            ▸
          </span>
          <Lado lado={after} tono="border-neon/30 text-neon" />
        </div>
      )}
      {caption && <p className="mt-3 text-sm text-white/55">{caption}</p>}
    </section>
  );
}

export default Comparar;
