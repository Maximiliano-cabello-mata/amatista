import { duracionTexto, leccionesDelCurso, TIPOS_LECCION, tituloCorto } from '../../data/cursos';
import { leccionEsNueva } from '../../progreso/reglas';
import { rutas } from '../../rutas';
import Medidor from '../graficas/Medidor';
import { ACENTOS_GRAFICA } from '../graficas/colores';
import { ACENTOS, logoDeCurso } from '../estiloCurso';
import { CristalLogo } from '../Iconos';
import LogoCurso from '../LogoCurso';
import { cursosParaContinuar } from './datos';
import Seccion from './Seccion';

const ETIQUETA_NUEVA =
  'corte-poly-sm bg-neon/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-neon';

function detalleLeccion({ modulo, leccion, indice }) {
  const partes = [`Lección ${indice + 1} de ${modulo.contenido.lessons.length}`, TIPOS_LECCION[leccion.type]];
  const duracion = duracionTexto(leccion.durationSeconds);
  if (duracion) partes.push(duracion);
  return partes.filter(Boolean).join(' · ');
}

// Siguiente lección de cada curso (resumenCurso): la del curso trabajado más
// recientemente va en grande; las demás, como accesos rápidos.
function ContinuarPanel({ progreso, cursos, className = '' }) {
  const lista = cursosParaContinuar(progreso, cursos);
  const hayLecciones = cursos.some((curso) => leccionesDelCurso(curso).length > 0);

  if (!lista.length) {
    return (
      <Seccion id="panel-continuar" etiqueta="Tu siguiente paso" titulo="Continúa donde te quedaste" className={className}>
        <div className="flex items-center gap-4">
          <CristalLogo className="animar-flotar h-14 w-14 shrink-0" />
          <p className="text-texto/80">
            {hayLecciones
              ? '¡Completaste todas las lecciones publicadas! Repasa cuando quieras: te avisaremos con «Nuevo contenido» cuando lleguen más.'
              : 'Todavía no hay lecciones publicadas. Vuelve pronto.'}
          </p>
        </div>
        <a
          href={rutas.inicio}
          className="corte-poly-sm mt-5 inline-block bg-white/5 px-5 py-3 font-extrabold uppercase tracking-widest text-white/85 hover:bg-white/10"
        >
          Ver los cursos ▸
        </a>
      </Seccion>
    );
  }

  const [principal, ...otros] = lista;
  const { curso, resumen } = principal;
  const { modulo, leccion, indice } = resumen.siguiente;
  const acento = ACENTOS[curso.acento] ?? ACENTOS.neon;
  const color = (ACENTOS_GRAFICA[curso.acento] ?? ACENTOS_GRAFICA.neon).color;
  const empezado = resumen.completadas > 0;
  const nueva = leccionEsNueva(progreso, curso.id, modulo, indice);

  return (
    <Seccion id="panel-continuar" etiqueta="Tu siguiente paso" titulo="Continúa donde te quedaste" className={className}>
      <div className={`corte-poly bg-gradient-to-br p-[2px] ${acento.borde}`}>
        <div className="corte-poly flex flex-col gap-5 bg-base/95 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="hexagono grid h-20 w-[5.5rem] shrink-0 place-items-center bg-superficie">
            <LogoCurso logo={logoDeCurso(curso)} className="animar-flotar h-12 w-12" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">
              {curso.titulo} · Módulo {modulo.numero}: {modulo.titulo ?? tituloCorto(modulo.contenido.title)}
            </p>
            <h3 className="mt-1 flex flex-wrap items-center gap-2 text-xl font-extrabold text-white sm:text-2xl">
              {leccion.title}
              {nueva && <span className={ETIQUETA_NUEVA}>Nueva</span>}
            </h3>
            <p className="mt-1 font-mono text-xs uppercase tracking-wider text-white/55">{detalleLeccion(resumen.siguiente)}</p>
            <div className="mt-4 max-w-md">
              <div className="mb-1.5 flex justify-between font-mono text-[11px] uppercase tracking-wider text-white/50">
                <span>Curso</span>
                <span>
                  {resumen.completadas} / {resumen.total} lecciones · {resumen.porcentaje}%
                </span>
              </div>
              <Medidor
                valor={resumen.completadas}
                maximo={resumen.total}
                color={color}
                etiqueta={`Avance en ${curso.titulo}`}
                textoValor={`${resumen.completadas} de ${resumen.total} lecciones`}
              />
            </div>
          </div>
          <a
            href={rutas.leccion(curso.id, leccion.id)}
            className={`corte-poly-sm destello shrink-0 px-7 py-4 text-center text-lg font-extrabold uppercase tracking-widest text-base transition-[filter] hover:brightness-110 ${acento.fondo}`}
          >
            ▶ {empezado ? 'Continuar' : 'Comenzar'}
            <span className="sr-only">: {leccion.title}</span>
          </a>
        </div>
      </div>

      {otros.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">También puedes seguir con</p>
          <ul className="mt-2 flex flex-col gap-2">
            {otros.map(({ curso: otro, resumen: suyo }) => {
              return (
                <li key={otro.id}>
                  <a
                    href={rutas.leccion(otro.id, suyo.siguiente.leccion.id)}
                    className="corte-poly-sm flex items-center gap-3 border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-colors hover:border-white/15 hover:bg-white/5"
                  >
                    <LogoCurso logo={logoDeCurso(otro)} className="h-8 w-8 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[10px] uppercase tracking-widest text-white/45">
                        {otro.titulo} · {suyo.completadas} / {suyo.total}
                      </span>
                      <span className="block truncate font-semibold text-white">{suyo.siguiente.leccion.title}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-neon">
                      {suyo.completadas ? 'Continuar' : 'Comenzar'} ▸
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Seccion>
  );
}

export default ContinuarPanel;
