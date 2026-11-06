// Botón oficial y accesible de «Continuar con Google» (v5.0 · Identidad y Cuentas).
// Compatible con Google Identity Services (GIS).
import { useEffect, useRef, useState } from 'react';

export function IconoGoogle({ className = 'h-5 w-5 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.26v3.15C3.27 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.41l4.02-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.64 1.26 6.59l4.02 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
      />
    </svg>
  );
}

export function SeparadorO({ texto = 'o con tu correo' }) {
  return (
    <div className="relative my-4 flex items-center justify-center">
      <span className="linea-horizonte" aria-hidden="true" />
      <span className="mx-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white/45">
        {texto}
      </span>
      <span className="linea-horizonte" aria-hidden="true" />
    </div>
  );
}

function BotonGoogle({
  alAutenticar,
  texto = 'Continuar con Google',
  deshabilitado = false,
  className = '',
}) {
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');
  const [gisListo, setGisListo] = useState(false);
  const contenedorGis = useRef(null);
  const clienteId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clienteId || typeof window === 'undefined') return;

    let montado = true;

    const inicializar = () => {
      if (!montado || !window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clienteId,
          callback: async (respuesta) => {
            if (!respuesta?.credential) return;
            setCargando(true);
            setErrorLocal('');
            try {
              const res = await alAutenticar(respuesta.credential);
              if (!res.ok) setErrorLocal(res.error || 'No se pudo iniciar sesión con Google.');
            } finally {
              setCargando(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (contenedorGis.current) {
          contenedorGis.current.innerHTML = '';
          window.google.accounts.id.renderButton(contenedorGis.current, {
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: 320,
            locale: 'es',
            logo_alignment: 'left',
          });
        }

        // Prompt de Google One-Tap si está disponible (gestión limpia de notificación)
        window.google.accounts.id.prompt((notification) => {
          if (notification?.isNotDisplayed?.()) {
            // One-Tap no mostrado (e.g. origen local pendiente en Google Console o navegación privada)
          }
        });
        setGisListo(true);
      } catch (err) {
        console.warn('Google Identity Services no pudo inicializar:', err);
      }
    };

    if (window.google?.accounts?.id) {
      inicializar();
    } else {
      let script = document.getElementById('google-jssdk');
      if (!script) {
        script = document.createElement('script');
        script.id = 'google-jssdk';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', inicializar);
    }

    return () => {
      montado = false;
    };
  }, [clienteId, alAutenticar]);

  const manejarClicFallback = async () => {
    if (deshabilitado || cargando) return;
    setErrorLocal('');

    if (clienteId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    // El acceso con un correo escrito a mano solo existe en desarrollo (el servidor además exige
    // AMATISTA_GOOGLE_PRUEBAS=1). En producción, sin Client ID, el botón no se muestra.
    if (!import.meta.env.DEV) {
      setErrorLocal('El inicio con Google no está disponible en este momento.');
      return;
    }

    const correoPrueba = window.prompt(
      'Introduce un correo de Google para probar el inicio de sesión:',
      'alumno.prueba@gmail.com'
    );
    if (!correoPrueba) return;

    setCargando(true);
    try {
      const tokenSintetico = `test_google_${correoPrueba.trim()}_Alumno+Google`;
      const res = await alAutenticar(tokenSintetico);
      if (!res.ok) setErrorLocal(res.error || 'Error al autenticar.');
    } catch {
      setErrorLocal('Ocurrió un error inesperado al conectar.');
    } finally {
      setCargando(false);
    }
  };

  // Sin Client ID en producción no hay forma segura de entrar con Google: no se ofrece.
  if (!clienteId && !import.meta.env.DEV) return null;

  return (
    <div className={`w-full ${className}`}>
      {/* Contenedor del botón oficial de Google GIS */}
      <div
        ref={contenedorGis}
        className={`flex justify-center w-full min-h-[44px] ${gisListo ? '' : 'hidden'}`}
      />

      {/* Botón visual nativo de Amatista si GIS aún no ha montado su iframe o si no hay Client ID */}
      {!gisListo && (
        <button
          type="button"
          onClick={manejarClicFallback}
          disabled={deshabilitado || cargando}
          className="corte-poly-sm group relative flex w-full items-center justify-center gap-3 border border-white/15 bg-white/5 px-4 py-3 font-medium text-white shadow-sm transition-all hover:border-white/30 hover:bg-white/10 active:scale-[0.99] disabled:opacity-50"
        >
          {cargando ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-neon" />
          ) : (
            <IconoGoogle />
          )}
          <span className="font-sans text-sm font-semibold tracking-wide text-white">
            {cargando ? 'Conectando con Google…' : texto}
          </span>
          <span className="chip-hud corte-poly-sm ml-auto hidden text-[10px] text-neon sm:inline-flex">
            GOOGLE
          </span>
        </button>
      )}

      {errorLocal && (
        <p className="mt-2 text-center text-xs text-red-300" role="alert">
          {errorLocal}
        </p>
      )}
    </div>
  );
}

export default BotonGoogle;
