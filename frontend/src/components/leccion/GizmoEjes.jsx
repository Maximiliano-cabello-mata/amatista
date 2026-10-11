// Los ejes de Blender que se giran con el dedo (bloque «axis_gizmo»): un cubo con X (rojo),
// Y (verde) y Z (azul). Se arrastra para orbitar, como con el botón central del ratón, y los
// botones 1, 3 y 7 hacen lo mismo que el teclado numérico de Blender.
// Bloque: {"type": "axis_gizmo", "title"?, "caption"?}.
import { useEffect, useId, useRef, useState } from 'react';
import { aristasCubo, limitarElevacion, proyectar, VISTAS, vistaCercana } from './recursos';

const ESCALA = 46;
const CENTRO = { x: 120, y: 104 };
const EJES = [
  { id: 'X', vector: [1, 0, 0], clase: 'gizmo__x' },
  { id: 'Y', vector: [0, 1, 0], clase: 'gizmo__y' },
  { id: 'Z', vector: [0, 0, 1], clase: 'gizmo__z' },
];

const enPantalla = (p) => ({ x: CENTRO.x + p.x * ESCALA, y: CENTRO.y - p.y * ESCALA });

const QUE_VES = {
  frente: 'De frente (1): X va a la derecha y Z hacia arriba. Y se aleja de ti, por eso casi no se ve.',
  derecha: 'Desde la derecha (3): ahora Y va a la derecha. X apunta hacia ti.',
  arriba: 'Desde arriba (7): como un plano. X a la derecha e Y hacia arriba de la pantalla; Z te apunta.',
  libre: 'Vista libre: así orbitas en Blender con el botón central del ratón. Z (azul) siempre es la altura.',
};

function GizmoEjes({ bloque }) {
  const idTitulo = useId();
  const [vista, setVista] = useState({ giro: VISTAS.libre.giro, elevacion: VISTAS.libre.elevacion });
  const arrastre = useRef(null);
  const animacion = useRef(null);
  useEffect(() => () => cancelAnimationFrame(animacion.current), []);

  const irA = (id) => {
    const meta = VISTAS[id];
    cancelAnimationFrame(animacion.current);
    const quieto = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('ligero');
    if (quieto) {
      setVista({ giro: meta.giro, elevacion: meta.elevacion });
      return;
    }
    let inicio = null; // el primer cuadro marca el inicio
    const desde = { ...vista };
    // El giro más corto (de 350° a 0° son 10°, no 350°).
    const dg = ((((meta.giro - desde.giro) % 360) + 540) % 360) - 180;
    const paso = (ahora) => {
      inicio ??= ahora;
      const t = Math.min(1, (ahora - inicio) / 450);
      const s = 1 - (1 - t) ** 3;
      setVista({ giro: desde.giro + dg * s, elevacion: desde.elevacion + (meta.elevacion - desde.elevacion) * s });
      if (t < 1) animacion.current = requestAnimationFrame(paso);
    };
    animacion.current = requestAnimationFrame(paso);
  };

  const alBajar = (e) => {
    cancelAnimationFrame(animacion.current);
    arrastre.current = { x: e.clientX, y: e.clientY, ...vista };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const alMover = (e) => {
    const a = arrastre.current;
    if (!a) return;
    setVista({ giro: a.giro - (e.clientX - a.x) * 0.6, elevacion: limitarElevacion(a.elevacion + (e.clientY - a.y) * 0.6) });
  };
  const alSoltar = () => {
    arrastre.current = null;
  };
  const alTeclado = (e) => {
    const cambios = { ArrowLeft: [8, 0], ArrowRight: [-8, 0], ArrowUp: [0, 8], ArrowDown: [0, -8] }[e.key];
    if (!cambios) return;
    e.preventDefault();
    setVista((v) => ({ giro: v.giro + cambios[0], elevacion: limitarElevacion(v.elevacion + cambios[1]) }));
  };

  const cercana = vistaCercana(vista.giro, vista.elevacion);
  const ejes = EJES.map((eje) => {
    const punta = proyectar(eje.vector.map((v) => v * 1.75), vista.giro, vista.elevacion);
    const cola = proyectar(eje.vector.map((v) => v * -1.75), vista.giro, vista.elevacion);
    return { ...eje, punta, cola, largo: Math.hypot(punta.x, punta.y) };
  }).sort((a, b) => b.punta.profundidad - a.punta.profundidad);

  return (
    <section aria-labelledby={idTitulo} className="gizmo corte-poly border border-white/10 bg-superficie/90 p-5 sm:p-7">
      <h3 id={idTitulo} className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-neon">
        {bloque.title ?? 'Gira el espacio 3D'}
      </h3>
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
        <svg
          viewBox="0 0 240 208"
          className="gizmo__lienzo w-full touch-none select-none"
          role="img"
          tabIndex={0}
          aria-label={`Cubo con los ejes X, Y y Z. ${QUE_VES[cercana]} Usa las flechas para girarlo.`}
          onPointerDown={alBajar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
          onKeyDown={alTeclado}
        >
          <circle cx={CENTRO.x} cy={CENTRO.y} r="96" className="gizmo__fondo" />
          {aristasCubo(vista.giro, vista.elevacion).map(({ a, b }, i) => {
            const p = enPantalla(a);
            const q = enPantalla(b);
            return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="gizmo__arista" />;
          })}
          {ejes.map((eje) => {
            const p = enPantalla(eje.punta);
            const c = enPantalla(eje.cola);
            return (
              <g key={eje.id} className={eje.clase}>
                <line x1={c.x} y1={c.y} x2={CENTRO.x} y2={CENTRO.y} className="gizmo__negativo" />
                <line x1={CENTRO.x} y1={CENTRO.y} x2={p.x} y2={p.y} className="gizmo__eje" />
                <circle cx={p.x} cy={p.y} r={eje.largo < 0.3 ? 8 : 10} className="gizmo__bola" />
                <text x={p.x} y={p.y + 4} textAnchor="middle" className="gizmo__letra">
                  {eje.id}
                </text>
              </g>
            );
          })}
          <text x="120" y="204" textAnchor="middle" className="gizmo__ayuda">
            Arrastra para orbitar
          </text>
        </svg>
        <div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Vistas del teclado numérico">
            {['frente', 'derecha', 'arriba', 'libre'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => irA(id)}
                aria-pressed={cercana === id}
                className={`corte-poly-sm flex items-center gap-2 border px-3 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                  cercana === id ? 'border-neon/60 bg-neon/10 text-white' : 'border-white/10 bg-base/60 text-white/65 hover:border-white/30'
                }`}
              >
                {VISTAS[id].tecla && <kbd className="rounded border border-white/25 bg-base px-1.5 py-0.5 text-white">{VISTAS[id].tecla}</kbd>}
                {VISTAS[id].nombre}
              </button>
            ))}
          </div>
          <p key={cercana} className="animar-entrar mt-4 leading-relaxed text-texto/85" aria-live="polite">
            {QUE_VES[cercana]}
          </p>
          {bloque.caption && <p className="mt-3 text-sm text-texto/60">{bloque.caption}</p>}
        </div>
      </div>
    </section>
  );
}

export default GizmoEjes;
