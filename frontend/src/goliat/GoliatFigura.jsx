// Goliat en low poly: el perro real de Maximiliano, dibujado a partir de sus
// fotos. Mestizo de schnauzer de pelo negro rizado con canas, una oreja parada
// (la derecha) y la otra doblada, cejas pobladas, barba canosa, ojos cafés y
// cara de pocos amigos. Lleva su pañoleta azul con la orilla cosida en zigzag
// y su placa plateada en forma de hueso.
//
// Gestos (`gesto`): gruñon (el de siempre), atento, contento, preocupado y
// dormido. Solo cambian cejas, ojos, orejas y cola: el cuerpo es el mismo.
// La luz viene de arriba a la derecha, como en los encabezados Facetas.
// Parpadeo, oreja y cola se mueven con CSS (index.css › .goliat) y se apagan
// en modo ligero y con movimiento reducido.

const PELO = {
  hondo: '#202025',
  oscuro: '#2c2c32',
  medio: '#38383f',
  claro: '#46464e',
  luz: '#56565f',
};
const CANA = { oscura: '#5f5f67', media: '#7c7c84', clara: '#9d9da4', luz: '#bdbdc3' };
const PANOLETA = { sombra: '#1f44a3', base: '#2b5bd0', luz: '#3c72ea', costura: '#d8e2ff' };
const PLATA = { sombra: '#8f959e', base: '#c9ced6', luz: '#eef1f5' };

const p = (puntos) => puntos.map((par) => par.join(',')).join(' ');

function Cara({ c, d }) {
  return <polygon points={p(d)} fill={c} />;
}

// Cejas: [izquierda, derecha] (izquierda = la del lado izquierdo del dibujo).
const CEJAS = {
  // Gruñón: el extremo de adentro baja; las cejas casi tapan los ojos.
  gruñon: [
    [[39, 33], [47, 30.5], [57, 37.5], [52.5, 39], [44, 36.5]],
    [[81, 33], [73, 30.5], [63, 37.5], [67.5, 39], [76, 36.5]],
  ],
  atento: [
    [[40, 32], [48, 29.5], [57, 33.5], [53, 35.5], [44, 34.5]],
    [[80, 32], [72, 29.5], [63, 33.5], [67, 35.5], [76, 34.5]],
  ],
  contento: [
    [[40, 31], [48, 27.5], [57, 31], [53, 33], [44, 33]],
    [[80, 31], [72, 27.5], [63, 31], [67, 33], [76, 33]],
  ],
  // Preocupado: el extremo de adentro sube (cara de «ánimo, aquí estoy»).
  preocupado: [
    [[40, 35.5], [48, 31.5], [57, 30], [54, 33.5], [44, 37]],
    [[80, 35.5], [72, 31.5], [63, 30], [66, 33.5], [76, 37]],
  ],
  dormido: [
    [[40, 35], [48, 33], [57, 36], [53, 37.5], [44, 37]],
    [[80, 35], [72, 33], [63, 36], [67, 37.5], [76, 37]],
  ],
};

function Ceja({ puntos }) {
  // Tres facetas por ceja: pelo canoso y tupido.
  const [a, b, c, d, e] = puntos;
  return (
    <g>
      <polygon points={p([a, b, e])} fill={CANA.media} />
      <polygon points={p([b, c, d])} fill={CANA.clara} />
      <polygon points={p([b, d, e])} fill={CANA.oscura} />
    </g>
  );
}

