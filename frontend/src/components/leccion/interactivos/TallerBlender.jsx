// Amatista Taller (motor 5) dentro de la lección: la habilidad es la unidad y cada una pasa por
// Mira → Hazlo conmigo → Hazlo tú → Úsalo → Recuérdalo. El modelo del alumno (en el servidor)
// decide en qué paso está cada quien; Blender hace el trabajo y esta tarjeta muestra el plan,
// lo que pasa en Blender en vivo y los botones que tienen sentido en ese momento (tres como
// máximo). Bloque: {"type": "blender_taller", "taller": "blender.bp.m1", "title"?, "vista"?}.
//   vista «taller» (por defecto): el taller del módulo; se resuelve cuando se abre el proyecto.
//   vista «proyecto»: tarjeta corta en la lección del proyecto (la pieza de la isla y el reto).
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../auth/contexto';
import PrepararBlender from '../../../blender/PrepararBlender';
import {
  anchoDominio,
  CICLO,
  controlesTaller,
  ESTADOS_PIEZA,
  estadoProyecto,
  habilidadesConVivo,
  habilidadesParaProbar,
  nombreTipo,
  ordenReto,
  pasoDelCiclo,
  repasosDelPlan,
  tallerNoDisponible,
  tallerResuelto,
  textoFase,
  textoOrden,
  unirConY,
} from '../../../blender/taller';
import { useAvisoTemporal, useEnlaceTaller, usePlanTaller } from '../../../blender/useTaller';
import { useCatalogo } from '../../../catalogo/contexto';
import { ubicarTaller } from '../../../modulos/practica';
import { useProgreso } from '../../../progreso/contexto';
import { estaCompletada, estaDesbloqueada } from '../../../progreso/reglas';
import { rutaEntrar, rutas } from '../../../rutas';
import { ordenarTaller } from '../../../services/blender';
import { IconoGuia } from '../../etiquetas/IconosEtiqueta';
import { TextoEnLinea } from '../Markdown';
import { useActividad } from './hooks';
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';

const ESTILO_FASE = {
  nueva: { texto: 'text-white/55', barra: 'bg-white/35' },
  acompanada: { texto: 'text-amber-200', barra: 'bg-amber-300' },
  sola: { texto: 'text-neon', barra: 'bg-neon' },
  dominada: { texto: 'text-emerald-300', barra: 'bg-emerald-400' },
};

const ESTILO_PIEZA = {
  llena: 'bg-emerald-400/15 text-emerald-300',
  casi: 'bg-amber-400/15 text-amber-200',
  equivocada: 'bg-rose-400/15 text-rose-200',
  vacia: 'bg-white/5 text-white/60',
};

const TEXTO_ESTADO_VIVO = {
  mirando: 'Mira tu vista 3D: Amatista lo está haciendo, con las teclas en pantalla.',
  pausa: 'En pausa. Cuando quieras, sigue donde quedaste.',
  lograda: '¡Lograda! Sigue con la siguiente cuando quieras.',
};

const BOTON_CHIP =
  'corte-poly-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors disabled:opacity-50';

function Teclas({ teclas }) {
  if (!teclas?.length) return null;
  return (
    <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
      {teclas.map((tecla, i) => (
        <kbd key={`${tecla}-${i}`} className="rounded border border-white/20 bg-base/80 px-1.5 py-0.5 font-mono text-[11px] text-white">
          {tecla}
        </kbd>
      ))}
    </span>
  );
}

