// Mi clase / Mi grupo (Mi panel): el alumno se une a la clase de su profesor con
// un código (ej. AMA-7K2P) y envía sus prácticas.
//
// Regla clave de arquitectura: NO se captura ni sube el archivo .blend binario
// pesado (15–50 MB). Se captura EL CÓDIGO DEL MODELO (Python bpy, A-Frame
// <a-scene> o JSON amatista.modelo/1 en ~1 KB) y se recrea en 3D en la interfaz
// del profesor (#/profesor).
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CLAVE_ESTUDIO } from '../../estudio/plantillas';
import { CODIGO_CLASE_DEMO } from '../../profesor/aulaLocal';
import { estadoParaAlumno, fecha } from '../../profesor/logica';
import { bytesLegibles, compilarCodigoModelo, PLANTILLAS_CODIGO_MODELO } from '../../profesor/modelo';
import { rutas } from '../../rutas';
import { abrirPractica, ordenarBlender } from '../../services/blender';
import { marcarEvaluacionVista, misAsignaciones, subirCodigoModelo, unirmeAGrupo } from '../../services/evaluacion';
import { abrirEnlace, hayQueLanzar, urlBlender } from '../../services/lanzador';
import Seccion from './Seccion';

const BOTON = 'corte-poly-sm px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition';

function Unirme({ token, usuario, alUnirse }) {
  const [codigo, setCodigo] = useState('');
  const [estado, setEstado] = useState({ enviando: false, error: null, exito: null });

  const unirConCodigo = async (valor) => {
    setEstado({ enviando: true, error: null, exito: null });
    const r = await unirmeAGrupo(token, valor, usuario);
    if (!r.ok) {
      setEstado({ enviando: false, error: r.error, exito: null });
      return;
    }
    setCodigo('');
    setEstado({ enviando: false, error: null, exito: `Te uniste a «${r.datos.nombre}» (${r.datos.codigo || valor.toUpperCase()}).` });
    alUnirse(r.datos);
  };

  const enviar = (evento) => {
    evento.preventDefault();
    unirConCodigo(codigo);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={enviar} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wider text-white/70">
          Código de la clase de tu profesor
          <input
            className="corte-poly-sm mt-1 block w-full border border-white/10 bg-base/70 px-3 py-2.5 font-mono text-lg uppercase tracking-[0.2em] text-white placeholder:text-white/25 focus:border-neon focus:outline-none"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder={CODIGO_CLASE_DEMO}
            autoComplete="off"
            maxLength={20}
            required
          />
        </label>
        <button type="submit" disabled={estado.enviando || codigo.trim().length < 4} className={`${BOTON} bg-amatista py-3 text-white hover:brightness-110 disabled:opacity-45`}>
          {estado.enviando ? 'Uniendo…' : 'Unirme a la clase'}
        </button>
        <button
          type="button"
          onClick={() => unirConCodigo(CODIGO_CLASE_DEMO)}
          className={`${BOTON} border border-neon/40 bg-neon/10 py-3 text-neon hover:bg-neon/20`}
        >
          Usar código demo ({CODIGO_CLASE_DEMO})
        </button>
      </form>
      {estado.error && <p role="alert" className="text-sm text-red-300">{estado.error}</p>}
      {estado.exito && <p role="status" className="text-sm text-emerald-300">{estado.exito}</p>}
    </div>
  );
}

