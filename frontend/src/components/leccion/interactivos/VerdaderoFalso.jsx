// ¿Verdad o mito? (bloque «true_false»): afirmaciones de a una, en una tarjeta que se voltea al
// responder y muestra la explicación. Se resuelve al responderlas todas; es perfecta si todas
// salieron bien.
// Bloque: {"type": "true_false", "id", "title"?, "statements": [{text, answer, explanation}]}.
import { useState } from 'react';
import { TextoEnLinea } from '../Markdown';
import { resumenVerdadero } from '../recursos';
import { useActividad } from './hooks';
import { BOTON_PRINCIPAL, MarcoActividad, Retroalimentacion } from './Marco';

function VerdaderoFalso({ bloque, alCompletar, resuelta }) {
  const { resultado, resolver } = useActividad(alCompletar);
  const afirmaciones = bloque.statements ?? [];
  const [respuestas, setRespuestas] = useState([]);
  const [indice, setIndice] = useState(0);
  const resumen = resumenVerdadero(afirmaciones, respuestas);
  const actual = afirmaciones[indice];
  const respondida = respuestas[indice] === true || respuestas[indice] === false;
  const acierto = respondida && respuestas[indice] === Boolean(actual.answer);

  const responder = (valor) => {
    if (respondida || resultado) return;
    const nuevas = [...respuestas];
    nuevas[indice] = valor;
    setRespuestas(nuevas);
    const r = resumenVerdadero(afirmaciones, nuevas);
    if (r.terminado) resolver(r.aciertos === r.total, 1);
  };

  if (!actual) return null;
  const ultima = indice >= afirmaciones.length - 1;

  let retro = null;
  if (resultado) {
    retro = resultado.correcto
      ? { tipo: 'bien', texto: `${resumen.aciertos} de ${resumen.total}: ¡no te engaña ningún mito!` }
      : { tipo: 'solucion', titulo: 'Listo', texto: `${resumen.aciertos} de ${resumen.total} bien. Repasa las que fallaste: la explicación está en cada tarjeta.` };
  }

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.title ?? '¿Verdad o mito?'} resultado={resultado} resuelta={resuelta}>
      <ol className="mb-4 flex gap-1.5" aria-label="Afirmaciones">
        {afirmaciones.map((a, i) => {
          const r = respuestas[i];
          const estado = r === undefined ? 'pendiente' : r === Boolean(a.answer) ? 'bien' : 'mal';
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => setIndice(i)}
                disabled={r === undefined && i !== resumen.respondidas}
                aria-current={i === indice ? 'step' : undefined}
                aria-label={`Afirmación ${i + 1}${estado === 'pendiente' ? '' : estado === 'bien' ? ', acertada' : ', fallada'}`}
                className={`hexagono block h-4 w-5 transition-colors disabled:cursor-default ${
                  estado === 'bien' ? 'bg-emerald-400' : estado === 'mal' ? 'bg-blender' : i === indice ? 'bg-neon' : 'bg-white/15'
                }`}
              />
            </li>
          );
        })}
      </ol>

      <div className="[perspective:1200px]">
        <div
          key={indice}
          className={`verdad__tarjeta animar-entrar grid transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
            respondida ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          <div className="corte-poly flex min-h-[9.5rem] flex-col justify-center gap-4 border border-white/10 bg-base/70 p-5 [backface-visibility:hidden] [grid-area:1/1]" aria-hidden={respondida}>
            <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">
              Afirmación {indice + 1} de {afirmaciones.length}
            </p>
            <p className="text-lg font-semibold leading-snug text-white">
              <TextoEnLinea texto={actual.text} />
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => responder(true)}
                disabled={respondida}
                className="verdad__boton verdad__boton--si corte-poly-sm border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 font-extrabold uppercase tracking-widest text-emerald-200 transition-colors hover:bg-emerald-400/20"
              >
                ✓ Verdad
              </button>
              <button
                type="button"
                onClick={() => responder(false)}
                disabled={respondida}
                className="verdad__boton verdad__boton--no corte-poly-sm border border-blender/40 bg-blender/10 px-4 py-3 font-extrabold uppercase tracking-widest text-orange-200 transition-colors hover:bg-blender/20"
              >
                ✗ Mito
              </button>
            </div>
          </div>
          <div
            className={`corte-poly flex min-h-[9.5rem] flex-col justify-center gap-2 border p-5 [backface-visibility:hidden] [grid-area:1/1] [transform:rotateY(180deg)] ${
              acierto ? 'border-emerald-400/50 bg-gradient-to-br from-emerald-900/40 to-superficie' : 'border-blender/50 bg-gradient-to-br from-orange-950/50 to-superficie'
            }`}
            aria-hidden={!respondida}
            aria-live="polite"
          >
            <p className={`font-mono text-xs font-bold uppercase tracking-widest ${acierto ? 'text-emerald-300' : 'text-blender'}`}>
              {acierto ? '¡Bien visto!' : 'Era al revés'} · {actual.answer ? 'Es verdad' : 'Es un mito'}
            </p>
            <p className="text-white/90">
              <TextoEnLinea texto={actual.text} />
            </p>
            {actual.explanation && (
              <p className="leading-relaxed text-texto/80">
                <TextoEnLinea texto={actual.explanation} />
              </p>
            )}
            {respondida && !ultima && (
              <div>
                <button type="button" onClick={() => setIndice(indice + 1)} className={`${BOTON_PRINCIPAL} mt-2`}>
                  Siguiente ▸
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Retroalimentacion retro={retro} />
    </MarcoActividad>
  );
}

export default VerdaderoFalso;
