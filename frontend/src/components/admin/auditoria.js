// Auditoría del contenido que viaja en la app (catálogo vigente): funciones
// puras, sin React (pruebas en auditoria.test.js). La usa la página
// Admin › Auditoría junto con GET /api/admin/auditoria (lo que solo sabe el
// servidor: permisos, cuentas, borradores y lecciones donde los alumnos se atascan).
//
// También guarda la revisión a mano del equipo (lección revisada o con
// cambios pendientes, con una nota) en este navegador, y la exporta en
// Markdown para compartirla.
import { rutas } from '../../rutas';

const TIPOS_ACTIVIDAD = ['quiz_inline', 'ordering', 'matching', 'fill_blanks', 'hotspots', 'scene_explorer', 'code_challenge'];

const leccionesDe = (modulo) => modulo?.contenido?.lessons ?? [];

// Recorre los cursos publicados: [{curso, modulo, leccion, indice}].
export function recorrerCatalogo(cursos = []) {
  const lista = [];
  for (const curso of cursos) {
    if (curso.estado === 'bloqueado') continue;
    for (const modulo of curso.modulos ?? []) {
      leccionesDe(modulo).forEach((leccion, indice) => lista.push({ curso, modulo, leccion, indice }));
    }
  }
  return lista;
}

function revisarLeccion(leccion) {
  const problemas = [];
  const bloques = leccion.contentBlocks ?? [];
  if (leccion.type === 'exam') {
    const preguntas = leccion.quizData?.questions ?? [];
    if (!preguntas.length) problemas.push(['error', 'El examen no tiene preguntas.']);
    preguntas.forEach((pregunta, i) => {
      const correctas = (pregunta.options ?? []).filter((o) => o.isCorrect).length;
      if (correctas !== 1) problemas.push(['error', `La pregunta ${i + 1} del examen tiene ${correctas} respuestas correctas (debe tener 1).`]);
    });
    if (!leccion.quizData?.passingScore) problemas.push(['aviso', 'El examen no indica el puntaje para aprobar.']);
  } else if (!bloques.length) {
    problemas.push(['error', 'La lección no tiene contenido.']);
  }
  bloques.forEach((bloque, i) => {
    const donde = `Bloque ${i + 1} (${bloque.type})`;
    if (bloque.type === 'quiz_inline' && !(bloque.options ?? []).some((o) => o.isCorrect)) {
      problemas.push(['error', `${donde}: la pregunta no tiene respuesta correcta.`]);
    }
    if (TIPOS_ACTIVIDAD.includes(bloque.type) && !bloque.id) {
      problemas.push(['aviso', `${donde}: la actividad no tiene id y su resultado no se guarda.`]);
    }
    if (bloque.type === 'image' && !bloque.alt) problemas.push(['aviso', `${donde}: la imagen no tiene texto alternativo.`]);
    if (bloque.type === 'blender_taller' && !bloque.taller) problemas.push(['error', `${donde}: el taller no indica qué taller abrir.`]);
    if (bloque.type === 'blender_practice' && !bloque.practica) problemas.push(['error', `${donde}: la práctica no indica qué práctica abrir.`]);
  });
  if (leccion.cover && !leccion.cover.alt) problemas.push(['aviso', 'La portada no tiene texto alternativo.']);
  if (!leccion.durationSeconds) problemas.push(['aviso', 'La lección no indica su duración.']);
  return problemas;
}

