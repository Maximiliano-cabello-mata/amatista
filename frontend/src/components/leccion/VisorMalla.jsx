import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { aristasVisibles, crearMalla, estadisticas, proyectar } from '../graficas/malla';

// Herramienta «Visor de malla» (mesh_viewer, v3.6): una malla low poly que se
// gira con el dedo o el ratón y se selecciona por vértices, aristas o caras,
// como el Modo Edición de Blender (teclas 1, 2 y 3). Dibujada en SVG, sin
// WebGL: corre en cualquier equipo y no descarga nada (ver
// docs/plataforma/07_herramientas_graficas.md §8).

const ANCHO = 400;
const ALTO = 280;
const MODOS = [
  { id: 'vertex', tecla: '1', nombre: 'Vértice', plural: 'vértices' },
  { id: 'edge', tecla: '2', nombre: 'Arista', plural: 'aristas' },
  { id: 'face', tecla: '3', nombre: 'Cara', plural: 'caras' },
];
const VISTA_INICIAL = { giro: -0.6, inclinacion: 0.45 };
// Colores del gizmo de ejes de Blender.
const EJES = [
  { nombre: 'X', color: '#FF3352', v: [1, 0, 0] },
  { nombre: 'Y', color: '#8BDC00', v: [0, 1, 0] },
  { nombre: 'Z', color: '#2890FF', v: [0, 0, 1] },
];

function IconoModo({ modo }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      <path d="M3 12 L8 3 L13 12 Z" fill={modo === 'face' ? 'currentColor' : 'none'} fillOpacity="0.35" stroke="currentColor" strokeWidth={modo === 'edge' ? 2 : 1} />
      {modo === 'vertex' && [[3, 12], [8, 3], [13, 12]].map(([x, y]) => <rect key={x} x={x - 1.8} y={y - 1.8} width="3.6" height="3.6" fill="currentColor" />)}
    </svg>
  );
}

