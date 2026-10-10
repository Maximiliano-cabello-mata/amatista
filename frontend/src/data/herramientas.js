// Catálogo de herramientas de enseñanza (bloques de contenido de una lección).
// Lo usan el editor de lecciones (paleta agrupada) y la página
// «Herramientas» del panel de administración. La forma exacta del JSON de
// cada bloque la da el servidor (/api/contenido/plantillas → bloques).
// Documentación: docs/plataforma/04_herramientas_de_ensenanza.md.

export const CATEGORIAS = [
  { id: 'explicar', nombre: 'Explicar', detalle: 'Presentar una idea con texto, imagen o video.' },
  { id: 'visualizar', nombre: 'Visualizar', detalle: 'Ordenar la idea en un gráfico: tarjetas, capas, procesos, comparaciones.' },
  { id: 'practicar', nombre: 'Practicar en el navegador', detalle: 'Actividades con respuesta inmediata dentro de la lección.' },
  { id: 'blender', nombre: 'Practicar en Blender', detalle: 'Llevar lo aprendido a Blender, con la guía del motor.' },
];

// paraQue: qué consigue el alumno. cuando: en qué momento usarla.
// formula: pasos de la Fórmula donde encaja mejor.
export const HERRAMIENTAS = {
  markdown_text: {
    nombre: 'Texto',
    categoria: 'explicar',
    paraQue: 'Explicar con párrafos cortos, listas y negritas.',
    cuando: 'Para la idea central, en pocas líneas. Si pasa de 6 líneas, conviene un gráfico.',
    formula: ['explora'],
  },
  image: {
    nombre: 'Imagen',
    categoria: 'explicar',
    paraQue: 'Mostrar una captura o ilustración con su pie.',
    cuando: 'Cuando el alumno tiene que reconocer algo en pantalla.',
    formula: ['gancho', 'explora'],
  },
  video_player: {
    nombre: 'Video',
    categoria: 'explicar',
    paraQue: 'Ver el movimiento: una herramienta usada en Blender, de principio a fin.',
    cuando: 'Para demostraciones de menos de 3 minutos.',
    formula: ['explora'],
  },
  callout: {
    nombre: 'Aviso',
    categoria: 'explicar',
    paraQue: 'Resaltar un consejo, una advertencia o un error típico.',
    cuando: 'Una vez por lección como máximo, para que no pierda fuerza.',
    formula: ['reto'],
  },
  code_snippet: {
    nombre: 'Código',
    categoria: 'explicar',
    paraQue: 'Mostrar código con colores y botón de copiar.',
    cuando: 'En los módulos de Python y scripting.',
    formula: ['explora'],
  },
  step_by_step: {
    nombre: 'Paso a paso',
    categoria: 'visualizar',
    paraQue: 'Guiar un procedimiento paso por paso, con las teclas de cada paso.',
    cuando: 'Antes de la práctica en Blender: el alumno ve el camino que luego hará.',
    formula: ['explora', 'practica'],
  },
  shortcuts: {
    nombre: 'Atajos de teclado',
    categoria: 'visualizar',
    paraQue: 'Reunir los atajos del módulo y practicarlos con el teclado («Pruébate»).',
    cuando: 'Al final de la teoría, para fijar las teclas que pedirá la práctica.',
    formula: ['practica'],
  },
  compare: {
    nombre: 'Comparar',
    categoria: 'visualizar',
    paraQue: 'Poner dos cosas lado a lado (bien y mal, antes y después), en columnas o con deslizador.',
    cuando: 'Para errores típicos: el alumno ve la diferencia en vez de leerla.',
    formula: ['explora', 'reto'],
  },
  mesh_viewer: {
    nombre: 'Visor de malla',
    categoria: 'visualizar',
    paraQue: 'Girar una malla low poly y seleccionar sus vértices, aristas o caras como en el Modo Edición (1, 2, 3).',
    cuando: 'Para presentar vértices, aristas y caras, o comparar cuántas caras tiene cada primitiva antes de modelar.',
    formula: ['gancho', 'explora'],
    nueva: true,
  },
  node_graph: {
    nombre: 'Diagrama de nodos',
    categoria: 'visualizar',
    paraQue: 'Mostrar un árbol de nodos de Blender (materiales, Geometry Nodes) y recorrerlo nodo por nodo.',
    cuando: 'Antes de que el alumno conecte nodos en Blender: ve el flujo completo y qué hace cada nodo.',
    formula: ['explora'],
    nueva: true,
  },
  concept_cards: {
    nombre: 'Tarjetas de concepto',
    categoria: 'visualizar',
    paraQue: 'Descubrir conceptos volteando tarjetas.',
    cuando: 'Para presentar 3 a 6 términos relacionados.',
    formula: ['explora'],
  },
  timeline: {
    nombre: 'Línea de tiempo',
    categoria: 'visualizar',
    paraQue: 'Ordenar hechos o etapas en el tiempo.',
    cuando: 'Historia, versiones, evolución de una técnica.',
    formula: ['explora'],
  },
  pipeline: {
    nombre: 'Pipeline',
    categoria: 'visualizar',
    paraQue: 'Mostrar un proceso como una cadena de etapas.',
    cuando: 'Flujos de trabajo: modelar, texturizar, iluminar, renderizar.',
    formula: ['explora'],
  },
  layers: {
    nombre: 'Capas',
    categoria: 'visualizar',
    paraQue: 'Explicar algo que se construye por capas.',
    cuando: 'Materiales, composición, estructura de una escena.',
    formula: ['explora'],
  },
  quiz_inline: {
    nombre: 'Pregunta rápida',
    categoria: 'practicar',
    paraQue: 'Comprobar la idea con una pregunta y explicar la respuesta.',
    cuando: 'Justo después de explicar algo importante.',
    formula: ['gancho', 'practica'],
  },
  ordering: {
    nombre: 'Ordenar',
    categoria: 'practicar',
    paraQue: 'Poner pasos en el orden correcto.',
    cuando: 'Después de un Paso a paso, para ver si el alumno lo recuerda.',
    formula: ['practica', 'reto'],
  },
  matching: {
    nombre: 'Emparejar',
    categoria: 'practicar',
    paraQue: 'Unir conceptos con su definición, tecla o imagen.',
    cuando: 'Para repasar vocabulario o atajos.',
    formula: ['explora'],
  },
  fill_blanks: {
    nombre: 'Completar',
    categoria: 'practicar',
    paraQue: 'Completar huecos en un texto o en código.',
    cuando: 'Para fijar nombres exactos (menús, propiedades, funciones).',
    formula: ['practica'],
  },
  hotspots: {
    nombre: 'Puntos en imagen',
    categoria: 'practicar',
    paraQue: 'Encontrar zonas en una captura de la interfaz.',
    cuando: 'Para aprender dónde está cada panel o botón.',
    formula: ['gancho'],
  },
  scene_explorer: {
    nombre: 'Explorador 3D',
    categoria: 'practicar',
    paraQue: 'Girar y mirar un modelo 3D en el navegador.',
    cuando: 'Para mostrar el resultado esperado antes de construirlo.',
    formula: ['explora'],
  },
  code_challenge: {
    nombre: 'Reto de código',
    categoria: 'practicar',
    paraQue: 'Escribir código que se comprueba con pruebas.',
    cuando: 'En los módulos de Python, como reto final.',
    formula: ['practica', 'reto'],
  },
  blender_practice: {
    nombre: 'Práctica en Blender',
    categoria: 'blender',
    paraQue: 'Abrir una práctica del motor en Blender; el add-on guía y evalúa paso a paso.',
    cuando: 'En la última lección del módulo (solo el examen puede ir después).',
    formula: ['reto'],
  },
};

export const NOMBRES_FORMULA = { gancho: 'Gancho', explora: 'Explora', practica: 'Práctica', reto: 'Reto', jefe: 'Jefe final' };

export function nombreHerramienta(tipo) {
  return HERRAMIENTAS[tipo]?.nombre ?? tipo;
}

// Agrupa los tipos que acepta el servidor por categoría, en el orden del
// catálogo; los tipos que el catálogo no conoce van en «Otras».
export function agruparHerramientas(tipos) {
  const grupos = CATEGORIAS.map((c) => ({ ...c, tipos: [] }));
  const otras = { id: 'otras', nombre: 'Otras', detalle: '', tipos: [] };
  const orden = Object.keys(HERRAMIENTAS);
  for (const tipo of [...tipos].sort((a, b) => indice(orden, a) - indice(orden, b))) {
    const grupo = grupos.find((g) => g.id === HERRAMIENTAS[tipo]?.categoria) ?? otras;
    grupo.tipos.push(tipo);
  }
  return [...grupos, otras].filter((g) => g.tipos.length);
}

function indice(lista, valor) {
  const i = lista.indexOf(valor);
  return i === -1 ? lista.length : i;
}
