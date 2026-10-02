// Cambios sin guardar del editor de lecciones. La navegación es por hash y no
// se puede cancelar un "hashchange": los enlaces del panel preguntan antes de
// salir con confirmarSalida(). Cerrar o recargar la pestaña lo cubre
// "beforeunload" (lo registra el editor).
let pendientes = false;

export function marcarCambiosPendientes(valor) {
  pendientes = Boolean(valor);
}

export const hayCambiosPendientes = () => pendientes;

export function confirmarSalida() {
  if (!pendientes) return true;
  const salir = window.confirm('Tienes cambios sin guardar en la lección. ¿Salir y descartarlos?');
  if (salir) pendientes = false;
  return salir;
}

// onClick de un enlace interno: cancela la navegación si el usuario se arrepiente.
export function alSalirPorEnlace(evento) {
  if (!confirmarSalida()) evento.preventDefault();
}
