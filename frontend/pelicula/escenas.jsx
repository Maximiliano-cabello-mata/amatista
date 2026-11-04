// Las escenas de la película de Hack4Edu. Cada una recibe t (segundos desde que empieza) y d (duración).
// Personajes, escenarios, jefes y avatares son los componentes reales de la plataforma.
import FondoLowPoly from '../src/components/FondoLowPoly.jsx';
import Escenario from '../src/components/temas/Escenario.jsx';
import Jefe from '../src/components/temas/Jefe.jsx';
import { SpriteMascota } from '../src/components/temas/Mascota.jsx';
import { TEMAS } from '../src/components/temas/temas.js';
import { BustoAvatar } from '../src/avatares/Avatar.jsx';
import { AVATARES } from '../src/avatares/catalogo.js';
import { crearMalla, proyectar } from '../src/components/graficas/malla.js';
import { Destellos, Flujo, Frase, Gema, Geoda, Icono, Laptop, Metraje, Nota, Rotulo } from './piezas.jsx';
import { acotar, azar, curva, mezclar, tramo, vida } from './tiempo';

const tema = (id) => ({ id, ...TEMAS[id] });
const MUROS = [
  { tema: 'herreria', nombre: 'El muro del equipo', texto: 'Su computadora no puede abrirlo.' },
  { tema: 'galeria', nombre: 'El muro del idioma', texto: 'Los cursos están en inglés\ny suponen una computadora potente.' },
  { tema: 'cine', nombre: 'El muro del apagón', texto: 'Se va el internet.\nLa clase se congela.' },
];

function Capa({ children, estilo }) {
  return <div style={{ position: 'absolute', inset: 0, ...estilo }}>{children}</div>;
}

function Fondo({ opacidad = 1, zoom = 1 }) {
  return (
    <Capa estilo={{ opacity: opacidad, transform: `scale(${zoom})` }}>
      <FondoLowPoly />
    </Capa>
  );
}

// Valeria: el avatar «ajolote» dentro de su hexágono.
function Valeria({ tam = 300, gris = 0, brillo = 0 }) {
  const datos = AVATARES.find((a) => a.id === 'ajolote');
  return (
    <div className="hexagono-pelicula" style={{ width: tam, height: tam * 1.1, display: 'grid', placeItems: 'center',
      background: `radial-gradient(circle at 70% 25%, rgb(255 255 255 / .16), ${datos.fondo} 70%)`,
      filter: `grayscale(${gris}) brightness(${1 - gris * 0.35}) drop-shadow(0 0 ${brillo * 60}px rgb(195 155 211 / ${brillo * 0.8}))` }}>
      <BustoAvatar id="ajolote" className="" />
    </div>
  );
}

function Burbuja({ t, a, b, children, estilo }) {
  const k = vida(t, a, b, 0.45);
  return (
    <div style={{ position: 'absolute', opacity: k, transform: `scale(${mezclar(0.85, 1, curva.rebote(acotar(k)))})`, transformOrigin: '0 100%',
      background: '#f1eef6', color: '#16131a', font: '650 30px var(--sans)', padding: '18px 26px',
      clipPath: 'polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)', ...estilo }}>{children}</div>
  );
}

// ================================================================ ACTO I · La pared

export function Apertura({ t }) {
  return (
    <Capa estilo={{ background: '#08070a' }}>
      <Fondo opacidad={0.45 * curva.suave(tramo(t, 0.5, 6))} zoom={mezclar(1.12, 1.02, tramo(t, 0, 9))} />
      <Destellos t={t} n={55} fuerza={curva.sale(tramo(t, 0, 2))} />
      <Capa estilo={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'absolute', top: 390 }}>
          <Frase t={t} a={0.8} b={4.4} tam={78} texto={'Cada día, alguien en algún lugar\ndecide que quiere *crear mundos en 3D*.'} />
        </div>
        <div style={{ position: 'absolute', top: 470 }}>
          <Frase t={t} a={5.0} b={8.4} tam={64} peso={600} texto="Esta es la historia de *una* de esas personas." />
        </div>
      </Capa>
    </Capa>
  );
}