function Ojo({ x, gesto }) {
  if (gesto === 'dormido') {
    return <polyline points={p([[x - 3.4, 43], [x, 44.6], [x + 3.4, 43]])} fill="none" stroke={PELO.hondo} strokeWidth="1.3" strokeLinecap="round" />;
  }
  if (gesto === 'contento') {
    return <polyline points={p([[x - 3.4, 44.2], [x, 41.6], [x + 3.4, 44.2]])} fill="none" stroke={PELO.hondo} strokeWidth="1.5" strokeLinecap="round" />;
  }
  // Ojo café en hexágono, con su brillo (en las fotos siempre lo trae).
  const r = gesto === 'gruñon' ? 2.9 : 3.3;
  const y = gesto === 'gruñon' ? 43.4 : 42.8;
  const hex = [0, 60, 120, 180, 240, 300].map((g) => [x + r * Math.cos((g * Math.PI) / 180), y + r * Math.sin((g * Math.PI) / 180)]);
  return (
    <g className="goliat__ojo">
      <polygon points={p(hex)} fill="#20120a" />
      <polygon points={p([[x - r * 0.75, y], [x, y - r * 0.8], [x + r * 0.75, y], [x, y + r * 0.8]])} fill="#5b3216" />
      <polygon points={p([[x + 0.4, y - 1.9], [x + 1.6, y - 1.5], [x + 1.1, y - 0.5]])} fill="#ffffff" />
    </g>
  );
}

