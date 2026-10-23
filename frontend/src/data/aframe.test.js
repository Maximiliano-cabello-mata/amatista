// Contenido del programa A-Frame (multiplataforma 2026-10-21; dos cursos desde 2026-10-23):
// cada módulo con su mundo, sus retos con solución y sus escenas listas para la vista 3D.
import { describe, expect, it } from 'vitest';
import datosTemas from '../../../practices/blender/temas.json';
import { revisarEscena } from '../motor3d/escena';
import { buscarCurso } from './cursos';

const inicial = buscarCurso('aframe');
const interactivo = buscarCurso('aframe_interactivo');
const aframe = { modulos: [...inicial.modulos, ...interactivo.modulos] };
const bloques = aframe.modulos.flatMap((m) => (m.contenido?.lessons ?? []).flatMap((l) => (l.contentBlocks ?? []).map((b) => ({ m, l, b }))));

describe('curso de A-Frame', () => {
  it('son dos cursos compactos de tres módulos publicados, cada uno con su mundo', () => {
    expect(inicial.modulos.map((m) => m.numero)).toEqual([1, 2, 3]);
    expect(interactivo.modulos.map((m) => m.numero)).toEqual([1, 2, 3]);
    expect([inicial.ruta, interactivo.ruta]).toEqual(['aframe', 'aframe']);
    for (const modulo of aframe.modulos) {
      expect(modulo.contenido, modulo.titulo).toBeTruthy();
      expect(datosTemas.modulos[modulo.id], modulo.id).toBeTruthy();
    }
    expect(new Set(aframe.modulos.map((m) => datosTemas.modulos[m.id])).size).toBe(6);
  });

  it('el Interactivo conserva los ids de lección de los módulos 4 y 5 y suma el del Motor Amatista', () => {
    const ids = interactivo.modulos.map((m) => m.contenido.lessons.map((l) => l.id.split('_')[0]));
    expect(ids.map((lista) => new Set(lista).size)).toEqual([1, 1, 1]);
    expect(ids.map((lista) => lista[0])).toEqual(['af4', 'afm', 'af5']);
    const motor = interactivo.modulos[1].contenido.lessons.flatMap((l) => l.contentBlocks ?? []);
    expect(motor.filter((b) => b.type === 'motor_scene').length).toBeGreaterThanOrEqual(2);
    expect(motor.find((b) => b.type === 'code_challenge' && b.solution.includes('am-reto'))).toBeTruthy();
  });

  it('los mundos 3D de las lecciones son escenas válidas del Motor Web', () => {
    const mundos = bloques.filter(({ b }) => b.type === 'motor_scene');
    expect(mundos.length).toBeGreaterThanOrEqual(5);
    for (const { l, b } of mundos) expect(revisarEscena(b.escena), l.id).toEqual([]);
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
