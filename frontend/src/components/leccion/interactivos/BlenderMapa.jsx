// «La ventana de Blender» (bloque «blender_mapa», motor 6.1): el mapa de Blender para quien lo
// abre por primera vez. Dos modos:
//  - "explore": tocar cada zona y leer qué es, para qué sirve y qué herramientas viven ahí. Se
//    resuelve al visitar todas (o las de "zones").
//  - "find": una serie de preguntas «¿dónde…?»; el error explica lo que tocó y al segundo fallo
//    muestra el lugar. Es perfecta si acertó todo a la primera.
// Bloque: {"type": "blender_mapa", "id", "title"?, "text"?, "mode", "zones"?, "questions"?}.
import { useState } from 'react';
import { ZONAS, enunciado, fichasDeZona, partesTecla, revisarZona, zona } from '../fichas';
import MapaBlender from '../MapaBlender';
import { TextoEnLinea } from '../Markdown';
import { Teclas } from '../Tecla';
import { useActividad } from './hooks';
import { BOTON_PRINCIPAL, MarcoActividad, Retroalimentacion } from './Marco';

function Explorar({ bloque, resultado, resolver }) {
  const objetivo = bloque.zones?.length ? bloque.zones : ZONAS.map((z) => z.id);
  const [visitadas, setVisitadas] = useState([]);
  const [actual, setActual] = useState(null);
  const z = actual ? zona(actual) : null;
  const faltan = objetivo.filter((id) => !visitadas.includes(id)).length;

  const tocar = (id) => {
    setActual(id);
    if (visitadas.includes(id)) return;
    const nuevas = [...visitadas, id];
    setVisitadas(nuevas);
    if (!resultado && objetivo.every((o) => nuevas.includes(o))) resolver(true, 1);
  };

  const marcas = Object.fromEntries(visitadas.map((id) => [id, 'visitada']));
  if (actual) marcas[actual] = 'brilla';

  return (
    <>
      <MapaBlender marcas={marcas} alTocar={tocar} etiqueta="Ventana de Blender: toca cada zona" />
      <p className="mt-2 text-sm text-texto/65" aria-live="polite">
        {faltan ? `Te falta${faltan === 1 ? '' : 'n'} ${faltan} zona${faltan === 1 ? '' : 's'} por conocer.` : 'Ya conoces toda la ventana de Blender.'}
      </p>
      {z && (
        <div key={z.id} className="corte-poly-sm animar-entrar mt-4 border-l-4 border-neon/60 bg-neon/5 p-4">
          <p className="text-lg font-bold text-white">
            {z.nombre} <span className="text-sm font-normal text-white/50">· en inglés: {z.ingles}</span>
          </p>
          <p className="mt-1 leading-relaxed text-texto/90">{z.que_es}</p>
          <p className="mt-2 leading-relaxed text-amatista-claro">
            <strong>Para qué:</strong> {z.para_que}
          </p>
          {fichasDeZona(z.id).length > 0 && (
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {fichasDeZona(z.id).map((f) => (
                <li key={f.id} className="text-sm text-texto/85">
                  <span className="font-semibold text-white">{f.nombre}</span>
                  {f.teclas?.[0] && (
                    <span className="ml-2 inline-flex">
                      <Teclas lista={partesTecla(f.teclas[0])} />
                    </span>
                  )}
                  <span className="block text-texto/65">{f.para_que}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}

function Buscar({ bloque, resultado, resolver }) {
  const preguntas = bloque.questions ?? [];
  const [indice, setIndice] = useState(0);
  const [fallos, setFallos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [marcas, setMarcas] = useState({});
  const [retro, setRetro] = useState(null);
  const [esperando, setEsperando] = useState(false);
  const pregunta = preguntas[indice];
  const terminado = indice >= preguntas.length;

  const tocar = (id) => {
    if (esperando || terminado) return;
    const r = revisarZona(pregunta, id, fallos);
    const z = zona(r.esperada);
    if (r.correcto || r.revelar) {
      setMarcas(r.correcto ? { [id]: 'acierto' } : { [id]: 'fallo', [r.esperada]: 'brilla' });
      setRetro(
        r.correcto
          ? { tipo: 'bien', titulo: '¡Ahí es!', texto: z ? `${z.nombre}: ${z.para_que}` : '', clave: `b${indice}` }
          : { tipo: 'solucion', titulo: 'Era aquí', texto: z ? `${z.nombre}: ${z.que_es}` : '', clave: `s${indice}` },
      );
      if (!r.correcto) setErrores((e) => e + 1);
      setEsperando(true);
      return;
    }
    setFallos(fallos + 1);
    setMarcas({ [id]: 'fallo' });
    setRetro({ tipo: 'mal', texto: `${r.explicacion} Prueba otra vez.`, clave: `m${indice}-${fallos}` });
  };

  const siguiente = () => {
    const proxima = indice + 1;
    setIndice(proxima);
    setFallos(0);
    setMarcas({});
    setRetro(null);
    setEsperando(false);
    if (proxima >= preguntas.length && !resultado) resolver(errores === 0, errores === 0 ? 1 : 2);
  };

  return (
    <>
      {!terminado ? (
        <p className="mb-3 text-lg font-semibold text-white" aria-live="polite">
          <span className="mr-2 font-mono text-sm text-neon">
            {indice + 1}/{preguntas.length}
          </span>
          {enunciado(pregunta)}
        </p>
      ) : (
        <p className="mb-3 text-lg font-semibold text-emerald-300">
          {errores === 0 ? '¡Todo a la primera! Ya te mueves por Blender.' : 'Listo. Ya sabes dónde está cada cosa: en Blender se ven igual.'}
        </p>
      )}
      <MapaBlender marcas={marcas} alTocar={!terminado && !esperando ? tocar : undefined} etiqueta="Ventana de Blender: toca la respuesta" />
      <Retroalimentacion retro={retro} />
      {esperando && (
        <div className="mt-4">
          <button type="button" onClick={siguiente} className={BOTON_PRINCIPAL}>
            {indice + 1 < preguntas.length ? 'Siguiente pregunta' : 'Terminar'}
          </button>
        </div>
      )}
    </>
  );
}

function BlenderMapa({ bloque, alCompletar, resuelta }) {
  const { resultado, resolver } = useActividad(alCompletar);
  const buscar = bloque.mode === 'find';
  return (
    <MarcoActividad
      bloque={bloque}
      titulo={bloque.title ?? (buscar ? '¿Dónde está cada cosa?' : 'Conoce la ventana de Blender')}
      resultado={resultado}
      resuelta={resuelta}
    >
      {bloque.text && (
        <p className="mb-4 leading-relaxed text-texto/85">
          <TextoEnLinea texto={bloque.text} />
        </p>
      )}
      {!bloque.text && !buscar && (
        <p className="mb-4 leading-relaxed text-texto/85">
          Esta es la ventana de Blender dibujada en bloques. Toca cada parte para saber qué es: cuando abras Blender, todo estará en el mismo lugar.
        </p>
      )}
      {buscar ? <Buscar bloque={bloque} resultado={resultado} resolver={resolver} /> : <Explorar bloque={bloque} resultado={resultado} resolver={resolver} />}
    </MarcoActividad>
  );
}

export default BlenderMapa;
