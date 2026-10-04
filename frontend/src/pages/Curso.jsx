import { useCatalogo } from '../catalogo/contexto';
import { IconoCandado, CristalLogo } from '../components/Iconos';
import EstadoGuardado from '../components/EstadoGuardado';
import Etiqueta, { Etiquetas } from '../components/etiquetas/Etiqueta';
import { etiquetaLeccion, etiquetasModulo } from '../components/etiquetas/catalogo';
import { ACENTOS, ICONOS_CURSO } from '../components/estiloCurso';
import EstacionBlender from '../components/modulo/EstacionBlender';
import RutaModulo from '../components/modulo/RutaModulo';
import { duracionTexto, tituloCorto } from '../data/cursos';
import { estadoPractica, partesDelModulo } from '../modulos/practica';
import { useProgreso } from '../progreso/contexto';
import {
  estaCompletada,
  estaDesbloqueada,
  idInsignia,
  leccionEsNueva,
  resumenCurso,
  resumenModulo,
  tieneInsignia,
} from '../progreso/reglas';
import { rutas } from '../rutas';

function NodoLeccion({ numero, hecha, abierta, acento }) {
  if (hecha) {
    return (
      <span className={`hexagono relative z-10 grid h-11 w-12 shrink-0 place-items-center font-bold text-base ${acento.fondo}`}>
        ✓
      </span>
    );
  }
  if (abierta) {
    return (
      <span className="hexagono relative z-10 grid h-11 w-12 shrink-0 place-items-center bg-neon font-mono font-bold text-base">
        {numero}
      </span>
    );
  }
  return (
    <span className="hexagono relative z-10 grid h-11 w-12 shrink-0 place-items-center bg-[#2a2a2a] text-white/40">
      <IconoCandado className="h-4 w-4" />
    </span>
  );
}

function FilaLeccion({ curso, modulo, leccion, indice, acento, progreso }) {
  const hecha = estaCompletada(progreso, curso.id, leccion);
  const abierta = estaDesbloqueada(progreso, curso.id, modulo, indice);
  const nueva = leccionEsNueva(progreso, curso.id, modulo, indice);
  const actual = abierta && !hecha;
  const etiqueta = etiquetaLeccion(leccion);
  const fila = (
    <>
      <NodoLeccion numero={indice + 1} hecha={hecha} abierta={abierta} acento={acento} />
      <span className="min-w-0 flex-1">
        <span className={`flex flex-wrap items-center gap-2 font-semibold ${abierta ? 'text-white' : 'text-white/45'}`}>
          {leccion.title}
          {nueva && <Etiqueta texto="Nueva" tono="neon" />}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-2">
          <Etiqueta {...etiqueta} tono={abierta ? etiqueta.tono : 'gris'} />
          {leccion.durationSeconds ? (
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/40">
              {duracionTexto(leccion.durationSeconds)}
            </span>
          ) : null}
        </span>
      </span>
      <span
        className={`shrink-0 font-mono text-xs uppercase tracking-widest ${
          actual ? 'text-neon animar-pulso' : `hidden sm:inline ${hecha ? 'text-white/50' : 'text-white/30'}`
        }`}
      >
        {actual ? 'Jugar ▶' : hecha ? 'Repasar' : 'Bloqueada'}
      </span>
    </>
  );
  return (
    <li>
      {abierta ? (
        <a
          href={rutas.leccion(curso.id, leccion.id)}
          className={`corte-poly-sm flex items-center gap-4 px-3 py-3 transition-colors hover:bg-white/5 ${
            actual ? 'bg-neon/5' : ''
          }`}
        >
          {fila}
        </a>
      ) : (
        <div className="flex items-center gap-4 px-3 py-3" aria-disabled="true">
          {fila}
        </div>
      )}
    </li>
  );
}

function ListaLecciones({ items, ...props }) {
  if (!items.length) return null;
  return (
    <ol className="relative mt-5 space-y-2">
      <span className="absolute bottom-6 left-6 top-6 w-px bg-white/10" aria-hidden="true" />
      {items.map(({ leccion, indice }) => (
        <FilaLeccion key={leccion.id} leccion={leccion} indice={indice} {...props} />
      ))}
    </ol>
  );
}

