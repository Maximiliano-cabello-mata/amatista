import { describe, expect, it } from 'vitest';
import {
  anchoDominio,
  avanceTaller,
  CICLO,
  controlesTaller,
  disenoIsla,
  enlaceDelTaller,
  estadoProyecto,
  etiquetaCorta,
  faseDeDominio,
  habilidadesConVivo,
  habilidadesParaProbar,
  MAX_BOTONES,
  nombreTipo,
  ordenReto,
  pasoDelCiclo,
  repasosDelPlan,
  resumenTaller,
  tallerNoDisponible,
  tallerResuelto,
  textoFase,
  textoOrden,
  tituloDeId,
  unirConY,
  vivoDelTaller,
} from './taller';

// Un plan como el de GET /talleres/blender.bp.m1 (Plan.a_dict del motor).
const actividad = (tipo, extra = {}) => ({
  id: `${tipo}:bl-escalar-eje:tabla`,
  tipo,
  nombre_tipo: { mira: 'Mira', conmigo: 'Hazlo conmigo', tu: 'Hazlo tú', proyecto: 'Úsalo' }[tipo],
  taller: 'blender.bp.m1',
  titulo: 'Estirar en un solo eje',
  pide: 'Una tabla larga y plana',
  habilidad: 'bl-escalar-eje',
  techo: tipo === 'tu' ? 2 : 4,
  ...extra,
});
const plan = (extra = {}) => ({
  taller: 'blender.bp.m1',
  titulo: 'La interfaz y navegación 3D',
  curso: 'blender_principiante',
  modulo: 1,
  actual: actividad('conmigo'),
  habilidades: [
    { id: 'bl-agregar-primitivas', titulo: 'Agregar formas', p: 0.97, fase: 'dominada', intentos: 4, vio_demo: true, lista: true },
    { id: 'bl-escalar-eje', titulo: 'Estirar en un solo eje', p: 0.42, fase: 'acompanada', intentos: 2, vio_demo: true, lista: false },
    { id: 'bl-rotar', titulo: 'Girar', p: 0.1, fase: 'nueva', intentos: 0, vio_demo: false, lista: false },
  ],
  listas: 1,
  total: 3,
  proyecto: 'blender.bp.m1.tren',
  proyecto_abierto: false,
  proyecto_hecho: false,
  reto_hecho: false,
  completo: false,
  repasos: [],
  puede_probar: false,
  isla: { pieza: 'La estación y el tren', texto: 'Tu tren llega a la estación de la isla.', lugar: [-7, -4], color: '#c0392b' },
  siguientes: [],
  ...extra,
});
const enlace = (taller, extra = {}) => ({
  enlace: true,
  blender: [{ en_linea: true, practica_id: 'taller.bl-escalar-eje.tabla.conmigo', detalle: { taller: { taller, ...extra } } }],
});

describe('el ciclo de cada habilidad', () => {
  it('tiene los cinco pasos en orden', () => {
    expect(CICLO.map((p) => p.nombre)).toEqual(['Mira', 'Hazlo conmigo', 'Hazlo tú', 'Úsalo', 'Recuérdalo']);
  });

  it('el paso sale de la actividad del plan', () => {
    expect(pasoDelCiclo(plan({ actual: actividad('mira') }))).toBe('mira');
    expect(pasoDelCiclo(plan())).toBe('conmigo');
    expect(pasoDelCiclo(plan({ actual: actividad('tu') }))).toBe('tu');
    expect(pasoDelCiclo(plan({ actual: { tipo: 'prueba' } }))).toBe('tu');
    expect(pasoDelCiclo(plan({ actual: { tipo: 'proyecto' } }))).toBe('proyecto');
    expect(pasoDelCiclo(plan({ actual: { tipo: 'reto' } }))).toBe('proyecto');
    expect(pasoDelCiclo(plan({ actual: { tipo: 'repaso' } }))).toBe('repaso');
  });

  it('Blender en vivo gana sobre el plan; sin nada pendiente toca recordar', () => {
    expect(pasoDelCiclo(plan(), { actividad: { tipo: 'tu' } })).toBe('tu');
    expect(pasoDelCiclo(plan({ actual: null, completo: true }))).toBe('repaso');
    expect(pasoDelCiclo(plan({ actual: null, repasos: ['bl-mover'] }))).toBe('repaso');
    expect(pasoDelCiclo(plan({ actual: null }))).toBeNull();
    expect(pasoDelCiclo(null)).toBeNull();
  });

  it('nombra los tipos aunque el servidor no mande nombre_tipo', () => {
    expect(nombreTipo({ tipo: 'prueba' })).toBe('Demuéstralo');
    expect(nombreTipo({ tipo: 'repaso', nombre_tipo: 'Recuérdalo' })).toBe('Recuérdalo');
    expect(nombreTipo(null)).toBe('');
  });
});

