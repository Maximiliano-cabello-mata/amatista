// Funciones puras del panel de administración (pruebas en logica.test.js).

export const ROLES = ['alumno', 'profesor', 'admin'];

export const NOMBRES_ROL = { alumno: 'Alumno', profesor: 'Profesor', admin: 'Admin' };

export const ORDENES_USUARIOS = [
  { valor: 'reciente', texto: 'Más recientes' },
  { valor: 'nombre', texto: 'Nombre (A-Z)' },
  { valor: 'actividad', texto: 'Última actividad' },
];

export const PERIODOS = [7, 14, 30];

export const PASOS_FORMULA = ['gancho', 'explora', 'practica', 'reto', 'jefe'];

export const NOMBRES_TIPO_EVENTO = {
  account_created: 'Cuenta creada',
  learning_session_started: 'Empezó a estudiar',
  lesson_completed: 'Lección completada',
  activity_submitted: 'Actividad enviada',
  sync_succeeded: 'Sincronizó',
};

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Las fechas del servidor vienen en ISO sin zona (UTC, como guarda la base) o
// con zona. Sin zona se interpretan como UTC para mostrarlas en hora local.
export function aFecha(iso) {
  if (!iso) return null;
  if (iso instanceof Date) return Number.isNaN(iso.getTime()) ? null : iso;
  const texto = String(iso);
  const conZona = /([zZ]|[+-]\d{2}:?\d{2})$/.test(texto) || !texto.includes('T') ? texto : `${texto}Z`;
  const fecha = new Date(conZona);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

const dos = (n) => String(n).padStart(2, '0');

// "2 oct 2026"
export function fechaTexto(iso) {
  const fecha = aFecha(iso);
  if (!fecha) return '—';
  return `${fecha.getDate()} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

// "2 oct 2026, 14:05"
export function fechaHoraTexto(iso) {
  const fecha = aFecha(iso);
  if (!fecha) return '—';
  return `${fechaTexto(fecha)}, ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
}

// "hace 5 min", "hace 3 h", "hace 2 días" o la fecha si pasó más de un mes.
export function haceCuanto(iso, ahora = new Date()) {
  const fecha = aFecha(iso);
  if (!fecha) return 'Nunca';
  const segundos = Math.max(0, Math.round((ahora.getTime() - fecha.getTime()) / 1000));
  if (segundos < 60) return 'Hace un momento';
  const minutos = Math.round(segundos / 60);
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.round(horas / 24);
  if (dias < 31) return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
  return fechaTexto(fecha);
}

// Porcentaje entero de parte/total; null si no hay total.
export function porcentaje(parte, total) {
  const t = Number(total) || 0;
  if (t <= 0) return null;
  return Math.round(((Number(parte) || 0) * 100) / t);
}

export const numero = (valor) => (Number(valor) || 0).toLocaleString('es-MX');

// Copia de la lista con el elemento `desde` movido a `hacia` (índices desde 0).
export function moverElemento(lista, desde, hacia) {
  if (desde === hacia || desde < 0 || hacia < 0 || desde >= lista.length || hacia >= lista.length) return [...lista];
  const copia = [...lista];
  const [elemento] = copia.splice(desde, 1);
  copia.splice(hacia, 0, elemento);
  return copia;
}

// Interpreta el texto de un bloque. Devuelve {ok, valor} o {ok:false, error}
// con un mensaje en español (y la línea, si el navegador la da).
export function leerJSON(texto) {
  if (!String(texto ?? '').trim()) return { ok: false, error: 'Está vacío: escribe un objeto JSON.' };
  try {
    return { ok: true, valor: JSON.parse(texto) };
  } catch (error) {
    const mensaje = String(error?.message ?? '');
    const posicion = /position (\d+)/i.exec(mensaje);
    const linea = /line (\d+)/i.exec(mensaje);
    let donde = '';
    if (linea) donde = ` (línea ${linea[1]})`;
    else if (posicion) donde = ` (línea ${String(texto).slice(0, Number(posicion[1])).split('\n').length})`;
    return { ok: false, error: `JSON inválido${donde}: revisa comas, comillas y llaves.` };
  }
}

// Un bloque de contenido debe ser un objeto con "type".
export function leerBloque(texto) {
  const resultado = leerJSON(texto);
  if (!resultado.ok) return resultado;
  const valor = resultado.valor;
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
    return { ok: false, error: 'Cada bloque debe ser un objeto JSON ({ … }).' };
  }
  if (typeof valor.type !== 'string' || !valor.type) return { ok: false, error: 'Falta el campo "type" del bloque.' };
  return resultado;
}

export const aTextoJSON = (valor) => JSON.stringify(valor, null, 2);

