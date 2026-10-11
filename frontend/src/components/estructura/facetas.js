// Facetas low poly para los encabezados y el pie (v4.0 · Facetas). Se calculan una vez por
// tono al cargar el módulo, con semilla fija: siempre salen iguales y no cuestan al dibujar.
// Funciones puras: pruebas en facetas.test.js.

function aleatorio(semilla) {
  let s = semilla;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const TONOS = {
  amatista: [155, 89, 182],
  neon: [0, 229, 255],
  blender: [245, 121, 42],
};

// Triángulos de una malla de `columnas` × `filas` en un lienzo de ancho × alto; la luz está arriba
// a la derecha y las caras cercanas son más opacas. Devuelve [{puntos, color, opacidad}].
export function facetasEncabezado({ tono = 'amatista', ancho = 1000, alto = 260, columnas = 10, filas = 3, semilla = 11 } = {}) {
  const azar = aleatorio(semilla);
  const [r, g, b] = TONOS[tono] ?? TONOS.amatista;
  const dx = ancho / columnas;
  const dy = alto / filas;
  const puntos = [];
  for (let f = 0; f <= filas; f++) {
    const fila = [];
    for (let c = 0; c <= columnas; c++) {
      const borde = f === 0 || f === filas || c === 0 || c === columnas;
      fila.push([c * dx + (borde ? 0 : (azar() - 0.5) * dx * 0.7), f * dy + (borde ? 0 : (azar() - 0.5) * dy * 0.7)]);
    }
    puntos.push(fila);
  }
  const caras = [];
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      const [a, bb, d, e] = [puntos[f][c], puntos[f][c + 1], puntos[f + 1][c], puntos[f + 1][c + 1]];
      const pares = (f + c) % 2 ? [[a, bb, d], [bb, e, d]] : [[a, bb, e], [a, e, d]];
      for (const cara of pares) {
        const cx = (cara[0][0] + cara[1][0] + cara[2][0]) / 3;
        const cy = (cara[0][1] + cara[1][1] + cara[2][1]) / 3;
        const cerca = Math.max(0, 1 - Math.hypot(ancho - cx, cy) / (ancho * 0.9));
        const opacidad = +(0.02 + cerca ** 2 * 0.22 + azar() * 0.04).toFixed(3);
        caras.push({ puntos: cara.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' '), color: `rgb(${r},${g},${b})`, opacidad });
      }
    }
  }
  return caras;
}

// Una fila de triángulos alternados para el borde superior del pie.
export function facetasBorde({ ancho = 1200, alto = 18, cantidad = 48 } = {}) {
  const paso = ancho / cantidad;
  return Array.from({ length: cantidad }, (_, i) => {
    const x = i * paso;
    const arriba = i % 2 === 0;
    const puntos = arriba ? `${x},${alto} ${x + paso / 2},0 ${x + paso},${alto}` : `${x},0 ${x + paso / 2},${alto} ${x + paso},0`;
    return { puntos, opacidad: +(0.05 + ((i * 37) % 11) / 100).toFixed(2) };
  });
}