function Suelo({ aPantalla, radio, z }) {
  const lineas = [];
  const paso = radio / 2;
  for (let i = -4; i <= 4; i++) {
    const a = aPantalla([i * paso, -4 * paso, z], { centrado: false });
    const b = aPantalla([i * paso, 4 * paso, z], { centrado: false });
    const c = aPantalla([-4 * paso, i * paso, z], { centrado: false });
    const d = aPantalla([4 * paso, i * paso, z], { centrado: false });
    lineas.push(<line key={`x${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={i === 0 ? '#8BDC00' : '#ffffff'} strokeOpacity={i === 0 ? 0.45 : 0.07} />);
    lineas.push(<line key={`y${i}`} x1={c.x} y1={c.y} x2={d.x} y2={d.y} stroke={i === 0 ? '#FF3352' : '#ffffff'} strokeOpacity={i === 0 ? 0.45 : 0.07} />);
  }
  return <g aria-hidden="true">{lineas}</g>;
}

function Gizmo({ aPantalla, radio }) {
  const o = { x: ANCHO - 34, y: ALTO - 34 };
  const centro = aPantalla([0, 0, 0], { centrado: false, soloGiro: true });
  const crudos = EJES.map((eje) => {
    const p = aPantalla(eje.v.map((c) => c * radio), { centrado: false, soloGiro: true });
    return { ...eje, dx: p.x - centro.x, dy: p.y - centro.y, p: p.p };
  });
  // Rotación ortonormal: la suma de los dx² de los tres ejes es la escala².
  const unidad = Math.sqrt(crudos.reduce((s, e) => s + e.dx * e.dx, 0)) || 1;
  const ejes = crudos.map((e) => ({ ...e, x: o.x + (e.dx / unidad) * 22, y: o.y + (e.dy / unidad) * 22 }));
  return (
    <g aria-hidden="true">
      {ejes
        .sort((a, b) => b.p - a.p)
        .map((e) => (
          <g key={e.nombre}>
            <line x1={o.x} y1={o.y} x2={e.x} y2={e.y} stroke={e.color} strokeWidth="2" />
            <circle cx={e.x} cy={e.y} r="7" fill={e.color} />
            <text x={e.x} y={e.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#111">
              {e.nombre}
            </text>
          </g>
        ))}
    </g>
  );
}

function VisorMalla({ bloque }) {
  const idAyuda = useId();
  const malla = useMemo(() => crearMalla(bloque), [bloque]);
  const cuentas = useMemo(() => (malla ? estadisticas(malla) : null), [malla]);
  const [modo, setModo] = useState(MODOS.some((m) => m.id === bloque.mode) ? bloque.mode : 'vertex');
  const [alambre, setAlambre] = useState(Boolean(bloque.wireframe));
  const [vista, setVista] = useState(VISTA_INICIAL);
  const [seleccion, setSeleccion] = useState(() => new Set());
  const arrastre = useRef(null);
  const cuadro = useRef(0);

  useEffect(() => () => cancelAnimationFrame(cuadro.current), []);

  const proyeccion = useMemo(
    () => (malla ? proyectar(malla, { ...vista, ancho: ANCHO, alto: ALTO }) : null),
    [malla, vista],
  );
  const visibles = useMemo(() => (malla && proyeccion ? aristasVisibles(malla, proyeccion) : []), [malla, proyeccion]);

  const cambiarModo = useCallback((nuevo) => {
    setModo(nuevo);
    setSeleccion(new Set());
  }, []);

  const alternar = (indice) => {
    if (arrastre.current?.movido) return;
    setSeleccion((previa) => {
      const nueva = new Set(previa);
      if (nueva.has(indice)) nueva.delete(indice);
      else nueva.add(indice);
      return nueva;
    });
  };

  const girar = (dGiro, dInclinacion) => {
    setVista((v) => ({
      giro: v.giro + dGiro,
      inclinacion: Math.max(-1.45, Math.min(1.5707, v.inclinacion + dInclinacion)),
    }));
  };

  // El arrastre gira la vista; un toque sin moverse selecciona.
  const alBajar = (e) => {
    arrastre.current = { x: e.clientX, y: e.clientY, movido: false, id: e.pointerId };
  };
  const alMover = (e) => {
    const a = arrastre.current;
    if (!a || a.id !== e.pointerId) return;
    const dx = e.clientX - a.x;
    const dy = e.clientY - a.y;
    if (!a.movido && Math.hypot(dx, dy) < 5) return;
    if (!a.movido) {
      a.movido = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    a.x = e.clientX;
    a.y = e.clientY;
    a.dx = (a.dx ?? 0) + dx;
    a.dy = (a.dy ?? 0) + dy;
    // Un dibujo por cuadro de pantalla como máximo.
    if (!cuadro.current) {
      cuadro.current = requestAnimationFrame(() => {
        cuadro.current = 0;
        const actual = arrastre.current;
        if (!actual) return;
        girar(-(actual.dx ?? 0) * 0.012, (actual.dy ?? 0) * 0.01);
        actual.dx = 0;
        actual.dy = 0;
      });
    }
  };
  const alSoltar = () => {
    // El clic llega después de soltar: se limpia en el siguiente turno.
    const a = arrastre.current;
    setTimeout(() => {
      if (arrastre.current === a) arrastre.current = null;
    }, 0);
  };

  const alTeclear = (e) => {
    const modoTecla = MODOS.find((m) => m.tecla === e.key);
    const acciones = {
      ArrowLeft: () => girar(0.26, 0),
      ArrowRight: () => girar(-0.26, 0),
      ArrowUp: () => girar(0, 0.2),
      ArrowDown: () => girar(0, -0.2),
      z: () => setAlambre((a) => !a),
      Z: () => setAlambre((a) => !a),
      Home: () => setVista(VISTA_INICIAL),
    };
    if (modoTecla) cambiarModo(modoTecla.id);
    else if (acciones[e.key]) acciones[e.key]();
    else return;
    e.preventDefault();
  };

  if (!malla || !proyeccion) return null;
  const { puntos, caras, vistos, aPantalla, radio, suelo } = proyeccion;
  const actual = MODOS.find((m) => m.id === modo);
  const total = { vertex: cuentas.vertices, edge: cuentas.aristas, face: cuentas.caras }[modo];
  const puedeElegir = (tipo) => modo === tipo;

  return (
    <section className="visor-malla corte-poly min-w-0 border border-white/10 bg-superficie/90 p-5 sm:p-7">
      {bloque.title && <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-neon">{bloque.title}</h3>}

      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Modo de selección y vista">
        <div className="visor-malla__modos flex" role="radiogroup" aria-label="Modo de selección">
          {MODOS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={modo === m.id}
              onClick={() => cambiarModo(m.id)}
              className="visor-malla__modo"
              title={`${m.nombre} (tecla ${m.tecla})`}
            >
              <IconoModo modo={m.id} />
              <span>{m.nombre}</span>
              <kbd>{m.tecla}</kbd>
            </button>
          ))}
        </div>
        <button type="button" aria-pressed={alambre} onClick={() => setAlambre((a) => !a)} className="visor-malla__modo" title="Sólido o alambre (tecla Z)">
          {alambre ? 'Alambre' : 'Sólido'} <kbd>Z</kbd>
        </button>
        <button type="button" onClick={() => setVista(VISTA_INICIAL)} className="visor-malla__modo" title="Volver a la vista inicial (tecla Inicio)">
          Centrar
        </button>
        {seleccion.size > 0 && (
          <button type="button" onClick={() => setSeleccion(new Set())} className="visor-malla__modo">
            Quitar selección
          </button>
        )}
      </div>

      <div className="visor-malla__lienzo corte-poly-sm relative mt-3">
        <svg
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          className="block w-full touch-none select-none"
          tabIndex={0}
          role="application"
          aria-roledescription="visor 3D"
          aria-label={`${bloque.title ?? 'Malla'}: ${cuentas.vertices} vértices, ${cuentas.aristas} aristas y ${cuentas.caras} caras`}
          aria-describedby={idAyuda}
          onPointerDown={alBajar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
          onKeyDown={alTeclear}
        >
          <Suelo aPantalla={aPantalla} radio={radio} z={suelo} />

          {caras.map((cara) => {
            if (alambre && !seleccion.has(cara.i)) return null;
            if (!alambre && !cara.frente) return null;
            const elegida = modo === 'face' && seleccion.has(cara.i);
            const luz = 22 + cara.luz * 50;
            return (
              <polygon
                key={cara.i}
                points={cara.puntos}
                className={puedeElegir('face') && (cara.frente || alambre) ? 'visor-malla__elegible' : undefined}
                fill={elegida ? `hsl(24 92% ${30 + cara.luz * 30}%)` : `hsl(270 6% ${luz}%)`}
                fillOpacity={alambre ? 0.45 : 1}
                stroke={alambre ? 'none' : '#151515'}
                strokeWidth="0.8"
                strokeLinejoin="round"
                onClick={puedeElegir('face') ? () => alternar(cara.i) : undefined}
              />
            );
          })}

          {malla.aristas.map(([a, b], i) => {
            const elegida = modo === 'edge' && seleccion.has(i);
            // En sólido, las aristas ya son el borde de cada cara.
            if (!alambre && !(elegida && visibles[i])) return null;
            return (
              <line
                key={i}
                x1={puntos[a].x}
                y1={puntos[a].y}
                x2={puntos[b].x}
                y2={puntos[b].y}
                stroke={elegida ? '#F5792A' : alambre ? '#C39BD3' : '#151515'}
                strokeOpacity={alambre && !visibles[i] && !elegida ? 0.35 : 1}
                strokeWidth={elegida ? 2.6 : 1}
                strokeLinecap="round"
              />
            );
          })}

          {modo === 'edge' &&
            malla.aristas.map(([a, b], i) =>
              alambre || visibles[i] ? (
                <line
                  key={`t${i}`}
                  x1={puntos[a].x}
                  y1={puntos[a].y}
                  x2={puntos[b].x}
                  y2={puntos[b].y}
                  stroke="transparent"
                  strokeWidth="12"
                  className="visor-malla__elegible"
                  onClick={() => alternar(i)}
                />
              ) : null,
            )}

          {modo === 'vertex' &&
            puntos.map((p, i) => {
              if (!alambre && !vistos.has(i)) return null;
              const elegido = seleccion.has(i);
              return (
                <g key={i} className="visor-malla__elegible" onClick={() => alternar(i)}>
                  <circle cx={p.x} cy={p.y} r="11" fill="transparent" />
                  <rect x={p.x - 2.6} y={p.y - 2.6} width="5.2" height="5.2" fill={elegido ? '#F5792A' : '#111'} stroke={elegido ? '#FFD2A8' : '#d9d9d9'} strokeWidth="0.8" />
                </g>
              );
            })}

          <Gizmo aPantalla={aPantalla} radio={radio} />
        </svg>

        {/* Como el panel «Estadísticas» de Blender. */}
        <dl className="visor-malla__datos" aria-live="polite">
          {MODOS.map((m) => (
            <div key={m.id} className={m.id === modo ? 'text-white' : undefined}>
              <dt>{m.plural}</dt>
              <dd>
                {m.id === modo ? `${seleccion.size}/` : ''}
                {{ vertex: cuentas.vertices, edge: cuentas.aristas, face: cuentas.caras }[m.id]}
              </dd>
            </div>
          ))}
          <div>
            <dt>triángulos</dt>
            <dd>{cuentas.triangulos}</dd>
          </div>
        </dl>
      </div>

      <p id={idAyuda} className="mt-3 text-sm text-white/55">
        Arrastra para girar · toca para seleccionar {actual.plural} ({seleccion.size} de {total}) · teclas 1, 2, 3, Z y flechas.
      </p>
      {bloque.caption && <p className="mt-2 leading-relaxed text-texto/85">{bloque.caption}</p>}
    </section>
  );
}

export default VisorMalla;
