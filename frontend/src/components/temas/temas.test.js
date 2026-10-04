import { describe, expect, it } from 'vitest';
import { cursos } from '../../data/cursos';
import { TEMAS, temaDelModulo, vidaDelJefe } from './temas';

describe('temáticas por módulo', () => {
  it('cada módulo publicado tiene un tema distinto con su jefe', () => {
    const publicados = cursos.flatMap((c) => c.modulos.filter((m) => m.contenido));
    const temas = publicados.map((m) => temaDelModulo(m).id);
    expect(temas).not.toContain('cristal');
    expect(new Set(temas).size).toBe(temas.length);
    for (const id of temas) expect(TEMAS[id].jefe.nombre).toBeTruthy();
  });

  it('un módulo desconocido usa el tema del cristal y el JSON puede elegir otro', () => {
    expect(temaDelModulo({ id: 'otro' }).id).toBe('cristal');
    expect(temaDelModulo({ id: 'otro', contenido: { tema: 'circo' } }).id).toBe('circo');
  });

  it('el jefe pierde un punto por acierto y cae al aprobar', () => {
    expect(vidaDelJefe(5, 0, 80)).toMatchObject({ vida: 4, restante: 4, porcentaje: 100, derrotado: false });
    expect(vidaDelJefe(5, 3, 80)).toMatchObject({ restante: 1, porcentaje: 25, derrotado: false });
    expect(vidaDelJefe(5, 5, 80)).toMatchObject({ restante: 0, derrotado: true, criticos: 1 });
  });
});
