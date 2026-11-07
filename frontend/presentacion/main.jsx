// Presentación de Hack4Edu (solo desarrollo; no entra a la PWA): http://localhost:5173/presentacion/
//   ?t=95   empieza en ese segundo del video      ?render   espera órdenes del renderizador
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import '@fontsource-variable/outfit';
import '@fontsource-variable/jetbrains-mono';
import '../src/index.css';
import './presentacion.css';
import Presentacion from './Presentacion.jsx';
import { ESCENAS, reloj } from './linea.js';
import { DURACION, PRE } from './tiempos.js';

const TOMAS = ['mundo_ciudad_s', 'sin_conexion_s', 'portada_s', 'curso_s', 'leccion_s', 'ciudad_s', 'jefe_s', 'panel_s'];
const consulta = new URLSearchParams(location.search);
const renderizando = consulta.has('render');

window.__pelicula = {
  duracion: DURACION,
  escenas: ESCENAS.map(({ id, desde, hasta }) => ({ id, inicio: desde + PRE, d: hasta - desde })),
  async ir(segundo) {
    flushSync(() => reloj.fijar(segundo));
    for (const animacion of document.getAnimations()) {
      animacion.pause();
      animacion.currentTime = segundo * 1000;
    }
    await Promise.all([...document.images].filter((img) => !img.complete).map((img) => img.decode().catch(() => {})));
    await document.fonts.ready;
  },
};

Promise.all(TOMAS.map((toma) => fetch(`/pelicula/media/${toma}/toma.json`).then((r) => r.json()).then((d) => [toma, d.cuadros]).catch(() => [toma, 1])))
  .then((pares) => {
    window.__tomas = Object.fromEntries(pares);
    createRoot(document.getElementById('presentacion')).render(
      <StrictMode><Presentacion inicial={Number(consulta.get('t')) || 0} automatico={!renderizando} /></StrictMode>,
    );
    window.__pelicula.lista = true;
  });
