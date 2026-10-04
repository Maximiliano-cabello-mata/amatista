import { describe, expect, it } from 'vitest';
import { cursos } from '../data/cursos';
import { agruparPorRuta, buscarRuta, estadoNivel, resumenRuta } from './agrupar';

const con = (cursoId, ...ids) => ({
  lecciones: Object.fromEntries(ids.map((id) => [`${cursoId}:${id}`, { completada: true }])),
});

describe('un curso por tarjeta', () => {
  it('Blender es una sola ruta con sus cuatro niveles y A-Frame otra', () => {
    const grupos = agruparPorRuta(cursos);
    expect(grupos.map((g) => g.id)).toEqual(['blender', 'aframe']);
    expect(grupos[0].titulo).toBe('Blender');
    expect(grupos[0].niveles.map((c) => c.id)).toEqual([
      'blender_principiante',
      'blender_principiante_intermedio',
      'blender_intermedio',
      'blender_avanzado',
    ]);
    expect(grupos[1].niveles).toHaveLength(1);
  });

  it('el curso archivado de la v2 no aparece como nivel', () => {
    const conViejo = [{ id: 'blender', ruta: 'blender', titulo: 'Viejo', modulos: [] }, ...cursos];
    const blender = agruparPorRuta(conViejo)[0];
    expect(blender.niveles.map((c) => c.id)).not.toContain('blender');
  });

  it('encuentra la ruta por su id o por el de un nivel', () => {
    expect(buscarRuta(cursos, 'blender')).toMatchObject({ ruta: { id: 'blender' }, nivel: null });
    expect(buscarRuta(cursos, 'blender_principiante_intermedio').nivel.id).toBe('blender_principiante_intermedio');
    expect(buscarRuta(cursos, 'aframe').nivel.id).toBe('aframe');
    expect(buscarRuta(cursos, 'nada')).toBeNull();
  });

  it('resume el avance de la ruta y el estado de cada nivel', () => {
    const blender = agruparPorRuta(cursos)[0];
    const progreso = con('blender_principiante', 'bp1_gancho');
    const resumen = resumenRuta(progreso, blender);
    expect(resumen.completadas).toBe(1);
    expect(resumen.enCurso.curso.id).toBe('blender_principiante');
    expect(estadoNivel(progreso, blender.niveles[0])).toBe('en-curso');
    expect(estadoNivel(progreso, blender.niveles[1])).toBe('disponible');
    expect(estadoNivel(progreso, blender.niveles[3])).toBe('bloqueado');
  });
});
