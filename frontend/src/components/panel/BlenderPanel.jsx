import { useEffect, useState } from 'react';
import { resumenPractica } from '../../blender/logica';
import { rutas } from '../../rutas';
import { listarDispositivos, listarPracticas } from '../../services/blender';
import Seccion from './Seccion';

// Prácticas dentro de Blender: si el add-on está conectado y cómo van.
// Sin cuenta o sin servidor muestra solo la invitación a instalarlo.
function BlenderPanel({ token, className = '' }) {
  const [datos, setDatos] = useState({ practicas: [], conectados: 0 });

  useEffect(() => {
    if (!token) return undefined;
    let vigente = true;
    Promise.all([listarPracticas(token), listarDispositivos(token)]).then(([practicas, dispositivos]) => {
      if (!vigente) return;
      setDatos({
        practicas: practicas.ok ? practicas.datos.practicas.filter((p) => p.mi_progreso) : [],
        conectados: dispositivos.ok ? dispositivos.datos.dispositivos.length : 0,
      });
    });
    return () => {
      vigente = false;
    };
  }, [token]);

  return (
    <Seccion
      id="panel-blender"
      etiqueta="Amatista para Blender"
      titulo="Prácticas en Blender"
      className={className}
      accion={
        <a href={rutas.blender} className="font-mono text-xs font-bold uppercase tracking-widest text-neon hover:underline">
          {datos.conectados ? `${datos.conectados} Blender conectado${datos.conectados > 1 ? 's' : ''}` : 'Instalar ▸'}
        </a>
      }
    >
      {datos.practicas.length ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {datos.practicas.map((p) => {
            const avance = p.mi_progreso.completada ? 100 : p.mi_progreso.progreso;
            return (
              <li key={p.id} className="corte-poly-sm border border-white/10 bg-base/60 p-3">
                <a href={p.curso_id && p.leccion_id ? rutas.leccion(p.curso_id, p.leccion_id) : rutas.blender} className="block">
                  <p className="font-bold text-white">{p.titulo}</p>
                  <div className="mt-2 h-1.5 overflow-hidden bg-white/10" aria-hidden="true">
                    <div className={`h-full ${avance === 100 ? 'bg-emerald-400' : 'bg-neon'}`} style={{ width: `${avance}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-white/55">{resumenPractica(p.mi_progreso)}</p>
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-texto/75">
          Instala el add-on de Amatista en tu Blender: revisa tu escena mientras trabajas y tus prácticas aparecen aquí.
        </p>
      )}
    </Seccion>
  );
}

export default BlenderPanel;
