import { describe, expect, it } from 'vitest';
import { calcularVista, estacionConRevision, normalizarModo } from './reglas';

describe('vista del equipo', () => {
  it('un alumno siempre ve la vista de alumno, sin revisión', () => {
    expect(calcularVista(false, 'admin')).toEqual({ equipo: false, modo: 'alumno', comoAlumno: true, revision: false });
  });

  it('el equipo empieza en la vista de administrador con las lecciones abiertas', () => {
    expect(calcularVista(true, undefined)).toEqual({ equipo: true, modo: 'admin', comoAlumno: false, revision: true });
    expect(calcularVista(true, 'cualquiera').modo).toBe('admin');
  });

  it('el equipo puede ver la plataforma como alumno', () => {
    expect(calcularVista(true, 'alumno')).toEqual({ equipo: true, modo: 'alumno', comoAlumno: true, revision: false });
  });

  it('normaliza modos desconocidos', () => {
    expect(normalizarModo('alumno')).toBe('alumno');
    expect(normalizarModo(null)).toBe('admin');
  });

  it('abre las estaciones bloqueadas solo en revisión', () => {
    const bloqueada = { estado: 'bloqueada', faltan: 2 };
    expect(estacionConRevision(bloqueada, true)).toEqual({ estado: 'abierta', faltan: 2, porRevision: true });
    expect(estacionConRevision(bloqueada, false)).toBe(bloqueada);
    const hecha = { estado: 'hecha', faltan: 0 };
    expect(estacionConRevision(hecha, true)).toBe(hecha);
    expect(estacionConRevision(null, true)).toBeNull();
  });
});
