// Ayuda (#/guia, botón «?» de la barra): no es un curso. Arriba, el recorrido por la plataforma
// (un minuto por las páginas reales); después, la tarjeta de cómo se unen la plataforma y Blender;
// al final, respuestas cortas que se abren de a una (data/guia.js), sin candados ni preguntas.
import { useState } from 'react';
import FusionPlataformaBlender from '../components/blender/FusionPlataformaBlender';
import { CristalLogo } from '../components/Iconos';
import BloqueContenido from '../components/leccion/BloqueContenido';
import { TEMAS_AYUDA } from '../data/guia';
import { useRecorrido } from '../recorrido/contexto';
import { TOTAL_RECORRIDO } from '../recorrido/pasos';
import { rutas } from '../rutas';

const BOTON = 'corte-poly-sm inline-flex items-center justify-center gap-2 px-6 py-3 text-center font-extrabold uppercase tracking-widest';

function Tema({ tema, abierto, alAlternar }) {
  const idPanel = `ayuda-${tema.id}`;
  return (
    <li className={`corte-poly-sm border transition-colors ${abierto ? 'border-neon/40 bg-superficie' : 'border-white/10 bg-superficie/85'}`}>
      <h3>
        <button
          type="button"
          onClick={alAlternar}
          aria-expanded={abierto}
          aria-controls={idPanel}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:text-neon"
        >
          <span className="min-w-0">
            <span className="block text-lg font-bold text-white">{tema.titulo}</span>
            <span className="block text-sm text-texto/65">{tema.resumen}</span>
          </span>
          <span className={`shrink-0 font-mono text-lg text-neon transition-transform ${abierto ? 'rotate-90' : ''}`} aria-hidden="true">
            ▸
          </span>
        </button>
      </h3>
      {abierto && (
        <div id={idPanel} className="animar-entrar space-y-6 border-t border-white/10 px-5 pb-6 pt-5">
          {tema.bloques.map((bloque, i) => (
            <BloqueContenido key={`${tema.id}-${i}`} bloque={bloque} />
          ))}
        </div>
      )}
    </li>
  );
}

function Guia() {
  const { empezar } = useRecorrido();
  const [abierto, setAbierto] = useState(null);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
      <a href={rutas.inicio} className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-neon">
        ◂ Volver a los cursos
      </a>

      <header className="animar-entrar mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="hexagono grid h-20 w-24 shrink-0 place-items-center bg-amatista-oscuro">
          <CristalLogo className="animar-flotar h-12 w-12" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">Ayuda</p>
          <h1 className="mt-1 text-4xl font-extrabold leading-tight text-white">¿Cómo funciona Amatista?</h1>
          <p className="mt-2 leading-relaxed text-texto/80">Todo lo que necesitas para empezar. No tienes que saber programar ni instalar nada raro.</p>
        </div>
      </header>

      <section
        className="corte-poly mt-8 bg-gradient-to-br from-neon/60 via-amatista to-blender/60 p-[2px]"
        aria-labelledby="ayuda-recorrido"
      >
        <div className="corte-poly flex flex-col gap-5 bg-superficie/95 p-6 sm:flex-row sm:items-center sm:p-7">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon">Un minuto</p>
            <h2 id="ayuda-recorrido" className="mt-1 text-2xl font-extrabold text-white">
              Recorre la plataforma conmigo
            </h2>
            <p className="mt-1 text-texto/80">
              {TOTAL_RECORRIDO} paradas por las páginas de verdad: tus cursos, cómo avanzas, la página Blender y Mi panel. Te ilumino cada cosa y
              te digo para qué sirve.
            </p>
          </div>
          <button type="button" onClick={() => empezar(0)} className={`${BOTON} destello shrink-0 bg-neon text-base hover:brightness-110`}>
            ▶ Empezar el recorrido
          </button>
        </div>
      </section>

      <div className="mt-8">
        <FusionPlataformaBlender resumida />
      </div>

      <section className="mt-10" aria-labelledby="ayuda-preguntas">
        <h2 id="ayuda-preguntas" className="text-2xl font-extrabold text-white">
          Preguntas rápidas
        </h2>
        <ul className="mt-4 grid gap-3">
          {TEMAS_AYUDA.map((tema) => (
            <Tema key={tema.id} tema={tema} abierto={abierto === tema.id} alAlternar={() => setAbierto(abierto === tema.id ? null : tema.id)} />
          ))}
        </ul>
      </section>

      <nav className="mt-10 flex flex-col gap-3 sm:flex-row" aria-label="Ir a">
        <a href={rutas.inicio} className={`${BOTON} bg-amatista text-white hover:brightness-110`}>
          Cursos
        </a>
        <a href={rutas.blender} className={`${BOTON} border border-blender/40 bg-blender/10 text-blender hover:bg-blender/20`}>
          Blender
        </a>
        <a href={rutas.panel} className={`${BOTON} border border-white/15 bg-white/5 text-white/85 hover:bg-white/10`}>
          Mi panel
        </a>
      </nav>
    </main>
  );
}

export default Guia;
