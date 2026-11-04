import { describe, expect, it } from 'vitest';
import {
  aplicarActividad,
  aplicarExamen,
  aplicarInsignia,
  aplicarLeccion,
  aplicarSesion,
  claveAlmacen,
  combinarConServidor,
  combinarEstados,
  combinarRegistros,
  confirmarEventos,
  confirmarProgreso,
  crearEvento,
  desdeParaDescargar,
  estadoVacio,
  fechaIso,
  MAX_EVENTOS,
  normalizarEstado,
  prepararEnvio,
  tieneContenido,
} from './estado';
import { calcularXP } from './reglas';

const HOY = new Date(2026, 9, 2, 10, 0); // 2 de octubre, hora local
const DIA = '2026-10-02';

const V1 = {
  version: 1,
  alumnoId: 'alumno-1234',
  lecciones: {
    'blender:les_001': { completada: true, intentos: 0, puntaje: null, actualizadoEn: '2026-09-28T10:00:00.000Z' },
    'blender:les_004': { completada: true, intentos: 2, puntaje: 85, actualizadoEn: '2026-09-29T10:00:00.000Z' },
    'aframe:les_af_003': { completada: false, intentos: 1, puntaje: 40, actualizadoEn: '2026-09-30T10:00:00.000Z' },
  },
  pendientes: ['blender:les_004', 'aframe:les_af_003'],
};

describe('migración v1 → v2', () => {
  it('conserva el alumno, las lecciones y los pendientes', () => {
    const estado = normalizarEstado(V1);
    expect(estado.version).toBe(2);
    expect(estado.alumnoId).toBe('alumno-1234');
    expect(estado.cuentaId).toBeNull();
    expect(Object.keys(estado.lecciones)).toEqual(Object.keys(V1.lecciones));
    expect(estado.lecciones['blender:les_004']).toMatchObject({ completada: true, intentos: 2, puntaje: 85 });
    expect(estado.lecciones['aframe:les_af_003']).toMatchObject({ completada: false, intentos: 1, puntaje: 40 });
    expect(estado.pendientes).toEqual(V1.pendientes);
    // Campos nuevos vacíos.
    expect(estado).toMatchObject({ insignias: {}, actividad: {}, insigniasPendientes: [], eventos: [] });
  });

  it('el XP no cambia al migrar', () => {
    expect(calcularXP(normalizarEstado(V1))).toBe(calcularXP(V1));
  });

  it('usa actualizadoEn como fecha de completado si no hay otra', () => {
    const estado = normalizarEstado(V1);
    expect(estado.lecciones['blender:les_001'].completadaEn).toBe('2026-09-28T10:00:00.000Z');
    expect(estado.lecciones['aframe:les_af_003'].completadaEn).toBeUndefined();
  });

  it('un estado v2 se lee igual y vacío crea un alumno nuevo', () => {
    const v2 = normalizarEstado(V1);
    expect(normalizarEstado(JSON.parse(JSON.stringify(v2)))).toEqual(v2);
    const nuevo = normalizarEstado(undefined);
    expect(nuevo.alumnoId).toMatch(/^alumno-/);
    expect(tieneContenido(nuevo)).toBe(false);
  });

  it('liga el estado a la cuenta indicada', () => {
    expect(normalizarEstado(V1, { cuentaId: 'usr-1' }).cuentaId).toBe('usr-1');
    expect(claveAlmacen(null)).toBe('progreso');
    expect(claveAlmacen('usr-1')).toBe('progreso:usr-1');
  });

  it('descarta basura sin perder lo válido', () => {
    const raro = { ...V1, lecciones: { ...V1.lecciones, sinClave: { completada: true } }, pendientes: ['no-existe', 3] };
    const estado = normalizarEstado(raro);
    expect(estado.lecciones.sinClave).toBeUndefined();
    expect(estado.pendientes).toEqual([]);
    expect(Object.keys(estado.lecciones)).toHaveLength(3);
  });
});

describe('fechas del servidor', () => {
  it('una fecha sin zona se interpreta como UTC', () => {
    expect(fechaIso('2026-10-01T12:00:00')).toBe('2026-10-01T12:00:00.000Z');
    expect(fechaIso('2026-10-01T12:00:00+02:00')).toBe('2026-10-01T10:00:00.000Z');
    expect(fechaIso('no es fecha')).toBeNull();
  });
});

