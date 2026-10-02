import { useId, useState } from 'react';
import { TextoEnLinea } from '../Markdown';
import { useActividad } from './hooks';
import { textoPlano } from './logica';
import { BOTON_SECUNDARIO, MarcoActividad } from './Marco';

// Imagen con puntos numerados (posición en % del ancho y alto). Cada punto
// abre su explicación en el panel; se completa al abrirlos todos.
function PuntosImagen({ bloque, alCompletar, resuelta }) {
  const { points: puntos } = bloque;
  const idPanel = useId();
  const [activo, setActivo] = useState(null);
  const [vistos, setVistos] = useState([]);
  const { resultado, resolver } = useActividad(alCompletar);

  const abrir = (id) => {
    setActivo(id);
    if (vistos.includes(id)) return;
    const nuevos = [...vistos, id];
    setVistos(nuevos);
    // Explorar no tiene respuestas incorrectas: siempre es "a la primera".
    if (nuevos.length === puntos.length) resolver(true, 1);
  };

  const indiceActivo = puntos.findIndex((punto) => punto.id === activo);
  const punto = puntos[indiceActivo];
  // "Siguiente": el próximo sin ver; si ya se vieron todos, el que sigue en orden.
  const siguiente =
    puntos.find((p, i) => i > indiceActivo && !vistos.includes(p.id)) ??
    puntos.find((p) => !vistos.includes(p.id)) ??
    puntos[(indiceActivo + 1) % puntos.length];
  const todos = vistos.length === puntos.length;

  return (
    <MarcoActividad
      bloque={bloque}
      titulo={bloque.title ?? 'Toca cada punto numerado para descubrir qué es'}
      resultado={resultado}
      resuelta={resuelta}
    >
      <div className="mb-3 flex justify-end font-mono text-xs uppercase tracking-widest">
        <span className={todos ? 'text-emerald-400' : 'text-white/50'}>
          {todos ? '✓ Todos descubiertos' : `Descubiertos ${vistos.length} / ${puntos.length}`}
        </span>
      </div>

      <div className="corte-poly relative overflow-hidden border border-white/10 bg-black">
        <img
          src={import.meta.env.BASE_URL + bloque.src}
          alt={bloque.alt}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full select-none"
          draggable={false}
        />
        {puntos.map((p, i) => {
          const visto = vistos.includes(p.id);
          const esActivo = p.id === activo;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => abrir(p.id)}
              aria-pressed={esActivo}
              aria-controls={idPanel}
              aria-label={`Punto ${i + 1}: ${textoPlano(p.title)}${visto ? ' (visto)' : ''}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className="group absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
            >
              {!visto && <span className="hexagono animar-pulso absolute inset-0 bg-neon/45" aria-hidden="true" />}
              <span
                className={`hexagono relative grid h-8 w-8 place-items-center font-mono text-sm font-bold shadow-lg transition-transform group-hover:scale-110 ${
                  esActivo ? 'scale-110 bg-neon text-[#121212]' : visto ? 'bg-amatista text-white' : 'bg-white text-[#121212]'
                }`}
              >
                {visto && !esActivo ? '✓' : i + 1}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={idPanel}
        aria-live="polite"
        className="corte-poly-sm mt-4 min-h-28 border border-white/10 bg-base/60 p-4 sm:p-5"
      >
        {punto ? (
          <div key={punto.id} className="animar-entrar">
            <p className="font-mono text-[11px] uppercase tracking-widest text-neon">
              Punto {indiceActivo + 1} de {puntos.length}
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              <TextoEnLinea texto={punto.title} />
            </p>
            <p className="mt-2 leading-relaxed text-texto/85">
              <TextoEnLinea texto={punto.text} />
            </p>
            {puntos.length > 1 && (
              <button type="button" onClick={() => abrir(siguiente.id)} className={`${BOTON_SECUNDARIO} mt-4`}>
                {todos ? 'Siguiente punto ▸' : 'Siguiente sin ver ▸'}
              </button>
            )}
          </div>
        ) : (
          <p className="text-texto/70">
            Toca los puntos numerados de la imagen (o recórrelos con la tecla Tab) para descubrir qué hay en cada uno.
          </p>
        )}
      </div>
    </MarcoActividad>
  );
}

export default PuntosImagen;
