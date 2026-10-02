import { useCallback, useEffect, useRef, useState } from 'react';

// Carga datos del servidor para una pantalla del panel.
//   pedir: () => Promise<{ok, status, datos, error}> (services/admin.js)
//   clave: texto que cambia cuando hay que volver a pedir (filtros, id, token…)
// Mientras recarga se conservan los datos anteriores (cargando=true), así la
// tabla no parpadea al cambiar de página o al pulsar «Actualizar».
export function useDatosAdmin(pedir, clave) {
  const [estado, setEstado] = useState({ clave: null, respuesta: null });
  const [intento, setIntento] = useState(0);
  const pedirActual = useRef(pedir);
  const claveCompleta = `${clave}#${intento}`;

  useEffect(() => {
    pedirActual.current = pedir;
  });

  useEffect(() => {
    let activo = true;
    pedirActual.current().then((respuesta) => {
      if (activo) setEstado({ clave: claveCompleta, respuesta });
    });
    return () => {
      activo = false;
    };
  }, [claveCompleta]);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  // Cambia los datos en memoria tras una acción (sin volver a pedir todo).
  const modificar = useCallback((cambiar) => {
    setEstado((actual) =>
      actual.respuesta?.ok ? { ...actual, respuesta: { ...actual.respuesta, datos: cambiar(actual.respuesta.datos) } } : actual,
    );
  }, []);

  const respuesta = estado.respuesta;
  return {
    cargando: estado.clave !== claveCompleta,
    respuesta,
    datos: respuesta?.ok ? respuesta.datos : null,
    recargar,
    modificar,
  };
}

// Valor que cambia solo cuando dejó de cambiar `espera` ms (búsqueda al escribir).
export function useRetardado(valor, espera = 350) {
  const [retardado, setRetardado] = useState(valor);
  useEffect(() => {
    const temporizador = setTimeout(() => setRetardado(valor), espera);
    return () => clearTimeout(temporizador);
  }, [valor, espera]);
  return retardado;
}