describe('acciones', () => {
  it('completar una lección: pendiente, actividad del día y evento lesson_completed una sola vez', () => {
    let estado = estadoVacio({ alumnoId: 'alumno-x' });
    estado = aplicarLeccion(estado, 'c', 'l1', { completada: true }, { momento: HOY, sesion: 's1' });
    expect(estado.lecciones['c:l1']).toMatchObject({ completada: true, intentos: 0 });
    expect(estado.lecciones['c:l1'].completadaEn).toBe(HOY.toISOString());
    expect(estado.pendientes).toEqual(['c:l1']);
    expect(estado.actividad).toEqual({ [DIA]: 1 });
    expect(estado.eventos).toHaveLength(1);
    expect(estado.eventos[0]).toMatchObject({ tipo: 'lesson_completed', curso_id: 'c', leccion_id: 'l1', sesion_aprendizaje: 's1' });
    expect(estado.eventos[0].id).toHaveLength(36);

    estado = aplicarLeccion(estado, 'c', 'l1', { completada: true }, { momento: HOY });
    expect(estado.eventos).toHaveLength(1);
    expect(estado.actividad[DIA]).toBe(2);
    expect(estado.pendientes).toEqual(['c:l1']);
  });

  it('examen: guarda el mejor puntaje, cuenta intentos y nunca descompleta', () => {
    let estado = estadoVacio();
    estado = aplicarExamen(estado, 'c', 'ex', 60, false, { momento: HOY });
    expect(estado.lecciones['c:ex']).toMatchObject({ completada: false, intentos: 1, puntaje: 60 });
    estado = aplicarExamen(estado, 'c', 'ex', 90, true, { momento: HOY });
    estado = aplicarExamen(estado, 'c', 'ex', 70, false, { momento: HOY });
    expect(estado.lecciones['c:ex']).toMatchObject({ completada: true, intentos: 3, puntaje: 90 });
    const tipos = estado.eventos.map((e) => e.tipo);
    expect(tipos.filter((t) => t === 'activity_submitted')).toHaveLength(3);
    expect(tipos.filter((t) => t === 'lesson_completed')).toHaveLength(1);
  });

  it('actividad: cada bloque cuenta una vez y las perfectas suman XP', () => {
    let estado = estadoVacio();
    estado = aplicarActividad(estado, 'c', 'l1', 'b1', { correcto: true, intentos: 1 }, { momento: HOY });
    estado = aplicarActividad(estado, 'c', 'l1', 'b2', { correcto: true, intentos: 3 }, { momento: HOY });
    estado = aplicarActividad(estado, 'c', 'l1', 'b1', { correcto: true, intentos: 1 }, { momento: HOY });
    estado = aplicarActividad(estado, 'c', 'l1', 'b3', { correcto: false, intentos: 2 }, { momento: HOY });
    const registro = estado.lecciones['c:l1'];
    expect(registro.datos).toEqual({ a: 2, p: 1 });
    expect(registro.completada).toBe(false);
    expect(estado.actividad[DIA]).toBe(4);
    expect(estado.eventos.every((e) => e.tipo === 'activity_submitted')).toBe(true);
    expect(calcularXP(estado)).toBe(10);
    // Al completar la lección se suman los 100.
    estado = aplicarLeccion(estado, 'c', 'l1', { completada: true }, { momento: HOY });
    expect(calcularXP(estado)).toBe(110);
    expect(estado.lecciones['c:l1'].datos).toEqual({ a: 2, p: 1 });
  });

  it('insignias: una vez, pendiente de enviar', () => {
    let estado = aplicarInsignia(estadoVacio(), 'c:m1', HOY);
    expect(estado.insignias['c:m1']).toBe(HOY.toISOString());
    expect(estado.insigniasPendientes).toEqual(['c:m1']);
    const igual = aplicarInsignia(estado, 'c:m1', new Date());
    expect(igual).toBe(estado);
  });

  it('learning_session_started: una vez por lección y día', () => {
    let estado = estadoVacio();
    estado = aplicarSesion(estado, 'c', 'l1', { momento: HOY, sesion: 's' });
    const mismo = aplicarSesion(estado, 'c', 'l1', { momento: HOY, sesion: 's' });
    expect(mismo).toBe(estado);
    estado = aplicarSesion(estado, 'c', 'l2', { momento: HOY });
    estado = aplicarSesion(estado, 'c', 'l1', { momento: new Date(2026, 9, 3, 9) });
    expect(estado.eventos.map((e) => e.tipo)).toEqual([
      'learning_session_started',
      'learning_session_started',
      'learning_session_started',
    ]);
    // Abrir una lección no cuenta como actividad ni la deja pendiente.
    expect(estado.actividad).toEqual({});
    expect(estado.pendientes).toEqual([]);
  });

  it('la cola de eventos guarda como máximo 500', () => {
    let estado = estadoVacio();
    for (let i = 0; i < MAX_EVENTOS + 20; i++) {
      estado = aplicarSesion(estado, 'c', `l${i}`, { momento: HOY });
    }
    expect(estado.eventos).toHaveLength(MAX_EVENTOS);
    expect(estado.eventos.at(-1).leccion_id).toBe(`l${MAX_EVENTOS + 19}`);
  });
});

