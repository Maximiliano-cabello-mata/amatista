// Retos del Motor Web: se revisan con la foto de la escena (dónde está cada objeto, cuáles se
// tocaron, dónde están las zonas), no con el código. Así el mismo reto sirve en una lección,
// en el Estudio y en la página que el alumno descarga. Funciones puras: pruebas en motor3d.test.js.
//
// Foto: {objetos: {id: {x, y, z, tocado}}, zonas: {id: {x, z, radio}}}.
// Reto: {tipo, objeto?, objetos?, zona?, de?, distancia?, minimo?, texto?}
//   en_zona       el objeto está dentro de la zona
//   todos_en_zona todos los objetos de la lista están dentro de la zona
//   tocar         el objeto fue tocado (clic, toque o gatillo)
//   cerca         el objeto está a menos de `distancia` metros de `de`
//   altura        el objeto está a `minimo` metros o más del suelo
export const TIPOS_RETO = ['en_zona', 'todos_en_zona', 'tocar', 'cerca', 'altura'];

const dentro = (objeto, zona) => Boolean(objeto && zona) && Math.hypot(objeto.x - zona.x, objeto.z - zona.z) <= zona.radio;
const limpio = (id) => String(id ?? '').replace(/^#/, '');

export function textoReto(reto) {
  if (reto.texto) return reto.texto;
  const o = limpio(reto.objeto);
  const z = limpio(reto.zona);
  switch (reto.tipo) {
    case 'en_zona':
      return `Lleva «${o}» a la zona «${z}».`;
    case 'todos_en_zona':
      return `Junta ${(reto.objetos ?? []).length} objetos en «${z}».`;
    case 'tocar':
      return `Toca «${o}».`;
    case 'cerca':
      return `Acerca «${o}» a «${limpio(reto.de)}».`;
    case 'altura':
      return `Sube «${o}» a ${reto.minimo ?? 1} m.`;
    default:
      return 'Reto';
  }
}

export function evaluarReto(reto, foto = {}) {
  const objetos = foto.objetos ?? {};
  const zonas = foto.zonas ?? {};
  const objeto = objetos[limpio(reto.objeto)];
  switch (reto.tipo) {
    case 'en_zona':
      return dentro(objeto, zonas[limpio(reto.zona)]);
    case 'todos_en_zona': {
      const lista = (reto.objetos ?? []).map(limpio);
      return lista.length > 0 && lista.every((id) => dentro(objetos[id], zonas[limpio(reto.zona)]));
    }
    case 'tocar':
      return Boolean(objeto?.tocado);
    case 'cerca': {
      const otro = objetos[limpio(reto.de)] ?? zonas[limpio(reto.de)];
      return Boolean(objeto && otro) && Math.hypot(objeto.x - otro.x, objeto.z - otro.z) <= (Number(reto.distancia) || 1);
    }
    case 'altura':
      return Boolean(objeto) && objeto.y >= (Number(reto.minimo) || 1);
    default:
      return false;
  }
}

// {lista: [{indice, texto, cumplido}], cumplidos, total, completo}.
export function evaluarRetos(retos = [], foto = {}) {
  const lista = retos.map((reto, indice) => ({ indice, texto: textoReto(reto), cumplido: evaluarReto(reto, foto) }));
  const cumplidos = lista.filter((r) => r.cumplido).length;
  return { lista, cumplidos, total: lista.length, completo: lista.length > 0 && cumplidos === lista.length };
}
