import { describe, expect, it } from 'vitest';
import { buscarLeccion } from './catalogoBase';
import { cursosIniciales } from './catalogoInicial';
import { conContenido } from './cursos';

describe('lecciones del catálogo inicial', () => {
  it('sin servidor, la lección (y el examen final) se completa con el contenido empaquetado', () => {
    const curso = cursosIniciales.find((c) => c.id === 'blender_principiante');
    const ligera = buscarLeccion(curso, 'bp1_gancho');
    expect(ligera.leccion.contentBlocks).toBeUndefined();
    const completa = conContenido(ligera, curso.id);
    expect(completa.leccion.contentBlocks.length).toBeGreaterThan(0);
    expect(completa.modulo).toBe(ligera.modulo);
  });

  it('todas las lecciones del índice tienen contenido local', () => {
    for (const curso of cursosIniciales) {
      for (const modulo of curso.modulos) {
        for (const leccion of modulo.contenido?.lessons ?? []) {
          const u = conContenido(buscarLeccion(curso, leccion.id), curso.id);
          expect(u.leccion._ligera, `${curso.id}/${leccion.id}`).toBeUndefined();
          const contenido = u.leccion.contentBlocks ?? u.leccion.quizData;
          expect(contenido, `${curso.id}/${leccion.id}`).toBeTruthy();
        }
      }
    }
  });

  it('si la lección ya trae bloques (catálogo del servidor), no la toca', () => {
    const u = { leccion: { id: 'x', contentBlocks: [{ type: 'markdown_text' }] }, modulo: {}, indice: 0 };  // del servidor: sin _ligera
    expect(conContenido(u, 'blender_principiante')).toBe(u);
    expect(conContenido(undefined, 'blender')).toBeUndefined();
  });
});