describe('fusión', () => {
  it('combinarRegistros es monotónico', () => {
    const a = { completada: true, intentos: 1, puntaje: 70, actualizadoEn: '2026-09-01T00:00:00.000Z', completadaEn: '2026-09-01T00:00:00.000Z', datos: { a: 2, p: 0 } };
    const b = { completada: false, intentos: 3, puntaje: 50, actualizadoEn: '2026-09-05T00:00:00.000Z', datos: { a: 1, p: 1 } };
    expect(combinarRegistros(a, b)).toEqual({
      completada: true,
      intentos: 3,
      puntaje: 70,
      actualizadoEn: '2026-09-05T00:00:00.000Z',
      completadaEn: '2026-09-01T00:00:00.000Z',
      datos: { a: 2, p: 1 },
    });
    expect(combinarRegistros(b, a)).toEqual(combinarRegistros(a, b));
  });

  it('al iniciar sesión el progreso anónimo se une a la cuenta y queda pendiente', () => {
    const anonimo = aplicarInsignia(normalizarEstado(V1), 'blender:mod_teoria_001', HOY);
    let cuenta = normalizarEstado(undefined, { cuentaId: 'usr-1' });
    cuenta = aplicarLeccion(cuenta, 'blender', 'les_002', { completada: true }, { momento: HOY });
    cuenta = confirmarProgreso(cuenta, prepararEnvio(cuenta));

    const unido = combinarEstados(cuenta, anonimo);
    expect(unido.cuentaId).toBe('usr-1');
    expect(unido.alumnoId).toBe(cuenta.alumnoId);
    expect(Object.keys(unido.lecciones).sort()).toEqual(
      ['aframe:les_af_003', 'blender:les_001', 'blender:les_002', 'blender:les_004'].sort(),
    );
    expect(unido.pendientes.sort()).toEqual(Object.keys(V1.lecciones).sort());
    expect(unido.insignias['blender:mod_teoria_001']).toBeTruthy();
    expect(unido.insigniasPendientes).toEqual(['blender:mod_teoria_001']);
    expect(calcularXP(unido)).toBe(calcularXP(cuenta) + calcularXP(anonimo));
    // Repetir la fusión no duplica nada.
    expect(combinarEstados(unido, anonimo)).toEqual(unido);
  });

  it('combina con GET /api/progreso sin perder lo local', () => {
    let estado = normalizarEstado(undefined, { cuentaId: 'usr-1' });
    estado = aplicarLeccion(estado, 'c', 'local', { completada: true }, { momento: HOY });
    estado = aplicarExamen(estado, 'c', 'ex', 70, false, { momento: HOY });
    estado = confirmarProgreso(estado, prepararEnvio(estado));
    expect(estado.pendientes).toEqual([]);

    const servidor = {
      usuario_id: 'usr-1',
      lecciones: [
        { curso_id: 'c', leccion_id: 'otro_dispositivo', completada: true, puntaje: null, intentos: 0, datos_ligeros: { a: 1, p: 1 }, completada_en: '2026-09-01T08:00:00', actualizado_en: '2026-09-01T08:00:00' },
        { curso_id: 'c', leccion_id: 'ex', completada: true, puntaje: 95, intentos: 2, datos_ligeros: null, completada_en: '2026-09-02T08:00:00', actualizado_en: '2026-09-02T08:00:00' },
      ],
      insignias: [{ id: 'c:m1', obtenido_en: '2026-09-02T08:00:00' }],
    };
    const unido = combinarConServidor(estado, servidor);
    expect(unido.lecciones['c:otro_dispositivo']).toMatchObject({ completada: true, datos: { a: 1, p: 1 } });
    expect(unido.lecciones['c:otro_dispositivo'].completadaEn).toBe('2026-09-01T08:00:00.000Z');
    expect(unido.lecciones['c:ex']).toMatchObject({ completada: true, puntaje: 95, intentos: 2 });
    expect(unido.insignias['c:m1']).toBe('2026-09-02T08:00:00.000Z');
    // "local" no está en el servidor: queda pendiente para repararlo.
    expect(unido.pendientes).toEqual(['c:local']);
    expect(unido.insigniasPendientes).toEqual([]);
  });

  it('las insignias locales que el servidor no tiene quedan pendientes', () => {
    const estado = confirmarProgreso(aplicarInsignia(estadoVacio({ cuentaId: 'u' }), 'c:m1', HOY), { insignias: ['c:m1'] });
    expect(estado.insigniasPendientes).toEqual([]);
    expect(combinarConServidor(estado, { lecciones: [], insignias: [] }).insigniasPendientes).toEqual(['c:m1']);
  });

  it('una descarga parcial no marca como pendiente lo que no vino', () => {
    let estado = aplicarLeccion(estadoVacio({ cuentaId: 'u' }), 'c', 'vieja', { completada: true }, { momento: HOY });
    estado = confirmarProgreso(estado, prepararEnvio(estado));
    const parcial = {
      lecciones: [{ curso_id: 'c', leccion_id: 'nueva', completada: true, actualizado_en: '2026-10-02T09:00:00' }],
      insignias: [],
      parcial: true,
      servidor_en: '2026-10-02T10:00:00',
    };
    const unido = combinarConServidor(estado, parcial);
    expect(unido.lecciones['c:nueva'].completada).toBe(true);
    expect(unido.pendientes).toEqual([]);
    expect(unido.marcas.descargado).toBe('2026-10-02T10:00:00');
    expect(unido.marcas.descargaCompleta).toBeNull();
    // La misma respuesta completa sí repara lo que falta en el servidor.
    expect(combinarConServidor(estado, { ...parcial, parcial: false }).pendientes).toEqual(['c:vieja']);
  });

  it('pide solo lo cambiado, salvo la primera vez y una vez por semana', () => {
    const ahora = Date.parse('2026-10-10T12:00:00Z');
    const conMarcas = (marcas) => ({ marcas: { ...estadoVacio().marcas, ...marcas } });
    expect(desdeParaDescargar(estadoVacio(), ahora)).toBeNull();
    const reciente = conMarcas({ descargado: '2026-10-10T11:00:00', descargaCompleta: '2026-10-09T12:00:00.000Z' });
    expect(desdeParaDescargar(reciente, ahora)).toBe('2026-10-10T11:00:00');
    const vieja = conMarcas({ descargado: '2026-10-10T11:00:00', descargaCompleta: '2026-10-01T12:00:00.000Z' });
    expect(desdeParaDescargar(vieja, ahora)).toBeNull();
  });

  it('conserva las marcas de descarga al recargar', () => {
    const estado = combinarConServidor(estadoVacio({ cuentaId: 'u' }), { lecciones: [], insignias: [], servidor_en: '2026-10-02T10:00:00' });
    const recargado = normalizarEstado(JSON.parse(JSON.stringify(estado)), { cuentaId: 'u' });
    expect(recargado.marcas.descargado).toBe('2026-10-02T10:00:00');
    expect(recargado.marcas.descargaCompleta).toBe(estado.marcas.descargaCompleta);
  });
});

