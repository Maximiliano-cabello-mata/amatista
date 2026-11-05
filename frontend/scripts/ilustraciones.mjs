// Genera las ilustraciones low poly de las lecciones en public/ilustraciones/.
// Uso: npm run ilustraciones
//
// Todo son polígonos de caras planas (sin degradados ni imágenes), así los SVG
// pesan poco, se ven nítidos en cualquier pantalla y funcionan sin conexión.
import { mkdirSync, writeFileSync } from 'node:fs';

const DESTINO = new URL('../public/ilustraciones/', import.meta.url);

// ---------------------------------------------------------------- utilidades

function aleatorio(semilla) {
  return () => {
    semilla |= 0;
    semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const aRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const aHex = (rgb) =>
  `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;
const mezcla = (a, b, t) => {
  const [A, B] = [aRgb(a), aRgb(b)];
  return aHex(A.map((v, i) => v + (B[i] - v) * t));
};
const aclarar = (hex, c) => (c >= 0 ? mezcla(hex, '#ffffff', c) : mezcla(hex, '#000000', -c));
const limitar = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Color a lo largo de una rampa: [[0, '#...'], [0.5, '#...'], [1, '#...']]
function rampa(paradas, t) {
  t = limitar(t);
  for (let i = 1; i < paradas.length; i++) {
    const [p1, c1] = paradas[i - 1];
    const [p2, c2] = paradas[i];
    if (t <= p2) return mezcla(c1, c2, (t - p1) / (p2 - p1 || 1));
  }
  return paradas.at(-1)[1];
}

const n1 = (v) => +v.toFixed(1);
const puntos = (lista) => lista.map(([x, y]) => `${n1(x)},${n1(y)}`).join(' ');
const poligono = (lista, relleno, extra = '') => `<polygon points="${puntos(lista)}" fill="${relleno}"${extra}/>`;
// Mismo color en el borde: evita las líneas finas entre triángulos vecinos.
const cara = (lista, relleno, extra = '') =>
  poligono(lista, relleno, ` stroke="${relleno}"${extra}`);

const hexagono = (cx, cy, r, giro = 0, escalaY = 1) =>
  [0, 1, 2, 3, 4, 5].map((i) => {
    const a = ((i * 60 + giro) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a) * escalaY];
  });

const svg = (ancho, alto, descripcion, contenido) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${alto}" stroke-width="0.7" stroke-linejoin="round">\n<!-- ${descripcion} -->\n${contenido.join('\n')}\n</svg>\n`;

// Malla de triángulos para cielos y fondos. color(tx, ty) recibe la posición 0..1.
function triangulado({ x = 0, y = 0, ancho, alto, columnas, filas, color, semilla, ruido = 0.05 }) {
  const azar = aleatorio(semilla);
  const dx = ancho / columnas;
  const dy = alto / filas;
  const p = [];
  for (let f = 0; f <= filas; f++) {
    const fila = [];
    for (let c = 0; c <= columnas; c++) {
      const borde = f === 0 || f === filas || c === 0 || c === columnas;
      fila.push([
        x + c * dx + (borde ? 0 : (azar() - 0.5) * dx * 0.8),
        y + f * dy + (borde ? 0 : (azar() - 0.5) * dy * 0.8),
      ]);
    }
    p.push(fila);
  }
  const salida = [];
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      const [a, b, d, e] = [p[f][c], p[f][c + 1], p[f + 1][c], p[f + 1][c + 1]];
      const caras = (f + c) % 2 ? [[a, b, d], [b, e, d]] : [[a, b, e], [a, e, d]];
      for (const tri of caras) {
        const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3;
        const cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
        salida.push(cara(tri, aclarar(color((cx - x) / ancho, (cy - y) / alto), (azar() - 0.5) * ruido * 2)));
      }
    }
  }
  return salida.join('');
}

