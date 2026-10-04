import { useId, useState } from 'react';
import { XP_POR_ACTIVIDAD_PERFECTA } from '../../../progreso/reglas';
import { TextoEnLinea } from '../Markdown';

export const BOTON_PRINCIPAL =
  'corte-poly-sm bg-amatista px-5 py-2.5 font-bold uppercase tracking-widest text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40';
export const BOTON_SECUNDARIO =
  'corte-poly-sm bg-white/5 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-white/75 transition-colors hover:bg-white/10 hover:text-white';

const ETIQUETAS = {
  quiz_inline: 'Pregunta rápida',
  ordering: 'Ordena',
  matching: 'Une las parejas',
  fill_blanks: 'Completa',
  hotspots: 'Explora la imagen',
  scene_explorer: 'Laboratorio 3D',
  code_challenge: 'Reto de código',
  blender_practice: 'Práctica en Blender',
};

// Marco común de las actividades: tipo, estado (pendiente / resuelta), XP
// ganada y el enunciado. `resuelta` viene de la lección (incluye las que el
// alumno resolvió en una visita anterior); `resultado`, de esta visita.
export function MarcoActividad({ bloque, titulo, resultado, resuelta, children }) {
  const idTitulo = useId();
  // Resuelta antes de abrir la lección: no vuelve a dar XP.
  const [previa] = useState(() => Boolean(resuelta));
  const hecha = Boolean(resultado) || Boolean(resuelta);
  const perfecta = resultado?.correcto && resultado.intentos <= 1 && !previa;
  const requerida = bloque.required !== false;
  const etiqueta = ETIQUETAS[bloque.type] ?? 'Actividad';

  let estado = 'Pendiente';
  if (hecha) estado = '✓ Resuelta';
  else if (!requerida) estado = 'Opcional';

  return (
    <section
      aria-labelledby={titulo ? idTitulo : undefined}
      aria-label={titulo ? undefined : etiqueta}
      className={`corte-poly border p-5 transition-colors duration-500 sm:p-7 ${
        hecha ? 'border-emerald-400/35 bg-superficie/95' : 'border-amatista/40 bg-superficie/95'
      }`}
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-widest">
        <span className="flex items-center gap-2 text-neon">
          <span className="hexagono inline-block h-3 w-3 bg-neon" aria-hidden="true" />
          {etiqueta}
        </span>
        <span className="flex items-center gap-2">
          {perfecta && (
            <span className="corte-poly-sm animar-acierto bg-neon/15 px-2.5 py-1 font-bold text-neon">
              +{XP_POR_ACTIVIDAD_PERFECTA} XP
            </span>
          )}
          <span
            className={`corte-poly-sm px-2.5 py-1 ${
              hecha ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-white/55'
            }`}
          >
            {estado}
          </span>
        </span>
      </header>
      {titulo && (
        <h3 id={idTitulo} className="text-xl font-bold leading-snug text-white sm:text-2xl">
          <TextoEnLinea texto={titulo} />
        </h3>
      )}
      {previa && !resultado && (
        <p className="mt-2 text-sm text-emerald-300/80">Ya la resolviste antes: puedes repetirla para practicar.</p>
      )}
      <div className={titulo ? 'mt-5' : ''}>{children}</div>
    </section>
  );
}

const ESTILOS_RETRO = {
  bien: { caja: 'border-emerald-400/70 bg-emerald-400/10', titulo: 'text-emerald-300', texto: '¡Correcto!', animacion: 'animar-acierto' },
  mal: { caja: 'border-blender/70 bg-blender/10', titulo: 'text-blender', texto: 'Casi…', animacion: 'animar-sacudir' },
  solucion: { caja: 'border-amatista/70 bg-amatista/10', titulo: 'text-amatista-claro', texto: 'Solución', animacion: 'animar-entrar' },
  info: { caja: 'border-neon/50 bg-neon/5', titulo: 'text-neon', texto: 'Pista', animacion: 'animar-entrar' },
};

// Retroalimentación inmediata. El contenedor con role="status" existe siempre
// para que los lectores de pantalla anuncien cada cambio. `retro.clave`
// reinicia la animación en cada intento.
export function Retroalimentacion({ retro }) {
  const estilo = retro ? (ESTILOS_RETRO[retro.tipo] ?? ESTILOS_RETRO.info) : null;
  return (
    <div role="status" aria-live="polite" className={retro ? 'mt-5' : ''}>
      {retro && (
        <div key={retro.clave ?? retro.tipo} className={`corte-poly-sm border-l-4 p-4 ${estilo.caja} ${estilo.animacion}`}>
          <p className={`font-mono text-xs font-bold uppercase tracking-widest ${estilo.titulo}`}>
            {retro.titulo ?? estilo.texto}
          </p>
          {retro.texto && (
            <p className="mt-1 text-texto/90">
              <TextoEnLinea texto={retro.texto} />
            </p>
          )}
          {retro.explicacion && (
            <p className="mt-2 leading-relaxed text-texto/75">
              <TextoEnLinea texto={retro.explicacion} />
            </p>
          )}
        </div>
      )}
    </div>
  );
}
