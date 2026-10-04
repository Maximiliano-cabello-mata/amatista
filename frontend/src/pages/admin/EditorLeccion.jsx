// Editor de lecciones (#/admin/contenido/:curso/:leccion y
// #/admin/contenido/nueva/:modulo): metadatos, bloques en JSON con la paleta
// de plantillas, vista previa con los mismos componentes que ve el alumno,
// validación del servidor, guardar y publicar.
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { marcarCambiosPendientes } from '../../components/admin/cambios';
import { claseControl } from '../../components/admin/estilos';
import {
  aTextoJSON,
  armarLeccion,
  bloqueDelError,
  bloqueDesdeEjemplo,
  leccionDesdePlantilla,
  listaDeIds,
  moverElemento,
  separarLeccion,
} from '../../components/admin/logica';
import {
  Boton,
  CampoAdmin,
  CargandoAdmin,
  Confirmacion,
  EtiquetaEstado,
  ErrorAdmin,
  Mensaje,
  Pastilla,
  Tarjeta,
} from '../../components/admin/ui';
import { useConfirmacion } from '../../components/admin/useConfirmacion';
import { useDatosAdmin } from '../../components/admin/useDatosAdmin';
import BloqueContenido from '../../components/leccion/BloqueContenido';
import Examen from '../../components/leccion/Examen';
import { TIPOS_LECCION } from '../../data/cursos';
import { navegar, rutas } from '../../rutas';
import {
  crearLeccion,
  guardarLeccion,
  obtenerArbol,
  obtenerLeccion,
  obtenerPlantillas,
  publicarLeccion,
  validarLeccion,
} from '../../services/admin';

const NOMBRES_BLOQUE = {
  markdown_text: 'Texto',
  image: 'Imagen',
  concept_cards: 'Tarjetas de concepto',
  timeline: 'Línea de tiempo',
  pipeline: 'Pipeline',
  layers: 'Capas',
  callout: 'Aviso',
  code_snippet: 'Código',
  video_player: 'Video',
  quiz_inline: 'Pregunta rápida',
  ordering: 'Ordenar',
  matching: 'Emparejar',
  fill_blanks: 'Completar',
  hotspots: 'Puntos en imagen',
  scene_explorer: 'Explorador 3D',
  code_challenge: 'Reto de código',
  blender_practice: 'Práctica en Blender',
};

