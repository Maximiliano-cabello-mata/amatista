import { CristalLogo, IconoCandado } from '../Iconos';
import { insigniasDelMuro } from './datos';
import Seccion from './Seccion';

const fecha = (iso) => new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });

// Qué le falta al alumno para ganar la insignia, en una frase.
function textoRequisito(requisito) {
  if (requisito.tipo === 'examen') {
    const minimo = requisito.minimo === null ? '' : ` con ${requisito.minimo} % o más`;
    const antes = requisito.faltan > 1 ? `Completa ${requisito.faltan - 1} ${requisito.faltan - 1 === 1 ? 'lección' : 'lecciones'} y aprueba` : 'Aprueba';
    const mejor = requisito.mejor === null ? '' : ` Tu mejor intento: ${requisito.mejor} %.`;
    return `${antes} el examen final${minimo}.${mejor}`;
  }
  return `Completa ${requisito.faltan} ${requisito.faltan === 1 ? 'lección' : 'lecciones'} más.`;
}

function Insignia({ insignia }) {
  const { nombre, modulo, ganada, proximamente, requisito } = insignia;
  return (
    <li
      className={`corte-poly-sm flex flex-col items-center gap-2 border p-4 text-center ${
        ganada ? 'border-amatista/40 bg-amatista/10' : 'border-white/5 bg-base/50'
      }`}
    >
      <div className={`hexagono relative grid h-16 w-[4.5rem] place-items-center ${ganada ? 'bg-amatista-oscuro' : 'bg-white/5'}`}>
        <CristalLogo className={`h-11 w-11 ${ganada ? 'animar-flotar' : 'opacity-25 grayscale'}`} />
        {!ganada && <IconoCandado className="absolute h-5 w-5 text-white/55" />}
      </div>
      <p className={`font-bold leading-tight ${ganada ? 'text-white' : 'text-white/60'}`}>{nombre}</p>
      {modulo && <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Módulo {modulo.numero}</p>}
      <p className={`text-xs leading-snug ${ganada ? 'text-amatista-claro' : 'text-white/50'}`}>
        {ganada && <>✓ Ganada el {fecha(ganada)}</>}
        {!ganada && proximamente && 'Próximamente: el módulo aún no se publica.'}
        {!ganada && requisito && textoRequisito(requisito)}
      </p>
    </li>
  );
}

// Muro de insignias: una por módulo. Las ganadas llevan su fecha; las
// bloqueadas, en gris, dicen qué falta. Las ganadas en módulos retirados se conservan.
function MuroInsignias({ progreso, cursos, className = '' }) {
  const muro = insigniasDelMuro(progreso, cursos);
  const ganadas = muro.filter((insignia) => insignia.ganada).length;
  const grupos = cursos
    .map((curso) => ({ id: curso.id, titulo: curso.titulo, insignias: muro.filter((i) => i.curso?.id === curso.id) }))
    .filter((grupo) => grupo.insignias.length);
  const sueltas = muro.filter((insignia) => !insignia.curso);
  if (sueltas.length) grupos.push({ id: 'otras', titulo: 'Otras insignias', insignias: sueltas });

  return (
    <Seccion
      id="panel-insignias"
      etiqueta="Colección"
      titulo="Insignias"
      className={className}
      accion={
        <p className="font-mono text-xs uppercase tracking-widest text-white/55">
          <strong className="text-lg text-white">{ganadas}</strong> de {muro.length} ganadas
        </p>
      }
    >
      {ganadas === 0 && (
        <p className="mb-5 text-sm text-texto/70">
          Cada módulo tiene su insignia: aprueba su examen final (el «jefe») para ganarla. ¡La primera te espera en el módulo 1!
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        {grupos.map((grupo) => (
          <div key={grupo.id}>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-white/55">{grupo.titulo}</h3>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {grupo.insignias.map((insignia) => (
                <Insignia key={insignia.id} insignia={insignia} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Seccion>
  );
}

export default MuroInsignias;
