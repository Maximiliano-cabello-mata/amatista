// Reglas del progreso: funciones puras, sin estado ni efectos (pruebas en reglas.test.js).
//
// Principio: lo completado, el XP y las insignias nunca se pierden aunque el
// catálogo cambie; el porcentaje de avance sí se recalcula contra el catálogo
// vigente (si se agrega una lección, el % baja y la lección aparece como "Nueva").
import { leccionesDelCurso } from '../data/cursos';

export const XP_POR_LECCION = 100;
export const XP_POR_ACTIVIDAD_PERFECTA = 10;

export const claveLeccion = (cursoId, leccionId) => `${cursoId}:${leccionId}`;

// "curso:leccion" → [curso, leccion] (el id del curso no lleva ":").
export function separarClave(clave) {
  const separador = clave.indexOf(':');
  return [clave.slice(0, separador), clave.slice(separador + 1)];
}

export function registroLeccion(progreso, cursoId, leccionId) {
  return progreso?.lecciones?.[claveLeccion(cursoId, leccionId)];
}

// Ids que cuentan para una lección: el suyo y los de las lecciones que reemplaza.
const idsDe = (leccion) => (typeof leccion === 'string' ? [leccion] : [leccion.id, ...(leccion.replaces ?? [])]);

// Con el objeto lección se considera `replaces`: quien completó la versión
// vieja no tiene que repetir la nueva.
export function estaCompletada(progreso, cursoId, leccionOId) {
  if (!leccionOId) return false;
  return idsDe(leccionOId).some((id) => Boolean(registroLeccion(progreso, cursoId, id)?.completada));
}

const leccionesDe = (modulo) => modulo?.contenido?.lessons ?? [];

// Una lección bloqueada se abre al completar la anterior. ACOPLE: si se
// inserta una lección en un módulo, no bloquea a quien ya completó alguna
// lección posterior.
export function estaDesbloqueada(progreso, cursoId, modulo, indice) {
  const lecciones = leccionesDe(modulo);
  const leccion = lecciones[indice];
  if (!leccion) return false;
  if (indice === 0 || !leccion.isLocked) return true;
  if (estaCompletada(progreso, cursoId, leccion)) return true;
  if (estaCompletada(progreso, cursoId, lecciones[indice - 1])) return true;
  return lecciones.slice(indice + 1).some((posterior) => estaCompletada(progreso, cursoId, posterior));
}

export function moduloCompletado(progreso, cursoId, modulo) {
  const lecciones = leccionesDe(modulo);
  return lecciones.length > 0 && lecciones.every((leccion) => estaCompletada(progreso, cursoId, leccion));
}

// Id de la insignia de un módulo: "blender:mod_teoria_001".
export const idInsignia = (cursoId, modulo) => `${cursoId}:${typeof modulo === 'string' ? modulo : modulo.id}`;

// insignias: el mapa {id: fecha} del progreso o una lista de ids.
export function tieneInsignia(insignias, insigniaId) {
  if (Array.isArray(insignias)) return insignias.includes(insigniaId);
  return Boolean(insignias?.[insigniaId]);
}

// Lección "nueva": pendiente en un módulo en el que el alumno ya había
// avanzado más allá (ganó la insignia o completó lecciones posteriores).
export function leccionEsNueva(progreso, cursoId, modulo, indice, insignias = progreso?.insignias) {
  const lecciones = leccionesDe(modulo);
  const leccion = lecciones[indice];
  if (!leccion || estaCompletada(progreso, cursoId, leccion)) return false;
  if (tieneInsignia(insignias, idInsignia(cursoId, modulo))) return true;
  return lecciones.slice(indice + 1).some((posterior) => estaCompletada(progreso, cursoId, posterior));
}

const porcentajeDe = (completadas, total) => (total ? Math.round((completadas / total) * 100) : 0);

export function resumenModulo(progreso, cursoId, modulo, insignias = progreso?.insignias) {
  const lecciones = leccionesDe(modulo);
  let completadas = 0;
  let nuevas = 0;
  lecciones.forEach((leccion, indice) => {
    if (estaCompletada(progreso, cursoId, leccion)) completadas += 1;
    else if (leccionEsNueva(progreso, cursoId, modulo, indice, insignias)) nuevas += 1;
  });
  return { total: lecciones.length, completadas, nuevas, porcentaje: porcentajeDe(completadas, lecciones.length) };
}

// siguiente: la primera lección pendiente que ya se puede abrir, sin desviar
// al alumno hacia lecciones nuevas de módulos que ya había dejado atrás.
export function resumenCurso(progreso, curso) {
  const lecciones = leccionesDelCurso(curso);
  const pendientes = lecciones.filter(({ leccion }) => !estaCompletada(progreso, curso.id, leccion));
  const abiertas = pendientes.filter(({ modulo, indice }) => estaDesbloqueada(progreso, curso.id, modulo, indice));
  const siguiente =
    abiertas.find(({ modulo, indice }) => !leccionEsNueva(progreso, curso.id, modulo, indice)) ??
    abiertas[0] ??
    pendientes[0] ??
    null;
  const completadas = lecciones.length - pendientes.length;
  return {
    total: lecciones.length,
    completadas,
    porcentaje: porcentajeDe(completadas, lecciones.length),
    siguiente,
  };
}

