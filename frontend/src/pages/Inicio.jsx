// Portada y página «Cursos» (#/, 2026-10-23): todo el catálogo compactado en un camino guiado.
// Quien llega no sabe qué cursos hay, así que no se le pide buscar: primero elige qué quiere
// crear (un programa) y ve una sola lista numerada, en orden, con el paso que le toca resaltado.
// Cada paso es un módulo: una línea de lo que vas a lograr, sus lecciones al tocarlo y un botón
// que abre la lección que sigue. Reemplaza a Explorar (buscador y filtros del 21 de octubre).
// Todo sale del catálogo vigente y del progreso local (catalogo/camino.js).
import { useMemo, useState } from 'react';
import { useAuth } from '../auth/contexto';
import { useCatalogo } from '../catalogo/contexto';
import { caminos, programaInicial } from '../catalogo/camino';
import TituloSeccion from '../components/estructura/TituloSeccion';
import InvitacionRecorrido from '../components/InvitacionRecorrido';
import { CristalLogo, IconoCandado } from '../components/Iconos';
import LogoCurso from '../components/LogoCurso';
import LogoSoftware from '../components/LogoSoftware';
import { cursosParaContinuar, tieneAvance } from '../components/panel/datos';
import { FORMULA } from '../components/panel/formula';
import { IconoPalomita, IconoRacha } from '../components/panel/IconosPanel';
import { disciplinaPorId } from '../data/software';
import { useProgreso } from '../progreso/contexto';
import { rutaEntrar, rutas } from '../rutas';

const BOTON = 'boton boton--grande';
const CLAVE_PROGRAMA = 'amatista:programa';
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
const horas = (minutos) => (minutos >= 90 ? `${Math.round(minutos / 6) / 10} h` : `${minutos} min`);

// Lo que se crea con cada programa, en palabras de quien no conoce los nombres.
const QUE_CREAS = {
  blender: 'Objetos, personajes y escenas 3D',
  aframe: 'Mundos 3D para la web y la realidad virtual',
  maya: 'Animación de personajes',
  '3dsmax': 'Arquitectura y diseño de producto',
};

const ICONO_FORMULA = Object.fromEntries(FORMULA.map((paso) => [paso.paso, paso.Icono]));

function leerPrograma() {
  try {
    return window.localStorage.getItem(CLAVE_PROGRAMA);
  } catch {
    return null;
  }
}

function guardarPrograma(id) {
  try {
    window.localStorage.setItem(CLAVE_PROGRAMA, id);
  } catch {
    // Sin almacenamiento (ventana privada): solo no se recuerda la elección.
  }
}