describe('sincronización', () => {
  it('prepara el lote y confirma solo lo que no cambió', () => {
    let estado = estadoVacio({ alumnoId: 'alumno-1' });
    estado = aplicarActividad(estado, 'c', 'l1', 'b1', { correcto: true, intentos: 1 }, { momento: HOY });
    estado = aplicarLeccion(estado, 'c', 'l2', { completada: true }, { momento: HOY });
    estado = aplicarInsignia(estado, 'c:m1', HOY);
    const lote = prepararEnvio(estado);
    expect(lote.eventos).toEqual([
      { curso_id: 'c', leccion_id: 'l1', completada: false, puntaje: null, intentos: 0, actualizado_en: HOY.toISOString(), datos_ligeros: { a: 1, p: 1 } },
      { curso_id: 'c', leccion_id: 'l2', completada: true, puntaje: null, intentos: 0, actualizado_en: HOY.toISOString(), completada_en: HOY.toISOString() },
    ]);
    expect(lote.insignias).toEqual(['c:m1']);

    // Mientras se enviaba, l2 cambió: sigue pendiente.
    const despues = aplicarLeccion(estado, 'c', 'l2', { completada: true }, { momento: new Date(2026, 9, 2, 11) });
    const confirmado = confirmarProgreso(despues, lote);
    expect(confirmado.pendientes).toEqual(['c:l2']);
    expect(confirmado.insigniasPendientes).toEqual([]);
  });

  it('descarta claves que el servidor rechazaría', () => {
    let estado = estadoVacio();
    estado = aplicarLeccion(estado, 'c', 'x'.repeat(60), { completada: true }, { momento: HOY });
    const lote = prepararEnvio(estado);
    expect(lote.eventos).toEqual([]);
    expect(lote.descartadas).toHaveLength(1);
    expect(confirmarProgreso(estado, lote).pendientes).toEqual([]);
  });

  it('confirma eventos por id', () => {
    let estado = estadoVacio();
    const a = crearEvento('sync_succeeded', { momento: HOY });
    estado = { ...estado, eventos: [a, crearEvento('learning_session_started', { cursoId: 'c', leccionId: 'l', momento: HOY })] };
    expect(confirmarEventos(estado, [a.id]).eventos).toHaveLength(1);
    expect(a).toMatchObject({ tipo: 'sync_succeeded', ocurrido_en: HOY.toISOString(), version_app: expect.any(String) });
  });
});

