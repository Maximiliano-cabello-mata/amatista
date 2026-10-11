// Ver la plataforma (#/admin/revision): el equipo elige cómo recorrer Amatista
// (vista de administrador con todo abierto o vista de alumno con sus
// candados), abre las páginas que ve un alumno y salta a cualquier curso,
// módulo, lección, estación de Blender o jefe final sin completar lo anterior.
// Nada de esto cambia el progreso de nadie: saltar solo abre la lección.
import { useMemo, useState } from 'react';
import { useCatalogo } from '../../catalogo/contexto';
import { claseControl } from '../../components/admin/estilos';
import { claveRevision, ESTADOS_REVISION, leerRevision } from '../../components/admin/auditoria';
import { Boton, Mensaje, Pastilla, Tarjeta } from '../../components/admin/ui';
import Etiqueta from '../../components/etiquetas/Etiqueta';
import { etiquetaLeccion } from '../../components/etiquetas/catalogo';
import { tituloCorto } from '../../data/cursos';
import { esPracticaBlender, esTallerBlender } from '../../modulos/practica';
import { useProgreso } from '../../progreso/contexto';
import { estaCompletada } from '../../progreso/reglas';
import { navegar, rutas } from '../../rutas';
import { useVista } from '../../vista/contexto';

const MODOS = [
  {
    modo: 'admin',
    titulo: 'Vista de administrador',
    texto: 'Ves la pestaña Admin y todas las lecciones abiertas: saltas a cualquier punto del curso para revisarlo.',
  },
  {
    modo: 'alumno',
    titulo: 'Vista de alumno',
    texto: 'Ves Amatista exactamente como un alumno: sin Admin y con los candados en su lugar. Vuelves desde la franja de arriba.',
  },
];

const PAGINAS_ALUMNO = [
  { href: rutas.inicio, titulo: 'Portada y cursos', texto: 'Lo primero que ve un alumno: el catálogo y «Continuar».' },
  { href: rutas.guia, titulo: 'Ayuda y recorrido', texto: 'El recorrido guiado por la plataforma y las respuestas cortas para alumnos nuevos.' },
  { href: rutas.panel, titulo: 'Mi panel', texto: 'Avance, retos, exámenes, insignias y Blender.' },
  { href: rutas.blender, titulo: 'Blender', texto: 'Cómo se une con la plataforma, descarga del add-on, las tres prácticas del add-on y ajustes.' },
  { href: rutas.vincular, titulo: 'Conectar Blender', texto: 'Donde se escribe el código que muestra Blender.' },
  { href: rutas.perfil, titulo: 'Perfil', texto: 'Datos de la cuenta, contraseña y sesiones.' },
];

