// Mundo 3D (bloque «motor_scene»): una escena del Motor Web de Amatista con retos que se
// cumplen moviendo cosas, no leyendo. El alumno arrastra objetos con el ratón o el dedo (o el
// láser del visor), gira la vista y ve en vivo qué retos ya cumplió. Se resuelve al cumplirlos
// todos; si la escena no tiene retos, al mover o tocar algo por primera vez.
// Bloque: {"type": "motor_scene", "id", "title"?, "instructions"?, "escena": {...} (motor3d/escena.js)}.
import { useCallback, useMemo, useRef, useState } from 'react';
import { evaluarRetos } from '../../../motor3d/retos';
import { TextoEnLinea } from '../Markdown';
import { useActividad, useModuloDiferido } from './hooks';
import { webglDisponible } from './logica';
import { BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';

const cargarEscena = () => import('./EscenaMotor');

function MundoMotor({ bloque, alCompletar, resuelta }) {
  const { resultado, resolver } = useActividad(alCompletar);
  const [con3D] = useState(() => webglDisponible());
  const [visible, setVisible] = useState(false);
  const [version, setVersion] = useState(0);
  const [retos, setRetos] = useState(() => evaluarRetos(bloque.escena?.retos ?? [], {}));
  const marco = useRef(null);
  const { Componente: Escena, error } = useModuloDiferido(cargarEscena, con3D && visible);
  const escena = useMemo(() => bloque.escena ?? {}, [bloque.escena]);
  const sinRetos = !(escena.retos ?? []).length;

  const alFoto = useCallback(
    (foto) => {
      const nuevo = evaluarRetos(escena.retos ?? [], foto);
      setRetos((previo) => (previo.cumplidos === nuevo.cumplidos && previo.lista.every((r, i) => r.cumplido === nuevo.lista[i]?.cumplido) ? previo : nuevo));
      if (nuevo.completo) resolver(true, 1);
    },
    [escena, resolver],
  );
  const alEvento = useCallback(
    (tipo) => {
      if (sinRetos && (tipo === 'am-soltar' || tipo === 'am-toque')) resolver(true, 1);
    },
    [sinRetos, resolver],
  );

  const pantallaCompleta = () => {
    const nodo = marco.current;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else nodo?.requestFullscreen?.().catch(() => {});
  };

  let retro = null;
  if (resultado) retro = { tipo: 'bien', texto: bloque.success ?? '¡Lo lograste! Así se trabaja en 3D: mover, mirar desde otro ángulo y acomodar.' };

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.title ?? 'Mundo 3D'} resultado={resultado} resuelta={resuelta}>
      {bloque.instructions && (
        <p className="mb-4 leading-relaxed text-texto/85">
          <TextoEnLinea texto={bloque.instructions} />
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div ref={marco} className="corte-poly relative aspect-[4/3] w-full overflow-hidden bg-black sm:aspect-video [&:fullscreen]:aspect-auto">
          {!con3D || error ? (
            <div className="grid h-full place-items-center p-6 text-center">
              <p className="font-mono text-xs text-white/60">
                {con3D ? 'No se pudo cargar el motor 3D. Revisa tu conexión.' : 'Tu dispositivo no puede mostrar escenas 3D (WebGL).'}
              </p>
              <button type="button" onClick={() => resolver(true, 1)} className={`${BOTON_SECUNDARIO} mt-3`}>
                Continuar sin la escena
              </button>
            </div>
          ) : visible && Escena ? (
            <Escena escena={escena} version={version} alFoto={alFoto} alEvento={alEvento} />
          ) : (
            <button
              type="button"
              onClick={() => setVisible(true)}
              className="group grid h-full w-full place-items-center bg-gradient-to-br from-amatista-oscuro/60 via-base to-black"
            >
              <span className="flex flex-col items-center gap-3">
                <span className="hexagono grid h-16 w-[4.5rem] place-items-center bg-neon text-2xl text-base transition-transform group-hover:scale-105">▶</span>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-white/80">{visible ? 'Cargando el mundo…' : 'Entrar al mundo 3D'}</span>
              </span>
            </button>
          )}
        </div>
        <aside className="flex flex-col gap-3 text-sm">
          {!sinRetos && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/45">
                Retos · {retos.cumplidos} de {retos.total}
              </p>
              <ul className="mt-2 grid gap-1.5" aria-live="polite">
                {retos.lista.map((reto) => (
                  <li key={reto.indice} className={`flex items-start gap-2 ${reto.cumplido ? 'text-emerald-300' : 'text-white/80'}`}>
                    <span className={`hexagono mt-0.5 grid h-4 w-[1.15rem] shrink-0 place-items-center text-[9px] font-bold ${reto.cumplido ? 'bg-emerald-400 text-base' : 'bg-white/15'}`} aria-hidden="true">
                      {reto.cumplido ? '✓' : ''}
                    </span>
                    <span>
                      <TextoEnLinea texto={reto.texto} />
                      <span className="sr-only">{reto.cumplido ? ' (cumplido)' : ' (pendiente)'}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <dl className="grid gap-1.5 text-xs text-white/60">
            <div><dt className="inline font-bold text-white/80">Mover: </dt><dd className="inline">arrastra un objeto con el ratón o el dedo.</dd></div>
            <div><dt className="inline font-bold text-white/80">Mirar: </dt><dd className="inline">arrastra el fondo para girar la vista.</dd></div>
            <div><dt className="inline font-bold text-white/80">Acercar: </dt><dd className="inline">rueda del ratón o pellizca con dos dedos.</dd></div>
          </dl>
          {visible && Escena && (
            <div className="mt-auto flex flex-wrap gap-2">
              <button type="button" onClick={() => setVersion((v) => v + 1)} className={BOTON_SECUNDARIO}>
                ↺ Empezar de nuevo
              </button>
              <button type="button" onClick={pantallaCompleta} className={BOTON_SECUNDARIO}>
                ⛶ Pantalla completa
              </button>
            </div>
          )}
        </aside>
      </div>
      <Retroalimentacion retro={retro} />
    </MarcoActividad>
  );
}

export default MundoMotor;
