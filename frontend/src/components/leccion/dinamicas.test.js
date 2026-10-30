import { describe, expect, it } from 'vitest';
import {
  avanzarTeclas,
  campoDe,
  carasDelCubo,
  dentroDeTolerancia,
  efectoDeTeclas,
  normalizarCombinacion,
  pistaValor,
  revisarErrores,
  teclaDeEvento,
  tecladoEnPantalla,
  transformacionDe,
} from './dinamicas';

describe('Entrena tus teclas', () => {
  it('escribe las teclas como en Blender', () => {
    expect(normalizarCombinacion('g')).toBe('G');
    expect(normalizarCombinacion('shift + a')).toBe('Shift+A');
    expect(normalizarCombinacion('control+r')).toBe('Ctrl+R');
    expect(normalizarCombinacion('tab')).toBe('Tab');
    expect(teclaDeEvento({ key: 'g' })).toBe('G');
    expect(teclaDeEvento({ key: 'A', shiftKey: true })).toBe('Shift+A');
    expect(teclaDeEvento({ key: 'r', ctrlKey: true })).toBe('Ctrl+R');
    expect(teclaDeEvento({ key: 'Tab' })).toBe('Tab');
    expect(teclaDeEvento({ key: 'Shift', shiftKey: true })).toBeNull();
    expect(teclaDeEvento({ key: ' ' })).toBe('Espacio');
  });

  it('avanza tecla por tecla y vuelve a empezar con una equivocada', () => {
    let r = avanzarTeclas(['G', 'X'], [], 'G');
    expect(r).toEqual({ hechas: ['G'], estado: 'sigue' });
    r = avanzarTeclas(['G', 'X'], r.hechas, 'X');
    expect(r).toEqual({ hechas: ['G', 'X'], estado: 'listo' });
    expect(avanzarTeclas(['G', 'X'], ['G'], 'Y')).toEqual({ hechas: [], estado: 'error' });
    expect(avanzarTeclas(['shift+a'], [], 'Shift+A').estado).toBe('listo');
  });

  it('el teclado en pantalla trae las pedidas primero y sin repetir', () => {
    const teclas = tecladoEnPantalla([{ keys: ['G', 'X'] }, { keys: ['Shift+A'] }, { keys: ['g'] }]);
    expect(teclas.slice(0, 3)).toEqual(['G', 'X', 'Shift+A']);
    expect(new Set(teclas).size).toBe(teclas.length);
    expect(teclas).toContain('Tab');
  });

  it('el cubo hace lo que dicen las teclas', () => {
    expect(efectoDeTeclas(['G', 'X']).posicion).toEqual([0.9, 0, 0]);
    expect(efectoDeTeclas(['R', 'Z']).giro).toEqual([0, 0, 45]);
    expect(efectoDeTeclas(['S', 'Z']).escala).toEqual([1, 1, 1.8]);
    expect(efectoDeTeclas(['S']).escala).toEqual([1.4, 1.4, 1.4]);
    expect(efectoDeTeclas(['Tab']).edicion).toBe(true);
    expect(efectoDeTeclas(['Shift+A']).copia).toBe(true);
  });
});

describe('Ajusta el valor', () => {
  it('toma los límites del bloque o de la propiedad', () => {
    expect(campoDe({ property: 'rotation' })).toMatchObject({ min: -180, max: 180, paso: 5, unidad: '°', inicial: 0 });
    expect(campoDe({ property: 'scale', min: 0.5, step: 0.25 })).toMatchObject({ min: 0.5, max: 3, paso: 0.25 });
    expect(campoDe({ property: 'rotation', tolerance: 2 }).tolerancia).toBe(2);
  });

  it('dice si falta, sobra o está justo sin decir el número', () => {
    expect(dentroDeTolerancia(44, 45, 2.5)).toBe(true);
    expect(dentroDeTolerancia('x', 45, 2.5)).toBe(false);
    expect(pistaValor(30, 45, 2.5)).toBe('falta');
    expect(pistaValor(60, 45, 2.5)).toBe('sobra');
    expect(pistaValor(45, 45, 2.5)).toBe('justo');
  });

  it('mueve, gira o escala en el eje pedido', () => {
    expect(transformacionDe('rotation', 'Z', 45).giro).toEqual([0, 0, 45]);
    expect(transformacionDe('scale', 'X', 2).escala).toEqual([2, 1, 1]);
    expect(transformacionDe('location', 'Y', -1).posicion).toEqual([0, -1, 0]);
  });
});

describe('Encuentra el error', () => {
  const pasos = [{ text: 'a' }, { text: 'b', wrong: true }, { text: 'c' }, { text: 'd', wrong: true }];
  it('es correcto solo si marca todos los malos y ninguno bueno', () => {
    expect(revisarErrores(pasos, [1, 3])).toEqual({ total: 2, encontrados: 2, falsos: 0, correcto: true });
    expect(revisarErrores(pasos, [1])).toMatchObject({ encontrados: 1, correcto: false });
    expect(revisarErrores(pasos, [1, 3, 0])).toMatchObject({ falsos: 1, correcto: false });
  });
});

describe('el cubo isométrico', () => {
  it('muestra tres caras de frente y las ordena de atrás hacia adelante', () => {
    const caras = carasDelCubo();
    expect(caras).toHaveLength(3);
    expect(caras.every((c) => c.puntos.length === 4)).toBe(true);
    // La cara de arriba es la más clara, como el sombreado sólido de Blender.
    expect(Math.max(...caras.map((c) => c.luz))).toBe(1);
  });

  it('girado sigue mostrando caras visibles', () => {
    expect(carasDelCubo({ giro: [0, 0, 45] }).length).toBeGreaterThanOrEqual(2);
  });
});
