import { describe, expect, it } from 'vitest';
import { cursos } from '../data/cursos';
import { cifrasLogros, logrosDelAlumno, TOTAL_LOGROS } from './logros';

const completar = (cursoId, ids, extra = {}) =>
  Object.fromEntries(ids.map((id) => [`${cursoId}:${id}`, { completada: true, ...extra }]));

describe('insignias complementarias progresivas', () => {
  it('son finitas: cinco logros con tres grados', () => {
    expect(TOTAL_LOGROS).toBe(15);
  });

  it('al empezar solo se ve la racha, con su primer grado', () => {
    const logros = logrosDelAlumno({ lecciones: {}, actividad: {} }, cursos, new Date(2026, 9, 4));
    expect(logros.map((l) => l.id)).toEqual(['racha']);
    expect(logros[0].grados.map((g) => g.visible)).toEqual([true, false, false]);
  });

  it('se revelan conforme avanza el curso', () => {
    const progreso = {
      lecciones: completar('blender_principiante', ['bp1_gancho', 'bp1_blender', 'bp1_explora', 'bp1_practica', 'bp1_jefe'], {
        datos: { p: 2 },
      }),
      actividad: { '2026-10-02': 1, '2026-10-03': 2, '2026-10-04': 1 },
    };
    const cifras = cifrasLogros(progreso, cursos, new Date(2026, 9, 4));
    expect(cifras).toMatchObject({ lecciones: 5, blender: 2, jefes: 1, racha: 3, precision: 10 });
    const logros = logrosDelAlumno(progreso, cursos, new Date(2026, 9, 4));
    expect(logros.map((l) => l.id)).toEqual(['racha', 'blender', 'jefes', 'precision', 'niveles']);
    const blender = logros.find((l) => l.id === 'blender');
    expect(blender.ganados).toBe(1);
    expect(blender.siguiente.meta).toBe(4);
    expect(blender.grados.map((g) => g.visible)).toEqual([true, true, false]);
    expect(logros.find((l) => l.id === 'racha').grados[0].ganado).toBe(true);
  });
});
