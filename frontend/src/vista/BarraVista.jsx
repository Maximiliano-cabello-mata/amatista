// Franja para el equipo, debajo de la barra superior: en qué vista está y un
// botón para cambiarla. En la vista de alumno es la única forma de volver a
// Admin (la pestaña se oculta para ver la plataforma tal como la ve un alumno).
import { rutas } from '../rutas';
import { useVista } from './contexto';

function BarraVista({ pagina }) {
  const { equipo, comoAlumno, cambiarModo } = useVista();
  if (!equipo || pagina === 'admin') return null;

  return (
    <div
      role="region"
      aria-label="Vista del equipo"
      className={`border-b ${comoAlumno ? 'border-neon/30 bg-neon/10' : 'border-amatista/30 bg-amatista/15'}`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
        <p className="text-sm text-white/85">
          {comoAlumno ? (
            <>
              <strong className="text-neon">Vista de alumno.</strong> Ves la plataforma igual que un alumno, con sus candados.
            </>
          ) : (
            <>
              <strong className="text-amatista-claro">Vista de administrador.</strong> Todas las lecciones están abiertas para
              revisar; tu avance es solo tuyo.
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cambiarModo(comoAlumno ? 'admin' : 'alumno')}
            className="corte-poly-sm bg-white/10 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white hover:bg-white/20"
          >
            {comoAlumno ? 'Volver a vista de administrador' : 'Ver como alumno'}
          </button>
          {comoAlumno && (
            <a
              href={rutas.adminRevision}
              onClick={() => cambiarModo('admin')}
              className="corte-poly-sm bg-amatista px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white hover:brightness-110"
            >
              Ir a Admin
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default BarraVista;
