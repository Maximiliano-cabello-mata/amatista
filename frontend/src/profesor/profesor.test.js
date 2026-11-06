import { deflateSync } from 'node:zlib';
import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { analizarRuta, rutas } from '../rutas';
import { VISTAS, colorCara, proyectarEscena } from './dibujo';
import { codigoDictado, contarEstados, estadoAlumno, estadoParaAlumno, fecha, finDelDia, ordenarAlumnos } from './logica';
import {
  FORMATO,
  PLANTILLAS_CODIGO_MODELO,
  aSRGB,
  armarEscena,
  bytesLegibles,
  compilarCodigoModelo,
  desempaquetar,
  medidaLegible,
} from './modelo';
import {
  CODIGO_CLASE_DEMO,
  evaluarEntregaLocal,
  recogerModeloLocal,
  subirCodigoModeloLocal,
  unirseAGrupoLocal,
  verAsignacionLocal,
} from './aulaLocal';

// Igual que addon/amatista_blender/modelo_ligero.py › empaquetar: JSON → zlib → base64.
const empaquetar = (datos) => deflateSync(Buffer.from(JSON.stringify(datos))).toString('base64');

const CUBO = {
  formato: FORMATO,
  blender: '5.0.1',
  centro: [1, 1, 1],
  escala: 1,
  materiales: [{ nombre: 'Madera', color: [0.5, 0.2, 0.1] }],
  objetos: [
    {
      nombre: 'Caja',
      tipo: 'MESH',
      material: 0,
      // Cubo de lado 2 alrededor de (1, 1, 1): de 0 a 2 en cada eje.
      v: [-1, -1, -1, 1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1].map((c) => c * 32767),
      t: [0, 1, 3, 0, 3, 2, 4, 6, 7, 4, 7, 5, 0, 4, 5, 0, 5, 1, 2, 3, 7, 2, 7, 6, 0, 2, 6, 0, 6, 4, 1, 5, 7, 1, 7, 3],
      mods: ['BEVEL'],
    },
    { nombre: 'Luz', tipo: 'LIGHT', p: [0, 0, 4] },
  ],
};

describe('modelo ligero y compilador de código del alumno', () => {
  it('descomprime lo que manda el add-on y arma la escena en metros', async () => {
    const datos = await desempaquetar(empaquetar(CUBO));
    const escena = armarEscena(datos);
    expect(escena.cuentas).toEqual({ objetos: 2, mallas: 1, vertices: 8, triangulos: 12, materiales: 1 });
    expect(escena.centro).toEqual([1, 1, 1]);
    expect(escena.medidas.map((m) => Math.round(m * 100) / 100)).toEqual([2, 2, 2]);
    expect(escena.suelo).toBeCloseTo(0);
    expect(escena.objetos[0].color[0]).toBeCloseTo(aSRGB(0.5));
    expect(escena.objetos[1].triangulos).toBeNull();
  });

  it('compila scripts Python bpy, escenas A-Frame <a-scene> y recetas JSON para recrearlos en el visor del profesor', async () => {
    for (const plantilla of PLANTILLAS_CODIGO_MODELO) {
      const modelo = compilarCodigoModelo(plantilla.codigo);
      expect(modelo.formato).toBe(FORMATO);
      expect(modelo.codigo_fuente).toContain(plantilla.codigo.trim().slice(0, 15));
      const desempaquetado = await desempaquetar(JSON.stringify(modelo));
      const escena = armarEscena(desempaquetado);
      expect(escena.cuentas.mallas).toBeGreaterThan(0);
      expect(escena.cuentas.triangulos).toBeGreaterThan(8);
      expect(escena.codigoFuente).toBeTruthy();
    }
  });

  it('permite al alumno unirse a una clase, subir el código del modelo y al profesor recrearlo y calificarlo', async () => {
    const union = unirseAGrupoLocal(CODIGO_CLASE_DEMO, { id: 'alu-test', nombre: 'Elena Prueba', email: 'elena@aula.edu' });
    expect(union.datos.codigo).toBe(CODIGO_CLASE_DEMO);

    const envio = subirCodigoModeloLocal({
      asignacionId: 'asg-tren-m1',
      codigo: PLANTILLAS_CODIGO_MODELO[0].codigo,
      usuario: { id: 'alu-test', nombre: 'Elena Prueba', email: 'elena@aula.edu' },
    });
    expect(envio.ok).toBe(true);
    expect(envio.datos.resumen.mallas).toBeGreaterThanOrEqual(4);

    const recogido = recogerModeloLocal('asg-tren-m1', 'alu-test');
    const datos = await desempaquetar(recogido.datos.modelo);
    const escena = armarEscena(datos);
    expect(escena.cuentas.mallas).toBe(envio.datos.resumen.mallas);
    expect(escena.lenguaje).toBe('python');

    const calificada = evaluarEntregaLocal('asg-tren-m1', 'alu-test', {
      estado: 'evaluada',
      calificacion: 10,
      comentario: 'Excelente recreación 3D desde código Python bpy.',
    });
    expect(calificada.datos.calificacion).toBe(10);
    const vistaProf = verAsignacionLocal('asg-tren-m1');
    expect(vistaProf.datos.alumnos.some((a) => a.alumno.id === 'alu-test')).toBe(true);
  });

  it('rechaza otro formato', async () => {
    await expect(desempaquetar(empaquetar({ formato: 'otro' }))).rejects.toThrow(/formato/);
  });

  it('textos de tamaño', () => {
    expect(bytesLegibles(3000)).toBe('3 KB');
    expect(bytesLegibles(2.5 * 1024 * 1024)).toBe('2.5 MB');
    expect(medidaLegible(0.42)).toBe('42 cm');
    expect(medidaLegible(1.5)).toBe('1.50 m');
  });
});

