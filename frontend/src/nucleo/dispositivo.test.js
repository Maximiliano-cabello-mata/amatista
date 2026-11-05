import { describe, it, expect } from 'vitest';
import { evaluarNivelHardware, calcularPresupuestoRendimiento, perfilarDispositivo } from './dispositivo';

describe('dispositivo.js - Perfilado adaptativo de hardware', () => {
  it('clasifica netbook escolar con 2GB o 2 núcleos como N0', () => {
    expect(evaluarNivelHardware({ memoria: 2, nucleos: 2 })).toBe('N0');
    expect(evaluarNivelHardware({ memoria: 4, nucleos: 4, red: '2g' })).toBe('N0');
    expect(evaluarNivelHardware({ memoria: 8, nucleos: 8, ahorroDatos: true })).toBe('N0');
  });

  it('clasifica móvil o equipo medio como N1', () => {
    expect(evaluarNivelHardware({ memoria: 4, nucleos: 4, red: '3g' })).toBe('N1');
    expect(evaluarNivelHardware({ memoria: 4, nucleos: 4, bateriaBaja: true })).toBe('N1');
  });

  it('clasifica estación CAD con 16GB y 8 núcleos como N4', () => {
    expect(evaluarNivelHardware({ memoria: 32, nucleos: 16, red: '4g' })).toBe('N4');
  });

  it('calcula presupuestos coherentes según el nivel', () => {
    const pN0 = calcularPresupuestoRendimiento({ nivel: 'N0', enLinea: true });
    expect(pN0.dprMaximo).toBe(1.0);
    expect(pN0.fpsObjetivo).toBe(30);
    expect(pN0.texturasMax).toBe(512);
    expect(pN0.modoLigero).toBe(true);

    const pXR = calcularPresupuestoRendimiento({ nivel: 'N2', esXR: true, enLinea: true });
    expect(pXR.fpsObjetivo).toBe(72);
    expect(pXR.dprMaximo).toBe(1.5);

    const pN4 = calcularPresupuestoRendimiento({ nivel: 'N4', enLinea: true });
    expect(pN4.fpsObjetivo).toBe(120);
    expect(pN4.dprMaximo).toBe(2.0);
    expect(pN4.sombrasHabilitadas).toBe(true);
  });

  it('perfilarDispositivo devuelve estructura completa', () => {
    const perfil = perfilarDispositivo({
      navigator: { deviceMemory: 8, hardwareConcurrency: 8, onLine: true, connection: { effectiveType: '4g' } }
    });
    expect(perfil.nivel).toBe('N2');
    expect(perfil.enLinea).toBe(true);
    expect(perfil.fpsObjetivo).toBe(60);
    expect(perfil.concurrenciaRed).toBe(4);
  });
});
