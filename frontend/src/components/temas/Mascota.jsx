// Mascota de cada temática (v3.3): un personaje original de Amatista en
// pixel art, al estilo de los videojuegos retro, que dice qué hacer y cuenta
// datos curiosos. Sus textos vienen de practices/blender/temas.json (los
// mismos que muestra el add-on en Blender).
import { useEffect, useState } from 'react';
import { SPRITES } from './sprites';
import { Paseo } from './Personaje';
import { mensajesDeMascota } from './temas';

// Los ojos (píxeles oscuros de la mitad de arriba) van en su propia capa: el
// personaje parpadea y mira hacia el puntero (Personaje.jsx, --mirar-x/y).
export function SpriteMascota({ tema, className = '' }) {
  const filas = SPRITES[tema?.id] ?? SPRITES.cristal;
  const c = tema?.colores ?? {};
  const color = { a: c.acento ?? '#B57EDC', s: c.suave ?? '#E2C6F5', k: '#121212', w: '#ffffff', o: '#F5792A' };
  const cuerpo = [];
  const ojos = [];
  filas.forEach((fila, y) =>
    [...fila].forEach((p, x) => {
      if (p === '.') return;
      const pixel = <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={color[p]} />;
      (p === 'k' && y < 6 ? ojos : cuerpo).push(pixel);
    }),
  );
  return (
    <svg viewBox="0 0 10 10" className={`[image-rendering:pixelated] overflow-visible ${className}`} shapeRendering="crispEdges" aria-hidden="true">
      {cuerpo}
      <g className="sprite__mirada">
        <g className="sprite__ojos">{ojos}</g>
      </g>
    </svg>
  );
}

const ETIQUETA = { hola: 'dice', consejo: 'te aconseja', charla: 'platica', dato: '· dato curioso' };

// Globo de diálogo: saluda y luego alterna consejos, charla y datos curiosos.
// Con `paseo`, el personaje camina por su carril encima del globo y, al
// tocarlo, reacciona y cuenta otra cosa.
function Mascota({ tema, className = '', automatico = true, inicial = 0, paseo = false }) {
  const mascota = tema?.mascota;
  const mensajes = mensajesDeMascota(mascota);
  const [indice, setIndice] = useState(inicial);

  useEffect(() => {
    if (!automatico || mensajes.length < 2) return undefined;
    const reloj = setInterval(() => setIndice((i) => i + 1), 14000);
    return () => clearInterval(reloj);
  }, [automatico, mensajes.length]);

  if (!mascota || mensajes.length === 0) return null;
  const mensaje = mensajes[indice % mensajes.length];
  return (
    <figure className={`flex items-end gap-3 ${paseo ? 'flex-col items-stretch' : ''} ${className}`}>
      {paseo ? (
        <Paseo tema={tema} className="h-16" onToque={() => setIndice((i) => i + 1)} etiqueta={`Tocar a ${mascota.nombre}: cuenta otra cosa`} />
      ) : (
        <SpriteMascota tema={tema} className="esc-flotar h-14 w-14 shrink-0 drop-shadow-[0_4px_0_rgba(0,0,0,0.35)]" />
      )}
      <figcaption
        key={indice}
        className="globo animar-aparecer relative min-w-0 flex-1 border border-white/15 bg-base/85 px-4 py-3 text-sm leading-relaxed text-texto/90"
        aria-live="polite"
      >
        <span className="mb-1 flex items-center justify-between gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
          <span style={{ color: tema.colores?.acento }}>
            {mascota.nombre} {ETIQUETA[mensaje.tipo]}
          </span>
          <button
            type="button"
            onClick={() => setIndice((i) => i + 1)}
            className="text-white/50 transition hover:text-white"
            aria-label={`Otro mensaje de ${mascota.nombre}`}
          >
            Otro ▸
          </button>
        </span>
        {mensaje.texto}
      </figcaption>
    </figure>
  );
}

export default Mascota;
