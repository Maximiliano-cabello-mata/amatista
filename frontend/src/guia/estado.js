// Avance de la guía de primeros pasos (#/guia), guardado en este navegador.
// Es una ayuda de pantalla: no da XP ni viaja al servidor, así que nunca
// cambia el progreso del alumno. Funciones puras + lectura y escritura seguras.

export const CLAVE_GUIA = 'amatista:guia';

const VACIO = { capitulo: 0, superados: [], completada: false };

export function normalizarGuia(valor, total) {
  if (!valor || typeof valor !== 'object') return { ...VACIO };
  const superados = Array.isArray(valor.superados) ? valor.superados.filter((id) => typeof id === 'string') : [];
  const capitulo = Number.isInteger(valor.capitulo) ? Math.min(Math.max(valor.capitulo, 0), total) : 0;
  return { capitulo, superados: [...new Set(superados)], completada: Boolean(valor.completada) };
}

// Un capítulo se puede abrir si es el primero o si el anterior ya se superó.
export function capituloAbierto(estado, capitulos, indice) {
  if (indice <= 0) return true;
  if (estado.completada) return indice <= capitulos.length;
  const anterior = capitulos[indice - 1];
  return Boolean(anterior) && estado.superados.includes(anterior.id);
}

export function superarCapitulo(estado, capituloId) {
  if (estado.superados.includes(capituloId)) return estado;
  return { ...estado, superados: [...estado.superados, capituloId] };
}

export function leerGuia(total) {
  try {
    return normalizarGuia(JSON.parse(window.localStorage.getItem(CLAVE_GUIA)), total);
  } catch {
    return { ...VACIO };
  }
}

export function guardarGuia(estado) {
  try {
    window.localStorage.setItem(CLAVE_GUIA, JSON.stringify(estado));
  } catch {
    // Sin almacenamiento (modo privado): la guía dura mientras la pestaña esté abierta.
  }
}
