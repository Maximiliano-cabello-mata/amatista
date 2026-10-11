// Recursos gráficos v3.7 (docs/plataforma/10_primeros_pasos_y_recursos.md): la lógica pura de los
// bloques nuevos, sin React (pruebas en recursos.test.js). Todo es SVG propio y pesa poco: la
// plataforma tiene que verse bien también con red lenta y equipos modestos.
//
//   ui_tour          recorrido por una pantalla (la plataforma, una lección o Blender con el add-on)
//   connection_flow  quién le habla a quién: mensajes que viajan entre la plataforma, el servidor y Blender
//   classify         interactivo: cada tarjeta a su grupo
//   true_false       interactivo: ¿verdad o mito?
//   axis_gizmo       los ejes X, Y y Z que se giran con el dedo, con las vistas del teclado numérico
//   param_demo       un control que cambia una figura (Array, Bisel, Subdivisión, Espejo, Luz, Resolución)
//   blender_tour     interactivo: los primeros pasos dentro de Blender, en vivo por el enlace

// --- ui_tour: pantallas esquemáticas ---------------------------------------------------------
// Cada pantalla es un dibujo de 320 × 200 con zonas con nombre; las paradas del bloque dicen qué
// zona se ilumina. Las mismas zonas están en backend/contenido/validacion.py (ZONAS_PANTALLA).

export const PANTALLAS = {
  plataforma: {
    titulo: 'La plataforma',
    zonas: {
      barra: { x: 0, y: 0, w: 320, h: 24, nombre: 'Barra superior' },
      avance: { x: 214, y: 4, w: 72, h: 16, nombre: 'XP, nivel y racha' },
      ayuda: { x: 292, y: 4, w: 22, h: 16, nombre: 'Botón «?»' },
      continuar: { x: 16, y: 36, w: 128, h: 26, nombre: '▶ Continuar' },
      cursos: { x: 16, y: 74, w: 182, h: 112, nombre: 'Cursos' },
      panel: { x: 210, y: 74, w: 94, h: 52, nombre: 'Mi panel' },
      blender: { x: 210, y: 134, w: 94, h: 52, nombre: 'Mi Blender' },
    },
  },
  leccion: {
    titulo: 'Una lección',
    zonas: {
      titulo: { x: 16, y: 10, w: 220, h: 22, nombre: 'Título y tiempo' },
      quehacer: { x: 16, y: 36, w: 220, h: 14, nombre: 'Qué hacer' },
      teoria: { x: 16, y: 58, w: 220, h: 46, nombre: 'Teoría corta' },
      actividad: { x: 16, y: 112, w: 220, h: 48, nombre: 'Actividad' },
      hexagonos: { x: 16, y: 170, w: 90, h: 18, nombre: 'Actividades resueltas' },
      completar: { x: 150, y: 168, w: 86, h: 22, nombre: 'Completar lección' },
      mascota: { x: 252, y: 128, w: 56, h: 62, nombre: 'La mascota del módulo' },
    },
  },
  blender: {
    titulo: 'Blender con Amatista',
    zonas: {
      herramientas: { x: 4, y: 30, w: 18, h: 120, nombre: 'Barra de herramientas (T)' },
      vista3d: { x: 26, y: 20, w: 190, h: 172, nombre: 'Vista 3D' },
      tarjeta: { x: 30, y: 116, w: 108, h: 72, nombre: 'Tarjeta de la actividad' },
      molde: { x: 128, y: 58, w: 64, h: 56, nombre: 'Molde translúcido' },
      barra_n: { x: 220, y: 20, w: 46, h: 172, nombre: 'Barra lateral (N) › Amatista' },
      outliner: { x: 270, y: 20, w: 46, h: 64, nombre: 'Outliner' },
      propiedades: { x: 270, y: 88, w: 46, h: 104, nombre: 'Propiedades' },
    },
  },
};

// Paradas que se pueden mostrar: las que nombran una zona de su pantalla.
export function paradasDe(bloque) {
  const pantalla = PANTALLAS[bloque?.screen];
  if (!pantalla) return [];
  return (bloque.stops ?? []).filter((parada) => pantalla.zonas[parada?.area]);
}

// Índice siguiente o anterior sin salirse (no da la vuelta: el final se nota).
export const moverParada = (indice, paso, total) => Math.max(0, Math.min(total - 1, indice + paso));

// Centro de una zona (para el número que late encima).
export function centroZona(zona) {
  return { x: zona.x + zona.w / 2, y: zona.y + zona.h / 2 };
}

