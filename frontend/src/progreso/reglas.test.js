import { describe, expect, it } from 'vitest';
import { cursos } from '../data/cursos';
import {
  calcularNivel,
  calcularRacha,
  calcularXP,
  claveLeccion,
  estaCompletada,
  estaDesbloqueada,
  fechaLocal,
  idInsignia,
  insigniasPorOtorgar,
  leccionEsNueva,
  moduloCompletado,
  registroLeccion,
  resumenCurso,
  resumenModulo,
  separarClave,
  sumarDias,
  umbralNivel,
} from './reglas';

const leccion = (id, extra = {}) => ({ id, title: id, type: 'theory_reading', isLocked: true, ...extra });

function modulo(id, lecciones, extra = {}) {
  return { id, numero: 1, titulo: id, insignia: 'Insignia', contenido: { id, title: id, lessons: lecciones }, ...extra };
}

function progresoCon(completadas, extra = {}) {
  const lecciones = {};
  for (const clave of completadas) lecciones[clave] = { completada: true, intentos: 0, puntaje: null };
  return { lecciones, insignias: {}, actividad: {}, ...extra };
}

const MODULO = modulo('m1', [
  leccion('l1', { isLocked: false }),
  leccion('l2'),
  leccion('l3'),
  leccion('examen', { type: 'exam' }),
]);
const CURSO = { id: 'c', modulos: [MODULO, { id: 'c-m2', numero: 2, titulo: 'Pronto', contenido: null }] };

describe('claves y registros', () => {
  it('arma y separa la clave curso:lección', () => {
    expect(claveLeccion('blender', 'les_001')).toBe('blender:les_001');
    expect(separarClave('blender:les:raro')).toEqual(['blender', 'les:raro']);
  });

  it('lee el registro de una lección', () => {
    const progreso = progresoCon(['c:l1']);
    expect(registroLeccion(progreso, 'c', 'l1').completada).toBe(true);
    expect(registroLeccion(progreso, 'c', 'l2')).toBeUndefined();
  });
});

describe('estaCompletada', () => {
  it('acepta un id o el objeto lección', () => {
    const progreso = progresoCon(['c:l1']);
    expect(estaCompletada(progreso, 'c', 'l1')).toBe(true);
    expect(estaCompletada(progreso, 'c', leccion('l1'))).toBe(true);
    expect(estaCompletada(progreso, 'c', 'l2')).toBe(false);
  });

  it('con el objeto lección considera replaces', () => {
    const progreso = progresoCon(['c:viejo']);
    const nueva = leccion('nuevo', { replaces: ['viejo'] });
    expect(estaCompletada(progreso, 'c', nueva)).toBe(true);
    // Por id solo cuenta el propio.
    expect(estaCompletada(progreso, 'c', 'nuevo')).toBe(false);
  });
});

describe('estaDesbloqueada', () => {
  it('la primera y las no bloqueadas siempre se abren', () => {
    const progreso = progresoCon([]);
    expect(estaDesbloqueada(progreso, 'c', MODULO, 0)).toBe(true);
    const libre = modulo('m', [leccion('a'), leccion('b', { isLocked: false })]);
    expect(estaDesbloqueada(progreso, 'c', libre, 1)).toBe(true);
  });

  it('se abre al completar la anterior', () => {
    expect(estaDesbloqueada(progresoCon([]), 'c', MODULO, 1)).toBe(false);
    expect(estaDesbloqueada(progresoCon(['c:l1']), 'c', MODULO, 1)).toBe(true);
    expect(estaDesbloqueada(progresoCon(['c:l1']), 'c', MODULO, 2)).toBe(false);
  });

  it('ACOPLE: una lección insertada no bloquea a quien ya avanzó', () => {
    // El alumno completó l1, l2 y l3; después se insertó "nueva" entre l1 y l2.
    const progreso = progresoCon(['c:l1', 'c:l2', 'c:l3']);
    const crecido = modulo('m1', [leccion('l1', { isLocked: false }), leccion('l2'), leccion('nueva'), leccion('l3'), leccion('examen', { type: 'exam' })]);
    // La nueva (índice 2) está abierta por la anterior y el examen sigue abierto.
    expect(estaDesbloqueada(progreso, 'c', crecido, 2)).toBe(true);
    expect(estaDesbloqueada(progreso, 'c', crecido, 4)).toBe(true);

    // Inserción al inicio: alguien que solo completó l2 conserva el acceso a l2.
    const alInicio = modulo('m1', [leccion('intro', { isLocked: false }), leccion('nueva'), leccion('l2'), leccion('l3')]);
    const soloL2 = progresoCon(['c:l2']);
    expect(estaDesbloqueada(soloL2, 'c', alInicio, 1)).toBe(true); // por la posterior completada
    expect(estaDesbloqueada(soloL2, 'c', alInicio, 2)).toBe(true); // ya completada
    expect(estaDesbloqueada(soloL2, 'c', alInicio, 3)).toBe(true); // la anterior está completada
  });

  it('el índice fuera de rango no está desbloqueado', () => {
    expect(estaDesbloqueada(progresoCon([]), 'c', MODULO, 10)).toBe(false);
  });
});

