import { describe, expect, it } from 'vitest';
import { consultaURL } from '../../services/admin';
import {
  agruparProgreso,
  aFecha,
  bloqueDelError,
  bloqueDesdeEjemplo,
  datosSerie,
  haceCuanto,
  idBloqueUnico,
  leccionDesdePlantilla,
  leerBloque,
  leerJSON,
  listaDeIds,
  moverElemento,
  nombreArchivoModulo,
  porcentaje,
  totalPaginas,
} from './logica';

describe('fechas', () => {
  it('interpreta las fechas sin zona del servidor como UTC', () => {
    expect(aFecha('2026-10-02T12:00:00').toISOString()).toBe('2026-10-02T12:00:00.000Z');
    expect(aFecha('2026-10-02T12:00:00+00:00').toISOString()).toBe('2026-10-02T12:00:00.000Z');
    expect(aFecha(null)).toBeNull();
    expect(aFecha('no es fecha')).toBeNull();
  });

  it('describe cuánto tiempo pasó', () => {
    const ahora = new Date('2026-10-02T12:00:00Z');
    expect(haceCuanto(null, ahora)).toBe('Nunca');
    expect(haceCuanto('2026-10-02T11:59:30', ahora)).toBe('Hace un momento');
    expect(haceCuanto('2026-10-02T11:30:00', ahora)).toBe('Hace 30 min');
    expect(haceCuanto('2026-10-02T09:00:00', ahora)).toBe('Hace 3 h');
    expect(haceCuanto('2026-10-01T12:00:00', ahora)).toBe('Hace 1 día');
  });
});

describe('utilidades', () => {
  it('calcula porcentajes sin dividir entre cero', () => {
    expect(porcentaje(1, 4)).toBe(25);
    expect(porcentaje(3, 0)).toBeNull();
  });

  it('mueve elementos sin mutar la lista', () => {
    const lista = ['a', 'b', 'c'];
    expect(moverElemento(lista, 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moverElemento(lista, 2, 1)).toEqual(['a', 'c', 'b']);
    expect(moverElemento(lista, 0, 5)).toEqual(lista);
    expect(lista).toEqual(['a', 'b', 'c']);
  });

  it('arma la consulta sin valores vacíos', () => {
    expect(consultaURL({ buscar: '', rol: 'admin', pagina: 2, x: null, y: false })).toBe('?rol=admin&pagina=2');
    expect(consultaURL({})).toBe('');
  });

  it('cuenta páginas', () => {
    expect(totalPaginas(0, 25)).toBe(1);
    expect(totalPaginas(51, 25)).toBe(3);
  });

  it('separa listas de ids', () => {
    expect(listaDeIds(' les_001, les_002  les_003 ,')).toEqual(['les_001', 'les_002', 'les_003']);
  });

  it('nombra el archivo exportado como los del repositorio', () => {
    expect(nombreArchivoModulo({ curso_id: 'blender', numero: 3 })).toBe('blender-modulo-3.json');
  });
});

describe('JSON de los bloques', () => {
  it('valida la sintaxis y el tipo', () => {
    expect(leerJSON('{"a": 1}')).toEqual({ ok: true, valor: { a: 1 } });
    expect(leerJSON('{"a": }').ok).toBe(false);
    expect(leerJSON('   ').error).toMatch(/vacío/);
    expect(leerBloque('[1]').error).toMatch(/objeto/);
    expect(leerBloque('{"body": "x"}').error).toMatch(/type/);
    expect(leerBloque('{"type": "markdown_text", "body": "x"}').ok).toBe(true);
  });

  it('da ids de bloque únicos', () => {
    expect(idBloqueUnico('quiz', [])).toBe('quiz');
    expect(idBloqueUnico('quiz', ['quiz', 'quiz-2'])).toBe('quiz-3');
  });

  it('copia el ejemplo de la paleta sin compartir referencias', () => {
    const ejemplo = { id: 'orden', type: 'ordering', items: [{ id: 'a', text: 'A' }] };
    const bloque = bloqueDesdeEjemplo('ordering', ejemplo, ['orden']);
    expect(bloque.id).toBe('orden-2');
    bloque.items[0].text = 'cambio';
    expect(ejemplo.items[0].text).toBe('A');
    expect(bloqueDesdeEjemplo('markdown_text', { type: 'markdown_text', body: 'x' }, [])).toEqual({
      type: 'markdown_text',
      body: 'x',
    });
  });

  it('ubica el bloque de un error del validador', () => {
    expect(bloqueDelError('contentBlocks[2] (ordering): necesita entre 3 y 8 items')).toBe(2);
    expect(bloqueDelError('title: escribe un título')).toBeNull();
  });
});

describe('lecciones desde plantilla', () => {
  it('quita el id y el slug de ejemplo y pone el título', () => {
    const plantilla = { id: 'les_plantilla_gancho', slug: 'plantilla-gancho', title: 'x', type: 'theory_interactive', contentBlocks: [] };
    const leccion = leccionDesdePlantilla(plantilla, { titulo: 'Mi gancho', paso: 'gancho' });
    expect(leccion).toEqual({ title: 'Mi gancho', type: 'theory_interactive', contentBlocks: [], formula: 'gancho' });
    expect(plantilla.id).toBe('les_plantilla_gancho');
    expect(leccionDesdePlantilla(plantilla, { id: 'les_009' }).id).toBe('les_009');
  });
});

describe('progreso del alumno con el catálogo', () => {
  const cursos = [
    {
      id: 'blender',
      modulos: [
        {
          id: 'm1',
          contenido: { lessons: [{ id: 'les_001' }, { id: 'les_002', replaces: ['vieja'] }, { id: 'les_003' }] },
        },
        { id: 'm2', contenido: null },
      ],
    },
    { id: 'aframe', modulos: [{ id: 'a1', contenido: { lessons: [{ id: 'les_af_001' }] } }] },
  ];

  it('agrupa por curso y módulo, reconoce ids reemplazados y separa lo que no está', () => {
    const filas = [
      { curso_id: 'blender', leccion_id: 'les_001', completada: true },
      { curso_id: 'blender', leccion_id: 'vieja', completada: true },
      { curso_id: 'blender', leccion_id: 'borrada', completada: true },
    ];
    const { grupos, otras } = agruparProgreso(filas, cursos);
    expect(grupos).toHaveLength(1);
    expect(grupos[0].total).toBe(3);
    expect(grupos[0].completadas).toBe(2);
    expect(grupos[0].modulos[0].lecciones[1].fila.leccion_id).toBe('vieja');
    expect(otras.map((f) => f.leccion_id)).toEqual(['borrada']);
  });
});

describe('serie diaria', () => {
  it('convierte la serie del resumen en columnas', () => {
    const datos = datosSerie([{ fecha: '2026-10-02', activos: 3, completadas: 5, registros: 1 }], 'completadas');
    expect(datos).toEqual([{ clave: '2026-10-02', etiqueta: '2', detalle: '2 oct 2026', valor: 5 }]);
  });
});
