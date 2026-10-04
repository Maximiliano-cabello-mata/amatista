// Insignias complementarias progresivas (v3.2). Son pocas y finitas: cinco
// logros con tres grados cada uno (bronce, plata y oro), 15 en total. No se
// guardan: se calculan del progreso, así que nunca se pierden ni se
// desincronizan. Se revelan poco a poco: un logro aparece cuando el alumno
// llega al punto del curso donde tiene sentido, y de cada logro solo se ve
// el grado siguiente; los demás quedan como silueta hasta acercarse.
// Funciones puras: pruebas en logros.test.js.
import { agruparPorRuta } from '../catalogo/agrupar';
import { practicasDelCatalogo } from '../modulos/practica';
import { calcularRacha, estaCompletada, resumenCurso } from './reglas';
import { leccionesDelCurso } from '../data/cursos';

export const GRADOS = [
  { id: 'bronce', nombre: 'Bronce', color: '#CD7F32', claro: '#F0B27A' },
  { id: 'plata', nombre: 'Plata', color: '#AEB6BF', claro: '#E5E8E8' },
  { id: 'oro', nombre: 'Oro', color: '#F4D03F', claro: '#FCF3CF' },
];

// metas: lo que pide cada grado. aparece: cuándo se revela el logro.
export const LOGROS = [
  {
    id: 'racha',
    nombre: 'Racha de fuego',
    descripcion: (n) => `${n} días seguidos aprendiendo`,
    unidad: 'días',
    metas: [3, 7, 14],
    aparece: () => true,
  },
  {
    id: 'blender',
    nombre: 'Manos en Blender',
    descripcion: (n) => `${n} ${n === 1 ? 'práctica completada' : 'prácticas completadas'} en Blender`,
    unidad: 'prácticas',
    metas: [1, 4, 12],
    aparece: (c) => c.lecciones >= 1,
  },
  {
    id: 'jefes',
    nombre: 'Cazajefes',
    descripcion: (n) => `${n} ${n === 1 ? 'jefe final vencido' : 'jefes finales vencidos'}`,
    unidad: 'jefes',
    metas: [1, 3, 6],
    aparece: (c) => c.lecciones >= 2,
  },
  {
    id: 'precision',
    nombre: 'Ojo de halcón',
    descripcion: (n) => `${n} actividades perfectas a la primera`,
    unidad: 'actividades',
    metas: [5, 20, 50],
    aparece: (c) => c.lecciones >= 3,
  },
  {
    id: 'niveles',
    nombre: 'Escalador de niveles',
    descripcion: (n) => `${n} ${n === 1 ? 'nivel completo' : 'niveles completos'} de un curso`,
    unidad: 'niveles',
    metas: [1, 2, 3],
    aparece: (c) => c.jefes >= 1,
  },
];

// Cifras del alumno que miden los logros.
export function cifrasLogros(progreso, cursos, hoy = new Date()) {
  const registros = Object.values(progreso?.lecciones ?? {});
  const lecciones = registros.filter((r) => r?.completada).length;
  const precision = registros.reduce((suma, r) => suma + Math.max(0, Number(r?.datos?.p) || 0), 0);
  const blender = practicasDelCatalogo(cursos).filter(({ curso, leccion }) => estaCompletada(progreso, curso.id, leccion)).length;
  let jefes = 0;
  for (const curso of cursos ?? []) {
    for (const { leccion } of leccionesDelCurso(curso)) {
      if (leccion.type === 'exam' && estaCompletada(progreso, curso.id, leccion)) jefes += 1;
    }
  }
  let niveles = 0;
  for (const ruta of agruparPorRuta(cursos)) {
    for (const curso of ruta.niveles) {
      const { total, completadas } = resumenCurso(progreso, curso);
      if (total > 0 && completadas === total) niveles += 1;
    }
  }
  const racha = calcularRacha(progreso?.actividad, hoy).mejor;
  return { lecciones, precision, blender, jefes, niveles, racha };
}

// [{id, nombre, valor, grados: [{grado, meta, ganado, visible}], siguiente, avance}]
// solo de los logros ya revelados.
export function logrosDelAlumno(progreso, cursos, hoy = new Date()) {
  const cifras = cifrasLogros(progreso, cursos, hoy);
  return LOGROS.filter((logro) => logro.aparece(cifras)).map((logro) => {
    const valor = cifras[logro.id];
    const ganados = logro.metas.filter((meta) => valor >= meta).length;
    const grados = logro.metas.map((meta, i) => ({
      ...GRADOS[i],
      meta,
      ganado: valor >= meta,
      // Se ven los ganados y el siguiente; los demás, como silueta.
      visible: i <= ganados,
      texto: logro.descripcion(meta),
    }));
    const siguiente = grados.find((g) => !g.ganado) ?? null;
    const anterior = ganados > 0 ? logro.metas[ganados - 1] : 0;
    const avance = siguiente ? Math.min(1, (valor - anterior) / (siguiente.meta - anterior)) : 1;
    return { id: logro.id, nombre: logro.nombre, unidad: logro.unidad, valor, grados, ganados, siguiente, avance };
  });
}

export const TOTAL_LOGROS = LOGROS.length * GRADOS.length;
