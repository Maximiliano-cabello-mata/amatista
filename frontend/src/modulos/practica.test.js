import { describe, expect, it } from 'vitest';
import { armarCatalogo } from '../data/cursos';
import moduloDos from '../data/modulos/archivo/blender-modulo-2.json';
import moduloBp1 from '../data/modulos/blender_principiante-modulo-1.json';
import {
  estadoPractica,
  estadoPracticaEn,
  esPracticaBlender,
  partesDelModulo,
  practicaDelModulo,
  practicasDelCatalogo,
  practicasDelModulo,
  secuenciaDelModulo,
} from './practica';

const modulo = { id: moduloDos.module.id, contenido: moduloDos.module };
const progresoCon = (...ids) => ({
  lecciones: Object.fromEntries(ids.map((id) => [`blender:${id}`, { completada: true }])),
});

describe('práctica en Blender dentro del módulo', () => {
  it('encuentra la práctica del módulo 2 al final', () => {
    const practica = practicaDelModulo(modulo);
    expect(practica.leccion.id).toBe('les_103');
    expect(practica.bloque.practica).toBe('blender.n1.mesa');
    expect(esPracticaBlender(moduloDos.module.lessons[0])).toBe(false);
  });

  it('separa las lecciones de la práctica', () => {
    const { antes, practica, despues } = partesDelModulo(modulo);
    expect(antes.map(({ leccion }) => leccion.id)).toEqual(['les_101', 'les_102']);
    expect(practica.indice).toBe(2);
    expect(despues).toEqual([]);
  });

  it('se abre al terminar las lecciones del módulo', () => {
    expect(estadoPractica(progresoCon(), 'blender', modulo)).toMatchObject({ estado: 'bloqueada', faltan: 2 });
    expect(estadoPractica(progresoCon('les_101'), 'blender', modulo)).toMatchObject({ estado: 'bloqueada', faltan: 1 });
    expect(estadoPractica(progresoCon('les_101', 'les_102'), 'blender', modulo).estado).toBe('abierta');
    expect(estadoPractica(progresoCon('les_101', 'les_102', 'les_103'), 'blender', modulo).estado).toBe('hecha');
  });

  it('un módulo sin práctica no tiene estado', () => {
    expect(estadoPractica(progresoCon(), 'blender', { contenido: { lessons: [{ id: 'a', contentBlocks: [] }] } })).toBeNull();
  });

  it('lista las prácticas del catálogo con su curso y módulo', () => {
    const cursos = armarCatalogo(
      [{ id: 'blender', modulos: [{ titulo: 'Uno' }, { titulo: 'Dos' }] }],
      { 'blender-modulo-2.json': { module: { ...moduloDos.module, estado: 'publicado' } } },
    );
    const lista = practicasDelCatalogo(cursos);
    expect(lista).toHaveLength(1);
    expect(lista[0].modulo.numero).toBe(2);
    expect(lista[0].curso.id).toBe('blender');
  });
});

describe('teoría y Blender intercalados (v3.2)', () => {
  const bp1 = { id: moduloBp1.module.id, contenido: moduloBp1.module };
  const con = (...ids) => ({
    lecciones: Object.fromEntries(ids.map((id) => [`blender_principiante:${id}`, { completada: true }])),
  });

  it('el módulo 1 va teoría · Blender · teoría · Blender · examen', () => {
    const secuencia = secuenciaDelModulo(bp1).map(({ tipo, leccion }) => (tipo === 'practica' ? 'blender' : leccion.type));
    expect(secuencia).toEqual(['theory_interactive', 'blender', 'theory_interactive', 'blender', 'exam']);
    const practicas = practicasDelModulo(bp1);
    expect(practicas.map((p) => [p.bloque.practica, p.cierre])).toEqual([
      ['blender.bp.m1.explora', false],
      ['blender.bp.m1.tren', true],
    ]);
  });

  it('cada práctica se abre al terminar lo anterior y no se marca sin el add-on', () => {
    expect(estadoPracticaEn(con(), 'blender_principiante', bp1, 1)).toMatchObject({ estado: 'bloqueada', faltan: 1 });
    expect(estadoPracticaEn(con('bp1_gancho'), 'blender_principiante', bp1, 1).estado).toBe('abierta');
    expect(estadoPracticaEn(con('bp1_gancho'), 'blender_principiante', bp1, 3)).toMatchObject({ estado: 'bloqueada', faltan: 2 });
    expect(estadoPracticaEn(con('bp1_gancho'), 'blender_principiante', bp1, 0)).toBeNull();
    expect(practicasDelModulo(bp1).every((p) => p.bloque.allowManual === false)).toBe(true);
  });
});
