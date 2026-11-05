import { useState } from 'react';
import { IconoCandado } from '../Iconos';
import LogoSoftware from '../LogoSoftware';
import { disciplinaPorId } from '../../data/software';
import { rutas } from '../../rutas';
import Paso from './Paso';
import PasoHerramienta from './PasoHerramienta';
import { horas } from './constantes';

export default function Camino({ camino }) {
  const { software } = camino;
  const [abiertos, setAbiertos] = useState(() => new Set(camino.siguiente ? [camino.siguiente.id] : []));
  const alternar = (id) =>
    setAbiertos((previos) => {
      const nuevos = new Set(previos);
      if (nuevos.has(id)) nuevos.delete(id);
      else nuevos.add(id);
      return nuevos;
    });

  if (!camino.disponible) {
    return (
      <div className="corte-poly-sm border border-dashed border-white/15 bg-superficie/60 p-6 text-center">
        <LogoSoftware software={software} className="mx-auto h-12 w-14 text-base" />
        <p className="mt-3 text-xl font-extrabold text-white">{software.nombre} llega pronto</p>
        <p className="mx-auto mt-2 max-w-xl text-texto/75">{software.descripcion}</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {software.disciplinas.map((id) => (
            <li key={id} className="corte-poly-sm border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-white/60">
              {disciplinaPorId(id)?.nombre ?? id}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-white/50">Mientras tanto, lo que aprendas en Blender te sirve: los conceptos de 3D son los mismos en todos los programas.</p>
      </div>
    );
  }

  const herramientaPrimero = software.id === 'blender';
  return (
    <div>
      {herramientaPrimero && <PasoHerramienta software={software} alInicio />}
      <div className="grid gap-6 [&>*]:min-w-0">
        {camino.niveles.map(({ curso, pasos, hechos, total, minutos }, indice) => (
          <section key={curso.id} aria-labelledby={`nivel-${curso.id}`}>
            <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/5 pb-2">
              <div className="min-w-0">
                <h3 id={`nivel-${curso.id}`} className="text-lg font-extrabold text-white">
                  <span className="mr-2 font-mono text-xs uppercase tracking-widest text-white/40">Nivel {indice + 1}</span>
                  {curso.titulo}
                </h3>
                {curso.para && <p className="text-sm text-texto/65">{curso.para}</p>}
              </div>
              <p className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-white/50">
                {curso.estado === 'bloqueado' ? (
                  <span>Se abre más adelante</span>
                ) : (
                  <>
                    <span>
                      {hechos} / {total} pasos
                    </span>
                    {minutos > 0 && <span>{horas(minutos)}</span>}
                    <a href={rutas.curso(curso.id)} className="boton boton--secundario boton--chico -my-1 normal-case tracking-normal">
                      Ver el curso <span className="boton__flecha" aria-hidden="true">▸</span>
                    </a>
                  </>
                )}
              </p>
            </header>
            {curso.estado === 'bloqueado' ? (
              <p className="corte-poly-sm flex items-center gap-3 border border-dashed border-white/10 bg-superficie/50 p-3 text-sm text-white/55">
                <IconoCandado className="h-4 w-4 shrink-0" />
                <span>Lo que vendrá: {pasos.map((p) => p.titulo).join(' · ')}.</span>
              </p>
            ) : (
              <ol className="camino">
                {pasos.map((paso, i) => (
                  <Paso key={paso.id} paso={paso} abierto={abiertos.has(paso.id)} alternar={() => alternar(paso.id)} ultimo={i === pasos.length - 1} />
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>
      {!herramientaPrimero && <PasoHerramienta software={software} />}
    </div>
  );
}
