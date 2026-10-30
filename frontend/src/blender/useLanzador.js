// Arrancar Blender desde la plataforma (services/lanzador.js) y saber si se abrió: después del
// enlace amatista:// se pregunta por el enlace en vivo hasta ver un Blender en línea.
import { useCallback, useEffect, useRef, useState } from 'react';
import { estadoEnlace } from '../services/blender';
import { abrirEnlace, urlBlender } from '../services/lanzador';

export const LANZADOR = { cada: 3000, paciencia: 25000, hasta: 120000 };

// quieto · lanzando (esperando a Blender) · abierto · sin_respuesta (pasó la paciencia y sigue esperando)
export function useLanzadorBlender(token, { alAbrirse } = {}) {
  const [estado, setEstado] = useState('quieto');
  const temporizador = useRef(null);
  const inicio = useRef(0);
  const alAbrirseRef = useRef(alAbrirse);
  useEffect(() => {
    alAbrirseRef.current = alAbrirse;
  });

  const parar = useCallback(() => clearTimeout(temporizador.current), []);
  useEffect(() => parar, [parar]);

  // La espera se vuelve a programar sola: vive en un ref para no depender de sí misma.
  const esperar = useRef(() => {});
  useEffect(() => {
    esperar.current = async () => {
      const r = await estadoEnlace(token);
      if (r.ok && r.datos?.en_linea) {
        setEstado('abierto');
        alAbrirseRef.current?.();
        temporizador.current = setTimeout(() => setEstado('quieto'), 8000);
        return;
      }
      const pasado = Date.now() - inicio.current;
      if (pasado > LANZADOR.hasta) return;
      if (pasado > LANZADOR.paciencia) setEstado('sin_respuesta');
      temporizador.current = setTimeout(() => esperar.current(), LANZADOR.cada);
    };
  }, [token]);

  const lanzar = useCallback(
    (tipo, datos = {}) => {
      parar();
      abrirEnlace(urlBlender(tipo, datos));
      inicio.current = Date.now();
      setEstado('lanzando');
      if (token) temporizador.current = setTimeout(() => esperar.current(), LANZADOR.cada);
    },
    [parar, token],
  );

  const cerrar = useCallback(() => {
    parar();
    setEstado('quieto');
  }, [parar]);

  return { estado, lanzar, cerrar };
}
