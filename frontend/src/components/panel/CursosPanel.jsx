import { resumenCurso } from '../../progreso/reglas';
import { rutas } from '../../rutas';
import AnilloProgreso from '../graficas/AnilloProgreso';
import { ACENTOS_GRAFICA } from '../graficas/colores';
import { ICONOS_CURSO } from '../estiloCurso';
import { CristalLogo, IconoCandado } from '../Iconos';
import { estadoModulo } from './datos';
import { IconoPalomita } from './IconosPanel';
import Seccion from './Seccion';

const CHIP = 'corte-poly-sm shrink-0 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest';

function EstadoModulo({ estado, completadas, total, nuevas }) {
  switch (estado) {
    case 'completado':
      return (
        <span className={`${CHIP} flex items-center gap-1 bg-amatista/25 text-amatista-claro`}>
          <IconoPalomita className="h-3 w-3" /> Completado
        </span>
      );
    case 'nuevo':
      return (
        <span className={`${CHIP} bg-neon/15 text-neon`}>
          Nuevo contenido · {nuevas}
        </span>
      );
    case 'en-curso':
      return (
        <span className={`${CHIP} border border-white/15 text-white/80`}>
          En curso · {completadas}/{total}
        </span>
      );
    case 'proximamente':
      return (
        <span className={`${CHIP} flex items-center gap-1 text-white/35`}>
          <IconoCandado className="h-3 w-3" /> Próximamente
        </span>
      );
    default:
      return <span className={`${CHIP} text-white/45`}>Sin empezar</span>;
  }
}

function TarjetaAvance({ curso, progreso }) {
  const resumen = resumenCurso(progreso, curso);
  const acento = ACENTOS_GRAFICA[curso.acento] ?? ACENTOS_GRAFICA.neon;
  const Icono = ICONOS_CURSO[curso.id] ?? CristalLogo;

  return (
    <article className="corte-poly-sm flex flex-col border border-white/10 bg-base/60 p-4 sm:p-5" aria-labelledby={`avance-${curso.id}`}>
      <div className="flex items-center gap-4">
        <AnilloProgreso
          valor={resumen.porcentaje / 100}
          tamano={84}
          grosor={7}
          color={acento.color}
          pista={acento.pista}
          etiqueta={`Avance en ${curso.titulo}`}
          textoValor={`${resumen.porcentaje} %: ${resumen.completadas} de ${resumen.total} lecciones`}
        >
          <span className="text-lg font-extrabold text-white" aria-hidden="true">
            {resumen.porcentaje}%
          </span>
        </AnilloProgreso>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/50">
            <Icono className="h-4 w-4" /> Curso {curso.numero}
          </p>
          <h3 id={`avance-${curso.id}`} className="text-2xl font-extrabold text-white">
            {curso.titulo}
          </h3>
          <p className="text-sm text-white/60">
            {resumen.completadas} de {resumen.total} {resumen.total === 1 ? 'lección' : 'lecciones'}
          </p>
        </div>
      </div>

      <ul className="mt-4 grid gap-2" aria-label={`Módulos de ${curso.titulo}`}>
        {curso.modulos.map((modulo) => {
          const estado = estadoModulo(progreso, curso.id, modulo);
          const apagado = estado.estado === 'proximamente';
          return (
            <li key={modulo.id} className="flex items-center gap-3">
              <span
                className={`hexagono grid h-7 w-8 shrink-0 place-items-center font-mono text-[11px] font-bold ${
                  apagado ? 'bg-white/10 text-white/45' : 'bg-white/15 text-white'
                }`}
                aria-hidden="true"
              >
                {modulo.numero}
              </span>
              <span className={`min-w-0 flex-1 text-sm leading-snug ${apagado ? 'text-white/45' : 'text-white'}`}>
                <span className="sr-only">Módulo {modulo.numero}: </span>
                {modulo.titulo}
              </span>
              <EstadoModulo {...estado} />
            </li>
          );
        })}
      </ul>

      <a
        href={rutas.curso(curso.id)}
        className="mt-4 self-start font-mono text-xs font-bold uppercase tracking-widest text-neon underline-offset-4 hover:underline"
      >
        Ver curso<span className="sr-only"> {curso.titulo}</span> ▸
      </a>
    </article>
  );
}

// Avance por curso medido contra el catálogo vigente, con el estado de cada módulo.
function CursosPanel({ progreso, cursos, className = '' }) {
  return (
    <Seccion id="panel-cursos" etiqueta="Tu ruta" titulo="Cursos" className={className}>
      {cursos.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {cursos.map((curso) => (
            <TarjetaAvance key={curso.id} curso={curso} progreso={progreso} />
          ))}
        </div>
      ) : (
        <p className="text-texto/75">Aún no hay cursos en el catálogo.</p>
      )}
    </Seccion>
  );
}

export default CursosPanel;
