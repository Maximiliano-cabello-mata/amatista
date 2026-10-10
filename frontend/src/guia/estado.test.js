import { describe, expect, it } from 'vitest';
import { CAPITULOS } from '../data/guia';
import { esActividad } from '../components/leccion/interactivos/logica';
import { capituloAbierto, normalizarGuia, superarCapitulo } from './estado';

describe('guía de primeros pasos', () => {
  it('cada capítulo tiene id único, bloques y una comprobación que es actividad', () => {
    const ids = CAPITULOS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const capitulo of CAPITULOS) {
      expect(capitulo.titulo).toBeTruthy();
      expect(capitulo.bloques.length).toBeGreaterThan(0);
      expect(esActividad(capitulo.comprueba)).toBe(true);
      expect(capitulo.comprueba.id).toMatch(/^guia-/);
      if (capitulo.comprueba.type === 'quiz_inline') {
        expect(capitulo.comprueba.options.filter((o) => o.isCorrect)).toHaveLength(1);
      }
    }
  });

  it('normaliza lo guardado', () => {
    expect(normalizarGuia(null, 5)).toEqual({ capitulo: 0, superados: [], completada: false });
    expect(normalizarGuia({ capitulo: 99, superados: ['a', 'a', 3], completada: 1 }, 5)).toEqual({
      capitulo: 5,
      superados: ['a'],
      completada: true,
    });
  });

  it('abre un capítulo al superar el anterior', () => {
    let estado = normalizarGuia(null, CAPITULOS.length);
    expect(capituloAbierto(estado, CAPITULOS, 0)).toBe(true);
    expect(capituloAbierto(estado, CAPITULOS, 1)).toBe(false);
    estado = superarCapitulo(estado, CAPITULOS[0].id);
    expect(capituloAbierto(estado, CAPITULOS, 1)).toBe(true);
    expect(superarCapitulo(estado, CAPITULOS[0].id)).toBe(estado);
  });

  it('con la guía completada todo queda abierto para repasar', () => {
    const estado = normalizarGuia({ completada: true }, CAPITULOS.length);
    expect(capituloAbierto(estado, CAPITULOS, CAPITULOS.length - 1)).toBe(true);
  });
});
