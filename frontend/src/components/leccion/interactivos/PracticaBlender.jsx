import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../auth/contexto';
import { pasosConEstado, textoAutonomia } from '../../../blender/logica';
import PrepararBlender from '../../../blender/PrepararBlender';
import { IconoGuia } from '../../etiquetas/IconosEtiqueta';
import { rutaEntrar, rutas } from '../../../rutas';
import { abrirPractica, obtenerPractica, progresoPractica } from '../../../services/blender';
import { TextoEnLinea } from '../Markdown';
import { useActividad } from './hooks';
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';
import ModeloReferencia from './ModeloReferencia';

// Cada cuánto se pregunta al servidor por el avance mientras la lección está abierta.
const INTERVALO_MS = 6000;

const ICONOS_PASO = {
  completado: { icono: '✓', clase: 'bg-emerald-400 text-base' },
  actual: { icono: '●', clase: 'bg-neon text-base animar-pulso' },
  pendiente: { icono: '', clase: 'bg-white/10 text-white/40' },
};

function Pasos({ pasos }) {
  return (
    <ol className="grid gap-2">
      {pasos.map((paso, i) => {
        const estilo = ICONOS_PASO[paso.estado];
        return (
          <li
            key={paso.id}
            className={`corte-poly-sm flex items-center gap-3 px-3 py-2.5 transition-colors ${
              paso.estado === 'actual' ? 'border border-neon/40 bg-neon/5' : 'bg-base/50'
            }`}
          >
            <span className={`hexagono grid h-7 w-7 shrink-0 place-items-center text-xs font-extrabold ${estilo.clase}`}>
              {estilo.icono || i + 1}
            </span>
            <span className={paso.estado === 'completado' ? 'text-white/60 line-through decoration-emerald-400/50' : 'text-texto'}>
              {paso.titulo}
            </span>
            {paso.estado === 'actual' && (
              <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-neon">Ahora</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// Práctica del motor Amatista dentro de Blender: el cierre de cada módulo
// (v3.1). El alumno prepara Blender aquí mismo (sin ir a otra página), la
// abre, trabaja en Blender acompañado por la guía paso a paso del add-on y
// esta tarjeta muestra su avance real (lo calcula el servidor con la foto de
// la escena). Se resuelve al completarla.
function PracticaBlender({ bloque, alCompletar, resuelta }) {
  const { token, usuario } = useAuth();
  const { resultado, resolver } = useActividad(alCompletar);
  const [practica, setPractica] = useState(null);
  const [progreso, setProgreso] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [abriendo, setAbriendo] = useState(false);
  const resolverRef = useRef(resolver);
  useEffect(() => {
    resolverRef.current = resolver;
  });

  // Definición (pasos con su id) y avance guardado.
  useEffect(() => {
    if (!token) return undefined;
    let vigente = true;
    obtenerPractica(token, bloque.practica).then((r) => {
      if (!vigente || !r.ok) return;
      setPractica(r.datos);
      setProgreso(r.datos.mi_progreso);
    });
    return () => {
      vigente = false;
    };
  }, [token, bloque.practica]);

  // Mientras la pestaña está visible y la práctica sigue abierta, se consulta el avance.
  const completa = Boolean(progreso?.completada);
  const empezada = Boolean(progreso);
  useEffect(() => {
    if (!token || completa || !empezada) return undefined;
    const temporizador = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      const r = await progresoPractica(token, bloque.practica);
      const fila = r.ok ? r.datos?.practicas?.[0] : null;
      if (fila) setProgreso(fila);
    }, INTERVALO_MS);
    return () => clearInterval(temporizador);
  }, [token, completa, empezada, bloque.practica]);

  useEffect(() => {
    if (completa) resolverRef.current(true, 1);
  }, [completa]);

  const abrir = async () => {
    setAbriendo(true);
    const r = await abrirPractica(token, bloque.practica);
    setAbriendo(false);
    if (r.ok) {
      setProgreso(r.datos);
      setAviso({
        tipo: 'info',
        titulo: 'Lista en Blender',
        texto:
          'Abre Blender y pulsa N › pestaña Amatista: la práctica se abre sola y Amatista te guía paso a paso. Tu avance aparece aquí mientras trabajas.',
      });
    } else {
      setAviso({ tipo: 'mal', titulo: 'No se pudo abrir', texto: r.error });
    }
  };

  const pasos = pasosConEstado(practica?.pasos?.length ? practica.pasos : (bloque.steps ?? []), progreso);
  const avance = completa ? 100 : (progreso?.progreso ?? 0);
  const autonomia = textoAutonomia(progreso?.autonomia);

  let retro = aviso;
  if (completa) {
    retro = {
      tipo: 'bien',
      titulo: '¡Práctica completada en Blender!',
      texto: autonomia ? `${autonomia}.` : 'Tu avance quedó guardado en tu cuenta.',
    };
  } else if (resultado) {
    retro = { tipo: 'bien', titulo: 'Marcada como hecha', texto: 'Cuando instales el add-on, repítela para que cuente tu avance real.' };
  }

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.title} resultado={resultado} resuelta={resuelta}>
      {bloque.text && (
        <p className="leading-relaxed text-texto/85">
          <TextoEnLinea texto={bloque.text} />
        </p>
      )}

      <ModeloReferencia practicaId={bloque.practica} />

      <div className="corte-poly-sm mt-4 flex gap-3 border border-neon/20 bg-neon/5 p-3 text-sm text-texto/80">
        <IconoGuia className="mt-0.5 h-4 w-4 shrink-0 text-neon" />
        <p>
          <strong className="text-white">En Blender no estás solo:</strong> Amatista resalta el objeto que tienes que cambiar, te
          dice las teclas exactas, celebra cada paso y, si te atascas, te ofrece «Hazlo conmigo».
        </p>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_12rem]">
        <div>
          {pasos.length > 0 ? (
            <Pasos pasos={pasos} />
          ) : (
            <p className="text-sm text-white/50">Los pasos aparecen al abrir la práctica en Blender.</p>
          )}
        </div>
        <div className="corte-poly-sm flex flex-col items-center justify-center gap-2 border border-white/10 bg-base/60 p-4 text-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">Tu avance</span>
          <span className={`text-4xl font-extrabold tabular-nums ${completa ? 'text-emerald-300' : 'text-white'}`}>{avance}%</span>
          <div className="h-1.5 w-full overflow-hidden bg-white/10" aria-hidden="true">
            <div className={`h-full transition-[width] duration-700 ${completa ? 'bg-emerald-400' : 'bg-neon'}`} style={{ width: `${avance}%` }} />
          </div>
          {bloque.minutes && <span className="font-mono text-[10px] text-white/45">≈ {bloque.minutes} min</span>}
          {progreso?.version_blender && <span className="font-mono text-[10px] text-white/45">Blender {progreso.version_blender}</span>}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {usuario ? (
          !completa && (
            <button type="button" onClick={abrir} disabled={abriendo} className={BOTON_PRINCIPAL}>
              {abriendo ? 'Abriendo…' : empezada ? 'Continuar en Blender' : 'Abrir en Blender'}
            </button>
          )
        ) : (
          <a href={rutaEntrar(window.location.hash)} className={BOTON_PRINCIPAL}>
            Entra para registrar tu avance
          </a>
        )}
        {bloque.allowManual && !completa && !resultado && (
          <button type="button" onClick={() => resolver(true, 1)} className={BOTON_SECUNDARIO}>
            La hice sin el add-on
          </button>
        )}
      </div>
      {usuario && !completa && <PrepararBlender token={token} />}
      {!usuario && (
        <a href={rutas.blender} className={`${BOTON_SECUNDARIO} mt-3 inline-block`}>
          Cómo instalar Amatista en Blender
        </a>
      )}
      <Retroalimentacion retro={retro} />
    </MarcoActividad>
  );
}

export default PracticaBlender;
