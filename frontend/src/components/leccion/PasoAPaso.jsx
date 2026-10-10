import ImagenLigera from '../ImagenLigera';
import { useState } from 'react';
import { Teclas } from './Tecla';

// Herramienta «Paso a paso» (step_by_step, v3.1): un procedimiento de Blender
// contado de a un paso, con las teclas exactas y una imagen opcional. El
// alumno avanza a su ritmo; es la misma idea que la guía del add-on.
function PasoAPaso({ title, steps = [] }) {
  const [actual, setActual] = useState(0);
  const paso = steps[actual];
  if (!paso) return null;
  const ultimo = actual === steps.length - 1;
  return (
    <section className="corte-poly border border-white/10 bg-superficie/90 p-5 sm:p-7" aria-roledescription="paso a paso">
      {title && <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-neon">{title}</h3>}
      <ol className="mt-4 flex gap-1.5" aria-label="Pasos">
        {steps.map((p, i) => (
          <li key={`${p.title}-${i}`} className="flex-1">
            <button
              type="button"
              onClick={() => setActual(i)}
              aria-current={i === actual ? 'step' : undefined}
              aria-label={`Paso ${i + 1}: ${p.title}`}
              className={`block h-1.5 w-full transition-colors ${i < actual ? 'bg-emerald-400' : i === actual ? 'bg-neon' : 'bg-white/10'}`}
            />
          </li>
        ))}
      </ol>
      <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" aria-live="polite">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">
            Paso {actual + 1} de {steps.length}
          </p>
          <p className="mt-1 text-xl font-extrabold text-white">{paso.title}</p>
          {paso.keys?.length > 0 && <Teclas lista={paso.keys} luego={paso.then} className="mt-3" />}
          {paso.text && <p className="mt-3 leading-relaxed text-texto/80">{paso.text}</p>}
        </div>
        {paso.image && <ImagenLigera src={paso.image} alt={paso.alt} className="corte-poly-sm block w-full bg-black/30" imgClassName="block w-full object-contain" />}
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => setActual((i) => Math.max(0, i - 1))}
          disabled={actual === 0}
          className="corte-poly-sm bg-white/5 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-white/70 hover:bg-white/10 disabled:opacity-40"
        >
          ◂ Anterior
        </button>
        <button
          type="button"
          onClick={() => setActual((i) => Math.min(steps.length - 1, i + 1))}
          disabled={ultimo}
          className="corte-poly-sm destello bg-amatista px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-white hover:brightness-110 disabled:opacity-40"
        >
          {ultimo ? '¡Listo!' : 'Siguiente ▸'}
        </button>
      </div>
    </section>
  );
}

export default PasoAPaso;
