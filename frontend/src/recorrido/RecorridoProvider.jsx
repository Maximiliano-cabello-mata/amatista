// Recorrido por la plataforma: estado (activo, parada) y la capa que lo dibuja encima de las
// páginas reales. Las paradas viven en pasos.js.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TextoEnLinea } from '../components/leccion/Markdown';
import { navegar } from '../rutas';
import { RecorridoContexto } from './contexto';
import { guardarRecorrido, leerRecorrido, necesitaNavegar, PASOS_RECORRIDO, pasoValido, TOTAL_RECORRIDO, ubicarTarjeta } from './pasos';

const ESPERA_MAX_MS = 4000;
const movimientoReducido = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

// El primer elemento visible con data-recorrido="objetivo" (la barra tiene una versión para
// escritorio y otra para móvil: se ilumina la que se ve).
function buscarObjetivo(objetivo) {
  return [...document.querySelectorAll(`[data-recorrido="${objetivo}"]`)].find((el) => el.getClientRects().length > 0) ?? null;
}

// Sigue al elemento de la parada: lo espera (la página puede estar cargando), lo centra y mide
// su caja en cada scroll o cambio de tamaño. La capa se monta de nuevo en cada parada (key).
function useObjetivo(paso, activo) {
  const [rect, setRect] = useState(null);
  const [buscando, setBuscando] = useState(true);
  useEffect(() => {
    if (!activo || !paso) return undefined;
    let vigente = true;
    let elemento = null;
    let cuadro = 0;
    const medir = () => {
      if (!vigente || !elemento) return;
      const r = elemento.getBoundingClientRect();
      // Recortada a la pantalla: el borde del foco siempre se ve.
      const top = Math.max(r.top, 6);
      const bottom = Math.min(r.bottom, window.innerHeight - 6);
      setRect({ top, bottom, left: r.left, right: r.right, width: r.width, height: Math.max(bottom - top, 0) });
    };
    const alMover = () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(medir);
    };
    const inicio = performance.now();
    const intentar = () => {
      if (!vigente) return;
      elemento = buscarObjetivo(paso.objetivo);
      if (elemento) {
        // Lo alto (la lista de módulos, la tarjeta de la fusión) se muestra desde su comienzo, bajo la barra.
        const caja = elemento.getBoundingClientRect();
        const comportamiento = movimientoReducido() ? 'auto' : 'smooth';
        if (caja.height > window.innerHeight - 320) window.scrollTo({ top: caja.top + window.scrollY - 84, behavior: comportamiento });
        else elemento.scrollIntoView({ block: 'center', behavior: comportamiento });
        setBuscando(false);
        medir();
        // El scroll suave termina después: se vuelve a medir.
        setTimeout(medir, 450);
        setTimeout(medir, 900);
        return;
      }
      if (performance.now() - inicio > ESPERA_MAX_MS) {
        setBuscando(false);
        return;
      }
      setTimeout(intentar, 120);
    };
    // La página nueva sube al inicio al cambiar de ruta (App.jsx): se busca después.
    const arranque = setTimeout(intentar, 60);
    window.addEventListener('scroll', alMover, { passive: true });
    window.addEventListener('resize', alMover);
    return () => {
      vigente = false;
      clearTimeout(arranque);
      cancelAnimationFrame(cuadro);
      window.removeEventListener('scroll', alMover);
      window.removeEventListener('resize', alMover);
    };
  }, [paso, activo]);
  return { rect, buscando };
}

const BOTON = 'corte-poly-sm px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest transition';

