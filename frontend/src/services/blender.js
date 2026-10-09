// src/services/blender.js
// Cliente del add-on de Blender y del motor de prácticas (/api/addon/v1).
// Como services/api.js, nada lanza: todo devuelve {ok, status, datos, error}.
import { API_URL, mensajeDeError, pedirJSON, sincronizacionDisponible } from "./api";

const BASE = "/api/addon/v1";
const parte = (valor) => encodeURIComponent(valor);

// --- Add-on y vínculo -------------------------------------------------------------

export const estadoAddon = () => pedirJSON(`${BASE}/estado`);

export const confirmarVinculo = (token, codigo) =>
  pedirJSON(`${BASE}/vinculos/confirmar`, { metodo: "POST", token, cuerpo: { codigo } });

export const listarDispositivos = (token) => pedirJSON(`${BASE}/dispositivos`, { token });

export const desconectarDispositivo = (token, dispositivoId) =>
  pedirJSON(`${BASE}/dispositivos/${parte(dispositivoId)}`, { metodo: "DELETE", token });

// Descarga el paquete con instalador. Con sesión trae un vínculo de un solo
// uso: al abrir Blender, el add-on ya queda conectado con la cuenta.
// Devuelve {ok, error, nombre} y guarda el archivo en el equipo.
export async function descargarPaquete(token, sistema) {
  if (!sincronizacionDisponible()) {
    return { ok: false, error: "El servidor no está disponible desde este sitio (requiere https)." };
  }
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${BASE}/descargas/${parte(sistema)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    return { ok: false, error: "No se pudo contactar al servidor. Revisa tu conexión." };
  }
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => null);
    return { ok: false, error: mensajeDeError(respuesta.status, datos) };
  }
  const nombre =
    /filename="([^"]+)"/.exec(respuesta.headers.get("content-disposition") ?? "")?.[1] ?? `Amatista-${sistema}.zip`;
  const blob = await respuesta.blob();
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 30000);
  return { ok: true, nombre };
}

// Dirección pública (sin sesión) de la extensión y del repositorio de extensiones.
export const urlExtension = () => `${API_URL}${BASE}/extension.zip`;
export const urlRepositorio = () => `${API_URL}${BASE}/extensiones/index.json`;

// --- Prácticas y progreso -----------------------------------------------------------

export const listarPracticas = (token) => pedirJSON(`${BASE}/practicas`, { token });

export const obtenerPractica = (token, practicaId) => pedirJSON(`${BASE}/practicas/${parte(practicaId)}`, { token });

export const abrirPractica = (token, practicaId) =>
  pedirJSON(`${BASE}/practicas/${parte(practicaId)}/abrir`, { metodo: "POST", token, cuerpo: { origen: "plataforma" } });

export const progresoPractica = (token, practicaId) =>
  pedirJSON(`${BASE}/mi-progreso?practica_id=${parte(practicaId)}`, { token });

// --- Enlace en vivo con Blender (motor 3.4) --------------------------------------------
// El add-on late cada pocos segundos: la plataforma ve si Blender está abierto,
// qué practica y en qué paso va, y le puede dejar órdenes.

export const estadoEnlace = (token) => pedirJSON(`${BASE}/enlace`, { token });

// practicaId: «abrir_practica» la abre; las órdenes de la práctica (comprobar, pista…) solo se cumplen si
// Blender sigue en ella. confirmar: «reiniciar» lo exige.
export const ordenarBlender = (token, tipo, practicaId, { confirmar = false } = {}) =>
  pedirJSON(`${BASE}/ordenes`, {
    metodo: "POST",
    token,
    cuerpo: { tipo, ...(practicaId ? { practica_id: practicaId } : {}), ...(confirmar ? { confirmar: true } : {}) },
  });

export const leerAjustesBlender = (token) => pedirJSON(`${BASE}/ajustes`, { token });

export const guardarAjustesBlender = (token, cambios) =>
  pedirJSON(`${BASE}/ajustes`, { metodo: "PUT", token, cuerpo: cambios });

// --- Administración -----------------------------------------------------------------

export const sincronizarPracticas = (token, { publicar = false } = {}) =>
  pedirJSON(`${BASE}/practicas/sincronizar${publicar ? "?publicar=true" : ""}`, { metodo: "POST", token, espera: 20000 });

export const publicarPractica = (token, practicaId, version) =>
  pedirJSON(`${BASE}/practicas/${parte(practicaId)}/publicar`, {
    metodo: "POST",
    token,
    cuerpo: version ? { version } : {},
  });

export const archivarPractica = (token, practicaId) =>
  pedirJSON(`${BASE}/practicas/${parte(practicaId)}/archivar`, { metodo: "POST", token });

export const versionesPractica = (token, practicaId) =>
  pedirJSON(`${BASE}/practicas/${parte(practicaId)}/versiones`, { token });
