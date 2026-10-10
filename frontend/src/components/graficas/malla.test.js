import { describe, expect, it } from 'vitest';
import { aristasVisibles, crearMalla, estadisticas, normalCara, proyectar } from './malla';

// Cuentas del panel Estadísticas de Blender para cada primitiva.
describe('crearMalla', () => {
  it.each([
    [{ shape: 'cube' }, { vertices: 8, aristas: 12, caras: 6, triangulos: 12 }],
    [{ shape: 'plane' }, { vertices: 4, aristas: 4, caras: 1, triangulos: 2 }],
    [{ shape: 'cylinder', segments: 32 }, { vertices: 64, aristas: 96, caras: 34, triangulos: 124 }],
    [{ shape: 'cone', segments: 32 }, { vertices: 33, aristas: 64, caras: 33, triangulos: 62 }],
    [{ shape: 'uv_sphere', segments: 32, rings: 16 }, { vertices: 482, aristas: 992, caras: 512, triangulos: 960 }],
    [{ shape: 'ico_sphere', subdivisions: 2 }, { vertices: 42, aristas: 120, caras: 80, triangulos: 80 }],
    [{ shape: 'ico_sphere', subdivisions: 1 }, { vertices: 12, aristas: 30, caras: 20, triangulos: 20 }],
    [{ shape: 'torus', segments: 12, rings: 6 }, { vertices: 72, aristas: 144, caras: 72, triangulos: 144 }],
  ])('%o tiene las cuentas de Blender', (bloque, esperado) => {
    expect(estadisticas(crearMalla(bloque))).toEqual(esperado);
  });

  it('las caras de los sólidos miran hacia afuera', () => {
    for (const shape of ['cube', 'cylinder', 'cone', 'uv_sphere', 'ico_sphere']) {
      const { vertices, caras } = crearMalla({ shape });
      for (const cara of caras) {
        const n = normalCara(vertices, cara);
        const c = cara.reduce((s, i) => s.map((v, k) => v + vertices[i][k]), [0, 0, 0]).map((v) => v / cara.length);
        expect(n[0] * c[0] + n[1] * c[1] + n[2] * c[2]).toBeGreaterThan(0);
      }
    }
  });

  it('limita las caras para no saturar equipos modestos', () => {
    expect(crearMalla({ shape: 'uv_sphere', segments: 48, rings: 24 }).caras.length).toBeLessThanOrEqual(600);
  });

  it('acepta una malla propia válida y rechaza índices fuera de rango', () => {
    const mesh = { vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0]], faces: [[0, 1, 2]] };
    expect(estadisticas(crearMalla({ shape: 'custom', mesh })).aristas).toBe(3);
    expect(crearMalla({ shape: 'custom', mesh: { ...mesh, faces: [[0, 1, 5]] } })).toBeNull();
  });
});

describe('proyectar', () => {
  it('de un cubo visto en diagonal desde arriba se ven 3 caras y 7 vértices', () => {
    const malla = crearMalla({ shape: 'cube' });
    const p = proyectar(malla, { giro: Math.PI / 4, inclinacion: 0.6 });
    expect(p.caras.filter((c) => c.frente)).toHaveLength(3);
    expect(p.vistos.size).toBe(7);
    expect(aristasVisibles(malla, p).filter(Boolean)).toHaveLength(9);
  });

  it('ordena las caras del fondo hacia el frente', () => {
    const p = proyectar(crearMalla({ shape: 'ico_sphere' }), { giro: 1, inclinacion: 0.3 });
    const prof = p.caras.map((c) => c.profundidad);
    expect([...prof].sort((a, b) => b - a)).toEqual(prof);
  });

  it('vista superior: +Y queda arriba en la pantalla, como en Blender', () => {
    const malla = { vertices: [[0, 1, 0], [0, -1, 0], [1, 0, 0]], caras: [[0, 1, 2]], aristas: [] };
    const p = proyectar(malla, { giro: 0, inclinacion: Math.PI / 2, perspectiva: false });
    expect(p.puntos[0].y).toBeLessThan(p.puntos[1].y);
  });
});
