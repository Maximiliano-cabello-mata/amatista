// Auditoría (#/admin/auditoria): todo lo que conviene revisar de la plataforma
// en un solo lugar.
//   1. Revisiones automáticas del contenido que viaja en la app (catálogo vigente).
//   2. Revisión a mano: el equipo marca cada lección como revisada o con
//      cambios pendientes (se guarda en este navegador y se exporta en Markdown).
//   3. Lo que sabe el servidor (GET /api/admin/auditoria): quién tiene
//      permisos, cuentas que requieren atención, contenido sin publicar o
//      cambiado hace poco y lecciones donde los alumnos se atascan.
// Solo lee: nada aquí cambia el progreso de los alumnos.
import { useMemo, useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { useCatalogo } from '../../catalogo/contexto';
import {
  auditarCatalogo,
  avanceRevision,
  claveRevision,
  ESTADOS_REVISION,
  guardarRevision,
  informeMarkdown,
  leerRevision,
  marcarRevision,
} from '../../components/admin/auditoria';
import { claseControl } from '../../components/admin/estilos';
import { fechaHoraTexto, haceCuanto, numero } from '../../components/admin/logica';
import { Boton, CargandoAdmin, ErrorAdmin, Kpi, Mensaje, Pastilla, Tarjeta, Vacio } from '../../components/admin/ui';
import { useDatosAdmin } from '../../components/admin/useDatosAdmin';
import { buscarLeccion, tituloCorto } from '../../data/cursos';
import { rutas } from '../../rutas';
import { obtenerAuditoria } from '../../services/admin';

const PERIODOS_AUDITORIA = [7, 30, 90];
const FILTROS = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'error', texto: 'Errores' },
  { valor: 'aviso', texto: 'Avisos' },
];

function Selector({ etiqueta, opciones, valor, alCambiar }) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex flex-wrap gap-1">
      {opciones.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          role="radio"
          aria-checked={opcion.valor === valor}
          onClick={() => alCambiar(opcion.valor)}
          className={`corte-poly-sm px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition ${
            opcion.valor === valor ? 'bg-amatista text-white' : 'bg-white/5 text-white/65 hover:bg-white/10'
          }`}
        >
          {opcion.texto}
        </button>
      ))}
    </div>
  );
}

