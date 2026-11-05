// Las entregas de una práctica: una fila por alumno (primero lo que espera
// evaluación), el modelo de cada uno armado aquí y la evaluación.
import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { Boton, CampoAdmin, CargandoAdmin, ErrorAdmin, Kpi, Mensaje, Pastilla, Tarjeta, Vacio } from '../../components/admin/ui';
import { useDatosAdmin } from '../../components/admin/useDatosAdmin';
import { contarEstados, estadoAlumno, fecha, ordenarAlumnos } from '../../profesor/logica';
import { bytesLegibles } from '../../profesor/modelo';
import { traerModelo } from '../../profesor/recoger';
import VisorModelo from '../../profesor/VisorModelo';
import { rutas } from '../../rutas';
import { cambiarAsignacion, evaluarEntrega, verAsignacion } from '../../services/evaluacion';

const CAMPO = 'corte-poly-sm w-full border border-white/10 bg-base/70 px-3 py-2.5 text-white placeholder:text-white/30 focus:border-neon focus:outline-none';

function Evaluar({ asignacion, fila, alEvaluar }) {
  const { token } = useAuth();
  const entrega = fila.entrega;
  const [nota, setNota] = useState(entrega.calificacion ?? '');
  const [comentario, setComentario] = useState(entrega.comentario ?? '');
  const [estado, setEstado] = useState({ enviando: false, error: null, hecho: null });

  const enviar = async (tipo) => {
    setEstado({ enviando: true, error: null, hecho: null });
    const r = await evaluarEntrega(token, asignacion.id, fila.alumno.id, {
      estado: tipo,
      calificacion: nota === '' ? null : Number(nota),
      comentario: comentario.trim() || null,
    });
    if (!r.ok) {
      setEstado({ enviando: false, error: r.error, hecho: null });
      return;
    }
    setEstado({ enviando: false, error: null, hecho: tipo === 'evaluada' ? 'Evaluación guardada: el alumno la verá en Mi panel.' : 'Le pediste rehacerla: podrá volver a entregar.' });
    alEvaluar(r.datos);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
      <CampoAdmin etiqueta="Calificación" ayuda="De 0 a 10 (opcional).">
        {({ id, describe }) => (
          <input id={id} aria-describedby={describe} type="number" min={0} max={10} step={1} inputMode="numeric" className={CAMPO} value={nota} onChange={(e) => setNota(e.target.value)} />
        )}
      </CampoAdmin>
      <CampoAdmin etiqueta="Comentario para el alumno" ayuda="Qué hizo bien y qué le falta. Lo lee en Mi panel.">
        {({ id, describe }) => (
          <textarea id={id} aria-describedby={describe} className={`${CAMPO} min-h-24`} maxLength={1000} value={comentario} onChange={(e) => setComentario(e.target.value)} />
        )}
      </CampoAdmin>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Boton variante="primario" disabled={estado.enviando} onClick={() => enviar('evaluada')}>Guardar evaluación</Boton>
        <Boton disabled={estado.enviando} onClick={() => enviar('rehacer')}>Pedir que la rehaga</Boton>
      </div>
      <div className="sm:col-span-2">
        <Mensaje tono="error">{estado.error}</Mensaje>
        <Mensaje tono="exito">{estado.hecho}</Mensaje>
      </div>
    </div>
  );
}

function Detalle({ asignacion, fila, alEvaluar }) {
  const { token, usuario } = useAuth();
  const [modelo, setModelo] = useState({ cargando: false, resultado: null });
  const entrega = fila.entrega;

  const abrir = async () => {
    setModelo({ cargando: true, resultado: null });
    const resultado = await traerModelo({ token, profesorId: usuario.id, asignacion, fila });
    setModelo({ cargando: false, resultado });
  };

  const resultado = modelo.resultado;
  return (
    <Tarjeta etiqueta={fila.alumno.email} titulo={fila.alumno.nombre} accion={<Pastilla tono={estadoAlumno(fila).tono}>{estadoAlumno(fila).texto}</Pastilla>}>
      {!entrega ? (
        <Vacio titulo="Todavía no entrega.">
          {fila.avance ? `Va en ${fila.avance.progreso} % con ${fila.avance.intentos} intentos y ${fila.avance.pistas} pistas.` : 'No ha abierto la práctica en Blender.'}
        </Vacio>
      ) : (
        <div className="space-y-5">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi etiqueta="Motor" valor={`${entrega.progreso} %`} detalle={entrega.completada ? 'Práctica completa' : 'Sin terminar'} tono={entrega.completada ? 'text-emerald-300' : 'text-white'} />
            <Kpi etiqueta="Intentos" valor={entrega.intentos} />
            <Kpi etiqueta="Entregó" valor={fecha(entrega.entregada_en, { soloDia: true })} detalle={entrega.tarde ? 'Después de la fecha' : null} tono="text-white text-xl" />
            <Kpi etiqueta="Modelo" valor={entrega.resumen ? entrega.resumen.triangulos.toLocaleString('es-MX') : '—'} detalle={entrega.resumen ? `triángulos · ${bytesLegibles(entrega.modelo_bytes)}` : 'Sin modelo'} />
          </dl>

          {entrega.resumen && !resultado?.ok && (
            <div className="corte-poly-sm flex flex-col gap-3 border border-dashed border-white/15 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-white/65">
                {entrega.modelo_en_servidor
                  ? `Al abrirlo se descarga (${bytesLegibles(entrega.modelo_bytes)}) y se guarda solo en esta computadora; el servidor lo borra.`
                  : 'Ya lo recogiste: se abre en la computadora donde lo abriste la primera vez.'}
              </p>
              <Boton variante="neon" onClick={abrir} disabled={modelo.cargando}>
                {modelo.cargando ? 'Abriendo…' : 'Ver su modelo'}
              </Boton>
            </div>
          )}
          {resultado && !resultado.ok && (
            <Mensaje tono="error">
              {resultado.error} {!entrega.modelo_en_servidor && <a className="font-bold underline" href={rutas.profesorEquipo}>Ver lo que hay en esta computadora</a>}
            </Mensaje>
          )}
          {resultado?.ok && (
            <>
              {!resultado.guardado && <Mensaje tono="aviso">Este navegador no pudo guardarlo: el servidor lo conserva para que lo abras desde otra computadora.</Mensaje>}
              <VisorModelo escena={resultado.escena} titulo={`Modelo de ${fila.alumno.nombre}`} />
            </>
          )}

          <Evaluar key={`${fila.alumno.id}-${entrega.entregada_en}`} asignacion={asignacion} fila={fila} alEvaluar={alEvaluar} />
        </div>
      )}
    </Tarjeta>
  );
}

