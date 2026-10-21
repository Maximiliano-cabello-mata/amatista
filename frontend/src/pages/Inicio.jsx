// Portada (#/): Amatista como plataforma de 3D multiplataforma (2026-10-21). Primero el hero
// con el acceso directo a la siguiente lección; justo debajo, todo lo que hay a la vista: los
// programas (Blender, A-Frame y los que vienen), las disciplinas y un buscador que lleva a
// Explorar. Después los cursos, cómo se aprende y la invitación a crear cuenta. Todo sale del
// catálogo vigente y del progreso local.
import { useMemo, useState } from 'react';
import { useAuth } from '../auth/contexto';
import { useCatalogo } from '../catalogo/contexto';
import { agruparPorRuta } from '../catalogo/agrupar';
import { cifrasPorSoftware, modulosDelCatalogo } from '../catalogo/indice';
import TituloSeccion from '../components/estructura/TituloSeccion';
import InvitacionRecorrido from '../components/InvitacionRecorrido';
import { CristalLogo } from '../components/Iconos';
import LogoCurso from '../components/LogoCurso';
import LogoSoftware from '../components/LogoSoftware';
import TarjetaCurso from '../components/TarjetaCurso';
import { cursosParaContinuar, tieneAvance } from '../components/panel/datos';
import { FORMULA } from '../components/panel/formula';
import { IconoRacha } from '../components/panel/IconosPanel';
import { DISCIPLINAS, SOFTWARE } from '../data/software';
import { useProgreso } from '../progreso/contexto';
import { navegar, rutaEntrar, rutaExplorar, rutas } from '../rutas';

const BOTON = 'corte-poly-sm inline-flex items-center justify-center gap-2 px-6 py-3.5 text-center font-extrabold uppercase tracking-widest';
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// Composición low poly del hero: el cristal al centro y los programas orbitando.
function EmblemaHero() {
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[13rem] place-items-center sm:max-w-[19rem]" aria-hidden="true">
      <div className="hexagono absolute inset-[6%] bg-gradient-to-br from-amatista/30 via-amatista-oscuro/50 to-transparent" />
      <div className="hexagono absolute inset-[22%] bg-base/80" />
      <CristalLogo className="animar-flotar relative h-[42%] w-[42%] drop-shadow-[0_0_24px_rgba(155,89,182,0.55)]" />
      <div className="hexagono absolute left-[2%] top-[14%] grid h-[24%] w-[27%] place-items-center bg-superficie">
        <LogoCurso logo="blender" className="animar-flotar h-[58%] w-[62%] [animation-delay:-1.5s]" />
      </div>
      <div className="hexagono absolute bottom-[12%] right-[2%] grid h-[24%] w-[27%] place-items-center bg-superficie">
        <LogoCurso logo="aframe" className="animar-flotar h-[52%] w-[52%] [animation-delay:-3s]" />
      </div>
      <div className="hexagono absolute right-[4%] top-[8%] grid h-[17%] w-[19%] place-items-center bg-superficie/80 font-mono text-[10px] font-extrabold text-white/45 sm:text-xs">
        +
      </div>
    </div>
  );
}

// Llamado principal del hero: con avance lleva a la siguiente lección; sin
// avance, a la primera lección del primer curso disponible. Al lado, Explorar.
function AccionesHero({ siguiente, hayAvance }) {
  const explorar = (
    <a href={rutas.explorar} className={`${BOTON} border border-white/15 bg-white/5 text-white/85 transition-colors hover:bg-white/10`}>
      Explorar todo
    </a>
  );
  if (!siguiente) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {explorar}
        <a href={rutas.panel} className={`${BOTON} bg-amatista text-white transition-[filter] hover:brightness-110`}>
          Ver mi panel ▸
        </a>
      </div>
    );
  }
  const { curso, resumen } = siguiente;
  const leccion = resumen.siguiente.leccion;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <a
        href={rutas.leccion(curso.id, leccion.id)}
        className={`${BOTON} bg-neon text-base transition-[filter] hover:brightness-110 sm:text-lg`}
      >
        ▶ {hayAvance ? 'Continuar' : 'Empezar ahora'}
        <span className="sr-only">: {leccion.title}</span>
      </a>
      {explorar}
    </div>
  );
}

// Busca desde la portada: lleva a Explorar con la búsqueda puesta.
function BuscadorPortada() {
  const [texto, setTexto] = useState('');
  const enviar = (evento) => {
    evento.preventDefault();
    navegar(rutaExplorar({ q: texto.trim() }));
  };
  return (
    <form role="search" onSubmit={enviar} className="flex gap-2">
      <label htmlFor="portada-buscar" className="sr-only">
        Buscar en todo el contenido
      </label>
      <input
        id="portada-buscar"
        type="search"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        placeholder="¿Qué quieres aprender? Ej.: luz, GLB, animación"
        className="corte-poly-sm min-w-0 flex-1 border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-white/40 focus:border-neon"
      />
      <button type="submit" className="corte-poly-sm shrink-0 bg-amatista px-5 font-mono text-xs font-bold uppercase tracking-widest text-white hover:brightness-110">
        Buscar
      </button>
    </form>
  );
}

