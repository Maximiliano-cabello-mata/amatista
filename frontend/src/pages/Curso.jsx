// Página de un curso (v3.2): todo el curso en un solo lugar. #/curso/blender
// muestra Blender completo: el árbol de niveles (Principiante,
// Principiante-Intermedio, Intermedio y Avanzado), el nivel elegido con sus
// módulos (teoría y Blender intercalados, cada módulo con su temática y su
// jefe), el estado de tu Blender conectado y las insignias. #/curso/<nivel>
// abre la misma página con ese nivel elegido; A-Frame funciona igual con un
// solo nivel.
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/contexto';
import { buscarRuta, estadoNivel, resumenRuta } from '../catalogo/agrupar';
import { useCatalogo } from '../catalogo/contexto';
import EstadoGuardado from '../components/EstadoGuardado';
import Etiqueta, { Etiquetas } from '../components/etiquetas/Etiqueta';
import { etiquetaLeccion, etiquetasModulo } from '../components/etiquetas/catalogo';
import { ACENTOS } from '../components/estiloCurso';
import { CristalLogo, IconoCandado } from '../components/Iconos';
import LogoCurso from '../components/LogoCurso';
import EstacionBlender from '../components/modulo/EstacionBlender';
import RutaModulo from '../components/modulo/RutaModulo';
import Jefe from '../components/temas/Jefe';
import Escenario from '../components/temas/Escenario';
import MundoTema from '../components/temas/MundoTema';
import Mascota from '../components/temas/Mascota';
import { temaDelModulo, variablesDeTema } from '../components/temas/temas';
import { duracionTexto, tituloCorto } from '../data/cursos';
import { estadoPracticaEn, practicasDelModulo, secuenciaDelModulo } from '../modulos/practica';
import { useProgreso } from '../progreso/contexto';
import {
  estaCompletada,
  estaDesbloqueada,
  idInsignia,
  leccionEsNueva,
  resumenCurso,
  resumenModulo,
  tieneInsignia,
} from '../progreso/reglas';
import { rutas } from '../rutas';
import { listarDispositivos, listarPracticas } from '../services/blender';

function NodoLeccion({ numero, hecha, abierta, acento }) {
  if (hecha) {
    return (
      <span className={`hexagono relative z-10 grid h-11 w-12 shrink-0 place-items-center font-bold text-base ${acento.fondo}`}>
        ✓
      </span>
    );
  }
  if (abierta) {
    return (
      <span className="hexagono relative z-10 grid h-11 w-12 shrink-0 place-items-center bg-neon font-mono font-bold text-base">
        {numero}
      </span>
    );
  }
  return (
    <span className="hexagono relative z-10 grid h-11 w-12 shrink-0 place-items-center bg-[#2a2a2a] text-white/40">
      <IconoCandado className="h-4 w-4" />
    </span>
  );
}

function FilaLeccion({ curso, modulo, leccion, indice, acento, progreso, tema }) {
  const hecha = estaCompletada(progreso, curso.id, leccion);
  const abierta = estaDesbloqueada(progreso, curso.id, modulo, indice);
  const nueva = leccionEsNueva(progreso, curso.id, modulo, indice);
  const actual = abierta && !hecha;
  const examen = leccion.type === 'exam';
  const etiqueta = etiquetaLeccion(leccion);
  const fila = (
    <>
      {examen ? (
        <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center">
          <Jefe jefe={tema.jefe} derrotado={hecha} className={`h-12 w-12 ${abierta ? '' : 'opacity-40 grayscale'}`} />
        </span>
      ) : (
        <NodoLeccion numero={indice + 1} hecha={hecha} abierta={abierta} acento={acento} />
      )}
      <span className="min-w-0 flex-1">
        <span className={`flex flex-wrap items-center gap-2 font-semibold ${abierta ? 'text-white' : 'text-white/45'}`}>
          {examen ? `Jefe final: ${tema.jefe.nombre}` : leccion.title}
          {nueva && <Etiqueta texto="Nueva" tono="neon" />}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-2">
          <Etiqueta {...etiqueta} tono={abierta ? etiqueta.tono : 'gris'} />
          {leccion.durationSeconds ? (
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/40">{duracionTexto(leccion.durationSeconds)}</span>
          ) : null}
        </span>
      </span>
      <span
        className={`shrink-0 font-mono text-xs uppercase tracking-widest ${
          actual ? 'animar-pulso text-neon' : `hidden sm:inline ${hecha ? 'text-white/50' : 'text-white/30'}`
        }`}
      >
        {actual ? (examen ? '¡Pelear! ▶' : 'Jugar ▶') : hecha ? (examen ? 'Vencido' : 'Repasar') : 'Bloqueada'}
      </span>
    </>
  );
  return abierta ? (
    <a
      href={rutas.leccion(curso.id, leccion.id)}
      className={`corte-poly-sm relative z-10 flex items-center gap-4 px-3 py-3 transition-colors hover:bg-white/5 ${actual ? 'bg-neon/5' : ''}`}
    >
      {fila}
    </a>
  ) : (
    <div className="relative z-10 flex items-center gap-4 px-3 py-3" aria-disabled="true">
      {fila}
    </div>
  );
}

