import { IconoGaleria, IconoTrofeo, IconoTutor } from './IconosPanel';

const FUNCIONES = [
  {
    id: 'blender',
    titulo: 'Tu práctica en Blender',
    descripcion: 'Cierra cada módulo con práctica guiada y revisión del instructor dentro de Blender.',
    Icono: IconoTutor,
  },
  {
    id: 'progreso',
    titulo: 'Tu progreso',
    descripcion: 'Sigue tu constancia, tus lecciones completadas y tu avance por curso en tiempo real.',
    Icono: IconoGaleria,
  },
  {
    id: 'logros',
    titulo: 'Tus logros',
    descripcion: 'Desbloquea insignias y retos al sostener tu ritmo de aprendizaje.',
    Icono: IconoTrofeo,
  },
];

// Resumen breve de capacidades activas del panel, sin promesas de funciones no cerradas.
function Proximamente({ className = '' }) {
  return (
    <section aria-labelledby="panel-proximamente" className={`min-w-0 ${className}`}>
      <h2 id="panel-proximamente" className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-white/45">
        Enfoque de aprendizaje
      </h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {FUNCIONES.map(({ id, titulo, descripcion, Icono }) => (
          <li key={id} className="corte-poly-sm flex items-start gap-3 border border-dashed border-white/10 bg-superficie/40 p-4">
            <Icono className="h-7 w-7 shrink-0 text-white/30" />
            <div className="min-w-0">
              <p className="font-semibold text-white/65">
                {titulo}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-white/40">{descripcion}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Proximamente;