// Cordillera low poly: cada montaña tiene cara iluminada y cara en sombra.
function cordillera({ base, desde, hasta, picos, altoMin, altoMax, luz, sombra, semilla }) {
  const azar = aleatorio(semilla);
  const ancho = (hasta - desde) / picos;
  const salida = [];
  const valles = [];
  for (let i = 0; i <= picos; i++) valles.push([desde + i * ancho, base - azar() * altoMin * 0.35]);
  salida.push(cara([...valles, [hasta, base + 200], [desde, base + 200]], sombra));
  for (let i = 0; i < picos; i++) {
    const [izq, der] = [valles[i], valles[i + 1]];
    const cima = [izq[0] + ancho * (0.35 + azar() * 0.3), base - (altoMin + azar() * (altoMax - altoMin))];
    const pie = [cima[0] + (azar() - 0.5) * ancho * 0.2, base + 200];
    const pliegue = [cima[0] + (azar() - 0.5) * ancho * 0.25, cima[1] + (base - cima[1]) * 0.55];
    salida.push(cara([izq, cima, pliegue], luz));
    salida.push(cara([izq, pliegue, pie], aclarar(luz, -0.1)));
    salida.push(cara([cima, der, pliegue], sombra));
    salida.push(cara([pliegue, der, pie], aclarar(sombra, -0.1)));
  }
  return salida.join('');
}

// ------------------------------------------------------ esferas low poly 3D

const normalizar = (v) => {
  const l = Math.hypot(...v);
  return v.map((c) => c / l);
};
const resta = (a, b) => a.map((v, i) => v - b[i]);
const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const punto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function icosfera(subdivisiones) {
  const t = (1 + Math.sqrt(5)) / 2;
  const v = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t],
    [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map(normalizar);
  let f = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  for (let s = 0; s < subdivisiones; s++) {
    const cache = new Map();
    const medio = (a, b) => {
      const clave = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!cache.has(clave)) {
        v.push(normalizar(v[a].map((c, i) => (c + v[b][i]) / 2)));
        cache.set(clave, v.length - 1);
      }
      return cache.get(clave);
    };
    f = f.flatMap(([a, b, c]) => {
      const [ab, bc, ca] = [medio(a, b), medio(b, c), medio(c, a)];
      return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]];
    });
  }
  return { v, f };
}

function rotar([x, y, z], rx, ry) {
  const y1 = y * Math.cos(rx) - z * Math.sin(rx);
  const z1 = y * Math.sin(rx) + z * Math.cos(rx);
  return [x * Math.cos(ry) + z1 * Math.sin(ry), y1, -x * Math.sin(ry) + z1 * Math.cos(ry)];
}

const LUZ = normalizar([-0.55, 0.65, 0.55]);

// Devuelve las caras de una esfera ya proyectadas, de atrás hacia adelante.
function caras3D({ cx, cy, r, subdivisiones = 1, rx = -0.35, ry = 0.45 }) {
  const { v, f } = icosfera(subdivisiones);
  const rotados = v.map((p) => rotar(p, rx, ry));
  return f
    .map((indices) => {
      const [a, b, c] = indices.map((i) => rotados[i]);
      const centro = [0, 1, 2].map((k) => (a[k] + b[k] + c[k]) / 3);
      let normal = normalizar(cruz(resta(b, a), resta(c, a)));
      if (punto(normal, centro) < 0) normal = normal.map((n) => -n);
      return {
        indices,
        centro,
        original: [0, 1, 2].map((k) => (v[indices[0]][k] + v[indices[1]][k] + v[indices[2]][k]) / 3),
        normal,
        frente: normal[2] > 0,
        luz: limitar(punto(normal, LUZ) * 0.5 + 0.5),
        pantalla: [a, b, c].map(([x, y]) => [cx + x * r, cy - y * r]),
      };
    })
    .sort((p, q) => p.centro[2] - q.centro[2]);
}

function esfera(opciones, color) {
  return caras3D(opciones)
    .filter((c) => c.frente)
    .map((c) => cara(c.pantalla, color(c)))
    .join('');
}

const sombraSuelo = (cx, cy, r, opacidad = 0.4) =>
  poligono(hexagono(cx, cy, r, 0, 0.22), '#000000', ` opacity="${opacidad}"`);

// Moneda low poly vista de frente.
function moneda(cx, cy, r, giro) {
  return [
    poligono(hexagono(cx, cy, r, giro), '#E0A100'),
    poligono(hexagono(cx, cy, r * 0.62, giro), '#FFD166'),
    poligono([[cx, cy], ...hexagono(cx, cy, r * 0.62, giro).slice(3, 5)], '#FFE7A8'),
  ].join('');
}

