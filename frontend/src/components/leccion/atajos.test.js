import { describe, expect, it } from 'vitest';
import { claveAtajo, claveDeEvento, practicables } from './atajos';

describe('atajos de teclado', () => {
  it('normaliza las teclas del bloque y del teclado igual', () => {
    expect(claveAtajo(['Shift', 'D'])).toBe('shift+d');
    expect(claveAtajo(['D', 'Shift'])).toBe('shift+d');
    expect(claveAtajo(['Ctrl', 'Shift', 'S'])).toBe('ctrl+shift+s');
    expect(claveDeEvento({ key: 'D', shiftKey: true })).toBe('shift+d');
    expect(claveDeEvento({ key: 's', ctrlKey: true, shiftKey: true })).toBe('ctrl+shift+s');
    expect(claveDeEvento({ key: 'g' })).toBe('g');
    expect(claveDeEvento({ key: 'Enter' })).toBe('enter');
  });

  it('ignora los modificadores solos', () => {
    expect(claveDeEvento({ key: 'Shift', shiftKey: true })).toBeNull();
  });

  it('solo practica combinaciones de un tiempo', () => {
    const items = [
      { keys: ['G'], action: 'Mover' },
      { keys: ['S'], then: ['Z'], action: 'Escalar en Z' },
    ];
    expect(practicables(items).map((i) => i.action)).toEqual(['Mover']);
  });
});
