// Un grupo del profesor: su código, dejar una práctica, las prácticas que ya
// dejó (con cuántos entregaron) y sus alumnos.
import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { Boton, CampoAdmin, CargandoAdmin, Confirmacion, ErrorAdmin, Mensaje, Pastilla, Tarjeta, Vacio } from '../../components/admin/ui';
import { useConfirmacion } from '../../components/admin/useConfirmacion';
import { useDatosAdmin } from '../../components/admin/useDatosAdmin';
import { codigoDictado, fecha, finDelDia } from '../../profesor/logica';
import { rutas } from '../../rutas';
import { asignarPractica, cambiarGrupo, practicasParaAsignar, sacarAlumno, verGrupo } from '../../services/evaluacion';

const CAMPO = 'corte-poly-sm w-full border border-white/10 bg-base/70 px-3 py-2.5 text-white placeholder:text-white/30 focus:border-neon focus:outline-none';

function NuevaAsignacion({ grupoId, alAsignar }) {
  const { token } = useAuth();
  const { respuesta } = useDatosAdmin(() => practicasParaAsignar(token), token);
  const [datos, setDatos] = useState({ practica_id: '', titulo: '', indicaciones: '', fecha: '' });
  const [estado, setEstado] = useState({ enviando: false, error: null, hecho: null });
  const practicas = respuesta?.ok ? respuesta.datos : [];
  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  const enviar = async (evento) => {
    evento.preventDefault();
    setEstado({ enviando: true, error: null, hecho: null });
    const r = await asignarPractica(token, {
      grupo_id: grupoId,
      practica_id: datos.practica_id,
      titulo: datos.titulo.trim() || null,
      indicaciones: datos.indicaciones.trim() || null,
      fecha_limite: finDelDia(datos.fecha),
    });
    if (!r.ok) {
      setEstado({ enviando: false, error: r.error, hecho: null });
      return;
    }
    setDatos({ practica_id: '', titulo: '', indicaciones: '', fecha: '' });
    setEstado({ enviando: false, error: null, hecho: r.datos.titulo });
    alAsignar(r.datos);
  };

  return (
    <Tarjeta etiqueta="Dejar una práctica" titulo="¿Qué practican ahora?">
      <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
        <CampoAdmin etiqueta="Práctica de Blender" ayuda="Solo las publicadas: las que tus alumnos pueden abrir." className="sm:col-span-2">
          {({ id, describe }) => (
            <select id={id} aria-describedby={describe} className={CAMPO} value={datos.practica_id} onChange={cambiar('practica_id')} required>
              <option value="">Elige una práctica…</option>
              {practicas.map((p) => (
                <option key={p.id} value={p.id}>
                  Nivel {p.nivel} · {p.titulo}
                </option>
              ))}
            </select>
          )}
        </CampoAdmin>
        <CampoAdmin etiqueta="Título (opcional)" ayuda="Si lo dejas vacío, se usa el de la práctica.">
          {({ id, describe }) => <input id={id} aria-describedby={describe} className={CAMPO} value={datos.titulo} onChange={cambiar('titulo')} maxLength={200} />}
        </CampoAdmin>
        <CampoAdmin etiqueta="Entregar a más tardar (opcional)">
          {({ id }) => <input id={id} type="date" className={CAMPO} value={datos.fecha} onChange={cambiar('fecha')} />}
        </CampoAdmin>
        <CampoAdmin etiqueta="Indicaciones (opcional)" ayuda="Lo que quieres que cuiden. Lo leen en Mi panel." className="sm:col-span-2">
          {({ id, describe }) => (
            <textarea id={id} aria-describedby={describe} className={`${CAMPO} min-h-20`} value={datos.indicaciones} onChange={cambiar('indicaciones')} maxLength={1000} />
          )}
        </CampoAdmin>
        <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
          <Boton type="submit" variante="primario" disabled={estado.enviando || !datos.practica_id}>
            {estado.enviando ? 'Dejando…' : 'Dejar la práctica'}
          </Boton>
          <ErrorAdmin respuesta={respuesta} />
        </div>
      </form>
      <Mensaje tono="error" className="mt-3">{estado.error}</Mensaje>
      <Mensaje tono="exito" className="mt-3">{estado.hecho && `Listo: «${estado.hecho}» ya aparece en Mi panel de tus alumnos.`}</Mensaje>
    </Tarjeta>
  );
}

