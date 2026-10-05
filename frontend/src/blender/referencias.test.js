import { describe, expect, it } from 'vitest';
import { referenciaDe, textoMedidas } from './referencias';

describe('modelos de referencia', () => {
  it('el tren trae imagen, plano y medidas aproximadas', () => {
    const tren = referenciaDe('blender.bp.m1.tren');
    expect(tren.titulo).toBe('Tren de juguete');
    expect(tren.imagen).toMatch(/referencia/);
    expect(tren.plano).toMatch(/plano/);
    expect(tren.holgura).toBe(35);
  });

  it('una práctica sin modelo no muestra nada', () => {
    expect(referenciaDe('blender.bpi.m1.explora')).toBeNull();
  });

  it('las medidas se leen redondeadas y sin el grosor de un plano', () => {
    expect(textoMedidas([4.5, 1.62, 2.1])).toBe('≈ 4.5 × 1.6 × 2.1 m');
    expect(textoMedidas([6, 5.4, 0.01])).toBe('≈ 6 × 5.4 m');
  });
});
