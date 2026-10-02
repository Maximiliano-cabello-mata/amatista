import { describe, expect, it } from 'vitest';
import { cursos as cursosApp } from '../../data/cursos';
import {
  cifrasCatalogo,
  cursosParaContinuar,
  estadoModulo,
  examenesDelCatalogo,
  insigniasDelMuro,
  resultadoLeccion,
  tieneAvance,
  ultimaActividadCurso,
} from './datos';

const leccion = (id, extra = {}) => ({ id, title: id, type: 'theory_reading', isLocked: true, ...extra });

function modulo(id, numero, lecciones, extra = {}) {
  return { id, numero, titulo: `Módulo ${id}`, insignia: null, contenido: { id, title: id, lessons: lecciones }, ...extra };
}

const examen = (id, minimo = 80) => leccion(id, { type: 'exam', quizData: { passingScore: minimo, questions: [] } });

const MODULO_A = modulo('ma', 1, [leccion('a1', { isLocked: false }), leccion('a2'), examen('a3')], { insignia: 'Explorador' });
const MODULO_B = modulo('mb', 2, [leccion('b1'), leccion('b2')]);
const PRONTO = { id: 'c-m3', numero: 3, titulo: 'Pronto', insignia: null, contenido: null };
const CURSO_C = { id: 'c', numero: '01', titulo: 'Curso C', estado: 'disponible', modulos: [MODULO_A, MODULO_B, PRONTO] };
const CURSO_D = {
  id: 'd',
  numero: '02',
  titulo: 'Curso D',
  estado: 'disponible',
  modulos: [modulo('md', 1, [leccion('d1', { isLocked: false }), examen('d2', 100)], { insignia: 'Arquitecto' })],
};
const CATALOGO = [CURSO_C, CURSO_D];

const registro = (extra = {}) => ({ completada: true, intentos: 0, puntaje: null, actualizadoEn: '2026-10-01T10:00:00.000Z', ...extra });

function progresoCon(lecciones = {}, insignias = {}) {
  return { lecciones, insignias, actividad: {} };
}

describe('cursosParaContinuar', () => {
  it('sin avance propone los cursos en el orden del catálogo', () => {
    const lista = cursosParaContinuar(progresoCon(), CATALOGO);
    expect(lista.map((c) => c.curso.id)).toEqual(['c', 'd']);
    expect(lista[0].resumen.siguiente.leccion.id).toBe('a1');
    expect(lista[0].ultima).toBeNull();
  });

  it('pone primero el curso trabajado más recientemente', () => {
    const progreso = progresoCon({
      'c:a1': registro({ actualizadoEn: '2026-09-20T10:00:00.000Z' }),
      'd:d1': registro({ actualizadoEn: '2026-10-01T10:00:00.000Z' }),
    });
    const lista = cursosParaContinuar(progreso, CATALOGO);
    expect(lista.map((c) => c.curso.id)).toEqual(['d', 'c']);
    expect(lista[0].resumen.siguiente.leccion.id).toBe('d2');
    expect(lista[1].resumen.siguiente.leccion.id).toBe('a2');
    expect(ultimaActividadCurso(progreso, 'd')).toBe('2026-10-01T10:00:00.000Z');
  });

  it('omite cursos terminados y bloqueados', () => {
    const progreso = progresoCon({ 'd:d1': registro(), 'd:d2': registro({ puntaje: 100 }) });
    const bloqueado = { ...CURSO_C, id: 'x', estado: 'bloqueado' };
    expect(cursosParaContinuar(progreso, [CURSO_D, bloqueado])).toEqual([]);
  });
});

describe('estadoModulo', () => {
  it('distingue próximamente, por empezar, en curso, completado y nuevo', () => {
    expect(estadoModulo(progresoCon(), 'c', PRONTO).estado).toBe('proximamente');
    expect(estadoModulo(progresoCon(), 'c', MODULO_A).estado).toBe('por-empezar');
    expect(estadoModulo(progresoCon({ 'c:a1': registro() }), 'c', MODULO_A)).toMatchObject({
      estado: 'en-curso',
      completadas: 1,
      total: 3,
      porcentaje: 33,
    });
    const todo = progresoCon({ 'c:b1': registro(), 'c:b2': registro() });
    expect(estadoModulo(todo, 'c', MODULO_B).estado).toBe('completado');
  });

  it('marca "nuevo" cuando se agregó una lección a un módulo ya avanzado', () => {
    // Completó a1 y el examen a3; a2 se agregó después (ACOPLE): es nueva.
    const progreso = progresoCon({ 'c:a1': registro(), 'c:a3': registro({ puntaje: 90 }) }, { 'c:ma': '2026-09-01T00:00:00.000Z' });
    expect(estadoModulo(progreso, 'c', MODULO_A)).toMatchObject({ estado: 'nuevo', nuevas: 1 });
  });
});

