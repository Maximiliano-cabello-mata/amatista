// Recorrido por una pantalla (bloque «ui_tour»): un dibujo esquemático de la plataforma, de una
// lección o de Blender con el add-on, y paradas que iluminan una zona cada una. Se avanza con
// los botones, con las flechas del teclado o tocando los números del dibujo.
// Bloque: {"type": "ui_tour", "screen": "plataforma|leccion|blender", "title"?, "stops": [{area, title, text}]}.
import { useId, useState } from 'react';
import { TextoEnLinea } from './Markdown';
import { centroZona, moverParada, PANTALLAS, paradasDe } from './recursos';

const R = 3; // radio de las esquinas del dibujo

// Lo que hay dentro de cada zona: rayitas de texto, botones, el cubo… (decoración, sin texto real).
function Relleno({ id, z }) {
  const lineas = (n, desde = 8, ancho = 0.7) =>
    Array.from({ length: n }, (_, i) => (
      <rect key={i} x={z.x + 6} y={z.y + desde + i * 7} width={(z.w - 12) * (i % 2 ? ancho * 0.8 : ancho)} height="3" rx="1.5" className="recorrido__linea" />
    ));
  switch (id) {
    case 'barra':
      return (
        <>
          <polygon points={`${z.x + 8},${z.y + 12} ${z.x + 14},${z.y + 6} ${z.x + 20},${z.y + 12} ${z.x + 14},${z.y + 18}`} className="recorrido__acento" />
          <rect x={z.x + 26} y={z.y + 10} width="44" height="4" rx="2" className="recorrido__linea" />
        </>
      );
    case 'avance':
      return (
        <>
          <rect x={z.x + 4} y={z.y + 6} width={z.w - 30} height="4" rx="2" className="recorrido__linea" />
          <rect x={z.x + 4} y={z.y + 6} width={(z.w - 30) * 0.6} height="4" rx="2" className="recorrido__acento" />
          <text x={z.x + z.w - 22} y={z.y + 12} className="recorrido__mini">🔥3</text>
        </>
      );
    case 'ayuda':
      return <text x={z.x + z.w / 2} y={z.y + 12} textAnchor="middle" className="recorrido__mini">?</text>;
    case 'continuar':
    case 'completar':
      return <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 3} textAnchor="middle" className="recorrido__boton-texto">{id === 'continuar' ? '▶ CONTINUAR' : 'COMPLETAR ▶'}</text>;
    case 'cursos':
      return [0, 1].map((i) => (
        <g key={i}>
          <rect x={z.x + 6 + i * 88} y={z.y + 8} width="82" height={z.h - 16} rx={R} className="recorrido__sub" />
          <polygon points={`${z.x + 47 + i * 88},${z.y + 24} ${z.x + 59 + i * 88},${z.y + 38} ${z.x + 47 + i * 88},${z.y + 52} ${z.x + 35 + i * 88},${z.y + 38}`} className={i ? 'recorrido__neon' : 'recorrido__naranja'} />
          <rect x={z.x + 14 + i * 88} y={z.y + 64} width="60" height="4" rx="2" className="recorrido__linea" />
          <rect x={z.x + 14 + i * 88} y={z.y + 74} width="44" height="3" rx="1.5" className="recorrido__linea" />
        </g>
      ));
    case 'panel':
      return (
        <>
          <circle cx={z.x + 20} cy={z.y + z.h / 2} r="11" className="recorrido__anillo" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={z.x + 38} y={z.y + 14 + i * 9} width={i === 1 ? 30 : 46} height="4" rx="2" className="recorrido__linea" />
          ))}
        </>
      );
    case 'blender':
      return (
        <>
          <circle cx={z.x + 16} cy={z.y + z.h / 2} r="8" className="recorrido__naranja" />
          <path d={`M${z.x + 32},${z.y + z.h / 2} h12`} className="recorrido__enlace" />
          <circle cx={z.x + 56} cy={z.y + z.h / 2} r="3" className="recorrido__acento" />
        </>
      );
    case 'titulo':
      return <rect x={z.x + 4} y={z.y + 6} width={z.w * 0.6} height="9" rx="2" className="recorrido__linea-fuerte" />;
    case 'quehacer':
      return <rect x={z.x + 4} y={z.y + 5} width={z.w * 0.8} height="4" rx="2" className="recorrido__neon-suave" />;
    case 'teoria':
      return lineas(5, 7, 0.9);
    case 'actividad':
      return [0, 1, 2].map((i) => (
        <rect key={i} x={z.x + 8} y={z.y + 8 + i * 13} width={z.w - 16} height="9" rx="2" className={i === 1 ? 'recorrido__opcion-bien' : 'recorrido__sub'} />
      ));
    case 'hexagonos':
      return [0, 1, 2, 3].map((i) => (
        <polygon
          key={i}
          points={`${z.x + 8 + i * 14},${z.y + 5} ${z.x + 14 + i * 14},${z.y + 5} ${z.x + 17 + i * 14},${z.y + 9} ${z.x + 14 + i * 14},${z.y + 13} ${z.x + 8 + i * 14},${z.y + 13} ${z.x + 5 + i * 14},${z.y + 9}`}
          className={i < 3 ? 'recorrido__verde' : 'recorrido__linea'}
        />
      ));
    case 'mascota':
      return (
        <g className="recorrido__mascota">
          <rect x={z.x + 6} y={z.y + 4} width={z.w - 12} height="20" rx="4" className="recorrido__sub" />
          <rect x={z.x + 20} y={z.y + 32} width="18" height="18" rx="3" className="recorrido__acento" />
          <rect x={z.x + 24} y={z.y + 38} width="3" height="3" className="recorrido__ojo" />
          <rect x={z.x + 31} y={z.y + 38} width="3" height="3" className="recorrido__ojo" />
        </g>
      );
    case 'herramientas':
      return [0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={z.x + 3} y={z.y + 6 + i * 18} width="12" height="12" rx="2" className={i === 2 ? 'recorrido__acento' : 'recorrido__sub'} />
      ));
    case 'vista3d':
      return (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={`h${i}`} x1={z.x} y1={z.y + 100 + i * 14} x2={z.x + z.w} y2={z.y + 100 + i * 14 - 20} className="recorrido__rejilla" />
          ))}
          <line x1={z.x} y1={z.y + 150} x2={z.x + z.w} y2={z.y + 112} className="recorrido__eje-x" />
          <line x1={z.x + 110} y1={z.y + 60} x2={z.x + 90} y2={z.y + z.h} className="recorrido__eje-y" />
          <g transform={`translate(${z.x + 64},${z.y + 46})`}>
            <polygon points="0,14 22,4 44,14 22,24" className="recorrido__cubo-arriba" />
            <polygon points="0,14 22,24 22,50 0,40" className="recorrido__cubo-lado" />
            <polygon points="22,24 44,14 44,40 22,50" className="recorrido__cubo-frente" />
          </g>
        </g>
      );
    case 'tarjeta':
      return (
        <>
          <rect x={z.x} y={z.y} width={z.w} height="14" rx={R} className="recorrido__franja" />
          <rect x={z.x + 6} y={z.y + 4} width="6" height="6" className="recorrido__acento" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={z.x + 10 + i * 9} cy={z.y + 22} r="2.5" className={i < 2 ? 'recorrido__verde' : i === 2 ? 'recorrido__acento' : 'recorrido__linea'} />
          ))}
          {lineas(3, 32, 0.8)}
          <rect x={z.x + 6} y={z.y + 56} width="14" height="9" rx="2" className="recorrido__tecla" />
          <rect x={z.x + 24} y={z.y + 56} width="14" height="9" rx="2" className="recorrido__tecla" />
        </>
      );
    case 'molde':
      return (
        <g className="recorrido__molde">
          <polygon points={`${z.x + 6},${z.y + 22} ${z.x + 32},${z.y + 10} ${z.x + 58},${z.y + 22} ${z.x + 32},${z.y + 34}`} />
          <polygon points={`${z.x + 6},${z.y + 22} ${z.x + 32},${z.y + 34} ${z.x + 32},${z.y + 52} ${z.x + 6},${z.y + 40}`} />
          <polygon points={`${z.x + 32},${z.y + 34} ${z.x + 58},${z.y + 22} ${z.x + 58},${z.y + 40} ${z.x + 32},${z.y + 52}`} />
        </g>
      );
    case 'barra_n':
      return (
        <>
          <rect x={z.x + z.w - 8} y={z.y + 10} width="6" height="34" rx="1" className="recorrido__acento" />
          <rect x={z.x + 4} y={z.y + 8} width={z.w - 16} height="10" rx="2" className="recorrido__sub" />
          <rect x={z.x + 4} y={z.y + 24} width={z.w - 16} height="16" rx="2" className="recorrido__boton" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={z.x + 4} y={z.y + 48 + i * 10} width={(z.w - 16) * (i === 1 ? 0.6 : 0.85)} height="4" rx="2" className="recorrido__linea" />
          ))}
          <rect x={z.x + 4} y={z.y + 84} width={(z.w - 20) / 2} height="10" rx="2" className="recorrido__sub" />
          <rect x={z.x + 6 + (z.w - 20) / 2} y={z.y + 84} width={(z.w - 20) / 2} height="10" rx="2" className="recorrido__sub" />
        </>
      );
    case 'outliner':
    case 'propiedades':
      return lineas(id === 'outliner' ? 6 : 12, 8, 0.75);
    default:
      return null;
  }
}