export function ConoceAValeria({ t }) {
  const flota = Math.sin(t * 1.6) * 10;
  const entra = curva.rebote(tramo(t, 0.3, 1.3));
  const wifi = Math.sin(t * 9) > 0.2 || t < 7.5;
  const chips = [
    ['laptop', 'La laptop de la familia'],
    ['chip', 'Gráfica integrada, 8 GB de memoria'],
    [wifi ? 'wifi' : 'sinwifi', 'Internet que va y viene'],
  ];
  return (
    <Capa estilo={{ background: '#0d0b10', transform: `scale(${mezclar(1, 1.04, tramo(t, 0, 16))})` }}>
      <Capa estilo={{ top: 'auto', height: 560, opacity: 0.85 }}><Escenario tema={tema('aldea')} className="escenario-ancho" /></Capa>
      <Destellos t={t} n={24} semilla={9} />
      <div style={{ position: 'absolute', left: 230, top: 250, transform: `translateY(${flota}px) scale(${entra})`, opacity: acotar(entra) }}>
        <Valeria tam={380} brillo={0.25} />
      </div>
      <div style={{ position: 'absolute', left: 760, top: 190, width: 1060 }}>
        <Frase t={t} a={0.6} tam={104} alinear="left" texto="Ella es *Valeria*." />
        <div style={{ marginTop: 18 }}>
          <Frase t={t} a={1.8} tam={46} peso={500} color="rgb(255 255 255 / .75)" alinear="left" paso={0.045}
            texto={'Tiene 15 años y un sueño muy concreto:\nhacer su propio videojuego.'} />
        </div>
        <div style={{ marginTop: 56, display: 'grid', gap: 18 }}>
          {chips.map(([icono, texto], i) => {
            const k = vida(t, 4.6 + i * 0.9, 99, 0.5);
            return (
              <div key={texto} style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: k, transform: `translateX(${(1 - k) * 40}px)`,
                background: 'rgb(30 30 34 / .78)', border: '1px solid rgb(255 255 255 / .12)', padding: '14px 26px', width: 'fit-content',
                clipPath: 'polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)' }}>
                <Icono tipo={icono} tam={46} color={icono === 'sinwifi' ? '#ff8a8a' : '#c39bd3'} />
                <span style={{ fontSize: 34, fontWeight: 600 }}>{texto}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Burbuja t={t} a={10.2} b={15.4} estilo={{ left: 150, top: 150 }}>Eligió al ajolote como personaje…</Burbuja>
      <div style={{ position: 'absolute', left: 760, top: 850 }}>
        <Frase t={t} a={11.6} b={15.2} tam={44} peso={650} alinear="left" texto="*«Se regenera de cada error.»*" />
      </div>
      <Nota t={t} a={1} b={15}>Historia ilustrativa, basada en situaciones comunes.</Nota>
    </Capa>
  );
}

export function LosMuros({ t }) {
  const oscuro = curva.suave(tramo(t, 14.5, 16)) * 0.45 + curva.suave(tramo(t, 19, 21.5)) * 0.3;
  const titila = t > 15 && t < 18 && Math.sin(t * 31) > 0.6 ? 0.18 : 0;
  const rinde = tramo(t, 18.8, 20.5);
  return (
    <Capa estilo={{ background: '#0c0a0f' }}>
      <Capa estilo={{ top: 'auto', height: 420, opacity: 0.6 }}><Escenario tema={tema('herreria')} className="escenario-ancho" /></Capa>
      {/* El camino de Valeria a su primer mundo */}
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
        <path d="M260 720 C 700 700, 1200 740, 1690 700" fill="none" stroke="#c39bd3" strokeOpacity="0.35" strokeWidth="4" strokeDasharray="4 18" />
      </svg>
      <div style={{ position: 'absolute', left: 120, top: 560 }}><Valeria tam={200} gris={curva.suave(rinde) * 0.9} /></div>
      <div style={{ position: 'absolute', left: 1600, top: 560, textAlign: 'center', opacity: 0.9 - rinde * 0.6 }}>
        <div style={{ filter: 'drop-shadow(0 0 30px rgb(0 229 255 / .5))' }}><Icono tipo="mundo" tam={150} color="#5ff3ff" /></div>
        <div style={{ font: '600 22px var(--mono)', letterSpacing: '0.25em', color: '#5ff3ff', marginTop: 8 }}>SU PRIMER MUNDO</div>
      </div>
      {MUROS.map((muro, i) => {
        const a = 0.6 + i * 6.6;
        const sube = curva.rebote(tramo(t, a, a + 0.9));
        const sacude = t > a + 0.7 && t < a + 1.1;
        const x = 500 + i * 330;
        return (
          <div key={muro.tema}>
            <div style={{ position: 'absolute', left: x, top: 380, width: 300, height: 340, transform: `translateY(${(1 - sube) * 420}px)`,
              opacity: acotar(sube * 1.5) }}>
              <Jefe jefe={TEMAS[muro.tema].jefe} golpeado={sacude} className="jefe-pelicula" />
            </div>
            <div style={{ position: 'absolute', left: x - 20, top: 740, width: 340, textAlign: 'center', opacity: vida(t, a + 0.5, 99, 0.5) * (1 - rinde * 0.7) }}>
              <div style={{ font: '600 20px var(--mono)', letterSpacing: '0.3em', color: TEMAS[muro.tema].colores.acento }}>{`MURO ${i + 1}`}</div>
              <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>{muro.nombre}</div>
            </div>
            <div style={{ position: 'absolute', left: 160, top: 150, width: 1600 }}>
              <Frase t={t} a={a + 0.8} b={a + 5.6} tam={70} alinear="left" texto={muro.texto} />
            </div>
          </div>
        );
      })}
      {/* El error que ve, el curso que no entiende, la clase que se congela */}
      <div style={{ position: 'absolute', left: 1290, top: 300, opacity: vida(t, 2.2, 6.2, 0.4), transform: `scale(${mezclar(0.9, 1, curva.rebote(tramo(t, 2.2, 2.8)))})` }}>
        <div style={{ background: '#2b2b30', border: '1px solid #55555c', width: 520, boxShadow: '0 30px 60px rgb(0 0 0 / .6)' }}>
          <div style={{ background: '#3a3a40', padding: '10px 16px', font: '600 20px var(--sans)', color: '#ddd' }}>Error</div>
          <div style={{ padding: '22px 24px', fontSize: 26, color: '#eee', lineHeight: 1.35 }}>Este programa necesita una tarjeta gráfica más nueva.</div>
          <div style={{ padding: '0 24px 20px', textAlign: 'right' }}><span style={{ background: '#55555c', padding: '8px 26px', fontSize: 22 }}>Cerrar</span></div>
        </div>
      </div>
      {['GPU required', 'Render settings', 'Subscribe for more', 'Advanced lighting', 'Download our pack'].map((texto, i) => {
        const k = vida(t, 8.4 + i * 0.35, 12.6, 0.4);
        return <div key={texto} style={{ position: 'absolute', left: 1380 + (i % 2) * 90, top: 290 + i * 46, opacity: k * 0.85, font: '600 30px var(--sans)',
          color: '#d8c9e6', transform: `translateX(${(1 - k) * 30}px)` }}>{texto}</div>;
      })}
      <div style={{ position: 'absolute', left: 1450, top: 290, opacity: vida(t, 15.2, 19, 0.4) }}>
        <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: `rotate(${t * 220}deg)` }}>
          <circle cx="50" cy="50" r="38" fill="none" stroke="#ffe066" strokeOpacity=".2" strokeWidth="9" />
          <path d="M50 12 A38 38 0 0 1 88 50" fill="none" stroke="#ffe066" strokeWidth="9" strokeLinecap="round" />
        </svg>
      </div>
      <Capa estilo={{ background: '#000', opacity: oscuro + titila, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 860, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={19.4} tam={58} peso={650} texto="Tres semanas después… *lo deja*." />
      </div>
    </Capa>
  );
}

export function NoEsLaUnica({ t }) {
  const r = azar(5);
  const celdas = [];
  for (let fila = 0; fila < 6; fila += 1) {
    for (let col = 0; col < 13; col += 1) {
      const x = 120 + col * 140 + (fila % 2) * 70;
      const y = 230 + fila * 120;
      const dist = Math.hypot(x - 960, y - 530);
      celdas.push({ x, y, k: curva.rebote(tramo(t, 4.4 + dist / 900, 5.0 + dist / 900)), id: AVATARES[Math.floor(r() * AVATARES.length)].id,
        apagado: r() > 0.25 });
    }
  }
  const muestra = tramo(t, 3.6, 4.3);
  return (
    <Capa estilo={{ background: '#0b0a0e' }}>
      <Capa estilo={{ display: 'grid', placeItems: 'center', opacity: 1 - curva.suave(muestra) }}>
        <div style={{ position: 'absolute', top: 400 }}><Frase t={t} a={0.3} tam={86} texto="No le faltó talento." /></div>
        <div style={{ position: 'absolute', top: 520 }}><Frase t={t} a={1.9} tam={60} peso={600} texto="Le faltó un camino hecho para *lo que tiene*." /></div>
      </Capa>
      {celdas.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: c.x - 50, top: c.y - 55, transform: `scale(${c.k})`, opacity: acotar(c.k) }}>
          <div className="hexagono-pelicula" style={{ width: 100, height: 110, display: 'grid', placeItems: 'center',
            background: 'radial-gradient(circle at 70% 25%, rgb(255 255 255 / .14), #2a1a33 70%)', filter: c.apagado ? 'grayscale(1) brightness(.55)' : 'none' }}>
            <BustoAvatar id={c.id} />
          </div>
        </div>
      ))}
      <Capa estilo={{ background: 'radial-gradient(60% 55% at 50% 50%, transparent, #0b0a0e 85%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 80, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={5.6} tam={74} texto="Y no es *la única*." />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 930, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={7.2} tam={40} peso={550} color="rgb(255 255 255 / .8)" paso={0.04}
          texto="Pasa en muchas casas y escuelas donde la computadora es *la que hay*." />
      </div>
    </Capa>
  );
}

