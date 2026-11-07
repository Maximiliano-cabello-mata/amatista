// Línea de tiempo: escenas en segundos de la voz, pasadas a la línea (la voz más las pausas con música).
import * as E from './escenas.jsx';
import { FIN, PAUSAS, PRE, VOZ, aLinea, inicioPausa } from './tiempos.js';

// El renderizador cambia el tiempo desde fuera de React (main.jsx › window.__pelicula.ir).
export const reloj = { fijar: () => {} };

const FIN_V = VOZ + FIN;
const PAUSA = Object.fromEntries(PAUSAS.map((p) => [p.id, p]));
const ESCENA_PAUSA = { historia: E.Historia, 'demo-web': E.DemoWeb, 'demo-addon': E.DemoAddon };

// desde/hasta en segundos de la voz. Una escena que termina donde empieza una pausa se corta ahí.
const EN_VOZ = [
  { id: 'apertura', tono: 0.3, Escena: E.Apertura, desde: -PRE, hasta: 8.1 },
  { id: 'reto', Escena: E.Reto, desde: 8.1, hasta: 35 },
  { id: 'brecha', tono: -0.15, Escena: E.Brecha, desde: 35, hasta: 60.2 },
  { id: 'colapso', tono: -0.35, Escena: E.Colapso, desde: 60.2, hasta: 78.1 },
  { pausa: 'historia' },
  { id: 'amatista', tono: 0.6, Escena: E.Amatista, desde: 78.1, hasta: 90.2, barrido: true },
  { id: 'pwa', tono: 0.15, Escena: E.Pwa, desde: 90.2, hasta: 106.25 },
  { pausa: 'demo-web' },
  { id: 'blender', tono: 0.15, Escena: E.Blender, desde: 106.25, hasta: 125.25, barrido: true },
  { pausa: 'demo-addon' },
  { id: 'geoda', tono: 0.25, Escena: E.GeodaEscena, desde: 125.25, hasta: 144.1, barrido: true },
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

export const ESCENAS = EN_VOZ.map((e) => {
  if (e.pausa) {
    const p = PAUSA[e.pausa];
    return { matiz: COLOR[p.id][0], acento: COLOR[p.id][1], id: p.id, tono: p.id === 'historia' ? -0.05 : 0.2, Escena: ESCENA_PAUSA[p.id], desde: inicioPausa(p), hasta: inicioPausa(p) + p.d, barrido: true, pausa: true };
  }
  return { ...e, matiz: COLOR[e.id][0], acento: COLOR[e.id][1], desde: aLinea(e.desde), hasta: hastaEnLinea(e.hasta) };
});
