// Panel de administración (#/admin/...). Versión mínima: otro cambio la
// implementa completa. Recibe {seccion, params} de analizarRuta (ver rutas.js).
import { rutas } from '../../rutas';

const TITULOS = {
  resumen: 'Resumen',
  usuarios: 'Usuarios',
  usuario: 'Usuario',
  contenido: 'Contenido',
  leccion: 'Editar lección',
  'nueva-leccion': 'Nueva lección',
};

function Admin({ seccion = 'resumen' }) {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">Administración</p>
      <h1 className="mt-1 text-4xl font-extrabold text-white">{TITULOS[seccion] ?? 'Administración'}</h1>
      <nav className="mt-6 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-widest" aria-label="Secciones">
        <a href={rutas.admin} className="text-white/60 hover:text-neon">Resumen</a>
        <a href={rutas.adminUsuarios} className="text-white/60 hover:text-neon">Usuarios</a>
        <a href={rutas.adminContenido} className="text-white/60 hover:text-neon">Contenido</a>
      </nav>
    </main>
  );
}

export default Admin;
