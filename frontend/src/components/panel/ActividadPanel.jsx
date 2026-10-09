import Barras from '../graficas/Barras';
import { fechaCorta } from '../graficas/fechas';
import LineaTendencia from '../graficas/LineaTendencia';
import MapaCalor from '../graficas/MapaCalor';
import { resumenSemana, seriePorSemana } from './retos';
import Seccion, { Cifra } from './Seccion';

const SEMANAS = 12;

function comparacion(actual, anterior) {
  if (actual === anterior) return `Igual que la semana pasada (${anterior})`;
  return `Semana pasada: ${anterior}`;
}

// Mapa de calor de las últimas 12 semanas, resumen de esta semana y lecciones por semana.
function ActividadPanel({ progreso, hoy, className = '' }) {
  const semana = resumenSemana(progreso, hoy);
  const serie = seriePorSemana(progreso, hoy, SEMANAS);
  const hayActividad = Object.values(progreso.actividad ?? {}).some((n) => n > 0);
  const hayLecciones = serie.some((s) => s.lecciones > 0);

  return (
    <Seccion id="panel-actividad" etiqueta="Constancia" titulo="Actividad" className={className}>
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
        <div className="min-w-0">
          <h3 className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-white/55">Últimas {SEMANAS} semanas</h3>
          <MapaCalor valores={progreso.actividad} hoy={hoy} semanas={SEMANAS} titulo="Actividad por día" />
          {!hayActividad && (
            <p className="mt-3 text-sm text-texto/70">
              Tu mapa se ilumina cada día que practicas: resuelve una actividad o completa una lección para encender la primera casilla.
            </p>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-white/55">
            Esta semana · {fechaCorta(semana.desde, { conDia: false })} – {fechaCorta(semana.hasta, { conDia: false })}
          </h3>
          <dl className="grid grid-cols-3 gap-2 sm:gap-3">
            <Cifra
              etiqueta="Días"
              valor={semana.diasActivos}
              unidad="/ 7"
              detalle={comparacion(semana.diasActivos, semana.anterior.diasActivos)}
              compacta
            />
            <Cifra
              etiqueta="Lecciones"
              valor={semana.lecciones}
              detalle={comparacion(semana.lecciones, semana.anterior.lecciones)}
              compacta
            />
            <Cifra
              etiqueta="Actividades"
              valor={semana.actividades}
              detalle={comparacion(semana.actividades, semana.anterior.actividades)}
              compacta
            />
          </dl>
          <p className="mt-2 text-xs leading-snug text-white/45">
            Actividades: cada actividad resuelta, intento de examen o lección completada suma una.
          </p>
        </div>
      </div>

      <div className="mt-7 border-t border-white/5 pt-5">
        <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-white/55">Lecciones completadas por semana</h3>
        {hayLecciones ? (
          <>
            <Barras
              titulo={`Lecciones completadas por semana (últimas ${SEMANAS} semanas)`}
              unidad={['lección', 'lecciones']}
              encabezados={['Semana', 'Lecciones']}
              resaltar={semana.desde}
              datos={serie.map((s) => ({
                clave: s.desde,
                etiqueta: fechaCorta(s.desde, { conDia: false }),
                detalle: s.actual ? 'Esta semana' : `Semana del ${fechaCorta(s.desde, { conDia: false })}`,
                valor: s.lecciones,
              }))}
            />
            <LineaTendencia
              className="mt-4"
              titulo="Tendencia de constancia"
              datos={serie.map((s) => s.lecciones)}
            />
          </>
        ) : (
          <p className="corte-poly-sm border border-dashed border-white/10 px-4 py-6 text-center text-sm text-texto/65">
            Aquí verás cuántas lecciones completas cada semana. ¡Termina tu primera lección para levantar la primera barra!
          </p>
        )}
      </div>
    </Seccion>
  );
}

export default ActividadPanel;
