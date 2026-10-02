import { useEffect, useState } from 'react';

// Estado común de una actividad: se resuelve una sola vez y avisa a la lección
// con alCompletar({correcto, intentos}). `correcto` es false si se vio la solución.
export function useActividad(alCompletar) {
  const [resultado, setResultado] = useState(null);

  const resolver = (correcto, intentos) => {
    if (resultado) return;
    const final = { correcto: Boolean(correcto), intentos: Math.max(1, intentos) };
    setResultado(final);
    alCompletar?.(final);
  };

  return { resultado, resolver };
}

// Carga un módulo pesado (A-Frame) solo cuando `activo` es true. Si falla
// (sin conexión y sin caché) devuelve error en vez de romper la lección.
// `cargar` debe ser estable: una función definida fuera del componente.
export function useModuloDiferido(cargar, activo) {
  const [estado, setEstado] = useState({ Componente: null, error: false });

  useEffect(() => {
    if (!activo || estado.Componente || estado.error) return;
    let vigente = true;
    cargar()
      .then((modulo) => vigente && setEstado({ Componente: modulo.default, error: false }))
      .catch(() => vigente && setEstado({ Componente: null, error: true }));
    return () => {
      vigente = false;
    };
  }, [cargar, activo, estado.Componente, estado.error]);

  return estado;
}
