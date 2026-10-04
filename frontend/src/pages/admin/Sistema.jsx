// Sistema (#/admin/sistema, solo admin): motor y filas por tabla, y purga de
// sesiones viejas y eventos antiguos (lo mismo que el job de sql/003).
import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { claseControl } from '../../components/admin/estilos';
import { numero } from '../../components/admin/logica';
import { Boton, CampoAdmin, CargandoAdmin, Confirmacion, ErrorAdmin, Kpi, Mensaje, Tarjeta } from '../../components/admin/ui';
import { useConfirmacion } from '../../components/admin/useConfirmacion';
import { useDatosAdmin } from '../../components/admin/useDatosAdmin';
import { rutas } from '../../rutas';
import { obtenerSaludDetallada, purgarDatos } from '../../services/admin';

const MOTORES = { oracle: 'Oracle', sqlite: 'SQLite (desarrollo)' };

function Purga({ alTerminar }) {
  const { token } = useAuth();
  const confirmacion = useConfirmacion();
  const [diasSesiones, setDiasSesiones] = useState(90);
  const [diasEventos, setDiasEventos] = useState(400);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const validos = diasSesiones >= 1 && diasSesiones <= 3650 && diasEventos >= 1 && diasEventos <= 3650;

  const purgar = async (evento) => {
    evento.preventDefault();
    const seguro = await confirmacion.preguntar({
      titulo: '¿Purgar datos viejos?',
      texto: `Se borran las sesiones cerradas, vencidas o sin uso en ${diasSesiones} días y los eventos de aprendizaje de hace más de ${diasEventos} días. Usuarios, progreso, insignias y contenido no se tocan. No se puede deshacer.`,
      confirmar: 'Purgar',
      peligro: true,
    });
    if (!seguro) return;
    setEnviando(true);
    setMensaje(null);
    const respuesta = await purgarDatos(token, { diasSesiones, diasEventos });
    setEnviando(false);
    if (respuesta.ok) {
      setMensaje({
        tono: 'exito',
        texto: `Listo: ${numero(respuesta.datos.sesiones)} sesiones y ${numero(respuesta.datos.eventos)} eventos borrados.`,
      });
      alTerminar();
    } else {
      setMensaje({ tono: 'error', texto: respuesta.error });
    }
  };

  return (
    <Tarjeta etiqueta="Mantenimiento" titulo="Purgar datos viejos">
      <p className="mb-4 text-sm leading-relaxed text-white/65">
        En Oracle ya corre una purga diaria (sql/003). Usa esto para liberar espacio de inmediato; la vista
        V_AMATISTA_ESPACIO muestra cuánto de los 20 GB está en uso.
      </p>
      <form onSubmit={purgar} className="flex flex-wrap items-end gap-3">
        <CampoAdmin etiqueta="Sesiones sin uso (días)" className="w-44">
          {({ id }) => (
            <input id={id} type="number" min={1} max={3650} value={diasSesiones} onChange={(e) => setDiasSesiones(Number(e.target.value))} className={claseControl} />
          )}
        </CampoAdmin>
        <CampoAdmin etiqueta="Eventos más viejos (días)" className="w-44">
          {({ id }) => (
            <input id={id} type="number" min={1} max={3650} value={diasEventos} onChange={(e) => setDiasEventos(Number(e.target.value))} className={claseControl} />
          )}
        </CampoAdmin>
        <Boton type="submit" variante="peligro" disabled={!validos || enviando}>
          {enviando ? 'Purgando…' : 'Purgar'}
        </Boton>
      </form>
      {mensaje && (
        <Mensaje tono={mensaje.tono} className="mt-4">
          {mensaje.texto}
        </Mensaje>
      )}
      <Confirmacion {...confirmacion} />
    </Tarjeta>
  );
}

function Sistema() {
  const { token } = useAuth();
  const { cargando, respuesta, datos, recargar } = useDatosAdmin(() => obtenerSaludDetallada(token), token);

  return (
    <div className="space-y-5">
      {!respuesta && <CargandoAdmin texto="Revisando la base de datos…" />}
      {respuesta && !respuesta.ok && <ErrorAdmin respuesta={respuesta} alReintentar={recargar} />}
      {datos && (
        <Tarjeta
          etiqueta="Salud"
          titulo="Base de datos"
          accion={
            <Boton chico onClick={recargar} disabled={cargando}>
              Actualizar
            </Boton>
          }
        >
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Kpi etiqueta="Motor" valor={MOTORES[datos.motor] ?? datos.motor} tono="text-neon" />
            <Kpi etiqueta="Versión de la API" valor={datos.version_api ?? '—'} />
            <Kpi
              etiqueta="Tablas"
              valor={`${Object.values(datos.tablas ?? {}).filter((n) => n !== null).length} / ${Object.keys(datos.tablas ?? {}).length}`}
              detalle="Las que faltan indican una migración pendiente."
            />
          </dl>
          <table className="mt-5 w-full text-left text-sm">
            <thead className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              <tr>
                <th scope="col" className="py-2 font-normal">Tabla</th>
                <th scope="col" className="py-2 text-right font-normal">Filas</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(datos.tablas ?? {}).map(([tabla, filas]) => (
                <tr key={tabla} className="border-t border-white/5">
                  <th scope="row" className="py-2 font-mono text-xs font-normal uppercase text-white/85">
                    {tabla}
                  </th>
                  <td className="py-2 text-right tabular-nums">
                    {filas === null ? <span className="text-red-300">No existe: falta una migración (backend/sql/LEEME.txt)</span> : numero(filas)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>
      )}
      <Purga alTerminar={recargar} />
      <Tarjeta etiqueta="Este dispositivo" titulo="Diagnóstico técnico">
        <p className="text-sm text-white/65">
          Conexión de este navegador con el backend, cuenta, catálogo, cambios pendientes de sincronizar y una prueba del visor
          A-Frame. Los alumnos no ven esta página.
        </p>
        <a href={rutas.laboratorio} className="corte-poly-sm mt-4 inline-block bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/85 hover:bg-white/10">
          Abrir diagnóstico ▸
        </a>
      </Tarjeta>
    </div>
  );
}

export default Sistema;
