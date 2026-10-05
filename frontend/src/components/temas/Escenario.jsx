// Escenario de cada temática (v3.3): un paisaje low poly en SVG con los
// colores del módulo y una animación suave (engranes que giran, chispas que
// suben, estrellas que titilan…). Va detrás del encabezado del módulo, de la
// lección y de la arena del jefe. Solo anima transform y opacity, y en modo
// ligero o con movimiento reducido se queda quieto (index.css).
import { useId } from 'react';

// Contorno de un engrane centrado en (cx, cy).
function engrane(cx, cy, r, dientes) {
  const puntos = [];
  for (let i = 0; i < dientes * 2; i += 1) {
    const angulo = (Math.PI * i) / dientes;
    const radio = i % 2 === 0 ? r : r * 0.78;
    puntos.push(`${(cx + radio * Math.cos(angulo)).toFixed(1)},${(cy + radio * Math.sin(angulo)).toFixed(1)}`);
  }
  return puntos.join(' ');
}

function Motivo({ escena, c }) {
  switch (escena) {
    case 'engranes':
      return (
        <g>
          <polygon className="esc-girar" points={engrane(320, 46, 26, 10)} fill={c.acento} opacity="0.55" />
          <circle cx="320" cy="46" r="8" fill={c.cielo} />
          <polygon className="esc-girar-inverso" points={engrane(362, 76, 17, 8)} fill={c.suave} opacity="0.4" />
          <circle cx="362" cy="76" r="5" fill={c.cielo} />
          <rect x="40" y="70" width="22" height="22" fill={c.acento} opacity="0.35" />
          <rect x="62" y="70" width="22" height="22" fill={c.suave} opacity="0.25" />
          <rect x="51" y="48" width="22" height="22" fill={c.acento} opacity="0.45" className="esc-flotar" />
        </g>
      );
    case 'chispas':
      return (
        <g>
          <polygon points="300,92 360,92 352,80 372,72 290,72 308,80" fill={c.suave} opacity="0.25" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle
              key={i}
              className="esc-subir"
              style={{ animationDelay: `${i * 0.55}s` }}
              cx={312 + i * 9}
              cy="68"
              r={1.6 + (i % 3) * 0.6}
              fill={i % 2 ? c.acento : '#FFD166'}
            />
          ))}
          <polygon points="40,96 70,40 100,96" fill={c.acento} opacity="0.18" />
        </g>
      );
    case 'estrellas':
      return (
        <g>
          {[
            [30, 20], [80, 40], [130, 14], [190, 30], [240, 12], [280, 44], [350, 18], [380, 50], [60, 64], [210, 58],
          ].map(([x, y], i) => (
            <circle key={i} className="esc-titilar" style={{ animationDelay: `${(i % 5) * 0.7}s` }} cx={x} cy={y} r={i % 3 ? 1.2 : 2} fill="#fff" />
          ))}
          <circle cx="335" cy="52" r="18" fill={c.acento} opacity="0.5" />
          <ellipse cx="335" cy="52" rx="30" ry="6" fill="none" stroke={c.suave} strokeOpacity="0.6" strokeWidth="2" />
          <polygon className="esc-flotar" points="120,70 140,64 120,58 124,64" fill={c.suave} opacity="0.7" />
        </g>
      );
    case 'gotas':
      return (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              className="esc-caer"
              style={{ animationDelay: `${i * 0.8}s` }}
              d={`M${290 + i * 18} 10 q5 9 0 13 q-5 -4 0 -13z`}
              fill={['#FF7EDB', '#00E5FF', '#F5D90A', c.acento, '#7CFF6B'][i]}
            />
          ))}
          <path d="M20 90 Q80 60 150 84 T260 78" fill="none" stroke={c.acento} strokeOpacity="0.35" strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case 'reflectores':
      return (
        <g>
          <polygon className="esc-barrer" style={{ transformOrigin: '300px 0px' }} points="296,0 304,0 350,120 250,120" fill={c.acento} opacity="0.14" />
          <polygon className="esc-barrer-inverso" style={{ transformOrigin: '360px 0px' }} points="356,0 364,0 400,120 310,120" fill={c.suave} opacity="0.1" />
          <g opacity="0.35">
            <rect x="20" y="76" width="120" height="16" fill={c.suave} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={26 + i * 19} y="80" width="9" height="8" fill={c.cielo} />
            ))}
          </g>
        </g>
      );
    case 'carpa':
      return (
        <g>
          <polygon points="270,92 330,30 390,92" fill={c.acento} opacity="0.3" />
          <polygon points="300,92 330,30 345,92" fill={c.suave} opacity="0.3" />
          <circle className="esc-rebotar" cx="200" cy="80" r="9" fill={c.acento} opacity="0.8" />
          <polygon points="326,30 330,18 342,24 330,26" fill="#E5484D" />
        </g>
      );
    case 'aldea':
      return (
        <g>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="120" stroke={c.suave} strokeOpacity="0.07" />
          ))}
          <polygon points="270,92 270,66 290,52 310,66 310,92" fill={c.acento} opacity="0.4" />
          <polygon points="318,92 318,72 334,60 350,72 350,92" fill={c.suave} opacity="0.3" />
          <polygon points="356,92 356,62 372,48 388,62 388,92" fill={c.acento} opacity="0.3" />
          <line className="esc-ruta" x1="40" y1="60" x2="200" y2="60" stroke={c.acento} strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="6 4" />
          <line x1="40" y1="54" x2="40" y2="66" stroke={c.acento} strokeOpacity="0.6" />
          <line x1="200" y1="54" x2="200" y2="66" stroke={c.acento} strokeOpacity="0.6" />
        </g>
      );
    case 'mapa':
      return (
        <g>
          <path className="esc-ruta" d="M20 80 L90 50 L150 70 L230 30 L300 60 L380 36" fill="none" stroke={c.acento} strokeOpacity="0.6" strokeWidth="2" strokeDasharray="5 5" />
          {[[90, 50], [230, 30], [380, 36]].map(([x, y]) => (
            <circle key={x} className="esc-titilar" cx={x} cy={y} r="3.5" fill={c.suave} />
          ))}
          <g className="esc-girar-lento" opacity="0.4">
            <circle cx="330" cy="88" r="14" fill="none" stroke={c.suave} strokeWidth="1.5" />
            <polygon points="330,74 334,88 330,102 326,88" fill={c.acento} />
          </g>
        </g>
      );
    case 'galeria':
      return (
        <g>
          {[270, 320, 360].map((x, i) => (
            <g key={x}>
              <polygon className="esc-pulso" style={{ animationDelay: `${i * 0.9}s` }} points={`${x + 10},0 ${x + 14},0 ${x + 30},70 ${x - 6},70`} fill={c.suave} opacity="0.08" />
              <rect x={x} y="40" width={i === 1 ? 30 : 24} height={i === 1 ? 26 : 20} fill="none" stroke={c.acento} strokeOpacity="0.6" strokeWidth="2" />
            </g>
          ))}
        </g>
      );
    case 'portal':
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              className="esc-anillo"
              style={{ animationDelay: `${i * 1.1}s` }}
              cx="330"
              cy="56"
              r="26"
              fill="none"
              stroke={i === 1 ? c.suave : c.acento}
              strokeOpacity="0.6"
              strokeWidth="2"
            />
          ))}
          <polygon points="322,50 338,50 344,62 316,62" fill={c.acento} opacity="0.5" />
        </g>
      );
    case 'cristales':
    default:
      return (
        <g>
          <polygon points="300,92 312,40 324,92" fill={c.acento} opacity="0.45" />
          <polygon points="322,92 340,24 358,92" fill={c.suave} opacity="0.35" />
          <polygon points="356,92 366,56 376,92" fill={c.acento} opacity="0.35" />
          <polygon className="esc-titilar" points="340,30 343,36 340,42 337,36" fill="#fff" />
        </g>
      );
  }
}

function Escenario({ tema, className = '' }) {
  const id = useId().replace(/:/g, '');
  const c = tema?.colores ?? { acento: '#B57EDC', suave: '#E2C6F5', cielo: '#1E0F29', suelo: '#0F0815' };
  return (
    <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice" className={`escenario ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`cielo-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.cielo} />
          <stop offset="1" stopColor={c.cielo} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="120" fill={`url(#cielo-${id})`} />
      <Motivo escena={tema?.escena} c={c} />
      {/* Suelo facetado */}
      <polygon points="0,120 0,96 60,90 120,98 190,88 260,96 330,86 400,94 400,120" fill={c.suelo} opacity="0.9" />
      <polygon points="60,90 120,98 190,88" fill={c.acento} opacity="0.08" />
      <polygon points="260,96 330,86 400,94" fill={c.acento} opacity="0.06" />
    </svg>
  );
}

export default Escenario;