// Un módulo: primero sus lecciones y al final la práctica en Blender (si la
// tiene). El examen final, si existe, va después de la práctica.
function MapaModulo({ curso, modulo, acento, progreso }) {
  const contenido = modulo.contenido;
  const numero = modulo.numero;
  const titulo = tituloCorto(contenido.title);
  const { total, completadas, nuevas } = resumenModulo(progreso, curso.id, modulo);
  const insigniaGanada = tieneInsignia(progreso.insignias, idInsignia(curso.id, modulo));
  const { antes, despues } = partesDelModulo(modulo);
  const practica = estadoPractica(progreso, curso.id, modulo);
  const props = { curso, modulo, acento, progreso };

  return (
    <section className={`corte-poly bg-gradient-to-br p-[2px] ${acento.borde}`} aria-labelledby={`modulo-${numero}`}>
      <div className="corte-poly bg-superficie/95 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-neon">Módulo {numero}</p>
            <h2 id={`modulo-${numero}`} className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
              {titulo}
            </h2>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-white/45">
            {completadas} / {total} lecciones
          </p>
        </div>
        <Etiquetas className="mt-3" lista={etiquetasModulo(contenido, { conPractica: Boolean(practica), nuevas })} />
        <p className="mt-3 leading-relaxed text-texto/75">{contenido.description}</p>
        <RutaModulo className="mt-4" lecciones={contenido.lessons} progreso={progreso} cursoId={curso.id} />

        <ListaLecciones items={antes} {...props} />
        <EstacionBlender cursoId={curso.id} estado={practica} />
        <ListaLecciones items={despues} {...props} />

        {modulo.insignia && (
          <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
            <CristalLogo className={`h-9 w-9 shrink-0 ${insigniaGanada ? 'animar-flotar' : 'opacity-35 grayscale'}`} />
            <p className="text-sm text-texto/75">
              Insignia <strong className="text-white">{modulo.insignia}</strong>
              {insigniaGanada ? ' · ¡desbloqueada!' : ' · aprueba el examen final para ganarla'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Curso({ cursoId }) {
  const { progreso } = useProgreso();
  const { buscarCurso } = useCatalogo();
  const curso = buscarCurso(cursoId);

  if (!curso) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-xl text-white">No encontramos este curso.</p>
        <a href={rutas.inicio} className="mt-4 inline-block text-neon">◂ Volver a los cursos</a>
      </main>
    );
  }

  const Icono = ICONOS_CURSO[curso.id] ?? CristalLogo;
  const acento = ACENTOS[curso.acento] ?? ACENTOS.neon;
  const { total, completadas, porcentaje, siguiente } = resumenCurso(progreso, curso);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
      <a href={rutas.inicio} className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-neon">
        ◂ Todos los cursos
      </a>

      <header className="animar-entrar mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="hexagono grid h-28 w-28 shrink-0 place-items-center bg-superficie">
          <Icono className="animar-flotar h-20 w-20" />
        </div>
        <div className="flex-1">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/50">Curso {curso.numero}</p>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">{curso.titulo}</h1>
          <p className={`text-lg font-medium ${acento.texto}`}>{curso.subtitulo}</p>
          <div className="mt-4 max-w-md">
            <div className="mb-1.5 flex justify-between font-mono text-[11px] uppercase tracking-wider text-white/50">
              <span>Progreso</span>
              <span>
                {completadas} / {total} lecciones
              </span>
            </div>
            <div
              className="h-2 bg-white/10"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={completadas}
              aria-label={`Progreso en ${curso.titulo}`}
            >
              <div className={`h-full transition-[width] duration-500 ${acento.fondo}`} style={{ width: `${porcentaje}%` }} />
            </div>
          </div>
        </div>
        {siguiente && (
          <a
            href={rutas.leccion(curso.id, siguiente.leccion.id)}
            className={`corte-poly-sm shrink-0 px-6 py-3 text-center font-extrabold uppercase tracking-widest text-base hover:brightness-110 ${acento.fondo}`}
          >
            ▶ {completadas ? 'Continuar' : 'Comenzar'}
          </a>
        )}
      </header>

      <div className="mt-10 space-y-4">
        {curso.modulos.map((modulo) =>
          modulo.contenido ? (
            <MapaModulo key={modulo.id} curso={curso} modulo={modulo} acento={acento} progreso={progreso} />
          ) : (
            <div
              key={modulo.id}
              className="corte-poly-sm flex items-center justify-between gap-4 border border-white/5 bg-superficie/60 px-5 py-4"
            >
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-widest text-white/35">Módulo {modulo.numero}</span>
                <span className="font-semibold text-white/55">{modulo.titulo}</span>
              </span>
              <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/35">
                <IconoCandado className="h-3.5 w-3.5" /> Próximamente
              </span>
            </div>
          ),
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <EstadoGuardado />
        {curso.recurso && (
          <a
            href={curso.recurso.url}
            target="_blank"
            rel="noreferrer"
            className={`font-mono text-xs uppercase tracking-widest hover:underline ${acento.texto}`}
          >
            {curso.recurso.texto} ↗
          </a>
        )}
      </div>
    </main>
  );
}

export default Curso;
