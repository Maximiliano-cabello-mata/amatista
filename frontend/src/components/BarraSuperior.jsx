import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/contexto';
import { useConexion } from '../hooks/useConexion';
import { useInstalarPWA } from '../hooks/useInstalarPWA';
import { useProgreso } from '../progreso/contexto';
import { navegar, rutaEntrar, rutas } from '../rutas';
import { CristalLogo } from './Iconos';

const PAGINAS_CURSOS = ['inicio', 'curso', 'leccion'];

function enlacesDe(esProfesor) {
  const enlaces = [
    { href: rutas.inicio, texto: 'Cursos', activo: (pagina) => PAGINAS_CURSOS.includes(pagina) },
    { href: rutas.panel, texto: 'Mi panel', activo: (pagina) => pagina === 'panel' },
    { href: rutas.laboratorio, texto: 'Laboratorio', activo: (pagina) => pagina === 'laboratorio' },
  ];
  if (esProfesor) enlaces.push({ href: rutas.admin, texto: 'Admin', activo: (pagina) => pagina === 'admin' });
  return enlaces;
}

const inicial = (usuario) => (usuario?.nombre || usuario?.email || '?').trim().charAt(0).toUpperCase();

// Cierra con Escape o con un clic fuera del elemento.
function useCerrarFuera(abierto, cerrar, ref) {
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (evento) => {
      if (evento.key === 'Escape') cerrar(true);
    };
    const alPulsar = (evento) => {
      if (ref.current && !ref.current.contains(evento.target)) cerrar(false);
    };
    document.addEventListener('keydown', alTeclear);
    document.addEventListener('pointerdown', alPulsar);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.removeEventListener('pointerdown', alPulsar);
    };
  }, [abierto, cerrar, ref]);
}

function IndicadorXP({ xp, nivel }) {
  return (
    <a
      href={rutas.panel}
      className="corte-poly-sm flex items-center gap-2 border border-amatista/40 bg-amatista/15 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-amatista-claro hover:bg-amatista/25"
      title={`Nivel ${nivel.nivel} · ${nivel.titulo}: faltan ${nivel.faltan} XP para el siguiente nivel`}
      aria-label={`Nivel ${nivel.nivel}, ${nivel.titulo}, ${xp} XP. Ver mi panel`}
    >
      <span className="hexagono grid h-5 w-6 place-items-center bg-amatista text-[10px] text-white" aria-hidden="true">
        {nivel.nivel}
      </span>
      <span aria-hidden="true">
        {xp} XP
      </span>
    </a>
  );
}

function EstadoConexion({ enLinea }) {
  const texto = enLinea ? 'En línea' : 'Sin conexión';
  return (
    <span
      role="status"
      className={`corte-poly-sm flex items-center gap-2 border px-3 py-1.5 font-mono text-xs uppercase tracking-wider ${
        enLinea ? 'border-neon/40 bg-neon/10 text-neon' : 'border-amatista-claro/40 bg-amatista/10 text-amatista-claro'
      }`}
    >
      <span className={`h-2 w-2 rotate-45 ${enLinea ? 'bg-neon animar-pulso' : 'bg-amatista-claro'}`} aria-hidden="true" />
      <span className="hidden lg:inline">{texto}</span>
      <span className="sr-only lg:hidden">{texto}</span>
    </span>
  );
}

const CLASE_BOTON_INSTALAR =
  'corte-poly-sm bg-amatista px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-amatista-claro hover:text-base';

