import { useCallback, useRef, useState } from 'react';
import Avatar from '../../avatares/Avatar';
import { useAvatar } from '../../avatares/contexto';
import { useCerrarFuera } from '../../hooks/useCerrarFuera';
import { rutas } from '../../rutas';

const inicial = (usuario) => (usuario?.nombre || usuario?.email || '?').trim().charAt(0).toUpperCase();

export default function MenuCuenta({ usuario, alCerrarSesion }) {
  const { avatar } = useAvatar();
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);
  const boton = useRef(null);
  const cerrar = useCallback((devolverFoco) => {
    setAbierto(false);
    if (devolverFoco) boton.current?.focus();
  }, []);
  useCerrarFuera(abierto, cerrar, contenedor);

  return (
    <div className="relative" ref={contenedor}>
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        aria-controls="menu-cuenta"
        className="corte-poly-sm flex max-w-[12rem] items-center gap-2 border border-white/10 bg-superficie/80 py-1 pl-1.5 pr-3 text-sm text-white hover:border-amatista"
        title={usuario.nombre ? `${usuario.nombre} (${usuario.email})` : usuario.email}
      >
        <Avatar id={avatar} inicial={inicial(usuario)} foto={usuario.foto} />
        <span className="truncate">{usuario.nombre ? usuario.nombre.split(/\s+/)[0] : usuario.email}</span>
        <span className="sr-only">: menú de la cuenta</span>
        <span aria-hidden="true" className="text-white/50">
          ▾
        </span>
      </button>
      {abierto && (
        <div
          id="menu-cuenta"
          className="corte-poly-sm animar-entrar absolute right-0 top-full mt-2 w-60 border border-white/10 bg-superficie p-2 shadow-2xl"
        >
          {usuario.nombre && <p className="truncate px-3 pt-2 text-sm font-bold text-white">{usuario.nombre}</p>}
          <p className="truncate px-3 pb-2 pt-0.5 text-xs text-white/50">{usuario.email}</p>
          <ul className="grid gap-1">
            <li>
              <a href={rutas.perfil} onClick={() => setAbierto(false)} className="block px-3 py-2 text-sm text-white hover:bg-white/5">
                Perfil
              </a>
            </li>
            <li>
              <a href={rutas.guia} onClick={() => setAbierto(false)} className="block px-3 py-2 text-sm text-white hover:bg-white/5">
                Ayuda y recorrido
              </a>
            </li>
            <li>
              <a href={rutas.buzon} onClick={() => setAbierto(false)} className="block px-3 py-2 text-sm text-white hover:bg-white/5">
                Buzón del creador
              </a>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setAbierto(false);
                  alCerrarSesion();
                }}
                className="block w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-white/5"
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