export function Titulo({ t }) {
  const destello = curva.sale(tramo(t, 1.9, 2.1)) * (1 - curva.sale(tramo(t, 2.1, 3.2)));
  const letras = 'AMATISTA'.split('');
  return (
    <Capa estilo={{ background: '#0a090d', transform: `scale(${mezclar(1, 1.05, tramo(t, 0, 9))})` }}>
      <Fondo opacidad={0.55} />
      <Destellos t={t} n={40} semilla={12} />
      <Capa estilo={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'absolute', top: 150 }}>
          <Gema tam={330} arma={tramo(t, 0.2, 2.1)} brillo={destello + 0.3 * Math.sin(t * 1.5) ** 2} giro={Math.sin(t * 0.6) * 3} />
        </div>
        <div style={{ position: 'absolute', top: 560, display: 'flex', gap: 30 }}>
          {letras.map((l, i) => {
            const k = curva.sale(tramo(t, 2.2 + i * 0.07, 2.8 + i * 0.07));
            return <span key={i} style={{ fontSize: 168, fontWeight: 800, opacity: k, transform: `translateY(${(1 - k) * 60}px)`, display: 'inline-block' }}>{l}</span>;
          })}
        </div>
        <div style={{ position: 'absolute', top: 790 }}>
          <Frase t={t} a={3.6} tam={52} peso={550} texto="Aprende 3D paso a paso, *en la computadora que tienes*." />
        </div>
        <div style={{ position: 'absolute', top: 880 }}>
          <Frase t={t} a={5.4} tam={30} peso={500} color="rgb(255 255 255 / .6)" texto="Una plataforma para aprender Blender y 3D para la web, en español." />
        </div>
      </Capa>
      <Capa estilo={{ background: '#fff', opacity: destello * 0.55, mixBlendMode: 'overlay' }} />
    </Capa>
  );
}

// ================================================================ ACTO II · El camino

function MuroVencido({ t, a, muro, x = 1460, y = 640 }) {
  const datos = TEMAS[muro.tema];
  const k = curva.sale(tramo(t, a, a + 0.6));
  const cae = curva.suave(tramo(t, a + 1.0, a + 1.8));
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 360, opacity: acotar(k) }}>
      <div style={{ width: 240, height: 270, margin: '0 auto', transform: `rotate(${cae * 18}deg) translateY(${cae * 30}px)`, opacity: 1 - cae * 0.4 }}>
        <Jefe jefe={datos.jefe} golpeado={t > a + 0.4 && t < a + 1.0} derrotado={t >= a + 1.0} className="jefe-pelicula" />
      </div>
      <div style={{ textAlign: 'center', marginTop: 4, opacity: curva.sale(tramo(t, a + 1.2, a + 1.7)) }}>
        <div style={{ font: '600 20px var(--mono)', letterSpacing: '0.3em', color: '#6ee7b7' }}>VENCIDO</div>
        <div style={{ fontSize: 30, fontWeight: 700, textDecoration: 'line-through', textDecorationColor: '#6ee7b7', textDecorationThickness: 3 }}>{muro.nombre}</div>
      </div>
    </div>
  );
}