// ------------------------------------------------------------- ilustraciones

function historiaBlender() {
  const sol = [530, 262];
  const cielo = triangulado({
    ancho: 640,
    alto: 300,
    columnas: 14,
    filas: 7,
    semilla: 11,
    color: (tx, ty) => {
      const base = rampa(
        [[0, '#130b22'], [0.35, '#2e1648'], [0.6, '#6a2a6e'], [0.78, '#c2506a'], [0.9, '#f08a4b'], [1, '#f5a15c']],
        ty,
      );
      const cerca = limitar(1 - Math.hypot(tx * 640 - sol[0], ty * 300 - sol[1]) / 260);
      return mezcla(base, '#ffb27a', cerca * 0.45);
    },
  });

  const azar = aleatorio(5);
  const estrellas = Array.from({ length: 16 }, () => {
    const [x, y, r] = [20 + azar() * 600, 10 + azar() * 110, 1.2 + azar() * 1.8];
    return poligono([[x, y - r * 2], [x + r, y], [x, y + r * 2], [x - r, y]], '#ffffff', ` opacity="${n1(0.25 + azar() * 0.5)}"`);
  }).join('');

  const rayosSol = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI + (i + 0.5) * (Math.PI / 9);
    const [x1, y1] = [sol[0] + Math.cos(a - 0.05) * 330, sol[1] + Math.sin(a - 0.05) * 330];
    const [x2, y2] = [sol[0] + Math.cos(a + 0.05) * 330, sol[1] + Math.sin(a + 0.05) * 330];
    return poligono([sol, [x1, y1], [x2, y2]], '#FFD166', ' opacity="0.08"');
  }).join('');

  const discoSol = Array.from({ length: 12 }, (_, i) => {
    const a1 = Math.PI + (i * Math.PI) / 12;
    const a2 = Math.PI + ((i + 1) * Math.PI) / 12;
    const borde = (a) => [sol[0] + Math.cos(a) * 66, sol[1] + Math.sin(a) * 66];
    return cara([sol, borde(a1), borde(a2)], i % 2 ? '#FFC04D' : '#FFD166');
  }).join('');

  const lejanas = cordillera({ base: 268, desde: -40, hasta: 680, picos: 6, altoMin: 55, altoMax: 115, luz: '#8a3f7c', sombra: '#5c2a62', semilla: 3 });
  const medias = cordillera({ base: 292, desde: -30, hasta: 670, picos: 5, altoMin: 35, altoMax: 80, luz: '#4f2468', sombra: '#371a4d', semilla: 9 });

  // Colina donde está el candado.
  const cresta = [[-10, 304], [70, 296], [140, 282], [230, 263], [320, 252], [410, 263], [500, 282], [570, 296], [650, 304]];
  const alturaColina = (x) => {
    for (let i = 1; i < cresta.length; i++) {
      if (x <= cresta[i][0]) {
        const [a, b] = [cresta[i - 1], cresta[i]];
        return a[1] + ((x - a[0]) / (b[0] - a[0])) * (b[1] - a[1]);
      }
    }
    return cresta.at(-1)[1];
  };
  const azarColina = aleatorio(21);
  const colina = [];
  const medios = cresta.map(([x]) => [x + (azarColina() - 0.5) * 24, 322 + azarColina() * 12]);
  const fondo = cresta.map(([x]) => [x + (azarColina() - 0.5) * 30, 361]);
  for (let i = 0; i < cresta.length - 1; i++) {
    const [a, b, ma, mb, fa, fb] = [cresta[i], cresta[i + 1], medios[i], medios[i + 1], fondo[i], fondo[i + 1]];
    const tono = (c) => aclarar(c, (azarColina() - 0.5) * 0.12);
    colina.push(cara([a, b, mb], tono(i < 4 ? '#3a1d52' : '#2c1640')));
    colina.push(cara([a, mb, ma], tono('#241235')));
    colina.push(cara([ma, mb, fb], tono('#1d0f2c')));
    colina.push(cara([ma, fb, fa], tono('#170b24')));
  }

  const candado = [320, 252];
  const brillo = [
    poligono(hexagono(candado[0], 222, 88), '#FFD166', ' opacity="0.07"'),
    poligono(hexagono(candado[0], 222, 58), '#FFD166', ' opacity="0.1"'),
    ...Array.from({ length: 8 }, (_, i) => {
      const a = -Math.PI + (i + 0.5) * (Math.PI / 8);
      const punta = (d) => [candado[0] + Math.cos(a + d) * 150, 222 + Math.sin(a + d) * 150];
      return poligono([[candado[0], 222], punta(-0.04), punta(0.04)], '#FFE39A', ' opacity="0.16"');
    }),
  ].join('');

  const [x0, x1, y0, y1, c] = [288, 352, 196, 252, [320, 224]];
  const cuerpo = [
    '<path d="M300 196 V172 A20 20 0 0 1 340 172 V181" fill="none" stroke="#E6E6E6" stroke-width="9"/>',
    '<path d="M300 196 V172 A20 20 0 0 1 340 172 V181" fill="none" stroke="#ffffff" stroke-width="2.5" transform="translate(-2.5 0)" opacity="0.55"/>',
    cara([[x0, y0], [x1, y0], c], '#C39BD3'),
    cara([[x0, y0], c, [x0, y1]], '#9B59B6'),
    cara([[x1, y0], [x1, y1], c], '#7D3C98'),
    cara([[x0, y1], c, [x1, y1]], '#5B2C7A'),
    `<polyline points="${puntos([[x0, y0], [x1, y0]])}" fill="none" stroke="#00E5FF" stroke-width="2"/>`,
    poligono(hexagono(320, 217, 6), '#1a0f2e'),
    poligono([[315.5, 220], [324.5, 220], [320, 236]], '#1a0f2e'),
  ].join('');

  const colores = ['#00E5FF', '#F5792A', '#C39BD3', '#FFD166', '#5CF0FF', '#FFB27A'];
  const personas = [200, 236, 268, 372, 404, 440]
    .map((x, i) => {
      const g = alturaColina(x) + 2;
      const col = colores[i];
      return [
        `<polyline points="${puntos([[x - 9, g - 25], [x - 3, g - 13]])}" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/>`,
        `<polyline points="${puntos([[x + 9, g - 25], [x + 3, g - 13]])}" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/>`,
        cara([[x - 7, g], [x + 7, g], [x, g - 18]], col),
        cara([[x, g - 18], [x + 7, g], [x + 2, g]], aclarar(col, -0.25)),
        poligono(hexagono(x, g - 23, 4.6, 30), aclarar(col, 0.15)),
      ].join('');
    })
    .join('');

  const azarMonedas = aleatorio(17);
  const monedas = Array.from({ length: 13 }, () => {
    const x = 50 + azarMonedas() * 540;
    const y = 24 + azarMonedas() * 170;
    const r = 6 + azarMonedas() * 5;
    return moneda(x, y, r, azarMonedas() * 60);
  }).join('');

  return svg(640, 360, 'Blender liberado: un candado abierto al amanecer, la comunidad y las monedas de la campaña Free Blender.', [
    cielo, estrellas, rayosSol, discoSol, lejanas, medias, brillo, colina.join(''), personas, cuerpo, monedas,
  ]);
}

