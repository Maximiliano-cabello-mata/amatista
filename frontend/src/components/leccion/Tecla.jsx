// Teclas dibujadas como en el teclado (v3.1): las usan «Paso a paso» y
// «Atajos de teclado», y el mismo estilo tiene la guía del add-on en Blender.
const NOMBRES = { clic: 'Clic', enter: 'Enter', shift: 'Shift', ctrl: 'Ctrl', alt: 'Alt', tab: 'Tab', esc: 'Esc' };

export function Tecla({ children }) {
  const texto = NOMBRES[String(children).toLowerCase()] ?? children;
  return (
    <kbd className="inline-grid min-w-[1.9rem] place-items-center rounded-[3px] border border-white/25 border-b-[3px] bg-white/10 px-1.5 py-0.5 font-mono text-xs font-bold text-white shadow-sm">
      {texto}
    </kbd>
  );
}

function Combinacion({ lista }) {
  return lista.map((tecla, i) => (
    <span key={`${tecla}-${i}`} className="inline-flex items-center gap-1">
      {i > 0 && <span className="text-xs text-white/40">+</span>}
      <Tecla>{tecla}</Tecla>
    </span>
  ));
}

// [Shift] + [D]  y, con `luego`, la tecla que va después: [S] › [Z].
export function Teclas({ lista = [], luego = [], className = '' }) {
  if (!lista.length) return null;
  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      <Combinacion lista={lista} />
      {luego.length > 0 && (
        <>
          <span className="px-0.5 text-xs text-white/40" aria-label="y luego">
            ›
          </span>
          <Combinacion lista={luego} />
        </>
      )}
    </span>
  );
}
