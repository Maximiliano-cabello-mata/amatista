import { describe, expect, it } from 'vitest';
import {
  aristasCubo,
  curvaMensaje,
  DEMOS,
  limitarElevacion,
  limitarValor,
  mensajesValidos,
  moverParada,
  PANTALLAS,
  paradasDe,
  posicionesNodos,
  proyectar,
  quitarErrores,
  recorridoDelEnlace,
  resumenVerdadero,
  revisarClasificacion,
  subdividir,
  TEXTO_RECORRIDO,
  vistaCercana,
  vivoDelRecorrido,
} from './recursos';

describe('ui_tour', () => {
  it('solo muestra las paradas con una zona de su pantalla', () => {
    const bloque = { screen: 'blender', stops: [{ area: 'vista3d' }, { area: 'no_existe' }, { area: 'barra_n' }] };
    expect(paradasDe(bloque).map((p) => p.area)).toEqual(['vista3d', 'barra_n']);
    expect(paradasDe({ screen: 'otra', stops: [{ area: 'vista3d' }] })).toEqual([]);
  });

  it('las zonas caben en el lienzo de 320×200', () => {
    for (const pantalla of Object.values(PANTALLAS)) {
      for (const z of Object.values(pantalla.zonas)) {
        expect(z.x >= 0 && z.y >= 0 && z.x + z.w <= 320 && z.y + z.h <= 200, z.nombre).toBe(true);
      }
    }
  });

  it('no se sale al pasar de parada', () => {
    expect(moverParada(0, -1, 4)).toBe(0);
    expect(moverParada(3, 1, 4)).toBe(3);
    expect(moverParada(1, 1, 4)).toBe(2);
  });
});

describe('connection_flow', () => {
  const nodos = [{ id: 'plataforma' }, { id: 'servidor' }, { id: 'blender' }];

  it('reparte los nodos a lo ancho', () => {
    const pos = posicionesNodos(nodos, 300, 150);
    expect(pos.plataforma.x).toBeLessThan(pos.servidor.x);
    expect(pos.servidor.x).toBeLessThan(pos.blender.x);
    expect(pos.blender.y).toBe(75);
  });

  it('descarta mensajes a nodos que no existen o a sí mismos', () => {
    const bloque = {
      nodes: nodos,
      messages: [
        { from: 'blender', to: 'servidor' },
        { from: 'blender', to: 'luna' },
        { from: 'servidor', to: 'servidor' },
      ],
    };
    expect(mensajesValidos(bloque)).toHaveLength(1);
  });

  it('la ida va por arriba y la vuelta por abajo', () => {
    const a = { x: 50, y: 75 };
    const b = { x: 250, y: 75 };
    expect(curvaMensaje(a, b).medio.y).toBeLessThan(75);
    expect(curvaMensaje(b, a).medio.y).toBeGreaterThan(75);
  });
});

describe('classify', () => {
  const items = [{ group: 'a' }, { group: 'b' }, { group: 'a' }];

  it('separa bien, mal y faltan', () => {
    expect(revisarClasificacion(items, { 0: 'a', 1: 'a' })).toEqual({ bien: [0], mal: [1], faltan: [2], completa: false });
    expect(revisarClasificacion(items, { 0: 'a', 1: 'b', 2: 'a' }).completa).toBe(true);
  });

  it('las mal puestas vuelven a la mesa', () => {
    expect(quitarErrores({ 0: 'a', 1: 'a' }, [1])).toEqual({ 0: 'a' });
  });
});

describe('true_false', () => {
  it('cuenta aciertos y termina al responder todo', () => {
    const afirmaciones = [{ answer: true }, { answer: false }];
    expect(resumenVerdadero(afirmaciones, [true])).toMatchObject({ aciertos: 1, respondidas: 1, terminado: false });
    expect(resumenVerdadero(afirmaciones, [true, true])).toMatchObject({ aciertos: 1, terminado: true });
  });
});