function fondoTarjeta(semilla) {
  return triangulado({
    ancho: 320,
    alto: 240,
    columnas: 7,
    filas: 5,
    semilla,
    ruido: 0.08,
    color: (tx, ty) => rampa([[0, '#241836'], [1, '#110d18']], (ty + (1 - tx)) / 2),
  });
}

function conceptoMalla() {
  const cx = 160;
  const caras = caras3D({ cx, cy: 112, r: 80, subdivisiones: 1 }).filter((c) => c.frente);
  const alambre = caras.filter((c) => c.pantalla.reduce((s, p) => s + p[0], 0) / 3 < cx);
  const cubiertas = caras.filter((c) => !alambre.includes(c));

  const aristas = new Map();
  const vertices = new Map();
  for (const c of alambre) {
    c.pantalla.forEach((p, i) => {
      const q = c.pantalla[(i + 1) % 3];
      const [a, b] = [c.indices[i], c.indices[(i + 1) % 3]];
      aristas.set(a < b ? `${a}-${b}` : `${b}-${a}`, [p, q]);
      vertices.set(c.indices[i], p);
    });
  }

  return svg(320, 240, 'Malla: la mitad izquierda es solo alambre (vértices y aristas) y la derecha tiene sus caras cubiertas.', [
    fondoTarjeta(4),
    sombraSuelo(cx, 206, 74),
    cubiertas.map((c) => cara(c.pantalla, rampa([[0, '#2a1438'], [0.55, '#7D3C98'], [1, '#D2A8F0']], c.luz))).join(''),
    [...aristas.values()]
      .map(([p, q]) => `<line x1="${n1(p[0])}" y1="${n1(p[1])}" x2="${n1(q[0])}" y2="${n1(q[1])}" stroke="#00E5FF" stroke-width="1.3" opacity="0.9"/>`)
      .join(''),
    [...vertices.values()].map(([x, y]) => poligono(hexagono(x, y, 2.7), '#5CF0FF')).join(''),
  ]);
}