export function ElCamino({ t }) {
  const gira = curva.suave(tramo(t, 0.4, 5));
  const mascotas = ['taller', 'hangar', 'pintura', 'portal', 'cine', 'circo'];
  return (
    <Capa estilo={{ background: '#0b0a0e' }}>
      <Fondo opacidad={0.5} zoom={mezclar(1.05, 1, tramo(t, 0, 18))} />
      <div style={{ position: 'absolute', left: 120, top: 120 }}><Rotulo t={t} a={0.2} texto="Lo que hace Amatista" /></div>
      <div style={{ position: 'absolute', left: 120, top: 200, width: 640 }}>
        <Frase t={t} a={0.6} tam={78} alinear="left" texto={'Primero,\nle muestra\n*un camino*.'} />
        <div style={{ marginTop: 40 }}>
          <Frase t={t} a={3.4} tam={38} peso={500} color="rgb(255 255 255 / .78)" alinear="left" paso={0.04}
            texto={'Elige qué quiere crear\ny sigue los pasos en orden.'} />
        </div>
        <div style={{ marginTop: 26 }}>
          <Frase t={t} a={6.4} tam={38} peso={500} color="rgb(255 255 255 / .78)" alinear="left" paso={0.04}
            texto={'Cada paso es un mundo,\ncon su propio guía.'} />
        </div>
        <div style={{ marginTop: 26 }}>
          <Frase t={t} a={9.6} tam={44} peso={700} alinear="left" texto="Y todo, *en español*." />
        </div>
      </div>
      <Laptop ancho={1040} x={330} y={-20} rx={mezclar(14, 4, gira)} ry={mezclar(-24, -10, gira)} escala={mezclar(0.86, 1, gira)} brillo={0.3}>
        <Metraje toma="portada" t={t - 0.4} vel={0.75} />
      </Laptop>
      {mascotas.map((id, i) => {
        const k = curva.rebote(tramo(t, 6.6 + i * 0.25, 7.3 + i * 0.25));
        const x = 820 + i * 175;
        const salto = Math.abs(Math.sin(t * 2.4 + i)) * 16;
        return (
          <div key={id} style={{ position: 'absolute', left: x, top: 880 - salto, width: 110, height: 110, transform: `scale(${k})`, opacity: acotar(k) }}>
            <SpriteMascota tema={tema(id)} className="sprite-pelicula" />
            <div style={{ textAlign: 'center', font: '600 16px var(--mono)', color: TEMAS[id].colores.acento, marginTop: 4 }}>{TEMAS[id].mascota?.nombre}</div>
          </div>
        );
      })}
    </Capa>
  );
}

export function Aprender({ t }) {
  const cambio = curva.suave(tramo(t, 9.5, 10.6));
  return (
    <Capa estilo={{ background: '#0b0a0e' }}>
      <Fondo opacidad={0.4} />
      {/* Lección y jefe a pantalla grande, con un movimiento de cámara lento */}
      <Laptop ancho={1180} x={-230} y={10} rx={4} ry={mezclar(12, 6, tramo(t, 0, 10))} escala={mezclar(0.95, 1.02, tramo(t, 0, 10))}>
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - cambio }}><Metraje toma="leccion" t={t} vel={0.8} /></div>
        <div style={{ position: 'absolute', inset: 0, opacity: cambio }}><Metraje toma="jefe" t={t - 10} desde={0.2} vel={1.15} /></div>
      </Laptop>
      <div style={{ position: 'absolute', left: 1370, top: 220, width: 470 }}>
        <Frase t={t} a={0.5} b={9.2} tam={58} alinear="left" texto={'Lecciones de\n*menos de diez\nminutos*.'} />
        <div style={{ marginTop: 30 }}>
          <Frase t={t} a={3.2} b={9.2} tam={36} peso={500} color="rgb(255 255 255 / .78)" alinear="left" paso={0.04}
            texto={'Se aprende haciendo:\nmover, probar, equivocarse\ny volver a intentar.'} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 1370, top: 220, width: 470 }}>
        <Frase t={t} a={10.6} tam={58} alinear="left" texto={'Y cada módulo\ntermina con\n*un jefe final*.'} />
        <div style={{ marginTop: 30 }}>
          <Frase t={t} a={13.4} tam={36} peso={500} color="rgb(255 255 255 / .78)" alinear="left" paso={0.04}
            texto={'Cada respuesta correcta\nes un golpe.'} />
        </div>
      </div>
      <MuroVencido t={t} a={18.4} muro={MUROS[1]} x={1420} y={640} />
    </Capa>
  );
}

export function SinConexion({ t }) {
  const corte = 4.2;
  const negro = t > corte && t < corte + 0.5 ? 0.75 * (1 - tramo(t, corte, corte + 0.5)) : 0;
  const lupa = vida(t, corte + 0.8, 11.2, 0.5);
  return (
    <Capa estilo={{ background: '#0a090c' }}>
      <Capa estilo={{ top: 'auto', height: 460, opacity: 0.55 }}><Escenario tema={tema('cine')} className="escenario-ancho" /></Capa>
      <div style={{ position: 'absolute', left: 120, top: 120 }}><Rotulo t={t} a={0.2} texto="Muro 3 · El apagón" color="#ffe066" /></div>
      <div style={{ position: 'absolute', left: 120, top: 210, width: 640 }}>
        <Frase t={t} a={0.6} tam={72} alinear="left" texto="Se va el internet…" />
        <div style={{ marginTop: 16 }}><Frase t={t} a={corte + 0.9} tam={72} alinear="left" texto="…y Amatista *sigue*." /></div>
        <div style={{ marginTop: 40 }}>
          <Frase t={t} a={7.4} tam={36} peso={500} color="rgb(255 255 255 / .8)" alinear="left" paso={0.04}
            texto={'El avance se guarda en su equipo.\nCuando vuelve la señal,\ntodo se sincroniza solo.'} />
        </div>
      </div>
      <Laptop ancho={980} x={380} y={-30} rx={6} ry={-14} escala={mezclar(0.96, 1.02, tramo(t, 0, 17))}>
        <Metraje toma="sin_conexion" t={t - corte + 1.8} />
        <Capa estilo={{ background: '#000', opacity: negro }} />
      </Laptop>
      {/* Lupa sobre la insignia «Sin conexión» de la barra superior */}
      <div style={{ position: 'absolute', left: 1370, top: 640, width: 420, height: 150, overflow: 'hidden', opacity: lupa,
        transform: `scale(${mezclar(0.8, 1, curva.rebote(lupa))})`, border: '2px solid #ffe066', boxShadow: '0 20px 50px rgb(0 0 0 / .6)' }}>
        <div style={{ position: 'absolute', width: 1920 * 1.6, height: 1080 * 1.6, left: -1290 * 1.6 + 120, top: -14 * 1.6 }}>
          <Metraje toma="sin_conexion" t={t - corte + 1.8} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 1290, top: 600, opacity: lupa }}><Icono tipo="sinwifi" tam={80} color="#ffe066" /></div>
      <MuroVencido t={t} a={13.2} muro={MUROS[2]} x={150} y={650} />
    </Capa>
  );
}

