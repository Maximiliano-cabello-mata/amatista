import { describe, expect, it } from 'vitest';
import aframe1 from '../../../data/modulos/aframe-modulo-1.json';
import blender1 from '../../../data/modulos/archivo/blender-modulo-1.json';
import {
  actividadesDe,
  cumpleRevision,
  geometriaDe,
  metaCumplida,
  mezclarDistinto,
  mover,
  normalizarColor,
  normalizarControl,
  partesPlantilla,
  posicionesCorrectas,
  respuestaCorrecta,
  semillaDe,
  textoPlano,
  TIPOS_INTERACTIVOS,
  valoresIniciales,
} from './logica';

describe('actividadesDe', () => {
  it('cuenta los interactivos y las tarjetas; required:false no es requerida', () => {
    const actividades = actividadesDe([
      { type: 'markdown_text', body: 'hola' },
      { type: 'concept_cards', items: [] },
      { type: 'quiz_inline', id: 'q1' },
      { type: 'ordering', id: 'o1', required: false },
      { type: 'tipo_futuro', id: 'x' },
    ]);
    expect(actividades.map((a) => [a.clave, a.indice, a.requerida, a.registrable])).toEqual([
      ['bloque-1', 1, true, false],
      ['q1', 2, true, true],
      ['o1', 3, false, true],
    ]);
  });

  it('tolera lecciones sin bloques', () => {
    expect(actividadesDe(undefined)).toEqual([]);
  });
});

