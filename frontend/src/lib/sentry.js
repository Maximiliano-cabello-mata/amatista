// Errores de la PWA a Sentry, solo si se compiló con VITE_SENTRY_DSN.
// Sin esa variable no se descarga nada: el SDK vive en su propio trozo y solo
// se importa cuando hay DSN. Nunca se envían datos personales: ni IP, ni
// correo, ni el contenido de los formularios. docs/despliegue/2026-10-31_sentry.md

const PRIVADAS = ['authorization', 'cookie', 'x-sesion-id'];

// Solo registra un estado técnico; nunca expone el DSN, datos de usuario ni errores.
// En producción se consulta con window.__AMATISTA_SENTRY_ESTADO__ en DevTools.
function marcarEstado(estado) {
  if (typeof window !== 'undefined') window.__AMATISTA_SENTRY_ESTADO__ = estado;
}

// Quita del evento lo que pueda identificar a un alumno.
export function limpiar(evento) {
  if (!evento) return evento;
  delete evento.user;
  const peticion = evento.request;
  if (peticion) {
    delete peticion.cookies;
    delete peticion.data;
    delete peticion.query_string;
    if (peticion.url) peticion.url = peticion.url.split('?')[0];
    if (peticion.headers) {
      peticion.headers = Object.fromEntries(
        Object.entries(peticion.headers).filter(([k]) => !PRIVADAS.includes(k.toLowerCase())),
      );
    }
  }
  return evento;
}

export async function iniciarSentry(dsn = import.meta.env.VITE_SENTRY_DSN) {
  if (typeof window === 'undefined') return false;
  if (!dsn) {
    marcarEstado('sin-dsn');
    return false;
  }
  marcarEstado('cargando');
  try {
    const Sentry = await import('./sentrySdk');
    Sentry.init({
      dsn,
      environment: import.meta.env.VITE_SENTRY_ENTORNO || import.meta.env.MODE,
      release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
      sendDefaultPii: false,
      // Solo errores: sin trazas ni grabación de pantalla (ahorro de datos).
      tracesSampleRate: 0,
      beforeSend: limpiar,
      beforeBreadcrumb: (miga) => (miga?.category === 'ui.input' ? null : miga),
    });
    // Una importación correcta no garantiza que un DSN válido haya creado cliente.
    if (typeof Sentry.getClient === 'function' && !Sentry.getClient()) {
      marcarEstado('sin-cliente');
      return false;
    }
    marcarEstado('activo');
    return true;
  } catch {
    marcarEstado('fallo');
    return false; // Sentry nunca rompe la plataforma
  }
}
