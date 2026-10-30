// «Simulador de la vista 3D» (bloque viewport_sim): una vista 3D como la de Blender, dibujada en
// SVG, para aprender a moverse antes de abrir el programa. Arrastrar gira (en Blender, botón
// central del ratón), la rueda o el pellizco acercan y las teclas 1, 3 y 7 ponen las vistas de
// frente, lado y arriba (también con botones, para el celular). Cada misión se marca sola.
// Bloque: {"type": "viewport_sim", "id", "title"?, "caption"?, "missions"?: [...]}.
import { useEffect, useMemo, useRef, useState } from 'react';
import { aristasVisibles, proyectar } from '../../graficas/malla';
import { accionDeTecla, escenaSimulador, limitarInclinacion, limitarZoom, MISIONES, misionesDe, VISTAS } from '../graficos';
import { TextoEnLinea } from '../Markdown';
import { Tecla } from '../Tecla';
import { useActividad } from './hooks';
import { BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';

const ANCHO = 480;
const ALTO = 300;
const INICIAL = { giro: -0.7, inclinacion: 0.45, zoom: 1 };
const EJES = [
  { nombre: 'X', color: '#FF3352', v: [1, 0, 0] },
  { nombre: 'Y', color: '#8BDC00', v: [0, 1, 0] },
  { nombre: 'Z', color: '#2890FF', v: [0, 0, 1] },
];

const mezclar = (hex, luz) => {
  const n = parseInt(hex.slice(1), 16);
  const f = 0.35 + luz * 0.65;
  return `rgb(${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(c * f)).join(',')})`;
};

function SimuladorVista({ bloque, alCompletar, resuelta }) {
  const { resultado, resolver } = useActividad(alCompletar);
  const escena = useMemo(() => escenaSimulador(), []);
  const misiones = useMemo(() => misionesDe(bloque), [bloque]);
  const [vista, setVista] = useState(INICIAL);
  const [hechas, setHechas] = useState([]);
  const [ultima, setUltima] = useState('');
  const giroAcumulado = useRef(0);
  const arrastre = useRef(null);
  const punteros = useRef(new Map());
  const lienzo = useRef(null);

  const marcar = (mision) => {
    if (!misiones.includes(mision)) return;
    setHechas((previas) => (previas.includes(mision) ? previas : [...previas, mision]));
  };

  useEffect(() => {
    if (!resultado && misiones.every((m) => hechas.includes(m))) resolver(true, 1);
  }, [hechas, misiones, resultado, resolver]);

  const accion = (nombre) => {
    if (VISTAS[nombre]) {
      const { giro, inclinacion, nombre: texto } = VISTAS[nombre];
      setVista((v) => ({ ...v, giro, inclinacion }));
      setUltima(`Vista ${texto.toLowerCase()} (${VISTAS[nombre].tecla})`);
      marcar(nombre);
    } else if (nombre === 'encuadrar') {
      setVista(INICIAL);
      setUltima('Todo encuadrado');
      marcar('encuadrar');
    } else if (nombre === 'acercar' || nombre === 'alejar') {
      setVista((v) => {
        const zoom = limitarZoom(v.zoom * (nombre === 'acercar' ? 1.2 : 1 / 1.2));
        if (zoom >= 1.5) marcar('acercar');
        return { ...v, zoom };
      });
    }
  };

  // Rueda del ratón: acercar sin desplazar la página (listener no pasivo).
  useEffect(() => {
    const nodo = lienzo.current;
    const rueda = (e) => {
      e.preventDefault();
      setVista((v) => {
        const zoom = limitarZoom(v.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
        if (zoom >= 1.5) marcar('acercar');
        return { ...v, zoom };
      });
    };
    nodo.addEventListener('wheel', rueda, { passive: false });
    return () => nodo.removeEventListener('wheel', rueda);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const presionar = (e) => {
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.currentTarget.focus({ preventScroll: true });
    arrastre.current = { x: e.clientX, y: e.clientY, distancia: null };
  };
  const mover = (e) => {
    if (!punteros.current.has(e.pointerId)) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const previa = arrastre.current?.distancia;
      if (previa) {
        setVista((v) => {
          const zoom = limitarZoom(v.zoom * (d / previa));
          if (zoom >= 1.5) marcar('acercar');
          return { ...v, zoom };
        });
      }
      arrastre.current = { ...arrastre.current, distancia: d };
      return;
    }
    const previo = arrastre.current;
    if (!previo) return;
    const dx = e.clientX - previo.x;
    const dy = e.clientY - previo.y;
    arrastre.current = { x: e.clientX, y: e.clientY, distancia: null };
    giroAcumulado.current += Math.abs(dx) * 0.01;
    if (giroAcumulado.current > Math.PI / 2) marcar('orbitar');
    setVista((v) => ({ ...v, giro: v.giro + dx * 0.01, inclinacion: limitarInclinacion(v.inclinacion + dy * 0.008) }));
  };
  const soltar = (e) => {
    punteros.current.delete(e.pointerId);
    if (!punteros.current.size) arrastre.current = null;
  };
  const teclear = (e) => {
    const a = accionDeTecla(e.key);
    if (!a) return;
    e.preventDefault();
    accion(a);
  };

  const proy = useMemo(() => proyectar(escena, { giro: vista.giro, inclinacion: vista.inclinacion, ancho: ANCHO, alto: ALTO }), [escena, vista.giro, vista.inclinacion]);
  const visibles = useMemo(() => aristasVisibles(escena, proy), [escena, proy]);
  const transformar = `translate(${ANCHO / 2} ${ALTO / 2}) scale(${vista.zoom}) translate(${-ANCHO / 2} ${-ALTO / 2})`;

  // Rejilla del suelo y ejes X (rojo) e Y (verde), como en Blender.
  const rejilla = [];
  const paso = 1.2;
  for (let i = -5; i <= 5; i += 1) {
    const a = proy.aPantalla([i * paso, -5 * paso, proy.suelo], { centrado: false });
    const b = proy.aPantalla([i * paso, 5 * paso, proy.suelo], { centrado: false });
    const c = proy.aPantalla([-5 * paso, i * paso, proy.suelo], { centrado: false });
    const d = proy.aPantalla([5 * paso, i * paso, proy.suelo], { centrado: false });
    rejilla.push(<line key={`a${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={i === 0 ? '#8BDC00' : '#fff'} strokeOpacity={i === 0 ? 0.5 : 0.07} />);
    rejilla.push(<line key={`b${i}`} x1={c.x} y1={c.y} x2={d.x} y2={d.y} stroke={i === 0 ? '#FF3352' : '#fff'} strokeOpacity={i === 0 ? 0.5 : 0.07} />);
  }
  const origen = proy.aPantalla([0, 0, 0], { centrado: false, soloGiro: true });
  const crudos = EJES.map((eje) => {
    const p = proy.aPantalla(eje.v, { centrado: false, soloGiro: true });
    return { ...eje, dx: p.x - origen.x, dy: p.y - origen.y, p: p.p };
  });
  const unidad = Math.sqrt(crudos.reduce((s, e) => s + e.dx * e.dx, 0)) || 1;
  const gizmo = { x: ANCHO - 36, y: 36 };

  const retro = resultado ? { tipo: 'bien', texto: 'Ya te mueves como en Blender. En el programa, girar es el botón central del ratón (o la rueda presionada).' } : null;

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.title ?? 'Muévete por la vista 3D'} resultado={resultado} resuelta={resuelta}>
      {bloque.caption && (
        <p className="mb-4 text-texto/80">
          <TextoEnLinea texto={bloque.caption} />
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div>
          <div
            ref={lienzo}
            tabIndex={0}
            role="application"
            aria-label="Vista 3D: arrastra para girar, rueda para acercar, teclas 1, 3 y 7 para las vistas"
            onPointerDown={presionar}
            onPointerMove={mover}
            onPointerUp={soltar}
            onPointerCancel={soltar}
            onKeyDown={teclear}
            className="corte-poly relative cursor-grab touch-none select-none overflow-hidden bg-[#2b2b2b] outline-none focus-visible:ring-2 focus-visible:ring-neon active:cursor-grabbing"
          >
            <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="block h-auto w-full">
              <g transform={transformar}>
                {rejilla}
                {proy.caras
                  .filter((c) => c.frente)
                  .map((c) => (
                    <polygon key={c.i} points={c.puntos} fill={mezclar(escena.partes[escena.piezas[c.i]].color, c.luz)} stroke="#141414" strokeWidth="0.5" />
                  ))}
                {escena.aristas.map(([a, b], i) =>
                  visibles[i] ? <line key={i} x1={proy.puntos[a].x} y1={proy.puntos[a].y} x2={proy.puntos[b].x} y2={proy.puntos[b].y} stroke="#000" strokeOpacity="0.25" strokeWidth="0.6" /> : null,
                )}
              </g>
              <circle cx={gizmo.x} cy={gizmo.y} r="30" fill="#ffffff" fillOpacity="0.05" />
              {crudos
                .map((e) => ({ ...e, x: gizmo.x + (e.dx / unidad) * 22, y: gizmo.y + (e.dy / unidad) * 22 }))
                .sort((a, b) => b.p - a.p)
                .map((e) => (
                  <g key={e.nombre}>
                    <line x1={gizmo.x} y1={gizmo.y} x2={e.x} y2={e.y} stroke={e.color} strokeWidth="2" />
                    <circle cx={e.x} cy={e.y} r="7" fill={e.color} />
                    <text x={e.x} y={e.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#111">
                      {e.nombre}
                    </text>
                  </g>
                ))}
              <text x="10" y="18" fontSize="11" fill="#ffffff" fillOpacity="0.55" fontFamily="monospace">
                {ultima || 'Perspectiva del usuario'}
              </text>
            </svg>
          </div>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Vistas y zoom">
            {Object.entries(VISTAS).map(([id, v]) => (
              <button key={id} type="button" onClick={() => accion(id)} className={`${BOTON_SECUNDARIO} flex items-center gap-2`}>
                <Tecla>{v.tecla}</Tecla> {v.nombre}
              </button>
            ))}
            <button type="button" onClick={() => accion('acercar')} className={BOTON_SECUNDARIO} aria-label="Acercar">
              + Acercar
            </button>
            <button type="button" onClick={() => accion('alejar')} className={BOTON_SECUNDARIO} aria-label="Alejar">
              − Alejar
            </button>
            <button type="button" onClick={() => accion('encuadrar')} className={`${BOTON_SECUNDARIO} flex items-center gap-2`}>
              <Tecla>Inicio</Tecla> Encuadrar
            </button>
          </div>
        </div>
        <aside className="text-sm">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">
            Misiones · {hechas.filter((m) => misiones.includes(m)).length} de {misiones.length}
          </p>
          <ul className="mt-2 grid gap-1.5" aria-live="polite">
            {misiones.map((m) => {
              const hecha = hechas.includes(m);
              return (
                <li key={m} className={`flex items-start gap-2 ${hecha ? 'text-emerald-300' : 'text-white/80'}`}>
                  <span className={`hexagono mt-0.5 grid h-4 w-[1.15rem] shrink-0 place-items-center text-[10px] font-bold ${hecha ? 'bg-emerald-400 text-base' : 'bg-white/15'}`} aria-hidden="true">
                    {hecha ? '✓' : ''}
                  </span>
                  <span>
                    {MISIONES[m]}
                    <span className="sr-only">{hecha ? ' (hecha)' : ' (pendiente)'}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-white/55">
            <strong className="text-white/80">En Blender:</strong> girar es el <em>botón central</em> del ratón (la rueda presionada), acercar es girar la rueda y
            las vistas 1, 3 y 7 están en el teclado numérico. ¿Laptop sin teclado numérico? En Blender activa Editar › Preferencias › Entrada › «Emular teclado numérico» y usa los números de arriba.
          </p>
        </aside>
      </div>
      <Retroalimentacion retro={retro} />
    </MarcoActividad>
  );
}

export default SimuladorVista;
