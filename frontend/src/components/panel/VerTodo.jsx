// «Ver todos» de las listas largas de Mi panel: primero se ve lo que toca ahora y el resto se abre
// a pedido (auditoría 2026-10-11: el panel medía casi 7000 px).
function VerTodo({ abierto, ocultos, texto, alCambiar }) {
  if (!abierto && ocultos <= 0) return null;
  return (
    <button
      type="button"
      onClick={() => alCambiar(!abierto)}
      aria-expanded={abierto}
      className="mt-4 font-mono text-xs font-bold uppercase tracking-widest text-neon hover:underline"
    >
      {abierto ? '▴ Ver menos' : `▾ ${texto} (${ocultos} más)`}
    </button>
  );
}

export default VerTodo;