// ================================================================ ACTO III · Geoda, el proyecto hermano

export function LaPregunta({ t }) {
  const sube = curva.rebote(tramo(t, 2.6, 3.6));
  return (
    <Capa estilo={{ background: '#0b090d' }}>
      <Capa estilo={{ top: 'auto', height: 480, opacity: 0.7 }}><Escenario tema={tema('herreria')} className="escenario-ancho" /></Capa>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 160, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={0.4} tam={74} texto="Pero quedaba *el muro más alto*." />
      </div>
      <div style={{ position: 'absolute', left: 810, top: 330, width: 300, height: 340, transform: `translateY(${(1 - sube) * 380}px) scale(1.3)` }}>
        <Jefe jefe={TEMAS.herreria.jefe} golpeado={t > 3.3 && t < 3.8} className="jefe-pelicula" />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 820, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={4.4} tam={54} peso={600} texto="¿Qué tanto puede *su computadora*?" />
      </div>
    </Capa>
  );
}

const EQUIPOS = [
  ['telefono', 'Celular', 330, 300], ['laptop', 'Laptop de hace 8 años', 260, 640], ['laptop', 'Chromebook escolar', 560, 860],
  ['escritorio', 'Computadora del laboratorio', 1330, 860], ['laptop', 'Laptop con gráfica integrada', 1640, 620], ['escritorio', 'Estación de trabajo', 1590, 300],
];