function RecorridoPantalla({ bloque }) {
  const idTitulo = useId();
  const pantalla = PANTALLAS[bloque.screen];
  const paradas = paradasDe(bloque);
  const [indice, setIndice] = useState(0);
  const [vistas, setVistas] = useState(() => new Set([0]));
  if (!pantalla || !paradas.length) return null;

  const ir = (nuevo) => {
    setIndice(nuevo);
    setVistas((previas) => new Set(previas).add(nuevo));
  };
  const parada = paradas[indice];
  const zonaActiva = parada.area;
  const alTeclado = (evento) => {
    if (evento.key === 'ArrowRight') ir(moverParada(indice, 1, paradas.length));
    else if (evento.key === 'ArrowLeft') ir(moverParada(indice, -1, paradas.length));
    else return;
    evento.preventDefault();
  };

  return (
    <section
      aria-labelledby={idTitulo}
      className="recorrido corte-poly border border-white/10 bg-superficie/90 p-5 sm:p-7"
      onKeyDown={alTeclado}
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 id={idTitulo} className="font-mono text-xs uppercase tracking-[0.25em] text-neon">
          {bloque.title ?? `Recorrido · ${pantalla.titulo}`}
        </h3>
        <span className={`font-mono text-[11px] uppercase tracking-widest ${vistas.size === paradas.length ? 'text-emerald-300' : 'text-white/50'}`}>
          {vistas.size === paradas.length ? '✓ Recorrido completo' : `Visto ${vistas.size} / ${paradas.length}`}
        </span>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center">
        <svg viewBox="-4 -4 328 208" className="recorrido__dibujo w-full" role="img" aria-label={`Dibujo de ${pantalla.titulo}`}>
          <rect x="-2" y="-2" width="324" height="204" rx="8" className="recorrido__marco" />
          {Object.entries(pantalla.zonas).map(([id, z]) => (
            <g key={id} className={`recorrido__zona ${id === zonaActiva ? 'recorrido__zona--activa' : ''}`}>
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={R} className="recorrido__caja" />
              <Relleno id={id} z={z} />
            </g>
          ))}
          {paradas.map((p, i) => {
            const c = centroZona(pantalla.zonas[p.area]);
            const activa = i === indice;
            return (
              <g
                key={`${p.area}-${i}`}
                className={`recorrido__marca ${activa ? 'recorrido__marca--activa' : ''} ${vistas.has(i) ? 'recorrido__marca--vista' : ''}`}
                transform={`translate(${c.x},${c.y})`}
                onClick={() => ir(i)}
                role="button"
                tabIndex={-1}
                aria-label={`Parada ${i + 1}: ${p.title}`}
              >
                {activa && <circle r="13" className="recorrido__onda" />}
                <circle r="8.5" />
                <text y="3.5" textAnchor="middle">{i + 1}</text>
              </g>
            );
          })}
        </svg>

        <div>
          <ol className="mb-3 flex gap-1.5" aria-label="Paradas">
            {paradas.map((p, i) => (
              <li key={`${p.area}-${i}`}>
                <button
                  type="button"
                  onClick={() => ir(i)}
                  aria-current={i === indice ? 'step' : undefined}
                  aria-label={`Parada ${i + 1}: ${p.title}`}
                  className={`hexagono block h-3.5 w-4 transition-colors ${
                    i === indice ? 'bg-neon' : vistas.has(i) ? 'bg-emerald-400/70' : 'bg-white/15 hover:bg-white/35'
                  }`}
                />
              </li>
            ))}
          </ol>
          <div key={indice} className="animar-entrar" aria-live="polite">
            <p className="font-mono text-[11px] uppercase tracking-widest text-amatista-claro">
              {indice + 1} de {paradas.length} · {pantalla.zonas[zonaActiva].nombre}
            </p>
            <p className="mt-1 text-xl font-bold text-white">{parada.title}</p>
            <p className="mt-2 leading-relaxed text-texto/80">
              <TextoEnLinea texto={parada.text} />
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => ir(moverParada(indice, -1, paradas.length))}
              disabled={indice === 0}
              className="corte-poly-sm bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white/75 hover:bg-white/10 disabled:opacity-30"
            >
              ◂ Anterior
            </button>
            <button
              type="button"
              onClick={() => ir(moverParada(indice, 1, paradas.length))}
              disabled={indice === paradas.length - 1}
              className="corte-poly-sm bg-amatista px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-white hover:brightness-110 disabled:opacity-30"
            >
              Siguiente ▸
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RecorridoPantalla;
