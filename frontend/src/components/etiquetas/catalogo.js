// Sistema de etiquetas de Amatista (v3.1). Una etiqueta = texto corto +
// ícono + tono. Las mismas etiquetas se ven en el mapa del curso, en la
// lección, en el panel del alumno y en el panel de administración, así el
// alumno y el profesor leen el mismo idioma visual.
// Catálogo completo con capturas: docs/plataforma/03_etiquetas_y_graficos.md.
import {
  IconoCodigo,
  IconoCubo,
  IconoExamen,
  IconoGuia,
  IconoInsignia,
  IconoInteractiva,
  IconoLectura,
  IconoNivel,
  IconoNuevo,
  IconoReloj,
  IconoVideo,
} from './IconosEtiqueta';

// Tonos: clases completas (Tailwind solo incluye las que ve escritas).
export const TONOS = {
  neon: 'bg-neon/12 text-neon ring-neon/35',
  amatista: 'bg-amatista/15 text-amatista-claro ring-amatista/40',
  blender: 'bg-blender/15 text-blender ring-blender/45',
  exito: 'bg-emerald-400/12 text-emerald-300 ring-emerald-400/35',
  aviso: 'bg-amber-400/12 text-amber-200 ring-amber-400/35',
  gris: 'bg-white/5 text-white/60 ring-white/15',
};

// Tipo de lección (mismos ids que TIPOS_LECCION) y la práctica en Blender.
export const ETIQUETAS_LECCION = {
  theory_reading: { texto: 'Lectura', Icono: IconoLectura, tono: 'gris' },
  theory_interactive: { texto: 'Interactiva', Icono: IconoInteractiva, tono: 'neon' },
  video_lesson: { texto: 'Video', Icono: IconoVideo, tono: 'amatista' },
  code_interactive: { texto: 'Código', Icono: IconoCodigo, tono: 'neon' },
  exam: { texto: 'Examen', Icono: IconoExamen, tono: 'aviso' },
  blender: { texto: 'Práctica en Blender', Icono: IconoCubo, tono: 'blender' },
};

// Etiquetas del módulo y de estado.
export const ETIQUETAS = {
  practica: { texto: 'Incluye práctica en Blender', Icono: IconoCubo, tono: 'blender' },
  guia: { texto: 'Con guía paso a paso', Icono: IconoGuia, tono: 'neon' },
  nuevo: { texto: 'Nuevo', Icono: IconoNuevo, tono: 'neon' },
  insignia: { texto: 'Insignia', Icono: IconoInsignia, tono: 'amatista' },
  duracion: { texto: 'min', Icono: IconoReloj, tono: 'gris' },
  nivel: { texto: 'Nivel', Icono: IconoNivel, tono: 'amatista' },
  publicado: { texto: 'Publicado', Icono: IconoNuevo, tono: 'exito' },
  revision: { texto: 'En revisión', Icono: IconoGuia, tono: 'aviso' },
  borrador: { texto: 'Borrador', Icono: IconoLectura, tono: 'gris' },
  sinPractica: { texto: 'Sin práctica en Blender', Icono: IconoCubo, tono: 'gris' },
};

// Nombre del nivel del curso v3 a partir del id («blender-n2» → «Nivel 2»).
export function textoNivel(nivelId) {
  const numero = /-n(\d+)$/.exec(nivelId ?? '')?.[1];
  return numero ? `Nivel ${numero}` : null;
}

// Etiqueta de una lección: la práctica en Blender gana sobre el tipo.
export function etiquetaLeccion(leccion, esPractica = false) {
  if (esPractica) return ETIQUETAS_LECCION.blender;
  return ETIQUETAS_LECCION[leccion?.type] ?? ETIQUETAS_LECCION.theory_reading;
}

// Etiquetas que acompañan el título de un módulo, en orden de lectura.
export function etiquetasModulo(contenido, { conPractica = false, nuevas = 0 } = {}) {
  const lista = [];
  const nivel = textoNivel(contenido?.nivel);
  if (nivel) lista.push({ ...ETIQUETAS.nivel, texto: nivel, clave: 'nivel' });
  if (contenido?.estimatedTimeMinutes) {
    lista.push({ ...ETIQUETAS.duracion, texto: `${contenido.estimatedTimeMinutes} min`, clave: 'duracion' });
  }
  if (conPractica) lista.push({ ...ETIQUETAS.practica, clave: 'practica' });
  if (nuevas > 0) lista.push({ ...ETIQUETAS.nuevo, texto: `Nuevo · ${nuevas}`, clave: 'nuevo' });
  return lista;
}
