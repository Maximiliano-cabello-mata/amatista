// «Cómo se unen la plataforma y Blender»: la tarjeta que explica, paso a paso, cómo trabajan juntas la
// plataforma y Amatista Motor (el add-on). Vive arriba de #/blender y en la Ayuda (#/guia).
// `progreso` (opcional) marca lo que el alumno ya tiene: {instalado, vinculado, abierto}.
// `resumida`: quien ya lo tiene todo conectado ve solo las dos partes y abre el proceso si quiere.
import { useId, useState } from 'react';
import FlujoConexion from '../leccion/FlujoConexion';

const LUGARES = {
  plataforma: { texto: 'En la plataforma', clase: 'border-neon/40 bg-neon/10 text-neon' },
  blender: { texto: 'En Blender', clase: 'border-blender/40 bg-blender/10 text-orange-200' },
  una_vez: { texto: 'Una sola vez', clase: 'border-amatista-claro/40 bg-amatista/15 text-amatista-claro' },
  ambos: { texto: 'En los dos', clase: 'border-emerald-300/40 bg-emerald-400/10 text-emerald-200' },
};

// El proceso completo, en el orden en que lo vive el alumno.
const PASOS_FUSION = [
  {
    id: 'idea',
    lugar: 'plataforma',
    titulo: 'Aprendes la idea',
    texto: 'Cada lección es corta: lees poco y practicas con actividades (ordenar, emparejar, girar una escena 3D). Funciona incluso sin Internet.',
  },
  {
    id: 'instalar',
    lugar: 'una_vez',
    titulo: 'Instalas Amatista Motor',
    texto: 'Lo descargas desde esta página. El instalador busca tu Blender, comprueba que sea 4.2 o más nuevo y deja la pestaña Amatista lista.',
  },
  {
    id: 'vincular',
    lugar: 'una_vez',
    titulo: 'Vinculas tu cuenta',
    texto: 'Si descargaste con tu sesión iniciada, ya queda vinculado. Si no, Blender muestra un código de 8 caracteres (como ABCD-2345) que escribes aquí. Nunca escribes tu contraseña en Blender.',
  },
  {
    id: 'abrir',
    lugar: 'plataforma',
    titulo: 'La lección abre tu taller',
    texto: '«Abrir en Blender» deja una orden para tu Blender. En pocos segundos la recibe y abre la actividad en su propia escena, sin tocar tus otros archivos.',
  },
  {
    id: 'guia',
    lugar: 'blender',
    titulo: 'Blender te guía',
    texto: 'La tarjeta de la vista 3D dice qué toca, el molde muestra dónde va cada pieza y las pistas te ayudan si te atoras. Amatista revisa tu escena sola.',
  },
  {
    id: 'vivo',
    lugar: 'ambos',
    titulo: 'La lección te ve en vivo',
    texto: 'Cada 5 segundos Blender cuenta qué estás haciendo. La lección muestra lo mismo que la tarjeta y tiene los mismos botones: pista, Mírame, pausa.',
  },
  {
    id: 'avance',
    lugar: 'ambos',
    titulo: 'Tu avance queda en tu cuenta',
    texto: 'Cada intento se guarda en tu cuenta. Sin Internet, Blender lo guarda y lo envía después. Lo ves en Mi panel, en tu curso y en Tu isla.',
  },
];

// El mismo proceso como mensajes que viajan (bloque connection_flow).
const FLUJO = {
  type: 'connection_flow',
  title: 'Qué viaja entre los dos',
  nodes: [
    { id: 'plataforma', label: 'Plataforma', icon: 'plataforma' },
    { id: 'servidor', label: 'Tu cuenta', icon: 'servidor' },
    { id: 'blender', label: 'Blender', icon: 'blender' },
  ],
  messages: [
    { from: 'blender', to: 'servidor', label: 'Pide un código', text: 'Al pulsar **Vincular** en Blender aparece un código de 8 caracteres. Vale por 10 minutos.' },
    { from: 'plataforma', to: 'servidor', label: 'Confirma el código', text: 'Escribes ese código en Blender › Vincular. Desde ahí, ese Blender guarda en tu cuenta.' },
    { from: 'plataforma', to: 'servidor', label: 'Orden', text: 'Pulsas «Abrir en Blender» o «Pista» en la lección: la orden queda esperando a tu Blender.' },
    { from: 'servidor', to: 'blender', label: 'La orden llega', text: 'En el siguiente latido Blender la recibe y la cumple. Si un latido se pierde, la orden espera al siguiente.' },
    { from: 'blender', to: 'servidor', label: 'Latido', text: 'Cada **5 segundos** Blender cuenta la actividad, el paso y tu progreso.' },
    { from: 'servidor', to: 'plataforma', label: 'En vivo', text: 'La lección muestra **lo mismo que la tarjeta** de la vista 3D.' },
    { from: 'blender', to: 'servidor', label: 'Tu avance', text: 'Cada habilidad lograda se guarda en tu cuenta: la ves en Mi panel y en Tu isla.' },
  ],
  caption: 'Viaja: la actividad abierta, el paso, si cada pieza cumple y tus intentos. No viaja: tu archivo .blend, tus otros proyectos ni tu contraseña.',
};

