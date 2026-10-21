// #/explorar: todo Amatista en una sola página (multiplataforma, 2026-10-21).
// Cada programa (Blender, A-Frame y los que vienen), cada curso, cada módulo y
// cada lección, a la vista desde el principio: se filtra por programa o por
// disciplina y se busca por tema. Nada queda escondido al fondo de otra página.
// Los filtros viajan en el enlace (#/explorar?software=aframe&disciplina=xr&q=luz),
// así se pueden compartir y la portada enlaza directo a cada filtro.
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useCatalogo } from '../catalogo/contexto';
import { cifrasPorSoftware, filtrarIndice, filtrosDeConsulta, leccionesDelCatalogo, modulosDelCatalogo } from '../catalogo/indice';
import Etiqueta from '../components/etiquetas/Etiqueta';
import { etiquetaLeccion } from '../components/etiquetas/catalogo';
import Pagina from '../components/estructura/Pagina';
import TituloSeccion from '../components/estructura/TituloSeccion';
import { CristalLogo, IconoCandado } from '../components/Iconos';
import LogoSoftware from '../components/LogoSoftware';
import { SpriteMascota } from '../components/temas/Mascota';
import { temaDelModulo, variablesDeTema } from '../components/temas/temas';
import { duracionTexto } from '../data/cursos';
import { DISCIPLINAS, SOFTWARE, disciplinaPorId } from '../data/software';
import { useProgreso } from '../progreso/contexto';
import { estaCompletada, estaDesbloqueada, resumenModulo } from '../progreso/reglas';
import { rutaExplorar, rutas } from '../rutas';

const LECCIONES_VISIBLES = 12;
const CHIP = 'corte-poly-sm inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors';
const chip = (activo) => `${CHIP} ${activo ? 'border-neon bg-neon/15 text-neon' : 'border-white/10 bg-superficie/80 text-white/65 hover:border-white/30 hover:text-white'}`;
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
const idModulo = (entrada) => `explorar-${entrada.curso.id}-${entrada.modulo.numero}`;

// El nombre que lleva un curso dentro de su programa: el nivel en Blender, el título en el resto.
const nombreCurso = (curso, varios) => (varios ? curso.nivel || curso.titulo : curso.titulo);

// Un enlace nuevo (otro filtro desde la portada o el pie) monta la página de nuevo (App.jsx
// le da como key la consulta), así los filtros solo se leen del enlace al empezar.
function useFiltros(consulta) {
  const [filtros, setFiltros] = useState(() => filtrosDeConsulta(consulta, undefined, DISCIPLINAS.map((d) => d.id)));
  // El enlace se actualiza sin recargar ni mover la página (replaceState no dispara hashchange).
  const cambiar = (cambios) => {
    const nuevos = { ...filtros, ...cambios };
    setFiltros(nuevos);
    try {
      window.history.replaceState(null, '', rutaExplorar({ software: nuevos.software, disciplina: nuevos.disciplina, q: nuevos.texto }));
    } catch {
      // Sin historial (vista previa): los filtros siguen funcionando.
    }
  };
  return [filtros, cambiar];
}

function Buscador({ texto, alCambiar, enfocar }) {
  const id = useId();
  const campo = useRef(null);
  useEffect(() => {
    if (enfocar) campo.current?.focus();
  }, [enfocar]);
  return (
    <form role="search" className="relative" onSubmit={(evento) => evento.preventDefault()}>
      <label htmlFor={id} className="sr-only">
        Buscar en todo el contenido
      </label>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        ref={campo}
        id={id}
        type="search"
        value={texto}
        onChange={(evento) => alCambiar(evento.target.value)}
        placeholder="Busca un tema: luz, GLB, extruir, animación…"
        autoComplete="off"
        className="corte-poly-sm w-full border border-white/15 bg-black/30 py-3.5 pl-12 pr-4 text-base text-white placeholder:text-white/40 focus:border-neon"
      />
    </form>
  );
}

