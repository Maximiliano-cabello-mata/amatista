// Jefe final low poly (v3.3): una criatura facetada que cambia de silueta,
// colores y adorno según la temática del módulo. Estados: normal (flota), golpeado
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

// Silueta del jefe: cada temática tiene la suya (practices/blender/temas.json).
function Cuerpo({ forma, piel, sombra }) {
  switch (forma) {
    case 'bloque':
      return (
        <g>
          <polygon points="22,30 98,30 98,86 22,86" fill={piel} />
          <polygon points="22,30 60,30 60,86 22,86" fill={sombra} opacity="0.55" />
          <polygon points="28,86 46,86 46,108 28,108" fill={sombra} />
          <polygon points="74,86 92,86 92,108 74,108" fill={piel} opacity="0.85" />
          <polygon points="6,46 22,40 22,70 10,74" fill={sombra} />
          <polygon points="114,46 98,40 98,70 110,74" fill={piel} />
        </g>
      );
    case 'flotante':
      return (
        <g>
          <polygon points="12,40 108,40 84,84 36,84" fill={piel} />
          <polygon points="12,40 60,40 60,84 36,84" fill={sombra} opacity="0.6" />
          <polygon points="36,84 84,84 60,100" fill={sombra} />
          <ellipse cx="60" cy="106" rx="18" ry="4" fill={piel} opacity="0.5" className="animar-pulso" />
          <polygon points="0,52 12,40 18,56" fill={sombra} />
          <polygon points="120,52 108,40 102,56" fill={piel} />
        </g>
      );
    case 'redondo':
      return (
        <g>
          <polygon points="40,26 80,26 102,44 106,74 86,98 34,98 14,74 18,44" fill={piel} />
          <polygon points="40,26 60,26 60,98 34,98 14,74 18,44" fill={sombra} opacity="0.5" />
          <polygon points="34,98 50,98 46,110 30,110" fill={sombra} />
          <polygon points="70,98 86,98 90,110 74,110" fill={piel} opacity="0.85" />
        </g>
      );
    case 'alto':
      return (
        <g>
          <polygon points="60,18 94,40 90,92 60,106 30,92 26,40" fill={piel} />
          <polygon points="60,18 26,40 30,92 60,106" fill={sombra} opacity="0.6" />
          <polygon points="44,100 52,104 50,114 40,114" fill={sombra} />
          <polygon points="76,100 68,104 70,114 80,114" fill={piel} opacity="0.85" />
          <polygon points="26,52 8,84 16,88 30,64" fill={sombra} />
          <polygon points="94,52 112,84 104,88 90,64" fill={piel} />
        </g>
      );
    case 'robusto':
    default:
      return (
        <g>
          <polygon points="60,24 96,34 104,70 60,82" fill={piel} />
          <polygon points="60,24 24,34 16,70 60,82" fill={sombra} />
          <polygon points="16,70 60,82 40,108" fill={sombra} />
          <polygon points="104,70 60,82 80,108" fill={piel} opacity="0.85" />
          <polygon points="40,108 60,82 80,108" fill={sombra} opacity="0.8" />
          <polygon points="16,58 2,74 12,80 22,66" fill={sombra} />
          <polygon points="104,58 118,74 108,80 98,66" fill={piel} />
        </g>
      );
  }
}

function Jefe({ jefe, golpeado = false, derrotado = false, className = '' }) {
  const { piel, sombra, ojos, adorno, forma = 'robusto' } = jefe;
  return (
    <svg
      viewBox="0 -8 120 128"
      className={`${className} ${derrotado ? 'rotate-[18deg] opacity-60 grayscale transition duration-700' : golpeado ? 'animar-sacudir' : 'animar-flotar'}`}
      aria-hidden="true"
    >
      {/* Sombra en el suelo */}
      <ellipse cx="60" cy="116" rx="34" ry="4" fill="#000" opacity="0.35" />
      <Cuerpo forma={forma} piel={piel} sombra={sombra} />
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
