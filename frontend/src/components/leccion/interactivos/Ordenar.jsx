import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { TextoEnLinea } from '../Markdown';
import { useActividad } from './hooks';
import { mezclarDistinto, mover, posicionesCorrectas, semillaDe, textoPlano } from './logica';
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';

const FLECHA = 'grid h-9 w-9 place-items-center text-white/60 transition-colors hover:bg-white/10 hover:text-neon disabled:pointer-events-none disabled:opacity-20';

function IconoAsa() {
  return (
    <svg viewBox="0 0 12 20" className="h-5 w-3" fill="currentColor" aria-hidden="true">
      {[3, 10, 17].map((y) => (
        <g key={y}>
          <circle cx="3" cy={y} r="1.6" />
          <circle cx="9" cy={y} r="1.6" />
        </g>
      ))}
    </svg>
  );
}

// Ordenar pasos: se arrastran con el asa (mouse, dedo o lápiz: pointer events)
// o se mueven con las flechas ▲▼ o con las teclas arriba/abajo sobre el asa.
// El orden correcto es el del JSON; al mostrarse se baraja.
function Ordenar({ bloque, alCompletar, resuelta }) {
  const { items } = bloque;
  const idAyuda = useId();
  const porId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const [orden, setOrden] = useState(() =>
    mezclarDistinto(
      items.map((item) => item.id),
      semillaDe(bloque.id ?? items.map((item) => item.id).join()),
    ),
  );
  const [marcas, setMarcas] = useState(null);
  const [fallos, setFallos] = useState(0);
  const [arrastrado, setArrastrado] = useState(null);
  const [anuncio, setAnuncio] = useState('');
  const { resultado, resolver } = useActividad(alCompletar);
  const filas = useRef(new Map());
  // Al mover una fila, React cambia su nodo de lugar y el foco se pierde: se recupera aquí.
  const enfocar = useRef(null);

  useEffect(() => {
    if (!enfocar.current) return;
    const { id, control } = enfocar.current;
    enfocar.current = null;
    const fila = filas.current.get(id);
    const boton = fila?.querySelector(`[data-control="${control}"]:not(:disabled)`) ?? fila?.querySelector('[data-control="asa"]');
    boton?.focus();
  }, [orden]);

  // Texto plano para anuncios y aria-label (en pantalla se ve con su formato).
  const textoDe = (id) => textoPlano(porId.get(id)?.text);

  const cambiar = (desde, hasta, control) => {
    const nuevo = mover(orden, desde, hasta);
    if (nuevo === orden) return;
    if (control) {
      enfocar.current = { id: orden[desde], control };
      setAnuncio(`«${textoDe(orden[desde])}» ahora está en el lugar ${hasta + 1} de ${orden.length}.`);
    }
    setOrden(nuevo);
    setMarcas(null);
  };

  // --- Arrastrar con pointer events -------------------------------------------
  const alPresionar = (evento, id) => {
    if (resultado || (evento.pointerType === 'mouse' && evento.button !== 0)) return;
    evento.preventDefault();
    evento.currentTarget.setPointerCapture?.(evento.pointerId);
    setArrastrado(id);
  };

  const alMover = (evento) => {
    if (!arrastrado) return;
    // Nuevo lugar = cuántas de las otras filas quedan por encima del puntero.
    const y = evento.clientY;
    let destino = 0;
    for (const id of orden) {
      if (id === arrastrado) continue;
      const caja = filas.current.get(id)?.getBoundingClientRect();
      if (caja && y > caja.top + caja.height / 2) destino++;
    }
    cambiar(orden.indexOf(arrastrado), destino);
  };

  const alSoltar = () => {
    if (!arrastrado) return;
    setAnuncio(`«${textoDe(arrastrado)}» quedó en el lugar ${orden.indexOf(arrastrado) + 1} de ${orden.length}.`);
    setArrastrado(null);
  };

  const alTeclear = (evento, indice) => {
    if (resultado) return;
    if (evento.key === 'ArrowUp' && indice > 0) {
      evento.preventDefault();
      cambiar(indice, indice - 1, 'asa');
    } else if (evento.key === 'ArrowDown' && indice < orden.length - 1) {
      evento.preventDefault();
      cambiar(indice, indice + 1, 'asa');
    }
  };

  // --- Comprobar ----------------------------------------------------------------
  const comprobar = () => {
    const nuevas = posicionesCorrectas(orden, items);
    setMarcas(nuevas);
    if (nuevas.every(Boolean)) resolver(true, fallos + 1);
    else setFallos(fallos + 1);
  };

  const verSolucion = () => {
    setOrden(items.map((item) => item.id));
    setMarcas(items.map(() => true));
    resolver(false, fallos);
  };

  const enSuLugar = marcas ? marcas.filter(Boolean).length : 0;
  let retro = null;
  if (resultado?.correcto) {
    retro = {
      tipo: 'bien',
      texto: fallos === 0 ? '¡Orden perfecto a la primera!' : '¡Ahora sí! Todo está en su lugar.',
      explicacion: bloque.explanation,
    };
  } else if (resultado) {
    retro = { tipo: 'solucion', texto: 'Este es el orden correcto.', explicacion: bloque.explanation };
  } else if (marcas) {
    retro = {
      tipo: 'mal',
      clave: fallos,
      texto: `${enSuLugar} de ${orden.length} están en su lugar. Mueve los marcados con ✗ y vuelve a comprobar.`,
    };
  }

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.prompt} resultado={resultado} resuelta={resuelta}>
      <p id={idAyuda} className="mb-3 font-mono text-[11px] uppercase tracking-widest text-white/45">
        Arrastra desde el asa o usa las flechas ▲▼
      </p>
      <ol className="space-y-2" aria-describedby={idAyuda}>
        {orden.map((id, indice) => {
          const marca = marcas?.[indice];
          const texto = textoDe(id);
          const enMano = arrastrado === id;
          let borde = 'border-white/10 bg-base/60';
          if (enMano) borde = 'border-neon bg-neon/10 shadow-[0_0_24px_rgba(0,229,255,0.25)]';
          else if (marca === true) borde = 'border-emerald-400/60 bg-emerald-400/10';
          else if (marca === false) borde = 'animar-sacudir border-blender/60 bg-blender/10';
          return (
            <li
              key={id}
              ref={(nodo) => {
                if (nodo) filas.current.set(id, nodo);
                else filas.current.delete(id);
              }}
              className={`corte-poly-sm flex items-center gap-2 border py-1.5 pl-1.5 pr-2 transition-[background-color,border-color,box-shadow,transform] sm:gap-3 ${borde} ${
                enMano ? 'scale-[1.02]' : ''
              }`}
            >
              <button
                type="button"
                data-control="asa"
                disabled={Boolean(resultado)}
                onPointerDown={(evento) => alPresionar(evento, id)}
                onPointerMove={alMover}
                onPointerUp={alSoltar}
                onPointerCancel={alSoltar}
                onKeyDown={(evento) => alTeclear(evento, indice)}
                aria-label={`Mover «${texto}», lugar ${indice + 1} de ${orden.length}. Usa las flechas arriba y abajo.`}
                className={`grid h-10 w-8 shrink-0 touch-none place-items-center text-white/45 hover:text-neon disabled:cursor-default disabled:opacity-30 ${
                  enMano ? 'cursor-grabbing text-neon' : 'cursor-grab'
                }`}
              >
                <IconoAsa />
              </button>
              <span
                className={`hexagono grid h-8 w-8 shrink-0 place-items-center font-mono text-xs font-bold ${
                  marca === true ? 'bg-emerald-400 text-[#121212]' : marca === false ? 'bg-blender text-[#121212]' : 'bg-amatista/35 text-white'
                }`}
                aria-hidden="true"
              >
                {marca === true ? '✓' : marca === false ? '✗' : indice + 1}
              </span>
              <span className="min-w-0 flex-1 py-1 leading-snug text-texto select-none">
                <TextoEnLinea texto={porId.get(id)?.text ?? ''} />
                {marca === true && <span className="sr-only"> (en su lugar)</span>}
                {marca === false && <span className="sr-only"> (fuera de lugar)</span>}
              </span>
              {!resultado && (
                <span className="flex shrink-0 flex-col sm:flex-row">
                  <button
                    type="button"
                    data-control="subir"
                    onClick={() => cambiar(indice, indice - 1, 'subir')}
                    disabled={indice === 0}
                    aria-label={`Subir «${texto}»`}
                    className={FLECHA}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    data-control="bajar"
                    onClick={() => cambiar(indice, indice + 1, 'bajar')}
                    disabled={indice === orden.length - 1}
                    aria-label={`Bajar «${texto}»`}
                    className={FLECHA}
                  >
                    ▼
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {anuncio}
      </p>

      <Retroalimentacion retro={retro} />

      {!resultado && (
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={comprobar} className={BOTON_PRINCIPAL}>
            Comprobar
          </button>
          {fallos > 0 && (
            <button type="button" onClick={verSolucion} className={BOTON_SECUNDARIO}>
              Ver solución
            </button>
          )}
        </div>
      )}
    </MarcoActividad>
  );
}

export default Ordenar;
