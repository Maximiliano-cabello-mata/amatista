import { describe, expect, it } from 'vitest';
import mesa from '../../../practices/blender/level_1/mesa.json';
import modulo2 from '../data/modulos/blender-modulo-2.json';
import {
  blenderCompatible,
  compararVersiones,
  detectarSistema,
  normalizarCodigo,
  pasosConEstado,
  resumenPractica,
  textoAutonomia,
} from './logica';

describe('detectarSistema', () => {
  it('reconoce Windows, macOS y Linux', () => {
    expect(detectarSistema({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' })).toBe('windows');
    expect(detectarSistema({ plataforma: 'MacIntel', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5)' })).toBe('macos');
    expect(detectarSistema({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' })).toBe('linux');
  });

  it('celulares y tabletas no instalan Blender', () => {
    expect(detectarSistema({ userAgent: 'Mozilla/5.0 (Linux; Android 14) Mobile' })).toBeNull();
    expect(detectarSistema({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' })).toBeNull();
    expect(detectarSistema({})).toBeNull();
  });
});

describe('normalizarCodigo', () => {
  it('acepta minúsculas, espacios y guion', () => {
    expect(normalizarCodigo('abcd 2345')).toBe('ABCD-2345');
    expect(normalizarCodigo(' ABCD-2345 ')).toBe('ABCD-2345');
  });

  it('rechaza lo que no es un código', () => {
    expect(normalizarCodigo('ABC')).toBeNull();
    expect(normalizarCodigo('ABCD-23456')).toBeNull();
    expect(normalizarCodigo('ABCD_2345')).toBeNull();
  });
});

describe('versiones de Blender', () => {
  it('compara por números, no por texto', () => {
    expect(compararVersiones('4.10', '4.9')).toBe(1);
    expect(compararVersiones('4.2', '4.2.0')).toBe(0);
    expect(compararVersiones('3.6.9', '4.2')).toBe(-1);
  });

  it('4.2 o más nuevo es compatible', () => {
    expect(blenderCompatible('5.1.1')).toBe(true);
    expect(blenderCompatible('4.2.0')).toBe(true);
    expect(blenderCompatible('4.1')).toBe(false);
  });
});

describe('pasosConEstado', () => {
  const pasos = [
    { id: 'cubierta', titulo: 'Crea la cubierta' },
    { id: 'patas', titulo: 'Agrega cuatro patas' },
    { id: 'guardar', titulo: 'Guarda' },
  ];

  it('marca cumplidos, el actual y los pendientes', () => {
    const estados = pasosConEstado(pasos, { objetivos: ['cubierta'], paso_actual: 'patas' }).map((p) => p.estado);
    expect(estados).toEqual(['completado', 'actual', 'pendiente']);
  });

  it('una práctica completa tiene todo completado', () => {
    expect(pasosConEstado(pasos, { completada: true, objetivos: [] }).every((p) => p.estado === 'completado')).toBe(true);
  });

  it('acepta textos del bloque cuando no hay conexión', () => {
    expect(pasosConEstado(['Uno', 'Dos'])).toEqual([
      { id: 'paso-0', titulo: 'Uno', estado: 'pendiente' },
      { id: 'paso-1', titulo: 'Dos', estado: 'pendiente' },
    ]);
  });
});

describe('textos', () => {
  it('resume el progreso de una práctica', () => {
    expect(resumenPractica(null)).toBe('Sin empezar');
    expect(resumenPractica({ intentos: 0 })).toBe('Abierta: continúa en Blender');
    expect(resumenPractica({ intentos: 2, progreso: 55 })).toBe('55 % en Blender');
    expect(resumenPractica({ completada: true })).toBe('Completada');
    expect(textoAutonomia('con_pistas')).toBe('Con pistas');
    expect(textoAutonomia('otra')).toBeNull();
  });
});

describe('primera práctica en el módulo 2', () => {
  const bloques = modulo2.module.lessons.flatMap((leccion) => leccion.contentBlocks);
  const practica = bloques.find((b) => b.type === 'blender_practice');

  it('la lección enlaza la práctica de la mesa', () => {
    expect(practica.practica).toBe(mesa.id);
    expect(practica.id).toBeTruthy();
  });

  it('los pasos sin conexión son los objetivos obligatorios de la práctica', () => {
    const obligatorios = mesa.targets.filter((t) => !t.optional).map((t) => t.title);
    expect(practica.steps).toEqual(obligatorios);
  });

  it('queda en revisión: no llega a los alumnos hasta publicarlo', () => {
    expect(modulo2.module.estado).toBe('revision');
  });
});
