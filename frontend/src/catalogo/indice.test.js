import { describe, expect, it } from 'vitest';
import { cursos } from '../data/cursos';
import { DISCIPLINAS, SOFTWARE, softwareDeCurso } from '../data/software';
import { cifrasPorSoftware, coincide, filtrarIndice, filtrosDeConsulta, leccionesDelCatalogo, modulosDelCatalogo, normalizar } from './indice';

const modulos = modulosDelCatalogo(cursos);
const lecciones = leccionesDelCatalogo(modulos);
const idsDisciplinas = DISCIPLINAS.map((d) => d.id);

describe('índice de Explorar', () => {
  it('cada módulo del catálogo tiene programa y disciplinas conocidas', () => {
    expect(modulos.length).toBeGreaterThan(10);
    for (const entrada of modulos) {
      expect(SOFTWARE.map((s) => s.id), entrada.id).toContain(entrada.software);
      expect(entrada.disciplinas.length, entrada.id).toBeGreaterThan(0);
      for (const id of entrada.disciplinas) expect(idsDisciplinas, entrada.id).toContain(id);
    }
  });

  it('A-Frame tiene cinco módulos publicados y Blender sus nueve', () => {
    const cifras = cifrasPorSoftware(modulos);
    expect(cifras.aframe.publicados).toBe(5);
    expect(cifras.blender.publicados).toBe(9);
    expect(cifras.maya).toMatchObject({ cursos: 0, publicados: 0 });
  });

  it('busca sin acentos y con varias palabras en cualquier orden', () => {
    expect(normalizar('  Animación ')).toBe('animacion');
    expect(coincide('la luz del sol', 'SOL luz')).toBe(true);
    expect(coincide('la luz del sol', 'luz luna')).toBe(false);
    const { lecciones: halladas, modulos: suyos } = filtrarIndice(modulos, lecciones, { texto: 'glTF' });
    expect(halladas.length).toBeGreaterThan(0);
    expect(suyos.some((m) => m.id === 'mod_aframe_003')).toBe(true);
  });

  it('filtra por programa y por disciplina', () => {
    const soloAFrame = filtrarIndice(modulos, lecciones, { software: 'aframe' }).modulos;
    expect(soloAFrame.every((m) => m.software === 'aframe')).toBe(true);
    const animacion = filtrarIndice(modulos, lecciones, { disciplina: 'animacion' }).modulos.map((m) => m.software);
    expect(new Set(animacion)).toEqual(new Set(['blender', 'aframe']));
  });

  it('solo acepta filtros conocidos del enlace', () => {
    expect(filtrosDeConsulta({ software: 'aframe', disciplina: 'xr', q: 'luz' }, undefined, idsDisciplinas)).toEqual({ software: 'aframe', disciplina: 'xr', texto: 'luz' });
    expect(filtrosDeConsulta({ software: 'otro', disciplina: '<x>' }, undefined, idsDisciplinas)).toEqual({ software: '', disciplina: '', texto: '' });
  });

  it('cada curso del catálogo pertenece a un programa', () => {
    for (const curso of cursos) expect(softwareDeCurso(curso)?.id, curso.id).toBeTruthy();
  });
});
