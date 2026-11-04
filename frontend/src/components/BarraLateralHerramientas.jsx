// Barra lateral flotante de herramientas: vive fija en el costado derecho de la pantalla
// con cuadritos animados y sus logos low-poly. No contamina la barra superior y le explica
// con total claridad a quien no sabe nada qué es y para qué sirve cada herramienta.
import {
  IconoAFrame,
  IconoBiblioteca,
  IconoBlender,
  IconoCloud,
  IconoEcosistema,
  IconoGeoda,
} from './Iconos';
import { rutas } from '../rutas';

const HERRAMIENTAS = [
  {
    id: 'nube',
    href: rutas.nube,
    pagina: 'nube',
    etiqueta: 'UTN · Recomendado',
    titulo: 'Blender en la nube',
    paraQuien: 'Para quien no puede instalar Blender',
    descripcion: 'Abre Blender completo directo en tu navegador con un solo clic. No necesitas instalar nada ni tener una PC potente.',
    borde: 'hover:border-neon/80',
    activoClase: 'border-neon bg-neon/15 text-neon shadow-[0_0_15px_rgba(0,229,255,0.4)]',
    acento: 'text-neon',
    Logo: IconoCloud,
  },
  {
    id: 'blender',
    href: rutas.blender,
    pagina: 'blender',
    etiqueta: 'En tu computadora',
    titulo: 'Conectar mi Blender',
    paraQuien: 'Si ya tienes Blender instalado',
    descripcion: 'Descarga el complemento Amatista Motor para que revise lo que modelas en Blender y te guíe paso a paso.',
    borde: 'hover:border-blender/80',
    activoClase: 'border-blender bg-blender/15 text-blender shadow-[0_0_15px_rgba(245,121,42,0.4)]',
    acento: 'text-blender',
    Logo: IconoBlender,
  },
  {
    id: 'biblioteca',
    href: rutas.biblioteca,
    pagina: 'biblioteca',
    etiqueta: 'Recursos gratis',
    titulo: 'Biblioteca 3D',
    paraQuien: 'Modelos y texturas listas',
    descripcion: 'Objetos 3D, texturas y materiales libres para usar en tus tareas sin tener que empezar desde cero.',
    borde: 'hover:border-amatista-claro/80',
    activoClase: 'border-amatista-claro bg-amatista/20 text-amatista-claro shadow-[0_0_15px_rgba(195,155,211,0.4)]',
    acento: 'text-amatista-claro',
    Logo: IconoBiblioteca,
  },
  {
    id: 'estudio',
    href: rutas.estudio,
    pagina: 'estudio',
    etiqueta: 'Crear para la web',
    titulo: 'Estudio Web 3D',
    paraQuien: 'Mundos en tu navegador',
    descripcion: 'Arma escenas 3D y de realidad virtual fáciles de compartir con un enlace usando A-Frame.',
    borde: 'hover:border-neon/80',
    activoClase: 'border-neon bg-neon/15 text-neon shadow-[0_0_15px_rgba(0,229,255,0.4)]',
    acento: 'text-neon',
    Logo: IconoAFrame,
  },
  {
    id: 'geoda',
    href: rutas.geoda,
    pagina: 'geoda',
    etiqueta: 'Diagnóstico',
    titulo: 'Ajustar a mi PC (Geoda)',
    paraQuien: '¿Tu PC correrá Blender?',
    descripcion: 'Analiza tu equipo y te dice exactamente qué versión de Blender y qué ajustes van fluidos en tu computadora.',
    borde: 'hover:border-emerald-400/80',
    activoClase: 'border-emerald-400 bg-emerald-400/15 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]',
    acento: 'text-emerald-300',
    Logo: IconoGeoda,
  },
  {
    id: 'ecosistema',
    href: rutas.ecosistema,
    pagina: 'ecosistema',
    etiqueta: 'Guía rápida',
    titulo: '¿Qué es cada cosa?',
    paraQuien: 'Para entender la plataforma',
    descripcion: 'Un mapa muy sencillo que te explica cómo se conectan los cursos, el motor y la nube sin rodeos técnicos.',
    borde: 'hover:border-amatista-claro/80',
    activoClase: 'border-amatista-claro bg-amatista/20 text-amatista-claro shadow-[0_0_15px_rgba(195,155,211,0.4)]',
    acento: 'text-amatista-claro',
    Logo: IconoEcosistema,
  },
];

const PAGINAS_OCULTAS = ['entrar', 'registro', 'confirmar', 'recuperar', 'admin'];

function BarraLateralHerramientas({ pagina }) {
  if (PAGINAS_OCULTAS.includes(pagina)) return null;

  return (
    <aside
      aria-label="Herramientas de Amatista"
      className="barra-lateral-herramientas fixed right-2 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-superficie/90 p-1.5 shadow-2xl backdrop-blur-md lg:flex"
    >
      {/* Cabecera discreta que indica qué es esta barra a quien entra por primera vez */}
      <a
        href={rutas.ecosistema}
        title="¿Qué son estas herramientas? Haz clic para ver la guía completa"
        className="group relative flex flex-col items-center pb-1 pt-1 text-center"
      >
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-white/45 transition-colors group-hover:text-neon">
          Tools
        </span>
        <span className="mt-0.5 h-0.5 w-4 rounded-full bg-white/20 transition-all group-hover:w-6 group-hover:bg-neon" />
      </a>

      {/* Lista de cuadritos con logo animado y globito explicativo hacia la izquierda */}
      <ul className="flex flex-col gap-1.5">
        {HERRAMIENTAS.map((item) => {
          const Logo = item.Logo;
          const esActual = pagina === item.pagina || (item.pagina === 'blender' && pagina === 'vincular');

          return (
            <li key={item.id} className="cuadrito-lateral group relative">
              <a
                href={item.href}
                aria-current={esActual ? 'page' : undefined}
                aria-label={`${item.titulo}: ${item.descripcion}`}
                className={`corte-poly-sm cuadrito-lateral__boton flex h-10 w-10 items-center justify-center border transition-all ${
                  esActual
                    ? item.activoClase
                    : `border-white/10 bg-base/80 text-white/80 ${item.borde} hover:bg-superficie`
                }`}
              >
                <Logo className="cuadrito-lateral__logo h-5 w-5" />
              </a>

              {/* Globito explicativo flotante hacia la izquierda */}
              <div
                role="tooltip"
                className="cuadrito-lateral__globo corte-poly pointer-events-none absolute right-full top-1/2 z-40 mr-3 w-72 -translate-y-1/2 border border-white/15 bg-superficie/95 p-3.5 shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-start gap-3">
                  <span className="hexagono grid h-10 w-11 shrink-0 place-items-center bg-black/50">
                    <Logo className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className={`block font-mono text-[10px] font-bold uppercase tracking-wider ${item.acento}`}>
                      {item.etiqueta}
                    </span>
                    <strong className="block text-sm font-extrabold text-white">
                      {item.titulo}
                    </strong>
                    <span className="block text-[11px] font-semibold text-white/55">
                      {item.paraQuien}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-texto/80 border-t border-white/5 pt-2">
                  {item.descripcion}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neon">
                  <span>Haz clic para abrir</span>
                  <span aria-hidden="true">▸</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default BarraLateralHerramientas;
