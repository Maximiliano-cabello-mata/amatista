import { describe, expect, it } from 'vitest';
import { cursos } from '../../data/cursos';
import { SPRITES } from './sprites';
import {
  avisarMascota,
  EVENTO_MASCOTA,
  mensajesDeMascota,
  reaccionDeMascota,
  TEMAS,
  temaDelModulo,
  variablesDeTema,
  vidaDelJefe,
} from './temas';

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

  it('cada temática trae escenario, colores, mascota con sprite 10 × 10 y jefe con forma', () => {
    for (const [id, tema] of Object.entries(TEMAS)) {
      expect(tema.escena, id).toBeTruthy();
      for (const color of ['acento', 'suave', 'cielo', 'suelo']) expect(tema.colores[color], `${id}.${color}`).toMatch(/^#[0-9A-F]{6}$/i);
      expect(tema.mascota.consejos.length, id).toBeGreaterThan(0);
      expect(tema.mascota.datos.length, id).toBeGreaterThan(0);
      expect(['bloque', 'robusto', 'flotante', 'redondo', 'alto'], id).toContain(tema.jefe.forma);
      expect(SPRITES[id], id).toHaveLength(10);
      for (const fila of SPRITES[id]) expect(fila, id).toMatch(/^[.askwo]{10}$/);
    }
  });

  it('las mascotas tienen nombres distintos y saludan primero', () => {
    const nombres = Object.values(TEMAS).map((t) => t.mascota.nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
    const mensajes = mensajesDeMascota(TEMAS.taller.mascota);
    expect(mensajes[0].tipo).toBe('hola');
    expect(mensajes.map((m) => m.tipo)).toContain('dato');
  });

  it('cada mascota platica y reacciona a lo que pasa en la lección', () => {
    for (const [id, tema] of Object.entries(TEMAS)) {
      expect(tema.mascota.charla?.length, id).toBeGreaterThan(0);
      for (const tipo of ['acierto', 'fallo', 'mitad', 'final', 'inactivo']) {
        expect(reaccionDeMascota(tema.mascota, tipo)?.texto, `${id} ${tipo}`).toBeTruthy();
      }
    }
    expect(mensajesDeMascota(TEMAS.taller.mascota).map((m) => m.tipo)).toContain('charla');
    expect(reaccionDeMascota(TEMAS.taller.mascota, 'otro')).toBeNull();
  });

  it('avisa a la mascota con un evento y pasa los colores del tema al CSS', () => {
    const recibidos = [];
    globalThis.window = new EventTarget();
    try {
      window.addEventListener(EVENTO_MASCOTA, (e) => recibidos.push(e.detail.tipo));
      avisarMascota('acierto');
    } finally {
      delete globalThis.window;
    }
    expect(recibidos).toEqual(['acierto']);
    expect(() => avisarMascota('fallo')).not.toThrow();
    expect(variablesDeTema(TEMAS.taller)['--tema-acento']).toBe(TEMAS.taller.colores.acento);
    expect(variablesDeTema(null)['--tema-acento']).toBe('#B57EDC');
  });
});
