// Escalas de las gráficas (funciones puras, pruebas en graficas.test.js).

// Tope "redondo" del eje y sus marcas (0 / 2 / 4 / 6 / 8, 0 / 50 / 100…) con
// a lo más `maxDivisiones` pasos enteros. Sin datos el eje va de 0 a 1.
export function escalaBonita(maximo, maxDivisiones = 4) {
  const valor = Math.max(0, Number(maximo) || 0);
  if (valor === 0) return { tope: 1, paso: 1, marcas: [0, 1] };
  const crudo = valor / maxDivisiones;
  const magnitud = 10 ** Math.floor(Math.log10(crudo));
  const paso = Math.max(1, [1, 2, 5, 10].map((m) => m * magnitud).find((p) => p >= crudo));
  const tope = Math.ceil(valor / paso) * paso;
  const marcas = Array.from({ length: Math.round(tope / paso) + 1 }, (_, i) => i * paso);
  return { tope, paso, marcas };
}

// Nivel de la rampa para un valor: 0 = vacío, 1…n según los umbrales
// (umbrales [1, 3, 6, 10]: 1-2 → 1, 3-5 → 2, 6-9 → 3, 10+ → 4).
export function nivelDeRampa(valor, umbrales) {
  const numero = Number(valor) || 0;
  let nivel = 0;
  umbrales.forEach((umbral, i) => {
    if (numero >= umbral) nivel = i + 1;
  });
  return nivel;
}

// Cada cuántas etiquetas del eje X se muestra una para que no se encimen.
export function saltoEtiquetas(cantidad, anchoDisponible, anchoEtiqueta = 44) {
  if (cantidad <= 1 || anchoDisponible <= 0) return 1;
  const caben = Math.max(1, Math.floor(anchoDisponible / anchoEtiqueta));
  return Math.max(1, Math.ceil(cantidad / caben));
}

export const limitar = (valor, minimo, maximo) => Math.min(maximo, Math.max(minimo, valor));

// Texto "1 lección" / "3 lecciones" a partir de [singular, plural].
export function conUnidad(valor, unidad) {
  if (!unidad) return String(valor);
  const [uno, varios] = Array.isArray(unidad) ? unidad : [unidad, unidad];
  return `${valor} ${valor === 1 ? uno : varios}`;
}
