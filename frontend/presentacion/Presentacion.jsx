// El montaje de la presentación: qué escena se ve en cada segundo, con fundidos, barridos en los
// cambios de capítulo, barra de capítulos y subtítulos. Todo se calcula desde v = segundo de la voz.
import { useEffect, useState } from 'react';
import { Barrido } from '../pelicula/piezas.jsx';
import { curva, tramo } from '../pelicula/tiempo';
import { CAPITULOS, DURACION, PRE, SUBTITULOS, VOZ, aLinea, aVoz, enHistoria } from './tiempos.js';
import { ESCENAS, reloj } from './linea.js';
import { Fondo } from './escenas.jsx';
import { FondoGlobal } from './contexto.js';

const CRUCE = 0.45;
// Las escenas se encogen un poco hacia arriba: la franja de abajo queda libre para subtítulos y capítulos.
const ZONA = 'translate(0, 0) scale(0.885)';
const ORIGEN = '50% 96px';
// El reto ya se lee en pantalla palabra por palabra: ahí no hacen falta subtítulos.
const SIN_SUBTITULOS = [8.1, 35.0];

function Marco({ v, l }) {
  const visible = curva.sale(tramo(v, 1.0, 2.0)) * (1 - curva.suave(tramo(v, 232.6, 233.4)));
  const caps = CAPITULOS.map((c) => ({ ...c, desde: aLinea(c.desde), hasta: aLinea(c.hasta) }));
  const cap = caps.find((c) => l >= c.desde && l < c.hasta);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: visible, pointerEvents: 'none', zIndex: 30 }}>
      <div style={{ position: 'absolute', left: 48, top: 34, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 22, height: 26, background: 'var(--gema)', clipPath: 'polygon(50% 0,100% 28%,100% 72%,50% 100%,0 72%,0 28%)' }} />
        <span className="gema-texto" style={{ font: '800 24px var(--sans)', letterSpacing: '0.34em' }}>AMATISTA</span>
      </div>
      <div style={{ position: 'absolute', right: 48, top: 34, font: '600 18px var(--mono)', letterSpacing: '0.2em', color: 'rgb(232 218 239 / 0.75)' }}>
        HACK4EDU 2026 · RETO 2 · OFFLINE-FIRST
      </div>
      {/* Barra de capítulos */}
      <div style={{ position: 'absolute', left: 48, right: 48, bottom: 26, display: 'flex', gap: 10 }}>
        {caps.map((c) => {
          const k = tramo(l, c.desde, c.hasta);
          const activo = c === cap;
          return (
            <div key={c.n} style={{ flex: c.hasta - c.desde }}>
              <div style={{ font: `600 15px var(--mono)`, letterSpacing: '0.16em', marginBottom: 7, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                color: activo ? 'var(--niebla)' : 'rgb(232 218 239 / 0.38)' }}>{c.n} · {c.texto}</div>
              <div style={{ height: 4, background: 'rgb(195 155 211 / 0.18)' }}>
                <div style={{ height: '100%', width: `${k * 100}%`, background: activo ? 'var(--gema)' : 'rgb(195 155 211 / 0.55)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Subtitulo({ v, l }) {
  if (enHistoria(l)) return null;
  if (v >= SIN_SUBTITULOS[0] && v < SIN_SUBTITULOS[1]) return null;
  const s = SUBTITULOS.find(([a, b]) => v >= a - 0.08 && v < b + 0.25);
  if (!s) return null;
  const [a, b, texto] = s;
  const o = curva.sale(tramo(v, a - 0.08, a + 0.12)) * (1 - tramo(v, b + 0.1, b + 0.25));
  return <div className="subtitulo faceta-sm" style={{ opacity: o }}>{texto}</div>;
}

export function Montaje({ t }) {
  const l = t - PRE; // línea: segundos desde la voz, contando el hueco de la historia
  const v = aVoz(l); // segundo de la voz (se detiene durante la historia)
  const negro = curva.suave(tramo(t, DURACION - 1.2, DURACION));
  let barrido = 0;
  let tonoSuma = 0;
  let pesoSuma = 0;
  const capas = [];
  ESCENAS.forEach((e, i) => {
    const sig = ESCENAS[i + 1];
    const ant = ESCENAS[i - 1];
    const entraCruce = i > 0 && !e.barrido;
    const saleCruce = sig && !sig.barrido;
    const a = entraCruce ? e.desde - CRUCE : e.desde;
    const b = saleCruce ? e.hasta + CRUCE : e.hasta;
    if (l >= a && l < b) {
      let o = 1;
      if (entraCruce) o *= curva.suave(tramo(l, e.desde - CRUCE, e.desde + CRUCE));
      if (saleCruce) o *= 1 - curva.suave(tramo(l, e.hasta - CRUCE, e.hasta + CRUCE));
      if (!ant) o *= curva.suave(tramo(l, -PRE, -PRE + 0.8));
      const { Escena } = e;
      const tono = e.id === 'cierre' ? 0.2 + curva.sale(tramo(v, 228.42, 229.0)) * 0.6 : (e.tono ?? 0);
      tonoSuma += tono * o;
      pesoSuma += o;
      capas.push(
        <div key={e.id} style={{ position: 'absolute', inset: 0, opacity: o, transform: ZONA, transformOrigin: ORIGEN }}><Escena v={v} l={l} /></div>,
      );
    }
    if (e.barrido && Math.abs(l - e.desde) < 0.6) barrido = tramo(l, e.desde - 0.55, e.desde + 0.55);
  });
  return (
    <div className="pres">
      <div style={{ position: 'absolute', inset: 0, opacity: curva.suave(tramo(l, -PRE, -PRE + 0.8)) * (1 - negro) }}>
        <Fondo v={l} tono={pesoSuma ? tonoSuma / pesoSuma : 0} />
      </div>
      <FondoGlobal.Provider value>{capas}</FondoGlobal.Provider>
      <Marco v={v} l={l} />
      <Subtitulo v={v} l={l} />
      <Barrido k={barrido} />
      {negro > 0 && <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: negro, zIndex: 70 }} />}
    </div>
  );
}

export default function Presentacion({ inicial = 0, automatico = true }) {
  const [t, setT] = useState(inicial);
  useEffect(() => {
    reloj.fijar = setT;
    if (!automatico) return undefined;
    const audio = new Audio('/presentacion/media/voz_mejorada.wav');
    const inicio = performance.now() - inicial * 1000;
    let pedido = requestAnimationFrame(function paso(ahora) {
      const tt = (ahora - inicio) / 1000;
      const ll = tt - PRE;
      const habla = ll >= 0 && !enHistoria(ll) && aVoz(ll) < VOZ;
      if (habla && audio.paused) { audio.currentTime = aVoz(ll); audio.play().catch(() => {}); }
      if (!habla && !audio.paused) audio.pause();
      setT(Math.min(tt, DURACION));
      pedido = requestAnimationFrame(paso);
    });
    return () => { cancelAnimationFrame(pedido); audio.pause(); };
  }, [inicial, automatico]);
  return <Montaje t={t} />;
}
