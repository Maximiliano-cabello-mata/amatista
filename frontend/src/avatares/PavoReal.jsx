// El pavo real del creador de Amatista: un personaje original en low poly,
// blanco como la porcelana, con marcas carmesí en la cara y los ojos de la cola
// en los colores de la marca (amatista, neón y carmesí). Es elegante y un poco
// teatral: con `gesto="gracias"` hace una reverencia y abre la cola.
//
// `encuadre="busto"` recorta la cabeza, la cresta y la cola abierta para el
// avatar; `encuadre="cuerpo"` (el de siempre) lo muestra completo.
// Animaciones con CSS (index.css › .pavo), apagadas en modo ligero y con
// movimiento reducido.

const BLANCO = { luz: '#fbf8fd', claro: '#ece6f2', medio: '#d8cfe2', sombra: '#bfb3cc' };
const CARMESI = '#c0263d';
const ORO = '#d9a441';
const PLUMAS = 13;

// Plumas de la cola en abanico: un rombo largo por pluma y su ojo de tres colores.
function plumas() {
  const lista = [];
  for (let i = 0; i < PLUMAS; i += 1) {
    const angulo = ((-84 + (168 * i) / (PLUMAS - 1)) * Math.PI) / 180;
    const sin = Math.sin(angulo);
    const cos = Math.cos(angulo);
    const punto = (r, lado = 0) => [60 + r * sin + lado * cos, 78 - r * cos + lado * sin];
    const p = (pares) => pares.map((par) => par.map((n) => n.toFixed(1)).join(',')).join(' ');
    lista.push({
      clave: i,
      pluma: p([punto(6), punto(34, -7), punto(56), punto(34, 7)]),
      luz: p([punto(6), punto(34, -7), punto(56)]),
      ojoFuera: p([punto(40, -5), punto(48), punto(40, 5), punto(34)]),
      ojoMedio: p([punto(40, -3.4), punto(46), punto(40, 3.4), punto(36)]),
      ojoCentro: p([punto(40, -1.6), punto(43), punto(40, 1.6), punto(38)]),
      par: i % 2 === 0,
    });
  }
  return lista;
}

const COLA = plumas();

function PavoReal({ gesto = 'quieto', encuadre = 'cuerpo', className = '', titulo }) {
  const caja = encuadre === 'busto' ? '22 2 76 76' : '0 0 120 120';
  return (
    <svg
      viewBox={caja}
      className={`pavo pavo--${gesto} ${className}`}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : 'true'}
    >
      {encuadre === 'cuerpo' && <ellipse cx="60" cy="113" rx="26" ry="3.5" fill="rgb(0 0 0 / 0.35)" />}

      <g className="pavo__cola">
        {COLA.map((pluma) => (
          <g key={pluma.clave}>
            <polygon points={pluma.pluma} fill={pluma.par ? BLANCO.claro : BLANCO.medio} />
            <polygon points={pluma.luz} fill={pluma.par ? BLANCO.luz : BLANCO.claro} />
            <polygon points={pluma.ojoFuera} fill={CARMESI} />
            <polygon points={pluma.ojoMedio} fill="#9b59b6" />
            <polygon points={pluma.ojoCentro} fill="#00e5ff" />
          </g>
        ))}
      </g>

      {/* Patas doradas */}
      <polyline points="54,98 52,112 48,113" fill="none" stroke={ORO} strokeWidth="1.6" strokeLinejoin="round" />
      <polyline points="66,98 68,112 72,113" fill="none" stroke={ORO} strokeWidth="1.6" strokeLinejoin="round" />

      {/* Cuerpo */}
      <g className="pavo__cuerpo">
        <polygon points="47,72 60,62 60,104 49,96" fill={BLANCO.medio} />
        <polygon points="73,72 60,62 60,104 71,96" fill={BLANCO.luz} />
        <polygon points="47,72 41,86 49,96" fill={BLANCO.sombra} />
        <polygon points="73,72 79,86 71,96" fill={BLANCO.claro} />
        {/* Alas plegadas con su orilla carmesí */}
        <polygon points="45,76 53,74 52,96 43,90" fill={BLANCO.claro} />
        <polygon points="75,76 67,74 68,96 77,90" fill={BLANCO.luz} />
        <polyline points="43,90 47,93 52,96" fill="none" stroke={CARMESI} strokeWidth="1.2" />
        <polyline points="77,90 73,93 68,96" fill="none" stroke={CARMESI} strokeWidth="1.2" />
      </g>

      {/* Cuello, cabeza y cresta: lo que hace la reverencia */}
      <g className="pavo__arriba">
        <polygon points="55,42 60,40 60,66 53,66" fill={BLANCO.claro} />
        <polygon points="65,42 60,40 60,66 67,66" fill={BLANCO.luz} />
        <polygon points="53,66 60,58 67,66 60,70" fill={BLANCO.medio} />
        {/* Cabeza */}
        <polygon points="53,31 60,24 60,42 54,38" fill={BLANCO.claro} />
        <polygon points="67,30 60,24 60,42 66,38" fill={BLANCO.luz} />
        <polygon points="54,38 60,42 66,38 60,44" fill={BLANCO.medio} />
        {/* Marca carmesí alrededor del ojo, como pintura de ceremonia */}
        <polygon points="58,29 66,28 67,33 61,35" fill={CARMESI} />
        <polygon points="61,30 64,30 63.6,32.6 61.4,32.6" fill="#1b0b10" />
        <polygon points="62.6,30.4 63.6,30.6 63.1,31.4" fill="#ffffff" />
        {/* Pico dorado */}
        <polygon points="66,32 75,35 66,37.5" fill={ORO} />
        <polygon points="66,35 75,35 66,37.5" fill="#b9862e" />
        {/* Cresta: tres plumas con su punta */}
        <g className="pavo__cresta">
          <polyline points="59,25 54,12" stroke={BLANCO.sombra} strokeWidth="0.9" />
          <polyline points="60,24.5 59.5,9" stroke={BLANCO.sombra} strokeWidth="0.9" />
          <polyline points="61,25 65,12" stroke={BLANCO.sombra} strokeWidth="0.9" />
          <polygon points="54,12 52,9 54.5,6.5 56,9.5" fill={CARMESI} />
          <polygon points="59.5,9 58,5.5 59.5,3 61,5.5" fill="#9b59b6" />
          <polygon points="65,12 64,9 66.5,6.5 67.5,9.5" fill={CARMESI} />
        </g>
      </g>
    </svg>
  );
}

export default PavoReal;
