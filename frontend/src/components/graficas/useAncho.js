import { useEffect, useState } from 'react';

// Ancho en píxeles de un elemento (se actualiza al cambiar el tamaño). Las
// gráficas se dibujan en píxeles reales para que el texto no se escale.
// ResizeObserver entrega una primera medida apenas empieza a observar.
export function useAncho(ref, inicial = 0) {
  const [ancho, setAncho] = useState(inicial);
  useEffect(() => {
    const elemento = ref.current;
    if (!elemento || typeof ResizeObserver === 'undefined') return undefined;
    const observador = new ResizeObserver(([entrada]) => {
      setAncho(Math.floor(entrada.contentRect.width));
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [ref]);
  return ancho;
}
