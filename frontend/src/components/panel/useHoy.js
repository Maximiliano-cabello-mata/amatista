import { useEffect, useState } from 'react';
import { fechaLocal } from '../../progreso/reglas';

// Fecha local de hoy ("YYYY-MM-DD") que cambia sola a medianoche y al volver
// a la pestaña (los temporizadores se pausan si el equipo se suspende).
export function useHoy() {
  const [hoy, setHoy] = useState(() => fechaLocal());

  useEffect(() => {
    const ahora = new Date();
    const manana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
    const temporizador = setTimeout(() => setHoy(fechaLocal()), manana.getTime() - ahora.getTime() + 1000);
    const alVolver = () => {
      if (document.visibilityState === 'visible') setHoy(fechaLocal());
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      clearTimeout(temporizador);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [hoy]);

  return hoy;
}