describe('resultadoLeccion y exámenes', () => {
  it('toma el mejor puntaje y suma intentos de las versiones reemplazadas', () => {
    const nueva = examen('ex2');
    nueva.replaces = ['ex1'];
    const progreso = progresoCon({
      'c:ex1': registro({ completada: false, intentos: 2, puntaje: 70 }),
      'c:ex2': registro({ completada: false, intentos: 1, puntaje: 60 }),
    });
    expect(resultadoLeccion(progreso, 'c', nueva)).toEqual({ mejor: 70, intentos: 3, aprobado: false });
  });

  it('lista los exámenes con su estado', () => {
    const progreso = progresoCon({
      'c:a1': registro(),
      'c:a2': registro(),
      'c:a3': registro({ completada: false, intentos: 2, puntaje: 60 }),
      'd:d1': registro(),
      'd:d2': registro({ intentos: 1, puntaje: 100 }),
    });
    const examenes = examenesDelCatalogo(progreso, CATALOGO);
    expect(examenes.map((e) => [e.leccion.id, e.estado, e.mejor, e.intentos, e.minimo])).toEqual([
      ['a3', 'por-aprobar', 60, 2, 80],
      ['d2', 'aprobado', 100, 1, 100],
    ]);
  });

  it('un examen sin intentos está disponible o bloqueado según el avance', () => {
    const nuevo = examenesDelCatalogo(progresoCon(), CATALOGO);
    expect(nuevo.map((e) => e.estado)).toEqual(['bloqueado', 'bloqueado']);
    const listo = examenesDelCatalogo(progresoCon({ 'd:d1': registro() }), CATALOGO);
    expect(listo[1]).toMatchObject({ estado: 'disponible', desbloqueado: true, mejor: null, intentos: 0 });
  });
});

describe('insigniasDelMuro', () => {
  it('una insignia por módulo con lo que falta para ganarla', () => {
    const progreso = progresoCon({ 'c:a1': registro(), 'c:a3': registro({ completada: false, intentos: 1, puntaje: 50 }) });
    const muro = insigniasDelMuro(progreso, CATALOGO);
    expect(muro.map((i) => i.id)).toEqual(['c:ma', 'c:mb', 'c:c-m3', 'd:md']);
    const [a, b, pronto] = muro;
    expect(a).toMatchObject({ nombre: 'Explorador', ganada: null, proximamente: false });
    expect(a.requisito).toMatchObject({ tipo: 'examen', faltan: 2, minimo: 80, mejor: 50, intentos: 1 });
    expect(a.requisito.leccion.id).toBe('a3');
    // Sin nombre de insignia se usa el título del módulo; sin examen, faltan lecciones.
    expect(b).toMatchObject({ nombre: 'Módulo mb', requisito: { tipo: 'lecciones', faltan: 2 } });
    expect(pronto).toMatchObject({ proximamente: true, requisito: null });
  });

  it('las ganadas llevan su fecha y no se pierden aunque el módulo salga del catálogo', () => {
    const progreso = progresoCon({}, { 'c:ma': '2026-09-30T12:00:00.000Z', 'viejo:mod_retirado': '2026-08-01T12:00:00.000Z' });
    const muro = insigniasDelMuro(progreso, CATALOGO);
    expect(muro.find((i) => i.id === 'c:ma')).toMatchObject({ ganada: '2026-09-30T12:00:00.000Z', requisito: null });
    expect(muro.at(-1)).toMatchObject({ id: 'viejo:mod_retirado', nombre: 'mod_retirado', cursoId: 'viejo', curso: null, ganada: '2026-08-01T12:00:00.000Z' });
  });
});

describe('cifras y avance', () => {
  it('cuenta lo publicado del catálogo', () => {
    expect(cifrasCatalogo(CATALOGO)).toEqual({ cursos: 2, modulos: 3, lecciones: 7, minutos: 0 });
    const app = cifrasCatalogo(cursosApp);
    expect(app.cursos).toBe(cursosApp.length);
    expect(app.lecciones).toBeGreaterThan(0);
  });

  it('detecta si el alumno ya hizo algo', () => {
    expect(tieneAvance(progresoCon())).toBe(false);
    expect(tieneAvance(progresoCon({ 'c:a1': registro({ completada: false, datos: { a: 1, p: 0 } }) }))).toBe(true);
    expect(tieneAvance(progresoCon({ 'c:a3': registro({ completada: false, intentos: 1 }) }))).toBe(true);
  });
});
