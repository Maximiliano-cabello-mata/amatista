// Catálogo de cursos. Viaja dentro de la app, así que está disponible sin
// conexión. El contenido de cada módulo vive en data/modulos/*.json; el
// servidor puede agregar o actualizar módulos (ver catalogo/combinar.js).
//
// Forma de un curso: {id, numero, titulo, subtitulo, descripcion, estado, nivel,
// acento, recurso, modulos: [{id, numero, titulo, insignia, contenido}]}.
// `contenido` es el `module` del JSON (lecciones incluidas) o null si el módulo
// aún no se publica ("Próximamente").

// Datos de cada curso y títulos de sus módulos por número. Un JSON publicado
// con ese número (`order`) reemplaza al marcador "Próximamente".
const CURSOS_BASE = [
  {
    id: 'blender',
    numero: '01',
    titulo: 'Blender',
    subtitulo: 'Modelado 3D low poly',
    descripcion:
      'Descubre el mundo 3D, modela objetos low poly, dales color y expórtalos en formato GLB listos para la web.',
    estado: 'disponible',
    nivel: 'Principiante',
    acento: 'blender',
    recurso: {
      texto: 'Descarga Blender gratis',
      url: 'https://www.blender.org/download/',
    },
    modulos: [
      { titulo: 'El mundo 3D y Blender', insignia: 'Explorador 3D' },
      { titulo: 'Interfaz y navegación' },
      { titulo: 'Modelado low poly' },
      { titulo: 'Materiales y exportación GLB' },
    ],
  },
  {
    id: 'aframe',
    numero: '02',
    titulo: 'A-Frame',
    subtitulo: 'Mundos WebXR en el navegador',
    descripcion:
      'Lleva tus modelos a la web: crea escenas 3D con HTML, agrega interacción y visítalas en realidad virtual o aumentada.',
    estado: 'disponible',
    nivel: 'Intermedio',
    acento: 'neon',
    recurso: {
      texto: 'Documentación de A-Frame',
      url: 'https://aframe.io/docs/',
    },
    modulos: [
      { titulo: 'La web en 3D', insignia: 'Arquitecto WebXR' },
      { titulo: 'Cargar modelos GLB' },
      { titulo: 'Interactividad' },
      { titulo: 'Experiencias WebXR' },
    ],
  },
];

// Curso de un módulo: campo "curso"; si falta, se deduce de courseId
// ("crs_blender_fundamentos") o del nombre del archivo ("blender-modulo-1.json").
export function cursoDelModulo(modulo, ruta = '', idsCursos = CURSOS_BASE.map((c) => c.id)) {
  if (modulo.curso) return modulo.curso;
  const pistas = [modulo.courseId ?? '', ruta.split('/').pop() ?? ''];
  for (const pista of pistas) {
    const encontrado = idsCursos.find((id) => new RegExp(`(^|[_-])${id}([_-]|$)`, 'i').test(pista));
    if (encontrado) return encontrado;
  }
  const archivo = /^([a-z0-9]+)-modulo-\d+\.json$/i.exec(ruta.split('/').pop() ?? '');
  return archivo ? archivo[1].toLowerCase() : null;
}

// "Módulo 1: El mundo 3D..." → "El mundo 3D...".
export function tituloCorto(titulo = '') {
  return titulo.replace(/^Módulo\s+\d+\s*[:.-]\s*/i, '');
}

// Arma el catálogo a partir de los cursos base y los JSON de módulos
// ({ruta: contenidoDelArchivo}). Función pura: se prueba sin Vite.
export function armarCatalogo(base, archivos) {
  const publicados = {};
  for (const [ruta, archivo] of Object.entries(archivos)) {
    const modulo = (archivo?.default ?? archivo)?.module;
    if (!modulo?.id) continue;
    if ((modulo.estado ?? 'publicado') !== 'publicado') continue;
    const cursoId = cursoDelModulo(modulo, ruta, base.map((c) => c.id));
    if (!cursoId) continue;
    (publicados[cursoId] ??= []).push(modulo);
  }

  return base.map((curso) => {
    const porNumero = new Map();
    curso.modulos.forEach((marcador, i) => {
      const numero = marcador.numero ?? i + 1;
      porNumero.set(numero, {
        id: marcador.id ?? `${curso.id}-m${numero}`,
        numero,
        titulo: marcador.titulo,
        insignia: marcador.insignia ?? null,
        contenido: null,
      });
    });
    for (const contenido of publicados[curso.id] ?? []) {
      const numero = Number(contenido.order) || porNumero.size + 1;
      const marcador = porNumero.get(numero);
      porNumero.set(numero, {
        id: contenido.id,
        numero,
        titulo: marcador?.titulo ?? tituloCorto(contenido.title),
        insignia: contenido.insignia ?? marcador?.insignia ?? null,
        contenido,
      });
    }
    const modulos = [...porNumero.values()].sort((a, b) => a.numero - b.numero);
    return { ...curso, modulos };
  });
}

const archivos = import.meta.glob('./modulos/*.json', { eager: true });

export const cursos = armarCatalogo(CURSOS_BASE, archivos);

// Busca en el catálogo empaquetado o en la lista que se pase (useCatalogo
// ofrece buscarCurso(id) sobre el catálogo combinado con el servidor).
export function buscarCurso(id, lista = cursos) {
  return lista.find((curso) => curso.id === id);
}

export function modulosPublicados(curso) {
  return curso.modulos.filter((modulo) => modulo.contenido);
}

// Todas las lecciones publicadas del curso, en orden, con su módulo.
export function leccionesDelCurso(curso) {
  return modulosPublicados(curso).flatMap((modulo) =>
    modulo.contenido.lessons.map((leccion, indice) => ({ modulo, leccion, indice })),
  );
}

// Encuentra la lección por id o, si el id es viejo, la que la reemplaza (replaces).
export function buscarLeccion(curso, leccionId) {
  const lecciones = leccionesDelCurso(curso);
  return (
    lecciones.find(({ leccion }) => leccion.id === leccionId) ??
    lecciones.find(({ leccion }) => leccion.replaces?.includes(leccionId))
  );
}

export function buscarModulo(curso, moduloId) {
  return curso.modulos.find((modulo) => modulo.id === moduloId);
}

// Insignia por id ("blender:mod_teoria_001") → {curso, modulo, nombre}.
export function buscarInsignia(lista, insigniaId) {
  const separador = insigniaId.indexOf(':');
  const curso = buscarCurso(insigniaId.slice(0, separador), lista);
  const modulo = curso && buscarModulo(curso, insigniaId.slice(separador + 1));
  return modulo ? { curso, modulo, nombre: modulo.insignia ?? modulo.titulo } : null;
}

export const TIPOS_LECCION = {
  theory_reading: 'Lectura',
  theory_interactive: 'Interactiva',
  video_lesson: 'Video',
  code_interactive: 'Código',
  exam: 'Examen',
};

export function duracionTexto(segundos) {
  if (!segundos) return null;
  return `${Math.max(1, Math.round(segundos / 60))} min`;
}
