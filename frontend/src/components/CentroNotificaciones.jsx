import { useMemo, useState } from 'react';
import { useAuth } from '../auth/contexto';
import {
  evaluarNotificacion,
  guardarHoraPreferencia,
  leerHoraPreferencia,
  solicitarPermisoWeb,
} from '../nucleo/motorNotificaciones';
import { useProgreso } from '../progreso/contexto';

const CLAVE_OCULTO_HOY = 'amatista:notif_oculta';

function CentroNotificaciones({ leccionSiguiente = null, className = '' }) {
  const { usuario } = useAuth();
  const { racha } = useProgreso();
  const [descartado, setDescartado] = useState(() => {
    try {
      return window.sessionStorage.getItem(CLAVE_OCULTO_HOY) === '1';
    } catch {
      return false;
    }
  });
  const [hora, setHora] = useState(leerHoraPreferencia);
  const [permisoWeb, setPermisoWeb] = useState(() => (typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'default'));

  const notificacion = useMemo(
    () => evaluarNotificacion({ usuario, racha, leccionSiguiente }),
    [usuario, racha, leccionSiguiente],
  );

  const descartar = () => {
    setDescartado(true);
    try {
      window.sessionStorage.setItem(CLAVE_OCULTO_HOY, '1');
    } catch {
      // Ignorar si modo privado
    }
  };

  const alCambiarHora = (evento) => {
    const nuevaHora = evento.target.value;
    setHora(nuevaHora);
    guardarHoraPreferencia(nuevaHora);
  };

  const alPedirPermiso = async () => {
    const estado = await solicitarPermisoWeb();
    setPermisoWeb(estado);
  };

  if (descartado || !notificacion) return null;

  return (
    <aside
      aria-label="Aviso personalizado de estudio"
      className={`corte-poly animar-entrar relative overflow-hidden border border-blender/60 bg-superficie/95 p-4 shadow-2xl ${className}`}
      style={{
        boxShadow: `0 0 24px -4px ${notificacion.colorAcento}40`,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <span
            className="hexagono grid h-12 w-13 shrink-0 place-items-center text-2xl"
            style={{
              background: `radial-gradient(circle, ${notificacion.colorAcento}33 0%, rgba(13,10,20,0.9) 100%)`,
              border: `1px solid ${notificacion.colorAcento}88`,
            }}
            aria-hidden="true"
          >
            {notificacion.icono}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="font-mono text-[10px] font-bold uppercase tracking-widest"
                style={{ color: notificacion.colorAcento }}
              >
                {notificacion.personaje}
              </span>
              <span className="corte-poly-sm border border-white/10 bg-base/80 px-2 py-0.5 font-mono text-[10px] font-bold text-white/80">
                {notificacion.etiqueta}
              </span>
            </div>
            <h4 className="mt-0.5 text-sm font-extrabold text-white truncate">{notificacion.titulo}</h4>
            <p className="mt-0.5 text-xs text-texto/80 max-w-xl">{notificacion.mensaje}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {permisoWeb !== 'granted' && (
            <button
              type="button"
              onClick={alPedirPermiso}
              title="Activar avisos en el navegador"
              className="corte-poly-sm border border-white/20 bg-base/60 px-2.5 py-1.5 font-mono text-xs text-white/70 hover:text-white"
            >
              🔔 Activar avisos
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 border-l border-white/10 pl-2">
            <label htmlFor="selector-hora-notif" className="sr-only">Hora de recordatorio</label>
            <select
              id="selector-hora-notif"
              value={hora}
              onChange={alCambiarHora}
              className="corte-poly-sm border border-white/15 bg-base px-2 py-1 font-mono text-xs text-neon"
              title="Hora preferida de recordatorio diario"
            >
              <option value="19:00">19:00 h</option>
              <option value="20:30">20:30 h</option>
              <option value="21:30">21:30 h</option>
            </select>
          </div>

          <a
            href={notificacion.href}
            className="corte-poly-sm px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-base hover:brightness-110"
            style={{ background: notificacion.colorAcento }}
          >
            {notificacion.cta}
          </a>

          <button
            type="button"
            onClick={descartar}
            aria-label="Cerrar notificación"
            className="grid h-7 w-7 place-items-center text-white/50 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
}

export default CentroNotificaciones;
