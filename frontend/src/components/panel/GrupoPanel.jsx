// Mi grupo (Mi panel): el alumno se une al grupo de su profesor con un código,
// ve las prácticas que le dejó y lo que le respondió. Entrega desde Blender:
// su modelo viaja en pocos KB y el .blend se queda en su computadora.
import { useCallback, useEffect, useState } from 'react';
import { estadoParaAlumno, fecha } from '../../profesor/logica';
import { rutas } from '../../rutas';
import { abrirPractica, ordenarBlender } from '../../services/blender';
import { marcarEvaluacionVista, misAsignaciones, unirmeAGrupo } from '../../services/evaluacion';
import { abrirEnlace, hayQueLanzar, urlBlender } from '../../services/lanzador';
import Seccion from './Seccion';

const BOTON = 'corte-poly-sm px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest';

function Unirme({ token, alUnirse }) {
  const [codigo, setCodigo] = useState('');
  const [estado, setEstado] = useState({ enviando: false, error: null });
  const enviar = async (evento) => {
    evento.preventDefault();
    setEstado({ enviando: true, error: null });
    const r = await unirmeAGrupo(token, codigo);
    setEstado({ enviando: false, error: r.ok ? null : r.error });
    if (r.ok) {
      setCodigo('');
      alUnirse(r.datos);
    }
  };
  return (
    <form onSubmit={enviar} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <label className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wider text-white/70">
        Código de tu profesor
        <input
          className="corte-poly-sm mt-1 block w-full border border-white/10 bg-base/70 px-3 py-2.5 font-mono text-lg uppercase tracking-[0.2em] text-white placeholder:text-white/25 focus:border-neon focus:outline-none"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="AMA-7K2P"
          autoComplete="off"
          maxLength={20}
          required
        />
      </label>
      <button type="submit" disabled={estado.enviando || codigo.trim().length < 4} className={`${BOTON} bg-amatista py-3 text-white hover:brightness-110 disabled:opacity-45`}>
        {estado.enviando ? 'Uniendo…' : 'Unirme'}
      </button>
      {estado.error && <p role="alert" className="text-sm text-red-300 sm:basis-full">{estado.error}</p>}
    </form>
  );
}