// --- connection_flow -----------------------------------------------------------------------

// Nodos repartidos a lo ancho (de 2 a 4), centrados en y.
export function posicionesNodos(nodos = [], ancho = 320, alto = 150) {
  const n = Math.max(1, nodos.length);
  const paso = ancho / n;
  return Object.fromEntries(nodos.map((nodo, i) => [nodo.id, { x: paso * i + paso / 2, y: alto / 2 }]));
}

// Mensajes con nodos que existen y que no van al mismo nodo.
export function mensajesValidos(bloque) {
  const ids = new Set((bloque?.nodes ?? []).map((n) => n.id));
  return (bloque?.messages ?? []).filter((m) => ids.has(m.from) && ids.has(m.to) && m.from !== m.to);
}

// Un mensaje de ida va por arriba y uno de vuelta por abajo: así no se pisan las flechas.
export function curvaMensaje(desde, hasta, alto = 150) {
  const ida = hasta.x > desde.x;
  const curva = (ida ? -1 : 1) * Math.min(48, alto * 0.32);
  const medio = { x: (desde.x + hasta.x) / 2, y: (desde.y + hasta.y) / 2 + curva };
  const margen = 26;
  const signo = ida ? 1 : -1;
  const a = { x: desde.x + signo * margen, y: desde.y + (ida ? -8 : 8) };
  const b = { x: hasta.x - signo * margen, y: hasta.y + (ida ? -8 : 8) };
  return { d: `M${a.x},${a.y} Q${medio.x},${medio.y} ${b.x},${b.y}`, medio, ida };
}

// --- classify -------------------------------------------------------------------------------

// asignadas: {indiceTarjeta: grupoId}. Devuelve las que están bien, mal y las que faltan.
export function revisarClasificacion(items = [], asignadas = {}) {
  const bien = [];
  const mal = [];
  const faltan = [];
  items.forEach((item, i) => {
    const grupo = asignadas[i];
    if (grupo === undefined || grupo === null) faltan.push(i);
    else if (grupo === item.group) bien.push(i);
    else mal.push(i);
  });
  return { bien, mal, faltan, completa: faltan.length === 0 && mal.length === 0 };
}

// Tras comprobar, las mal puestas vuelven a la mesa; las buenas se quedan.
export function quitarErrores(asignadas, mal) {
  const copia = { ...asignadas };
  for (const i of mal) delete copia[i];
  return copia;
}

// --- true_false -----------------------------------------------------------------------------

// respuestas: [true/false/undefined] en el orden de las afirmaciones.
export function resumenVerdadero(afirmaciones = [], respuestas = []) {
  const aciertos = afirmaciones.filter((a, i) => respuestas[i] === Boolean(a.answer)).length;
  const respondidas = respuestas.filter((r) => r === true || r === false).length;
  return { aciertos, respondidas, total: afirmaciones.length, terminado: respondidas >= afirmaciones.length };
}

// --- axis_gizmo: los ejes de Blender en 2D ---------------------------------------------------
// Blender: X a la derecha, Y hacia el fondo, Z hacia arriba. giro (yaw) alrededor de Z y
// elevación (pitch, 0 = de frente, 90 = desde arriba), en grados.

export const VISTAS = {
  frente: { giro: 0, elevacion: 0, tecla: '1', nombre: 'Frente' },
  derecha: { giro: 90, elevacion: 0, tecla: '3', nombre: 'Derecha' },
  arriba: { giro: 0, elevacion: 90, tecla: '7', nombre: 'Arriba' },
  libre: { giro: 35, elevacion: 28, tecla: '', nombre: 'Libre' },
};

const rad = (grados) => (grados * Math.PI) / 180;

// Punto 3D → {x, y, profundidad} en la pantalla (y hacia arriba; profundidad mayor = más lejos).
export function proyectar([x, y, z], giro, elevacion) {
  const g = rad(giro);
  const e = rad(elevacion);
  const derecha = [Math.cos(g), Math.sin(g), 0];
  const fondo = [-Math.sin(g), Math.cos(g), 0];
  const adelante = [fondo[0] * Math.cos(e), fondo[1] * Math.cos(e), -Math.sin(e)];
  const arriba = [fondo[0] * Math.sin(e), fondo[1] * Math.sin(e), Math.cos(e)];
  const punto = [x, y, z];
  const dot = (v) => v[0] * punto[0] + v[1] * punto[1] + v[2] * punto[2];
  return { x: dot(derecha), y: dot(arriba), profundidad: dot(adelante) };
}

