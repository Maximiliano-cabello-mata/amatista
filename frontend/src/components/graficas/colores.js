// Colores de las gráficas: la paleta de la identidad visual (tailwind.config.js).
// El texto nunca lleva el color de los datos: valores y etiquetas usan tonos de texto.

export const COLORES = {
  amatista: '#9B59B6',
  amatistaClaro: '#C39BD3',
  amatistaOscuro: '#3D1F52',
  neon: '#00E5FF',
  blender: '#F5792A',
  superficie: '#1E1E1E',
  rejilla: 'rgba(255, 255, 255, 0.08)',
  eje: 'rgba(255, 255, 255, 0.18)',
  textoSuave: 'rgba(255, 255, 255, 0.5)',
  texto: '#E0E0E0',
};

// Color de la marca y de su pista (un paso oscuro del mismo tono) por acento de curso.
export const ACENTOS_GRAFICA = {
  amatista: { color: COLORES.amatista, pista: COLORES.amatistaOscuro },
  blender: { color: COLORES.blender, pista: '#45261A' },
  neon: { color: COLORES.neon, pista: '#0B3A40' },
};

// Rampa secuencial de un solo tono (amatista), de oscuro a claro sobre la
// superficie oscura. Validada como rampa ordinal en modo oscuro: luminosidad
// monótona, saltos visibles y el primer paso a ≥ 2:1 contra #1E1E1E.
export const RAMPA_AMATISTA = ['#6E3A8C', '#8E4FAE', '#A970CC', '#C79AE6'];
export const CELDA_VACIA = '#2A2A2A';
