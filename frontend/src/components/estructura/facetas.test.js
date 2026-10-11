import { describe, expect, it } from 'vitest';
import { facetasBorde, facetasEncabezado } from './facetas';

describe('facetas', () => {
  it('cubre el encabezado con triángulos iguales en cada carga', () => {
    const a = facetasEncabezado({ columnas: 10, filas: 3 });
    expect(a).toHaveLength(60);
    expect(facetasEncabezado({ columnas: 10, filas: 3 })).toEqual(a);
    for (const cara of a) {
      expect(cara.puntos.split(' ')).toHaveLength(3);
      expect(cara.opacidad).toBeGreaterThan(0);
      expect(cara.opacidad).toBeLessThan(0.35);
    }
  });

  it('la luz está arriba a la derecha', () => {
    const caras = facetasEncabezado({ columnas: 10, filas: 3 });
    const izquierda = caras.slice(0, 6).reduce((s, c) => s + c.opacidad, 0);
    const derecha = caras.slice(12, 20).reduce((s, c) => s + c.opacidad, 0) / 8 * 6;
    expect(derecha).toBeGreaterThan(izquierda);
  });

  it('cambia de color según el tono y vuelve a amatista si no lo conoce', () => {
    expect(facetasEncabezado({ tono: 'blender' })[0].color).toBe('rgb(245,121,42)');
    expect(facetasEncabezado({ tono: 'otro' })[0].color).toBe('rgb(155,89,182)');
  });

  it('el borde del pie alterna triángulos', () => {
    const borde = facetasBorde({ cantidad: 4, ancho: 40, alto: 10 });
    expect(borde.map((t) => t.puntos)).toEqual(['0,10 5,0 10,10', '10,0 15,10 20,0', '20,10 25,0 30,10', '30,0 35,10 40,0']);
  });
});
