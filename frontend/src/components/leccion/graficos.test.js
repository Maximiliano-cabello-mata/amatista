import { describe, expect, it } from 'vitest';
import { normalCara } from '../graficas/malla';
import { accionDeTecla, escenaSimulador, figuraMalla, interpolarClaves, misionesDe, NOMBRES_FIGURA, revisarClaves, textoMeta } from './graficos';

const centro = (vs) => vs.reduce((s, v) => s.map((x, i) => x + v[i]), [0, 0, 0]).map((x) => x / vs.length);

describe('recursos gráficos v4.2', () => {
  it('cada figura es una malla válida con caras hacia afuera', () => {
    for (const nombre of NOMBRES_FIGURA) {
      const m = figuraMalla(nombre);
      expect(m.caras.length, nombre).toBeGreaterThan(0);
      for (const cara of m.caras) for (const i of cara) expect(m.vertices[i], nombre).toBeDefined();
    }
    // El cubo con bisel: 6 caras grandes + 12 de arista + 8 esquinas, 24 vértices.
    const bisel = figuraMalla('cubo_bisel');
    expect([bisel.vertices.length, bisel.caras.length]).toEqual([24, 26]);
    const c = centro(bisel.vertices);
    for (const cara of bisel.caras) {
      const n = normalCara(bisel.vertices, cara);
      const m = centro(cara.map((i) => bisel.vertices[i]));
      expect(n[0] * (m[0] - c[0]) + n[1] * (m[1] - c[1]) + n[2] * (m[2] - c[2])).toBeGreaterThan(0);
    }
    expect(figuraMalla('alambre').alambre).toBe(true);
    expect(figuraMalla('inventada').vertices).toHaveLength(8);
  });

  it('el simulador sabe de qué objeto es cada cara y lee las teclas de Blender', () => {
    const escena = escenaSimulador();
    expect(escena.piezas).toHaveLength(escena.caras.length);
    expect(new Set(escena.piezas)).toEqual(new Set([0, 1, 2]));
    expect(['1', '3', '7', 'Home', '.', '+', '-', 'x'].map(accionDeTecla)).toEqual(['frente', 'lado', 'arriba', 'encuadrar', 'encuadrar', 'acercar', 'alejar', null]);
    expect(misionesDe({})).toEqual(['orbitar', 'acercar', 'frente', 'arriba']);
    expect(misionesDe({ missions: ['lado', 'lado', 'volar'] })).toEqual(['lado']);
  });

  it('interpola las claves con curva suave y revisa las metas', () => {
    const claves = { 1: 1, 15: 0, 30: 1 };
    expect(interpolarClaves({}, 5)).toBeNull();
    expect(interpolarClaves(claves, 1)).toBe(1);
    expect(interpolarClaves(claves, 8)).toBeCloseTo(0.5, 5);
    expect(interpolarClaves(claves, 3)).toBeGreaterThan(0.9);
    expect(interpolarClaves(claves, 50)).toBe(1);
    const metas = [{ frame: 1, height: 1 }, { frame: 15, height: 0 }, { frame: 30, height: 1 }];
    expect(revisarClaves(claves, metas).every((r) => r.ok)).toBe(true);
    expect(revisarClaves({ 1: 1, 15: 0.4 }, metas).map((r) => r.ok)).toEqual([true, false, false]);
    expect(textoMeta({ frame: 15, height: 0 })).toBe('Fotograma 15: pelota en el suelo');
  });
});
