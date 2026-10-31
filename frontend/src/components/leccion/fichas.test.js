import { describe, expect, it } from 'vitest';
import { FICHAS, PLANO, ZONAS, enunciado, ficha, fichasDeZona, partesTecla, revisarZona, zonaEsperada } from './fichas';

describe('fichas de herramientas (motor 6.1)', () => {
  it('cada ficha vive en una zona que el plano sabe dibujar', () => {
    expect(FICHAS.length).toBeGreaterThanOrEqual(20);
    for (const f of FICHAS) {
      expect(PLANO[f.zona], f.id).toBeTruthy();
      expect(f.para_que.length, f.id).toBeGreaterThan(10);
    }
    for (const z of ZONAS) expect(PLANO[z.id], z.id).toBeTruthy();
  });

  it('busca fichas y zonas', () => {
    expect(ficha('transform.scale').nombre).toBe('Escalar');
    expect(ficha('nada')).toBeNull();
    expect(fichasDeZona('propiedades').length).toBeGreaterThan(0);
  });

  it('la pregunta puede ser por herramienta o por zona', () => {
    expect(zonaEsperada({ tool: 'modifier.mirror' })).toBe(ficha('modifier.mirror').zona);
    expect(zonaEsperada({ zone: 'outliner', prompt: '¿Dónde ves todo lo que hay?' })).toBe('outliner');
    expect(enunciado({ tool: 'transform.move' })).toContain('Mover');
    expect(enunciado({ zone: 'outliner', prompt: 'Hola' })).toBe('Hola');
  });

  it('el error enseña qué es lo que tocó y al segundo fallo muestra el lugar', () => {
    const pregunta = { zone: 'propiedades' };
    expect(revisarZona(pregunta, 'propiedades').correcto).toBe(true);
    const primero = revisarZona(pregunta, 'outliner', 0);
    expect(primero.correcto).toBe(false);
    expect(primero.revelar).toBe(false);
    expect(primero.explicacion).toMatch(/^Eso es /);
    expect(revisarZona(pregunta, 'outliner', 1).revelar).toBe(true);
  });

  it('parte las combinaciones de teclas', () => {
    expect(partesTecla('Shift+D')).toEqual(['Shift', 'D']);
    expect(partesTecla('G')).toEqual(['G']);
  });
});