export function Geodaescena({ t }) {
  const abre = tramo(t, 1.2, 3.4);
  return (
    <Capa estilo={{ background: 'radial-gradient(60% 60% at 50% 50%, #061a20, #070709 75%)' }}>
      <Destellos t={t} n={45} semilla={31} color="#a8f6ff" />
      {EQUIPOS.map(([icono, nombre, x, y], i) => {
        const k = curva.sale(tramo(t, 5 + i * 0.35, 5.6 + i * 0.35));
        return (
          <div key={nombre}>
            <Flujo t={t + i} de={[x + 40, y + 40]} a={[960, 480]} n={10} curvatura={i % 2 ? 120 : -120} fuerza={k * curva.sale(tramo(t, 6.5, 7.5))} />
            <div style={{ position: 'absolute', left: x - 30, top: y - 10, width: 160, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 20}px)` }}>
              <Icono tipo={icono} tam={88} color="#a8f6ff" />
              <div style={{ font: '500 19px var(--mono)', color: 'rgb(168 246 255 / .8)', marginTop: 6 }}>{nombre}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 960 - 180, top: 480 - 180, transform: `scale(${mezclar(0.6, 1, curva.rebote(tramo(t, 0.6, 1.8)))})` }}>
        <Geoda tam={360} abre={abre} pulso={0.5 + 0.5 * Math.sin(t * 2.2)} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70, display: 'grid', placeItems: 'center' }}>
        <Rotulo t={t} a={0.3} texto="El proyecto hermano" />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 130, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={1.4} b={9.6} tam={84} texto="Para ese muro existe *Geoda*." />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 130, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={10.2} tam={52} peso={650} texto={'Geoda conoce las computadoras:\nmide cómo corre el 3D en equipos reales.'} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 730, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={3.2} b={9.6} tam={36} peso={500} color="rgb(255 255 255 / .75)" paso={0.04}
          texto="Es un proyecto aparte, con su propio camino." />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 960, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={14.2} tam={34} peso={500} color="rgb(168 246 255 / .85)" paso={0.04} texto="Del celular a la estación de trabajo." />
      </div>
    </Capa>
  );
}

export function Intercambio({ t }) {
  const izq = [560, 470];
  const der = [1360, 470];
  const morado = curva.sale(tramo(t, 6.4, 7.2));
  const cian = curva.sale(tramo(t, 2.0, 2.8));
  return (
    <Capa estilo={{ background: 'radial-gradient(80% 70% at 50% 45%, #140f1a, #070709 75%)' }}>
      <Destellos t={t} n={30} semilla={44} />
      <Flujo t={t} de={[der[0] - 120, der[1] - 30]} a={[izq[0] + 120, izq[1] - 30]} curvatura={-170} color="#00e5ff" n={22} fuerza={cian} />
      <Flujo t={t} de={[izq[0] + 120, izq[1] + 60]} a={[der[0] - 120, der[1] + 60]} curvatura={170} color="#c39bd3" n={22} fuerza={morado} />
      <div style={{ position: 'absolute', left: izq[0] - 150, top: izq[1] - 170, textAlign: 'center', width: 300 }}>
        <Gema tam={260} brillo={0.4 + 0.3 * Math.sin(t * 2)} />
        <div style={{ fontSize: 44, fontWeight: 800, marginTop: 14 }}>Amatista</div>
        <div style={{ fontSize: 26, color: 'rgb(255 255 255 / .7)' }}>enseña</div>
      </div>
      <div style={{ position: 'absolute', left: der[0] - 150, top: der[1] - 170, textAlign: 'center', width: 300 }}>
        <Geoda tam={260} pulso={0.5 + 0.5 * Math.sin(t * 2 + 1)} />
        <div style={{ fontSize: 44, fontWeight: 800, marginTop: 14, color: '#a8f6ff' }}>Geoda</div>
        <div style={{ fontSize: 26, color: 'rgb(168 246 255 / .75)' }}>conoce las computadoras</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 90, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={0.4} b={5.8} tam={58} texto="Dos proyectos que *se alimentan*." />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 90, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={2.2} b={5.8} tam={34} peso={500} color="#a8f6ff" estilo={{ marginTop: 90 }} texto="Geoda le dice a Amatista qué puede hacer cada equipo." />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 90, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={6.4} b={11.4} tam={34} peso={500} color="#e2c6f5" texto="Amatista le cuenta a Geoda cómo les va a los estudiantes…" />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={8.0} b={11.4} tam={34} peso={700} texto="…sin sus datos personales." />
      </div>
      <div style={{ position: 'absolute', left: 930, top: 440, opacity: vida(t, 8.0, 11.4, 0.4) }}><Icono tipo="candado" tam={64} color="#f1eef6" /></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 880, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={12.0} tam={58} texto="Cada estudiante mejora *el camino del siguiente*." />
      </div>
    </Capa>
  );
}

export function PlanDeValeria({ t }) {
  const escaneo = tramo(t, 1.4, 4.2);
  const tarjeta = curva.sale(tramo(t, 4.4, 5.2));
  const pulsa = t > 8.6 && t < 8.9;
  return (
    <Capa estilo={{ background: 'radial-gradient(70% 70% at 30% 50%, #0d1a1e, #08080a 75%)' }}>
      <div style={{ position: 'absolute', left: 150, top: 300, textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 360 }}>
          <Icono tipo="laptop" tam={360} color="#a8f6ff" />
          <div style={{ position: 'absolute', left: 60, right: 60, top: mezclar(70, 230, escaneo), height: 4, background: '#00e5ff',
            boxShadow: '0 0 24px #00e5ff', opacity: escaneo > 0 && escaneo < 1 ? 1 : 0 }} />
        </div>
        <div style={{ position: 'absolute', left: 220, top: -40 }}><Valeria tam={120} /></div>
        <div style={{ font: '500 22px var(--mono)', color: '#a8f6ff', marginTop: -20 }}>La laptop de Valeria</div>
      </div>
      <div style={{ position: 'absolute', left: 690, top: 250, width: 1080, opacity: tarjeta, transform: `translateX(${(1 - tarjeta) * 60}px)` }}>
        <div style={{ background: 'rgb(18 24 28 / .92)', border: '1px solid rgb(0 229 255 / .35)', padding: '40px 46px',
          clipPath: 'polygon(26px 0,100% 0,100% calc(100% - 26px),calc(100% - 26px) 100%,0 100%,0 26px)' }}>
          <div style={{ font: '600 22px var(--mono)', letterSpacing: '0.3em', color: '#00e5ff' }}>GEODA RECOMIENDA</div>
          <div style={{ fontSize: 46, fontWeight: 750, marginTop: 16, lineHeight: 1.2 }}>Tu equipo: laptop con gráfica integrada.</div>
          <div style={{ display: 'grid', gap: 16, marginTop: 30, fontSize: 32 }}>
            {['Usa la versión de Blender que tu gráfica sí abre.', 'Con ajustes ligeros, la vista 3D va fluida.', 'Tus lecciones ya están probadas en esa versión.'].map((texto, i) => {
              const k = curva.sale(tramo(t, 5.4 + i * 0.7, 6.0 + i * 0.7));
              return <div key={texto} style={{ display: 'flex', gap: 18, alignItems: 'center', opacity: k, transform: `translateX(${(1 - k) * 30}px)` }}>
                <span style={{ width: 18, height: 18, background: '#6ee7b7', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }} />{texto}</div>;
            })}
          </div>
          <div style={{ marginTop: 36, display: 'flex', gap: 18, opacity: curva.sale(tramo(t, 7.6, 8.2)) }}>
            <span style={{ background: '#00e5ff', color: '#071014', fontSize: 30, fontWeight: 750, padding: '16px 30px', transform: `scale(${pulsa ? 0.95 : 1})` }}>Ajustar a mi equipo</span>
            <span style={{ border: '2px solid rgb(255 255 255 / .45)', fontSize: 30, fontWeight: 650, padding: '14px 28px' }}>Deshacer</span>
          </div>
        </div>
      </div>
      <MuroVencido t={t} a={9.4} muro={MUROS[0]} x={170} y={690} />
      <div style={{ position: 'absolute', left: 690, top: 880, width: 1100 }}>
        <Frase t={t} a={10.2} tam={44} peso={650} alinear="left" texto="Ahora su computadora *ya no es un muro*." />
      </div>
      <Nota t={t} a={5} estilo={{ left: 'auto', right: 120 }}>Geoda · en desarrollo</Nota>
    </Capa>
  );
}

// ================================================================ ACTO II (cont.) · Blender a su lado y la web

const MALLA_BASE = crearMalla({ shape: 'cube' });
const RADIO_BASE = proyectar(MALLA_BASE, {}).radio;

function cuboExtruido(k) {
  const v = MALLA_BASE.vertices.map(([x, y, z]) => [x, y, z > 0 ? z + k * 1.4 : z]);
  return { ...MALLA_BASE, vertices: v };
}

export function BlenderGuia({ t }) {
  const extruye = curva.suave(tramo(t, 9.0, 11.0));
  const malla = cuboExtruido(extruye);
  const p = proyectar(malla, { giro: 0.6 + t * 0.12, inclinacion: 0.45, ancho: 900, alto: 620 });
  const hecho = t > 11.2;
  const faro = 0.5 + 0.5 * Math.sin(t * 6);
  return (
    <Capa estilo={{ background: '#0b0a0e' }}>
      <Fondo opacidad={0.35} />
      <div style={{ position: 'absolute', left: 120, top: 110 }}><Rotulo t={t} a={0.2} texto="Amatista Motor · dentro de Blender" color="#f5792a" /></div>
      <div style={{ position: 'absolute', left: 120, top: 180, width: 1680 }}>
        <Frase t={t} a={0.5} tam={68} alinear="left" texto="Ahora sí, Blender. *Con un guía al lado.*" />
      </div>
      {/* Vista 3D esquemática con la banda de Amatista arriba */}
      <div style={{ position: 'absolute', left: 330, top: 330, width: 1260, height: 660, background: '#2b2b2b', border: '1px solid #444',
        boxShadow: '0 50px 100px -30px rgb(0 0 0 / .9)', opacity: curva.sale(tramo(t, 0.8, 1.6)) }}>
        <div style={{ height: 34, background: '#1f1f1f', display: 'flex', gap: 26, alignItems: 'center', padding: '0 18px', fontSize: 18, color: '#bbb' }}>
          {['Archivo', 'Editar', 'Agregar', 'Objeto'].map((m) => <span key={m}>{m}</span>)}
        </div>
        <div style={{ position: 'absolute', left: 0, top: 34, bottom: 0, width: 58, background: '#232323', display: 'grid', alignContent: 'start', gap: 10, paddingTop: 14, justifyItems: 'center' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ width: 34, height: 34, background: i === 5 ? `rgb(245 121 42 / ${0.45 + faro * 0.5})` : '#3a3a3a',
              boxShadow: i === 5 && !hecho ? `0 0 ${12 + faro * 22}px #f5792a` : 'none', border: i === 5 ? '2px solid #f5792a' : 'none' }} />
          ))}
        </div>
        <svg viewBox="0 0 900 620" style={{ position: 'absolute', left: 180, top: 34, width: 900, height: 620 }}>
          <g style={{ transform: `scale(${p.radio / RADIO_BASE})`, transformOrigin: '450px 310px' }}>
          {Array.from({ length: 13 }, (_, i) => {
            const a = p.aPantalla([-3 + i * 0.5, -3, -1]);
            const b = p.aPantalla([-3 + i * 0.5, 3, -1]);
            const c = p.aPantalla([-3, -3 + i * 0.5, -1]);
            const d = p.aPantalla([3, -3 + i * 0.5, -1]);
            return <g key={i} stroke="#3f3f3f" strokeWidth="1.2"><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} /><line x1={c.x} y1={c.y} x2={d.x} y2={d.y} /></g>;
          })}
          {p.caras.filter((c) => c.frente).map((c) => {
            const l = 0.35 + c.luz * 0.65;
            const arriba = MALLA_BASE.caras[c.i].every((v) => MALLA_BASE.vertices[v][2] > 0);
            const color = arriba && t > 8.6 ? `rgb(${Math.round(245 * l)} ${Math.round(150 * l)} ${Math.round(80 * l)})` : `rgb(${Math.round(170 * l)} ${Math.round(170 * l)} ${Math.round(178 * l)})`;
            return <polygon key={c.i} points={c.puntos} fill={color} stroke="#111" strokeWidth="1.5" />;
          })}
          </g>
        </svg>
        {/* La banda de Amatista Motor: una sola instrucción, arriba de la vista 3D */}
        <div style={{ position: 'absolute', left: 90, right: 30, top: 50, background: hecho ? 'rgb(16 60 44 / .95)' : 'rgb(30 18 38 / .95)',
          border: `2px solid ${hecho ? '#6ee7b7' : '#c39bd3'}`, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 18,
          opacity: curva.sale(tramo(t, 2.0, 2.6)), transform: `translateY(${(1 - curva.sale(tramo(t, 2.0, 2.6))) * -20}px)` }}>
          <img src="/icons/amatista.svg" alt="" width="40" height="40" />
          <div style={{ fontSize: 28, fontWeight: 700 }}>{hecho ? '¡Bien! Paso cumplido: la caja ya tiene altura.' : 'Te toca: Extruir la cara de arriba.'}</div>
          {!hecho && <div style={{ fontSize: 22, color: 'rgb(255 255 255 / .7)', marginLeft: 'auto' }}>La herramienta brilla a la izquierda</div>}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 1560, top: 820, width: 150, height: 150, transform: `scale(${curva.rebote(tramo(t, 11.4, 12.2))}) translateY(${-Math.abs(Math.sin(t * 5)) * 14}px)` }}>
        <SpriteMascota tema={tema('taller')} className="sprite-pelicula" />
      </div>
      <Burbuja t={t} a={11.9} b={18.4} estilo={{ left: 1290, top: 740 }}>¡Así se hace!</Burbuja>
      <div style={{ position: 'absolute', left: 120, top: 1000, width: 1700 }}>
        <Frase t={t} a={13.2} tam={34} peso={500} color="rgb(255 255 255 / .78)" alinear="left" paso={0.035}
          texto="Revisa su escena mientras trabaja y le dice qué sigue, en su idioma." />
      </div>
    </Capa>
  );
}

