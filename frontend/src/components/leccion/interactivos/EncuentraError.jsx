// «Encuentra el error» (bloque «spot_error», dinámicas v4.3): la receta de otro alumno con uno o
// más pasos mal hechos. Encontrar el error ajeno enseña a revisar el propio (aprendizaje por
// errores): al revisar, cada paso dice por qué está bien o mal.
// Bloque: {"type": "spot_error", "id", "title"?, "text"?,
//          "steps": [{"text", "wrong"?: true, "explanation"?}]}.
// Se resuelve al revisar; es perfecta si marcó exactamente los pasos mal hechos.
import { useState } from 'react';
import { revisarErrores } from '../dinamicas';
import { TextoEnLinea } from '../Markdown';
import { useActividad } from './hooks';
import { BOTON_PRINCIPAL, MarcoActividad, Retroalimentacion } from './Marco';

function EncuentraError({ bloque, alCompletar, resuelta }) {
  const { resultado, resolver } = useActividad(alCompletar);
  const pasos = bloque.steps ?? [];
  const [marcados, setMarcados] = useState([]);
  const [revisado, setRevisado] = useState(null);
  const malos = pasos.filter((p) => p.wrong).length;

  const alternar = (i) => {
    if (revisado) return;
    setMarcados((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]));
  };

  const revisar = () => {
    const r = revisarErrores(pasos, marcados);
    setRevisado(r);
    resolver(r.correcto, 1);
  };

  let retro = null;
  if (revisado) {
    retro = revisado.correcto
      ? { tipo: 'bien', titulo: '¡Ojo de revisor!', texto: 'Encontraste justo lo que estaba mal. En Blender, revisa tu trabajo igual antes de seguir.' }
      : {
          tipo: 'solucion',
          titulo: `Encontraste ${revisado.encontrados} de ${revisado.total}`,
          texto: `${revisado.falsos ? `Marcaste ${revisado.falsos} que estaba${revisado.falsos === 1 ? '' : 'n'} bien. ` : ''}Lee por qué en cada paso.`,
        };
  }

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.title ?? 'Encuentra el error'} resultado={resultado} resuelta={resuelta}>
      {bloque.text && (
        <p className="mb-3 leading-relaxed text-texto/85">
          <TextoEnLinea texto={bloque.text} />
        </p>
      )}
      <p className="mb-3 text-sm text-texto/70">
        Toca {malos === 1 ? 'el paso que está mal' : `los ${malos} pasos que están mal`} y pulsa «Revisar».
      </p>
      <ol className="grid gap-2">
        {pasos.map((paso, i) => {
          const marcado = marcados.includes(i);
          const revision = revisado ? (Boolean(paso.wrong) === marcado ? 'acierto' : 'fallo') : undefined;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => alternar(i)}
                aria-pressed={marcado}
                disabled={Boolean(revisado)}
                data-revision={revision}
                className="error-paso corte-poly-sm flex w-full items-start gap-3 border border-white/10 bg-base/60 p-3 text-left disabled:cursor-default"
              >
                <span className={`hexagono grid h-8 w-9 shrink-0 place-items-center font-mono text-sm font-bold ${marcado ? 'bg-blender text-base' : 'bg-white/10 text-white/70'}`}>
                  {revisado ? (paso.wrong ? '✗' : '✓') : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-texto/90">
                    <TextoEnLinea texto={paso.text} />
                  </span>
                  {revisado && paso.explanation && (
                    <span className={`mt-1 block text-sm ${paso.wrong ? 'text-orange-200' : 'text-emerald-200/90'}`}>
                      <TextoEnLinea texto={paso.explanation} />
                    </span>
                  )}
                </span>
                {!revisado && <span className="shrink-0 text-xs font-semibold text-white/50">{marcado ? 'Está mal' : ''}</span>}
              </button>
            </li>
          );
        })}
      </ol>
      {!revisado && (
        <div className="mt-4">
          <button type="button" onClick={revisar} disabled={!marcados.length} className={BOTON_PRINCIPAL}>
            Revisar
          </button>
        </div>
      )}
      <Retroalimentacion retro={retro} />
    </MarcoActividad>
  );
}

export default EncuentraError;