function MenuCuenta({ usuario, alCerrarSesion }) {
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
      >
        <span className="hexagono grid h-7 w-8 shrink-0 place-items-center bg-amatista font-bold" aria-hidden="true">
          {inicial(usuario)}
        </span>
        <span className="truncate">{usuario.nombre || usuario.email}</span>
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
          <p className="truncate px-3 pb-2 pt-1 text-xs text-white/50">{usuario.email}</p>
          <ul className="grid gap-1">
            <li>
              <a href={rutas.perfil} onClick={() => setAbierto(false)} className="block px-3 py-2 text-sm text-white hover:bg-white/5">
                Perfil
              </a>
            </li>
            <li>
              <a href={rutas.panel} onClick={() => setAbierto(false)} className="block px-3 py-2 text-sm text-white hover:bg-white/5">
                Mi panel
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

function BarraSuperior({ ruta, hash = '' }) {
  const enLinea = useConexion();
  const instalar = useInstalarPWA();
  const { xp, nivel } = useProgreso();
  const { usuario, esProfesor, cerrarSesion } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const barra = useRef(null);
  const botonMenu = useRef(null);
  const cerrarMenu = useCallback((devolverFoco) => {
    setMenuAbierto(false);
    if (devolverFoco) botonMenu.current?.focus();
  }, []);
  useCerrarFuera(menuAbierto, cerrarMenu, barra);

  const pagina = ruta?.pagina ?? 'inicio';
  const enlaces = enlacesDe(esProfesor);
  const enCuenta = ['entrar', 'registro', 'confirmar', 'recuperar'].includes(pagina);

  const salir = async () => {
    setMenuAbierto(false);
    await cerrarSesion();
    if (pagina === 'perfil' || pagina === 'admin') navegar(rutas.inicio);
  };

  return (
    <header ref={barra} className="sticky top-0 z-20 border-b border-white/5 bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href={rutas.inicio} className="flex shrink-0 items-center gap-3" aria-label="Amatista, inicio">
          <CristalLogo className="h-9 w-9 drop-shadow-[0_0_10px_rgba(155,89,182,0.6)]" />
          <span className="hidden text-xl font-extrabold tracking-[0.25em] text-white min-[440px]:inline">AMATISTA</span>
        </a>

        <nav className="hidden md:block" aria-label="Principal">
          <ul className="flex items-center gap-1">
            {enlaces.map((enlace) => {
              const activo = enlace.activo(pagina);
              return (
                <li key={enlace.href}>
                  <a
                    href={enlace.href}
                    aria-current={activo ? 'page' : undefined}
                    className={`corte-poly-sm px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                      activo ? 'bg-white/10 text-white' : 'text-white/60 hover:text-neon'
                    }`}
                  >
                    {enlace.texto}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <IndicadorXP xp={xp} nivel={nivel} />
          <EstadoConexion enLinea={enLinea} />
          {instalar && (
            <button type="button" onClick={instalar} className={`hidden md:block ${CLASE_BOTON_INSTALAR}`}>
              Instalar app
            </button>
          )}
          <div className="hidden md:block">
            {usuario ? (
              <MenuCuenta usuario={usuario} alCerrarSesion={salir} />
            ) : (
              !enCuenta && (
                <a
                  href={rutaEntrar(hash)}
                  className="corte-poly-sm block bg-neon px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-base hover:brightness-110"
                >
                  Entrar
                </a>
              )
            )}
          </div>
          <button
            ref={botonMenu}
            type="button"
            className="corte-poly-sm grid h-9 w-10 place-items-center border border-white/10 bg-superficie/80 text-white md:hidden"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-expanded={menuAbierto}
            aria-controls="menu-principal"
          >
            <span className="sr-only">{menuAbierto ? 'Cerrar menú' : 'Abrir menú'}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              {menuAbierto ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuAbierto && (
        <nav id="menu-principal" aria-label="Principal" className="animar-entrar border-t border-white/5 bg-base/95 md:hidden">
          <ul className="mx-auto grid max-w-6xl gap-1 px-4 py-3">
            {enlaces.map((enlace) => {
              const activo = enlace.activo(pagina);
              return (
                <li key={enlace.href}>
                  <a
                    href={enlace.href}
                    onClick={() => setMenuAbierto(false)}
                    aria-current={activo ? 'page' : undefined}
                    className={`corte-poly-sm block px-3 py-3 font-mono text-sm uppercase tracking-widest ${
                      activo ? 'bg-white/10 text-white' : 'text-white/70 hover:text-neon'
                    }`}
                  >
                    {enlace.texto}
                  </a>
                </li>
              );
            })}
            <li className="mt-2 border-t border-white/10 pt-3">
              {usuario ? (
                <div className="grid gap-1">
                  <p className="flex items-center gap-2 px-3 pb-1 text-sm text-white">
                    <span className="hexagono grid h-7 w-8 shrink-0 place-items-center bg-amatista font-bold" aria-hidden="true">
                      {inicial(usuario)}
                    </span>
                    <span className="truncate">{usuario.nombre || usuario.email}</span>
                  </p>
                  <a
                    href={rutas.perfil}
                    onClick={() => setMenuAbierto(false)}
                    aria-current={pagina === 'perfil' ? 'page' : undefined}
                    className="corte-poly-sm block px-3 py-3 font-mono text-sm uppercase tracking-widest text-white/70 hover:text-neon"
                  >
                    Perfil
                  </a>
                  <button
                    type="button"
                    onClick={salir}
                    className="corte-poly-sm block w-full px-3 py-3 text-left font-mono text-sm uppercase tracking-widest text-red-300 hover:bg-white/5"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <a
                  href={rutaEntrar(hash)}
                  onClick={() => setMenuAbierto(false)}
                  className="corte-poly-sm block bg-neon px-3 py-3 text-center font-mono text-sm font-bold uppercase tracking-widest text-base"
                >
                  Entrar
                </a>
              )}
            </li>
            {instalar && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMenuAbierto(false);
                    instalar();
                  }}
                  className={`mt-1 w-full py-3 ${CLASE_BOTON_INSTALAR}`}
                >
                  Instalar app
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}

export default BarraSuperior;
