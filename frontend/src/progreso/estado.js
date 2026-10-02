// Estado local del progreso (v2) y sus transformaciones: funciones puras que
// reciben el estado y devuelven uno nuevo (pruebas en estado.test.js).
//
// {version: 2, alumnoId, cuentaId|null,
//  lecciones: {"curso:leccion": {completada, intentos, puntaje, actualizadoEn,
//              completadaEn?, datos?: {a, p}, resueltas?: {bloqueId: perfecta}}},
//  insignias: {id: iso}, actividad: {"YYYY-MM-DD": n},
//  pendientes: [claves], insigniasPendientes: [ids], eventos: [evento] (máx 500),
//  marcas: {dia, sesiones: [claves abiertas ese día], eventoSync: iso|null, sincronizado: iso|null}}
//
// `resueltas` solo vive en el dispositivo: evita contar dos veces la misma
// actividad. Al servidor viaja `datos` = {a: actividades resueltas, p: perfectas a la primera}.
import { nuevoId } from '../lib/identificador';
import { claveLeccion, fechaLocal, separarClave } from './reglas';

export const VERSION_ESTADO = 2;
export const MAX_EVENTOS = 500;
export const MAX_DIAS_ACTIVIDAD = 400;
export const LOTE_PROGRESO = 500;
export const LOTE_INSIGNIAS = 100;
export const LOTE_EVENTOS = 200;
export const VERSION_APP = '2.2.0';
export const CLAVE_ANONIMO = 'progreso';

// 'progreso' (anónimo) o 'progreso:<cuentaId>' (cuenta).
export const claveAlmacen = (cuentaId) => (cuentaId ? `${CLAVE_ANONIMO}:${cuentaId}` : CLAVE_ANONIMO);

const MARCAS_VACIAS = { dia: null, sesiones: [], eventoSync: null, sincronizado: null };

export function estadoVacio({ alumnoId, cuentaId = null } = {}) {
  return {
    version: VERSION_ESTADO,
    alumnoId: alumnoId ?? nuevoId('alumno'),
    cuentaId,
    lecciones: {},
    insignias: {},
    actividad: {},
    pendientes: [],
    insigniasPendientes: [],
    eventos: [],
    marcas: { ...MARCAS_VACIAS },
  };
}

// --- Utilidades -----------------------------------------------------------------

const esObjeto = (valor) => Boolean(valor) && typeof valor === 'object' && !Array.isArray(valor);
const unicos = (lista) => [...new Set(lista)];
const entero = (valor) => Math.max(0, Math.floor(Number(valor) || 0));

// El servidor guarda UTC sin zona ("2026-10-01T12:00:00"): sin la "Z",
// el navegador la leería como hora local.
const SIN_ZONA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

export function fechaIso(valor) {
  if (!valor) return null;
  const tiempo = Date.parse(typeof valor === 'string' && SIN_ZONA.test(valor) ? `${valor}Z` : valor);
  return Number.isNaN(tiempo) ? null : new Date(tiempo).toISOString();
}

function extremoIso(a, b, elegir) {
  const fechas = [fechaIso(a), fechaIso(b)].filter(Boolean);
  if (!fechas.length) return null;
  return fechas.reduce((x, y) => (elegir(Date.parse(y), Date.parse(x)) ? y : x));
}
const minIso = (a, b) => extremoIso(a, b, (y, x) => y < x);
const maxIso = (a, b) => extremoIso(a, b, (y, x) => y > x);

function puntajeValido(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.min(100, Math.max(0, Math.round(numero))) : null;
}

// Un evento con el formato de POST /api/eventos. El id lo genera el
// dispositivo (máx. 36 caracteres) para que el servidor descarte reenvíos.
export function idEvento() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const hex = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
}

export function crearEvento(tipo, { cursoId, leccionId, sesion, datos, momento = new Date() } = {}) {
  const evento = { id: idEvento(), tipo, ocurrido_en: new Date(momento).toISOString(), version_app: VERSION_APP };
  if (cursoId) evento.curso_id = cursoId;
  if (leccionId) evento.leccion_id = leccionId;
  if (sesion) evento.sesion_aprendizaje = sesion;
  if (datos && Object.keys(datos).length) evento.datos = datos;
  return evento;
}

// --- Normalización y migración ---------------------------------------------------------

function normalizarDatos(datos) {
  if (!esObjeto(datos)) return undefined;
  const resultado = { ...datos };
  if ('a' in datos) resultado.a = entero(datos.a);
  if ('p' in datos) resultado.p = entero(datos.p);
  return resultado;
}

