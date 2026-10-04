// Ruta del módulo (v3.1): una línea con un nodo por lección y la práctica en
// Blender al final, como estación grande. Se lee de un vistazo: qué tipo de
// lecciones tiene el módulo, por dónde va el alumno y que cierra en Blender.
// Sin progreso (panel admin) muestra solo la estructura.
import { estaCompletada } from '../../progreso/reglas';
import { esPracticaBlender } from '../../modulos/practica';
import { etiquetaLeccion } from '../etiquetas/catalogo';

const ESTILO_NODO = {
  hecha: 'bg-emerald-400 text-base',
  actual: 'bg-neon text-base animar-pulso',
  pendiente: 'bg-white/10 text-white/55',
};

function RutaModulo({ lecciones = [], progreso = null, cursoId = '', className = '' }) {
  if (!lecciones.length) return null;
  const hechas = lecciones.map((leccion) => (progreso ? estaCompletada(progreso, cursoId, leccion) : false));
  const actual = progreso ? hechas.findIndex((hecha) => !hecha) : -1;
  return (
    <ol className={`flex items-center gap-0 ${className}`} aria-label="Ruta del módulo">
      {lecciones.map((leccion, i) => {
        const practica = esPracticaBlender(leccion);
        const { Icono, texto } = etiquetaLeccion(leccion, practica);
        const estado = hechas[i] ? 'hecha' : i === actual ? 'actual' : 'pendiente';
        const tam = practica ? 'h-8 w-9' : 'h-6 w-7';
        const color = practica && estado === 'pendiente' ? 'bg-blender/25 text-blender' : ESTILO_NODO[estado];
        return (
          <li key={leccion.id} className="flex items-center" title={`${leccion.title} · ${texto}`}>
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`h-0.5 w-3 sm:w-5 ${hechas[i - 1] ? 'bg-emerald-400/60' : 'bg-white/10'} ${practica ? 'border-t border-dashed border-blender/60 bg-transparent' : ''}`}
              />
            )}
            <span className={`hexagono grid shrink-0 place-items-center ${tam} ${color}`}>
              <Icono className={practica ? 'h-4 w-4' : 'h-3 w-3'} />
              <span className="sr-only">
                {leccion.title} ({texto}, {estado === 'hecha' ? 'completada' : estado === 'actual' ? 'siguiente' : 'pendiente'})
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default RutaModulo;
