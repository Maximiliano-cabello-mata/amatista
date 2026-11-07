// Línea de tiempo: escenas en segundos de la voz (seguida, sin pausas). Antes va el prólogo y la gema.
import * as E from './escenas.jsx';
import { FIN, PAUSAS, PRE, VOZ, aLinea, inicioPausa } from './tiempos.js';

// El renderizador cambia el tiempo desde fuera de React (main.jsx › window.__pelicula.ir).
export const reloj = { fijar: () => {} };

const FIN_V = VOZ + FIN;

// desde/hasta en segundos de la voz (negativos: antes de que empiece la voz).
const EN_VOZ = [
  { id: 'historia', tono: -0.05, Escena: E.Historia, desde: -PRE, hasta: -4 },
  { id: 'apertura', tono: 0.3, Escena: E.Apertura, desde: -4, hasta: 8.1, barrido: true },
  { id: 'reto', Escena: E.Reto, desde: 8.1, hasta: 35 },
  { id: 'brecha', tono: -0.15, Escena: E.Brecha, desde: 35, hasta: 60.2 },
  { id: 'colapso', tono: -0.35, Escena: E.Colapso, desde: 60.2, hasta: 78.1 },
  { id: 'amatista', tono: 0.6, Escena: E.Amatista, desde: 78.1, hasta: 90.2, barrido: true },
  { id: 'pwa', tono: 0.15, Escena: E.Pwa, desde: 90.2, hasta: 106.25 },
  { id: 'blender', tono: 0.15, Escena: E.Blender, desde: 106.25, hasta: 125.25 },
  { id: 'geoda', tono: 0.25, Escena: E.GeodaEscena, desde: 125.25, hasta: 144.1 },
  { id: 'sin-conexion', tono: -0.1, Escena: E.SinConexion, desde: 144.1, hasta: 155.3, barrido: true },
  { id: 'sincroniza', Escena: E.Sincroniza, desde: 155.3, hasta: 171.5 },
  { id: 'profesor', Escena: E.Profesor, desde: 171.5, hasta: 177 },
  { id: 'inclusion', tono: 0.3, Escena: E.Inclusion, desde: 177, hasta: 192.6, barrido: true },
  { id: 'piloto', Escena: E.Piloto, desde: 192.6, hasta: 210.1 },
  { id: 'mercado', tono: 0.4, Escena: E.Mercado, desde: 210.1, hasta: 223.6 },
  { id: 'cierre', tono: 0.2, Escena: E.Cierre, desde: 223.6, hasta: FIN_V },
];

// Psicología de color por momento: matiz (luz principal) y acento (segunda luz).
//   problema: violeta apagado y alerta magenta · historia: magenta cálido (lo humano)
//   solución: amatista brillante con cian (tecnología) · Geoda: cian · sincronía: índigo sereno
//   inclusión: lavanda cálida con magenta · cierre: la gema completa
const AMATISTA = [155, 89, 182];
const CIAN = [0, 229, 255];
const COLOR = {
  apertura: [AMATISTA, CIAN], reto: [[140, 90, 190], CIAN],
  brecha: [[105, 95, 135], [255, 111, 174]], colapso: [[95, 85, 120], [255, 90, 120]],
  historia: [[255, 111, 174], [195, 155, 211]],
  amatista: [[180, 105, 220], CIAN], pwa: [AMATISTA, CIAN], 'demo-web': [[120, 90, 200], CIAN],
  blender: [AMATISTA, CIAN], 'demo-addon': [[120, 90, 200], CIAN], geoda: [[0, 160, 200], [180, 105, 220]],
  'sin-conexion': [[90, 80, 170], CIAN], sincroniza: [[80, 90, 180], CIAN], profesor: [[90, 80, 170], CIAN],
  inclusion: [[210, 120, 200], [255, 111, 174]], piloto: [[200, 115, 200], [255, 111, 174]],
  mercado: [AMATISTA, CIAN], cierre: [[180, 105, 220], [255, 111, 174]],
};

const hastaEnLinea = (v) => {
  const p = PAUSAS.find((q) => q.en === v);
  return p ? inicioPausa(p) : aLinea(v);
};

// Sin pausas, la línea es la voz: las escenas se usan tal cual.
export const ESCENAS = EN_VOZ.map((e) => ({ ...e, matiz: COLOR[e.id][0], acento: COLOR[e.id][1], desde: aLinea(e.desde), hasta: hastaEnLinea(e.hasta) }));
