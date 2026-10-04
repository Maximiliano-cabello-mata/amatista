// Una estación «En Blender» dentro del módulo (v3.2). Teoría y Blender se
// intercalan: la exploración corta va entre dos lecciones de teoría y la
// práctica de cierre al final. Bloqueada hasta terminar lo anterior;
// abierta, lleva a la lección; hecha, muestra el logro. Todas se hacen con
// Blender conectado y quedan registradas en la cuenta y en el motor.
import { rutas } from '../../rutas';
import { IconoCandado } from '../Iconos';
import { IconoCubo, IconoGuia } from '../etiquetas/IconosEtiqueta';
import LogoCurso from '../LogoCurso';

const TEXTO_ESTADO = {
  bloqueada: (faltan) => `Termina ${faltan === 1 ? 'la lección anterior' : `las ${faltan} lecciones anteriores`} para abrirla.`,
  abierta: (_, cierre) =>
    cierre
      ? 'Ya terminaste la teoría: ahora llévalo a Blender. Amatista te guía paso a paso.'
      : 'Abre Blender y pruébalo con tus manos: unos minutos, conectado a Amatista.',
  hecha: () => '¡Hecha en Blender y registrada en tu cuenta!',
};

function EstacionBlender({ cursoId, estado, comoElemento = 'div' }) {
  if (!estado) return null;
  const { practica, faltan } = estado;
  const { leccion, bloque, cierre = true } = practica;
  const abierta = estado.estado !== 'bloqueada';
  const pasos = bloque?.steps?.length ?? 0;
  const minutos = bloque?.minutes ?? (leccion.durationSeconds ? Math.round(leccion.durationSeconds / 60) : null);

  const contenido = (
    <>
      <span
        className={`hexagono grid shrink-0 place-items-center ${cierre ? 'h-14 w-16' : 'h-12 w-14'} ${
          estado.estado === 'hecha' ? 'bg-emerald-400 text-base' : abierta ? 'bg-blender text-base' : 'bg-[#2a2a2a] text-white/35'
        }`}
      >
        {!abierta ? (
          <IconoCandado className="h-5 w-5" />
        ) : cierre ? (
          <IconoCubo className="h-7 w-7" />
        ) : (
          <LogoCurso logo="blender" className="h-6 w-7" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-blender">
          {cierre ? 'Práctica en Blender · cierre del módulo' : 'En Blender · exploración'}
        </span>
        <span className={`mt-0.5 block font-extrabold ${cierre ? 'text-lg' : 'text-base'} ${abierta ? 'text-white' : 'text-white/50'}`}>
          {bloque?.title ?? leccion.title}
        </span>
        <span className="mt-1 block text-sm text-texto/70">{TEXTO_ESTADO[estado.estado](faltan, cierre)}</span>
        <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-white/45">
          {pasos > 0 && <span>{pasos} pasos</span>}
          {minutos && <span>≈ {minutos} min</span>}
          <span className="inline-flex items-center gap-1 text-neon/80">
            <IconoGuia className="h-3 w-3" /> Guía paso a paso
          </span>
          <span className="text-emerald-300/80">● Se registra</span>
        </span>
      </span>
      <span
        className={`hidden shrink-0 font-mono text-xs font-bold uppercase tracking-widest sm:inline ${
          estado.estado === 'abierta' ? 'animar-pulso text-blender' : 'text-white/40'
        }`}
      >
        {estado.estado === 'hecha' ? 'Repasar' : abierta ? 'A Blender ▶' : 'Bloqueada'}
      </span>
    </>
  );

  const clase = `corte-poly-sm relative z-10 flex items-center gap-4 border p-4 ${cierre ? '' : 'sm:ml-6'} ${
    estado.estado === 'abierta'
      ? 'border-blender/60 bg-blender/10 transition hover:bg-blender/15'
      : estado.estado === 'hecha'
        ? 'border-emerald-400/30 bg-emerald-400/5 transition hover:bg-emerald-400/10'
        : 'border-dashed border-white/15 bg-[#191919]'
  }`;

  const Contenedor = comoElemento;
  return abierta ? (
    <a href={rutas.leccion(cursoId, leccion.id)} className={clase}>
      {contenido}
    </a>
  ) : (
    <Contenedor className={clase} aria-disabled="true">
      {contenido}
    </Contenedor>
  );
}

export default EstacionBlender;
