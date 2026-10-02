import { IconoGaleria, IconoTrofeo, IconoTutor } from './IconosPanel';

const FUNCIONES = [
  {
    id: 'tutor',
    titulo: 'Tutor IA',
    descripcion: 'Pistas sobre la lección y tus dudas, sin darte la respuesta.',
    Icono: IconoTutor,
  },
  {
    id: 'galeria',
    titulo: 'Galería de proyectos',
    descripcion: 'Comparte tus modelos y escenas, y mira lo que crean otros.',
    Icono: IconoGaleria,
  },
  {
    id: 'comunidad',
    titulo: 'Retos de la comunidad',
    descripcion: 'Retos de creación abiertos a todos, con insignias especiales.',
    Icono: IconoTrofeo,
  },
];

// Lugares reservados para lo que viene: discretos y sin interacción.
function Proximamente({ className = '' }) {
  return (
    <section aria-labelledby="panel-proximamente" className={`min-w-0 ${className}`}>
      <h2 id="panel-proximamente" className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-white/45">
        Próximamente en tu panel
      </h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {FUNCIONES.map(({ id, titulo, descripcion, Icono }) => (
          <li key={id} className="corte-poly-sm flex items-start gap-3 border border-dashed border-white/10 bg-superficie/40 p-4">
            <Icono className="h-7 w-7 shrink-0 text-white/30" />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-semibold text-white/65">
                {titulo}
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">Pronto</span>
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
