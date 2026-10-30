// «Línea de tiempo» (bloque keyframe_sim): la animación de Blender en pequeño. Mueves el cabezal
// a un fotograma, subes o bajas la pelota y pulsas «Insertar clave» (la tecla I de Blender).
// Al reproducir, la pelota pasa sola entre tus claves con la curva suave de Blender. Se
// resuelve cuando cada meta (fotograma y altura) tiene su clave.
// Bloque: {"type": "keyframe_sim", "id", "title"?, "caption"?, "frames"?: 60, "targets": [{frame, height}]}.
import { useEffect, useId, useRef, useState } from 'react';
import { interpolarClaves, revisarClaves, textoMeta } from '../graficos';
import { TextoEnLinea } from '../Markdown';
import { Tecla } from '../Tecla';
import { useActividad } from './hooks';
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';

const FPS = 24;

function LineaClaves({ bloque, alCompletar, resuelta }) {
  const { resultado, resolver } = useActividad(alCompletar);
  const total = Math.min(120, Math.max(12, Number(bloque.frames) || 60));
  const metas = bloque.targets ?? [];
  const [cuadro, setCuadro] = useState(1);
  const [altura, setAltura] = useState(0.5);
  const [claves, setClaves] = useState({});
  const [reproduciendo, setReproduciendo] = useState(false);
  const idCabezal = useId();
  const idAltura = useId();
  const reloj = useRef(null);
  const revision = revisarClaves(claves, metas);
  const animada = interpolarClaves(claves, cuadro);
  // Al reproducir, la pelota obedece a la animación; en pausa, a lo que ajustas.
  const mostrada = reproduciendo && animada !== null ? animada : altura;

  useEffect(() => {
    if (!resultado && metas.length && revision.every((r) => r.ok)) resolver(true, 1);
  }, [revision, metas.length, resultado, resolver]);

  useEffect(() => {
    if (!reproduciendo) return undefined;
    let anterior = performance.now();
    let acumulado = 0;
    const paso = (ahora) => {
      acumulado += ahora - anterior;
      anterior = ahora;
      if (acumulado >= 1000 / FPS) {
        acumulado = 0;
        setCuadro((c) => (c >= total ? 1 : c + 1));
      }
      reloj.current = requestAnimationFrame(paso);
    };
    reloj.current = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(reloj.current);
  }, [reproduciendo, total]);

  const irA = (nuevo) => {
    setReproduciendo(false);
    setCuadro(nuevo);
    const valor = interpolarClaves(claves, nuevo);
    if (claves[nuevo] !== undefined) setAltura(claves[nuevo]);
    else if (valor !== null) setAltura(valor);
  };
  const insertar = () => {
    setReproduciendo(false);
    setClaves((previas) => ({ ...previas, [cuadro]: Math.round(altura * 100) / 100 }));
  };
  const borrar = () => {
    setClaves((previas) => {
      const nuevas = { ...previas };
      delete nuevas[cuadro];
      return nuevas;
    });
  };
  const teclear = (e) => {
    if (e.key === 'i' || e.key === 'I') {
      e.preventDefault();
      insertar();
    } else if (e.key === ' ') {
      e.preventDefault();
      setReproduciendo((r) => !r);
    }
  };

  const yPelota = 30 + (1 - mostrada) * 150;
  const aplastada = mostrada < 0.06 ? 0.75 : 1;
  const retro = resultado ? { tipo: 'bien', texto: 'Eso es animar: tú pones las claves y el programa dibuja todo lo que pasa entre ellas.' } : null;

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.title ?? 'Haz rebotar la pelota'} resultado={resultado} resuelta={resuelta}>
      {bloque.caption && (
        <p className="mb-4 text-texto/80">
          <TextoEnLinea texto={bloque.caption} />
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]" onKeyDown={teclear}>
        <div className="corte-poly flex gap-3 bg-[#2b2b2b] p-3">
          <svg viewBox="0 0 260 220" className="block h-auto min-w-0 flex-1" aria-hidden="true">
            <defs>
              <linearGradient id={`${idAltura}-pelota`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#FFB27A" />
                <stop offset="1" stopColor="#C2410C" />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map((h) => (
              <line key={h} x1="20" x2="240" y1={30 + (1 - h) * 150 + 18} y2={30 + (1 - h) * 150 + 18} stroke="#fff" strokeOpacity="0.06" />
            ))}
            <rect x="10" y="198" width="240" height="14" fill="#3a3a3a" />
            <ellipse cx="130" cy="200" rx={26 - mostrada * 12} ry="4" fill="#000" opacity={0.45 - mostrada * 0.25} />
            {metas.map((meta) =>
              meta.frame === cuadro ? (
                <circle key={meta.frame} cx="130" cy={30 + (1 - meta.height) * 150} r="18" fill="none" stroke="#00E5FF" strokeDasharray="4 3" strokeWidth="1.5" />
              ) : null,
            )}
            <g transform={`translate(130 ${yPelota}) scale(${1 / aplastada} ${aplastada})`}>
              <circle r="18" fill={`url(#${idAltura}-pelota)`} />
              <polygon points="-8,-10 4,-14 10,-4" fill="#fff" opacity="0.25" />
            </g>
          </svg>
          <div className="flex flex-col items-center gap-1">
            <label htmlFor={idAltura} className="font-mono text-[11px] uppercase tracking-widest text-white/50">
              Altura
            </label>
            <input
              id={idAltura}
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={mostrada}
              onChange={(e) => {
                setReproduciendo(false);
                setAltura(Number(e.target.value));
              }}
              className="h-40 [writing-mode:vertical-lr] [direction:rtl]"
            />
          </div>
        </div>
        <aside className="text-sm">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">Tus metas</p>
          <ul className="mt-2 grid gap-1.5" aria-live="polite">
            {revision.map(({ meta, ok }) => (
              <li key={meta.frame} className={`flex items-start gap-2 ${ok ? 'text-emerald-300' : 'text-white/80'}`}>
                <span className={`mt-0.5 inline-block h-3 w-3 rotate-45 ${ok ? 'bg-emerald-400' : 'border border-white/40'}`} aria-hidden="true" />
                <button type="button" onClick={() => irA(meta.frame)} className="text-left hover:underline">
                  {textoMeta(meta)}
                  <span className="sr-only">{ok ? ' (lista)' : ' (pendiente)'}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-white/55">
            Ve al fotograma, ajusta la altura y pulsa <Tecla>I</Tecla> o «Insertar clave». Con la barra espaciadora reproduces, igual que en Blender.
          </p>
        </aside>
      </div>

      {/* Línea de tiempo: cabezal, claves (rombos) y metas (marcas cian). */}
      <div className="mt-4 rounded-sm bg-[#1d1d1d] p-3" onKeyDown={teclear}>
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
          {metas.map((meta) => (
            <span key={`m${meta.frame}`} className="absolute top-0 h-8 w-px bg-neon/50" style={{ left: `${((meta.frame - 1) / (total - 1)) * 100}%` }} aria-hidden="true" />
          ))}
          {Object.keys(claves).map((c) => (
            <span
              key={c}
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-black/50 bg-amber-300"
              style={{ left: `${((Number(c) - 1) / (total - 1)) * 100}%` }}
              aria-hidden="true"
            />
          ))}
          <span className="absolute top-0 h-8 w-0.5 -translate-x-1/2 bg-[#4f9dff]" style={{ left: `${((cuadro - 1) / (total - 1)) * 100}%` }} aria-hidden="true" />
        </div>
        <label htmlFor={idCabezal} className="sr-only">
          Fotograma actual
        </label>
        <input id={idCabezal} type="range" min="1" max={total} step="1" value={cuadro} onChange={(e) => irA(Number(e.target.value))} className="w-full accent-[#4f9dff]" />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="corte-poly-sm bg-[#4f9dff]/20 px-2 py-1 font-mono text-xs font-bold text-[#9cc6ff]">Fotograma {cuadro}</span>
          <button type="button" onClick={insertar} className={BOTON_PRINCIPAL}>
            ◆ Insertar clave
          </button>
          {claves[cuadro] !== undefined && (
            <button type="button" onClick={borrar} className={BOTON_SECUNDARIO}>
              Quitar clave
            </button>
          )}
          <button type="button" onClick={() => setReproduciendo((r) => !r)} disabled={Object.keys(claves).length < 2} className={`${BOTON_SECUNDARIO} disabled:opacity-40`}>
            {reproduciendo ? '❚❚ Pausa' : '▶ Reproducir'}
          </button>
        </div>
      </div>
      <Retroalimentacion retro={retro} />
    </MarcoActividad>
  );
}

export default LineaClaves;
