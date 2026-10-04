// Modo ligero (v3.2): en equipos modestos la página se ve igual pero sin
// animaciones continuas, destellos ni el fondo facetado. Función pura para
// probarla; main.jsx la aplica al arrancar con los datos del navegador.
export function esEquipoLigero({ memoria, nucleos, ahorroDatos, movimientoReducido } = {}) {
  if (ahorroDatos || movimientoReducido) return true;
  if (typeof memoria === 'number' && memoria <= 2) return true;
  if (typeof nucleos === 'number' && nucleos <= 2) return true;
  return false;
}

export function aplicarModoLigero(ventana = window) {
  const nav = ventana.navigator ?? {};
  const ligero = esEquipoLigero({
    memoria: nav.deviceMemory,
    nucleos: nav.hardwareConcurrency,
    ahorroDatos: Boolean(nav.connection?.saveData),
    movimientoReducido: Boolean(ventana.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
  });
  ventana.document.documentElement.classList.toggle('ligero', ligero);
  return ligero;
}
