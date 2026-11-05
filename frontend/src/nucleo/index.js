// src/nucleo/index.js
// Punto de entrada del Núcleo PWA Universal de Amatista.

export {
  evaluarNivelHardware,
  calcularPresupuestoRendimiento,
  perfilarDispositivo,
} from './dispositivo';

export {
  crearColaSincronizacion,
  fusionarOperacion,
} from './colaSincronizacion';

export {
  CircuitBreakerIA,
  clienteIaLocal,
} from './iaLocal';
