// «Entrena tus teclas» (bloque «shortcut_drill», dinámicas v4.3): el alumno pulsa en el navegador
// las mismas teclas que usará en Blender y ve al cubo reaccionar como allá. Practicar el gesto
// antes de abrir Blender baja el miedo a la pantalla llena de botones.
// Bloque: {"type": "shortcut_drill", "id", "title"?, "text"?,
//          "drills": [{"prompt", "keys": ["G", "X"], "explanation"?}]}.
// Se resuelve al terminar todos; es perfecta si no hubo teclas equivocadas.
import { useEffect, useRef, useState } from 'react';
import CuboVista from '../CuboVista';
import { avanzarTeclas, efectoDeTeclas, normalizarCombinacion, teclaDeEvento, tecladoEnPantalla } from '../dinamicas';
import { TextoEnLinea } from '../Markdown';
import { useActividad } from './hooks';
import { BOTON_PRINCIPAL, MarcoActividad, Retroalimentacion } from './Marco';

function EntrenaTeclas({ bloque, alCompletar, resuelta }) {
  const { resultado, resolver } = useActividad(alCompletar);
  const ejercicios = (bloque.drills ?? []).filter((d) => d?.keys?.length);
  const [indice, setIndice] = useState(0);
  const [hechas, setHechas] = useState([]);
  const [logrado, setLogrado] = useState(false);
  const [errores, setErrores] = useState(0);
  const [sacudir, setSacudir] = useState(0);
  const [escuchando, setEscuchando] = useState(false);
  const zona = useRef(null);
  const actual = ejercicios[indice];
  const esperadas = (actual?.keys ?? []).map(normalizarCombinacion);
  const teclado = tecladoEnPantalla(ejercicios);
  const ultimo = indice >= ejercicios.length - 1;

  // sacudir cuenta las teclas equivocadas seguidas: la zona tiembla y a los 450 ms vuelve a 0.
  useEffect(() => {
    if (!sacudir) return undefined;
    const t = setTimeout(() => setSacudir(0), 450);
    return () => clearTimeout(t);
  }, [sacudir]);

  const pulsar = (tecla) => {
    if (!actual || logrado || resultado) return;
    const r = avanzarTeclas(esperadas, hechas, tecla);
    setHechas(r.hechas);
    if (r.estado === 'error') {
      setErrores((n) => n + 1);
      setSacudir((n) => n + 1);
    } else if (r.estado === 'listo') {
      setLogrado(true);
      if (ultimo) resolver(errores === 0, 1 + errores);
    }
  };

  const alTeclear = (evento) => {
    const tecla = teclaDeEvento(evento);
    if (!tecla || evento.repeat) return;
    if (tecla === 'Esc') {
      zona.current?.blur();
      return;
    }
    // Tab solo se atrapa cuando es la tecla que toca: si no, sigue moviendo el foco.
    if (tecla === 'Tab' && esperadas[hechas.length] !== 'Tab') return;
    evento.preventDefault();
    pulsar(tecla);
  };

  const siguiente = () => {
    setIndice((i) => i + 1);
    setHechas([]);
    setLogrado(false);
    zona.current?.focus();
  };

  if (!actual) return null;
  const efecto = efectoDeTeclas(logrado ? esperadas : hechas);

  let retro = null;
  if (resultado) {
    retro = resultado.correcto
      ? { tipo: 'bien', titulo: '¡Tus dedos ya saben!', texto: 'En Blender son las mismas teclas, con el ratón sobre la vista 3D.' }
      : { tipo: 'info', titulo: 'Listo', texto: `Lo lograste con ${errores} ${errores === 1 ? 'tecla equivocada' : 'teclas equivocadas'}. Repítelo cuando quieras: la memoria de los dedos se hace repitiendo.` };
  }

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.title ?? 'Entrena tus teclas'} resultado={resultado} resuelta={resuelta}>
      {bloque.text && (
        <p className="mb-4 leading-relaxed text-texto/85">
          <TextoEnLinea texto={bloque.text} />
        </p>
      )}
      <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-white/50">
        Ejercicio {indice + 1} de {ejercicios.length}
      </p>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] [&>*]:min-w-0">
        <div
          ref={zona}
          tabIndex={0}
          role="application"
          aria-label={`Zona de teclas. ${actual.prompt}. Pulsa las teclas aquí; Esc para salir.`}
          data-escuchando={escuchando}
          onKeyDown={alTeclear}
          onFocus={() => setEscuchando(true)}
          onBlur={() => setEscuchando(false)}
          onClick={() => zona.current?.focus()}
          className={`teclas-zona corte-poly-sm self-start overflow-hidden border border-white/10 ${sacudir ? 'animar-sacudir' : ''}`}
        >
          <CuboVista
            transformacion={efecto}
            copia={efecto.copia}
            edicion={efecto.edicion}
            etiqueta={logrado ? 'El cubo hizo lo que pediste' : 'Un cubo sobre el suelo de Blender'}
          />
          <p className="border-t border-white/10 bg-base/70 px-3 py-2 text-center text-xs text-white/60">
            {escuchando ? 'Te escucho: pulsa las teclas' : 'Haz clic aquí y usa tu teclado (o los botones de abajo)'}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-lg font-bold leading-snug text-white">
            <TextoEnLinea texto={actual.prompt} />
          </p>
          <div className="flex flex-wrap items-center gap-2" aria-label="Teclas de este ejercicio">
            {esperadas.map((t, i) => (
              <span
                key={`${t}-${i}`}
                className={`tecla-chip ${i < hechas.length || logrado ? 'tecla-chip--hecha' : i === hechas.length ? 'tecla-chip--toca' : ''}`}
              >
                {logrado || i < hechas.length ? t : '?'}
              </span>
            ))}
          </div>
          <p className="text-sm text-texto/70" aria-live="polite">
            {logrado
              ? '¡Eso! Mira lo que hizo el cubo.'
              : hechas.length
                ? `Bien: ${hechas.join(' › ')}. ¿Y ahora?`
                : sacudir
                  ? 'Esa no era. Empieza otra vez desde la primera tecla.'
                  : `Son ${esperadas.length} ${esperadas.length === 1 ? 'tecla' : 'teclas'}, en orden.`}
          </p>
          {logrado && actual.explanation && (
            <p className="corte-poly-sm animar-entrar border border-emerald-400/30 bg-emerald-400/5 p-3 text-sm text-texto/85">
              <TextoEnLinea texto={actual.explanation} />
            </p>
          )}
          {logrado && !ultimo && (
            <div>
              <button type="button" onClick={siguiente} className={BOTON_PRINCIPAL}>
                Siguiente ejercicio <span className="boton__flecha" aria-hidden="true">▸</span>
              </button>
            </div>
          )}
          <details className="mt-auto text-sm text-texto/70">
            <summary className="cursor-pointer select-none font-semibold text-white/75">Sin teclado (táctil)</summary>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {teclado.map((t) => (
                <button key={t} type="button" onClick={() => pulsar(t)} disabled={logrado || Boolean(resultado)} className="tecla-chip disabled:opacity-40">
                  {t}
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>
      <Retroalimentacion retro={retro} />
    </MarcoActividad>
  );
}

export default EntrenaTeclas;
