import { useEffect, useId, useMemo, useState } from 'react';
import { TextoEnLinea } from '../Markdown';
import { useActividad, useModuloDiferido } from './hooks';
import { evaluarCodigo, webglDisponible } from './logica';
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';

// La misma vista 3D de los bloques de código (solo copia etiquetas <a-…>).
const cargarVista = () => import('../VistaAFrame');
// Espera tras la última tecla antes de redibujar la escena.
const PAUSA_VISTA = 600;

function Revision({ texto, cumplida, comprobado }) {
  let estilo = 'bg-white/10 text-white/45';
  let icono = '○';
  if (cumplida) {
    estilo = 'animar-acierto bg-emerald-400 text-[#121212]';
    icono = '✓';
  } else if (comprobado) {
    estilo = 'bg-blender text-[#121212]';
    icono = '✗';
  }
  return (
    <li className="flex items-start gap-3">
      <span
        key={icono}
        className={`hexagono grid h-6 w-6 shrink-0 place-items-center font-mono text-xs font-bold ${estilo}`}
        aria-hidden="true"
      >
        {icono}
      </span>
      <span className={cumplida ? 'text-white' : 'text-texto/75'}>
        <TextoEnLinea texto={texto} />
        <span className="sr-only">{cumplida ? ' (cumplida)' : ' (pendiente)'}</span>
      </span>
    </li>
  );
}

// Reto de código: un editor y una lista de condiciones que se revisan en vivo
// con DOMParser (el código nunca se ejecuta). Con `preview` se ve la escena
// A-Frame mientras se escribe.
function RetoCodigo({ bloque, alCompletar, resuelta }) {
  const idEditor = useId();
  const inicial = bloque.starter ?? '';
  const revisiones = useMemo(() => bloque.checks ?? [], [bloque.checks]);
  const [codigo, setCodigo] = useState(inicial);
  const [comprobado, setComprobado] = useState(false);
  const [fallos, setFallos] = useState(0);
  const [verVista, setVerVista] = useState(false);
  const [ejecucion, setEjecucion] = useState(null);
  const [con3D] = useState(() => webglDisponible());
  const { resultado, resolver } = useActividad(alCompletar);
  const { Componente: VistaAFrame, error } = useModuloDiferido(cargarVista, verVista && con3D);
  const cumplidas = useMemo(() => evaluarCodigo(codigo, revisiones), [codigo, revisiones]);
  const faltan = cumplidas.filter((cumplida) => !cumplida).length;

  // Vista previa en vivo: se actualiza cuando el alumno deja de escribir.
  useEffect(() => {
    if (!verVista) return;
    const temporizador = setTimeout(
      () => setEjecucion((previa) => (previa?.codigo === codigo ? previa : { codigo, numero: (previa?.numero ?? 0) + 1 })),
      PAUSA_VISTA,
    );
    return () => clearTimeout(temporizador);
  }, [codigo, verVista]);

  const alternarVista = () => {
    if (!verVista) setEjecucion({ codigo, numero: (ejecucion?.numero ?? 0) + 1 });
    setVerVista(!verVista);
  };

  const comprobar = () => {
    if (resultado) return;
    if (faltan === 0) {
      resolver(true, fallos + 1);
    } else {
      setComprobado(true);
      setFallos(fallos + 1);
    }
  };

  const verSolucion = () => {
    setCodigo(bloque.solution);
    resolver(false, fallos);
  };

  let retro = null;
  if (resultado?.correcto) {
    retro = {
      tipo: 'bien',
      texto: fallos === 0 ? '¡Reto superado a la primera!' : '¡Reto superado! Tu código cumple todas las condiciones.',
    };
  } else if (resultado) {
    retro = {
      tipo: 'solucion',
      texto: 'Esta es una solución posible: compárala con la tuya y ejecútala en la vista 3D.',
    };
  } else if (comprobado && faltan > 0) {
    retro = {
      tipo: 'mal',
      clave: fallos,
      texto: `Te ${faltan === 1 ? 'falta 1 condición' : `faltan ${faltan} condiciones`} de ${revisiones.length}. Revisa las marcadas con ✗.`,
    };
  }

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.prompt} resultado={resultado} resuelta={resuelta}>
      <div className="corte-poly overflow-hidden border border-white/10 bg-[#0d0b12]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/40 px-4 py-2">
          <label htmlFor={idEditor} className="font-mono text-xs uppercase tracking-widest text-white/50">
            {bloque.language ?? 'html'} · tu código
          </label>
          {codigo !== inicial && (
            <button
              type="button"
              onClick={() => setCodigo(inicial)}
              className="corte-poly-sm bg-white/5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-white/70 transition-colors hover:bg-white/10"
            >
              Restablecer
            </button>
          )}
        </div>
        <textarea
          id={idEditor}
          value={codigo}
          onChange={(evento) => setCodigo(evento.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          wrap="off"
          className="block h-64 w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-texto focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neon/60"
        />
      </div>

      <div className="mt-5">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-white/45">
          Condiciones · {revisiones.length - faltan} de {revisiones.length}
        </p>
        <ul className="space-y-2" aria-label="Condiciones del reto">
          {revisiones.map((revision, i) => (
            <Revision key={i} texto={revision.text} cumplida={cumplidas[i]} comprobado={comprobado} />
          ))}
        </ul>
      </div>

      <Retroalimentacion retro={retro} />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!resultado && (
          <button type="button" onClick={comprobar} className={BOTON_PRINCIPAL}>
            Comprobar
          </button>
        )}
        {bloque.preview && (
          <button
            type="button"
            onClick={alternarVista}
            aria-expanded={verVista}
            className="corte-poly-sm destello bg-neon px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-[#121212] transition-[filter] hover:brightness-110"
          >
            {verVista ? 'Ocultar 3D' : '▶ Ver en 3D'}
          </button>
        )}
        {!resultado && fallos > 0 && bloque.solution && (
          <button type="button" onClick={verSolucion} className={BOTON_SECUNDARIO}>
            Ver solución
          </button>
        )}
      </div>

      {verVista && (
        <div className="mt-4">
          {!con3D || error ? (
            <p className="grid aspect-video place-items-center bg-black p-6 text-center font-mono text-xs text-white/60">
              {con3D
                ? 'No se pudo cargar el motor 3D. Revisa tu conexión e inténtalo de nuevo.'
                : 'Tu dispositivo no puede mostrar escenas 3D (WebGL). Las condiciones se revisan igual.'}
            </p>
          ) : VistaAFrame && ejecucion ? (
            <>
              <VistaAFrame ejecucion={ejecucion} />
              <p className="mt-2 font-mono text-[11px] text-white/45">
                La escena se actualiza sola al dejar de escribir · arrastra para mirar alrededor
              </p>
            </>
          ) : (
            <p className="animar-pulso grid aspect-video place-items-center bg-black font-mono text-xs uppercase tracking-widest text-white/50">
              Cargando motor 3D…
            </p>
          )}
        </div>
      )}
    </MarcoActividad>
  );
}

export default RetoCodigo;
