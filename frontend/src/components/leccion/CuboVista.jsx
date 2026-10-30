// La vista 3D mínima de las dinámicas v4.3 (dinamicas.js): suelo con los ejes de Blender (X rojo,
// Y verde, Z azul), el cubo del alumno y, si hace falta, el molde translúcido de a dónde tiene que
// llegar (el mismo «molde» que dibuja Amatista Motor en Blender).
import { carasDelCubo, proyectar } from './dinamicas';

const ANCHO = 320;
const ALTO = 220;
const ESCALA = 46;

// Las caras ya vienen proyectadas (dinamicas.js › carasDelCubo): solo se centran en el lienzo.
const enLienzo = ([x, y]) => [x + ANCHO / 2, y + ALTO * 0.58];
const poligono = (puntos) => puntos.map((p) => enLienzo(p).map((n) => n.toFixed(1)).join(',')).join(' ');

// Un punto del mundo en el lienzo.
const xy = (p3) => {
  const [x, y] = proyectar(p3, ESCALA);
  return [x + ANCHO / 2, y + ALTO * 0.58];
};

const REJILLA = [-2, -1, 0, 1, 2].flatMap((i) => [
  [[i, -2.4, 0], [i, 2.4, 0]],
  [[-2.4, i, 0], [2.4, i, 0]],
]);
const EJES = [
  { b: [2.6, 0, 0], a: [-2.6, 0, 0], clase: 'cubo-vista__eje--x', letra: 'X' },
  { b: [0, 2.6, 0], a: [0, -2.6, 0], clase: 'cubo-vista__eje--y', letra: 'Y' },
  { b: [0, 0, 2.1], a: [0, 0, 0], clase: 'cubo-vista__eje--z', letra: 'Z' },
];

function Ejes() {
  return (
    <g aria-hidden="true">
      {REJILLA.map(([a, b], i) => {
        const [x1, y1] = xy(a);
        const [x2, y2] = xy(b);
        return <line key={i} className="cubo-vista__rejilla" x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
      {EJES.map(({ a, b, clase, letra }) => {
        const [x1, y1] = xy(a);
        const [x2, y2] = xy(b);
        return (
          <g key={letra}>
            <line className={`cubo-vista__eje ${clase}`} x1={x1} y1={y1} x2={x2} y2={y2} />
            <text className={`cubo-vista__letra ${clase}`} x={x2} y={y2} dx="4" dy="4">
              {letra}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Cubo({ t, clase, edicion = false }) {
  const caras = carasDelCubo(t, 0.5, ESCALA);
  return (
    <g className={clase}>
      {caras.map((cara, i) => (
        <polygon key={i} points={poligono(cara.puntos)} style={{ '--luz': cara.luz }} className="cubo-vista__cara" />
      ))}
      {edicion &&
        caras.flatMap((cara) => cara.puntos).map((p, i) => {
          const [x, y] = enLienzo(p);
          return <circle key={`v${i}`} cx={x} cy={y} r="2.6" className="cubo-vista__vertice" />;
        })}
    </g>
  );
}

function CuboVista({ transformacion, molde = null, copia = false, edicion = false, etiqueta, className = '' }) {
  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className={`cubo-vista ${edicion ? 'cubo-vista--edicion' : ''} ${className}`} role="img" aria-label={etiqueta}>
      <rect width={ANCHO} height={ALTO} className="cubo-vista__fondo" />
      <Ejes />
      {molde && <Cubo t={molde} clase="cubo-vista__molde" />}
      {copia && <Cubo t={{ posicion: [-1.3, 1.1, 0] }} clase="cubo-vista__copia animar-aparecer" />}
      <Cubo t={transformacion} clase="cubo-vista__cubo" edicion={edicion} />
    </svg>
  );
}

export default CuboVista;
