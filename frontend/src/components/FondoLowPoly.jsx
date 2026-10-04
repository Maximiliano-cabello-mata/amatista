import { memo } from 'react';

const ANCHO = 1600;
const ALTO = 1000;
const COLUMNAS = 16;
const FILAS = 10;

// Generador pseudoaleatorio con semilla: el fondo siempre sale igual.
function aleatorio(semilla) {
  return () => {
    semilla |= 0;
    semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Mezcla entre el negro base (#121212) y un morado amatista (#5B2C7A).
function color(intensidad) {
  const mezcla = (a, b) => Math.round(a + (b - a) * intensidad);
  return `rgb(${mezcla(18, 91)},${mezcla(18, 44)},${mezcla(18, 122)})`;
}

function generarTriangulos() {
  const azar = aleatorio(7);
  const dx = ANCHO / COLUMNAS;
  const dy = ALTO / FILAS;

  const puntos = [];
  for (let f = 0; f <= FILAS; f++) {
    const fila = [];
    for (let c = 0; c <= COLUMNAS; c++) {
      const borde = f === 0 || f === FILAS || c === 0 || c === COLUMNAS;
      fila.push([
        c * dx + (borde ? 0 : (azar() - 0.5) * dx * 0.8),
        f * dy + (borde ? 0 : (azar() - 0.5) * dy * 0.8),
      ]);
    }
    puntos.push(fila);
  }

  // Luz en la esquina superior derecha: las caras cercanas son más claras.
  const luz = [ANCHO * 0.85, ALTO * 0.05];
  const distanciaMax = Math.hypot(ANCHO, ALTO);

  const triangulos = [];
  for (let f = 0; f < FILAS; f++) {
    for (let c = 0; c < COLUMNAS; c++) {
      const a = puntos[f][c];
      const b = puntos[f][c + 1];
      const d = puntos[f + 1][c];
      const e = puntos[f + 1][c + 1];
      const caras = (f + c) % 2 === 0 ? [[a, b, e], [a, e, d]] : [[a, b, d], [b, e, d]];
      for (const cara of caras) {
        const cx = (cara[0][0] + cara[1][0] + cara[2][0]) / 3;
        const cy = (cara[0][1] + cara[1][1] + cara[2][1]) / 3;
        const cercania = 1 - Math.hypot(cx - luz[0], cy - luz[1]) / distanciaMax;
        const intensidad = Math.min(1, Math.max(0, cercania ** 1.8 * 0.9 + (azar() - 0.5) * 0.12));
        triangulos.push({
          puntos: cara.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' '),
          relleno: color(intensidad),
        });
      }
    }
  }
  return triangulos;
}

const TRIANGULOS = generarTriangulos();

function FondoLowPoly() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      {/* En modo ligero (html.ligero) no se dibujan los 320 triángulos: queda el degradado. */}
      <svg
        className="fondo-pesado h-full w-full"
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {TRIANGULOS.map((t, i) => (
          <polygon key={i} points={t.puntos} fill={t.relleno} stroke={t.relleno} strokeWidth="1" />
        ))}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-base/10 via-base/50 to-base" />
    </div>
  );
}

export default memo(FondoLowPoly);
