import { describe, expect, it } from 'vitest';
import { agruparHerramientas, HERRAMIENTAS, nombreHerramienta } from './herramientas';

describe('catálogo de herramientas', () => {
  it('agrupa por categoría en orden y deja lo desconocido en «Otras»', () => {
    const grupos = agruparHerramientas(['quiz_inline', 'markdown_text', 'blender_practice', 'raro', 'step_by_step']);
    expect(grupos.map((g) => g.id)).toEqual(['explicar', 'visualizar', 'practicar', 'blender', 'otras']);
    expect(grupos.at(-1).tipos).toEqual(['raro']);
  });

  it('marca las herramientas nuevas y da nombres legibles', () => {
    const nuevas = Object.keys(HERRAMIENTAS).filter((t) => HERRAMIENTAS[t].nueva);
    expect(nuevas).toEqual(['mesh_viewer', 'node_graph']);
    expect(nombreHerramienta('compare')).toBe('Comparar');
    expect(nombreHerramienta('raro')).toBe('raro');
  });
});
