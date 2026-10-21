// Contenido del curso de A-Frame (multiplataforma, 2026-10-21): cada módulo con su mundo, sus
// retos con solución y sus escenas listas para la vista 3D.
import { describe, expect, it } from 'vitest';
import datosTemas from '../../../practices/blender/temas.json';
import { buscarCurso } from './cursos';

const aframe = buscarCurso('aframe');
const bloques = aframe.modulos.flatMap((m) => (m.contenido?.lessons ?? []).flatMap((l) => (l.contentBlocks ?? []).map((b) => ({ m, l, b }))));

describe('curso de A-Frame', () => {
  it('tiene sus cinco módulos publicados, en orden y cada uno con su mundo', () => {
    expect(aframe.modulos.map((m) => m.numero)).toEqual([1, 2, 3, 4, 5]);
    for (const modulo of aframe.modulos) {
      expect(modulo.contenido, modulo.titulo).toBeTruthy();
      expect(datosTemas.modulos[modulo.id], modulo.id).toBeTruthy();
    }
    expect(new Set(aframe.modulos.map((m) => datosTemas.modulos[m.id])).size).toBe(5);
  });

  it('cada módulo termina con su jefe y trae un reto de código', () => {
    for (const modulo of aframe.modulos) {
      const lecciones = modulo.contenido.lessons;
      expect(lecciones.at(-1).type, modulo.id).toBe('exam');
      expect(lecciones.some((l) => l.contentBlocks?.some((b) => b.type === 'code_challenge')), modulo.id).toBe(true);
    }
  });

  it('las escenas con vista 3D son escenas y solo usan los modelos del curso', () => {
    const escenas = bloques.filter(({ b }) => (b.type === 'code_snippet' && b.preview) || b.type === 'code_challenge');
    expect(escenas.length).toBeGreaterThan(10);
    for (const { l, b } of escenas) {
      for (const codigo of [b.code, b.starter, b.solution].filter(Boolean)) {
        expect(codigo, l.id).toContain('<a-scene');
        for (const [, modelo] of codigo.matchAll(/(?:src="|url\()([^")]+\.glb)/g)) expect(modelo, l.id).toMatch(/^\/modelos\/(cristal|arbol|casa)\.glb$/);
      }
    }
  });

  it('los enlaces de las lecciones van a páginas de la plataforma', () => {
    for (const { l, b } of bloques) {
      for (const [, destino] of String(b.body ?? '').matchAll(/\]\(([^)]+)\)/g)) expect(destino, l.id).toMatch(/^#\/[a-z]/);
    }
  });
});
