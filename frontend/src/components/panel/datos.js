// Datos del panel derivados del progreso y del catálogo vigente (funciones
// puras, pruebas en datos.test.js). Lo ganado nunca se pierde (insignias de
// módulos que ya no están en el catálogo se siguen mostrando); el avance sí se
// mide contra el catálogo actual.
import { leccionesDelCurso } from '../../data/cursos';
import {
  estaCompletada,
  estaDesbloqueada,
  idInsignia,
  registroLeccion,
  resumenCurso,
  resumenModulo,
  separarClave,
  tieneInsignia,
} from '../../progreso/reglas';

const fechaMayor = (a, b) => (!a ? b : !b ? a : Date.parse(b) > Date.parse(a) ? b : a);

// Último momento en que el alumno avanzó en un curso (iso o null).
export function ultimaActividadCurso(progreso, cursoId) {
  let ultima = null;
  for (const [clave, registro] of Object.entries(progreso?.lecciones ?? {})) {
    if (separarClave(clave)[0] === cursoId) ultima = fechaMayor(ultima, registro?.actualizadoEn ?? null);
  }
  return ultima;
}

// "Continúa donde te quedaste": cursos con una lección pendiente, primero el
// que se trabajó más recientemente y después en el orden del catálogo.
export function cursosParaContinuar(progreso, cursos) {
  return (cursos ?? [])
    .filter((curso) => curso.estado !== 'bloqueado')
    .map((curso, orden) => ({ curso, orden, resumen: resumenCurso(progreso, curso), ultima: ultimaActividadCurso(progreso, curso.id) }))
    .filter(({ resumen }) => resumen.siguiente)
    .sort((a, b) => {
      if (a.ultima && b.ultima) return Date.parse(b.ultima) - Date.parse(a.ultima);
      if (a.ultima || b.ultima) return a.ultima ? -1 : 1;
      return a.orden - b.orden;
    })
    .map(({ curso, resumen, ultima }) => ({ curso, resumen, ultima }));
}

// Estado de un módulo para el panel:
// 'proximamente' (sin publicar) · 'completado' · 'nuevo' (hay lecciones nuevas
// tras haber avanzado) · 'en-curso' · 'por-empezar'.
export function estadoModulo(progreso, cursoId, modulo) {
  if (!modulo?.contenido) return { estado: 'proximamente', total: 0, completadas: 0, nuevas: 0, porcentaje: 0 };
  const resumen = resumenModulo(progreso, cursoId, modulo);
  let estado = 'por-empezar';
  if (resumen.total > 0 && resumen.completadas === resumen.total) estado = 'completado';
  else if (resumen.nuevas > 0) estado = 'nuevo';
  else if (resumen.completadas > 0) estado = 'en-curso';
  return { estado, ...resumen };
}

// Mejor resultado de una lección contando sus versiones anteriores (`replaces`):
// mejor puntaje e intentos sumados.
export function resultadoLeccion(progreso, cursoId, leccion) {
  const ids = [leccion.id, ...(leccion.replaces ?? [])];
  let mejor = null;
  let intentos = 0;
  for (const id of ids) {
    const registro = registroLeccion(progreso, cursoId, id);
    if (!registro) continue;
    intentos += Number(registro.intentos) || 0;
    if (registro.puntaje !== null && registro.puntaje !== undefined) mejor = Math.max(mejor ?? 0, registro.puntaje);
  }
  return { mejor, intentos, aprobado: estaCompletada(progreso, cursoId, leccion) };
}

const minimoDe = (leccion) => {
  const minimo = Number(leccion?.quizData?.passingScore);
  return Number.isFinite(minimo) ? minimo : null;
};

