import { CristalLogo } from '../Iconos';
import IconoLeccion from './IconosLeccion';
import Markdown, { TextoEnLinea } from './Markdown';

const ESTILOS = {
  dato: { borde: 'border-neon/40', fondo: 'bg-neon/5', titulo: 'text-neon' },
  reto: { borde: 'border-blender/50', fondo: 'bg-blender/5', titulo: 'text-blender' },
};

// «En la industria» (variant: estudio, 2026-10-23): cómo se usa esto hoy en un estudio o una
// empresa. Es lectura opcional y va plegada: quien quiere avanzar no tiene que leerla, y quien
// la abre encuentra algo que vale la pena (no relleno).
function AvisoEstudio({ title, body }) {
  return (
    <details className="aviso-estudio corte-poly group border border-amatista/40 bg-gradient-to-br from-amatista/10 to-superficie/80">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 sm:p-5">
        <IconoLeccion nombre="empresa" className="h-9 w-9 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-amatista-claro">En la industria · lectura opcional</span>
          <span className="block font-bold text-white">{title}</span>
        </span>
        <span className="shrink-0 font-mono text-xs text-white/50 transition-transform group-open:rotate-90" aria-hidden="true">
          ▸
        </span>
      </summary>
      <div className="border-t border-white/5 px-4 pb-4 pt-3 text-texto/85 sm:px-5">
        <Markdown texto={body} />
      </div>
    </details>
  );
}

// Recuadro destacado: "¿Sabías que…?", "Reto" o "En la industria".
function Aviso({ variant = 'dato', title, body }) {
  if (variant === 'estudio') return <AvisoEstudio title={title} body={body} />;
  const estilo = ESTILOS[variant] ?? ESTILOS.dato;
  return (
    <aside className={`corte-poly flex gap-4 border ${estilo.borde} ${estilo.fondo} p-5`}>
      {variant === 'reto' ? (
        <IconoLeccion nombre="reto" className="h-10 w-10 shrink-0" />
      ) : (
        <CristalLogo className="h-10 w-10 shrink-0" />
      )}
      <div>
        <p className={`mb-1 font-mono text-xs font-bold uppercase tracking-widest ${estilo.titulo}`}>{title}</p>
        <p className="leading-relaxed text-texto/85">
          <TextoEnLinea texto={body} />
        </p>
      </div>
    </aside>
  );
}

export default Aviso;
