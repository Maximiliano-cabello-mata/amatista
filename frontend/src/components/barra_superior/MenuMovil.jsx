import Avatar from '../../avatares/Avatar';
import { useAvatar } from '../../avatares/contexto';
import { rutaEntrar, rutas } from '../../rutas';
import {
  IconoAFrame,
  IconoBiblioteca,
  IconoBlender,
  IconoEcosistema,
  IconoGeoda,
} from '../Iconos';
import { CLASE_BOTON_INSTALAR, PAGINAS_CURSOS } from './constantes';

const HERRAMIENTAS_MOVIL = [
  { href: rutas.blender, titulo: 'Conectar mi Blender', desc: 'Amatista Motor en PC', Icono: IconoBlender },
  { href: rutas.biblioteca, titulo: 'Biblioteca 3D', desc: 'Recursos libres CC0', Icono: IconoBiblioteca },
  { href: rutas.estudio, titulo: 'Estudio Web 3D', desc: 'Escenas A-Frame y VR', Icono: IconoAFrame },
  { href: rutas.geoda, titulo: 'Ajustar a mi PC (Geoda)', desc: 'Diagnóstico de tu equipo', Icono: IconoGeoda },
  { href: rutas.ecosistema, titulo: '¿Qué es cada cosa?', desc: 'Guía de la plataforma', Icono: IconoEcosistema },
];

const inicial = (usuario) => (usuario?.nombre || usuario?.email || '?').trim().charAt(0).toUpperCase();

export default function MenuMovil({
  pagina,
  hash,
  usuario,
  verAdmin,
  verEvaluar,
  instalar,
  alCerrar,
  alSalir,
}) {
  const { avatar } = useAvatar();

  return (
    <nav id="menu-principal" aria-label="Principal" className="animar-entrar border-t border-white/5 bg-base/95 md:hidden">
      <ul className="mx-auto grid max-w-6xl gap-1 px-4 py-3">
        <li>
          <a
            href={rutas.inicio}
            onClick={alCerrar}
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
            onClick={alCerrar}
            aria-current={pagina === 'panel' ? 'page' : undefined}
            className={`corte-poly-sm block px-3 py-3 font-mono text-sm uppercase tracking-widest ${
              pagina === 'panel' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-neon'
            }`}
          >
            Mi panel · Clase (Alumno)
          </a>
        </li>
        {verEvaluar && (
          <li>
            <a
              href={rutas.profesor}
              onClick={alCerrar}
              aria-current={pagina === 'profesor' ? 'page' : undefined}
              className={`corte-poly-sm block px-3 py-3 font-mono text-sm uppercase tracking-widest ${
                pagina === 'profesor' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-neon'
              }`}
            >
              Profesor · Recrear 3D
            </a>
          </li>
        )}
        {verAdmin && (
          <li>
            <a
              href={rutas.admin}
              onClick={alCerrar}
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
                  onClick={alCerrar}
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
              <div className="flex items-center gap-2.5 px-3 pb-2 pt-1">
                <Avatar id={avatar} inicial={inicial(usuario)} foto={usuario.foto} />
                <div className="min-w-0 flex-1">
                  {usuario.nombre && <p className="truncate text-sm font-bold text-white">{usuario.nombre}</p>}
                  <p className="truncate text-xs text-white/50">{usuario.email}</p>
                </div>
              </div>
              <a
                href={rutas.perfil}
                onClick={alCerrar}
                aria-current={pagina === 'perfil' ? 'page' : undefined}
                className="corte-poly-sm block px-3 py-3 font-mono text-sm uppercase tracking-widest text-white/70 hover:text-neon"
              >
                Perfil
              </a>
              <a
                href={rutas.guia}
                onClick={alCerrar}
                aria-current={pagina === 'guia' ? 'page' : undefined}
                className="corte-poly-sm block px-3 py-3 font-mono text-sm uppercase tracking-widest text-white/70 hover:text-neon"
              >
                Ayuda
              </a>
              <a
                href={rutas.buzon}
                onClick={alCerrar}
                aria-current={pagina === 'buzon' ? 'page' : undefined}
                className="corte-poly-sm block px-3 py-3 font-mono text-sm uppercase tracking-widest text-white/70 hover:text-neon"
              >
                Buzón del creador
              </a>
              <button
                type="button"
                onClick={alSalir}
                className="corte-poly-sm block w-full px-3 py-3 text-left font-mono text-sm uppercase tracking-widest text-red-300 hover:bg-white/5"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <a
              href={rutaEntrar(hash)}
              onClick={alCerrar}
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
                alCerrar();
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
  );
}
