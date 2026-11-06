// Línea de tiempo: escenas en segundos de la voz (v = t − PRE).
import * as E from './escenas.jsx';
import { FIN, HUECO, PRE, VOZ, aLinea } from './tiempos.js';

// El renderizador cambia el tiempo desde fuera de React (main.jsx › window.__pelicula.ir).
export const reloj = { fijar: () => {} };

const FIN_V = VOZ + FIN;
// desde/hasta en segundos de la voz; abajo se pasan a la línea (con el hueco de la historia).
const EN_VOZ = [
  { id: 'apertura', tono: 0.3, Escena: E.Apertura, desde: -PRE, hasta: 8.1 },
  { id: 'reto', Escena: E.Reto, desde: 8.1, hasta: 35 },
  { id: 'brecha', Escena: E.Brecha, desde: 35, hasta: 60.2 },
  { id: 'colapso', tono: -0.2, Escena: E.Colapso, desde: 60.2, hasta: 78.1 },
  { id: 'historia', tono: -0.1, Escena: E.Historia, desde: 'h0', hasta: 'h1', barrido: true },
  { id: 'amatista', tono: 0.6, Escena: E.Amatista, desde: 78.1, hasta: 90.2, barrido: true },
  { id: 'pwa', Escena: E.Pwa, desde: 90.2, hasta: 106.3 },
  { id: 'blender', Escena: E.Blender, desde: 106.3, hasta: 125.3 },
  { id: 'geoda', tono: 0.2, Escena: E.GeodaEscena, desde: 125.3, hasta: 144.1 },
  { id: 'sin-conexion', tono: -0.1, Escena: E.SinConexion, desde: 144.1, hasta: 155.3, barrido: true },
  { id: 'sincroniza', Escena: E.Sincroniza, desde: 155.3, hasta: 171.5 },
  { id: 'profesor', Escena: E.Profesor, desde: 171.5, hasta: 177 },
  { id: 'inclusion', tono: 0.3, Escena: E.Inclusion, desde: 177, hasta: 192.6, barrido: true },
  { id: 'piloto', Escena: E.Piloto, desde: 192.6, hasta: 210.1 },
  { id: 'mercado', tono: 0.4, Escena: E.Mercado, desde: 210.1, hasta: 223.6 },
  { id: 'cierre', tono: 0.2, Escena: E.Cierre, desde: 223.6, hasta: FIN_V },
];

export const ESCENAS = EN_VOZ.map((e) => ({
  ...e,
  desde: e.desde === 'h0' ? HUECO.en : aLinea(e.desde),
  hasta: e.hasta === 'h1' ? HUECO.en + HUECO.d : e.hasta === HUECO.en ? HUECO.en : aLinea(e.hasta),
}));
