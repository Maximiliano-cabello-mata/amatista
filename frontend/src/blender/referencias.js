// Modelos de referencia de las prácticas de Blender (motor 3.3): la imagen
// renderizada en Blender y el plano con medidas aproximadas que genera
// engine/herramientas/referencias.py junto a cada practica.json. El add-on
// muestra los mismos archivos en su pestaña.
import indice from '../../../practices/blender/referencias.json';

const imagenes = import.meta.glob('../../../practices/blender/**/referencia.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});
const planos = import.meta.glob('../../../practices/blender/**/plano.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const RAIZ = '../../../practices/blender/';

export function referenciaDe(practicaId) {
  const datos = indice.practicas?.[practicaId];
  if (!datos) return null;
  const imagen = imagenes[`${RAIZ}${datos.carpeta}/referencia.jpg`];
  if (!imagen) return null;
  return {
    ...datos,
    imagen,
    plano: planos[`${RAIZ}${datos.carpeta}/plano.svg`] ?? null,
  };
}

// «≈ 4.5 × 1.6 × 2.1 m» con las medidas generales de la figura.
export function textoMedidas(medidas) {
  if (!Array.isArray(medidas) || medidas.length !== 3) return '';
  const visibles = medidas.filter((m) => m > 0.05);
  if (!visibles.length) return '';
  return `≈ ${visibles.map((m) => (m >= 10 ? m.toFixed(0) : String(Number(m.toFixed(1))))).join(' × ')} m`;
}