describe('módulos y cursos', () => {
  it('moduloCompletado con replaces y sin contenido', () => {
    expect(moduloCompletado(progresoCon(['c:l1', 'c:l2', 'c:l3', 'c:examen']), 'c', MODULO)).toBe(true);
    expect(moduloCompletado(progresoCon(['c:l1']), 'c', MODULO)).toBe(false);
    expect(moduloCompletado(progresoCon([]), 'c', { id: 'x', contenido: null })).toBe(false);
  });

  it('resumenModulo marca como "nuevas" las pendientes antes de lo ya avanzado', () => {
    const crecido = modulo('m1', [leccion('l1'), leccion('nueva'), leccion('l2')]);
    const progreso = progresoCon(['c:l1', 'c:l2']);
    expect(resumenModulo(progreso, 'c', crecido)).toEqual({ total: 3, completadas: 2, nuevas: 1, porcentaje: 67 });
    expect(leccionEsNueva(progreso, 'c', crecido, 1)).toBe(true);
    // Una pendiente normal (nada posterior completado) no es nueva.
    expect(resumenModulo(progresoCon(['c:l1']), 'c', crecido).nuevas).toBe(0);
  });

  it('con la insignia ganada, toda lección pendiente del módulo es nueva', () => {
    const crecido = modulo('m1', [leccion('l1'), leccion('l2'), leccion('extra')]);
    const progreso = progresoCon(['c:l1', 'c:l2'], { insignias: { [idInsignia('c', crecido)]: '2026-10-01T00:00:00.000Z' } });
    expect(resumenModulo(progreso, 'c', crecido).nuevas).toBe(1);
    // También se puede pasar la lista de insignias.
    expect(resumenModulo(progresoCon(['c:l1', 'c:l2']), 'c', crecido, ['c:m1']).nuevas).toBe(1);
  });

  it('resumenCurso: total, porcentaje y siguiente lección', () => {
    const vacio = resumenCurso(progresoCon([]), CURSO);
    expect(vacio).toMatchObject({ total: 4, completadas: 0, porcentaje: 0 });
    expect(vacio.siguiente.leccion.id).toBe('l1');

    const avanzado = resumenCurso(progresoCon(['c:l1', 'c:l2']), CURSO);
    expect(avanzado).toMatchObject({ total: 4, completadas: 2, porcentaje: 50 });
    expect(avanzado.siguiente.leccion.id).toBe('l3');

    expect(resumenCurso(progresoCon(['c:l1', 'c:l2', 'c:l3', 'c:examen']), CURSO).siguiente).toBeNull();
  });

  it('resumenCurso no desvía hacia una lección nueva ya superada', () => {
    const curso = {
      id: 'c',
      modulos: [modulo('m1', [leccion('l1'), leccion('nueva'), leccion('l2'), leccion('l3')])],
    };
    const { siguiente, porcentaje } = resumenCurso(progresoCon(['c:l1', 'c:l2']), curso);
    expect(siguiente.leccion.id).toBe('l3');
    expect(porcentaje).toBe(50);
  });

  it('si se agrega una lección, el % baja pero lo completado se conserva', () => {
    const progreso = progresoCon(['c:l1', 'c:l2', 'c:l3', 'c:examen']);
    expect(resumenCurso(progreso, CURSO).porcentaje).toBe(100);
    const crecido = { id: 'c', modulos: [modulo('m1', [...MODULO.contenido.lessons, leccion('extra')])] };
    const resumen = resumenCurso(progreso, crecido);
    expect(resumen.porcentaje).toBe(80);
    expect(resumen.completadas).toBe(4);
    expect(calcularXP(progreso)).toBe(400);
  });

  it('funciona con el catálogo empaquetado', () => {
    for (const curso of cursos.filter((c) => c.estado !== 'bloqueado')) {
      const resumen = resumenCurso(progresoCon([]), curso);
      expect(resumen.total).toBeGreaterThan(0);
      expect(resumen.siguiente.indice).toBe(0);
    }
  });
});

