import { useEffect, useMemo, useState } from 'react';
import { resumenPractica } from '../../blender/logica';
import { tituloCorto } from '../../data/cursos';
import { practicasDelCatalogo } from '../../modulos/practica';
import { estaCompletada } from '../../progreso/reglas';
import { rutas } from '../../rutas';
import { listarDispositivos, listarPracticas } from '../../services/blender';
import { IconoCubo } from '../etiquetas/IconosEtiqueta';
import Seccion from './Seccion';

// Las prácticas en Blender de tus módulos: las exploraciones y la práctica que
// cierra cada módulo, en el orden del curso. El avance real viene del servidor (lo calcula con la foto
// de la escena); sin cuenta o sin servidor se usa el progreso local.
function BlenderPanel({ token, progreso, cursos, className = '' }) {
  const [datos, setDatos] = useState({ porId: {}, conectados: 0 });
  const practicas = useMemo(() => practicasDelCatalogo(cursos), [cursos]);

  useEffect(() => {
    if (!token) return undefined;
    let vigente = true;
    Promise.all([listarPracticas(token), listarDispositivos(token)]).then(([lista, dispositivos]) => {
      if (!vigente) return;
      setDatos({
        porId: lista.ok ? Object.fromEntries(lista.datos.practicas.map((p) => [p.id, p])) : {},
        conectados: dispositivos.ok ? dispositivos.datos.dispositivos.length : 0,
      });
    });
    return () => {
      vigente = false;
    };
  }, [token]);

  if (!practicas.length) return null;

  return (
    <Seccion
      id="panel-blender"
      etiqueta="Exploraciones y cierres"
      titulo="Prácticas en Blender"
      className={className}
      accion={
        <a href={rutas.blender} className="font-mono text-xs font-bold uppercase tracking-widest text-neon hover:underline">
          {datos.conectados ? `${datos.conectados} Blender conectado${datos.conectados > 1 ? 's' : ''}` : 'Mi Blender ▸'}
        </a>
      }
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {practicas.map(({ curso, modulo, leccion, bloque, cierre }) => {
          const servidor = datos.porId[bloque.practica]?.mi_progreso;
          const hecha = Boolean(servidor?.completada) || estaCompletada(progreso, curso.id, leccion);
          const avance = hecha ? 100 : (servidor?.progreso ?? 0);
          const pendiente = cierre ? 'Se abre al terminar las lecciones del módulo.' : 'Se abre al terminar la lección anterior.';
          return (
            <li key={`${curso.id}:${leccion.id}`} className="corte-poly-sm border border-white/10 bg-base/60 p-3">
              <a href={rutas.leccion(curso.id, leccion.id)} className="flex gap-3">
                <span
                  className={`hexagono grid h-10 w-11 shrink-0 place-items-center ${hecha ? 'bg-emerald-400 text-base' : 'bg-blender/20 text-blender'}`}
                >
                  <IconoCubo className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-white/45">
                    {curso.titulo} · Módulo {modulo.numero} · {tituloCorto(modulo.titulo)}
                  </span>
                  <span className="block truncate font-bold text-white">{bloque.title ?? leccion.title}</span>
                  <span className="mt-2 block h-1.5 overflow-hidden bg-white/10" aria-hidden="true">
                    <span className={`block h-full ${hecha ? 'bg-emerald-400' : 'bg-blender'}`} style={{ width: `${avance}%` }} />
                  </span>
                  <span className="mt-1.5 block text-xs text-white/55">
                    {hecha ? '¡Completada!' : servidor ? resumenPractica(servidor) : pendiente}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </Seccion>
  );
}

export default BlenderPanel;