export const limitarElevacion = (e) => Math.max(-89, Math.min(90, e));

// La vista con nombre más parecida (para encender su tecla), o 'libre'.
export function vistaCercana(giro, elevacion) {
  const g = ((giro % 360) + 360) % 360;
  for (const [id, v] of Object.entries(VISTAS)) {
    if (id === 'libre') continue;
    const dg = Math.min(Math.abs(g - v.giro), 360 - Math.abs(g - v.giro));
    if (Math.abs(elevacion - v.elevacion) < 4 && (v.elevacion === 90 || dg < 4)) return id;
  }
  return 'libre';
}

// Aristas de un cubo de lado 2 centrado en el origen, ya proyectadas y ordenadas de lejos a cerca.
const VERTICES_CUBO = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => [x, y, z])));
export function aristasCubo(giro, elevacion) {
  const aristas = [];
  for (let i = 0; i < VERTICES_CUBO.length; i++) {
    for (let j = i + 1; j < VERTICES_CUBO.length; j++) {
      const diferentes = VERTICES_CUBO[i].filter((v, k) => v !== VERTICES_CUBO[j][k]).length;
      if (diferentes !== 1) continue;
      const a = proyectar(VERTICES_CUBO[i], giro, elevacion);
      const b = proyectar(VERTICES_CUBO[j], giro, elevacion);
      aristas.push({ a, b, profundidad: (a.profundidad + b.profundidad) / 2 });
    }
  }
  return aristas.sort((p, q) => q.profundidad - p.profundidad);
}

// --- param_demo -----------------------------------------------------------------------------
// Cada demo: el control (mín., máx., paso, valor inicial, nombre) y una función que arma las
// figuras SVG en un lienzo de 240 × 160. Las figuras son datos ({tipo, ...}) para probarlas.

const redondo = (n) => Math.round(n * 10) / 10;
const puntosTexto = (puntos) => puntos.map(([x, y]) => `${redondo(x)},${redondo(y)}`).join(' ');

// Cuadrado con las esquinas biseladas en `segmentos` (0 = esquinas vivas).
export function cuadradoBiselado(cx, cy, lado, radio, segmentos) {
  const m = lado / 2;
  if (segmentos <= 0 || radio <= 0) {
    return [
      [cx - m, cy - m],
      [cx + m, cy - m],
      [cx + m, cy + m],
      [cx - m, cy + m],
    ];
  }
  const r = Math.min(radio, m);
  const esquinas = [
    [cx + m - r, cy - m + r, -90],
    [cx + m - r, cy + m - r, 0],
    [cx - m + r, cy + m - r, 90],
    [cx - m + r, cy - m + r, 180],
  ];
  const puntos = [];
  for (const [ex, ey, inicio] of esquinas) {
    for (let s = 0; s <= segmentos; s++) {
      const a = rad(inicio + (90 * s) / segmentos);
      puntos.push([ex + r * Math.cos(a), ey + r * Math.sin(a)]);
    }
  }
  return puntos;
}

// Cortar esquinas (Chaikin): cada nivel parte cada lado en dos y la figura se suaviza, como
// Subdivision Surface visto de perfil.
export function subdividir(puntos, niveles) {
  let actual = puntos;
  for (let n = 0; n < niveles; n++) {
    const siguiente = [];
    for (let i = 0; i < actual.length; i++) {
      const [x0, y0] = actual[i];
      const [x1, y1] = actual[(i + 1) % actual.length];
      siguiente.push([0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1], [0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1]);
    }
    actual = siguiente;
  }
  return actual;
}

export function poligonoRegular(cx, cy, radio, lados) {
  return Array.from({ length: lados }, (_, i) => {
    const a = rad(-90 + (360 * i) / lados);
    return [cx + radio * Math.cos(a), cy + radio * Math.sin(a)];
  });
}