export function normalizarRegistro(registro) {
  const r = esObjeto(registro) ? registro : {};
  const completada = Boolean(r.completada);
  const normal = {
    completada,
    intentos: entero(r.intentos),
    puntaje: puntajeValido(r.puntaje),
    actualizadoEn: fechaIso(r.actualizadoEn),
  };
  // v1 no guardaba cuándo se completó: la mejor fecha conocida es actualizadoEn.
  const completadaEn = fechaIso(r.completadaEn) ?? (completada ? normal.actualizadoEn : null);
  if (completada && completadaEn) normal.completadaEn = completadaEn;
  const datos = normalizarDatos(r.datos);
  if (datos) normal.datos = datos;
  if (esObjeto(r.resueltas)) normal.resueltas = { ...r.resueltas };
  return normal;
}

function recortarActividad(actividad) {
  const dias = Object.keys(actividad).sort();
  if (dias.length <= MAX_DIAS_ACTIVIDAD) return actividad;
  return Object.fromEntries(dias.slice(-MAX_DIAS_ACTIVIDAD).map((dia) => [dia, actividad[dia]]));
}

// Lee lo guardado (v1, v2 o vacío) sin perder nada: v1 = {version: 1,
// alumnoId, lecciones, pendientes}. Con `cuentaId` el estado queda ligado a esa cuenta.
export function normalizarEstado(guardado, { cuentaId } = {}) {
  const base = esObjeto(guardado) ? guardado : {};
  const estado = estadoVacio({
    alumnoId: typeof base.alumnoId === 'string' && base.alumnoId ? base.alumnoId : undefined,
    cuentaId: cuentaId === undefined ? base.cuentaId ?? null : cuentaId,
  });

  for (const [clave, registro] of Object.entries(esObjeto(base.lecciones) ? base.lecciones : {})) {
    if (clave.includes(':')) estado.lecciones[clave] = normalizarRegistro(registro);
  }
  for (const [id, fecha] of Object.entries(esObjeto(base.insignias) ? base.insignias : {})) {
    estado.insignias[id] = fechaIso(fecha) ?? new Date(0).toISOString();
  }
  for (const [dia, cantidad] of Object.entries(esObjeto(base.actividad) ? base.actividad : {})) {
    if (entero(cantidad) > 0) estado.actividad[dia] = entero(cantidad);
  }
  estado.actividad = recortarActividad(estado.actividad);
  const lista = (valor) => (Array.isArray(valor) ? valor.filter((x) => typeof x === 'string') : []);
  estado.pendientes = unicos(lista(base.pendientes)).filter((clave) => estado.lecciones[clave]);
  estado.insigniasPendientes = unicos(lista(base.insigniasPendientes));
  estado.eventos = (Array.isArray(base.eventos) ? base.eventos : [])
    .filter((evento) => esObjeto(evento) && evento.id && evento.tipo)
    .slice(-MAX_EVENTOS);
  if (esObjeto(base.marcas)) {
    estado.marcas = {
      dia: base.marcas.dia ?? null,
      sesiones: lista(base.marcas.sesiones),
      eventoSync: fechaIso(base.marcas.eventoSync),
      sincronizado: fechaIso(base.marcas.sincronizado),
    };
  }
  return estado;
}

// ¿Tiene algo que valga la pena conservar al iniciar sesión?
export function tieneContenido(estado) {
  return Boolean(
    estado &&
      (Object.keys(estado.lecciones).length ||
        Object.keys(estado.insignias).length ||
        Object.keys(estado.actividad).length ||
        estado.eventos.length),
  );
}

// --- Fusión monotónica ------------------------------------------------------------

export function combinarDatos(a, b) {
  if (!a) return b;
  if (!b) return a;
  const resultado = { ...a, ...b };
  if ('a' in a || 'a' in b) resultado.a = Math.max(entero(a.a), entero(b.a));
  if ('p' in a || 'p' in b) resultado.p = Math.max(entero(a.p), entero(b.p));
  return resultado;
}