describe('mezclas y orden', () => {
  it('mezclarDistinto nunca devuelve la lista ya ordenada y es estable con la misma semilla', () => {
    const lista = ['a', 'b', 'c', 'd'];
    for (let semilla = 0; semilla < 200; semilla++) {
      const mezclada = mezclarDistinto(lista, semilla);
      expect(mezclada).not.toEqual(lista);
      expect([...mezclada].sort()).toEqual(lista);
      expect(mezclarDistinto(lista, semilla)).toEqual(mezclada);
    }
    expect(semillaDe('orden_1')).toBe(semillaDe('orden_1'));
  });

  it('mover y posicionesCorrectas', () => {
    expect(mover(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    const igual = ['a', 'b'];
    expect(mover(igual, 0, 5)).toBe(igual);
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(posicionesCorrectas(['a', 'c', 'b'], items)).toEqual([true, false, false]);
  });
});

describe('fill_blanks', () => {
  it('separa texto y huecos con alternativas', () => {
    expect(partesPlantilla('<a-[[box]] color="[[red|#ff0000]]">')).toEqual([
      { tipo: 'texto', texto: '<a-' },
      { tipo: 'hueco', indice: 0, respuestas: ['box'] },
      { tipo: 'texto', texto: ' color="' },
      { tipo: 'hueco', indice: 1, respuestas: ['red', '#ff0000'] },
      { tipo: 'texto', texto: '">' },
    ]);
  });

  it('compara sin mayúsculas ni espacios extra', () => {
    expect(respuestaCorrecta('  Free   BLENDER ', ['free blender'])).toBe(true);
    expect(respuestaCorrecta('#FF0000', ['red', '#ff0000'])).toBe(true);
    expect(respuestaCorrecta('rojo', ['red'])).toBe(false);
  });
});

describe('scene_explorer', () => {
  it('completa los controles con valores por defecto', () => {
    expect(normalizarControl({ param: 'segments', label: 'Segmentos' })).toMatchObject({ tipo: 'range', min: 3, max: 32 });
    expect(normalizarControl({ param: 'wireframe', label: 'Alambre' })).toMatchObject({ tipo: 'toggle', defecto: false });
    const valores = valoresIniciales([{ param: 'segments', label: 'S', min: 3, max: 32, default: 32 }]);
    expect(valores.segments).toBe(32);
    expect(valores.color).toBe('#9B59B6');
  });

  it('evalúa la meta en vivo', () => {
    const meta = { param: 'segments', op: '<=', value: 8, text: 'Baja a 8' };
    expect(metaCumplida(meta, { segments: 32 })).toBe(false);
    expect(metaCumplida(meta, { segments: 8 })).toBe(true);
    expect(metaCumplida({ param: 'wireframe', op: '==', value: true }, { wireframe: true })).toBe(true);
    expect(metaCumplida({ param: 'color', op: '==', value: 'red' }, { color: '#FF0000' })).toBe(true);
    expect(metaCumplida(undefined, { segments: 1 })).toBe(false);
  });

  it('traduce segmentos a la geometría de cada primitiva', () => {
    expect(geometriaDe('sphere', 8)).toMatchObject({ primitive: 'sphere', segmentsWidth: 8, segmentsHeight: 4 });
    expect(geometriaDe('cylinder', 2)).toMatchObject({ segmentsRadial: 3 });
    expect(geometriaDe('icosahedron', 9)).toMatchObject({ detail: 5 });
    expect(geometriaDe('box', 40)).toMatchObject({ segmentsWidth: 20 });
  });
});

// Documento falso con lo mínimo de DOMParser (vitest corre en node).
function documentoFalso(elementos) {
  return {
    querySelectorAll(selector) {
      if (selector === '!!') throw new Error('selector inválido');
      return selector
        .split(',')
        .map((parte) => parte.trim())
        .flatMap((parte) => elementos.filter((e) => e.etiqueta === parte));
    },
  };
}

const elemento = (etiqueta, atributos = {}, texto = '') => ({
  etiqueta,
  textContent: texto,
  getAttribute: (nombre) => (nombre in atributos ? atributos[nombre] : null),
});

describe('cumpleRevision (code_challenge)', () => {
  const documento = documentoFalso([
    elemento('a-box', { color: '#F00', position: '0 1 -3' }),
    elemento('a-sphere', { radius: '1.25', visible: '' }),
    elemento('h1', {}, 'Hola Mundo'),
  ]);

  it('selector y min', () => {
    expect(cumpleRevision(documento, { selector: 'a-box' })).toBe(true);
    expect(cumpleRevision(documento, { selector: 'a-cone' })).toBe(false);
    expect(cumpleRevision(documento, { selector: 'a-box, a-sphere', min: 2 })).toBe(true);
    expect(cumpleRevision(documento, { selector: 'a-box', min: 2 })).toBe(false);
    expect(cumpleRevision(documento, { selector: 'a-cone', min: 0 })).toBe(true);
  });

  it('attr, equals (colores y números) y contains', () => {
    expect(cumpleRevision(documento, { selector: 'a-box', attr: 'position' })).toBe(true);
    expect(cumpleRevision(documento, { selector: 'a-box', attr: 'rotation' })).toBe(false);
    expect(cumpleRevision(documento, { selector: 'a-box', attr: 'color', equals: 'red' })).toBe(true);
    expect(cumpleRevision(documento, { selector: 'a-box', attr: 'color', equals: 'blue' })).toBe(false);
    expect(cumpleRevision(documento, { selector: 'a-sphere', attr: 'radius', equals: 1.25 })).toBe(true);
    expect(cumpleRevision(documento, { selector: 'a-sphere', attr: 'visible', equals: true })).toBe(true);
    expect(cumpleRevision(documento, { selector: 'a-box', attr: 'position', contains: '-3' })).toBe(true);
    expect(cumpleRevision(documento, { selector: 'h1', contains: 'hola' })).toBe(true);
    expect(cumpleRevision(documento, { selector: 'h1', equals: 'Adiós' })).toBe(false);
  });

  it('un selector inválido no rompe: simplemente no se cumple', () => {
    expect(cumpleRevision(documento, { selector: '!!' })).toBe(false);
  });

  it('normalizarColor', () => {
    expect(normalizarColor('RED')).toBe('#ff0000');
    expect(normalizarColor('#AbC')).toBe('#aabbcc');
    expect(normalizarColor('rgb(1,2,3)')).toBe('rgb(1,2,3)');
  });
});

describe('textoPlano', () => {
  it('quita las marcas de Markdown en línea', () => {
    expect(textoPlano('`<a-box>`: la **caja** *roja*')).toBe('<a-box>: la caja roja');
    expect(textoPlano(undefined)).toBe('');
  });
});

// El contenido de los módulos 1 debe poder resolverse en el frontend.
describe('actividades de los módulos 1', () => {
  const lecciones = [blender1, aframe1].flatMap((archivo) => archivo.module.lessons);
  const bloques = lecciones.flatMap((leccion) => leccion.contentBlocks ?? []);

  it('cada lección de teoría tiene al menos un interactivo con id único', () => {
    for (const leccion of lecciones.filter((l) => l.type !== 'exam')) {
      const interactivos = (leccion.contentBlocks ?? []).filter((b) => TIPOS_INTERACTIVOS.includes(b.type));
      expect(interactivos.length, leccion.id).toBeGreaterThan(0);
      const ids = interactivos.map((b) => b.id);
      expect(new Set(ids).size, leccion.id).toBe(ids.length);
      expect(ids.every(Boolean), leccion.id).toBe(true);
    }
  });

  it('usan los 7 tipos interactivos del navegador', () => {
    // blender_practice se resuelve en Blender: vive en el módulo 2 (blender-modulo-2.json).
    const delNavegador = TIPOS_INTERACTIVOS.filter((tipo) => tipo !== 'blender_practice');
    expect(new Set(bloques.map((b) => b.type).filter((tipo) => TIPOS_INTERACTIVOS.includes(tipo)))).toEqual(
      new Set(delNavegador),
    );
  });

  it('cada actividad tiene solución alcanzable y no viene resuelta', () => {
    for (const bloque of bloques) {
      if (bloque.type === 'quiz_inline') expect(bloque.options.some((o) => o.isCorrect), bloque.id).toBe(true);
      if (bloque.type === 'ordering') expect(bloque.items.length).toBeGreaterThanOrEqual(3);
      if (bloque.type === 'fill_blanks') {
        const huecos = partesPlantilla(bloque.template).filter((p) => p.tipo === 'hueco');
        expect(huecos.length, bloque.id).toBeGreaterThan(0);
        expect(huecos.every((h) => h.respuestas.length > 0), bloque.id).toBe(true);
      }
      if (bloque.type === 'hotspots') {
        expect(bloque.points.every((p) => p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100), bloque.id).toBe(true);
      }
      if (bloque.type === 'scene_explorer' && bloque.goal) {
        const valores = valoresIniciales(bloque.controls);
        expect(metaCumplida(bloque.goal, valores), bloque.id).toBe(false);
        const control = normalizarControl(bloque.controls.find((c) => c.param === bloque.goal.param));
        const extremo = bloque.goal.op === '>=' ? control.max : control.min;
        expect(metaCumplida(bloque.goal, { ...valores, [bloque.goal.param]: extremo }), bloque.id).toBe(true);
      }
    }
  });
});
