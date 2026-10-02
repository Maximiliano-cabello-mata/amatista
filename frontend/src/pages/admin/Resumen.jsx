// Resumen del panel (#/admin): indicadores del plan de lanzamiento, serie
// diaria, embudo y avance por curso (GET /api/admin/resumen).
import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { useCatalogo } from '../../catalogo/contexto';
import { datosSerie, fechaHoraTexto, numero, PERIODOS, porcentaje } from '../../components/admin/logica';
import { Boton, CargandoAdmin, ErrorAdmin, Kpi, Tarjeta, Vacio } from '../../components/admin/ui';
import { useDatosAdmin } from '../../components/admin/useDatosAdmin';
import Barras from '../../components/graficas/Barras';
import { COLORES } from '../../components/graficas/colores';
import Medidor from '../../components/graficas/Medidor';
import { obtenerResumen } from '../../services/admin';

const METRICAS = [
  { valor: 'activos', texto: 'Activos', unidad: ['alumno activo', 'alumnos activos'] },
  { valor: 'completadas', texto: 'Lecciones', unidad: ['lección completada', 'lecciones completadas'] },
  { valor: 'registros', texto: 'Registros', unidad: ['registro', 'registros'] },
];

// Botones de opción exclusiva (radiogroup) con el estilo de las pestañas del panel.
function Selector({ etiqueta, opciones, valor, alCambiar }) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex flex-wrap gap-1">
      {opciones.map((opcion) => {
        const activo = opcion.valor === valor;
        return (
          <button
            key={opcion.valor}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => alCambiar(opcion.valor)}
            className={`corte-poly-sm px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition ${
              activo ? 'bg-amatista text-white' : 'bg-white/5 text-white/65 hover:bg-white/10'
            }`}
          >
            {opcion.texto}
          </button>
        );
      })}
    </div>
  );
}

function Embudo({ embudo, dias }) {
  const pasos = [
    { clave: 'registros', texto: 'Se registraron', ayuda: `Cuentas nuevas en los últimos ${dias} días.` },
    { clave: 'activaciones', texto: 'Se activaron', ayuda: 'Completaron su primera lección o actividad en 7 días.' },
    { clave: 'activos', texto: 'Activos esta semana', ayuda: 'Estudiaron 2 días o más y completaron algo.' },
  ];
  const base = Math.max(1, ...pasos.map((p) => Number(embudo?.[p.clave]) || 0));
  return (
    <ol className="space-y-4">
      {pasos.map((paso, i) => {
        const valor = Number(embudo?.[paso.clave]) || 0;
        const anterior = i > 0 ? Number(embudo?.[pasos[i - 1].clave]) || 0 : null;
        const tasa = anterior === null ? null : porcentaje(valor, anterior);
        return (
          <li key={paso.clave}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-white/85">{paso.texto}</span>
              <span className="font-mono text-sm tabular-nums text-white">
                {numero(valor)}
                {tasa !== null && <span className="ml-2 text-xs text-white/50">({tasa}%)</span>}
              </span>
            </div>
            <Medidor valor={valor} maximo={base} etiqueta={paso.texto} textoValor={`${valor} de ${base}`} alto={10} />
            <p className="mt-1 text-xs text-white/45">{paso.ayuda}</p>
          </li>
        );
      })}
    </ol>
  );
}

