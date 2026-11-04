// El buzón del creador: los alumnos le escriben a Maximiliano sobre algo
// concreto de la plataforma. Las categorías y estados son los mismos que
// acepta el servidor (backend/database/modelos.py › CATEGORIAS_SUGERENCIA).

export const NOMBRE_CREADOR = 'Maximiliano';

export const CATEGORIAS = [
  { id: 'error', texto: 'Un error', ayuda: 'Algo no funciona, se rompe o se ve mal.', icono: '⚠' },
  { id: 'idea', texto: 'Una idea', ayuda: 'Algo que te gustaría que tuviera Amatista.', icono: '✦' },
  { id: 'contenido', texto: 'El contenido', ayuda: 'Una lección, una práctica o un examen.', icono: '▤' },
  { id: 'otra', texto: 'Otra cosa', ayuda: 'Lo que quieras contarle.', icono: '◆' },
];

export const ESTADOS = {
  abierta: { texto: 'Enviada', tono: 'bg-white/5 text-white/65' },
  respondida: { texto: 'Respondida', tono: 'bg-neon/10 text-neon' },
  resuelta: { texto: 'Resuelta', tono: 'bg-emerald-400/10 text-emerald-300' },
};

export const MAX_TEXTO = 2000;

export const datosCategoria = (id) => CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[CATEGORIAS.length - 1];
