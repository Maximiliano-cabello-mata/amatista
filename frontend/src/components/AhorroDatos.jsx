import { useRed } from '../hooks/useRed';
import { guardarPreferenciaAhorro } from '../lib/red';

const OPCIONES = [
  { id: 'auto', texto: 'Automático', ayuda: 'Se enciende con poca señal' },
  { id: 'si', texto: 'Siempre', ayuda: 'Para datos móviles' },
  { id: 'no', texto: 'Nunca', ayuda: 'Con Wi-Fi sin límite' },
];

const RED = { 'slow-2g': '2G lenta', '2g': '2G', '3g': '3G', '4g': '4G o Wi-Fi' };

// Ahorro de datos (escuelas con datos móviles): imágenes bajo pedido, envíos
// agrupados y el catálogo revisado cada 6 horas. El progreso nunca se pierde:
// vive en el dispositivo y se envía comprimido en cuanto hay una pizca de red.
function AhorroDatos({ className = '' }) {
  const red = useRed();
  let estado = red.ahorro ? 'Activo' : 'Apagado';
  if (red.preferencia === 'auto' && red.ahorro) estado += red.ahorroSistema ? ' (ahorro del sistema)' : ' (red lenta)';

  return (
    <fieldset className={className}>
      <legend className="mb-2 flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-white">
        Ahorro de datos
        <span className={`font-mono text-[11px] uppercase tracking-widest ${red.ahorro ? 'text-neon' : 'text-white/45'}`}>
          {estado}
          {RED[red.tipoRed] ? ` · red ${RED[red.tipoRed]}` : ''}
        </span>
      </legend>
      <div className="grid grid-cols-3 gap-2">
        {OPCIONES.map((opcion) => (
          <label
            key={opcion.id}
            className="avatar-opcion corte-poly-sm cursor-pointer border border-white/10 bg-white/[0.03] px-3 py-2"
          >
            <input
              type="radio"
              name="ahorro-datos"
              value={opcion.id}
              checked={red.preferencia === opcion.id}
              onChange={() => guardarPreferenciaAhorro(opcion.id)}
              className="sr-only"
            />
            <span className="block text-sm font-bold text-white">{opcion.texto}</span>
            <span className="block text-[11px] leading-tight text-white/50">{opcion.ayuda}</span>
          </label>
        ))}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-white/50">
        Con el ahorro activo las imágenes se cargan solo si las pides y tu avance se junta en envíos pequeños y
        comprimidos. Puedes estudiar sin conexión: todo se envía solo en cuanto hay un poco de señal.
      </p>
    </fieldset>
  );
}

export default AhorroDatos;