function conceptoMateriales() {
  const esferaEn = (cx) => ({ cx, cy: 110, r: 44, subdivisiones: 1 });

  const madera = esfera(esferaEn(58), (c) => {
    const color = rampa([[0, '#3b200f'], [0.5, '#8a5530'], [1, '#e0a86c']], c.luz);
    const veta = Math.floor((c.original[1] + 1) * 4) % 2;
    return veta ? aclarar(color, -0.14) : color;
  });

  const vidrio = caras3D(esferaEn(160))
    .map((c) => {
      if (!c.frente) {
        return poligono(c.pantalla, '#00E5FF', ' fill-opacity="0.06" stroke="#5CF0FF" stroke-opacity="0.25" stroke-width="0.6"');
      }
      if (c.luz > 0.9) return poligono(c.pantalla, '#ffffff', ' opacity="0.85"');
      return poligono(
        c.pantalla,
        mezcla('#0b3a44', '#9ff7ff', c.luz),
        ' fill-opacity="0.38" stroke="#b8fbff" stroke-opacity="0.55" stroke-width="0.7"',
      );
    })
    .join('');

  const metal = esfera(esferaEn(262), (c) => {
    const color = rampa([[0, '#1c1c24'], [0.5, '#5d606d'], [0.8, '#c9ccd6'], [1, '#ffffff']], c.luz ** 1.6);
    return c.centro[1] < -0.15 ? mezcla(color, '#231a2e', 0.55) : color;
  });

  return svg(320, 240, 'Materiales: la misma esfera low poly con madera, cristal y metal.', [
    fondoTarjeta(8),
    sombraSuelo(58, 170, 40),
    sombraSuelo(160, 170, 40, 0.25),
    sombraSuelo(262, 170, 40),
    madera,
    vidrio,
    metal,
  ]);
}

