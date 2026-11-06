// Tus programas (Mi panel): tu avance en cada software libre que enseña
// Amatista (Blender y A-Frame) y su herramienta de práctica, uno junto al otro.
import { useMemo } from 'react';
import { agruparPorRuta, resumenRuta } from '../../catalogo/agrupar';
import { SOFTWARE } from '../../data/software';
import { rutas } from '../../rutas';
import LogoSoftware from '../LogoSoftware';
import Seccion from './Seccion';

function ProgramasPanel({ progreso, cursos, className = '' }) {
  const rutasPorId = useMemo(() => Object.fromEntries(agruparPorRuta(cursos).map((ruta) => [ruta.id, ruta])), [cursos]);
  return (
    <Seccion id="panel-programas" etiqueta="Software libre" titulo="Tu avance en cada programa" className={className}>
      <ul className="grid gap-3 sm:grid-cols-2">
        {SOFTWARE.map((software) => {
          const ruta = software.ruta ? rutasPorId[software.ruta] : null;
          const resumen = ruta ? resumenRuta(progreso, ruta) : null;
          const disponible = software.estado === 'disponible' && resumen;
          return (
            <li
              key={software.id}
              className={`corte-poly-sm flex min-w-0 flex-col border p-4 ${disponible ? 'border-white/10 bg-base/60' : 'border-dashed border-white/15 bg-base/30'}`}
            >
              <p className="flex items-center gap-3">
                <LogoSoftware software={software} className="h-8 w-9 shrink-0 text-xs" />
                <span className="min-w-0">
                  <span className="block font-extrabold text-white">{software.nombre}</span>
                  <span className="block truncate text-xs text-white/50">{software.lema}</span>
                </span>
              </p>
              {disponible ? (
                <>
                  <p className="mt-3 flex justify-between font-mono text-[11px] uppercase tracking-widest text-white/50">
                    <span>{resumen.porcentaje}%</span>
                    <span>
                      {resumen.completadas} / {resumen.total} lecciones
                    </span>
                  </p>
                  <div
                    className="mt-1 h-1.5 overflow-hidden bg-white/10"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={resumen.total}
                    aria-valuenow={resumen.completadas}
                    aria-label={`Avance en ${software.nombre}`}
                  >
                    <div className="h-full bg-neon" style={{ width: `${resumen.porcentaje}%` }} />
                  </div>
                  <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] font-bold uppercase tracking-widest">
                    <a href={rutas.curso(software.ruta)} className="text-neon hover:underline">
                      {resumen.completadas ? 'Continuar' : 'Empezar'} ▸
                    </a>
                    {software.herramienta && (
                      <a href={software.herramienta.href} className="text-white/60 hover:text-neon">
                        {software.herramienta.nombre}
                      </a>
                    )}
                  </p>
                </>
              ) : (
                <a href={`${rutas.inicio}?programa=${software.id}`} className="mt-3 font-mono text-[11px] font-bold uppercase tracking-widest text-amber-200 hover:underline">
                  Pronto · ver qué enseñará
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </Seccion>
  );
}

export default ProgramasPanel;
