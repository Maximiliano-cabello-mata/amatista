import { rutas } from '../../rutas';
import { alSalirPorEnlace } from './cambios';

const ENTRADAS = [
  { grupo: 'resumen', texto: 'Resumen', href: rutas.admin, icono: '◆' },
  { grupo: 'usuarios', texto: 'Usuarios', href: rutas.adminUsuarios, icono: '◎' },
  { grupo: 'contenido', texto: 'Contenido', href: rutas.adminContenido, icono: '▤' },
  { grupo: 'practicas', texto: 'Prácticas', href: rutas.adminPracticas, icono: '⬢' },
  { grupo: 'sistema', texto: 'Sistema', href: rutas.adminSistema, icono: '⚙', soloAdmin: true },
];

// Navegación del panel: pestañas desplazables en móvil, columna lateral en escritorio.
function NavAdmin({ grupo, esAdmin }) {
  const entradas = ENTRADAS.filter((entrada) => esAdmin || !entrada.soloAdmin);
  return (
    <nav aria-label="Secciones de administración" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {entradas.map((entrada) => {
          const actual = entrada.grupo === grupo;
          return (
            <li key={entrada.grupo} className="shrink-0">
              <a
                href={entrada.href}
                onClick={alSalirPorEnlace}
                aria-current={actual ? 'page' : undefined}
                className={`corte-poly-sm flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition ${
                  actual ? 'bg-amatista text-white' : 'bg-white/5 text-white/65 hover:bg-white/10 hover:text-neon'
                }`}
              >
                <span aria-hidden="true">{entrada.icono}</span>
                {entrada.texto}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default NavAdmin;
