import { useAuth } from '../../auth/contexto';
import { IconoCandado } from '../Iconos';
import { rutaEntrar, rutas } from '../../rutas';

export default function RutaProtegida({
  hash,
  titulo,
  mensajeConUsuario,
  mensajeSinUsuario,
  botonVolver = { href: rutas.inicio, texto: '◂ Volver a los cursos' },
  fallbackCargando,
  children,
}) {
  const { listo, usuario, esProfesor } = useAuth();
  if (!listo) return fallbackCargando;
  if (esProfesor) return children;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <IconoCandado className="mx-auto h-12 w-12 text-white/40" />
      <h1 className="mt-4 text-3xl font-extrabold text-white">{titulo}</h1>
      <p className="mt-3 text-texto/75">
        {usuario ? mensajeConUsuario : mensajeSinUsuario}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {!usuario && (
          <a
            href={rutaEntrar(hash)}
            className="corte-poly-sm destello inline-block bg-amatista px-6 py-3 font-extrabold uppercase tracking-widest text-white hover:brightness-110"
          >
            Entrar ▶
          </a>
        )}
        <a
          href={botonVolver.href}
          className="corte-poly-sm inline-block bg-white/5 px-6 py-3 font-extrabold uppercase tracking-widest text-white/80 hover:bg-white/10"
        >
          {botonVolver.texto}
        </a>
      </div>
    </main>
  );
}
