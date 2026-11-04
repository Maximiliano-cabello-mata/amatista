// src/services/api.js
// Cliente del backend. Ninguna función lanza: todas devuelven
// {ok, status, datos, error} con el error ya escrito en español para mostrarlo.
// Dominio público: https://amatista-3d.tech; guía operativa:
// docs/despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md.
// En Workers la variable de build VITE_API_URL define la URL de API.
import { esperaPorRed } from "../lib/red";

export const DOMINIO = "amatista-3d.tech";
export const API_DEL_DOMINIO = `https://api.${DOMINIO}`;
// Desarrollo local sin variable explícita: usar el backend local, no el
// puerto interno de la VM (127.0.0.1:8000 solo es accesible en el servidor).
const API_LOCAL = "http://localhost:8000";

// VITE_API_URL manda (para tu backend local: frontend/.env con
// VITE_API_URL=http://localhost:8000). Sin ella: en el dominio, su API; en
// cualquier otro lado, se usa localhost. Para despliegues personalizados,
// configurar siempre VITE_API_URL en tiempo de compilación.
export function apiPorDefecto(host = typeof window === "undefined" ? "" : window.location.hostname) {
  if (host === DOMINIO || host.endsWith(`.${DOMINIO}`)) return API_DEL_DOMINIO;
  return API_LOCAL;
}

export const API_URL = import.meta.env.VITE_API_URL || apiPorDefecto();

const ESPERA_POR_DEFECTO = 8000;
// Debajo de esto comprimir no ahorra nada (las cabeceras de gzip pesan ~20 bytes).
const COMPRIMIR_DESDE = 512;
// Límite del navegador para el cuerpo de una petición keepalive (64 KB).
const MAXIMO_KEEPALIVE = 60_000;

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

// Cuerpo JSON comprimido con gzip (CompressionStream: Chrome 80+, Safari 16.4+,
// Firefox 113+). Sin soporte, o si no vale la pena, va tal cual.
export async function prepararCuerpo(texto, comprimir) {
  if (!comprimir || texto.length < COMPRIMIR_DESDE || typeof CompressionStream === "undefined") {
    return { cuerpo: texto, comprimido: false, bytes: new TextEncoder().encode(texto).length };
  }
  try {
    const flujo = new Blob([texto]).stream().pipeThrough(new CompressionStream("gzip"));
    const datos = new Uint8Array(await new Response(flujo).arrayBuffer());
    return { cuerpo: datos, comprimido: true, bytes: datos.length };
  } catch {
    return { cuerpo: texto, comprimido: false, bytes: new TextEncoder().encode(texto).length };
  }
}

// fetch con tiempo máximo: si el servidor no responde, no dejamos la app esperando.
// En redes 2G/3G el tiempo máximo crece (lib/red.js). `comprimir` manda el
// cuerpo con gzip (solo a rutas que lo aceptan) y `keepalive` deja terminar
// el envío aunque el alumno cierre la pestaña.
export async function pedirJSON(
  ruta,
  { metodo = "GET", cuerpo, token, espera = ESPERA_POR_DEFECTO, cabeceras, comprimir = false, keepalive = false } = {},
) {
  if (!sincronizacionDisponible()) {
    return {
      ok: false,
      status: 0,
      datos: null,
      error: "El servidor no está disponible desde este sitio (requiere https).",
    };
  }
  const headers = { Accept: "application/json", ...cabeceras };
  let envio = null;
  if (cuerpo !== undefined) {
    headers["Content-Type"] = "application/json";
    envio = await prepararCuerpo(JSON.stringify(cuerpo), comprimir);
    if (envio.comprimido) headers["Content-Encoding"] = "gzip";
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), esperaPorRed(espera));
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers,
      body: envio?.cuerpo,
      signal: control.signal,
      keepalive: keepalive && (envio?.bytes ?? 0) <= MAXIMO_KEEPALIVE,
    });
  } catch (error) {
    const agotado = error?.name === "AbortError";
    return {
      ok: false,
      status: 0,
      datos: null,
      bytes: envio?.bytes ?? 0,
      comprimido: Boolean(envio?.comprimido),
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
    bytes: envio?.bytes ?? 0,
    comprimido: Boolean(envio?.comprimido),
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

// `desde` (servidor_en de la descarga anterior): solo lo que cambió. Un
// backend anterior ignora el parámetro y devuelve todo (sin «parcial»).
export const descargarProgreso = (token, desde) =>
  pedirJSON(desde ? `/api/progreso?desde=${encodeURIComponent(desde)}` : "/api/progreso", { token });

// Progreso, insignias y eventos en una sola petición (backend con /api/sincronizar).
// Comprimir solo cuando ya se sabe que el servidor lo acepta: un backend
// anterior rechazaría la cabecera Content-Encoding en el preflight de CORS y
// el envío parecería un fallo de red.
export const sincronizar = ({ token, usuarioId, progreso = [], insignias = [], eventos = [], comprimir, keepalive }) =>
  pedirJSON("/api/sincronizar", {
    metodo: "POST",
    token,
    comprimir,
    keepalive,
    espera: 15000,
    cuerpo: {
      ...(token ? {} : { usuario_id: usuarioId }),
      ...(progreso.length ? { progreso } : {}),
      ...(insignias.length ? { insignias } : {}),
      ...(eventos.length ? { eventos } : {}),
    },
  });

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

// --- Avatar y buzón del creador ----------------------------------------------------

export const obtenerPerfil = (token) => pedirJSON("/api/perfil", { token, espera: 6000 });

export const guardarAvatar = (token, avatar) => pedirJSON("/api/perfil", { metodo: "PUT", token, cuerpo: { avatar } });

export const listarSugerencias = (token) => pedirJSON("/api/buzon", { token });

export const enviarSugerencia = (token, { categoria, texto, pagina }) =>
  pedirJSON("/api/buzon", { metodo: "POST", token, cuerpo: { categoria, texto, pagina } });

export const responderSugerencia = (token, id, texto) =>
  pedirJSON(`/api/buzon/${encodeURIComponent(id)}/mensajes`, { metodo: "POST", token, cuerpo: { texto } });

export const marcarSugerenciaLeida = (token, id) =>
  pedirJSON(`/api/buzon/${encodeURIComponent(id)}/leida`, { metodo: "POST", token });
