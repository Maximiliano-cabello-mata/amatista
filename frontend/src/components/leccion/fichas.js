// Fichas de herramientas de Blender (motor 6.1): las mismas que Blender muestra en la vista 3D
// cuando una práctica estrena una herramienta (practices/blender/fichas.json, compartido con el
// add-on). La plataforma las enseña en la teoría con los bloques «herramienta_blender» y
// «blender_mapa»; así el alumno llega a Blender sabiendo para qué sirve cada cosa y dónde está.
// Lógica pura: se prueba sin React.
import datos from '../../../../practices/blender/fichas.json';

export const ZONAS = datos.zonas;
export const FICHAS = datos.fichas;

const POR_ID = new Map(FICHAS.map((f) => [f.id, f]));
const ZONA_POR_ID = new Map(ZONAS.map((z) => [z.id, z]));

export const ficha = (id) => POR_ID.get(id) ?? null;
export const zona = (id) => ZONA_POR_ID.get(id) ?? null;
export const fichasDeZona = (id) => FICHAS.filter((f) => f.zona === id);

// Dónde va cada zona en el esquema de la ventana de Blender (CSS grid de 12 columnas × 8 filas).
// Es un dibujo, no una captura: alcanza para ubicarse la primera vez.
export const PLANO = {
  barra_superior: { col: '1 / 13', fila: '1 / 2' },
  cabecera: { col: '2 / 10', fila: '2 / 3' },
  herramientas: { col: '1 / 2', fila: '2 / 7', vertical: true },
  vista3d: { col: '2 / 9', fila: '3 / 7' },
  lateral: { col: '9 / 10', fila: '3 / 7', vertical: true },
  outliner: { col: '10 / 13', fila: '2 / 4' },
  propiedades: { col: '10 / 13', fila: '4 / 8' },
  linea_tiempo: { col: '1 / 10', fila: '7 / 8' },
  barra_estado: { col: '1 / 13', fila: '8 / 9' },
};

// Revisa una respuesta de «¿dónde está?»: la pregunta es {tool} (la zona de esa ficha) o {zone}.
export function zonaEsperada(pregunta) {
  if (pregunta?.zone) return pregunta.zone;
  return ficha(pregunta?.tool)?.zona ?? null;
}

export function enunciado(pregunta) {
  if (pregunta?.prompt) return pregunta.prompt;
  const f = ficha(pregunta?.tool);
  return f ? `¿Dónde encuentras «${f.nombre}»?` : '';
}

// Resultado de tocar una zona. Si se equivocó, explica la zona que tocó (para que el error enseñe)
// y, a partir del segundo fallo, dice cuál era. Nunca da la respuesta de la práctica, solo el lugar.
export function revisarZona(pregunta, tocada, fallosPrevios = 0) {
  const esperada = zonaEsperada(pregunta);
  if (tocada === esperada) return { correcto: true, revelar: false, esperada };
  const z = zona(tocada);
  return {
    correcto: false,
    revelar: fallosPrevios + 1 >= 2,
    esperada,
    explicacion: z ? `Eso es ${z.nombre.toLowerCase()}: ${z.que_es}` : '',
  };
}

// Las teclas de una ficha, listas para <kbd>: "Shift+D" → ["Shift", "D"].
export const partesTecla = (tecla) => String(tecla).split('+').map((p) => p.trim()).filter(Boolean);
