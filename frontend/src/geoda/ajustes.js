// Aplicar y deshacer los ajustes de Geoda en la propia plataforma (se recuerdan en este navegador).
export const CLAVE_GEODA = 'amatista:geoda';
export const EVENTO_GEODA = 'amatista:geoda';

export function leerGeoda(almacen = globalThis.localStorage) {
  try {
    return JSON.parse(almacen?.getItem(CLAVE_GEODA) ?? 'null');
  } catch {
    return null;
  }
}

export function aplicarEnPagina(ajuste, documento = globalThis.document) {
  if (!documento || !ajuste) return;
  documento.documentElement.classList.toggle('ligero', Boolean(ajuste.ligero));
  documento.documentElement.dataset.geoda = ajuste.nivel ?? '';
}

// Guarda el plan aplicado junto con el estado anterior de la página, para que «Deshacer» sea exacto.
export function aplicarGeoda(plan, { almacen = globalThis.localStorage, documento = globalThis.document } = {}) {
  const previo = { ligero: documento?.documentElement.classList.contains('ligero') ?? false };
  const ajuste = { nivel: plan.clasificacion.nivel, perfil: plan.perfil.perfil, ...plan.amatista, previo, aplicadoEn: new Date().toISOString() };
  almacen?.setItem(CLAVE_GEODA, JSON.stringify(ajuste));
  aplicarEnPagina(ajuste, documento);
  globalThis.dispatchEvent?.(new Event(EVENTO_GEODA));
  return ajuste;
}

export function deshacerGeoda({ almacen = globalThis.localStorage, documento = globalThis.document } = {}) {
  const ajuste = leerGeoda(almacen);
  almacen?.removeItem(CLAVE_GEODA);
  if (ajuste && documento) {
    documento.documentElement.classList.toggle('ligero', Boolean(ajuste.previo?.ligero));
    delete documento.documentElement.dataset.geoda;
  }
  globalThis.dispatchEvent?.(new Event(EVENTO_GEODA));
  return ajuste;
}

// Al arrancar: si la persona ya ajustó Amatista con Geoda, se respeta su elección.
export function restaurarGeoda(opciones = {}) {
  const ajuste = leerGeoda(opciones.almacen);
  if (ajuste) aplicarEnPagina(ajuste, opciones.documento);
  return ajuste;
}
