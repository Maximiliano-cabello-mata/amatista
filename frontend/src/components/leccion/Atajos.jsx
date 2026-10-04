import { useEffect, useMemo, useState } from 'react';
import { claveAtajo, claveDeEvento, practicables } from './atajos';
import { Teclas } from './Tecla';

// Herramienta «Atajos de teclado» (shortcuts, v3.1): tarjetas con las teclas
// y lo que hacen. Con practice: true agrega «Pruébate»: Amatista muestra una
// acción y el alumno pulsa el atajo en su teclado.
function Pruebate({ items, alSalir }) {
  const lista = useMemo(() => practicables(items), [items]);
  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState({ aciertos: 0, ultimo: null });
  const actual = lista[indice % Math.max(1, lista.length)];

  useEffect(() => {
    if (!actual) return undefined;
    const alTeclear = (evento) => {
      const clave = claveDeEvento(evento);
      if (!clave) return;
      evento.preventDefault();
      if (clave === claveAtajo(actual.keys)) {
        setEstado((e) => ({ aciertos: e.aciertos + 1, ultimo: 'bien' }));
        setIndice((i) => i + 1);
      } else {
        setEstado((e) => ({ ...e, ultimo: 'mal' }));
      }
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [actual]);

  if (!actual) return null;
  return (
    <div className="corte-poly-sm mt-4 border border-neon/30 bg-neon/5 p-5 text-center" aria-live="polite">
      <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">Pulsa el atajo para…</p>
      <p className="mt-2 text-2xl font-extrabold text-white">{actual.action}</p>
      <p className={`mt-3 text-sm ${estado.ultimo === 'mal' ? 'text-amber-200' : 'text-emerald-300'}`}>
        {estado.ultimo === 'mal'
          ? 'Casi: prueba otra vez.'
          : estado.ultimo === 'bien'
            ? `¡Bien! ${estado.aciertos} seguidos.`
            : 'Usa tu teclado.'}
      </p>
      <button type="button" onClick={alSalir} className="mt-4 font-mono text-xs uppercase tracking-widest text-white/50 hover:text-neon">
        Volver a la lista
      </button>
    </div>
  );
}

function Atajos({ title, items = [], practice = false }) {
  const [probando, setProbando] = useState(false);
  return (
    <section className="corte-poly border border-white/10 bg-superficie/90 p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-neon">{title ?? 'Atajos de teclado'}</h3>
        {practice && practicables(items).length > 0 && !probando && (
          <button
            type="button"
            onClick={() => setProbando(true)}
            className="corte-poly-sm bg-neon/15 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-neon hover:bg-neon/25"
          >
            Pruébate ▸
          </button>
        )}
      </div>
      {probando ? (
        <Pruebate items={items} alSalir={() => setProbando(false)} />
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {items.map((item, i) => (
            <li key={`${item.action}-${i}`} className="corte-poly-sm flex items-center justify-between gap-3 bg-base/70 px-3 py-2.5">
              <span className="text-sm text-texto">{item.action}</span>
              <Teclas lista={item.keys} luego={item.then} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Atajos;
