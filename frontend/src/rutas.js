// Rutas por hash: funcionan en cualquier hosting estático y sin conexión.
const parte = (valor) => encodeURIComponent(valor);

export const rutas = {
  inicio: '#/',
  estudio: '#/estudio',
  panel: '#/panel',
  laboratorio: '#/laboratorio',
  blender: '#/blender',
  vincular: '#/vincular',
  entrar: '#/entrar',
  registro: '#/registro',
  confirmar: '#/confirmar',
  recuperar: '#/recuperar',
  perfil: '#/perfil',
  guia: '#/guia',
  admin: '#/admin',
  adminUsuarios: '#/admin/usuarios',
  adminContenido: '#/admin/contenido',
  adminPracticas: '#/admin/practicas',
  adminHerramientas: '#/admin/herramientas',
  adminSistema: '#/admin/sistema',
  adminRevision: '#/admin/revision',
  adminAuditoria: '#/admin/auditoria',
  curso: (cursoId) => `#/curso/${parte(cursoId)}`,
  // Abre el curso en ese nivel y baja hasta el módulo (Curso.jsx lee ?modulo=N).
  modulo: (cursoId, numero) => `#/curso/${parte(cursoId)}?modulo=${parte(numero)}`,
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
//   #/admin/practicas                    → practicas (motor de Blender)
//   #/admin/herramientas                 → herramientas (catálogo de bloques)
//   #/admin/sistema                      → sistema
//   #/admin/revision                     → revision (ver la plataforma y saltar a cualquier lección)
//   #/admin/auditoria                    → auditoria
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
  if (seccion === 'practicas') return { seccion: 'practicas', params: {} };
  if (seccion === 'herramientas') return { seccion: 'herramientas', params: {} };
  if (seccion === 'revision') return { seccion: 'revision', params: {} };
  if (seccion === 'auditoria') return { seccion: 'auditoria', params: {} };
  return { seccion: 'resumen', params: {} };
}

const PAGINAS_SIMPLES = ['estudio', 'panel', 'laboratorio', 'blender', 'vincular', 'entrar', 'registro', 'confirmar', 'recuperar', 'perfil', 'guia'];

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
  // #/explorar (el buscador del 21 de octubre) se retiró el 23: sus enlaces llevan a Cursos.
  if (partes[0] === 'explorar') return { pagina: 'inicio', consulta: {} };
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