// Une dos registros de la misma lección sin perder avance: completada OR,
// mejor puntaje, más intentos, la primera fecha de completado.
export function combinarRegistros(a, b) {
  if (!a) return b;
  if (!b) return a;
  const completada = Boolean(a.completada || b.completada);
  const puntajes = [a.puntaje, b.puntaje].filter((p) => p !== null && p !== undefined);
  const registro = {
    completada,
    intentos: Math.max(entero(a.intentos), entero(b.intentos)),
    puntaje: puntajes.length ? Math.max(...puntajes) : null,
    actualizadoEn: maxIso(a.actualizadoEn, b.actualizadoEn),
  };
  const completadaEn = minIso(a.completada ? a.completadaEn : null, b.completada ? b.completadaEn : null);
  if (completada) registro.completadaEn = completadaEn ?? registro.actualizadoEn;
  const datos = combinarDatos(a.datos, b.datos);
  if (datos) registro.datos = datos;
  if (a.resueltas || b.resueltas) {
    registro.resueltas = { ...a.resueltas };
    for (const [bloque, perfecta] of Object.entries(b.resueltas ?? {})) {
      registro.resueltas[bloque] = Boolean(registro.resueltas[bloque] || perfecta);
    }
  }
  return registro;
}

// Une el progreso anónimo del dispositivo (origen) a la cuenta (destino) al
// iniciar sesión. Todo lo del anónimo queda pendiente de enviarse a la cuenta.
// Es idempotente: repetir la fusión no duplica nada.
export function combinarEstados(destino, origen) {
  const lecciones = { ...destino.lecciones };
  for (const [clave, registro] of Object.entries(origen.lecciones)) {
    lecciones[clave] = combinarRegistros(lecciones[clave], registro);
  }
  const insignias = { ...destino.insignias };
  for (const [id, fecha] of Object.entries(origen.insignias)) {
    insignias[id] = minIso(insignias[id], fecha) ?? fecha;
  }
  const actividad = { ...destino.actividad };
  for (const [dia, cantidad] of Object.entries(origen.actividad)) {
    actividad[dia] = Math.max(actividad[dia] ?? 0, cantidad);
  }
  const ids = new Set(destino.eventos.map((evento) => evento.id));
  const eventos = [...destino.eventos, ...origen.eventos.filter((evento) => !ids.has(evento.id))]
    .sort((x, y) => Date.parse(x.ocurrido_en) - Date.parse(y.ocurrido_en))
    .slice(-MAX_EVENTOS);
  const mismoDia = destino.marcas.dia && destino.marcas.dia === origen.marcas.dia;
  return {
    ...destino,
    lecciones,
    insignias,
    actividad: recortarActividad(actividad),
    pendientes: unicos([...destino.pendientes, ...origen.pendientes, ...Object.keys(origen.lecciones)]),
    insigniasPendientes: unicos([
      ...destino.insigniasPendientes,
      ...origen.insigniasPendientes,
      ...Object.keys(origen.insignias),
    ]),
    eventos,
    marcas: mismoDia
      ? { ...destino.marcas, sesiones: unicos([...destino.marcas.sesiones, ...origen.marcas.sesiones]) }
      : destino.marcas,
  };
}

// ¿El registro local tiene algo que el del servidor no? (hay que reenviarlo)
function superaA(local, servidor) {
  if (!servidor) return Boolean(local.completada || local.puntaje !== null || local.intentos || local.datos);
  if (local.completada && !servidor.completada) return true;
  if ((local.puntaje ?? -1) > (servidor.puntaje ?? -1)) return true;
  if (local.intentos > servidor.intentos) return true;
  return entero(local.datos?.a) > entero(servidor.datos?.a) || entero(local.datos?.p) > entero(servidor.datos?.p);
}

// Combina la respuesta de GET /api/progreso con el estado local: el servidor
// aporta lo hecho en otros dispositivos; lo que solo está aquí queda pendiente.
export function combinarConServidor(estado, datos) {
  const lecciones = { ...estado.lecciones };
  const pendientes = [...estado.pendientes];
  const enServidor = new Set();
  for (const fila of Array.isArray(datos?.lecciones) ? datos.lecciones : []) {
    if (!fila?.curso_id || !fila?.leccion_id) continue;
    const clave = claveLeccion(fila.curso_id, fila.leccion_id);
    enServidor.add(clave);
    const remoto = normalizarRegistro({
      completada: fila.completada,
      intentos: fila.intentos,
      puntaje: fila.puntaje,
      actualizadoEn: fila.actualizado_en,
      completadaEn: fila.completada_en,
      datos: fila.datos_ligeros,
    });
    const local = lecciones[clave];
    lecciones[clave] = combinarRegistros(local, remoto);
    if (local && superaA(local, remoto)) pendientes.push(clave);
  }
  for (const [clave, registro] of Object.entries(estado.lecciones)) {
    if (!enServidor.has(clave) && superaA(registro, null)) pendientes.push(clave);
  }

  const insignias = { ...estado.insignias };
  const remotas = new Set();
  for (const insignia of Array.isArray(datos?.insignias) ? datos.insignias : []) {
    if (!insignia?.id) continue;
    remotas.add(insignia.id);
    insignias[insignia.id] = minIso(insignias[insignia.id], insignia.obtenido_en) ?? new Date().toISOString();
  }
  const faltantes = Object.keys(estado.insignias).filter((id) => !remotas.has(id));

  return {
    ...estado,
    lecciones,
    insignias,
    pendientes: unicos(pendientes),
    insigniasPendientes: unicos([...estado.insigniasPendientes, ...faltantes]),
  };
}

