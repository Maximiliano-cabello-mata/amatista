// Película de Hack4Edu (solo desarrollo; no entra a la PWA): http://localhost:5173/pelicula/
//   ?t=95        empieza en ese segundo           ?render   espera órdenes del renderizador
// El renderizador llama window.__pelicula.ir(t) en cada cuadro: la película es una función de t.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import '@fontsource-variable/outfit';
import '@fontsource-variable/jetbrains-mono';
import '../src/index.css';
import './pelicula.css';
import Reproductor from './Reproductor.jsx';
import { reloj } from './reloj.js';
import { DURACION, ESCENAS } from './linea.js';

const TOMAS = ['portada', 'curso', 'leccion', 'jefe', 'sin_conexion', 'mundo_ciudad', 'mundo_bosque', 'panel'];
const consulta = new URLSearchParams(location.search);
const renderizando = consulta.has('render');

window.__pelicula = {
  duracion: DURACION,
  escenas: ESCENAS.map(({ id, inicio, d, acto, entrada }) => ({ id, inicio, d, acto, entrada })),
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
    createRoot(document.getElementById('pelicula')).render(<StrictMode><Reproductor inicial={Number(consulta.get('t')) || 0} automatico={!renderizando} /></StrictMode>);
    window.__pelicula.lista = true;
  });
