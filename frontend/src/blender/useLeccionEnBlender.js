// Motor 6.1: mientras la lección está a la vista, Blender sabe cuál es (orden «leccion»).
// Sin sesión no se manda nada; un servidor viejo responde 400/422 y no pasa nada.
import { useEffect } from 'react';
import { ordenarLeccion } from '../services/blender';
import { REPETIR_MS } from './leccion';

export function useLeccionEnBlender(token, datos) {
  const clave = datos ? JSON.stringify(datos) : '';
  useEffect(() => {
    if (!token || !clave) return undefined;
    const cuerpo = JSON.parse(clave);
    const avisar = () => {
      if (document.visibilityState === 'visible') ordenarLeccion(token, cuerpo).catch(() => {});
    };
    avisar();
    const intervalo = window.setInterval(avisar, REPETIR_MS);
    document.addEventListener('visibilitychange', avisar);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', avisar);
    };
  }, [token, clave]);
}