// Insignias que corresponden y aún no están: el examen final del módulo
// (su última lección, si es examen) aprobado, o el módulo completo si no tiene examen.
export function insigniasPorOtorgar(progreso, cursos) {
  const faltantes = [];
  for (const curso of cursos ?? []) {
    for (const modulo of curso.modulos ?? []) {
      const lecciones = leccionesDe(modulo);
      if (!lecciones.length) continue;
      const id = idInsignia(curso.id, modulo);
      if (tieneInsignia(progreso?.insignias, id)) continue;
      const final = lecciones[lecciones.length - 1];
      const ganada =
        final.type === 'exam' ? estaCompletada(progreso, curso.id, final) : moduloCompletado(progreso, curso.id, modulo);
      if (ganada) faltantes.push(id);
    }
  }
  return faltantes;
}

// Monotónico: suma todos los registros completados aunque la lección ya no
// esté en el catálogo. 100 por lección + puntaje del examen + 10 por
// actividad perfecta a la primera (datos.p).
export function calcularXP(progreso) {
  return Object.values(progreso?.lecciones ?? {}).reduce((total, registro) => {
    let xp = total + XP_POR_ACTIVIDAD_PERFECTA * Math.max(0, Number(registro?.datos?.p) || 0);
    if (registro?.completada) xp += XP_POR_LECCION + Math.max(0, Number(registro.puntaje) || 0);
    return xp;
  }, 0);
}

export const TITULOS_NIVEL = ['Aprendiz', 'Modelador', 'Escultor', 'Arquitecto', 'Maestro del Cristal', 'Leyenda del Cristal'];

// XP total para llegar a un nivel: 0, 250, 650, 1200, 1900, 2750... (cada
// nivel pide 150 XP más que el anterior; un módulo completo da ~500 XP).
export function umbralNivel(nivel) {
  const n = Math.max(0, nivel - 1);
  return n * 250 + (150 * n * (n - 1)) / 2;
}

// {nivel, xpNivel: XP ganada dentro del nivel, xpSiguiente: XP que pide el
// nivel para subir, faltan, avance 0-1, titulo}.
export function calcularNivel(xp) {
  const total = Math.max(0, Math.floor(Number(xp) || 0));
  let nivel = 1;
  while (umbralNivel(nivel + 1) <= total) nivel += 1;
  const base = umbralNivel(nivel);
  const xpSiguiente = umbralNivel(nivel + 1) - base;
  const xpNivel = total - base;
  return {
    nivel,
    xpNivel,
    xpSiguiente,
    faltan: xpSiguiente - xpNivel,
    avance: xpNivel / xpSiguiente,
    titulo: TITULOS_NIVEL[Math.min(nivel, TITULOS_NIVEL.length) - 1],
  };
}

const FECHA_TEXTO = /^\d{4}-\d{2}-\d{2}$/;

// Fecha local "YYYY-MM-DD" (no UTC): la actividad cuenta en el día del alumno.
export function fechaLocal(fecha = new Date()) {
  if (typeof fecha === 'string' && FECHA_TEXTO.test(fecha)) return fecha;
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function sumarDias(fechaTexto, dias) {
  const [anio, mes, dia] = fechaTexto.split('-').map(Number);
  return fechaLocal(new Date(anio, mes - 1, dia + dias));
}

// Racha de días seguidos con actividad. Si hoy aún no hay actividad, la
// racha de ayer sigue viva hasta que termine el día.
export function calcularRacha(actividad = {}, hoy = new Date()) {
  const dias = new Set(
    Object.entries(actividad ?? {})
      .filter(([fecha, cantidad]) => FECHA_TEXTO.test(fecha) && cantidad > 0)
      .map(([fecha]) => fecha),
  );
  const hoyTexto = fechaLocal(hoy);
  const activoHoy = dias.has(hoyTexto);

  let actual = 0;
  let cursor = activoHoy ? hoyTexto : sumarDias(hoyTexto, -1);
  while (dias.has(cursor)) {
    actual += 1;
    cursor = sumarDias(cursor, -1);
  }

  let mejor = 0;
  let corrida = 0;
  let previo = null;
  for (const dia of [...dias].sort()) {
    corrida = previo && sumarDias(previo, 1) === dia ? corrida + 1 : 1;
    mejor = Math.max(mejor, corrida);
    previo = dia;
  }
  return { actual, mejor: Math.max(mejor, actual), hoy: activoHoy };
}
