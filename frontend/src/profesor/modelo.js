// El modelo ligero de una entrega (formato amatista.modelo/1), del lado del profesor.
//
// El add-on de Blender no sube el .blend: manda la escena en triángulos, con
// los vértices cuantizados a enteros de 16 bits, comprimida con zlib y en
// base64 (addon/amatista_blender/modelo_ligero.py; el servidor la revisa con
// backend/contenido/modelo_ligero.py). Aquí se descomprime y se vuelve a
// armar para dibujarla en el navegador del profesor. Funciones puras, sin
// React (pruebas en modelo.test.js).

export const FORMATO = 'amatista.modelo/1';
const COORDENADA = 32767;

function aBytes(base64) {
  const texto = atob(base64);
  const bytes = new Uint8Array(texto.length);
  for (let i = 0; i < texto.length; i++) bytes[i] = texto.charCodeAt(i);
  return bytes;
}

// base64 → JSON. 'deflate' en DecompressionStream es zlib (con su cabecera), lo que usa Python.
export async function desempaquetar(paquete) {
  const flujo = new Blob([aBytes(paquete)]).stream().pipeThrough(new DecompressionStream('deflate'));
  const datos = JSON.parse(await new Response(flujo).text());
  if (datos?.formato !== FORMATO) throw new Error('Este modelo viene en un formato que la plataforma no conoce.');
  return datos;
}

// Blender guarda los colores en espacio lineal; la pantalla espera sRGB.
export function aSRGB(lineal) {
  const c = Math.max(0, Math.min(1, lineal));
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
}

const GRIS = [0.8, 0.8, 0.8];

// {objetos: [{nombre, tipo, color: [r, g, b] en sRGB, posiciones: Float32Array, triangulos: Uint32Array, p}],
//  centro, radio, suelo, cuentas}. Las coordenadas quedan en metros, con Z hacia arriba como en Blender.
export function armarEscena(datos) {
  const [cx, cy, cz] = datos.centro;
  const k = datos.escala / COORDENADA;
  const materiales = datos.materiales ?? [];
  let minimo = [Infinity, Infinity, Infinity];
  let maximo = [-Infinity, -Infinity, -Infinity];
  let vertices = 0;
  let triangulos = 0;
  const objetos = (datos.objetos ?? []).map((objeto, indice) => {
    const material = materiales[objeto.material];
    const lineal = material?.color ?? GRIS;
    const uno = {
      indice,
      nombre: objeto.nombre,
      tipo: objeto.tipo,
      material: material?.nombre ?? null,
      color: lineal.map(aSRGB),
      mods: objeto.mods ?? [],
      p: objeto.p ?? null,
      posiciones: null,
      triangulos: null,
    };
    if (Array.isArray(objeto.v) && Array.isArray(objeto.t) && objeto.t.length) {
      const posiciones = new Float32Array(objeto.v.length);
      for (let i = 0; i < objeto.v.length; i += 3) {
        posiciones[i] = cx + objeto.v[i] * k;
        posiciones[i + 1] = cy + objeto.v[i + 1] * k;
        posiciones[i + 2] = cz + objeto.v[i + 2] * k;
        for (let e = 0; e < 3; e++) {
          minimo[e] = Math.min(minimo[e], posiciones[i + e]);
          maximo[e] = Math.max(maximo[e], posiciones[i + e]);
        }
      }
      uno.posiciones = posiciones;
      uno.triangulos = Uint32Array.from(objeto.t);
      vertices += objeto.v.length / 3;
      triangulos += objeto.t.length / 3;
    }
    return uno;
  });
  if (!Number.isFinite(minimo[0])) {
    minimo = [cx - 1, cy - 1, cz - 1];
    maximo = [cx + 1, cy + 1, cz + 1];
  }
  const centro = minimo.map((m, e) => (m + maximo[e]) / 2);
  const radio = Math.max(Math.hypot(maximo[0] - minimo[0], maximo[1] - minimo[1], maximo[2] - minimo[2]) / 2, 0.01);
  return {
    objetos,
    centro,
    radio,
    suelo: minimo[2],
    medidas: maximo.map((m, e) => m - minimo[e]),
    cuentas: {
      objetos: objetos.length,
      mallas: objetos.filter((o) => o.triangulos).length,
      vertices,
      triangulos,
      materiales: materiales.length,
    },
    resumido: Boolean(datos.resumido),
    blender: datos.blender ?? null,
  };
}

export function bytesLegibles(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Medida legible en metros (Blender trabaja en metros por defecto).
export function medidaLegible(metros) {
  if (metros >= 1) return `${metros.toFixed(2)} m`;
  return `${Math.round(metros * 100)} cm`;
}
