// Tarjeta de un curso en la portada (v3.2): una por ruta. «Blender» es una
// sola tarjeta y dentro se ramifica en sus niveles; «A-Frame» muestra sus
// módulos. Todo lleva al mismo lugar: la página del curso (#/curso/<ruta>).
import { estadoNivel, resumenRuta } from '../catalogo/agrupar';
import { useProgreso } from '../progreso/contexto';
import { resumenCurso, resumenModulo } from '../progreso/reglas';
import { rutas } from '../rutas';
import { IconoCandado } from './Iconos';
import LogoCurso from './LogoCurso';
import { ACENTOS } from './estiloCurso';

const ESTADO_NIVEL = {
  completado: { texto: 'Completado', clase: 'bg-emerald-400 text-base', nodo: 'bg-emerald-400 text-base' },
  'en-curso': { texto: 'En curso', clase: 'bg-neon/15 text-neon', nodo: 'bg-neon text-base animar-latido' },
  disponible: { texto: 'Disponible', clase: 'bg-white/10 text-white/80', nodo: 'bg-white/15 text-white' },
  bloqueado: { texto: 'Próximamente', clase: 'bg-white/5 text-white/45', nodo: 'bg-[#2a2a2a] text-white/40' },
};

// Los niveles de la ruta como ramas de un árbol: una línea que baja y un nodo por nivel.
function RamasNiveles({ ruta, progreso }) {
  return (
    <ol className="relative grid gap-1.5" aria-label={`Niveles de ${ruta.titulo}`}>
      <span className="absolute bottom-4 left-[13px] top-4 w-px bg-gradient-to-b from-white/25 to-white/5" aria-hidden="true" />
      {ruta.niveles.map((curso, i) => {
        const estado = estadoNivel(progreso, curso);
        const estilo = ESTADO_NIVEL[estado];
        const { porcentaje } = resumenCurso(progreso, curso);
        return (
          <li key={curso.id} className="relative flex items-center gap-3">
            <span className={`hexagono relative z-10 grid h-7 w-7 shrink-0 place-items-center font-mono text-[11px] font-bold ${estilo.nodo}`}>
              {estado === 'completado' ? '✓' : estado === 'bloqueado' ? <IconoCandado className="h-3 w-3" /> : i + 1}
            </span>
            <span className={`min-w-0 flex-1 truncate font-semibold ${estado === 'bloqueado' ? 'text-white/45' : 'text-white'}`}>
              {curso.nivel || curso.titulo}
            </span>
            <span className={`corte-poly-sm shrink-0 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${estilo.clase}`}>
              {estado === 'en-curso' ? `${porcentaje}%` : estilo.texto}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// Un curso de un solo nivel (A-Frame): sus módulos, como antes.
function ListaModulos({ curso, progreso, acento }) {
  return (
    <ol className="grid gap-2" aria-label={`Módulos de ${curso.titulo}`}>
      {curso.modulos.map((modulo) => {
        const publicado = Boolean(modulo.contenido) && curso.estado !== 'bloqueado';
        const nuevas = publicado ? resumenModulo(progreso, curso.id, modulo).nuevas : 0;
        return (
          <li key={modulo.id} className="flex items-center gap-3">
            <span
              className={`hexagono grid h-7 w-8 shrink-0 place-items-center font-mono text-[11px] font-bold ${
                publicado ? `${acento.fondo} text-base` : 'bg-white/10 text-white/50'
              }`}
            >
              {modulo.numero}
            </span>
            <span className={publicado ? 'text-white' : 'text-white/45'}>{modulo.titulo}</span>
            {nuevas > 0 && (
              <span className="corte-poly-sm bg-neon/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-neon">
                Nuevo
              </span>
            )}
            <span className={`ml-auto font-mono text-[10px] uppercase tracking-widest ${publicado ? acento.texto : 'text-white/30'}`}>
              {publicado ? `${modulo.contenido.lessons.length} lecciones` : 'Pronto'}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function TarjetaCurso({ ruta, indice }) {
  const { progreso } = useProgreso();
  const acento = ACENTOS[ruta.acento] ?? ACENTOS.neon;
  const varios = ruta.niveles.length > 1;
  const bloqueado = ruta.niveles.every((curso) => curso.estado === 'bloqueado');
  const { total, completadas, porcentaje, disponibles } = resumenRuta(progreso, ruta);
  const modulos = ruta.niveles.reduce((suma, curso) => suma + (curso.estado === 'bloqueado' ? 0 : curso.modulos.length), 0);

  let textoBoton = '▶ Entrar al curso';
  if (completadas > 0) textoBoton = completadas === total ? '✓ Repasar' : '▶ Continuar';

  return (
    <article
      className={`corte-poly animar-entrar bg-gradient-to-br p-[2px] transition-transform duration-300 ${acento.borde} ${
        bloqueado ? 'opacity-80' : `hover:-translate-y-1 ${acento.brillo}`
      }`}
      style={{ animationDelay: `${indice * 120}ms` }}
      aria-labelledby={`curso-${ruta.id}`}
    >
      <div className="corte-poly flex h-full flex-col gap-5 bg-superficie/95 p-6 sm:p-7">
        <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest">
          <span className="text-white/50">Curso {ruta.numero}</span>
          {bloqueado ? (
            <span className="corte-poly-sm flex items-center gap-1.5 bg-white/5 px-2.5 py-1 text-white/60">
              <IconoCandado className="h-3 w-3" /> Próximamente
            </span>
          ) : (
            <span className={`corte-poly-sm px-2.5 py-1 font-bold text-base ${acento.fondo}`}>
              {total > 0 && porcentaje === 100 ? 'Completado' : 'Disponible'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-5">
          <div className="hexagono relative grid h-24 w-24 shrink-0 place-items-center bg-base">
            <LogoCurso logo={ruta.logo} className={`h-14 w-16 ${bloqueado ? 'opacity-40 grayscale' : 'animar-flotar'}`} />
          </div>
          <div className="min-w-0">
            <h2 id={`curso-${ruta.id}`} className="text-3xl font-extrabold text-white">
              {ruta.titulo}
            </h2>
            <p className={`font-medium ${acento.texto}`}>{ruta.subtitulo}</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-wider text-white/50">
              {varios ? `${ruta.niveles.length} niveles · ${disponibles} abiertos · ${modulos} módulos` : `${ruta.niveles[0].nivel} · ${modulos} módulos`}
            </p>
          </div>
        </div>

        <p className="leading-relaxed text-texto/80">{ruta.descripcion}</p>

        {varios ? (
          <RamasNiveles ruta={ruta} progreso={progreso} />
        ) : (
          <ListaModulos curso={ruta.niveles[0]} progreso={progreso} acento={acento} />
        )}

        <div>
          <div className="mb-1.5 flex justify-between font-mono text-[11px] uppercase tracking-wider text-white/50">
            <span>Progreso</span>
            <span>
              {completadas} / {total} lecciones
            </span>
          </div>
          <div
            className={`barra ${porcentaje === 0 || porcentaje === 100 ? 'quieta' : ''}`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={completadas}
            aria-label={`Progreso en ${ruta.titulo}`}
          >
            <div className={`relleno ${acento.fondo}`} style={{ width: `${porcentaje}%` }} />
          </div>
        </div>

        <div className="mt-auto">
          {bloqueado ? (
            <button
              type="button"
              disabled
              className="corte-poly-sm flex w-full cursor-not-allowed items-center justify-center gap-2 bg-white/5 py-3 font-bold uppercase tracking-widest text-white/40"
            >
              <IconoCandado className="h-4 w-4" /> Bloqueado
            </button>
          ) : (
            <a
              href={rutas.curso(ruta.id)}
              className={`corte-poly-sm destello block w-full py-3 text-center font-extrabold uppercase tracking-widest text-base transition-[filter] hover:brightness-110 ${acento.fondo}`}
            >
              {textoBoton}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default TarjetaCurso;