function Resumen() {
  const { token } = useAuth();
  const { buscarCurso } = useCatalogo();
  const [dias, setDias] = useState(7);
  const [metrica, setMetrica] = useState('activos');
  const { cargando, respuesta, datos, recargar } = useDatosAdmin(() => obtenerResumen(token, dias), `${token}|${dias}`);

  if (!respuesta) return <CargandoAdmin texto="Calculando métricas…" />;
  if (!respuesta.ok) return <ErrorAdmin respuesta={respuesta} alReintentar={recargar} />;

  const usuarios = datos.usuarios ?? {};
  const retencion = datos.retencion_semana2 ?? {};
  const serie = datosSerie(datos.serie_diaria, metrica);
  const definicion = METRICAS.find((m) => m.valor === metrica);
  const hayActividad = serie.some((d) => d.valor > 0);

  return (
    <div className={`space-y-5 transition-opacity ${cargando ? 'opacity-60' : ''}`} aria-busy={cargando}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Selector
          etiqueta="Periodo"
          valor={dias}
          alCambiar={setDias}
          opciones={PERIODOS.map((d) => ({ valor: d, texto: `${d} días` }))}
        />
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/45">Calculado {fechaHoraTexto(datos.generado_en)}</span>
          <Boton chico onClick={recargar} disabled={cargando}>
            Actualizar
          </Boton>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi
          etiqueta="Activos semanales"
          valor={numero(datos.activos_semanales)}
          tono="text-neon"
          detalle="Meta del lanzamiento: 20 al 22 de octubre."
        />
        <Kpi etiqueta={`Registros (${dias} d)`} valor={numero(datos.registros_periodo)} detalle={`${numero(usuarios.registrados)} cuentas en total`} />
        <Kpi
          etiqueta={`Activaciones (${dias} d)`}
          valor={numero(datos.activaciones_periodo)}
          detalle={`${numero(datos.actividades_periodo)} actividades enviadas`}
        />
        <Kpi
          etiqueta="Retención semana 2"
          valor={retencion.porcentaje === null || retencion.porcentaje === undefined ? '—' : `${retencion.porcentaje}%`}
          detalle={`${numero(retencion.numerador)} de ${numero(retencion.denominador)} volvieron`}
        />
        <Kpi
          etiqueta={`Lecciones (${dias} d)`}
          valor={numero(datos.lecciones_completadas?.periodo)}
          detalle={`${numero(datos.lecciones_completadas?.total)} completadas en total`}
        />
        <Kpi etiqueta="Alumnos" valor={numero(usuarios.por_rol?.alumno)} detalle={`${numero(usuarios.anonimos)} sin cuenta (anónimos)`} />
        <Kpi
          etiqueta="Correos confirmados"
          valor={numero(usuarios.confirmados)}
          detalle={`${porcentaje(usuarios.confirmados, usuarios.registrados) ?? 0}% de las cuentas`}
        />
        <Kpi
          etiqueta="Equipo"
          valor={numero((usuarios.por_rol?.profesor ?? 0) + (usuarios.por_rol?.admin ?? 0))}
          detalle={`${numero(usuarios.de_prueba)} cuentas de prueba (no cuentan)`}
        />
      </dl>

      <div className="grid gap-5 xl:grid-cols-3">
        <Tarjeta
          etiqueta="Últimos 30 días"
          titulo="Serie diaria"
          className="xl:col-span-2"
          accion={<Selector etiqueta="Métrica" opciones={METRICAS} valor={metrica} alCambiar={setMetrica} />}
        >
          {hayActividad ? (
            <Barras
              titulo={`${definicion.texto} por día (últimos 30 días)`}
              unidad={definicion.unidad}
              encabezados={['Día', definicion.texto]}
              datos={serie}
              resaltar={serie.at(-1)?.clave}
              color={metrica === 'registros' ? COLORES.neon : COLORES.amatista}
              alto={170}
            />
          ) : (
            <Vacio titulo="Todavía no hay datos en estos 30 días">Las barras aparecen cuando los alumnos empiecen a estudiar.</Vacio>
          )}
        </Tarjeta>

        <Tarjeta etiqueta={`${dias} días`} titulo="Embudo">
          <Embudo embudo={datos.embudo} dias={dias} />
        </Tarjeta>
      </div>

      <Tarjeta etiqueta="Contenido" titulo="Por curso">
        {datos.por_curso?.length ? (
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                <tr>
                  <th scope="col" className="py-2 pr-3 font-normal">Curso</th>
                  <th scope="col" className="py-2 pr-3 text-right font-normal">Alumnos</th>
                  <th scope="col" className="py-2 pr-3 text-right font-normal">Lecciones completadas</th>
                  <th scope="col" className="py-2 text-right font-normal">Lecciones publicadas</th>
                </tr>
              </thead>
              <tbody>
                {datos.por_curso.map((fila) => (
                  <tr key={fila.curso_id} className="border-t border-white/5">
                    <th scope="row" className="py-2.5 pr-3 font-semibold text-white">
                      {buscarCurso(fila.curso_id)?.titulo ?? fila.curso_id}
                    </th>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{numero(fila.alumnos)}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{numero(fila.completadas)}</td>
                    <td className="py-2.5 text-right tabular-nums">
                      {fila.lecciones_publicadas === null ? (
                        <span title="El contenido todavía no se importa a la base de datos" className="text-white/40">
                          —
                        </span>
                      ) : (
                        numero(fila.lecciones_publicadas)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Vacio titulo="Sin datos por curso">Aparecen cuando haya progreso guardado o contenido importado.</Vacio>
        )}
      </Tarjeta>
    </div>
  );
}

export default Resumen;
