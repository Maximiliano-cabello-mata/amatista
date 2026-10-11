// Primeros pasos dentro de Blender (bloque «blender_tour», add-on 5.1): la lección y Blender se
// ven a la vez. Desde aquí se empieza el recorrido en Blender y se pasa de paso; Blender cuenta
// en su latido en qué paso va (detalle.recorrido) y esta tarjeta muestra lo mismo que la
// pestaña Amatista. Se resuelve cuando Blender avisa que el recorrido terminó.
// Bloque: {"type": "blender_tour", "id", "title", "text"?, "allowManual"?}.
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../auth/contexto';
import PrepararBlender from '../../../blender/PrepararBlender';
import { useAvisoTemporal } from '../../../blender/useTaller';
import { rutaEntrar, rutas } from '../../../rutas';
import { estadoEnlace, ordenarRecorrido } from '../../../services/blender';
import { TextoEnLinea } from '../Markdown';
import { recorridoDelEnlace, TEXTO_RECORRIDO } from '../recursos';
import { useActividad } from './hooks';
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';

const ESPERA_MS = { recorriendo: 2500, abierto: 4000, hecho: 15000, viejo: 15000, cerrado: 20000, sin_enlace: 60000 };

// El Blender del alumno, preguntado de a una vez (se pausa con la pestaña oculta).
function useRecorridoVivo(token) {
  const [enlace, setEnlace] = useState(null);
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
      const nuevo = r.ok ? recorridoDelEnlace(r.datos) : { estado: 'sin_enlace', vivo: null };
      setEnlace(nuevo);
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
  return { enlace, refrescar: () => refrescar.current() };
}