describe('axis_gizmo', () => {
  it('de frente, X va a la derecha y Z hacia arriba', () => {
    expect(proyectar([1, 0, 0], 0, 0).x).toBeCloseTo(1);
    expect(proyectar([0, 0, 1], 0, 0).y).toBeCloseTo(1);
    expect(proyectar([0, 1, 0], 0, 0).profundidad).toBeCloseTo(1);
  });

  it('desde arriba, Y apunta hacia arriba en la pantalla', () => {
    expect(proyectar([0, 1, 0], 0, 90).y).toBeCloseTo(1);
  });

  it('reconoce las vistas con nombre y limita la elevación', () => {
    expect(vistaCercana(0, 0)).toBe('frente');
    expect(vistaCercana(450, 0)).toBe('derecha');
    expect(vistaCercana(123, 90)).toBe('arriba');
    expect(vistaCercana(40, 30)).toBe('libre');
    expect(limitarElevacion(120)).toBe(90);
    expect(limitarElevacion(-120)).toBe(-89);
  });

  it('el cubo tiene 12 aristas', () => {
    expect(aristasCubo(35, 28)).toHaveLength(12);
  });
});

describe('param_demo', () => {
  it('cada demo dibuja algo en todo su rango y explica el valor', () => {
    for (const [id, demo] of Object.entries(DEMOS)) {
      const { min, max, inicial } = demo.control;
      for (const v of [min, inicial, max]) {
        expect(demo.figuras(v).length, `${id}=${v}`).toBeGreaterThan(0);
        expect(demo.texto(v).length, `${id}=${v}`).toBeGreaterThan(0);
      }
    }
  });

  it('limita y redondea el valor al paso del control', () => {
    const control = { min: 0, max: 10, paso: 2, inicial: 4 };
    expect(limitarValor(control, 99)).toBe(10);
    expect(limitarValor(control, '3.1')).toBe(4);
    expect(limitarValor(control, 'nada')).toBe(4);
  });

  it('subdividir suaviza: más niveles, más puntos', () => {
    const cuadrado = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    expect(subdividir(cuadrado, 0)).toHaveLength(4);
    expect(subdividir(cuadrado, 2).length).toBeGreaterThan(subdividir(cuadrado, 1).length);
  });
});

describe('blender_tour: el recorrido por el enlace en vivo', () => {
  const recorrido = (extra) => ({ activo: true, hecho: false, paso: 2, total: 10, titulo: 'Conecta tu cuenta', pasos: [{ titulo: 'Hola', ok: true }], ...extra });
  const enlace = (...blender) => ({ enlace: true, blender });

  it('lee el detalle del latido sin confiar en él', () => {
    expect(vivoDelRecorrido(null)).toBeNull();
    const vivo = vivoDelRecorrido({ paso: 99, total: 10, teclas: ['N', 1, 2, 3, 4, 5, 6], pasos: [null, { titulo: 'A' }] });
    expect(vivo.paso).toBe(10);
    expect(vivo.teclas).toHaveLength(6);
    expect(vivo.pasos).toEqual([{ titulo: 'A', ok: false }]);
  });

  it('distingue cada estado del Blender del alumno', () => {
    expect(recorridoDelEnlace({ enlace: false }).estado).toBe('sin_enlace');
    expect(recorridoDelEnlace(enlace()).estado).toBe('cerrado');
    expect(recorridoDelEnlace(enlace({ en_linea: false, detalle: { recorrido: recorrido() } })).estado).toBe('cerrado');
    expect(recorridoDelEnlace(enlace({ en_linea: true })).estado).toBe('viejo');
    expect(recorridoDelEnlace(enlace({ en_linea: true, detalle: { recorrido: recorrido({ activo: false }) } })).estado).toBe('abierto');
    const vivo = recorridoDelEnlace(enlace({ en_linea: true, detalle: { recorrido: recorrido() } }));
    expect(vivo.estado).toBe('recorriendo');
    expect(vivo.vivo.titulo).toBe('Conecta tu cuenta');
  });

  it('terminado en cualquier Blender abierto cuenta como hecho', () => {
    const datos = enlace(
      { en_linea: true, detalle: { recorrido: recorrido() } },
      { en_linea: true, detalle: { recorrido: recorrido({ activo: false, hecho: true }) } },
    );
    expect(recorridoDelEnlace(datos).estado).toBe('hecho');
  });

  it('tiene un texto para cada estado', () => {
    for (const estado of ['sin_enlace', 'cerrado', 'viejo', 'abierto', 'recorriendo', 'hecho']) {
      expect(TEXTO_RECORRIDO[estado]).toBeTruthy();
    }
  });
});
