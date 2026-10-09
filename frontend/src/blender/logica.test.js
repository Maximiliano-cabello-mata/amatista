import { describe, expect, it } from 'vitest';
import mesa from '../../../practices/archivo/v2/mesa.json';
import modulo2 from '../data/modulos/archivo/blender-modulo-2.json';
import {
  estadoBlender,
  CONTROLES_BLENDER,
  controlesDisponibles,
  instructorEnVivo,
  OPCIONES_ENFOQUE,
  blenderCompatible,
  compararVersiones,
  detectarSistema,
  MOTOR,
  NOMBRE_MOTOR,
  normalizarCodigo,
  pasosConEstado,
  resumenPractica,
  textoAutonomia,
  versionDelServidor,
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

  it('quedó archivado con el curso v2 (motor v3): no llega a los alumnos', () => {
    expect(modulo2.module.estado).toBe('archivado');
  });
});

describe('Amatista Motor', () => {
  it('se llama «Amatista Motor 3.5» y coincide con el manifiesto del add-on', async () => {
    const { readFileSync } = await import('node:fs');
    const manifiesto = readFileSync(new URL('../../../addon/amatista_blender/blender_manifest.toml', import.meta.url), 'utf8');
    expect(manifiesto).toContain(`version = "${MOTOR.version}"`);
    expect(manifiesto).toContain(`name = "${MOTOR.nombre}"`);
    expect(NOMBRE_MOTOR).toBe('Amatista Motor 3.5');
  });

  it('avisa si el servidor entrega una versión vieja', () => {
    expect(versionDelServidor({ version_addon: '3.5.0' })).toEqual({ conocida: true, version: '3.5.0', alDia: true });
    expect(versionDelServidor({ version_addon: '3.4.0' }).alDia).toBe(false);
    expect(versionDelServidor({ version_addon: '3.0.0' }).alDia).toBe(false);
    expect(versionDelServidor(null).conocida).toBe(false);
  });
});

describe('enlace en vivo con Blender (motor 3.4)', () => {
  const blender = (extra) => ({ en_linea: true, practica_id: 'blender.bp.m1.tren', practica: 'Tren de juguete', progreso: 40, enfocado: true, ...extra });

  it('sin 010 en el servidor no muestra nada', () => {
    expect(estadoBlender({ enlace: false }).estado).toBe('sin_enlace');
    expect(estadoBlender(null).estado).toBe('sin_enlace');
  });

  it('distingue cerrado, otra práctica y esta práctica', () => {
    expect(estadoBlender({ enlace: true, blender: [] }).estado).toBe('cerrado');
    expect(estadoBlender({ enlace: true, blender: [blender({ en_linea: false })] }).estado).toBe('cerrado');
    const aqui = estadoBlender({ enlace: true, blender: [blender()] }, 'blender.bp.m1.tren');
    expect(aqui.estado).toBe('aqui');
    expect(aqui.texto).toBe('Tu Blender está en esta práctica (40 %) · enfocado.');
    const otra = estadoBlender({ enlace: true, blender: [blender()] }, 'blender.bp.m2.espada');
    expect(otra.estado).toBe('otra');
    expect(otra.texto).toContain('«Tren de juguete»');
  });

  it('las opciones de enfoque son las que acepta el servidor', () => {
    expect(OPCIONES_ENFOQUE.map((o) => o.id)).toEqual(['auto', 'siempre', 'nunca']);
  });
});

describe('el instructor en vivo (motor 3.5)', () => {
  const detalle = {
    titulo: 'Forja la silueta', mensaje: 'Falta la parte «Guarda»', numero: 3, total: 5, modo: 'EDIT_MESH', pistas: 1,
    accion: 'Entrar a Edición conmigo',
    lista: [{ texto: 'Mango', ok: true, estado: 'Bien' }, { texto: 'Guarda', ok: false, estado: 'Falta', consejo: 'Ctrl + R…' }],
  };

  it('resume lo que muestra Blender', () => {
    const i = instructorEnVivo({ detalle });
    expect(i.paso).toBe('Paso 3 de 5');
    expect(i.modo).toBe('Modo Edición');
    expect(i.hechas).toBe(1);
    expect(instructorEnVivo({ detalle: null })).toBeNull();
    expect(instructorEnVivo(null)).toBeNull();
  });

  it('ofrece solo los controles que sirven ahora', () => {
    const todos = controlesDisponibles(instructorEnVivo({ detalle })).map((c) => c.tipo);
    expect(todos).toEqual(['comprobar', 'pista', 'hazlo_conmigo', 'guardar', 'reiniciar']);
    const sinAyuda = controlesDisponibles(instructorEnVivo({ detalle: { ...detalle, pistas: 0, accion: '' } })).map((c) => c.tipo);
    expect(sinAyuda).toEqual(['comprobar', 'guardar', 'reiniciar']);
    expect(controlesDisponibles(null).map((c) => c.tipo)).toEqual(['comprobar']);
  });

  it('empezar de nuevo pregunta antes', () => {
    expect(CONTROLES_BLENDER.find((c) => c.tipo === 'reiniciar').confirmar).toContain('no se borra');
  });
});