// Las tres etapas de la conexión: instalar, vincular y recorrer.
function Etapas({ estado, usuario }) {
  const conectado = ['abierto', 'recorriendo', 'hecho', 'viejo'].includes(estado);
  const etapas = [
    { titulo: 'Instala Amatista Motor', hecha: conectado, texto: 'Una vez, desde Mi Blender.' },
    { titulo: 'Vincula tu cuenta', hecha: conectado && Boolean(usuario), texto: 'Un código de 6 letras.' },
    { titulo: 'Recorre Blender', hecha: estado === 'hecho', texto: 'Diez paradas cortas.' },
  ];
  return (
    <ol className="grid gap-2 sm:grid-cols-3">
      {etapas.map((e, i) => (
        <li
          key={e.titulo}
          className={`corte-poly-sm flex items-center gap-3 border px-3 py-2.5 ${e.hecha ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-white/10 bg-base/50'}`}
        >
          <span className={`hexagono grid h-7 w-8 shrink-0 place-items-center font-mono text-xs font-extrabold ${e.hecha ? 'bg-emerald-400 text-base' : 'bg-white/10 text-white/70'}`}>
            {e.hecha ? '✓' : i + 1}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-white">{e.titulo}</span>
            <span className="block text-xs text-texto/60">{e.texto}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

// Lo mismo que muestra la pestaña Amatista de Blender en este momento.
function Espejo({ vivo }) {
  return (
    <div className="recorrido-vivo corte-poly mt-4 border border-neon/30 bg-gradient-to-br from-neon/10 via-superficie to-superficie p-4">
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
      {vivo.texto && <p className="mt-1 text-texto/80">{vivo.texto}</p>}
      {vivo.hacer && (
        <p className="corte-poly-sm mt-3 flex flex-wrap items-center gap-2 bg-base/70 px-3 py-2 text-sm text-white">
          <span className="font-mono text-[10px] uppercase tracking-widest text-amatista-claro">Qué hacer</span>
          <TextoEnLinea texto={vivo.hacer} />
          {vivo.teclas.map((t, i) => (
            <kbd key={`${t}-${i}`} className="rounded border border-white/25 bg-base px-1.5 py-0.5 font-mono text-[11px]">
              {t}
            </kbd>
          ))}
        </p>
      )}
    </div>
  );
}

function RecorridoBlender({ bloque, alCompletar, resuelta }) {
  const { token, usuario } = useAuth();
  const { resultado, resolver } = useActividad(alCompletar);
  const { enlace, refrescar } = useRecorridoVivo(usuario ? token : null);
  const [aviso, avisar] = useAvisoTemporal();
  const [enviando, setEnviando] = useState(false);
  const estado = enlace?.estado ?? (usuario ? 'cargando' : 'sin_cuenta');
  const hecho = estado === 'hecho';

  useEffect(() => {
    if (hecho && !resultado) resolver(true, 1);
    // resolver es estable para lo que importa: se resuelve una sola vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hecho]);

  const ordenar = async (accion) => {
    setEnviando(true);
    const r = await ordenarRecorrido(token, accion);
    setEnviando(false);
    if (!r.ok) avisar(r.error || 'No se pudo avisar a tu Blender.');
    else if (r.datos?.entregada === false) avisar('Tu Blender no está abierto: ábrelo y vuelve a intentarlo.');
    else avisar(accion === 'empezar' ? 'Enviado: mira tu Blender.' : 'Enviado a tu Blender.');
    refrescar();
  };

  let retro = null;
  if (resultado?.correcto && hecho) retro = { tipo: 'bien', texto: '¡Primeros pasos en Blender terminados! Ya sabes dónde está cada cosa.' };
  else if (resultado) retro = { tipo: 'info', titulo: 'Pendiente en Blender', texto: 'Cuando abras Blender, la pestaña Amatista te ofrecerá los primeros pasos.' };

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.title} resultado={resultado} resuelta={resuelta}>
      {bloque.text && (
        <p className="mb-4 leading-relaxed text-texto/85">
          <TextoEnLinea texto={bloque.text} />
        </p>
      )}
      <Etapas estado={estado} usuario={usuario} />

      {usuario && enlace && (
        <p className={`mt-4 text-sm ${hecho ? 'text-emerald-300' : 'text-texto/80'}`} aria-live="polite">
          {TEXTO_RECORRIDO[estado]}
        </p>
      )}
      {usuario && !enlace && <p className="mt-4 text-sm text-white/50">Buscando tu Blender…</p>}

      {enlace?.vivo && (estado === 'recorriendo' || hecho) && <Espejo vivo={enlace.vivo} />}

      {usuario && ['abierto', 'recorriendo', 'hecho'].includes(estado) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {estado !== 'recorriendo' && (
            <button type="button" disabled={enviando} onClick={() => ordenar('empezar')} className={BOTON_PRINCIPAL}>
              {hecho ? 'Repetir en Blender' : 'Empezar en Blender ▶'}
            </button>
          )}
          {estado === 'recorriendo' && (
            <>
              <button type="button" disabled={enviando || enlace.vivo?.paso === 0} onClick={() => ordenar('anterior')} className={BOTON_SECUNDARIO}>
                ◂ Paso anterior
              </button>
              <button type="button" disabled={enviando} onClick={() => ordenar('siguiente')} className={BOTON_PRINCIPAL}>
                Siguiente paso ▸
              </button>
            </>
          )}
        </div>
      )}
      {aviso && (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-neon" role="status">
          {aviso}
        </p>
      )}

      {!usuario && (
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={rutaEntrar(window.location.hash)} className={BOTON_PRINCIPAL}>
            Entra para conectar Blender
          </a>
          <a href={rutas.blender} className={BOTON_SECUNDARIO}>
            Cómo instalar Amatista en Blender
          </a>
        </div>
      )}
      {usuario && ['cerrado', 'sin_enlace', 'viejo'].includes(estado) && <PrepararBlender token={token} />}
      {bloque.allowManual !== false && !resultado && !resuelta && !hecho && (
        <button type="button" onClick={() => resolver(false, 1)} className={`${BOTON_SECUNDARIO} mt-4`}>
          Ahora no tengo Blender: lo haré después
        </button>
      )}
      <Retroalimentacion retro={retro} />
    </MarcoActividad>
  );
}

export default RecorridoBlender;
