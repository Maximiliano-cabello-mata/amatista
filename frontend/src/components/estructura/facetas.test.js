import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { facetasBorde, facetasEncabezado } from './facetas';

const RUTA_CSS = path.resolve(import.meta.dirname, '..', '..', 'index.css');

function extraerKeyframes(css) {
  const bloques = [];
  const patron = /@keyframes\s+([\w-]+)\s*\{/g;
  let coincidencia;
  while ((coincidencia = patron.exec(css)) !== null) {
    let nivel = 1;
    let i = patron.lastIndex;
    while (i < css.length && nivel > 0) {
      if (css[i] === '{') nivel++;
      else if (css[i] === '}') nivel--;
      i++;
    }
    bloques.push({ nombre: coincidencia[1], cuerpo: css.slice(patron.lastIndex, i - 1) });
  }
  return bloques;
}

describe('facetas', () => {
  it('cubre el encabezado con triángulos iguales en cada carga', () => {
    const a = facetasEncabezado({ columnas: 10, filas: 3 });
    expect(a).toHaveLength(60);
    expect(facetasEncabezado({ columnas: 10, filas: 3 })).toEqual(a);
    for (const cara of a) {
      expect(cara.puntos.split(' ')).toHaveLength(3);
      expect(cara.opacidad).toBeGreaterThan(0);
      expect(cara.opacidad).toBeLessThan(0.35);
    }
  });

  it('la luz está arriba a la derecha', () => {
    const caras = facetasEncabezado({ columnas: 10, filas: 3 });
    const izquierda = caras.slice(0, 6).reduce((s, c) => s + c.opacidad, 0);
    const derecha = caras.slice(12, 20).reduce((s, c) => s + c.opacidad, 0) / 8 * 6;
    expect(derecha).toBeGreaterThan(izquierda);
  });

  it('cambia de color según el tono y vuelve a amatista si no lo conoce', () => {
    expect(facetasEncabezado({ tono: 'blender' })[0].color).toBe('rgb(245,121,42)');
    expect(facetasEncabezado({ tono: 'otro' })[0].color).toBe('rgb(155,89,182)');
  });

  it('el borde del pie alterna triángulos', () => {
    const borde = facetasBorde({ cantidad: 4, ancho: 40, alto: 10 });
    expect(borde.map((t) => t.puntos)).toEqual(['0,10 5,0 10,10', '10,0 15,10 20,0', '20,10 25,0 30,10', '30,0 35,10 40,0']);
  });

  it('mantiene las reglas CSS de animaciones balanceadas, 100 % en GPU (sin box-shadow ni filter) y sin efectos imperceptibles', () => {
    const css = readFileSync(RUTA_CSS, 'utf8');
    // Llaves balanceadas en todo el archivo
    const abiertas = (css.match(/\{/g) || []).length;
    const cerradas = (css.match(/\}/g) || []).length;
    expect(abiertas).toBe(cerradas);

    // Keyframes y variables esenciales presentes
    for (const token of [
      '--curva-elastica',
      '--curva-resorte',
      '--resplandor-neon',
      '@keyframes pagina-viva',
      '@keyframes cascada-entrar',
      '@keyframes tecla-pulso',
    ]) {
      expect(css).toContain(token);
    }

    // Efectos continuos imperceptibles eliminados para garantizar fluidez a 60 fps
    for (const eliminado of [
      '@keyframes faceta-respirar',
      '@keyframes titilar-estrella',
      '@keyframes arista-pulso',
      '@keyframes rombo-pulso',
      '@keyframes aviso-respira',
      '@keyframes brillo-faceta',
    ]) {
      expect(css).not.toContain(eliminado);
    }

    // Ningún @keyframes anima propiedades que recalculan el diseño o fuerzan repintado (box-shadow, filter)
    const bloquesKeyframes = extraerKeyframes(css);
    expect(bloquesKeyframes.length).toBeGreaterThanOrEqual(35);
    for (const { nombre, cuerpo } of bloquesKeyframes) {
      expect(cuerpo, `@keyframes ${nombre}`).not.toMatch(/\b(width|height|top|left|right|bottom|margin|padding|font-size|box-shadow|filter)\s*:/);
    }

    // Las animaciones continuas se apagan en html.ligero y en prefers-reduced-motion
    expect(css).toContain('html.ligero .tecla-chip--toca');
  });
});