function Asignacion({ asignacionId }) {
  const { token } = useAuth();
  const { respuesta, cargando, recargar, modificar } = useDatosAdmin(() => verAsignacion(token, asignacionId), `${token}|${asignacionId}`);
  const [elegido, setElegido] = useState(null);
  const [aviso, setAviso] = useState(null);

  if (cargando && !respuesta) return <CargandoAdmin texto="Cargando las entregas…" />;
  if (!respuesta?.ok) return <ErrorAdmin respuesta={respuesta} alReintentar={recargar} />;
  const { asignacion, alumnos } = respuesta.datos;
  const filas = ordenarAlumnos(alumnos);
  const cuenta = contarEstados(alumnos);
  const fila = filas.find((f) => f.alumno.id === elegido) ?? null;

  const alternarEstado = async () => {
    const r = await cambiarAsignacion(token, asignacion.id, { estado: asignacion.estado === 'abierta' ? 'cerrada' : 'abierta' });
    if (r.ok) modificar((d) => ({ ...d, asignacion: { ...d.asignacion, estado: r.datos.estado } }));
    else setAviso(r.error);
  };

  const alEvaluar = (entrega) =>
    modificar((d) => ({ ...d, alumnos: d.alumnos.map((f) => (f.alumno.id === elegido ? { ...f, entrega } : f)) }));

  return (
    <div className="space-y-6">
      <section className="corte-poly border border-white/10 bg-superficie/95 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <a href={rutas.profesorGrupo(asignacion.grupo_id)} className="font-mono text-[11px] uppercase tracking-widest text-neon hover:underline">◂ Volver al grupo</a>
            <h2 className="mt-1 text-2xl font-extrabold text-white">{asignacion.titulo}</h2>
            <p className="text-sm text-white/55">
              {asignacion.practica} · Nivel {asignacion.nivel ?? '—'} · {asignacion.fecha_limite ? `para el ${fecha(asignacion.fecha_limite, { soloDia: true })}` : 'sin fecha límite'}
            </p>
            {asignacion.indicaciones && <p className="mt-2 max-w-3xl text-sm text-texto/80">{asignacion.indicaciones}</p>}
          </div>
          <Boton chico onClick={alternarEstado}>{asignacion.estado === 'abierta' ? 'Cerrar entregas' : 'Reabrir entregas'}</Boton>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Kpi etiqueta="Por evaluar" valor={cuenta.entregada} tono="text-neon" />
          <Kpi etiqueta="Evaluadas" valor={cuenta.evaluada} tono="text-emerald-300" />
          <Kpi etiqueta="Por rehacer" valor={cuenta.rehacer} tono="text-amber-200" />
          <Kpi etiqueta="Trabajando" valor={cuenta.trabajando} />
          <Kpi etiqueta="Sin empezar" valor={cuenta.sin_empezar} tono="text-white/60" />
        </dl>
        <Mensaje tono="error" className="mt-3">{aviso}</Mensaje>
      </section>

      {filas.length === 0 ? (
        <Vacio titulo="El grupo todavía no tiene alumnos." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <ul className="space-y-2" aria-label="Alumnos del grupo">
            {filas.map((f) => {
              const e = estadoAlumno(f);
              return (
                <li key={f.alumno.id}>
                  <button
                    type="button"
                    onClick={() => setElegido(f.alumno.id)}
                    aria-pressed={elegido === f.alumno.id}
                    className="corte-poly-sm flex w-full items-center justify-between gap-2 border border-white/10 bg-superficie/90 px-3 py-2.5 text-left hover:border-neon aria-pressed:border-neon aria-pressed:bg-neon/5"
                  >
                    <span className="min-w-0 truncate font-semibold text-white">{f.alumno.nombre}</span>
                    <Pastilla tono={e.tono}>{e.texto}</Pastilla>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="min-w-0">
            {fila ? (
              <Detalle key={fila.alumno.id} asignacion={asignacion} fila={fila} alEvaluar={alEvaluar} />
            ) : (
              <Vacio titulo="Elige un alumno para ver su entrega.">Arriba de la lista están los que esperan tu evaluación.</Vacio>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Asignacion;
