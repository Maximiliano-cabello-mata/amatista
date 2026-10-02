// Panel de administración (#/admin/...). Recibe {seccion, params} de
// analizarRuta (ver rutas.js). Profesores y administradores leen todo; solo
// el administrador modifica (el servidor lo valida en cada petición).
import { useAuth } from '../../auth/contexto';
import NavAdmin from '../../components/admin/NavAdmin';
import { Mensaje } from '../../components/admin/ui';
import Contenido from './Contenido';
import EditorLeccion from './EditorLeccion';
import Resumen from './Resumen';
import Sistema from './Sistema';
import Usuario from './Usuario';
import Usuarios from './Usuarios';

const TITULOS = {
  resumen: 'Resumen',
  usuarios: 'Usuarios',
  usuario: 'Usuario',
  contenido: 'Contenido',
  leccion: 'Editar lección',
  'nueva-leccion': 'Nueva lección',
  sistema: 'Sistema',
};

const GRUPOS = { usuario: 'usuarios', leccion: 'contenido', 'nueva-leccion': 'contenido' };

function Seccion({ seccion, params, esAdmin }) {
  switch (seccion) {
    case 'usuarios':
      return <Usuarios esAdmin={esAdmin} />;
    case 'usuario':
      return <Usuario usuarioId={params.id} esAdmin={esAdmin} />;
    case 'contenido':
      return <Contenido esAdmin={esAdmin} />;
    case 'leccion':
      return <EditorLeccion key={`${params.cursoId}/${params.leccionId}`} cursoId={params.cursoId} leccionId={params.leccionId} esAdmin={esAdmin} />;
    case 'nueva-leccion':
      return <EditorLeccion key={`nueva/${params.moduloId}`} moduloId={params.moduloId} esAdmin={esAdmin} />;
    case 'sistema':
      return esAdmin ? <Sistema /> : <Mensaje tono="aviso">Solo un administrador puede ver el estado del sistema.</Mensaje>;
    default:
      return <Resumen />;
  }
}

function Admin({ seccion = 'resumen', params = {} }) {
  const { esAdmin } = useAuth();
  const grupo = GRUPOS[seccion] ?? seccion;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">Administración</p>
      <h1 className="mt-1 text-3xl font-extrabold text-white sm:text-4xl">{TITULOS[seccion] ?? 'Administración'}</h1>
      {!esAdmin && (
        <p className="mt-2 text-sm text-white/55">Entraste como profesor: puedes consultar todo, pero solo un administrador hace cambios.</p>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <NavAdmin grupo={grupo} esAdmin={esAdmin} />
        <div className="min-w-0">
          <Seccion seccion={seccion} params={params} esAdmin={esAdmin} />
        </div>
      </div>
    </main>
  );
}

export default Admin;
