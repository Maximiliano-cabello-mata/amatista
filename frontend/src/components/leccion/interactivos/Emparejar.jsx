import { useMemo, useState } from 'react';
import { TextoEnLinea } from '../Markdown';
import { useActividad } from './hooks';
import { mezclarDistinto, semillaDe, textoPlano } from './logica';
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';

// Un color por pareja (con su número, para no depender solo del color).
const COLORES = [
  { borde: 'border-neon', fondo: 'bg-neon/10', insignia: 'bg-neon' },
  { borde: 'border-blender', fondo: 'bg-blender/10', insignia: 'bg-blender' },
  { borde: 'border-amatista-claro', fondo: 'bg-amatista/15', insignia: 'bg-amatista-claro' },
  { borde: 'border-yellow-300', fondo: 'bg-yellow-300/10', insignia: 'bg-yellow-300' },
  { borde: 'border-pink-400', fondo: 'bg-pink-400/10', insignia: 'bg-pink-400' },
  { borde: 'border-lime-300', fondo: 'bg-lime-300/10', insignia: 'bg-lime-300' },
  { borde: 'border-sky-400', fondo: 'bg-sky-400/10', insignia: 'bg-sky-400' },
  { borde: 'border-orange-300', fondo: 'bg-orange-300/10', insignia: 'bg-orange-300' },
];