// Id que no choca con los de la lección: "quiz_inline-2", "quiz_inline-3"…
export function idBloqueUnico(base, usados) {
  const conjunto = new Set(usados);
  const limpio = String(base || 'bloque').replace(/[^\w-]+/g, '_');
  if (!conjunto.has(limpio)) return limpio;
  let n = 2;
  while (conjunto.has(`${limpio}-${n}`)) n += 1;
  return `${limpio}-${n}`;
}

// Bloque nuevo a partir del ejemplo de la paleta (copia profunda, id libre).
export function bloqueDesdeEjemplo(tipo, ejemplo, idsUsados = []) {
  const bloque = ejemplo ? JSON.parse(JSON.stringify(ejemplo)) : { type: tipo };
  bloque.type = tipo;
  if ('id' in bloque || ejemplo?.id) bloque.id = idBloqueUnico(bloque.id || tipo, idsUsados);
  return bloque;
}

// Índice del bloque que menciona un error del validador ("contentBlocks[2] (ordering): …").
export function bloqueDelError(error) {
  const coincide = /contentBlocks\[(\d+)\]/.exec(String(error));
  return coincide ? Number(coincide[1]) : null;
}

// Lección nueva desde la plantilla de un paso de la fórmula: sin el id ni el
// slug de ejemplo (el servidor da el siguiente id libre del curso).
export function leccionDesdePlantilla(plantilla, { titulo, id, paso } = {}) {
  const copia = plantilla ? JSON.parse(JSON.stringify(plantilla)) : {};
  delete copia.id;
  delete copia.slug;
  const leccion = { ...(id ? { id } : {}), ...copia };
  if (titulo) leccion.title = titulo;
  if (paso) leccion.formula = paso;
  if (!leccion.type) leccion.type = 'theory_reading';
  if (!leccion.contentBlocks && leccion.type !== 'exam') leccion.contentBlocks = [];
  return leccion;
}

// "a, b ,c" → ["a","b","c"]
export function listaDeIds(texto) {
  return String(texto ?? '')
    .split(/[,\s]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

// Nombre del archivo exportado, como los de frontend/src/data/modulos.
export function nombreArchivoModulo(modulo) {
  const curso = String(modulo?.curso_id ?? modulo?.curso ?? 'curso').replace(/[^\w-]+/g, '_');
  const numeroModulo = modulo?.numero ?? modulo?.order ?? 'x';
  return `${curso}-modulo-${numeroModulo}.json`;
}

// Progreso del alumno agrupado con el catálogo: por curso y módulo, cada
// lección con su fila (si hay); lo que no está en el catálogo va en "otras".
export function agruparProgreso(filas = [], cursos = []) {
  const porClave = new Map(filas.map((fila) => [`${fila.curso_id}:${fila.leccion_id}`, fila]));
  const usadas = new Set();
  const grupos = cursos
    .map((curso) => {
      const modulos = (curso.modulos ?? [])
        .filter((modulo) => modulo.contenido?.lessons?.length)
        .map((modulo) => {
          const lecciones = modulo.contenido.lessons.map((leccion) => {
            const claves = [leccion.id, ...(leccion.replaces ?? [])].map((id) => `${curso.id}:${id}`);
            const clave = claves.find((c) => porClave.has(c));
            if (clave) usadas.add(clave);
            return { leccion, fila: clave ? porClave.get(clave) : null };
          });
          const completadas = lecciones.filter((l) => l.fila?.completada).length;
          return { modulo, lecciones, completadas };
        });
      const total = modulos.reduce((suma, m) => suma + m.lecciones.length, 0);
      const completadas = modulos.reduce((suma, m) => suma + m.completadas, 0);
      return { curso, modulos, total, completadas };
    })
    .filter((grupo) => grupo.modulos.some((m) => m.lecciones.some((l) => l.fila)));
  const otras = filas.filter((fila) => !usadas.has(`${fila.curso_id}:${fila.leccion_id}`));
  return { grupos, otras };
}

// Serie diaria del resumen → datos de la gráfica de columnas.
export function datosSerie(serie = [], metrica = 'activos') {
  return serie.map((dia) => {
    const [anio, mes, d] = String(dia.fecha).split('-').map(Number);
    return {
      clave: dia.fecha,
      etiqueta: String(d),
      detalle: `${d} ${MESES[(mes || 1) - 1]} ${anio}`,
      valor: Number(dia[metrica]) || 0,
    };
  });
}

// Páginas totales de una lista paginada.
export const totalPaginas = (total, porPagina) => Math.max(1, Math.ceil((Number(total) || 0) / Math.max(1, porPagina)));
