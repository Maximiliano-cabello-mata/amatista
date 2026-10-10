import { describe, expect, it } from 'vitest';
import { acomodar, columnas, ordenFlujo } from './nodos';

const nodos = [
  { id: 'salida', kind: 'output', title: 'Material Output', inputs: [{ id: 'surface', label: 'Surface', socket: 'shader' }] },
  { id: 'ruido', kind: 'texture', title: 'Noise Texture', outputs: [{ id: 'color', label: 'Color', socket: 'color' }] },
  {
    id: 'bsdf',
    kind: 'shader',
    title: 'Principled BSDF',
    outputs: [{ id: 'bsdf', label: 'BSDF', socket: 'shader' }],
    inputs: [{ id: 'base', label: 'Base Color', socket: 'color' }, { id: 'rough', label: 'Roughness', socket: 'float', value: 0.5 }],
  },
];
const enlaces = [
  { from: 'ruido.color', to: 'bsdf.base' },
  { from: 'bsdf.bsdf', to: 'salida.surface' },
];

describe('diagrama de nodos', () => {
  it('pone cada nodo una columna después de quien lo alimenta', () => {
    expect(Object.fromEntries(columnas(nodos, enlaces))).toEqual({ ruido: 0, bsdf: 1, salida: 2 });
  });

  it('detecta ciclos', () => {
    expect(columnas(nodos, [...enlaces, { from: 'bsdf.bsdf', to: 'bsdf.base' }])).toBeNull();
  });

  it('recorre de las entradas a la salida', () => {
    expect(ordenFlujo(nodos, enlaces)).toEqual(['ruido', 'bsdf', 'salida']);
  });

  it('une conectores con curvas del color del dato', () => {
    const d = acomodar(nodos, enlaces);
    expect(d.lineas).toHaveLength(2);
    expect(d.lineas[0].color).toBe('#C7C729');
    expect(d.lineas[1].color).toBe('#63C763');
    expect(d.ancho).toBeGreaterThan(3 * 176);
  });
});