// Exámenes del catálogo vigente con el mejor puntaje y los intentos del alumno.
// estado: 'aprobado' | 'por-aprobar' (ya lo intentó) | 'disponible' | 'bloqueado'.
export function examenesDelCatalogo(progreso, cursos) {
  const examenes = [];
  for (const curso of cursos ?? []) {
    for (const { modulo, leccion, indice } of leccionesDelCurso(curso)) {
      if (leccion.type !== 'exam') continue;
      const resultado = resultadoLeccion(progreso, curso.id, leccion);
      const desbloqueado = curso.estado !== 'bloqueado' && estaDesbloqueada(progreso, curso.id, modulo, indice);
      let estado = 'bloqueado';
      if (resultado.aprobado) estado = 'aprobado';
      else if (resultado.intentos > 0) estado = 'por-aprobar';
      else if (desbloqueado) estado = 'disponible';
      examenes.push({ curso, modulo, leccion, minimo: minimoDe(leccion), desbloqueado, estado, ...resultado });
    }
  }
  return examenes;
}

// Qué falta para ganar la insignia de un módulo publicado: aprobar el examen
// final (si la última lección es examen) o completar las lecciones.
function requisitoInsignia(progreso, cursoId, modulo) {
  const lecciones = modulo.contenido.lessons ?? [];
  const faltan = lecciones.filter((leccion) => !estaCompletada(progreso, cursoId, leccion)).length;
  const final = lecciones[lecciones.length - 1];
  if (final?.type === 'exam') {
    return { tipo: 'examen', faltan, leccion: final, minimo: minimoDe(final), ...resultadoLeccion(progreso, cursoId, final) };
  }
  return { tipo: 'lecciones', faltan };
}

// Muro de insignias: una por módulo del catálogo (las de módulos sin publicar
// salen como "Próximamente") más las ganadas que ya no están en el catálogo.
// insignia = {id, nombre, curso|null, modulo|null, ganada: iso|null, proximamente, requisito|null}
// (las que ya no están en el catálogo traen además `cursoId`).
export function insigniasDelMuro(progreso, cursos) {
  const insignias = progreso?.insignias ?? {};
  const vistas = new Set();
  const muro = [];
  for (const curso of cursos ?? []) {
    for (const modulo of curso.modulos ?? []) {
      const id = idInsignia(curso.id, modulo);
      vistas.add(id);
      const ganada = tieneInsignia(insignias, id) ? insignias[id] : null;
      const publicado = Boolean(modulo.contenido?.lessons?.length);
      muro.push({
        id,
        nombre: modulo.insignia ?? modulo.titulo,
        curso,
        modulo,
        ganada,
        proximamente: !publicado && !ganada,
        requisito: publicado && !ganada ? requisitoInsignia(progreso, curso.id, modulo) : null,
      });
    }
  }
  // Ganadas en módulos que se retiraron o que este catálogo aún no conoce.
  for (const [id, fecha] of Object.entries(insignias)) {
    if (vistas.has(id)) continue;
    const [cursoId, moduloId] = separarClave(id);
    muro.push({ id, nombre: moduloId || id, cursoId, curso: null, modulo: null, ganada: fecha, proximamente: false, requisito: null });
  }
  return muro;
}

// Cifras del catálogo para la portada: cursos, módulos y lecciones publicadas y minutos estimados.
export function cifrasCatalogo(cursos) {
  let modulos = 0;
  let lecciones = 0;
  let minutos = 0;
  for (const curso of cursos ?? []) {
    for (const modulo of curso.modulos ?? []) {
      if (!modulo.contenido) continue;
      modulos += 1;
      lecciones += modulo.contenido.lessons?.length ?? 0;
      minutos += Number(modulo.contenido.estimatedTimeMinutes) || 0;
    }
  }
  return { cursos: (cursos ?? []).length, modulos, lecciones, minutos };
}

// ¿El alumno ya hizo algo? (para los estados vacíos).
export function tieneAvance(progreso) {
  return Object.values(progreso?.lecciones ?? {}).some(
    (registro) => registro?.completada || registro?.intentos > 0 || registro?.datos?.a > 0,
  );
}
