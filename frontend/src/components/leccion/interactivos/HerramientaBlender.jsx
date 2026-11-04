// «Conoce la herramienta» (bloque «herramienta_blender», motor 6.1): la ficha de una herramienta
// de Blender explicada como a alguien que nunca la vio. Es la misma ficha que Blender muestra en
// la vista 3D cuando la práctica la estrena, con la misma zona brillando: teoría y práctica hablan
// igual. Enseña para qué sirve, a qué se parece, dónde está y cómo se usa, sin resolver la práctica.
// Bloque: {"type": "herramienta_blender", "id", "tool", "title"?, "text"?, "check"?: false}.
// Por defecto el alumno la ubica en el esquema de Blender («¿Dónde está?»); con "check": false se
// resuelve al leer cómo se usa.
import { useState } from 'react';
import { ficha, partesTecla, revisarZona, zona } from '../fichas';
import MapaBlender from '../MapaBlender';
import { TextoEnLinea } from '../Markdown';
import { Teclas } from '../Tecla';
import { useActividad } from './hooks';
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';

function Seccion({ titulo, children }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[11px] font-bold uppercase tracking-widest text-neon">{titulo}</p>
      {children}
    </div>
  );
}

function HerramientaBlender({ bloque, alCompletar, resuelta }) {
  const { resultado, resolver } = useActividad(alCompletar);
  const f = ficha(bloque.tool);
  const [abierta, setAbierta] = useState(false);
  const [fallos, setFallos] = useState(0);
  const [retro, setRetro] = useState(null);
  const [marcas, setMarcas] = useState({});
  const conPregunta = bloque.check !== false;
  const ubicada = Boolean(resultado) || (!conPregunta && abierta);

  if (!f) return null;
  const z = zona(f.zona);

  const tocar = (id) => {
    if (resultado) return;
    const r = revisarZona({ tool: f.id }, id, fallos);
    if (r.correcto) {
      setMarcas({ [id]: 'acierto' });
      setRetro({ tipo: 'bien', titulo: '¡Ahí está!', texto: f.donde, clave: 'bien' });
      resolver(true, fallos + 1);
      return;
    }
    setFallos(fallos + 1);
    if (r.revelar) {
      setMarcas({ [id]: 'fallo', [r.esperada]: 'brilla' });
      setRetro({ tipo: 'solucion', titulo: 'Está aquí', texto: `${f.donde} ${r.explicacion}`, clave: 'solucion' });
      resolver(false, fallos + 1);
    } else {
      setMarcas({ [id]: 'fallo' });
      setRetro({ tipo: 'mal', texto: `${r.explicacion} Busca otra vez: piensa en para qué sirve «${f.nombre}».`, clave: `mal-${fallos}` });
    }
  };

  const verComo = () => {
    setAbierta(true);
    if (!conPregunta) resolver(true, 1);
  };

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.title ?? `Conoce: ${f.nombre}`} resultado={resultado} resuelta={resuelta}>
      {bloque.text && (
        <p className="mb-4 leading-relaxed text-texto/85">
          <TextoEnLinea texto={bloque.text} />
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,22rem)]">
        <div className="grid content-start gap-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-2xl font-bold text-white">{f.nombre}</p>
            {f.teclas?.length > 0 && (
              <span className="flex flex-wrap items-center gap-2">
                {f.teclas.map((t) => (
                  <Teclas key={t} lista={partesTecla(t)} />
                ))}
              </span>
            )}
            {f.ingles && <span className="text-sm text-white/50">En Blender (inglés): {f.ingles}</span>}
          </div>
          <Seccion titulo="Para qué sirve">
            <p className="text-lg leading-relaxed text-texto/95">{f.para_que}</p>
          </Seccion>
          {f.analogia && (
            <Seccion titulo="Piénsalo así">
              <p className="leading-relaxed text-amatista-claro">{f.analogia}</p>
            </Seccion>
          )}
          {f.cuando && (
            <Seccion titulo="Cuándo la usas">
              <p className="leading-relaxed text-texto/85">{f.cuando}</p>
            </Seccion>
          )}
        </div>
        <div className="grid content-start gap-2">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-neon">
            {conPregunta && !resultado ? '¿Dónde está? Tócala en Blender' : 'Dónde está'}
          </p>
          <MapaBlender
            compacto
            marcas={conPregunta && !resultado ? marcas : { ...marcas, [f.zona]: marcas[f.zona] ?? 'brilla' }}
            alTocar={conPregunta && !resultado ? tocar : undefined}
            etiqueta={`Ventana de Blender: ¿dónde está ${f.nombre}?`}
          />
          {(!conPregunta || resultado) && z && <p className="text-sm text-texto/75">{f.donde}</p>}
        </div>
      </div>
      <Retroalimentacion retro={retro} />
      {abierta ? (
        <div className="mt-5 grid gap-4 border-t border-white/10 pt-5">
          <Seccion titulo="Cómo se usa, paso a paso">
            <ol className="grid gap-2">
              {f.como.map((paso, i) => (
                <li key={i} className="flex gap-3">
                  <span className="hexagono grid h-7 w-8 shrink-0 place-items-center bg-amatista/30 font-mono text-sm font-bold text-white">{i + 1}</span>
                  <span className="pt-0.5 leading-relaxed text-texto/90">{paso}</span>
                </li>
              ))}
            </ol>
          </Seccion>
          {f.error && (
            <div className="corte-poly-sm border-l-4 border-orange-300/70 bg-orange-300/10 p-3">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-orange-200">El error de todos al empezar</p>
              <p className="mt-1 text-texto/90">{f.error}</p>
            </div>
          )}
          <p className="text-sm text-texto/65">
            Cuando la práctica la estrene, Blender te mostrará esta misma ficha y hará brillar el lugar. Si la tocas por curiosidad antes, también te la explica.
          </p>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={verComo} disabled={conPregunta && !ubicada} className={conPregunta && !ubicada ? BOTON_SECUNDARIO : BOTON_PRINCIPAL}>
            ¿Cómo se usa?
          </button>
          {conPregunta && !ubicada && <span className="self-center text-sm text-texto/60">Primero encuéntrala en el esquema.</span>}
        </div>
      )}
    </MarcoActividad>
  );
}

export default HerramientaBlender;