function EditorCodigoModelo({ token, usuario, asignacion, alEntregar, alCerrar }) {
  const plantillaSugerida =
    PLANTILLAS_CODIGO_MODELO.find((p) => p.practica_id === asignacion.practica_id) ?? PLANTILLAS_CODIGO_MODELO[0];
  const [codigo, setCodigo] = useState(() => asignacion.entrega?.codigo_fuente || plantillaSugerida.codigo);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const analisis = useMemo(() => {
    try {
      const datos = compilarCodigoModelo(codigo);
      let triangulos = 0;
      let vertices = 0;
      for (const o of datos.objetos ?? []) {
        if (Array.isArray(o.v)) vertices += o.v.length / 3;
        if (Array.isArray(o.t)) triangulos += o.t.length / 3;
      }
      const bytes = new TextEncoder().encode(codigo).length;
      return {
        ok: true,
        piezas: (datos.objetos ?? []).length,
        triangulos,
        vertices,
        bytes,
        lenguaje: datos.lenguaje,
      };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, [codigo]);

  const cargarDesdeEstudio = () => {
    try {
      const guardado = window.localStorage.getItem(CLAVE_ESTUDIO);
      if (guardado && guardado.trim()) {
        setCodigo(guardado);
        setError(null);
      } else {
        setError('Aún no tienes una escena guardada en el Estudio A-Frame (#/estudio). Cargamos la plantilla A-Frame.');
        setCodigo(PLANTILLAS_CODIGO_MODELO.find((p) => p.id === 'faro_aframe').codigo);
      }
    } catch {
      setCodigo(PLANTILLAS_CODIGO_MODELO.find((p) => p.id === 'faro_aframe').codigo);
    }
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    if (!analisis.ok) {
      setError(analisis.error);
      return;
    }
    setEnviando(true);
    setError(null);
    const r = await subirCodigoModelo(token, { asignacionId: asignacion.id, codigo, usuario });
    setEnviando(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    alEntregar(r.datos);
  };

  return (
    <form onSubmit={enviar} className="corte-poly-sm mt-3 space-y-3 border border-neon/40 bg-superficie/95 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-neon">
            Captura de código del modelo (sin subir archivos .blend pesados)
          </p>
          <p className="mt-0.5 text-xs text-texto/80">
            Elige una plantilla o pega el código de tu escena (<strong>Python de Blender</strong>, <strong>A-Frame HTML</strong> o <strong>JSON estructural</strong>). La interfaz del profesor leerá este código y recreará tu modelo en 3D.
          </p>
        </div>
        <button type="button" onClick={alCerrar} className="font-mono text-xs text-white/50 hover:text-white">
          Cerrar ✕
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PLANTILLAS_CODIGO_MODELO.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setCodigo(p.codigo);
              setError(null);
            }}
            className="corte-poly-sm border border-white/15 bg-base/80 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white/80 hover:border-neon hover:text-neon"
          >
            Cargar: {p.nombre}
          </button>
        ))}
        <button
          type="button"
          onClick={cargarDesdeEstudio}
          className="corte-poly-sm border border-amatista-claro/40 bg-amatista/15 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-amatista-claro hover:border-neon hover:text-neon"
        >
          Traer mi escena del Estudio A-Frame
        </button>
      </div>

      <div>
        <label htmlFor={`codigo-${asignacion.id}`} className="sr-only">
          Código del modelo
        </label>
        <textarea
          id={`codigo-${asignacion.id}`}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          rows={9}
          spellCheck={false}
          className="corte-poly-sm w-full border border-white/15 bg-base px-3 py-2.5 font-mono text-xs leading-relaxed text-emerald-200 focus:border-neon focus:outline-none"
          placeholder="Pega aquí el código Python de Blender, las etiquetas <a-scene> de A-Frame o el JSON de tu modelo…"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {analisis.ok ? (
          <p className="font-mono text-[11px] text-emerald-300">
            ✓ Código listo para recrear en 3D: <strong>{analisis.piezas} piezas</strong> · <strong>{analisis.triangulos} triángulos</strong> · <strong>{bytesLegibles(analisis.bytes)}</strong> (frente a ~15 MB de un archivo .blend)
          </p>
        ) : (
          <p className="text-amber-300">{analisis.error}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={enviando || !analisis.ok}
            className={`${BOTON} bg-neon py-2 text-base hover:brightness-110 disabled:opacity-40`}
          >
            {enviando ? 'Capturando código…' : 'Enviar código del modelo al profesor ▸'}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
    </form>
  );
}

