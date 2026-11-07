// Escenas de la presentación de Hack4Edu. Cada escena recibe v: el segundo de la VOZ (no del video),
// así cada elemento entra cuando se dice su palabra (tiempos medidos con Whisper).
import { useContext } from 'react';
import FondoLowPoly from '../src/components/FondoLowPoly.jsx';
import { BustoAvatar } from '../src/avatares/Avatar.jsx';
import { AVATARES } from '../src/avatares/catalogo.js';
import { Destellos, Flujo, Gema, Geoda, Icono, Metraje } from '../pelicula/piezas.jsx';
import { acotar, azar, curva, mezclar, tramo, vida } from '../pelicula/tiempo';
import { RETO } from './tiempos.js';
import { FondoGlobal } from './contexto.js';

const M = '/presentacion/media';
const SIEMPRE = 1e6; // «hasta el final»: vida() necesita un número finito

// ------------------------------------------------------------------ piezas

function Capa({ children, estilo }) {
  return <div style={{ position: 'absolute', inset: 0, ...estilo }}>{children}</div>;
}

// Fondo: el low poly de la plataforma bajo una luz amatista que respira, con viñeta.
export function Fondo({ v, tono = 0, matiz = [155, 89, 182], acento = [0, 229, 255] }) {
  const global = useContext(FondoGlobal);
  if (global) return null;
  const x = 50 + Math.sin(v * 0.07) * 18;
  const y = 40 + Math.cos(v * 0.05) * 12;
  return (
    <Capa>
      <Capa estilo={{ opacity: 0.55, transform: `scale(${1.06 + Math.sin(v * 0.03) * 0.02})` }}><FondoLowPoly /></Capa>
      <Capa estilo={{ background: `radial-gradient(60% 70% at ${x}% ${y}%, rgb(${matiz.join(' ')} / ${0.32 + tono * 0.2}), transparent 70%)` }} />
      <Capa estilo={{ background: `radial-gradient(40% 50% at ${100 - x}% ${100 - y}%, rgb(${acento.join(' ')} / ${0.08 + Math.max(0, tono) * 0.08}), transparent 70%)` }} />
      <Capa estilo={{ background: 'radial-gradient(120% 90% at 50% 45%, transparent 55%, rgb(5 2 10 / 0.85) 100%)' }} />
    </Capa>
  );
}

// Entra en a (desde abajo, la izquierda o creciendo) y sale en b.
function Entra({ v, a, b = SIEMPRE, d = 0.6, como = 'abajo', children, estilo }) {
  const k = vida(v, a, b, d);
  const mov = { abajo: `translateY(${(1 - k) * 46}px)`, izq: `translateX(${(1 - k) * -60}px)`, der: `translateX(${(1 - k) * 60}px)`,
    escala: `scale(${mezclar(0.86, 1, curva.rebote(acotar(k)))})` }[como];
  return <div style={{ position: 'absolute', opacity: k, transform: mov, filter: k < 1 ? `blur(${(1 - k) * 8}px)` : undefined, ...estilo }}>{children}</div>;
}

