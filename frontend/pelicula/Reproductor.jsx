// Reproduce la película en tiempo real (vista previa) o espera a que el renderizador fije t.
import { useEffect, useState } from 'react';
import Pelicula from './Pelicula.jsx';
import { DURACION } from './linea.js';
import { reloj } from './reloj.js';


export default function Reproductor({ inicial = 0, automatico = true }) {
  const [t, setT] = useState(inicial);
  useEffect(() => {
    reloj.fijar = setT;
    if (!automatico) return undefined;
    const inicio = performance.now() - inicial * 1000;
    let pedido = requestAnimationFrame(function paso(ahora) {
      setT(((ahora - inicio) / 1000) % DURACION);
      pedido = requestAnimationFrame(paso);
    });
    return () => cancelAnimationFrame(pedido);
  }, [inicial, automatico]);
  return <Pelicula t={t} />;
}
