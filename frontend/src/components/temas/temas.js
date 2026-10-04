// Una temática por módulo (v3.2): cada módulo es un mundo distinto con su
// nombre, sus colores y su jefe final. El examen del módulo es la pelea
// contra ese jefe (components/leccion/Examen.jsx). Los primeros cursos son
// los más juguetones; los siguientes toman un tono más de estudio.
// Un módulo puede traer su tema en el JSON ("tema": "taller"); si no, se
// busca por el id del módulo y, si tampoco está, usa el tema «cristal».

// Clases completas para que Tailwind las encuentre.
export const TEMAS = {
  taller: {
    nombre: 'El taller de juguetes',
    lema: 'Arma, mueve y gira piezas como en tu cuarto de juegos.',
    banda: 'from-amber-400/30 via-blender/20 to-transparent',
    texto: 'text-amber-300',
    borde: 'border-amber-300/40',
    jefe: { nombre: 'Robo-Tren Rebelde', frase: '¡Mis vagones no se dejan transformar!', piel: '#F5A524', sombra: '#B86E0B', ojos: '#00E5FF', adorno: 'chimenea' },
  },
  herreria: {
    nombre: 'La herrería',
    lema: 'Golpe a golpe, vértice a vértice: forja tu primera pieza.',
    banda: 'from-red-500/30 via-orange-500/15 to-transparent',
    texto: 'text-red-300',
    borde: 'border-red-400/40',
    jefe: { nombre: 'Gólem de Hierro', frase: 'Mi malla está llena de caras encimadas…', piel: '#8A8F98', sombra: '#4B4F57', ojos: '#FF5A36', adorno: 'cuernos' },
  },
  hangar: {
    nombre: 'El hangar espacial',
    lema: 'Modela la mitad y deja que el espejo haga el resto.',
    banda: 'from-sky-400/30 via-neon/15 to-transparent',
    texto: 'text-sky-300',
    borde: 'border-sky-300/40',
    jefe: { nombre: 'Nave Nodriza Glitch', frase: 'Sin simetría no despegarás.', piel: '#5CC8FF', sombra: '#1E6E9E', ojos: '#F5792A', adorno: 'antena' },
  },
  pintura: {
    nombre: 'El estudio de pintura',
    lema: 'Metal, cristal y óxido: dale color a tus naves.',
    banda: 'from-pink-400/30 via-amatista/20 to-transparent',
    texto: 'text-pink-300',
    borde: 'border-pink-300/40',
    jefe: { nombre: 'La Mancha Gris', frase: 'Todo será gris y sin brillo.', piel: '#9AA0A6', sombra: '#5F6368', ojos: '#FF7EDB', adorno: 'gotas' },
  },
  cine: {
    nombre: 'El set de cine',
    lema: 'Luces, cámara… ¡render!',
    banda: 'from-yellow-300/30 via-amber-600/15 to-transparent',
    texto: 'text-yellow-200',
    borde: 'border-yellow-200/40',
    jefe: { nombre: 'La Sombra del Apagón', frase: 'Sin luz, tu escena es solo negro.', piel: '#2B2B35', sombra: '#15151B', ojos: '#FFE066', adorno: 'claqueta' },
  },
  circo: {
    nombre: 'El circo animado',
    lema: 'Haz que todo rebote, se aplaste y vuelva a saltar.',
    banda: 'from-lime-300/30 via-emerald-500/15 to-transparent',
    texto: 'text-lime-300',
    borde: 'border-lime-300/40',
    jefe: { nombre: 'El Payaso Congelado', frase: 'Nada se mueve en mi carpa.', piel: '#B8F0FF', sombra: '#6FB7CC', ojos: '#C4FF4D', adorno: 'sombrero' },
  },
  aldea: {
    nombre: 'La aldea de precisión',
    lema: 'Medidas exactas, repeticiones y biseles: construye como arquitecto.',
    banda: 'from-emerald-400/25 via-teal-600/15 to-transparent',
    texto: 'text-emerald-300',
    borde: 'border-emerald-300/40',
    jefe: { nombre: 'El Arquitecto Torcido', frase: 'Ninguna de tus vigas está alineada.', piel: '#5FB89A', sombra: '#2F6F5A', ojos: '#FFD166', adorno: 'casco' },
  },
  archivo: {
    nombre: 'El archivo del cartógrafo',
    lema: 'Nombres, colecciones y orden: una escena que cualquiera entiende.',
    banda: 'from-indigo-400/25 via-amatista/15 to-transparent',
    texto: 'text-indigo-300',
    borde: 'border-indigo-300/40',
    jefe: { nombre: 'El Caos de los «Cube.047»', frase: 'Nadie encontrará nada en tu escena.', piel: '#7B7FD6', sombra: '#43468F', ojos: '#00E5FF', adorno: 'ojo' },
  },
  galeria: {
    nombre: 'La galería',
    lema: 'Tu diorama, iluminado y listo para el portafolio.',
    banda: 'from-amatista/35 via-fuchsia-500/15 to-transparent',
    texto: 'text-amatista-claro',
    borde: 'border-amatista-claro/40',
    jefe: { nombre: 'El Crítico Implacable', frase: 'Ese render no entra a mi galería.', piel: '#B57EDC', sombra: '#5B2C7A', ojos: '#FFFFFF', adorno: 'corona' },
  },
  portal: {
    nombre: 'El portal WebXR',
    lema: 'Cruza de Blender a la web y entra en realidad virtual.',
    banda: 'from-neon/30 via-sky-500/15 to-transparent',
    texto: 'text-neon',
    borde: 'border-neon/40',
    jefe: { nombre: 'Centinela del Portal', frase: 'Solo pasa quien domina las etiquetas.', piel: '#00B8CC', sombra: '#005F6B', ojos: '#F5792A', adorno: 'visor' },
  },
  cristal: {
    nombre: 'La cueva del cristal',
    lema: 'Cada módulo te acerca a dominar el cristal de Amatista.',
    banda: 'from-amatista/30 via-amatista-oscuro/30 to-transparent',
    texto: 'text-amatista-claro',
    borde: 'border-amatista/40',
    jefe: { nombre: 'Guardián del Cristal', frase: 'Demuestra lo que aprendiste.', piel: '#9B59B6', sombra: '#3D1F52', ojos: '#00E5FF', adorno: 'corona' },
  },
};

const POR_MODULO = {
  mod_bp_001: 'taller',
  mod_bp_002: 'herreria',
  mod_bp_003: 'hangar',
  mod_bpi_001: 'pintura',
  mod_bpi_002: 'cine',
  mod_bpi_003: 'circo',
  mod_bi_001: 'aldea',
  mod_bi_002: 'archivo',
  mod_bi_003: 'galeria',
  mod_aframe_001: 'portal',
};

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
