import { describe, expect, it } from 'vitest';
import { conoceDelEnlace, estadoPractica, IDS_ADDON, PRACTICAS_ADDON, siguientePractica, TEXTO_CONOCE } from './conoce';

const recorrido = (extra = {}) => ({
  id: 'vista', nombre: 'Muévete y usa tus herramientas', hechos: ['pestana'], activo: true, hecho: false,
  paso: 2, total: 10, titulo: 'Elige el cubo', texto: 'Antes de cambiar algo, lo eliges.', hacer: 'Haz clic.',
  teclas: ['Clic'], pasos: [{ titulo: 'Mira alrededor', ok: true }], ...extra,
});
const enlace = (...blender) => ({ enlace: true, blender });

describe('Conoce Amatista Motor desde la plataforma', () => {
  it('son tres prácticas, en el orden del add-on', () => {
    expect(IDS_ADDON).toEqual(['pestana', 'vista', 'taller']);
    for (const p of PRACTICAS_ADDON) expect(p.temas.length).toBeGreaterThanOrEqual(4);
  });

  it('lee el estado del Blender del alumno', () => {
    expect(conoceDelEnlace(null).estado).toBe('sin_enlace');
    expect(conoceDelEnlace({ enlace: false }).estado).toBe('sin_enlace');
    expect(conoceDelEnlace(enlace()).estado).toBe('cerrado');
    expect(conoceDelEnlace(enlace({ en_linea: false, detalle: { recorrido: recorrido() } })).estado).toBe('cerrado');
    // Un add-on 5.1 manda el recorrido sin id: hay que reinstalar.
    expect(conoceDelEnlace(enlace({ en_linea: true, detalle: { recorrido: recorrido({ id: undefined }) } })).estado).toBe('viejo');
    const vivo = conoceDelEnlace(enlace({ en_linea: true, detalle: { recorrido: recorrido() } }));
    expect(vivo).toMatchObject({ estado: 'en_curso', actual: 'vista', hechos: ['pestana'] });
    expect(vivo.vivo.titulo).toBe('Elige el cubo');
    const quieto = conoceDelEnlace(enlace({ en_linea: true, detalle: { recorrido: recorrido({ activo: false, hechos: ['taller', 'pestana', 'otra'] }) } }));
    expect(quieto).toMatchObject({ estado: 'abierto', actual: null, hechos: ['pestana', 'taller'] });
  });

  it('dice qué toca y el estado de cada tarjeta', () => {
    expect(siguientePractica([])).toBe('pestana');
    expect(siguientePractica(['pestana'])).toBe('vista');
    expect(siguientePractica(IDS_ADDON)).toBeNull();
    const conoce = { actual: 'vista', hechos: ['pestana'] };
    expect(estadoPractica('pestana', conoce)).toBe('hecha');
    expect(estadoPractica('vista', conoce)).toBe('en-curso');
    expect(estadoPractica('taller', conoce)).toBe('pendiente');
    expect(estadoPractica('vista', { actual: null, hechos: ['pestana'] })).toBe('siguiente');
    expect(estadoPractica('pestana', null)).toBe('siguiente');
  });

  it('tiene un texto para cada estado', () => {
    for (const estado of ['sin_enlace', 'cerrado', 'viejo', 'abierto', 'en_curso']) expect(TEXTO_CONOCE[estado]).toBeTruthy();
  });
});
