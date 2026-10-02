import { describe, expect, it } from 'vitest';
import {
  calcularRetos,
  diaCompletada,
  diasRestantesSemana,
  resumenPeriodo,
  resumenSemana,
  seriePorSemana,
  totales,
} from './retos';

// 2026-10-02 es viernes: la semana va del lunes 28 de septiembre al domingo 4 de octubre.
const HOY = '2026-10-02';

// ISO de una hora local (mediodía) de ese día: no depende de la zona horaria de la máquina.
const iso = (fecha, hora = 12) => {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(a, m - 1, d, hora).toISOString();
};

const completada = (fecha, extra = {}) => ({
  completada: true,
  intentos: 0,
  puntaje: null,
  actualizadoEn: iso(fecha),
  completadaEn: iso(fecha),
  ...extra,
});

function progresoCon({ lecciones = {}, actividad = {}, insignias = {} } = {}) {
  return { lecciones, actividad, insignias };
}

describe('fechas de la semana', () => {
  it('cuenta los días que faltan para el lunes, incluido hoy', () => {
    expect(diasRestantesSemana('2026-09-28')).toBe(7); // lunes
    expect(diasRestantesSemana(HOY)).toBe(3); // viernes
    expect(diasRestantesSemana('2026-10-04')).toBe(1); // domingo
  });

  it('lee el día local en que se completó una lección', () => {
    expect(diaCompletada(completada('2026-09-30'))).toBe('2026-09-30');
    expect(diaCompletada({ completada: false, completadaEn: iso('2026-09-30') })).toBeNull();
    expect(diaCompletada({ completada: true, completadaEn: 'no es fecha' })).toBeNull();
    expect(diaCompletada(undefined)).toBeNull();
  });
});

describe('resumen por periodo y semana', () => {
  const progreso = progresoCon({
    lecciones: {
      'blender:l1': completada('2026-09-25'), // semana pasada
      'blender:l2': completada('2026-09-29'),
      'blender:l3': completada('2026-10-02'),
      'blender:l4': { completada: false, intentos: 2, puntaje: 40, actualizadoEn: iso(HOY) },
    },
    actividad: { '2026-09-25': 2, '2026-09-29': 3, '2026-10-01': 1, '2026-10-02': 4, '2026-10-05': 9 },
  });

  it('suma días activos, lecciones y actividades dentro del rango', () => {
    expect(resumenPeriodo(progreso, '2026-09-28', '2026-10-04')).toEqual({ diasActivos: 3, lecciones: 2, actividades: 8 });
    expect(resumenPeriodo(progresoCon(), '2026-09-28', '2026-10-04')).toEqual({ diasActivos: 0, lecciones: 0, actividades: 0 });
  });

  it('separa la semana actual (lunes a domingo) de la anterior', () => {
    const semana = resumenSemana(progreso, HOY);
    expect(semana.desde).toBe('2026-09-28');
    expect(semana.hasta).toBe('2026-10-04');
    expect(semana.lecciones).toBe(2);
    expect(semana.anterior).toEqual({ desde: '2026-09-21', hasta: '2026-09-27', diasActivos: 1, lecciones: 1, actividades: 2 });
  });

  it('arma la serie semanal de la más antigua a la actual', () => {
    const serie = seriePorSemana(progreso, HOY, 3);
    expect(serie.map((s) => s.desde)).toEqual(['2026-09-14', '2026-09-21', '2026-09-28']);
    expect(serie.map((s) => s.lecciones)).toEqual([0, 1, 2]);
    expect(serie.map((s) => s.actual)).toEqual([false, false, true]);
  });
});

describe('totales', () => {
  it('cuenta lecciones, actividades perfectas e insignias', () => {
    const progreso = progresoCon({
      lecciones: {
        'c:a': completada(HOY, { datos: { a: 3, p: 2 } }),
        'c:b': { completada: false, intentos: 0, puntaje: null, datos: { a: 1, p: 1 } },
        'c:c': completada(HOY),
      },
      insignias: { 'c:m1': iso(HOY) },
    });
    expect(totales(progreso)).toEqual({ lecciones: 2, perfectas: 3, resueltas: 4, insignias: 1 });
    expect(totales(undefined)).toEqual({ lecciones: 0, perfectas: 0, resueltas: 0, insignias: 0 });
  });
});

