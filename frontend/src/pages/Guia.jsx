// Guía de primeros pasos (#/guia): la lección clave para alumnos nuevos.
// Cinco capítulos cortos (cómo está organizada la plataforma, cómo se completa
// una lección, tu avance, instalar el add-on y cómo enseña el add-on), cada
// uno con una comprobación que abre el siguiente. El contenido vive en
// data/guia.js y se dibuja con los mismos bloques que las lecciones.
import { useEffect, useState } from 'react';
import { useCatalogo } from '../catalogo/contexto';
import { CristalLogo, IconoCandado } from '../components/Iconos';
import BloqueContenido from '../components/leccion/BloqueContenido';
import { cursosParaContinuar } from '../components/panel/datos';
import { CAPITULOS, CIERRE } from '../data/guia';
import { capituloAbierto, guardarGuia, leerGuia, superarCapitulo } from '../guia/estado';
import { useProgreso } from '../progreso/contexto';
import { rutas } from '../rutas';

const TOTAL = CAPITULOS.length;
const BOTON = 'corte-poly-sm inline-flex items-center justify-center gap-2 px-6 py-3 text-center font-extrabold uppercase tracking-widest';

function Indice({ estado, actual, alElegir }) {
  return (
    <nav aria-label="Capítulos de la guía" className="mt-8">
      <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {[...CAPITULOS, { id: 'listo', corto: '¡Listo!' }].map((capitulo, i) => {
          const abierto = capituloAbierto(estado, CAPITULOS, i);
          const superado = estado.superados.includes(capitulo.id) || (i === TOTAL && estado.completada);
          const esActual = i === actual;
          return (
            <li key={capitulo.id}>
              <button
                type="button"
                onClick={() => alElegir(i)}
                disabled={!abierto}
                aria-current={esActual ? 'step' : undefined}
                className={`corte-poly-sm flex h-full w-full flex-col items-start gap-1.5 border p-2.5 text-left transition-colors disabled:cursor-not-allowed ${
                  esActual ? 'border-neon/60 bg-neon/10' : abierto ? 'border-white/10 bg-superficie/90 hover:border-white/25' : 'border-white/5 bg-superficie/50'
                }`}
              >
                <span
                  className={`hexagono grid h-7 w-8 place-items-center font-mono text-xs font-bold ${
                    superado ? 'bg-emerald-400 text-base' : esActual ? 'bg-neon text-base' : abierto ? 'bg-white/15 text-white' : 'bg-[#2a2a2a] text-white/40'
                  }`}
                >
                  {superado ? '✓' : abierto ? i + 1 : <IconoCandado className="h-3 w-3" />}
                </span>
                <span className={`text-xs font-bold leading-tight ${abierto ? 'text-white' : 'text-white/40'}`}>{capitulo.corto}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Capitulo({ capitulo, numero, superado, alSuperar, alSeguir }) {
  return (
    <article className="mt-8" aria-labelledby={`guia-${capitulo.id}`}>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">
        Capítulo {numero} de {TOTAL}
      </p>
      <h2 id={`guia-${capitulo.id}`} className="mt-1 text-3xl font-extrabold text-white">
        {capitulo.titulo}
      </h2>
      <p className="mt-2 text-texto/75">{capitulo.resumen}</p>

      <div className="mt-6 space-y-8">
        {capitulo.bloques.map((bloque, i) => (
          <BloqueContenido key={`${capitulo.id}-${i}`} bloque={bloque} />
        ))}
        <section aria-label="Comprueba lo que aprendiste">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-amatista-claro">Comprueba lo que aprendiste</p>
          <BloqueContenido key={capitulo.comprueba.id} bloque={capitulo.comprueba} resuelta={superado} alCompletar={alSuperar} />
        </section>
      </div>

      <footer className="mt-10 flex flex-col items-stretch gap-2 border-t border-white/10 pt-6 sm:items-end">
        <button
          type="button"
          onClick={alSeguir}
          disabled={!superado}
          className={`${BOTON} destello bg-amatista text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {numero === TOTAL ? 'Terminar la guía ▶' : 'Siguiente capítulo ▶'}
        </button>
        <span className="text-center font-mono text-xs text-white/50 sm:text-right" aria-live="polite">
          {superado ? '¡Bien! Sigue cuando quieras.' : 'Responde la comprobación para seguir.'}
        </span>
      </footer>
    </article>
  );
}

function Cierre() {
  const { cursos } = useCatalogo();
  const { progreso } = useProgreso();
  const [siguiente] = cursosParaContinuar(progreso, cursos);
  const leccion = siguiente?.resumen?.siguiente?.leccion;
  return (
    <section className="corte-poly mt-8 bg-gradient-to-br from-amatista via-amatista-oscuro to-superficie p-[2px]" aria-labelledby="guia-cierre">
      <div className="corte-poly bg-superficie/95 p-6 sm:p-8">
        <CristalLogo className="animar-flotar h-16 w-16" />
        <h2 id="guia-cierre" className="mt-4 text-3xl font-extrabold text-white">
          {CIERRE.titulo}
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-texto/80">{CIERRE.texto}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {leccion ? (
            <a href={rutas.leccion(siguiente.curso.id, leccion.id)} className={`${BOTON} bg-neon text-base hover:brightness-110`}>
              ▶ Ir a mi lección
              <span className="sr-only">: {leccion.title}</span>
            </a>
          ) : (
            <a href={rutas.inicio} className={`${BOTON} bg-neon text-base hover:brightness-110`}>
              ▶ Elegir un curso
            </a>
          )}
          <a href={rutas.blender} className={`${BOTON} border border-blender/40 bg-blender/10 text-blender hover:bg-blender/20`}>
            Conectar Blender
          </a>
          <a href={rutas.panel} className={`${BOTON} border border-white/15 bg-white/5 text-white/85 hover:bg-white/10`}>
            Mi panel
          </a>
        </div>
        {leccion && (
          <p className="mt-3 text-sm text-white/55">
            Te toca <strong className="text-white/85">{leccion.title}</strong> en {siguiente.curso.titulo}.
          </p>
        )}
      </div>
    </section>
  );
}

function Guia() {
  const [estado, setEstado] = useState(() => leerGuia(TOTAL));
  const actual = estado.capitulo;

  useEffect(() => {
    guardarGuia(estado);
  }, [estado]);

  const irA = (indice) => {
    setEstado((previo) => ({ ...previo, capitulo: indice }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const capitulo = CAPITULOS[actual];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
      <a href={rutas.inicio} className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-neon">
        ◂ Volver a los cursos
      </a>
      <header className="animar-entrar mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="hexagono grid h-20 w-24 shrink-0 place-items-center bg-amatista-oscuro">
          <CristalLogo className="animar-flotar h-12 w-12" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">Primeros pasos · unos 6 minutos</p>
          <h1 className="mt-1 text-4xl font-extrabold leading-tight text-white">Guía de Amatista</h1>
          <p className="mt-2 leading-relaxed text-texto/80">
            Cómo funciona la plataforma y cómo te enseña Blender con el add-on. Esta guía no cambia tu progreso: puedes volver a
            ella cuando quieras con el botón «?» de arriba.
          </p>
        </div>
      </header>

      <Indice estado={estado} actual={actual} alElegir={irA} />

      {capitulo ? (
        <Capitulo
          key={capitulo.id}
          capitulo={capitulo}
          numero={actual + 1}
          superado={estado.superados.includes(capitulo.id)}
          alSuperar={() => setEstado((previo) => superarCapitulo(previo, capitulo.id))}
          alSeguir={() => {
            if (actual + 1 === TOTAL) setEstado((previo) => ({ ...previo, completada: true }));
            irA(actual + 1);
          }}
        />
      ) : (
        <Cierre />
      )}
    </main>
  );
}

export default Guia;