// Hallazgos ordenados (errores primero): [{id, gravedad, texto, curso, modulo, leccion?, href}].
export function auditarCatalogo(cursos = []) {
  const hallazgos = [];
  const agregar = (gravedad, texto, curso, modulo, leccion) =>
    hallazgos.push({
      id: `${curso.id}:${modulo?.id ?? '-'}:${leccion?.id ?? '-'}:${hallazgos.length}`,
      gravedad,
      texto,
      curso: curso.id,
      cursoTitulo: curso.titulo,
      modulo: modulo?.numero ?? null,
      leccion: leccion?.id ?? null,
      leccionTitulo: leccion?.title ?? null,
      href: leccion ? rutas.leccion(curso.id, leccion.id) : rutas.curso(curso.id),
    });

  for (const curso of cursos) {
    if (curso.estado === 'bloqueado') continue;
    const vistos = new Map();
    for (const modulo of curso.modulos ?? []) {
      if (!modulo.contenido) continue;
      const lecciones = leccionesDe(modulo);
      if (!lecciones.length) {
        agregar('error', 'El módulo está publicado pero no tiene lecciones.', curso, modulo);
        continue;
      }
      if (!modulo.insignia) agregar('aviso', 'El módulo no tiene insignia.', curso, modulo);
      if (lecciones[lecciones.length - 1].type !== 'exam') agregar('aviso', 'El módulo no termina con un jefe final (examen).', curso, modulo);
      for (const leccion of lecciones) {
        if (vistos.has(leccion.id)) {
          agregar('error', `El id «${leccion.id}» se repite en el curso (también en el módulo ${vistos.get(leccion.id)}).`, curso, modulo, leccion);
        }
        vistos.set(leccion.id, modulo.numero);
        for (const [gravedad, texto] of revisarLeccion(leccion)) agregar(gravedad, texto, curso, modulo, leccion);
      }
    }
  }
  const peso = { error: 0, aviso: 1 };
  return hallazgos.sort((a, b) => peso[a.gravedad] - peso[b.gravedad]);
}

// --- Revisión a mano -----------------------------------------------------------

export const CLAVE_REVISION = 'amatista:revision-manual';
export const ESTADOS_REVISION = { ok: 'Revisada', cambios: 'Necesita cambios' };

export const claveRevision = (cursoId, leccionId) => `${cursoId}:${leccionId}`;

export function leerRevision() {
  try {
    const guardada = JSON.parse(window.localStorage.getItem(CLAVE_REVISION));
    return guardada && typeof guardada === 'object' && !Array.isArray(guardada) ? guardada : {};
  } catch {
    return {};
  }
}

export function guardarRevision(revision) {
  try {
    window.localStorage.setItem(CLAVE_REVISION, JSON.stringify(revision));
    return true;
  } catch {
    return false;
  }
}

// Marca (o desmarca con estado null) una lección.
export function marcarRevision(revision, clave, estado, nota = '', fecha = new Date().toISOString()) {
  const copia = { ...revision };
  if (!estado) delete copia[clave];
  else copia[clave] = { estado, nota: nota.trim().slice(0, 500), fecha };
  return copia;
}

// {total, revisadas, cambios, pendientes} sobre las lecciones del catálogo.
export function avanceRevision(cursos, revision) {
  const lista = recorrerCatalogo(cursos);
  let revisadas = 0;
  let cambios = 0;
  for (const { curso, leccion } of lista) {
    const marca = revision[claveRevision(curso.id, leccion.id)];
    if (marca?.estado === 'ok') revisadas += 1;
    else if (marca?.estado === 'cambios') cambios += 1;
  }
  return { total: lista.length, revisadas, cambios, pendientes: lista.length - revisadas - cambios };
}

// Informe en Markdown: hallazgos automáticos y la revisión a mano.
export function informeMarkdown({ cursos, hallazgos, revision, fecha = new Date() }) {
  const lineas = [`# Auditoría de Amatista · ${fecha.toISOString().slice(0, 10)}`, ''];
  const avance = avanceRevision(cursos, revision);
  lineas.push(
    `Revisión a mano: ${avance.revisadas} revisadas, ${avance.cambios} con cambios pendientes y ${avance.pendientes} sin revisar de ${avance.total} lecciones.`,
    '',
    '## Revisiones automáticas',
    '',
  );
  if (!hallazgos.length) lineas.push('Sin hallazgos.');
  for (const h of hallazgos) {
    const donde = [h.cursoTitulo, h.modulo ? `módulo ${h.modulo}` : null, h.leccionTitulo].filter(Boolean).join(' › ');
    lineas.push(`- **${h.gravedad === 'error' ? 'Error' : 'Aviso'}** · ${donde}: ${h.texto}`);
  }
  lineas.push('', '## Lecciones con cambios pendientes', '');
  const conCambios = recorrerCatalogo(cursos).filter(
    ({ curso, leccion }) => revision[claveRevision(curso.id, leccion.id)]?.estado === 'cambios',
  );
  if (!conCambios.length) lineas.push('Ninguna.');
  for (const { curso, modulo, leccion } of conCambios) {
    const marca = revision[claveRevision(curso.id, leccion.id)];
    lineas.push(`- ${curso.titulo} › módulo ${modulo.numero} › ${leccion.title}${marca.nota ? `: ${marca.nota}` : ''}`);
  }
  return `${lineas.join('\n')}\n`;
}
