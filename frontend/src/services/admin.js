// src/services/admin.js
// Cliente del panel de administración (/api/admin y /api/contenido). Como el
// resto de services/api.js, nada lanza: todo devuelve {ok, status, datos, error}.
// Un 422 del gestor de contenido trae además datos.errores (lista con la ruta
// de cada problema).
import { pedirJSON } from "./api";

// Las métricas y la exportación recorren más filas: se les da más tiempo.
const ESPERA_LARGA = 20000;

const parte = (valor) => encodeURIComponent(valor);

// ?a=1&b=2 sin los valores vacíos.
export function consultaURL(parametros = {}) {
  const busqueda = new URLSearchParams();
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "" && valor !== false) busqueda.set(clave, String(valor));
  });
  const texto = busqueda.toString();
  return texto ? `?${texto}` : "";
}

// --- Métricas y usuarios -------------------------------------------------------

export const obtenerResumen = (token, dias = 7) =>
  pedirJSON(`/api/admin/resumen${consultaURL({ dias })}`, { token, espera: ESPERA_LARGA });

export const listarUsuarios = (token, { buscar, rol, pagina = 1, porPagina = 25, orden = "reciente", incluirFusionados } = {}) =>
  pedirJSON(
    `/api/admin/usuarios${consultaURL({
      buscar,
      rol,
      pagina,
      por_pagina: porPagina,
      orden,
      incluir_fusionados: incluirFusionados ? "true" : undefined,
    })}`,
    { token },
  );

export const obtenerUsuario = (token, usuarioId) => pedirJSON(`/api/admin/usuarios/${parte(usuarioId)}`, { token });

// cambios: {rol?, es_prueba?, correo_confirmado?} → UsuarioPublico.
export const modificarUsuario = (token, usuarioId, cambios) =>
  pedirJSON(`/api/admin/usuarios/${parte(usuarioId)}`, { metodo: "PATCH", cuerpo: cambios, token });

export const purgarDatos = (token, { diasSesiones = 90, diasEventos = 400 } = {}) =>
  pedirJSON("/api/admin/mantenimiento/purgar", {
    metodo: "POST",
    cuerpo: { dias_sesiones: diasSesiones, dias_eventos: diasEventos },
    token,
    espera: ESPERA_LARGA,
  });

export const obtenerSaludDetallada = (token) => pedirJSON("/api/admin/salud-detallada", { token, espera: ESPERA_LARGA });

// --- Gestor de contenido ---------------------------------------------------------

export const obtenerArbol = (token) => pedirJSON("/api/contenido/admin/arbol", { token });

export const obtenerPlantillas = (token) => pedirJSON("/api/contenido/plantillas", { token });

// datos: {curso_id, titulo, descripcion?, insignia?, minutos?, id?, numero?, generar_esqueleto?}
export const crearModulo = (token, datos) => pedirJSON("/api/contenido/modulos", { metodo: "POST", cuerpo: datos, token });

export const editarModulo = (token, moduloId, cambios) =>
  pedirJSON(`/api/contenido/modulos/${parte(moduloId)}`, { metodo: "PUT", cuerpo: cambios, token });

export const publicarModulo = (token, moduloId) =>
  pedirJSON(`/api/contenido/modulos/${parte(moduloId)}/publicar`, { metodo: "POST", token });

export const archivarModulo = (token, moduloId) =>
  pedirJSON(`/api/contenido/modulos/${parte(moduloId)}/archivar`, { metodo: "POST", token });

export const exportarModulo = (token, moduloId, { borradores = false } = {}) =>
  pedirJSON(`/api/contenido/modulos/${parte(moduloId)}/exportar${consultaURL({ borradores })}`, {
    token,
    espera: ESPERA_LARGA,
  });

const rutaLeccion = (cursoId, leccionId) => `/api/contenido/lecciones/${parte(cursoId)}/${parte(leccionId)}`;

export const obtenerLeccion = (token, cursoId, leccionId) => pedirJSON(rutaLeccion(cursoId, leccionId), { token });

export const crearLeccion = (token, { cursoId, moduloId, leccion, posicion }) =>
  pedirJSON("/api/contenido/lecciones", {
    metodo: "POST",
    cuerpo: { curso_id: cursoId, modulo_id: moduloId, leccion, ...(posicion ? { posicion } : {}) },
    token,
  });

export const guardarLeccion = (token, cursoId, leccionId, leccion) =>
  pedirJSON(rutaLeccion(cursoId, leccionId), { metodo: "PUT", cuerpo: { leccion }, token });

export const publicarLeccion = (token, cursoId, leccionId) =>
  pedirJSON(`${rutaLeccion(cursoId, leccionId)}/publicar`, { metodo: "POST", token });

export const archivarLeccion = (token, cursoId, leccionId) =>
  pedirJSON(`${rutaLeccion(cursoId, leccionId)}/archivar`, { metodo: "POST", token });

// orden: nueva posición dentro del módulo (1 = primera).
export const moverLeccion = (token, cursoId, leccionId, orden) =>
  pedirJSON(`${rutaLeccion(cursoId, leccionId)}/mover`, { metodo: "POST", cuerpo: { orden }, token });

export const validarLeccion = (token, leccion) =>
  pedirJSON("/api/contenido/validar", { metodo: "POST", cuerpo: { leccion }, token });