describe('dibujo', () => {
  it('proyecta los triángulos ordenados de lejos a cerca y dentro del lienzo', () => {
    const escena = armarEscena(CUBO);
    const { caras } = proyectarEscena(escena, { ...VISTAS.perspectiva, ancho: 400, alto: 300 });
    expect(caras).toHaveLength(12);
    for (let i = 1; i < caras.length; i++) expect(caras[i - 1].profundidad).toBeGreaterThanOrEqual(caras[i].profundidad);
    for (const cara of caras) {
      for (let k = 0; k < 6; k += 2) {
        expect(cara.puntos[k]).toBeGreaterThan(0);
        expect(cara.puntos[k]).toBeLessThan(400);
      }
      expect(cara.luz).toBeGreaterThan(0.3);
    }
    expect(proyectarEscena(escena, { ...VISTAS.frente, ancho: 400, alto: 300, ocultos: new Set([0]) }).caras).toHaveLength(0);
  });

  it('colorea con luz y resalta en amatista', () => {
    expect(colorCara([1, 1, 1], 0.5)).toBe('rgb(128, 128, 128)');
    expect(colorCara([0, 0, 0], 1, true)).toBe('rgb(76, 38, 111)');
  });
});

describe('reglas del panel', () => {
  const fila = (nombre, entrega = null, avance = null) => ({ alumno: { id: nombre, nombre }, entrega, avance });
  const filas = [
    fila('Zoe'),
    fila('Ana', { estado: 'evaluada' }),
    fila('Luis', { estado: 'entregada' }),
    fila('Beto', null, { progreso: 40 }),
    fila('Carla', { estado: 'entregada', tarde: true }),
  ];

  it('ordena primero lo que espera evaluación', () => {
    expect(ordenarAlumnos(filas).map((f) => f.alumno.nombre)).toEqual(['Carla', 'Luis', 'Beto', 'Ana', 'Zoe']);
    expect(estadoAlumno(filas[4]).texto).toBe('Entregó tarde');
    expect(estadoAlumno(filas[3]).texto).toBe('Trabajando · 40 %');
    expect(contarEstados(filas)).toEqual({ entregada: 2, evaluada: 1, rehacer: 0, trabajando: 1, sin_empezar: 1 });
  });

  it('lo que ve el alumno', () => {
    const hoy = new Date('2026-11-10T12:00:00Z');
    expect(estadoParaAlumno({ estado: 'abierta', entrega: null, fecha_limite: '2026-11-01T05:00:00' }, hoy).texto).toMatch(/Se pasó/);
    expect(estadoParaAlumno({ estado: 'abierta', entrega: { estado: 'evaluada', calificacion: 9 } }, hoy).texto).toBe('Evaluada · 9/10');
    expect(estadoParaAlumno({ estado: 'cerrada', entrega: null }, hoy).texto).toBe('Cerrada');
  });

  it('fechas y código', () => {
    expect(new Date(finDelDia('2026-11-05')).getDate()).toBe(5);
    expect(finDelDia('')).toBeNull();
    expect(fecha('2026-11-05T18:00:00')).not.toBe('');
    expect(codigoDictado('AMA-7K2P')).toBe('AMA · 7 K 2 P');
  });
});

describe('rutas del profesor', () => {
  it('cada sección del panel', () => {
    expect(analizarRuta(rutas.profesor)).toMatchObject({ pagina: 'profesor', seccion: 'grupos' });
    expect(analizarRuta(rutas.profesorGrupo('g1'))).toMatchObject({ pagina: 'profesor', seccion: 'grupo', params: { id: 'g1' } });
    expect(analizarRuta(rutas.profesorPractica('a 1'))).toMatchObject({ seccion: 'practica', params: { id: 'a 1' } });
    expect(analizarRuta(rutas.profesorEquipo)).toMatchObject({ seccion: 'equipo' });
    expect(analizarRuta('#/profesor/grupo')).toMatchObject({ seccion: 'grupos' });
  });
});