export const DEMOS = {
  array: {
    titulo: 'Array: copias en fila',
    control: { nombre: 'Copias (Count)', min: 1, max: 8, paso: 1, inicial: 3 },
    texto: (v) => `${v} ${v === 1 ? 'pieza: el original' : 'piezas: el original y sus copias'}. Si cambias el original, cambian todas.`,
    figuras(v) {
      const lado = 22;
      const separacion = lado * 1.25;
      const total = lado + separacion * (v - 1);
      const x0 = 120 - total / 2;
      return Array.from({ length: v }, (_, i) => ({
        tipo: 'rect',
        x: redondo(x0 + i * separacion),
        y: 70,
        w: lado,
        h: lado,
        rol: i === 0 ? 'original' : 'copia',
      }));
    },
  },
  bevel: {
    titulo: 'Bisel: bordes que atrapan la luz',
    control: { nombre: 'Segmentos', min: 0, max: 6, paso: 1, inicial: 2 },
    texto: (v) =>
      v === 0 ? 'Sin bisel: la esquina es un filo perfecto, algo que casi no existe en la vida real.' : `${v} ${v === 1 ? 'segmento: un chaflán recto' : 'segmentos: la esquina se redondea'}.`,
    figuras: (v) => [{ tipo: 'poligono', puntos: puntosTexto(cuadradoBiselado(120, 80, 96, 22, v)), rol: 'original' }],
  },
  subdivision: {
    titulo: 'Subdivision Surface: de caja a forma suave',
    control: { nombre: 'Niveles', min: 0, max: 4, paso: 1, inicial: 1 },
    texto: (v) =>
      v === 0 ? 'Nivel 0: la caja tal cual.' : `Nivel ${v}: ${4 * 2 ** v} lados de perfil. Cada nivel parte cada lado en dos; más allá de 3 casi no se nota y pesa mucho más.`,
    figuras: (v) => [
      { tipo: 'poligono', puntos: puntosTexto(subdividir(cuadradoBiselado(120, 80, 100, 0, 0), 0)), rol: 'guia' },
      { tipo: 'poligono', puntos: puntosTexto(subdividir(cuadradoBiselado(120, 80, 100, 0, 0), v)), rol: 'original' },
    ],
  },
  mirror: {
    titulo: 'Mirror: modelas la mitad',
    control: { nombre: 'Mover un vértice', min: 0, max: 40, paso: 1, inicial: 18 },
    texto: () => 'Mueves un vértice del lado derecho y el modificador Mirror repite el cambio del otro lado.',
    figuras(v) {
      const mitad = [
        [120, 30],
        [150 + v, 52],
        [162, 96],
        [140, 130],
        [120, 130],
      ];
      const reflejo = mitad.map(([x, y]) => [240 - x, y]);
      return [
        { tipo: 'linea', x1: 120, y1: 18, x2: 120, y2: 142, rol: 'eje' },
        { tipo: 'poligono', puntos: puntosTexto(reflejo), rol: 'copia' },
        { tipo: 'poligono', puntos: puntosTexto(mitad), rol: 'original' },
        { tipo: 'punto', x: 150 + v, y: 52, rol: 'control' },
        { tipo: 'punto', x: 90 - v, y: 52, rol: 'copia' },
      ];
    },
  },
  light: {
    titulo: 'La luz decide la sombra',
    control: { nombre: 'Altura del sol (grados)', min: 10, max: 170, paso: 5, inicial: 50 },
    texto: (v) => {
      const altura = v <= 90 ? v : 180 - v;
      if (altura < 25) return 'Sol bajo: sombras largas y dramáticas, como al atardecer.';
      if (altura > 70) return 'Sol alto: sombras cortas y duras, como al mediodía.';
      return 'Sol a media altura: la sombra muestra la forma sin taparla.';
    },
    figuras(v) {
      const suelo = 128;
      const caja = { x: 104, y: 88, w: 32, h: 40 };
      const sol = { x: 120 - 92 * Math.cos(rad(v)), y: suelo - 92 * Math.sin(rad(v)) };
      const altura = rad(Math.max(8, v <= 90 ? v : 180 - v));
      const largo = Math.min(100, caja.h / Math.tan(altura));
      // La sombra cae del lado contrario al sol: una franja sobre el suelo.
      const desde = v < 90 ? caja.x : caja.x + caja.w;
      const hasta = v < 90 ? caja.x + caja.w + largo : caja.x - largo;
      const [x1, x2] = [Math.min(desde, hasta), Math.max(desde, hasta)];
      return [
        { tipo: 'linea', x1: 10, y1: suelo, x2: 230, y2: suelo, rol: 'suelo' },
        { tipo: 'poligono', puntos: puntosTexto([[x1, suelo - 3], [x2, suelo - 1], [x2, suelo + 3], [x1, suelo + 5]]), rol: 'sombra', largo: redondo(largo) },
        { tipo: 'rect', ...caja, rol: 'original' },
        { tipo: 'linea', x1: redondo(sol.x), y1: redondo(sol.y), x2: 120, y2: caja.y, rol: 'rayo' },
        { tipo: 'sol', x: redondo(sol.x), y: redondo(sol.y), rol: 'luz' },
      ];
    },
  },
  resolution: {
    titulo: 'Resolución: los lados de un cilindro',
    control: { nombre: 'Vértices', min: 3, max: 32, paso: 1, inicial: 8 },
    texto: (v) =>
      v < 8 ? `${v} vértices: se ve como un prisma.` : v <= 16 ? `${v} vértices: redondo a la vista, ligero para la computadora.` : `${v} vértices: muy suave, pero cada lado más es geometría que pagar.`,
    figuras: (v) => [{ tipo: 'poligono', puntos: puntosTexto(poligonoRegular(120, 80, 58, v)), rol: 'original', vertices: v }],
  },
};

