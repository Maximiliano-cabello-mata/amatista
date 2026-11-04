// Cliente de Amatista Cloud (backend/api/nube.py): pedir una hora de Blender en la nube y entrar a ella.
//
// El token de cada sesión solo llega una vez (al pedirla o al renovarlo). Se guarda en este
// dispositivo hasta que la sesión vence; desde otro dispositivo se pide uno nuevo y el anterior
// deja de servir.
import { pedirJSON } from '../services/api';

const PREFIJO = 'amatista:nube:';

export const estadoNube = (token) => pedirJSON('/api/nube/v1/estado', { token });
export const sesionActual = (token) => pedirJSON('/api/nube/v1/sesiones/actual', { token });
export const pedirSesion = (token) => pedirJSON('/api/nube/v1/sesiones', { metodo: 'POST', token, espera: 15000 });
export const renovarToken = (token, id) => pedirJSON(`/api/nube/v1/sesiones/${encodeURIComponent(id)}/token`, { metodo: 'POST', token });
export const terminarSesion = (token, id) => pedirJSON(`/api/nube/v1/sesiones/${encodeURIComponent(id)}/terminar`, { metodo: 'POST', token });

export function guardarToken(sesion, almacen = globalThis.localStorage) {
  if (!sesion?.id || !sesion?.token) return;
  try {
    almacen.setItem(PREFIJO + sesion.id, JSON.stringify({ token: sesion.token, expira: sesion.expira_en }));
  } catch {
    // Sin almacenamiento (modo privado): el token se pide de nuevo al entrar.
  }
}

export function leerToken(id, almacen = globalThis.localStorage) {
  try {
    const guardado = JSON.parse(almacen.getItem(PREFIJO + id) || 'null');
    if (guardado && Date.parse(guardado.expira) > Date.now()) return guardado.token;
  } catch {
    // ignorado
  }
  return null;
}

export function olvidarTokens(almacen = globalThis.localStorage) {
  try {
    for (let i = almacen.length - 1; i >= 0; i -= 1) {
      const clave = almacen.key(i);
      if (clave?.startsWith(PREFIJO)) almacen.removeItem(clave);
    }
  } catch {
    // ignorado
  }
}

// El token viaja en el cuerpo de un formulario (no en la URL, que queda en historiales y bitácoras).
// El nodo lo cambia por una cookie que solo vale para esta sesión y abre Blender en otra pestaña.
export function entrar(sesion, token, { ventana = '_blank', documento = globalThis.document } = {}) {
  const formulario = documento.createElement('form');
  formulario.method = 'POST';
  formulario.action = sesion.entrada;
  formulario.target = ventana;
  formulario.rel = 'noopener';
  for (const [nombre, valor] of Object.entries({ sesion: sesion.id, token })) {
    const campo = documento.createElement('input');
    campo.type = 'hidden';
    campo.name = nombre;
    campo.value = valor;
    formulario.appendChild(campo);
  }
  documento.body.appendChild(formulario);
  formulario.submit();
  formulario.remove();
}

export function minutosRestantes(sesion, ahora = Date.now()) {
  if (!sesion?.expira_en) return 0;
  return Math.max(0, Math.floor((Date.parse(sesion.expira_en) - ahora) / 60000));
}