function CapaRecorrido({ indice, alSeguir, alVolver, alCerrar }) {
  const paso = PASOS_RECORRIDO[indice];
  const { rect, buscando } = useObjetivo(paso, true);
  const tarjeta = useRef(null);
  const [ventana, setVentana] = useState(() => ({ ancho: window.innerWidth, alto: window.innerHeight }));
  const [alto, setAlto] = useState(230);
  const ultimo = indice === TOTAL_RECORRIDO - 1;

  useEffect(() => {
    const alCambiar = () => setVentana({ ancho: window.innerWidth, alto: window.innerHeight });
    window.addEventListener('resize', alCambiar);
    return () => window.removeEventListener('resize', alCambiar);
  }, []);

  useLayoutEffect(() => {
    if (tarjeta.current) setAlto(tarjeta.current.offsetHeight);
  }, [indice, ventana.ancho]);

  // El foco va a la tarjeta en cada parada; Escape cierra y las flechas avanzan o vuelven.
  useEffect(() => {
    tarjeta.current?.focus({ preventScroll: true });
  }, [indice]);
  useEffect(() => {
    const alTeclear = (evento) => {
      if (evento.key === 'Escape') alCerrar();
      else if (evento.key === 'ArrowRight') alSeguir();
      else if (evento.key === 'ArrowLeft') alVolver();
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [alSeguir, alVolver, alCerrar]);

  const lugar = ubicarTarjeta(rect, ventana, alto);
  const estiloTarjeta =
    lugar.modo === 'debajo'
      ? { top: lugar.top, left: lugar.left, width: lugar.ancho }
      : lugar.modo === 'encima'
        ? { bottom: lugar.bottom, left: lugar.left, width: lugar.ancho }
        : lugar.modo === 'hoja'
          ? { bottom: 16, left: (ventana.ancho - lugar.ancho) / 2, width: lugar.ancho }
          : { top: '50%', left: (ventana.ancho - lugar.ancho) / 2, width: lugar.ancho, transform: 'translateY(-50%)' };
  const pad = 8;

  return (
    <div className="recorrido-capa fixed inset-0 z-50" aria-hidden={false}>
      {/* Lo de atrás no se toca durante el recorrido (un clic fuera no cierra: hay botón «Salir»). */}
      <div className="absolute inset-0" />
      {rect ? (
        <div
          className="recorrido-foco pointer-events-none fixed rounded-md border-2 border-neon"
          style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
        />
      ) : (
        <div className="pointer-events-none fixed inset-0 bg-[#05030a]/75" />
      )}
      <div
        ref={tarjeta}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recorrido-titulo"
        aria-describedby="recorrido-texto"
        tabIndex={-1}
        className="recorrido-tarjeta corte-poly-sm fixed border border-neon/50 bg-superficie p-5 shadow-2xl outline-none"
        style={estiloTarjeta}
      >
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.25em]">
          <span className="text-neon">Recorrido · {indice + 1} de {TOTAL_RECORRIDO}</span>
          <button type="button" onClick={alCerrar} className="text-white/50 hover:text-white">
            Salir ✕
          </button>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden="true">
          {PASOS_RECORRIDO.map((p, i) => (
            <span key={p.id} className={`h-1 flex-1 rounded-full ${i < indice ? 'bg-emerald-400' : i === indice ? 'bg-neon' : 'bg-white/15'}`} />
          ))}
        </div>
        <h2 id="recorrido-titulo" key={paso.id} className="animar-entrar mt-3 text-xl font-extrabold text-white">
          {paso.titulo}
        </h2>
        <p id="recorrido-texto" className="mt-1.5 text-sm leading-relaxed text-texto/85">
          <TextoEnLinea texto={paso.texto} />
        </p>
        {buscando && <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-white/40">Abriendo la página…</p>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={alVolver} disabled={indice === 0} className={`${BOTON} bg-white/5 text-white/75 hover:bg-white/10 disabled:opacity-40`}>
            ◂ Atrás
          </button>
          <button type="button" onClick={alSeguir} className={`${BOTON} destello bg-neon text-base hover:brightness-110`}>
            {ultimo ? '¡Listo! ✓' : 'Siguiente ▸'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecorridoProvider({ children }) {
  const [activo, setActivo] = useState(false);
  const [indice, setIndice] = useState(0);
  const [visto, setVisto] = useState(() => leerRecorrido().visto);

  // Cada parada abre su página (si hace falta).
  useEffect(() => {
    if (!activo) return;
    const paso = PASOS_RECORRIDO[indice];
    if (necesitaNavegar(paso, window.location.hash)) navegar(paso.ruta);
  }, [activo, indice]);

  const marcarVisto = useCallback(() => {
    setVisto(true);
    guardarRecorrido({ visto: true });
  }, []);

  const valor = useMemo(() => {
    const cerrar = () => {
      setActivo(false);
      marcarVisto();
    };
    return {
      activo,
      indice,
      visto,
      empezar: (desde = 0) => {
        setIndice(pasoValido(desde));
        setActivo(true);
      },
      siguiente: () => {
        if (indice >= TOTAL_RECORRIDO - 1) cerrar();
        else setIndice(indice + 1);
      },
      anterior: () => setIndice(pasoValido(indice - 1)),
      cerrar,
      descartar: marcarVisto,
    };
  }, [activo, indice, visto, marcarVisto]);

  return (
    <RecorridoContexto.Provider value={valor}>
      {children}
      {activo && <CapaRecorrido key={indice} indice={indice} alSeguir={valor.siguiente} alVolver={valor.anterior} alCerrar={valor.cerrar} />}
    </RecorridoContexto.Provider>
  );
}

export default RecorridoProvider;
