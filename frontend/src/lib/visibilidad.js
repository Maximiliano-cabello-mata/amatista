// Observa el contenedor estable, nunca la figura que se desplaza dentro de él.
export function observarVisibilidad(nodo, cambiar) {
  let visible = !('IntersectionObserver' in window);
  let anterior;
  const actualizar = () => {
    const activa = visible && !document.hidden;
    if (activa === anterior) return;
    anterior = activa;
    cambiar(activa);
  };
  const observador = window.IntersectionObserver && new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
    actualizar();
  });
  observador?.observe(nodo);
  document.addEventListener('visibilitychange', actualizar);
  actualizar();
  return () => {
    observador?.disconnect();
    document.removeEventListener('visibilitychange', actualizar);
  };
}

// Un observador compartido para los escenarios y adornos de toda la plataforma.
export function iniciarPausaDecorativa() {
  const selector = 'svg, .escenario, .personaje, .paseo, .mundo-tema, .emblema-heroe, .pie-pagina, .encabezado-faceta, .fondo-pesado, .barra, .titulo-seccion, .tecla-chip, .imagen-ligera, .camino__paso, .recorrido-vivo';
  const nodos = new Set();
  const observador = window.IntersectionObserver && new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      entrada.target.toggleAttribute('data-animacion-pausada', !entrada.isIntersecting);
    }
  }, { rootMargin: '80px' });
  const agregar = (raiz) => {
    if (!(raiz instanceof Element)) return;
    const candidatos = [...raiz.querySelectorAll(selector)];
    if (raiz.matches(selector)) candidatos.push(raiz);
    for (const nodo of candidatos) {
      if (nodos.has(nodo)) continue;
      nodos.add(nodo);
      observador?.observe(nodo);
    }
  };
  const cambios = new MutationObserver((registros) => {
    for (const registro of registros) registro.addedNodes.forEach(agregar);
    // Los contadores y relojes actualizan texto con frecuencia. Solo limpiar
    // referencias cuando se hayan retirado elementos, por ejemplo al navegar.
    if (!registros.some((registro) => [...registro.removedNodes].some((nodo) => nodo instanceof Element))) return;
    for (const nodo of nodos) {
      if (nodo.isConnected) continue;
      observador?.unobserve(nodo);
      nodos.delete(nodo);
    }
  });
  const actualizar = () => document.documentElement.toggleAttribute('data-pagina-oculta', document.hidden);
  agregar(document.body);
  cambios.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('visibilitychange', actualizar);
  actualizar();
  return () => {
    cambios.disconnect();
    observador?.disconnect();
    document.removeEventListener('visibilitychange', actualizar);
    document.documentElement.removeAttribute('data-pagina-oculta');
    for (const nodo of nodos) nodo.removeAttribute('data-animacion-pausada');
  };
}
