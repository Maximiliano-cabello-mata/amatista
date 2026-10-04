// Gestor de contenido (#/admin/contenido): árbol cursos → módulos →
// lecciones con su estado. El administrador crea módulos (con el esqueleto de
// la Fórmula), publica, archiva, reordena y exporta el JSON de un módulo.
import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { claseControl } from '../../components/admin/estilos';
import { fechaTexto, nombreArchivoModulo } from '../../components/admin/logica';
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
  Vacio,
} from '../../components/admin/ui';
import { useConfirmacion } from '../../components/admin/useConfirmacion';
import { useDatosAdmin } from '../../components/admin/useDatosAdmin';
import Etiqueta from '../../components/etiquetas/Etiqueta';
import { ETIQUETAS, etiquetaLeccion } from '../../components/etiquetas/catalogo';
import { duracionTexto } from '../../data/cursos';
import { rutas } from '../../rutas';
import {
  archivarLeccion,
  archivarModulo,
  crearModulo,
  exportarModulo,
  moverLeccion,
  obtenerArbol,
  publicarLeccion,
  publicarModulo,
} from '../../services/admin';

// Descarga un objeto como archivo .json (mismo formato que data/modulos/*.json).
function descargarJSON(datos, nombre) {
  const blob = new Blob([`${JSON.stringify(datos, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function NuevoModulo({ cursos, alCrear, alCancelar }) {
  const { token } = useAuth();
  const [cursoId, setCursoId] = useState(cursos[0]?.id ?? '');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [insignia, setInsignia] = useState('');
  const [esqueleto, setEsqueleto] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const crear = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    const respuesta = await crearModulo(token, {
      curso_id: cursoId,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      insignia: insignia.trim() || undefined,
      generar_esqueleto: esqueleto,
    });
    setEnviando(false);
    if (respuesta.ok) alCrear(respuesta.datos);
    else setError(respuesta.error);
  };

  return (
    <Tarjeta etiqueta="Nuevo" titulo="Crear módulo">
      <form onSubmit={crear} className="grid gap-3 sm:grid-cols-2">
        <CampoAdmin etiqueta="Curso">
          {({ id }) => (
            <select id={id} value={cursoId} onChange={(e) => setCursoId(e.target.value)} className={claseControl} required>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.titulo}
                </option>
              ))}
            </select>
          )}
        </CampoAdmin>
        <CampoAdmin etiqueta="Título" ayuda="Por ejemplo: Interfaz y navegación.">
          {({ id, describe }) => (
            <input id={id} aria-describedby={describe} value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={200} required className={claseControl} />
          )}
        </CampoAdmin>
        <CampoAdmin etiqueta="Descripción" className="sm:col-span-2">
          {({ id }) => (
            <textarea id={id} rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={1000} className={claseControl} />
          )}
        </CampoAdmin>
        <CampoAdmin etiqueta="Insignia" ayuda="Se gana al aprobar el examen del módulo.">
          {({ id, describe }) => (
            <input id={id} aria-describedby={describe} value={insignia} onChange={(e) => setInsignia(e.target.value)} maxLength={80} className={claseControl} />
          )}
        </CampoAdmin>
        <label className="flex items-start gap-2 self-center text-sm text-white/75">
          <input type="checkbox" checked={esqueleto} onChange={(e) => setEsqueleto(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#9B59B6]" />
          <span>
            Generar el esqueleto de la Fórmula
            <span className="block text-xs text-white/45">Crea 5 lecciones borrador: gancho, explora, práctica, reto y jefe.</span>
          </span>
        </label>
        {error && <Mensaje tono="error" className="sm:col-span-2">{error}</Mensaje>}
        <div className="flex gap-2 sm:col-span-2 sm:justify-end">
          <Boton onClick={alCancelar}>Cancelar</Boton>
          <Boton type="submit" variante="primario" disabled={enviando || !titulo.trim() || !cursoId}>
            {enviando ? 'Creando…' : 'Crear en borrador'}
          </Boton>
        </div>
      </form>
    </Tarjeta>
  );
}

function FilaLeccion({ leccion, indice, total, esAdmin, ocupado, accion }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
      <span className="w-6 shrink-0 text-right font-mono text-xs text-white/40">{indice + 1}</span>
      <div className="min-w-0 flex-1">
        <a href={rutas.adminLeccion(leccion.curso_id, leccion.id)} className="block truncate font-semibold text-white hover:text-neon">
          {leccion.titulo || leccion.id}
        </a>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-white/45">
          <Etiqueta {...etiquetaLeccion({ type: leccion.tipo }, leccion.practica_blender)} />
          <span>
            {leccion.id}
            {leccion.duracion_segundos ? ` · ${duracionTexto(leccion.duracion_segundos)}` : ''} · v{leccion.version}
          </span>
        </span>
      </div>
      <EtiquetaEstado estado={leccion.estado} />
      {esAdmin && (
        <span className="flex gap-1">
          <Boton chico aria-label={`Subir ${leccion.titulo}`} disabled={ocupado || indice === 0} onClick={() => accion('subir', leccion, indice)}>
            ▲
          </Boton>
          <Boton chico aria-label={`Bajar ${leccion.titulo}`} disabled={ocupado || indice === total - 1} onClick={() => accion('bajar', leccion, indice)}>
            ▼
          </Boton>
          {leccion.estado === 'borrador' && (
            <Boton chico variante="neon" disabled={ocupado} onClick={() => accion('publicar', leccion)}>
              Publicar
            </Boton>
          )}
          {leccion.estado !== 'archivado' && (
            <Boton chico variante="peligro" disabled={ocupado} onClick={() => accion('archivar', leccion)}>
              Archivar
            </Boton>
          )}
        </span>
      )}
    </li>
  );
}

function Modulo({ modulo, esAdmin, verArchivados, ocupado, accionModulo, accionLeccion }) {
  const lecciones = modulo.lecciones.filter((l) => verArchivados || l.estado !== 'archivado');
  const archivadas = modulo.lecciones.length - lecciones.length;
  // Cada módulo cierra con su práctica en Blender (docs/plataforma/02_modulos_y_practica.md).
  const conPractica = modulo.lecciones.some((l) => l.practica_blender && l.estado !== 'archivado');
  return (
    <div className="corte-poly-sm border border-white/10 bg-base/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">
            Módulo {modulo.numero} · {modulo.id}
          </p>
          <h3 className="text-lg font-extrabold text-white">{modulo.titulo}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
            <EtiquetaEstado estado={modulo.estado} />
            {modulo.insignia && <Pastilla tono="bg-amatista/20 text-amatista-claro">◆ {modulo.insignia}</Pastilla>}
            <Etiqueta {...(conPractica ? ETIQUETAS.practica : ETIQUETAS.sinPractica)} />
            <span>Actualizado {fechaTexto(modulo.actualizado_en)}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <Boton chico disabled={ocupado} onClick={() => accionModulo('exportar', modulo)}>
            Exportar JSON
          </Boton>
          {esAdmin && modulo.estado !== 'archivado' && (
            <>
              <a href={rutas.adminNuevaLeccion(modulo.id)} className="corte-poly-sm bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/85 hover:bg-white/10">
                + Lección
              </a>
              <Boton chico variante="neon" disabled={ocupado} onClick={() => accionModulo('publicar', modulo)}>
                Publicar
              </Boton>
              <Boton chico variante="peligro" disabled={ocupado} onClick={() => accionModulo('archivar', modulo)}>
                Archivar
              </Boton>
            </>
          )}
        </div>
      </div>
      {lecciones.length ? (
        <ol className="mt-3 divide-y divide-white/5">
          {lecciones.map((leccion, i) => (
            <FilaLeccion
              key={leccion.id}
              leccion={leccion}
              indice={i}
              total={lecciones.length}
              esAdmin={esAdmin && !verArchivados}
              ocupado={ocupado}
              accion={accionLeccion}
            />
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-white/50">Sin lecciones todavía.</p>
      )}
      {archivadas > 0 && <p className="mt-2 text-xs text-white/40">{archivadas} archivada(s) oculta(s).</p>}
    </div>
  );
}

function Contenido({ esAdmin }) {
  const { token } = useAuth();
  const confirmacion = useConfirmacion();
  const { cargando, respuesta, datos, recargar } = useDatosAdmin(() => obtenerArbol(token), token);
  const [creando, setCreando] = useState(false);
  const [verArchivados, setVerArchivados] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Ejecuta una acción del servidor y recarga el árbol al terminar.
  const ejecutar = async (pedir, exito) => {
    setOcupado(true);
    setMensaje(null);
    const resultado = await pedir();
    setOcupado(false);
    if (resultado.ok) {
      const texto = typeof exito === 'function' ? exito(resultado.datos) : exito;
      if (texto) setMensaje(texto);
      recargar();
    } else {
      const errores = resultado.datos?.errores;
      setMensaje({
        tono: 'error',
        texto: (
          <>
            {resultado.error}
            {errores?.length > 1 && (
              <ul className="mt-2 list-disc pl-5 text-xs">
                {errores.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
          </>
        ),
      });
    }
    return resultado;
  };

  const accionModulo = async (tipo, modulo) => {
    if (tipo === 'exportar') {
      setOcupado(true);
      const resultado = await exportarModulo(token, modulo.id, { borradores: modulo.estado !== 'publicado' });
      setOcupado(false);
      if (resultado.ok) descargarJSON(resultado.datos, nombreArchivoModulo(resultado.datos.module));
      else setMensaje({ tono: 'error', texto: resultado.error });
      return;
    }
    if (tipo === 'publicar') {
      const seguro = await confirmacion.preguntar({
        titulo: `¿Publicar «${modulo.titulo}»?`,
        texto: 'Los alumnos verán el módulo y sus lecciones en borrador que pasen la validación. Las que tengan errores se quedan en borrador.',
        confirmar: 'Publicar',
      });
      if (!seguro) return;
      await ejecutar(
        () => publicarModulo(token, modulo.id),
        (d) => ({
          tono: d.omitidas?.length ? 'aviso' : 'exito',
          texto: d.omitidas?.length
            ? `Módulo publicado con ${d.publicadas.length} lección(es) nuevas. Se quedaron en borrador por errores: ${d.omitidas.map((o) => o.id).join(', ')}.`
            : `Módulo publicado (${d.publicadas.length} lección(es) nuevas).`,
        }),
      );
      return;
    }
    const seguro = await confirmacion.preguntar({
      titulo: `¿Archivar «${modulo.titulo}»?`,
      texto: 'Desaparece del catálogo de los alumnos. Sus lecciones y el progreso de cada alumno se conservan.',
      confirmar: 'Archivar',
      peligro: true,
    });
    if (seguro) await ejecutar(() => archivarModulo(token, modulo.id), { tono: 'exito', texto: 'Módulo archivado.' });
  };

  const accionLeccion = async (tipo, leccion, indice) => {
    if (tipo === 'subir' || tipo === 'bajar') {
      // El servidor cuenta todas las lecciones del módulo (también las
      // archivadas, aquí ocultas): la nueva posición es la de la vecina visible.
      const modulo = datos.cursos.flatMap((c) => c.modulos).find((m) => m.id === leccion.modulo_id);
      const visibles = modulo.lecciones.filter((l) => l.estado !== 'archivado');
      const vecina = visibles[indice + (tipo === 'subir' ? -1 : 1)];
      if (!vecina) return;
      const posicion = modulo.lecciones.findIndex((l) => l.id === vecina.id) + 1;
      await ejecutar(() => moverLeccion(token, leccion.curso_id, leccion.id, posicion), null);
      return;
    }
    if (tipo === 'publicar') {
      await ejecutar(() => publicarLeccion(token, leccion.curso_id, leccion.id), { tono: 'exito', texto: `«${leccion.titulo}» publicada.` });
      return;
    }
    const seguro = await confirmacion.preguntar({
      titulo: `¿Archivar «${leccion.titulo}»?`,
      texto: 'Sale del catálogo sin borrarse; lo que los alumnos ya completaron se conserva.',
      confirmar: 'Archivar',
      peligro: true,
    });
    if (seguro) await ejecutar(() => archivarLeccion(token, leccion.curso_id, leccion.id), { tono: 'exito', texto: 'Lección archivada.' });
  };

  if (!respuesta) return <CargandoAdmin texto="Cargando contenido…" />;
  if (!respuesta.ok) return <ErrorAdmin respuesta={respuesta} alReintentar={recargar} />;

  const cursos = datos.cursos ?? [];

  return (
    <div className={`space-y-5 ${cargando ? 'opacity-70' : ''}`} aria-busy={cargando || ocupado}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-white/75">
          <input type="checkbox" checked={verArchivados} onChange={(e) => setVerArchivados(e.target.checked)} className="h-4 w-4 accent-[#9B59B6]" />
          Mostrar archivados
        </label>
        <div className="flex gap-2">
          <Boton chico onClick={recargar} disabled={cargando}>
            Actualizar
          </Boton>
          {esAdmin && !creando && cursos.length > 0 && (
            <Boton chico variante="primario" onClick={() => setCreando(true)}>
              + Módulo
            </Boton>
          )}
        </div>
      </div>

      {mensaje && <Mensaje tono={mensaje.tono}>{mensaje.texto}</Mensaje>}

      {creando && (
        <NuevoModulo
          cursos={cursos}
          alCancelar={() => setCreando(false)}
          alCrear={(modulo) => {
            setCreando(false);
            setMensaje({ tono: 'exito', texto: `Módulo «${modulo.titulo}» creado en borrador (${modulo.lecciones.length} lecciones).` });
            recargar();
          }}
        />
      )}

      {cursos.length === 0 ? (
        <Vacio titulo="La base de datos todavía no tiene contenido">
          Importa los módulos del repositorio con <code className="font-mono text-neon">python herramientas/contenido.py importar</code> (desde
          backend/).
        </Vacio>
      ) : (
        cursos.map((curso) => {
          const modulos = curso.modulos.filter((m) => verArchivados || m.estado !== 'archivado');
          return (
            <Tarjeta
              key={curso.id}
              etiqueta={`Curso ${curso.numero ?? ''} · ${curso.id}`}
              titulo={curso.titulo}
              accion={<EtiquetaEstado estado={curso.estado} />}
            >
              {modulos.length ? (
                <div className="space-y-4">
                  {modulos.map((modulo) => (
                    <Modulo
                      key={modulo.id}
                      modulo={modulo}
                      esAdmin={esAdmin}
                      verArchivados={verArchivados}
                      ocupado={ocupado}
                      accionModulo={accionModulo}
                      accionLeccion={accionLeccion}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/50">Sin módulos.</p>
              )}
            </Tarjeta>
          );
        })
      )}
      <Confirmacion {...confirmacion} />
    </div>
  );
}

export default Contenido;
