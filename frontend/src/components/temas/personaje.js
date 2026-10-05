// Reglas del personaje de cada módulo (Personaje.jsx): qué hace al tocarlo,
// con qué reacciona a la lección y hacia dónde mira.

export const ACCIONES_TOQUE = ['salto', 'giro', 'baile', 'saludo'];
export const ACCIONES_SOLAS = ['mirar', 'saltito', 'estirar'];
export const REACCION = { acierto: 'festejo', fallo: 'triste', mitad: 'saludo', final: 'voltereta', inactivo: 'mirar' };
export const DURACION = { salto: 700, giro: 800, baile: 1200, saludo: 1000, festejo: 1300, triste: 1400, voltereta: 1100, mirar: 1600, saltito: 600, estirar: 1100 };

// Siguiente acción al tocarlo: nunca repite la anterior.
export function accionAlTocar(anterior, azar = Math.random) {
  const opciones = ACCIONES_TOQUE.filter((a) => a !== anterior);
  return opciones[Math.floor(azar() * opciones.length) % opciones.length];
}

// Hacia dónde mira: desplazamiento de los ojos (en píxeles del sprite) e
// inclinación del cuerpo, según dónde está el puntero respecto al personaje.
export function mirada(dx, dy) {
  const distancia = Math.hypot(dx, dy) || 1;
  const fuerza = Math.min(1, distancia / 240);
  return {
    x: +((dx / distancia) * 0.55 * fuerza).toFixed(2),
    y: +((dy / distancia) * 0.4 * fuerza).toFixed(2),
    inclinar: +((dx / distancia) * 6 * fuerza).toFixed(1),
  };
}
