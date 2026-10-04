import { describe, expect, it } from 'vitest';
import { esEquipoLigero } from './rendimiento';

describe('modo ligero', () => {
  it('se activa con poca memoria, pocos núcleos, ahorro de datos o movimiento reducido', () => {
    expect(esEquipoLigero({ memoria: 8, nucleos: 8 })).toBe(false);
    expect(esEquipoLigero({ memoria: 2, nucleos: 8 })).toBe(true);
    expect(esEquipoLigero({ memoria: 8, nucleos: 2 })).toBe(true);
    expect(esEquipoLigero({ ahorroDatos: true })).toBe(true);
    expect(esEquipoLigero({ movimientoReducido: true })).toBe(true);
    // Un navegador que no informa memoria ni núcleos (Safari, Firefox) se trata como normal.
    expect(esEquipoLigero({})).toBe(false);
  });
});
