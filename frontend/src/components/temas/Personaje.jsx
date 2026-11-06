// El personaje de cada módulo, vivo (v3.4): parpadea, sigue el puntero con la
// mirada, de vez en cuando se estira o da un saltito, y al tocarlo responde
// con una acción distinta cada vez (salto, giro, baile, saludo) y una lluvia
// de chispas del color del módulo.
//
// Optimización sin pérdida (TBT / 60 fps): todas las instancias de <Personaje>
// comparten un único IntersectionObserver, un único temporizador de gestos en
// reposo y un único bucle pointermove + requestAnimationFrame en dos fases
// (primero todas las lecturas getBoundingClientRect, después todas las
// escrituras CSS --mirar-x, --mirar-y, --inclinar), eliminando por completo el
// layout thrashing cuando hay varias mascotas en pantalla.
import { useCallback, useEffect, useRef, useState } from 'react';
import { SpriteMascota } from './Mascota';
import { ACCIONES_SOLAS, accionAlTocar, DURACION, mirada, REACCION } from './personajeLogica';
import { EVENTO_MASCOTA } from './temas';

function movimientoReducido() {
  if (typeof window === 'undefined') return true;
  return document.documentElement.classList.contains('ligero') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

// Registro compartido entre todas las instancias montadas de <Personaje>.
const INSTANCIAS = new Map();
let observadorCompartido = null;
let punteroActivo = false;
let cuadroMirada = null;
let ultimoPuntero = null;
let relojCompartido = null;

function asegurarObservador() {
  if (observadorCompartido || typeof IntersectionObserver === 'undefined') return observadorCompartido;
  observadorCompartido = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      const item = INSTANCIAS.get(entrada.target);
      if (item) item.visible = entrada.isIntersecting;
    }
  });
  return observadorCompartido;
}

function aplicarMiradasCompartidas() {
  cuadroMirada = null;
  if (!ultimoPuntero || document.hidden || movimientoReducido()) return;
  const { x, y } = ultimoPuntero;
  // Fase 1 (Lectura geométrica): leer todos los rectángulos antes de tocar estilos.
  const lecturas = [];
  for (const [nodo, item] of INSTANCIAS.entries()) {
    if (!item.visible || !item.mira) continue;
    const caja = nodo.getBoundingClientRect();
    lecturas.push({
      nodo,
      m: mirada(x - (caja.left + caja.width / 2), y - (caja.top + caja.height / 3)),
    });
  }
  // Fase 2 (Escritura de estilos): aplicar variables CSS en lote sin forzar reflow intermedio.
  for (const { nodo, m } of lecturas) {
    nodo.style.setProperty('--mirar-x', `${m.x}px`);
    nodo.style.setProperty('--mirar-y', `${m.y}px`);
    nodo.style.setProperty('--inclinar', `${m.inclinar}deg`);
  }
}

function alMoverPuntero(evento) {
  if (document.hidden) return;
  ultimoPuntero = { x: evento.clientX, y: evento.clientY };
  if (cuadroMirada === null) {
    cuadroMirada = window.requestAnimationFrame(aplicarMiradasCompartidas);
  }
}

function registrarInstancia(nodo, config) {
  INSTANCIAS.set(nodo, { visible: false, ...config });
  asegurarObservador()?.observe(nodo);
  if (!punteroActivo && typeof window !== 'undefined') {
    punteroActivo = true;
    window.addEventListener('pointermove', alMoverPuntero, { passive: true });
  }
  if (relojCompartido === null && typeof window !== 'undefined') {
    relojCompartido = window.setInterval(() => {
      if (document.visibilityState !== 'visible' || movimientoReducido()) return;
      const visibles = [...INSTANCIAS.values()].filter((item) => item.visible);
      if (!visibles.length || Math.random() >= 0.55) return;
      const elegido = visibles[Math.floor(Math.random() * visibles.length)];
      elegido.hacer?.(ACCIONES_SOLAS[Math.floor(Math.random() * ACCIONES_SOLAS.length)]);
    }, 10500);
  }
}

function desregistrarInstancia(nodo) {
  observadorCompartido?.unobserve(nodo);
  INSTANCIAS.delete(nodo);
  if (INSTANCIAS.size === 0 && typeof window !== 'undefined') {
    if (punteroActivo) {
      window.removeEventListener('pointermove', alMoverPuntero);
      punteroActivo = false;
    }
    if (cuadroMirada !== null) {
      window.cancelAnimationFrame(cuadroMirada);
      cuadroMirada = null;
    }
    if (relojCompartido !== null) {
      window.clearInterval(relojCompartido);
      relojCompartido = null;
    }
  }
}

function Personaje({ tema, className = '', interactivo = true, mira = true, reacciona = false, camina = false, forzar = '', onToque, etiqueta }) {
  const ref = useRef(null);
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

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return undefined;
    registrarInstancia(nodo, { mira, hacer });
    return () => desregistrarInstancia(nodo);
  }, [mira, hacer]);

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
