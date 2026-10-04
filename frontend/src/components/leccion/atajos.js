// Lógica pura de «Atajos de teclado» (pruebas en atajos.test.js).

const NORMAL = { control: 'ctrl', return: 'enter', escape: 'esc', ' ': 'espacio' };

// Teclas del bloque → texto comparable: ["Shift", "D"] → "shift+d".
export const claveAtajo = (teclas = []) =>
  teclas
    .map((t) => String(t).trim().toLowerCase())
    .map((t) => NORMAL[t] ?? t)
    .sort((a, b) => orden(a) - orden(b) || a.localeCompare(b))
    .join('+');

const MODIFICADORES = ['ctrl', 'alt', 'shift'];
const orden = (t) => (MODIFICADORES.includes(t) ? MODIFICADORES.indexOf(t) : 10);

// Evento de teclado → la misma forma. null mientras solo hay modificadores.
export function claveDeEvento({ key = '', ctrlKey = false, altKey = false, shiftKey = false, metaKey = false }) {
  const tecla = NORMAL[key.toLowerCase()] ?? key.toLowerCase();
  if (['shift', 'ctrl', 'alt', 'meta', 'os'].includes(tecla)) return null;
  const partes = [];
  if (ctrlKey || metaKey) partes.push('ctrl');
  if (altKey) partes.push('alt');
  if (shiftKey) partes.push('shift');
  partes.push(tecla);
  return claveAtajo(partes);
}

// Atajos de UNA combinación: los de dos tiempos (S y luego Z, campo «then»)
// no se pueden pulsar a la vez, así que no entran al modo «Pruébate».
export const practicables = (items = []) => items.filter((item) => item.keys?.length && !item.then?.length);
