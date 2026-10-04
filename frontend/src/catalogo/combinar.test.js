import { describe, expect, it } from 'vitest';
import { armarCatalogo, buscarInsignia, buscarLeccion, cursoDelModulo, cursos, leccionesDelCurso } from '../data/cursos';
import { combinarCatalogos, combinarModulos } from './combinar';

const leccion = (id) => ({ id, title: id, type: 'theory_reading', isLocked: false, contentBlocks: [] });
const contenido = (id, order, lecciones) => ({ id, title: `Módulo ${order}: ${id}`, order, lessons: lecciones.map(leccion) });

const BASE = [
  {
    id: 'blender',
    numero: '01',
    titulo: 'Blender',
    acento: 'blender',
    recurso: { texto: 'Descarga', url: 'https://blender.org' },
    modulos: [{ titulo: 'Uno', insignia: 'Explorador 3D' }, { titulo: 'Dos' }, { titulo: 'Tres' }],
  },
  { id: 'aframe', numero: '02', titulo: 'A-Frame', acento: 'neon', modulos: [{ titulo: 'Web 3D' }] },
];

describe('armarCatalogo (data/cursos.js)', () => {
  it('reemplaza el marcador por el JSON publicado con el mismo número', () => {
    const archivos = {
      './modulos/blender-modulo-1.json': { default: { module: { ...contenido('mod_teoria_001', 1, ['les_001']), curso: 'blender', estado: 'publicado' } } },
    };
    const [blender, aframe] = armarCatalogo(BASE, archivos);
    expect(blender.modulos.map((m) => m.id)).toEqual(['mod_teoria_001', 'blender-m2', 'blender-m3']);
    expect(blender.modulos[0]).toMatchObject({ numero: 1, titulo: 'Uno', insignia: 'Explorador 3D' });
    expect(blender.modulos[0].contenido.lessons).toHaveLength(1);
    expect(blender.modulos[1]).toMatchObject({ numero: 2, titulo: 'Dos', contenido: null, insignia: null });
    expect(aframe.modulos[0]).toMatchObject({ id: 'aframe-m1', contenido: null });
  });

  it('sin "curso" ni "estado": deduce el curso y lo toma como publicado', () => {
    const archivos = {
      './modulos/aframe-modulo-1.json': { module: { ...contenido('mod_aframe_001', 1, ['a']), courseId: 'crs_aframe_fundamentos' } },
      './modulos/blender-modulo-2.json': { module: contenido('mod_blender_002', 2, ['b']) },
    };
    const [blender, aframe] = armarCatalogo(BASE, archivos);
    expect(aframe.modulos[0].id).toBe('mod_aframe_001');
    expect(blender.modulos[1]).toMatchObject({ id: 'mod_blender_002', titulo: 'Dos' });
  });

  it('los borradores no reemplazan al marcador', () => {
    const archivos = {
      './modulos/blender-modulo-2.json': { module: { ...contenido('mod_blender_002', 2, ['b']), curso: 'blender', estado: 'borrador' } },
    };
    expect(armarCatalogo(BASE, archivos)[0].modulos[1]).toMatchObject({ id: 'blender-m2', contenido: null });
  });

  it('un módulo con número nuevo se agrega en orden', () => {
    const archivos = { './modulos/blender-modulo-5.json': { module: { ...contenido('mod_b5', 5, ['x']), curso: 'blender', insignia: 'Maestro' } } };
    const blender = armarCatalogo(BASE, archivos)[0];
    expect(blender.modulos.map((m) => m.numero)).toEqual([1, 2, 3, 5]);
    expect(blender.modulos[3]).toMatchObject({ id: 'mod_b5', titulo: 'mod_b5', insignia: 'Maestro' });
  });

  it('cursoDelModulo usa curso, courseId o el nombre del archivo', () => {
    expect(cursoDelModulo({ curso: 'aframe' })).toBe('aframe');
    expect(cursoDelModulo({ courseId: 'crs_blender_fundamentos' }, '', ['blender', 'aframe'])).toBe('blender');
    expect(cursoDelModulo({}, './modulos/aframe-modulo-3.json')).toBe('aframe');
    expect(cursoDelModulo({}, './modulos/blender_principiante_intermedio-modulo-2.json')).toBe(
      'blender_principiante_intermedio',
    );
  });

  it('el catálogo empaquetado tiene los cursos de Blender del motor v3 con sus insignias', () => {
    const blender = cursos.find((c) => c.id === 'blender_principiante');
    expect(blender.modulos.map((m) => m.id)).toEqual(['mod_bp_001', 'mod_bp_002', 'mod_bp_003']);
    expect(blender.modulos[0].insignia).toBe('Maquinista 3D');
    expect(leccionesDelCurso(blender).length).toBe(15); // 5 por módulo: teoría · Blender · teoría · Blender · examen
    expect(buscarInsignia(cursos, `blender_principiante:${blender.modulos[0].id}`).nombre).toBe('Maquinista 3D');
    expect(buscarInsignia(cursos, 'blender_principiante:no-existe')).toBeNull();
    expect(cursos.find((c) => c.id === 'blender_principiante_intermedio').modulos.every((m) => m.contenido)).toBe(true);
    expect(cursos.find((c) => c.id === 'blender_avanzado').estado).toBe('bloqueado');
    expect(cursos.find((c) => c.id === 'blender')).toBeUndefined(); // curso v2 archivado
  });

  it('buscarLeccion encuentra la lección que reemplaza a un id viejo', () => {
    const curso = { id: 'c', modulos: [{ id: 'm', contenido: { lessons: [{ id: 'nueva', replaces: ['vieja'] }] } }] };
    expect(buscarLeccion(curso, 'vieja').leccion.id).toBe('nueva');
    expect(buscarLeccion(curso, 'nada')).toBeUndefined();
  });
});

