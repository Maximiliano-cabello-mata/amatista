// src/services/api.js
// Cliente del backend. Ninguna función lanza: todas devuelven
// {ok, status, datos, error} con el error ya escrito en español para mostrarlo.
// Dominio oficial (docs/despliegue/2026-10-04_dominio_amatista-3d.md): la PWA
// vive en amatista-3d.me y la API en api.amatista-3d.me, las dos con HTTPS.
export const DOMINIO = "amatista-3d.me";
export const API_DEL_DOMINIO = `https://api.${DOMINIO}`;
// IP de la VM, sin HTTPS: compilaciones sin VITE_API_URL fuera del dominio y
// `npm run dev` en tu computadora (habla con el servidor real). Desde https el
// navegador la bloquea.
const API_POR_IP = "http://158.101.118.222:8000";

// VITE_API_URL manda (para tu backend local: frontend/.env con
// VITE_API_URL=http://localhost:8000). Sin ella: en el dominio, su API; en
// cualquier otro lado, incluida tu computadora, la VM. Así `npm run dev` sin
// .env ya no dice «No se pudo contactar al servidor» (incidencia 2026-10-05).
export function apiPorDefecto(host = typeof window === "undefined" ? "" : window.location.hostname) {
  if (host === DOMINIO || host.endsWith(`.${DOMINIO}`)) return API_DEL_DOMINIO;
  return API_POR_IP;
}

export const API_URL = import.meta.env.VITE_API_URL || apiPorDefecto();

const ESPERA_POR_DEFECTO = 8000;

// Un sitio servido por https no puede llamar a un backend http: el navegador
// lo bloquea ("mixed content"). En ese caso ni lo intentamos.
export function sincronizacionDisponible() {
  return Boolean(API_URL) && !(window.location.protocol === "https:" && API_URL.startsWith("http:"));
}

// Mensajes por código cuando el servidor no manda un "detail" legible.
const MENSAJES_ESTADO = {
  400: "Revisa los datos e intenta de nuevo.",
  401: "Inicia sesión para continuar.",
  403: "No tienes permiso para esta acción.",
  404: "El servidor todavía no tiene esta función. Puede que necesite actualizarse.",
  409: "Ese dato ya existe en el servidor.",
  413: "Los datos enviados son demasiado grandes.",
  422: "Revisa los datos: hay campos con valores no válidos.",
  423: "La cuenta está bloqueada temporalmente. Intenta más tarde.",
  429: "Demasiados intentos seguidos. Espera un momento y vuelve a intentarlo.",
};

// Errores de validación de FastAPI/Pydantic (422): los mensajes propios del
// backend ya vienen en español; los genéricos de Pydantic están en inglés.
const TIPOS_GENERICOS = /^(missing|string_|int_|float_|bool_|greater_than|less_than|too_|json_|dict_|list_|model_|datetime|url_|literal_|enum|extra_forbidden)/;

function mensajeValidacion(detalle) {
  const primero = detalle.find((error) => error && typeof error.msg === "string");
  if (!primero) return MENSAJES_ESTADO[422];
  if (TIPOS_GENERICOS.test(primero.type ?? "")) {
    const campo = Array.isArray(primero.loc) ? primero.loc[primero.loc.length - 1] : null;
    if (primero.type === "missing") return campo ? `Falta el dato «${campo}».` : "Falta un dato obligatorio.";
    return campo ? `El dato «${campo}» no es válido.` : MENSAJES_ESTADO[422];
  }
  return primero.msg.replace(/^Value error,\s*/i, "");
}

export function mensajeDeError(status, datos) {
  const detalle = datos?.detail;
  if (typeof detalle === "string" && detalle && detalle !== "Not Found") return detalle;
  if (Array.isArray(detalle)) return mensajeValidacion(detalle);
  if (MENSAJES_ESTADO[status]) return MENSAJES_ESTADO[status];
  if (status >= 500) return `El servidor tuvo un problema (${status}). Intenta más tarde.`;
  return `El servidor respondió ${status}.`;
}

