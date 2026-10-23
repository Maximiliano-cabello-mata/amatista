// Palabras de Blender sin tecnicismos (2026-10-23). Mismo archivo que la pestaña Aprender del
// add-on (practices/blender/palabras.json). Blender se instala en inglés, así que cada palabra
// muestra también el nombre con el que aparece en sus menús.
import { useState } from 'react';
import datos from '../../../../practices/blender/palabras.json';

const PALABRAS = datos.palabras;
const PRIMERAS = 6;

function Palabra({ palabra }) {
  return (
    <li className="corte-poly-sm flex flex-col gap-2 border border-white/10 bg-superficie/80 p-4">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-lg font-extrabold text-white">{palabra.termino}</h3>
        {palabra.ingles !== palabra.termino && (
          <span className="font-mono text-[11px] uppercase tracking-widest text-blender" lang="en">
            {palabra.ingles}
          </span>
        )}
      </div>
      <p className="text-sm text-texto/85">{palabra.que_es}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 font-mono text-[11px] text-white/55">
        {palabra.donde && <span>Dónde: {palabra.donde}</span>}
        {palabra.tecla && (
          <span>
            Tecla: <strong className="text-white/80">{palabra.tecla}</strong>
          </span>
        )}
      </div>
    </li>
  );
}

function PalabrasBlender() {
  const [todas, setTodas] = useState(false);
  const lista = todas ? PALABRAS : PALABRAS.slice(0, PRIMERAS);
  return (
    <div>
      <p className="max-w-3xl text-texto/75">
        ¿Una palabra rara en una lección? Aquí está en simple. Blender viene en inglés al instalarlo: en naranja va el nombre que
        verás en sus menús. El add-on muestra esta misma lista en su pestaña <strong className="text-white">Aprender</strong>.
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((palabra) => (
          <Palabra key={palabra.id} palabra={palabra} />
        ))}
      </ul>
      {PALABRAS.length > PRIMERAS && (
        <button
          type="button"
          onClick={() => setTodas((v) => !v)}
          className="corte-poly-sm mt-4 bg-white/5 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white/80 hover:bg-white/10"
          aria-expanded={todas}
        >
          {todas ? 'Ver menos ▴' : `Ver las ${PALABRAS.length} palabras ▾`}
        </button>
      )}
    </div>
  );
}

export default PalabrasBlender;