function Insignia({ color, numero, fija }) {
  return (
    <span
      className={`hexagono grid h-7 w-7 shrink-0 place-items-center font-mono text-xs font-bold ${
        color ? `${color.insignia} text-[#121212]` : 'bg-white/10 text-white/40'
      }`}
      aria-hidden="true"
    >
      {fija ? '✓' : (numero ?? '·')}
    </span>
  );
}

function claseBoton({ color, seleccionado, fija }) {
  if (seleccionado) return 'border-neon bg-neon/15 text-white ring-2 ring-neon/50';
  if (color) return `${color.borde} ${color.fondo} text-white`;
  if (fija) return 'border-emerald-400/60 bg-emerald-400/10 text-white';
  return 'border-white/10 bg-base/60 text-texto hover:border-amatista hover:bg-amatista/10';
}

// Une cada concepto (izquierda) con su pareja (derecha): se toca uno de cada
// lado. Tocar algo ya unido lo suelta. Al comprobar, las parejas correctas
// quedan fijas y las incorrectas se sueltan para volver a intentarlo.
function Emparejar({ bloque, alCompletar, resuelta }) {
  const { pairs: pares } = bloque;
  const derechas = useMemo(
    () => mezclarDistinto(pares.map((par) => par.id), semillaDe(`${bloque.id ?? ''}:derecha`)),
    [pares, bloque.id],
  );
  const textoDerecha = useMemo(() => new Map(pares.map((par) => [par.id, par.right])), [pares]);
  // uniones: {idIzquierda: idDerecha}. Cada par se identifica por su id.
  const [uniones, setUniones] = useState({});
  const [fijas, setFijas] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [fallos, setFallos] = useState(0);
  const [ultimo, setUltimo] = useState(null);
  const { resultado, resolver } = useActividad(alCompletar);

  const izquierdaDe = (idDerecha) => Object.keys(uniones).find((izquierda) => uniones[izquierda] === idDerecha);
  const colorDe = (idIzquierda) => COLORES[pares.findIndex((par) => par.id === idIzquierda) % COLORES.length];
  const numeroDe = (idIzquierda) => pares.findIndex((par) => par.id === idIzquierda) + 1;

  const unir = (izquierda, derecha) => {
    setUniones({ ...uniones, [izquierda]: derecha });
    setSeleccion(null);
    setUltimo(null);
  };

  const soltar = (izquierda) => {
    const resto = { ...uniones };
    delete resto[izquierda];
    setUniones(resto);
    return resto;
  };

  const tocarIzquierda = (id) => {
    if (resultado || fijas.includes(id)) return;
    if (uniones[id]) {
      soltar(id);
      setSeleccion({ lado: 'izquierda', id });
    } else if (seleccion?.lado === 'derecha') {
      unir(id, seleccion.id);
    } else {
      setSeleccion(seleccion?.id === id ? null : { lado: 'izquierda', id });
    }
  };

  const tocarDerecha = (id) => {
    const unida = izquierdaDe(id);
    if (resultado || (unida && fijas.includes(unida))) return;
    if (unida) {
      soltar(unida);
      setSeleccion({ lado: 'derecha', id });
    } else if (seleccion?.lado === 'izquierda') {
      unir(seleccion.id, id);
    } else {
      setSeleccion(seleccion?.id === id && seleccion.lado === 'derecha' ? null : { lado: 'derecha', id });
    }
  };

  const completas = pares.every((par) => uniones[par.id]);

  const comprobar = () => {
    const correctas = pares.filter((par) => uniones[par.id] === par.id).map((par) => par.id);
    setFijas(correctas);
    if (correctas.length === pares.length) {
      resolver(true, fallos + 1);
      return;
    }
    setFallos(fallos + 1);
    setUltimo({ bien: correctas.length });
    setUniones(Object.fromEntries(correctas.map((id) => [id, id])));
    setSeleccion(null);
  };

  const verSolucion = () => {
    setUniones(Object.fromEntries(pares.map((par) => [par.id, par.id])));
    setFijas(pares.map((par) => par.id));
    setSeleccion(null);
    resolver(false, fallos);
  };

  let retro = null;
  if (resultado?.correcto) {
    retro = {
      tipo: 'bien',
      texto: fallos === 0 ? '¡Todas las parejas a la primera!' : '¡Todas las parejas están unidas!',
      explicacion: bloque.explanation,
    };
  } else if (resultado) {
    retro = { tipo: 'solucion', texto: 'Así van las parejas.', explicacion: bloque.explanation };
  } else if (ultimo) {
    retro = {
      tipo: 'mal',
      clave: fallos,
      texto: `${ultimo.bien} de ${pares.length} parejas correctas: esas quedan fijas. Las demás se soltaron, vuelve a unirlas.`,
    };
  }

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.prompt} resultado={resultado} resuelta={resuelta}>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-white/45">
        Toca un elemento de cada columna para unirlos
      </p>
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <ul className="space-y-2" aria-label="Conceptos">
          {pares.map((par) => {
            const derecha = uniones[par.id];
            const fija = fijas.includes(par.id);
            const color = derecha ? colorDe(par.id) : null;
            const seleccionado = seleccion?.lado === 'izquierda' && seleccion.id === par.id;
            return (
              <li key={par.id}>
                <button
                  type="button"
                  onClick={() => tocarIzquierda(par.id)}
                  aria-pressed={seleccionado}
                  disabled={Boolean(resultado) || fija}
                  className={`corte-poly-sm flex min-h-12 w-full items-center gap-2 border-2 px-2.5 py-2 text-left text-sm font-semibold transition-colors disabled:cursor-default sm:gap-3 sm:px-3 sm:text-base ${claseBoton(
                    { color, seleccionado, fija },
                  )}`}
                >
                  <Insignia color={color} numero={derecha ? numeroDe(par.id) : null} fija={fija} />
                  <span className="min-w-0">
                    <TextoEnLinea texto={par.left} />
                    <span className="sr-only">
                      {derecha ? `, unido con «${textoPlano(textoDerecha.get(derecha))}»${fija ? ' (correcto)' : ''}` : ', sin pareja'}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="space-y-2" aria-label="Parejas">
          {derechas.map((id) => {
            const izquierda = izquierdaDe(id);
            const fija = izquierda && fijas.includes(izquierda);
            const color = izquierda ? colorDe(izquierda) : null;
            const seleccionado = seleccion?.lado === 'derecha' && seleccion.id === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => tocarDerecha(id)}
                  aria-pressed={seleccionado}
                  disabled={Boolean(resultado) || Boolean(fija)}
                  className={`corte-poly-sm flex min-h-12 w-full items-center gap-2 border-2 px-2.5 py-2 text-left text-sm transition-colors disabled:cursor-default sm:gap-3 sm:px-3 sm:text-base ${claseBoton(
                    { color, seleccionado, fija },
                  )}`}
                >
                  <Insignia color={color} numero={izquierda ? numeroDe(izquierda) : null} fija={fija} />
                  <span className="min-w-0">
                    <TextoEnLinea texto={textoDerecha.get(id)} />
                    {izquierda && <span className="sr-only">, unido con el número {numeroDe(izquierda)}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <Retroalimentacion retro={retro} />

      {!resultado && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={comprobar} disabled={!completas} className={BOTON_PRINCIPAL}>
            Comprobar
          </button>
          {fallos > 0 && (
            <button type="button" onClick={verSolucion} className={BOTON_SECUNDARIO}>
              Ver solución
            </button>
          )}
          {!completas && (
            <span className="font-mono text-xs text-white/45">
              Unidas {Object.keys(uniones).length} de {pares.length}
            </span>
          )}
        </div>
      )}
    </MarcoActividad>
  );
}

export default Emparejar;
