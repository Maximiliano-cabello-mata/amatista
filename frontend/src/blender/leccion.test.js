import { describe, expect, it } from 'vitest';
import { claseDeLeccion, datosLeccion, queSigue } from './leccion';
import { vivoDelTaller } from './taller';

const modulo = { contenido: { lessons: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] } };

describe('la lección le dice a Blender dónde va (motor 6.1)', () => {
  it('arma la orden «leccion» con los campos que valida el servidor', () => {
    const ubicacion = { modulo, leccion: { id: 'b', title: 'Extruir', type: 'lesson' }, indice: 1 };
    expect(datosLeccion({ id: 'blender_principiante' }, ubicacion)).toEqual({
      curso: 'blender_principiante',
      leccion: 'b',
      titulo: 'Extruir',
      clase: 'teoria',
      numero: 2,
      total: 3,
    });
    expect(datosLeccion(null, ubicacion)).toBeNull();
  });

  it('clasifica la lección', () => {
    expect(claseDeLeccion({ type: 'exam' })).toBe('examen');
    expect(claseDeLeccion({ type: 'lesson', contentBlocks: [] })).toBe('teoria');
  });

  it('pasa sola a la siguiente solo si no quedan actividades', () => {
    expect(queSigue({ bloqueado: false })).toBe('siguiente');
    expect(queSigue({ bloqueado: true })).toBe('pendiente');
  });

  it('el vivo trae la ficha que Blender está presentando', () => {
    const vivo = vivoDelTaller({ taller: 't', estado: 'presentando', ficha: { id: 'transform.scale', nombre: 'Escalar' } });
    expect(vivo.estado).toBe('presentando');
    expect(vivo.ficha).toEqual({ id: 'transform.scale', nombre: 'Escalar' });
    expect(vivoDelTaller({ taller: 't' }).ficha).toBeNull();
  });
});