export const limitarValor = (control, valor) => {
  const numero = Number.isFinite(Number(valor)) ? Number(valor) : control.inicial;
  return Math.max(control.min, Math.min(control.max, Math.round(numero / control.paso) * control.paso));
};

// --- blender_tour: los primeros pasos en Blender, por el enlace en vivo ----------------------
// El add-on (addon/amatista_blender/recorrido.py) manda en su latido detalle.recorrido:
// {activo, hecho, paso, total, titulo, texto, hacer, teclas, pasos: [{titulo, ok}]}.

export function vivoDelRecorrido(d) {
  if (!d || typeof d !== 'object') return null;
  const total = Math.max(0, Math.round(Number(d.total) || 0));
  const pasos = Array.isArray(d.pasos)
    ? d.pasos.filter((p) => p && typeof p === 'object').map((p) => ({ titulo: String(p.titulo ?? ''), ok: Boolean(p.ok) }))
    : [];
  return {
    activo: Boolean(d.activo),
    hecho: Boolean(d.hecho),
    paso: Math.max(0, Math.min(total, Math.round(Number(d.paso) || 0))),
    total,
    titulo: String(d.titulo ?? ''),
    texto: String(d.texto ?? ''),
    hacer: String(d.hacer ?? ''),
    teclas: Array.isArray(d.teclas) ? d.teclas.map(String).slice(0, 6) : [],
    pasos,
  };
}

// El estado del recorrido en el Blender del alumno:
//   sin_enlace  el servidor no tiene el enlace en vivo
//   cerrado     ningún Blender abierto
//   viejo       Blender abierto con un add-on que no conoce el recorrido (anterior al 5.1)
//   abierto     Blender abierto, el recorrido sin empezar
//   recorriendo Blender en el recorrido (vivo)
//   hecho       el recorrido terminado en ese Blender
export function recorridoDelEnlace(datos) {
  if (!datos || datos.enlace === false) return { estado: 'sin_enlace', vivo: null };
  const abiertos = (datos.blender ?? []).filter((b) => b?.en_linea);
  if (!abiertos.length) return { estado: 'cerrado', vivo: null };
  const conRecorrido = abiertos.map((b) => ({ b, vivo: vivoDelRecorrido(b.detalle?.recorrido) })).filter((x) => x.vivo);
  const hecho = conRecorrido.find((x) => x.vivo.hecho);
  if (hecho) return { estado: 'hecho', vivo: hecho.vivo, blender: hecho.b };
  const activo = conRecorrido.find((x) => x.vivo.activo);
  if (activo) return { estado: 'recorriendo', vivo: activo.vivo, blender: activo.b };
  if (conRecorrido.length) return { estado: 'abierto', vivo: conRecorrido[0].vivo, blender: conRecorrido[0].b };
  return { estado: 'viejo', vivo: null, blender: abiertos[0] };
}

export const TEXTO_RECORRIDO = {
  sin_enlace: 'El servidor todavía no tiene el enlace en vivo: haz los primeros pasos desde la pestaña Amatista de Blender.',
  cerrado: 'Tu Blender está cerrado. Ábrelo: los primeros pasos te esperan en la pestaña Amatista (tecla N).',
  viejo: 'Tu Amatista Motor es anterior a los primeros pasos. Descarga el nuevo desde Mi Blender y reinstálalo.',
  abierto: 'Tu Blender está conectado. Pulsa «Empezar en Blender» y mira tu pantalla.',
  recorriendo: 'Estás haciendo los primeros pasos en Blender. Aquí ves el mismo paso que allá.',
  hecho: '¡Listo! Terminaste los primeros pasos en Blender.',
};
