import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/contexto';
import Avatar from '../avatares/Avatar';
import { useAvatar } from '../avatares/contexto';
import { useConexion } from '../hooks/useConexion';
import { useInstalarPWA } from '../hooks/useInstalarPWA';
import { useProgreso } from '../progreso/contexto';
import { navegar, rutaEntrar, rutas } from '../rutas';
import { useVista } from '../vista/contexto';
import {
  CristalLogo,
  IconoAFrame,
  IconoBiblioteca,
  IconoBlender,
  IconoCloud,
  IconoEcosistema,
  IconoGeoda,
} from './Iconos';

// «Cursos» reúne el camino guiado de cada programa (portada) y sus lecciones.
const PAGINAS_CURSOS = ['inicio', 'curso', 'leccion'];

const HERRAMIENTAS_MOVIL = [
  { href: rutas.nube, titulo: 'Blender en la nube', desc: 'UTN · Sin instalar', Icono: IconoCloud },
  { href: rutas.blender, titulo: 'Conectar mi Blender', desc: 'Amatista Motor en PC', Icono: IconoBlender },
  { href: rutas.biblioteca, titulo: 'Biblioteca 3D', desc: 'Recursos libres CC0', Icono: IconoBiblioteca },
  { href: rutas.estudio, titulo: 'Estudio Web 3D', desc: 'Escenas A-Frame y VR', Icono: IconoAFrame },
  { href: rutas.geoda, titulo: 'Ajustar a mi PC (Geoda)', desc: 'Diagnóstico de tu equipo', Icono: IconoGeoda },
  { href: rutas.ecosistema, titulo: '¿Qué es cada cosa?', desc: 'Guía de la plataforma', Icono: IconoEcosistema },
];

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
      <span className="hexagono grid h-5 w-6 place-items-center bg-amatista text-[11px] text-white" aria-hidden="true">
        {nivel.nivel}
      </span>
      <span aria-hidden="true">
        {xp} XP
      </span>
    </a>
  );
}

function EstadoConexion({ enLinea }) {
  if (enLinea) return null;
  return (
    <span
      role="status"
      className="corte-poly-sm flex items-center gap-2 border border-amatista-claro/40 bg-amatista/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-amatista-claro"
    >
      <span className="h-2 w-2 rotate-45 bg-amatista-claro" aria-hidden="true" />
      <span className="hidden lg:inline">Sin conexión</span>
      <span className="sr-only lg:hidden">Sin conexión</span>
    </span>
  );
}

const CLASE_BOTON_INSTALAR =
  'corte-poly-sm bg-amatista px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-amatista-claro hover:text-base';