function hecho(id, progreso) {
  if (!progreso) return false;
  if (id === 'instalar') return Boolean(progreso.instalado);
  if (id === 'vincular') return Boolean(progreso.vinculado);
  if (id === 'vivo') return Boolean(progreso.abierto);
  return false;
}

function FusionPlataformaBlender({ progreso = null, resumida = false }) {
  const idTitulo = useId();
  const [verFlujo, setVerFlujo] = useState(false);
  const [verPasos, setVerPasos] = useState(!resumida);

  return (
    <section
      aria-labelledby={idTitulo}
      className="fusion corte-poly relative overflow-hidden border border-amatista/45 bg-gradient-to-br from-amatista/15 via-superficie/95 to-blender/10 p-6 sm:p-8"
      data-recorrido="fusion"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon">La idea de Amatista</p>
      <h2 id={idTitulo} className="mt-1 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
        Cómo se unen la plataforma y Blender
      </h2>
      <p className="mt-2 max-w-3xl leading-relaxed text-texto/85">
        Amatista son dos partes que funcionan como una sola: <strong className="text-neon">la plataforma</strong>, donde aprendes la idea, y{' '}
        <strong className="text-orange-200">Amatista Motor</strong>, el add-on que vive dentro de Blender y te guía mientras la haces. Tu cuenta las
        mantiene conectadas.
      </p>

      {/* Las dos partes y el puente entre ellas. */}
      <div className="fusion__partes mt-6 grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]" aria-hidden="true">
        <div className="corte-poly-sm border border-neon/30 bg-base/60 p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-neon">La plataforma</p>
          <p className="mt-1 text-sm text-texto/85">Teoría corta, actividades, tu curso, Mi panel y los botones que mandan órdenes a Blender.</p>
        </div>
        <div className="fusion__puente flex flex-row items-center justify-center gap-2 md:flex-col">
          <span className="fusion__flecha font-mono text-[11px] uppercase tracking-widest text-white/60">órdenes ▸</span>
          <span className="hexagono grid h-14 w-16 place-items-center bg-amatista text-center font-mono text-[10px] font-extrabold leading-tight text-white">
            TU
            <br />
            CUENTA
          </span>
          <span className="fusion__flecha font-mono text-[11px] uppercase tracking-widest text-white/60">◂ latido</span>
        </div>
        <div className="corte-poly-sm border border-blender/30 bg-base/60 p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-blender">Blender + Amatista Motor</p>
          <p className="mt-1 text-sm text-texto/85">La tarjeta 3D, el molde, las pistas, tus herramientas y la revisión de tu escena.</p>
        </div>
      </div>

      {!verPasos && (
        <button type="button" onClick={() => setVerPasos(true)} className="mt-5 font-mono text-xs font-bold uppercase tracking-widest text-neon hover:underline">
          ▸ Ver el proceso completo, paso a paso
        </button>
      )}
      {verPasos && (
      <ol className="fusion__pasos mt-7 grid gap-3">
        {PASOS_FUSION.map((paso, i) => {
          const listo = hecho(paso.id, progreso);
          const lugar = LUGARES[paso.lugar];
          return (
            <li key={paso.id} className={`fusion__paso corte-poly-sm flex gap-4 border p-4 ${listo ? 'border-emerald-400/35 bg-emerald-400/5' : 'border-white/10 bg-base/55'}`}>
              <span
                className={`hexagono grid h-10 w-11 shrink-0 place-items-center font-mono text-sm font-extrabold ${listo ? 'bg-emerald-400 text-base' : 'bg-white/10 text-white'}`}
                aria-hidden="true"
              >
                {listo ? '✓' : i + 1}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white">{paso.titulo}</span>
                  <span className={`corte-poly-sm border px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest ${lugar.clase}`}>{lugar.texto}</span>
                  {listo && <span className="font-mono text-[11px] uppercase tracking-widest text-emerald-300">{paso.id === 'vivo' ? 'Ahora mismo' : 'Ya lo tienes'}</span>}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-texto/80">{paso.texto}</p>
              </div>
            </li>
          );
        })}
      </ol>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setVerFlujo(!verFlujo)}
          aria-expanded={verFlujo}
          className="font-mono text-xs font-bold uppercase tracking-widest text-neon hover:underline"
        >
          {verFlujo ? '▾ Ocultar qué viaja entre los dos' : '▸ Ver qué viaja entre los dos'}
        </button>
        {verFlujo && (
          <div className="mt-4">
            <FlujoConexion bloque={FLUJO} />
          </div>
        )}
      </div>
    </section>
  );
}

export default FusionPlataformaBlender;