function Filtros({ filtros, alCambiar, cifras }) {
  return (
    <div className="mt-4 grid gap-3">
      <div role="group" aria-label="Filtrar por programa" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={!filtros.software} onClick={() => alCambiar({ software: '' })} className={chip(!filtros.software)}>
          Todos los programas
        </button>
        {SOFTWARE.map((software) => (
          <button
            key={software.id}
            type="button"
            aria-pressed={filtros.software === software.id}
            onClick={() => alCambiar({ software: filtros.software === software.id ? '' : software.id })}
            className={chip(filtros.software === software.id)}
          >
            <LogoSoftware software={software} className="h-4 w-5 text-[9px]" />
            {software.nombre}
            <span className="text-white/40">{software.estado === 'proximamente' ? 'pronto' : cifras[software.id]?.publicados ?? 0}</span>
          </button>
        ))}
      </div>
      <div role="group" aria-label="Filtrar por disciplina" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={!filtros.disciplina} onClick={() => alCambiar({ disciplina: '' })} className={chip(!filtros.disciplina)}>
          Todo el 3D
        </button>
        {DISCIPLINAS.map((disciplina) => (
          <button
            key={disciplina.id}
            type="button"
            aria-pressed={filtros.disciplina === disciplina.id}
            title={disciplina.texto}
            onClick={() => alCambiar({ disciplina: filtros.disciplina === disciplina.id ? '' : disciplina.id })}
            className={chip(filtros.disciplina === disciplina.id)}
          >
            {disciplina.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}

// Las lecciones de un módulo, para abrir cualquiera sin pasar por el curso.
function ListaLecciones({ entrada, progreso }) {
  const { curso, modulo } = entrada;
  return (
    <ol className="mt-3 grid gap-1">
      {modulo.contenido.lessons.map((leccion, indice) => {
        const hecha = estaCompletada(progreso, curso.id, leccion);
        const abierta = estaDesbloqueada(progreso, curso.id, modulo, indice);
        const etiqueta = etiquetaLeccion(leccion);
        return (
          <li key={leccion.id}>
            <a
              href={rutas.leccion(curso.id, leccion.id)}
              className="corte-poly-sm flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-white/5"
            >
              <span
                className={`hexagono grid h-5 w-6 shrink-0 place-items-center font-mono text-[10px] font-bold ${
                  hecha ? 'bg-emerald-400 text-base' : abierta ? 'bg-white/15 text-white' : 'bg-white/5 text-white/40'
                }`}
                aria-hidden="true"
              >
                {hecha ? '✓' : abierta ? indice + 1 : <IconoCandado className="h-2.5 w-2.5" />}
              </span>
              <span className={`min-w-0 flex-1 truncate ${abierta ? 'text-white/85' : 'text-white/50'}`}>{leccion.title}</span>
              <span className="sr-only">{hecha ? ' (completada)' : abierta ? '' : ' (se abre al terminar la anterior)'}</span>
              <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-widest text-white/40 sm:inline">
                {etiqueta.texto}
                {leccion.durationSeconds ? ` · ${duracionTexto(leccion.durationSeconds)}` : ''}
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

function TarjetaModulo({ entrada, progreso, varios }) {
  const { curso, modulo, publicado } = entrada;
  const tema = temaDelModulo(modulo);
  const resumen = publicado ? resumenModulo(progreso, curso.id, modulo) : null;
  const terminado = resumen && resumen.total > 0 && resumen.completadas === resumen.total;
  return (
    <article
      id={idModulo(entrada)}
      className={`tarjeta-indice corte-poly-sm flex flex-col border bg-superficie/90 p-4 ${publicado ? 'border-white/10' : 'border-white/5 opacity-70'}`}
      style={variablesDeTema(tema)}
      aria-labelledby={`${idModulo(entrada)}-titulo`}
    >
      <div className="flex items-start gap-3">
        <span className="hexagono grid h-11 w-12 shrink-0 place-items-center bg-black/40" aria-hidden="true">
          {publicado ? <SpriteMascota tema={tema} className="h-7 w-7" /> : <IconoCandado className="h-4 w-4 text-white/40" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--tema-acento)]">
            {nombreCurso(curso, varios)} · Módulo {modulo.numero}
          </p>
          <h3 id={`${idModulo(entrada)}-titulo`} className="mt-0.5 font-extrabold leading-snug text-white">
            {modulo.titulo}
          </h3>
        </div>
      </div>
      {entrada.descripcion && <p className="mt-2 line-clamp-2 text-sm leading-snug text-texto/70">{entrada.descripcion}</p>}
      <p className="mt-3 flex flex-wrap gap-1.5">
        {entrada.disciplinas.map((id) => (
          <Etiqueta key={id} texto={disciplinaPorId(id)?.nombre ?? id} tono="gris" />
        ))}
        {publicado ? (
          <Etiqueta texto={`${plural(entrada.lecciones, 'lección', 'lecciones')}${entrada.minutos ? ` · ${entrada.minutos} min` : ''}`} tono="neon" />
        ) : (
          <Etiqueta texto="Próximamente" tono="gris" />
        )}
        {terminado && <Etiqueta texto="✓ Completado" tono="exito" />}
        {resumen && !terminado && resumen.completadas > 0 && <Etiqueta texto={`${resumen.porcentaje}%`} tono="amatista" />}
      </p>
      {publicado && (
        <>
          <details className="mt-3 border-t border-white/5 pt-2">
            <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-neon">
              Ver sus {plural(entrada.lecciones, 'lección', 'lecciones')}
            </summary>
            <ListaLecciones entrada={entrada} progreso={progreso} />
          </details>
          <a
            href={rutas.modulo(curso.id, modulo.numero)}
            className="mt-3 inline-block self-start font-mono text-[11px] font-bold uppercase tracking-widest text-[color:var(--tema-acento)] hover:underline"
          >
            Abrir el módulo ▸
          </a>
        </>
      )}
    </article>
  );
}

// Un programa: su cabecera (curso y herramienta) y sus módulos agrupados por curso o nivel.
function SeccionSoftware({ software, entradas, progreso }) {
  const porCurso = [];
  for (const entrada of entradas) {
    const grupo = porCurso.find((g) => g.curso.id === entrada.curso.id);
    if (grupo) grupo.entradas.push(entrada);
    else porCurso.push({ curso: entrada.curso, entradas: [entrada] });
  }
  const varios = porCurso.length > 1 || software.id === 'blender';
  return (
    <section className="mt-10 first:mt-0" aria-labelledby={`explorar-${software.id}`} id={`software-${software.id}`}>
      <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-4">
        <span className="hexagono grid h-14 w-16 shrink-0 place-items-center bg-superficie">
          <LogoSoftware software={software} className="h-8 w-9" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`explorar-${software.id}`} className="text-2xl font-extrabold text-white">
            {software.nombre}
          </h2>
          <p className="text-sm text-texto/70">{software.lema}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={rutas.curso(software.ruta)} className="corte-poly-sm bg-white/5 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white/80 hover:bg-white/10">
            Ver el curso
          </a>
          {software.herramienta && (
            <a href={software.herramienta.href} className="corte-poly-sm bg-amatista px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white hover:brightness-110">
              {software.herramienta.nombre} ▸
            </a>
          )}
        </div>
      </div>
      {porCurso.map(({ curso, entradas: delCurso }) => (
        <div key={curso.id} className="mt-5">
          {varios && (
            <h3 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-white/55">
              {nombreCurso(curso, true)}
              {curso.estado === 'bloqueado' && <IconoCandado className="h-3 w-3" />}
            </h3>
          )}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {delCurso.map((entrada) => (
              <TarjetaModulo key={entrada.id} entrada={entrada} progreso={progreso} varios={varios} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function ProgramaProximo({ software }) {
  return (
    <li className="corte-poly-sm flex gap-4 border border-dashed border-white/15 bg-superficie/60 p-4">
      <LogoSoftware software={software} className="h-12 w-14 shrink-0 text-sm" decorativo={false} />
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-extrabold text-white">{software.nombre}</span>
          <Etiqueta texto="En preparación" tono="aviso" />
        </p>
        <p className="mt-1 text-sm font-medium text-white/75">{software.lema}</p>
        <p className="mt-1 text-sm leading-snug text-texto/65">{software.descripcion}</p>
      </div>
    </li>
  );
}

// Lecciones que hablan del tema buscado: con enlace directo y el lugar donde están.
function ResultadosLecciones({ lecciones, texto }) {
  const [todas, setTodas] = useState(false);
  if (!lecciones.length) return null;
  const visibles = todas ? lecciones : lecciones.slice(0, LECCIONES_VISIBLES);
  return (
    <section className="mb-10" aria-labelledby="explorar-lecciones">
      <h2 id="explorar-lecciones" className="font-mono text-xs uppercase tracking-[0.25em] text-neon">
        {plural(lecciones.length, 'lección habla', 'lecciones hablan')} de «{texto.trim()}»
      </h2>
      <ul className="mt-3 grid gap-2 md:grid-cols-2">
        {visibles.map(({ id, curso, modulo, leccion, software }) => (
          <li key={id} className="min-w-0">
            <a href={rutas.leccion(curso.id, leccion.id)} className="corte-poly-sm flex items-center gap-3 border border-white/10 bg-superficie/90 p-3 hover:border-neon">
              <LogoSoftware software={SOFTWARE.find((s) => s.id === software)} className="h-6 w-7 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-white">{leccion.title}</span>
                <span className="block truncate text-xs text-white/50">
                  {curso.nivel || curso.titulo} · Módulo {modulo.numero}: {modulo.titulo}
                </span>
              </span>
              <span className="text-neon" aria-hidden="true">
                ▸
              </span>
            </a>
          </li>
        ))}
      </ul>
      {lecciones.length > LECCIONES_VISIBLES && (
        <button type="button" onClick={() => setTodas(!todas)} className="mt-3 font-mono text-[11px] font-bold uppercase tracking-widest text-neon hover:underline">
          {todas ? 'Ver menos' : `Ver las ${lecciones.length}`}
        </button>
      )}
    </section>
  );
}

// Índice lateral: cada programa y sus cursos con el número de módulos; un clic baja hasta ellos.
function Indice({ grupos }) {
  const ir = (evento, id) => {
    evento.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <nav aria-label="Índice del catálogo" className="corte-poly-sm border border-white/10 bg-superficie/80 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">Índice</p>
      <ul className="mt-3 grid gap-3">
        {grupos.map(({ software, entradas }) => (
          <li key={software.id}>
            <a href={`#software-${software.id}`} onClick={(e) => ir(e, `software-${software.id}`)} className="flex items-center gap-2 font-bold text-white hover:text-neon">
              <LogoSoftware software={software} className="h-4 w-5" />
              {software.nombre}
            </a>
            <ul className="mt-1.5 grid gap-1 border-l border-white/10 pl-3">
              {entradas.map((entrada, i) => (
                <li key={entrada.id}>
                  {/* Con varios niveles (Blender), el nombre del nivel separa sus módulos. */}
                  {entrada.curso.nivel && entradas.some((otra) => otra.curso.id !== entrada.curso.id) && entradas[i - 1]?.curso.id !== entrada.curso.id && (
                    <span className="mb-0.5 mt-1.5 block font-mono text-[10px] uppercase tracking-widest text-white/35">{entrada.curso.nivel}</span>
                  )}
                  <a href={`#${idModulo(entrada)}`} onClick={(e) => ir(e, idModulo(entrada))} className="block truncate text-[13px] text-white/60 hover:text-neon">
                    {entrada.modulo.numero}. {entrada.modulo.titulo}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Herramientas() {
  const lista = [
    ...SOFTWARE.filter((s) => s.herramienta).map((s) => ({ id: s.id, titulo: s.herramienta.nombre, texto: s.herramienta.texto, href: s.herramienta.href, software: s })),
    { id: 'guia', titulo: 'Ayuda y recorrido', texto: 'Cómo funciona Amatista, en un minuto', href: rutas.guia },
    { id: 'panel', titulo: 'Mi panel', texto: 'Tu avance, exámenes e insignias', href: rutas.panel },
  ];
  return (
    <section className="mt-14" aria-labelledby="explorar-herramientas">
      <TituloSeccion id="explorar-herramientas" antetitulo="Herramientas" titulo="Para practicar fuera de las lecciones" className="mb-5" />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {lista.map((h) => (
          <li key={h.id}>
            <a href={h.href} className="corte-poly-sm elevar flex h-full items-center gap-3 border border-white/10 bg-superficie/90 p-4 hover:border-neon">
              {h.software ? <LogoSoftware software={h.software} className="h-8 w-9 shrink-0" /> : <CristalLogo className="h-8 w-8 shrink-0" />}
              <span className="min-w-0">
                <span className="block font-bold text-white">{h.titulo}</span>
                <span className="block text-sm text-texto/65">{h.texto}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Explorar({ consulta }) {
  const { cursos } = useCatalogo();
  const { progreso } = useProgreso();
  const [filtros, cambiar] = useFiltros(consulta);
  const modulos = useMemo(() => modulosDelCatalogo(cursos), [cursos]);
  const lecciones = useMemo(() => leccionesDelCatalogo(modulos), [modulos]);
  const cifras = useMemo(() => cifrasPorSoftware(modulos), [modulos]);
  const resultado = useMemo(() => filtrarIndice(modulos, lecciones, filtros), [modulos, lecciones, filtros]);

  const disponibles = SOFTWARE.filter((s) => s.estado === 'disponible');
  const grupos = disponibles
    .map((software) => ({ software, entradas: resultado.modulos.filter((entrada) => entrada.software === software.id) }))
    .filter((grupo) => grupo.entradas.length);
  const proximos = SOFTWARE.filter(
    (s) => s.estado === 'proximamente' && (!filtros.software || filtros.software === s.id) && (!filtros.disciplina || s.disciplinas.includes(filtros.disciplina)),
  );
  const totalPublicados = modulos.filter((m) => m.publicado).length;
  const totalLecciones = lecciones.length;
  const hayFiltros = Boolean(filtros.software || filtros.disciplina || filtros.texto.trim());
  const publicadosVisibles = resultado.modulos.filter((m) => m.publicado).length;

  return (
    <Pagina
      ancho="amplio"
      migas={[{ texto: 'Inicio', href: rutas.inicio }, { texto: 'Explorar' }]}
      encabezado={{
        icono: <CristalLogo className="animar-flotar h-12 w-12" />,
        antetitulo: 'Todo Amatista',
        titulo: 'Explora todo lo que puedes aprender',
        descripcion: 'Programas, cursos, módulos y lecciones de 3D en un solo lugar. Filtra por programa o por lo que quieres aprender, o busca un tema.',
        children: (
          <dl className="mt-4 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-widest">
            {[
              ['Programas', SOFTWARE.length],
              ['Módulos', totalPublicados],
              ['Lecciones', totalLecciones],
            ].map(([nombre, valor]) => (
              <div key={nombre} className="corte-poly-sm flex gap-2 bg-black/30 px-3 py-1.5">
                <dt className="text-white/50">{nombre}</dt>
                <dd className="font-bold text-white">{valor}</dd>
              </div>
            ))}
          </dl>
        ),
      }}
    >
      <div className="mt-6 border-b border-white/5 pb-5" data-recorrido="buscador">
        <Buscador texto={filtros.texto} alCambiar={(texto) => cambiar({ texto })} enfocar={consulta?.buscar === '1'} />
        <Filtros filtros={filtros} alCambiar={cambiar} cifras={cifras} />
        <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/55" aria-live="polite">
          <span>
            {hayFiltros
              ? `${plural(publicadosVisibles, 'módulo', 'módulos')}${filtros.texto.trim() ? ` y ${plural(resultado.lecciones.length, 'lección', 'lecciones')}` : ''} con estos filtros`
              : `${plural(totalPublicados, 'módulo publicado', 'módulos publicados')} en ${plural(disponibles.length, 'programa', 'programas')}, y más en camino`}
          </span>
          {hayFiltros && (
            <button type="button" onClick={() => cambiar({ software: '', disciplina: '', texto: '' })} className="font-mono text-[11px] font-bold uppercase tracking-widest text-neon hover:underline">
              Quitar filtros
            </button>
          )}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">{grupos.length > 0 && <Indice grupos={grupos} />}</div>
        </aside>
        <div className="min-w-0">
          {grupos.length > 1 && (
            <details className="mb-6 lg:hidden">
              <summary className="corte-poly-sm cursor-pointer border border-white/10 bg-superficie/80 px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white/75">
                Índice del catálogo
              </summary>
              <div className="mt-2">
                <Indice grupos={grupos} />
              </div>
            </details>
          )}
          <ResultadosLecciones key={filtros.texto} lecciones={resultado.lecciones} texto={filtros.texto} />
          {grupos.map(({ software, entradas }) => (
            <SeccionSoftware key={software.id} software={software} entradas={entradas} progreso={progreso} />
          ))}
          {!grupos.length && !proximos.length && (
            <p className="corte-poly-sm border border-white/10 bg-superficie/80 p-6 text-center text-texto/75">
              No encontramos nada con estos filtros. Prueba otra palabra o quita un filtro.
            </p>
          )}
          {proximos.length > 0 && (
            <section className="mt-12" aria-labelledby="explorar-proximos">
              <TituloSeccion
                id="explorar-proximos"
                antetitulo="En camino"
                titulo="Los siguientes programas"
                descripcion="Amatista crece programa por programa. Estos son los que vienen."
                className="mb-4"
              />
              <ul className="grid gap-3 md:grid-cols-2">
                {proximos.map((software) => (
                  <ProgramaProximo key={software.id} software={software} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <Herramientas />
    </Pagina>
  );
}

export default Explorar;
