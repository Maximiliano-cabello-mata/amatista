import { useEffect, useState } from 'react';
import { useCatalogo } from '../catalogo/contexto';
import { IconoCandado } from '../components/Iconos';
import BloqueContenido from '../components/leccion/BloqueContenido';
import Examen from '../components/leccion/Examen';
import Figura from '../components/leccion/Figura';
import { buscarLeccion, duracionTexto, TIPOS_LECCION } from '../data/cursos';
import { useProgreso } from '../progreso/contexto';
import {
  estaCompletada,
  estaDesbloqueada,
  idInsignia,
  leccionEsNueva,
  registroLeccion,
  XP_POR_LECCION,
} from '../progreso/reglas';
import { rutas } from '../rutas';

function Aviso({ titulo, texto, enlace, textoEnlace }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <IconoCandado className="mx-auto h-12 w-12 text-white/40" />
      <h1 className="mt-4 text-3xl font-extrabold text-white">{titulo}</h1>
      <p className="mt-3 text-texto/75">{texto}</p>
      <a
        href={enlace}
        className="corte-poly-sm mt-8 inline-block bg-amatista px-6 py-3 font-extrabold uppercase tracking-widest text-white hover:brightness-110"
      >
        {textoEnlace}
      </a>
    </main>
  );
}

// Contenido de una lección que no es examen, con su botón para completarla.
function ContenidoLeccion({ curso, leccion, completada, anterior, siguiente, alCompletar }) {
  const requiereTarjetas = !completada && leccion.contentBlocks.some((b) => b.type === 'concept_cards');
  const [tarjetasListas, setTarjetasListas] = useState(false);
  const bloqueado = requiereTarjetas && !tarjetasListas;

  const continuar = () => {
    if (!completada) alCompletar();
    window.location.hash = siguiente ? rutas.leccion(curso.id, siguiente.id) : rutas.curso(curso.id);
  };

  let textoBoton = 'Completar lección ▶';
  if (completada) textoBoton = siguiente ? 'Siguiente lección ▶' : 'Volver al curso ▶';
  else if (siguiente?.type === 'exam') textoBoton = 'Completar e ir al examen ▶';

  return (
    <>
      <div className="space-y-8">
        {leccion.contentBlocks.map((bloque, i) => (
          <BloqueContenido key={i} bloque={bloque} alDescubrirTodas={() => setTarjetasListas(true)} />
        ))}
      </div>

      <footer className="mt-12 flex flex-col-reverse gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-start sm:justify-between">
        {anterior ? (
          <a
            href={rutas.leccion(curso.id, anterior.id)}
            className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-neon sm:pt-4"
          >
            ◂ {anterior.title}
          </a>
        ) : (
          <span />
        )}
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <button
            type="button"
            onClick={continuar}
            disabled={bloqueado}
            className="corte-poly-sm bg-amatista px-6 py-3 font-extrabold uppercase tracking-widest text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {textoBoton}
          </button>
          {!completada && (
            <span className="text-center font-mono text-xs text-white/50 sm:text-right">
              {bloqueado ? 'Descubre todas las tarjetas para continuar' : `+${XP_POR_LECCION} XP`}
            </span>
          )}
        </div>
      </footer>
    </>
  );
}