describe('fases y dominio', () => {
  it('dice la fase con palabras', () => {
    expect(['nueva', 'acompanada', 'sola', 'dominada', 'rara'].map(textoFase)).toEqual([
      'Nueva',
      'Con ayuda',
      'Ya te sale',
      'Dominada',
      'Nueva',
    ]);
  });

  it('usa los mismos cortes que el motor', () => {
    expect([0, 0.29, 0.3, 0.69, 0.7, 0.94, 0.95, 1, undefined].map(faseDeDominio)).toEqual([
      'nueva',
      'nueva',
      'acompanada',
      'acompanada',
      'sola',
      'sola',
      'dominada',
      'dominada',
      'nueva',
    ]);
  });

  it('la barra va de 0 a 100 sin decimales', () => {
    expect(anchoDominio(0.427)).toBe(43);
    expect(anchoDominio(1.3)).toBe(100);
    expect(anchoDominio(-1)).toBe(0);
    expect(anchoDominio('nada')).toBe(0);
  });

  it('lo que manda Blender actualiza cada habilidad', () => {
    const lista = habilidadesConVivo(plan().habilidades, [{ id: 'bl-escalar-eje', p: 0.8, fase: 'sola' }]);
    expect(lista[1]).toMatchObject({ id: 'bl-escalar-eje', p: 0.8, fase: 'sola', lista: false });
    expect(lista[0]).toMatchObject({ fase: 'dominada', lista: true });
    // Sin fase ni «lista» se deduce del dominio.
    expect(habilidadesConVivo([{ id: 'bl-x', p: 0.96 }])[0]).toMatchObject({ fase: 'dominada', lista: true, titulo: 'X' });
    expect(habilidadesConVivo(null)).toEqual([]);
  });
});

describe('Blender en vivo', () => {
  it('reconoce el taller por detalle.taller', () => {
    const r = enlaceDelTaller(enlace('blender.bp.m1', { estado: 'trabajando', llenas: 2, total: 5 }), 'blender.bp.m1');
    expect(r.estado).toBe('aqui');
    expect(r.vivo).toMatchObject({ llenas: 2, total: 5, estado: 'trabajando', pista: null, pieza: null });
    expect(enlaceDelTaller(enlace('blender.bp.m2'), 'blender.bp.m1').estado).toBe('otra');
    expect(enlaceDelTaller({ enlace: true, blender: [] }, 'blender.bp.m1')).toMatchObject({ estado: 'cerrado' });
    expect(enlaceDelTaller({ enlace: false }, 'blender.bp.m1').estado).toBe('sin_enlace');
    expect(enlaceDelTaller(null, 'blender.bp.m1').estado).toBe('sin_enlace');
  });

  it('normaliza la pieza, la pista y el estado', () => {
    const vivo = vivoDelTaller({
      pieza: { nombre: 'La chimenea', estado: 'equivocada', mensaje: 'Es un cubo: la chimenea es redonda.' },
      pista: { nivel: 3, titulo: 'Cómo', texto: 'Escala solo en un eje.', teclas: ['S', 'Z', null] },
      estado: 'raro',
      llenas: '3',
      proyecto_abierto: 1,
    });
    expect(vivo.pieza.estado).toBe('equivocada');
    expect(vivo.pista).toEqual({ nivel: 3, titulo: 'Cómo', texto: 'Escala solo en un eje.', teclas: ['S', 'Z'] });
    expect(vivo.estado).toBe('trabajando');
    expect(vivo.llenas).toBe(3);
    expect(vivo.proyectoAbierto).toBe(true);
    expect(vivoDelTaller({ pista: { nivel: 0 } }).pista).toBeNull();
    expect(vivoDelTaller(null)).toBeNull();
  });
});