// Todo lo que hay, a la vista desde el inicio: un mosaico por programa y las disciplinas.
function MapaContenido({ cursos }) {
  const modulos = useMemo(() => modulosDelCatalogo(cursos), [cursos]);
  const cifras = useMemo(() => cifrasPorSoftware(modulos), [modulos]);
  return (
    <section className="mt-14" aria-labelledby="inicio-mapa" data-recorrido="cursos">
      <TituloSeccion
        id="inicio-mapa"
        className="mb-6"
        antetitulo="Todo Amatista, a la vista"
        titulo={
          <>
            Un lugar para aprender <span className="text-amatista-claro">todo el 3D</span>
          </>
        }
        descripcion="Modelado, diseño, animación y 3D para la web, en varios programas. Elige uno o busca un tema: todo el contenido está a un clic."
        accion={
          <a href={rutas.explorar} className="font-mono text-xs font-bold uppercase tracking-widest text-neon hover:underline">
            Ver todo el catálogo ▸
          </a>
        }
      />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SOFTWARE.map((software) => {
          const c = cifras[software.id];
          const disponible = software.estado === 'disponible';
          return (
            <li key={software.id}>
              <a
                href={rutaExplorar({ software: software.id })}
                className={`corte-poly-sm elevar group flex h-full flex-col border p-4 ${
                  disponible ? 'border-white/10 bg-superficie/90 hover:border-neon' : 'border-dashed border-white/15 bg-superficie/50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="hexagono grid h-12 w-14 shrink-0 place-items-center bg-black/40">
                    <LogoSoftware software={software} className="h-7 w-8 text-xs" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-extrabold text-white">{software.nombre}</span>
                    <span className={`block font-mono text-[10px] uppercase tracking-widest ${disponible ? 'text-neon' : 'text-amber-200'}`}>
                      {disponible ? `${plural(c.publicados, 'módulo', 'módulos')} · ${plural(c.lecciones, 'lección', 'lecciones')}` : 'En preparación'}
                    </span>
                  </span>
                </span>
                <span className="mt-3 flex-1 text-sm leading-snug text-texto/75">{software.lema}</span>
                <span className="mt-3 font-mono text-[11px] font-bold uppercase tracking-widest text-white/60 group-hover:text-neon">
                  {disponible ? 'Ver sus módulos ▸' : 'Ver qué enseñará ▸'}
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <BuscadorPortada />
        <ul className="flex flex-wrap gap-2" aria-label="Explorar por disciplina">
          {DISCIPLINAS.map((disciplina) => (
            <li key={disciplina.id}>
              <a
                href={rutaExplorar({ disciplina: disciplina.id })}
                title={disciplina.texto}
                className="corte-poly-sm inline-block border border-white/10 bg-superficie/80 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white/70 hover:border-neon hover:text-neon"
              >
                {disciplina.nombre}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Inicio() {
  const { cursos } = useCatalogo();
  const { progreso, xp, nivel } = useProgreso();
  const { usuario } = useAuth();
  const hayAvance = tieneAvance(progreso);
  const [siguiente] = cursosParaContinuar(progreso, cursos);
  // Un curso por tarjeta: los niveles de Blender viven dentro de su tarjeta.
  const tarjetas = agruparPorRuta(cursos);
  const modulos = useMemo(() => modulosDelCatalogo(cursos).filter((m) => m.publicado), [cursos]);
  const lecciones = modulos.reduce((suma, m) => suma + m.lecciones, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-14">
      {/* Hero */}
      <section className="animar-entrar grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" aria-labelledby="inicio-titulo" data-recorrido="hero">
        <div className="min-w-0">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-neon">Plataforma de 3D multiplataforma</p>
          <h1 id="inicio-titulo" className="text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">
            Aprende 3D <span className="text-amatista-claro">creando</span>, en el programa que elijas.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-texto/80">
            Modelado, diseño, animación y 3D para la web. Hoy con Blender y A-Frame; Maya y 3ds Max vienen en camino. Lecciones cortas e
            interactivas, desde el navegador e incluso sin Internet.
          </p>

          <ul className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider" aria-label="Programas">
            {SOFTWARE.map((software) => (
              <li key={software.id}>
                <a
                  href={rutaExplorar({ software: software.id })}
                  className={`corte-poly-sm flex items-center gap-2 border px-3 py-1.5 hover:border-neon hover:text-neon ${
                    software.estado === 'disponible' ? 'border-white/10 bg-superficie/80 text-white/80' : 'border-dashed border-white/15 text-white/50'
                  }`}
                >
                  <LogoSoftware software={software} className="h-4 w-5 text-[9px]" />
                  {software.nombre}
                  {software.estado !== 'disponible' && <span className="text-[10px] text-white/40">pronto</span>}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <AccionesHero siguiente={siguiente} hayAvance={hayAvance} />
            {hayAvance && siguiente && (
              <p className="mt-3 text-sm text-white/55">
                Sigues con <strong className="text-white/85">{siguiente.resumen.siguiente.leccion.title}</strong> en{' '}
                {siguiente.curso.titulo} · Nivel {nivel.nivel} · {xp} XP
              </p>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <EmblemaHero />
          <dl className="mx-auto mt-4 grid max-w-sm grid-cols-3 gap-2 text-center">
            {[
              ['Programas', SOFTWARE.length],
              ['Módulos', modulos.length],
              ['Lecciones', lecciones],
            ].map(([etiqueta, valor]) => (
              <div key={etiqueta} className="corte-poly-sm border border-white/10 bg-superficie/80 px-2 py-2.5">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-white/50">{etiqueta}</dt>
                <dd className="text-2xl font-extrabold text-white">{valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <InvitacionRecorrido className="mt-10" />

      <MapaContenido cursos={cursos} />

      {/* Cursos */}
      <section className="revelar diferido mt-16" aria-labelledby="inicio-cursos">
        <TituloSeccion
          id="inicio-cursos"
          className="mb-6"
          antetitulo="Cursos"
          titulo={
            <>
              Elige tu <span className="text-amatista-claro">curso</span>
            </>
          }
          descripcion="Un curso por programa, con sus niveles y módulos dentro. Cada módulo es un mundo con su guía y su jefe final."
        />
        {tarjetas.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {tarjetas.map((ruta, i) => (
              <TarjetaCurso key={ruta.id} ruta={ruta} indice={i} />
            ))}
          </div>
        ) : (
          <p className="text-texto/75">Aún no hay cursos publicados. Vuelve pronto.</p>
        )}
      </section>

      {/* La fórmula Amatista */}
      <section className="revelar diferido mt-16" aria-labelledby="inicio-formula">
        <TituloSeccion
          id="inicio-formula"
          antetitulo="El ciclo del cristal"
          titulo={
            <>
              Cómo aprendes en <span className="text-amatista-claro">Amatista</span>
            </>
          }
          descripcion="Cada módulo sigue los mismos cinco pasos: una idea por lección, menos de diez minutos y siempre algo que hacer con tus manos."
        />
        <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {FORMULA.map(({ paso, nombre, duracion, descripcion, Icono }, i) => (
            <li key={paso} className="revelar elevar corte-poly-sm relative flex gap-4 border border-white/10 bg-superficie/90 p-4 lg:flex-col lg:gap-3 lg:p-5">
              <span className="hexagono grid h-14 w-16 shrink-0 place-items-center bg-amatista-oscuro text-amatista-claro">
                <Icono className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/45">
                  Paso {i + 1} · {duracion}
                </p>
                <p className="text-lg font-extrabold text-white">{nombre}</p>
                <p className="mt-1 text-sm leading-snug text-texto/70">{descripcion}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-center gap-2 text-sm text-white/55">
          <IconoRacha className="h-4 w-4 shrink-0 text-blender" />
          Ganas XP en cada lección, subes de nivel, mantienes tu racha diaria y coleccionas una insignia por módulo.
        </p>
      </section>

      {/* Cuenta */}
      {!usuario && (
        <section
          className="corte-poly mt-16 bg-gradient-to-br from-amatista via-amatista-oscuro to-superficie p-[2px]"
          aria-labelledby="inicio-cuenta"
        >
          <div className="corte-poly flex flex-col gap-5 bg-superficie/95 p-6 sm:flex-row sm:items-center sm:p-8">
            <CristalLogo className="h-16 w-16 shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 id="inicio-cuenta" className="text-2xl font-extrabold text-white">
                Guarda tu progreso en la nube
              </h2>
              <p className="mt-1 leading-relaxed text-texto/75">
                {hayAvance
                  ? `Tus ${xp} XP viven solo en este navegador. Crea una cuenta y lo que ya hiciste se suma a ella.`
                  : 'Puedes empezar sin cuenta. Cuando quieras, crea una para respaldar tu avance y seguir desde cualquier dispositivo.'}
              </p>
            </div>
            <div className="grid shrink-0 gap-2 sm:w-52">
              <a href={rutas.registro} className={`${BOTON} bg-amatista text-white transition-[filter] hover:brightness-110`}>
                Crear cuenta
              </a>
              <a href={rutaEntrar(rutas.inicio)} className={`${BOTON} bg-white/5 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10`}>
                Ya tengo cuenta
              </a>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default Inicio;
