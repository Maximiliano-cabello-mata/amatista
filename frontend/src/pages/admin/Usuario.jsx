// Detalle de un usuario (#/admin/usuarios/:id): ficha, acciones del
// administrador, progreso por curso, insignias y eventos recientes.
import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { useCatalogo } from '../../catalogo/contexto';
import { claseControl } from '../../components/admin/estilos';
import {
  agruparProgreso,
  fechaHoraTexto,
  fechaTexto,
  haceCuanto,
  NOMBRES_ROL,
  NOMBRES_TIPO_EVENTO,
  numero,
  ROLES,
} from '../../components/admin/logica';
import { Boton, CampoAdmin, CargandoAdmin, Confirmacion, ErrorAdmin, Kpi, Mensaje, Pastilla, Tarjeta, Vacio } from '../../components/admin/ui';
import { useConfirmacion } from '../../components/admin/useConfirmacion';
import { useDatosAdmin } from '../../components/admin/useDatosAdmin';
import Medidor from '../../components/graficas/Medidor';
import { rutas } from '../../rutas';
import { modificarUsuario, obtenerUsuario } from '../../services/admin';
import { EstadoCuenta } from './Usuarios';

function Acciones({ usuario, propio, alCambiar }) {
  const { token } = useAuth();
  const confirmacion = useConfirmacion();
  const [rol, setRol] = useState(usuario.rol);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const aplicar = async (cambios, pregunta) => {
    if (!(await confirmacion.preguntar(pregunta))) return;
    setEnviando(true);
    setMensaje(null);
    const respuesta = await modificarUsuario(token, usuario.id, cambios);
    setEnviando(false);
    if (respuesta.ok) {
      alCambiar(respuesta.datos);
      setRol(respuesta.datos.rol);
      setMensaje({ tono: 'exito', texto: 'Cambio guardado.' });
    } else {
      setRol(usuario.rol);
      setMensaje({ tono: 'error', texto: respuesta.error });
    }
  };

  const nombre = usuario.nombre || usuario.email || 'este usuario';

  return (
    <Tarjeta etiqueta="Solo administradores" titulo="Acciones">
      <div className="space-y-5">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            aplicar(
              { rol },
              {
                titulo: `¿Cambiar el rol a ${NOMBRES_ROL[rol]}?`,
                texto:
                  rol === 'alumno'
                    ? `${nombre} dejará de ver el panel de administración.`
                    : `${nombre} podrá ver el panel de administración${rol === 'admin' ? ' y hacer cambios en usuarios y contenido' : ''}.`,
                confirmar: 'Cambiar rol',
                peligro: rol === 'admin',
              },
            );
          }}
        >
          <CampoAdmin
            etiqueta="Rol"
            className="min-w-[10rem] flex-1"
            ayuda={
              propio
                ? 'No puedes cambiar tu propio rol.'
                : usuario.anonimo
                  ? 'Un alumno sin cuenta solo puede ser alumno.'
                  : 'El cambio aplica en su siguiente petición.'
            }
          >
            {({ id, describe }) => (
              <select
                id={id}
                aria-describedby={describe}
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                disabled={propio || usuario.anonimo || enviando}
                className={claseControl}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {NOMBRES_ROL[r]}
                  </option>
                ))}
              </select>
            )}
          </CampoAdmin>
          <Boton type="submit" variante="primario" disabled={rol === usuario.rol || enviando}>
            Guardar rol
          </Boton>
        </form>

        <div className="flex flex-wrap gap-2">
          <Boton
            disabled={enviando}
            onClick={() =>
              aplicar(
                { es_prueba: !usuario.es_prueba },
                usuario.es_prueba
                  ? { titulo: '¿Contar de nuevo en las métricas?', texto: `${nombre} volverá a sumar en el resumen.`, confirmar: 'Quitar marca' }
                  : {
                      titulo: '¿Marcar como cuenta de prueba?',
                      texto: `${nombre} y sus eventos dejarán de contar en las métricas. No se borra nada.`,
                      confirmar: 'Marcar prueba',
                    },
              )
            }
          >
            {usuario.es_prueba ? 'Quitar marca de prueba' : 'Marcar como prueba'}
          </Boton>
          {!usuario.anonimo && !usuario.correo_confirmado && (
            <Boton
              disabled={enviando}
              onClick={() =>
                aplicar(
                  { correo_confirmado: true },
                  {
                    titulo: '¿Confirmar el correo a mano?',
                    texto: `Úsalo solo si verificaste que ${usuario.email} es de esta persona.`,
                    confirmar: 'Confirmar correo',
                  },
                )
              }
            >
              Confirmar correo
            </Boton>
          )}
        </div>
        {mensaje && <Mensaje tono={mensaje.tono}>{mensaje.texto}</Mensaje>}
      </div>
      <Confirmacion {...confirmacion} />
    </Tarjeta>
  );
}

