import { describe, expect, it } from 'vitest';
import {
  evaluarNotificacion,
  ESCENARIOS_NOTIFICACION,
  guardarHoraPreferencia,
  leerHoraPreferencia,
  primerNombre,
} from './motorNotificaciones';

describe('motorNotificaciones', () => {
  it('extrae el primer nombre del usuario correctamente', () => {
    expect(primerNombre({ nombre: 'Maximiliano Pérez' })).toBe('Maximiliano');
    expect(primerNombre({ nombre: 'Ana' })).toBe('Ana');
    expect(primerNombre(null)).toBe('Creador');
    expect(primerNombre({})).toBe('Creador');
  });

  it('determina escenario de riesgo cuando la racha no ha sido practicada hoy', () => {
    const notif = evaluarNotificacion({
      usuario: { nombre: 'Laura Gómez' },
      racha: { actual: 7, hoy: false },
      leccionSiguiente: { href: '#/curso/blender/l1' },
    });

    expect(notif.clave).toBe(ESCENARIOS_NOTIFICACION.RIESGO);
    expect(notif.personaje).toContain('BRASA');
    expect(notif.mensaje).toContain('Laura');
    expect(notif.mensaje).toContain('7 días');
    expect(notif.cta).toBe('Salvar mi racha ▶');
    expect(notif.href).toBe('#/curso/blender/l1');
  });

  it('determina escenario de celebración cuando hoy ya practicó', () => {
    const notif = evaluarNotificacion({
      usuario: { nombre: 'Carlos Ruiz' },
      racha: { actual: 4, hoy: true },
    });

    expect(notif.clave).toBe(ESCENARIOS_NOTIFICACION.CUMPLIDA);
    expect(notif.personaje).toContain('CHISPA');
    expect(notif.titulo).toContain('Carlos');
    expect(notif.titulo).toContain('4 días');
  });

  it('determina escenario de reactivación/regreso cuando la racha es 0', () => {
    const notif = evaluarNotificacion({
      usuario: { nombre: 'Sofía' },
      racha: { actual: 0, hoy: false },
    });

    expect(notif.clave).toBe(ESCENARIOS_NOTIFICACION.REGRESO);
    expect(notif.personaje).toContain('GOLIAT');
    expect(notif.titulo).toContain('Sofía');
  });

  it('permite leer y guardar la hora preferida de notificación', () => {
    guardarHoraPreferencia('20:30');
    expect(leerHoraPreferencia()).toBe('20:30');
  });
});
