// Portada (#/): propuesta de valor, acceso directo a la siguiente lección,
// catálogo de cursos, la fórmula con la que se aprende y la invitación a
// crear cuenta. Todo sale del catálogo vigente y del progreso local.
import { useAuth } from '../auth/contexto';
import { useCatalogo } from '../catalogo/contexto';
import { agruparPorRuta } from '../catalogo/agrupar';
import { CristalLogo } from '../components/Iconos';
import LogoCurso from '../components/LogoCurso';
import TarjetaCurso from '../components/TarjetaCurso';
import MundosModulos from '../components/temas/MundosModulos';
import { cifrasCatalogo, cursosParaContinuar, tieneAvance } from '../components/panel/datos';
import { FORMULA } from '../components/panel/formula';
import { IconoDispositivo, IconoPuntero, IconoRacha } from '../components/panel/IconosPanel';
import { useProgreso } from '../progreso/contexto';
import { rutaEntrar, rutas } from '../rutas';

const RUTA = ['Blender', 'GLB', 'A-Frame', 'WebXR'];

const PILARES = [
  {
    id: 'haciendo',
    titulo: 'Aprendes haciendo',
    texto: 'Cada módulo termina en algo tuyo: un modelo, una escena, un mundo para visitar en VR.',
    Icono: ({ className }) => <LogoCurso logo="blender" className={className} />,
    tono: '',
  },
  {
    id: 'interactivo',
    titulo: 'Interactivo',
    texto: 'Manipulas escenas 3D, ordenas, emparejas y escribes código con respuesta al instante.',
    Icono: IconoPuntero,
    tono: 'text-neon',
  },
  {
    id: 'offline',
    titulo: 'Sin conexión',
    texto: 'Instálala y sigue estudiando sin Internet: tu avance se sincroniza cuando vuelves.',
    Icono: IconoDispositivo,
    tono: 'text-amatista-claro',
  },
];

const BOTON = 'corte-poly-sm inline-flex items-center justify-center gap-2 px-6 py-3.5 text-center font-extrabold uppercase tracking-widest';

// Composición low poly del hero: el cristal al centro y los dos cursos orbitando.
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
    </div>
  );
}