describe('lecciones que cambiaron de curso (A-Frame en dos cursos, 2026-10-23)', () => {
  const registro = { completada: true, intentos: 1, puntaje: 90, actualizadoEn: '2026-10-20T10:00:00Z' };

  it('el avance local de los módulos 4 y 5 de «aframe» pasa a «aframe_interactivo»', () => {
    const estado = normalizarEstado({
      lecciones: { 'aframe:af4_gancho': registro, 'aframe:af2_gancho': registro, 'aframe:af5_jefe': registro },
      insignias: { 'aframe:mod_aframe_004': '2026-10-20T10:00:00Z', 'aframe:mod_aframe_002': '2026-10-20T10:00:00Z' },
      pendientes: ['aframe:af4_gancho'],
    });
    expect(Object.keys(estado.lecciones).sort()).toEqual(['aframe:af2_gancho', 'aframe_interactivo:af4_gancho', 'aframe_interactivo:af5_jefe']);
    expect(Object.keys(estado.insignias).sort()).toEqual(['aframe:mod_aframe_002', 'aframe_interactivo:mod_afi_001']);
    expect(estado.pendientes).toEqual(['aframe_interactivo:af4_gancho']);
  });

  it('lo que el servidor guarda con el curso viejo se lee con el nuevo', () => {
    const estado = combinarConServidor(normalizarEstado({}), {
      lecciones: [{ curso_id: 'aframe', leccion_id: 'af5_reto', completada: true, intentos: 1, actualizado_en: '2026-10-20T10:00:00' }],
      insignias: [{ id: 'aframe:mod_aframe_005', obtenido_en: '2026-10-20T10:00:00' }],
    });
    expect(estado.lecciones['aframe_interactivo:af5_reto'].completada).toBe(true);
    expect(estado.lecciones['aframe:af5_reto']).toBeUndefined();
    expect(estado.insignias['aframe_interactivo:mod_afi_003']).toBeTruthy();
    expect(estado.pendientes).toEqual([]);
  });
});