describe('insigniasPorOtorgar', () => {
  it('otorga la insignia al aprobar el examen final', () => {
    expect(insigniasPorOtorgar(progresoCon(['c:l1']), [CURSO])).toEqual([]);
    expect(insigniasPorOtorgar(progresoCon(['c:examen']), [CURSO])).toEqual(['c:m1']);
  });

  it('no repite insignias ya ganadas', () => {
    const progreso = progresoCon(['c:examen'], { insignias: { 'c:m1': '2026-10-01T00:00:00.000Z' } });
    expect(insigniasPorOtorgar(progreso, [CURSO])).toEqual([]);
  });

  it('sin examen, la insignia se gana con el módulo completo', () => {
    const sinExamen = { id: 'c', modulos: [modulo('m9', [leccion('a'), leccion('b')])] };
    expect(insigniasPorOtorgar(progresoCon(['c:a']), [sinExamen])).toEqual([]);
    expect(insigniasPorOtorgar(progresoCon(['c:a', 'c:b']), [sinExamen])).toEqual(['c:m9']);
  });
});

describe('XP', () => {
  it('100 por lección + puntaje + 10 por actividad perfecta', () => {
    const progreso = {
      lecciones: {
        'c:l1': { completada: true, intentos: 0, puntaje: null, datos: { a: 3, p: 2 } },
        'c:examen': { completada: true, intentos: 2, puntaje: 90 },
        'c:l2': { completada: false, intentos: 1, puntaje: 40 },
      },
    };
    expect(calcularXP(progreso)).toBe(100 + 20 + 100 + 90);
  });

  it('es monotónico: cuenta lecciones que ya no están en el catálogo', () => {
    const progreso = progresoCon(['c:l1', 'c:retirada']);
    expect(calcularXP(progreso)).toBe(200);
  });

  it('tolera progreso vacío o datos raros', () => {
    expect(calcularXP(undefined)).toBe(0);
    expect(calcularXP({ lecciones: { 'c:x': { completada: true, puntaje: 'abc', datos: { p: -3 } } } })).toBe(100);
  });
});

describe('nivel', () => {
  it('umbrales crecientes', () => {
    const umbrales = [1, 2, 3, 4, 5, 6].map(umbralNivel);
    expect(umbrales).toEqual([0, 250, 650, 1200, 1900, 2750]);
  });

  it('calcula nivel, avance y título', () => {
    expect(calcularNivel(0)).toEqual({ nivel: 1, xpNivel: 0, xpSiguiente: 250, faltan: 250, avance: 0, titulo: 'Aprendiz' });
    const n2 = calcularNivel(450);
    expect(n2).toMatchObject({ nivel: 2, xpNivel: 200, xpSiguiente: 400, faltan: 200, titulo: 'Modelador' });
    expect(n2.avance).toBeCloseTo(0.5);
    expect(calcularNivel(1200)).toMatchObject({ nivel: 4, xpNivel: 0, titulo: 'Arquitecto' });
    expect(calcularNivel(1900).titulo).toBe('Maestro del Cristal');
    expect(calcularNivel(100000).titulo).toBe('Leyenda del Cristal');
    expect(calcularNivel(-5).nivel).toBe(1);
  });
});

describe('fechas y racha', () => {
  it('fechaLocal usa la fecha local, no UTC', () => {
    expect(fechaLocal(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(fechaLocal(new Date(2026, 11, 31, 0, 1))).toBe('2026-12-31');
    expect(fechaLocal('2026-03-01')).toBe('2026-03-01');
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28');
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('racha actual, mejor y hoy', () => {
    const actividad = {
      '2026-09-20': 2,
      '2026-09-21': 1,
      '2026-09-22': 4,
      '2026-09-23': 1,
      '2026-09-30': 1,
      '2026-10-01': 3,
      '2026-10-02': 1,
    };
    expect(calcularRacha(actividad, '2026-10-02')).toEqual({ actual: 3, mejor: 4, hoy: true });
    expect(calcularRacha(actividad, new Date(2026, 9, 2, 10))).toEqual({ actual: 3, mejor: 4, hoy: true });
  });

  it('si hoy no hay actividad, la racha de ayer sigue viva', () => {
    const actividad = { '2026-10-01': 1, '2026-09-30': 1 };
    expect(calcularRacha(actividad, '2026-10-02')).toEqual({ actual: 2, mejor: 2, hoy: false });
    expect(calcularRacha(actividad, '2026-10-03')).toEqual({ actual: 0, mejor: 2, hoy: false });
  });

  it('sin actividad', () => {
    expect(calcularRacha({}, '2026-10-02')).toEqual({ actual: 0, mejor: 0, hoy: false });
    expect(calcularRacha(undefined, '2026-10-02')).toEqual({ actual: 0, mejor: 0, hoy: false });
  });
});
