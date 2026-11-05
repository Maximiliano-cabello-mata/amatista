// Panel del profesor evaluador (#/profesor/...). El profesor no es alumno,
// administrador ni desarrollador: evalúa. Arma sus grupos, les deja
// prácticas de Blender y revisa lo que entrega cada alumno, con su modelo
// armado aquí mismo. Recibe {seccion, params} de analizarRuta (rutas.js).
import Pagina from '../../components/estructura/Pagina';
import { rutas } from '../../rutas';
import Asignacion from './Asignacion';
import EnEstaComputadora from './EnEstaComputadora';
import Grupo from './Grupo';
import Grupos from './Grupos';

const SECCIONES = {
  grupos: { titulo: 'Tus grupos', descripcion: 'Deja prácticas a tus grupos y revisa lo que entrega cada alumno. Los modelos que abras se guardan solo en esta computadora.' },
  grupo: { titulo: 'Grupo', descripcion: null },
  practica: { titulo: 'Entregas', descripcion: null },
  equipo: { titulo: 'En esta computadora', descripcion: 'Los modelos que ya recogiste. El servidor no los guarda: si borras uno aquí, se pierde.' },
};

const PESTANAS = [
  { seccion: 'grupos', texto: 'Grupos', href: rutas.profesor },
  { seccion: 'equipo', texto: 'En esta computadora', href: rutas.profesorEquipo },
];

function Seccion({ seccion, params }) {
  switch (seccion) {
    case 'grupo':
      return <Grupo key={params.id} grupoId={params.id} />;
    case 'practica':
      return <Asignacion key={params.id} asignacionId={params.id} />;
    case 'equipo':
      return <EnEstaComputadora />;
    default:
      return <Grupos />;
  }
}

function Profesor({ seccion = 'grupos', params = {} }) {
  const info = SECCIONES[seccion] ?? SECCIONES.grupos;
  const activa = seccion === 'equipo' ? 'equipo' : 'grupos';
  return (
    <Pagina
      ancho="admin"
      migas={[{ texto: 'Inicio', href: rutas.inicio }, seccion === 'grupos' ? { texto: 'Evaluar' } : { texto: 'Evaluar', href: rutas.profesor }, ...(seccion === 'grupos' ? [] : [{ texto: info.titulo }])]}
      encabezado={{ tono: 'neon', antetitulo: 'Panel del profesor', titulo: info.titulo, descripcion: info.descripcion }}
    >
      <nav aria-label="Secciones del panel del profesor" className="mt-5 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-widest">
        {PESTANAS.map((p) => (
          <a
            key={p.seccion}
            href={p.href}
            aria-current={activa === p.seccion ? 'page' : undefined}
            className="corte-poly-sm border border-white/10 bg-superficie/80 px-3 py-1.5 text-white/65 hover:border-neon hover:text-neon aria-[current=page]:border-neon aria-[current=page]:text-neon"
          >
            {p.texto}
          </a>
        ))}
      </nav>
      <div className="mt-6">
        <Seccion seccion={seccion} params={params} />
      </div>
    </Pagina>
  );
}

export default Profesor;
