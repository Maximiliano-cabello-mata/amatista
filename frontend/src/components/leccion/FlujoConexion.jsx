// Quién le habla a quién (bloque «connection_flow»): nodos (la plataforma, el servidor, Blender…)
// y mensajes que viajan entre ellos. Al elegir un mensaje, un paquete recorre su flecha y abajo
// se explica qué lleva. «Ver en orden» los reproduce uno tras otro.
// Bloque: {"type": "connection_flow", "title"?, "nodes": [{id, label, icon?}],
//          "messages": [{from, to, label, text}], "caption"?}.
import { useEffect, useId, useRef, useState } from 'react';
import { TextoEnLinea } from './Markdown';
import { curvaMensaje, mensajesValidos, posicionesNodos } from './recursos';

const ANCHO = 320;
const ALTO = 150;
const PASO_MS = 2600;

// Íconos de los nodos: dibujos simples de 28 × 28 centrados en 0,0.
function IconoNodo({ icono }) {
  switch (icono) {
    case 'plataforma':
      return (
        <g className="flujo__icono">
          <rect x="-11" y="-9" width="22" height="16" rx="2" />
          <path d="M-5,11 h10 M0,7 v4" />
          <polygon points="0,-5 4,-1 0,3 -4,-1" className="flujo__icono-relleno" />
        </g>
      );
    case 'servidor':
      return (
        <g className="flujo__icono">
          <rect x="-9" y="-11" width="18" height="7" rx="1.5" />
          <rect x="-9" y="-3" width="18" height="7" rx="1.5" />
          <rect x="-9" y="5" width="18" height="7" rx="1.5" />
          <circle cx="5" cy="-7.5" r="1.2" className="flujo__icono-relleno" />
          <circle cx="5" cy="0.5" r="1.2" className="flujo__icono-relleno" />
        </g>
      );
    case 'blender':
      return (
        <g className="flujo__icono">
          <circle cx="2" cy="1" r="8" />
          <circle cx="2" cy="1" r="3" className="flujo__icono-relleno" />
          <path d="M-10,-6 L2,-7 M-9,-1 L-6,-1" />
        </g>
      );
    case 'alumno':
      return (
        <g className="flujo__icono">
          <circle cx="0" cy="-5" r="5" />
          <path d="M-9,11 Q0,-2 9,11" />
        </g>
      );
    default:
      return <polygon points="0,-9 8,-4 8,5 0,10 -8,5 -8,-4" className="flujo__icono flujo__icono-relleno" />;
  }
}

