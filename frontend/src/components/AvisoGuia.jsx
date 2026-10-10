// Invitación a la guía de primeros pasos (#/guia) para quien aún no la
// termina. Desaparece al completarla; la guía sigue a mano con el «?» de la
// barra superior.
import { useState } from 'react';
import { CAPITULOS } from '../data/guia';
import { leerGuia } from '../guia/estado';
import { rutas } from '../rutas';
import { CristalLogo } from './Iconos';

function AvisoGuia({ className = '' }) {
  const [estado] = useState(() => leerGuia(CAPITULOS.length));
  if (estado.completada) return null;
  const empezada = estado.superados.length > 0;

  return (
    <aside
      className={`corte-poly-sm flex flex-col gap-4 border border-neon/30 bg-gradient-to-r from-neon/10 via-superficie/95 to-superficie/95 p-4 sm:flex-row sm:items-center ${className}`}
      aria-label="Guía de primeros pasos"
    >
      <span className="hexagono grid h-12 w-14 shrink-0 place-items-center bg-base">
        <CristalLogo className="h-7 w-7" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon">
          {empezada ? `Guía: ${estado.superados.length} de ${CAPITULOS.length} capítulos` : '¿Primera vez en Amatista?'}
        </p>
        <p className="font-bold text-white">
          {empezada ? 'Termina la guía de primeros pasos' : 'Empieza por la guía de primeros pasos'}
        </p>
        <p className="mt-0.5 text-sm text-texto/70">
          Unos 6 minutos: cómo se completa una lección, dónde ves tu avance y cómo conectar Blender con el add-on.
        </p>
      </div>
      <a
        href={rutas.guia}
        className="corte-poly-sm destello shrink-0 bg-neon px-4 py-2.5 text-center font-mono text-xs font-bold uppercase tracking-widest text-base hover:brightness-110"
      >
        {empezada ? 'Seguir la guía ▸' : 'Ver la guía ▸'}
      </a>
    </aside>
  );
}

export default AvisoGuia;
