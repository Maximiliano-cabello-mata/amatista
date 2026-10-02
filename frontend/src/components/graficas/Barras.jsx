import { useId, useMemo, useRef, useState } from 'react';
import { COLORES } from './colores';
import { conUnidad, escalaBonita, limitar, saltoEtiquetas } from './escalas';
import { useAncho } from './useAncho';

const MARGEN = { izquierda: 30, derecha: 4, arriba: 20, abajo: 22 };
const GROSOR_MAXIMO = 24;
const RADIO = 4;

// Columna con la punta redondeada (4 px) y la base recta sobre el eje.
function columna(x, y, ancho, base) {
  const alto = base - y;
  if (alto <= 0) return '';
  const r = Math.min(RADIO, ancho / 2, alto);
  return `M ${x} ${base} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} H ${x + ancho - r} A ${r} ${r} 0 0 1 ${x + ancho} ${y + r} V ${base} Z`;
}

// Gráfica de columnas de una sola serie (sin leyenda: el título la nombra).
//   datos: [{clave, etiqueta (eje X, corta), detalle (texto completo), valor}]
//   resaltar: clave de la columna a destacar (p. ej. la semana actual).
// Se recorre con el ratón o con el teclado (flechas, Inicio, Fin) y tiene una
// tabla equivalente para lectores de pantalla.
function Barras({
  datos = [],
  titulo,
  unidad,
  formato,
  alto = 140,
  color = COLORES.amatista,
  colorResaltado = COLORES.amatistaClaro,
  resaltar = null,
  encabezados = ['Periodo', 'Valor'],
  className = '',
}) {
  const id = useId();
  const contenedor = useRef(null);
  const ancho = useAncho(contenedor) || 320;
  const [activo, setActivo] = useState(null);
  const texto = formato ?? ((valor) => conUnidad(valor, unidad));

  const geometria = useMemo(() => {
    const cantidad = datos.length;
    const maximo = Math.max(0, ...datos.map((d) => Number(d.valor) || 0));
    const escala = escalaBonita(maximo);
    const anchoPlano = Math.max(40, ancho - MARGEN.izquierda - MARGEN.derecha);
    const banda = anchoPlano / Math.max(1, cantidad);
    const grosor = Math.min(GROSOR_MAXIMO, Math.max(3, banda * 0.62));
    const base = MARGEN.arriba + alto;
    const y = (valor) => base - (Math.max(0, Number(valor) || 0) / escala.tope) * alto;
    const indiceMaximo = maximo > 0 ? datos.findIndex((d) => Number(d.valor) === maximo) : -1;
    return {
      escala,
      banda,
      grosor,
      base,
      y,
      indiceMaximo,
      salto: saltoEtiquetas(cantidad, anchoPlano),
      xBanda: (i) => MARGEN.izquierda + banda * i,
      centro: (i) => MARGEN.izquierda + banda * i + banda / 2,
    };
  }, [datos, ancho, alto]);

  if (!datos.length) return null;

  const { escala, banda, grosor, base, y, indiceMaximo, salto, xBanda, centro } = geometria;
  const altoTotal = MARGEN.arriba + alto + MARGEN.abajo;
  const indiceResaltado = datos.findIndex((d) => d.clave === resaltar);
  const seleccionado = activo === null ? null : datos[activo];
  // Las etiquetas de los extremos se corren hacia adentro para no cortarse
  // (monoespaciada de 10 px: ~6.1 px por carácter).
  const xEtiqueta = (i, etiqueta) => {
    const mitad = (String(etiqueta ?? '').length * 6.1) / 2;
    return limitar(centro(i), mitad, ancho - mitad);
  };

  const alTeclear = (evento) => {
    const ultimo = datos.length - 1;
    const actual = activo ?? (indiceResaltado >= 0 ? indiceResaltado : ultimo);
    const destinos = { ArrowRight: actual + 1, ArrowLeft: actual - 1, Home: 0, End: ultimo };
    if (evento.key === 'Escape') {
      setActivo(null);
      return;
    }
    if (!(evento.key in destinos)) return;
    evento.preventDefault();
    setActivo(limitar(destinos[evento.key], 0, ultimo));
  };

  return (
    <figure className={`m-0 ${className}`}>
      <div
        ref={contenedor}
        className="relative outline-offset-4"
        style={{ height: altoTotal }}
        tabIndex={0}
        role="group"
        aria-label={titulo}
        aria-describedby={`${id}-ayuda`}
        onKeyDown={alTeclear}
        onFocus={() => setActivo((previo) => previo ?? (indiceResaltado >= 0 ? indiceResaltado : datos.length - 1))}
        onBlur={() => setActivo(null)}
        onPointerLeave={() => setActivo(null)}
      >
        <svg width={ancho} height={altoTotal} className="block" aria-hidden="true">
          {/* Rejilla y eje: líneas finas y discretas */}
          {escala.marcas.map((marca) => (
            <g key={marca}>
              {marca > 0 && (
                <line x1={MARGEN.izquierda} x2={ancho - MARGEN.derecha} y1={y(marca)} y2={y(marca)} stroke={COLORES.rejilla} strokeWidth="1" />
              )}
              <text
                x={MARGEN.izquierda - 8}
                y={y(marca)}
                dy="0.32em"
                textAnchor="end"
                fill={COLORES.textoSuave}
                className="font-mono text-[10px] tabular-nums"
              >
                {marca}
              </text>
            </g>
          ))}

          {activo !== null && (
            <rect x={xBanda(activo)} y={MARGEN.arriba - 6} width={banda} height={alto + 6} fill="rgba(255,255,255,0.05)" />
          )}

          {datos.map((dato, i) => {
            const resaltada = i === indiceResaltado;
            const x = centro(i) - grosor / 2;
            const etiquetaVisible = (datos.length - 1 - i) % salto === 0;
            const valorVisible = Number(dato.valor) > 0 && (i === indiceMaximo || resaltada) && banda >= 22;
            return (
              <g key={dato.clave}>
                <path d={columna(x, y(dato.valor), grosor, base)} fill={resaltada ? colorResaltado : color} />
                {valorVisible && (
                  <text x={centro(i)} y={y(dato.valor) - 6} textAnchor="middle" fill={COLORES.texto} className="font-mono text-[11px] font-bold">
                    {dato.valor}
                  </text>
                )}
                {etiquetaVisible && (
                  <text
                    x={xEtiqueta(i, dato.etiqueta)}
                    y={base + 15}
                    textAnchor="middle"
                    fill={resaltada ? COLORES.texto : COLORES.textoSuave}
                    className={`font-mono text-[10px] ${resaltada ? 'font-bold' : ''}`}
                  >
                    {dato.etiqueta}
                  </text>
                )}
                {/* Zona sensible: toda la banda, no solo la columna */}
                <rect
                  x={xBanda(i)}
                  y={MARGEN.arriba - 6}
                  width={banda}
                  height={alto + MARGEN.abajo + 6}
                  fill="transparent"
                  onPointerEnter={() => setActivo(i)}
                />
              </g>
            );
          })}

          <line x1={MARGEN.izquierda} x2={ancho - MARGEN.derecha} y1={base} y2={base} stroke={COLORES.eje} strokeWidth="1" />
        </svg>

        {seleccionado && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap border border-white/10 bg-base/95 px-2.5 py-1.5 shadow-lg"
            style={{ left: limitar(centro(activo), 64, ancho - 64), top: Math.max(4, y(seleccionado.valor) - 8) }}
          >
            <strong className="block text-sm text-white">{texto(Number(seleccionado.valor) || 0)}</strong>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-white/55">{seleccionado.detalle ?? seleccionado.etiqueta}</span>
          </div>
        )}
      </div>

      <p id={`${id}-ayuda`} className="sr-only">
        Usa las flechas izquierda y derecha para recorrer los valores.
      </p>
      <p className="sr-only" aria-live="polite">
        {seleccionado ? `${seleccionado.detalle ?? seleccionado.etiqueta}: ${texto(Number(seleccionado.valor) || 0)}` : ''}
      </p>
      {/* sr-only va en un div: una tabla no se encoge a 1 px y desbordaría la página en móvil. */}
      <div className="sr-only">
        <table>
          <caption>{titulo}</caption>
          <thead>
            <tr>
              <th scope="col">{encabezados[0]}</th>
              <th scope="col">{encabezados[1]}</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((dato) => (
              <tr key={dato.clave}>
                <th scope="row">{dato.detalle ?? dato.etiqueta}</th>
                <td>{texto(Number(dato.valor) || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export default Barras;