// Un módulo: su temática arriba y, en orden, teoría y estaciones de Blender
// intercaladas, hasta el jefe final.
function MapaModulo({ curso, modulo, acento, progreso }) {
  const contenido = modulo.contenido;
  const numero = modulo.numero;
  const titulo = tituloCorto(contenido.title);
  const tema = temaDelModulo(modulo);
  const { total, completadas, nuevas } = resumenModulo(progreso, curso.id, modulo);
  const insigniaGanada = tieneInsignia(progreso.insignias, idInsignia(curso.id, modulo));
  const enBlender = practicasDelModulo(modulo).length;
  const props = { curso, modulo, acento, progreso, tema };

  return (
    <section
      className="modulo-mundo corte-poly cv-auto p-[2px]"
      style={variablesDeTema(tema)}
      aria-labelledby={`modulo-${curso.id}-${numero}`}
    >
      <div className="modulo-mundo__interior corte-poly relative overflow-hidden p-6 sm:p-8">
        <MundoTema tema={tema} dentro />
        <Escenario tema={tema} className="pointer-events-none absolute inset-x-0 top-0 h-48 w-full opacity-70 [mask-image:linear-gradient(to_bottom,black_55%,transparent)] sm:h-56" />
        <Escenario tema={tema} className="modulo-mundo__eco escenario--quieto pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full -scale-x-100 opacity-25 [mask-image:linear-gradient(to_top,black_40%,transparent)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-r from-superficie/95 via-superficie/60 to-transparent" aria-hidden="true" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-neon">
              Módulo {numero} · <span className={tema.texto}>{tema.nombre}</span>
            </p>
            <h2 id={`modulo-${curso.id}-${numero}`} className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
              {titulo}
            </h2>
            <p className="mt-1 text-sm italic text-texto/65">{tema.lema}</p>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-white/45">
            {completadas} / {total} lecciones
            {enBlender > 0 && <span className="block text-right text-blender/80">{enBlender} en Blender</span>}
          </p>
        </div>
        <Etiquetas className="relative mt-3" lista={etiquetasModulo(contenido, { conPractica: enBlender > 0, nuevas })} />
        <p className="relative mt-3 leading-relaxed text-texto/75">{contenido.description}</p>
        <Mascota tema={tema} paseo className="relative mt-4" />
        <RutaModulo className="relative mt-4" lecciones={contenido.lessons} progreso={progreso} cursoId={curso.id} />

        {/* La línea que une las lecciones va fuera del <ol>: dentro solo puede haber <li>. */}
        <div className="relative mt-5">
          <span className="absolute bottom-6 left-6 top-6 w-px bg-gradient-to-b from-white/15 via-blender/25 to-white/10" aria-hidden="true" />
          <ol className="space-y-2">
            {secuenciaDelModulo(modulo).map((paso) => (
              <li key={paso.leccion.id}>
                {paso.tipo === 'practica' ? (
                  <EstacionBlender cursoId={curso.id} estado={estadoPracticaEn(progreso, curso.id, modulo, paso.indice)} />
                ) : (
                  <FilaLeccion leccion={paso.leccion} indice={paso.indice} {...props} />
                )}
              </li>
            ))}
          </ol>
        </div>

        {modulo.insignia && (
          <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
            <CristalLogo className={`h-9 w-9 shrink-0 ${insigniaGanada ? 'animar-aparecer' : 'opacity-35 grayscale'}`} />
            <p className="text-sm text-texto/75">
              Insignia <strong className="text-white">{modulo.insignia}</strong>
              {insigniaGanada ? ' · ¡desbloqueada!' : ` · vence a ${tema.jefe.nombre} para ganarla`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

const NODO_NIVEL = {
  completado: 'bg-emerald-400 text-base',
  'en-curso': 'bg-neon text-base',
  disponible: 'bg-white/15 text-white',
  bloqueado: 'bg-[#2a2a2a] text-white/40',
};
const TEXTO_NIVEL = { completado: 'Completado', 'en-curso': 'En curso', disponible: 'Disponible', bloqueado: 'Próximamente' };

// El árbol del curso: un tronco (el logo) que se ramifica en los niveles.
// Cada rama es un enlace al nivel; el elegido se resalta.
function ArbolNiveles({ ruta, elegido, progreso, acento }) {
  const n = ruta.niveles.length;
  return (
    <nav aria-label={`Niveles de ${ruta.titulo}`} className="mt-8">
      {/* Ramas: del tronco salen curvas hacia cada nivel (solo en pantallas anchas). */}
      <svg viewBox={`0 0 ${n * 100} 40`} preserveAspectRatio="none" className="hidden h-10 w-full md:block" aria-hidden="true">
        {ruta.niveles.map((curso, i) => {
          const x = i * 100 + 50;
          const activo = estadoNivel(progreso, curso) !== 'bloqueado';
          return (
            <path
              key={curso.id}
              d={`M ${(n * 100) / 2} 0 C ${(n * 100) / 2} 24, ${x} 14, ${x} 40`}
              fill="none"
              stroke={activo ? '#F5792A' : '#ffffff'}
              strokeOpacity={activo ? 0.7 : 0.15}
              strokeWidth="2"
              strokeDasharray={activo ? undefined : '4 4'}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <ol className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {ruta.niveles.map((curso, i) => {
          const estado = estadoNivel(progreso, curso);
          const { porcentaje } = resumenCurso(progreso, curso);
          const actual = curso.id === elegido.id;
          const bloqueado = estado === 'bloqueado';
          return (
            <li key={curso.id}>
              <a
                href={rutas.curso(curso.id)}
                aria-current={actual ? 'page' : undefined}
                className={`corte-poly-sm elevar flex h-full flex-col gap-2 border p-3 ${
                  actual ? `border-transparent bg-gradient-to-br ${acento.borde} text-base` : 'border-white/10 bg-superficie/90 hover:border-white/25'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`hexagono grid h-8 w-9 shrink-0 place-items-center font-mono text-xs font-bold ${NODO_NIVEL[estado]}`}>
                    {estado === 'completado' ? '✓' : bloqueado ? <IconoCandado className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className={`font-mono text-[10px] font-bold uppercase tracking-widest ${actual ? 'text-white' : 'text-white/50'}`}>
                    {TEXTO_NIVEL[estado]}
                  </span>
                </span>
                <span className={`font-extrabold leading-tight ${actual ? 'text-white' : bloqueado ? 'text-white/50' : 'text-white'}`}>
                  {curso.nivel || curso.titulo}
                </span>
                {!bloqueado && (
                  <span className={`barra quieta mt-auto h-1 ${actual ? 'bg-black/30' : ''}`} aria-hidden="true">
                    <span className={`relleno block ${actual ? 'bg-white' : acento.fondo}`} style={{ width: `${porcentaje}%` }} />
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Tu Blender, dentro del curso: si está conectado y cuántas prácticas lleva
// registradas. Lo que se hace en Blender cuenta solo con Blender conectado.
function TuBlender({ niveles }) {
  const { token, usuario } = useAuth();
  const [datos, setDatos] = useState(null);
  useEffect(() => {
    if (!token) return undefined;
    let vigente = true;
    Promise.all([listarDispositivos(token), listarPracticas(token)]).then(([dispositivos, practicas]) => {
      if (!vigente) return;
      const lista = practicas.ok ? practicas.datos.practicas : [];
      setDatos({
        conectados: dispositivos.ok ? dispositivos.datos.dispositivos : null,
        registradas: lista.filter((p) => p.mi_progreso).length,
        completadas: lista.filter((p) => p.mi_progreso?.completada).length,
      });
    });
    return () => {
      vigente = false;
    };
  }, [token]);

  const total = niveles.reduce(
    (suma, curso) => suma + curso.modulos.reduce((s, m) => s + (m.contenido ? practicasDelModulo(m).length : 0), 0),
    0,
  );
  const conectado = Boolean(datos?.conectados?.length);
  let estado = 'Entra con tu cuenta para conectar Blender y registrar tus prácticas.';
  if (usuario && !datos) estado = 'Revisando tu Blender…';
  else if (usuario && datos?.conectados === null) estado = 'Sin conexión con el servidor: tu avance se enviará al volver.';
  else if (usuario && !conectado) estado = 'Aún no conectas Blender. Instálalo una vez y cada práctica quedará registrada.';
  else if (conectado) estado = `Conectado: ${datos.conectados.map((d) => d.nombre).join(', ')}.`;

  return (
    <aside className="corte-poly-sm mt-6 flex flex-col gap-4 border border-blender/30 bg-gradient-to-r from-blender/10 via-superficie/95 to-superficie/95 p-4 sm:flex-row sm:items-center">
      <span className={`hexagono relative grid h-14 w-16 shrink-0 place-items-center bg-base ${conectado ? 'animar-latido' : ''}`}>
        <LogoCurso logo="blender" className="h-8 w-9" />
        <span className={`absolute -right-0.5 top-1 h-3 w-3 rounded-full ${conectado ? 'bg-emerald-400' : 'bg-white/25'}`} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blender">Tu Blender</p>
        <p className="font-bold text-white">{estado}</p>
        <p className="mt-0.5 text-sm text-texto/70">
          {total} prácticas en Blender en este curso
          {datos && datos.registradas > 0 ? ` · ${datos.completadas} completadas y ${datos.registradas} registradas en tu cuenta` : ''}.
        </p>
      </div>
      <a
        href={rutas.blender}
        className="corte-poly-sm destello shrink-0 bg-blender px-4 py-2.5 text-center font-mono text-xs font-bold uppercase tracking-widest text-base hover:brightness-110"
      >
        {conectado ? 'Mi Blender ▸' : 'Conectar Blender ▸'}
      </a>
    </aside>
  );
}

// Un nivel que aún no se publica: qué traerá.
function NivelProximo({ curso }) {
  return (
    <div className="corte-poly-sm border border-dashed border-white/15 bg-superficie/70 p-6">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/50">
        <IconoCandado className="h-3.5 w-3.5" /> Bloqueado por ahora
      </p>
      <p className="mt-2 text-texto/80">{curso.descripcion}</p>
      {curso.modulos.some((m) => m.titulo && m.titulo !== 'Próximamente') && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {curso.modulos.map((m) => (
            <li key={m.id} className="corte-poly-sm bg-white/5 px-3 py-2 text-sm text-white/55">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-white/35">Módulo {m.numero}</span>
              {m.titulo}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Curso({ cursoId }) {
  const { progreso } = useProgreso();
  const { cursos } = useCatalogo();
  const encontrado = buscarRuta(cursos, cursoId);

  if (!encontrado) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-xl text-white">No encontramos este curso.</p>
        <a href={rutas.inicio} className="mt-4 inline-block text-neon">
          ◂ Volver a los cursos
        </a>
      </main>
    );
  }

  const { ruta } = encontrado;
  const acento = ACENTOS[ruta.acento] ?? ACENTOS.neon;
  const resumen = resumenRuta(progreso, ruta);
  // Sin nivel en el enlace: el que está en curso, o el primero abierto.
  const nivel =
    encontrado.nivel ?? resumen.enCurso?.curso ?? ruta.niveles.find((c) => c.estado !== 'bloqueado') ?? ruta.niveles[0];
  const resumenNivel = resumenCurso(progreso, nivel);
  const siguiente = resumenNivel.siguiente;
  const bloqueado = nivel.estado === 'bloqueado';
  const varios = ruta.niveles.length > 1;
  const conBlender = ruta.id === 'blender';

  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
      <a href={rutas.inicio} className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-neon">
        ◂ Todos los cursos
      </a>

      <header className="animar-entrar mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="hexagono grid h-28 w-28 shrink-0 place-items-center bg-superficie">
          <LogoCurso logo={ruta.logo} className="animar-flotar h-16 w-20" decorativo={false} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/50">
            Curso {ruta.numero}
            {varios ? ` · ${ruta.niveles.length} niveles` : ''}
          </p>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">{ruta.titulo}</h1>
          <p className={`text-lg font-medium ${acento.texto}`}>{ruta.subtitulo}</p>
          <div className="mt-4 max-w-md">
            <div className="mb-1.5 flex justify-between font-mono text-[11px] uppercase tracking-wider text-white/50">
              <span>Todo el curso</span>
              <span>
                {resumen.completadas} / {resumen.total} lecciones
              </span>
            </div>
            <div
              className={`barra ${resumen.porcentaje === 0 || resumen.porcentaje === 100 ? 'quieta' : ''}`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={resumen.total}
              aria-valuenow={resumen.completadas}
              aria-label={`Progreso en ${ruta.titulo}`}
            >
              <div className={`relleno ${acento.fondo}`} style={{ width: `${resumen.porcentaje}%` }} />
            </div>
          </div>
        </div>
        {siguiente && !bloqueado && (
          <a
            href={rutas.leccion(nivel.id, siguiente.leccion.id)}
            className={`corte-poly-sm destello shrink-0 px-6 py-3 text-center font-extrabold uppercase tracking-widest text-base hover:brightness-110 ${acento.fondo}`}
          >
            ▶ {resumenNivel.completadas ? 'Continuar' : 'Comenzar'}
          </a>
        )}
      </header>

      <p className="mt-6 max-w-3xl leading-relaxed text-texto/80">{ruta.descripcion}</p>

      {varios && <ArbolNiveles ruta={ruta} elegido={nivel} progreso={progreso} acento={acento} />}
      {conBlender && <TuBlender niveles={ruta.niveles} />}

      {/* El nivel elegido */}
      <section className="mt-10" aria-labelledby="nivel-titulo">
        {varios && (
          <div className="mb-5">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">Nivel {ruta.niveles.indexOf(nivel) + 1}</p>
            <h2 id="nivel-titulo" className="text-3xl font-extrabold text-white">
              {nivel.nivel || nivel.titulo}
            </h2>
            <p className={`font-medium ${acento.texto}`}>{nivel.subtitulo}</p>
            {!bloqueado && <p className="mt-2 max-w-3xl leading-relaxed text-texto/75">{nivel.descripcion}</p>}
          </div>
        )}
        {!varios && <h2 id="nivel-titulo" className="sr-only">Módulos</h2>}

        {bloqueado ? (
          <NivelProximo curso={nivel} />
        ) : (
          <div className="space-y-4">
            {conBlender && (
              <p className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-white/50">
                <span>Así avanzas:</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="hexagono inline-block h-3 w-3.5 bg-neon" /> Teoría
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="hexagono inline-block h-3 w-3.5 bg-blender" /> En Blender, registrado
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="hexagono inline-block h-3 w-3.5 bg-amber-300" /> Jefe final
                </span>
              </p>
            )}
            {nivel.modulos.map((modulo) =>
              modulo.contenido ? (
                <MapaModulo key={modulo.id} curso={nivel} modulo={modulo} acento={acento} progreso={progreso} />
              ) : (
                <div
                  key={modulo.id}
                  className="corte-poly-sm flex items-center justify-between gap-4 border border-white/5 bg-superficie/60 px-5 py-4"
                >
                  <span>
                    <span className="block font-mono text-[11px] uppercase tracking-widest text-white/35">Módulo {modulo.numero}</span>
                    <span className="font-semibold text-white/55">{modulo.titulo}</span>
                  </span>
                  <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/35">
                    <IconoCandado className="h-3.5 w-3.5" /> Próximamente
                  </span>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      <div className="mt-8 flex flex-col gap-3 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <EstadoGuardado />
        {ruta.recurso && (
          <a
            href={ruta.recurso.url}
            target="_blank"
            rel="noreferrer"
            className={`font-mono text-xs uppercase tracking-widest hover:underline ${acento.texto}`}
          >
            {ruta.recurso.texto} ↗
          </a>
        )}
      </div>
    </main>
  );
}

export default Curso;
