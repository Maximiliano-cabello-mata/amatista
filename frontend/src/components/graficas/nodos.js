// Diagrama de nodos al estilo del editor de nodos de Blender (node_graph,
// DiagramaNodos.jsx). Funciones puras: colores de Blender, acomodo automático
// en columnas según las conexiones y orden para «Recorrer el flujo».

// Encabezado de cada clase de nodo (tema por defecto de Blender, algo más
// oscuro para que el texto blanco se lea).
export const CLASES_NODO = {
  input: { nombre: 'Entrada', color: '#B0284F' },
  output: { nombre: 'Salida', color: '#6E1B2B' },
  shader: { nombre: 'Shader', color: '#1E8A2E' },
  texture: { nombre: 'Textura', color: '#B45A08' },
  color: { nombre: 'Color', color: '#5B5860' },
  vector: { nombre: 'Vector', color: '#3C3C83' },
  converter: { nombre: 'Conversor', color: '#1F5B7A' },
  geometry: { nombre: 'Geometría', color: '#0B8E6E' },
  group: { nombre: 'Grupo', color: '#2E6B3A' },
  layout: { nombre: 'Marco', color: '#3A3A3A' },
};

// Color de cada tipo de conector, como en Blender.
export const CONECTORES = {
  float: '#A1A1A1',
  int: '#598C5C',
  boolean: '#CCA6D6',
  vector: '#6363C7',
  color: '#C7C729',
  shader: '#63C763',
  geometry: '#00D6A3',
  string: '#70B2FF',
  object: '#ED9E5C',
  material: '#EB7582',
};

export const MEDIDAS = { ancho: 176, encabezado: 26, fila: 22, margen: 10, separacionX: 70, separacionY: 26 };

const partir = (ref) => {
  const punto = String(ref ?? '').indexOf('.');
  return punto < 1 ? [null, null] : [ref.slice(0, punto), ref.slice(punto + 1)];
};

// Profundidad de cada nodo: cuántos nodos lo alimentan en cadena. Un nodo con
// «col» se queda en esa columna. Devuelve null si las conexiones hacen un ciclo.
export function columnas(nodos, enlaces) {
  const previos = new Map(nodos.map((n) => [n.id, []]));
  for (const enlace of enlaces) {
    const [desde] = partir(enlace.from);
    const [hasta] = partir(enlace.to);
    if (previos.has(desde) && previos.has(hasta)) previos.get(hasta).push(desde);
  }
  const col = new Map();
  const visitando = new Set();
  const visitar = (id) => {
    if (col.has(id)) return col.get(id);
    if (visitando.has(id)) return null;
    visitando.add(id);
    let c = 0;
    for (const p of previos.get(id)) {
      const cp = visitar(p);
      if (cp === null) return null;
      c = Math.max(c, cp + 1);
    }
    visitando.delete(id);
    const fija = nodos.find((n) => n.id === id)?.col;
    col.set(id, Number.isInteger(fija) ? fija : c);
    return col.get(id);
  };
  for (const n of nodos) if (visitar(n.id) === null) return null;
  return col;
}

// Posición de cada nodo y de cada conector. Las salidas van arriba y las
// entradas debajo, como en Blender.
export function acomodar(nodos, enlaces) {
  const col = columnas(nodos, enlaces);
  if (!col) return null;
  const { ancho, encabezado, fila, margen, separacionX, separacionY } = MEDIDAS;
  const alturas = new Map();
  const cajas = new Map();
  const conectores = new Map();
  for (const nodo of nodos) {
    const c = col.get(nodo.id);
    const y = alturas.get(c) ?? margen;
    const salidas = nodo.outputs ?? [];
    const entradas = nodo.inputs ?? [];
    const alto = encabezado + (salidas.length + entradas.length) * fila + 8;
    const x = margen + c * (ancho + separacionX);
    cajas.set(nodo.id, { x, y, ancho, alto, columna: c });
    salidas.forEach((s, i) => conectores.set(`${nodo.id}.${s.id}`, { x: x + ancho, y: y + encabezado + i * fila + fila / 2 + 4, lado: 'salida', tipo: s.socket }));
    entradas.forEach((e, i) =>
      conectores.set(`${nodo.id}.${e.id}`, { x, y: y + encabezado + (salidas.length + i) * fila + fila / 2 + 4, lado: 'entrada', tipo: e.socket }),
    );
    alturas.set(c, y + alto + separacionY);
  }
  const ultimaColumna = Math.max(0, ...col.values());
  const lineas = enlaces
    .map((enlace, i) => {
      const a = conectores.get(enlace.from);
      const b = conectores.get(enlace.to);
      if (!a || !b) return null;
      const curva = Math.max(40, Math.abs(b.x - a.x) / 2);
      return {
        i,
        desde: partir(enlace.from)[0],
        hasta: partir(enlace.to)[0],
        d: `M${a.x},${a.y} C${a.x + curva},${a.y} ${b.x - curva},${b.y} ${b.x},${b.y}`,
        color: CONECTORES[a.tipo] ?? CONECTORES.float,
      };
    })
    .filter(Boolean);
  return {
    cajas,
    conectores,
    lineas,
    ancho: margen * 2 + (ultimaColumna + 1) * ancho + ultimaColumna * separacionX,
    alto: Math.max(...alturas.values()) - separacionY + margen,
  };
}

// Orden para recorrer el flujo: de las entradas a la salida (por columna y,
// dentro de la columna, en el orden del JSON).
export function ordenFlujo(nodos, enlaces) {
  const col = columnas(nodos, enlaces);
  if (!col) return nodos.map((n) => n.id);
  return nodos
    .map((n, i) => ({ id: n.id, c: col.get(n.id), i }))
    .sort((a, b) => a.c - b.c || a.i - b.i)
    .map((n) => n.id);
}
