// Catálogo de cursos. Viaja dentro de la app, así que está disponible sin
// conexión. El contenido de cada módulo vive en data/modulos/*.json; el
// servidor puede agregar o actualizar módulos (ver catalogo/combinar.js).
//
// Forma de un curso: {id, numero, titulo, subtitulo, descripcion, estado, nivel,
// acento, ruta, recurso, modulos: [{id, numero, titulo, insignia, disciplinas, contenido}]}.
// `disciplinas` son ids de data/software.js (DISCIPLINAS): con ellas se filtra #/explorar.
// `contenido` es el `module` del JSON (lecciones incluidas) o null si el módulo
// aún no se publica ("Próximamente").

// Datos de cada curso y títulos de sus módulos por número. Un JSON publicado
// con ese número (`order`) reemplaza al marcador "Próximamente".
const CURSOS_BASE = [
  // Ruta de Blender (motor v3.2, practices/blender/cursos.json): cuatro niveles
  // dentro de una sola tarjeta «Blender» (catalogo/agrupar.js). Se publican
  // Principiante, Principiante-Intermedio e Intermedio; Avanzado sigue
  // bloqueado. Cada módulo intercala teoría y prácticas dentro de Blender. El curso «blender»
  // de la v2 quedó archivado (data/modulos/archivo/): el progreso se conserva.
  {
    id: 'blender_principiante',
    numero: '01',
    titulo: 'Blender Principiante',
    subtitulo: 'Desde cero: tu primer contacto con el 3D',
    descripcion:
      'Para quien nunca abrió Blender: te mueves en el espacio 3D, modelas tu primera malla y usas modificadores. Practicas dentro de Blender con Amatista a tu lado.',
    estado: 'disponible',
    nivel: 'Principiante',
    para: 'Nunca abriste Blender: empiezas aquí, sin saber nada.',
    acento: 'blender',
    ruta: 'blender',
    recurso: {
      texto: 'Descarga Blender gratis',
      url: 'https://www.blender.org/download/',
    },
    modulos: [
      { titulo: 'La interfaz y navegación 3D', insignia: 'Maquinista 3D', disciplinas: ['modelado'] },
      { titulo: 'Modelado poligonal básico', insignia: 'Forjador low-poly', disciplinas: ['modelado'] },
      { titulo: 'Modificadores', insignia: 'Ingeniero de naves', disciplinas: ['modelado'] },
    ],
  },
  {
    id: 'blender_principiante_intermedio',
    numero: '02',
    titulo: 'Blender Principiante-Intermedio',
    subtitulo: 'Materiales, luz, render y animación',
    descripcion:
      'Ya sabes moverte y modelar: ahora pintas tu nave, la iluminas como un fotógrafo, sacas tu primer render y animas una pelota que rebota.',
    estado: 'disponible',
    nivel: 'Principiante-Intermedio',
    para: 'Ya te mueves en 3D y armas formas simples.',
    acento: 'blender',
    ruta: 'blender',
    recurso: {
      texto: 'Descarga Blender gratis',
      url: 'https://www.blender.org/download/',
    },
    modulos: [
      { titulo: 'Materiales y sombreado', insignia: 'Pintor de naves', disciplinas: ['diseno'] },
      { titulo: 'Iluminación y cámara', insignia: 'Director de foto', disciplinas: ['render'] },
      { titulo: 'Animación básica', insignia: 'Animador', disciplinas: ['animacion'] },
    ],
  },
  {
    id: 'blender_intermedio',
    numero: '03',
    titulo: 'Blender Intermedio',
    subtitulo: 'Trabaja como en un estudio',
    descripcion:
      'Precisión con medidas, Array y Bisel; una escena ordenada en colecciones y tu diorama iluminado y renderizado para el portafolio.',
    estado: 'disponible',
    nivel: 'Intermedio',
    para: 'Quieres trabajar con medidas y orden, como en un estudio.',
    acento: 'blender',
    ruta: 'blender',
    recurso: {
      texto: 'Descarga Blender gratis',
      url: 'https://www.blender.org/download/',
    },
    modulos: [
      { titulo: 'Modelado con precisión', insignia: 'Arquitecto de puentes', disciplinas: ['modelado'] },
      { titulo: 'Organiza tu escena', insignia: 'Cartógrafo de escenas', disciplinas: ['modelado', 'diseno'] },
      { titulo: 'Render de portafolio', insignia: 'Curador de galería', disciplinas: ['render'] },
    ],
  },
  {
    // Bloqueado a propósito: antes necesita más teoría (docs/cursos/03_ruta_de_aprendizaje_blender.md).
    id: 'blender_avanzado',
    numero: '04',
    titulo: 'Blender Avanzado',
    subtitulo: 'Próximamente',
    descripcion:
      'Topología limpia, UV y texturas, nodos de materiales y el primer rig. Se abre cuando tengamos la teoría que pide: por ahora, termina el Intermedio.',
    estado: 'bloqueado',
    nivel: 'Avanzado',
    para: 'Terminaste el Intermedio y quieres topología, UV y rigging.',
    acento: 'blender',
    ruta: 'blender',
    modulos: [
      { titulo: 'Topología y retopología', disciplinas: ['modelado'] },
      { titulo: 'UV y texturas', disciplinas: ['diseno'] },
      { titulo: 'Nodos y primer rig', disciplinas: ['diseno', 'animacion'] },
    ],
  },
  {
    // Segundo programa de la plataforma (multiplataforma, 2026-10-21): cinco
    // módulos, de la primera escena a una experiencia WebXR publicada.
    id: 'aframe',
    numero: '05',
    titulo: 'A-Frame',
    subtitulo: 'Mundos 3D y WebXR en el navegador',
    descripcion:
      'Construye escenas 3D con HTML, carga tus modelos GLB, dales movimiento e interacción y publícalas como una experiencia de realidad virtual que se abre con un enlace.',
    estado: 'disponible',
    nivel: 'Principiante',
    acento: 'neon',
    ruta: 'aframe',
    recurso: {
      texto: 'Documentación de A-Frame',
      url: 'https://aframe.io/docs/',
    },
    modulos: [
      { titulo: 'La web en 3D', insignia: 'Arquitecto WebXR', disciplinas: ['xr'] },
      { titulo: 'Construye tu escena', insignia: 'Escenógrafo web', disciplinas: ['modelado', 'diseno'] },
      { titulo: 'Modelos GLB y texturas', insignia: 'Curador de modelos', disciplinas: ['modelado', 'diseno'] },
      { titulo: 'Animación e interacción', insignia: 'Titiritero digital', disciplinas: ['animacion', 'interaccion'] },
      { titulo: 'Experiencias WebXR', insignia: 'Explorador XR', disciplinas: ['xr', 'interaccion'] },
    ],
  },
];

// Curso de un módulo: campo "curso"; si falta, se deduce de courseId
// ("crs_blender_fundamentos") o del nombre del archivo ("blender-modulo-1.json").
export function cursoDelModulo(modulo, ruta = '', idsCursos = CURSOS_BASE.map((c) => c.id)) {
  if (modulo.curso) return modulo.curso;
  const pistas = [modulo.courseId ?? '', ruta.split('/').pop() ?? ''];
  for (const pista of pistas) {
    // El id más largo primero: «blender_principiante_intermedio» antes que «blender_principiante».
    const porLargo = [...idsCursos].sort((a, b) => b.length - a.length);
    const encontrado = porLargo.find((id) => new RegExp(`(^|[_-])${id}([_-]|$)`, 'i').test(pista));
    if (encontrado) return encontrado;
  }
  const archivo = /^([a-z0-9_]+)-modulo-\d+\.json$/i.exec(ruta.split('/').pop() ?? '');
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
        disciplinas: marcador.disciplinas ?? [],
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
        disciplinas: contenido.disciplinas ?? marcador?.disciplinas ?? [],
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
