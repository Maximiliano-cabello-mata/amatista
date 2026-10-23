// Pie de página global (v4.0 · Facetas): la marca y cuatro columnas con todo lo que hay en la
// plataforma, para llegar a cualquier lugar desde cualquier página. Abajo, la versión del add-on.
import { useAuth } from '../../auth/contexto';
import { NOMBRE_MOTOR } from '../../blender/logica';
import { SOFTWARE } from '../../data/software';
import { useRecorrido } from '../../recorrido/contexto';
import { rutaEntrar, rutas } from '../../rutas';
import { CristalLogo } from '../Iconos';
import LogoCurso from '../LogoCurso';
import { facetasBorde } from './facetas';

const BORDE = facetasBorde();
const ENLACE = 'text-sm text-white/60 transition-colors hover:text-neon';

function Columna({ titulo, children }) {
  return (
    <div className="min-w-0">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/80">{titulo}</h2>
      <ul className="mt-3 grid gap-2">{children}</ul>
    </div>
  );
}

function PiePagina() {
  const { usuario } = useAuth();
  const { empezar } = useRecorrido();
  return (
    <footer className="pie-pagina mt-8 bg-base/80" aria-label="Pie de página">
      <svg className="pie-pagina__facetas" viewBox="0 0 1200 18" preserveAspectRatio="none" aria-hidden="true">
        {BORDE.map((t, i) => (
          <polygon key={i} points={t.puntos} fill="#9b59b6" fillOpacity={t.opacidad} />
        ))}
      </svg>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-8 pt-8 sm:px-6 md:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
        <div className="min-w-0">
          <a href={rutas.inicio} className="flex items-center gap-3" aria-label="Amatista, inicio">
            <CristalLogo className="h-9 w-9" />
            <span className="text-lg font-extrabold tracking-[0.25em] text-white">AMATISTA</span>
          </a>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/55">
            Aprende 3D creando: modelado, diseño, animación y 3D para la web en varios programas, incluso sin Internet.
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-widest text-white/40">
            hoy con <LogoCurso logo="blender" className="h-4 w-5" decorativo={false} /> y <LogoCurso logo="aframe" className="h-4 w-5" decorativo={false} />, y más en camino
          </p>
        </div>
        <Columna titulo="Aprender">
          <li><a href={rutas.inicio} className={ENLACE}>Todos los cursos, paso a paso</a></li>
          {SOFTWARE.filter((s) => s.estado === 'disponible').map((s) => (
            <li key={s.id}><a href={rutas.curso(s.ruta)} className={ENLACE}>Curso de {s.nombre}</a></li>
          ))}
          <li><a href={rutas.guia} className={ENLACE}>¿Primera vez? Empieza aquí</a></li>
        </Columna>
        <Columna titulo="Herramientas">
          {SOFTWARE.filter((s) => s.herramienta).map((s) => (
            <li key={s.id}><a href={s.herramienta.href} className={ENLACE}>{s.herramienta.nombre.includes(s.nombre) ? s.herramienta.nombre : `${s.herramienta.nombre} para ${s.nombre}`}</a></li>
          ))}
          <li><a href={rutas.vincular} className={ENLACE}>Conectar Blender con un código</a></li>
        </Columna>
        <Columna titulo="Tu cuenta">
          <li><a href={rutas.panel} className={ENLACE}>Mi panel</a></li>
          {usuario ? (
            <li><a href={rutas.perfil} className={ENLACE}>Perfil y seguridad</a></li>
          ) : (
            <>
              <li><a href={rutaEntrar(rutas.panel)} className={ENLACE}>Entrar</a></li>
              <li><a href={rutas.registro} className={ENLACE}>Crear cuenta</a></li>
            </>
          )}
        </Columna>
        <Columna titulo="Ayuda">
          <li><a href={rutas.guia} className={ENLACE}>Cómo funciona Amatista</a></li>
          <li>
            <button type="button" onClick={() => empezar(0)} className={`${ENLACE} text-left`}>
              Recorrido por la plataforma
            </button>
          </li>
        </Columna>
      </div>
      <div className="border-t border-white/5">
        <p className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-4 font-mono text-[11px] uppercase tracking-widest text-white/35 sm:px-6">
          <span>Amatista · plataforma multiplataforma de creación 3D</span>
          <span>{NOMBRE_MOTOR}</span>
        </p>
      </div>
    </footer>
  );
}

export default PiePagina;
