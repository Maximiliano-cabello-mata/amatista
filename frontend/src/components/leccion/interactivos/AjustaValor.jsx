// «Ajusta el valor» (bloque «transform_challenge», dinámicas v4.3): un campo como el de Blender
// (N › Elemento › Ubicación, Rotación o Escala) y el cubo que tiene que llenar el molde
// translúcido. El campo dice «te falta» o «te pasaste», nunca el número: el alumno lo descubre.
// Bloque: {"type": "transform_challenge", "id", "title"?, "text"?, "property": "location" |
//          "rotation" | "scale", "axis": "X" | "Y" | "Z", "target", "tolerance"?, "min"?, "max"?,
//          "step"?, "explanation"?}. Se resuelve al comprobar dentro de la tolerancia.
import { useId, useState } from 'react';
import CuboVista from '../CuboVista';
import { campoDe, dentroDeTolerancia, pistaValor, transformacionDe } from '../dinamicas';
import { TextoEnLinea } from '../Markdown';
import { useActividad } from './hooks';
import { BOTON_PRINCIPAL, MarcoActividad, Retroalimentacion } from './Marco';

const PISTA = {
  falta: 'Te falta: sube el valor.',
  sobra: 'Te pasaste: bájalo un poco.',
  justo: '¡Justo en el molde!',
};
const COLOR_EJE = { X: 'text-[#ff3352]', Y: 'text-[#8bdc00]', Z: 'text-[#2890ff]' };

function AjustaValor({ bloque, alCompletar, resuelta }) {
  const { resultado, resolver } = useActividad(alCompletar);
  const idCampo = useId();
  const campo = campoDe(bloque);
  const eje = ['X', 'Y', 'Z'].includes(bloque.axis) ? bloque.axis : 'Z';
  const [valor, setValor] = useState(campo.inicial);
  const [intentos, setIntentos] = useState(0);
  const [pista, setPista] = useState(null);
  const meta = Number(bloque.target);

  const cambiar = (texto) => {
    const numero = Number(String(texto).replace(',', '.'));
    if (Number.isFinite(numero)) setValor(Math.min(campo.max, Math.max(campo.min, numero)));
    setPista(null);
  };

  const comprobar = () => {
    const n = intentos + 1;
    setIntentos(n);
    const p = pistaValor(valor, meta, campo.tolerancia);
    setPista(p);
    if (p === 'justo') resolver(n <= 2, n);
  };

  const listo = Boolean(resultado) || dentroDeTolerancia(valor, meta, campo.tolerancia);
  let retro = null;
  if (resultado) {
    retro = {
      tipo: 'bien',
      titulo: resultado.correcto ? '¡Al primer intento casi!' : '¡Lo encontraste!',
      texto: bloque.explanation ?? `En Blender escribirías ${meta}${campo.unidad} en ${campo.nombre} ${eje}, o arrastrarías el campo hasta ahí.`,
    };
  }

  return (
    <MarcoActividad bloque={bloque} titulo={bloque.title ?? 'Ajusta el valor'} resultado={resultado} resuelta={resuelta}>
      {bloque.text && (
        <p className="mb-4 leading-relaxed text-texto/85">
          <TextoEnLinea texto={bloque.text} />
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] [&>*]:min-w-0">
        <div className="corte-poly-sm self-start overflow-hidden border border-white/10">
          <CuboVista
            transformacion={transformacionDe(bloque.property, eje, valor)}
            molde={transformacionDe(bloque.property, eje, meta)}
            etiqueta={`El cubo con ${campo.nombre} ${eje} en ${valor}${campo.unidad}; el molde punteado marca la meta.`}
          />
        </div>
        {/* El panel imita la barra lateral de Blender (N › Elemento): etiqueta, eje de color y campo. */}
        <div className="corte-poly-sm flex flex-col gap-3 border border-white/10 bg-[#2b2b2f] p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">N › Elemento</p>
          <label htmlFor={idCampo} className="flex items-baseline justify-between gap-2 text-sm text-white/80">
            <span>
              {campo.nombre} <strong className={COLOR_EJE[eje]}>{eje}</strong>
            </span>
            <span className="font-mono text-xs text-white/45">
              {campo.min}
              {campo.unidad} … {campo.max}
              {campo.unidad}
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              id={idCampo}
              type="number"
              inputMode="decimal"
              value={valor}
              min={campo.min}
              max={campo.max}
              step={campo.paso}
              disabled={Boolean(resultado)}
              onChange={(e) => cambiar(e.target.value)}
              className="min-w-0 flex-1 rounded-sm border border-white/15 bg-[#1d1d21] px-3 py-2 text-center font-mono text-lg text-white focus:border-neon"
            />
            <span className="w-6 font-mono text-white/60">{campo.unidad}</span>
          </div>
          <input
            type="range"
            aria-label={`${campo.nombre} ${eje} (deslizador)`}
            value={valor}
            min={campo.min}
            max={campo.max}
            step={campo.paso}
            disabled={Boolean(resultado)}
            onChange={(e) => cambiar(e.target.value)}
            className="w-full accent-[#f5792a]"
          />
          {!resultado && (
            <button type="button" onClick={comprobar} className={BOTON_PRINCIPAL}>
              Comprobar
            </button>
          )}
          <p className={`min-h-[1.5rem] text-sm font-semibold ${pista === 'justo' || listo ? 'text-emerald-300' : 'text-amber-200'}`} aria-live="polite">
            {pista ? PISTA[pista] : intentos === 0 ? 'Mueve el valor hasta que el cubo llene el molde punteado.' : ''}
          </p>
        </div>
      </div>
      <Retroalimentacion retro={retro} />
    </MarcoActividad>
  );
}

export default AjustaValor;
