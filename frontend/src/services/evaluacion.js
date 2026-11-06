// src/services/evaluacion.js
// Panel del profesor evaluador y «Mi clase / Mi grupo» del alumno (/api/evaluacion).
// Funciona tanto conectado al backend como en modo local/offline instantáneo
// (profesor/aulaLocal.js), capturando el CÓDIGO DEL MODELO en pocos bytes y
// recreándolo en 3D en la interfaz del profesor.
import {
  asignarPracticaLocal,
  crearGrupoLocal,
  evaluarEntregaLocal,
  guardarAulaLocal,
  leerAulaLocal,
  listarGruposLocal,
  marcarVistaLocal,
  misAsignacionesLocal,
  practicasParaAsignarLocal,
  recogerModeloLocal,
  salirDeGrupoLocal,
  subirCodigoModeloLocal,
  unirseAGrupoLocal,
  verAsignacionLocal,
  verGrupoLocal,
} from '../profesor/aulaLocal';
import { empaquetarCodigoModelo } from '../profesor/modelo';
import { pedirJSON } from './api';

const BASE = '/api/evaluacion';
const parte = (valor) => encodeURIComponent(valor);

// --- Profesor ----------------------------------------------------------------------

export async function listarGrupos(token) {
  if (token) {
    const r = await pedirJSON(`${BASE}/grupos`, { token });
    if (r.ok && Array.isArray(r.datos) && r.datos.length > 0) return r;
  }
  return listarGruposLocal();
}

export async function crearGrupo(token, nombre) {
  const local = crearGrupoLocal(nombre);
  if (token) {
    const r = await pedirJSON(`${BASE}/grupos`, { metodo: 'POST', token, cuerpo: { nombre } });
    if (r.ok) return r;
  }
  return local;
}

export async function cambiarGrupo(token, grupoId, cambios) {
  if (token && !String(grupoId).startsWith('grp-')) {
    const r = await pedirJSON(`${BASE}/grupos/${parte(grupoId)}`, { metodo: 'PATCH', token, cuerpo: cambios });
    if (r.ok) return r;
  }
  const estado = leerAulaLocal();
  const g = estado.grupos.find((x) => x.id === grupoId);
  if (g) {
    if (cambios.nombre != null) g.nombre = cambios.nombre;
    if (cambios.archivado != null) g.archivado = Boolean(cambios.archivado);
    guardarAulaLocal(estado);
  }
  return { ok: true, status: 200, datos: g ?? { id: grupoId, ...cambios } };
}

export async function verGrupo(token, grupoId) {
  if (token && !String(grupoId).startsWith('grp-')) {
    const r = await pedirJSON(`${BASE}/grupos/${parte(grupoId)}`, { token });
    if (r.ok) return r;
  }
  return verGrupoLocal(grupoId);
}

export async function sacarAlumno(token, grupoId, alumnoId) {
  if (token && !String(grupoId).startsWith('grp-')) {
    const r = await pedirJSON(`${BASE}/grupos/${parte(grupoId)}/alumnos/${parte(alumnoId)}`, { metodo: 'DELETE', token });
    if (r.ok) return r;
  }
  const estado = leerAulaLocal();
  const g = estado.grupos.find((x) => x.id === grupoId);
  if (g && g.alumnos) {
    g.alumnos = g.alumnos.filter((a) => a.id !== alumnoId);
    g.alumnos_count = g.alumnos.length;
    guardarAulaLocal(estado);
  }
  return { ok: true, status: 200, datos: { ok: true } };
}

export async function practicasParaAsignar(token) {
  if (token) {
    const r = await pedirJSON(`${BASE}/practicas`, { token });
    if (r.ok && Array.isArray(r.datos) && r.datos.length > 0) return r;
  }
  return practicasParaAsignarLocal();
}

export async function asignarPractica(token, datos) {
  const local = asignarPracticaLocal(datos);
  if (token && !String(datos.grupo_id).startsWith('grp-')) {
    const r = await pedirJSON(`${BASE}/asignaciones`, { metodo: 'POST', token, cuerpo: datos });
    if (r.ok) return r;
  }
  return local;
}

export async function cambiarAsignacion(token, asignacionId, cambios) {
  if (token && !String(asignacionId).startsWith('asg-')) {
    const r = await pedirJSON(`${BASE}/asignaciones/${parte(asignacionId)}`, { metodo: 'PATCH', token, cuerpo: cambios });
    if (r.ok) return r;
  }
  const estado = leerAulaLocal();
  const a = estado.asignaciones.find((x) => x.id === asignacionId);
  if (a && cambios.estado) {
    a.estado = cambios.estado;
    guardarAulaLocal(estado);
  }
  return { ok: true, status: 200, datos: a ?? { id: asignacionId, ...cambios } };
}

