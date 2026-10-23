// El camino guiado (portada «Cursos», 2026-10-23): todo el catálogo compactado en una lista
// numerada por programa, en el orden en que conviene tomarlo. Reemplaza a Explorar (buscador y
// filtros): quien llega no sabe qué cursos hay ni cómo se llaman, así que no se le pide buscar;
// se le dice «este es el paso 1» y cada paso explica en una línea qué vas a lograr.
//
// Un paso es un módulo. Los pasos se agrupan por nivel (cada nivel es un curso del programa).
// Funciones puras: pruebas en camino.test.js.
import { agruparPorRuta } from './agrupar';
import { SOFTWARE } from '../data/software';
import { estaCompletada, resumenModulo } from '../progreso/reglas';
import { rutas } from '../rutas';

// Primera oración de la descripción de un módulo: lo que vas a lograr, en una línea.
export function resumenCorto(texto = '', maximo = 140) {
  const limpio = String(texto).replace(/\s+/g, ' ').trim();
  if (!limpio) return '';
  // Primera oración; si es muy corta («Entra a la pieza.»), también la segunda.
  const cortes = [...limpio.matchAll(/[.:!?](\s|$)/g)].map((m) => m.index + 1);
  const fin = cortes.find((i) => i >= 35) ?? cortes.at(-1) ?? limpio.length;
  const oracion = limpio.slice(0, fin);
  if (oracion.length <= maximo) return oracion.replace(/:$/, '.');
  const corte = oracion.slice(0, maximo - 1);
  return `${corte.slice(0, corte.lastIndexOf(' ') > 40 ? corte.lastIndexOf(' ') : corte.length)}…`;
}

const minutosDe = (modulo) => {
  const declarados = Number(modulo.contenido?.estimatedTimeMinutes);
  if (Number.isFinite(declarados) && declarados > 0) return declarados;
  const segundos = (modulo.contenido?.lessons ?? []).reduce((suma, l) => suma + (Number(l.durationSeconds) || 0), 0);
  return segundos ? Math.max(1, Math.round(segundos / 60)) : null;
};

// Estado de un paso: hecho · en-curso · siguiente · disponible · bloqueado · proximamente.
// «siguiente» lo pone caminoDePrograma (uno solo por programa).
function estadoBase(progreso, curso, modulo) {
  if (curso.estado === 'bloqueado') return 'bloqueado';
  if (!modulo.contenido) return 'proximamente';
  const { total, completadas } = resumenModulo(progreso, curso.id, modulo);
  if (total > 0 && completadas === total) return 'hecho';
  return completadas > 0 ? 'en-curso' : 'disponible';
}

function pasoDe(progreso, curso, modulo) {
  const lecciones = (modulo.contenido?.lessons ?? []).map((leccion) => ({
    id: leccion.id,
    titulo: leccion.title,
    tipo: leccion.type,
    formula: leccion.formula ?? (leccion.type === 'exam' ? 'jefe' : null),
    minutos: leccion.durationSeconds ? Math.max(1, Math.round(leccion.durationSeconds / 60)) : null,
    hecha: estaCompletada(progreso, curso.id, leccion),
    href: rutas.leccion(curso.id, leccion.id),
  }));
  const hechas = lecciones.filter((l) => l.hecha).length;
  const pendiente = lecciones.find((l) => !l.hecha) ?? lecciones[0] ?? null;
  return {
    id: `${curso.id}:${modulo.id}`,
    curso,
    modulo,
    titulo: modulo.titulo,
    resumen: resumenCorto(modulo.contenido?.description),
    insignia: modulo.insignia ?? null,
    lecciones,
    hechas,
    minutos: minutosDe(modulo),
    estado: estadoBase(progreso, curso, modulo),
    // El botón del paso abre la lección que toca; si aún no hay lecciones, la página del módulo.
    href: pendiente ? pendiente.href : rutas.modulo(curso.id, modulo.numero),
  };
}

// {software, disponible, niveles: [{curso, pasos}], pasos (todos, numerados), total, hechos, siguiente}.
export function caminoDePrograma(software, cursos = [], progreso = null) {
  const ruta = software?.ruta ? agruparPorRuta(cursos).find((grupo) => grupo.id === software.ruta) : null;
  if (!ruta || software.estado !== 'disponible') {
    return { software, disponible: false, niveles: [], pasos: [], total: 0, hechos: 0, siguiente: null, ruta: null };
  }
  let numero = 0;
  const niveles = ruta.niveles.map((curso) => ({
    curso,
    pasos: curso.modulos.map((modulo) => ({ ...pasoDe(progreso, curso, modulo), numero: ++numero })),
  }));
  const pasos = niveles.flatMap((nivel) => nivel.pasos);
  // El siguiente: el primero empezado y sin terminar; si no hay, el primero disponible.
  const siguiente = pasos.find((p) => p.estado === 'en-curso') ?? pasos.find((p) => p.estado === 'disponible') ?? null;
  if (siguiente) siguiente.estado = 'siguiente';
  for (const nivel of niveles) {
    const conContenido = nivel.pasos.filter((p) => p.estado !== 'proximamente' && p.estado !== 'bloqueado');
    nivel.hechos = conContenido.filter((p) => p.estado === 'hecho').length;
    nivel.total = conContenido.length;
    nivel.minutos = conContenido.reduce((suma, p) => suma + (p.minutos ?? 0), 0);
    nivel.abierto = nivel.pasos.some((p) => p === siguiente);
  }
  return {
    software,
    disponible: true,
    ruta,
    niveles,
    pasos,
    total: pasos.filter((p) => p.estado !== 'proximamente' && p.estado !== 'bloqueado').length,
    hechos: pasos.filter((p) => p.estado === 'hecho').length,
    siguiente,
  };
}

// Todos los programas, en el orden de data/software.js.
export function caminos(cursos = [], progreso = null, programas = SOFTWARE) {
  return programas.map((software) => caminoDePrograma(software, cursos, progreso));
}

// Programa que se muestra primero: el elegido antes (si existe y está disponible), el del
// curso en el que el alumno avanzó por última vez o, para quien llega por primera vez, el primero.
export function programaInicial(lista, { elegido, ultimoCurso } = {}) {
  const disponibles = lista.filter((c) => c.disponible);
  if (elegido && lista.some((c) => c.software.id === elegido)) return elegido;
  const porCurso = ultimoCurso && disponibles.find((c) => c.ruta.niveles.some((curso) => curso.id === ultimoCurso));
  return (porCurso ?? disponibles[0] ?? lista[0])?.software.id ?? null;
}
