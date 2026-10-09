import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../auth/contexto';
import { controlesDisponibles, estadoBlender, instructorEnVivo, pasosConEstado, textoAutonomia } from '../../../blender/logica';
import PrepararBlender from '../../../blender/PrepararBlender';
import { IconoGuia } from '../../etiquetas/IconosEtiqueta';
import { rutaEntrar, rutas } from '../../../rutas';
import { abrirPractica, estadoEnlace, obtenerPractica, ordenarBlender, progresoPractica } from '../../../services/blender';
import { TextoEnLinea } from '../Markdown';
import { useActividad } from './hooks';
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';
import ModeloReferencia from './ModeloReferencia';

// Cada cuánto se pregunta al servidor por el avance mientras la lección está abierta.
const INTERVALO_MS = 6000;
// Con Blender en esta práctica, el instructor en vivo se refresca más seguido (el add-on late cada 5 s).
const INTERVALO_VIVO_MS = 3000;

const ICONOS_LISTA = {
  Bien: { icono: '✓', clase: 'text-emerald-300' },
  Detalle: { icono: '✦', clase: 'text-amber-300' },
};

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
// Motor 3.4: la plataforma ve el Blender del alumno en vivo y le puede pedir
// que enfoque (solo las herramientas de la práctica) o muestre todo.
// Motor 3.5: además muestra lo que dice el instructor en Blender (paso, mensaje y
// la lista comparada con el ejemplo resuelto) y maneja la práctica: comprobar,
// pista, «Hazlo conmigo», guardar, empezar de nuevo y ver el ejemplo en Blender.
function ListaFigura({ instructor }) {
  if (!instructor.lista.length) return null;
  const abiertas = instructor.lista.filter((i) => i.consejo).slice(0, 2);
  return (
    <div className="mt-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">
        Comparado con el ejemplo · {instructor.hechas} de {instructor.lista.length}
      </p>
      {instructor.aspectos.map((grupo) => (
        <div key={grupo.nombre} className="mt-1.5">
          <p className={`text-[11px] font-bold ${grupo.ok ? 'text-emerald-300/80' : 'text-white/70'}`}>{grupo.nombre}</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {grupo.items.map((item) => {
              const estilo = ICONOS_LISTA[item.estado] ?? { icono: '!', clase: 'text-rose-300' };
              return (
                <li key={item.texto} className="corte-poly-sm flex items-center gap-1.5 bg-base/70 px-2 py-1 text-xs">
                  <span className={`font-bold ${estilo.clase}`} aria-hidden="true">{estilo.icono}</span>
                  <span className="text-texto/90">{item.texto}</span>
                  <span className="sr-only">: {item.estado}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {abiertas.map((item) => (
        <p key={item.texto} className="mt-2 text-sm leading-relaxed text-texto/80">
          <strong className="text-white">{item.texto}:</strong> {item.consejo}
        </p>
      ))}
    </div>
  );
}

// Motor 3.5: el ejemplo resuelto de la práctica (lo que espera, paso a paso y en código) y qué revisa Amatista.
function EjemploResuelto({ ejemplo }) {
  const [codigo, setCodigo] = useState(false);
  if (!ejemplo?.pasos?.length) return null;
  return (
    <details className="corte-poly-sm mt-4 border border-white/10 bg-base/60 p-3">
      <summary className="cursor-pointer font-bold text-white">El ejemplo resuelto: {ejemplo.titulo}</summary>
      {ejemplo.descripcion && <p className="mt-2 text-sm leading-relaxed text-texto/85">{ejemplo.descripcion}</p>}
      <ol className="mt-2 grid list-decimal gap-1 pl-5 text-sm leading-relaxed text-texto/85">
        {ejemplo.pasos.map((paso) => (
          <li key={paso}>{paso}</li>
        ))}
      </ol>
      {ejemplo.revisa?.length > 0 && (
        <p className="mt-3 text-xs text-white/60">
          Amatista compara tu escena con este ejemplo en: <strong className="text-white/85">{ejemplo.revisa.join(' · ')}</strong>. Los
          nombres, el lugar, el tamaño y los colores son tuyos.
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setCodigo((v) => !v)}
          className="font-mono text-[11px] uppercase tracking-widest text-neon hover:underline"
        >
          {codigo ? 'Ocultar el código' : 'Ver en código'}
        </button>
        <span className="text-xs text-white/50">Con tu Blender en esta práctica, «Ver el ejemplo» lo arma ahí.</span>
      </div>
      {codigo && (
        <pre className="mt-2 max-h-72 overflow-auto bg-black/40 p-3 font-mono text-[11px] leading-snug text-texto/80">
          {JSON.stringify(ejemplo.codigo, null, 1)}
        </pre>
      )}
    </details>
  );
}

// Motor 3.5: lo que dice el instructor en Blender, aquí mismo, y los botones para manejar la práctica.
function InstructorEnVivo({ instructor, ordenar, enviando }) {
  const controles = controlesDisponibles(instructor);
  const pedir = (control) => {
    if (control.confirmar && !window.confirm(control.confirmar)) return;
    ordenar(control.tipo, { confirmar: Boolean(control.confirmar) });
  };
  return (
    <div className="corte-poly-sm mt-3 border border-neon/25 bg-neon/5 p-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-neon">
        Ahora en Blender{instructor.paso ? ` · ${instructor.paso}` : ''}{instructor.modo ? ` · ${instructor.modo}` : ''}
      </p>
      {instructor.viendoEjemplo && (
        <p className="mt-1 text-sm text-amber-200">Tu Blender muestra el ejemplo resuelto en su propia escena: nada de ahí cuenta para tu práctica.</p>
      )}
      {instructor.titulo && <p className="mt-1 font-bold text-white">{instructor.titulo}</p>}
      {instructor.mensaje && <p className="mt-1 text-sm leading-relaxed text-texto/85">{instructor.mensaje}</p>}
      <ListaFigura instructor={instructor} />
      <div className="mt-3 flex flex-wrap gap-2">
        {controles.map((control) => (
          <button
            key={control.tipo}
            type="button"
            disabled={enviando}
            onClick={() => pedir(control)}
            className="corte-poly-sm border border-white/15 bg-base/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-texto hover:border-neon/60 hover:text-neon disabled:opacity-50"
          >
            {control.texto}
          </button>
        ))}
      </div>
    </div>
  );
}

function BlenderEnVivo({ enlace, token, practicaId }) {
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState('');
  const { estado, blender, texto } = estadoBlender(enlace, practicaId);
  if (estado === 'sin_enlace') return null;
  const ordenar = async (tipo, opciones = {}) => {
    setEnviando(true);
    const r = await ordenarBlender(token, tipo, tipo === 'abrir_practica' || estado === 'aqui' ? practicaId : undefined, opciones);
    setEnviando(false);
    setAviso(r.ok && r.datos?.entregada ? 'Enviado a tu Blender.' : r.ok ? 'Tu Blender no respondió: ¿sigue abierto?' : r.error);
    setTimeout(() => setAviso(''), 4000);
  };
  const color = estado === 'cerrado' ? 'bg-white/30' : 'bg-emerald-400 animar-pulso';
  const instructor = estado === 'aqui' ? instructorEnVivo(blender) : null;
  return (
    <div className="mt-4">
      <div className="corte-poly-sm flex flex-wrap items-center gap-3 border border-white/10 bg-base/60 px-3 py-2 text-sm">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} aria-hidden="true" />
        <span className="text-texto/85">{texto}</span>
        {aviso && <span className="font-mono text-[11px] text-neon" role="status">{aviso}</span>}
        {estado === 'aqui' && (
          <button
            type="button"
            disabled={enviando}
            onClick={() => ordenar(blender.enfocado ? 'ver_todo' : 'enfocar')}
            className="ml-auto font-mono text-[11px] uppercase tracking-widest text-neon hover:underline disabled:opacity-50"
          >
            {blender.enfocado ? 'Ver todo Blender' : 'Enfocar Blender'}
          </button>
        )}
        {estado === 'otra' && (
          <button
            type="button"
            disabled={enviando}
            onClick={() => ordenar('abrir_practica')}
            className="ml-auto font-mono text-[11px] uppercase tracking-widest text-neon hover:underline disabled:opacity-50"
          >
            Cambiar a esta práctica
          </button>
        )}
      </div>
      {instructor && <InstructorEnVivo instructor={instructor} ordenar={ordenar} enviando={enviando} />}
    </div>
  );
}

function PracticaBlender({ bloque, alCompletar, resuelta }) {
  const { token, usuario } = useAuth();
  const { resultado, resolver } = useActividad(alCompletar);
  const [practica, setPractica] = useState(null);
  const [progreso, setProgreso] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [abriendo, setAbriendo] = useState(false);
  const [enlace, setEnlace] = useState(null);
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

  // Blender en vivo: si está abierto, en qué práctica y paso va (el add-on late cada 5 s).
  const enVivoAqui = estadoBlender(enlace, bloque.practica).estado === 'aqui';
  useEffect(() => {
    if (!token) return undefined;
    let vigente = true;
    const consultar = async () => {
      if (document.visibilityState !== 'visible') return;
      const r = await estadoEnlace(token);
      if (vigente && r.ok) setEnlace(r.datos);
    };
    consultar();
    const temporizador = setInterval(consultar, enVivoAqui ? INTERVALO_VIVO_MS : INTERVALO_MS);
    return () => {
      vigente = false;
      clearInterval(temporizador);
    };
  }, [token, enVivoAqui]);

  const abrir = async () => {
    setAbriendo(true);
    const r = await abrirPractica(token, bloque.practica);
    setAbriendo(false);
    if (r.ok) {
      const { abierta_en_blender: enVivo, ...fila } = r.datos;
      setProgreso(fila);
      setAviso(
        enVivo
          ? {
              tipo: 'info',
              titulo: 'Abriendo en tu Blender',
              texto: 'Mira tu Blender: la práctica se abre ahí en unos segundos y Amatista te guía paso a paso. Tu avance aparece aquí mientras trabajas.',
            }
          : {
              tipo: 'info',
              titulo: 'Lista en Blender',
              texto:
                'Abre Blender y pulsa N › pestaña Amatista: la práctica se abre sola y Amatista te guía paso a paso. Tu avance aparece aquí mientras trabajas.',
            },
      );
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
      <EjemploResuelto ejemplo={practica?.ejemplo} />

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
      {usuario && !completa && <BlenderEnVivo enlace={enlace} token={token} practicaId={bloque.practica} />}
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
