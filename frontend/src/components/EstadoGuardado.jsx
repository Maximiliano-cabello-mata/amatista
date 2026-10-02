import { useAuth } from '../auth/contexto';
import { useProgreso } from '../progreso/contexto';
import { rutaEntrar, rutas } from '../rutas';

const hora = (iso) =>
  new Date(iso).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// Le dice al alumno dónde está su progreso: siempre en el dispositivo y,
// cuando se pueda, también en el servidor. Nunca indica "sincronizado" si el
// servidor no lo confirmó.
function EstadoGuardado({ className = '' }) {
  const { sincronizacion, sincronizarAhora } = useProgreso();
  const { usuario, sesionVencida } = useAuth();
  const volver = typeof window === 'undefined' ? undefined : window.location.hash;

  let detalle = null;
  let tono = 'text-white/45';
  let accion = null;

  if (sesionVencida && !usuario) {
    tono = 'text-amatista-claro';
    detalle = 'Tu sesión se cerró: entra de nuevo para ver y sincronizar el progreso de tu cuenta.';
    accion = { href: rutaEntrar(volver), texto: 'Entrar' };
  } else if (sincronizacion.requiereSesion) {
    tono = 'text-amatista-claro';
    detalle = 'Inicia sesión para sincronizar.';
    accion = { href: rutaEntrar(volver), texto: 'Entrar' };
  } else if (!sincronizacion.disponible) {
    detalle = 'La sincronización con el servidor no está disponible en este sitio.';
  } else if (sincronizacion.enviando) {
    detalle = 'Sincronizando con el servidor…';
  } else if (sincronizacion.error && sincronizacion.pendientes > 0) {
    tono = 'text-blender';
    detalle = `No se pudo sincronizar (${sincronizacion.error}). ${plural(sincronizacion.pendientes, 'cambio pendiente', 'cambios pendientes')}: se reintentará.`;
    accion = { onClick: sincronizarAhora, texto: 'Reintentar' };
  } else if (sincronizacion.pendientes > 0) {
    detalle = `${plural(sincronizacion.pendientes, 'cambio pendiente', 'cambios pendientes')}: se enviará al servidor cuando haya conexión.`;
  } else if (sincronizacion.ultima) {
    detalle = `Sincronizado con el servidor (${hora(sincronizacion.ultima)}).`;
  }

  const donde = usuario
    ? 'Tu progreso se guarda en este dispositivo y en tu cuenta.'
    : 'Tu progreso se guarda en este dispositivo.';

  return (
    <p className={`font-mono text-xs text-white/45 ${className}`} role="status">
      <span className="mr-1.5 inline-block h-2 w-2 rotate-45 bg-amatista" aria-hidden="true" />
      {donde} {detalle && <span className={tono}>{detalle}</span>}{' '}
      {accion?.href && (
        <a href={accion.href} className="font-bold text-neon underline-offset-2 hover:underline">
          {accion.texto} ▸
        </a>
      )}
      {accion?.onClick && (
        <button type="button" onClick={accion.onClick} className="font-bold text-neon underline-offset-2 hover:underline">
          {accion.texto} ↻
        </button>
      )}
      {!usuario && !accion && (
        <a href={rutas.registro} className="text-neon underline-offset-2 hover:underline">
          Crea una cuenta para no perderlo ▸
        </a>
      )}
    </p>
  );
}

export default EstadoGuardado;