function ElegirVista() {
  const { modo, cambiarModo } = useVista();
  return (
    <Tarjeta etiqueta="Paso 1" titulo="¿Cómo quieres ver la plataforma?">
      <div className="grid gap-3 md:grid-cols-2" role="radiogroup" aria-label="Vista">
        {MODOS.map((opcion) => {
          const activo = opcion.modo === modo;
          return (
            <button
              key={opcion.modo}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => cambiarModo(opcion.modo)}
              className={`corte-poly-sm border p-4 text-left transition ${
                activo ? 'border-neon/60 bg-neon/10' : 'border-white/10 bg-base/60 hover:border-white/25'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`h-3 w-3 rotate-45 ${activo ? 'bg-neon' : 'bg-white/20'}`} aria-hidden="true" />
                <span className="font-extrabold text-white">{opcion.titulo}</span>
                {activo && <Pastilla tono="bg-neon/15 text-neon">Activa</Pastilla>}
              </span>
              <span className="mt-2 block text-sm leading-snug text-texto/75">{opcion.texto}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Boton variante="neon" onClick={() => navegar(rutas.inicio)}>
          Recorrer la plataforma ▸
        </Boton>
        <p className="text-xs text-white/50">
          La vista se recuerda en este navegador. Solo cambia lo que ves: el servidor sigue revisando tu rol en cada petición.
        </p>
      </div>
    </Tarjeta>
  );
}

function PaginasAlumno() {
  return (
    <Tarjeta etiqueta="Paso 2" titulo="Páginas que ve un alumno">
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {PAGINAS_ALUMNO.map((pagina) => (
          <li key={pagina.href}>
            <a href={pagina.href} className="corte-poly-sm block h-full border border-white/10 bg-base/60 p-3 transition hover:border-neon/50">
              <span className="font-bold text-white">{pagina.titulo} ▸</span>
              <span className="mt-1 block text-sm leading-snug text-texto/65">{pagina.texto}</span>
            </a>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}

function FilaSalto({ curso, leccion, progreso, marca }) {
  const examen = leccion.type === 'exam';
  const etiqueta = etiquetaLeccion(leccion, esTallerBlender(leccion) ? 'taller' : esPracticaBlender(leccion));
  return (
    <li>
      <a
        href={rutas.leccion(curso.id, leccion.id)}
        className="corte-poly-sm flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 transition hover:bg-white/5"
      >
        <span className="min-w-0 flex-1 text-sm text-white">{examen && !/^jefe final/i.test(leccion.title) ? `Jefe final · ${leccion.title}` : leccion.title}</span>
        <Etiqueta {...etiqueta} />
        {marca && (
          <Pastilla tono={marca.estado === 'ok' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-300/10 text-amber-200'}>
            {ESTADOS_REVISION[marca.estado]}
          </Pastilla>
        )}
        {estaCompletada(progreso, curso.id, leccion) && <Pastilla tono="bg-white/5 text-white/55">Hecha por ti</Pastilla>}
        <span className="font-mono text-[11px] uppercase tracking-widest text-neon">Abrir ▸</span>
      </a>
    </li>
  );
}

function SaltarALeccion() {
  const { cursos } = useCatalogo();
  const { progreso } = useProgreso();
  const { comoAlumno, cambiarModo } = useVista();
  const [cursoId, setCursoId] = useState('');
  const [buscar, setBuscar] = useState('');
  const revision = useMemo(() => leerRevision(), []);
  const texto = buscar.trim().toLowerCase();

  const visibles = cursos.filter((curso) => !cursoId || curso.id === cursoId);
  const coincide = (leccion) => !texto || leccion.title.toLowerCase().includes(texto) || leccion.id.toLowerCase().includes(texto);

  return (
    <Tarjeta etiqueta="Paso 3" titulo="Saltar a cualquier lección">
      {comoAlumno && (
        <Mensaje tono="aviso" className="mb-4">
          Estás en la vista de alumno: las lecciones con candado no se abrirán.{' '}
          <button type="button" onClick={() => cambiarModo('admin')} className="font-bold underline underline-offset-2">
            Cambiar a vista de administrador
          </button>
        </Mensaje>
      )}
      <div className="mb-4 grid gap-2 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <label className="grid gap-1 text-xs text-white/60">
          Curso
          <select value={cursoId} onChange={(e) => setCursoId(e.target.value)} className={claseControl}>
            <option value="">Todos los cursos</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.titulo}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs text-white/60">
          Buscar lección
          <input
            type="search"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Título o id de la lección"
            className={claseControl}
          />
        </label>
      </div>
      <div className="space-y-5">
        {visibles.map((curso) => (
          <section key={curso.id} aria-label={curso.titulo}>
            <h3 className="flex flex-wrap items-center gap-2 font-extrabold text-white">
              <a href={rutas.curso(curso.id)} className="hover:text-neon">
                {curso.titulo} ▸
              </a>
              {curso.estado === 'bloqueado' && <Pastilla>Próximamente: sin contenido</Pastilla>}
            </h3>
            <div className="mt-2 space-y-3">
              {curso.modulos
                .filter((modulo) => modulo.contenido)
                .map((modulo) => {
                  const lecciones = modulo.contenido.lessons.filter(coincide);
                  if (!lecciones.length) return null;
                  return (
                    <div key={modulo.id} className="corte-poly-sm border border-white/10 bg-base/50 p-2">
                      <p className="px-3 pb-1 pt-1 font-mono text-[11px] uppercase tracking-widest text-white/50">
                        Módulo {modulo.numero} · {tituloCorto(modulo.contenido.title)}
                      </p>
                      <ul>
                        {lecciones.map((leccion) => (
                          <FilaSalto
                            key={leccion.id}
                            curso={curso}
                            leccion={leccion}
                            progreso={progreso}
                            marca={revision[claveRevision(curso.id, leccion.id)]}
                          />
                        ))}
                      </ul>
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </Tarjeta>
  );
}

function Revision() {
  return (
    <div className="space-y-6">
      <p className="max-w-3xl leading-relaxed text-texto/75">
        Recorre Amatista como la ve un alumno o con todo abierto para revisarla. Saltar a una lección no la marca como hecha:
        si la completas, cuenta solo en tu propio avance, y las métricas no incluyen al equipo.
      </p>
      <ElegirVista />
      <PaginasAlumno />
      <SaltarALeccion />
    </div>
  );
}

export default Revision;
