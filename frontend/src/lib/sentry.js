// Errores de la PWA a Sentry, solo si se compiló con VITE_SENTRY_DSN.
// Sin esa variable no se descarga nada: el SDK vive en su propio trozo y solo
// se importa cuando hay DSN. Nunca se envían datos personales: ni IP, ni
// correo, ni el contenido de los formularios. docs/despliegue/2026-10-31_sentry.md

const PRIVADAS = ['authorization', 'cookie', 'x-sesion-id'];

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
  if (!dsn || typeof window === 'undefined') return false;
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
    return true;
  } catch {
    return false; // Sentry nunca rompe la plataforma
  }
}
