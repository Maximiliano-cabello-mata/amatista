// «Conoce Amatista Motor» en #/blender: las tres prácticas del add-on que explican todas sus
// herramientas (add-on 5.2). No son un curso: cada una se empieza desde aquí y se hace en Blender,
// y esta tarjeta muestra en vivo el mismo paso que la pestaña Amatista.
import { useEffect, useRef, useState } from 'react';
import { conoceDelEnlace, estadoPractica, PRACTICAS_ADDON, siguientePractica, TEXTO_CONOCE } from '../../blender/conoce';
import { useLanzadorBlender } from '../../blender/useLanzador';
import { useAvisoTemporal } from '../../blender/useTaller';
import { estadoEnlace, ordenarRecorrido } from '../../services/blender';
import { hayQueLanzar } from '../../services/lanzador';
import AvisoLanzador from '../blender/AvisoLanzador';
import { TextoEnLinea } from '../leccion/Markdown';

const ESPERA_MS = { en_curso: 2500, abierto: 5000, cerrado: 20000, viejo: 20000, sin_enlace: 60000 };
const BOTON = 'boton disabled:cursor-wait';

// El Blender del alumno, preguntado de a una vez (se pausa con la pestaña oculta).
function useConoceVivo(token) {
  const [conoce, setConoce] = useState(null);
  const refrescar = useRef(() => {});
  useEffect(() => {
    if (!token) return undefined;
    let vigente = true;
    let temporizador = null;
    const consultar = async () => {
      clearTimeout(temporizador);
      if (!vigente || document.visibilityState !== 'visible') return;
      const r = await estadoEnlace(token);
      if (!vigente) return;
      const nuevo = r.ok ? conoceDelEnlace(r.datos) : conoceDelEnlace(null);
      setConoce(nuevo);
      temporizador = setTimeout(consultar, ESPERA_MS[nuevo.estado] ?? 20000);
    };
    const alVolver = () => {
      if (document.visibilityState === 'visible') consultar();
      else clearTimeout(temporizador);
    };
    refrescar.current = consultar;
    consultar();
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      vigente = false;
      clearTimeout(temporizador);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [token]);
  return { conoce, refrescar: () => refrescar.current() };
}

const ETIQUETA = {
  hecha: { texto: '✓ Hecha', clase: 'bg-emerald-400/15 text-emerald-300' },
  'en-curso': { texto: 'En Blender ahora', clase: 'bg-neon/15 text-neon' },
  siguiente: { texto: 'Te toca', clase: 'bg-amatista/25 text-amatista-claro' },
  pendiente: { texto: 'Después', clase: 'bg-white/5 text-white/50' },
};

// Lo mismo que muestra la pestaña Amatista de Blender en este momento.
function Espejo({ vivo, enviando, alOrdenar }) {
  return (
    <div className="recorrido-vivo corte-poly-sm mt-4 border border-neon/30 bg-base/70 p-4">
      <div className="flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-widest">
        <span className="flex items-center gap-2 text-neon">
          <span className="recorrido-vivo__latido h-2 w-2 rounded-full bg-neon" aria-hidden="true" />
          En vivo desde tu Blender
        </span>
        <span className="text-white/55">
          Paso {Math.min(vivo.paso + 1, vivo.total)} de {vivo.total}
        </span>
      </div>
      <div className="mt-3 flex gap-1" aria-hidden="true">
        {vivo.pasos.map((p, i) => (
          <span
            key={`${p.titulo}-${i}`}
            title={p.titulo}
            className={`h-1.5 flex-1 rounded-full transition-colors ${p.ok ? 'bg-emerald-400' : i === vivo.paso ? 'bg-neon' : 'bg-white/15'}`}
          />
        ))}
      </div>
      <p key={vivo.paso} className="animar-entrar mt-3 text-lg font-bold text-white">
        {vivo.titulo}
      </p>
      {vivo.texto && <p className="mt-1 text-sm text-texto/80">{vivo.texto}</p>}
      {vivo.hacer && (
        <p className="corte-poly-sm mt-3 flex flex-wrap items-center gap-2 bg-black/30 px-3 py-2 text-sm text-white">
          <span className="font-mono text-[11px] uppercase tracking-widest text-amatista-claro">Qué hacer</span>
          <TextoEnLinea texto={vivo.hacer} />
          {vivo.teclas.map((t, i) => (
            <kbd key={`${t}-${i}`} className="rounded border border-white/25 bg-base px-1.5 py-0.5 font-mono text-[11px]">
              {t}
            </kbd>
          ))}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={enviando || vivo.paso === 0} onClick={() => alOrdenar('anterior')} className={`${BOTON} bg-white/5 text-white/75 hover:bg-white/10`}>
          ◂ Anterior
        </button>
        <button type="button" disabled={enviando} onClick={() => alOrdenar('siguiente')} className={`${BOTON} bg-amatista text-white hover:brightness-110`}>
          Siguiente ▸
        </button>
        <button type="button" disabled={enviando} onClick={() => alOrdenar('salir')} className={`${BOTON} text-white/55 hover:text-white`}>
          Salir
        </button>
      </div>
    </div>
  );
}

function ConoceAmatistaMotor({ token, usuario }) {
  const { conoce, refrescar } = useConoceVivo(usuario ? token : null);
  const lanzador = useLanzadorBlender(token, { alAbrirse: () => refrescar() });
  const [aviso, avisar] = useAvisoTemporal();
  const [enviando, setEnviando] = useState(false);
  const estado = conoce?.estado ?? (usuario ? 'cargando' : 'sin_cuenta');
  // Con Blender cerrado también: «Empezar en Blender» lo abre con el enlace amatista:// (add-on 5.4).
  const puedeOrdenar = usuario && ['abierto', 'en_curso', 'cerrado'].includes(estado);
  const toca = siguientePractica(conoce?.hechos);

  const ordenar = async (accion, recorrido = null) => {
    setEnviando(true);
    const r = await ordenarRecorrido(token, accion, recorrido ?? conoce?.actual ?? null);
    setEnviando(false);
    if (!r.ok) avisar(r.error || 'No se pudo avisar a tu Blender.');
    else if (hayQueLanzar(r) && accion === 'empezar') lanzador.lanzar('recorrido', { recorrido: recorrido ?? conoce?.actual ?? undefined });
    else if (r.datos?.entregada === false) avisar('Tu Blender no está abierto: ábrelo y vuelve a intentarlo.');
    else avisar(accion === 'empezar' ? 'Enviado: mira tu Blender.' : 'Enviado a tu Blender.');
    refrescar();
  };

  return (
    <section className="corte-poly border border-blender/40 bg-superficie/95 p-6 sm:p-7" aria-labelledby="conoce-amatista" data-recorrido="conoce">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-blender">Antes de tu primer taller</p>
          <h2 id="conoce-amatista" className="mt-1 text-2xl font-extrabold text-white">
            Conoce Amatista Motor
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-texto/80">
            Tres prácticas cortas dentro de Blender que te enseñan todo lo que hace el add-on. No son un curso: haz cada una una vez (unos 3
            minutos) y repítela cuando quieras.
          </p>
        </div>
        {conoce && (
          <p className="font-mono text-xs uppercase tracking-widest text-white/60">
            {conoce.hechos.length} de {PRACTICAS_ADDON.length} hechas
          </p>
        )}
      </div>

      <ol className="mt-5 grid gap-3 lg:grid-cols-3">
        {PRACTICAS_ADDON.map((p, i) => {
          const est = estadoPractica(p.id, conoce);
          const etiqueta = ETIQUETA[est];
          return (
            <li
              key={p.id}
              className={`corte-poly-sm flex flex-col border p-4 ${
                est === 'en-curso' ? 'border-neon/50 bg-neon/5' : est === 'hecha' ? 'border-emerald-400/30 bg-emerald-400/5' : est === 'siguiente' ? 'border-amatista/50 bg-amatista/10' : 'border-white/10 bg-base/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">Práctica {i + 1}</span>
                <span className={`corte-poly-sm px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest ${etiqueta.clase}`}>{etiqueta.texto}</span>
              </div>
              <h3 className="mt-2 text-lg font-bold leading-snug text-white">{p.nombre}</h3>
              <p className="mt-1 text-sm text-texto/75">{p.resumen}</p>
              <ul className="mt-3 grid gap-1 text-xs text-texto/70">
                {p.temas.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-blender" aria-hidden="true">
                      ▸
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4">
                {puedeOrdenar && est !== 'en-curso' && (
                  <button
                    type="button"
                    disabled={enviando}
                    onClick={() => ordenar('empezar', p.id)}
                    className={`${BOTON} w-full ${p.id === toca ? 'bg-blender text-base hover:brightness-110' : 'bg-white/5 text-white/80 hover:bg-white/10'}`}
                  >
                    {est === 'hecha' ? 'Repetir en Blender' : 'Empezar en Blender ▶'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {conoce?.estado === 'en_curso' && conoce.vivo && <Espejo vivo={conoce.vivo} enviando={enviando} alOrdenar={(accion) => ordenar(accion)} />}

      <p className={`mt-4 text-sm ${estado === 'en_curso' ? 'text-neon' : 'text-texto/75'}`} aria-live="polite">
        {!usuario && 'Entra con tu cuenta para empezarlas desde aquí. También están en el menú Amatista de Blender (arriba).'}
        {usuario && !conoce && 'Buscando tu Blender…'}
        {usuario && conoce && TEXTO_CONOCE[conoce.estado]}
      </p>
      {aviso && (
        <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-neon" role="status">
          {aviso}
        </p>
      )}
      <AvisoLanzador estado={lanzador.estado} alCerrar={lanzador.cerrar} />
    </section>
  );
}

export default ConoceAmatistaMotor;