function Progreso({ progreso }) {
  const { cursos } = useCatalogo();
  if (!progreso.length) return <Vacio titulo="Sin progreso guardado en el servidor">Puede tener avance local que aún no sincroniza.</Vacio>;
  const { grupos, otras } = agruparProgreso(progreso, cursos);
  return (
    <div className="space-y-6">
      {grupos.map(({ curso, modulos, total, completadas }) => (
        <section key={curso.id}>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h3 className="font-bold text-white">{curso.titulo}</h3>
            <span className="font-mono text-xs text-white/55">
              {completadas} de {total}
            </span>
          </div>
          <Medidor valor={completadas} maximo={total} etiqueta={`Avance en ${curso.titulo}`} textoValor={`${completadas} de ${total} lecciones`} />
          {modulos.map(({ modulo, lecciones }) => (
            <ul key={modulo.id} className="mt-3 divide-y divide-white/5 text-sm">
              {lecciones.map(({ leccion, fila }) => (
                <li key={leccion.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-1.5">
                  <span className={fila?.completada ? 'text-white' : 'text-white/45'}>
                    <span aria-hidden="true" className="mr-2">
                      {fila?.completada ? '◆' : '◇'}
                    </span>
                    {leccion.title}
                  </span>
                  <span className="font-mono text-[11px] text-white/50">
                    {fila?.completada ? fechaTexto(fila.completada_en ?? fila.actualizado_en) : fila ? 'Empezada' : 'Sin empezar'}
                    {fila?.puntaje !== null && fila?.puntaje !== undefined && ` · ${fila.puntaje} pts`}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </section>
      ))}
      {otras.length > 0 && (
        <section>
          <h3 className="mb-2 font-bold text-white/80">Fuera del catálogo actual</h3>
          <ul className="space-y-1 font-mono text-xs text-white/55">
            {otras.map((fila) => (
              <li key={`${fila.curso_id}:${fila.leccion_id}`}>
                {fila.curso_id} / {fila.leccion_id} · {fila.completada ? 'completada' : 'empezada'}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Usuario({ usuarioId, esAdmin }) {
  const { token, usuario: yo } = useAuth();
  const { cargando, respuesta, datos, recargar, modificar } = useDatosAdmin(
    () => obtenerUsuario(token, usuarioId),
    `${token}|${usuarioId}`,
  );

  const volver = (
    <a href={rutas.adminUsuarios} className="inline-block font-mono text-xs uppercase tracking-widest text-white/55 hover:text-neon">
      ◂ Todos los usuarios
    </a>
  );

  if (!respuesta) return <CargandoAdmin texto="Cargando usuario…" />;
  if (!respuesta.ok) {
    return (
      <div className="space-y-4">
        {volver}
        <ErrorAdmin respuesta={respuesta} alReintentar={recargar} />
      </div>
    );
  }

  const { usuario, progreso = [], insignias = [], eventos_recientes: eventos = [], sesiones_activas: sesiones } = datos;
  const alCambiar = (publico) => modificar((actual) => ({ ...actual, usuario: { ...actual.usuario, ...publico } }));

  return (
    <div className={`space-y-5 ${cargando ? 'opacity-60' : ''}`}>
      {volver}
      <Tarjeta>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-extrabold text-white">{usuario.nombre || usuario.email || 'Alumno sin cuenta'}</h2>
            {usuario.email && <p className="truncate text-sm text-white/65">{usuario.email}</p>}
            <p className="mt-1 break-all font-mono text-[11px] text-white/40">{usuario.id}</p>
            <div className="mt-3">
              <EstadoCuenta usuario={usuario} />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <dt className="text-white/50">Creado</dt>
            <dd className="text-white/85">{fechaTexto(usuario.creado_en)}</dd>
            <dt className="text-white/50">Último acceso</dt>
            <dd className="text-white/85">{haceCuanto(usuario.ultimo_acceso)}</dd>
            {usuario.telefono && (
              <>
                <dt className="text-white/50">Teléfono</dt>
                <dd className="text-white/85">{usuario.telefono}</dd>
              </>
            )}
          </dl>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi etiqueta="Lecciones" valor={numero(usuario.lecciones_completadas)} />
          <Kpi etiqueta="XP" valor={numero(usuario.xp)} detalle="Sin las actividades perfectas" />
          <Kpi etiqueta="Insignias" valor={numero(insignias.length)} />
          <Kpi etiqueta="Sesiones activas" valor={numero(sesiones)} />
        </dl>
      </Tarjeta>

      {esAdmin && <Acciones key={usuario.rol} usuario={usuario} propio={yo?.id === usuario.id} alCambiar={alCambiar} />}

      <div className="grid gap-5 xl:grid-cols-3">
        <Tarjeta etiqueta="Servidor" titulo="Progreso" className="xl:col-span-2">
          <Progreso progreso={progreso} />
        </Tarjeta>
        <div className="space-y-5">
          <Tarjeta titulo="Insignias">
            {insignias.length ? (
              <ul className="flex flex-wrap gap-2">
                {insignias.map((insignia) => (
                  <li key={insignia.id}>
                    <Pastilla tono="bg-amatista/20 text-amatista-claro" titulo={`Obtenida el ${fechaTexto(insignia.obtenido_en)}`}>
                      {insignia.id}
                    </Pastilla>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/50">Todavía ninguna.</p>
            )}
          </Tarjeta>
          <Tarjeta titulo="Eventos recientes">
            {eventos.length ? (
              <ol className="space-y-2 text-sm">
                {eventos.map((evento, i) => (
                  <li key={`${evento.ocurrido_en}-${i}`} className="border-l-2 border-amatista/40 pl-3">
                    <span className="block text-white/85">{NOMBRES_TIPO_EVENTO[evento.tipo] ?? evento.tipo}</span>
                    <span className="block font-mono text-[11px] text-white/45">
                      {fechaHoraTexto(evento.ocurrido_en)}
                      {evento.leccion_id && ` · ${evento.curso_id}/${evento.leccion_id}`}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-white/50">Sin eventos.</p>
            )}
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}

export default Usuario;
