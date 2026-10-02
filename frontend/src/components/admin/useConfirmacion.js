import { useCallback, useRef, useState } from 'react';

// Pregunta de confirmación para acciones que cambian datos (con <Confirmacion>).
//   const confirmacion = useConfirmacion();
//   if (await confirmacion.preguntar({titulo, texto, confirmar, peligro})) …
//   <Confirmacion {...confirmacion} />
export function useConfirmacion() {
  const [pregunta, setPregunta] = useState(null);
  const resolver = useRef(null);

  const preguntar = useCallback(
    (opciones) =>
      new Promise((resolve) => {
        resolver.current?.(false);
        resolver.current = resolve;
        setPregunta(opciones);
      }),
    [],
  );

  const responder = useCallback((respuesta) => {
    resolver.current?.(respuesta);
    resolver.current = null;
    setPregunta(null);
  }, []);

  return { pregunta, preguntar, responder };
}
