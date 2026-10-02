// Rutas por hash: funcionan en cualquier hosting estático y sin conexión.
const parte = (valor) => encodeURIComponent(valor);

export const rutas = {
  inicio: '#/',
  panel: '#/panel',
  laboratorio: '#/laboratorio',
  entrar: '#/entrar',
  registro: '#/registro',
  confirmar: '#/confirmar',
  recuperar: '#/recuperar',
  perfil: '#/perfil',
  admin: '#/admin',
  adminUsuarios: '#/admin/usuarios',
  adminContenido: '#/admin/contenido',
  adminSistema: '#/admin/sistema',
  curso: (cursoId) => `#/curso/${parte(cursoId)}`,
  leccion: (cursoId, leccionId) => `#/curso/${parte(cursoId)}/leccion/${parte(leccionId)}`,
  adminUsuario: (usuarioId) => `#/admin/usuarios/${parte(usuarioId)}`,
  adminLeccion: (cursoId, leccionId) => `#/admin/contenido/${parte(cursoId)}/${parte(leccionId)}`,
  adminNuevaLeccion: (moduloId) => `#/admin/contenido/nueva/${parte(moduloId)}`,
};

// Secciones del panel de administración (página "admin" con {seccion, params}):
//   #/admin                              → resumen
//   #/admin/usuarios                     → usuarios
//   #/admin/usuarios/:id                 → usuario        {id}
//   #/admin/contenido                    → contenido
//   #/admin/contenido/nueva/:modulo      → nueva-leccion  {moduloId}
//   #/admin/contenido/:curso/:leccion    → leccion        {cursoId, leccionId}
//   #/admin/sistema                      → sistema
function rutaAdmin(partes) {
  const [seccion, a, b, c] = partes;
  if (seccion === 'usuarios') {
    return a ? { seccion: 'usuario', params: { id: a } } : { seccion: 'usuarios', params: {} };
  }
  if (seccion === 'contenido') {
    if (a === 'nueva' && b && !c) return { seccion: 'nueva-leccion', params: { moduloId: b } };
    if (a && b) return { seccion: 'leccion', params: { cursoId: a, leccionId: b } };
    return { seccion: 'contenido', params: {} };
  }
  if (seccion === 'sistema') return { seccion: 'sistema', params: {} };
  return { seccion: 'resumen', params: {} };
}

const PAGINAS_SIMPLES = ['panel', 'laboratorio', 'entrar', 'registro', 'confirmar', 'recuperar', 'perfil'];

// Devuelve {pagina, ...}. Una consulta tras "?" (por ejemplo
// "#/entrar?volver=%23%2Fperfil") llega en `consulta`.
export function analizarRuta(hash = '') {
  const [camino, textoConsulta = ''] = hash.replace(/^#\/?/, '').split('?');
  const consulta = Object.fromEntries(new URLSearchParams(textoConsulta));
  const partes = camino
    .split('/')
    .filter(Boolean)
    .map((texto) => {
      try {
        return decodeURIComponent(texto);
      } catch {
        return texto;
      }
    });

  if (PAGINAS_SIMPLES.includes(partes[0])) return { pagina: partes[0], consulta };
  if (partes[0] === 'admin') return { pagina: 'admin', ...rutaAdmin(partes.slice(1)), consulta };
  if (partes[0] === 'curso' && partes[1] && partes[2] === 'leccion' && partes[3]) {
    return { pagina: 'leccion', cursoId: partes[1], leccionId: partes[3], consulta };
  }
  if (partes[0] === 'curso' && partes[1]) return { pagina: 'curso', cursoId: partes[1], consulta };
  return { pagina: 'inicio', consulta };
}

// Enlace a "Entrar" que regresa a `volver` (un hash de esta app) al terminar.
export function rutaEntrar(volver) {
  return volver && volver.startsWith('#/') && !volver.startsWith(rutas.entrar)
    ? `${rutas.entrar}?volver=${encodeURIComponent(volver)}`
    : rutas.entrar;
}

// Destino seguro tras entrar: solo hashes internos.
export function destinoTrasEntrar(consulta, porDefecto = rutas.panel) {
  const volver = consulta?.volver;
  return typeof volver === 'string' && volver.startsWith('#/') ? volver : porDefecto;
}

// Navega a un hash de la app (para usar en acciones después de enviar un formulario).
export function navegar(destino) {
  window.location.hash = destino;
}
