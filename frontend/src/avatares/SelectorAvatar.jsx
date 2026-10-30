// Perfil › Tu personaje: elegir el avatar low poly de la cuenta. Radios
// nativos (flechas del teclado incluidas) con el busto de cada personaje.
import { useState } from 'react';
import { BustoAvatar } from './Avatar';
import { avataresPara } from './catalogo';
import { useAvatar } from './contexto';

function SelectorAvatar() {
  const { avatar, esCreador, elegir } = useAvatar();
  const [aviso, setAviso] = useState(null);
  const opciones = avataresPara({ esCreador });

  const alElegir = async (id) => {
    setAviso(null);
    const resultado = await elegir(id);
    if (!resultado.ok) setAviso({ tipo: 'error', texto: resultado.error || 'No se pudo guardar. Inténtalo de nuevo.' });
    else if (resultado.local) setAviso({ tipo: 'info', texto: 'Guardado en este dispositivo. Se subirá a tu cuenta cuando el servidor lo permita.' });
  };

  return (
    <div>
      <p className="text-sm text-texto/75">Aparece junto a tu nombre en la barra y en el buzón del creador.</p>
      <fieldset className="mt-4">
        <legend className="sr-only">Elige tu personaje</legend>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {opciones.map((opcion) => (
            <label
              key={opcion.id}
              className="avatar-opcion corte-poly-sm flex cursor-pointer flex-col items-center gap-1 border border-white/10 bg-white/[0.03] p-2 text-center"
            >
              <input
                type="radio"
                name="avatar"
                value={opcion.id}
                checked={avatar === opcion.id}
                onChange={() => alElegir(opcion.id)}
                className="sr-only"
              />
              <span
                className="hexagono grid h-16 w-[4.5rem] place-items-center overflow-hidden"
                style={{ background: `radial-gradient(circle at 70% 25%, rgb(255 255 255 / 0.14), ${opcion.fondo} 70%)` }}
                aria-hidden="true"
              >
                <BustoAvatar id={opcion.id} className="h-[88%] w-[88%]" />
              </span>
              <span className="text-xs font-bold text-white">{opcion.nombre}</span>
              <span className="text-[11px] leading-tight text-white/50">{opcion.frase}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {aviso && (
        <p role="status" className={`mt-3 text-sm ${aviso.tipo === 'error' ? 'text-red-300' : 'text-white/60'}`}>
          {aviso.texto}
        </p>
      )}
    </div>
  );
}

export default SelectorAvatar;
