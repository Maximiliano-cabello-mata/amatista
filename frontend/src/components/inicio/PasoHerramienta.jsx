import LogoSoftware from '../LogoSoftware';
import { rutas } from '../../rutas';

export default function PasoHerramienta({ software, alInicio }) {
  const herramienta = software.herramienta;
  if (!herramienta) return null;
  if (software.id === 'blender' && alInicio) {
    return (
      <div className="mb-5 grid gap-2.5 sm:grid-cols-2">
        <a
          href={herramienta.href}
          className="corte-poly-sm elevar flex items-center gap-3 border border-blender/45 bg-blender/10 p-3.5 transition-colors hover:border-blender sm:p-4"
        >
          <span className="hexagono grid h-11 w-12 shrink-0 place-items-center bg-black/40">
            <LogoSoftware software={software} className="h-6 w-7 text-[11px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-blender">
              Opción A · En tu ordenador (una sola vez)
            </span>
            <span className="block font-extrabold text-white">Conectar mi Blender ({herramienta.nombre})</span>
            <span className="mt-0.5 block text-xs leading-snug text-texto/75">
              Descarga el complemento y vincula tu Blender para que te guíe en cada práctica.
            </span>
          </span>
          <span className="shrink-0 font-mono text-xs font-bold uppercase tracking-widest text-blender">Conectar ▸</span>
        </a>

        <div className="grid gap-2">
          <a
            href={rutas.nube}
            className="corte-poly-sm elevar flex items-center justify-between gap-3 border border-neon/40 bg-neon/5 px-3.5 py-2.5 transition-colors hover:border-neon"
          >
            <span className="min-w-0">
              <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-neon">
                <span>Opción B · Sin instalar</span>
                <span className="border border-neon/40 bg-neon/15 px-1.5 py-0.2 text-[9px]">UTN</span>
              </span>
              <span className="block text-sm font-extrabold text-white">Abrir Blender en la nube</span>
            </span>
            <span className="shrink-0 font-mono text-xs font-bold uppercase tracking-widest text-neon">Abrir ▸</span>
          </a>

          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-white/55">
            <a href={rutas.geoda} className="hover:text-emerald-300 hover:underline">
              ¿No sabes si tu PC corre Blender? Revísala con Geoda ▸
            </a>
            <a href={rutas.biblioteca} className="hover:text-amatista-claro hover:underline">
              Biblioteca 3D ▸
            </a>
          </div>
        </div>
      </div>
    );
  }
  return (
    <a
      href={herramienta.href}
      className={`corte-poly-sm elevar flex items-center gap-3 border border-dashed p-3 sm:p-4 ${
        software.acento === 'blender' ? 'border-blender/40 bg-blender/5 hover:border-blender' : 'border-neon/40 bg-neon/5 hover:border-neon'
      } ${alInicio ? 'mb-4' : 'mt-4'}`}
    >
      <span className="hexagono grid h-11 w-12 shrink-0 place-items-center bg-black/40">
        <LogoSoftware software={software} className="h-6 w-7 text-[11px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[11px] uppercase tracking-widest text-white/50">{alInicio ? 'Antes del paso 1 · una sola vez' : 'Cuando quieras · crea libre'}</span>
        <span className="block font-extrabold text-white">{herramienta.nombre}</span>
        <span className="block text-sm text-texto/70">
          {alInicio
            ? 'Instala Blender y el add-on, y conecta tu cuenta. La página te lleva de la mano: no tienes que programar.'
            : 'Arma tu propia escena con plantillas y piezas, mírala al instante y descárgala como página web.'}
        </span>
      </span>
      <span className="shrink-0 font-mono text-xs font-bold uppercase tracking-widest text-white/70">{herramienta.texto} ▸</span>
    </a>
  );
}