function Tarea({ token, asignacion, alVer }) {
  const [aviso, setAviso] = useState(null);
  const estado = estadoParaAlumno(asignacion);
  const entrega = asignacion.entrega;
  const puedeEntregar = asignacion.estado === 'abierta' && entrega?.estado !== 'evaluada';

  const abrir = async () => {
    const r = await abrirPractica(token, asignacion.practica_id);
    if (hayQueLanzar(r)) abrirEnlace(urlBlender('abrir_practica', { practica_id: asignacion.practica_id }));
    setAviso(r.ok ? 'Se abre en Blender. Cuando termines, entrégala desde aquí o desde el menú Amatista.' : r.error);
  };
  const entregar = async () => {
    const r = await ordenarBlender(token, 'entregar', asignacion.practica_id);
    if (!r.ok) setAviso(r.error);
    else if (r.datos?.entregada) setAviso('Blender la está entregando: Blender te avisa cuando tu profesor la reciba (si tenías otra práctica abierta, abre esta primero).');
    else setAviso('Abre la práctica en Blender y vuelve a pulsar «Entregar» (o usa el menú Amatista › Entregar a mi profesor).');
  };

  return (
    <li className={`corte-poly-sm border bg-base/50 p-4 ${entrega?.nueva ? 'border-neon' : 'border-white/10'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-white">{asignacion.titulo}</p>
          <p className="text-xs text-white/50">
            {asignacion.fecha_limite ? `Para el ${fecha(asignacion.fecha_limite, { soloDia: true })}` : 'Sin fecha límite'}
          </p>
        </div>
        <p className={`font-mono text-[11px] font-bold uppercase tracking-widest ${estado.tono}`}>{estado.texto}</p>
      </div>
      {asignacion.indicaciones && <p className="mt-2 text-sm text-texto/80">{asignacion.indicaciones}</p>}
      {entrega?.comentario && (
        <blockquote className="mt-3 border-l-2 border-amatista-claro pl-3 text-sm text-white/85">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-amatista-claro">Tu profesor dice</span>
          {entrega.comentario}
        </blockquote>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {asignacion.curso_id && asignacion.leccion_id && (
          <a href={rutas.leccion(asignacion.curso_id, asignacion.leccion_id)} className={`${BOTON} bg-white/5 text-white/80 hover:bg-white/10`}>
            Ver la lección
          </a>
        )}
        {puedeEntregar && (
          <>
            <button type="button" onClick={abrir} className={`${BOTON} bg-white/5 text-white/80 hover:bg-white/10`}>Abrir en Blender</button>
            <button type="button" onClick={entregar} className={`${BOTON} bg-neon text-base hover:brightness-110`}>
              {entrega ? 'Volver a entregar' : 'Entregar'}
            </button>
          </>
        )}
        {entrega?.nueva && (
          <button type="button" onClick={() => alVer(asignacion.id)} className={`${BOTON} text-neon hover:underline`}>
            Ya lo leí
          </button>
        )}
      </div>
      {aviso && <p role="status" className="mt-2 text-sm text-white/70">{aviso}</p>}
    </li>
  );
}

function GrupoPanel({ token, usuario, className = '' }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (!token) return;
    const r = await misAsignaciones(token);
    if (r.ok) {
      setDatos(r.datos);
      setError(null);
    } else if (r.status !== 503) {
      setError(r.error);
    } else {
      setDatos({ grupos: [], asignaciones: [], preparando: true });
    }
  }, [token]);

  useEffect(() => {
    let vigente = true;
    if (token) {
      misAsignaciones(token).then((r) => {
        if (!vigente) return;
        if (r.ok) setDatos(r.datos);
        else if (r.status === 503) setDatos({ grupos: [], asignaciones: [], preparando: true });
        else setError(r.error);
      });
    }
    return () => {
      vigente = false;
    };
  }, [token]);

  const alVer = async (asignacionId) => {
    await marcarEvaluacionVista(token, asignacionId);
    setDatos((d) => ({ ...d, asignaciones: d.asignaciones.map((a) => (a.id === asignacionId && a.entrega ? { ...a, entrega: { ...a.entrega, nueva: false } } : a)) }));
  };

  // Sin cuenta no hay grupo: la tarjeta de la cuenta ya invita a crear una.
  if (!usuario) return null;

  const asignaciones = datos?.asignaciones ?? [];
  const grupos = datos?.grupos ?? [];
  const nuevas = asignaciones.filter((a) => a.entrega?.nueva).length;
  return (
    <Seccion id="panel-grupo" etiqueta={nuevas ? `${nuevas} ${nuevas === 1 ? 'respuesta nueva' : 'respuestas nuevas'}` : 'Mi grupo'} titulo={grupos.length ? grupos.map((g) => g.nombre).join(' · ') : 'Mi grupo'} className={className}>
      {error && <p role="alert" className="mb-3 text-sm text-red-300">{error}</p>}
      {datos?.preparando ? (
        <p className="text-sm text-white/60">Los grupos se están preparando en el servidor. Vuelve pronto.</p>
      ) : (
        <>
          {grupos.length > 0 && (
            <p className="mb-4 text-sm text-white/60">
              {grupos.map((g) => `${g.nombre} con ${g.profesor ?? 'tu profesor'}`).join(' · ')}
            </p>
          )}
          {asignaciones.length > 0 ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {asignaciones.map((a) => (
                <Tarea key={a.id} token={token} asignacion={a} alVer={alVer} />
              ))}
            </ul>
          ) : (
            grupos.length > 0 && <p className="text-sm text-white/60">Tu profesor todavía no deja prácticas.</p>
          )}
          <details className="mt-4" open={grupos.length === 0}>
            <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-widest text-white/55">
              {grupos.length ? 'Unirme a otro grupo' : 'Unirme al grupo de mi profesor'}
            </summary>
            <div className="mt-3">
              <Unirme token={token} alUnirse={cargar} />
            </div>
          </details>
        </>
      )}
    </Seccion>
  );
}

export default GrupoPanel;