function GoliatFigura({ gesto = 'gruñon', className = '', titulo }) {
  const cejas = CEJAS[gesto] ?? CEJAS.gruñon;
  const dormido = gesto === 'dormido';
  return (
    <svg
      viewBox="0 0 120 120"
      className={`goliat goliat--${gesto} ${className}`}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : 'true'}
    >
      {/* Sombra en el suelo */}
      <ellipse cx="61" cy="113" rx="34" ry="4" fill="rgb(0 0 0 / 0.38)" />

      {/* Cola: corta y parada, se mueve cuando está contento */}
      <g className="goliat__cola">
        <Cara c={PELO.oscuro} d={[[83, 98], [96, 82], [99, 85], [88, 101]]} />
        <Cara c={PELO.claro} d={[[96, 82], [101, 78.5], [99, 85]]} />
      </g>

      {/* Cuerpo sentado */}
      <g className="goliat__cuerpo">
        {/* Ancas */}
        <Cara c={PELO.hondo} d={[[28, 112], [31, 95], [42, 88], [46, 112]]} />
        <Cara c={PELO.oscuro} d={[[31, 95], [42, 88], [38, 101]]} />
        <Cara c={PELO.claro} d={[[92, 112], [89, 95], [78, 88], [74, 112]]} />
        <Cara c={PELO.luz} d={[[89, 95], [78, 88], [83, 100]]} />
        {/* Pecho */}
        <Cara c={PELO.oscuro} d={[[43, 64], [60, 66], [47, 92], [36, 90]]} />
        <Cara c={PELO.claro} d={[[77, 64], [60, 66], [73, 92], [84, 90]]} />
        <Cara c={PELO.medio} d={[[60, 66], [47, 92], [73, 92]]} />
        <Cara c={PELO.hondo} d={[[36, 90], [47, 92], [44, 112], [38, 106]]} />
        <Cara c={PELO.medio} d={[[84, 90], [73, 92], [76, 112], [82, 106]]} />
        {/* Patas delanteras, con las canas de las manos */}
        <Cara c={PELO.medio} d={[[47, 90], [57, 90], [57.5, 108], [47, 108]]} />
        <Cara c={PELO.oscuro} d={[[47, 90], [51, 90], [49, 108], [47, 108]]} />
        <Cara c={PELO.luz} d={[[63, 90], [73, 90], [73, 108], [62.5, 108]]} />
        <Cara c={PELO.claro} d={[[63, 90], [66, 90], [64, 108], [62.5, 108]]} />
        <Cara c={CANA.oscura} d={[[45.5, 107], [58.5, 107], [58, 113], [45, 113]]} />
        <Cara c={CANA.media} d={[[61.5, 107], [74.5, 107], [75, 113], [62, 113]]} />
        <polyline points={p([[50, 110], [50, 113]])} stroke={PELO.oscuro} strokeWidth="0.8" />
        <polyline points={p([[54, 110], [54, 113]])} stroke={PELO.oscuro} strokeWidth="0.8" />
        <polyline points={p([[66, 110], [66, 113]])} stroke={CANA.oscura} strokeWidth="0.8" />
        <polyline points={p([[70, 110], [70, 113]])} stroke={CANA.oscura} strokeWidth="0.8" />
        {/* Mechones canosos del pecho */}
        <Cara c={CANA.oscura} d={[[56, 84], [60, 80], [63, 86]]} />
        <Cara c={CANA.oscura} d={[[66, 74], [70, 72], [69, 79]]} />
      </g>

      {/* Pañoleta azul, con la orilla cosida en zigzag */}
      <g className="goliat__panoleta">
        <Cara c={PANOLETA.sombra} d={[[41, 61], [60, 64], [60, 87]]} />
        <Cara c={PANOLETA.base} d={[[60, 64], [79, 61], [60, 87]]} />
        <Cara c={PANOLETA.luz} d={[[66, 63], [79, 61], [68, 72]]} />
        <Cara c={PANOLETA.sombra} d={[[40, 59], [80, 59], [79, 63], [41, 63]]} />
        <polyline
          points={p([[42, 62.5], [44, 64], [46, 66.5], [48, 68], [50, 71], [52, 72.5], [54, 75.5], [56, 77], [58, 80.5], [60, 85]])}
          fill="none"
          stroke={PANOLETA.costura}
          strokeWidth="0.55"
          opacity="0.85"
        />
        <polyline
          points={p([[78, 62.5], [76, 64], [74, 66.5], [72, 68], [70, 71], [68, 72.5], [66, 75.5], [64, 77], [62, 80.5], [60, 85]])}
          fill="none"
          stroke={PANOLETA.costura}
          strokeWidth="0.55"
          opacity="0.85"
        />
      </g>

      {/* Placa de hueso en su argolla */}
      <g className="goliat__placa">
        <circle cx="60" cy="88.3" r="1.9" fill="none" stroke={PLATA.base} strokeWidth="0.8" />
        <Cara c={PLATA.base} d={[[53.5, 91], [56, 90], [57, 92], [63, 92], [64, 90], [66.5, 91], [65.5, 93.5], [66.5, 96], [64, 97], [63, 95], [57, 95], [56, 97], [53.5, 96], [54.5, 93.5]]} />
        <Cara c={PLATA.luz} d={[[57, 92], [63, 92], [62, 93.4], [58, 93.4]]} />
        <Cara c={PLATA.sombra} d={[[57, 95], [63, 95], [62, 94.2], [58, 94.2]]} />
      </g>

      <g className="goliat__cabeza">
        {/* Oreja doblada (izquierda): la punta cae hacia delante */}
        <g className="goliat__oreja-doblada">
          <Cara c={PELO.oscuro} d={[[49, 23], [38, 17], [33, 22], [42, 33]]} />
          <Cara c={PELO.hondo} d={[[38, 17], [29, 21], [31, 30], [33, 22]]} />
          <Cara c={PELO.medio} d={[[33, 22], [31, 30], [37, 31]]} />
        </g>
        {/* Oreja parada (derecha): alta, en punta y con el pelo despeinado */}
        <g className="goliat__oreja-parada">
          <Cara c={PELO.claro} d={[[69, 24], [79, 3], [85, 27]]} />
          <Cara c={PELO.luz} d={[[79, 3], [87, 13], [85, 27]]} />
          <Cara c={PELO.hondo} d={[[72, 22], [78.5, 9], [80, 25]]} />
          <Cara c={CANA.oscura} d={[[79, 3], [76.5, 1.5], [78, 6.5]]} />
          <Cara c={CANA.oscura} d={[[87, 13], [89, 11], [86, 16]]} />
        </g>

        {/* Cráneo */}
        <Cara c={PELO.medio} d={[[47, 21], [60, 18], [60, 33], [42, 33]]} />
        <Cara c={PELO.claro} d={[[73, 21], [60, 18], [60, 33], [78, 33]]} />
        <Cara c={PELO.oscuro} d={[[42, 33], [60, 33], [50, 45], [38, 47]]} />
        <Cara c={PELO.luz} d={[[78, 33], [60, 33], [70, 45], [82, 47]]} />
        <Cara c={PELO.medio} d={[[50, 45], [60, 33], [70, 45], [60, 47]]} />
        {/* Mejillas */}
        <Cara c={PELO.hondo} d={[[38, 47], [50, 45], [47, 60], [41, 58]]} />
        <Cara c={PELO.claro} d={[[82, 47], [70, 45], [73, 60], [79, 58]]} />
        {/* Copete rizado */}
        <Cara c={PELO.luz} d={[[54, 19], [58, 13.5], [61, 19]]} />
        <Cara c={PELO.claro} d={[[49, 20.5], [51, 15], [55, 19.5]]} />
        <Cara c={CANA.oscura} d={[[61, 18.5], [65, 14.5], [67, 20]]} />
        <Cara c={CANA.oscura} d={[[44, 28], [46, 24], [48, 28]]} />
        <Cara c={CANA.oscura} d={[[72, 27], [75, 24], [76, 29]]} />

        {/* Hocico y barba: lo más canoso de Goliat */}
        <Cara c={CANA.oscura} d={[[50, 45], [60, 47], [55, 58], [46, 58]]} />
        <Cara c={CANA.clara} d={[[70, 45], [60, 47], [65, 58], [74, 58]]} />
        <Cara c={CANA.media} d={[[60, 47], [55, 58], [65, 58]]} />
        <Cara c={CANA.media} d={[[46, 58], [55, 58], [53, 67], [47, 65]]} />
        <Cara c={CANA.luz} d={[[74, 58], [65, 58], [67, 67], [73, 65]]} />
        <Cara c={CANA.clara} d={[[55, 58], [65, 58], [67, 67], [60, 71], [53, 67]]} />
        <Cara c={CANA.oscura} d={[[53, 67], [60, 71], [57, 73]]} />
        <Cara c={CANA.media} d={[[67, 67], [60, 71], [63, 73.5]]} />
        {/* Boca: una línea plana, apenas hacia abajo (gruñón de fábrica) */}
        {gesto === 'contento' ? (
          <g>
            <Cara c="#d9737f" d={[[57.5, 63.5], [62.5, 63.5], [61.5, 68], [58.5, 68]]} />
            <polyline points={p([[54, 62.5], [57, 63.7], [60, 62.9], [63, 63.7], [66, 62.5]])} fill="none" stroke={PELO.hondo} strokeWidth="0.9" />
          </g>
        ) : (
          <polyline
            points={p(gesto === 'preocupado' ? [[55, 64], [60, 62.9], [65, 64]] : [[55, 63.7], [60, 63.1], [65, 63.7]])}
            fill="none"
            stroke={PELO.hondo}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        )}
        {/* Nariz */}
        <Cara c="#0d0d0f" d={[[55, 50.5], [65, 50.5], [66.5, 54], [62.5, 57.5], [57.5, 57.5], [53.5, 54]]} />
        <Cara c="#2c2c31" d={[[57.3, 51.2], [62.7, 51.2], [61.8, 53], [58.2, 53]]} />

        {/* Ojos y cejas */}
        <Ojo x={51.5} gesto={gesto} />
        <Ojo x={68.5} gesto={gesto} />
        <g className="goliat__cejas">
          <Ceja puntos={cejas[0]} />
          <Ceja puntos={cejas[1]} />
        </g>
      </g>

      {dormido && (
        <g className="goliat__zzz" fill={CANA.luz} fontFamily="ui-monospace, monospace" fontWeight="700">
          <text x="90" y="34" fontSize="9">z</text>
          <text x="97" y="25" fontSize="11">z</text>
          <text x="106" y="14" fontSize="13">Z</text>
        </g>
      )}
    </svg>
  );
}

export default GoliatFigura;
