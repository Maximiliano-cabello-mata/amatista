// La mascota acompaña la lección desde la esquina, sin interrumpir (v4.4):
// ya no platica sola ni pregunta si sigues ahí. Habla cuando la tocas (cada
// toque, un consejo o un dato distinto), anima tras ver una solución y
// festeja al terminar la lección. Se puede callar y lo recuerda.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Personaje from './Personaje';
import { EVENTO_MASCOTA, mensajesDeMascota, reaccionDeMascota } from './temas';

const VISIBLE_MS = 9000; // cuánto se queda el globo
const CLAVE_SILENCIO = 'amatista.mascota.callada';

const ETIQUETA = {
  hola: 'dice',
  consejo: 'te aconseja',
  charla: 'platica',
  dato: '· dato curioso',
  acierto: '¡celebra!',
  fallo: 'te anima',
  mitad: 'te cuenta',
  final: '¡festeja!',
  inactivo: 'pregunta',
};

function leerSilencio() {
  try {
    return window.localStorage.getItem(CLAVE_SILENCIO) === '1';
  } catch {
    return false;
  }
}

function guardarSilencio(valor) {
  try {
    window.localStorage.setItem(CLAVE_SILENCIO, valor ? '1' : '0');
  } catch {
    // Sin almacenamiento (modo privado): solo dura esta visita.
  }
}

function CompaneroMascota({ tema }) {
  const mascota = tema?.mascota;
  const [mensaje, setMensaje] = useState(null);
  const [callada, setCallada] = useState(leerSilencio);
  const indice = useRef(0);
  const ocultar = useRef(null);

  const decir = useCallback((nuevo, ms = VISIBLE_MS) => {
    if (!nuevo) return;
    setMensaje({ ...nuevo, clave: Date.now() });
    window.clearTimeout(ocultar.current);
    ocultar.current = window.setTimeout(() => setMensaje(null), ms);
  }, []);

  const siguiente = useCallback(() => {
    const lista = mensajesDeMascota(mascota);
    if (!lista.length) return;
    // El saludo solo al llegar; después da la vuelta por consejos, charla y datos.
    indice.current = indice.current % (lista.length - 1 || 1) + 1;
    decir(lista[Math.min(indice.current, lista.length - 1)]);
  }, [mascota, decir]);

  // Solo dos momentos hablan solos: tras ver una solución (ánimo) y al
  // terminar la lección. Los aciertos ya se celebran en la actividad.
  useEffect(() => {
    if (!mascota || callada) return undefined;
    const alAvisar = (evento) => {
      const tipo = evento.detail?.tipo;
      if (tipo === 'fallo' || tipo === 'final') decir(reaccionDeMascota(mascota, tipo));
    };
    window.addEventListener(EVENTO_MASCOTA, alAvisar);
    return () => window.removeEventListener(EVENTO_MASCOTA, alAvisar);
  }, [mascota, callada, decir]);

  useEffect(() => () => window.clearTimeout(ocultar.current), []);

  if (!mascota) return null;

  const cambiarSilencio = () => {
    const valor = !callada;
    setCallada(valor);
    guardarSilencio(valor);
    if (valor) setMensaje(null);
    else decir({ tipo: 'charla', texto: `¡Volví! Te sigo acompañando, soy ${mascota.nombre}.` });
  };

  // En <body>: la página anima su entrada con transform y eso rompería position: fixed.
  return createPortal(
    <aside className="companero" style={{ '--acento': tema.colores?.acento }} aria-label={`${mascota.nombre}, tu guía del módulo`}>
      <div className="companero__globo-zona" aria-live="polite">
        {mensaje && (
          <div key={mensaje.clave} className="companero__globo globo">
            <span className="companero__quien">
              {mascota.nombre} {ETIQUETA[mensaje.tipo] ?? 'dice'}
            </span>
            <p>{mensaje.texto}</p>
            <span className="companero__acciones">
              <button type="button" onClick={siguiente}>
                Otro ▸
              </button>
              <button type="button" onClick={() => setMensaje(null)} aria-label="Cerrar el mensaje">
                ✕
              </button>
            </span>
          </div>
        )}
      </div>
      <div className="companero__cuerpo">
        {/* Al tocarlo hace algo distinto cada vez y cuenta otra cosa; reacciona solo a la lección. */}
        <Personaje
          tema={tema}
          reacciona
          className="companero__personaje"
          onToque={siguiente}
          etiqueta={`Hablar con ${mascota.nombre}`}
        />
        <button type="button" className="companero__silencio" onClick={cambiarSilencio}>
          {callada ? 'Que platique' : 'Callar'}
        </button>
      </div>
    </aside>,
    document.body,
  );
}

export default CompaneroMascota;