describe('calcularRetos', () => {
  it('un alumno nuevo ve todos los retos en cero', () => {
    const { semanales, logros, renuevaEn } = calcularRetos(progresoCon(), HOY);
    expect(renuevaEn).toBe(3);
    expect(semanales).toHaveLength(4);
    for (const reto of semanales) {
      expect(reto).toMatchObject({ tipo: 'semanal', valor: 0, actual: 0, avance: 0, completado: false });
    }
    expect(logros.map((l) => l.titulo)).toEqual([
      'Resuelve 5 actividades perfectas',
      'Completa tu primera lección',
      'Logra una racha de 3 días',
      'Gana tu primera insignia',
    ]);
    expect(logros.every((l) => l.nivel === 0 && !l.completado)).toBe(true);
  });

  it('mide los retos de la semana con lecciones, días y actividades reales', () => {
    const progreso = progresoCon({
      lecciones: {
        'c:l1': completada('2026-09-30'),
        'c:l2': completada('2026-10-01'),
        'c:l3': completada('2026-10-02'),
        'c:l4': completada('2026-10-02'),
      },
      actividad: { '2026-09-30': 2, '2026-10-01': 3, '2026-10-02': 2 },
    });
    const { semanales } = calcularRetos(progreso, HOY);
    const porId = Object.fromEntries(semanales.map((reto) => [reto.id, reto]));
    // Se pasa de la meta: el avance se topa en 1 y `actual` en la meta.
    expect(porId['lecciones-semana']).toMatchObject({ valor: 4, actual: 3, meta: 3, avance: 1, completado: true });
    expect(porId['dias-semana']).toMatchObject({ valor: 3, completado: true });
    expect(porId['racha-3']).toMatchObject({ valor: 3, completado: true });
    expect(porId['actividades-semana']).toMatchObject({ valor: 7, meta: 10, completado: false });
    expect(porId['actividades-semana'].avance).toBeCloseTo(0.7);
  });

  it('lo de la semana pasada no cuenta para los retos de esta semana', () => {
    const progreso = progresoCon({
      lecciones: { 'c:l1': completada('2026-09-26'), 'c:l2': completada('2026-09-27') },
      actividad: { '2026-09-26': 5, '2026-09-27': 5 },
    });
    const { semanales } = calcularRetos(progreso, HOY);
    expect(semanales.find((r) => r.id === 'lecciones-semana').valor).toBe(0);
    expect(semanales.find((r) => r.id === 'actividades-semana').valor).toBe(0);
    // La racha del fin de semana ya se rompió (ni jueves ni viernes hubo actividad).
    expect(semanales.find((r) => r.id === 'racha-3').valor).toBe(0);
  });

  it('la racha de ayer sigue viva hoy aunque aún no haya actividad', () => {
    const progreso = progresoCon({ actividad: { '2026-09-29': 1, '2026-09-30': 1, '2026-10-01': 1 } });
    const reto = calcularRetos(progreso, HOY).semanales.find((r) => r.id === 'racha-3');
    expect(reto).toMatchObject({ valor: 3, completado: true });
  });

  it('los logros suben de nivel y muestran la siguiente meta', () => {
    const lecciones = {};
    for (let i = 0; i < 6; i += 1) lecciones[`c:l${i}`] = completada('2026-09-01', { datos: { a: 4, p: 3 } });
    const progreso = progresoCon({
      lecciones,
      actividad: { '2026-09-01': 1, '2026-09-02': 1, '2026-09-03': 1, '2026-09-04': 1, '2026-09-05': 1, '2026-09-06': 1, '2026-09-07': 1 },
      insignias: { 'c:m1': iso('2026-09-07') },
    });
    const porId = Object.fromEntries(calcularRetos(progreso, HOY).logros.map((l) => [l.id, l]));
    // 18 perfectas: superó 5 y 15, va por 40.
    expect(porId.perfectas).toMatchObject({ valor: 18, meta: 40, nivel: 2, niveles: 4, completado: false });
    expect(porId.perfectas.titulo).toBe('Resuelve 40 actividades perfectas');
    expect(porId.lecciones).toMatchObject({ valor: 6, meta: 10, nivel: 2 });
    // Mejor racha de 7 días aunque la actual sea 0.
    expect(porId['mejor-racha']).toMatchObject({ valor: 7, meta: 14, nivel: 2 });
    expect(porId.insignias).toMatchObject({ valor: 1, meta: 2, nivel: 1, titulo: 'Gana 2 insignias' });
  });

  it('al cumplir todas las metas el logro queda completo en la última', () => {
    const lecciones = {};
    for (let i = 0; i < 60; i += 1) lecciones[`c:l${i}`] = completada('2026-09-01', { datos: { a: 2, p: 2 } });
    const logro = calcularRetos(progresoCon({ lecciones }), HOY).logros.find((l) => l.id === 'lecciones');
    expect(logro).toMatchObject({ valor: 60, meta: 50, actual: 50, avance: 1, nivel: 5, niveles: 5, completado: true });
  });

  it('tolera progreso vacío o incompleto', () => {
    expect(() => calcularRetos(undefined, HOY)).not.toThrow();
    expect(() => calcularRetos({ lecciones: { 'c:x': null } }, HOY)).not.toThrow();
  });
});
