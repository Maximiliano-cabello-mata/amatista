// Línea de tiempo: escenas en segundos de la voz original (los cortes los resuelve el montaje).
import * as E from './escenas.jsx';
import { FIN, PRE, VOZ } from './tiempos.js';

// El renderizador cambia el tiempo desde fuera de React (main.jsx › window.__pelicula.ir).
export const reloj = { fijar: () => {} };

const FIN_V = VOZ + FIN;

// desde/hasta en segundos de la voz (negativos: antes de que empiece la voz).
const EN_VOZ = [
  { id: 'intro', tono: 0.1, Escena: E.Intro, desde: -PRE, hasta: -3 },
  { id: 'apertura', tono: 0.3, Escena: E.Apertura, desde: -3, hasta: 8.1, barrido: true },
  { id: 'reto', Escena: E.Reto, desde: 8.1, hasta: 35 },
  { id: 'brecha', tono: -0.15, Escena: E.Brecha, desde: 35, hasta: 60.2 },
  { id: 'colapso', tono: -0.35, Escena: E.Colapso, desde: 60.2, hasta: 78.1 },
  { id: 'amatista', tono: 0.6, Escena: E.Amatista, desde: 78.1, hasta: 90.2, barrido: true },
  { id: 'pwa', tono: 0.15, Escena: E.Pwa, desde: 90.2, hasta: 106.25 },
  { id: 'blender', tono: 0.15, Escena: E.Blender, desde: 106.25, hasta: 126.4 },
  { id: 'geoda', tono: 0.25, Escena: E.GeodaEscena, desde: 126.4, hasta: 144.1 },
  { id: 'sin-conexion', tono: -0.1, Escena: E.SinConexion, desde: 144.1, hasta: 155.3, barrido: true },
  { id: 'sincroniza', Escena: E.Sincroniza, desde: 155.3, hasta: 169.2 },
  { id: 'profesor', Escena: E.Profesor, desde: 169.2, hasta: 177 },
  { id: 'inclusion', tono: 0.3, Escena: E.Inclusion, desde: 177, hasta: 189.9, barrido: true },
  { id: 'piloto', Escena: E.Piloto, desde: 189.9, hasta: 210.1 },
  { id: 'mercado', tono: 0.4, Escena: E.Mercado, desde: 210.1, hasta: 223.6 },
  { id: 'cierre', tono: 0.2, Escena: E.Cierre, desde: 223.6, hasta: FIN_V },
];

// Psicología de color por momento: matiz (luz principal) y acento (segunda luz).
//   problema: violeta apagado y alerta magenta
//   solución: amatista brillante con cian (tecnología) · Geoda: cian · sincronía: índigo sereno
//   inclusión: lavanda cálida con magenta · cierre: la gema completa
const AMATISTA = [155, 89, 182];
const CIAN = [0, 229, 255];
const COLOR = {
  intro: [[140, 90, 200], CIAN], apertura: [AMATISTA, CIAN], reto: [[140, 90, 190], CIAN],
  brecha: [[105, 95, 135], [255, 111, 174]], colapso: [[95, 85, 120], [255, 90, 120]],
  amatista: [[180, 105, 220], CIAN], pwa: [AMATISTA, CIAN], 'demo-web': [[120, 90, 200], CIAN],
  blender: [AMATISTA, CIAN], 'demo-addon': [[120, 90, 200], CIAN], geoda: [[0, 160, 200], [180, 105, 220]],
  'sin-conexion': [[90, 80, 170], CIAN], sincroniza: [[80, 90, 180], CIAN], profesor: [[90, 80, 170], CIAN],
  inclusion: [[210, 120, 200], [255, 111, 174]], piloto: [[200, 115, 200], [255, 111, 174]],
  mercado: [AMATISTA, CIAN], cierre: [[180, 105, 220], [255, 111, 174]],
};

// Las escenas viven en segundos de la voz original; el montaje elige cuál se ve según ese segundo.
// Donde hay un corte, el cambio de escena cae DENTRO del tramo quitado: así cada lado del fundido tiene su
// escena completa y nada se ve vacío.
export const ESCENAS = EN_VOZ.map((e) => ({ ...e, matiz: COLOR[e.id][0], acento: COLOR[e.id][1] }));
