// El personaje de cada módulo, vivo (v3.4): parpadea, sigue el puntero con la
// mirada, de vez en cuando se estira o da un saltito, y al tocarlo responde
// con una acción distinta cada vez (salto, giro, baile, saludo) y una lluvia
// de chispas del color del módulo. Con `reacciona` celebra los aciertos, se
// entristece con un fallo y da una voltereta al terminar la lección. Con
// `camina` recorre el escenario de su módulo de un lado a otro.
//
// Solo anima transform y opacity. El seguimiento del puntero escribe dos
// variables CSS (sin volver a dibujar React) y se apaga fuera de pantalla, en
// modo ligero y con «reducir movimiento».
import { useCallback, useEffect, useRef, useState } from 'react';
import { SpriteMascota } from './Mascota';
import { ACCIONES_SOLAS, accionAlTocar, DURACION, mirada, REACCION } from './personaje';
import { EVENTO_MASCOTA } from './temas';

function movimientoReducido() {
  if (typeof window === 'undefined') return true;
  return document.documentElement.classList.contains('ligero') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function Personaje({ tema, className = '', interactivo = true, mira = true, reacciona = false, camina = false, forzar = '', onToque, etiqueta }) {
  const ref = useRef(null);
  const visible = useRef(false);
  const relojAccion = useRef(null);
  const [accion, setAccion] = useState({ nombre: '', clave: 0 });
  const [chispas, setChispas] = useState([]);

  const hacer = useCallback((nombre) => {
    if (!nombre) return;
    setAccion({ nombre, clave: Date.now() });
    window.clearTimeout(relojAccion.current);
    relojAccion.current = window.setTimeout(() => setAccion((a) => ({ ...a, nombre: '' })), DURACION[nombre] ?? 900);
  }, []);

  const lluvia = useCallback((cuantas = 7) => {
    const clave = Date.now();
    setChispas(
      Array.from({ length: cuantas }, (_, i) => {
        const angulo = (i / cuantas) * Math.PI * 2 + Math.random() * 0.5;
        const largo = 26 + Math.random() * 18;
        return { id: `${clave}-${i}`, dx: Math.cos(angulo) * largo, dy: Math.sin(angulo) * largo - 14 };
      }),
    );
    window.setTimeout(() => setChispas([]), 800);
  }, []);

  // Solo trabaja mientras se ve en pantalla.
  useEffect(() => {
    const nodo = ref.current;
    if (!nodo || typeof IntersectionObserver === 'undefined') return undefined;
    const observador = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; });
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  // La mirada sigue al puntero (una vez por cuadro como mucho).
  useEffect(() => {
    if (!mira || movimientoReducido()) return undefined;
    let pendiente = null;
    let ultimo = null;
    const aplicar = () => {
      pendiente = null;
      const nodo = ref.current;
      if (!nodo || !visible.current || !ultimo) return;
      const caja = nodo.getBoundingClientRect();
      const m = mirada(ultimo.x - (caja.left + caja.width / 2), ultimo.y - (caja.top + caja.height / 3));
      nodo.style.setProperty('--mirar-x', `${m.x}px`);
      nodo.style.setProperty('--mirar-y', `${m.y}px`);
      nodo.style.setProperty('--inclinar', `${m.inclinar}deg`);
    };
    const alMover = (e) => {
      ultimo = { x: e.clientX, y: e.clientY };
      if (pendiente === null) pendiente = window.requestAnimationFrame(aplicar);
    };
    window.addEventListener('pointermove', alMover, { passive: true });
    return () => {
      window.removeEventListener('pointermove', alMover);
      if (pendiente !== null) window.cancelAnimationFrame(pendiente);
    };
  }, [mira]);

  // Solo, de vez en cuando: mira alrededor, da un saltito o se estira.
  useEffect(() => {
    if (movimientoReducido()) return undefined;
    const reloj = window.setInterval(() => {
      if (visible.current && document.visibilityState === 'visible' && Math.random() < 0.6) {
        hacer(ACCIONES_SOLAS[Math.floor(Math.random() * ACCIONES_SOLAS.length)]);
      }
    }, 9000 + Math.round(Math.random() * 4000));
    return () => window.clearInterval(reloj);
  }, [hacer]);

  // Reacciona a la lección (aciertos, fallos, mitad y final).
  useEffect(() => {
    if (!reacciona) return undefined;
    const alAvisar = (evento) => {
      const tipo = evento.detail?.tipo;
      hacer(REACCION[tipo]);
      if (tipo === 'acierto') lluvia(6);
      if (tipo === 'final') lluvia(12);
    };
    window.addEventListener(EVENTO_MASCOTA, alAvisar);
    return () => window.removeEventListener(EVENTO_MASCOTA, alAvisar);
  }, [reacciona, hacer, lluvia]);

  useEffect(() => () => window.clearTimeout(relojAccion.current), []);

  const tocar = () => {
    const nueva = accionAlTocar(accion.nombre);
    hacer(nueva);
    lluvia();
    onToque?.(nueva);
  };

  const Etiqueta = interactivo ? 'button' : 'span';
  const props = interactivo
    ? { type: 'button', onClick: tocar, 'aria-label': etiqueta ?? `Tocar a ${tema?.mascota?.nombre ?? 'tu guía'}` }
    : { 'aria-hidden': true };
  // `forzar`: una acción pedida desde fuera mientras dure (el examen: golpe al jefe).
  const actual = forzar || accion.nombre;
  const clases = ['personaje', camina && 'personaje--camina', actual && `personaje--${actual}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Etiqueta ref={ref} className={clases} style={{ '--acento': tema?.colores?.acento }} {...props}>
      <span className="personaje__sombra" aria-hidden="true" />
      <span className="personaje__paso">
        <span key={`${accion.clave}-${forzar}`} className="personaje__accion">
          <SpriteMascota tema={tema} className="personaje__sprite" />
        </span>
      </span>
      {chispas.map((c) => (
        <span key={c.id} className="personaje__chispa" style={{ '--dx': `${c.dx}px`, '--dy': `${c.dy}px` }} aria-hidden="true" />
      ))}
    </Etiqueta>
  );
}

// El personaje recorre su carril de un lado a otro (se detiene si lo tocas o
// pasas el puntero encima). El carril ocupa el ancho de su contenedor.
export function Paseo({ tema, className = '', onToque, etiqueta }) {
  return (
    <div className={`paseo ${className}`}>
      <div className="paseo__andar">
        <div className="paseo__voltear">
          <Personaje tema={tema} camina onToque={onToque} etiqueta={etiqueta} />
        </div>
      </div>
    </div>
  );
}

export default Personaje;