function conceptoRender() {
  const lente = [86, 118];
  const escenaCubo = [
    cara([[132, 128], [146, 121], [160, 128], [146, 135]], '#C39BD3'),
    cara([[132, 128], [146, 135], [146, 151], [132, 144]], '#9B59B6'),
    cara([[160, 128], [146, 135], [146, 151], [160, 144]], '#6f3589'),
  ].join('');
  const escenaEsfera = esfera({ cx: 172, cy: 108, r: 13, subdivisiones: 0 }, (c) =>
    rampa([[0, '#8C3D10'], [0.6, '#F5792A'], [1, '#FFB27A']], c.luz),
  );

  // La foto final, un poco girada.
  const foto = [
    `<g transform="rotate(6 262 122)">`,
    poligono([[218, 64], [310, 64], [310, 184], [218, 184]], '#000000', ' opacity="0.45" transform="translate(4 5)"'),
    poligono([[218, 64], [310, 64], [310, 184], [218, 184]], '#EDEDED'),
    triangulado({
      x: 226,
      y: 72,
      ancho: 76,
      alto: 58,
      columnas: 4,
      filas: 3,
      semilla: 2,
      color: (tx, ty) => rampa([[0, '#5b2c7a'], [0.7, '#f08a4b'], [1, '#ffd19a']], ty),
    }),
    poligono([[226, 130], [302, 130], [302, 160], [226, 160]], '#3b2350'),
    poligono(hexagono(290, 88, 6), '#FFE39A'),
    sombraSuelo(252, 148, 14, 0.5),
    cara([[240, 132], [252, 126], [264, 132], [252, 138]], '#C39BD3'),
    cara([[240, 132], [252, 138], [252, 150], [240, 144]], '#9B59B6'),
    cara([[264, 132], [252, 138], [252, 150], [264, 144]], '#6f3589'),
    esfera({ cx: 280, cy: 136, r: 9, subdivisiones: 0 }, (c) => rampa([[0, '#8C3D10'], [0.6, '#F5792A'], [1, '#FFB27A']], c.luz)),
    `</g>`,
  ].join('');

  return svg(320, 240, 'Render: la cámara 3D mira la escena y la computadora produce la foto final.', [
    fondoTarjeta(12),
    poligono([lente, [206, 58], [206, 178]], '#00E5FF', ' opacity="0.1"'),
    `<polyline points="${puntos([[206, 58], lente, [206, 178]])}" fill="none" stroke="#00E5FF" stroke-width="1" opacity="0.6"/>`,
    `<line x1="206" y1="58" x2="206" y2="178" stroke="#00E5FF" stroke-width="1.5" opacity="0.8"/>`,
    ...[-24, 0, 24].map((dx) => `<line x1="${150 + dx}" y1="34" x2="${150 + dx}" y2="62" stroke="#FFD166" stroke-width="1.5" opacity="0.5"/>`),
    poligono(hexagono(150, 30, 8), '#FFD166'),
    sombraSuelo(146, 152, 18),
    escenaCubo,
    escenaEsfera,
    cara([[30, 100], [74, 100], [74, 138], [30, 138]], '#7D3C98'),
    cara([[30, 100], [74, 100], [84, 92], [40, 92]], '#B57EDC'),
    cara([[74, 100], [84, 92], [84, 130], [74, 138]], '#5B2C7A'),
    cara([[46, 88], [68, 88], [57, 76]], '#00E5FF'),
    poligono([[86, 108], [89, 115], [96, 118], [89, 121], [86, 128], [83, 121], [76, 118], [83, 115]], '#ffffff', ' opacity="0.9"'),
    foto,
  ]);
}

