// «Conoce Amatista Motor» (add-on 5.2): las tres prácticas que explican todo el add-on, vistas desde la
// plataforma. No son un curso: viven en #/blender. El add-on (addon/amatista_blender/recorrido_pasos.py)
// manda en su latido detalle.recorrido = {id, nombre, hechos, activo, hecho, paso, total, titulo, texto,
// hacer, teclas, pasos}; la plataforma le pide empezar, avanzar o salir con la orden «recorrido».
// Funciones puras: pruebas en conoce.test.js.
import { vivoDelRecorrido } from '../components/leccion/recursos';

// Lo mismo que recorrido_pasos.py › RECORRIDOS (nombre y lo que enseña cada una, para la plataforma).
export const PRACTICAS_ADDON = [
  {
    id: 'pestana',
    nombre: 'Tu pestaña Amatista',
    resumen: 'Dónde está todo: tu cuenta, la plataforma, tu lección y cómo viaja tu avance.',
    temas: ['La barra N', 'Vincular tu cuenta', 'Abrir la plataforma', 'Abrir mi lección actual', 'Enfocado y acompañamiento', 'Guardar mi avance'],
  },
  {
    id: 'vista',
    nombre: 'Muévete y usa tus herramientas',
    resumen: 'La vista 3D, mover, girar y escalar, tus herramientas y el modo enfocado.',
    temas: ['Orbitar y acercar', 'Elegir', 'Mover (G), girar (R) y escalar (S)', 'Tus herramientas › Usar', '¿Cómo se usa?', 'Ver todo Blender y Enfocar'],
  },
  {
    id: 'taller',
    nombre: 'Así te enseña el taller',
    resumen: 'El ciclo de cada habilidad, la tarjeta, el molde, las pistas, Mi isla y la lección en vivo.',
    temas: ['Mira › Hazlo conmigo › Hazlo tú › Úsalo › Recuérdalo', 'La tarjeta 3D', 'El molde', 'Pistas con freno y Mírame', 'Pausa, Saltar y Demuéstralo', 'Mi isla y los repasos'],
  },
];
export const IDS_ADDON = PRACTICAS_ADDON.map((p) => p.id);

// El estado de las prácticas en el Blender del alumno:
//   sin_enlace  el servidor no tiene el enlace en vivo
//   cerrado     ningún Blender abierto
//   viejo       Blender abierto con un add-on anterior a las tres prácticas (sin id en el detalle)
//   abierto     Blender abierto, ninguna práctica en curso
//   en_curso    Blender en una práctica (vivo)
// `hechos` son las terminadas en ese Blender; `actual`, la práctica en curso (o null).
export function conoceDelEnlace(datos) {
  const vacio = { estado: 'sin_enlace', vivo: null, actual: null, hechos: [], blender: null };
  if (!datos || datos.enlace === false) return vacio;
  const abiertos = (datos.blender ?? []).filter((b) => b?.en_linea);
  if (!abiertos.length) return { ...vacio, estado: 'cerrado' };
  const con = abiertos
    .map((b) => ({ b, d: b.detalle?.recorrido, vivo: vivoDelRecorrido(b.detalle?.recorrido) }))
    .filter((x) => x.vivo && IDS_ADDON.includes(x.d?.id));
  if (!con.length) return { ...vacio, estado: 'viejo', blender: abiertos[0] };
  const hechosDe = (x) => (Array.isArray(x.d.hechos) ? x.d.hechos.filter((h) => IDS_ADDON.includes(h)) : []);
  const activo = con.find((x) => x.vivo.activo);
  const elegido = activo ?? con[0];
  return {
    estado: activo ? 'en_curso' : 'abierto',
    vivo: elegido.vivo,
    actual: activo ? activo.d.id : null,
    hechos: IDS_ADDON.filter((id) => con.some((x) => hechosDe(x).includes(id))),
    blender: elegido.b,
  };
}

// La práctica que conviene ahora: la primera sin terminar (null si ya están las tres).
export const siguientePractica = (hechos = []) => IDS_ADDON.find((id) => !hechos.includes(id)) ?? null;

// Estado de una práctica para su tarjeta: hecha · en-curso · siguiente · pendiente.
export function estadoPractica(id, conoce) {
  if (conoce?.actual === id) return 'en-curso';
  if (conoce?.hechos?.includes(id)) return 'hecha';
  return siguientePractica(conoce?.hechos) === id ? 'siguiente' : 'pendiente';
}

export const TEXTO_CONOCE = {
  sin_enlace: 'El servidor todavía no tiene el enlace en vivo: haz las prácticas desde el menú Amatista de Blender (arriba, junto a Ayuda).',
  cerrado: 'Tu Blender está cerrado. Pulsa «Empezar en Blender»: se abre solo en la práctica.',
  viejo: 'Tu Amatista Motor es anterior a estas prácticas. Descarga el nuevo aquí abajo y reinstálalo.',
  abierto: 'Tu Blender está conectado. Elige una práctica y mira tu pantalla.',
  en_curso: 'Estás en una práctica dentro de Blender. Aquí ves el mismo paso que allá.',
};
