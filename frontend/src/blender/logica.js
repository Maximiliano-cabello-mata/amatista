// Lógica pura de la integración con Blender (pruebas en logica.test.js).

export const SISTEMAS = {
  windows: { id: 'windows', nombre: 'Windows', pista: 'Doble clic en «Instalar Amatista».' },
  macos: {
    id: 'macos',
    nombre: 'macOS',
    pista: 'Clic derecho en «Instalar Amatista» › Abrir (la primera vez macOS lo pide).',
  },
  linux: { id: 'linux', nombre: 'Linux', pista: 'En una terminal: bash instalar-amatista.sh' },
};

// Blender 4.2 es la primera versión con extensiones (blender_manifest.toml).
export const BLENDER_MINIMO = '4.2';

// El descargable: Amatista Motor (add-on + motor de prácticas). La versión
// coincide con addon/amatista_blender/blender_manifest.toml (lo revisa logica.test.js).
export const MOTOR = { nombre: 'Amatista Motor', version: '3.5.1' };
export const NOMBRE_MOTOR = `${MOTOR.nombre} ${MOTOR.version.split('.').slice(0, 2).join('.')}`;

// ¿El servidor entrega la misma versión que espera esta plataforma?
export function versionDelServidor(estado) {
  const version = estado?.version_addon;
  if (!version) return { conocida: false };
  return { conocida: true, version, alDia: compararVersiones(version, MOTOR.version) >= 0 };
}

// Sistema del visitante a partir del navegador. null en celulares y tabletas:
// Blender solo corre en computadores.
export function detectarSistema({ userAgent = '', plataforma = '' } = {}) {
  const texto = `${plataforma} ${userAgent}`.toLowerCase();
  if (/android|iphone|ipad|ipod|mobile/.test(texto)) return null;
  if (texto.includes('win')) return 'windows';
  if (texto.includes('mac')) return 'macos';
  if (texto.includes('linux') || texto.includes('x11') || texto.includes('cros')) return 'linux';
  return null;
}

// "abcd 2345" → "ABCD-2345"; null si no tiene la forma de un código.
export function normalizarCodigo(texto = '') {
  const limpio = String(texto).replace(/[\s-]/g, '').toUpperCase();
  if (!/^[A-Z0-9]{8}$/.test(limpio)) return null;
  return `${limpio.slice(0, 4)}-${limpio.slice(4)}`;
}