function FlujoConexion({ bloque }) {
  const idTitulo = useId();
  const nodos = bloque.nodes ?? [];
  const mensajes = mensajesValidos(bloque);
  const posiciones = posicionesNodos(nodos, ANCHO, ALTO);
  const [actual, setActual] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [vistos, setVistos] = useState(() => new Set([0]));
  const temporizador = useRef(null);

  useEffect(() => () => clearTimeout(temporizador.current), []);
  useEffect(() => {
    if (!reproduciendo) return undefined;
    temporizador.current = setTimeout(() => {
      if (actual >= mensajes.length - 1) {
        setReproduciendo(false);
        return;
      }
      setActual(actual + 1);
      setVistos((v) => new Set(v).add(actual + 1));
    }, PASO_MS);
    return () => clearTimeout(temporizador.current);
  }, [reproduciendo, actual, mensajes.length]);

  if (nodos.length < 2 || !mensajes.length) return null;

  const elegir = (i) => {
    setReproduciendo(false);
    setActual(i);
    setVistos((v) => new Set(v).add(i));
  };
  const reproducir = () => {
    setActual(0);
    setVistos((v) => new Set(v).add(0));
    setReproduciendo(true);
  };
  const mensaje = mensajes[actual];

  return (
    <section aria-labelledby={idTitulo} className="flujo corte-poly border border-white/10 bg-superficie/90 p-5 sm:p-7">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 id={idTitulo} className="font-mono text-xs uppercase tracking-[0.25em] text-neon">
          {bloque.title ?? 'Así se hablan'}
        </h3>
        <button
          type="button"
          onClick={reproducir}
          className="corte-poly-sm bg-white/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white/75 hover:bg-white/10 hover:text-white"
        >
          {reproduciendo ? '▶ Reproduciendo…' : '▶ Ver en orden'}
        </button>
      </header>

      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="w-full" role="img" aria-label="Diagrama de mensajes entre las partes">
        <defs>
          <marker id={`${idTitulo}-flecha`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" className="flujo__punta" />
          </marker>
        </defs>
        {mensajes.map((m, i) => {
          const { d } = curvaMensaje(posiciones[m.from], posiciones[m.to], ALTO);
          const activo = i === actual;
          return (
            <path
              key={`${m.from}-${m.to}-${i}`}
              d={d}
              className={`flujo__ruta ${activo ? 'flujo__ruta--activa' : ''}`}
              markerEnd={activo ? `url(#${idTitulo}-flecha)` : undefined}
            />
          );
        })}
        {(() => {
          const { d, medio } = curvaMensaje(posiciones[mensaje.from], posiciones[mensaje.to], ALTO);
          return (
            <g key={`${actual}-${reproduciendo}`} className="flujo__paquete">
              <circle r="5" className="flujo__paquete-luz" cx={medio.x} cy={medio.y}>
                <animateMotion dur="1.4s" repeatCount="indefinite" path={d} />
              </circle>
            </g>
          );
        })()}
        {nodos.map((nodo) => {
          const p = posiciones[nodo.id];
          const habla = nodo.id === mensaje.from || nodo.id === mensaje.to;
          return (
            <g key={nodo.id} transform={`translate(${p.x},${p.y})`} className={`flujo__nodo ${habla ? 'flujo__nodo--activo' : ''}`}>
              <polygon points="-22,-13 0,-26 22,-13 22,13 0,26 -22,13" className="flujo__hexagono" />
              <IconoNodo icono={nodo.icon} />
              <text y="42" textAnchor="middle" className="flujo__nombre">
                {nodo.label}
              </text>
            </g>
          );
        })}
      </svg>

      <ol className="mt-3 flex flex-wrap gap-2" aria-label="Mensajes">
        {mensajes.map((m, i) => (
          <li key={`${m.label}-${i}`}>
            <button
              type="button"
              onClick={() => elegir(i)}
              aria-pressed={i === actual}
              className={`corte-poly-sm border px-3 py-1.5 text-left text-sm transition-colors ${
                i === actual
                  ? 'border-neon/60 bg-neon/10 text-white'
                  : vistos.has(i)
                    ? 'border-emerald-400/25 bg-emerald-400/5 text-texto/80 hover:border-neon/40'
                    : 'border-white/10 bg-base/60 text-texto/70 hover:border-neon/40'
              }`}
            >
              <span className="mr-1.5 font-mono text-[11px] text-white/45">{i + 1}</span>
              {m.label}
            </button>
          </li>
        ))}
      </ol>

      <div key={actual} className="corte-poly-sm animar-entrar mt-3 border-l-4 border-neon/60 bg-base/60 p-4" aria-live="polite">
        <p className="font-mono text-[11px] uppercase tracking-widest text-amatista-claro">
          {nodos.find((n) => n.id === mensaje.from)?.label} → {nodos.find((n) => n.id === mensaje.to)?.label}
        </p>
        <p className="mt-1 font-bold text-white">{mensaje.label}</p>
        <p className="mt-1 leading-relaxed text-texto/80">
          <TextoEnLinea texto={mensaje.text} />
        </p>
      </div>
      {bloque.caption && <p className="mt-3 text-sm text-texto/60">{bloque.caption}</p>}
    </section>
  );
}

export default FlujoConexion;
