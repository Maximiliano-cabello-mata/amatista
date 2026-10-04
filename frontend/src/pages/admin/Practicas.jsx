// #/admin/practicas: prácticas del motor de Blender registradas en Oracle.
// Los desarrolladores las suben desde Amatista Author (siempre en borrador);
// aquí el administrador revisa sus versiones y decide cuál ven los alumnos.
import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import {
  Boton,
  CargandoAdmin,
  Confirmacion,
  ErrorAdmin,
  EtiquetaEstado,
  Kpi,
  Mensaje,
  Pastilla,
  Tarjeta,
  Vacio,
} from '../../components/admin/ui';
import { useConfirmacion } from '../../components/admin/useConfirmacion';
import { useDatosAdmin } from '../../components/admin/useDatosAdmin';
import { rutas } from '../../rutas';
import {
  archivarPractica,
  listarPracticas,
  publicarPractica,
  sincronizarPracticas,
  versionesPractica,
} from '../../services/blender';

const fecha = (iso) => (iso ? new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

const ORIGENES = { repositorio: 'Repositorio', addon: 'Amatista Author', panel: 'Panel' };

function Versiones({ token, practica }) {
  const { datos, respuesta, cargando } = useDatosAdmin(() => versionesPractica(token, practica.id), `${practica.id}:${practica.version_ultima}`);
  if (cargando && !datos) return <p className="text-sm text-white/50">Cargando historial…</p>;
  if (!respuesta?.ok) return <Mensaje tono="error">{respuesta?.error}</Mensaje>;
  return (
    <ol className="grid gap-1.5">
      {datos.versiones.map((v) => (
        <li key={v.version} className="corte-poly-sm flex flex-wrap items-center gap-x-3 gap-y-1 bg-base/60 px-3 py-2 text-sm">
          <span className="font-mono font-bold text-white">v{v.version}</span>
          {v.publicada && <Pastilla tono="bg-emerald-400/10 text-emerald-300">La ven los alumnos</Pastilla>}
          <span className="text-white/60">{v.nota || 'Sin nota'}</span>
          <span className="ml-auto font-mono text-[11px] text-white/45">
            {v.autor ?? '—'} · {v.version_blender ? `Blender ${v.version_blender} · ` : ''}
            {fecha(v.creado_en)}
          </span>
        </li>
      ))}
    </ol>
  );
}

function FilaPractica({ practica, esAdmin, token, alCambiar, preguntar }) {
  const [abierta, setAbierta] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const pendiente = practica.version_ultima !== practica.version_publicada;

  const publicar = async () => {
    const ok = await preguntar({
      titulo: `¿Publicar la versión ${practica.version_ultima}?`,
      texto: 'Los alumnos recibirán esta versión la próxima vez que abran la práctica. Su progreso se conserva.',
      confirmar: 'Publicar',
    });
    if (!ok) return;
    const r = await publicarPractica(token, practica.id, practica.version_ultima);
    setMensaje(r.ok ? { tono: 'exito', texto: `Versión ${practica.version_ultima} publicada.` } : { tono: 'error', texto: r.error });
    if (r.ok) alCambiar();
  };

  const archivar = async () => {
    const ok = await preguntar({
      titulo: '¿Archivar la práctica?',
      texto: 'Deja de aparecer para los alumnos. El progreso y el historial se conservan.',
      confirmar: 'Archivar',
      peligro: true,
    });
    if (!ok) return;
    const r = await archivarPractica(token, practica.id);
    setMensaje(r.ok ? { tono: 'exito', texto: 'Práctica archivada.' } : { tono: 'error', texto: r.error });
    if (r.ok) alCambiar();
  };

  return (
    <li className="corte-poly-sm border border-white/10 bg-base/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-widest text-blender">
            Nivel {practica.nivel} · {practica.id}
          </p>
          <p className="mt-0.5 text-lg font-bold text-white">{practica.titulo}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <EtiquetaEstado estado={practica.estado} />
            <Pastilla>Última v{practica.version_ultima}</Pastilla>
            <Pastilla tono={practica.version_publicada ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-white/45'}>
              {practica.version_publicada ? `Alumnos v${practica.version_publicada}` : 'Sin publicar'}
            </Pastilla>
            <Pastilla>{ORIGENES[practica.origen] ?? practica.origen}</Pastilla>
            {practica.curso_id && practica.leccion_id ? (
              <a href={rutas.leccion(practica.curso_id, practica.leccion_id)} className="font-mono text-[11px] text-neon hover:underline">
                Lección {practica.leccion_id} ▸
              </a>
            ) : (
              <Pastilla tono="bg-amber-300/10 text-amber-200">Sin lección</Pastilla>
            )}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-center">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-white/50">Alumnos</dt>
            <dd className="text-2xl font-extrabold tabular-nums text-white">{practica.alumnos ?? 0}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-white/50">Completas</dt>
            <dd className="text-2xl font-extrabold tabular-nums text-emerald-300">{practica.completadas ?? 0}</dd>
          </div>
        </dl>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Boton chico onClick={() => setAbierta((a) => !a)} aria-expanded={abierta}>
          {abierta ? 'Ocultar versiones' : 'Versiones'}
        </Boton>
        {esAdmin && pendiente && (
          <Boton chico variante="primario" onClick={publicar}>
            Publicar v{practica.version_ultima}
          </Boton>
        )}
        {esAdmin && practica.estado !== 'archivado' && (
          <Boton chico variante="peligro" onClick={archivar}>
            Archivar
          </Boton>
        )}
      </div>
      {mensaje && <Mensaje tono={mensaje.tono} className="mt-3">{mensaje.texto}</Mensaje>}
      {abierta && (
        <div className="mt-3">
          <Versiones token={token} practica={practica} />
        </div>
      )}
    </li>
  );
}

function Practicas({ esAdmin }) {
  const { token } = useAuth();
  const { datos, respuesta, cargando, recargar } = useDatosAdmin(() => listarPracticas(token), token ?? '');
  const confirmacion = useConfirmacion();
  const [sincronizando, setSincronizando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const sincronizar = async (publicar) => {
    if (publicar) {
      const ok = await confirmacion.preguntar({
        titulo: '¿Registrar y publicar?',
        texto: 'Se registran las prácticas de practices/blender/ del repositorio y su última versión queda visible para los alumnos.',
        confirmar: 'Registrar y publicar',
      });
      if (!ok) return;
    }
    setSincronizando(true);
    const r = await sincronizarPracticas(token, { publicar });
    setSincronizando(false);
    if (!r.ok) {
      setResultado({ tono: 'error', texto: r.error });
      return;
    }
    const nuevas = r.datos.practicas.filter((p) => !p.sin_cambios).length;
    const errores = r.datos.errores.length ? ` Con errores: ${r.datos.errores.join(' · ')}` : '';
    setResultado({
      tono: r.datos.errores.length ? 'aviso' : 'exito',
      texto: `${r.datos.practicas.length} práctica(s) revisadas, ${nuevas} con versión nueva, ${r.datos.lecciones_enlazadas} lección(es) enlazadas.${errores}`,
    });
    recargar();
  };

  if (cargando && !datos) return <CargandoAdmin texto="Cargando prácticas…" />;
  if (respuesta && !respuesta.ok) {
    if (respuesta.status === 404 || respuesta.status === 503) {
      return (
        <Mensaje tono="aviso">
          El servidor todavía no tiene el motor de prácticas: aplica sql/007_motor_practicas.sql en Oracle y actualiza el
          backend (docs/reestructuracion/02_manual_oracle.md, sección 7).
        </Mensaje>
      );
    }
    return <ErrorAdmin respuesta={respuesta} alReintentar={recargar} />;
  }

  const lista = datos?.practicas ?? [];
  const alumnos = lista.reduce((suma, p) => suma + (p.alumnos ?? 0), 0);
  const completas = lista.reduce((suma, p) => suma + (p.completadas ?? 0), 0);
  const porPublicar = lista.filter((p) => p.version_ultima !== p.version_publicada && p.estado !== 'archivado').length;

  return (
    <div className="grid gap-6">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi etiqueta="Prácticas" valor={lista.length} />
        <Kpi etiqueta="Por publicar" valor={porPublicar} tono={porPublicar ? 'text-amber-200' : 'text-white'} detalle="Versiones nuevas de Author" />
        <Kpi etiqueta="Alumnos" valor={alumnos} detalle="Abrieron o enviaron avance" />
        <Kpi etiqueta="Completadas" valor={completas} tono="text-emerald-300" />
      </dl>

      <Tarjeta
        etiqueta="Motor Amatista"
        titulo="Prácticas de Blender"
        accion={
          esAdmin && (
            <div className="flex flex-wrap gap-2">
              <Boton chico onClick={() => sincronizar(false)} disabled={sincronizando}>
                {sincronizando ? 'Registrando…' : 'Registrar las del repositorio'}
              </Boton>
              <Boton chico variante="primario" onClick={() => sincronizar(true)} disabled={sincronizando}>
                Registrar y publicar
              </Boton>
            </div>
          )
        }
      >
        {resultado && <Mensaje tono={resultado.tono} className="mb-4">{resultado.texto}</Mensaje>}
        {lista.length ? (
          <ul className="grid gap-3">
            {lista.map((p) => (
              <FilaPractica key={p.id} practica={p} esAdmin={esAdmin} token={token} alCambiar={recargar} preguntar={confirmacion.preguntar} />
            ))}
          </ul>
        ) : (
          <Vacio titulo="Todavía no hay prácticas registradas">
            Pulsa «Registrar las del repositorio» o sube una desde Blender con Amatista Author (modo desarrollador).
          </Vacio>
        )}
      </Tarjeta>
      <Confirmacion {...confirmacion} />
    </div>
  );
}

export default Practicas;
