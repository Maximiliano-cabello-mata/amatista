// Recorrido por la plataforma: un paseo de un minuto por las páginas reales (no es un curso ni da XP).
// Cada parada abre su página, ilumina un elemento marcado con data-recorrido="…" y explica para qué
// sirve. Lo dibuja CapaRecorrido.jsx; se empieza desde la invitación de Inicio y Mi panel o desde
// Ayuda (#/guia). Funciones puras + lectura y escritura seguras: pruebas en pasos.test.js.
import { rutas } from '../rutas';

export const PASOS_RECORRIDO = [
  {
    id: 'hola',
    ruta: rutas.inicio,
    objetivo: 'hero',
    titulo: 'Bienvenido a Amatista',
    texto: 'Aprendes 3D en dos lugares que trabajan juntos: esta plataforma, donde entiendes la idea, y Blender, donde la haces. Te muestro dónde está cada cosa.',
  },
  {
    id: 'menu',
    ruta: rutas.inicio,
    objetivo: 'menu',
    titulo: 'Tres lugares, siempre arriba',
    texto: '**Cursos**: lo que aprendes. **Blender**: conectar tu Blender y conocer el add-on. **Mi panel**: tu avance. En el teléfono están en el menú ☰.',
  },
  {
    id: 'cursos',
    ruta: rutas.inicio,
    objetivo: 'cursos',
    titulo: 'Elige tu curso',
    texto: 'Blender es una sola tarjeta con todos sus niveles dentro. Empiezas por el primero y los siguientes se abren solos.',
  },
  {
    id: 'avanzas',
    ruta: rutas.curso('blender'),
    objetivo: 'como-avanzas',
    titulo: 'Así avanzas en un curso',
    texto: 'Cada módulo tiene teoría corta con actividades, estaciones que haces en Blender y un jefe final que te da la insignia.',
  },
  {
    id: 'modulos',
    ruta: rutas.curso('blender'),
    objetivo: 'modulos',
    titulo: 'Módulos y lecciones',
    texto: 'Cada lección dura menos de diez minutos. Las que tienen candado se abren al terminar la anterior, y el botón **▶ Continuar** te lleva a la que toca.',
  },
  {
    id: 'fusion',
    ruta: rutas.blender,
    objetivo: 'fusion',
    titulo: 'La plataforma y Blender, unidas',
    texto: 'Esta tarjeta explica paso a paso cómo se conectan: la lección manda órdenes a tu Blender y Blender le cuenta en vivo lo que haces.',
  },
  {
    id: 'instalar',
    ruta: rutas.blender,
    objetivo: 'instalar',
    titulo: 'Se instala una sola vez',
    texto: 'Descargas Amatista Motor, el instalador lo deja en tu Blender y vinculas tu cuenta. No tienes que programar ni copiar archivos.',
  },
  {
    id: 'conoce',
    ruta: rutas.blender,
    objetivo: 'conoce',
    titulo: 'Conoce el add-on en tres prácticas',
    texto: 'Antes de tu primer taller, haz estas tres prácticas cortas dentro de Blender: te enseñan todas sus herramientas.',
  },
  {
    id: 'panel',
    ruta: rutas.panel,
    objetivo: 'panel',
    titulo: 'Mi panel',
    texto: 'Lo que sigue, tu nivel, tu racha y tus insignias. Con tu cuenta, el avance de la plataforma y de Blender se guarda en la nube.',
  },
  {
    id: 'ayuda',
    ruta: null,
    objetivo: 'ayuda',
    titulo: '¿Dudas? Pulsa «?»',
    texto: 'Ahí está la ayuda: este recorrido, cómo se unen la plataforma y Blender y respuestas cortas. ¡A crear!',
  },
];

export const TOTAL_RECORRIDO = PASOS_RECORRIDO.length;
export const CLAVE_RECORRIDO = 'amatista:recorrido';

export const pasoValido = (indice) => Math.min(Math.max(Math.round(Number(indice) || 0), 0), TOTAL_RECORRIDO - 1);

// '#/', '#' y '' son la misma página (Inicio).
export const mismaRuta = (a, b) => (a || '#/').replace(/^#?\/?/, '#/') === (b || '#/').replace(/^#?\/?/, '#/');

// ¿Hay que cambiar de página para mostrar esta parada? (ruta null = se queda donde está).
export const necesitaNavegar = (paso, hashActual) => Boolean(paso?.ruta) && !mismaRuta(paso.ruta, hashActual);

// Dónde va la tarjeta: debajo del elemento si cabe, si no encima; sin elemento o en pantallas
// estrechas sin espacio, abajo como hoja. Devuelve estilos en px para position: fixed.
export function ubicarTarjeta(rect, ventana, alto = 230, margen = 16) {
  const ancho = Math.min(420, ventana.ancho - margen * 2);
  if (!rect) return { modo: 'centro', ancho };
  const left = Math.min(Math.max(rect.left, margen), ventana.ancho - ancho - margen);
  if (rect.bottom + margen + alto <= ventana.alto) return { modo: 'debajo', ancho, left, top: Math.max(rect.bottom + margen, margen) };
  if (rect.top - margen - alto >= 0) return { modo: 'encima', ancho, left, bottom: ventana.alto - rect.top + margen };
  return { modo: 'hoja', ancho };
}

export function leerRecorrido() {
  try {
    const valor = JSON.parse(window.localStorage.getItem(CLAVE_RECORRIDO));
    return { visto: Boolean(valor?.visto) };
  } catch {
    return { visto: false };
  }
}

export function guardarRecorrido(estado) {
  try {
    window.localStorage.setItem(CLAVE_RECORRIDO, JSON.stringify({ visto: Boolean(estado.visto) }));
  } catch {
    // Sin almacenamiento (modo privado): la invitación vuelve a aparecer en la próxima visita.
  }
}
