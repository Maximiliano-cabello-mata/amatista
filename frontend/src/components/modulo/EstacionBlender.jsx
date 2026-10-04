// La estación «Práctica en Blender» con la que cierra cada módulo (v3.1).
// Bloqueada hasta terminar las lecciones del módulo; abierta, lleva a la
// lección de la práctica; hecha, muestra el logro.
import { rutas } from '../../rutas';
import { IconoCandado } from '../Iconos';
import { IconoCubo, IconoGuia } from '../etiquetas/IconosEtiqueta';

const TEXTO_ESTADO = {
  bloqueada: (faltan) => `Termina ${faltan === 1 ? 'la lección que falta' : `las ${faltan} lecciones`} del módulo para abrirla.`,
  abierta: () => 'Ya terminaste las lecciones: ahora llévalo a Blender. Amatista te guía paso a paso.',
  hecha: () => '¡Práctica completada en Blender!',
};

function EstacionBlender({ cursoId, estado }) {
  if (!estado) return null;
  const { practica, faltan } = estado;
  const { leccion, bloque } = practica;
  const abierta = estado.estado !== 'bloqueada';
  const pasos = bloque?.steps?.length ?? 0;
  const minutos = bloque?.minutes ?? (leccion.durationSeconds ? Math.round(leccion.durationSeconds / 60) : null);

  const contenido = (
    <>
      <span
        className={`hexagono grid h-14 w-16 shrink-0 place-items-center ${
          estado.estado === 'hecha' ? 'bg-emerald-400 text-base' : abierta ? 'bg-blender text-base' : 'bg-[#2a2a2a] text-white/35'
        }`}
      >
        {abierta ? <IconoCubo className="h-7 w-7" /> : <IconoCandado className="h-5 w-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-blender">
          Práctica en Blender · cierre del módulo
        </span>
        <span className={`mt-0.5 block text-lg font-extrabold ${abierta ? 'text-white' : 'text-white/50'}`}>
          {bloque?.title ?? leccion.title}
        </span>
        <span className="mt-1 block text-sm text-texto/70">{TEXTO_ESTADO[estado.estado](faltan)}</span>
        <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-white/45">
          {pasos > 0 && <span>{pasos} pasos</span>}
          {minutos && <span>≈ {minutos} min</span>}
          <span className="inline-flex items-center gap-1 text-neon/80">
            <IconoGuia className="h-3 w-3" /> Guía paso a paso
          </span>
        </span>
      </span>
      <span
        className={`hidden shrink-0 font-mono text-xs font-bold uppercase tracking-widest sm:inline ${
          estado.estado === 'abierta' ? 'animar-pulso text-blender' : 'text-white/40'
        }`}
      >
        {estado.estado === 'hecha' ? 'Repasar' : abierta ? 'Practicar ▶' : 'Bloqueada'}
      </span>
    </>
  );

  const clase = `corte-poly-sm mt-4 flex items-center gap-4 border p-4 ${
    estado.estado === 'abierta'
      ? 'border-blender/60 bg-blender/10 transition hover:bg-blender/15'
      : estado.estado === 'hecha'
        ? 'border-emerald-400/30 bg-emerald-400/5 transition hover:bg-emerald-400/10'
        : 'border-dashed border-white/10 bg-black/20'
  }`;

  return abierta ? (
    <a href={rutas.leccion(cursoId, leccion.id)} className={clase}>
      {contenido}
    </a>
  ) : (
    <div className={clase} aria-disabled="true">
      {contenido}
    </div>
  );
}

export default EstacionBlender;
