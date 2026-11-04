// Piezas de la película, hechas con la identidad de Amatista (Facetas): palabras que entran por
// facetas, metraje real de la PWA, pantallas, la gema, la geoda y el barrido de triángulos.
import { azar, curva, mezclar, tramo, vida } from './tiempo';

// ---------------------------------------------------------------- texto cinético

// «*palabra*» va con el degradado de la gema; «\n» parte la línea.
export function Frase({ t, a, b = Infinity, texto, tam = 72, peso = 750, color = '#f1eef6', paso = 0.07, alinear = 'center', alto = 1.12, estilo }) {
  // Índice de cada palabra en toda la frase (para escalonar su entrada).
  const lineas = texto.split('\n').reduce((acc, linea) => {
    const previas = acc.length ? acc[acc.length - 1].fin : 0;
    const palabras = linea.split(' ');
    return [...acc, { palabras, desde: previas, fin: previas + palabras.length }];
  }, []);
  const salida = curva.suave(tramo(t, b, b + 0.6));
  return (
    <div style={{ fontSize: tam, fontWeight: peso, lineHeight: alto, color, textAlign: alinear, letterSpacing: '-0.015em',
      opacity: 1 - salida, filter: salida ? `blur(${salida * 10}px)` : undefined, transform: `translateY(${-salida * 30}px)`, ...estilo }}>
      {lineas.map((linea, i) => (
        <div key={i} style={{ whiteSpace: 'nowrap' }}>
          {linea.palabras.map((palabra, j) => {
            const n = linea.desde + j;
            const k = curva.sale(tramo(t, a + n * paso, a + n * paso + 0.6));
            const gema = palabra.includes('*');
            return (
              <span key={j} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.12em', marginRight: '0.26em' }}>
                <span className={gema ? 'gema-texto' : undefined} style={{ display: 'inline-block', opacity: k,
                  transform: `translateY(${(1 - k) * 105}%) rotate(${(1 - k) * 4}deg)`, filter: k < 1 ? `blur(${(1 - k) * 6}px)` : undefined }}>
                  {palabra.replace(/\*/g, '')}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Rótulo de capítulo: MONO, espaciado, con su rombo.
export function Rotulo({ t, a, b = Infinity, texto, color = '#00e5ff', tam = 24 }) {
  const k = vida(t, a, b, 0.5);
  return (
    <div style={{ opacity: k, transform: `translateX(${(1 - k) * -30}px)`, font: `600 ${tam}px var(--mono)`, letterSpacing: '0.42em',
      textTransform: 'uppercase', color, display: 'flex', alignItems: 'center', gap: 18 }}>
      <span style={{ width: tam * 0.6, height: tam * 0.6, background: color, clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }} />
      {texto}
    </div>
  );
}

export function Nota({ t, a = 0, b = Infinity, children, estilo }) {
  return (
    <div style={{ position: 'absolute', left: 120, bottom: 70, font: '500 20px var(--mono)', letterSpacing: '0.08em',
      color: 'rgb(255 255 255 / 0.45)', opacity: vida(t, a, b, 0.6), ...estilo }}>{children}</div>
  );
}

// ---------------------------------------------------------------- metraje real

// Un cuadro de una toma grabada (frontend/pelicula/media/<toma>/00001.jpg…): desde (s) y velocidad.
export function Metraje({ toma, t, desde = 0, vel = 1, estilo, ajuste = 'cover', posicion = '50% 50%' }) {
  const total = window.__tomas?.[toma] ?? 1;
  const cuadro = Math.max(1, Math.min(total, Math.round((desde + Math.max(0, t) * vel) * 30) + 1));
  return (
    <img alt="" src={`/pelicula/media/${toma}/${String(cuadro).padStart(5, '0')}.jpg`} draggable={false}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: ajuste, objectPosition: posicion, ...estilo }} />
  );
}

// Pantalla de laptop facetada (bisel oscuro con esquinas cortadas) con perspectiva.
export function Laptop({ ancho = 1280, rx = 0, ry = 0, rz = 0, escala = 1, x = 0, y = 0, brillo = 0, children }) {
  const alto = (ancho * 9) / 16;
  return (
    <div style={{ position: 'absolute', left: '50%', top: '50%', width: ancho + 36, transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`, perspective: 2600 }}>
      <div style={{ transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${escala})`, transformOrigin: '50% 60%' }}>
        <div className="bisel" style={{ padding: 18, background: 'linear-gradient(160deg,#2a2730,#0d0c10 55%)',
          clipPath: 'polygon(22px 0,100% 0,100% calc(100% - 22px),calc(100% - 22px) 100%,0 100%,0 22px)',
          boxShadow: `0 60px 120px -40px rgb(0 0 0 / .9), 0 0 ${80 + brillo * 120}px -30px rgb(155 89 182 / ${0.35 + brillo * 0.4})` }}>
          <div style={{ width: ancho, height: alto, overflow: 'hidden', background: '#121212', position: 'relative' }}>{children}</div>
        </div>
        <div style={{ height: 26, margin: '0 -70px', background: 'linear-gradient(#3a3640,#16141a)',
          clipPath: 'polygon(4% 0,96% 0,100% 100%,0 100%)' }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- gema y geoda

const CARAS_GEMA = [
  ['32,2 10,22 32,26', '#D2A8F0'], ['32,2 54,22 32,26', '#B57EDC'], ['10,22 32,26 20,46', '#9B59B6'],
  ['54,22 32,26 44,46', '#7D3C98'], ['20,46 32,26 32,62', '#8E44AD'], ['44,46 32,26 32,62', '#5B2C7A'],
];

// La gema de Amatista; con «arma» (0→1) sus seis caras llegan volando y se juntan.
export function Gema({ tam = 300, arma = 1, brillo = 0, giro = 0 }) {
  const r = azar(7);
  return (
    <svg viewBox="0 0 64 64" width={tam} height={tam} style={{ overflow: 'visible', transform: `rotate(${giro}deg)`,
      filter: `drop-shadow(0 0 ${20 + brillo * 60}px rgb(155 89 182 / ${0.5 + brillo * 0.4}))` }}>
      {CARAS_GEMA.map(([puntos, color], i) => {
        const k = curva.sale(tramo(arma, i * 0.08, i * 0.08 + 0.55));
        const dx = (r() - 0.5) * 220 * (1 - k);
        const dy = (r() - 0.5) * 220 * (1 - k);
        const rot = (r() - 0.5) * 300 * (1 - k);
        return <polygon key={i} points={puntos} fill={color} opacity={k} style={{ transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, transformOrigin: '32px 32px' }} />;
      })}
      <polyline points="10,22 32,26 54,22" fill="none" stroke="#00E5FF" strokeWidth="1.2" strokeLinejoin="round" opacity={curva.sale(tramo(arma, 0.7, 1))} />
    </svg>
  );
}

// Geoda: piedra facetada partida, con cristales cian por dentro (el proyecto hermano).
export function Geoda({ tam = 360, abre = 1, pulso = 0 }) {
  const r = azar(21);
  const cristales = Array.from({ length: 14 }, (_, i) => {
    const ang = (i / 14) * Math.PI * 2;
    const largo = 18 + r() * 14;
    const x = 50 + Math.cos(ang) * 16;
    const y = 50 + Math.sin(ang) * 14;
    const xp = 50 + Math.cos(ang) * (16 - largo * 0.55);
    const yp = 50 + Math.sin(ang) * (14 - largo * 0.55);
    const a = ang + Math.PI / 2;
    return { puntos: `${x + Math.cos(a) * 4},${y + Math.sin(a) * 4} ${x - Math.cos(a) * 4},${y - Math.sin(a) * 4} ${xp},${yp}`,
      color: ['#00E5FF', '#5FF3FF', '#00B8CC', '#A8F6FF'][i % 4], k: curva.rebote(tramo(abre, 0.25 + i * 0.03, 0.55 + i * 0.03)) };
  });
  return (
    <svg viewBox="0 0 100 100" width={tam} height={tam} style={{ overflow: 'visible',
      filter: `drop-shadow(0 0 ${24 + pulso * 50}px rgb(0 229 255 / ${0.35 + pulso * 0.35}))` }}>
      <polygon points="50,4 78,12 95,38 90,70 70,93 36,96 12,78 5,45 18,16" fill="#3b3540" />
      <polygon points="50,4 78,12 66,30 40,24" fill="#4a4350" />
      <polygon points="95,38 90,70 74,58 76,36" fill="#2b2630" />
      <polygon points="12,78 36,96 40,78 22,64" fill="#2f2a34" />
      <polygon points="18,16 40,24 30,42 5,45" fill="#433c48" />
      <polygon points="50,22 70,28 76,50 66,72 44,78 26,66 22,42 32,28" fill="#0b1418" style={{ transform: `scale(${mezclar(0.2, 1, curva.sale(abre))})`, transformOrigin: '50px 50px' }} />
      {cristales.map((c, i) => (
        <polygon key={i} points={c.puntos} fill={c.color} opacity={c.k} style={{ transform: `scale(${c.k})`, transformOrigin: '50px 50px' }} />
      ))}
      <circle cx="50" cy="50" r={6 + pulso * 3} fill="#00E5FF" opacity={0.25 + pulso * 0.5 * curva.sale(abre)} />
    </svg>
  );
}

// ---------------------------------------------------------------- transición de facetas

// Triángulos en diagonal que cubren la pantalla (k = 0.5, el corte) y se retiran.
export function Barrido({ k, columnas = 16, filas = 9 }) {
  if (k <= 0 || k >= 1) return null;
  const w = 1920 / columnas;
  const h = 1080 / filas;
  const colores = ['#9b59b6', '#7d3c98', '#c39bd3', '#5b2c7a', '#00b8cc', '#8e44ad'];
  const piezas = [];
  for (let i = 0; i < columnas; i += 1) {
    for (let j = 0; j < filas; j += 1) {
      const d = (i + j) / (columnas + filas);
      const entra = curva.sale(tramo(k, d * 0.3, d * 0.3 + 0.2));
      const sale = curva.suave(tramo(k, 0.5 + d * 0.3, 0.5 + d * 0.3 + 0.2));
      const s = entra * (1 - sale);
      if (s <= 0.001) continue;
      const x = i * w;
      const y = j * h;
      [[`${x},${y} ${x + w},${y} ${x},${y + h}`, x + w / 3, y + h / 3], [`${x + w},${y} ${x + w},${y + h} ${x},${y + h}`, x + (2 * w) / 3, y + (2 * h) / 3]]
        .forEach(([puntos, cx, cy], m) => piezas.push(
          <polygon key={`${i}-${j}-${m}`} points={puntos} fill={colores[(i * 3 + j * 5 + m) % colores.length]}
            style={{ transform: `scale(${s * 1.04})`, transformOrigin: `${cx}px ${cy}px` }} />,
        ));
    }
  }
  return <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, zIndex: 50 }}>{piezas}</svg>;
}

// ---------------------------------------------------------------- iconos de la historia

export function Icono({ tipo, tam = 64, color = '#e9e6ee' }) {
  const trazo = { fill: 'none', stroke: color, strokeWidth: 3.2, strokeLinejoin: 'round', strokeLinecap: 'round' };
  const formas = {
    laptop: <><path {...trazo} d="M14 16h36v24H14z" /><path {...trazo} d="M6 46h52l-4 4H10z" /></>,
    chip: <><path {...trazo} d="M20 20h24v24H20z" /><path {...trazo} d="M26 14v6M32 14v6M38 14v6M26 44v6M32 44v6M38 44v6M14 26h6M14 32h6M14 38h6M44 26h6M44 32h6M44 38h6" /></>,
    wifi: <><path {...trazo} d="M10 26c12-11 32-11 44 0M17 33c8-7 22-7 30 0M24 40c5-4 11-4 16 0" /><circle cx="32" cy="47" r="3" fill={color} /></>,
    sinwifi: <><path {...trazo} d="M10 26c12-11 32-11 44 0M17 33c8-7 22-7 30 0M24 40c5-4 11-4 16 0" opacity="0.45" /><path {...trazo} d="M12 12l40 40" stroke="#ff6b6b" /></>,
    telefono: <><path {...trazo} d="M22 8h20v48H22z" /><path {...trazo} d="M29 50h6" /></>,
    escritorio: <><path {...trazo} d="M8 12h48v30H8z" /><path {...trazo} d="M26 52h12M32 42v10" /></>,
    candado: <><path {...trazo} d="M18 30h28v22H18z" /><path {...trazo} d="M24 30v-8a8 8 0 0 1 16 0v8" /></>,
    mundo: <><circle {...trazo} cx="32" cy="32" r="20" /><path {...trazo} d="M12 32h40M32 12c-8 9-8 31 0 40M32 12c8 9 8 31 0 40" /></>,
  };
  return <svg viewBox="0 0 64 64" width={tam} height={tam}>{formas[tipo]}</svg>;
}

// Chispas en diamante (como los destellos del fondo low poly) que flotan.
export function Destellos({ t, n = 40, semilla = 3, color = '#e8d5f0', fuerza = 1 }) {
  const r = azar(semilla);
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: n }, (_, i) => {
        const x = r() * 1920;
        const y0 = r() * 1080;
        const v = 8 + r() * 22;
        const fase = r() * 6;
        const y = ((y0 - t * v) % 1080 + 1080) % 1080;
        const brillo = (0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + fase))) * fuerza;
        const s = 3 + r() * 5;
        return <path key={i} d={`M${x} ${y - s * 2.4}L${x + s} ${y}L${x} ${y + s * 2.4}L${x - s} ${y}Z`} fill={color} opacity={brillo * 0.7} />;
      })}
    </svg>
  );
}

// Partículas que viajan de A a B por una curva (el intercambio entre proyectos).
export function Flujo({ t, de, a, n = 18, color = '#00e5ff', curvatura = -160, vel = 0.35, fuerza = 1 }) {
  const r = azar(de[0] + a[0]);
  const mx = (de[0] + a[0]) / 2;
  const my = (de[1] + a[1]) / 2 + curvatura;
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: fuerza }}>
      <path d={`M${de[0]} ${de[1]} Q${mx} ${my} ${a[0]} ${a[1]}`} fill="none" stroke={color} strokeOpacity="0.18" strokeWidth="3" strokeDasharray="2 14" />
      {Array.from({ length: n }, (_, i) => {
        const u = (t * vel + i / n + r() * 0.04) % 1;
        const x = (1 - u) ** 2 * de[0] + 2 * (1 - u) * u * mx + u ** 2 * a[0];
        const y = (1 - u) ** 2 * de[1] + 2 * (1 - u) * u * my + u ** 2 * a[1];
        const s = 5 + 4 * Math.sin(u * Math.PI);
        return <path key={i} d={`M${x} ${y - s * 1.6}L${x + s} ${y}L${x} ${y + s * 1.6}L${x - s} ${y}Z`} fill={color} opacity={Math.sin(u * Math.PI)} />;
      })}
    </svg>
  );
}
