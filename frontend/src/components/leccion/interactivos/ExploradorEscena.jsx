import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { TextoEnLinea } from '../Markdown';
import { useActividad, useModuloDiferido } from './hooks';
import { metaCumplida, normalizarColor, normalizarControl, valoresIniciales, webglDisponible } from './logica';
import { MarcoActividad, Retroalimentacion } from './Marco';

const cargarEscena = () => import('./EscenaAFrame');

function formatear(control, valor) {
  if (control.param === 'rotationSpeed') return `${valor}°/s`;
  if (control.param === 'scale') return `×${Number(valor).toFixed(1)}`;
  if (control.step < 1) return Number(valor).toFixed(2);
  return String(valor);
}

// Sin WebGL: un polígono plano con tantos lados como segmentos, para que los
// controles sigan teniendo un efecto visible.
function VistaPlana({ primitiva, valores }) {
  const lados =
    primitiva === 'box' ? 4 : primitiva === 'icosahedron' ? 6 : Math.max(3, Math.round(Number(valores.segments) || 16));
  const radio = 30 * Math.min(1.5, Number(valores.scale) || 1);
  const vertices = Array.from({ length: lados }, (_, i) => {
    const angulo = (i / lados) * 2 * Math.PI - Math.PI / 2;
    return [50 + radio * Math.cos(angulo), 50 + radio * Math.sin(angulo)];
  });
  const color = normalizarColor(valores.color);
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <polygon
        points={vertices.map((v) => v.join(',')).join(' ')}
        fill={valores.wireframe ? 'none' : color}
        stroke={valores.wireframe ? color : 'rgba(255,255,255,0.25)'}
        strokeWidth="0.8"
      />
      {valores.wireframe &&
        vertices.map(([x, y], i) => <line key={i} x1="50" y1="50" x2={x} y2={y} stroke={color} strokeWidth="0.4" />)}
    </svg>
  );
}

function Control({ control, valor, alCambiar }) {
  const id = useId();
  if (control.tipo === 'toggle') {
    return (
      <div className="flex items-center justify-between gap-3">
        <span id={id} className="font-semibold text-white">
          {control.label}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(valor)}
          aria-labelledby={id}
          onClick={() => alCambiar(!valor)}
          className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${
            valor ? 'border-neon bg-neon/30' : 'border-white/20 bg-white/5'
          }`}
        >
          <span
            className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-[left,background-color] ${
              valor ? 'left-6 bg-neon' : 'left-0.5 bg-white/60'
            }`}
            aria-hidden="true"
          />
        </button>
      </div>
    );
  }
  if (control.tipo === 'color') {
    return (
      <label htmlFor={id} className="flex items-center justify-between gap-3">
        <span className="font-semibold text-white">{control.label}</span>
        <span className="flex items-center gap-2 font-mono text-xs text-white/60">
          {normalizarColor(valor)}
          <input
            id={id}
            type="color"
            value={normalizarColor(valor)}
            onChange={(evento) => alCambiar(evento.target.value)}
            className="h-9 w-12 cursor-pointer border border-white/20 bg-transparent"
          />
        </span>
      </label>
    );
  }
  return (
    <label htmlFor={id} className="block">
      <span className="flex items-center justify-between gap-3">
        <span className="font-semibold text-white">{control.label}</span>
        <span className="font-mono text-sm font-bold text-neon">{formatear(control, valor)}</span>
      </span>
      <input
        id={id}
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={valor}
        onChange={(evento) => alCambiar(Number(evento.target.value))}
        className="mt-2 w-full accent-[#00E5FF]"
      />
    </label>
  );
}

