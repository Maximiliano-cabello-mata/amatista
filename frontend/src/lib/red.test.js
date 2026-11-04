import { describe, expect, it } from 'vitest';
import { decidirAhorro, esperaReintento, esperaSegunRed, esRedLenta } from './red';

describe('decidirAhorro', () => {
  it('la preferencia del alumno manda', () => {
    expect(decidirAhorro({ preferencia: 'si' })).toBe(true);
    expect(decidirAhorro({ preferencia: 'no', ahorroSistema: true, tipoRed: '2g' })).toBe(false);
  });

  it('en automático lo enciende el ahorro del sistema o una red 2G', () => {
    expect(decidirAhorro({ ahorroSistema: true, tipoRed: '4g' })).toBe(true);
    expect(decidirAhorro({ tipoRed: 'slow-2g' })).toBe(true);
    expect(decidirAhorro({ tipoRed: '2g' })).toBe(true);
    expect(decidirAhorro({ tipoRed: '3g' })).toBe(false);
    expect(decidirAhorro({})).toBe(false);
  });
});

describe('esperas', () => {
  it('da más margen al servidor en redes lentas', () => {
    expect(esperaSegunRed(8000, '4g')).toBe(8000);
    expect(esperaSegunRed(8000, undefined)).toBe(8000);
    expect(esperaSegunRed(8000, '3g')).toBe(16000);
    expect(esperaSegunRed(8000, '2g')).toBe(24000);
    expect(esRedLenta('3g')).toBe(true);
    expect(esRedLenta('4g')).toBe(false);
  });

  it('los reintentos esperan cada vez más, con tope de 5 minutos', () => {
    const sinAzar = (n) => esperaReintento(n, 0.5);
    expect(sinAzar(1)).toBe(5000);
    expect(sinAzar(2)).toBe(15000);
    expect(sinAzar(3)).toBe(45000);
    expect(sinAzar(10)).toBe(300000);
    expect(sinAzar(0)).toBe(5000);
    // El azar reparte un aula entera: ±20 %.
    expect(esperaReintento(1, 0)).toBe(4000);
    expect(esperaReintento(1, 1)).toBe(6000);
  });
});
