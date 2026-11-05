import { useCallback, useRef, useState } from 'react';
import { useAuth } from '../auth/contexto';
import { useConexion } from '../hooks/useConexion';
import { useInstalarPWA } from '../hooks/useInstalarPWA';
import { useCerrarFuera } from '../hooks/useCerrarFuera';
import { useProgreso } from '../progreso/contexto';
import { navegar, rutaEntrar, rutas } from '../rutas';
import { useVista } from '../vista/contexto';
import { CristalLogo } from './Iconos';
import IndicadorXP from './barra_superior/IndicadorXP';
import MenuCuenta from './barra_superior/MenuCuenta';
import MenuMovil from './barra_superior/MenuMovil';
import { CLASE_BOTON_INSTALAR, PAGINAS_CURSOS } from './barra_superior/constantes';

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

function BarraSuperior({ ruta, hash = '' }) {
  const enLinea = useConexion();
  const instalar = useInstalarPWA();
  const { xp, nivel } = useProgreso();
  const { usuario, esProfesor, esAdmin, cerrarSesion } = useAuth();
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
  const verAdmin = esAdmin && !comoAlumno;
  const verEvaluar = esProfesor && !comoAlumno;
  const enCuenta = ['entrar', 'registro', 'confirmar', 'recuperar'].includes(pagina);

  const salir = async () => {
    setMenuAbierto(false);
    await cerrarSesion();
    if (pagina === 'perfil' || pagina === 'admin' || pagina === 'profesor') navegar(rutas.inicio);
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
            {verEvaluar && (
              <li>
                <a
                  href={rutas.profesor}
                  aria-current={pagina === 'profesor' ? 'page' : undefined}
                  className={`nav-principal__enlace ${pagina === 'profesor' ? 'nav-principal__enlace--activo' : ''}`}
                >
                  Evaluar
                </a>
              </li>
            )}
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
        <MenuMovil
          pagina={pagina}
          hash={hash}
          usuario={usuario}
          verAdmin={verAdmin}
          verEvaluar={verEvaluar}
          instalar={instalar}
          alCerrar={() => setMenuAbierto(false)}
          alSalir={salir}
        />
      )}
    </header>
  );
}

export default BarraSuperior;
