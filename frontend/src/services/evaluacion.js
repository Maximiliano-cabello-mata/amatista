// src/services/evaluacion.js
// Panel del profesor evaluador y «Mi grupo» del alumno (/api/evaluacion, backend/api/evaluacion.py).
// Como services/api.js, nada lanza: todo devuelve {ok, status, datos, error}.
import { pedirJSON } from "./api";

const BASE = "/api/evaluacion";
const parte = (valor) => encodeURIComponent(valor);

// --- Profesor ----------------------------------------------------------------------

export const listarGrupos = (token) => pedirJSON(`${BASE}/grupos`, { token });

export const crearGrupo = (token, nombre) => pedirJSON(`${BASE}/grupos`, { metodo: "POST", token, cuerpo: { nombre } });

export const cambiarGrupo = (token, grupoId, cambios) =>
  pedirJSON(`${BASE}/grupos/${parte(grupoId)}`, { metodo: "PATCH", token, cuerpo: cambios });

export const verGrupo = (token, grupoId) => pedirJSON(`${BASE}/grupos/${parte(grupoId)}`, { token });

export const sacarAlumno = (token, grupoId, alumnoId) =>
  pedirJSON(`${BASE}/grupos/${parte(grupoId)}/alumnos/${parte(alumnoId)}`, { metodo: "DELETE", token });

export const practicasParaAsignar = (token) => pedirJSON(`${BASE}/practicas`, { token });

export const asignarPractica = (token, datos) => pedirJSON(`${BASE}/asignaciones`, { metodo: "POST", token, cuerpo: datos });

export const cambiarAsignacion = (token, asignacionId, cambios) =>
  pedirJSON(`${BASE}/asignaciones/${parte(asignacionId)}`, { metodo: "PATCH", token, cuerpo: cambios });

export const verAsignacion = (token, asignacionId) => pedirJSON(`${BASE}/asignaciones/${parte(asignacionId)}`, { token });

const rutaEntrega = (asignacionId, alumnoId) => `${BASE}/asignaciones/${parte(asignacionId)}/entregas/${parte(alumnoId)}`;

// El modelo puede pesar cientos de KB con una conexión de datos: se espera más.
export const recogerModelo = (token, asignacionId, alumnoId) =>
  pedirJSON(`${rutaEntrega(asignacionId, alumnoId)}/modelo`, { token, espera: 45000 });

export const confirmarModeloRecibido = (token, asignacionId, alumnoId) =>
  pedirJSON(`${rutaEntrega(asignacionId, alumnoId)}/modelo/recibido`, { metodo: "POST", token });

export const evaluarEntrega = (token, asignacionId, alumnoId, evaluacion) =>
  pedirJSON(`${rutaEntrega(asignacionId, alumnoId)}/evaluar`, { metodo: "POST", token, cuerpo: evaluacion });

// --- Alumno ------------------------------------------------------------------------

export const unirmeAGrupo = (token, codigo) => pedirJSON(`${BASE}/unirme`, { metodo: "POST", token, cuerpo: { codigo } });

export const misAsignaciones = (token) => pedirJSON(`${BASE}/mis-asignaciones`, { token });

export const marcarEvaluacionVista = (token, asignacionId) =>
  pedirJSON(`${BASE}/mis-asignaciones/${parte(asignacionId)}/vista`, { metodo: "POST", token });

export const salirDeGrupo = (token, grupoId) => pedirJSON(`${BASE}/mis-grupos/${parte(grupoId)}`, { metodo: "DELETE", token });