// Elegir con qué paso de la Fórmula empieza una lección nueva.
function ElegirPlantilla({ plantillas, modulo, alElegir }) {
  return (
    <Tarjeta etiqueta={modulo ? `Módulo ${modulo.numero} · ${modulo.titulo}` : 'Nueva lección'} titulo="¿Qué paso de la Fórmula es?">
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(plantillas.formula ?? []).map((paso) => (
          <li key={paso.paso}>
            <button
              type="button"
              onClick={() => alElegir(paso.paso)}
              className="corte-poly-sm h-full w-full border border-white/10 bg-base/60 p-4 text-left transition hover:border-amatista hover:bg-amatista/10"
            >
              <span className="block font-extrabold text-white">{paso.nombre}</span>
              <span className="mt-0.5 block font-mono text-[11px] text-neon">{paso.duracion}</span>
              <span className="mt-2 block text-sm text-white/65">{paso.descripcion}</span>
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => alElegir(null)}
            className="corte-poly-sm h-full w-full border border-dashed border-white/15 p-4 text-left text-white/70 transition hover:border-white/40"
          >
            <span className="block font-extrabold">En blanco</span>
            <span className="mt-2 block text-sm text-white/50">Una lectura vacía, sin plantilla.</span>
          </button>
        </li>
      </ul>
    </Tarjeta>
  );
}

function Metadatos({ base, cambiar, formula, soloLectura }) {
  return (
    <Tarjeta etiqueta={base.id ? base.id : 'Id automático al guardar'} titulo="Datos de la lección">
      <fieldset disabled={soloLectura} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CampoAdmin etiqueta="Título" className="sm:col-span-2">
          {({ id }) => <input id={id} value={base.title ?? ''} onChange={(e) => cambiar({ title: e.target.value })} className={claseControl} />}
        </CampoAdmin>
        <CampoAdmin etiqueta="Tipo">
          {({ id }) => (
            <select id={id} value={base.type ?? 'theory_reading'} onChange={(e) => cambiar({ type: e.target.value })} className={claseControl}>
              {Object.entries(TIPOS_LECCION).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>
          )}
        </CampoAdmin>
        <CampoAdmin etiqueta="Paso de la Fórmula">
          {({ id }) => (
            <select id={id} value={base.formula ?? ''} onChange={(e) => cambiar({ formula: e.target.value })} className={claseControl}>
              <option value="">Ninguno</option>
              {formula.map((paso) => (
                <option key={paso.paso} value={paso.paso}>
                  {paso.nombre}
                </option>
              ))}
            </select>
          )}
        </CampoAdmin>
        <CampoAdmin etiqueta="Duración (minutos)">
          {({ id }) => (
            <input
              id={id}
              type="number"
              min={0}
              max={120}
              value={base.durationSeconds ? Math.round(base.durationSeconds / 60) : ''}
              onChange={(e) => cambiar({ durationSeconds: Number(e.target.value) * 60 })}
              className={claseControl}
            />
          )}
        </CampoAdmin>
        <CampoAdmin etiqueta="Portada (ruta de imagen)" ayuda="Opcional, por ejemplo /ilustraciones/concepto-malla.svg">
          {({ id, describe }) => (
            <input id={id} aria-describedby={describe} value={base.cover ?? ''} onChange={(e) => cambiar({ cover: e.target.value })} className={claseControl} />
          )}
        </CampoAdmin>
        <CampoAdmin etiqueta="Reemplaza a" ayuda="Ids de lecciones viejas: su avance pasa a esta.">
          {({ id, describe }) => (
            <input
              id={id}
              aria-describedby={describe}
              defaultValue={(base.replaces ?? []).join(', ')}
              onBlur={(e) => cambiar({ replaces: listaDeIds(e.target.value) })}
              className={claseControl}
            />
          )}
        </CampoAdmin>
        <label className="flex items-center gap-2 self-center text-sm text-white/75">
          <input type="checkbox" checked={Boolean(base.isLocked)} onChange={(e) => cambiar({ isLocked: e.target.checked })} className="h-4 w-4 accent-[#9B59B6]" />
          Se desbloquea al terminar la anterior
        </label>
      </fieldset>
    </Tarjeta>
  );
}

function EditorBloque({ indice, total, texto, error, errorServidor, soloLectura, alCambiar, alMover, alQuitar }) {
  let tipo;
  try {
    tipo = JSON.parse(texto)?.type ?? null;
  } catch {
    tipo = null;
  }
  const lineas = Math.min(24, Math.max(4, texto.split('\n').length));
  return (
    <li
      id={`bloque-${indice}`}
      className={`corte-poly-sm border bg-base/50 p-3 ${error || errorServidor ? 'border-red-400/50' : 'border-white/10'}`}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs text-white/45">#{indice + 1}</span>
          <Pastilla tono="bg-amatista/20 text-amatista-claro">{NOMBRES_BLOQUE[tipo] ?? tipo ?? 'Sin tipo'}</Pastilla>
        </span>
        {!soloLectura && (
          <span className="flex gap-1">
            <Boton chico aria-label={`Subir bloque ${indice + 1}`} disabled={indice === 0} onClick={() => alMover(indice, indice - 1)}>
              ▲
            </Boton>
            <Boton chico aria-label={`Bajar bloque ${indice + 1}`} disabled={indice === total - 1} onClick={() => alMover(indice, indice + 1)}>
              ▼
            </Boton>
            <Boton chico variante="peligro" aria-label={`Quitar bloque ${indice + 1}`} onClick={() => alQuitar(indice)}>
              ✕
            </Boton>
          </span>
        )}
      </div>
      <label htmlFor={`texto-bloque-${indice}`} className="sr-only">
        JSON del bloque {indice + 1}
      </label>
      <textarea
        id={`texto-bloque-${indice}`}
        value={texto}
        onChange={(e) => alCambiar(indice, e.target.value)}
        readOnly={soloLectura}
        rows={lineas}
        spellCheck={false}
        className={`${claseControl} font-mono text-xs leading-relaxed`}
      />
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
      {errorServidor?.map((e) => (
        <p key={e} className="mt-1 text-xs text-red-300">
          {e}
        </p>
      ))}
    </li>
  );
}

function Paleta({ bloques, alAgregar }) {
  const [tipo, setTipo] = useState('markdown_text');
  return (
    <div className="flex flex-wrap items-end gap-2">
      <CampoAdmin etiqueta="Agregar bloque" className="min-w-[14rem] flex-1">
        {({ id }) => (
          <select id={id} value={tipo} onChange={(e) => setTipo(e.target.value)} className={claseControl}>
            {Object.keys(bloques).map((t) => (
              <option key={t} value={t}>
                {NOMBRES_BLOQUE[t] ?? t} ({t})
              </option>
            ))}
          </select>
        )}
      </CampoAdmin>
      <Boton variante="primario" onClick={() => alAgregar(tipo)}>
        + Agregar
      </Boton>
    </div>
  );
}

function VistaPrevia({ armada }) {
  const { leccion, erroresBloques, errorQuiz } = armada;
  return (
    <div className="corte-poly border border-white/10 bg-superficie/95 p-4 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon">Vista previa · así la ve el alumno</p>
      <h2 className="mt-1 text-3xl font-extrabold text-white">{leccion.title || 'Sin título'}</h2>
      {leccion.type === 'exam' ? (
        <div className="mt-6">
          {errorQuiz ? (
            <Mensaje tono="error">{errorQuiz}</Mensaje>
          ) : leccion.quizData?.questions?.length ? (
            <Examen key={JSON.stringify(leccion.quizData)} quiz={leccion.quizData} hrefCurso={rutas.adminContenido} alTerminar={() => {}} />
          ) : (
            <Mensaje tono="aviso">El examen todavía no tiene preguntas.</Mensaje>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {(leccion.contentBlocks ?? []).map((bloque, i) =>
            erroresBloques[i] ? (
              <Mensaje key={`error-${i}`} tono="error">
                Bloque #{i + 1}: {erroresBloques[i]}
              </Mensaje>
            ) : (
              // La clave cambia con el contenido: el bloque se reinicia al editarlo.
              <BloqueContenido key={`${i}-${JSON.stringify(bloque)}`} bloque={bloque} />
            ),
          )}
          {!leccion.contentBlocks?.length && <Mensaje tono="aviso">La lección todavía no tiene bloques.</Mensaje>}
        </div>
      )}
    </div>
  );
}

function Editor({ inicial, meta, cursoId, moduloId, plantillas, soloLectura }) {
  const { token } = useAuth();
  const confirmacion = useConfirmacion();
  const partes = useMemo(() => separarLeccion(inicial), [inicial]);
  const [base, setBase] = useState(partes.base);
  const [textos, setTextos] = useState(partes.textosBloques);
  const [textoQuiz, setTextoQuiz] = useState(partes.textoQuiz);
  const [estado, setEstado] = useState(meta?.estado ?? null);
  const [version, setVersion] = useState(meta?.version ?? null);
  const [sucio, setSucio] = useState(!meta);
  const [vista, setVista] = useState('editar');
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [erroresServidor, setErroresServidor] = useState([]);

  const armada = useMemo(() => armarLeccion(base, textos, textoQuiz), [base, textos, textoQuiz]);

  // Cambios sin guardar: los enlaces del panel preguntan antes de salir y el
  // navegador avisa al cerrar o recargar la pestaña.
  useEffect(() => {
    marcarCambiosPendientes(sucio && !soloLectura);
    if (!sucio || soloLectura) return undefined;
    const avisar = (evento) => {
      evento.preventDefault();
      evento.returnValue = '';
    };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [sucio, soloLectura]);
  useEffect(() => () => marcarCambiosPendientes(false), []);

  const editar = (cambio) => {
    setSucio(true);
    setMensaje(null);
    cambio();
  };
  const cambiarBase = (cambios) => editar(() => setBase((actual) => ({ ...actual, ...cambios })));
  const cambiarBloque = (i, texto) => editar(() => setTextos((actual) => actual.map((t, j) => (j === i ? texto : t))));
  const moverBloque = (desde, hacia) => editar(() => setTextos((actual) => moverElemento(actual, desde, hacia)));
  const quitarBloque = async (i) => {
    const seguro = await confirmacion.preguntar({ titulo: `¿Quitar el bloque #${i + 1}?`, texto: 'Se pierde su contenido si no lo copiaste.', confirmar: 'Quitar', peligro: true });
    if (seguro) editar(() => setTextos((actual) => actual.filter((_, j) => j !== i)));
  };
  const agregarBloque = (tipo) => {
    const usados = (armada.leccion.contentBlocks ?? []).map((b) => b?.id).filter(Boolean);
    const bloque = bloqueDesdeEjemplo(tipo, plantillas.bloques?.[tipo], usados);
    editar(() => setTextos((actual) => [...actual, aTextoJSON(bloque)]));
    setTimeout(() => document.getElementById(`texto-bloque-${textos.length}`)?.focus(), 0);
  };

  // Errores del validador por bloque ("contentBlocks[2] …") y los generales.
  const porBloque = {};
  const generales = [];
  erroresServidor.forEach((error) => {
    const i = bloqueDelError(error);
    if (i === null) generales.push(error);
    else (porBloque[i] ??= []).push(error);
  });

  const mostrarErrores = (respuesta) => {
    const errores = respuesta.datos?.errores ?? [];
    setErroresServidor(errores);
    setMensaje({ tono: 'error', texto: respuesta.error });
  };

  const validar = async () => {
    if (!armada.ok) return setMensaje({ tono: 'error', texto: 'Corrige primero el JSON marcado en rojo.' });
    setOcupado(true);
    const respuesta = await validarLeccion(token, armada.leccion);
    setOcupado(false);
    if (!respuesta.ok) return mostrarErrores(respuesta);
    setErroresServidor(respuesta.datos.errores);
    setMensaje(
      respuesta.datos.valida
        ? { tono: 'exito', texto: 'La lección es válida: se puede publicar.' }
        : { tono: 'aviso', texto: `Tiene ${respuesta.datos.errores.length} problema(s): se puede guardar en borrador, pero no publicar.` },
    );
  };

  const guardar = async () => {
    if (!armada.ok) return setMensaje({ tono: 'error', texto: 'Corrige primero el JSON marcado en rojo.' });
    setOcupado(true);
    const respuesta = meta
      ? await guardarLeccion(token, cursoId, base.id, armada.leccion)
      : await crearLeccion(token, { cursoId, moduloId, leccion: armada.leccion });
    setOcupado(false);
    if (!respuesta.ok) return mostrarErrores(respuesta);
    setSucio(false);
    marcarCambiosPendientes(false);
    setErroresServidor(respuesta.datos.errores ?? []);
    if (!meta) {
      navegar(rutas.adminLeccion(respuesta.datos.curso_id, respuesta.datos.id));
      return undefined;
    }
    setEstado(respuesta.datos.estado);
    setVersion(respuesta.datos.version);
    setMensaje(
      respuesta.datos.valida
        ? { tono: 'exito', texto: `Guardada (versión ${respuesta.datos.version}).` }
        : { tono: 'aviso', texto: 'Guardada en borrador, pero tiene problemas: corrígelos antes de publicar.' },
    );
    return undefined;
  };

  const publicar = async () => {
    const seguro = await confirmacion.preguntar({
      titulo: '¿Publicar la lección?',
      texto: 'Los alumnos la verán en el catálogo en cuanto actualicen. Después solo se aceptan cambios válidos.',
      confirmar: 'Publicar',
    });
    if (!seguro) return;
    setOcupado(true);
    const respuesta = await publicarLeccion(token, cursoId, base.id);
    setOcupado(false);
    if (!respuesta.ok) return mostrarErrores(respuesta);
    setEstado(respuesta.datos.estado);
    setErroresServidor([]);
    setMensaje({ tono: 'exito', texto: 'Lección publicada.' });
  };

  const esExamen = base.type === 'exam';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a href={rutas.adminContenido} className="font-mono text-xs uppercase tracking-widest text-white/55 hover:text-neon">
          ◂ Contenido
        </a>
        <span className="flex flex-wrap items-center gap-2">
          {estado && <EtiquetaEstado estado={estado} />}
          {version && <span className="font-mono text-xs text-white/45">v{version}</span>}
          {sucio && !soloLectura && <Pastilla tono="bg-amber-300/10 text-amber-200">Sin guardar</Pastilla>}
        </span>
      </div>

      <div role="tablist" aria-label="Modo" className="flex gap-1">
        {[
          ['editar', 'Editar'],
          ['previa', 'Vista previa'],
        ].map(([valor, texto]) => (
          <button
            key={valor}
            type="button"
            role="tab"
            aria-selected={vista === valor}
            onClick={() => setVista(valor)}
            className={`corte-poly-sm px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest ${
              vista === valor ? 'bg-amatista text-white' : 'bg-white/5 text-white/65 hover:bg-white/10'
            }`}
          >
            {texto}
          </button>
        ))}
      </div>

      {vista === 'previa' ? (
        <VistaPrevia armada={armada} />
      ) : (
        <>
          <Metadatos base={base} cambiar={cambiarBase} formula={plantillas.formula ?? []} soloLectura={soloLectura} />
          {esExamen ? (
            <Tarjeta etiqueta="quizData" titulo="Preguntas del examen">
              <label htmlFor="texto-quiz" className="sr-only">
                JSON del examen
              </label>
              <textarea
                id="texto-quiz"
                value={textoQuiz}
                onChange={(e) => editar(() => setTextoQuiz(e.target.value))}
                readOnly={soloLectura}
                rows={Math.min(30, Math.max(8, textoQuiz.split('\n').length))}
                spellCheck={false}
                className={`${claseControl} font-mono text-xs leading-relaxed`}
              />
              {armada.errorQuiz && <p className="mt-1 text-xs text-red-300">{armada.errorQuiz}</p>}
              <p className="mt-2 text-xs text-white/45">
                {'{passingScore, questions: [{id, questionText, options: [{id, text, isCorrect}], feedbackCorrect, feedbackIncorrect}]}'}
              </p>
            </Tarjeta>
          ) : (
            <Tarjeta etiqueta={`${textos.length} bloque(s)`} titulo="Bloques" accion={!soloLectura && <Paleta bloques={plantillas.bloques ?? {}} alAgregar={agregarBloque} />}>
              {textos.length ? (
                <ol className="space-y-3">
                  {textos.map((texto, i) => (
                    <EditorBloque
                      // El índice es la identidad: los bloques no tienen id fijo y el texto cambia al escribir.
                      key={i}
                      indice={i}
                      total={textos.length}
                      texto={texto}
                      error={armada.erroresBloques[i]}
                      errorServidor={porBloque[i]}
                      soloLectura={soloLectura}
                      alCambiar={cambiarBloque}
                      alMover={moverBloque}
                      alQuitar={quitarBloque}
                    />
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-white/50">Agrega el primer bloque con la paleta. Ritmo: una interacción cada ~2 bloques de texto.</p>
              )}
            </Tarjeta>
          )}
        </>
      )}

      {(mensaje || generales.length > 0) && (
        <div className="space-y-2" aria-live="polite">
          {mensaje && <Mensaje tono={mensaje.tono}>{mensaje.texto}</Mensaje>}
          {generales.length > 0 && (
            <Mensaje tono="error">
              <ul className="list-disc pl-5">
                {generales.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </Mensaje>
          )}
        </div>
      )}

      {!soloLectura && (
        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap justify-end gap-2 border-t border-white/10 bg-base/90 px-4 py-3 backdrop-blur sm:mx-0">
          <Boton onClick={validar} disabled={ocupado}>
            Validar
          </Boton>
          <Boton variante="primario" onClick={guardar} disabled={ocupado || (!sucio && Boolean(meta))}>
            {ocupado ? 'Enviando…' : meta ? 'Guardar' : 'Crear lección'}
          </Boton>
          {meta && estado === 'borrador' && (
            <Boton variante="neon" onClick={publicar} disabled={ocupado || sucio} title={sucio ? 'Guarda antes de publicar' : undefined}>
              Publicar
            </Boton>
          )}
        </div>
      )}
      <Confirmacion {...confirmacion} />
    </div>
  );
}

function EditorLeccion({ cursoId, leccionId, moduloId, esAdmin }) {
  const { token } = useAuth();
  const nueva = !leccionId;
  const [paso, setPaso] = useState(undefined);
  const plantillas = useDatosAdmin(() => obtenerPlantillas(token), token);
  // Lección existente: su JSON. Nueva: el árbol, para saber el curso del módulo.
  const fuente = useDatosAdmin(
    () => (nueva ? obtenerArbol(token) : obtenerLeccion(token, cursoId, leccionId)),
    `${token}|${cursoId}|${leccionId}|${moduloId}`,
  );

  if (!plantillas.respuesta || !fuente.respuesta) return <CargandoAdmin texto="Abriendo el editor…" />;
  for (const carga of [fuente, plantillas]) {
    if (!carga.respuesta.ok) return <ErrorAdmin respuesta={carga.respuesta} alReintentar={carga.recargar} />;
  }

  if (!nueva) {
    const { leccion, ...meta } = fuente.datos;
    return (
      <Editor
        inicial={leccion ?? { id: leccionId }}
        meta={meta}
        cursoId={meta.curso_id}
        plantillas={plantillas.datos}
        soloLectura={!esAdmin}
      />
    );
  }

  const modulo = fuente.datos.cursos?.flatMap((c) => c.modulos).find((m) => m.id === moduloId);
  if (!modulo) return <Mensaje tono="error">No existe el módulo «{moduloId}». Vuelve a Contenido y elige uno.</Mensaje>;
  if (!esAdmin) return <Mensaje tono="aviso">Solo un administrador puede crear lecciones.</Mensaje>;
  if (paso === undefined) return <ElegirPlantilla plantillas={plantillas.datos} modulo={modulo} alElegir={setPaso} />;

  const inicial = leccionDesdePlantilla(paso ? plantillas.datos.lecciones?.[paso] : null, { paso });
  return <Editor key={paso ?? 'blanco'} inicial={inicial} cursoId={modulo.curso_id} moduloId={modulo.id} plantillas={plantillas.datos} soloLectura={false} />;
}

export default EditorLeccion;