function MenuCuenta({ usuario, alCerrarSesion }) {
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
      >
        <Avatar id={avatar} inicial={inicial(usuario)} />
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

function BarraSuperior({ ruta, hash = '' }) {
  const enLinea = useConexion();
  const instalar = useInstalarPWA();
  const { xp, nivel } = useProgreso();
  const { usuario, esProfesor, cerrarSesion } = useAuth();
  const { avatar } = useAvatar();
  const { comoAlumno } = useVista();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const barra = useRef(null);
  const botonMenu = useRef(null);
  const cerrarMenu = useCallback((devolverFoco) => {
    setMenuAbierto(false);
    if (devolverFoco) botonMenu.current?.focus();
  }, []);
  useCerrarFuera(menuAbierto, cerrarMenu, barra);

  const pagina = ruta?.pagina ?? 'inicio';
  const verAdmin = esProfesor && !comoAlumno;
  const enCuenta = ['entrar', 'registro', 'confirmar', 'recuperar'].includes(pagina);

  const salir = async () => {
    setMenuAbierto(false);
    await cerrarSesion();
    if (pagina === 'perfil' || pagina === 'admin') navegar(rutas.inicio);
  };

  return (
    <header ref={barra} className="sticky top-0 z-20 border-b border-white/5 bg-base/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href={rutas.inicio} className="flex shrink-0 items-center gap-3" aria-label="Amatista, inicio">
          <CristalLogo className="h-9 w-9 drop-shadow-[0_0_10px_rgba(155,89,182,0.6)]" />
          <span className="hidden text-xl font-extrabold tracking-[0.25em] text-white min-[440px]:inline">AMATISTA</span>
        </a>

        {/* Navegación central pura y limpia: solo lo esencial para el estudiante */}
        <nav className="hidden md:block" aria-label="Principal" data-recorrido="menu">
          <ul className="flex items-center gap-2">
            <li>
              <a
                href={rutas.inicio}
                aria-current={PAGINAS_CURSOS.includes(pagina) ? 'page' : undefined}
                className={`nav-principal__enlace ${PAGINAS_CURSOS.includes(pagina) ? 'nav-principal__enlace--activo' : ''}`}
              >
                Cursos
              </a>
            </li>
            <li>
              <a
                href={rutas.panel}
                aria-current={pagina === 'panel' ? 'page' : undefined}
                className={`nav-principal__enlace ${pagina === 'panel' ? 'nav-principal__enlace--activo' : ''}`}
              >
                Mi panel
              </a>
            </li>
            {verAdmin && (
              <li>
                <a
                  href={rutas.admin}
                  aria-current={pagina === 'admin' ? 'page' : undefined}
                  className={`nav-principal__enlace ${pagina === 'admin' ? 'nav-principal__enlace--activo' : ''}`}
                >
                  Admin
                </a>
              </li>
            )}
          </ul>
        </nav>

        {/* Lateral derecho: ayuda, experiencia, conexión y cuenta */}
        <div className="flex items-center gap-2">
          <a
            href={rutas.guia}
            aria-current={pagina === 'guia' ? 'page' : undefined}
            title="Ayuda: cómo funciona Amatista"
            data-recorrido="ayuda"
            className={`corte-poly-sm grid h-8 w-8 place-items-center border font-mono text-sm font-bold transition-colors ${
              pagina === 'guia' ? 'border-neon bg-neon/15 text-neon' : 'border-white/10 bg-superficie/80 text-white/70 hover:border-neon hover:text-neon'
            }`}
          >
            <span aria-hidden="true">?</span>
            <span className="sr-only">Ayuda: cómo funciona Amatista</span>
          </a>
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
                  className="boton boton--primario boton--chico destello"
                >
                  Entrar
                </a>
              )
            )}
          </div>
          <button
            ref={botonMenu}
            type="button"
            data-recorrido="menu"
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
            <li>
              <a
                href={rutas.inicio}
                onClick={() => setMenuAbierto(false)}
                aria-current={PAGINAS_CURSOS.includes(pagina) ? 'page' : undefined}
                className={`corte-poly-sm block px-3 py-3 font-mono text-sm uppercase tracking-widest ${
                  PAGINAS_CURSOS.includes(pagina) ? 'bg-white/10 text-white' : 'text-white/70 hover:text-neon'
                }`}
              >
                Cursos
              </a>
            </li>
            <li>
              <a
                href={rutas.panel}
                onClick={() => setMenuAbierto(false)}
                aria-current={pagina === 'panel' ? 'page' : undefined}
                className={`corte-poly-sm block px-3 py-3 font-mono text-sm uppercase tracking-widest ${
                  pagina === 'panel' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-neon'
                }`}
              >
                Mi panel
              </a>
            </li>
            {verAdmin && (
              <li>
                <a
                  href={rutas.admin}
                  onClick={() => setMenuAbierto(false)}
                  aria-current={pagina === 'admin' ? 'page' : undefined}
                  className={`corte-poly-sm block px-3 py-3 font-mono text-sm uppercase tracking-widest ${
                    pagina === 'admin' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-neon'
                  }`}
                >
                  Admin
                </a>
              </li>
            )}

            <li className="mt-2 border-t border-white/10 pt-3">
              <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                Herramientas
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {HERRAMIENTAS_MOVIL.map((item) => {
                  const Icono = item.Icono;
                  const activo = pagina === item.href.replace('#/', '');
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuAbierto(false)}
                      aria-current={activo ? 'page' : undefined}
                      className={`corte-poly-sm flex items-center gap-2 border p-2 ${
                        activo ? 'border-neon/60 bg-white/10 text-white' : 'border-white/10 bg-superficie/70 text-white/80 hover:text-neon'
                      }`}
                    >
                      <span className="hexagono grid h-7 w-8 shrink-0 place-items-center bg-black/45">
                        <Icono className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-white">{item.titulo}</span>
                        <span className="block truncate text-[10px] text-texto/60">{item.desc}</span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </li>

            <li className="mt-2 border-t border-white/10 pt-3">
              {usuario ? (
                <div className="grid gap-1">
                  <p className="flex items-center gap-2 px-3 pb-1 text-sm text-white">
                    <Avatar id={avatar} inicial={inicial(usuario)} />
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
                  <a
                    href={rutas.guia}
                    onClick={() => setMenuAbierto(false)}
                    aria-current={pagina === 'guia' ? 'page' : undefined}
                    className="corte-poly-sm block px-3 py-3 font-mono text-sm uppercase tracking-widest text-white/70 hover:text-neon"
                  >
                    Ayuda
                  </a>
                  <a
                    href={rutas.buzon}
                    onClick={() => setMenuAbierto(false)}
                    aria-current={pagina === 'buzon' ? 'page' : undefined}
                    className="corte-poly-sm block px-3 py-3 font-mono text-sm uppercase tracking-widest text-white/70 hover:text-neon"
                  >
                    Buzón del creador
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