// --- Acciones del alumno ---------------------------------------------------------

function sumarActividad(actividad, momento) {
  const dia = fechaLocal(momento);
  return recortarActividad({ ...actividad, [dia]: (actividad[dia] ?? 0) + 1 });
}

function agregarEventos(eventos, ...nuevos) {
  return [...eventos, ...nuevos].slice(-MAX_EVENTOS);
}

// cambios: {completada?, intento?, puntaje?, datos?}. Devuelve el estado con
// la lección actualizada, pendiente de enviar y sumada a la actividad del día.
export function aplicarLeccion(estado, cursoId, leccionId, cambios = {}, { momento = new Date(), sesion } = {}) {
  const clave = claveLeccion(cursoId, leccionId);
  const anterior = estado.lecciones[clave] ?? normalizarRegistro({});
  const ahora = new Date(momento).toISOString();
  const completada = anterior.completada || Boolean(cambios.completada);
  const puntaje = puntajeValido(cambios.puntaje);
  const registro = {
    ...anterior,
    // Lo completado nunca se pierde y se guarda el mejor puntaje.
    completada,
    intentos: anterior.intentos + (cambios.intento ? 1 : 0),
    puntaje: puntaje === null ? anterior.puntaje : Math.max(anterior.puntaje ?? 0, puntaje),
    actualizadoEn: ahora,
  };
  if (completada) registro.completadaEn = anterior.completadaEn ?? ahora;
  const datos = combinarDatos(anterior.datos, normalizarDatos(cambios.datos));
  if (datos) registro.datos = datos;

  const eventos = [];
  if (completada && !anterior.completada) {
    const datosEvento = registro.puntaje === null ? undefined : { puntaje: registro.puntaje };
    eventos.push(crearEvento('lesson_completed', { cursoId, leccionId, sesion, datos: datosEvento, momento }));
  }
  return {
    ...estado,
    lecciones: { ...estado.lecciones, [clave]: registro },
    pendientes: estado.pendientes.includes(clave) ? estado.pendientes : [...estado.pendientes, clave],
    actividad: sumarActividad(estado.actividad, momento),
    eventos: agregarEventos(estado.eventos, ...eventos),
  };
}

// Cada intento de examen es una actividad enviada; aprobarlo completa la lección.
export function aplicarExamen(estado, cursoId, leccionId, puntaje, aprobado, contexto = {}) {
  const conEvento = {
    ...estado,
    eventos: agregarEventos(
      estado.eventos,
      crearEvento('activity_submitted', {
        cursoId,
        leccionId,
        sesion: contexto.sesion,
        datos: { tipo: 'examen', puntaje: puntajeValido(puntaje), aprobado: Boolean(aprobado) },
        momento: contexto.momento,
      }),
    ),
  };
  return aplicarLeccion(conEvento, cursoId, leccionId, { completada: aprobado, puntaje, intento: true }, contexto);
}

// Actividad interactiva resuelta (bloque de la lección). Cada bloque cuenta
// una sola vez en `datos.a`; `datos.p` cuenta las resueltas a la primera.
export function aplicarActividad(estado, cursoId, leccionId, bloqueId, resultado = {}, contexto = {}) {
  const clave = claveLeccion(cursoId, leccionId);
  const anterior = estado.lecciones[clave] ?? normalizarRegistro({});
  const correcto = Boolean(resultado.correcto);
  const intentos = entero(resultado.intentos) || 1;
  const resueltas = { ...anterior.resueltas };
  if (correcto) resueltas[bloqueId] = Boolean(resueltas[bloqueId] || intentos <= 1);
  const marcadas = Object.values(resueltas);
  const datos = {
    a: Math.max(entero(anterior.datos?.a), marcadas.length),
    p: Math.max(entero(anterior.datos?.p), marcadas.filter(Boolean).length),
  };

  const conEvento = {
    ...estado,
    lecciones: { ...estado.lecciones, [clave]: { ...anterior, resueltas } },
    eventos: agregarEventos(
      estado.eventos,
      crearEvento('activity_submitted', {
        cursoId,
        leccionId,
        sesion: contexto.sesion,
        datos: { bloque: String(bloqueId).slice(0, 60), correcto, intentos },
        momento: contexto.momento,
      }),
    ),
  };
  return aplicarLeccion(conEvento, cursoId, leccionId, { datos }, contexto);
}

