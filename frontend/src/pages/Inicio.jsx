// Portada y página «Cursos» (#/): todo el catálogo compactado en un camino guiado.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../auth/contexto';
import { useCatalogo } from '../catalogo/contexto';
import { caminos, programaInicial } from '../catalogo/camino';
import TituloSeccion from '../components/estructura/TituloSeccion';
import InvitacionRecorrido from '../components/InvitacionRecorrido';
import CentroNotificaciones from '../components/CentroNotificaciones';
import { CristalLogo } from '../components/Iconos';
import { cursosParaContinuar, tieneAvance } from '../components/panel/datos';
import { FORMULA } from '../components/panel/formula';
import { IconoRacha } from '../components/panel/IconosPanel';
import { useProgreso } from '../progreso/contexto';
import { rutaEntrar, rutas } from '../rutas';
import EmblemaHeroe from '../components/inicio/EmblemaHeroe';
import Camino from '../components/inicio/Camino';
import ElegirPrograma from '../components/inicio/ElegirPrograma';
import { CLAVE_PROGRAMA, COLORES_CHISPA, SECRETOS_CRISTAL } from '../components/inicio/constantes';

const BOTON = 'boton boton--grande';

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
  const nombreUsuario = (usuario?.nombre || '').trim().split(/\s+/)[0];

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <CentroNotificaciones leccionSiguiente={siguiente || primero} className="mb-6" />
      {/* Bienvenida corta: qué es, que no hace falta saber nada y un solo botón. */}
      <section className="animar-entrar flex flex-col gap-6 sm:flex-row sm:items-center" aria-labelledby="inicio-titulo" data-recorrido="hero">
        <EmblemaHeroe alTocar={tocarCristal} girando={girandoCristal} chispas={chispasCristal} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">{hayAvance ? `Nivel ${nivel.nivel} · ${xp} XP` : 'No necesitas saber nada'}</p>
          <h1 id="inicio-titulo" className="mt-1 text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            {nombreUsuario && <span className="block text-2xl font-bold text-amatista-claro sm:text-3xl">¡Hola, {nombreUsuario}!</span>}
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
              : nombreUsuario
                ? `Bienvenido a tu taller 3D, ${nombreUsuario}. Elige qué quieres crear y sigue los pasos en orden. Cada lección dura menos de diez minutos.`
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
