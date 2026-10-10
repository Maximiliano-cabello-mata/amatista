import { describe, expect, it } from 'vitest';
import { queHacer } from './queHacer';

const teoria = {
  type: 'theory_interactive',
  contentBlocks: [
    { type: 'markdown_text', body: 'Hola' },
    { type: 'quiz_inline', id: 'q1', question: '¿?', options: [] },
    { type: 'ordering', id: 'o1', items: [] },
  ],
};

describe('qué hacer en la lección', () => {
  it('cuenta las actividades requeridas de la teoría', () => {
    expect(queHacer(teoria)).toBe('Lee, resuelve 2 actividades y pulsa «Completar lección» al final (+100 XP).');
    expect(queHacer({ type: 'theory_reading', contentBlocks: [{ type: 'markdown_text', body: 'x' }] })).toMatch(/^Lee con calma/);
  });

  it('explica el examen con el jefe y el puntaje', () => {
    const examen = { type: 'exam', quizData: { passingScore: 80, questions: [{}, {}, {}] } };
    expect(queHacer(examen, { jefe: 'Gólem' })).toBe(
      'Responde 3 preguntas: cada acierto le quita vida a Gólem. Apruebas con 80% y ganas la insignia del módulo. Si no lo vences, puedes reintentarlo.',
    );
  });

  it('manda a Blender las estaciones', () => {
    expect(queHacer(teoria, { enBlender: true })).toMatch(/^Esta lección se hace en Blender/);
  });

  it('una lección hecha invita a repasar', () => {
    expect(queHacer(teoria, { completada: true })).toMatch(/^Ya completaste/);
    expect(queHacer({ type: 'exam' }, { completada: true })).toMatch(/^Ya venciste/);
    expect(queHacer(null)).toBeNull();
  });
});