describe('botones según el momento', () => {
  const aqui = (extra) => enlaceDelTaller(enlace('blender.bp.m1', extra), 'blender.bp.m1');
  const tipos = (lista) => lista.map((c) => c.tipo);

  it('sin Blender en el taller: abrirlo (o continuar si ya empezó)', () => {
    expect(controlesTaller(plan({ habilidades: [], listas: 0 }), null)).toEqual([
      { tipo: 'taller_abrir', texto: 'Abrir el taller en Blender' },
    ]);
    expect(controlesTaller(plan(), { estado: 'otra' })[0]).toEqual({ tipo: 'taller_abrir', texto: 'Continuar en Blender' });
  });

  it('trabajando con molde: pista, mírame y pausa', () => {
    expect(tipos(controlesTaller(plan(), aqui({ estado: 'trabajando', actividad: actividad('conmigo') })))).toEqual([
      'taller_pista',
      'taller_mirame',
      'taller_pausa',
    ]);
  });

  it('la pista sube hasta el techo de la actividad', () => {
    const ultima = aqui({ estado: 'trabajando', actividad: actividad('conmigo'), pista: { nivel: 4, titulo: 'Mírame' } });
    expect(tipos(controlesTaller(plan(), ultima))).toEqual(['taller_mirame', 'taller_pausa']);
    const sola = aqui({ estado: 'trabajando', actividad: actividad('tu', { id: 'tu:bl-escalar-eje:poste' }), pista: { nivel: 1 } });
    const lista = controlesTaller(plan({ actual: actividad('tu', { id: 'tu:bl-escalar-eje:poste', techo: 2 }) }), sola);
    expect(lista).toEqual([
      { tipo: 'taller_pista', texto: 'Otra pista' },
      { tipo: 'taller_pausa', texto: 'Pausa' },
    ]);
  });

  it('en pausa o lograda: continuar; mirando la demostración: continuar, mírame y pausa', () => {
    expect(tipos(controlesTaller(plan(), aqui({ estado: 'pausa' })))).toEqual(['taller_continuar']);
    expect(tipos(controlesTaller(plan(), aqui({ estado: 'lograda' })))).toEqual(['taller_continuar']);
    expect(tipos(controlesTaller(plan(), aqui({ estado: 'mirando', actividad: actividad('mira') })))).toEqual([
      'taller_continuar',
      'taller_mirame',
      'taller_pausa',
    ]);
  });

  it('nunca más de tres a la vez', () => {
    const casos = ['trabajando', 'mirando', 'lograda', 'pausa'].flatMap((estado) =>
      ['mira', 'conmigo', 'tu', 'proyecto', 'reto', 'repaso', 'prueba'].map((tipo) => aqui({ estado, actividad: { id: tipo, tipo } })),
    );
    for (const caso of casos) expect(controlesTaller(plan(), caso).length).toBeLessThanOrEqual(MAX_BOTONES);
  });
});

describe('camino rápido y repasos', () => {
  it('«Demuéstralo» ofrece solo lo que aún necesita guía', () => {
    expect(habilidadesParaProbar(plan())).toEqual([]);
    expect(habilidadesParaProbar(plan({ puede_probar: true })).map((h) => h.id)).toEqual(['bl-escalar-eje', 'bl-rotar']);
  });

  it('«Recuérdalo» nombra cada repaso, también los de talleres anteriores', () => {
    expect(repasosDelPlan(plan({ repasos: ['bl-rotar', 'bl-mover', 'bl-rotar'] }))).toEqual([
      { id: 'bl-rotar', titulo: 'Girar' },
      { id: 'bl-mover', titulo: 'Mover' },
    ]);
    expect(repasosDelPlan(plan({ repasos: ['bl-rotar'] }), { repasos: ['bl-escalar-eje'] })).toEqual([
      { id: 'bl-escalar-eje', titulo: 'Estirar en un solo eje' },
    ]);
    expect(tituloDeId('bl-escalar-eje')).toBe('Escalar eje');
  });
});

describe('cuándo cuenta la lección del taller', () => {
  it('cuando el proyecto del módulo se abre (en el plan o en vivo)', () => {
    expect(tallerResuelto(plan())).toBe(false);
    expect(tallerResuelto(plan({ proyecto_abierto: true }))).toBe(true);
    expect(tallerResuelto(plan(), { proyectoAbierto: true })).toBe(true);
    expect(tallerResuelto(null)).toBe(false);
  });

  it('un servidor que no conoce el taller no traba la lección', () => {
    expect(tallerNoDisponible({ ok: false, status: 404 })).toBe(true);
    expect(tallerNoDisponible({ ok: false, status: 0 })).toBe(false);
    expect(tallerNoDisponible({ ok: true, status: 200 })).toBe(false);
    expect(tallerNoDisponible(null)).toBe(false);
  });

  it('explica qué pasó con cada orden', () => {
    expect(textoOrden({ ok: true, datos: { entregada: true } })).toBe('Enviado a tu Blender.');
    expect(textoOrden({ ok: true, datos: { entregada: false } })).toMatch(/no respondió/);
    expect(textoOrden({ ok: false, status: 422, error: 'El dato «tipo» no es válido.' })).toMatch(/actualizarlo/);
    expect(textoOrden({ ok: false, status: 0, error: 'Sin conexión.' })).toBe('Sin conexión.');
  });

  it('une lo que falta antes del proyecto', () => {
    expect(unirConY(['esta lección'])).toBe('esta lección');
    expect(unirConY(['esta lección', '«Teoría»'])).toBe('esta lección y «Teoría»');
    expect(unirConY(['a', 'b', 'c'])).toBe('a, b y c');
  });
});

