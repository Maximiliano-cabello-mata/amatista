// «Elige la figura» (bloque image_choice): una pregunta cuyas respuestas son figuras 3D
// dibujadas, no textos. Se reconoce a simple vista lo que hace una herramienta (bisel,
// suavizado, Array, Espejo…). Como la pregunta rápida: cada error tacha esa figura.
// Bloque: {"type": "image_choice", "id", "question", "options": [{id, figure, label?, isCorrect}], "explanation"?}.
import { useState } from 'react';
import FiguraIso from '../FiguraIso';
import { FIGURAS } from '../graficos';
import { useActividad } from './hooks';
import { MarcoActividad, Retroalimentacion } from './Marco';

function ElegirFigura({ bloque, alCompletar, resuelta }) {
  const { resultado, resolver } = useActividad(alCompletar);
  const [descartadas, setDescartadas] = useState([]);
  const [elegida, setElegida] = useState(null);
  const opciones = bloque.options ?? [];

  const elegir = (opcion) => {
    if (resultado || descartadas.includes(opcion.id)) return;
    if (opcion.isCorrect) {
      setElegida(opcion.id);
      resolver(true, descartadas.length + 1);
    } else setDescartadas([...descartadas, opcion.id]);
  };

  let retro = null;
  if (resultado) retro = { tipo: 'bien', texto: descartadas.length ? 'Lo encontraste.' : '¡A la primera!', explicacion: bloque.explanation };
  else if (descartadas.length) retro = { tipo: 'mal', clave: descartadas.length, texto: 'Esa no es. Mírala bien y prueba con otra.' };

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.question} resultado={resultado} resuelta={resuelta}>
      <div className={`grid gap-3 ${opciones.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : opciones.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`} role="group" aria-label="Figuras">
        {opciones.map((opcion) => {
          const descartada = descartadas.includes(opcion.id);
          const correcta = elegida === opcion.id || (resultado && opcion.isCorrect);
          const nombre = opcion.label ?? FIGURAS[opcion.figure]?.nombre ?? opcion.figure;
          return (
            <button
              key={opcion.id}
              type="button"
              onClick={() => elegir(opcion)}
              disabled={Boolean(resultado) || descartada}
              aria-label={`${nombre}${correcta ? ', correcta' : descartada ? ', descartada' : ''}`}
              className={`corte-poly-sm group flex flex-col items-center border p-2 transition-[border-color,background-color,transform] sm:p-3 ${
                correcta
                  ? 'border-emerald-400/70 bg-emerald-400/10'
                  : descartada
                    ? 'animar-sacudir border-blender/40 bg-blender/5 opacity-45'
                    : 'border-white/10 bg-base/60 hover:-translate-y-0.5 hover:border-neon hover:bg-neon/5'
              }`}
            >
              <FiguraIso figura={opcion.figure} className="h-24 w-full sm:h-28" />
              <span className={`mt-1 text-center text-xs font-semibold leading-tight ${correcta ? 'text-emerald-200' : 'text-white/75'}`}>
                {opcion.label ?? (resultado || descartada ? nombre : ' ')}
              </span>
            </button>
          );
        })}
      </div>
      <Retroalimentacion retro={retro} />
    </MarcoActividad>
  );
}

export default ElegirFigura;