// Laboratorio 3D: una primitiva de A-Frame con controles (segmentos, color,
// alambre…). Con meta se completa al cumplirla; sin meta, al usar todos los
// controles. Sin WebGL (o sin poder cargar A-Frame) basta con interactuar.
function ExploradorEscena({ bloque, alCompletar, resuelta }) {
  const controles = useMemo(() => (bloque.controls ?? []).map(normalizarControl), [bloque.controls]);
  const [valores, setValores] = useState(() => valoresIniciales(bloque.controls));
  const [tocados, setTocados] = useState([]);
  const [con3D] = useState(() => webglDisponible());
  // Sin IntersectionObserver se carga de inmediato.
  const [cerca, setCerca] = useState(() => typeof IntersectionObserver === 'undefined');
  const lienzo = useRef(null);
  const { resultado, resolver } = useActividad(alCompletar);
  const { Componente: Escena, error } = useModuloDiferido(cargarEscena, con3D && cerca);
  const plano = !con3D || error;
  const meta = bloque.goal;
  const cumplida = meta ? metaCumplida(meta, valores) : false;

  // A-Frame se descarga cuando el bloque está por aparecer en pantalla.
  useEffect(() => {
    if (!con3D || cerca) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) setCerca(true);
      },
      { rootMargin: '300px' },
    );
    observador.observe(lienzo.current);
    return () => observador.disconnect();
  }, [con3D, cerca]);

  const cambiar = (param, valor) => {
    const nuevos = { ...valores, [param]: valor };
    const nuevosTocados = tocados.includes(param) ? tocados : [...tocados, param];
    setValores(nuevos);
    setTocados(nuevosTocados);
    if (resultado) return;
    if (plano) resolver(true, 1);
    else if (meta ? metaCumplida(meta, nuevos) : nuevosTocados.length >= controles.length) resolver(true, 1);
  };

  let retro = null;
  if (resultado) {
    retro = {
      tipo: 'bien',
      titulo: meta && !plano ? '¡Meta cumplida!' : '¡Bien explorado!',
      texto: meta && !plano ? 'Sigue moviendo los controles para ver qué más cambia.' : 'Probaste los controles de la escena.',
    };
  }

  return (
    <MarcoActividad
      bloque={bloque}
      titulo={bloque.title ?? 'Mueve los controles y observa la figura'}
      resultado={resultado}
      resuelta={resuelta}
    >
      {meta && (
        <p
          className={`corte-poly-sm mb-4 flex items-start gap-3 border px-4 py-3 transition-colors ${
            cumplida ? 'border-emerald-400/60 bg-emerald-400/10' : 'border-neon/40 bg-neon/5'
          }`}
        >
          <span
            className={`hexagono grid h-7 w-7 shrink-0 place-items-center font-mono text-xs font-bold ${
              cumplida ? 'animar-acierto bg-emerald-400 text-[#121212]' : 'bg-neon/20 text-neon'
            }`}
            aria-hidden="true"
          >
            {cumplida ? '✓' : '◎'}
          </span>
          <span>
            <span className="block font-mono text-[11px] uppercase tracking-widest text-neon">
              Meta {cumplida ? 'cumplida' : ''}
            </span>
            <span className="text-texto/90">
              <TextoEnLinea texto={meta.text} />
            </span>
          </span>
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-[3fr_2fr]">
        <div>
          <div
            ref={lienzo}
            className="corte-poly relative aspect-[4/3] w-full overflow-hidden border border-white/10 bg-[#121212]"
            role="img"
            aria-label={`Vista 3D de la figura (${bloque.primitive}) con los valores elegidos.`}
          >
            {plano ? (
              <VistaPlana primitiva={bloque.primitive} valores={valores} />
            ) : Escena ? (
              <Escena primitiva={bloque.primitive} valores={valores} />
            ) : (
              <p className="animar-pulso absolute inset-0 grid place-items-center font-mono text-xs uppercase tracking-widest text-white/50">
                Cargando motor 3D…
              </p>
            )}
          </div>
          <p className="mt-2 font-mono text-[11px] text-white/45">
            {plano
              ? 'Tu dispositivo no puede mostrar 3D aquí: te mostramos una vista plana. Mueve un control para continuar.'
              : 'Arrastra la figura de lado a lado para girarla.'}
          </p>
        </div>

        <div className="space-y-5">
          {controles.map((control) => (
            <Control
              key={control.param}
              control={control}
              valor={valores[control.param]}
              alCambiar={(valor) => cambiar(control.param, valor)}
            />
          ))}
          {!meta && !resultado && (
            <p className="font-mono text-xs text-white/45">
              Controles usados: {tocados.length} de {controles.length}
            </p>
          )}
        </div>
      </div>

      <Retroalimentacion retro={retro} />
    </MarcoActividad>
  );
}

export default ExploradorEscena;
