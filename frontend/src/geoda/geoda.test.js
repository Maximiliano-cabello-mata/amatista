import { describe, expect, it } from 'vitest';
import { clasificar, tipoDeGpu } from './niveles';
import { elegir } from './perfiles';
import { decidir, scriptBlender } from './plan';
import { aplicarGeoda, deshacerGeoda, leerGeoda } from './ajustes';

const integrada = { so: 'Windows', ramGb: 8, gpu: { nombre: 'Intel(R) UHD Graphics 620' }, opengl: 4.6 };

describe('Geoda en la plataforma', () => {
  it('clasifica como el cerebro de G7B', () => {
    expect(clasificar({ movil: true }).nivel).toBe('N0');
    expect(clasificar({ ...integrada, opengl: 3.3 }).nivel).toBe('N1');
    expect(clasificar({ ...integrada, ramGb: 4 }).nivel).toBe('N1');
    expect(clasificar(integrada)).toMatchObject({ nivel: 'N2', confianza: 'alta' });
    expect(clasificar({ ...integrada, gpu: { nombre: 'GTX 1650', vramGb: 4 } }).nivel).toBe('N3');
    expect(clasificar({ ...integrada, ramGb: 32, gpu: { nombre: 'RTX 3060', vramGb: 12 } }).nivel).toBe('N4');
    expect(clasificar({ so: 'Linux' })).toMatchObject({ nivel: 'N2', confianza: 'baja' });
    expect(tipoDeGpu('ANGLE (NVIDIA GeForce RTX 3060)')).toBe('dedicada');
  });

  it('prefiere el perfil medido sobre la regla base', () => {
    expect(elegir('N2').estado).toBe('base');
    const medido = { perfiles: [{ nivel: 'N2', perfil: 'completo', estado: 'confiable', version: '4.5' }] };
    expect(elegir('N2', medido)).toMatchObject({ perfil: 'completo', estado: 'confiable' });
  });

  it('el plan trae acciones, ajustes para Amatista y un script que se deshace', () => {
    const plan = decidir(integrada);
    expect(plan.contrato).toBe('g7b.plan/1');
    expect(plan.acciones.map((a) => a.ruta)).toContain('scene.render.simplify_subdivision');
    expect(plan.amatista).toEqual({ ligero: false, texturas: '1k' });
    const script = scriptBlender(plan);
    expect(script).toContain("('scene.render.use_simplify', True)");
    expect(script).toContain('DESHACE');
    expect(decidir({ movil: true })).toMatchObject({ donde: 'editor_web', acciones: [], amatista: { ligero: true, texturas: '512' } });
  });

  it('aplica y deshace en la página', () => {
    const datos = new Map();
    const almacen = { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v), removeItem: (k) => datos.delete(k) };
    const clases = new Set();
    const documento = { documentElement: { dataset: {}, classList: { contains: (c) => clases.has(c), toggle: (c, si) => (si ? clases.add(c) : clases.delete(c)) } } };
    aplicarGeoda(decidir({ ...integrada, ramGb: 4 }), { almacen, documento });
    expect(clases.has('ligero')).toBe(true);
    expect(leerGeoda(almacen)).toMatchObject({ nivel: 'N1', texturas: '512' });
    deshacerGeoda({ almacen, documento });
    expect(clases.has('ligero')).toBe(false);
    expect(leerGeoda(almacen)).toBeNull();
  });
});
