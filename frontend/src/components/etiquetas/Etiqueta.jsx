import { TONOS } from './catalogo';

// Etiqueta (chip) con el corte diagonal de la identidad low poly.
// tamano: "sm" (listas) o "md" (encabezados).
function Etiqueta({ texto, Icono, tono = 'gris', tamano = 'sm', className = '', titulo }) {
  const medidas =
    tamano === 'md' ? 'gap-1.5 px-2.5 py-1 text-[11px]' : 'gap-1 px-2 py-0.5 text-[10px]';
  return (
    <span
      title={titulo}
      className={`corte-poly-sm inline-flex shrink-0 items-center font-mono font-bold uppercase tracking-widest ring-1 ring-inset ${medidas} ${TONOS[tono] ?? TONOS.gris} ${className}`}
    >
      {Icono && <Icono className={tamano === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3'} />}
      {texto}
    </span>
  );
}

// Fila de etiquetas ({texto, Icono, tono, clave}).
export function Etiquetas({ lista = [], tamano = 'sm', className = '' }) {
  if (!lista.length) return null;
  return (
    <span className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {lista.map((etiqueta) => (
        <Etiqueta key={etiqueta.clave ?? etiqueta.texto} {...etiqueta} tamano={tamano} />
      ))}
    </span>
  );
}

export default Etiqueta;