// La leyenda del ciclo: una línea por paso y el paso en que va el alumno resaltado.
function Ciclo({ actual }) {
  return (
    <ol className="grid gap-1.5" aria-label="Cómo aprendes cada habilidad">
      {CICLO.map((paso, i) => {
        const ahora = paso.id === actual;
        return (
          <li
            key={paso.id}
            aria-current={ahora ? 'step' : undefined}
            className={`corte-poly-sm flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
              ahora ? 'border border-neon/40 bg-neon/5' : 'bg-base/50'
            }`}
          >
            <span
              className={`hexagono grid h-6 w-7 shrink-0 place-items-center font-mono text-[11px] font-extrabold ${
                ahora ? 'bg-neon text-base' : 'bg-white/10 text-white/55'
              }`}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <strong className={ahora ? 'text-white' : 'text-texto/90'}>{paso.nombre}</strong>
              <span className="text-texto/60"> · {paso.texto}</span>
            </span>
            {ahora && <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-neon">Ahora</span>}
          </li>
        );
      })}
    </ol>
  );
}

// Una tarjeta por habilidad: su nombre, la fase en palabras y una barra de dominio (sin números).
function Habilidades({ lista, actual }) {
  if (!lista.length) return null;
  return (
    <section className="mt-5" aria-labelledby="taller-habilidades">
      <h4 id="taller-habilidades" className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-white/55">
        Tus habilidades del taller
      </h4>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((h) => {
          const estilo = ESTILO_FASE[h.fase] ?? ESTILO_FASE.nueva;
          const ahora = h.id === actual;
          return (
            <li
              key={h.id}
              title={h.que || undefined}
              className={`corte-poly-sm border p-3 transition-colors ${ahora ? 'border-neon/45 bg-neon/5' : 'border-white/10 bg-base/60'}`}
            >
              <p className="flex items-start justify-between gap-2">
                <span className="font-bold leading-snug text-white">{h.titulo}</span>
                {h.lista && (
                  <span className="hexagono grid h-5 w-6 shrink-0 place-items-center bg-emerald-400 text-[10px] font-extrabold text-base">
                    ✓<span className="sr-only"> lista</span>
                  </span>
                )}
              </p>
              <p className={`mt-1 font-mono text-[10px] uppercase tracking-widest ${estilo.texto}`}>
                {textoFase(h.fase)}
                {ahora && <span className="text-neon"> · ahora</span>}
                {h.repaso_vencido && <span className="text-amatista-claro"> · toca recordarla</span>}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden bg-white/10" aria-hidden="true">
                <div className={`h-full transition-[width] duration-700 ${estilo.barra}`} style={{ width: `${anchoDominio(h.p)}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Lo que toca ahora (del plan o de Blender en vivo), con lo que pasa en la vista 3D.
function Ahora({ actividad, vivo, enlace }) {
  if (!actividad) return null;
  const numero = actividad.numero && actividad.de > 1 ? ` · ${actividad.numero} de ${actividad.de}` : '';
  const enBlender = enlace?.estado === 'aqui' && vivo;
  return (
    <div key={actividad.id} className="corte-poly-sm animar-entrar mt-4 border border-neon/25 bg-neon/5 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-neon">
        {enBlender ? 'Ahora en tu Blender' : 'Lo que sigue'} · {nombreTipo(actividad)}
        {numero}
      </p>
      {actividad.titulo && <p className="mt-1 text-lg font-bold leading-snug text-white">{actividad.titulo}</p>}
      {actividad.pide && <p className="mt-1 leading-relaxed text-texto/85">{actividad.pide}</p>}
      {!enBlender && actividad.minutos > 0 && (
        <p className="mt-1 font-mono text-[11px] text-white/45">≈ {actividad.minutos} min</p>
      )}
      {enBlender && <EnVivo vivo={vivo} />}
    </div>
  );
}

function EnVivo({ vivo }) {
  const porcentaje = vivo.total ? Math.round((100 * Math.min(vivo.llenas, vivo.total)) / vivo.total) : 0;
  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      {TEXTO_ESTADO_VIVO[vivo.estado] && (
        <p className={`text-sm ${vivo.estado === 'lograda' ? 'text-emerald-300' : 'text-amber-200'}`}>{TEXTO_ESTADO_VIVO[vivo.estado]}</p>
      )}
      {vivo.total > 0 && (
        <div className="mt-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">
            {vivo.llenas} de {vivo.total} {vivo.total === 1 ? 'pieza' : 'piezas'}
          </p>
          <div className="mt-1 h-1.5 overflow-hidden bg-white/10" aria-hidden="true">
            <div className="h-full bg-emerald-400 transition-[width] duration-500" style={{ width: `${porcentaje}%` }} />
          </div>
        </div>
      )}
      {vivo.pieza && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-texto/85">
          <strong className="text-white">{vivo.pieza.nombre}</strong>
          <span className={`corte-poly-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${ESTILO_PIEZA[vivo.pieza.estado]}`}>
            {ESTADOS_PIEZA[vivo.pieza.estado]}
          </span>
          {vivo.pieza.mensaje && <span>{vivo.pieza.mensaje}</span>}
        </p>
      )}
      {vivo.mensaje && vivo.mensaje !== vivo.pieza?.mensaje && <p className="mt-2 text-sm leading-relaxed text-texto/85">{vivo.mensaje}</p>}
      {vivo.pista && (
        <div className="corte-poly-sm animar-entrar mt-3 border-l-4 border-amber-300/70 bg-amber-300/5 p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-200">
            Pista {vivo.pista.nivel}{vivo.pista.titulo ? ` · ${vivo.pista.titulo}` : ''}
          </p>
          {vivo.pista.texto && <p className="mt-1 text-sm leading-relaxed text-texto/90">{vivo.pista.texto}</p>}
          <Teclas teclas={vivo.pista.teclas} />
        </div>
      )}
    </div>
  );
}

// El estado del Blender del alumno en una línea (como en las prácticas).
function LineaBlender({ enlace, aviso }) {
  if (!enlace || enlace.estado === 'sin_enlace') {
    return aviso ? (
      <p className="mt-3 font-mono text-[11px] text-neon" role="status">
        {aviso}
      </p>
    ) : null;
  }
  const color = enlace.estado === 'cerrado' ? 'bg-white/30' : 'bg-emerald-400 animar-pulso';
  return (
    <div className="corte-poly-sm mt-3 flex flex-wrap items-center gap-3 border border-white/10 bg-base/60 px-3 py-2 text-sm">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} aria-hidden="true" />
      <span className="text-texto/85">{enlace.texto}</span>
      {aviso && (
        <span className="font-mono text-[11px] text-neon" role="status">
          {aviso}
        </span>
      )}
    </div>
  );
}

// Abierto el proyecto: un enlace claro a su lección (y qué falta antes, si falta algo).
function IrAlProyecto({ tallerId }) {
  const { cursos } = useCatalogo();
  const { progreso } = useProgreso();
  const ubicacion = ubicarTaller(cursos, tallerId);
  if (!ubicacion?.leccionProyecto) return null;
  const { curso, modulo, leccionTaller, leccionProyecto, indiceProyecto, indiceTaller } = ubicacion;
  const lecciones = modulo.contenido?.lessons ?? [];
  const abierta = estaDesbloqueada(progreso, curso.id, modulo, indiceProyecto);
  // Lo que falta para llegar: esta lección (si no se completó) y la teoría de en medio.
  const antes = [
    ...(estaCompletada(progreso, curso.id, leccionTaller) ? [] : ['esta lección']),
    ...lecciones
      .slice(indiceTaller + 1, indiceProyecto)
      .filter((leccion) => !estaCompletada(progreso, curso.id, leccion))
      .map((leccion) => `«${leccion.title}»`),
  ];
  return (
    <div className="corte-poly-sm animar-entrar mt-5 flex flex-col gap-3 border border-emerald-400/35 bg-emerald-400/5 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">Úsalo · el proyecto está abierto</p>
        <p className="mt-1 font-bold text-white">{leccionProyecto.title}</p>
        <p className="mt-0.5 text-sm text-texto/75">
          {abierta || !antes.length
            ? 'Junta lo que aprendiste en una pieza con propósito: queda en tu isla.'
            : `Antes: completa ${unirConY(antes)}.`}
        </p>
      </div>
      <a href={rutas.leccion(curso.id, leccionProyecto.id)} className={`${BOTON_PRINCIPAL} shrink-0 text-center`}>
        Ir al proyecto ▶
      </a>
    </div>
  );
}

function TallerHabilidades({ bloque, alCompletar, resuelta }) {
  const { token, usuario } = useAuth();
  const { resultado, resolver } = useActividad(alCompletar);
  const { plan, respuesta, recargar } = usePlanTaller(usuario ? token : null, bloque.taller);
  const { enlace, refrescar } = useEnlaceTaller(usuario ? token : null, bloque.taller);
  const [aviso, avisar] = useAvisoTemporal();
  const [enviando, setEnviando] = useState(false);
  const resolverRef = useRef(resolver);
  useEffect(() => {
    resolverRef.current = resolver;
  });

  const vivo = enlace?.estado === 'aqui' ? enlace.vivo : null;
  const abierto = tallerResuelto(plan, vivo);

  // Cuando Blender avanza (otra actividad, otra pieza, lograda), el plan se vuelve a pedir.
  const claveVivo = vivo ? [vivo.actividad?.id, vivo.estado, vivo.llenas, vivo.proyectoAbierto].join('|') : '';
  useEffect(() => {
    if (claveVivo) recargar();
  }, [claveVivo, recargar]);

  // Se resuelve al abrirse el proyecto. Al volver a una lección ya resuelta no se celebra otra vez.
  useEffect(() => {
    if (abierto && !resuelta) resolverRef.current(true, 1);
  }, [abierto, resuelta]);

  const ordenar = async (tipo, extra = {}) => {
    if (enviando) return;
    setEnviando(true);
    const r = await ordenarTaller(token, tipo, { taller: bloque.taller, ...extra });
    setEnviando(false);
    avisar(textoOrden(r));
    if (r.ok && r.datos?.entregada) {
      refrescar();
      recargar();
    }
  };

  const noDisponible = tallerNoDisponible(respuesta) && !plan;
  const paso = pasoDelCiclo(plan, vivo);
  const actividad = vivo?.actividad ?? plan?.actual ?? null;
  const habilidades = habilidadesConVivo(plan?.habilidades, vivo?.habilidades);
  // Sin nada que hacer en el taller (terminado) no hay botones de Blender: solo los repasos.
  const controles = plan && actividad ? controlesTaller(plan, enlace) : [];
  const probar = habilidadesParaProbar(plan);
  const repasos = repasosDelPlan(plan, vivo);

  let retro = null;
  if (abierto) {
    retro = {
      tipo: 'bien',
      titulo: '¡Tus habilidades del taller ya te salen!',
      texto: 'Se abrió el proyecto del módulo: lo que armes ahí queda en tu isla.',
    };
  } else if (resultado) {
    retro = { tipo: 'bien', titulo: 'Marcado como hecho', texto: 'Cuando el taller esté en el servidor, vuelve para que cuente tu avance real.' };
  }

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.title ?? plan?.titulo} resultado={resultado} resuelta={resuelta}>
      {bloque.text && (
        <p className="mb-4 leading-relaxed text-texto/85">
          <TextoEnLinea texto={bloque.text} />
        </p>
      )}

      <Ciclo actual={paso} />

      {usuario && !plan && !noDisponible && (
        <p className="mt-4 text-sm text-white/55" role="status">
          {respuesta && !respuesta.ok ? `No pudimos traer tu taller: ${respuesta.error}` : 'Preparando tu taller…'}
        </p>
      )}

      {noDisponible && (
        <div className="corte-poly-sm mt-4 border border-amber-300/30 bg-amber-300/5 p-4 text-sm text-texto/85">
          <p>
            <strong className="text-white">El taller todavía no está en el servidor.</strong> Puedes seguir con el módulo: cuando
            llegue, vuelve aquí para aprender cada habilidad en Blender.
          </p>
          {!resultado && !resuelta && (
            <button type="button" onClick={() => resolver(true, 1)} className={`${BOTON_SECUNDARIO} mt-3`}>
              Seguir sin el taller
            </button>
          )}
        </div>
      )}

      {plan && (
        <>
          <Ahora actividad={actividad} vivo={vivo} enlace={enlace} />
          {!actividad && plan.completo && (
            <p className="mt-4 text-sm text-emerald-200/90">Terminaste este taller: proyecto hecho y habilidades listas.</p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            {controles.map((control, i) => (
              <button
                key={control.tipo}
                type="button"
                disabled={enviando}
                onClick={() => ordenar(control.tipo)}
                className={i === 0 ? BOTON_PRINCIPAL : BOTON_SECUNDARIO}
              >
                {control.texto}
              </button>
            ))}
          </div>
          <LineaBlender enlace={enlace} aviso={aviso} />

          {(probar.length > 0 || repasos.length > 0) && (
            <div className="mt-4 grid gap-3">
              {probar.length > 0 && (
                <details className="corte-poly-sm border border-white/10 bg-base/60 p-3">
                  <summary className="cursor-pointer font-bold text-white">¿Ya sabes esto? Demuéstralo</summary>
                  <p className="mt-2 text-sm text-texto/75">
                    Elige una habilidad: Amatista te pone un reto corto, sin ayuda. Si te sale dos veces, te saltas su guía.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {probar.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        disabled={enviando}
                        onClick={() => ordenar('taller_probar', { habilidad: h.id })}
                        className={`${BOTON_CHIP} border-white/15 bg-base/70 text-texto hover:border-neon/60 hover:text-neon`}
                      >
                        {h.titulo}
                      </button>
                    ))}
                  </div>
                </details>
              )}
              {repasos.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-amatista-claro">Recuérdalo · 1 min</span>
                  {repasos.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      disabled={enviando}
                      onClick={() => ordenar('taller_repaso', { habilidad: r.id })}
                      className={`${BOTON_CHIP} border-amatista/40 bg-amatista/10 text-amatista-claro hover:border-amatista hover:text-white`}
                    >
                      {r.titulo}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Habilidades lista={habilidades} actual={actividad?.habilidad} />
          {abierto && <IrAlProyecto tallerId={bloque.taller} />}
        </>
      )}

      {!usuario && (
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={rutaEntrar(window.location.hash)} className={BOTON_PRINCIPAL}>
            Entra para registrar tu avance
          </a>
          <a href={rutas.blender} className={BOTON_SECUNDARIO}>
            Cómo instalar Amatista en Blender
          </a>
        </div>
      )}

      {usuario && !abierto && (
        <div className="corte-poly-sm mt-5 flex gap-3 border border-neon/20 bg-neon/5 p-3 text-sm text-texto/80">
          <IconoGuia className="mt-0.5 h-4 w-4 shrink-0 text-neon" />
          <p>
            <strong className="text-white">Las teclas no se dictan:</strong> primero lo intentas. Si te atascas, pide una pista; si
            no alcanza, «Mírame» te lo muestra otra vez. Amatista nunca hace el paso por ti.
          </p>
        </div>
      )}
      {usuario && bloque.allowManual && !abierto && !resultado && !resuelta && !noDisponible && (
        <button type="button" onClick={() => resolver(true, 1)} className={`${BOTON_SECUNDARIO} mt-3`}>
          Lo hice sin el add-on
        </button>
      )}
      {usuario && !abierto && <PrepararBlender token={token} />}
      <Retroalimentacion retro={retro} />
    </MarcoActividad>
  );
}

// La pieza de la isla en pequeño: hexágono con el color del taller; lleno si el proyecto está
// hecho y con una estrella si además salió el reto.
function PiezaIsla({ color, hecho, estrella }) {
  return (
    <svg viewBox="0 0 48 44" className="h-12 w-14 shrink-0" aria-hidden="true">
      <polygon
        points="12,2 36,2 47,22 36,42 12,42 1,22"
        fill={hecho ? color : 'none'}
        fillOpacity={hecho ? 0.9 : 0}
        stroke={color}
        strokeWidth="2"
        strokeDasharray={hecho ? undefined : '4 3'}
      />
      {estrella && (
        <polygon
          points="24,11 26.9,18.3 34.5,18.6 28.6,23.4 30.6,30.9 24,26.6 17.4,30.9 19.4,23.4 13.5,18.6 21.1,18.3"
          fill="#fcd34d"
          className="animar-aparecer"
        />
      )}
    </svg>
  );
}

const TEXTO_PROYECTO = {
  hecho: 'Hecho: ya está en tu isla.',
  abierto: 'Abierto: ármalo en Blender con la práctica de esta lección.',
  cerrado: (plan) =>
    `Se abre cuando las habilidades del taller te salgan solas (${Math.min(plan.listas ?? 0, plan.total ?? 0)} de ${plan.total ?? 0}).`,
};

const TEXTO_RETO = {
  hecho: '¡Logrado, sin molde y sin ayuda!',
  disponible: 'Listo para ti: usa lo que aprendiste en algo tuyo, sin molde.',
  despues: 'Se abre cuando termines el proyecto.',
};

// Vista «proyecto»: la tarjeta corta de la lección del proyecto.
function ProyectoTaller({ bloque }) {
  const { token, usuario } = useAuth();
  const { plan, recargar } = usePlanTaller(usuario ? token : null, bloque.taller);
  const [aviso, avisar] = useAvisoTemporal();
  const { cursos } = useCatalogo();
  if (!plan) return null;
  const estado = estadoProyecto(plan);
  const isla = plan.isla ?? {};
  const color = /^#[0-9a-f]{3,6}$/i.test(isla.color ?? '') ? isla.color : '#9b59b6';
  const ubicacion = estado.proyecto === 'cerrado' ? ubicarTaller(cursos, bloque.taller) : null;

  const reto = async () => {
    const r = await ordenarTaller(token, 'taller_abrir', ordenReto(plan));
    avisar(textoOrden(r));
    if (r.ok) recargar();
  };

  return (
    <section
      aria-label={bloque.title ?? 'Tu pieza para la isla'}
      className="corte-poly-sm animar-entrar border border-blender/30 bg-gradient-to-r from-blender/10 via-superficie/95 to-superficie/95 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <PiezaIsla color={color} hecho={estado.proyecto === 'hecho'} estrella={estado.reto === 'hecho'} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blender">{bloque.title ?? 'Úsalo · tu isla'}</p>
          {isla.pieza && <p className="mt-0.5 text-lg font-extrabold text-white">{isla.pieza}</p>}
          {isla.texto && <p className="text-sm text-texto/75">{isla.texto}</p>}
          <dl className="mt-3 grid gap-1.5 text-sm">
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-mono text-[11px] uppercase tracking-widest text-white/50">Proyecto</dt>
              <dd className={estado.proyecto === 'hecho' ? 'text-emerald-300' : 'text-texto/85'}>
                {typeof TEXTO_PROYECTO[estado.proyecto] === 'function' ? TEXTO_PROYECTO[estado.proyecto](plan) : TEXTO_PROYECTO[estado.proyecto]}
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-mono text-[11px] uppercase tracking-widest text-white/50">Reto del módulo</dt>
              <dd className={estado.reto === 'hecho' ? 'text-amber-200' : 'text-texto/85'}>{TEXTO_RETO[estado.reto]}</dd>
            </div>
          </dl>
          {aviso && (
            <p className="mt-2 font-mono text-[11px] text-neon" role="status">
              {aviso}
            </p>
          )}
        </div>
        {estado.reto === 'disponible' && (
          <button type="button" onClick={reto} className={`${BOTON_PRINCIPAL} shrink-0`}>
            Hacer el reto en Blender
          </button>
        )}
        {ubicacion?.leccionTaller && (
          <a href={rutas.leccion(ubicacion.curso.id, ubicacion.leccionTaller.id)} className={`${BOTON_SECUNDARIO} shrink-0 text-center`}>
            Volver al taller
          </a>
        )}
      </div>
    </section>
  );
}

function TallerBlender({ bloque, alCompletar, resuelta }) {
  if (bloque.vista === 'proyecto') return <ProyectoTaller bloque={bloque} />;
  return <TallerHabilidades bloque={bloque} alCompletar={alCompletar} resuelta={resuelta} />;
}

export default TallerBlender;
