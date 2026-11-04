// Tiempo de la película: todo cuadro es una función pura del segundo t (render cuadro por cuadro).
export const acotar = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const tramo = (t, a, b) => acotar((t - a) / (b - a));
export const mezclar = (a, b, k) => a + (b - a) * k;

export const curva = {
  sale: (k) => 1 - (1 - k) ** 3,
  suave: (k) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2),
  expo: (k) => (k >= 1 ? 1 : 1 - 2 ** (-10 * k)),
  rebote: (k) => {
    const c = 1.70158;
    return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2;
  },
};

// Entra en [a, a + d] y sale en [b, b + d]: 0 → 1 → 0.
export function vida(t, a, b, d = 0.5) {
  return curva.sale(tramo(t, a, a + d)) * (1 - curva.suave(tramo(t, b, b + d)));
}

// Pseudoaleatorio estable (la misma semilla da el mismo valor en cada cuadro).
export function azar(semilla) {
  let s = semilla | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
