import { agruparPorRuta, estadoNivel, resumenRuta } from '../../catalogo/agrupar';
import { resumenCurso } from '../../progreso/reglas';
import { rutas } from '../../rutas';
import AnilloProgreso from '../graficas/AnilloProgreso';
import { ACENTOS_GRAFICA } from '../graficas/colores';
import { IconoCandado } from '../Iconos';
import LogoCurso from '../LogoCurso';
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

const TEXTO_NIVEL = { completado: 'Completado', 'en-curso': 'En curso', disponible: 'Sin empezar', bloqueado: 'Próximamente' };

// Un nivel de la ruta en una fila: su avance y, si está en curso, el módulo que toca.
function FilaNivel({ curso, progreso, indice }) {
  const estado = estadoNivel(progreso, curso);
  const resumen = resumenCurso(progreso, curso);
  const modulo = estado === 'en-curso' ? curso.modulos.find((m) => estadoModulo(progreso, curso.id, m).estado !== 'completado') : null;
  const apagado = estado === 'bloqueado';
  return (
    <li className="flex items-center gap-3">
      <span
        className={`hexagono grid h-7 w-8 shrink-0 place-items-center font-mono text-[11px] font-bold ${
          estado === 'completado' ? 'bg-emerald-400 text-base' : apagado ? 'bg-white/10 text-white/45' : 'bg-white/15 text-white'
        }`}
        aria-hidden="true"
      >
        {estado === 'completado' ? <IconoPalomita className="h-3 w-3" /> : indice + 1}
      </span>
      <span className={`min-w-0 flex-1 text-sm leading-snug ${apagado ? 'text-white/45' : 'text-white'}`}>
        <span className="block">{curso.nivel || curso.titulo}</span>
        {modulo && <span className="block text-xs text-white/50">Ahora: módulo {modulo.numero} · {modulo.titulo}</span>}
      </span>
      {estado === 'en-curso' || estado === 'completado' ? (
        <EstadoModulo estado={estado} completadas={resumen.completadas} total={resumen.total} />
      ) : (
        <span className={`${CHIP} flex items-center gap-1 ${apagado ? 'text-white/35' : 'text-white/45'}`}>
          {apagado && <IconoCandado className="h-3 w-3" />}
          {TEXTO_NIVEL[estado]}
        </span>
      )}
    </li>
  );
}

// Una ruta (Blender, A-Frame) con todos sus niveles dentro, como en Cursos.
function TarjetaRuta({ ruta, progreso }) {
  const resumen = resumenRuta(progreso, ruta);
  const acento = ACENTOS_GRAFICA[ruta.acento] ?? ACENTOS_GRAFICA.neon;
  const varios = ruta.niveles.length > 1;

  return (
    <article className="corte-poly-sm flex flex-col border border-white/10 bg-base/60 p-4 sm:p-5" aria-labelledby={`avance-${ruta.id}`}>
      <div className="flex items-center gap-4">
        <AnilloProgreso
          valor={resumen.porcentaje / 100}
          tamano={84}
          grosor={7}
          color={acento.color}
          pista={acento.pista}
          etiqueta={`Avance en ${ruta.titulo}`}
          textoValor={`${resumen.porcentaje} %: ${resumen.completadas} de ${resumen.total} lecciones`}
        >
          <span className="text-lg font-extrabold text-white" aria-hidden="true">
            {resumen.porcentaje}%
          </span>
        </AnilloProgreso>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/50">
            <LogoCurso logo={ruta.logo} className="h-4 w-4" /> Curso {ruta.numero}
            {varios ? ` · ${ruta.niveles.length} niveles` : ''}
          </p>
          <h3 id={`avance-${ruta.id}`} className="text-2xl font-extrabold text-white">
            {ruta.titulo}
          </h3>
          <p className="text-sm text-white/60">
            {resumen.completadas} de {resumen.total} {resumen.total === 1 ? 'lección' : 'lecciones'}
          </p>
        </div>
      </div>

      {varios ? (
        <ol className="mt-4 grid gap-2" aria-label={`Niveles de ${ruta.titulo}`}>
          {ruta.niveles.map((curso, i) => (
            <FilaNivel key={curso.id} curso={curso} progreso={progreso} indice={i} />
          ))}
        </ol>
      ) : (
        <ul className="mt-4 grid gap-2" aria-label={`Módulos de ${ruta.titulo}`}>
          {ruta.niveles[0].modulos.map((modulo) => {
            const estado = estadoModulo(progreso, ruta.niveles[0].id, modulo);
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
      )}

      <a
        href={rutas.curso(ruta.id)}
        className="mt-auto self-start pt-4 font-mono text-xs font-bold uppercase tracking-widest text-neon underline-offset-4 hover:underline"
      >
        Ver curso<span className="sr-only"> {ruta.titulo}</span> ▸
      </a>
    </article>
  );
}

// Avance por curso medido contra el catálogo vigente: una tarjeta por ruta, con sus niveles dentro.
function CursosPanel({ progreso, cursos, className = '' }) {
  const rutasDelCatalogo = agruparPorRuta(cursos);
  return (
    <Seccion id="panel-cursos" etiqueta="Tu ruta" titulo="Cursos" className={className}>
      {rutasDelCatalogo.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {rutasDelCatalogo.map((ruta) => (
            <TarjetaRuta key={ruta.id} ruta={ruta} progreso={progreso} />
          ))}
        </div>
      ) : (
        <p className="text-texto/75">Aún no hay cursos en el catálogo.</p>
      )}
    </Seccion>
  );
}

export default CursosPanel;