export async function verAsignacion(token, asignacionId) {
  if (token && !String(asignacionId).startsWith('asg-')) {
    const r = await pedirJSON(`${BASE}/asignaciones/${parte(asignacionId)}`, { token });
    if (r.ok) return r;
  }
  return verAsignacionLocal(asignacionId);
}

const rutaEntrega = (asignacionId, alumnoId) => `${BASE}/asignaciones/${parte(asignacionId)}/entregas/${parte(alumnoId)}`;

export async function recogerModelo(token, asignacionId, alumnoId) {
  if (token && !String(asignacionId).startsWith('asg-')) {
    const r = await pedirJSON(`${rutaEntrega(asignacionId, alumnoId)}/modelo`, { token, espera: 45000 });
    if (r.ok) return r;
  }
  return recogerModeloLocal(asignacionId, alumnoId);
}

export async function confirmarModeloRecibido(token, asignacionId, alumnoId) {
  if (token && !String(asignacionId).startsWith('asg-')) {
    const r = await pedirJSON(`${rutaEntrega(asignacionId, alumnoId)}/modelo/recibido`, { metodo: 'POST', token });
    if (r.ok) return r;
  }
  return { ok: true, status: 200, datos: { recogido_en: new Date().toISOString() } };
}

export async function evaluarEntrega(token, asignacionId, alumnoId, evaluacion) {
  const local = evaluarEntregaLocal(asignacionId, alumnoId, evaluacion);
  if (token && !String(asignacionId).startsWith('asg-')) {
    const r = await pedirJSON(`${rutaEntrega(asignacionId, alumnoId)}/evaluar`, { metodo: 'POST', token, cuerpo: evaluacion });
    if (r.ok) return r;
  }
  return local;
}

// --- Alumno ------------------------------------------------------------------------

export async function unirmeAGrupo(token, codigo, usuario = null) {
  const local = unirseAGrupoLocal(codigo, usuario);
  if (token) {
    const r = await pedirJSON(`${BASE}/unirme`, { metodo: 'POST', token, cuerpo: { codigo } });
    if (r.ok) return r;
  }
  return local;
}

export async function misAsignaciones(token, usuario = null) {
  const local = misAsignacionesLocal(usuario);
  if (token) {
    const r = await pedirJSON(`${BASE}/mis-asignaciones`, { token });
    if (r.ok && r.datos?.grupos?.length > 0) return r;
  }
  return local;
}

// Sube el CÓDIGO DEL MODELO (no el archivo .blend pesado): lo compila a amatista.modelo/1,
// lo guarda en el aula local para recrearlo al instante en #/profesor y, si hay sesión con
// el servidor, lo envía también a POST /api/evaluacion/entregas.
export async function subirCodigoModelo(token, { asignacionId, codigo, usuario = null }) {
  const local = subirCodigoModeloLocal({ asignacionId, codigo, usuario });
  if (!local.ok) return local;
  if (token && !String(asignacionId).startsWith('asg-')) {
    try {
      const { paquete } = await empaquetarCodigoModelo(codigo);
      const r = await pedirJSON(`${BASE}/entregas`, {
        metodo: 'POST',
        token,
        cuerpo: { asignacion_id: asignacionId, modelo: paquete, version_addon: 'web-codigo-1.0' },
      });
      if (r.ok) return r;
    } catch {
      // Si no hay conexión con el servidor, queda guardado en el aula local.
    }
  }
  return local;
}

export async function marcarEvaluacionVista(token, asignacionId, usuario = null) {
  const local = marcarVistaLocal(asignacionId, usuario);
  if (token && !String(asignacionId).startsWith('asg-')) {
    const r = await pedirJSON(`${BASE}/mis-asignaciones/${parte(asignacionId)}/vista`, { metodo: 'POST', token });
    if (r.ok) return r;
  }
  return local;
}

export async function salirDeGrupo(token, grupoId) {
  const local = salirDeGrupoLocal(grupoId);
  if (token && !String(grupoId).startsWith('grp-')) {
    const r = await pedirJSON(`${BASE}/mis-grupos/${parte(grupoId)}`, { metodo: 'DELETE', token });
    if (r.ok) return r;
  }
  return local;
}
