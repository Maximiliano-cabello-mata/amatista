// Buzón del creador (#/buzon): el alumno le escribe a Maximiliano sobre algo
// concreto (un error, una idea, el contenido) y sigue la conversación aquí.
// El pavo real del creador abre la cola cuando empiezas a escribir y hace una
// reverencia de gracias al enviar. Nada de avisos: las respuestas se ven al
// volver a esta página (y en el menú de la cuenta).
// Servidor: /api/buzon (backend/api/buzon.py, script 013).
import { useEffect, useId, useState } from 'react';
import { useAuth } from '../auth/contexto';
import { useAvatar } from '../avatares/contexto';
import PavoReal from '../avatares/PavoReal';
import { CATEGORIAS, datosCategoria, ESTADOS, MAX_TEXTO, NOMBRE_CREADOR } from '../buzon/catalogo';
import Hilo from '../buzon/Hilo';
import Pagina from '../components/estructura/Pagina';
import TituloSeccion from '../components/estructura/TituloSeccion';
import { rutaEntrar, rutas } from '../rutas';
import { enviarSugerencia, listarSugerencias, marcarSugerenciaLeida, responderSugerencia } from '../services/api';

const CONTROL =
  'corte-poly-sm w-full border border-white/10 bg-base/70 px-3 py-2.5 text-texto placeholder:text-white/30 focus:border-neon focus:outline-none';

const FRASES = {
  quieto: 'Cuéntame qué encontraste. Leo cada mensaje.',
  abierto: 'Te escucho. Entre más concreto, mejor lo arreglo.',
  gracias: '¡Gracias! Con esto Amatista mejora. Te respondo aquí mismo.',
};

const fecha = (iso) => new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long' });

// La página de origen llega como ?desde=#/curso/... ; se guarda tal cual.
const paginaDesde = (consulta) => (consulta?.desde && consulta.desde.startsWith('#/') ? consulta.desde.slice(0, 200) : '');

function MensajeServidor({ respuesta }) {
  if (!respuesta || respuesta.ok) return null;
  const texto =
    respuesta.status === 503
      ? 'El buzón se está preparando en el servidor. Vuelve a intentarlo en un rato.'
      : respuesta.status === 0
        ? 'Sin conexión: el buzón necesita internet para llegar al creador.'
        : respuesta.error || 'No se pudo completar. Inténtalo de nuevo.';
  return (
    <p role="alert" className="corte-poly-sm border border-red-400/50 bg-red-400/10 px-4 py-3 text-sm text-red-200">
      {texto}
    </p>
  );
}

function Escenario({ gesto, vuelta }) {
  return (
    <div className="flex flex-col items-center gap-3 sm:w-56 sm:shrink-0">
      <PavoReal key={vuelta} gesto={gesto} className="h-44 w-44" titulo={`El pavo real de ${NOMBRE_CREADOR}, el creador de Amatista`} />
      <p className="corte-poly-sm relative border border-amatista/40 bg-amatista/10 px-3 py-2 text-center text-sm text-texto" aria-live="polite">
        {FRASES[gesto]}
      </p>
    </div>
  );
}

