// La mascota acompaña TODA la lección (v3.4): vive en la esquina de la
// pantalla, saluda, platica (consejos, charla y datos curiosos) cada rato y
// reacciona a lo que pasa: celebra un acierto, anima tras un fallo, avisa a
// la mitad y al final de la lección, y pregunta si sigues ahí cuando no hay
// actividad. Se puede callar (queda solo el personaje) y lo recuerda.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Personaje from './Personaje';
import { EVENTO_MASCOTA, mensajesDeMascota, reaccionDeMascota } from './temas';

const CADA_MS = 24000; // cada cuánto platica sola
const VISIBLE_MS = 9000; // cuánto se queda el globo
const INACTIVO_MS = 75000; // sin tocar nada: «¿sigues ahí?»
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

function CompaneroMascota({ tema, titulo }) {
  const mascota = tema?.mascota;
  const [mensaje, setMensaje] = useState(null);
  const [callada, setCallada] = useState(leerSilencio);
  const indice = useRef(0);
  const ocultar = useRef(null);
  const yaDijo = useRef(new Set());

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

  // Al entrar a la lección: saludo con el título.
  useEffect(() => {
    if (!mascota) return undefined;
    indice.current = 0;
    yaDijo.current = new Set();
    const hola = titulo ? `${mascota.hola} Hoy toca «${titulo}».` : mascota.hola;
    const reloj = window.setTimeout(() => decir({ tipo: 'hola', texto: hola }, 11000), 900);
    return () => window.clearTimeout(reloj);
  }, [mascota, titulo, decir]);

  // Platica sola cada rato (si no está callada y la pestaña se ve).
  useEffect(() => {
    if (!mascota || callada) return undefined;
    const reloj = window.setInterval(() => {
      if (document.visibilityState === 'visible') siguiente();
    }, CADA_MS);
    return () => window.clearInterval(reloj);
  }, [mascota, callada, siguiente]);

  // Reacciones: aciertos y fallos de las actividades, y la lección terminada.
  useEffect(() => {
    if (!mascota) return undefined;
    const alAvisar = (evento) => decir(reaccionDeMascota(mascota, evento.detail?.tipo));
    window.addEventListener(EVENTO_MASCOTA, alAvisar);
    return () => window.removeEventListener(EVENTO_MASCOTA, alAvisar);
  }, [mascota, decir]);

  // A la mitad y al final de la página, una vez por lección; y si no hay actividad, pregunta.
  useEffect(() => {
    if (!mascota) return undefined;
    let pendiente = false;
    let inactivo = null;
    const reiniciar = () => {
      window.clearTimeout(inactivo);
      inactivo = window.setTimeout(() => {
        if (!yaDijo.current.has('inactivo') && document.visibilityState === 'visible') {
          yaDijo.current.add('inactivo');
          decir(reaccionDeMascota(mascota, 'inactivo'));
        }
      }, INACTIVO_MS);
    };
    const revisar = () => {
      pendiente = false;
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      if (alto < 400) return;
      const avance = window.scrollY / alto;
      for (const [tipo, desde] of [['mitad', 0.5], ['final', 0.93]]) {
        if (avance >= desde && !yaDijo.current.has(tipo)) {
          yaDijo.current.add(tipo);
          decir(reaccionDeMascota(mascota, tipo));
        }
      }
    };
    const alMover = () => {
      reiniciar();
      if (!pendiente) {
        pendiente = true;
        window.requestAnimationFrame(revisar);
      }
    };
    reiniciar();
    window.addEventListener('scroll', alMover, { passive: true });
    window.addEventListener('pointerdown', reiniciar, { passive: true });
    window.addEventListener('keydown', reiniciar);
    return () => {
      window.clearTimeout(inactivo);
      window.removeEventListener('scroll', alMover);
      window.removeEventListener('pointerdown', reiniciar);
      window.removeEventListener('keydown', reiniciar);
    };
  }, [mascota, decir]);

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
