// Panel del profesor evaluador (#/profesor/...). El profesor arma sus grupos,
// les deja prácticas y revisa lo que entrega cada alumno recreando el modelo 3D
// en su propio navegador a partir del CÓDIGO DEL MODELO capturado.
import { useAuth } from '../../auth/contexto';
import Pagina from '../../components/estructura/Pagina';
import { CODIGO_CLASE_DEMO, reiniciarAulaLocal } from '../../profesor/aulaLocal';
import { rutas } from '../../rutas';
import Asignacion from './Asignacion';
import EnEstaComputadora from './EnEstaComputadora';
import Grupo from './Grupo';
import Grupos from './Grupos';

const SECCIONES = {
  grupos: {
    titulo: 'Interfaz del Profesor · Clases y Recreación de Modelos',
    descripcion: 'Crea grupos con código (ej. AMA-7K2P), asigna prácticas y recrea en 3D el modelo de cada alumno directamente desde el código capturado, sin descargar archivos .blend pesados.',
  },
  grupo: { titulo: 'Grupo de clase', descripcion: null },
  practica: {
    titulo: 'Entregas y Recreación 3D desde Código',
    descripcion: 'Selecciona un alumno para recrear su modelo 3D en vivo a partir del código capturado y asignarle calificación.',
  },
  equipo: { titulo: 'En esta computadora', descripcion: 'Los modelos recreados que ya recogiste se guardan localmente en IndexedDB.' },
};

const PESTANAS = [
  { seccion: 'grupos', texto: 'Grupos de clase', href: rutas.profesor },
  { seccion: 'practica', texto: 'Ver entregas y recrear modelos 3D', href: rutas.profesorPractica('asg-tren-m1') },
  { seccion: 'equipo', texto: 'Guardados en esta PC', href: rutas.profesorEquipo },
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
  const { esProfesor } = useAuth();
  const info = SECCIONES[seccion] ?? SECCIONES.grupos;
  const activa = seccion;

  const restaurarDemo = () => {
    reiniciarAulaLocal();
    window.location.reload();
  };

  return (
    <Pagina
      ancho="admin"
      migas={[{ texto: 'Inicio', href: rutas.inicio }, seccion === 'grupos' ? { texto: 'Profesor' } : { texto: 'Profesor', href: rutas.profesor }, ...(seccion === 'grupos' ? [] : [{ texto: info.titulo }])]}
      encabezado={{ tono: 'neon', antetitulo: 'Panel del profesor · Recreación 3D desde código', titulo: info.titulo, descripcion: info.descripcion }}
    >
      <div className="corte-poly-sm mt-5 flex flex-wrap items-center justify-between gap-3 border border-neon/40 bg-neon/10 p-3.5 text-xs text-texto/90">
        <p className="max-w-3xl">
          <strong className="text-neon">{esProfesor ? 'Sesión docente activa:' : 'Modo Evaluador / Aula Interactiva:'}</strong>{' '}
          Todo código de modelo enviado por un alumno en <a href={`${rutas.panel}#panel-grupo`} className="font-bold text-white underline hover:text-neon">Mi panel › Mi clase</a> (código <code className="text-neon">{CODIGO_CLASE_DEMO}</code>) se recibe aquí al instante y se recrea en 3D en el visor sin subir archivos pesados.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={rutas.profesorPractica('asg-tren-m1')}
            className="corte-poly-sm bg-neon px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-base hover:brightness-110"
          >
            Abrir entrega y recrear modelo 3D ▸
          </a>
          <button
            type="button"
            onClick={restaurarDemo}
            className="corte-poly-sm border border-white/15 bg-base/70 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/70 hover:text-white"
          >
            Restaurar datos de ejemplo
          </button>
        </div>
      </div>

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
