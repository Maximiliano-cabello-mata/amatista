import { describe, expect, it } from 'vitest';
import { buscarAtajo, distancia, ideaDeProyecto, nivelDeProyecto, normalizar, porIntencion, responder } from './cerebro';
import { IDEAS, INTENCIONES, PASOS_PROYECTO } from './conocimiento';

describe('normalizar y distancia', () => {
  it('quita acentos, signos y mayúsculas', () => {
    expect(normalizar('¿Cómo EXTRUYO una cara?')).toEqual(['como', 'extruyo', 'una', 'cara']);
  });
  it('mide faltas de ortografía con tope', () => {
    expect(distancia('extruir', 'estruir')).toBe(1);
    expect(distancia('blender', 'blendr')).toBe(1);
    expect(distancia('mover', 'rotar')).toBeGreaterThan(2);
  });
});

describe('responder', () => {
  it('encuentra el atajo aunque esté mal escrito', () => {
    const r = responder('como estruyo');
    expect(r.intencion).toBe('atajo');
    expect(r.texto).toContain('E (en modo edición)');
    expect(buscarAtajo(normalizar('girar'))?.id).toBe('rotar');
  });

  it('con frustración responde con apoyo, no con un atajo', () => {
    const r = responder('ya rompí todo y me rindo, no puedo');
    expect(r.intencion).toBe('atorado');
    expect(r.gesto).toBe('preocupado');
  });

  it('lleva a la lección pendiente', () => {
    const r = responder('quiero seguir donde me quedé', { siguiente: { titulo: 'Extruir caras', href: '#/curso/b/leccion/l' } });
    expect(r.texto).toContain('Extruir caras');
    expect(r.acciones[0].href).toBe('#/curso/b/leccion/l');
  });

  it('sin nada pendiente invita a un proyecto propio', () => {
    expect(porIntencion('continuar', {}).acciones.some((a) => a.intencion === 'proyecto')).toBe(true);
  });

  it('entiende preguntas de la plataforma', () => {
    expect(responder('como vinculo el addon').intencion).toBe('blender');
    expect(responder('donde veo mis insignias').intencion).toBe('progreso');
    expect(responder('olvidé mi contraseña').intencion).toBe('cuenta');
    expect(responder('quién eres').intencion).toBe('quien');
    expect(responder('hola goliat').intencion).toBe('saludo');
  });

  it('si no entiende, lo dice y ofrece caminos', () => {
    const r = responder('xyzzy plugh');
    expect(r.intencion).toBe('no-entendi');
    expect(r.acciones.length).toBeGreaterThan(0);
    expect(responder('').intencion).toBe('no-entendi');
  });

  it('pone el nombre del alumno en el saludo', () => {
    expect(porIntencion('saludo', { nombre: 'Ana' }).texto).toContain('Ana');
  });
});

describe('proyectos', () => {
  it('sube de nivel con las lecciones completadas', () => {
    expect(nivelDeProyecto(0)).toBe(0);
    expect(nivelDeProyecto(8)).toBe(1);
    expect(nivelDeProyecto(30)).toBe(2);
  });

  it('a un principiante solo le propone ideas de su nivel', () => {
    for (let vuelta = 0; vuelta < 10; vuelta += 1) expect(ideaDeProyecto(0, vuelta).nivel).toBe(0);
  });

  it('«otra idea» trae una distinta y los pasos nombran el proyecto', () => {
    const a = ideaDeProyecto(1, 0);
    const b = ideaDeProyecto(1, 1);
    expect(a.id).not.toBe(b.id);
    expect(a.pasos).toHaveLength(PASOS_PROYECTO.length);
    expect(a.pasos[0].texto).toContain(a.que);
  });
});

describe('conocimiento', () => {
  it('intenciones e ideas tienen ids únicos', () => {
    const ids = INTENCIONES.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(IDEAS.map((i) => i.id)).size).toBe(IDEAS.length);
  });
  it('cada intención con texto propio tiene al menos una respuesta', () => {
    for (const intencion of INTENCIONES) expect(intencion.respuestas.length).toBeGreaterThan(0);
  });
});
