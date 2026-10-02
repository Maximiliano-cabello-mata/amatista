import { useProgreso } from '../progreso/contexto';
import { resumenCurso, resumenModulo } from '../progreso/reglas';
import { rutas } from '../rutas';
import { CristalLogo, IconoCandado } from './Iconos';
import { ACENTOS, ICONOS_CURSO } from './estiloCurso';

function TarjetaCurso({ curso, indice }) {
  const { progreso } = useProgreso();
  // Un curso publicado desde el servidor puede no tener ícono ni acento propios.
  const Icono = ICONOS_CURSO[curso.id] ?? CristalLogo;
  const acento = ACENTOS[curso.acento] ?? ACENTOS.neon;
  const bloqueado = curso.estado === 'bloqueado';
  const { total, completadas, siguiente, porcentaje } = resumenCurso(progreso, curso);

  let textoBoton = '▶ Comenzar';
  if (completadas > 0) textoBoton = siguiente ? '▶ Continuar' : '✓ Repasar';

  return (
    <article
      className={`corte-poly animar-entrar bg-gradient-to-br p-[2px] transition-transform duration-300 ${acento.borde} ${
        bloqueado ? 'opacity-80' : `hover:-translate-y-1 ${acento.brillo}`
      }`}
      style={{ animationDelay: `${indice * 120}ms` }}
      aria-labelledby={`curso-${curso.id}`}
    >
      <div className="corte-poly flex h-full flex-col gap-5 bg-superficie/95 p-6 sm:p-7">
        <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest">
          <span className="text-white/50">Curso {curso.numero}</span>
          {bloqueado ? (
            <span className="corte-poly-sm flex items-center gap-1.5 bg-white/5 px-2.5 py-1 text-white/60">
              <IconoCandado className="h-3 w-3" /> Próximamente
            </span>
          ) : (
            <span className={`corte-poly-sm px-2.5 py-1 font-bold text-base ${acento.fondo}`}>
              {porcentaje === 100 ? 'Completado' : 'Disponible'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-5">
          <div className="hexagono relative grid h-24 w-24 shrink-0 place-items-center bg-base">
            <Icono className={`h-16 w-16 ${bloqueado ? 'opacity-40 grayscale' : 'animar-flotar'}`} />
            {bloqueado && <IconoCandado className="absolute h-7 w-7 text-white/80" />}
          </div>
          <div>
            <h2 id={`curso-${curso.id}`} className="text-3xl font-extrabold text-white">
              {curso.titulo}
            </h2>
            <p className={`font-medium ${acento.texto}`}>{curso.subtitulo}</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-wider text-white/50">
              {curso.nivel} · {curso.modulos.length} módulos
            </p>
          </div>
        </div>

        <p className="leading-relaxed text-texto/80">{curso.descripcion}</p>

        {/* Ruta de módulos del curso */}
        <ol className="grid gap-2" aria-label={`Módulos de ${curso.titulo}`}>
          {curso.modulos.map((modulo) => {
            const publicado = Boolean(modulo.contenido) && !bloqueado;
            const nuevas = publicado ? resumenModulo(progreso, curso.id, modulo).nuevas : 0;
            return (
              <li key={modulo.id} className="flex items-center gap-3">
                <span
                  className={`hexagono grid h-7 w-8 shrink-0 place-items-center font-mono text-[11px] font-bold ${
                    publicado ? `${acento.fondo} text-base` : 'bg-white/10 text-white/50'
                  }`}
                >
                  {modulo.numero}
                </span>
                <span className={publicado ? 'text-white' : 'text-white/45'}>{modulo.titulo}</span>
                {nuevas > 0 && (
                  <span className="corte-poly-sm bg-neon/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-neon">
                    Nuevo
                  </span>
                )}
                <span
                  className={`ml-auto font-mono text-[10px] uppercase tracking-widest ${
                    publicado ? acento.texto : 'text-white/30'
                  }`}
                >
                  {publicado ? `${modulo.contenido.lessons.length} lecciones` : 'Pronto'}
                </span>
              </li>
            );
          })}
        </ol>

        <div>
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

        <div className="mt-auto">
          {bloqueado ? (
            <>
              <button
                type="button"
                disabled
                className="corte-poly-sm flex w-full cursor-not-allowed items-center justify-center gap-2 bg-white/5 py-3 font-bold uppercase tracking-widest text-white/40"
              >
                <IconoCandado className="h-4 w-4" /> Bloqueado
              </button>
              {curso.requisito && (
                <p className="mt-2 text-center font-mono text-xs text-white/45">{curso.requisito}</p>
              )}
            </>
          ) : (
            <a
              href={rutas.curso(curso.id)}
              className={`corte-poly-sm block w-full py-3 text-center font-extrabold uppercase tracking-widest text-base transition-[filter] hover:brightness-110 ${acento.fondo}`}
            >
              {textoBoton}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default TarjetaCurso;