function Leccion({ cursoId, leccionId }) {
  const { progreso, completarLeccion, registrarExamen, otorgarInsignia, registrarSesionAprendizaje } = useProgreso();
  const { buscarCurso } = useCatalogo();
  const curso = buscarCurso(cursoId);
  const ubicacion = curso && buscarLeccion(curso, leccionId);
  const abierta = Boolean(ubicacion) && estaDesbloqueada(progreso, curso.id, ubicacion.modulo, ubicacion.indice);
  const idAbierta = abierta ? ubicacion.leccion.id : null;

  // learning_session_started: el proveedor lo registra una vez por lección y día.
  useEffect(() => {
    if (idAbierta) registrarSesionAprendizaje(cursoId, idAbierta);
  }, [cursoId, idAbierta, registrarSesionAprendizaje]);

  if (!ubicacion) {
    return (
      <Aviso
        titulo="No encontramos esta lección"
        texto="Puede que el enlace esté mal escrito o que la lección se haya movido."
        enlace={curso ? rutas.curso(curso.id) : rutas.inicio}
        textoEnlace="◂ Volver"
      />
    );
  }

  const { modulo, leccion, indice } = ubicacion;
  const lecciones = modulo.contenido.lessons;
  const anterior = lecciones[indice - 1];
  const siguiente = lecciones[indice + 1];

  if (!abierta) {
    return (
      <Aviso
        titulo="Lección bloqueada"
        texto={`Completa «${anterior.title}» para desbloquearla.`}
        enlace={rutas.leccion(curso.id, anterior.id)}
        textoEnlace="Ir a la lección anterior ▶"
      />
    );
  }

  const completada = estaCompletada(progreso, curso.id, leccion);
  const nueva = leccionEsNueva(progreso, curso.id, modulo, indice);
  const numeroModulo = modulo.numero;
  const duracion = duracionTexto(leccion.durationSeconds);
  const esUltima = indice === lecciones.length - 1;

  // El examen final del módulo (el "jefe") desbloquea su insignia.
  const terminarExamen = (puntaje, aprobado) => {
    registrarExamen(curso.id, leccion.id, puntaje, aprobado);
    if (aprobado && esUltima) otorgarInsignia(idInsignia(curso.id, modulo));
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <nav className="mb-4 flex items-center justify-between gap-3 font-mono text-xs uppercase tracking-widest">
        <a href={rutas.curso(curso.id)} className="text-white/50 hover:text-neon">
          ◂ {curso.titulo} · Módulo {numeroModulo}
        </a>
        <span className="shrink-0 text-white/40">
          Lección {indice + 1} de {lecciones.length}
        </span>
      </nav>

      <ol className="mb-8 flex gap-1.5" aria-label="Avance del módulo">
        {lecciones.map((l, i) => {
          const hecha = estaCompletada(progreso, curso.id, l);
          return (
            <li
              key={l.id}
              className={`h-1.5 flex-1 ${i === indice ? 'bg-neon' : hecha ? 'bg-amatista' : 'bg-white/10'}`}
            >
              <span className="sr-only">
                {l.title}: {hecha ? 'completada' : i === indice ? 'actual' : 'pendiente'}
              </span>
            </li>
          );
        })}
      </ol>

      <header className="animar-entrar mb-8">
        <div className="mb-3 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-widest">
          <span className="corte-poly-sm bg-amatista/25 px-2.5 py-1 text-amatista-claro">{TIPOS_LECCION[leccion.type]}</span>
          {duracion && <span className="corte-poly-sm bg-white/5 px-2.5 py-1 text-white/55">{duracion}</span>}
          {completada && <span className="corte-poly-sm bg-emerald-400/10 px-2.5 py-1 text-emerald-300">✓ Completada</span>}
          {nueva && <span className="corte-poly-sm bg-neon/15 px-2.5 py-1 font-bold text-neon">Nueva</span>}
        </div>
        <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">{leccion.title}</h1>
      </header>

      {leccion.cover && (
        <div className="mb-10">
          <Figura src={leccion.cover.src} alt={leccion.cover.alt} prioridad />
        </div>
      )}

      {leccion.type === 'exam' ? (
        <Examen
          key={leccion.id}
          quiz={leccion.quizData}
          registroPrevio={registroLeccion(progreso, curso.id, leccion.id)}
          insignia={modulo.insignia}
          completaModulo={esUltima}
          hrefCurso={rutas.curso(curso.id)}
          alTerminar={terminarExamen}
        />
      ) : (
        <ContenidoLeccion
          key={leccion.id}
          curso={curso}
          leccion={leccion}
          completada={completada}
          anterior={anterior}
          siguiente={siguiente}
          alCompletar={() => completarLeccion(curso.id, leccion.id)}
        />
      )}
    </main>
  );
}

export default Leccion;
