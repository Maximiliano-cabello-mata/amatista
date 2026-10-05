// «Un mundo por módulo» (portada, v3.3): cada módulo publicado con su
// escenario, su mascota y el jefe que espera al final.
import { rutas } from '../../rutas';
import Escenario from './Escenario';
import { SpriteMascota } from './Mascota';
import { mundosDelCatalogo } from './temas';

function MundosModulos({ cursos }) {
  const mundos = mundosDelCatalogo(cursos);
  if (mundos.length === 0) return null;
  return (
    <ul className="cv-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mundos.map(({ curso, modulo, tema }, i) => (
        <li key={`${curso.id}-${modulo.id}`} className="animar-entrar" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
          <a
            href={rutas.curso(curso.id)}
            className={`corte-poly-sm elevar group relative block overflow-hidden border ${tema.borde} bg-superficie/90 p-4`}
          >
            <Escenario tema={tema} className="pointer-events-none absolute inset-0 h-full w-full opacity-60 transition-opacity group-hover:opacity-90" />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base/95 via-base/50 to-transparent" aria-hidden="true" />
            <span className="relative flex items-end gap-3 pt-10">
              <SpriteMascota tema={tema} className="esc-flotar h-12 w-12 shrink-0" />
              <span className="min-w-0">
                <span className={`block truncate font-mono text-[10px] uppercase tracking-[0.15em] ${tema.texto}`}>
                  {curso.ruta === 'blender' ? curso.nivel : curso.titulo} · Módulo {modulo.numero}
                </span>
                <span className="block truncate font-extrabold text-white">{tema.nombre}</span>
                <span className="block truncate text-xs text-texto/70">
                  Te guía {tema.mascota.nombre} · jefe: {tema.jefe.nombre}
                </span>
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default MundosModulos;
