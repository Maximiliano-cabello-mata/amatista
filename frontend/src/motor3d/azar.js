// Azar con semilla para el Motor Web de Amatista: la misma semilla da siempre el mismo
// mundo (en el alumno, en la prueba y en la página que descarga). Sin dependencias.

// mulberry32: rápido, 32 bits y suficiente para repartir árboles y rocas.
export function crearAzar(semilla = 1) {
  let a = (Number(semilla) >>> 0) || 1;
  return function azar() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Una semilla también puede ser una palabra («mi-isla»): se convierte en número.
export function semillaDe(valor) {
  if (typeof valor === 'number' && Number.isFinite(valor)) return Math.abs(Math.floor(valor)) || 1;
  let h = 2166136261;
  for (const letra of String(valor ?? '')) {
    h ^= letra.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

export const entre = (azar, min, max) => min + azar() * (max - min);
