import { useEffect, useState } from 'react';
import { decidirAhorro, escucharRed, esRedLenta, senalesRed } from '../lib/red';

// Estado de la red para la interfaz: {ahorro, lenta, preferencia, ahorroSistema, tipoRed}.
function leer() {
  const senales = senalesRed();
  return { ...senales, ahorro: decidirAhorro(senales), lenta: esRedLenta(senales.tipoRed) };
}

export function useRed() {
  const [red, setRed] = useState(leer);
  useEffect(() => escucharRed(() => setRed(leer())), []);
  return red;
}
