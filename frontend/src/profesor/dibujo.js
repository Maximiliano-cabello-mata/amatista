// Dibuja la escena del alumno en un <canvas> 2D, sin WebGL ni librerías.
//
// Algoritmo del pintor: cada triángulo se proyecta con perspectiva, se
// ordena del más lejano al más cercano y se rellena con su color y una luz
// plana (el estilo low poly de Amatista). Con las prácticas del curso (de
// cientos a pocos miles de triángulos) gira fluido en un equipo modesto; el
// add-on corta en 60 000 triángulos. Funciones puras salvo dibujar(), que
// recibe el contexto 2D (pruebas en dibujo.test.js).

// Luz que viene de arriba, a la izquierda y desde el frente de la cámara.
const LUZ = (() => {
  const v = [-0.45, -0.6, 0.66];
  const n = Math.hypot(...v);
  return v.map((c) => c / n);
})();
const AMBIENTE = 0.38;

export const VISTAS = {
  // Como el teclado numérico de Blender: 1 frente, 3 derecha, 7 arriba.
  perspectiva: { giro: -0.65, inclinacion: 0.42 },
  frente: { giro: 0, inclinacion: 0 },
  derecha: { giro: -Math.PI / 2, inclinacion: 0 },
  arriba: { giro: 0, inclinacion: Math.PI / 2 - 0.0001 },
};

// Gira (x, y, z) alrededor de Z (giro) y luego inclina: devuelve [x, profundidad, arriba].
export function rotador(giro, inclinacion) {
  const [sg, cg, si, ci] = [Math.sin(giro), Math.cos(giro), Math.sin(inclinacion), Math.cos(inclinacion)];
  return (x, y, z) => {
    const rx = x * cg - y * sg;
    const ry = x * sg + y * cg;
    return [rx, ry * ci - z * si, ry * si + z * ci];
  };
}

// Lista de triángulos visibles ya proyectados y ordenados (lejos → cerca).
export function proyectarEscena(escena, { giro, inclinacion, zoom = 1, ancho, alto, ocultos = new Set() }) {
  const rotar = rotador(giro, inclinacion);
  const [cx, cy, cz] = escena.centro;
  const distancia = escena.radio * 3.2;
  const escala = ((Math.min(ancho, alto) * 0.42) / escena.radio) * zoom;
  const caras = [];
  for (const objeto of escena.objetos) {
    if (!objeto.triangulos || ocultos.has(objeto.indice)) continue;
    const pos = objeto.posiciones;
    const n = pos.length / 3;
    const vx = new Float32Array(n);
    const vp = new Float32Array(n);
    const vu = new Float32Array(n);
    const sx = new Float32Array(n);
    const sy = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const [x, p, u] = rotar(pos[i * 3] - cx, pos[i * 3 + 1] - cy, pos[i * 3 + 2] - cz);
      vx[i] = x;
      vp[i] = p;
      vu[i] = u;
      const f = distancia / Math.max(distancia + p, distancia * 0.05);
      sx[i] = ancho / 2 + x * f * escala;
      sy[i] = alto / 2 - u * f * escala;
    }
    const t = objeto.triangulos;
    for (let i = 0; i < t.length; i += 3) {
      const a = t[i];
      const b = t[i + 1];
      const c = t[i + 2];
      // Normal en el espacio de la vista; los dos lados se iluminan (mallas abiertas, como en Blender).
      const e1 = [vx[b] - vx[a], vp[b] - vp[a], vu[b] - vu[a]];
      const e2 = [vx[c] - vx[a], vp[c] - vp[a], vu[c] - vu[a]];
      let nx = e1[1] * e2[2] - e1[2] * e2[1];
      let np = e1[2] * e2[0] - e1[0] * e2[2];
      let nu = e1[0] * e2[1] - e1[1] * e2[0];
      const largo = Math.hypot(nx, np, nu);
      if (largo === 0) continue;
      nx /= largo;
      np /= largo;
      nu /= largo;
      if (np > 0) {
        nx = -nx;
        np = -np;
        nu = -nu;
      }
      const luz = AMBIENTE + (1 - AMBIENTE) * Math.max(0, nx * LUZ[0] + np * LUZ[1] + nu * LUZ[2]);
      caras.push({
        objeto: objeto.indice,
        color: objeto.color,
        luz,
        profundidad: (vp[a] + vp[b] + vp[c]) / 3,
        puntos: [sx[a], sy[a], sx[b], sy[b], sx[c], sy[c]],
      });
    }
  }
  caras.sort((m, n) => n.profundidad - m.profundidad);
  return { caras, rotar, escala, distancia };
}

const aByte = (c) => Math.round(Math.max(0, Math.min(1, c)) * 255);
// El objeto elegido en la lista se tiñe de amatista.
const AMATISTA = [0.66, 0.33, 0.97];

export function colorCara(color, luz, resaltar = false) {
  const base = resaltar ? color.map((c, i) => c * 0.55 + AMATISTA[i] * 0.45) : color;
  return `rgb(${aByte(base[0] * luz)}, ${aByte(base[1] * luz)}, ${aByte(base[2] * luz)})`;
}

// La rejilla del suelo con los ejes X (rojo) e Y (verde), como en Blender.
function suelo(ctx, escena, { ancho, alto, escala, distancia, rotar }) {
  const cz = escena.centro[2];
  const paso = Math.max(escena.radio / 3, 0.05);
  const z = escena.suelo - cz;
  const punto = (x, y) => {
    const [rx, p, u] = rotar(x, y, z);
    const f = distancia / Math.max(distancia + p, distancia * 0.05);
    return [ancho / 2 + rx * f * escala, alto / 2 - u * f * escala];
  };
  ctx.lineWidth = 1;
  for (let i = -6; i <= 6; i++) {
    const eje = i === 0;
    for (const [a, b, color] of [
      [punto(i * paso, -6 * paso), punto(i * paso, 6 * paso), '#8BDC00'],
      [punto(-6 * paso, i * paso), punto(6 * paso, i * paso), '#FF3352'],
    ]) {
      ctx.strokeStyle = eje ? `${color}88` : 'rgba(255,255,255,0.07)';
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
  }
}

// Dibuja todo en el canvas. vista: {giro, inclinacion, zoom, alambre, resaltado, ocultos}.
export function dibujar(ctx, escena, vista, { ancho, alto }) {
  ctx.clearRect(0, 0, ancho, alto);
  const proyeccion = proyectarEscena(escena, { ...vista, ancho, alto });
  if (vista.suelo !== false) suelo(ctx, escena, { ancho, alto, ...proyeccion });
  ctx.lineJoin = 'round';
  for (const cara of proyeccion.caras) {
    const [x1, y1, x2, y2, x3, y3] = cara.puntos;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    const resaltar = vista.resaltado === cara.objeto;
    if (!vista.alambre) {
      ctx.fillStyle = colorCara(cara.color, cara.luz, resaltar);
      ctx.fill();
      // Un borde del mismo color tapa las rendijas del antialias entre triángulos.
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
    if (vista.alambre || resaltar) {
      ctx.strokeStyle = resaltar ? 'rgba(39,232,255,0.85)' : 'rgba(197,163,255,0.55)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }
  return proyeccion.caras.length;
}
