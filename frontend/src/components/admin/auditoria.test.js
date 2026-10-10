import { describe, expect, it } from 'vitest';
import { cursos as CATALOGO } from '../../data/cursos';
import { auditarCatalogo, avanceRevision, claveRevision, informeMarkdown, marcarRevision, recorrerCatalogo } from './auditoria';

const leccion = (id, extra = {}) => ({
  id,
  title: `Lección ${id}`,
  type: 'theory_interactive',
  durationSeconds: 300,
  contentBlocks: [{ type: 'markdown_text', body: 'Hola' }],
  ...extra,
});
const examen = (id, preguntas) => ({
  id,
  title: 'Jefe',
  type: 'exam',
  durationSeconds: 300,
  quizData: { passingScore: 80, questions: preguntas },
});
const pregunta = (correctas) => ({ options: [{ isCorrect: correctas > 0 }, { isCorrect: correctas > 1 }] });
const curso = (modulos, estado = 'disponible') => ({
  id: 'c1',
  titulo: 'Curso',
  estado,
  modulos: modulos.map((lecciones, i) => ({ id: `m${i + 1}`, numero: i + 1, insignia: 'Insignia', contenido: lecciones && { lessons: lecciones } })),
});

describe('auditoría del catálogo', () => {
  it('un catálogo sano no tiene errores', () => {
    const hallazgos = auditarCatalogo([curso([[leccion('a'), examen('b', [pregunta(1)])]])]);
    expect(hallazgos).toEqual([]);
  });

  it('encuentra errores y avisos, con los errores primero', () => {
    const hallazgos = auditarCatalogo([
      curso([
        [
          leccion('a', { durationSeconds: 0 }),
          leccion('b', { contentBlocks: [] }),
          leccion('c', { contentBlocks: [{ type: 'quiz_inline', options: [{ isCorrect: false }] }, { type: 'image', src: 'x.png' }] }),
          examen('d', [pregunta(0), pregunta(2)]),
        ],
        [leccion('a')],
      ]),
    ]);
    const textos = hallazgos.map((h) => `${h.gravedad}:${h.leccion}:${h.texto}`);
    expect(textos).toEqual([
      'error:b:La lección no tiene contenido.',
      'error:c:Bloque 1 (quiz_inline): la pregunta no tiene respuesta correcta.',
      'error:d:La pregunta 1 del examen tiene 0 respuestas correctas (debe tener 1).',
      'error:d:La pregunta 2 del examen tiene 2 respuestas correctas (debe tener 1).',
      'error:a:El id «a» se repite en el curso (también en el módulo 1).',
      'aviso:a:La lección no indica su duración.',
      'aviso:c:Bloque 1 (quiz_inline): la actividad no tiene id y su resultado no se guarda.',
      'aviso:c:Bloque 2 (image): la imagen no tiene texto alternativo.',
      'aviso:null:El módulo no termina con un jefe final (examen).',
    ]);
    expect(hallazgos[0].href).toBe('#/curso/c1/leccion/b');
  });

  it('ignora los cursos bloqueados y los módulos sin publicar', () => {
    expect(auditarCatalogo([curso([[leccion('a', { contentBlocks: [] })]], 'bloqueado')])).toEqual([]);
    expect(auditarCatalogo([curso([null])])).toEqual([]);
  });

  it('el catálogo que viaja en la app no tiene errores', () => {
    expect(auditarCatalogo(CATALOGO).filter((h) => h.gravedad === 'error')).toEqual([]);
  });
});

describe('revisión a mano', () => {
  const cursos = [curso([[leccion('a'), leccion('b'), examen('c', [pregunta(1)])]])];

  it('marca, desmarca y cuenta', () => {
    let revision = marcarRevision({}, claveRevision('c1', 'a'), 'ok', '', 'f');
    revision = marcarRevision(revision, claveRevision('c1', 'b'), 'cambios', '  Falta imagen  ', 'f');
    expect(revision['c1:b']).toEqual({ estado: 'cambios', nota: 'Falta imagen', fecha: 'f' });
    expect(avanceRevision(cursos, revision)).toEqual({ total: 3, revisadas: 1, cambios: 1, pendientes: 1 });
    expect(marcarRevision(revision, 'c1:a', null)).not.toHaveProperty('c1:a');
    expect(recorrerCatalogo(cursos)).toHaveLength(3);
  });

  it('exporta un informe en Markdown', () => {
    const revision = marcarRevision({}, 'c1:b', 'cambios', 'Falta imagen', 'f');
    const texto = informeMarkdown({ cursos, hallazgos: [], revision, fecha: new Date('2026-10-10T12:00:00Z') });
    expect(texto).toContain('# Auditoría de Amatista · 2026-10-10');
    expect(texto).toContain('0 revisadas, 1 con cambios pendientes y 2 sin revisar de 3 lecciones');
    expect(texto).toContain('- Curso › módulo 1 › Lección b: Falta imagen');
  });
});