function Tarea({ token, usuario, asignacion, alVer, alActualizar }) {
  const [aviso, setAviso] = useState(null);
  const [abiertoCodigo, setAbiertoCodigo] = useState(false);
  const [recienEntregado, setRecienEntregado] = useState(false);
  const estado = estadoParaAlumno(asignacion);
  const entrega = asignacion.entrega;
  const puedeEntregar = asignacion.estado === 'abierta' && entrega?.estado !== 'evaluada';

  const abrir = async () => {
    const r = await abrirPractica(token, asignacion.practica_id);
    if (hayQueLanzar(r)) abrirEnlace(urlBlender('abrir_practica', { practica_id: asignacion.practica_id }));
    setAviso(r.ok ? 'Se abre en Blender. También puedes capturar y subir el código del modelo aquí mismo.' : r.error);
  };

  const entregarDesdeBlender = async () => {
    const r = await ordenarBlender(token, 'entregar', asignacion.practica_id);
    if (!r.ok) {
      setAbiertoCodigo(true);
      setAviso('Abriendo el capturador de código del modelo en el navegador.');
    } else if (r.datos?.entregada) {
      setAviso('Blender está enviando el código ligero de tu escena a tu profesor.');
    } else {
      setAbiertoCodigo(true);
    }
  };

  return (
    <li className={`corte-poly-sm border bg-base/55 p-4 ${entrega?.nueva || recienEntregado ? 'border-neon' : 'border-white/10'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-white">{asignacion.titulo}</p>
          <p className="text-xs text-white/50">
            {asignacion.practica} · {asignacion.fecha_limite ? `Para el ${fecha(asignacion.fecha_limite, { soloDia: true })}` : 'Entrega abierta'}
          </p>
        </div>
        <p className={`font-mono text-[11px] font-bold uppercase tracking-widest ${estado.tono}`}>{estado.texto}</p>
      </div>
      {asignacion.indicaciones && <p className="mt-2 text-sm text-texto/80">{asignacion.indicaciones}</p>}

      {entrega?.resumen && (
        <p className="mt-2 font-mono text-[11px] text-emerald-300/90">
          ✓ Código capturado enviado: {entrega.resumen.objetos} piezas · {entrega.resumen.triangulos} triángulos · {bytesLegibles(entrega.modelo_bytes)}
        </p>
      )}

      {entrega?.comentario && (
        <blockquote className="mt-3 border-l-2 border-amatista-claro pl-3 text-sm text-white/85">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-amatista-claro">Tu profesor dice</span>
          {entrega.comentario}
        </blockquote>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {puedeEntregar && (
          <button
            type="button"
            onClick={() => setAbiertoCodigo((v) => !v)}
            className={`${BOTON} bg-neon text-base hover:brightness-110`}
          >
            {abiertoCodigo ? 'Ocultar editor de código' : entrega ? 'Actualizar código del modelo' : 'Subir código del modelo ▸'}
          </button>
        )}
        <a
          href={rutas.profesorPractica(asignacion.id)}
          className={`${BOTON} border border-amatista-claro/45 bg-amatista/20 text-amatista-claro hover:border-neon hover:text-neon`}
        >
          Ver recreado en interfaz del profesor ▸
        </a>
        {asignacion.curso_id && asignacion.leccion_id && (
          <a href={rutas.leccion(asignacion.curso_id, asignacion.leccion_id)} className={`${BOTON} bg-white/5 text-white/80 hover:bg-white/10`}>
            Ver la lección
          </a>
        )}
        {puedeEntregar && token && (
          <button type="button" onClick={abrir || entregarDesdeBlender} className={`${BOTON} bg-white/5 text-white/70 hover:bg-white/10`}>
            Abrir en Blender
          </button>
        )}
        {entrega?.nueva && (
          <button type="button" onClick={() => alVer(asignacion.id)} className={`${BOTON} text-neon hover:underline`}>
            Ya lo leí
          </button>
        )}
      </div>

      {recienEntregado && (
        <div role="status" className="corte-poly-sm mt-3 flex flex-wrap items-center justify-between gap-2 border border-emerald-400/40 bg-emerald-400/10 p-3 text-xs text-emerald-200">
          <span>
            <strong>¡Código del modelo capturado y enviado!</strong> Ahora puedes abrir la interfaz del profesor para ver cómo se recrea tu modelo 3D a partir del código.
          </span>
          <a href={rutas.profesorPractica(asignacion.id)} className="corte-poly-sm bg-neon px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-base hover:brightness-110">
            Recrear en interfaz del profesor (#/profesor) ▸
          </a>
        </div>
      )}

      {aviso && <p role="status" className="mt-2 text-sm text-white/70">{aviso}</p>}

      {abiertoCodigo && (
        <EditorCodigoModelo
          token={token}
          usuario={usuario}
          asignacion={asignacion}
          alCerrar={() => setAbiertoCodigo(false)}
          alEntregar={() => {
            setAbiertoCodigo(false);
            setRecienEntregado(true);
            alActualizar();
          }}
        />
      )}
    </li>
  );
}

function GrupoPanel({ token, usuario, className = '' }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    const r = await misAsignaciones(token, usuario);
    if (r.ok) {
      setDatos(r.datos);
      setError(null);
    } else {
      setError(r.error);
    }
  }, [token, usuario]);

  useEffect(() => {
    let vigente = true;
    misAsignaciones(token, usuario).then((r) => {
      if (!vigente) return;
      if (r.ok) setDatos(r.datos);
      else setError(r.error);
    });
    return () => {
      vigente = false;
    };
  }, [token, usuario]);

  const alVer = async (asignacionId) => {
    await marcarEvaluacionVista(token, asignacionId, usuario);
    setDatos((d) => ({
      ...d,
      asignaciones: d.asignaciones.map((a) => (a.id === asignacionId && a.entrega ? { ...a, entrega: { ...a.entrega, nueva: false } } : a)),
    }));
  };

  const asignaciones = datos?.asignaciones ?? [];
  const grupos = datos?.grupos ?? [];
  const nuevas = asignaciones.filter((a) => a.entrega?.nueva).length;

  return (
    <Seccion
      id="panel-grupo"
      etiqueta={nuevas ? `${nuevas} ${nuevas === 1 ? 'respuesta nueva' : 'respuestas nuevas'}` : 'Mi clase · Entrega por código de modelo'}
      titulo={grupos.length ? grupos.map((g) => `${g.nombre} (${g.codigo || CODIGO_CLASE_DEMO})`).join(' · ') : 'Unirse a una clase y subir código de modelo'}
      className={className}
    >
      <div className="corte-poly-sm mb-4 flex flex-wrap items-center justify-between gap-3 border border-amatista-claro/30 bg-amatista/10 p-3.5 text-xs leading-relaxed text-texto/90">
        <p className="max-w-3xl">
          <strong className="text-white">Cómo funciona la entrega en Amatista:</strong> el alumno se une con el código de su clase (<code className="text-neon">{CODIGO_CLASE_DEMO}</code>) y sube sus prácticas. <strong className="text-neon">No se captura el archivo 3D binario pesado</strong>: se captura el <strong>código estructural del modelo</strong> (~1 KB) y se recrea en 3D interactivo dentro de la interfaz del profesor.
        </p>
        <a
          href={rutas.profesor}
          className="corte-poly-sm max-w-full border border-neon/50 bg-neon/15 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-neon [overflow-wrap:anywhere] hover:bg-neon/25 sm:shrink-0"
        >
          Abrir interfaz del profesor (#/profesor) ▸
        </a>
      </div>

      {error && <p role="alert" className="mb-3 text-sm text-red-300">{error}</p>}

      {grupos.length > 0 && (
        <p className="mb-3 text-sm text-white/65">
          Clase activa: <strong className="text-white">{grupos.map((g) => `${g.nombre} con ${g.profesor ?? 'tu profesor'}`).join(' · ')}</strong>
        </p>
      )}

      {asignaciones.length > 0 ? (
        <ul className="grid gap-3 lg:grid-cols-2">
          {asignaciones.map((a) => (
            <Tarea key={a.id} token={token} usuario={usuario} asignacion={a} alVer={alVer} alActualizar={cargar} />
          ))}
        </ul>
      ) : (
        grupos.length > 0 && <p className="text-sm text-white/60">Tu profesor todavía no deja prácticas en este grupo.</p>
      )}

      <details className="mt-4" open={grupos.length === 0}>
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-widest text-neon hover:underline">
          {grupos.length ? '＋ Unirme a otra clase con código de profesor' : '＋ Unirme a la clase de mi profesor'}
        </summary>
        <div className="mt-3">
          <Unirme token={token} usuario={usuario} alUnirse={cargar} />
        </div>
      </details>
    </Seccion>
  );
}

export default GrupoPanel;