function Formulario({ token, desde, alEnviar, alEscribir }) {
  const id = useId();
  const [categoria, setCategoria] = useState('error');
  const [texto, setTexto] = useState('');
  const [pagina, setPagina] = useState(desde);
  const [enviando, setEnviando] = useState(false);
  const [fallo, setFallo] = useState(null);

  const enviar = async (evento) => {
    evento.preventDefault();
    if (texto.trim().length < 3) {
      setFallo({ ok: false, status: 422, error: 'Escribe al menos unas palabras.' });
      return;
    }
    setEnviando(true);
    setFallo(null);
    const respuesta = await enviarSugerencia(token, { categoria, texto: texto.trim(), pagina: pagina.trim() || null });
    setEnviando(false);
    if (!respuesta.ok) {
      setFallo(respuesta);
      return;
    }
    setTexto('');
    alEnviar(respuesta.datos);
  };

  return (
    <form noValidate onSubmit={enviar} className="grid min-w-0 flex-1 gap-4">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-white">¿De qué se trata?</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CATEGORIAS.map((c) => (
            <label key={c.id} className="avatar-opcion corte-poly-sm cursor-pointer border border-white/10 bg-white/[0.03] px-3 py-2">
              <input type="radio" name="categoria" value={c.id} checked={categoria === c.id} onChange={() => setCategoria(c.id)} className="sr-only" />
              <span className="block text-sm font-bold text-white">
                <span className="mr-1 text-neon" aria-hidden="true">
                  {c.icono}
                </span>
                {c.texto}
              </span>
              <span className="block text-[11px] leading-tight text-white/50">{c.ayuda}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor={`${id}-texto`} className="mb-1.5 block text-sm font-semibold text-white">
          Tu mensaje para {NOMBRE_CREADOR}
        </label>
        <textarea
          id={`${id}-texto`}
          rows={5}
          maxLength={MAX_TEXTO}
          value={texto}
          onChange={(evento) => {
            setTexto(evento.target.value);
            alEscribir();
          }}
          aria-describedby={`${id}-cuenta`}
          placeholder="Por ejemplo: en el módulo 3, el botón «Comprobar» no responde cuando…"
          className={`${CONTROL} resize-y`}
        />
        <p id={`${id}-cuenta`} className="mt-1 text-right font-mono text-[11px] text-white/40">
          {texto.length}/{MAX_TEXTO}
        </p>
      </div>
      <div>
        <label htmlFor={`${id}-pagina`} className="mb-1.5 block text-sm font-semibold text-white">
          ¿Dónde pasó? <span className="font-normal text-white/50">(opcional)</span>
        </label>
        <input
          id={`${id}-pagina`}
          maxLength={200}
          value={pagina}
          onChange={(evento) => setPagina(evento.target.value)}
          placeholder="La lección, la práctica o la página"
          className={CONTROL}
        />
      </div>
      <MensajeServidor respuesta={fallo} />
      <button type="submit" disabled={enviando} className="boton boton--grande destello bg-amatista text-white hover:brightness-110 disabled:opacity-60">
        {enviando ? 'Enviando…' : `Enviar a ${NOMBRE_CREADOR} ▸`}
      </button>
    </form>
  );
}

function Conversacion({ conversacion, alumno, token, alCambiar }) {
  const [abierta, setAbierta] = useState(false);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [fallo, setFallo] = useState(null);
  const categoria = datosCategoria(conversacion.categoria);
  const estado = ESTADOS[conversacion.estado] ?? ESTADOS.abierta;
  const idPanel = `buzon-${conversacion.id}`;

  const alternar = () => {
    const nueva = !abierta;
    setAbierta(nueva);
    if (nueva && conversacion.sin_leer) {
      alCambiar({ ...conversacion, sin_leer: false });
      marcarSugerenciaLeida(token, conversacion.id);
    }
  };

  const responder = async (evento) => {
    evento.preventDefault();
    if (texto.trim().length < 3) return;
    setEnviando(true);
    setFallo(null);
    const respuesta = await responderSugerencia(token, conversacion.id, texto.trim());
    setEnviando(false);
    if (!respuesta.ok) {
      setFallo(respuesta);
      return;
    }
    setTexto('');
    alCambiar(respuesta.datos);
  };

  return (
    <li className={`corte-poly-sm border ${conversacion.sin_leer ? 'border-neon/50 bg-superficie' : 'border-white/10 bg-superficie/85'}`}>
      <h3>
        <button
          type="button"
          onClick={alternar}
          aria-expanded={abierta}
          aria-controls={idPanel}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:text-neon"
        >
          <span className="text-neon" aria-hidden="true">
            {categoria.icono}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-white">{conversacion.mensajes[0]?.texto}</span>
            <span className="block text-xs text-white/50">
              {categoria.texto} · {fecha(conversacion.creada_en)}
              {conversacion.sin_leer && <span className="ml-2 font-bold text-neon">· {NOMBRE_CREADOR} te respondió</span>}
            </span>
          </span>
          <span className={`corte-poly-sm shrink-0 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest ${estado.tono}`}>
            {estado.texto}
          </span>
        </button>
      </h3>
      {abierta && (
        <div id={idPanel} className="animar-entrar grid gap-4 border-t border-white/10 px-4 pb-4 pt-4">
          {conversacion.pagina && <p className="font-mono text-[11px] text-white/45">Desde: {conversacion.pagina}</p>}
          <Hilo mensajes={conversacion.mensajes} alumno={alumno} />
          {conversacion.estado !== 'resuelta' && (
            <form noValidate onSubmit={responder} className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor={`${idPanel}-r`} className="sr-only">
                Responder
              </label>
              <input
                id={`${idPanel}-r`}
                maxLength={MAX_TEXTO}
                value={texto}
                onChange={(evento) => setTexto(evento.target.value)}
                placeholder="Añade algo más…"
                className={CONTROL}
              />
              <button type="submit" disabled={enviando || texto.trim().length < 3} className="boton bg-white/10 text-white hover:bg-white/15 disabled:opacity-50">
                {enviando ? 'Enviando…' : 'Responder'}
              </button>
            </form>
          )}
          <MensajeServidor respuesta={fallo} />
        </div>
      )}
    </li>
  );
}

