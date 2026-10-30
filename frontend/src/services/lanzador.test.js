import { describe, expect, it, vi } from 'vitest';
import { abrirEnlace, hayQueLanzar, urlBlender } from './lanzador';

// Las direcciones deben ser las que lee addon/amatista_blender/protocolo.py (addon/tests/test_protocolo.py).
describe('enlace amatista:// (add-on 5.4)', () => {
  it('arma la dirección de cada orden', () => {
    expect(urlBlender('abrir_practica', { practica_id: 'blender.n1.mesa' })).toBe('amatista://practica/blender.n1.mesa');
    expect(urlBlender('taller_abrir', { taller: 'blender.bp.m1' })).toBe('amatista://taller/blender.bp.m1');
    expect(urlBlender('taller_abrir', { taller: 'blender.bp.m1', actividad: 'reto:blender.bp.m1' })).toBe(
      'amatista://taller/blender.bp.m1?actividad=reto%3Ablender.bp.m1',
    );
    expect(urlBlender('isla')).toBe('amatista://isla');
    expect(urlBlender('recorrido', { recorrido: 'vista' })).toBe('amatista://recorrido/vista');
    expect(urlBlender('recorrido')).toBe('amatista://recorrido');
    expect(urlBlender('otra')).toBe('amatista://abrir');
  });

  it('lleva la etapa de la lección a Blender Amatista (motor 6)', () => {
    expect(
      urlBlender('taller_abrir', {
        taller: 'blender.bp.m1',
        etapa: 'exploracion',
        habilidades: ['bl-agregar-primitivas', 'bl-mover'],
        leccion: 'bp1_blender',
      }),
    ).toBe('amatista://taller/blender.bp.m1?etapa=exploracion&habilidades=bl-agregar-primitivas,bl-mover&leccion=bp1_blender');
    expect(urlBlender('taller_abrir', { taller: 'blender.bp.m1', etapa: 'practica', habilidades: ['x'] })).toBe(
      'amatista://taller/blender.bp.m1?etapa=practica',
    );
  });

  it('solo lanza si ningún Blender abierto recibió la orden', () => {
    expect(hayQueLanzar({ ok: true, datos: { enlace: true, entregada: false } })).toBe(true);
    expect(hayQueLanzar({ ok: true, datos: { enlace: false, entregada: false } })).toBe(true);
    expect(hayQueLanzar({ ok: true, datos: { abierta_en_blender: false } })).toBe(true);
    expect(hayQueLanzar({ ok: true, datos: { entregada: true } })).toBe(false);
    expect(hayQueLanzar({ ok: true, datos: { abierta_en_blender: true } })).toBe(false);
    expect(hayQueLanzar({ ok: false, status: 401 })).toBe(false);
    expect(hayQueLanzar(null)).toBe(false);
  });

  it('en Firefox usa un iframe oculto para no dejar una página de error', () => {
    vi.useFakeTimers();
    const hijos = [];
    const marco = { style: {}, remove: vi.fn() };
    const documento = { createElement: () => marco, body: { appendChild: (h) => hijos.push(h) }, location: {} };
    abrirEnlace('amatista://isla', { documento, agente: 'Mozilla/5.0 Firefox/140.0' });
    expect(hijos).toEqual([marco]);
    expect(marco.src).toBe('amatista://isla');
    expect(documento.location.href).toBeUndefined();
    vi.runAllTimers();
    expect(marco.remove).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('en los demás navegadores abre la dirección en la ventana', () => {
    const documento = { location: {} };
    abrirEnlace('amatista://abrir', { documento, agente: 'Mozilla/5.0 Chrome/141.0' });
    expect(documento.location.href).toBe('amatista://abrir');
  });
});
