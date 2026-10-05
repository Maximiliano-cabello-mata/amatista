import { describe, expect, it } from 'vitest';
import { ACCIONES_TOQUE, accionAlTocar, DURACION, mirada, REACCION } from './personaje';

describe('personaje de cada módulo', () => {
  it('al tocarlo nunca repite la acción anterior', () => {
    for (const anterior of ACCIONES_TOQUE) {
      for (const azar of [0, 0.34, 0.67, 0.999]) {
        const siguiente = accionAlTocar(anterior, () => azar);
        expect(ACCIONES_TOQUE).toContain(siguiente);
        expect(siguiente).not.toBe(anterior);
      }
    }
    expect(ACCIONES_TOQUE).toContain(accionAlTocar('', () => 0.5));
  });

  it('mira hacia el puntero, más fuerte cuanto más lejos, sin pasarse', () => {
    const derecha = mirada(500, 0);
    expect(derecha.x).toBeCloseTo(0.55);
    expect(derecha.y).toBe(0);
    expect(derecha.inclinar).toBeGreaterThan(0);
    const cerca = mirada(-24, 0);
    expect(cerca.x).toBeLessThan(0);
    expect(Math.abs(cerca.x)).toBeLessThan(0.1);
    expect(mirada(0, 0)).toEqual({ x: 0, y: 0, inclinar: 0 });
    expect(Math.abs(mirada(0, -900).y)).toBeLessThanOrEqual(0.4);
  });

  it('cada reacción de la lección tiene animación con duración', () => {
    for (const accion of [...Object.values(REACCION), ...ACCIONES_TOQUE]) expect(DURACION[accion], accion).toBeGreaterThan(0);
  });
});
