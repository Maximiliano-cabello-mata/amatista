import { useId, useMemo, useState } from 'react';
import { fechaLocal, sumarDias } from '../../progreso/reglas';
import { CELDA_VACIA, COLORES, RAMPA_AMATISTA } from './colores';
import { conUnidad, limitar, nivelDeRampa } from './escalas';
import { DIAS_CORTOS, diaDelMes, fechaCorta, inicioSemana, mesDe, MESES_CORTOS } from './fechas';

const IZQUIERDA = 30;
const ARRIBA = 16;
const FILAS_CON_NOMBRE = [0, 2, 4]; // lun, mié, vie

// Texto de cada paso de la rampa para la leyenda: "1–2", "3–5", "10 o más".
function rangos(umbrales) {
  return umbrales.map((umbral, i) => {
    const siguiente = umbrales[i + 1];
    if (siguiente === undefined) return `${umbral} o más`;
    return siguiente - 1 === umbral ? String(umbral) : `${umbral}–${siguiente - 1}`;
  });
}

// Mapa de calor por día de las últimas `semanas` semanas (columnas de lunes a
// domingo; la última es la semana actual). Color secuencial de un solo tono:
// más claro = más actividad. Se recorre con el ratón o con el teclado (flechas:
// ↑↓ cambian de día, ←→ de semana) y tiene una tabla para lectores de pantalla.
//   valores: {"YYYY-MM-DD": n}   hoy: fecha local "YYYY-MM-DD" o Date
function MapaCalor({
  valores = {},
  hoy,
  semanas = 12,
  titulo,
  unidad = ['actividad', 'actividades'],
  umbrales = [1, 3, 6, 10],
  rampa = RAMPA_AMATISTA,
  celda = 14,
  separacion = 3,
  className = '',
}) {
  const id = useId();
  const [activo, setActivo] = useState(null);
  const hoyTexto = fechaLocal(hoy);
  const paso = celda + separacion;
  const ancho = IZQUIERDA + semanas * paso - separacion;
  const alto = ARRIBA + 7 * paso - separacion;

  const { dias, indiceHoy, meses, resumen } = useMemo(() => {
    const inicio = sumarDias(inicioSemana(hoyTexto), -7 * (semanas - 1));
    const lista = Array.from({ length: semanas * 7 }, (_, i) => {
      const fecha = sumarDias(inicio, i);
      const valor = Math.max(0, Math.floor(Number(valores?.[fecha]) || 0));
      return { fecha, semana: Math.floor(i / 7), dia: i % 7, valor, futuro: fecha > hoyTexto };
    });
    // Nombre del mes sobre la columna donde empieza; el primero, si no choca.
    const etiquetas = [];
    for (let semana = 0; semana < semanas; semana += 1) {
      const primero = lista.slice(semana * 7, semana * 7 + 7).find((d) => diaDelMes(d.fecha) === 1);
      if (primero) etiquetas.push({ semana, mes: mesDe(primero.fecha) });
    }
    if (!etiquetas.length || etiquetas[0].semana >= 3) etiquetas.unshift({ semana: 0, mes: mesDe(lista[0].fecha) });
    const pasados = lista.filter((d) => !d.futuro);
    return {
      dias: lista,
      indiceHoy: lista.findIndex((d) => d.fecha === hoyTexto),
      meses: etiquetas,
      resumen: {
        total: pasados.reduce((suma, d) => suma + d.valor, 0),
        diasActivos: pasados.filter((d) => d.valor > 0).length,
      },
    };
  }, [valores, hoyTexto, semanas]);

  const colorDe = (valor) => {
    const nivel = nivelDeRampa(valor, umbrales);
    return nivel ? rampa[Math.min(nivel, rampa.length) - 1] : CELDA_VACIA;
  };
  const posicion = (d) => ({ x: IZQUIERDA + d.semana * paso, y: ARRIBA + d.dia * paso });
  const seleccionado = activo === null ? null : dias[activo];
  const descripcion = (d) => `${fechaCorta(d.fecha)}: ${conUnidad(d.valor, unidad)}`;

  const alTeclear = (evento) => {
    const actual = activo ?? indiceHoy;
    const destinos = { ArrowUp: actual - 1, ArrowDown: actual + 1, ArrowLeft: actual - 7, ArrowRight: actual + 7, Home: 0, End: indiceHoy };
    if (evento.key === 'Escape') {
      setActivo(null);
      return;
    }
    if (!(evento.key in destinos)) return;
    evento.preventDefault();
    setActivo(limitar(destinos[evento.key], 0, indiceHoy));
  };

  const etiquetasRampa = rangos(umbrales);

  return (
    <figure className={`m-0 ${className}`}>
      <div
        className="relative w-full outline-offset-4"
        style={{ maxWidth: Math.round(ancho * 1.35) }}
        tabIndex={0}
        role="group"
        aria-label={`${titulo}: ${conUnidad(resumen.total, unidad)} en ${conUnidad(resumen.diasActivos, ['día activo', 'días activos'])} de las últimas ${semanas} semanas`}
        aria-describedby={`${id}-ayuda`}
        onKeyDown={alTeclear}
        onFocus={() => setActivo((previo) => previo ?? indiceHoy)}
        onBlur={() => setActivo(null)}
        onPointerLeave={() => setActivo(null)}
      >
        <svg viewBox={`0 0 ${ancho} ${alto}`} width="100%" className="block" aria-hidden="true">
          {meses.map(({ semana, mes }) => (
            <text key={`${semana}-${mes}`} x={IZQUIERDA + semana * paso} y={10} fill={COLORES.textoSuave} className="font-mono text-[9px]">
              {MESES_CORTOS[mes]}
            </text>
          ))}
          {FILAS_CON_NOMBRE.map((fila) => (
            <text
              key={fila}
              x={IZQUIERDA - 6}
              y={ARRIBA + fila * paso + celda / 2}
              dy="0.32em"
              textAnchor="end"
              fill={COLORES.textoSuave}
              className="font-mono text-[9px]"
            >
              {DIAS_CORTOS[fila]}
            </text>
          ))}
          {dias.map((d, i) => {
            if (d.futuro) return null;
            const { x, y } = posicion(d);
            // El borde transparente agranda la zona sensible hasta cubrir la separación.
            return (
              <rect
                key={d.fecha}
                x={x}
                y={y}
                width={celda}
                height={celda}
                rx="2"
                fill={colorDe(d.valor)}
                stroke="transparent"
                strokeWidth={separacion}
                onPointerEnter={() => setActivo(i)}
              />
            );
          })}
          {/* Hoy con borde neón; la celda señalada, con borde claro */}
          {indiceHoy >= 0 && (
            <rect
              x={posicion(dias[indiceHoy]).x + 0.75}
              y={posicion(dias[indiceHoy]).y + 0.75}
              width={celda - 1.5}
              height={celda - 1.5}
              rx="2"
              fill="none"
              stroke={COLORES.neon}
              strokeWidth="1.5"
              pointerEvents="none"
            />
          )}
          {seleccionado && (
            <rect
              x={posicion(seleccionado).x - 1.5}
              y={posicion(seleccionado).y - 1.5}
              width={celda + 3}
              height={celda + 3}
              rx="3"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              pointerEvents="none"
            />
          )}
        </svg>

        {seleccionado && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap border border-white/10 bg-base/95 px-2.5 py-1.5 shadow-lg"
            style={{
              left: `${limitar(((posicion(seleccionado).x + celda / 2) / ancho) * 100, 18, 82)}%`,
              top: `${((posicion(seleccionado).y - 3) / alto) * 100}%`,
            }}
          >
            <strong className="block text-sm text-white">{conUnidad(seleccionado.valor, unidad)}</strong>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-white/55">
              {fechaCorta(seleccionado.fecha)}
              {seleccionado.fecha === hoyTexto ? ' · hoy' : ''}
            </span>
          </div>
        )}
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-wider text-white/45">
        <span className="flex items-center gap-1.5">
          Menos
          <span className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: CELDA_VACIA }} title="Sin actividad" aria-hidden="true" />
          {rampa.map((tono, i) => (
            <span key={tono} className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: tono }} title={etiquetasRampa[i]} aria-hidden="true" />
          ))}
          Más
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px] border-[1.5px] border-neon" aria-hidden="true" /> Hoy
        </span>
        <span className="sr-only">Escala por día: {['sin actividad', ...etiquetasRampa].join(', ')}.</span>
      </figcaption>

      <p id={`${id}-ayuda`} className="sr-only">
        Usa las flechas para recorrer los días: arriba y abajo cambian de día; izquierda y derecha, de semana.
      </p>
      <p className="sr-only" aria-live="polite">
        {seleccionado ? descripcion(seleccionado) : ''}
      </p>
      <table className="sr-only">
        <caption>{titulo} por semana</caption>
        <thead>
          <tr>
            <th scope="col">Semana del</th>
            {DIAS_CORTOS.map((dia) => (
              <th key={dia} scope="col">
                {dia}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: semanas }, (_, semana) => {
            const fila = dias.slice(semana * 7, semana * 7 + 7);
            return (
              <tr key={fila[0].fecha}>
                <th scope="row">{fechaCorta(fila[0].fecha, { conDia: false })}</th>
                {fila.map((d) => (
                  <td key={d.fecha}>{d.futuro ? '—' : d.valor}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </figure>
  );
}

export default MapaCalor;
