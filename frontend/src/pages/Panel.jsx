// Panel del alumno (#/panel): nivel, racha, qué sigue, avance por curso,
// retos, actividad, exámenes, insignias y estado de la cuenta. Todo sale del
// progreso local (useProgreso), del catálogo vigente (useCatalogo) y de la
// sesión (useAuth): funciona igual sin conexión.
import { useMemo } from 'react';
import { useAuth } from '../auth/contexto';
import { useCatalogo } from '../catalogo/contexto';
import Pagina from '../components/estructura/Pagina';
import InvitacionRecorrido from '../components/InvitacionRecorrido';
import ActividadPanel from '../components/panel/ActividadPanel';
import BlenderPanel from '../components/panel/BlenderPanel';
import ContinuarPanel from '../components/panel/ContinuarPanel';
import CuentaPanel from '../components/panel/CuentaPanel';
import CursosPanel from '../components/panel/CursosPanel';
import { tieneAvance } from '../components/panel/datos';
import EncabezadoPanel from '../components/panel/EncabezadoPanel';
import LogrosPanel from '../components/panel/LogrosPanel';
import ExamenesPanel from '../components/panel/ExamenesPanel';
import MuroInsignias from '../components/panel/MuroInsignias';
import RetosPanel from '../components/panel/RetosPanel';
import { totales } from '../components/panel/retos';
import { useHoy } from '../components/panel/useHoy';
import { useProgreso } from '../progreso/contexto';
import { calcularRacha } from '../progreso/reglas';
import { rutas } from '../rutas';

// Índice de Mi panel. Las rutas son por hash (#/…): los saltos se hacen con scroll, no con el enlace.
const SECCIONES = [
  ['panel-continuar', 'Qué sigue'],
  ['panel-cursos', 'Cursos'],
  ['panel-retos', 'Retos'],
  ['panel-blender', 'Blender'],
  ['panel-examenes', 'Exámenes'],
  ['panel-insignias', 'Insignias'],
];

function irASeccion(evento, id) {
  evento.preventDefault();
  document.getElementById(id)?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Panel() {
  const { progreso, xp, nivel } = useProgreso();
  const { cursos } = useCatalogo();
  const { usuario, sesionVencida, token } = useAuth();
  const hoy = useHoy();
  // La racha se calcula con el mismo "hoy" que los retos y el mapa de calor
  // (cambia a medianoche aunque el panel siga abierto).
  const racha = useMemo(() => calcularRacha(progreso.actividad, hoy), [progreso.actividad, hoy]);
  const cuenta = useMemo(() => totales(progreso), [progreso]);
  const hayAvance = tieneAvance(progreso) || cuenta.insignias > 0;

  return (
    <Pagina ancho="amplio" migas={[{ texto: 'Inicio', href: rutas.inicio }, { texto: 'Mi panel' }]}>
      <EncabezadoPanel usuario={usuario} xp={xp} nivel={nivel} racha={racha} lecciones={cuenta.lecciones} hayAvance={hayAvance} actividad={progreso.actividad} hoy={hoy} />

      <InvitacionRecorrido className="mt-6" />

      <nav aria-label="Secciones de Mi panel" className="mt-6 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-widest">
        {SECCIONES.map(([id, texto]) => (
          <a key={id} href={`#${id}`} onClick={(e) => irASeccion(e, id)} className="corte-poly-sm border border-white/10 bg-superficie/80 px-3 py-1.5 text-white/65 hover:border-neon hover:text-neon">
            {texto}
          </a>
        ))}
      </nav>

      {/* Móvil: una columna en orden de prioridad. Escritorio: 2/3 + 1/3. */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <ContinuarPanel progreso={progreso} cursos={cursos} className="lg:col-span-2" />
        <CuentaPanel usuario={usuario} sesionVencida={sesionVencida} lecciones={cuenta.lecciones} xp={xp} />
        <CursosPanel progreso={progreso} cursos={cursos} className="lg:col-span-2" />
        <RetosPanel progreso={progreso} hoy={hoy} className="lg:row-span-2" />
        <ActividadPanel progreso={progreso} hoy={hoy} className="lg:col-span-2" />
        <BlenderPanel token={token} progreso={progreso} cursos={cursos} className="diferido diferido--corto lg:col-span-3" />
        <ExamenesPanel progreso={progreso} cursos={cursos} className="diferido diferido--corto lg:col-span-3" />
        <LogrosPanel progreso={progreso} cursos={cursos} hoy={hoy} className="diferido diferido--corto lg:col-span-3" />
        <MuroInsignias progreso={progreso} cursos={cursos} className="diferido diferido--corto lg:col-span-3" />
      </div>
    </Pagina>
  );
}

export default Panel;