// fetch con tiempo máximo: si el servidor no responde, no dejamos la app esperando.
export async function pedirJSON(ruta, { metodo = "GET", cuerpo, token, espera = ESPERA_POR_DEFECTO, cabeceras } = {}) {
  if (!sincronizacionDisponible()) {
    return {
      ok: false,
      status: 0,
      datos: null,
      error: "El servidor no está disponible desde este sitio (requiere https).",
    };
  }
  const headers = { Accept: "application/json", ...cabeceras };
  if (cuerpo !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), espera);
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal: control.signal,
    });
  } catch (error) {
    const agotado = error?.name === "AbortError";
    return {
      ok: false,
      status: 0,
      datos: null,
      error: agotado
        ? "El servidor tardó demasiado en responder. Intenta de nuevo."
        : "No se pudo contactar al servidor. Revisa tu conexión.",
    };
  } finally {
    clearTimeout(temporizador);
  }

  let datos = null;
  if (respuesta.status !== 204 && respuesta.status !== 304) {
    const texto = await respuesta.text().catch(() => "");
    try {
      datos = texto ? JSON.parse(texto) : null;
    } catch {
      datos = null;
    }
  }
  return {
    ok: respuesta.ok,
    status: respuesta.status,
    datos,
    error: respuesta.ok ? null : mensajeDeError(respuesta.status, datos),
  };
}

// Descripción corta del navegador para la lista de sesiones de la cuenta.
function dispositivo() {
  return (navigator.userAgent || "web").substring(0, 200);
}

// --- Estado del servidor -------------------------------------------------------

// Estado del backend y de la base de datos (endpoint /api/salud).
export const consultarSalud = async () => {
  const { status, datos } = await pedirJSON("/api/salud");
  if (status === 0) return { backend: false, baseDatos: false, detalle: null };
  if (status === 404) {
    return { backend: true, baseDatos: false, detalle: "Este backend no tiene /api/salud: sube la versión nueva de backend/." };
  }
  return { backend: true, baseDatos: status === 200, detalle: datos?.detail ?? datos?.motor ?? null };
};

// --- Cuentas (/api/auth) ------------------------------------------------------

export const registrar = (datos) =>
  pedirJSON("/api/auth/registro", { metodo: "POST", cuerpo: { dispositivo: dispositivo(), ...datos } });

export const iniciarSesion = (datos) =>
  pedirJSON("/api/auth/iniciar-sesion", { metodo: "POST", cuerpo: { dispositivo: dispositivo(), ...datos } });

export const cerrarSesion = (token) => pedirJSON("/api/auth/cerrar-sesion", { metodo: "POST", token, espera: 4000 });

export const cerrarTodas = (token) => pedirJSON("/api/auth/cerrar-todas", { metodo: "POST", token });

export const obtenerYo = (token) => pedirJSON("/api/auth/yo", { token });

export const actualizarYo = (token, datos) => pedirJSON("/api/auth/yo", { metodo: "PATCH", token, cuerpo: datos });

export const confirmarCorreo = (email, codigo) =>
  pedirJSON("/api/auth/confirmar-correo", { metodo: "POST", cuerpo: { email, codigo } });

export const reenviarCodigo = (email) => pedirJSON("/api/auth/reenviar-codigo", { metodo: "POST", cuerpo: { email } });

export const recuperarCuenta = (email) => pedirJSON("/api/auth/recuperar", { metodo: "POST", cuerpo: { email } });

export const restablecerPassword = (datos) => pedirJSON("/api/auth/restablecer", { metodo: "POST", cuerpo: datos });

export const cambiarPassword = (token, datos) =>
  pedirJSON("/api/auth/cambiar-password", { metodo: "POST", token, cuerpo: datos });

// --- Progreso y eventos ------------------------------------------------------------

// Con sesión el servidor toma la identidad del token (no se manda usuario_id);
// sin sesión se usa el id anónimo del dispositivo.
export const enviarProgreso = ({ token, usuarioId, eventos = [], insignias = [] }) =>
  pedirJSON("/api/progreso", {
    metodo: "POST",
    token,
    cuerpo: {
      ...(token ? {} : { usuario_id: usuarioId }),
      eventos,
      ...(insignias.length ? { insignias } : {}),
    },
  });

export const descargarProgreso = (token) => pedirJSON("/api/progreso", { token });

export const enviarEventos = ({ token, usuarioId, eventos }) =>
  pedirJSON("/api/eventos", {
    metodo: "POST",
    token,
    cuerpo: { ...(token ? {} : { usuario_id: usuarioId }), eventos },
  });

// --- Catálogo -------------------------------------------------------------------

// Con la versión que ya tenemos, el servidor responde 304 si no cambió.
export async function descargarCatalogo(versionPrevia) {
  const resultado = await pedirJSON("/api/contenido/catalogo", {
    cabeceras: versionPrevia ? { "If-None-Match": versionPrevia } : undefined,
  });
  return {
    ok: resultado.ok || resultado.status === 304,
    noModificado: resultado.status === 304,
    status: resultado.status,
    datos: resultado.status === 304 ? null : resultado.datos,
    error: resultado.status === 304 ? null : resultado.error,
  };
}