function Hallazgos({ hallazgos }) {
  const [filtro, setFiltro] = useState('todos');
  const lista = hallazgos.filter((h) => filtro === 'todos' || h.gravedad === filtro);
  return (
    <Tarjeta
      etiqueta="Automático"
      titulo="Revisiones del contenido"
      accion={<Selector etiqueta="Mostrar" opciones={FILTROS} valor={filtro} alCambiar={setFiltro} />}
    >
      <p className="mb-4 text-sm text-texto/70">
        Lecciones sin contenido, exámenes sin respuesta correcta, imágenes sin texto alternativo, módulos sin jefe final, ids
        repetidos y estaciones de Blender sin práctica. Se calcula con el catálogo que ven los alumnos ahora.
      </p>
      {lista.length ? (
        <ul className="divide-y divide-white/5">
          {lista.map((h) => (
            <li key={h.id} className="flex flex-wrap items-start gap-x-3 gap-y-1 py-2.5">
              <Pastilla tono={h.gravedad === 'error' ? 'bg-red-500/15 text-red-200' : 'bg-amber-300/10 text-amber-200'}>
                {h.gravedad === 'error' ? 'Error' : 'Aviso'}
              </Pastilla>
              <span className="min-w-0 flex-1 text-sm">
                <span className="block text-white">{h.texto}</span>
                <span className="block text-xs text-white/50">
                  {[h.cursoTitulo, h.modulo ? `Módulo ${h.modulo}` : null, h.leccionTitulo].filter(Boolean).join(' › ')}
                </span>
              </span>
              <a href={h.href} className="font-mono text-[11px] uppercase tracking-widest text-neon hover:underline">
                Ver ▸
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <Vacio titulo={hallazgos.length ? 'Nada con este filtro.' : 'Sin hallazgos: el contenido pasa todas las revisiones.'} />
      )}
    </Tarjeta>
  );
}

function FilaRevision({ curso, leccion, marca, alMarcar }) {
  const [nota, setNota] = useState(marca?.nota ?? '');
  const clave = claveRevision(curso.id, leccion.id);
  return (
    <li className="py-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <a href={rutas.leccion(curso.id, leccion.id)} className="min-w-0 flex-1 text-sm text-white hover:text-neon">
          {leccion.type === 'exam' && !/^jefe final/i.test(leccion.title) ? `Jefe final · ${leccion.title}` : leccion.title}
        </a>
        <div className="flex gap-1" role="group" aria-label={`Revisión de ${leccion.title}`}>
          {Object.entries(ESTADOS_REVISION).map(([estado, texto]) => (
            <Boton
              key={estado}
              chico
              aria-pressed={marca?.estado === estado}
              variante={marca?.estado === estado ? (estado === 'ok' ? 'neon' : 'primario') : 'secundario'}
              onClick={() => alMarcar(clave, marca?.estado === estado ? null : estado, nota)}
            >
              {texto}
            </Boton>
          ))}
        </div>
      </div>
      {marca?.estado === 'cambios' && (
        <label className="mt-2 grid gap-1 text-xs text-white/55">
          Qué hay que cambiar
          <input
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            onBlur={() => nota !== (marca.nota ?? '') && alMarcar(clave, 'cambios', nota)}
            maxLength={500}
            placeholder="Por ejemplo: la imagen del paso 2 no carga"
            className={claseControl}
          />
        </label>
      )}
    </li>
  );
}

function RevisionManual({ cursos, hallazgos }) {
  const [revision, setRevision] = useState(() => leerRevision());
  const [cursoId, setCursoId] = useState(() => cursos.find((c) => c.estado !== 'bloqueado')?.id ?? '');
  const [mensaje, setMensaje] = useState(null);
  const avance = avanceRevision(cursos, revision);
  const curso = cursos.find((c) => c.id === cursoId);

  const alMarcar = (clave, estado, nota) => {
    const nueva = marcarRevision(revision, clave, estado, nota);
    setRevision(nueva);
    if (!guardarRevision(nueva)) setMensaje({ tono: 'aviso', texto: 'Este navegador no deja guardar: la revisión dura mientras la página esté abierta.' });
  };

  const informe = () => informeMarkdown({ cursos, hallazgos, revision });
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(informe());
      setMensaje({ tono: 'exito', texto: 'Informe copiado: pégalo en un mensaje o documento.' });
    } catch {
      setMensaje({ tono: 'aviso', texto: 'No se pudo copiar. Usa «Descargar informe».' });
    }
  };
  const descargar = () => {
    const url = URL.createObjectURL(new Blob([informe()], { type: 'text/markdown;charset=utf-8' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `auditoria-amatista-${new Date().toISOString().slice(0, 10)}.md`;
    enlace.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Tarjeta
      etiqueta="A mano"
      titulo="Revisión lección por lección"
      accion={
        <div className="flex flex-wrap gap-2">
          <Boton chico onClick={copiar}>
            Copiar informe
          </Boton>
          <Boton chico onClick={descargar}>
            Descargar informe
          </Boton>
        </div>
      }
    >
      <p className="mb-3 text-sm text-texto/70">
        Abre cada lección, revísala como alumno y márcala. Las marcas se guardan en este navegador; el informe junta las
        revisiones automáticas y las lecciones con cambios pendientes.
      </p>
      <dl className="mb-4 grid grid-cols-3 gap-2">
        <Kpi etiqueta="Revisadas" valor={numero(avance.revisadas)} tono="text-emerald-300" />
        <Kpi etiqueta="Con cambios" valor={numero(avance.cambios)} tono="text-amber-200" />
        <Kpi etiqueta="Sin revisar" valor={numero(avance.pendientes)} detalle={`de ${numero(avance.total)} lecciones`} />
      </dl>
      {mensaje && (
        <Mensaje tono={mensaje.tono} className="mb-3">
          {mensaje.texto}
        </Mensaje>
      )}
      <label className="mb-3 grid max-w-xs gap-1 text-xs text-white/60">
        Curso
        <select value={cursoId} onChange={(e) => setCursoId(e.target.value)} className={claseControl}>
          {cursos
            .filter((c) => c.estado !== 'bloqueado')
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo}
              </option>
            ))}
        </select>
      </label>
      {curso?.modulos
        .filter((modulo) => modulo.contenido)
        .map((modulo) => (
          <section key={modulo.id} className="mt-3" aria-label={`Módulo ${modulo.numero}`}>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-white/50">
              Módulo {modulo.numero} · {tituloCorto(modulo.contenido.title)}
            </h3>
            <ul className="divide-y divide-white/5">
              {modulo.contenido.lessons.map((leccion) => (
                <FilaRevision
                  key={leccion.id}
                  curso={curso}
                  leccion={leccion}
                  marca={revision[claveRevision(curso.id, leccion.id)]}
                  alMarcar={alMarcar}
                />
              ))}
            </ul>
          </section>
        ))}
    </Tarjeta>
  );
}

// Nombre legible de una lección del servidor, si está en el catálogo.
function nombreLeccion(buscarCurso, cursoId, leccionId) {
  const curso = buscarCurso(cursoId);
  const ubicacion = curso && buscarLeccion(curso, leccionId);
  return {
    titulo: ubicacion ? ubicacion.leccion.title : leccionId,
    curso: curso?.titulo ?? cursoId,
    href: ubicacion ? rutas.leccion(curso.id, ubicacion.leccion.id) : null,
  };
}

function ListaContenido({ filas, buscarCurso, vacio }) {
  if (!filas.length) return <p className="text-sm text-white/50">{vacio}</p>;
  return (
    <ul className="divide-y divide-white/5">
      {filas.map((fila) => {
        const nombre = nombreLeccion(buscarCurso, fila.curso_id, fila.leccion_id);
        return (
          <li key={`${fila.curso_id}:${fila.leccion_id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
            <span className="min-w-0 flex-1">
              <span className="block text-white">{fila.titulo || nombre.titulo}</span>
              <span className="block text-xs text-white/50">
                {nombre.curso} · {fila.leccion_id}
              </span>
            </span>
            <Pastilla>{fila.estado}</Pastilla>
            <span className="text-xs text-white/50" title={fechaHoraTexto(fila.actualizado_en)}>
              {haceCuanto(fila.actualizado_en)}
            </span>
            <a href={rutas.adminLeccion(fila.curso_id, fila.leccion_id)} className="font-mono text-[11px] uppercase tracking-widest text-neon hover:underline">
              Editar ▸
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function DatosServidor() {
  const { token } = useAuth();
  const { buscarCurso } = useCatalogo();
  const [dias, setDias] = useState(30);
  const { cargando, respuesta, datos, recargar } = useDatosAdmin(() => obtenerAuditoria(token, dias), `${token}|${dias}`);

  if (!datos) return respuesta && !respuesta.ok ? <ErrorAdmin respuesta={respuesta} alReintentar={recargar} /> : <CargandoAdmin texto="Revisando el servidor…" />;

  const { personal, cuentas, contenido, atascos } = datos;
  const estados = Object.entries(contenido.lecciones_por_estado);
  return (
    <div className={`space-y-6 transition-opacity ${cargando ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/55">Datos del servidor · {fechaHoraTexto(datos.generado_en)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Selector
            etiqueta="Periodo"
            opciones={PERIODOS_AUDITORIA.map((d) => ({ valor: d, texto: `${d} días` }))}
            valor={dias}
            alCambiar={setDias}
          />
          <Boton chico onClick={recargar}>
            Actualizar
          </Boton>
        </div>
      </div>

      <Tarjeta etiqueta="Alumnos" titulo="Dónde se atascan">
        <p className="mb-3 text-sm text-texto/70">
          Lecciones que al menos 2 alumnos abrieron en los últimos {dias} días y no todos terminaron, de menor a mayor porcentaje
          de quienes terminan. Son las primeras que conviene revisar.
        </p>
        {atascos.length ? (
          <ul className="divide-y divide-white/5">
            {atascos.map((fila) => {
              const nombre = nombreLeccion(buscarCurso, fila.curso_id, fila.leccion_id);
              return (
                <li key={`${fila.curso_id}:${fila.leccion_id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block text-white">{nombre.titulo}</span>
                    <span className="block text-xs text-white/50">{nombre.curso}</span>
                  </span>
                  <span className="tabular-nums text-white/75">
                    {fila.terminaron} de {fila.abrieron} terminaron ({fila.porcentaje_terminan}%)
                  </span>
                  {nombre.href && (
                    <a href={nombre.href} className="font-mono text-[11px] uppercase tracking-widest text-neon hover:underline">
                      Ver ▸
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <Vacio titulo="Sin lecciones atascadas en este periodo." />
        )}
      </Tarjeta>

      <div className="grid gap-6 xl:grid-cols-2">
        <Tarjeta etiqueta="Permisos" titulo="Equipo con acceso al panel">
          {personal.length ? (
            <ul className="divide-y divide-white/5">
              {personal.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                  <a href={rutas.adminUsuario(p.id)} className="min-w-0 flex-1 hover:text-neon">
                    <span className="block text-white">{p.nombre || p.email}</span>
                    <span className="block text-xs text-white/50">{p.email}</span>
                  </a>
                  <Pastilla tono={p.rol === 'admin' ? 'bg-amatista/25 text-amatista-claro' : 'bg-neon/10 text-neon'}>{p.rol}</Pastilla>
                  {!p.correo_confirmado && <Pastilla tono="bg-amber-300/10 text-amber-200">Correo sin confirmar</Pastilla>}
                  <span className="text-xs text-white/50">
                    {p.sesiones_activas} {p.sesiones_activas === 1 ? 'sesión' : 'sesiones'} · {p.ultimo_acceso ? haceCuanto(p.ultimo_acceso) : 'nunca entró'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Vacio titulo="No hay profesores ni administradores." />
          )}
        </Tarjeta>

        <Tarjeta etiqueta="Cuentas" titulo="Requieren atención">
          <dl className="grid grid-cols-3 gap-2">
            <Kpi etiqueta="Bloqueadas" valor={numero(cuentas.bloqueadas)} detalle="Por intentos fallidos, ahora" tono={cuentas.bloqueadas ? 'text-amber-200' : 'text-white'} />
            <Kpi etiqueta="Sin confirmar" valor={numero(cuentas.sin_confirmar_7_dias)} detalle="Hace más de 7 días" />
            <Kpi etiqueta="De prueba" valor={numero(cuentas.de_prueba)} detalle="Fuera de las métricas" />
          </dl>
          <a href={rutas.adminUsuarios} className="mt-4 inline-block font-mono text-[11px] uppercase tracking-widest text-neon hover:underline">
            Ver usuarios ▸
          </a>
        </Tarjeta>
      </div>

      <Tarjeta etiqueta="Contenido en la base" titulo="Sin publicar y cambios recientes">
        <div className="mb-4 flex flex-wrap gap-2">
          {estados.length ? (
            estados.map(([estado, cantidad]) => (
              <Pastilla key={estado}>
                {cantidad} {cantidad === 1 ? 'lección' : 'lecciones'} · {estado}
              </Pastilla>
            ))
          ) : (
            <span className="text-sm text-white/50">La base aún no tiene lecciones importadas: los alumnos usan el contenido de la app.</span>
          )}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div>
            <h3 className="mb-2 font-mono text-[11px] uppercase tracking-widest text-white/50">Sin publicar</h3>
            <ListaContenido filas={contenido.sin_publicar} buscarCurso={buscarCurso} vacio="Todo está publicado." />
          </div>
          <div>
            <h3 className="mb-2 font-mono text-[11px] uppercase tracking-widest text-white/50">Cambiadas en los últimos {dias} días</h3>
            <ListaContenido filas={contenido.cambios_recientes} buscarCurso={buscarCurso} vacio="Sin cambios en este periodo." />
          </div>
        </div>
      </Tarjeta>
    </div>
  );
}

function Auditoria() {
  const { cursos } = useCatalogo();
  const hallazgos = useMemo(() => auditarCatalogo(cursos), [cursos]);
  const errores = hallazgos.filter((h) => h.gravedad === 'error').length;

  return (
    <div className="space-y-6">
      <p className="max-w-3xl leading-relaxed text-texto/75">
        Todo lo que conviene revisar antes de que lo encuentre un alumno. Esta página solo lee: no cambia el progreso de nadie.
      </p>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi etiqueta="Errores" valor={numero(errores)} detalle="En el contenido" tono={errores ? 'text-red-300' : 'text-emerald-300'} />
        <Kpi etiqueta="Avisos" valor={numero(hallazgos.length - errores)} detalle="Mejoras sugeridas" />
        <Kpi etiqueta="Cursos" valor={numero(cursos.filter((c) => c.estado !== 'bloqueado').length)} detalle="Publicados" />
        <Kpi
          etiqueta="Lecciones"
          valor={numero(cursos.reduce((n, c) => n + c.modulos.reduce((m, mod) => m + (mod.contenido?.lessons.length ?? 0), 0), 0))}
          detalle="En el catálogo"
        />
      </dl>
      <Hallazgos hallazgos={hallazgos} />
      <RevisionManual cursos={cursos} hallazgos={hallazgos} />
      <DatosServidor />
    </div>
  );
}

export default Auditoria;
