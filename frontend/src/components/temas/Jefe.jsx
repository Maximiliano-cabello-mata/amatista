// Jefe final low poly (v3.2): una criatura facetada que cambia de colores y
// de adorno según la temática del módulo. Estados: normal (flota), golpeado
// (se sacude y destella) y derrotado (cae, en gris y con ojos en X).

function Adorno({ tipo, piel, sombra, ojos }) {
  switch (tipo) {
    case 'chimenea':
      return (
        <g>
          <polygon points="70,10 84,10 84,30 70,30" fill={sombra} />
          <polygon points="66,4 88,4 86,12 68,12" fill={piel} />
          <circle cx="80" cy="0" r="4" fill="#ffffff" opacity="0.5" />
        </g>
      );
    case 'cuernos':
      return (
        <g>
          <polygon points="28,30 18,6 40,26" fill="#E8E2D0" />
          <polygon points="92,30 102,6 80,26" fill="#C9C2AE" />
        </g>
      );
    case 'antena':
      return (
        <g>
          <polygon points="58,26 62,26 61,6 59,6" fill={sombra} />
          <circle cx="60" cy="6" r="5" fill={ojos} />
        </g>
      );
    case 'gotas':
      return (
        <g>
          <polygon points="30,24 36,10 42,24" fill="#FF7EDB" />
          <polygon points="56,20 60,6 64,20" fill="#00E5FF" />
          <polygon points="78,24 84,12 90,24" fill="#F5D90A" />
        </g>
      );
    case 'claqueta':
      return (
        <g>
          <polygon points="34,14 86,14 86,28 34,28" fill="#111" />
          <polygon points="34,6 86,10 86,16 34,12" fill="#f5f5f5" />
          <polygon points="44,7 50,7.5 46,13 40,12.5" fill="#111" />
          <polygon points="62,8 68,8.5 64,14 58,13.5" fill="#111" />
        </g>
      );
    case 'sombrero':
      return (
        <g>
          <polygon points="44,26 76,26 70,2 50,2" fill="#E5484D" />
          <polygon points="36,26 84,26 84,30 36,30" fill="#111" />
          <circle cx="60" cy="2" r="4" fill="#F5D90A" />
        </g>
      );
    case 'casco':
      return (
        <g>
          <polygon points="26,30 34,12 86,12 94,30" fill="#F5D90A" />
          <polygon points="56,12 64,12 64,30 56,30" fill="#E0B800" />
        </g>
      );
    case 'ojo':
      return <polygon points="50,18 60,8 70,18 60,28" fill={ojos} opacity="0.85" />;
    case 'visor':
      return <polygon points="24,44 96,44 92,58 28,58" fill="#0B2E36" opacity="0.9" />;
    case 'corona':
    default:
      return <polygon points="34,28 38,8 50,20 60,4 70,20 82,8 86,28" fill="#F5D90A" stroke={sombra} strokeWidth="1" />;
  }
}

function Jefe({ jefe, golpeado = false, derrotado = false, className = '' }) {
  const { piel, sombra, ojos, adorno } = jefe;
  return (
    <svg
      viewBox="0 -8 120 128"
      className={`${className} ${derrotado ? 'rotate-[18deg] opacity-60 grayscale transition duration-700' : golpeado ? 'animar-sacudir' : 'animar-flotar'}`}
      aria-hidden="true"
    >
      {/* Sombra en el suelo */}
      <ellipse cx="60" cy="116" rx="34" ry="4" fill="#000" opacity="0.35" />
      {/* Cuerpo facetado */}
      <polygon points="60,24 96,34 104,70 60,82" fill={piel} />
      <polygon points="60,24 24,34 16,70 60,82" fill={sombra} />
      <polygon points="16,70 60,82 40,108" fill={sombra} />
      <polygon points="104,70 60,82 80,108" fill={piel} opacity="0.85" />
      <polygon points="40,108 60,82 80,108" fill={sombra} opacity="0.8" />
      {/* Brazos */}
      <polygon points="16,58 2,74 12,80 22,66" fill={sombra} />
      <polygon points="104,58 118,74 108,80 98,66" fill={piel} />
      {/* Cara */}
      {derrotado ? (
        <g stroke="#fff" strokeWidth="4" strokeLinecap="round">
          <path d="M36 46 L48 58 M48 46 L36 58" />
          <path d="M72 46 L84 58 M84 46 L72 58" />
        </g>
      ) : (
        <g>
          <polygon points="34,46 50,44 48,58 36,58" fill="#121212" />
          <polygon points="70,44 86,46 84,58 72,58" fill="#121212" />
          <polygon points="40,48 46,48 45,54 41,54" fill={ojos} className={golpeado ? '' : 'animar-pulso'} />
          <polygon points="74,48 80,48 79,54 75,54" fill={ojos} className={golpeado ? '' : 'animar-pulso'} />
        </g>
      )}
      <polygon points={derrotado ? '46,72 74,72 70,68 50,68' : '44,66 76,66 70,74 50,74'} fill="#121212" />
      {!derrotado && <polygon points="52,66 56,66 54,71" fill="#fff" />}
      {!derrotado && <polygon points="64,66 68,66 66,71" fill="#fff" />}
      <Adorno tipo={adorno} piel={piel} sombra={sombra} ojos={ojos} />
      {/* Destello del golpe */}
      {golpeado && !derrotado && <polygon points="60,24 104,70 60,82 16,70" fill="#fff" opacity="0.45" />}
    </svg>
  );
}

export default Jefe;
