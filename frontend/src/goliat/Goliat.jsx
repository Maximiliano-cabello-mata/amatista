// Goliat, el compañero de toda la plataforma: vive en la esquina inferior
// izquierda de cada página (la derecha es de la mascota del módulo en las
// lecciones). Callado por defecto: solo se acerca cuando una práctica se pone
// difícil, cuando sale algo que costó o la primera vez que lo conoces. Al
// tocarlo se abre su panel: botones rápidos, una caja para escribirle y el
// proyecto propio que te ayuda a sacar paso a paso. Todo corre en el
// navegador con reglas (cerebro.js): sin servicios externos.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../auth/contexto';
import { useCatalogo } from '../catalogo/contexto';
import { cursosParaContinuar } from '../components/panel/datos';
import { useProgreso } from '../progreso/contexto';
import { useRecorrido } from '../recorrido/contexto';
import { rutas } from '../rutas';
import { porIntencion, responder } from './cerebro';
import { EVENTO_ABRIR_GOLIAT, EVENTO_GOLIAT } from './eventos';
import { estadoInicial, registrar } from './frustracion';
import GoliatFigura from './GoliatFigura';

const CLAVE_DORMIDO = 'amatista.goliat.dormido';
const CLAVE_CONOCIDO = 'amatista.goliat.conocido';
const CLAVE_PROYECTO = 'amatista.goliat.proyecto';
const AVISO_MS = 14000;
const GESTO_MS = 6000;
const MAX_MENSAJES = 8;

const RAPIDOS = [
  { texto: 'Seguir donde me quedé', intencion: 'continuar' },
  { texto: 'Idea de proyecto', intencion: 'proyecto' },
  { texto: 'Atajos de Blender', intencion: 'atajos' },
  { texto: 'Me atoré', intencion: 'atorado' },
];

function leer(clave, porDefecto) {
  try {
    const valor = window.localStorage.getItem(clave);
    return valor === null ? porDefecto : JSON.parse(valor);
  } catch {
    return porDefecto;
  }
}

function guardar(clave, valor) {
  try {
    if (valor === null) window.localStorage.removeItem(clave);
    else window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento (modo privado): dura solo esta visita.
  }
}

// Lo que Goliat sabe de la visita para responder con sentido.
function useContextoGoliat() {
  const { progreso } = useProgreso();
  const { cursos } = useCatalogo();
  const { usuario } = useAuth();
  return useMemo(() => {
    const primero = cursosParaContinuar(progreso, cursos)[0];
    const siguiente = primero?.resumen.siguiente
      ? { titulo: primero.resumen.siguiente.leccion.title, href: rutas.leccion(primero.curso.id, primero.resumen.siguiente.leccion.id) }
      : null;
    const completadas = Object.values(progreso?.lecciones ?? {}).filter((registro) => registro?.completada).length;
    const nombre = usuario?.nombre?.split(' ')[0] || null;
    return { siguiente, completadas, nombre };
  }, [progreso, cursos, usuario]);
}

function TarjetaProyecto({ proyecto, alMarcar, alSoltar }) {
  const hechos = proyecto.hechos ?? [];
  const pendiente = proyecto.pasos.find((paso) => !hechos.includes(paso.id));
  return (
    <section className="goliat-panel__proyecto" aria-label="Tu proyecto">
      <header>
        <span className="goliat-panel__antetitulo">Tu proyecto</span>
        <strong>{proyecto.titulo}</strong>
        <span className="goliat-panel__cuenta">
          {hechos.length}/{proyecto.pasos.length}
        </span>
      </header>
      <ol>
        {proyecto.pasos.map((paso) => {
          const hecho = hechos.includes(paso.id);
          return (
            <li key={paso.id} className={hecho ? 'hecho' : paso === pendiente ? 'actual' : ''}>
              <label>
                <input type="checkbox" checked={hecho} onChange={() => alMarcar(paso.id)} />
                <span>
                  {paso.texto}
                  {paso === pendiente && <small>{paso.pista}</small>}
                </span>
              </label>
            </li>
          );
        })}
      </ol>
      <button type="button" className="goliat-panel__enlace" onClick={alSoltar}>
        {pendiente ? 'Dejarlo por ahora' : 'Terminado: guardar y buscar otro'}
      </button>
    </section>
  );
}