describe('combinarCatalogos', () => {
  const app = armarCatalogo(BASE, {
    './modulos/blender-modulo-1.json': { module: { ...contenido('mod_teoria_001', 1, ['les_001', 'les_002']), curso: 'blender' } },
  });

  it('el módulo del servidor con el mismo id reemplaza al empaquetado', () => {
    const servidor = [
      {
        id: 'blender',
        numero: '01',
        titulo: 'Blender 3D',
        modulos: [{ id: 'mod_teoria_001', titulo: 'Uno (v2)', insignia: 'Explorador 3D', contenido: contenido('mod_teoria_001', 1, ['les_001', 'les_nueva', 'les_002']) }],
      },
    ];
    const [blender] = combinarCatalogos(app, servidor);
    expect(blender.titulo).toBe('Blender 3D');
    expect(blender.recurso.url).toBe('https://blender.org'); // lo que el servidor no manda se conserva
    expect(blender.modulos[0].titulo).toBe('Uno (v2)');
    expect(blender.modulos[0].contenido.lessons.map((l) => l.id)).toEqual(['les_001', 'les_nueva', 'les_002']);
    expect(blender.modulos.map((m) => m.id)).toEqual(['mod_teoria_001', 'blender-m2', 'blender-m3']);
  });

  it('un módulo nuevo del servidor reemplaza al "Próximamente" de su número', () => {
    const servidor = { cursos: [{ id: 'blender', modulos: [{ id: 'mod_blender_002', numero: 2, titulo: 'Interfaz', insignia: 'Navegante', contenido: contenido('mod_blender_002', 2, ['les_010']) }] }] };
    const [blender] = combinarCatalogos(app, servidor);
    expect(blender.modulos.map((m) => m.id)).toEqual(['mod_teoria_001', 'mod_blender_002', 'blender-m3']);
    expect(blender.modulos[1].contenido.lessons[0].id).toBe('les_010');
  });

  it('un "Próximamente" del servidor no oculta un módulo con contenido', () => {
    const servidor = [{ id: 'blender', modulos: [{ id: 'mod_teoria_001', titulo: 'Uno', contenido: null }, { id: 'otro', titulo: 'Otro uno', contenido: null, numero: 1 }] }];
    const [blender] = combinarCatalogos(app, servidor);
    expect(blender.modulos[0].id).toBe('mod_teoria_001');
    expect(blender.modulos[0].contenido.lessons).toHaveLength(2);
  });

  it('cursos y módulos nuevos se agregan y todo queda ordenado por número', () => {
    const servidor = [
      { id: 'threejs', numero: 3, titulo: 'Three.js', modulos: [{ id: 'mod_t1', titulo: 'Intro', contenido: contenido('mod_t1', 1, ['t1']) }] },
      { id: 'aframe', modulos: [{ id: 'mod_af_4', numero: 4, titulo: 'WebXR', contenido: null }] },
    ];
    const combinado = combinarCatalogos(app, servidor);
    expect(combinado.map((c) => c.id)).toEqual(['blender', 'aframe', 'threejs']);
    expect(combinado[2]).toMatchObject({ numero: '03', estado: 'disponible' });
    expect(combinado[1].modulos.map((m) => m.numero)).toEqual([1, 4]);
  });

  it('ignora datos inválidos del servidor', () => {
    const servidor = [{ titulo: 'sin id' }, { id: 'blender', modulos: 'no-es-lista' }, { id: 'aframe', modulos: [{ id: 'mod_x', titulo: 'X', contenido: { lessons: 'mal' } }] }];
    const combinado = combinarCatalogos(app, servidor);
    expect(combinado).toHaveLength(2);
    expect(combinado[0].modulos).toHaveLength(3);
    const aframe = combinado.find((c) => c.id === 'aframe');
    expect(aframe.modulos.find((m) => m.id === 'mod_x').contenido).toBeNull();
  });

  it('combinarModulos no modifica las listas originales', () => {
    const originales = app[0].modulos;
    const copia = JSON.parse(JSON.stringify(originales));
    combinarModulos(originales, [{ id: 'mod_teoria_001', titulo: 'Cambiado', contenido: null }]);
    expect(originales).toEqual(copia);
  });
});
