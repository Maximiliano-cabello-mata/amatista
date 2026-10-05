// Una temática por módulo (v3.3): cada módulo es un mundo distinto con su
// nombre, sus colores y su jefe final. El examen del módulo es la pelea
// contra ese jefe (components/leccion/Examen.jsx). Los primeros cursos son
// los más juguetones; los siguientes toman un tono más de estudio.
// Un módulo puede traer su tema en el JSON ("tema": "taller"); si no, se
// busca por el id del módulo y, si tampoco está, usa el tema «cristal».
import datosTemas from '../../../../practices/blender/temas.json';

// Clases completas para que Tailwind las encuentre (no se pueden armar con el color del JSON).
const CLASES = {
  taller: { banda: 'from-amber-400/30 via-blender/20 to-transparent', texto: 'text-amber-300', borde: 'border-amber-300/40' },
  herreria: { banda: 'from-red-500/30 via-orange-500/15 to-transparent', texto: 'text-red-300', borde: 'border-red-400/40' },
  hangar: { banda: 'from-sky-400/30 via-neon/15 to-transparent', texto: 'text-sky-300', borde: 'border-sky-300/40' },
  pintura: { banda: 'from-pink-400/30 via-amatista/20 to-transparent', texto: 'text-pink-300', borde: 'border-pink-300/40' },
  cine: { banda: 'from-yellow-300/30 via-amber-600/15 to-transparent', texto: 'text-yellow-200', borde: 'border-yellow-200/40' },
  circo: { banda: 'from-lime-300/30 via-emerald-500/15 to-transparent', texto: 'text-lime-300', borde: 'border-lime-300/40' },
  aldea: { banda: 'from-emerald-400/25 via-teal-600/15 to-transparent', texto: 'text-emerald-300', borde: 'border-emerald-300/40' },
  archivo: { banda: 'from-indigo-400/25 via-amatista/15 to-transparent', texto: 'text-indigo-300', borde: 'border-indigo-300/40' },
  galeria: { banda: 'from-amatista/35 via-fuchsia-500/15 to-transparent', texto: 'text-amatista-claro', borde: 'border-amatista-claro/40' },
  portal: { banda: 'from-neon/30 via-sky-500/15 to-transparent', texto: 'text-neon', borde: 'border-neon/40' },
  cristal: { banda: 'from-amatista/30 via-amatista-oscuro/30 to-transparent', texto: 'text-amatista-claro', borde: 'border-amatista/40' },
};

// Nombre, lema, colores, escenario, mascota y jefe vienen de
// practices/blender/temas.json, el mismo archivo que usa el add-on: el mundo
// del módulo en la plataforma y en Blender es el mismo.
export const TEMAS = Object.fromEntries(
  Object.entries(datosTemas.temas).map(([id, tema]) => [id, { ...tema, ...(CLASES[id] ?? CLASES.cristal) }]),
);

const POR_MODULO = datosTemas.modulos;

// {id, ...tema} del módulo (por su campo "tema", su id o el de respaldo).
export function temaDelModulo(modulo) {
  const id = modulo?.contenido?.tema ?? modulo?.tema ?? POR_MODULO[modulo?.id] ?? POR_MODULO[modulo?.contenido?.id];
  const clave = TEMAS[id] ? id : 'cristal';
  return { id: clave, ...TEMAS[clave] };
}

// Vida del jefe: tiene tantos puntos como respuestas correctas pide aprobar
// (passingScore). Cada acierto le quita uno; en cero queda derrotado, que es
// lo mismo que aprobar. Los aciertos de más son golpes críticos.
export function vidaDelJefe(total, aciertos, minimo = 70) {
  const vida = Math.max(1, Math.ceil((total * minimo) / 100));
  const restante = Math.max(0, vida - aciertos);
  return {
    vida,
    restante,
    porcentaje: Math.round((restante / vida) * 100),
    derrotado: restante === 0,
    criticos: Math.max(0, aciertos - vida),
  };
}

// Mensaje de la mascota: primero saluda y luego alterna consejos y datos curiosos.
export function mensajesDeMascota(mascota) {
  if (!mascota) return [];
  const consejos = (mascota.consejos ?? []).map((texto) => ({ tipo: 'consejo', texto }));
  const datos = (mascota.datos ?? []).map((texto) => ({ tipo: 'dato', texto }));
  const mezcla = [];
  for (let i = 0; i < Math.max(consejos.length, datos.length); i += 1) {
    if (consejos[i]) mezcla.push(consejos[i]);
    if (datos[i]) mezcla.push(datos[i]);
  }
  return [{ tipo: 'hola', texto: mascota.hola }, ...mezcla];
}

// Los módulos publicados con su temática (portada: «un mundo por módulo»).
export function mundosDelCatalogo(cursos) {
  return cursos
    .filter((curso) => curso.estado !== 'bloqueado')
    .flatMap((curso) =>
      curso.modulos.filter((m) => m.contenido).map((modulo) => ({ curso, modulo, tema: temaDelModulo(modulo) })),
    );
}