const ESTADOS = {
  hecho: { texto: 'Hecho', clase: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' },
  siguiente: { texto: 'Siguiente', clase: 'border-neon/60 bg-neon/15 text-neon' },
  'en-curso': { texto: 'En curso', clase: 'border-amatista-claro/50 bg-amatista/15 text-amatista-claro' },
  disponible: { texto: 'Abierto', clase: 'border-white/15 bg-white/5 text-white/60' },
  proximamente: { texto: 'Pronto', clase: 'border-dashed border-white/15 text-white/45' },
  bloqueado: { texto: 'Más adelante', clase: 'border-dashed border-white/15 text-white/45' },
};

function Hexagono({ paso }) {
  const { estado, numero } = paso;
  const clase =
    estado === 'hecho'
      ? 'bg-emerald-400 text-base'
      : estado === 'siguiente'
        ? 'bg-neon text-base camino__pulso'
        : estado === 'en-curso'
          ? 'bg-amatista text-white'
          : estado === 'proximamente' || estado === 'bloqueado'
            ? 'bg-white/10 text-white/40'
            : 'bg-superficie text-white ring-1 ring-inset ring-white/20';
  return (
    <span className={`hexagono relative z-[1] grid h-11 w-12 shrink-0 place-items-center font-mono text-sm font-extrabold ${clase}`} aria-hidden="true">
      {estado === 'hecho' ? <IconoPalomita className="h-5 w-5" /> : estado === 'bloqueado' ? <IconoCandado className="h-4 w-4" /> : numero}
    </span>
  );
}

// Un paso del camino: compacto (una línea de lo que logras) y, al tocarlo, sus lecciones.
function Paso({ paso, abierto, alternar, ultimo }) {
  const estado = ESTADOS[paso.estado] ?? ESTADOS.disponible;
  const conContenido = paso.lecciones.length > 0 && paso.estado !== 'bloqueado';
  const idLista = `paso-${paso.id.replace(/[^a-z0-9_-]/gi, '-')}`;
  const accion = paso.estado === 'hecho' ? 'Repasar' : paso.estado === 'en-curso' || (paso.estado === 'siguiente' && paso.hechas) ? 'Seguir' : paso.estado === 'siguiente' ? 'Empezar' : 'Abrir';
  return (
    <li className={`camino__paso relative flex gap-3 sm:gap-4 ${ultimo ? '' : 'pb-3'}`} data-estado={paso.estado}>
      {!ultimo && <span className="camino__linea absolute bottom-0 left-6 top-11 w-px" aria-hidden="true" />}
      <Hexagono paso={paso} />
      <div
        className={`corte-poly-sm min-w-0 flex-1 border transition-colors ${
          paso.estado === 'siguiente' ? 'border-neon/50 bg-gradient-to-r from-neon/10 to-superficie/95' : 'border-white/10 bg-superficie/90'
        }`}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3 sm:flex-nowrap sm:p-4">
          {/* Tocar el título también abre las lecciones; para el teclado está el botón «Ver lecciones». */}
          <button
            type="button"
            onClick={alternar}
            disabled={!conContenido}
            tabIndex={-1}
            className="group min-w-0 flex-1 text-left disabled:cursor-default"
          >
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-base font-extrabold text-white sm:text-lg">{paso.titulo}</span>
              <span className={`corte-poly-sm border px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest ${estado.clase}`}>{estado.texto}</span>
            </span>
            {paso.resumen && <span className="mt-0.5 block text-sm leading-snug text-texto/70">{paso.resumen}</span>}
            <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-widest text-white/45">
              {conContenido && (
                <span>
                  {paso.hechas ? `${paso.hechas} de ${paso.lecciones.length}` : plural(paso.lecciones.length, 'lección', 'lecciones')}
                </span>
              )}
              {paso.minutos && conContenido && <span>{horas(paso.minutos)}</span>}
              {paso.insignia && conContenido && <span className="text-amatista-claro/80">Insignia: {paso.insignia}</span>}
            </span>
          </button>
          {conContenido && (
            <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
              <button
                type="button"
                onClick={alternar}
                aria-expanded={abierto}
                aria-controls={idLista}
                className="boton boton--fantasma boton--chico text-white/75"
              >
                {abierto ? 'Ocultar' : 'Ver'} lecciones <span className="boton__flecha boton__flecha--abajo" aria-hidden="true">▸</span>
              </button>
              <a href={paso.href} className={`boton ${paso.estado === 'siguiente' ? 'boton--primario destello' : 'boton--secundario'} flex-1 sm:flex-none`}>
                {accion} <span className="boton__flecha" aria-hidden="true">▸</span>
                <span className="sr-only">: {paso.titulo}</span>
              </a>
            </div>
          )}
        </div>
        {conContenido && abierto && (
          <ol id={idLista} className="animar-entrar grid gap-px [&>*]:min-w-0 border-t border-white/5 bg-white/5 sm:grid-cols-2">
            {paso.lecciones.map((leccion, i) => {
              const Icono = ICONO_FORMULA[leccion.formula];
              return (
                <li key={leccion.id} className="bg-superficie/95">
                  <a href={leccion.href} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 sm:px-4">
                    <span
                      className={`hexagono grid h-7 w-8 shrink-0 place-items-center ${leccion.hecha ? 'bg-emerald-400/20 text-emerald-300' : 'bg-black/30 text-white/60'}`}
                      aria-hidden="true"
                    >
                      {leccion.hecha ? <IconoPalomita className="h-3.5 w-3.5" /> : Icono ? <Icono className="h-4 w-4" /> : <span className="font-mono text-[11px]">{i + 1}</span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate ${leccion.hecha ? 'text-white/60' : 'text-white'}`}>{leccion.titulo}</span>
                    </span>
                    {leccion.minutos && <span className="shrink-0 font-mono text-[11px] text-white/40">{leccion.minutos} min</span>}
                    {leccion.hecha && <span className="sr-only">(hecha)</span>}
                  </a>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </li>
  );
}

// La herramienta del programa como un paso más: en Blender va antes (se prepara una vez), en
// A-Frame al final (es el taller libre).
function PasoHerramienta({ software, alInicio }) {
  const herramienta = software.herramienta;
  if (!herramienta) return null;
  return (
    <a
      href={herramienta.href}
      className={`corte-poly-sm elevar flex items-center gap-3 border border-dashed p-3 sm:p-4 ${
        software.acento === 'blender' ? 'border-blender/40 bg-blender/5 hover:border-blender' : 'border-neon/40 bg-neon/5 hover:border-neon'
      } ${alInicio ? 'mb-4' : 'mt-4'}`}
    >
      <span className="hexagono grid h-11 w-12 shrink-0 place-items-center bg-black/40">
        <LogoSoftware software={software} className="h-6 w-7 text-[11px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[11px] uppercase tracking-widest text-white/50">{alInicio ? 'Antes del paso 1 · una sola vez' : 'Cuando quieras · crea libre'}</span>
        <span className="block font-extrabold text-white">{herramienta.nombre}</span>
        <span className="block text-sm text-texto/70">
          {alInicio
            ? 'Instala Blender y el add-on, y conecta tu cuenta. La página te lleva de la mano: no tienes que programar.'
            : 'Arma tu propia escena con plantillas y piezas, mírala al instante y descárgala como página web.'}
        </span>
      </span>
      <span className="shrink-0 font-mono text-xs font-bold uppercase tracking-widest text-white/70">{herramienta.texto} ▸</span>
    </a>
  );
}

function Camino({ camino }) {
  const { software } = camino;
  const [abiertos, setAbiertos] = useState(() => new Set(camino.siguiente ? [camino.siguiente.id] : []));
  const alternar = (id) =>
    setAbiertos((previos) => {
      const nuevos = new Set(previos);
      if (nuevos.has(id)) nuevos.delete(id);
      else nuevos.add(id);
      return nuevos;
    });

  if (!camino.disponible) {
    return (
      <div className="corte-poly-sm border border-dashed border-white/15 bg-superficie/60 p-6 text-center">
        <LogoSoftware software={software} className="mx-auto h-12 w-14 text-base" />
        <p className="mt-3 text-xl font-extrabold text-white">{software.nombre} llega pronto</p>
        <p className="mx-auto mt-2 max-w-xl text-texto/75">{software.descripcion}</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {software.disciplinas.map((id) => (
            <li key={id} className="corte-poly-sm border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-white/60">
              {disciplinaPorId(id)?.nombre ?? id}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-white/50">Mientras tanto, lo que aprendas en Blender te sirve: los conceptos de 3D son los mismos en todos los programas.</p>
      </div>
    );
  }

  const herramientaPrimero = software.id === 'blender';
  return (
    <div>
      {herramientaPrimero && <PasoHerramienta software={software} alInicio />}
      <div className="grid gap-6 [&>*]:min-w-0">
        {camino.niveles.map(({ curso, pasos, hechos, total, minutos }, indice) => (
          <section key={curso.id} aria-labelledby={`nivel-${curso.id}`}>
            <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/5 pb-2">
              <div className="min-w-0">
                <h3 id={`nivel-${curso.id}`} className="text-lg font-extrabold text-white">
                  <span className="mr-2 font-mono text-xs uppercase tracking-widest text-white/40">Nivel {indice + 1}</span>
                  {curso.titulo}
                </h3>
                {curso.para && <p className="text-sm text-texto/65">{curso.para}</p>}
              </div>
              <p className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-white/50">
                {curso.estado === 'bloqueado' ? (
                  <span>Se abre más adelante</span>
                ) : (
                  <>
                    <span>
                      {hechos} / {total} pasos
                    </span>
                    {minutos > 0 && <span>{horas(minutos)}</span>}
                    <a href={rutas.curso(curso.id)} className="boton boton--secundario boton--chico -my-1 normal-case tracking-normal">
                      Ver el curso <span className="boton__flecha" aria-hidden="true">▸</span>
                    </a>
                  </>
                )}
              </p>
            </header>
            {curso.estado === 'bloqueado' ? (
              <p className="corte-poly-sm flex items-center gap-3 border border-dashed border-white/10 bg-superficie/50 p-3 text-sm text-white/55">
                <IconoCandado className="h-4 w-4 shrink-0" />
                <span>Lo que vendrá: {pasos.map((p) => p.titulo).join(' · ')}.</span>
              </p>
            ) : (
              <ol className="camino">
                {pasos.map((paso, i) => (
                  <Paso key={paso.id} paso={paso} abierto={abiertos.has(paso.id)} alternar={() => alternar(paso.id)} ultimo={i === pasos.length - 1} />
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>
      {!herramientaPrimero && <PasoHerramienta software={software} />}
    </div>
  );
}

// «¿Qué quieres crear?»: un botón grande por programa (es la única elección que se pide).
function ElegirPrograma({ lista, elegido, elegir }) {
  return (
    <div role="tablist" aria-label="¿Qué quieres crear?" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" data-recorrido="programas">
      {lista.map((camino) => {
        const { software } = camino;
        const activo = software.id === elegido;
        return (
          <button
            key={software.id}
            type="button"
            role="tab"
            id={`tab-${software.id}`}
            aria-selected={activo}
            aria-controls="camino-programa"
            onClick={() => elegir(software.id)}
            className={`corte-poly-sm flex items-center gap-3 border p-3 text-left transition-colors ${
              activo
                ? 'border-neon bg-neon/10'
                : camino.disponible
                  ? 'border-white/10 bg-superficie/90 hover:border-white/30'
                  : 'border-dashed border-white/10 bg-superficie/50 hover:border-white/25'
            }`}
          >
            <span className="hexagono grid h-11 w-12 shrink-0 place-items-center bg-black/40">
              <LogoSoftware software={software} className="h-6 w-7 text-[11px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold leading-snug text-white">{QUE_CREAS[software.id] ?? software.lema}</span>
              <span className={`block font-mono text-[11px] uppercase tracking-widest ${activo ? 'text-neon' : 'text-white/45'}`}>
                {software.nombre}
                {camino.disponible ? ` · ${plural(camino.total, 'paso', 'pasos')}` : ' · pronto'}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Inicio({ consulta = {} }) {
  const { cursos } = useCatalogo();
  const { progreso, xp, nivel } = useProgreso();
  const { usuario } = useAuth();
  const hayAvance = tieneAvance(progreso);
  const [continuar] = cursosParaContinuar(progreso, cursos);
  const lista = useMemo(() => caminos(cursos, progreso), [cursos, progreso]);
  const [elegido, setElegido] = useState(() =>
    programaInicial(lista, {
      elegido: consulta.programa ?? leerPrograma(),
      ultimoCurso: hayAvance ? continuar?.curso.id : null,
    }),
  );
  const camino = lista.find((c) => c.software.id === elegido) ?? lista[0];
  const elegir = (id) => {
    setElegido(id);
    guardarPrograma(id);
  };

  // El botón grande: la lección que sigue (con avance, donde te quedaste; sin avance, el paso 1).
  const siguiente = hayAvance && continuar ? { href: rutas.leccion(continuar.curso.id, continuar.resumen.siguiente.leccion.id), titulo: continuar.resumen.siguiente.leccion.title, curso: continuar.curso.titulo } : null;
  const primero = camino?.siguiente;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      {/* Bienvenida corta: qué es, que no hace falta saber nada y un solo botón. */}
      <section className="animar-entrar flex flex-col gap-6 sm:flex-row sm:items-center" aria-labelledby="inicio-titulo" data-recorrido="hero">
        <div className="relative hidden h-28 w-28 shrink-0 place-items-center sm:grid" aria-hidden="true">
          <div className="hexagono absolute inset-0 bg-gradient-to-br from-amatista/40 via-amatista-oscuro/50 to-transparent" />
          <CristalLogo className="animar-flotar relative h-14 w-14 drop-shadow-[0_0_20px_rgba(155,89,182,0.55)]" />
          <span className="hexagono absolute -left-2 top-1 grid h-9 w-10 place-items-center bg-superficie">
            <LogoCurso logo="blender" className="h-5 w-6" />
          </span>
          <span className="hexagono absolute -right-1 bottom-0 grid h-9 w-10 place-items-center bg-superficie">
            <LogoCurso logo="aframe" className="h-5 w-5" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">{hayAvance ? `Nivel ${nivel.nivel} · ${xp} XP` : 'No necesitas saber nada'}</p>
          <h1 id="inicio-titulo" className="mt-1 text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            {hayAvance ? (
              <>
                Sigue <span className="text-amatista-claro">donde te quedaste</span>
              </>
            ) : (
              <>
                Aprende 3D <span className="text-amatista-claro">paso a paso</span>
              </>
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-texto/80">
            {siguiente
              ? `Tu siguiente lección es «${siguiente.titulo}», en ${siguiente.curso}.`
              : 'Elige qué quieres crear y sigue los pasos en orden. Cada lección dura menos de diez minutos y te dice qué hacer.'}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {siguiente ? (
            <a href={siguiente.href} className={`${BOTON} destello bg-neon text-base transition-[filter] hover:brightness-110`}>
              ▶ Continuar
            </a>
          ) : (
            primero && (
              <a href={primero.href} className={`${BOTON} destello bg-neon text-base transition-[filter] hover:brightness-110`}>
                ▶ Empezar el paso 1
              </a>
            )
          )}
        </div>
      </section>

      <InvitacionRecorrido className="mt-8" />

      {/* El camino: elegir programa y la lista de pasos. */}
      <section className="mt-10" aria-labelledby="inicio-cursos" data-recorrido="cursos">
        <TituloSeccion
          id="inicio-cursos"
          className="mb-4"
          antetitulo="Cursos"
          titulo={
            <>
              ¿Qué quieres <span className="text-amatista-claro">crear</span>?
            </>
          }
          descripcion="Todos los cursos ya están ordenados para ti. Elige un programa y sigue su camino desde el paso marcado como Siguiente."
        />
        <ElegirPrograma lista={lista} elegido={camino?.software.id} elegir={elegir} />
        {camino && (
          <div id="camino-programa" role="tabpanel" aria-labelledby={`tab-${camino.software.id}`} className="mt-6">
            {camino.disponible && (
              <p className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/60">
                <span>
                  <strong className="text-white">{camino.software.nombre}</strong>: {camino.software.lema.toLowerCase()}.
                </span>
                <span className="font-mono text-[11px] uppercase tracking-widest">
                  {camino.hechos} de {camino.total} pasos hechos
                </span>
              </p>
            )}
            <Camino key={camino.software.id} camino={camino} />
          </div>
        )}
      </section>

      {/* Cómo es cada paso: la fórmula, compacta. */}
      <section className="mt-14" aria-labelledby="inicio-formula">
        <TituloSeccion
          id="inicio-formula"
          antetitulo="Así es cada paso"
          titulo={
            <>
              Cinco lecciones cortas y <span className="text-amatista-claro">una insignia</span>
            </>
          }
        />
        <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {FORMULA.map(({ paso, nombre, descripcion, Icono }, i) => (
            <li key={paso} className="corte-poly-sm flex flex-col gap-2 border border-white/10 bg-superficie/90 p-3">
              <span className="flex items-center gap-2">
                <span className="hexagono grid h-9 w-10 shrink-0 place-items-center bg-amatista-oscuro text-amatista-claro">
                  <Icono className="h-5 w-5" />
                </span>
                <span className="font-extrabold text-white">
                  <span className="mr-1 font-mono text-[11px] text-white/40">{i + 1}</span>
                  {nombre}
                </span>
              </span>
              <span className="text-xs leading-snug text-texto/65">{descripcion}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 flex items-center gap-2 text-sm text-white/55">
          <IconoRacha className="h-4 w-4 shrink-0 text-blender" />
          Ganas XP en cada lección, subes de nivel y mantienes tu racha diaria.
        </p>
      </section>

      {!usuario && (
        <section className="corte-poly mt-14 bg-gradient-to-br from-amatista via-amatista-oscuro to-superficie p-[2px]" aria-labelledby="inicio-cuenta">
          <div className="corte-poly flex flex-col gap-5 bg-superficie/95 p-6 sm:flex-row sm:items-center">
            <CristalLogo className="h-14 w-14 shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 id="inicio-cuenta" className="text-xl font-extrabold text-white">
                Guarda tu progreso en la nube
              </h2>
              <p className="mt-1 text-texto/75">
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
