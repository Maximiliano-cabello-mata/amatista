// El montaje: qué escenas se ven en el segundo t y cómo pasa una a la otra.
import { Barrido } from './piezas.jsx';
import { ESCENAS, DURACION } from './linea.js';
import { curva, tramo } from './tiempo';

const CRUCE = 0.4; // medio cruce de un fundido

function opacidad(t, e, siguiente) {
  const fin = e.inicio + e.d;
  let o = 1;
  if (e.entrada === 'fundido') o *= curva.suave(tramo(t, e.inicio - CRUCE, e.inicio + CRUCE));
  if (e.entrada === 'negro') o *= curva.suave(tramo(t, e.inicio, e.inicio + 0.6));
  if (siguiente?.entrada === 'fundido') o *= 1 - curva.suave(tramo(t, fin - CRUCE, fin + CRUCE));
  if (siguiente?.entrada === 'negro') o *= 1 - curva.suave(tramo(t, fin - 0.7, fin));
  if (!siguiente) o *= 1 - curva.suave(tramo(t, DURACION - 1.4, DURACION));
  return o;
}

export default function Pelicula({ t }) {
  const capas = [];
  let destello = 0;
  let barrido = 0;
  ESCENAS.forEach((e, i) => {
    const siguiente = ESCENAS[i + 1];
    const desde = e.entrada === 'fundido' ? e.inicio - CRUCE : e.inicio;
    const hasta = siguiente?.entrada === 'fundido' ? e.inicio + e.d + CRUCE : e.inicio + e.d;
    if (t >= desde && t < hasta) {
      const { Escena } = e;
      capas.push(
        <div key={e.id} style={{ position: 'absolute', inset: 0, opacity: opacidad(t, e, siguiente) }}>
          <Escena t={t - e.inicio} d={e.d} />
        </div>,
      );
    }
    if (e.entrada === 'barrido' && Math.abs(t - e.inicio) < 0.6) barrido = tramo(t, e.inicio - 0.55, e.inicio + 0.55);
    if (e.entrada === 'corte') destello = Math.max(destello, 1 - tramo(t, e.inicio, e.inicio + 0.35));
  });
  return (
    <div className="pelicula">
      {capas}
      <Barrido k={barrido} />
      {destello > 0 && destello < 1 && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: destello * 0.85, zIndex: 60 }} />}
    </div>
  );
}