function Grupo({ grupoId }) {
  const { token } = useAuth();
  const { respuesta, cargando, recargar, modificar } = useDatosAdmin(() => verGrupo(token, grupoId), `${token}|${grupoId}`);
  const { pregunta, preguntar, responder } = useConfirmacion();
  const [aviso, setAviso] = useState(null);

  if (cargando && !respuesta) return <CargandoAdmin texto="Cargando el grupo…" />;
  if (!respuesta?.ok) return <ErrorAdmin respuesta={respuesta} alReintentar={recargar} />;
  const grupo = respuesta.datos;

  const archivar = async () => {
    const r = await cambiarGrupo(token, grupo.id, { archivado: !grupo.archivado });
    if (r.ok) modificar((g) => ({ ...g, archivado: r.datos.archivado }));
    else setAviso(r.error);
  };

  const sacar = async (alumno) => {
    const si = await preguntar({
      titulo: `¿Sacar a ${alumno.nombre} del grupo?`,
      texto: 'Deja de ver las prácticas del grupo. Sus entregas anteriores se conservan; puede volver a unirse con el código.',
      confirmar: 'Sacar del grupo',
      peligro: true,
    });
    if (!si) return;
    const r = await sacarAlumno(token, grupo.id, alumno.id);
    if (r.ok) modificar((g) => ({ ...g, alumnos: g.alumnos.filter((a) => a.id !== alumno.id) }));
    else setAviso(r.error);
  };

  return (
    <div className="space-y-6">
      <Confirmacion pregunta={pregunta} responder={responder} />
      <section className="corte-poly flex flex-col gap-4 border border-amatista/40 bg-superficie/95 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold text-white">{grupo.nombre}</h2>
          <p className="mt-1 text-sm text-white/60">
            Tus alumnos entran a <strong className="text-white/85">Mi panel › Mi grupo</strong> y escriben el código. Necesitan una cuenta con correo.
          </p>
        </div>
        <div className="text-center sm:text-right">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">Código</p>
          <p className="font-mono text-4xl font-extrabold tracking-[0.2em] text-amatista-claro" aria-label={`Código ${codigoDictado(grupo.codigo)}`}>
            {grupo.codigo}
          </p>
          <div className="mt-2 flex justify-center gap-2 sm:justify-end">
            <Boton chico onClick={() => navigator.clipboard?.writeText(grupo.codigo).then(() => setAviso('Código copiado.'))}>Copiar</Boton>
            <Boton chico onClick={archivar}>{grupo.archivado ? 'Reabrir grupo' : 'Archivar'}</Boton>
          </div>
        </div>
      </section>
      <Mensaje tono="info">{aviso}</Mensaje>
      {grupo.archivado && <Mensaje tono="aviso">Grupo archivado: el código ya no sirve y no puedes dejarle prácticas nuevas.</Mensaje>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          {!grupo.archivado && <NuevaAsignacion grupoId={grupo.id} alAsignar={(a) => modificar((g) => ({ ...g, asignaciones: [a, ...g.asignaciones] }))} />}
          <Tarjeta etiqueta="Prácticas que dejaste" titulo={`${grupo.asignaciones.length} ${grupo.asignaciones.length === 1 ? 'práctica' : 'prácticas'}`}>
            {grupo.asignaciones.length === 0 ? (
              <Vacio titulo="Aún no les dejas prácticas." />
            ) : (
              <ul className="space-y-2">
                {grupo.asignaciones.map((a) => {
                  const entregadas = a.entregas.entregada + a.entregas.evaluada + a.entregas.rehacer;
                  return (
                    <li key={a.id}>
                      <a href={rutas.profesorPractica(a.id)} className="corte-poly-sm flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-base/50 px-4 py-3 hover:border-neon">
                        <span className="min-w-0">
                          <span className="block font-bold text-white">{a.titulo}</span>
                          <span className="block text-xs text-white/50">
                            Nivel {a.nivel ?? '—'} · {a.fecha_limite ? `para el ${fecha(a.fecha_limite, { soloDia: true })}` : 'sin fecha límite'}
                          </span>
                        </span>
                        <span className="flex flex-wrap items-center gap-2">
                          {a.estado === 'cerrada' && <Pastilla>Cerrada</Pastilla>}
                          {a.entregas.entregada > 0 && <Pastilla tono="bg-neon/10 text-neon">{a.entregas.entregada} por evaluar</Pastilla>}
                          <Pastilla tono="bg-amatista/15 text-amatista-claro">
                            {entregadas}/{grupo.alumnos.length} entregaron
                          </Pastilla>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </Tarjeta>
        </div>

        <Tarjeta etiqueta="Alumnos" titulo={`${grupo.alumnos.length} en el grupo`}>
          {grupo.alumnos.length === 0 ? (
            <Vacio titulo="Nadie se ha unido todavía.">Comparte el código {grupo.codigo}.</Vacio>
          ) : (
            <ul className="divide-y divide-white/5">
              {grupo.alumnos.map((alumno) => (
                <li key={alumno.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-white">{alumno.nombre}</span>
                    <span className="block truncate text-xs text-white/45">{alumno.email}</span>
                  </span>
                  <Boton chico variante="peligro" onClick={() => sacar(alumno)} aria-label={`Sacar a ${alumno.nombre}`}>
                    Sacar
                  </Boton>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}

export default Grupo;
