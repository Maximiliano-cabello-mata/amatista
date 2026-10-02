import { useCatalogo } from '../catalogo/contexto';
import TarjetaCurso from '../components/TarjetaCurso';
import { rutas } from '../rutas';

const RUTA = ['Blender', 'GLB', 'A-Frame', 'WebXR'];

function Inicio() {
  const { cursos } = useCatalogo();

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
      <section className="animar-entrar mb-10 max-w-2xl sm:mb-14">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-neon">
          Ruta del creador 3D
        </p>
        <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-6xl">
          Elige tu <span className="text-amatista-claro">curso</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-texto/80">
          Modela en Blender, lleva tus creaciones a la web con A-Frame y visítalas en realidad
          virtual. Todo desde el navegador, incluso sin Internet.
        </p>

        <ol className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider" aria-label="Flujo de trabajo">
          {RUTA.map((paso, i) => (
            <li key={paso} className="flex items-center gap-2">
              <span className="corte-poly-sm border border-white/10 bg-superficie/80 px-3 py-1.5 text-white/80">
                {paso}
              </span>
              {i < RUTA.length - 1 && <span className="text-amatista" aria-hidden="true">▸</span>}
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 md:grid-cols-2" aria-label="Cursos">
        {cursos.map((curso, i) => (
          <TarjetaCurso key={curso.id} curso={curso} indice={i} />
        ))}
      </section>

      <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6 font-mono text-xs text-white/40">
        <span>Amatista · plataforma offline-first de creación 3D</span>
        <a href={rutas.laboratorio} className="hover:text-neon">
          Laboratorio técnico ▸
        </a>
      </footer>
    </main>
  );
}

export default Inicio;
