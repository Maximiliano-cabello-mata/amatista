// Piezas de los formularios de cuenta: accesibles (etiquetas, errores
// asociados con aria-describedby, foco visible) y usables con teclado.
import { Children, useId, useState } from 'react';
import { limpiarCodigo } from '../../auth/validacion';
import { CristalLogo } from '../../components/Iconos';
import { useConexion } from '../../hooks/useConexion';

export function PaginaCuenta({ titulo, antetitulo = 'Tu cuenta', descripcion, children, pie }) {
  const enLinea = useConexion();
  return (
    <main className="mx-auto max-w-md px-4 pb-20 pt-8 sm:pt-14">
      <section className="corte-poly animar-entrar bg-gradient-to-br from-amatista via-amatista-oscuro to-neon/40 p-[2px]">
        <div className="corte-poly bg-superficie/95 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <CristalLogo className="h-10 w-10 shrink-0" />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">{antetitulo}</p>
              <h1 className="text-3xl font-extrabold leading-tight text-white">{titulo}</h1>
            </div>
          </div>
          {descripcion && <p className="mt-4 leading-relaxed text-texto/75">{descripcion}</p>}
          {!enLinea && (
            <p className="corte-poly-sm mt-4 border border-amatista-claro/30 bg-amatista/10 px-3 py-2 text-sm text-amatista-claro">
              Sin conexión: necesitas Internet para esta acción. Tu progreso sigue guardado en este dispositivo.
            </p>
          )}
          <div className="mt-6">{children}</div>
        </div>
      </section>
      {pie && <div className="mt-6 grid gap-2 text-center text-sm text-texto/70">{pie}</div>}
    </main>
  );
}

const CLASE_ENTRADA =
  'corte-poly-sm w-full border bg-base/70 px-3 py-2.5 text-texto placeholder:text-white/30 focus:border-neon focus:outline-none';

export function Campo({
  etiqueta,
  nombre,
  error,
  ayuda,
  tipo = 'text',
  valor,
  alCambiar,
  accesorio,
  claseEntrada = CLASE_ENTRADA,
  ...resto
}) {
  const id = useId();
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  const describe = [ayuda && idAyuda, error && idError].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-white">
        {etiqueta}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          name={nombre}
          type={tipo}
          value={valor}
          onChange={(evento) => alCambiar(evento.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describe}
          className={`${claseEntrada} ${error ? 'border-red-400/70' : 'border-white/10'}`}
          {...resto}
        />
        {accesorio}
      </div>
      {ayuda && (
        <p id={idAyuda} className="mt-1 text-xs text-white/50">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="mt-1 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

// Contraseña con botón para mostrarla (útil en el celular).
export function CampoPassword(props) {
  const [visible, setVisible] = useState(false);
  return (
    <Campo
      {...props}
      tipo={visible ? 'text' : 'password'}
      accesorio={
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-pressed={visible}
          className="corte-poly-sm shrink-0 border border-white/10 px-3 font-mono text-[11px] uppercase tracking-wider text-white/70 hover:text-neon"
        >
          {visible ? 'Ocultar' : 'Mostrar'}
          <span className="sr-only"> contraseña</span>
        </button>
      }
    />
  );
}

// Código de 6 dígitos: teclado numérico y autocompletado del SMS/correo.
export function CampoCodigo({ valor, alCambiar, error, etiqueta = 'Código de 6 dígitos' }) {
  return (
    <Campo
      etiqueta={etiqueta}
      nombre="codigo"
      autoComplete="one-time-code"
      inputMode="numeric"
      maxLength={7}
      placeholder="000000"
      claseEntrada={`${CLASE_ENTRADA} text-center font-mono text-2xl tracking-[0.5em] text-white`}
      valor={valor}
      alCambiar={(texto) => alCambiar(limpiarCodigo(texto).slice(0, 6))}
      error={error}
      required
    />
  );
}

export function BotonEnviar({ enviando, children, textoEnviando = 'Enviando…', variante = 'principal', ...resto }) {
  const estilo =
    variante === 'principal'
      ? 'bg-amatista text-white hover:brightness-110'
      : 'border border-white/10 bg-white/5 text-white/85 hover:bg-white/10';
  return (
    <button
      type="submit"
      disabled={enviando}
      aria-busy={enviando || undefined}
      className={`corte-poly-sm w-full px-6 py-3 font-extrabold uppercase tracking-widest transition-[filter] disabled:cursor-wait disabled:opacity-50 ${estilo}`}
      {...resto}
    >
      {enviando ? textoEnviando : children}
    </button>
  );
}

// Mensaje general del formulario: error (role="alert") o éxito (role="status").
export function Alerta({ tipo = 'error', children }) {
  // Children.toArray descarta null/false: sin mensaje no se deja una región vacía.
  if (!Children.toArray(children).length) return null;
  const estilo =
    tipo === 'error'
      ? 'border-red-400/50 bg-red-400/10 text-red-200'
      : tipo === 'exito'
        ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200'
        : 'border-neon/40 bg-neon/10 text-texto';
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className={`corte-poly-sm animar-entrar border px-4 py-3 text-sm ${estilo}`}>
      {children}
    </div>
  );
}

// Ayuda de desarrollo: el servidor devolvió el código (AMATISTA_MOSTRAR_CODIGOS=1).
export function CodigoDesarrollo({ codigo }) {
  if (!codigo) return null;
  return (
    <p className="corte-poly-sm border border-dashed border-blender/60 bg-blender/10 px-3 py-2 font-mono text-xs text-blender">
      Modo desarrollo · código: <strong className="text-sm tracking-[0.3em]">{codigo}</strong>
    </p>
  );
}

export const CLASE_ENLACE = 'text-neon underline-offset-2 hover:underline';
