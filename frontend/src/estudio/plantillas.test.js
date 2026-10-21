import { describe, expect, it } from 'vitest';
import { codigoGuardado, insertarPieza, MAX_CODIGO, paginaCompleta, PIEZAS, PLANTILLAS } from './plantillas';

describe('Estudio A-Frame', () => {
  it('cada plantilla es una escena y usa solo modelos del curso', () => {
    expect(new Set(PLANTILLAS.map((p) => p.id)).size).toBe(PLANTILLAS.length);
    for (const plantilla of PLANTILLAS) {
      expect(plantilla.codigo.trim().startsWith('<a-scene'), plantilla.id).toBe(true);
      expect(plantilla.codigo.trim().endsWith('</a-scene>'), plantilla.id).toBe(true);
      for (const [, modelo] of plantilla.codigo.matchAll(/src="([^"]+\.glb)"/g)) expect(modelo).toMatch(/^\/modelos\/(cristal|arbol|casa)\.glb$/);
    }
    for (const pieza of PIEZAS) expect(pieza.codigo.startsWith('<a-'), pieza.id).toBe(true);
  });

  it('inserta una pieza antes de </a-scene> o donde está el cursor', () => {
    const escena = '<a-scene>\n</a-scene>';
    const alFinal = insertarPieza(escena, '<a-box></a-box>');
    expect(alFinal.codigo).toBe('<a-scene>\n  <a-box></a-box>\n</a-scene>');
    expect(alFinal.codigo.slice(0, alFinal.cursor)).toBe('<a-scene>\n  <a-box></a-box>\n');
    const enCursor = insertarPieza(escena, '<a-sky></a-sky>', 10);
    expect(enCursor.codigo).toBe('<a-scene>\n<a-sky></a-sky>\n</a-scene>');
  });

  it('la página descargada carga A-Frame y no deja colar HTML en el título', () => {
    const pagina = paginaCompleta('<a-scene></a-scene>', 'Mi <script>');
    expect(pagina).toContain('aframe.io/releases/');
    expect(pagina).toContain('<title>Mi script</title>');
    expect(pagina).toContain('    <a-scene></a-scene>');
  });

  it('lo guardado solo vale si es texto razonable', () => {
    expect(codigoGuardado('<a-scene></a-scene>')).toBe('<a-scene></a-scene>');
    expect(codigoGuardado('   ')).toBeNull();
    expect(codigoGuardado(null)).toBeNull();
    expect(codigoGuardado('x'.repeat(MAX_CODIGO + 1))).toBeNull();
  });
});
