// La ventana de Blender en esquema (motor 6.1): cada zona es un botón. Lo usan las fichas de
// herramientas y el bloque «blender_mapa» para que el alumno sepa dónde está cada cosa antes de
// abrir Blender (y Blender, al estrenar la herramienta, hace brillar la misma zona).
// marcas: {zonaId: 'brilla' | 'visitada' | 'acierto' | 'fallo'}.
import { PLANO, ZONAS } from './fichas';

const ESTILO = {
  brilla: 'border-neon bg-neon/20 text-white animar-acierto',
  visitada: 'border-amatista/60 bg-amatista/15 text-white/90',
  acierto: 'border-emerald-400 bg-emerald-400/20 text-white',
  fallo: 'border-blender bg-blender/15 text-white animar-sacudir',
};

function MapaBlender({ marcas = {}, alTocar, desactivado = false, compacto = false, etiqueta = 'Ventana de Blender' }) {
  return (
    <div
      role="group"
      aria-label={etiqueta}
      className={`corte-poly-sm grid w-full grid-cols-12 gap-1 border border-white/10 bg-black/40 p-1.5 ${compacto ? 'h-44' : 'h-64 sm:h-72'}`}
      style={{ gridTemplateRows: 'repeat(8, minmax(0, 1fr))' }}
    >
      {ZONAS.map((z) => {
        const lugar = PLANO[z.id];
        const marca = marcas[z.id];
        return (
          <button
            key={z.id}
            type="button"
            onClick={() => alTocar?.(z.id)}
            disabled={desactivado || !alTocar}
            aria-pressed={marca === 'brilla' || marca === 'acierto' ? true : undefined}
            aria-label={`${z.nombre} (${z.ingles})`}
            title={z.nombre}
            data-marca={marca}
            style={{
              gridColumn: lugar.col,
              gridRow: lugar.fila,
              // Las columnas angostas (herramientas, panel lateral) se leen de abajo hacia arriba.
              ...(lugar.vertical ? { writingMode: 'vertical-rl', transform: 'rotate(180deg)' } : {}),
            }}
            className={`min-h-0 min-w-0 overflow-hidden rounded-[3px] border px-1 text-left font-mono text-[10px] leading-tight transition-colors disabled:cursor-default sm:text-[11px] ${
              ESTILO[marca] ?? 'border-white/15 bg-white/5 text-white/60 enabled:hover:border-neon/60 enabled:hover:bg-neon/10'
            }`}
          >
            <span className={`block truncate ${lugar.vertical ? 'py-1' : ''}`}>{z.nombre}</span>
          </button>
        );
      })}
    </div>
  );
}

export default MapaBlender;
