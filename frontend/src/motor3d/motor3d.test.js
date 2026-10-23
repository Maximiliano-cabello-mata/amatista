import { describe, expect, it } from 'vitest';
import { crearAzar, semillaDe } from './azar';
import { ajustarResolucion, elegirCalidad } from './calidad';
import { datosEntorno, ENTORNOS, generarPatron, generarTerreno, repartirPiezas, TIPOS_ENTORNO } from './entorno';
import { entidadesEscena, escenaAHTML, normalizarEscena, revisarEscena } from './escena';
import { scriptMotor, sinModulos, usaMotor } from './fuente';
import { evaluarRetos } from './retos';

describe('Motor Web: azar y entornos', () => {
  it('la misma semilla da el mismo mundo', () => {
    const a = crearAzar(42);
    const b = crearAzar(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(semillaDe('mi-isla')).toBe(semillaDe('mi-isla'));
    expect(semillaDe('mi-isla')).not.toBe(semillaDe('otra'));
    expect(datosEntorno({ tipo: 'bosque', semilla: 3 }).piezas).toEqual(datosEntorno({ tipo: 'bosque', semilla: 3 }).piezas);
  });

  it('el terreno deja plano el claro del centro y respeta el relieve', () => {
    const t = generarTerreno({ semilla: 5, tamano: 40, resolucion: 32, relieve: 2, claro: 5 });
    expect(t.alturas).toHaveLength(33 * 33);
    expect(Math.abs(t.altura(0, 0))).toBeLessThan(1e-6);
    expect(Math.abs(t.altura(3, -2))).toBeLessThan(1e-6);
    const lejos = [...t.alturas].map(Math.abs);
    expect(Math.max(...lejos)).toBeGreaterThan(0.2);
    expect(Math.max(...lejos)).toBeLessThan(10);
  });

  it('reparte piezas fuera del claro, sin pasar el máximo y sin meterlas al agua', () => {
    const terreno = generarTerreno({ semilla: 2, relieve: 2.6, forma: 'isla' });
    const piezas = repartirPiezas({ semilla: 2, densidad: 1, piezas: ENTORNOS.isla.piezas, altura: terreno.altura, claro: 6, nivelAgua: -0.25, maximo: 80 });
    expect(piezas.length).toBeGreaterThan(5);
    expect(piezas.length).toBeLessThanOrEqual(80);
    for (const p of piezas) {
      expect(Math.hypot(p.x, p.z)).toBeGreaterThanOrEqual(6);
      expect(p.y).toBeGreaterThan(-0.25);
      expect(['palmera', 'roca']).toContain(p.tipo);
    }
    expect(repartirPiezas({ piezas: {} })).toEqual([]);
  });

  it('cada entorno tiene paleta y la calidad baja reparte menos', () => {
    for (const tipo of TIPOS_ENTORNO) expect(ENTORNOS[tipo].suelo).toHaveLength(3);
    const alta = datosEntorno({ tipo: 'bosque', semilla: 1, densidad: 1, calidad: 'alta' });
    const baja = datosEntorno({ tipo: 'bosque', semilla: 1, densidad: 1, calidad: 'baja' });
    expect(baja.piezas.length).toBeLessThan(alta.piezas.length);
    expect(baja.terreno.resolucion).toBeLessThan(alta.terreno.resolucion);
  });

  it('genera copias en patrones', () => {
    const circulo = generarPatron({ patron: 'circulo', cantidad: 4, radio: 2 });
    expect(circulo.map((p) => Math.round(Math.hypot(p.x, p.z) * 1000) / 1000)).toEqual([2, 2, 2, 2]);
    expect(generarPatron({ patron: 'fila', cantidad: 3, separacion: 2 }).map((p) => p.x)).toEqual([-2, 0, 2]);
    expect(generarPatron({ patron: 'rejilla', cantidad: 9 })).toHaveLength(9);
    expect(generarPatron({ cantidad: 5000 })).toHaveLength(400);
  });
});

describe('Motor Web: retos y calidad', () => {
  const foto = {
    objetos: { caja: { x: 3, y: 0, z: -1, tocado: false }, bola: { x: 0, y: 2, z: 0, tocado: true } },
    zonas: { meta: { x: 3.2, z: -1.3, radio: 1 } },
  };

  it('revisa cada tipo de reto con la foto de la escena', () => {
    const r = evaluarRetos(
      [
        { tipo: 'en_zona', objeto: 'caja', zona: 'meta' },
        { tipo: 'todos_en_zona', objetos: ['caja', 'bola'], zona: 'meta' },
        { tipo: 'tocar', objeto: '#bola' },
        { tipo: 'cerca', objeto: 'bola', de: 'caja', distancia: 2 },
        { tipo: 'altura', objeto: 'bola', minimo: 1.5 },
      ],
      foto,
    );
    expect(r.lista.map((x) => x.cumplido)).toEqual([true, false, true, false, true]);
    expect(r.completo).toBe(false);
    expect(r.lista[0].texto).toBe('Lleva «caja» a la zona «meta».');
    expect(evaluarRetos([], foto).completo).toBe(false);
  });

  it('elige la calidad por el equipo y ajusta la resolución en vivo', () => {
    expect(elegirCalidad({ nucleos: 2, memoria: 2 }).nivel).toBe('baja');
    expect(elegirCalidad({ nucleos: 8, memoria: 8, dpr: 3 })).toMatchObject({ nivel: 'alta', pixelRatio: 2 });
    expect(elegirCalidad({ nucleos: 8, memoria: 8, ligero: true }).nivel).toBe('baja');
    expect(ajustarResolucion(1.5, 30, { minimo: 0.75 })).toBe(1.35);
    expect(ajustarResolucion(0.8, 40, { minimo: 0.75 })).toBe(0.75);
    expect(ajustarResolucion(1, 10, { maximo: 1.5 })).toBe(1.1);
    expect(ajustarResolucion(1, 18)).toBe(1);
  });
});

describe('Motor Web: escenas', () => {
  const desc = {
    entorno: { tipo: 'isla', semilla: 3 },
    objetos: [{ id: 'caja', forma: 'caja', movible: true, escala: 0.8 }, { id: 'arbol1', forma: 'modelo', modelo: 'arbol' }],
    zonas: [{ id: 'meta', posicion: [3, -1], radio: 1.2 }],
    retos: [{ tipo: 'en_zona', objeto: 'caja', zona: 'meta' }],
  };

  it('revisa la descripción y avisa de lo que no existe', () => {
    expect(revisarEscena(desc)).toEqual([]);
    expect(revisarEscena({ entorno: { tipo: 'luna' } })[0]).toContain('luna');
    expect(revisarEscena({ objetos: [{ id: 'a' }, { id: 'a' }] })[0]).toContain('repetido');
    expect(revisarEscena({ retos: [{ tipo: 'en_zona', objeto: 'nada', zona: 'meta' }] }).length).toBe(2);
  });

  it('normaliza: el objeto queda apoyado en el suelo y los valores dentro de sus límites', () => {
    const n = normalizarEscena(desc);
    expect(n.objetos[0]).toMatchObject({ id: 'caja', posicion: [0, 0.4, 0], base: 0.4, movible: true });
    expect(n.objetos[1].posicion[1]).toBe(0);
    expect(normalizarEscena({ entorno: { tamano: 9999 } }).entorno.tamano).toBe(120);
    expect(normalizarEscena({ entorno: null }).entorno).toBeNull();
  });

  it('arma las entidades y el HTML con los componentes del motor', () => {
    const entidades = entidadesEscena(desc, { vr: false });
    const caja = entidades.find((e) => e.atributos.id === 'caja');
    expect(caja.atributos['am-arrastrable']).toBe('base: 0.4');
    expect(entidades.some((e) => e.atributos['am-orbita'])).toBe(true);
    const html = escenaAHTML(desc);
    expect(html.startsWith('<a-scene')).toBe(true);
    expect(html).toContain('am-entorno="tipo: isla; semilla: 3');
    expect(html).toContain('am-reto__1="tipo: en_zona; objeto: caja; zona: meta"');
    expect(html).toContain('gltf-model="url(/modelos/arbol.glb)"');
    expect(html).toContain('laser-controls');
  });

  it('el script para la página descargada no tiene import ni export y registra el motor', () => {
    expect(sinModulos("import { a } from './a';\nexport function b() {}\nexport const c = 1;")).toBe('\nfunction b() {}\nconst c = 1;');
    const script = scriptMotor();
    expect(script).not.toMatch(/^\s*(import|export)\s/m);
    expect(script).toContain('registrarMotor(window.AFRAME)');
    expect(() => new Function(script)).not.toThrow();
    expect(usaMotor('<a-entity am-entorno="tipo: bosque">')).toBe(true);
    expect(usaMotor('<a-box color="red">')).toBe(false);
  });
});
