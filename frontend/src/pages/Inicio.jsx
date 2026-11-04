// Portada y página «Cursos» (#/, 2026-10-23): todo el catálogo compactado en un camino guiado.
// Quien llega no sabe qué cursos hay, así que no se le pide buscar: primero elige qué quiere
// crear (un programa) y ve una sola lista numerada, en orden, con el paso que le toca resaltado.
// Cada paso es un módulo: una línea de lo que vas a lograr, sus lecciones al tocarlo y un botón
// que abre la lección que sigue. Reemplaza a Explorar (buscador y filtros del 21 de octubre).
// Todo sale del catálogo vigente y del progreso local (catalogo/camino.js).
import { useEffect, useMemo, useRef, useState } from 'react';
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
import Escenario from '../components/temas/Escenario';
import Jefe from '../components/temas/Jefe';
import Personaje from '../components/temas/Personaje';
import { mensajesDeMascota, temaDelModulo } from '../components/temas/temas';
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

const SECRETOS_CRISTAL = [
  'Cada paso tiene su propio mundo, una mascota que te sigue con la mirada y un jefe final.',
  'Toca a la mascota de cualquier paso para que haga una pirueta y te dé un consejo de su mundo.',
  'Todo tu progreso se guarda primero en tu dispositivo: puedes avanzar incluso sin Internet.',
  'Abajo a la izquierda vive Goliat: tócalo si quieres una idea de proyecto o te atoras.',
];

const COLORES_CHISPA = ['#9b59b6', '#00e5ff', '#f5792a', '#c39bd3'];

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