function Buzon({ consulta }) {
  const { usuario, token, listo } = useAuth();
  const { avatar } = useAvatar();
  const [carga, setCarga] = useState(null);
  const [gesto, setGesto] = useState('quieto');
  const [vuelta, setVuelta] = useState(0);
  const [conversaciones, setConversaciones] = useState([]);

  useEffect(() => {
    if (!token) return undefined;
    let vigente = true;
    listarSugerencias(token).then((respuesta) => {
      if (!vigente) return;
      setCarga(respuesta);
      if (respuesta.ok) setConversaciones(respuesta.datos.conversaciones ?? []);
    });
    return () => {
      vigente = false;
    };
  }, [token]);

  if (!listo) return null;

  const alumno = usuario && {
    avatar,
    nombre: 'Tú',
    inicial: (usuario.nombre || usuario.email || '?').trim().charAt(0).toUpperCase(),
  };
  const cambiar = (nueva) => setConversaciones((lista) => lista.map((c) => (c.id === nueva.id ? nueva : c)));
  const alEnviar = (nueva) => {
    setConversaciones((lista) => [nueva, ...lista]);
    setGesto('gracias');
    setVuelta((n) => n + 1);
  };

  return (
    <Pagina
      ancho="contenido"
      migas={[{ texto: 'Inicio', href: rutas.inicio }, { texto: 'Buzón del creador' }]}
      encabezado={{
        icono: <PavoReal encuadre="busto" gesto="abierto" className="h-[86%] w-[86%]" />,
        antetitulo: 'Buzón del creador',
        titulo: `Escríbele a ${NOMBRE_CREADOR}`,
        descripcion:
          'Amatista todavía está creciendo. Si algo falla, se te ocurre una idea o una lección no se entiende, cuéntaselo directo a quien la hizo. Cada mensaje se lee y se responde aquí.',
      }}
    >
      <section className="borde-gema corte-poly mt-8" aria-label="Nuevo mensaje">
        <div className="corte-poly flex flex-col gap-6 bg-superficie p-6 sm:flex-row sm:items-start sm:p-8">
          <Escenario gesto={gesto} vuelta={vuelta} />
          {usuario ? (
            <Formulario
              token={token}
              desde={paginaDesde(consulta)}
              alEnviar={alEnviar}
              alEscribir={() => gesto === 'quieto' && setGesto('abierto')}
            />
          ) : (
            <div className="min-w-0 flex-1">
              <p className="leading-relaxed text-texto/85">
                Para que {NOMBRE_CREADOR} pueda responderte, el buzón funciona con tu cuenta. Entra o crea una gratis y escríbele.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a href={rutaEntrar(rutas.buzon)} className="boton boton--grande destello bg-amatista text-white hover:brightness-110">
                  Entrar ▸
                </a>
                <a href={rutas.registro} className="boton boton--grande border border-white/15 bg-white/5 text-white/85 hover:bg-white/10">
                  Crear cuenta
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {usuario && (
        <section className="mt-12" aria-labelledby="buzon-conversaciones">
          <TituloSeccion id="buzon-conversaciones" antetitulo="Tus mensajes" titulo="Conversaciones con el creador" />
          {carga && !carga.ok ? (
            <div className="mt-5">
              <MensajeServidor respuesta={carga} />
            </div>
          ) : conversaciones.length ? (
            <ul className="mt-5 grid grid-cols-1 gap-3">
              {conversaciones.map((c) => (
                <Conversacion key={c.id} conversacion={c} alumno={alumno} token={token} alCambiar={cambiar} />
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-white/55">{carga ? 'Todavía no le has escrito. Tu primer mensaje aparecerá aquí.' : 'Cargando…'}</p>
          )}
        </section>
      )}
    </Pagina>
  );
}

export default Buzon;
