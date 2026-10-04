import { describe, expect, it } from 'vitest';
import { armarCatalogo } from '../data/cursos';
import moduloDos from '../data/modulos/blender-modulo-2.json';
import { estadoPractica, esPracticaBlender, partesDelModulo, practicaDelModulo, practicasDelCatalogo } from './practica';

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