// Emblema interactivo del héroe: al tocarlo gira el cristal, lanza chispas multicolor y revela un detalle.
function EmblemaHeroe({ alTocar, girando, chispas }) {
  return (
    <button
      type="button"
      onClick={alTocar}
      aria-label="Tocar el cristal de Amatista"
      title="Tócame"
      className={`emblema-heroe group relative hidden h-28 w-28 shrink-0 place-items-center sm:grid ${girando ? 'emblema-heroe--giro' : ''}`}
    >
      <span className="hexagono absolute inset-0 bg-gradient-to-br from-amatista/40 via-amatista-oscuro/50 to-transparent transition-transform duration-300 group-hover:scale-105" />
      <CristalLogo className="emblema-heroe__cristal animar-flotar relative h-14 w-14 drop-shadow-[0_0_20px_rgba(155,89,182,0.55)]" />
      <span className="emblema-heroe__satelite hexagono absolute -left-2 top-1 grid h-9 w-10 place-items-center bg-superficie">
        <LogoCurso logo="blender" className="h-5 w-6" />
      </span>
      <span className="emblema-heroe__satelite emblema-heroe__satelite--tarde hexagono absolute -right-1 bottom-0 grid h-9 w-10 place-items-center bg-superficie">
        <LogoCurso logo="aframe" className="h-5 w-5" />
      </span>
      {chispas.map((c) => (
        <span
          key={c.id}
          className="personaje__chispa"
          style={{ '--dx': `${c.dx}px`, '--dy': `${c.dy}px`, '--acento': c.color }}
          aria-hidden="true"
        />
      ))}
    </button>
  );
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

// Un paso del camino: compacto (una línea de lo que logras), con su mundo y mascota viva, y al tocarlo sus lecciones.
function Paso({ paso, abierto, alternar, ultimo }) {
  const estado = ESTADOS[paso.estado] ?? ESTADOS.disponible;
  const conContenido = paso.lecciones.length > 0 && paso.estado !== 'bloqueado';
  const idLista = `paso-${paso.id.replace(/[^a-z0-9_-]/gi, '-')}`;
  const accion = paso.estado === 'hecho' ? 'Repasar' : paso.estado === 'en-curso' || (paso.estado === 'siguiente' && paso.hechas) ? 'Seguir' : paso.estado === 'siguiente' ? 'Empezar' : 'Abrir';
  const tema = useMemo(() => temaDelModulo(paso.modulo), [paso.modulo]);
  const frases = useMemo(() => mensajesDeMascota(tema?.mascota), [tema]);
  const [fraseIdx, setFraseIdx] = useState(-1);
  const relojFrase = useRef(null);

  useEffect(() => () => window.clearTimeout(relojFrase.current), []);

  const tocarMascota = () => {
    if (!frases.length) return;
    setFraseIdx((prev) => (prev + 1) % frases.length);
    window.clearTimeout(relojFrase.current);
    relojFrase.current = window.setTimeout(() => setFraseIdx(-1), 6500);
  };

  const fraseActual = fraseIdx >= 0 ? frases[fraseIdx] : null;

  return (
    <li className={`camino__paso group/paso relative flex gap-3 sm:gap-4 ${ultimo ? '' : 'pb-3'}`} data-estado={paso.estado}>
      {!ultimo && <span className="camino__linea absolute bottom-0 left-6 top-11 w-px" aria-hidden="true" />}
      <Hexagono paso={paso} />
      <div
        className={`corte-poly-sm relative min-w-0 flex-1 overflow-hidden border transition-colors ${
          paso.estado === 'siguiente' ? 'border-neon/50 bg-gradient-to-r from-neon/10 to-superficie/95' : 'border-white/10 bg-superficie/90'
        }`}
      >
        {conContenido && (
          <>
            <Escenario
              tema={tema}
              className={`pointer-events-none absolute inset-x-0 top-0 h-28 w-full transition-opacity duration-500 ${
                paso.estado === 'siguiente' || abierto ? 'opacity-35 group-hover/paso:opacity-50' : 'opacity-0 group-hover/paso:opacity-30'
              }`}
            />
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-superficie via-superficie/80 to-transparent"
              aria-hidden="true"
            />
          </>
        )}
        <div className="relative z-[1] flex flex-wrap items-center gap-x-4 gap-y-2 p-3 sm:flex-nowrap sm:p-4">
          {conContenido && (
            <Personaje
              tema={tema}
              className="personaje--chico shrink-0"
              onToque={tocarMascota}
              etiqueta={`Tocar a ${tema.mascota?.nombre ?? 'la mascota'}, guía de ${paso.titulo}`}
            />
          )}
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
              {conContenido && tema?.nombre && (
                <span className={`hidden font-mono text-[10px] uppercase tracking-widest sm:inline ${tema.texto}`}>
                  · {tema.nombre}
                </span>
              )}
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
        {fraseActual && (
          <div
            key={fraseIdx}
            role="status"
            style={{ '--acento': tema?.colores?.acento }}
            className="companero__globo globo relative z-[1] mx-3 mb-3 flex items-start justify-between gap-3 sm:mx-4"
          >
            <div className="min-w-0">
              <span className="companero__quien">{tema?.mascota?.nombre ?? 'Guía'} · {tema?.nombre}</span>
              <p className="text-sm text-white/90">{fraseActual.texto}</p>
            </div>
            <button
              type="button"
              onClick={() => setFraseIdx(-1)}
              aria-label="Cerrar mensaje de la mascota"
              className="shrink-0 font-mono text-xs text-white/50 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
        {conContenido && abierto && (
          <ol id={idLista} className="animar-entrar relative z-[1] grid gap-px [&>*]:min-w-0 border-t border-white/5 bg-white/5 sm:grid-cols-2">
            {paso.lecciones.map((leccion, i) => {
              const Icono = ICONO_FORMULA[leccion.formula];
              const esJefe = leccion.formula === 'jefe';
              return (
                <li key={leccion.id} className="bg-superficie/95">
                  <a href={leccion.href} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 sm:px-4">
                    <span
                      className={`hexagono grid h-7 w-8 shrink-0 place-items-center ${leccion.hecha ? 'bg-emerald-400/20 text-emerald-300' : 'bg-black/30 text-white/60'}`}
                      aria-hidden="true"
                    >
                      {esJefe && tema?.jefe ? (
                        <Jefe jefe={tema.jefe} derrotado={leccion.hecha} className="h-6 w-6" />
                      ) : leccion.hecha ? (
                        <IconoPalomita className="h-3.5 w-3.5" />
                      ) : Icono ? (
                        <Icono className="h-4 w-4" />
                      ) : (
                        <span className="font-mono text-[11px]">{i + 1}</span>
                      )}
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

// La herramienta del programa como un paso más: en Blender ofrece tanto conectar el motor en tu PC
// como abrir Blender en la nube o revisar tu PC con Geoda; en A-Frame va al final (es el taller libre).
function PasoHerramienta({ software, alInicio }) {
  const herramienta = software.herramienta;
  if (!herramienta) return null;
  if (software.id === 'blender' && alInicio) {
    return (
      <div className="mb-5 grid gap-2.5 sm:grid-cols-2">
        <a
          href={herramienta.href}
          className="corte-poly-sm elevar flex items-center gap-3 border border-blender/45 bg-blender/10 p-3.5 transition-colors hover:border-blender sm:p-4"
        >
          <span className="hexagono grid h-11 w-12 shrink-0 place-items-center bg-black/40">
            <LogoSoftware software={software} className="h-6 w-7 text-[11px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-blender">
              Opción A · En tu computadora (una sola vez)
            </span>
            <span className="block font-extrabold text-white">Conectar mi Blender ({herramienta.nombre})</span>
            <span className="mt-0.5 block text-xs leading-snug text-texto/75">
              Descarga el complemento y vincula tu Blender para que te guíe en cada práctica.
            </span>
          </span>
          <span className="shrink-0 font-mono text-xs font-bold uppercase tracking-widest text-blender">Conectar ▸</span>
        </a>

        <div className="grid gap-2">
          <a
            href={rutas.nube}
            className="corte-poly-sm elevar flex items-center justify-between gap-3 border border-neon/40 bg-neon/5 px-3.5 py-2.5 transition-colors hover:border-neon"
          >
            <span className="min-w-0">
              <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-neon">
                <span>Opción B · Sin instalar</span>
                <span className="border border-neon/40 bg-neon/15 px-1.5 py-0.2 text-[9px]">UTN</span>
              </span>
              <span className="block text-sm font-extrabold text-white">Abrir Blender en la nube</span>
            </span>
            <span className="shrink-0 font-mono text-xs font-bold uppercase tracking-widest text-neon">Abrir ▸</span>
          </a>

          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-white/55">
            <a href={rutas.geoda} className="hover:text-emerald-300 hover:underline">
              ¿No sabes si tu PC corre Blender? Revísala con Geoda ▸
            </a>
            <a href={rutas.biblioteca} className="hover:text-amatista-claro hover:underline">
              Biblioteca 3D ▸
            </a>
          </div>
        </div>
      </div>
    );
  }
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
  const [secretoIdx, setSecretoIdx] = useState(-1);
  const [girandoCristal, setGirandoCristal] = useState(false);
  const [chispasCristal, setChispasCristal] = useState([]);
  const relojSecreto = useRef(null);

  useEffect(() => () => window.clearTimeout(relojSecreto.current), []);

  const tocarCristal = () => {
    const clave = Date.now();
    setGirandoCristal(false);
    window.requestAnimationFrame(() => setGirandoCristal(true));
    setChispasCristal(
      Array.from({ length: 10 }, (_, i) => {
        const angulo = (i / 10) * Math.PI * 2 + Math.random() * 0.4;
        const largo = 34 + Math.random() * 22;
        return {
          id: `${clave}-${i}`,
          dx: Math.cos(angulo) * largo,
          dy: Math.sin(angulo) * largo - 10,
          color: COLORES_CHISPA[i % COLORES_CHISPA.length],
        };
      }),
    );
    setSecretoIdx((prev) => (prev + 1) % SECRETOS_CRISTAL.length);
    window.clearTimeout(relojSecreto.current);
    relojSecreto.current = window.setTimeout(() => {
      setGirandoCristal(false);
      setChispasCristal([]);
    }, 850);
  };

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
        <EmblemaHeroe alTocar={tocarCristal} girando={girandoCristal} chispas={chispasCristal} />
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
          {secretoIdx >= 0 && (
            <p
              key={secretoIdx}
              role="status"
              className="corte-poly-sm animar-aparecer mt-3 inline-flex items-center gap-2 border border-amatista-claro/40 bg-amatista/15 px-3 py-1.5 text-xs text-amatista-claro"
            >
              <span className="h-2 w-2 rotate-45 bg-neon" aria-hidden="true" />
              <span>{SECRETOS_CRISTAL[secretoIdx]}</span>
            </p>
          )}
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
