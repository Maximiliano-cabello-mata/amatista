// Cada tarjeta a su grupo (bloque «classify»): el alumno elige el grupo de cada tarjeta y
// comprueba. Las mal puestas se sacuden y vuelven a quedar libres; las buenas se quedan.
// Bloque: {"type": "classify", "id", "question", "groups": [{id, label}], "items": [{text, group}], "explanation"?}.
import { useMemo, useState } from 'react';
import { TextoEnLinea } from '../Markdown';
import { quitarErrores, revisarClasificacion } from '../recursos';
import { useActividad } from './hooks';
import { mezclar, semillaDe } from './logica';
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';

// Un color por grupo (hasta 4): el grupo elegido pinta la tarjeta.
const COLORES = [
  { chip: 'border-neon/60 bg-neon/15 text-white', borde: 'border-l-neon' },
  { chip: 'border-blender/60 bg-blender/15 text-white', borde: 'border-l-blender' },
  { chip: 'border-amatista-claro/60 bg-amatista/20 text-white', borde: 'border-l-amatista-claro' },
  { chip: 'border-emerald-300/60 bg-emerald-400/15 text-white', borde: 'border-l-emerald-300' },
];

function Clasificar({ bloque, alCompletar, resuelta }) {
  const { resultado, resolver } = useActividad(alCompletar);
  const grupos = bloque.groups ?? [];
  const items = bloque.items ?? [];
  const cuantos = items.length;
  const orden = useMemo(() => mezclar([...Array(cuantos).keys()], semillaDe(bloque.id ?? bloque.question)), [cuantos, bloque.id, bloque.question]);
  const [asignadas, setAsignadas] = useState({});
  const [intentos, setIntentos] = useState(0);
  const [errores, setErrores] = useState([]);
  const [solucion, setSolucion] = useState(false);

  const colorDe = (grupoId) => COLORES[Math.max(0, grupos.findIndex((g) => g.id === grupoId)) % COLORES.length];
  const revision = revisarClasificacion(items, asignadas);
  const todas = revision.faltan.length === 0;

  const asignar = (i, grupoId) => {
    if (resultado) return;
    setErrores((e) => e.filter((x) => x !== i));
    setAsignadas((a) => ({ ...a, [i]: grupoId }));
  };

  const comprobar = () => {
    const nuevos = intentos + 1;
    setIntentos(nuevos);
    if (revision.completa) {
      resolver(true, nuevos);
      return;
    }
    setErrores(revision.mal);
    setAsignadas(quitarErrores(asignadas, revision.mal));
  };

  const verSolucion = () => {
    setSolucion(true);
    setAsignadas(Object.fromEntries(items.map((item, i) => [i, item.group])));
    setErrores([]);
    resolver(false, Math.max(1, intentos));
  };

  let retro = null;
  if (resultado?.correcto) retro = { tipo: 'bien', texto: intentos <= 1 ? '¡Todo en su lugar a la primera!' : 'Todo en su lugar.', explicacion: bloque.explanation };
  else if (solucion) retro = { tipo: 'solucion', texto: 'Cada tarjeta quedó en su grupo.', explicacion: bloque.explanation };
  else if (errores.length) {
    retro = {
      tipo: 'mal',
      clave: intentos,
      texto: `${errores.length === 1 ? 'Una tarjeta estaba' : `${errores.length} tarjetas estaban`} en otro grupo: quedaron libres para que lo intentes de nuevo.`,
    };
  }

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.question} resultado={resultado} resuelta={resuelta}>
      <div className="mb-4 flex flex-wrap gap-2" aria-hidden="true">
        {grupos.map((g) => {
          const cuantas = Object.values(asignadas).filter((x) => x === g.id).length;
          return (
            <span key={g.id} className={`corte-poly-sm border px-3 py-1 font-mono text-[11px] uppercase tracking-widest ${colorDe(g.id).chip}`}>
              {g.label} · {cuantas}
            </span>
          );
        })}
      </div>
      <ul className="grid gap-2.5">
        {orden.map((i) => {
          const item = items[i];
          const elegido = asignadas[i];
          const bien = Boolean(resultado) && elegido === item.group;
          return (
            <li
              key={i}
              className={`clasificar__tarjeta corte-poly-sm flex flex-col gap-2 border border-l-4 bg-base/60 p-3 sm:flex-row sm:items-center sm:justify-between ${
                errores.includes(i) ? 'animar-sacudir border-blender/50 border-l-blender' : elegido ? `border-white/10 ${colorDe(elegido).borde}` : 'border-white/10 border-l-white/15'
              }`}
            >
              <span className="text-texto/90">
                {bien && <span className="mr-1.5 text-emerald-300">✓</span>}
                <TextoEnLinea texto={item.text} />
              </span>
              <span className="flex shrink-0 flex-wrap gap-1.5" role="radiogroup" aria-label={`Grupo de: ${item.text}`}>
                {grupos.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    role="radio"
                    aria-checked={elegido === g.id}
                    disabled={Boolean(resultado)}
                    onClick={() => asignar(i, g.id)}
                    className={`corte-poly-sm border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors disabled:cursor-default ${
                      elegido === g.id ? colorDe(g.id).chip : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </span>
            </li>
          );
        })}
      </ul>

      <Retroalimentacion retro={retro} />

      {!resultado && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={comprobar} disabled={!todas} className={BOTON_PRINCIPAL}>
            {todas ? 'Comprobar' : `Faltan ${revision.faltan.length}`}
          </button>
          {intentos > 0 && (
            <button type="button" onClick={verSolucion} className={BOTON_SECUNDARIO}>
              Ver solución
            </button>
          )}
        </div>
      )}
    </MarcoActividad>
  );
}

export default Clasificar;
