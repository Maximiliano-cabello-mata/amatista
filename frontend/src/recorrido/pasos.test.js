import { describe, expect, it } from 'vitest';
import { mismaRuta, necesitaNavegar, PASOS_RECORRIDO, pasoValido, TOTAL_RECORRIDO, ubicarTarjeta } from './pasos';

describe('recorrido por la plataforma', () => {
  it('tiene paradas cortas con id único y termina en la ayuda', () => {
    const ids = PASOS_RECORRIDO.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(TOTAL_RECORRIDO).toBeLessThanOrEqual(12);
    expect(PASOS_RECORRIDO.at(-1).objetivo).toBe('ayuda');
    for (const p of PASOS_RECORRIDO) {
      expect(p.objetivo).toMatch(/^[a-z-]+$/);
      expect(p.texto.length).toBeLessThanOrEqual(200);
    }
  });

  it('pasa por las tres partes: cursos, Blender y Mi panel', () => {
    const rutas = PASOS_RECORRIDO.map((p) => p.ruta);
    expect(rutas).toContain('#/blender');
    expect(rutas).toContain('#/panel');
    expect(rutas.some((r) => r?.startsWith('#/curso/'))).toBe(true);
  });

  it('compara rutas y decide si navegar', () => {
    expect(mismaRuta('#/', '')).toBe(true);
    expect(mismaRuta('#/', '#')).toBe(true);
    expect(mismaRuta('#/panel', '#/blender')).toBe(false);
    expect(necesitaNavegar({ ruta: '#/panel' }, '#/panel')).toBe(false);
    expect(necesitaNavegar({ ruta: '#/panel' }, '#/')).toBe(true);
    expect(necesitaNavegar({ ruta: null }, '#/')).toBe(false);
  });

  it('no se sale de las paradas', () => {
    expect(pasoValido(-3)).toBe(0);
    expect(pasoValido(99)).toBe(TOTAL_RECORRIDO - 1);
    expect(pasoValido('x')).toBe(0);
  });

  it('pone la tarjeta donde cabe', () => {
    const ventana = { ancho: 1280, alto: 900 };
    expect(ubicarTarjeta(null, ventana).modo).toBe('centro');
    expect(ubicarTarjeta({ top: 100, bottom: 200, left: 50 }, ventana)).toMatchObject({ modo: 'debajo', top: 216, left: 50 });
    expect(ubicarTarjeta({ top: 600, bottom: 800, left: 1200 }, ventana)).toMatchObject({ modo: 'encima', left: 1280 - 420 - 16 });
    expect(ubicarTarjeta({ top: 50, bottom: 850, left: 0 }, ventana).modo).toBe('hoja');
    expect(ubicarTarjeta(null, { ancho: 360, alto: 700 }).ancho).toBe(328);
  });
});
