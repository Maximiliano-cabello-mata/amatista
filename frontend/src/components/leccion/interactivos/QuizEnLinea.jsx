import { useState } from 'react';
import { TextoEnLinea } from '../Markdown';
import { useActividad } from './hooks';
import { BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';

const LETRAS = 'ABCDEFGH';

function estiloOpcion({ correcta, descartada, resuelta }) {
  if (correcta) return 'border-emerald-400/70 bg-emerald-400/10 text-white';
  if (descartada) return 'animar-sacudir border-blender/50 bg-blender/5 text-white/45 line-through decoration-blender/60';
  if (resuelta) return 'border-white/5 bg-base/40 text-white/50';
  return 'border-white/10 bg-base/60 text-texto hover:border-amatista hover:bg-amatista/10';
}

// Pregunta rápida dentro de la lección: cada error descarta esa opción y se
// puede volver a intentar; tras un error aparece "Ver solución".
function QuizEnLinea({ bloque, alCompletar, resuelta }) {
  const { resultado, resolver } = useActividad(alCompletar);
  const [descartadas, setDescartadas] = useState([]);
  const [elegida, setElegida] = useState(null);
  const fallos = descartadas.length;

  const elegir = (opcion) => {
    if (resultado || descartadas.includes(opcion.id)) return;
    if (opcion.isCorrect) {
      setElegida(opcion.id);
      resolver(true, fallos + 1);
    } else {
      setDescartadas([...descartadas, opcion.id]);
    }
  };

  let retro = null;
  if (resultado?.correcto) {
    retro = {
      tipo: 'bien',
      texto: fallos === 0 ? '¡A la primera!' : 'Lo encontraste.',
      explicacion: bloque.explanation,
    };
  } else if (resultado) {
    retro = { tipo: 'solucion', texto: 'La respuesta correcta está marcada en verde.', explicacion: bloque.explanation };
  } else if (fallos > 0) {
    retro = { tipo: 'mal', clave: fallos, texto: 'Esa no es. La tachamos: inténtalo con otra opción.' };
  }

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.question} resultado={resultado} resuelta={resuelta}>
      <div className="grid gap-3" role="group" aria-label="Opciones">
        {bloque.options.map((opcion, i) => {
          const descartada = descartadas.includes(opcion.id);
          // Al ver la solución se marcan todas las correctas.
          const correcta = elegida === opcion.id || (resultado && !resultado.correcto && opcion.isCorrect);
          return (
            <button
              key={opcion.id}
              type="button"
              onClick={() => elegir(opcion)}
              disabled={Boolean(resultado) || descartada}
              className={`corte-poly-sm flex items-center gap-4 border px-4 py-3 text-left transition-colors disabled:cursor-default ${estiloOpcion(
                { correcta, descartada, resuelta: Boolean(resultado) },
              )}`}
            >
              <span
                className={`hexagono grid h-9 w-9 shrink-0 place-items-center font-mono text-sm font-bold ${
                  correcta ? 'bg-emerald-400 text-[#121212]' : descartada ? 'bg-blender/30 text-white/60' : 'bg-amatista/30 text-white'
                }`}
                aria-hidden="true"
              >
                {correcta ? '✓' : descartada ? '✗' : LETRAS[i]}
              </span>
              <span>
                <TextoEnLinea texto={opcion.text} />
                {correcta && <span className="sr-only"> (correcta)</span>}
                {descartada && <span className="sr-only"> (incorrecta)</span>}
              </span>
            </button>
          );
        })}
      </div>

      <Retroalimentacion retro={retro} />

      {!resultado && fallos > 0 && (
        <div className="mt-4">
          <button type="button" onClick={() => resolver(false, fallos)} className={BOTON_SECUNDARIO}>
            Ver solución
          </button>
        </div>
      )}
    </MarcoActividad>
  );
}

export default QuizEnLinea;
