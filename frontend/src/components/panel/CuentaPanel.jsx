import { rutaEntrar, rutas } from '../../rutas';
import EstadoGuardado from '../EstadoGuardado';
import { IconoPalomita } from './IconosPanel';
import Seccion from './Seccion';

const BOTON =
  'corte-poly-sm block px-5 py-3 text-center font-extrabold uppercase tracking-widest transition-[filter,background-color]';

// Anónimo: invita a crear una cuenta para respaldar el progreso. Con cuenta:
// estado de la sincronización y del correo.
function CuentaPanel({ usuario, sesionVencida, lecciones, xp, className = '' }) {
  if (!usuario) {
    return (
      <Seccion id="panel-cuenta" etiqueta="Respaldo" titulo="Guarda tu progreso" className={className}>
        {sesionVencida ? (
          <p className="text-sm leading-relaxed text-amatista-claro">
            Tu sesión se cerró. Entra de nuevo para ver y sincronizar el progreso de tu cuenta.
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-texto/80">
            {lecciones > 0 || xp > 0
              ? `Tus ${xp} XP y ${lecciones} ${lecciones === 1 ? 'lección' : 'lecciones'} viven solo en este navegador.`
              : 'Por ahora tu progreso vive solo en este navegador.'}{' '}
            Crea una cuenta para respaldarlo en la nube y seguir desde cualquier dispositivo: lo que ya hiciste se suma a tu cuenta.
          </p>
        )}
        <div className="mt-5 grid gap-2">
          <a href={rutas.registro} className={`${BOTON} bg-amatista text-white hover:brightness-110`}>
            Crear cuenta ▶
          </a>
          <a href={rutaEntrar(rutas.panel)} className={`${BOTON} bg-white/5 text-white/80 hover:bg-white/10`}>
            Ya tengo cuenta
          </a>
        </div>
      </Seccion>
    );
  }

  return (
    <Seccion id="panel-cuenta" etiqueta="Cuenta" titulo="Tu cuenta" className={className}>
      <p className="truncate font-semibold text-white">{usuario.nombre}</p>
      <p className="truncate text-sm text-white/60">{usuario.email}</p>
      {usuario.correo_confirmado ? (
        <p className="mt-3 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-amatista-claro">
          <IconoPalomita className="h-3.5 w-3.5" /> Correo confirmado
        </p>
      ) : (
        <p className="mt-3 text-sm text-texto/80">
          <span className="font-mono text-xs uppercase tracking-wider text-blender">Correo sin confirmar.</span>{' '}
          Confírmalo para poder recuperar tu cuenta.{' '}
          <a href={rutas.confirmar} className="font-bold text-neon underline-offset-2 hover:underline">
            Confirmar ▸
          </a>
        </p>
      )}
      <EstadoGuardado className="mt-4 border-t border-white/5 pt-4 leading-relaxed" />
      <a
        href={rutas.perfil}
        className="mt-4 inline-block font-mono text-xs font-bold uppercase tracking-widest text-neon underline-offset-4 hover:underline"
      >
        Perfil y seguridad ▸
      </a>
    </Seccion>
  );
}

export default CuentaPanel;
