import { useEffect } from 'react';

/**
 * Cierra un menú o diálogo con Escape o con un clic fuera del elemento referenciado.
 */
export function useCerrarFuera(abierto, cerrar, ref) {
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (evento) => {
      if (evento.key === 'Escape') cerrar(true);
    };
    const alPulsar = (evento) => {
      if (ref.current && !ref.current.contains(evento.target)) cerrar(false);
    };
    document.addEventListener('keydown', alTeclear);
    document.addEventListener('pointerdown', alPulsar);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.removeEventListener('pointerdown', alPulsar);
    };
  }, [abierto, cerrar, ref]);
}
