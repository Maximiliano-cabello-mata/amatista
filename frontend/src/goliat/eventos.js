// Las actividades y los exámenes le avisan a Goliat con un evento del
// navegador, igual que a la mascota del módulo (temas.js › avisarMascota).
export const EVENTO_GOLIAT = 'amatista:goliat';

// detalle: {tipo: 'actividad', correcto, intentos} o {tipo: 'examen', aprobado}.
export function avisarGoliat(detalle) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENTO_GOLIAT, { detail: detalle }));
}

// Otras partes de la plataforma pueden abrirlo con una pregunta ya hecha
// (por ejemplo, el botón «Pregúntale a Goliat» de la ayuda).
export const EVENTO_ABRIR_GOLIAT = 'amatista:goliat-abrir';

export function abrirGoliat(intencion) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENTO_ABRIR_GOLIAT, { detail: { intencion } }));
}
