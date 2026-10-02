// Piezas visuales del panel de administración (mismo sistema low poly que el resto).
import { useEffect, useId, useRef } from 'react';
import { rutaEntrar } from '../../rutas';
import { CristalLogo } from '../Iconos';

export function Tarjeta({ etiqueta, titulo, accion, children, className = '', id }) {
  const generado = useId();
  const idTitulo = id ?? `${generado}-titulo`;
  return (
    <section
      aria-labelledby={titulo ? idTitulo : undefined}
      className={`corte-poly min-w-0 border border-white/10 bg-superficie/95 p-4 sm:p-6 ${className}`}
    >
      {(titulo || accion) && (
        <header className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            {etiqueta && <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon">{etiqueta}</p>}
            {titulo && (
              <h2 id={idTitulo} className="text-xl font-extrabold text-white">
                {titulo}
              </h2>
            )}
          </div>
          {accion}
        </header>
      )}
      {children}
    </section>
  );
}

// Tarjeta de indicador: etiqueta, cifra grande y detalle.
export function Kpi({ etiqueta, valor, detalle, tono = 'text-white' }) {
  return (
    <div className="corte-poly-sm min-w-0 border border-white/10 bg-base/60 px-4 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-white/55">{etiqueta}</dt>
      <dd className="mt-1">
        <span className={`text-3xl font-extrabold leading-none tabular-nums ${tono}`}>{valor}</span>
        {detalle && <span className="mt-1.5 block text-xs leading-snug text-white/55">{detalle}</span>}
      </dd>
    </div>
  );
}

const ESTILOS_ESTADO = {
  publicado: 'bg-emerald-400/10 text-emerald-300',
  borrador: 'bg-amber-300/10 text-amber-200',
  archivado: 'bg-white/5 text-white/45',
  revision: 'bg-neon/10 text-neon',
};

const TEXTOS_ESTADO = { publicado: 'Publicado', borrador: 'Borrador', archivado: 'Archivado', revision: 'Revisión' };

export function EtiquetaEstado({ estado }) {
  return (
    <span
      className={`corte-poly-sm inline-block whitespace-nowrap px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${
        ESTILOS_ESTADO[estado] ?? 'bg-white/5 text-white/60'
      }`}
    >
      {TEXTOS_ESTADO[estado] ?? estado}
    </span>
  );
}

export function Pastilla({ children, tono = 'bg-white/5 text-white/65', titulo }) {
  return (
    <span
      title={titulo}
      className={`corte-poly-sm inline-block whitespace-nowrap px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${tono}`}
    >
      {children}
    </span>
  );
}

const VARIANTES = {
  primario: 'bg-amatista text-white hover:brightness-110',
  neon: 'bg-neon text-base hover:brightness-110',
  secundario: 'bg-white/5 text-white/85 hover:bg-white/10',
  peligro: 'bg-red-500/15 text-red-200 hover:bg-red-500/25',
};

export function Boton({ variante = 'secundario', chico = false, className = '', type = 'button', children, ...resto }) {
  return (
    <button
      type={type}
      className={`corte-poly-sm font-bold uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-45 ${
        chico ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs'
      } ${VARIANTES[variante]} ${className}`}
      {...resto}
    >
      {children}
    </button>
  );
}

// Mensaje de resultado de una acción (role=status o alert según el tono).
export function Mensaje({ tono = 'info', children, className = '' }) {
  if (!children) return null;
  const estilos = {
    info: 'border-neon/30 bg-neon/5 text-cyan-100',
    exito: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
    error: 'border-red-400/40 bg-red-500/10 text-red-200',
    aviso: 'border-amber-300/40 bg-amber-300/10 text-amber-100',
  };
  return (
    <div
      role={tono === 'error' ? 'alert' : 'status'}
      className={`corte-poly-sm border px-3 py-2 text-sm leading-relaxed ${estilos[tono]} ${className}`}
    >
      {children}
    </div>
  );
}

export function CargandoAdmin({ texto = 'Cargando…' }) {
  return (
    <div className="grid min-h-[30vh] place-items-center" role="status">
      <div className="flex flex-col items-center gap-3">
        <CristalLogo className="animar-flotar h-10 w-10" />
        <span className="font-mono text-xs uppercase tracking-widest text-white/50">{texto}</span>
      </div>
    </div>
  );
}

export function Vacio({ titulo, children }) {
  return (
    <div className="corte-poly-sm border border-dashed border-white/15 px-4 py-8 text-center">
      <p className="font-semibold text-white/80">{titulo}</p>
      {children && <div className="mt-2 text-sm text-white/55">{children}</div>}
    </div>
  );
}

// Error de una carga: 401 lleva a Entrar, 403 explica el permiso, lo demás se reintenta.
export function ErrorAdmin({ respuesta, alReintentar }) {
  if (!respuesta || respuesta.ok) return null;
  if (respuesta.status === 401) {
    return (
      <Mensaje tono="error">
        Tu sesión venció o se cerró en otro dispositivo.{' '}
        <a href={rutaEntrar(window.location.hash)} className="font-bold text-white underline underline-offset-2">
          Entra de nuevo
        </a>{' '}
        para seguir en el panel.
      </Mensaje>
    );
  }
  if (respuesta.status === 403) {
    return (
      <Mensaje tono="error">
        {respuesta.error || 'Tu cuenta no tiene permiso para esta sección.'} Si lo necesitas, pide a un administrador que
        cambie tu rol.{' '}
        <a href={rutaEntrar(window.location.hash)} className="font-bold text-white underline underline-offset-2">
          Entrar con otra cuenta
        </a>
      </Mensaje>
    );
  }
  return (
    <Mensaje tono="error">
      <span>{respuesta.error || 'No se pudo cargar.'}</span>
      {alReintentar && (
        <button type="button" onClick={alReintentar} className="ml-2 font-bold text-white underline underline-offset-2">
          Reintentar
        </button>
      )}
    </Mensaje>
  );
}

// Diálogo modal nativo (<dialog>): atrapa el foco y se cierra con Escape.
export function Confirmacion({ pregunta, responder }) {
  const dialogo = useRef(null);
  const id = useId();

  useEffect(() => {
    const nodo = dialogo.current;
    if (!nodo) return;
    if (pregunta && !nodo.open) nodo.showModal?.();
    if (!pregunta && nodo.open) nodo.close();
  }, [pregunta]);

  return (
    <dialog
      ref={dialogo}
      aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-texto`}
      onCancel={(evento) => {
        evento.preventDefault();
        responder(false);
      }}
      className="corte-poly m-auto w-[min(28rem,calc(100vw-2rem))] border border-white/15 bg-superficie p-0 text-texto backdrop:bg-black/70"
    >
      {pregunta && (
        <div className="p-6">
          <h2 id={`${id}-titulo`} className="text-xl font-extrabold text-white">
            {pregunta.titulo}
          </h2>
          <div id={`${id}-texto`} className="mt-3 text-sm leading-relaxed text-texto/80">
            {pregunta.texto}
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Boton onClick={() => responder(false)} autoFocus>
              Cancelar
            </Boton>
            <Boton variante={pregunta.peligro ? 'peligro' : 'primario'} onClick={() => responder(true)}>
              {pregunta.confirmar ?? 'Confirmar'}
            </Boton>
          </div>
        </div>
      )}
    </dialog>
  );
}

// Campo con etiqueta visible (input, select o textarea).
export function CampoAdmin({ etiqueta, ayuda, error, children, className = '' }) {
  const id = useId();
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;
  const control = typeof children === 'function' ? children({ id, describe: [idAyuda, idError].filter(Boolean).join(' ') || undefined }) : children;
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/70">
        {etiqueta}
      </label>
      {control}
      {ayuda && (
        <p id={idAyuda} className="mt-1 text-xs text-white/45">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="mt-1 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
