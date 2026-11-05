// Visor del modelo de un alumno: la escena que entregó, armada en el navegador
// del profesor a partir del modelo ligero (unos KB). Canvas 2D, sin WebGL ni
// descargas: gira con el ratón o el dedo, acerca con la rueda y tiene las
// vistas del teclado numérico de Blender (1 frente, 3 derecha, 7 arriba).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VISTAS, dibujar } from './dibujo';
import { medidaLegible } from './modelo';

const BOTON = 'corte-poly-sm border border-white/10 bg-base/70 px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white/75 hover:border-neon hover:text-neon aria-pressed:border-neon aria-pressed:text-neon';
const ZOOM = { min: 0.35, max: 8 };
const limitar = (valor, min, max) => Math.max(min, Math.min(max, valor));

function Muestra({ color }) {
  const [r, g, b] = color.map((c) => Math.round(c * 255));
  return <span aria-hidden="true" className="inline-block h-3 w-3 shrink-0 border border-white/20" style={{ background: `rgb(${r}, ${g}, ${b})` }} />;
}

function VisorModelo({ escena, titulo = 'Modelo del alumno' }) {
  const lienzo = useRef(null);
  const caja = useRef(null);
  const arrastre = useRef(null);
  const [tamano, setTamano] = useState({ ancho: 640, alto: 420 });
  const [vista, setVista] = useState({ ...VISTAS.perspectiva, zoom: 1 });
  const [alambre, setAlambre] = useState(false);
  const [resaltado, setResaltado] = useState(null);
  const [ocultos, setOcultos] = useState(() => new Set());

  // El lienzo sigue el ancho de su caja (teléfono o escritorio).
  useEffect(() => {
    const nodo = caja.current;
    if (!nodo || typeof ResizeObserver === 'undefined') return undefined;
    const observador = new ResizeObserver(([entrada]) => {
      const ancho = Math.round(entrada.contentRect.width);
      setTamano({ ancho, alto: Math.round(limitar(ancho * 0.66, 260, 560)) });
    });
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    const canvas = lienzo.current;
    if (!canvas) return undefined;
    const marco = requestAnimationFrame(() => {
      const ppp = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = tamano.ancho * ppp;
      canvas.height = tamano.alto * ppp;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(ppp, 0, 0, ppp, 0, 0);
      dibujar(ctx, escena, { ...vista, alambre, resaltado, ocultos }, tamano);
    });
    return () => cancelAnimationFrame(marco);
  }, [escena, vista, alambre, resaltado, ocultos, tamano]);

  const elegirVista = useCallback((nombre) => setVista((v) => ({ ...VISTAS[nombre], zoom: v.zoom })), []);
  const acercar = useCallback((factor) => setVista((v) => ({ ...v, zoom: limitar(v.zoom * factor, ZOOM.min, ZOOM.max) })), []);

  // La rueda acerca sin mover la página (listener pasivo: false).
  useEffect(() => {
    const canvas = lienzo.current;
    if (!canvas) return undefined;
    const rueda = (evento) => {
      evento.preventDefault();
      acercar(evento.deltaY < 0 ? 1.12 : 1 / 1.12);
    };
    canvas.addEventListener('wheel', rueda, { passive: false });
    return () => canvas.removeEventListener('wheel', rueda);
  }, [acercar]);

  const alPresionar = (evento) => {
    evento.currentTarget.setPointerCapture?.(evento.pointerId);
    arrastre.current = { x: evento.clientX, y: evento.clientY };
  };
  const alMover = (evento) => {
    if (!arrastre.current) return;
    const dx = evento.clientX - arrastre.current.x;
    const dy = evento.clientY - arrastre.current.y;
    arrastre.current = { x: evento.clientX, y: evento.clientY };
    setVista((v) => ({ ...v, giro: v.giro - dx * 0.01, inclinacion: limitar(v.inclinacion + dy * 0.01, -1.55, 1.55) }));
  };
  const alSoltar = () => {
    arrastre.current = null;
  };

  const alTeclear = (evento) => {
    const acciones = {
      ArrowLeft: () => setVista((v) => ({ ...v, giro: v.giro + 0.2 })),
      ArrowRight: () => setVista((v) => ({ ...v, giro: v.giro - 0.2 })),
      ArrowUp: () => setVista((v) => ({ ...v, inclinacion: limitar(v.inclinacion + 0.2, -1.55, 1.55) })),
      ArrowDown: () => setVista((v) => ({ ...v, inclinacion: limitar(v.inclinacion - 0.2, -1.55, 1.55) })),
      1: () => elegirVista('frente'),
      3: () => elegirVista('derecha'),
      7: () => elegirVista('arriba'),
      0: () => elegirVista('perspectiva'),
      '+': () => acercar(1.2),
      '-': () => acercar(1 / 1.2),
      z: () => setAlambre((a) => !a),
    };
    const accion = acciones[evento.key];
    if (accion) {
      evento.preventDefault();
      accion();
    }
  };

  const alternarOculto = (indice) =>
    setOcultos((previo) => {
      const siguiente = new Set(previo);
      if (siguiente.has(indice)) siguiente.delete(indice);
      else siguiente.add(indice);
      return siguiente;
    });

  const mallas = useMemo(() => escena.objetos.filter((o) => o.triangulos), [escena]);
  const otros = escena.objetos.length - mallas.length;
  const [ancho, fondo, alto] = escena.medidas;
  const descripcion = `${titulo}: ${escena.cuentas.mallas} mallas, ${escena.cuentas.triangulos} triángulos, mide ${medidaLegible(ancho)} × ${medidaLegible(fondo)} × ${medidaLegible(alto)}.`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="min-w-0">
        <div ref={caja} className="corte-poly relative overflow-hidden border border-white/10 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.18),transparent_65%)] bg-base">
          <canvas
            ref={lienzo}
            role="img"
            aria-label={descripcion}
            tabIndex={0}
            onPointerDown={alPresionar}
            onPointerMove={alMover}
            onPointerUp={alSoltar}
            onPointerCancel={alSoltar}
            onKeyDown={alTeclear}
            style={{ width: tamano.ancho, height: tamano.alto, touchAction: 'none' }}
            className="block cursor-grab outline-none focus-visible:ring-2 focus-visible:ring-neon active:cursor-grabbing"
          />
          <p className="pointer-events-none absolute left-3 top-2 font-mono text-[10px] uppercase tracking-widest text-white/45">
            Arrastra para girar · rueda para acercar · 1 3 7 vistas · Z alambre
          </p>
          {escena.resumido && (
            <p className="absolute bottom-2 left-3 right-3 text-xs text-blender">
              El modelo era muy pesado: algunas piezas llegaron como su caja.
            </p>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="toolbar" aria-label="Vista del modelo">
          <button type="button" className={BOTON} onClick={() => elegirVista('perspectiva')}>Perspectiva</button>
          <button type="button" className={BOTON} onClick={() => elegirVista('frente')}>Frente · 1</button>
          <button type="button" className={BOTON} onClick={() => elegirVista('derecha')}>Derecha · 3</button>
          <button type="button" className={BOTON} onClick={() => elegirVista('arriba')}>Arriba · 7</button>
          <button type="button" className={BOTON} aria-pressed={alambre} onClick={() => setAlambre((a) => !a)}>Alambre · Z</button>
          <button type="button" className={BOTON} aria-label="Acercar" onClick={() => acercar(1.2)}>＋</button>
          <button type="button" className={BOTON} aria-label="Alejar" onClick={() => acercar(1 / 1.2)}>－</button>
        </div>
      </div>

      <aside className="min-w-0">
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {[
            ['Mallas', escena.cuentas.mallas],
            ['Triángulos', escena.cuentas.triangulos.toLocaleString('es-MX')],
            ['Materiales', escena.cuentas.materiales],
            ['Tamaño', `${medidaLegible(Math.max(ancho, fondo, alto))}`],
          ].map(([etiqueta, valor]) => (
            <div key={etiqueta} className="corte-poly-sm border border-white/10 bg-base/60 px-3 py-2">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-white/50">{etiqueta}</dt>
              <dd className="text-lg font-extrabold text-white">{valor}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-neon">Objetos</p>
        <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto pr-1 text-sm">
          {mallas.map((o) => (
            <li key={o.indice}>
              <div
                className={`flex items-center gap-2 border px-2 py-1.5 ${resaltado === o.indice ? 'border-neon bg-neon/5' : 'border-white/5 bg-base/40'}`}
                onMouseEnter={() => setResaltado(o.indice)}
                onMouseLeave={() => setResaltado(null)}
              >
                <Muestra color={o.color} />
                <button type="button" className="min-w-0 flex-1 truncate text-left text-white/85 hover:text-white" onClick={() => setResaltado((r) => (r === o.indice ? null : o.indice))} title={o.mods.length ? `Modificadores: ${o.mods.join(', ')}` : undefined}>
                  {o.nombre}
                  <span className="ml-1.5 font-mono text-[10px] text-white/40">{o.triangulos.length / 3}△</span>
                </button>
                <button type="button" className="font-mono text-[10px] uppercase text-white/50 hover:text-neon" aria-pressed={!ocultos.has(o.indice)} onClick={() => alternarOculto(o.indice)}>
                  {ocultos.has(o.indice) ? 'Ver' : 'Ocultar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
        {otros > 0 && <p className="mt-2 text-xs text-white/45">Además: {otros} {otros === 1 ? 'luz, cámara o vacío' : 'luces, cámaras o vacíos'}.</p>}
        {escena.blender && <p className="mt-1 text-xs text-white/45">Hecho en Blender {escena.blender}.</p>}
      </aside>
    </div>
  );
}

export default VisorModelo;
