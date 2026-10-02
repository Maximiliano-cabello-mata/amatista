import { describe, expect, it } from 'vitest';
import { conUnidad, escalaBonita, limitar, nivelDeRampa, saltoEtiquetas } from './escalas';
import { diaSemana, fechaCorta, inicioSemana } from './fechas';

describe('escalaBonita', () => {
  it('usa pasos enteros y redondos', () => {
    expect(escalaBonita(0)).toEqual({ tope: 1, paso: 1, marcas: [0, 1] });
    expect(escalaBonita(1)).toEqual({ tope: 1, paso: 1, marcas: [0, 1] });
    expect(escalaBonita(3)).toEqual({ tope: 3, paso: 1, marcas: [0, 1, 2, 3] });
    expect(escalaBonita(7)).toEqual({ tope: 8, paso: 2, marcas: [0, 2, 4, 6, 8] });
    expect(escalaBonita(37)).toEqual({ tope: 40, paso: 10, marcas: [0, 10, 20, 30, 40] });
    expect(escalaBonita(100).marcas).toEqual([0, 50, 100]);
    expect(escalaBonita(1234).tope).toBe(1500);
  });

  it('tolera valores raros', () => {
    expect(escalaBonita(-5).tope).toBe(1);
    expect(escalaBonita(undefined).tope).toBe(1);
    expect(escalaBonita(0.4).tope).toBe(1);
  });
});

describe('utilidades', () => {
  it('ubica un valor en la rampa', () => {
    const umbrales = [1, 3, 6, 10];
    expect([0, 1, 2, 3, 5, 6, 9, 10, 40].map((v) => nivelDeRampa(v, umbrales))).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });

  it('salta etiquetas cuando no caben', () => {
    expect(saltoEtiquetas(7, 700)).toBe(1);
    expect(saltoEtiquetas(30, 300)).toBe(5);
    expect(saltoEtiquetas(1, 10)).toBe(1);
  });

  it('limita y nombra valores', () => {
    expect(limitar(120, 0, 100)).toBe(100);
    expect(conUnidad(1, ['lección', 'lecciones'])).toBe('1 lección');
    expect(conUnidad(3, ['lección', 'lecciones'])).toBe('3 lecciones');
    expect(conUnidad(3, 'XP')).toBe('3 XP');
  });
});

describe('fechas', () => {
  it('la semana empieza el lunes', () => {
    expect(diaSemana('2026-09-28')).toBe(0);
    expect(diaSemana('2026-10-04')).toBe(6);
    expect(inicioSemana('2026-10-02')).toBe('2026-09-28');
    expect(inicioSemana('2026-09-28')).toBe('2026-09-28');
    expect(inicioSemana('2026-01-01')).toBe('2025-12-29');
  });

  it('escribe fechas cortas en español', () => {
    expect(fechaCorta('2026-10-02')).toBe('vie 2 oct');
    expect(fechaCorta('2026-10-02', { conDia: false, conAnio: true })).toBe('2 oct 2026');
  });
});
