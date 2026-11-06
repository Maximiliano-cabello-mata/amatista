import { lazy, Suspense, useEffect, useState } from 'react';
import AuthProvider from './auth/AuthProvider';
import AvatarProvider from './avatares/AvatarProvider';
import CatalogoProvider from './catalogo/CatalogoProvider';
import BarraLateralHerramientas from './components/BarraLateralHerramientas';
import BarraSuperior from './components/BarraSuperior';
import FondoLowPoly from './components/FondoLowPoly';
import PiePagina from './components/estructura/PiePagina';
import { CristalLogo } from './components/Iconos';
const cargarInicio = () => import('./pages/Inicio');
const Inicio = lazy(cargarInicio);
import ProgresoProvider from './progreso/ProgresoProvider';
import RecorridoProvider from './recorrido/RecorridoProvider';
import { analizarRuta, rutas } from './rutas';
import BarraVista from './vista/BarraVista';
import VistaProvider from './vista/VistaProvider';
import RutaProtegida from './components/rutas/RutaProtegida';

// Si la primera vista es la portada (#/), arranca su descarga de inmediato sin bloquear otras rutas.
if (typeof window !== 'undefined' && (!window.location.hash || window.location.hash === '#' || window.location.hash.startsWith('#/?') || window.location.hash === '#/')) {
  cargarInicio();
}

// Páginas bajo demanda: la pantalla de inicio carga rápido.
// El laboratorio incluye A-Frame (~1.3 MB): solo se descarga si se visita.
// El panel de administración solo lo descarga quien tiene permiso.
const Estudio = lazy(() => import('./pages/Estudio'));
const Curso = lazy(() => import('./pages/Curso'));
const Leccion = lazy(() => import('./pages/Leccion'));
const Laboratorio = lazy(() => import('./pages/Laboratorio'));
const Blender = lazy(() => import('./pages/Blender'));
const Vincular = lazy(() => import('./pages/Vincular'));
const Panel = lazy(() => import('./pages/Panel'));
const Admin = lazy(() => import('./pages/admin/Admin'));
const Profesor = lazy(() => import('./pages/profesor/Profesor'));
const Entrar = lazy(() => import('./pages/cuenta/Entrar'));
const Registro = lazy(() => import('./pages/cuenta/Registro'));
const Confirmar = lazy(() => import('./pages/cuenta/Confirmar'));
const Recuperar = lazy(() => import('./pages/cuenta/Recuperar'));
const Perfil = lazy(() => import('./pages/cuenta/Perfil'));
const Guia = lazy(() => import('./pages/Guia'));
const Buzon = lazy(() => import('./pages/Buzon'));
const Geoda = lazy(() => import('./pages/Geoda'));
const Biblioteca = lazy(() => import('./pages/Biblioteca'));
const Ecosistema = lazy(() => import('./pages/Ecosistema'));
// Goliat, el compañero de toda la plataforma: llega en reposo después del primer pintado.
const Goliat = lazy(() => import('./goliat/Goliat'));

function useDiferidoEnReposo(esperaMs = 1200) {
  const [listo, setListo] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setListo(true), { timeout: esperaMs });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setListo(true), 250);
    return () => window.clearTimeout(id);
  }, [esperaMs]);
  return listo;
}

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
  return (
    <RutaProtegida
      hash={hash}
      titulo="Área de profesores"
      mensajeConUsuario="Tu cuenta no tiene permiso para ver el panel de administración. Si eres profesor, pide a un administrador que te asigne el rol."
      mensajeSinUsuario="Entra con una cuenta de profesor o administrador para ver el panel."
      fallbackCargando={<Cargando />}
    >
      <Admin seccion={ruta.seccion} params={ruta.params} />
    </RutaProtegida>
  );
}

// El panel del profesor evaluador: para profesores (y administradores que también dan clase).
function RutaProfesor({ ruta, hash }) {
  return (
    <RutaProtegida
      hash={hash}
      titulo="Panel del profesor"
      mensajeConUsuario="Tu cuenta es de alumno. Si eres profesor, pide a un administrador que te asigne el rol. Si tu profesor te dio un código, escríbelo en Mi panel › Mi grupo."
      mensajeSinUsuario="Entra con tu cuenta de profesor para ver tus grupos y las entregas de tus alumnos."
      botonVolver={{ href: rutas.panel, texto: 'Ir a Mi panel' }}
      fallbackCargando={<Cargando />}
    >
      <Profesor seccion={ruta.seccion} params={ruta.params} />
    </RutaProtegida>
  );
}

function Pagina({ ruta, hash }) {
  switch (ruta.pagina) {
    case 'estudio':
      return <Estudio />;
    case 'curso':
      return <Curso cursoId={ruta.cursoId} consulta={ruta.consulta} />;
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
    case 'guia':
      return <Guia />;
    case 'buzon':
      return <Buzon consulta={ruta.consulta} />;
    case 'geoda':
      return <Geoda />;
    case 'biblioteca':
      return <Biblioteca />;
    case 'ecosistema':
      return <Ecosistema />;
    case 'admin':
      return <RutaAdmin ruta={ruta} hash={hash} />;
    case 'profesor':
      return <RutaProfesor ruta={ruta} hash={hash} />;
    default:
      return <Inicio consulta={ruta.consulta} />;
  }
}

// Las rutas son por hash: el enlace «Saltar al contenido» mueve el foco sin cambiar la página.
function saltarAlContenido(evento) {
  evento.preventDefault();
  const contenido = document.getElementById('contenido');
  contenido?.focus();
  contenido?.scrollIntoView({ block: 'start' });
}

function App() {
  const { ruta, hash } = useRuta();
  const goliatListo = useDiferidoEnReposo();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Accesibilidad: con el teclado, el primer Tab ofrece saltar la barra e ir directo al contenido. */}
      <a href="#contenido" onClick={saltarAlContenido} className="saltar-contenido">
        Saltar al contenido
      </a>
      <FondoLowPoly />
      <AuthProvider>
        <AvatarProvider>
        <VistaProvider>
        <CatalogoProvider>
          <ProgresoProvider>
            <RecorridoProvider>
              <BarraSuperior ruta={ruta} hash={hash} />
              <BarraLateralHerramientas pagina={ruta.pagina} />
              <BarraVista pagina={ruta.pagina} />
              <Suspense fallback={<Cargando />}>
                {/* Cada cambio de página entra con un fundido corto (sin animación en modo ligero). */}
                <div
                  key={`${ruta.pagina}:${ruta.cursoId ?? ''}:${ruta.leccionId ?? ''}:${ruta.pagina === 'profesor' ? `${ruta.seccion}:${ruta.params?.id ?? ''}` : ''}`}
                  id="contenido"
                  tabIndex={-1}
                  className="animar-pagina flex-1 outline-none"
                >
                  <Pagina ruta={ruta} hash={hash} />
                </div>
              </Suspense>
              <PiePagina />
              {goliatListo && (
                <Suspense fallback={null}>
                  <Goliat />
                </Suspense>
              )}
            </RecorridoProvider>
          </ProgresoProvider>
        </CatalogoProvider>
        </VistaProvider>
        </AvatarProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