export function aplicarInsignia(estado, insigniaId, momento = new Date()) {
  if (!insigniaId || estado.insignias[insigniaId]) return estado;
  return {
    ...estado,
    insignias: { ...estado.insignias, [insigniaId]: new Date(momento).toISOString() },
    insigniasPendientes: unicos([...estado.insigniasPendientes, insigniaId]),
  };
}

// learning_session_started: una vez por lección y día. Si ya se registró,
// devuelve el mismo estado (sin re-render).
export function aplicarSesion(estado, cursoId, leccionId, { momento = new Date(), sesion } = {}) {
  const clave = claveLeccion(cursoId, leccionId);
  const dia = fechaLocal(momento);
  const sesiones = estado.marcas.dia === dia ? estado.marcas.sesiones : [];
  if (sesiones.includes(clave)) return estado;
  return {
    ...estado,
    eventos: agregarEventos(
      estado.eventos,
      crearEvento('learning_session_started', { cursoId, leccionId, sesion, momento }),
    ),
    marcas: { ...estado.marcas, dia, sesiones: [...sesiones, clave] },
  };
}

// --- Sincronización -------------------------------------------------------------

const ID_VALIDO = (id) => typeof id === 'string' && id.length > 0 && id.length <= 50;

// Lote para POST /api/progreso. Las claves que el servidor rechazaría (ids
// de más de 50 caracteres) se descartan para que no atasquen la cola.
export function prepararEnvio(estado) {
  const claves = estado.pendientes.filter((clave) => estado.lecciones[clave]);
  const validas = [];
  const descartadas = [];
  for (const clave of claves) {
    const [cursoId, leccionId] = separarClave(clave);
    (ID_VALIDO(cursoId) && ID_VALIDO(leccionId) ? validas : descartadas).push(clave);
  }
  const lote = validas.slice(0, LOTE_PROGRESO);
  const enviados = {};
  const eventos = lote.map((clave) => {
    const [cursoId, leccionId] = separarClave(clave);
    const registro = estado.lecciones[clave];
    enviados[clave] = registro.actualizadoEn;
    const evento = {
      curso_id: cursoId,
      leccion_id: leccionId,
      completada: registro.completada,
      puntaje: registro.puntaje,
      intentos: Math.min(registro.intentos, 99999),
      actualizado_en: registro.actualizadoEn,
    };
    if (registro.completadaEn) evento.completada_en = registro.completadaEn;
    if (registro.datos && ('a' in registro.datos || 'p' in registro.datos)) {
      evento.datos_ligeros = { a: entero(registro.datos.a), p: entero(registro.datos.p) };
    }
    return evento;
  });
  const insignias = estado.insigniasPendientes.filter((id) => id.length <= 100).slice(0, LOTE_INSIGNIAS);
  return { eventos, insignias, enviados, descartadas };
}

// El servidor confirmó el lote: se limpia solo lo que no cambió mientras se enviaba.
export function confirmarProgreso(estado, { enviados = {}, insignias = [], descartadas = [] }) {
  const quitar = new Set(descartadas);
  return {
    ...estado,
    pendientes: estado.pendientes.filter(
      (clave) => !quitar.has(clave) && !(clave in enviados && estado.lecciones[clave]?.actualizadoEn === enviados[clave]),
    ),
    insigniasPendientes: estado.insigniasPendientes.filter(
      (id) => !insignias.includes(id) && id.length <= 100,
    ),
  };
}

export function confirmarEventos(estado, ids) {
  const enviados = new Set(ids);
  return { ...estado, eventos: estado.eventos.filter((evento) => !enviados.has(evento.id)) };
}

export function agregarEvento(estado, evento) {
  return { ...estado, eventos: agregarEventos(estado.eventos, evento) };
}

export const cantidadPendientes = (estado) => estado.pendientes.length + estado.insigniasPendientes.length;