export function ALaWeb({ t }) {
  const cambio = curva.suave(tramo(t, 9.4, 10.6));
  return (
    <Capa estilo={{ background: '#000' }}>
      <Capa estilo={{ opacity: 1 - cambio, transform: `scale(${mezclar(1.08, 1.0, tramo(t, 0, 10))})` }}>
        <Metraje toma="mundo_ciudad" t={t} desde={4.4} vel={1.2} />
      </Capa>
      <Capa estilo={{ opacity: cambio, transform: `scale(${mezclar(1.0, 1.08, tramo(t, 9.4, 20))})` }}>
        <Metraje toma="mundo_bosque" t={t - 9.4} desde={4.6} vel={1.6} />
      </Capa>
      <Capa estilo={{ background: 'linear-gradient(90deg, rgb(0 0 0 / .86), rgb(0 0 0 / .45) 45%, transparent 68%)' }} />
      <div style={{ position: 'absolute', left: 120, top: 120 }}><Rotulo t={t} a={0.4} texto="Del 3D a la web" color="#00e5ff" /></div>
      <div style={{ position: 'absolute', left: 120, top: 200, width: 900 }}>
        <Frase t={t} a={0.8} b={9.2} tam={76} alinear="left" texto={'Y lo que crea\n*no se queda guardado*.'} />
        <div style={{ marginTop: 30 }}>
          <Frase t={t} a={3.6} b={9.2} tam={40} peso={550} color="rgb(255 255 255 / .85)" alinear="left" paso={0.04}
            texto={'Lo puede caminar en el navegador,\ncomo un videojuego.'} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 120, top: 200, width: 900 }}>
        <Frase t={t} a={10.6} tam={76} alinear="left" texto={'Y compartirlo\n*con cualquiera*.'} />
        <div style={{ marginTop: 30 }}>
          <Frase t={t} a={13.2} tam={40} peso={550} color="rgb(255 255 255 / .85)" alinear="left" paso={0.04}
            texto={'Hasta en un celular,\no en realidad virtual.'} />
        </div>
      </div>
      <Nota t={t} a={1} estilo={{ color: 'rgb(255 255 255 / .6)' }}>Mundos reales del Estudio A‑Frame de Amatista</Nota>
    </Capa>
  );
}