function Goliat() {
  const contexto = useContextoGoliat();
  const { activo: recorridoActivo } = useRecorrido();
  const [abierto, setAbierto] = useState(false);
  const [dormido, setDormido] = useState(() => leer(CLAVE_DORMIDO, false));
  const [aviso, setAviso] = useState(null);
  const [gesto, setGesto] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [proyecto, setProyecto] = useState(() => leer(CLAVE_PROYECTO, null));
  const ideaPropuesta = useRef(null);
  const vueltas = useRef({});
  const animo = useRef(estadoInicial());
  const relojAviso = useRef(null);
  const relojGesto = useRef(null);
  const entrada = useRef(null);
  const lista = useRef(null);

  const ponerGesto = useCallback((nuevo) => {
    setGesto(nuevo);
    window.clearTimeout(relojGesto.current);
    relojGesto.current = window.setTimeout(() => setGesto(null), GESTO_MS);
  }, []);

  const agregar = useCallback(
    (respuesta, pregunta) => {
      setMensajes((previos) =>
        [...previos, ...(pregunta ? [{ de: 'alumno', texto: pregunta }] : []), { de: 'goliat', ...respuesta, id: `${Date.now()}-${Math.random()}` }].slice(-MAX_MENSAJES),
      );
      if (respuesta.idea) ideaPropuesta.current = respuesta.idea;
      ponerGesto(respuesta.gesto ?? 'gruñon');
    },
    [ponerGesto],
  );

  const avisar = useCallback(
    (nuevo) => {
      setAviso(nuevo);
      ponerGesto(nuevo.gesto);
      window.clearTimeout(relojAviso.current);
      relojAviso.current = window.setTimeout(() => setAviso(null), AVISO_MS);
    },
    [ponerGesto],
  );

  const pedir = useCallback(
    (intencion, etiqueta) => {
      if (intencion === 'adoptar') {
        const idea = ideaPropuesta.current;
        if (!idea) return;
        const nuevo = { id: idea.id, titulo: idea.titulo, pasos: idea.pasos, hechos: [] };
        setProyecto(nuevo);
        guardar(CLAVE_PROYECTO, nuevo);
        agregar({ gesto: 'contento', texto: `Hecho. «${idea.titulo}» queda aquí arriba con sus pasos. Marca cada uno al terminarlo; yo te digo qué sigue.`, acciones: [] }, etiqueta);
        return;
      }
      const vuelta = vueltas.current[intencion] ?? 0;
      vueltas.current[intencion] = vuelta + 1;
      agregar(porIntencion(intencion, { ...contexto, vuelta }), etiqueta);
    },
    [agregar, contexto],
  );

  const abrir = useCallback(
    (conAviso) => {
      setAbierto(true);
      setMensajes((previos) => {
        if (conAviso) return [...previos, { de: 'goliat', ...conAviso, id: `aviso-${Date.now()}` }].slice(-MAX_MENSAJES);
        if (previos.length) return previos;
        return [{ de: 'goliat', id: 'hola', ...porIntencion('saludo', contexto) }];
      });
      setAviso(null);
    },
    [contexto],
  );

  // Primera visita: se presenta una sola vez, sin abrir nada.
  useEffect(() => {
    if (leer(CLAVE_CONOCIDO, false)) return undefined;
    const reloj = window.setTimeout(() => {
      guardar(CLAVE_CONOCIDO, true);
      avisar({
        clave: 'presentacion',
        gesto: 'atento',
        texto: 'Grr… soy Goliat. No hablo mucho, pero si te atoras o quieres armar un proyecto, tócame.',
        acciones: [],
      });
    }, 2500);
    return () => window.clearTimeout(reloj);
  }, [avisar]);

  // Resultados de las prácticas y exámenes: apoyo cuando se pone difícil.
  useEffect(() => {
    const alAvisar = (evento) => {
      const { estado, aviso: nuevo } = registrar(animo.current, evento.detail ?? {});
      animo.current = estado;
      if (!nuevo) return;
      if (abierto) agregar(nuevo);
      else if (!dormido || nuevo.clave !== 'perseveraste') avisar(nuevo);
    };
    window.addEventListener(EVENTO_GOLIAT, alAvisar);
    return () => window.removeEventListener(EVENTO_GOLIAT, alAvisar);
  }, [abierto, dormido, agregar, avisar]);

  // Otras páginas lo abren con una pregunta (abrirGoliat en eventos.js).
  useEffect(() => {
    const alAbrir = (evento) => {
      abrir();
      if (evento.detail?.intencion) pedir(evento.detail.intencion);
    };
    window.addEventListener(EVENTO_ABRIR_GOLIAT, alAbrir);
    return () => window.removeEventListener(EVENTO_ABRIR_GOLIAT, alAbrir);
  }, [abrir, pedir]);

  // Escape cierra el panel; al abrirlo, el foco va a la caja de texto.
  useEffect(() => {
    if (!abierto) return undefined;
    entrada.current?.focus({ preventScroll: true });
    const alTecla = (evento) => evento.key === 'Escape' && setAbierto(false);
    window.addEventListener('keydown', alTecla);
    return () => window.removeEventListener('keydown', alTecla);
  }, [abierto]);

  // La conversación siempre muestra lo último.
  useEffect(() => {
    if (lista.current) lista.current.scrollTop = lista.current.scrollHeight;
  }, [mensajes]);

  useEffect(
    () => () => {
      window.clearTimeout(relojAviso.current);
      window.clearTimeout(relojGesto.current);
    },
    [],
  );

  if (recorridoActivo) return null;

  const enviar = (evento) => {
    evento.preventDefault();
    const pregunta = texto.trim();
    if (!pregunta) return;
    setTexto('');
    const respuesta = responder(pregunta, contexto);
    if (respuesta.intencion === 'proyecto' || respuesta.intencion === 'saludo') {
      const vuelta = vueltas.current[respuesta.intencion] ?? 0;
      vueltas.current[respuesta.intencion] = vuelta + 1;
      agregar(porIntencion(respuesta.intencion, { ...contexto, vuelta }), pregunta);
    } else {
      agregar(respuesta, pregunta);
    }
  };

  // Los botones que llevan a otra página son enlaces; los demás le preguntan a Goliat.
  const dibujarBoton = (boton) =>
    boton.href ? (
      <a key={boton.texto} href={boton.href} onClick={() => setAbierto(false)}>
        {boton.texto}
      </a>
    ) : (
      <button key={boton.texto} type="button" onClick={() => pedir(boton.intencion, boton.texto)}>
        {boton.texto}
      </button>
    );

  const marcar = (paso) => {
    const marcado = proyecto.hechos.includes(paso);
    const hechos = marcado ? proyecto.hechos.filter((id) => id !== paso) : [...proyecto.hechos, paso];
    const nuevo = { ...proyecto, hechos };
    setProyecto(nuevo);
    guardar(CLAVE_PROYECTO, nuevo);
    if (marcado) return;
    if (hechos.length === proyecto.pasos.length) {
      agregar({ gesto: 'contento', texto: `¡Terminaste «${proyecto.titulo}»! Eso ya es tuyo: nadie lo hizo igual. Guárdalo con orgullo.`, acciones: [] });
    } else {
      ponerGesto('contento');
    }
  };

  const soltar = () => {
    setProyecto(null);
    guardar(CLAVE_PROYECTO, null);
    pedir('proyecto');
  };

  const cambiarDormido = () => {
    const valor = !dormido;
    setDormido(valor);
    guardar(CLAVE_DORMIDO, valor);
    agregar(
      valor
        ? { gesto: 'dormido', texto: 'Me echo aquí. Solo me levanto si una práctica se pone fea. Si me necesitas, tócame.', acciones: [] }
        : { gesto: 'atento', texto: 'Ya desperté. Ando atento.', acciones: [] },
    );
  };

  const gestoVisible = gesto ?? (abierto ? 'atento' : dormido ? 'dormido' : 'gruñon');

  // En <body>: la página anima su entrada con transform y eso rompería position: fixed.
  return createPortal(
    <aside className={`goliat-zona ${abierto ? 'goliat-zona--abierta' : ''}`} aria-label="Goliat, tu compañero">
      {abierto && (
        <section className="goliat-panel" role="dialog" aria-modal="false" aria-labelledby="goliat-titulo">
          <header className="goliat-panel__cabeza">
            <GoliatFigura gesto={gestoVisible} className="goliat-panel__retrato" />
            <div className="min-w-0 flex-1">
              <span className="goliat-panel__antetitulo">Tu compañero</span>
              <h2 id="goliat-titulo">Goliat</h2>
            </div>
            <button type="button" className="goliat-panel__enlace" onClick={cambiarDormido}>
              {dormido ? 'Despertar' : 'A dormir'}
            </button>
            <button type="button" className="goliat-panel__cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar a Goliat">
              ✕
            </button>
          </header>

          <div className="goliat-panel__cuerpo" ref={lista}>
            {proyecto && <TarjetaProyecto proyecto={proyecto} alMarcar={marcar} alSoltar={soltar} />}

            <ol className="goliat-panel__mensajes" aria-live="polite">
              {mensajes.map((mensaje, i) => (
                <li key={mensaje.id ?? `p-${i}`} className={`goliat-mensaje goliat-mensaje--${mensaje.de}`}>
                  <p>{mensaje.texto}</p>
                  {mensaje.acciones?.length > 0 && (
                    <span className="goliat-mensaje__acciones">
                      {mensaje.acciones.map(dibujarBoton)}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div className="goliat-panel__rapidos">
            {RAPIDOS.map(dibujarBoton)}
          </div>

          <form className="goliat-panel__escribir" onSubmit={enviar}>
            <label htmlFor="goliat-pregunta" className="sr-only">
              Escríbele a Goliat
            </label>
            <input
              id="goliat-pregunta"
              ref={entrada}
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder="¿Cómo extruyo? · Me atoré · Dame una idea"
              autoComplete="off"
              maxLength={160}
            />
            <button type="submit" aria-label="Enviar">
              ▶
            </button>
          </form>
        </section>
      )}

      {!abierto && aviso && (
        <div key={aviso.clave} className="goliat-aviso" role="status">
          <span className="goliat-aviso__quien">Goliat</span>
          <p>{aviso.texto}</p>
          <span className="goliat-aviso__acciones">
            <button type="button" onClick={() => abrir(aviso)}>
              Hablar ▸
            </button>
            <button type="button" onClick={() => setAviso(null)} aria-label="Cerrar el aviso">
              ✕
            </button>
          </span>
        </div>
      )}

      <button
        type="button"
        className="goliat-boton"
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        aria-expanded={abierto}
        aria-label={abierto ? 'Cerrar a Goliat' : 'Abrir a Goliat, tu compañero'}
      >
        <GoliatFigura gesto={gestoVisible} className="goliat-boton__figura" />
        <span className="goliat-boton__nombre">Goliat</span>
      </button>
    </aside>,
    document.body,
  );
}

export default Goliat;
