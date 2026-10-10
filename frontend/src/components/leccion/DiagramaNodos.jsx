import { useMemo, useState } from 'react';
import { acomodar, CLASES_NODO, CONECTORES, MEDIDAS, ordenFlujo } from '../graficas/nodos';

// Herramienta «Diagrama de nodos» (node_graph, v3.6): un árbol de nodos como
// el del editor de shaders o de Geometry Nodes de Blender, con sus colores
// de encabezado y de conector. Al tocar un nodo se ilumina su camino y se lee
// su explicación; «Recorrer el flujo» lo explica nodo por nodo, de las
// entradas a la salida. SVG puro (Mermaid o React Flow pesan 60 KB a 1.5 MB).

function Nodo({ nodo, caja, activo, atenuado, alElegir }) {
  const { encabezado, fila } = MEDIDAS;
  const clase = CLASES_NODO[nodo.kind] ?? CLASES_NODO.converter;
  const salidas = nodo.outputs ?? [];
  const entradas = nodo.inputs ?? [];
  const alTeclear = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      alElegir();
    }
  };
  return (
    <g
      transform={`translate(${caja.x} ${caja.y})`}
      className={`nodos__nodo${activo ? ' nodos__nodo--activo' : ''}`}
      opacity={atenuado ? 0.45 : 1}
      tabIndex={0}
      role="button"
      aria-pressed={activo}
      aria-label={`Nodo ${nodo.title} (${clase.nombre})`}
      onClick={alElegir}
      onKeyDown={alTeclear}
    >
      <rect width={caja.ancho} height={caja.alto} rx="6" fill="#2A2A2E" stroke={activo ? '#ffffff' : '#111'} strokeWidth={activo ? 2 : 1} />
      <path d={`M0,6 a6,6 0 0 1 6,-6 h${caja.ancho - 12} a6,6 0 0 1 6,6 v${encabezado - 6} h-${caja.ancho} z`} fill={clase.color} />
      <text x="10" y="17" fontSize="11.5" fontWeight="700" fill="#fff">
        {nodo.title}
      </text>
      {salidas.map((s, i) => {
        const y = encabezado + i * fila + fila / 2 + 4;
        return (
          <g key={`s${s.id}`}>
            <text x={caja.ancho - 12} y={y + 4} fontSize="10.5" textAnchor="end" fill="#d6d6d6">
              {s.label}
            </text>
            <circle cx={caja.ancho} cy={y} r="4.5" fill={CONECTORES[s.socket] ?? CONECTORES.float} stroke="#111" />
          </g>
        );
      })}
      {entradas.map((e, i) => {
        const y = encabezado + (salidas.length + i) * fila + fila / 2 + 4;
        return (
          <g key={`e${e.id}`}>
            {e.value !== undefined && (
              <rect x="8" y={y - 8} width={caja.ancho - 16} height="16" rx="3" fill="#545454" />
            )}
            <text x="12" y={y + 4} fontSize="10.5" fill="#d6d6d6">
              {e.label}
            </text>
            {e.value !== undefined && (
              <text x={caja.ancho - 14} y={y + 4} fontSize="10.5" textAnchor="end" fill="#fff" className="font-mono">
                {String(e.value)}
              </text>
            )}
            <circle cx="0" cy={y} r="4.5" fill={CONECTORES[e.socket] ?? CONECTORES.float} stroke="#111" />
          </g>
        );
      })}
    </g>
  );
}

function DiagramaNodos({ bloque }) {
  const nodos = useMemo(() => bloque.nodes ?? [], [bloque.nodes]);
  const enlaces = useMemo(() => bloque.links ?? [], [bloque.links]);
  const dibujo = useMemo(() => acomodar(nodos, enlaces), [nodos, enlaces]);
  const orden = useMemo(() => ordenFlujo(nodos, enlaces), [nodos, enlaces]);
  const [elegido, setElegido] = useState(null);
  const [paso, setPaso] = useState(null);

  if (!dibujo || !nodos.length) return null;
  const activo = paso !== null ? orden[paso] : elegido;
  const nodoActivo = nodos.find((n) => n.id === activo);
  const lineasActivas = new Set(dibujo.lineas.filter((l) => l.desde === activo || l.hasta === activo).map((l) => l.i));
  const vecinos = new Set(dibujo.lineas.filter((l) => lineasActivas.has(l.i)).flatMap((l) => [l.desde, l.hasta]));

  const elegir = (id) => {
    setPaso(null);
    setElegido((actual) => (actual === id ? null : id));
  };

  return (
    <section className="nodos corte-poly min-w-0 border border-white/10 bg-superficie/90 p-5 sm:p-7">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {bloque.title && <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-neon">{bloque.title}</h3>}
        <div className="flex gap-2">
          {paso === null ? (
            <button type="button" onClick={() => setPaso(0)} className="visor-malla__modo">
              Recorrer el flujo ▸
            </button>
          ) : (
            <>
              <button type="button" onClick={() => setPaso((p) => Math.max(0, p - 1))} disabled={paso === 0} className="visor-malla__modo">
                ◂ Anterior
              </button>
              <span className="self-center font-mono text-xs text-white/55">
                {paso + 1}/{orden.length}
              </span>
              <button
                type="button"
                onClick={() => setPaso((p) => (p + 1 < orden.length ? p + 1 : null))}
                className="visor-malla__modo"
              >
                {paso + 1 < orden.length ? 'Siguiente ▸' : 'Terminar ✓'}
              </button>
            </>
          )}
        </div>
      </header>

      <div className="nodos__lienzo corte-poly-sm overflow-x-auto">
        <svg
          viewBox={`0 0 ${dibujo.ancho} ${dibujo.alto}`}
          className="block w-full"
          style={{ minWidth: `${Math.round(dibujo.ancho * 0.72)}px` }}
          role="group"
          aria-label={`Diagrama de nodos: ${nodos.map((n) => n.title).join(', ')}`}
        >
          {dibujo.lineas.map((l) => {
            const encendida = lineasActivas.has(l.i);
            return (
              <path
                key={l.i}
                d={l.d}
                fill="none"
                stroke={l.color}
                strokeWidth={encendida ? 3 : 2}
                strokeOpacity={activo && !encendida ? 0.2 : 0.9}
                className={encendida ? 'nodos__enlace--activo' : undefined}
              />
            );
          })}
          {nodos.map((nodo) => (
            <Nodo
              key={nodo.id}
              nodo={nodo}
              caja={dibujo.cajas.get(nodo.id)}
              activo={nodo.id === activo}
              atenuado={Boolean(activo) && nodo.id !== activo && !vecinos.has(nodo.id)}
              alElegir={() => elegir(nodo.id)}
            />
          ))}
        </svg>
      </div>

      <div className="nodos__nota mt-3 min-h-[3.5rem]" aria-live="polite">
        {nodoActivo ? (
          <p className="leading-relaxed text-texto/90">
            <span className="mr-2 inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white" style={{ background: (CLASES_NODO[nodoActivo.kind] ?? CLASES_NODO.converter).color }}>
              {(CLASES_NODO[nodoActivo.kind] ?? CLASES_NODO.converter).nombre}
            </span>
            <strong className="text-white">{nodoActivo.title}.</strong> {nodoActivo.note ?? ''}
          </p>
        ) : (
          <p className="text-sm text-white/55">Toca un nodo para ver qué hace y por dónde viaja su dato.</p>
        )}
      </div>
      {bloque.caption && <p className="mt-2 text-sm text-white/55">{bloque.caption}</p>}
    </section>
  );
}

export default DiagramaNodos;