// ================================================================ ACTO IV · Valeria, otra vez

export function TresSemanas({ t }) {
  const llama = 1 + Math.sin(t * 7) * 0.06;
  return (
    <Capa estilo={{ background: '#050505' }}>
      <Capa estilo={{ filter: 'blur(14px) brightness(.45)', transform: 'scale(1.1)' }}>
        <Metraje toma="mundo_bosque" t={t} desde={20} vel={0.8} />
      </Capa>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 110, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={0.4} b={5.2} tam={92} texto="Tres semanas después." />
      </div>
      <div style={{ position: 'absolute', inset: 0, opacity: curva.sale(tramo(t, 4.8, 5.6)) }}>
        <Laptop ancho={1000} x={300} y={60} rx={5} ry={-12} escala={mezclar(0.94, 1, curva.sale(tramo(t, 4.8, 7)))} brillo={0.5}>
          <Metraje toma="panel" t={t - 5.2} vel={0.9} />
        </Laptop>
      </div>
      <div style={{ position: 'absolute', left: 150, top: 300, textAlign: 'center', transform: `scale(${curva.rebote(tramo(t, 5.6, 6.6))})` }}>
        <Valeria tam={300} brillo={0.7} />
      </div>
      <div style={{ position: 'absolute', left: 120, top: 700, width: 600 }}>
        <Frase t={t} a={6.8} tam={54} alinear="left" texto={'Valeria venció\na su primer *jefe*.'} />
        <div style={{ marginTop: 20 }}>
          <Frase t={t} a={9.6} tam={38} peso={550} color="rgb(255 255 255 / .85)" alinear="left" paso={0.04}
            texto={'Lleva una racha de práctica\ny ya caminó su primer mundo.'} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 540, top: 270, transform: `scale(${llama * curva.rebote(tramo(t, 8.2, 9.0))})`, transformOrigin: '50% 100%' }}>
        <svg width="90" height="110" viewBox="0 0 64 80"><path d="M32 4c6 14 22 20 22 42a22 22 0 0 1-44 0c0-12 8-18 10-28 4 6 6 10 12 12-2-10-2-18 0-26z" fill="#f5792a" /><path d="M32 40c4 6 10 9 10 18a10 10 0 0 1-20 0c0-6 4-9 6-14 1 3 2 4 4 5-1-3-1-6 0-9z" fill="#ffd58a" /></svg>
      </div>
      <Nota t={t} a={6} estilo={{ left: 'auto', right: 120 }}>Panel real de Amatista · avance de demostración</Nota>
    </Capa>
  );
}

export function Cierre({ t }) {
  const logo = curva.sale(tramo(t, 6.2, 7.4));
  return (
    <Capa estilo={{ background: '#09080c' }}>
      <Fondo opacidad={0.55 * curva.suave(tramo(t, 5.6, 8))} zoom={mezclar(1.06, 1, tramo(t, 5, 15))} />
      <Destellos t={t} n={60} semilla={77} fuerza={curva.sale(tramo(t, 5.5, 7))} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 420, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={0.5} b={5.4} tam={86} texto="El talento está en todas partes." />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 420, display: 'grid', placeItems: 'center' }}>
        <Frase t={t} a={2.8} b={5.4} tam={86} estilo={{ marginTop: 120 }} texto="Ahora, *el camino también*." />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, display: 'grid', placeItems: 'center', opacity: logo, transform: `translateY(${(1 - logo) * 30}px)` }}>
        <Gema tam={230} arma={tramo(t, 5.8, 7.6)} brillo={0.5} />
        <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: '0.16em', marginTop: 20 }}>AMATISTA</div>
        <div style={{ fontSize: 42, marginTop: 10 }}>Aprende 3D paso a paso, <span className="gema-texto" style={{ fontWeight: 700 }}>en la computadora que tienes</span>.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 34, opacity: curva.sale(tramo(t, 8.2, 9)) }}>
          <Geoda tam={56} pulso={0.6} />
          <span style={{ fontSize: 30, color: '#a8f6ff' }}>con <b>Geoda</b>, su proyecto hermano</span>
        </div>
        <div style={{ font: '600 30px var(--mono)', letterSpacing: '0.12em', marginTop: 46, color: 'rgb(255 255 255 / .8)', opacity: curva.sale(tramo(t, 9, 9.8)) }}>amatista-3d.tech</div>
        <div className="chip-pelicula" style={{ marginTop: 30, opacity: curva.sale(tramo(t, 9.6, 10.4)) }}>HACK4EDU 2026</div>
      </div>
    </Capa>
  );
}
