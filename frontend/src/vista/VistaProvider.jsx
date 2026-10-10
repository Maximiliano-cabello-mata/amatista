import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../auth/contexto';
import { ContextoVista } from './contexto';
import { calcularVista, CLAVE_VISTA, normalizarModo } from './reglas';

// La vista se recuerda en este navegador (es una preferencia de pantalla,
// no un permiso). Sin almacenamiento disponible, empieza en «admin».
function leerModo() {
  try {
    return window.localStorage.getItem(CLAVE_VISTA);
  } catch {
    return null;
  }
}

function VistaProvider({ children }) {
  const { esProfesor } = useAuth();
  const [modoGuardado, setModoGuardado] = useState(leerModo);

  const cambiarModo = useCallback((modo) => {
    const nuevo = normalizarModo(modo);
    setModoGuardado(nuevo);
    try {
      window.localStorage.setItem(CLAVE_VISTA, nuevo);
    } catch {
      // Sin almacenamiento: la vista dura mientras la pestaña esté abierta.
    }
  }, []);

  const valor = useMemo(
    () => ({ ...calcularVista(esProfesor, modoGuardado), cambiarModo }),
    [esProfesor, modoGuardado, cambiarModo],
  );
  return <ContextoVista.Provider value={valor}>{children}</ContextoVista.Provider>;
}

export default VistaProvider;
