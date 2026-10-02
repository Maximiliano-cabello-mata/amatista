import { rutas } from '../../rutas';
import Medidor from '../graficas/Medidor';
import { ACENTOS_GRAFICA, COLORES } from '../graficas/colores';
import { IconoCandado } from '../Iconos';
import { examenesDelCatalogo } from './datos';
import { IconoJefe, IconoPalomita } from './IconosPanel';
import Seccion from './Seccion';

const CHIP = 'corte-poly-sm flex shrink-0 items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest';

const ESTADOS = {
  aprobado: { texto: 'Aprobado', clase: 'bg-amatista/25 text-amatista-claro', Icono: IconoPalomita },
  'por-aprobar': { texto: 'Por aprobar', clase: 'border border-blender/40 text-blender' },
  disponible: { texto: 'Disponible', clase: 'bg-neon/15 text-neon' },
  bloqueado: { texto: 'Bloqueado', clase: 'text-white/40', Icono: IconoCandado },
};

const ACCION = { aprobado: 'Repasar', 'por-aprobar': 'Reintentar', disponible: 'Presentar' };

function Examen({ examen }) {
  const { curso, modulo, leccion, minimo, mejor, intentos, estado, desbloqueado } = examen;
  const { texto, clase, Icono } = ESTADOS[estado];
  const color = estado === 'aprobado' ? (ACENTOS_GRAFICA[curso.acento] ?? ACENTOS_GRAFICA.neon).color : COLORES.amatista;
  const titulo = leccion.title.replace(/^(Examen|Prueba[^:]*):\s*/i, '');

  return (
    <li className="corte-poly-sm border border-white/5 bg-base/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            {curso.titulo} · Módulo {modulo.numero}
          </p>
          <p className="font-semibold leading-snug text-white">{titulo}</p>
        </div>
        <span className={`${CHIP} ${clase}`}>
          {Icono && <Icono className="h-3 w-3" />}
          {texto}
        </span>
      </div>
      <Medidor
        className="mt-3"
        valor={mejor ?? 0}
        maximo={100}
        marca={minimo}
        color={color}
        etiqueta={`Mejor puntaje en ${leccion.title}`}
        textoValor={
          mejor === null
            ? 'Sin intentos'
            : `${mejor} de 100${minimo === null ? '' : `; se aprueba con ${minimo}`}`
        }
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-[11px] text-white/55">
        <span>
          {mejor === null ? 'Sin intentos' : <>Mejor: <strong className="text-white">{mejor} %</strong></>}
          {intentos > 0 && ` · ${intentos} ${intentos === 1 ? 'intento' : 'intentos'}`}
          {minimo !== null && ` · mínimo ${minimo} %`}
        </span>
        {desbloqueado && ACCION[estado] && (
          <a
            href={rutas.leccion(curso.id, leccion.id)}
            className="font-bold uppercase tracking-widest text-neon underline-offset-4 hover:underline"
          >
            {ACCION[estado]}
            <span className="sr-only"> {leccion.title}</span> ▸
          </a>
        )}
      </div>
    </li>
  );
}

// Exámenes finales ("jefes") del catálogo vigente: mejor puntaje, intentos y la marca para aprobar.
function ExamenesPanel({ progreso, cursos, className = '' }) {
  const examenes = examenesDelCatalogo(progreso, cursos);
  const intentados = examenes.filter((examen) => examen.intentos > 0 || examen.aprobado).length;

  return (
    <Seccion id="panel-examenes" etiqueta="Jefes" titulo="Exámenes" className={className}>
      {examenes.length === 0 ? (
        <p className="text-texto/75">Aún no hay exámenes publicados.</p>
      ) : (
        <>
          {intentados === 0 && (
            <div className="mb-4 flex gap-3 text-sm text-texto/70">
              <IconoJefe className="h-6 w-6 shrink-0 text-amatista-claro" />
              <p>Cada módulo termina con un examen «jefe». Apruébalo para ganar su insignia; aquí verás tu mejor puntaje.</p>
            </div>
          )}
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {examenes.map((examen) => (
              <Examen key={`${examen.curso.id}:${examen.leccion.id}`} examen={examen} />
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/40">
            <span className="h-3 w-0.5 bg-white/80" aria-hidden="true" /> Marca: puntaje mínimo para aprobar
          </p>
        </>
      )}
    </Seccion>
  );
}

export default ExamenesPanel;