// Llamado principal del hero: con avance lleva a la siguiente lección; sin
// avance, a la primera lección del primer curso disponible.
function AccionesHero({ siguiente, hayAvance }) {
  if (!siguiente) {
    return (
      <a href={rutas.panel} className={`${BOTON} bg-amatista text-white transition-[filter] hover:brightness-110`}>
        Ver mi panel ▸
      </a>
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
      <a href={rutas.panel} className={`${BOTON} border border-white/15 bg-white/5 text-white/85 transition-colors hover:bg-white/10`}>
        Mi panel
      </a>
    </div>
  );
}

function Inicio() {
  const { cursos } = useCatalogo();
  const { progreso, xp, nivel } = useProgreso();
  const { usuario } = useAuth();
  const hayAvance = tieneAvance(progreso);
  const [siguiente] = cursosParaContinuar(progreso, cursos);
  const cifras = cifrasCatalogo(cursos);
  // Un curso por tarjeta: los niveles de Blender viven dentro de su tarjeta.
  const tarjetas = agruparPorRuta(cursos);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-14">
      {/* Hero */}
      <section className="animar-entrar grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" aria-labelledby="inicio-titulo">
        <div className="min-w-0">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-neon">Ruta del creador 3D</p>
          <h1 id="inicio-titulo" className="text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">
            Aprende 3D <span className="text-amatista-claro">creando</span>, no mirando.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-texto/80">
            Modela en Blender, lleva tus creaciones a la web con A-Frame y visítalas en realidad virtual. Lecciones cortas e
            interactivas, desde el navegador e incluso sin Internet.
          </p>

          <ol className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider" aria-label="Flujo de trabajo">
            {RUTA.map((paso, i) => (
              <li key={paso} className="flex items-center gap-2">
                <span className="corte-poly-sm border border-white/10 bg-superficie/80 px-3 py-1.5 text-white/80">{paso}</span>
                {i < RUTA.length - 1 && (
                  <span className="text-amatista" aria-hidden="true">
                    ▸
                  </span>
                )}
              </li>
            ))}
          </ol>

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
              ['Cursos', tarjetas.length],
              ['Módulos', cifras.modulos],
              ['Lecciones', cifras.lecciones],
            ].map(([etiqueta, valor]) => (
              <div key={etiqueta} className="corte-poly-sm border border-white/10 bg-superficie/80 px-2 py-2.5">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-white/50">{etiqueta}</dt>
                <dd className="text-2xl font-extrabold text-white">{valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Propuesta de valor */}
      <ul className="mt-12 grid gap-3 sm:grid-cols-3" aria-label="Por qué Amatista">
        {PILARES.map(({ id, titulo, texto, Icono, tono }, i) => (
          <li
            key={id}
            className="corte-poly-sm animar-entrar flex gap-3 border border-white/10 bg-superficie/80 p-4"
            style={{ animationDelay: `${150 + i * 80}ms` }}
          >
            <Icono className={`h-9 w-9 shrink-0 ${tono}`} />
            <div className="min-w-0">
              <p className="font-bold text-white">{titulo}</p>
              <p className="mt-0.5 text-sm leading-snug text-texto/70">{texto}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Catálogo */}
      <section className="revelar diferido mt-16" aria-labelledby="inicio-cursos">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">Catálogo</p>
        <h2 id="inicio-cursos" className="mb-6 text-3xl font-extrabold text-white sm:text-4xl">
          Elige tu <span className="text-amatista-claro">curso</span>
        </h2>
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

      {/* Un mundo por módulo */}
      <section className="revelar diferido mt-16" aria-labelledby="inicio-mundos">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">Un mundo por módulo</p>
        <h2 id="inicio-mundos" className="mb-2 text-3xl font-extrabold text-white sm:text-4xl">
          Cada módulo, una <span className="text-amatista-claro">aventura</span>
        </h2>
        <p className="mb-6 max-w-2xl text-texto/75">
          Un escenario distinto, un guía que te da consejos y datos curiosos, y un jefe final que pierde vida con cada respuesta
          correcta.
        </p>
        <MundosModulos cursos={cursos} />
      </section>

      {/* La fórmula Amatista */}
      <section className="revelar diferido mt-16" aria-labelledby="inicio-formula">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">El ciclo del cristal</p>
        <h2 id="inicio-formula" className="text-3xl font-extrabold text-white sm:text-4xl">
          Cómo aprendes en <span className="text-amatista-claro">Amatista</span>
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-texto/75">
          Cada módulo sigue los mismos cinco pasos: una idea por lección, menos de diez minutos y siempre algo que hacer con
          tus manos.
        </p>
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

      <footer className="mt-16 flex flex-col gap-4 border-t border-white/5 pt-6 font-mono text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex flex-wrap items-center gap-2">
          <CristalLogo className="h-5 w-5" />
          Amatista · plataforma offline-first de creación 3D
          <span className="ml-1 inline-flex items-center gap-2 border-l border-white/10 pl-3">
            con <LogoCurso logo="blender" className="h-4 w-5" decorativo={false} /> y <LogoCurso logo="aframe" className="h-4 w-5" decorativo={false} />
          </span>
        </span>
        <nav aria-label="Enlaces del pie">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 uppercase tracking-widest">
            <li>
              <a href={rutas.panel} className="hover:text-neon">
                Mi panel
              </a>
            </li>
            <li>
              <a href={usuario ? rutas.perfil : rutas.entrar} className="hover:text-neon">
                {usuario ? 'Mi cuenta' : 'Entrar'}
              </a>
            </li>
          </ul>
        </nav>
      </footer>
    </main>
  );
}

export default Inicio;
