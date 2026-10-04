import { rutas } from '../../rutas';
import { alSalirPorEnlace } from './cambios';

// Secciones agrupadas por tarea: enseñar (módulos, prácticas, herramientas),
// personas y sistema. Ver docs/plataforma/05_panel_de_administracion.md.
const SECCIONES = [
  { titulo: null, entradas: [{ grupo: 'resumen', texto: 'Resumen', href: rutas.admin, icono: '◆' }] },
  {
    titulo: 'Enseñanza',
    entradas: [
      { grupo: 'contenido', texto: 'Módulos', href: rutas.adminContenido, icono: '▤' },
      { grupo: 'practicas', texto: 'Prácticas de Blender', href: rutas.adminPracticas, icono: '⬢' },
      { grupo: 'herramientas', texto: 'Herramientas', href: rutas.adminHerramientas, icono: '✦' },
    ],
  },
  { titulo: 'Personas', entradas: [{ grupo: 'usuarios', texto: 'Usuarios', href: rutas.adminUsuarios, icono: '◎' }] },
  { titulo: 'Sistema', entradas: [{ grupo: 'sistema', texto: 'Estado', href: rutas.adminSistema, icono: '⚙', soloAdmin: true }] },
];

// Navegación del panel: pestañas desplazables en móvil, columna lateral en escritorio.
function NavAdmin({ grupo, esAdmin }) {
  const secciones = SECCIONES.map((s) => ({ ...s, entradas: s.entradas.filter((e) => esAdmin || !e.soloAdmin) })).filter(
    (s) => s.entradas.length,
  );
  return (
    <nav aria-label="Secciones de administración" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-4 lg:overflow-visible lg:px-0">
        {secciones.map((seccion) => (
          <li key={seccion.titulo ?? 'inicio'} className="flex shrink-0 gap-1 lg:flex-col">
            {seccion.titulo && (
              <p className="hidden px-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 lg:block">{seccion.titulo}</p>
            )}
            <ul className="flex gap-1 lg:flex-col">
              {seccion.entradas.map((entrada) => {
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
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default NavAdmin;