function navegadorWebXR() {
  const fondo = triangulado({
    ancho: 640,
    alto: 360,
    columnas: 12,
    filas: 7,
    semilla: 31,
    ruido: 0.07,
    color: (tx, ty) => mezcla(rampa([[0, '#1c1230'], [1, '#0e0b16']], ty), '#0b3a44', limitar(tx - ty) * 0.6),
  });

  const ventana = [
    poligono([[70, 34], [500, 34], [500, 304], [486, 318], [56, 318], [56, 48]], '#1E1E1E', ' stroke="#3a3a3a" stroke-width="2"'),
    poligono([[70, 34], [500, 34], [500, 66], [56, 66], [56, 48]], '#262626'),
    poligono(hexagono(80, 50, 5), '#F5792A'),
    poligono(hexagono(97, 50, 5), '#FFD166'),
    poligono(hexagono(114, 50, 5), '#00E5FF'),
    poligono([[140, 42], [470, 42], [470, 58], [140, 58]], '#141414'),
    poligono(hexagono(152, 50, 3.2), '#5CF0FF'),
    poligono([[163, 48], [300, 48], [300, 52], [163, 52]], '#ffffff', ' opacity="0.18"'),
  ].join('');

  // El "Hola Mundo" de A-Frame, con sus colores originales.
  const cieloEscena = triangulado({
    x: 64,
    y: 72,
    ancho: 428,
    alto: 238,
    columnas: 8,
    filas: 4,
    semilla: 7,
    ruido: 0.04,
    color: (tx, ty) => rampa([[0, '#f4f4f7'], [1, '#d6d6e0']], ty),
  });
  const plano = [
    cara([[200, 222], [360, 222], [280, 258]], '#86d0ae'),
    cara([[360, 222], [410, 300], [280, 258]], '#6fb896'),
    cara([[410, 300], [150, 300], [280, 258]], '#65a98a'),
    cara([[150, 300], [200, 222], [280, 258]], '#7BC8A4'),
  ].join('');
  const caja = [
    sombraSuelo(232, 262, 30, 0.2),
    cara([[204, 206], [230, 194], [256, 206], [230, 218]], '#9fe6f0'),
    cara([[204, 206], [230, 218], [230, 258], [204, 246]], '#4CC3D9'),
    cara([[256, 206], [230, 218], [230, 258], [256, 246]], '#3597ab'),
  ].join('');
  const esferaRosa = esfera({ cx: 300, cy: 176, r: 42, subdivisiones: 1 }, (c) =>
    rampa([[0, '#6d0e2a'], [0.55, '#EF2D5E'], [1, '#ff9bb6']], c.luz),
  );
  const cilindro = (() => {
    const [cx, arriba, abajo, rx, ry] = [352, 212, 256, 16, 6];
    const borde = (y, a) => [cx + rx * Math.cos(a), y + ry * Math.sin(a)];
    const lados = [];
    for (let i = 0; i < 8; i++) {
      const [a1, a2] = [(i * Math.PI) / 4, ((i + 1) * Math.PI) / 4];
      const medio = (a1 + a2) / 2;
      if (Math.sin(medio) <= 0) continue;
      const luz = 0.5 - 0.45 * Math.cos(medio + 0.4);
      lados.push(cara([borde(arriba, a1), borde(arriba, a2), borde(abajo, a2), borde(abajo, a1)], rampa([[0, '#b8862a'], [0.5, '#FFC65D'], [1, '#ffe2a3']], luz)));
    }
    const tapa = Array.from({ length: 8 }, (_, i) => borde(arriba, (i * Math.PI) / 4));
    return [sombraSuelo(356, 258, 22, 0.2), ...lados, cara(tapa, '#ffe2a3')].join('');
  })();

  const visor = `<g transform="translate(424 190) scale(2.9)">
<polygon points="6,22 14,14 32,14 32,42 26,50 14,50 6,44" fill="#00B8CC"/>
<polygon points="58,22 50,14 32,14 32,42 38,50 50,50 58,44" fill="#008A99"/>
<polygon points="6,22 14,14 50,14 58,22" fill="#5CF0FF"/>
<polygon points="13,32 16.5,26 23.5,26 27,32 23.5,38 16.5,38" fill="#121212"/>
<polygon points="37,32 40.5,26 47.5,26 51,32 47.5,38 40.5,38" fill="#121212"/>
<polygon points="16.5,26 23.5,26 20,31" fill="#1E3A40"/>
<polygon points="40.5,26 47.5,26 44,31" fill="#1E3A40"/>
</g>`;
  const cristal = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
<polygon points="32,2 10,22 32,26" fill="#D2A8F0"/><polygon points="32,2 54,22 32,26" fill="#B57EDC"/>
<polygon points="10,22 32,26 20,46" fill="#9B59B6"/><polygon points="54,22 32,26 44,46" fill="#7D3C98"/>
<polygon points="20,46 32,26 32,62" fill="#8E44AD"/><polygon points="44,46 32,26 32,62" fill="#5B2C7A"/>
</g>`;

  return svg(640, 360, 'WebXR: una ventana del navegador con la escena Hola Mundo de A-Frame y un visor de realidad virtual.', [
    fondo,
    cristal(528, 44, 0.9),
    cristal(586, 118, 0.5),
    cristal(540, 150, 0.35),
    ventana,
    cieloEscena,
    plano,
    esferaRosa,
    caja,
    cilindro,
    visor,
  ]);
}

// ------------------------------------------------------------------ escribir

const ilustraciones = {
  'blender-historia.svg': historiaBlender,
  'concepto-malla.svg': conceptoMalla,
  'concepto-materiales.svg': conceptoMateriales,
  'concepto-render.svg': conceptoRender,
  'aframe-webxr.svg': navegadorWebXR,
};

mkdirSync(DESTINO, { recursive: true });
for (const [archivo, generar] of Object.entries(ilustraciones)) {
  const contenido = generar();
  writeFileSync(new URL(archivo, DESTINO), contenido);
  console.log(`${archivo.padEnd(26)} ${(contenido.length / 1024).toFixed(1)} KB`);
}