function Titulo({ v, a, b = SIEMPRE, texto, tam = 76, estilo, gema = false }) {
  const palabras = texto.split(' ');
  const salida = curva.suave(tramo(v, b, b + 0.5));
  return (
    <div style={{ position: 'absolute', font: `780 ${tam}px/1.08 var(--sans)`, letterSpacing: '-0.02em', opacity: 1 - salida, ...estilo }}>
      {palabras.map((p, i) => {
        const k = curva.sale(tramo(v, a + i * 0.06, a + i * 0.06 + 0.55));
        const brilla = gema || p.startsWith('*');
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', marginRight: '0.24em', paddingBottom: '0.1em' }}>
            <span className={brilla ? 'gema-texto' : undefined} style={{ display: 'inline-block', opacity: k, transform: `translateY(${(1 - k) * 100}%)` }}>
              {p.replace('*', '')}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function Etiqueta({ v, a, b = SIEMPRE, texto, color = 'var(--cian)', estilo }) {
  const k = vida(v, a, b, 0.5);
  return (
    <div style={{ position: 'absolute', opacity: k, transform: `translateX(${(1 - k) * -30}px)`, display: 'flex', alignItems: 'center', gap: 16,
      font: '600 22px var(--mono)', letterSpacing: '0.4em', textTransform: 'uppercase', color, ...estilo }}>
      <span style={{ width: 14, height: 14, background: color, clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }} />{texto}
    </div>
  );
}

function Contador({ v, a, hasta, d = 1.1, sufijo = '', tam = 150, estilo }) {
  const k = curva.expo(tramo(v, a, a + d));
  const n = Math.round(hasta * k).toLocaleString('en-US');
  return <div className="gema-texto" style={{ position: 'absolute', font: `800 ${tam}px/1 var(--sans)`, letterSpacing: '-0.03em', opacity: curva.sale(tramo(v, a - 0.2, a + 0.3)), ...estilo }}>{n}{sufijo}</div>;
}

// Foto real con movimiento de cámara lento (Ken Burns) y marco facetado.
function Foto({ v, a, b = SIEMPRE, src, x, y, w, h, zoom = [1.08, 1.18], hacia = [0, -2], etiqueta, rot = 0, posicion = '50% 50%' }) {
  const k = vida(v, a, b, 0.7);
  const u = tramo(v, a, b < SIEMPRE ? b + 0.7 : a + 12);
  const z = mezclar(zoom[0], zoom[1], u);
  return (
    <div className="foto faceta" style={{ left: x, top: y, width: w, height: h, opacity: k, transform: `translateY(${(1 - k) * 40}px) rotate(${rot}deg)` }}>
      <img alt="" src={src} style={{ transform: `scale(${z}) translate(${hacia[0] * u}%, ${hacia[1] * u}%)`, objectPosition: posicion }} />
      {etiqueta && (
        <div style={{ position: 'absolute', left: 24, bottom: 20, zIndex: 2, font: '600 18px var(--mono)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--niebla)' }}>
          {etiqueta}
        </div>
      )}
    </div>
  );
}

// Pantalla con barra de navegador; la imagen se desplaza despacio (como si se recorriera).
function Pantalla({ v, a, b = SIEMPRE, src, x, y, w, h, url = 'amatista-3d.tech', desplaza = 0, children, como = 'abajo' }) {
  const k = vida(v, a, b, 0.7);
  const u = curva.suave(tramo(v, a + 0.6, b < SIEMPRE ? b : a + 10));
  return (
    <div className="pantalla faceta" style={{ left: x, top: y, width: w, height: h, opacity: k,
      transform: como === 'escala' ? `scale(${mezclar(0.9, 1, curva.sale(k))})` : `translateY(${(1 - k) * 50}px)` }}>
      <div className="navegador-barra"><i /><i /><i /><span style={{ marginLeft: 14 }}>🔒 {url}</span></div>
      <div style={{ position: 'absolute', top: 42, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {src ? <img alt="" src={src} style={{ transform: `translateY(${-desplaza * u}px)`, height: 'auto', minHeight: '100%' }} /> : children}
      </div>
    </div>
  );
}

function Marca({ v, a, texto, ok = true, estilo }) {
  const k = curva.rebote(tramo(v, a, a + 0.45));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, font: '600 34px var(--sans)', opacity: acotar(k * 1.5), transform: `translateX(${(1 - acotar(k)) * -24}px)`, ...estilo }}>
      <span style={{ width: 46, height: 46, display: 'grid', placeItems: 'center', background: ok ? 'var(--cian)' : 'var(--magenta)', color: '#0d0716',
        font: '800 28px var(--sans)', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)', transform: `scale(${acotar(k)})` }}>{ok ? '✓' : '!'}</span>
      {texto}
    </div>
  );
}

function Nodo({ v, a, titulo, sub, x, y, color = 'var(--amatista)', w = 300 }) {
  const k = curva.rebote(tramo(v, a, a + 0.5));
  const brillo = vida(v, a, a + 1.2, 0.3);
  return (
    <div className="tarjeta faceta" style={{ position: 'absolute', left: x - w / 2, top: y - 60, width: w, padding: '22px 26px', textAlign: 'center',
      opacity: acotar(k * 1.4), transform: `scale(${mezclar(0.7, 1, acotar(k))})`, boxShadow: `0 0 ${brillo * 60}px ${color}` }}>
      <div style={{ font: '750 34px var(--sans)', color: '#fff' }}>{titulo}</div>
      {sub && <div style={{ marginTop: 6, font: '500 20px var(--mono)', color: 'var(--lavanda)' }}>{sub}</div>}
    </div>
  );
}

// ------------------------------------------------------------------ 0 · Apertura sin voz (19 s): quién es Amatista
// Vende Amatista, no la tecnología: la pregunta del reto, alumnos reales y la prueba de madurez (Modalidad Senior).
// Solo cifras comprobables en el repositorio. Recibe v (de −22 a −3); h = segundos desde que empieza el video.
const MADUREZ = [
  { valor: 'En producción', nota: 'amatista-3d.tech, abierta a cualquiera', icono: 'laptop' },
  { valor: '15 módulos', nota: '58 prácticas guiadas paso a paso', icono: 'escritorio' },
  { valor: 'Blender 7.1', nota: 'complemento que revisa cada paso', icono: 'chip' },
  { valor: 'Panel docente', nota: 'seguimiento real de todo el grupo', icono: 'escritorio' },
  { valor: 'Sin internet', nota: 'funciona offline y sincroniza después', icono: 'sinwifi' },
  { valor: 'Desde octubre', nota: '620 commits de trabajo continuo', icono: 'laptop' },
];

export function Intro({ v }) {
  const h = v + 22;
  const pregunta = vida(h, 0.9, 4.4, 0.5);
  const fotos = vida(h, 4.7, 10.2, 0.5);
  const madurez = vida(h, 10.5, 17.3, 0.5);
  const cierre = curva.sale(tramo(h, 17.5, 18.1));
  return (
    <Capa>
      <Fondo v={h} tono={0.1} />
      <Destellos t={h} n={30} fuerza={0.5} />
      <Entra v={h} a={0.4} b={17.3} estilo={{ left: 0, right: 0, top: 96, textAlign: 'center' }}>
        <span className="chip chip-cian faceta-sm">Hack4Edu 2026 · Modalidad Senior · Reto 2 · Educación offline-first</span>
      </Entra>
      {/* 1 · La pregunta del reto */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: 380, textAlign: 'center', opacity: pregunta }}>
        <div style={{ font: '780 64px/1.15 var(--sans)', whiteSpace: 'nowrap', transform: `translateY(${(1 - curva.sale(tramo(h, 0.9, 1.5))) * 30}px)` }}>
          ¿Y si una escuela quiere enseñar <span className="gema-texto">a crear en 3D</span>…
        </div>
        <div style={{ marginTop: 26, font: '700 60px/1.15 var(--sans)', color: 'var(--niebla)', opacity: curva.sale(tramo(h, 2.1, 2.7)) }}>
          …sin internet y sin computadoras potentes?
        </div>
      </div>
      {/* 2 · Alumnos reales */}
      <div style={{ position: 'absolute', inset: 0, opacity: fotos }}>
        {[[`${M}/fotos/3.jpg`, 4.8, 250, -2], [`${M}/fotos/5.jpg`, 5.3, 760, 1.5], [`${M}/fotos/4.jpg`, 5.8, 1270, -1]].map(([src, a, x, rot]) => (
          <Foto key={src} v={h} a={a} src={src} x={x} y={190} w={420} h={560} zoom={[1.04, 1.14]} posicion="50% 35%" rot={rot} />
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center' }}>
          <span style={{ font: '750 56px var(--sans)', opacity: curva.sale(tramo(h, 6.4, 7.0)) }}>Alumnos reales. Laboratorios reales. </span>
          <span style={{ font: '800 56px var(--sans)', color: 'var(--magenta)', opacity: curva.sale(tramo(h, 7.8, 8.4)) }}>Ya está pasando.</span>
        </div>
      </div>
      {/* 3 · Madurez: no es una maqueta */}
      <div style={{ position: 'absolute', inset: 0, opacity: madurez }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 180, textAlign: 'center', font: '780 70px var(--sans)' }}>
          No es una maqueta: <span className="gema-texto">es un proyecto maduro.</span>
        </div>
        <div style={{ position: 'absolute', left: 90, right: 90, top: 330, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30 }}>
          {MADUREZ.map((m, k) => {
            const a = 11.3 + k * 0.45;
            const e = curva.rebote(tramo(h, a, a + 0.45));
            return (
              <div key={m.valor} className="tarjeta faceta" style={{ padding: '44px 36px', minHeight: 250, boxSizing: 'border-box', display: 'flex', gap: 26, alignItems: 'center',
                opacity: acotar(e * 1.5), transform: `translateY(${(1 - acotar(e)) * 30}px) scale(${mezclar(0.92, 1, acotar(e))})`,
                boxShadow: `0 0 ${vida(h, a, a + 0.9, 0.2) * 40}px rgb(0 229 255 / 0.5), 0 30px 80px rgb(0 0 0 / 0.45)` }}>
                <Icono tipo={m.icono} tam={84} color="#00e5ff" />
                <div>
                  <div style={{ font: '800 50px/1.1 var(--sans)' }}>{m.valor}</div>
                  <div style={{ marginTop: 10, font: '500 29px/1.25 var(--sans)', color: 'var(--niebla)' }}>{m.nota}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* 4 · Paso a la historia */}
      <div className="gema-texto" style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', font: '850 120px var(--sans)', opacity: cierre,
        transform: `scale(${mezclar(1.15, 1, cierre)})` }}>Esta es Amatista.</div>
    </Capa>
  );
}

// ------------------------------------------------------------------ 0 · Apertura y equipo (−3 → 8 s)

export function Apertura({ v }) {
  const arma = tramo(v, -2.8, -0.6);
  return (
    <Capa>
      <Fondo v={v} tono={0.3} />
      <Destellos t={v + 3} n={36} fuerza={0.8} />
      <div style={{ position: 'absolute', left: 960 - 170, top: 150 + (1 - curva.sale(arma)) * 30 }}>
        <Gema tam={340} arma={arma} brillo={0.5 + 0.3 * Math.sin(v * 2)} />
      </div>
      <Titulo v={v} a={-0.6} texto="AMATISTA" tam={120} gema estilo={{ left: 0, right: 0, top: 540, textAlign: 'center', letterSpacing: '0.32em', fontWeight: 800 }} />
      <Entra v={v} a={2.2} estilo={{ left: 0, right: 0, top: 690, textAlign: 'center' }}>
        <span className="chip faceta-sm">Equipo Amatista · México · Hack4Edu 2026</span>
      </Entra>
      {[{ nombre: 'Maximiliano Cabello Mata', a: 4.18, x: 230 }, { nombre: 'Diana Paola Acatitla Martínez', a: 5.94, x: 970 }].map((p) => (
        <Entra key={p.nombre} v={v} a={p.a} como="escala" estilo={{ left: p.x, top: 800 }}>
          <div className="tarjeta faceta" style={{ width: 720, padding: '26px 34px', display: 'flex', alignItems: 'center', gap: 22 }}>
            <span style={{ width: 18, height: 18, background: 'var(--magenta)', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }} />
            <span style={{ font: '700 36px var(--sans)' }}>{p.nombre}</span>
          </div>
        </Entra>
      ))}
    </Capa>
  );
}

// ------------------------------------------------------------------ 1 · El reto, textual (8 → 35 s)

// Lo que dice la voz del reto, en el segundo en que lo dice.
const CHIPS_RETO = [
  { texto: 'Solución offline-first', a: 12.94 }, { texto: 'Escuelas y comunidades', a: 15.32 },
  { texto: 'Conectividad limitada', a: 16.74 }, { texto: 'Sincroniza al volver la conexión', a: 18.14 },
];

export function Reto({ v }) {
  return (
    <Capa>
      <Fondo v={v} />
      <Etiqueta v={v} a={8.3} texto="Hack4Edu 2026 · El reto" estilo={{ left: 120, top: 110 }} />
      <Titulo v={v} a={9.32} texto="Reto 2" tam={150} estilo={{ left: 120, top: 170 }} gema />
      <Titulo v={v} a={12.6} texto="Educación Offline-First" tam={64} estilo={{ left: 120, top: 340, color: 'var(--niebla)' }} />
      <div className="tarjeta faceta" style={{ position: 'absolute', left: 820, top: 120, width: 980, padding: '46px 54px', opacity: curva.sale(tramo(v, 9.6, 10.4)) }}>
        <div style={{ font: '600 20px var(--mono)', letterSpacing: '0.3em', color: 'var(--cian)', marginBottom: 22 }}>TEXTO OFICIAL DEL RETO</div>
        {RETO.map((frase, i) => {
          const palabras = frase.texto.split(' ');
          return (
            <p key={i} style={{ margin: '0 0 18px', font: `${frase.fuerte ? 700 : 500} ${frase.fuerte ? 38 : 34}px/1.36 var(--sans)` }}>
              {palabras.map((p, j) => {
                const tp = mezclar(frase.desde, frase.hasta, j / palabras.length);
                const dicho = curva.sale(tramo(v, tp - 0.05, tp + 0.25));
                const color = frase.fija ? 'rgb(196 182 212)' : frase.fuerte ? `rgb(${mezclar(120, 0, dicho)} ${mezclar(110, 229, dicho)} ${mezclar(140, 255, dicho)})`
                  : `rgb(${mezclar(120, 244, dicho)} ${mezclar(105, 238, dicho)} ${mezclar(140, 250, dicho)})`;
                return <span key={j} style={{ color }}>{p} </span>;
              })}
            </p>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 120, top: 520, width: 640, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {CHIPS_RETO.map((c) => {
          const k = curva.rebote(tramo(v, c.a, c.a + 0.5));
          return (
            <div key={c.texto} className="chip faceta-sm" style={{ alignSelf: 'flex-start', opacity: acotar(k * 1.5), transform: `translateX(${(1 - acotar(k)) * -40}px)`, fontSize: 24 }}>
              <span style={{ width: 12, height: 12, background: 'var(--cian)', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }} />{c.texto}
            </div>
          );
        })}
      </div>
    </Capa>
  );
}

// ------------------------------------------------------------------ 2 · La brecha (35 → 60 s)

export function Brecha({ v }) {
  return (
    <Capa>
      <Fondo v={v} />
      <Foto v={v} a={35.2} src={`${M}/fotos/1.jpg`} x={1000} y={120} w={800} h={600} zoom={[1.05, 1.22]} hacia={[-2, -1]} etiqueta="Laboratorio real · México" />
      <Etiqueta v={v} a={35.1} texto="01 · El problema" estilo={{ left: 120, top: 110 }} />
      <Titulo v={v} a={38.9} texto="Una profunda *brecha de infraestructura" tam={66} estilo={{ left: 120, top: 160, width: 820 }} />
      <Contador v={v} a={42.4} hasta={20900} sufijo="+" estilo={{ left: 120, top: 360 }} />
      <Entra v={v} a={43.3} estilo={{ left: 126, top: 520, font: '500 30px var(--sans)', color: 'var(--niebla)' }}>escuelas de nivel medio superior</Entra>
      <Contador v={v} a={46.0} hasta={1500} sufijo="+" tam={110} estilo={{ left: 120, top: 590 }} />
      <Entra v={v} a={46.9} estilo={{ left: 126, top: 710, font: '500 30px var(--sans)', color: 'var(--niebla)' }}>facultades universitarias</Entra>
      {[['Ingeniería', 52.0], ['Arquitectura', 53.08], ['Diseño digital', 54.12]].map(([t, a], i) => (
        <Entra key={t} v={v} a={a} como="escala" estilo={{ left: 1000 + i * 270, top: 760 }}>
          <span className="chip faceta-sm">{t}</span>
        </Entra>
      ))}
      <Entra v={v} a={55.4} estilo={{ left: 1000, top: 850, width: 800 }}>
        <div className="tarjeta faceta" style={{ padding: '22px 30px', display: 'flex', gap: 24, alignItems: 'center' }}>
          <Icono tipo="chip" tam={60} color="#ff6fae" /><Icono tipo="sinwifi" tam={60} />
          <span style={{ font: '650 30px/1.25 var(--sans)' }}>La gran mayoría: <span style={{ color: 'var(--magenta)' }}>equipos limitados</span> y <span style={{ color: 'var(--magenta)' }}>conectividad inestable</span></span>
        </div>
      </Entra>
    </Capa>
  );
}

// ------------------------------------------------------------------ 3 · Lo que pasa hoy (60 → 78 s)

export function Colapso({ v }) {
  const cae = curva.suave(tramo(v, 67.1, 67.9));
  const temblor = vida(v, 67.1, 67.9, 0.1) * Math.sin(v * 70) * 8;
  const congelado = tramo(v, 68.9, 69.6);
  const alumnos = AVATARES.slice(0, 40);
  return (
    <Capa estilo={{ transform: `translateX(${temblor}px)` }}>
      <Fondo v={v} tono={-0.2} />
      <Titulo v={v} a={60.4} texto="Plataformas basadas en video o en la nube…" tam={58} estilo={{ left: 120, top: 120, width: 1300, color: 'var(--niebla)' }} />
      {/* La red: barras que caen */}
      <Entra v={v} a={62.0} estilo={{ left: 160, top: 330 }}>
        <div className="tarjeta faceta" style={{ width: 460, height: 380, padding: 34 }}>
          <div style={{ font: '600 20px var(--mono)', letterSpacing: '0.24em', color: cae > 0.5 ? 'var(--magenta)' : 'var(--cian)' }}>RED ESCOLAR</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, height: 220, marginTop: 24 }}>
            {[0.4, 0.6, 0.8, 1].map((h, i) => (
              <div key={i} style={{ width: 70, height: `${h * 100 * (1 - cae * (0.6 + i * 0.1))}%`, background: cae > 0.5 ? 'var(--magenta)' : 'var(--cian)', opacity: 0.9 }} />
            ))}
          </div>
          <div style={{ marginTop: 18, font: '750 34px var(--sans)', opacity: cae }}>Colapsa</div>
        </div>
      </Entra>
      {/* La computadora: se congela */}
      <Entra v={v} a={68.8} estilo={{ left: 690, top: 330 }}>
        <div className="tarjeta faceta" style={{ width: 460, height: 380, padding: 34, filter: `grayscale(${congelado})` }}>
          <div style={{ font: '600 20px var(--mono)', letterSpacing: '0.24em', color: 'var(--magenta)' }}>COMPUTADORA BÁSICA</div>
          <div style={{ marginTop: 30, height: 170, display: 'grid', placeItems: 'center', background: '#140b20', border: '1px solid rgb(195 155 211 / .25)' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', border: '6px solid rgb(195 155 211 / .25)', borderTopColor: 'var(--lavanda)', transform: `rotate(${Math.min(v, 69.6) * 400}deg)` }} />
          </div>
          <div style={{ marginTop: 18, font: '750 34px var(--sans)', opacity: congelado }}>No responde</div>
        </div>
      </Entra>
      {/* 40 alumnos y un profesor a ciegas */}
      <Entra v={v} a={71.0} estilo={{ left: 1220, top: 300 }}>
        <div style={{ font: '750 46px var(--sans)', marginBottom: 20 }}>1 profesor. <span className="gema-texto">{Math.round(40 * curva.sale(tramo(v, 73.84, 74.8)))} alumnos.</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 70px)', gap: 12 }}>
          {alumnos.map((a, i) => {
            const k = curva.rebote(tramo(v, 73.84 + i * 0.03, 74.3 + i * 0.03));
            const duda = vida(v, 75.6 + (i % 7) * 0.12, SIEMPRE, 0.3);
            return (
              <div key={a.id + i} style={{ width: 70, height: 70, position: 'relative', opacity: acotar(k * 1.5), transform: `scale(${acotar(k)})` }}>
                <div style={{ width: 70, height: 70, overflow: 'hidden', clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)', background: a.fondo, filter: `saturate(${1 - duda * 0.5})` }}>
                  <BustoAvatar id={a.id} className="" />
                </div>
                {i % 3 === 0 && <span style={{ position: 'absolute', right: -4, top: -10, font: '800 26px var(--sans)', color: 'var(--magenta)', opacity: duda }}>?</span>}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 22, font: '500 28px var(--sans)', color: 'var(--lavanda)', opacity: vida(v, 75.74, SIEMPRE, 0.5) }}>¿Quién necesita ayuda? ¿En qué paso se detuvo?</div>
      </Entra>
    </Capa>
  );
}

// ------------------------------------------------------------------ 4 · Amatista (78 → 90 s)

export function Amatista({ v }) {
  const arma = tramo(v, 79.0, 80.6);
  return (
    <Capa>
      <Fondo v={v} tono={0.6} />
      <Destellos t={v} n={46} fuerza={vida(v, 79.6, SIEMPRE, 0.6)} />
      <Titulo v={v} a={78.24} b={79.6} texto="Para romper esta barrera…" tam={70} estilo={{ left: 0, right: 0, top: 470, textAlign: 'center' }} />
      <div style={{ position: 'absolute', left: 960 - 190, top: 110, opacity: curva.sale(tramo(v, 79.2, 79.8)) }}>
        <Gema tam={380} arma={arma} brillo={0.6 + 0.3 * Math.sin(v * 2.4)} />
      </div>
      <Titulo v={v} a={79.9} texto="Amatista" tam={140} gema estilo={{ left: 0, right: 0, top: 500, textAlign: 'center' }} />
      <Entra v={v} a={81.4} estilo={{ left: 0, right: 0, top: 680, textAlign: 'center', font: '500 40px var(--sans)', color: 'var(--niebla)' }}>
        Plataforma educativa de modelado 3D para entornos con recursos limitados
      </Entra>
      <Entra v={v} a={87.08} como="escala" estilo={{ left: 560, top: 800 }}>
        <span className="chip chip-cian faceta-sm" style={{ fontSize: 26 }}><Icono tipo="sinwifi" tam={38} color="#04161a" />Sin internet</span>
      </Entra>
      <Entra v={v} a={88.3} como="escala" estilo={{ left: 930, top: 800 }}>
        <span className="chip chip-cian faceta-sm" style={{ fontSize: 26 }}><Icono tipo="chip" tam={38} color="#04161a" />Sin tarjeta gráfica costosa</span>
      </Entra>
    </Capa>
  );
}

// ------------------------------------------------------------------ 5 · Pilar 1: la aplicación web (90 → 106 s)
// La demostración real corre MIENTRAS la voz la describe: cada toma entra con su palabra.
const CLIPS_WEB = [
  { toma: 'portada_s', desde: 4.9, a: 92.7, n: '1', t: 'Corre en cualquier navegador', s: 'sin instalar nada pesado', url: 'amatista-3d.tech' },
  { toma: 'curso_s', desde: 1.1, a: 95.5, n: '2', t: 'Elige tu nivel', s: 'de principiante a avanzado', url: 'amatista-3d.tech/#/curso/blender' },
  { toma: 'leccion_s', desde: 1.2, a: 98.2, n: '3', t: 'Consulta contenidos', s: 'lecciones cortas y prácticas', url: 'amatista-3d.tech/#/leccion' },
  { toma: 'mundo_ciudad_s', desde: 9.7, a: 99.7, n: '4', t: 'Interactúa con mundos 3D', s: 'en el mismo navegador', url: 'amatista-3d.tech/#/estudio' },
  { toma: null, a: 103.2, n: '5', t: 'Menos datos que una red social', s: '≈ 0.4 MB la primera visita', url: 'amatista-3d.tech' },
];

function Pasos({ v, pasos, x = 1340, y = 250 }) {
  const actual = pasos.reduce((k, p, i) => (v >= p.a ? i : k), -1);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 480, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {pasos.map((p, i) => {
        const k = curva.rebote(tramo(v, p.a, p.a + 0.45));
        const activo = i === actual;
        const hecho = i < actual;
        return (
          <div key={p.t} className="tarjeta faceta-sm" style={{ padding: '14px 20px', display: 'flex', gap: 16, alignItems: 'center',
            opacity: acotar(k * 1.5) * (activo ? 1 : 0.55), transform: `translateX(${(1 - acotar(k)) * 40}px) scale(${activo ? 1.03 : 1})`, transformOrigin: '0 50%',
            borderColor: activo ? 'rgb(0 229 255 / 0.7)' : undefined, boxShadow: activo ? '0 0 34px rgb(0 229 255 / 0.25)' : undefined }}>
            <span style={{ flex: 'none', width: 44, height: 44, display: 'grid', placeItems: 'center', background: activo || hecho ? 'var(--cian)' : 'rgb(195 155 211 / 0.3)',
              color: '#04161a', font: '800 22px var(--mono)', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }}>{hecho ? '✓' : p.n}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: '700 27px/1.15 var(--sans)' }}>{p.t}</div>
              <div style={{ font: '500 20px var(--sans)', color: 'var(--lavanda)' }}>{p.s}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Pwa({ v }) {
  const actual = CLIPS_WEB.reduce((k, c, i) => (v >= c.a ? i : k), 0);
  const datos = tramo(v, 103.6, 105.0);
  return (
    <Capa>
      <Fondo v={v} />
      <Etiqueta v={v} a={90.3} texto="02 · La solución · Dos pilares" estilo={{ left: 120, top: 100 }} />
      <Titulo v={v} a={92.5} texto="01 · Aplicación web *ultraligera" tam={64} estilo={{ left: 120, top: 150 }} />
      <div className="pantalla faceta" style={{ left: 120, top: 250, width: 1160, height: 694, opacity: curva.sale(tramo(v, 92.6, 93.1)),
        transform: `translateY(${(1 - curva.sale(tramo(v, 92.6, 93.2))) * 40}px)` }}>
        <div className="navegador-barra"><i /><i /><i /><span style={{ marginLeft: 14 }}>🔒 {CLIPS_WEB[actual].url}</span></div>
        <div style={{ position: 'absolute', inset: '42px 0 0 0', overflow: 'hidden', background: '#120a1d' }}>
          {CLIPS_WEB.map((c, i) => {
            const sig = CLIPS_WEB[i + 1];
            const o = curva.suave(tramo(v, c.a - 0.25, c.a + 0.05)) * (sig ? 1 - curva.suave(tramo(v, sig.a - 0.05, sig.a + 0.25)) : 1);
            if (o <= 0) return null;
            if (!c.toma) {
              return (
                <div key="datos" style={{ position: 'absolute', inset: 0, opacity: o, padding: '70px 80px', background: 'linear-gradient(160deg, #2a1240, #120a1d)' }}>
                  <div style={{ font: '600 22px var(--mono)', letterSpacing: '0.3em', color: 'var(--cian)' }}>CONSUMO DE DATOS</div>
                  {[['Red social', 1, '#5d4a6e', 'video, fotos y anuncios sin parar'], ['Amatista', 0.06, 'var(--cian)', '≈ 0.4 MB la primera visita · 0 MB al volver']].map(([n, f, col, nota], j) => (
                    <div key={n} style={{ marginTop: 56 }}>
                      <div style={{ font: '700 38px var(--sans)' }}>{n}</div>
                      <div style={{ marginTop: 14, height: 56, width: `${Math.max(0.04, f * curva.sale(acotar(datos * 1.4 - j * 0.3))) * 100}%`, background: col }} />
                      <div style={{ marginTop: 10, font: '500 24px var(--mono)', color: 'var(--lavanda)' }}>{nota}</div>
                    </div>
                  ))}
                </div>
              );
            }
            const z = mezclar(1.0, 1.05, tramo(v, c.a, sig ? sig.a : c.a + 3));
            return (
              <div key={c.toma} style={{ position: 'absolute', inset: 0, opacity: o, transform: `scale(${z})`, transformOrigin: '50% 30%' }}>
                <Metraje toma={c.toma} t={v - c.a} desde={c.desde} posicion="50% 0%" />
              </div>
            );
          })}
        </div>
      </div>
      <Pasos v={v} pasos={CLIPS_WEB} />
    </Capa>
  );
}

// ------------------------------------------------------------------ 6 · Pilar 2: el complemento para Blender (106 → 125 s)
// Cada imagen es un estado real del add-on en Blender 4.0 (grabar_addon.py), en el segundo en que la voz lo dice.
const CAPTURAS = [
  ['001_inicio', 112.3], ['002_pista_donde', 114.4], ['003_pieza_00', 115.9], ['004_pieza_01', 116.6], ['005_pieza_02', 117.3], ['006_pista_como', 118.0],
  ['007_pieza_03', 119.6], ['008_pieza_04', 120.05], ['009_pieza_05', 120.5], ['010_pieza_06', 120.95], ['011_pieza_07', 121.4], ['012_pieza_08', 121.85],
  ['013_pieza_09', 122.3], ['014_pieza_10', 122.75], ['015_guardar', 123.25], ['016_final', 123.9],
].map(([n, a]) => ({ n, a }));
const PASOS_ADDON = [
  { n: '1', t: 'Se instala fácil', s: 'en las computadoras del laboratorio', a: 108.5 },
  { n: '2', t: 'Una guía dentro de Blender', s: 'un paso claro a la vez, con pistas', a: 112.6 },
  { n: '3', t: '100 % sin internet', s: 'todo ocurre en la computadora', a: 117.7 },
  { n: '4', t: 'Revisa paso a paso tu modelo', s: 'cada pieza, al instante', a: 119.6 },
  { n: '5', t: '¡Práctica terminada!', s: 'el modelo quedó bien', a: 123.9 },
];
const RECORTE = { x: 0, y: 36, w: 1560 };
const BANDA = { x: 320, y: 96, w: 740, h: 210 };

function Captura({ v, recorte, escala, extra }) {
  return CAPTURAS.map((c, i) => {
    const sig = CAPTURAS[i + 1];
    const o = curva.suave(tramo(v, c.a - 0.15, c.a + 0.02)) * (sig ? 1 - curva.suave(tramo(v, sig.a - 0.15, sig.a + 0.02)) : 1);
    if (o <= 0) return null;
    return <img key={c.n} alt="" src={`${M}/addon/${c.n}.jpg`} style={{ position: 'absolute', left: -recorte.x * escala, top: -recorte.y * escala,
      width: 1920 * escala, height: 1080 * escala, maxWidth: 'none', objectFit: 'fill', opacity: o, ...extra }} />;
  });
}

export function Blender({ v }) {
  const ancho = 1160;
  const esc = ancho / RECORTE.w;
  const blender = curva.suave(tramo(v, 112.1, 112.6));
  const lupa = curva.sale(tramo(v, 112.9, 113.5));
  const final = curva.sale(tramo(v, 123.9, 124.4));
  return (
    <Capa>
      <Fondo v={v} />
      <Etiqueta v={v} a={106.4} texto="Pilar 2 · dentro de Blender" estilo={{ left: 120, top: 100 }} />
      <Titulo v={v} a={106.5} texto="02 · Complemento para *Blender" tam={64} estilo={{ left: 120, top: 150 }} />
      <div className="pantalla faceta" style={{ left: 120, top: 250, width: ancho, height: 694, opacity: curva.sale(tramo(v, 106.6, 107.1)),
        boxShadow: final > 0 ? `0 0 ${final * 80}px rgb(0 229 255 / 0.35), 0 50px 120px rgb(0 0 0 / 0.6)` : undefined }}>
        {/* el laboratorio donde se instala */}
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - blender }}>
          <img alt="" src={`${M}/fotos/2.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${mezclar(1.05, 1.15, tramo(v, 106.6, 112.6))})` }} />
          <div style={{ position: 'absolute', left: 24, bottom: 20, font: '600 18px var(--mono)', letterSpacing: '0.2em', color: 'var(--niebla)' }}>LABORATORIO ESCOLAR · SE INSTALA FÁCIL</div>
        </div>
        <div style={{ position: 'absolute', inset: 0, opacity: blender, transform: `scale(${1 + 0.035 * tramo(v, 112.3, 125)})`, transformOrigin: '35% 45%' }}>
          <Captura v={v} recorte={RECORTE} escala={esc} />
        </div>
        {/* lupa sobre la banda de la guía para que se lea */}
        <div style={{ position: 'absolute', left: BANDA.x * esc - 30, top: (BANDA.y - RECORTE.y) * esc - 14, width: BANDA.w * esc * 1.55, height: BANDA.h * esc * 1.55,
          overflow: 'hidden', opacity: lupa, transform: `scale(${mezclar(0.9, 1, lupa)})`, transformOrigin: '0 0', border: '2px solid rgb(0 229 255 / 0.8)',
          boxShadow: '0 20px 60px rgb(0 0 0 / 0.7), 0 0 30px rgb(0 229 255 / 0.3)', zIndex: 2 }}>
          <Captura v={v} recorte={BANDA} escala={esc * 1.55} />
        </div>
      </div>
      <Pasos v={v} pasos={PASOS_ADDON} />
      <div style={{ position: 'absolute', left: 1340, top: 860, display: 'flex', gap: 14, width: 480, opacity: final }}>
        <span className="chip chip-cian faceta-sm" style={{ fontSize: 18, whiteSpace: 'nowrap', padding: '10px 16px' }}><Icono tipo="sinwifi" tam={24} color="#04161a" />sin internet</span>
        <span className="chip faceta-sm" style={{ fontSize: 18, whiteSpace: 'nowrap', padding: '10px 16px' }}>sin tarjeta gráfica</span>
      </div>
    </Capa>
  );
}

// ------------------------------------------------------------------ 7 · Geoda (125 → 144 s)

// Geoda es el corazón dentro de la gema: entra documentación oficial, se extrae, limpia y estructura,
// y de ahí late hacia las guías paso a paso y la asistencia inteligente local. Todo sin internet.
const PROCESO = [
  { n: '1', t: 'Extrae', s: 'lo útil de cada manual', a: 132.7 },
  { n: '2', t: 'Limpia', s: 'quita ruido y repetidos', a: 133.54 },
  { n: '3', t: 'Estructura', s: 'pasos, datos y ejemplos', a: 134.6 },
];
const NUTRE = [
  { t: 'Guías paso a paso', s: 'en la aplicación web y en Blender', a: 138.44, y: 330, icono: 'laptop' },
  { t: 'Asistencia inteligente', s: 'ejecutada en el equipo del alumno', a: 139.96, y: 510, icono: 'chip' },
];
const CORAZON = [960, 500];

// Latido doble (lub-dub) cada 1.1 s desde que se nombra Geoda.
function latido(v) {
  if (v < 130.24) return 0;
  const f = (v - 130.24) % 1.1;
  return Math.exp(-((f / 0.07) ** 2)) + 0.6 * Math.exp(-(((f - 0.24) / 0.07) ** 2));
}

export function GeodaEscena({ v }) {
  const abre = tramo(v, 130.0, 131.6);
  const p = latido(v);
  const fase = v < 130.24 ? 0 : ((v - 130.24) % 1.1) / 1.1;
  const nutre = curva.sale(tramo(v, 137.26, 137.9));
  const offline = curva.sale(tramo(v, 142.66, 143.2));
  return (
    <Capa>
      <Fondo v={v} tono={0.2 + p * 0.15} />
      <Entra v={v} a={128.15} estilo={{ left: 120, top: 100 }}><span className="chip chip-magenta faceta-sm">Mención especial · arquitectura</span></Entra>
      <Entra v={v} a={128.3} estilo={{ left: 124, top: 170, font: '600 40px var(--sans)', color: 'var(--niebla)' }}>
        Lo que respalda el aprendizaje
      </Entra>

      {/* La gema de Amatista, translúcida, y Geoda latiendo dentro */}
      <div style={{ position: 'absolute', left: CORAZON[0] - 330, top: CORAZON[1] - 350, opacity: 0.22 * curva.sale(tramo(v, 128.1, 128.9)) }}>
        <Gema tam={660} arma={1} brillo={0.3 + p * 0.3} />
      </div>
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {v >= 130.24 && [0, 1].map((i) => {
          const u = (fase + i * 0.5) % 1;
          return <circle key={i} cx={CORAZON[0]} cy={CORAZON[1]} r={150 + u * 260} fill="none" stroke="#00e5ff" strokeWidth={3 - u * 2} strokeOpacity={(1 - u) * 0.35} />;
        })}
      </svg>
      <div style={{ position: 'absolute', left: CORAZON[0] - 160, top: CORAZON[1] - 160, opacity: curva.sale(tramo(v, 129.6, 130.4)),
        transform: `scale(${1 + p * 0.07})` }}>
        <Geoda tam={320} abre={abre} pulso={0.35 + p * 0.65} />
      </div>
      <div style={{ position: 'absolute', left: 560, right: 560, top: 700, textAlign: 'center' }}>
        <Titulo v={v} a={130.24} texto="Geoda" tam={104} estilo={{ position: 'relative', color: 'var(--cian)', textAlign: 'center' }} />
        <div className="gema-texto" style={{ marginTop: 4, font: '750 50px var(--sans)', opacity: curva.sale(tramo(v, 130.6, 131.3)) }}>el corazón de Amatista</div>
        <div style={{ marginTop: 14, font: '500 28px var(--sans)', color: 'var(--niebla)', opacity: curva.sale(tramo(v, 131.38, 132.0)) }}>
          nuestro propio flujo automatizado de datos
        </div>
      </div>

      {/* Lo que entra: documentación técnica oficial, procesada en tres pasos */}
      <Etiqueta v={v} a={132.5} texto="Entra" color="var(--lavanda)" estilo={{ left: 120, top: 270 }} />
      <Entra v={v} a={135.02} como="izq" estilo={{ left: 120, top: 300 }}>
        <div className="tarjeta faceta-sm" style={{ width: 560, padding: '20px 26px', display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 54, height: 64 }}>
            {[0, 1, 2].map((i) => <div key={i} style={{ position: 'absolute', left: i * 7, top: i * -6, width: 42, height: 54, background: ['#5b2c7a', '#7d3c98', '#e8daef'][i],
              clipPath: 'polygon(0 0,70% 0,100% 22%,100% 100%,0 100%)' }} />)}
          </div>
          <div><div style={{ font: '700 28px var(--sans)', whiteSpace: 'nowrap' }}>Documentación técnica oficial</div>
            <div style={{ font: '500 19px var(--mono)', color: 'var(--lavanda)' }}>manuales y fuentes oficiales</div></div>
        </div>
      </Entra>
      <div style={{ position: 'absolute', left: 120, top: 470, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {PROCESO.map((e) => {
          const k = curva.rebote(tramo(v, e.a, e.a + 0.45));
          const activo = vida(v, e.a, e.a + 0.9, 0.2);
          return (
            <div key={e.t} className="tarjeta faceta-sm" style={{ width: 470, padding: '14px 22px', display: 'flex', gap: 18, alignItems: 'center',
              opacity: acotar(k * 1.5), transform: `translateX(${(1 - acotar(k)) * -40}px)`, boxShadow: `0 0 ${activo * 40}px rgb(0 229 255 / 0.6)` }}>
              <span style={{ width: 44, height: 44, display: 'grid', placeItems: 'center', background: 'var(--cian)', color: '#04161a', font: '800 24px var(--mono)',
                clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }}>{e.n}</span>
              <div><div style={{ font: '700 30px var(--sans)' }}>{e.t}</div><div style={{ font: '500 20px var(--sans)', color: 'var(--lavanda)' }}>{e.s}</div></div>
            </div>
          );
        })}
      </div>
      <Flujo t={v} de={[600, 560]} a={[CORAZON[0] - 150, CORAZON[1]]} n={14} curvatura={-40} vel={0.7} color="#c39bd3" fuerza={curva.sale(tramo(v, 132.7, 133.3))} />

      {/* Lo que nutre: guías y asistencia local, con cada latido */}
      <Etiqueta v={v} a={137.26} texto="Nutre" estilo={{ left: 1330, top: 270 }} />
      {NUTRE.map((o) => (
        <div key={o.t}>
          <Flujo t={v} de={[CORAZON[0] + 150, CORAZON[1]]} a={[1320, o.y + 60]} n={12} curvatura={o.y < 400 ? -60 : 40} vel={0.6 + p * 0.3} fuerza={nutre} />
          <Entra v={v} a={o.a} como="der" estilo={{ left: 1330, top: o.y }}>
            <div className="tarjeta faceta" style={{ width: 470, padding: '24px 28px', display: 'flex', gap: 20, alignItems: 'center',
              boxShadow: `0 0 ${p * nutre * 36}px rgb(0 229 255 / 0.45)` }}>
              <Icono tipo={o.icono} tam={64} color="#00e5ff" />
              <div><div style={{ font: '700 32px var(--sans)' }}>{o.t}</div><div style={{ font: '500 21px var(--sans)', color: 'var(--lavanda)' }}>{o.s}</div></div>
            </div>
          </Entra>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 1330, top: 700, opacity: offline, transform: `scale(${mezclar(0.85, 1, offline)})`, transformOrigin: '0 50%' }}>
        <span className="chip chip-cian faceta-sm" style={{ fontSize: 24 }}><Icono tipo="sinwifi" tam={34} color="#04161a" />Sin depender de internet</span>
      </div>
    </Capa>
  );
}

// ------------------------------------------------------------------ 8 · Sin conexión (144 → 155 s)

export function SinConexion({ v }) {
  return (
    <Capa>
      <Fondo v={v} tono={-0.1} />
      <Etiqueta v={v} a={144.2} texto="03 · Telemetría y sincronización" estilo={{ left: 120, top: 100 }} />
      <Titulo v={v} a={144.4} texto="Practica *sin conexión" tam={70} estilo={{ left: 120, top: 150 }} />
      <div className="pantalla faceta" style={{ left: 120, top: 300, width: 1060, height: 650, opacity: curva.sale(tramo(v, 144.6, 145.4)) }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.07 * tramo(v, 144.6, 155.3)})`, transformOrigin: '40% 35%' }}>
          <Metraje toma="sin_conexion_s" t={v - 144.6} desde={2} />
        </div>
        <div style={{ position: 'absolute', top: 24, right: 24, opacity: vida(v, 145.86, SIEMPRE, 0.3) }}>
          <span className="chip chip-magenta faceta-sm"><Icono tipo="sinwifi" tam={30} color="#2a0618" />Sin conexión</span>
        </div>
      </div>
      <Entra v={v} a={147.26} como="der" estilo={{ left: 1260, top: 310, width: 540 }}>
        <div className="tarjeta faceta" style={{ padding: 34 }}>
          <div style={{ font: '600 20px var(--mono)', letterSpacing: '0.24em', color: 'var(--cian)' }}>GUARDADO EN EL EQUIPO</div>
          <div style={{ marginTop: 16, font: '700 34px var(--sans)' }}>Telemetría educativa <span className="gema-texto">muy ligera</span></div>
          <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Marca v={v} a={151.7} texto="Pasos completados" />
            <Marca v={v} a={153.98} texto="Dónde tuvo dificultad" ok={false} />
          </div>
          <div className="mono" style={{ marginTop: 30, font: '500 22px var(--mono)', color: 'var(--lavanda)', opacity: vida(v, 154.4, SIEMPRE, 0.4) }}>≈ 1 KB por práctica</div>
        </div>
      </Entra>
    </Capa>
  );
}

// ------------------------------------------------------------------ 9 · Sincroniza (155 → 171.5 s)

export function Sincroniza({ v }) {
  const vuelve = tramo(v, 155.5, 156.4);
  const tachado = curva.sale(tramo(v, 158.2, 158.8));
  return (
    <Capa>
      <Fondo v={v} />
      <Entra v={v} a={155.4} estilo={{ left: 120, top: 110, display: 'flex', alignItems: 'center', gap: 20 }}>
        <Icono tipo="wifi" tam={70} color={vuelve > 0.5 ? '#00e5ff' : '#c39bd3'} />
        <span style={{ font: '750 56px var(--sans)' }}>Vuelve la conexión</span>
      </Entra>
      {/* Lo que NO viaja */}
      <Entra v={v} a={157.3} estilo={{ left: 120, top: 300 }}>
        <div className="tarjeta faceta" style={{ width: 430, padding: 30, position: 'relative' }}>
          <div style={{ font: '600 18px var(--mono)', letterSpacing: '0.2em', color: 'var(--magenta)' }}>NO SE SUBE</div>
          <div style={{ marginTop: 12, font: '700 36px var(--sans)' }}>tren.blend</div>
          <div style={{ font: '500 26px var(--mono)', color: 'var(--lavanda)' }}>archivo 3D · 48 MB</div>
          <div style={{ position: 'absolute', left: 20, right: 20, top: '50%', height: 6, background: 'var(--magenta)', transform: `scaleX(${tachado}) rotate(-8deg)`, transformOrigin: 'left' }} />
        </div>
      </Entra>
      {/* Lo que SÍ viaja */}
      <Entra v={v} a={160.1} estilo={{ left: 120, top: 560 }}>
        <div className="tarjeta faceta" style={{ width: 430, padding: 30 }}>
          <div style={{ font: '600 18px var(--mono)', letterSpacing: '0.2em', color: 'var(--cian)' }}>SOLO TEXTO LIGERO</div>
          <pre style={{ margin: '14px 0 0', font: '500 22px/1.45 var(--mono)', color: '#e8f9fc' }}>{'{ "paso": "ruedas",\n  "logrado": true,\n  "intentos": 2 }'}</pre>
          <div style={{ marginTop: 10, font: '500 22px var(--mono)', color: 'var(--lavanda)' }}>≈ 1 KB</div>
        </div>
      </Entra>
      <Flujo t={v} de={[560, 690]} a={[900, 520]} n={14} curvatura={-60} vel={0.55} fuerza={curva.sale(tramo(v, 161.3, 161.9))} />
      <Nodo v={v} a={163.86} titulo="FastAPI" sub="servidor" x={1040} y={520} w={300} color="var(--cian)" />
      <Flujo t={v} de={[1190, 520]} a={[1460, 520]} n={8} curvatura={0} vel={0.6} fuerza={curva.sale(tramo(v, 165.0, 165.6))} />
      <Nodo v={v} a={165.36} titulo="SQL" sub="esquemas optimizados" x={1600} y={520} w={300} color="var(--cian)" />
    </Capa>
  );
}

// ------------------------------------------------------------------ 10 · El panel del profesor (171.5 → 177 s)

export function Profesor({ v }) {
  return (
    <Capa>
      <Fondo v={v} />
      <Titulo v={v} a={171.2} texto="El profesor ve a *todo su grupo" tam={66} estilo={{ left: 120, top: 100 }} />
      <Pantalla v={v} a={171.3} src={`${M}/capturas/profesor_recrear_abajo.jpg`} x={120} y={220} w={1180} h={760} url="amatista-3d.tech/#/profesor" como="escala" />
      <Entra v={v} a={173.5} como="der" estilo={{ left: 1360, top: 300, width: 440 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <Marca v={v} a={173.6} texto="Seguimiento real" />
          <Marca v={v} a={174.6} texto="De todo el grupo" />
          <Marca v={v} a={175.6} texto="Desde la fuente original" />
        </div>
      </Entra>
      <Entra v={v} a={174.2} como="escala" estilo={{ left: 1360, top: 640 }}>
        <div className="tarjeta faceta" style={{ width: 440, padding: 26, font: '500 24px/1.35 var(--sans)', color: 'var(--niebla)' }}>
          El modelo 3D de cada alumno se <span style={{ color: 'var(--cian)' }}>recrea</span> a partir de su código, sin descargar archivos pesados.
        </div>
      </Entra>
    </Capa>
  );
}

// ------------------------------------------------------------------ 11 · Inclusión (177 → 192.6 s)

export function Inclusion({ v }) {
  return (
    <Capa>
      <Fondo v={v} tono={0.3} />
      <Etiqueta v={v} a={177.1} texto="04 · Inclusión y escala" estilo={{ left: 120, top: 100 }} />
      <Titulo v={v} a={177.7} texto="Inclusivo y *equitativo" tam={78} estilo={{ left: 120, top: 150 }} />
      <Foto v={v} a={179.9} src={`${M}/fotos/1.jpg`} x={120} y={320} w={620} h={420} zoom={[1.1, 1.2]} />
      <Foto v={v} a={180.6} src={`${M}/fotos/4.jpg`} x={770} y={320} w={330} h={420} zoom={[1.05, 1.15]} posicion="50% 30%" />
      <Foto v={v} a={181.3} src={`${M}/fotos/5.jpg`} x={1130} y={320} w={330} h={420} zoom={[1.05, 1.15]} posicion="50% 35%" />
      <Foto v={v} a={182.0} src={`${M}/fotos/2.jpg`} x={1490} y={320} w={330} h={420} zoom={[1.1, 1.2]} posicion="60% 50%" />
      <Entra v={v} a={182.2} estilo={{ left: 120, top: 790, width: 820 }}>
        <div style={{ font: '800 64px var(--sans)' }} className="gema-texto">Cientos de planteles</div>
        <div style={{ font: '500 30px var(--sans)', color: 'var(--niebla)' }}>de educación media superior con limitaciones de equipo</div>
      </Entra>
    </Capa>
  );
}

// ------------------------------------------------------------------ 12 · Piloto y costo (192.6 → 210 s)

export function Piloto({ v }) {
  const r = azar(9);
  const puntos = Array.from({ length: 500 }, () => [r(), r()]);
  const aparecen = tramo(v, 199.8, 201.2);
  const costo = curva.suave(tramo(v, 206.9, 208.4));
  return (
    <Capa>
      <Fondo v={v} />
      <Titulo v={v} a={192.3} texto="Fase piloto · México" tam={56} estilo={{ left: 120, top: 110, color: 'var(--niebla)' }} />
      <Foto v={v} a={192.9} b={199.4} src={`${M}/fotos/4.jpg`} x={1100} y={110} w={700} h={390} zoom={[1.05, 1.15]} posicion="50% 35%" etiqueta="Fase piloto · alumnos en México" />
      <Contador v={v} a={199.7} hasta={500} sufijo="+" tam={190} estilo={{ left: 120, top: 190 }} />
      <Entra v={v} a={200.3} estilo={{ left: 128, top: 400, font: '600 40px var(--sans)' }}>alumnos beneficiados directamente</Entra>
      <svg viewBox="0 0 700 360" style={{ position: 'absolute', left: 1100, top: 120, width: 700, height: 360 }}>
        {puntos.map(([x, y], i) => {
          const k = curva.sale(tramo(aparecen, i / 600, i / 600 + 0.2));
          return <path key={i} d={`M${x * 680 + 10} ${y * 340 + 10 - 5}l4 5l-4 5l-4 -5z`} fill={i % 9 === 0 ? '#ff6fae' : i % 3 === 0 ? '#00e5ff' : '#c39bd3'} opacity={k * 0.9} />;
        })}
      </svg>
      {/* Dónde ocurre el trabajo pesado */}
      <Entra v={v} a={201.7} estilo={{ left: 120, top: 530 }}>
        <div className="tarjeta faceta" style={{ width: 760, padding: 34, display: 'flex', gap: 26, alignItems: 'center' }}>
          <Icono tipo="escritorio" tam={90} color="#c39bd3" />
          <div><div style={{ font: '700 36px var(--sans)' }}>Gráficos en el equipo local</div>
            <div style={{ font: '500 24px var(--sans)', color: 'var(--lavanda)' }}>el 3D se dibuja en la computadora del alumno</div></div>
        </div>
      </Entra>
      <Entra v={v} a={204.58} estilo={{ left: 120, top: 760 }}>
        <div className="tarjeta faceta" style={{ width: 760, padding: 34, display: 'flex', gap: 26, alignItems: 'center' }}>
          <Icono tipo="wifi" tam={90} color="#00e5ff" />
          <div><div style={{ font: '700 36px var(--sans)' }}>Solo telemetría ligera</div>
            <div style={{ font: '500 24px var(--sans)', color: 'var(--lavanda)' }}>al servidor viaja texto, no modelos</div></div>
        </div>
      </Entra>
      <Entra v={v} a={206.6} como="escala" estilo={{ left: 1100, top: 560 }}>
        <div className="tarjeta faceta" style={{ width: 700, padding: 40 }}>
          <div style={{ font: '600 22px var(--mono)', letterSpacing: '0.24em', color: 'var(--cian)' }}>COSTO DE SERVIDOR POR ESTUDIANTE</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 40, height: 260, marginTop: 30 }}>
            {[['Video / nube', 1, '#5d4a6e'], ['Amatista', 0.08, 'var(--cian)']].map(([n, h, c], i) => (
              <div key={n} style={{ textAlign: 'center' }}>
                <div style={{ width: 160, height: 220 * (i === 1 ? mezclar(1, h, costo) : h), background: c, marginTop: 'auto' }} />
                <div style={{ marginTop: 12, font: '600 24px var(--sans)' }}>{n}</div>
              </div>
            ))}
            <div style={{ font: '800 64px var(--sans)', opacity: costo }} className="gema-texto">mínimo</div>
          </div>
        </div>
      </Entra>
    </Capa>
  );
}

// ------------------------------------------------------------------ 13 · Al mercado (210 → 223.5 s)

const PAISES = [
  ['México', 0.27, 0.22], ['Guatemala', 0.32, 0.33], ['Colombia', 0.45, 0.47], ['Perú', 0.42, 0.62], ['Chile', 0.47, 0.82],
  ['Argentina', 0.55, 0.78], ['Brasil', 0.66, 0.55], ['Ecuador', 0.4, 0.52], ['Bolivia', 0.52, 0.65],
];

export function Mercado({ v }) {
  const expande = tramo(v, 219.6, 222.6);
  return (
    <Capa>
      <Fondo v={v} tono={0.4} />
      <Titulo v={v} a={210.3} texto="Transferencia al *mercado global" tam={66} estilo={{ left: 120, top: 100 }} />
      <Pantalla v={v} a={214.2} src={`${M}/capturas/portada.jpg`} x={120} y={230} w={980} h={580} />
      <Entra v={v} a={214.96} como="escala" estilo={{ left: 120, top: 850 }}>
        <span className="chip chip-cian faceta-sm"><span style={{ width: 14, height: 14, borderRadius: '50%', background: '#04161a', opacity: 0.5 + 0.5 * Math.sin(v * 6) }} />En producción · amatista-3d.tech</span>
      </Entra>
      <Entra v={v} a={217.7} estilo={{ left: 124, top: 930, font: '500 30px var(--sans)', color: 'var(--lavanda)' }}>Adaptable · sostenible · listo para escalar</Entra>
      <svg viewBox="0 0 700 760" style={{ position: 'absolute', left: 1160, top: 210, width: 640, height: 700 }}>
        {PAISES.map(([n, x, y], i) => {
          const k = curva.rebote(tramo(expande, i * 0.08, i * 0.08 + 0.3));
          const cx = x * 700;
          const cy = y * 760;
          return (
            <g key={n} opacity={acotar(k * 1.5)}>
              {i > 0 && <line x1={0.27 * 700} y1={0.22 * 760} x2={cx} y2={cy} stroke="#00e5ff" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="4 8" />}
              <circle cx={cx} cy={cy} r={(i === 0 ? 22 : 13) * acotar(k)} fill={i === 0 ? '#ff6fae' : '#9b59b6'} />
              <circle cx={cx} cy={cy} r={(i === 0 ? 40 : 26) * acotar(k) * (1 + 0.2 * Math.sin(v * 3 + i))} fill="none" stroke={i === 0 ? '#ff6fae' : '#c39bd3'} strokeOpacity="0.5" />
              <text x={cx + 30} y={cy + 8} fill="#e8daef" style={{ font: '600 22px var(--sans)' }}>{n}</text>
            </g>
          );
        })}
      </svg>
      <Entra v={v} a={220.26} estilo={{ left: 1180, top: 910, width: 640, font: '700 36px/1.2 var(--sans)' }}>
        <span className="gema-texto">Cientos de miles</span> de estudiantes en Latinoamérica
      </Entra>
    </Capa>
  );
}

// ------------------------------------------------------------------ 14 · Cierre (223.5 → fin)

export function Cierre({ v }) {
  const hoy = curva.sale(tramo(v, 228.42, 229.0));
  const final = tramo(v, 233.2, 234.4);
  return (
    <Capa>
      <Fondo v={v} tono={0.2 + hoy * 0.6} />
      <Destellos t={v} n={50} fuerza={hoy} />
      <Foto v={v} a={223.9} b={233.0} src={`${M}/fotos/3.jpg`} x={120} y={140} w={420} h={560} zoom={[1.05, 1.12]} posicion="50% 40%" rot={-2} />
      <Foto v={v} a={224.6} b={233.0} src={`${M}/fotos/5.jpg`} x={1380} y={140} w={420} h={560} zoom={[1.05, 1.12]} posicion="50% 35%" rot={2} />
      <div style={{ position: 'absolute', left: 600, right: 600, top: 180, textAlign: 'center', opacity: 1 - final }}>
        <div style={{ font: '700 52px/1.2 var(--sans)', opacity: curva.sale(tramo(v, 223.8, 224.6)) }}>El talento está repartido de forma equitativa en México…</div>
        <div style={{ marginTop: 26, font: '700 52px/1.2 var(--sans)', color: 'var(--lavanda)', opacity: curva.sale(tramo(v, 226.9, 227.6)) }}>pero las herramientas no…</div>
        <div className="gema-texto" style={{ marginTop: 26, font: '850 110px/1 var(--sans)', opacity: hoy, transform: `scale(${mezclar(1.3, 1, hoy)})` }}>hasta hoy.</div>
      </div>
      <Entra v={v} a={229.4} b={233.2} estilo={{ left: 0, right: 0, top: 790, textAlign: 'center', font: '600 42px var(--sans)' }}>
        Con Amatista, ningún estudiante se quedará sin <span className="gema-texto">moldear su futuro</span>.
      </Entra>
      {/* Tarjeta final */}
      <div style={{ position: 'absolute', inset: 0, opacity: curva.sale(final) }}>
        <div style={{ position: 'absolute', left: 960 - 150, top: 150 }}><Gema tam={300} arma={1} brillo={0.7 + 0.2 * Math.sin(v * 2)} /></div>
        <div className="gema-texto" style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', font: '800 110px var(--sans)', letterSpacing: '0.3em' }}>AMATISTA</div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 650, textAlign: 'center', font: '700 54px var(--sans)' }}>Muchas gracias</div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 745, textAlign: 'center', font: '500 30px var(--sans)', color: 'var(--niebla)' }}>
          Maximiliano Cabello Mata · Diana Paola Acatitla Martínez
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center' }}>
          <span className="chip chip-cian faceta-sm">amatista-3d.tech · Reto 2 · Educación Offline-First</span>
        </div>
      </div>
    </Capa>
  );
}