describe('el proyecto y el reto', () => {
  it('el reto final se abre al terminar el proyecto', () => {
    expect(estadoProyecto(plan())).toEqual({ proyecto: 'cerrado', reto: 'despues' });
    expect(estadoProyecto(plan({ proyecto_abierto: true }))).toEqual({ proyecto: 'abierto', reto: 'despues' });
    expect(estadoProyecto(plan({ proyecto_abierto: true, proyecto_hecho: true }))).toEqual({ proyecto: 'hecho', reto: 'disponible' });
    // Un taller sin reto llega con reto_hecho: sin proyecto no hay estrella.
    expect(estadoProyecto(plan({ reto_hecho: true })).reto).toBe('despues');
    expect(estadoProyecto(plan({ proyecto_hecho: true, reto_hecho: true })).reto).toBe('hecho');
    expect(ordenReto(plan())).toEqual({ tipo: 'taller_abrir', taller: 'blender.bp.m1', actividad: 'reto:blender.bp.m1' });
  });

  it('resume el avance de un taller sin números de dominio', () => {
    expect(avanceTaller({ listas: 2, total: 6 })).toBe(33);
    expect(avanceTaller({ listas: 9, total: 6 })).toBe(100);
    expect(avanceTaller({ proyecto_abierto: true })).toBe(100);
    expect(avanceTaller({ total: 0 })).toBe(0);
    expect(resumenTaller({ listas: 2, total: 6 })).toBe('2 de 6 habilidades ya te salen');
    expect(resumenTaller({ proyecto_abierto: true })).toMatch(/proyecto está abierto/);
    expect(resumenTaller({ proyecto_hecho: true })).toMatch(/Te queda el reto/);
    expect(resumenTaller({ proyecto_hecho: true, reto_hecho: true })).toMatch(/Proyecto y reto hechos/);
    expect(resumenTaller(null)).toBe('Sin empezar');
  });
});

describe('tu isla', () => {
  const taller = (id, lugar, extra = {}) => ({ taller: id, titulo: id, isla: { pieza: `Pieza ${id}`, lugar, color: '#c0392b' }, ...extra });

  it('pone cada taller en su lugar, dentro del lienzo y con +Y hacia arriba', () => {
    const puntos = disenoIsla([taller('a', [-7, -4]), taller('b', [7, 4])], { ancho: 320, alto: 180, margen: 40 });
    expect(puntos).toHaveLength(2);
    const [a, b] = puntos;
    expect(a.x).toBeLessThan(b.x);
    expect(a.y).toBeGreaterThan(b.y);
    for (const p of puntos) {
      expect(p.x).toBeGreaterThanOrEqual(20);
      expect(p.x).toBeLessThanOrEqual(300);
      expect(p.y).toBeGreaterThanOrEqual(20);
      expect(p.y).toBeLessThanOrEqual(160);
    }
  });

  it('un solo taller va al centro; sin lugar, en una ronda', () => {
    expect(disenoIsla([taller('a', [3, 3])], { ancho: 320, alto: 180 })[0]).toMatchObject({ x: 160, y: 90 });
    const ronda = disenoIsla([taller('a', null), taller('b', 'aquí')], { ancho: 320, alto: 180, margen: 40 });
    expect(ronda[0]).toMatchObject({ x: 160, y: 40 });
    expect(ronda[1]).toMatchObject({ x: 160, y: 140 });
  });

  it('lleno con el proyecto hecho, con estrella si además salió el reto', () => {
    const [vacio, hecho, estrella] = disenoIsla([
      taller('a', [0, 0], { reto_hecho: true }),
      taller('b', [5, 0], { proyecto_hecho: true }),
      taller('c', [10, 0], { proyecto_hecho: true, reto_hecho: true }),
    ]);
    expect([vacio.hecho, vacio.estrella]).toEqual([false, false]);
    expect([hecho.hecho, hecho.estrella]).toEqual([true, false]);
    expect([estrella.hecho, estrella.estrella]).toEqual([true, true]);
    expect(estrella.pieza).toBe('Pieza c');
  });

  it('solo acepta colores hexadecimales y separa etiquetas que chocan', () => {
    const [raro, bien, lejos] = disenoIsla([
      taller('a', null, { isla: { lugar: [0, 0], color: 'url(javascript:x)' } }),
      taller('b', null, { isla: { lugar: [0.3, 0], color: '#ABC' } }),
      taller('c', [10, 5]),
    ]);
    expect(raro.color).toBe('#9b59b6');
    expect(bien.color).toBe('#ABC');
    expect([raro.etiqueta, bien.etiqueta, lejos.etiqueta]).toEqual(['abajo', 'arriba', 'abajo']);
    expect(disenoIsla(null)).toEqual([]);
  });

  it('acorta las etiquetas largas', () => {
    expect(etiquetaCorta('La estación y el tren')).toBe('La estación y el…');
    expect(etiquetaCorta('El puerto')).toBe('El puerto');
  });
});