// "4.2.3" ≥ "4.2"; textos raros cuentan como 0.
export function compararVersiones(a = '', b = '') {
  const partes = (v) => String(v).split('.').map((n) => Number.parseInt(n, 10) || 0);
  const [x, y] = [partes(a), partes(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) {
    const diferencia = (x[i] ?? 0) - (y[i] ?? 0);
    if (diferencia) return Math.sign(diferencia);
  }
  return 0;
}

// Pasos de la práctica con su estado para dibujarlos en la lección:
//   pasos: [{id, titulo}] (del servidor) o textos (bloque.steps, sin conexión)
//   progreso: fila de /mi-progreso (objetivos cumplidos y paso actual)
export function pasosConEstado(pasos = [], progreso = null) {
  const cumplidos = new Set(progreso?.objetivos ?? []);
  const completa = Boolean(progreso?.completada);
  return pasos.map((paso, indice) => {
    const id = typeof paso === 'string' ? `paso-${indice}` : paso.id;
    const titulo = typeof paso === 'string' ? paso : paso.titulo;
    let estado = 'pendiente';
    if (completa || cumplidos.has(id)) estado = 'completado';
    else if (progreso?.paso_actual === id) estado = 'actual';
    return { id, titulo, estado };
  });
}

const TEXTOS_AUTONOMIA = {
  autonoma: 'Sin pistas: ¡autonomía!',
  con_pistas: 'Con pistas',
  con_guia: 'Con la guía paso a paso',
};

export const textoAutonomia = (autonomia) => TEXTOS_AUTONOMIA[autonomia] ?? null;

// Mensaje corto del estado de una práctica para tarjetas y listas.
export function resumenPractica(progreso) {
  if (!progreso) return 'Sin empezar';
  if (progreso.completada) return 'Completada';
  if (!progreso.intentos) return 'Abierta: continúa en Blender';
  return `${progreso.progreso} % en Blender`;
}

// --- Enlace en vivo (motor 3.4 y 3.5) -----------------------------------------------------

// Cómo se ve Blender: lo elige el alumno en «Mi Blender» y le llega al add-on en vivo.
export const OPCIONES_ENFOQUE = [
  { id: 'auto', titulo: 'Según mi nivel', texto: 'Enfocado en los niveles 1 y 2; Blender completo después.' },
  { id: 'siempre', titulo: 'Siempre enfocado', texto: 'Solo las herramientas de cada práctica, con «¿Cómo se usa?».' },
  { id: 'nunca', titulo: 'Blender completo', texto: 'Todos los menús y la barra de herramientas, como siempre.' },
];
export const OPCIONES_ACOMPANAMIENTO = [
  { id: 'acompanado', titulo: 'Acompañado', texto: 'Tarjeta guía, avisos y diálogos que explican cada paso.' },
  { id: 'tarjeta', titulo: 'Solo tarjeta', texto: 'La tarjeta guía y los avisos, sin diálogos.' },
  { id: 'silencioso', titulo: 'Silencioso', texto: 'Solo los objetivos y las pistas que pidas.' },
];
export const AJUSTES_POR_DEFECTO = { enfoque: 'auto', acompanamiento: 'acompanado', avisos_herramientas: true, tarjeta_3d: true };

// Estado del Blender del alumno para una práctica (o en general sin practicaId):
//   sin_enlace   el servidor todavía no tiene el enlace (Oracle 010 sin ejecutar)
//   cerrado      ningún Blender abierto
//   otra         Blender abierto, con otra práctica (o ninguna)
//   aqui         Blender abierto en esta práctica
export function estadoBlender(datos, practicaId = null) {
  if (!datos || datos.enlace === false) return { estado: 'sin_enlace', blender: null, texto: '' };
  const abiertos = (datos.blender ?? []).filter((b) => b.en_linea);
  if (!abiertos.length) {
    return { estado: 'cerrado', blender: null, texto: 'Tu Blender está cerrado. Ábrelo y la práctica te espera ahí.' };
  }
  const aqui = practicaId ? abiertos.find((b) => b.practica_id === practicaId) : null;
  if (aqui) {
    const enfoque = aqui.enfocado ? ' · enfocado' : '';
    return {
      estado: 'aqui',
      blender: aqui,
      texto: `Tu Blender está en esta práctica${aqui.progreso != null ? ` (${aqui.progreso} %)` : ''}${enfoque}.`,
    };
  }
  const uno = abiertos[0];
  return {
    estado: 'otra',
    blender: uno,
    texto: uno.practica ? `Tu Blender está abierto en «${uno.practica}».` : 'Tu Blender está abierto.',
  };
}

// --- El instructor en vivo (motor 3.5) ------------------------------------------------------
// El add-on manda en su latido lo que el instructor muestra en Blender (paso, mensaje y la lista
// comparada con el ejemplo resuelto) y la plataforma le puede pedir que compruebe, dé una pista, lo haga con el alumno,
// guarde o empiece de nuevo.

export const CONTROLES_BLENDER = [
  { tipo: 'comprobar', texto: 'Comprobar' },
  { tipo: 'pista', texto: 'Pista' },
  { tipo: 'hazlo_conmigo', texto: 'Hazlo conmigo' },
  { tipo: 'guardar', texto: 'Guardar' },
  {
    tipo: 'reiniciar',
    texto: 'Empezar de nuevo',
    confirmar: '¿Empezar la práctica de nuevo? Lo que hiciste no se borra: queda en una escena «(anterior)» de tu archivo.',
  },
  { tipo: 'ver_ejemplo', texto: 'Ver el ejemplo' },
];
// Mientras Blender muestra el ejemplo resuelto solo se puede volver a la práctica.
export const CONTROL_VOLVER = { tipo: 'volver_practica', texto: 'Volver a mi práctica' };

const MODOS = { OBJECT: 'Modo Objeto', EDIT_MESH: 'Modo Edición', SCULPT: 'Esculpir', POSE: 'Pose' };

export function instructorEnVivo(blender) {
  const d = blender?.detalle;
  if (!d) return null;
  const lista = Array.isArray(d.lista) ? d.lista : [];
  return {
    titulo: d.titulo || '',
    paso: d.total ? `Paso ${d.numero} de ${d.total}` : '',
    mensaje: d.mensaje || '',
    lista,
    hechas: lista.filter((i) => i.ok).length,
    modo: MODOS[d.modo] ?? '',
    viendoEjemplo: d.modo === 'EJEMPLO',
    aspectos: agruparPorAspecto(lista),
    pistas: d.pistas ?? 0,
    accion: d.accion || '',
    completada: Boolean(d.completada),
  };
}

// La lista del instructor agrupada por aspecto del ejemplo (la figura, materiales, luces…), en orden.
export function agruparPorAspecto(lista) {
  const grupos = [];
  for (const item of lista ?? []) {
    const nombre = item.aspecto || 'Tu práctica';
    let grupo = grupos.find((g) => g.nombre === nombre);
    if (!grupo) {
      grupo = { nombre, items: [], ok: true };
      grupos.push(grupo);
    }
    grupo.items.push(item);
    grupo.ok = grupo.ok && Boolean(item.ok);
  }
  return grupos;
}

// Qué controles tienen sentido ahora (sin pistas no se ofrece «Pista», sin acción no hay «Hazlo conmigo»).
export function controlesDisponibles(instructor) {
  if (!instructor) return CONTROLES_BLENDER.filter((c) => c.tipo === 'comprobar');
  if (instructor.viendoEjemplo) return [CONTROL_VOLVER];
  return CONTROLES_BLENDER.filter((c) => {
    if (c.tipo === 'pista') return instructor.pistas > 0 && !instructor.completada;
    if (c.tipo === 'hazlo_conmigo') return Boolean(instructor.accion) && !instructor.completada;
    return true;
  });
}
