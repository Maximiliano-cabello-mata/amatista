import { useMemo, useRef, useState } from 'react';
import { TextoEnLinea } from '../Markdown';
import { useActividad } from './hooks';
import { partesPlantilla, respuestaCorrecta } from './logica';
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, MarcoActividad, Retroalimentacion } from './Marco';

function estiloHueco(marca) {
  if (marca === true) return 'border-emerald-400 bg-emerald-400/10 text-emerald-200';
  if (marca === false) return 'border-blender bg-blender/10 text-white';
  return 'border-amatista-claro/60 bg-white/5 text-white focus:border-neon';
}

// Completar huecos: los [[respuesta|alternativa]] de la plantilla se vuelven
// campos de texto. Con `code` el texto se muestra como código.
function Completar({ bloque, alCompletar, resuelta }) {
  const partes = useMemo(() => partesPlantilla(bloque.template), [bloque.template]);
  const huecos = useMemo(() => partes.filter((parte) => parte.tipo === 'hueco'), [partes]);
  const [valores, setValores] = useState(() => huecos.map(() => ''));
  const [marcas, setMarcas] = useState(() => huecos.map(() => null));
  const [fallos, setFallos] = useState(0);
  const { resultado, resolver } = useActividad(alCompletar);
  const campos = useRef([]);

  const escribir = (indice, valor) => {
    setValores(valores.map((anterior, i) => (i === indice ? valor : anterior)));
    setMarcas(marcas.map((marca, i) => (i === indice ? null : marca)));
  };

  const comprobar = (evento) => {
    evento.preventDefault();
    if (resultado) return;
    const nuevas = huecos.map((hueco, i) => respuestaCorrecta(valores[i], hueco.respuestas));
    setMarcas(nuevas);
    if (nuevas.every(Boolean)) {
      resolver(true, fallos + 1);
    } else {
      setFallos(fallos + 1);
      campos.current[nuevas.indexOf(false)]?.focus();
    }
  };

  const verSolucion = () => {
    setValores(huecos.map((hueco) => hueco.respuestas[0] ?? ''));
    setMarcas(huecos.map(() => true));
    resolver(false, fallos);
  };

  const vacios = valores.filter((valor) => !valor.trim()).length;
  const bien = marcas.filter((marca) => marca === true).length;
  let retro = null;
  if (resultado?.correcto) {
    retro = {
      tipo: 'bien',
      texto: fallos === 0 ? '¡Todo correcto a la primera!' : '¡Todos los huecos están bien!',
      explicacion: bloque.explanation,
    };
  } else if (resultado) {
    retro = { tipo: 'solucion', texto: 'Estas son las respuestas.', explicacion: bloque.explanation };
  } else if (marcas.some((marca) => marca === false)) {
    retro = {
      tipo: 'mal',
      clave: fallos,
      texto: `${bien} de ${huecos.length} correctos. Corrige los marcados en naranja (no importan mayúsculas ni espacios).`,
    };
  }

  const contenido = partes.map((parte, i) => {
    if (parte.tipo === 'texto') {
      return bloque.code ? <span key={i}>{parte.texto}</span> : <TextoEnLinea key={i} texto={parte.texto} />;
    }
    const n = parte.indice;
    const ancho = Math.max(3, ...parte.respuestas.map((respuesta) => respuesta.length)) + 2;
    return (
      <input
        key={i}
        ref={(nodo) => {
          campos.current[n] = nodo;
        }}
        value={valores[n]}
        onChange={(evento) => escribir(n, evento.target.value)}
        readOnly={Boolean(resultado)}
        aria-label={`Hueco ${n + 1} de ${huecos.length}`}
        aria-invalid={marcas[n] === false}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        style={{ width: `${ancho}ch` }}
        className={`mx-0.5 inline-block max-w-full border-b-2 px-1 py-0.5 text-center align-baseline transition-colors ${
          bloque.code ? 'font-mono text-sm' : 'font-semibold'
        } ${estiloHueco(marcas[n])}`}
      />
    );
  });

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.prompt} resultado={resultado} resuelta={resuelta}>
      <form onSubmit={comprobar} noValidate>
        {bloque.code ? (
          <pre className="corte-poly-sm overflow-x-auto border border-white/10 bg-[#0d0b12] p-4 font-mono text-sm leading-[2.6] whitespace-pre-wrap text-texto/85">
            <code>{contenido}</code>
          </pre>
        ) : (
          <p className="text-lg leading-[2.4] whitespace-pre-line text-texto/85">{contenido}</p>
        )}

        <Retroalimentacion retro={retro} />

        {!resultado && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={vacios === huecos.length} className={BOTON_PRINCIPAL}>
              Comprobar
            </button>
            {fallos > 0 && (
              <button type="button" onClick={verSolucion} className={BOTON_SECUNDARIO}>
                Ver solución
              </button>
            )}
            <span className="font-mono text-xs text-white/45">Pulsa Enter para comprobar</span>
          </div>
        )}
      </form>
    </MarcoActividad>
  );
}

export default Completar;
