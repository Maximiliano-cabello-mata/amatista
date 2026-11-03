// La línea de tiempo de la película: orden, duración y cómo entra cada escena.
// La música (docs/hack4edu/video/pelicula/musica.py) lee estos mismos tiempos de linea.json.
import {
  ALaWeb, Aprender, Apertura, BlenderGuia, Cierre, ConoceAValeria, ElCamino, Geodaescena, Intercambio,
  LaPregunta, LosMuros, NoEsLaUnica, PlanDeValeria, SinConexion, Titulo, TresSemanas,
} from './escenas.jsx';

// entrada: «fundido» (cruce de 0.8 s), «barrido» (triángulos de la gema), «negro» (pasa por negro), «corte».
const LISTA = [
  { id: 'apertura', d: 9, Escena: Apertura, entrada: 'negro', acto: 1 },
  { id: 'valeria', d: 16, Escena: ConoceAValeria, entrada: 'fundido', acto: 1 },
  { id: 'muros', d: 22, Escena: LosMuros, entrada: 'barrido', acto: 1 },
  { id: 'no_es_la_unica', d: 11, Escena: NoEsLaUnica, entrada: 'negro', acto: 1 },
  { id: 'titulo', d: 9, Escena: Titulo, entrada: 'corte', acto: 1 },
  { id: 'camino', d: 18, Escena: ElCamino, entrada: 'barrido', acto: 2 },
  { id: 'aprender', d: 22, Escena: Aprender, entrada: 'fundido', acto: 2 },
  { id: 'sin_conexion', d: 17, Escena: SinConexion, entrada: 'barrido', acto: 2 },
  { id: 'pregunta', d: 8, Escena: LaPregunta, entrada: 'negro', acto: 3 },
  { id: 'geoda', d: 20, Escena: Geodaescena, entrada: 'corte', acto: 3 },
  { id: 'intercambio', d: 16, Escena: Intercambio, entrada: 'fundido', acto: 3 },
  { id: 'plan', d: 14, Escena: PlanDeValeria, entrada: 'fundido', acto: 3 },
  { id: 'blender', d: 19, Escena: BlenderGuia, entrada: 'barrido', acto: 2 },
  { id: 'web', d: 20, Escena: ALaWeb, entrada: 'barrido', acto: 2 },
  { id: 'tres_semanas', d: 18, Escena: TresSemanas, entrada: 'negro', acto: 4 },
  { id: 'cierre', d: 15, Escena: Cierre, entrada: 'fundido', acto: 4 },
];

let inicio = 0;
export const ESCENAS = LISTA.map((e) => {
  const escena = { ...e, inicio };
  inicio += e.d;
  return escena;
});
export const DURACION = inicio;
