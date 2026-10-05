import { lazy, Suspense, useEffect, useState } from 'react';
import AuthProvider from './auth/AuthProvider';
import { useAuth } from './auth/contexto';
import CatalogoProvider from './catalogo/CatalogoProvider';
import BarraSuperior from './components/BarraSuperior';
import FondoLowPoly from './components/FondoLowPoly';
import { CristalLogo, IconoCandado } from './components/Iconos';
import Inicio from './pages/Inicio';
import ProgresoProvider from './progreso/ProgresoProvider';
import { analizarRuta, rutaEntrar, rutas } from './rutas';

// Páginas bajo demanda: la pantalla de inicio carga rápido.
// El laboratorio incluye A-Frame (~1.3 MB): solo se descarga si se visita.
// El panel de administración solo lo descarga quien tiene permiso.
const Curso = lazy(() => import('./pages/Curso'));
const Leccion = lazy(() => import('./pages/Leccion'));
const Laboratorio = lazy(() => import('./pages/Laboratorio'));
const Blender = lazy(() => import('./pages/Blender'));
const Vincular = lazy(() => import('./pages/Vincular'));
const Panel = lazy(() => import('./pages/Panel'));
const Admin = lazy(() => import('./pages/admin/Admin'));
const Entrar = lazy(() => import('./pages/cuenta/Entrar'));
const Registro = lazy(() => import('./pages/cuenta/Registro'));
const Confirmar = lazy(() => import('./pages/cuenta/Confirmar'));
const Recuperar = lazy(() => import('./pages/cuenta/Recuperar'));
const Perfil = lazy(() => import('./pages/cuenta/Perfil'));

function useRuta() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const cambiar = () => {
      setHash(window.location.hash);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', cambiar);
    return () => window.removeEventListener('hashchange', cambiar);
  }, []);
  return { ruta: analizarRuta(hash), hash };
}

function Cargando() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status">
      <div className="flex flex-col items-center gap-3">
        <CristalLogo className="animar-flotar h-14 w-14" />
        <span className="font-mono text-xs uppercase tracking-widest text-white/50">Cargando…</span>
      </div>
    </div>
  );
}

// El panel de administración es para profesores y administradores. El
// servidor valida el rol en cada petición; aquí solo se evita mostrarlo.
function RutaAdmin({ ruta, hash }) {
  const { listo, usuario, esProfesor } = useAuth();
  if (!listo) return <Cargando />;
  if (esProfesor) return <Admin seccion={ruta.seccion} params={ruta.params} />;
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <IconoCandado className="mx-auto h-12 w-12 text-white/40" />
      <h1 className="mt-4 text-3xl font-extrabold text-white">Área de profesores</h1>
      <p className="mt-3 text-texto/75">
        {usuario
          ? 'Tu cuenta no tiene permiso para ver el panel de administración. Si eres profesor, pide a un administrador que te asigne el rol.'
          : 'Entra con una cuenta de profesor o administrador para ver el panel.'}
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
          href={rutas.inicio}
          className="corte-poly-sm inline-block bg-white/5 px-6 py-3 font-extrabold uppercase tracking-widest text-white/80 hover:bg-white/10"
        >
          ◂ Volver a los cursos
        </a>
      </div>
    </main>
  );
}

function Pagina({ ruta, hash }) {
  switch (ruta.pagina) {
    case 'curso':
      return <Curso cursoId={ruta.cursoId} />;
    case 'leccion':
      return <Leccion cursoId={ruta.cursoId} leccionId={ruta.leccionId} />;
    case 'laboratorio':
      return <Laboratorio />;
    case 'panel':
      return <Panel />;
    case 'blender':
      return <Blender />;
    case 'vincular':
      return <Vincular consulta={ruta.consulta} />;
    case 'entrar':
      return <Entrar consulta={ruta.consulta} />;
    case 'registro':
      return <Registro consulta={ruta.consulta} />;
    case 'confirmar':
      return <Confirmar consulta={ruta.consulta} />;
    case 'recuperar':
      return <Recuperar consulta={ruta.consulta} />;
    case 'perfil':
      return <Perfil />;
    case 'admin':
      return <RutaAdmin ruta={ruta} hash={hash} />;
    default:
      return <Inicio />;
  }
}

function App() {
  const { ruta, hash } = useRuta();

  return (
    <div className="min-h-screen">
      <FondoLowPoly />
      <AuthProvider>
        <CatalogoProvider>
          <ProgresoProvider>
            <BarraSuperior ruta={ruta} hash={hash} />
            <Suspense fallback={<Cargando />}>
              {/* Cada cambio de página entra con un fundido corto (sin animación en modo ligero). */}
              <div key={`${ruta.pagina}:${ruta.cursoId ?? ''}:${ruta.leccionId ?? ''}`} className="animar-pagina">
                <Pagina ruta={ruta} hash={hash} />
              </div>
            </Suspense>
          </ProgresoProvider>
        </CatalogoProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
