import { useEffect, useMemo, useState } from 'react';
import { resumenPractica } from '../../blender/logica';
import { anchoDominio, avanceTaller, habilidadesConVivo, resumenTaller, textoFase } from '../../blender/taller';
import { tituloCorto } from '../../data/cursos';
import { practicasDelCatalogo } from '../../modulos/practica';
import { estaCompletada } from '../../progreso/reglas';
import { rutas } from '../../rutas';
import { listarDispositivos, listarPracticas, listarTalleres, obtenerTaller } from '../../services/blender';
import { IconoCubo } from '../etiquetas/IconosEtiqueta';
import Seccion from './Seccion';
import VerTodo from './VerTodo';

const VISIBLES = 4;

const BARRA_FASE = { nueva: 'bg-white/35', acompanada: 'bg-amber-300', sola: 'bg-neon', dominada: 'bg-emerald-400' };

// Las habilidades del taller en curso, en chico: nombre, fase en palabras y una barra fina.
function HabilidadesEnCurso({ habilidades }) {
  if (!habilidades.length) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Tus habilidades del taller">
      {habilidades.map((h) => (
        <li key={h.id} className="corte-poly-sm min-w-0 bg-base/80 px-2 pb-1 pt-0.5 text-[11px] text-texto/85">
          <span className="font-semibold text-white">{h.titulo}</span>
          <span className="text-white/50"> · {textoFase(h.fase)}</span>
          <span className="mt-0.5 block h-0.5 bg-white/10" aria-hidden="true">
            <span className={`block h-full ${BARRA_FASE[h.fase] ?? BARRA_FASE.nueva}`} style={{ width: `${anchoDominio(h.p)}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

// Lo que haces en Blender en tus módulos: el taller de habilidades y el proyecto
// que cierra cada módulo, en el orden del curso. El avance real viene del servidor
// (el plan del taller y la foto de la escena del proyecto); sin cuenta o sin
// servidor se usa el progreso local. Del taller en curso se ven sus habilidades.
function BlenderPanel({ token, progreso, cursos, className = '' }) {
  const [datos, setDatos] = useState({ porId: {}, talleres: {}, conectados: 0 });
  const [enCurso, setEnCurso] = useState(null);
  const [todo, setTodo] = useState(false);
  const practicas = useMemo(() => practicasDelCatalogo(cursos), [cursos]);

  useEffect(() => {
    if (!token) return undefined;
    let vigente = true;
    Promise.all([listarPracticas(token), listarDispositivos(token), listarTalleres(token)]).then(([lista, dispositivos, talleres]) => {
      if (!vigente) return;
      setDatos({
        porId: lista.ok ? Object.fromEntries(lista.datos.practicas.map((p) => [p.id, p])) : {},
        talleres: talleres.ok && Array.isArray(talleres.datos?.talleres) ? Object.fromEntries(talleres.datos.talleres.map((t) => [t.taller, t])) : {},
        conectados: dispositivos.ok ? dispositivos.datos.dispositivos.length : 0,
      });
    });
    return () => {
      vigente = false;
    };
  }, [token]);

  // El taller en curso: el primero (en el orden del curso) que todavía no abre su proyecto.
  const tallerEnCurso = useMemo(
    () =>
      practicas.find(
        ({ curso, leccion, taller }) =>
          taller && datos.talleres[taller] && !datos.talleres[taller].proyecto_abierto && !estaCompletada(progreso, curso.id, leccion),
      )?.taller ?? null,
    [practicas, datos.talleres, progreso],
  );
  useEffect(() => {
    if (!token || !tallerEnCurso) return undefined;
    let vigente = true;
    obtenerTaller(token, tallerEnCurso).then((r) => {
      if (vigente && r.ok) setEnCurso({ taller: tallerEnCurso, habilidades: habilidadesConVivo(r.datos?.habilidades) });
    });
    return () => {
      vigente = false;
    };
  }, [token, tallerEnCurso]);

  if (!practicas.length) return null;

  const filas = practicas.map((p) => {
    const { curso, leccion, bloque, taller } = p;
    const servidor = taller ? null : datos.porId[bloque.practica]?.mi_progreso;
    const plan = taller ? datos.talleres[taller] : null;
    const hecha = Boolean(servidor?.completada || plan?.proyecto_abierto) || estaCompletada(progreso, curso.id, leccion);
    return { ...p, servidor, plan, hecha };
  });
  // Primero lo que toca ahora: desde la primera sin terminar, en el orden del curso.
  const desde = Math.max(0, filas.findIndex((f) => !f.hecha));
  const visibles = todo ? filas : filas.slice(desde, desde + VISIBLES);

  return (
    <Seccion
      id="panel-blender"
      etiqueta="En Blender"
      titulo="Talleres y proyectos"
      className={className}
      accion={
        <a href={rutas.blender} className="font-mono text-xs font-bold uppercase tracking-widest text-neon hover:underline">
          {datos.conectados ? `${datos.conectados} Blender conectado${datos.conectados > 1 ? 's' : ''}` : 'Ir a Blender ▸'}
        </a>
      }
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {visibles.map(({ curso, modulo, leccion, bloque, cierre, taller, servidor, plan, hecha }) => {
          const avance = hecha ? 100 : plan ? avanceTaller(plan) : (servidor?.progreso ?? 0);
          const pendiente = cierre ? 'Se abre al terminar las lecciones del módulo.' : 'Se abre al terminar la lección anterior.';
          let texto = pendiente;
          if (plan) texto = resumenTaller(plan);
          else if (hecha) texto = '¡Completada!';
          else if (servidor) texto = resumenPractica(servidor);
          const habilidades = enCurso && enCurso.taller === taller ? enCurso.habilidades : [];
          return (
            <li key={`${curso.id}:${leccion.id}`} className="corte-poly-sm min-w-0 border border-white/10 bg-base/60 p-3">
              <a href={rutas.leccion(curso.id, leccion.id)} className="flex gap-3">
                <span
                  className={`hexagono grid h-10 w-11 shrink-0 place-items-center ${hecha ? 'bg-emerald-400 text-base' : 'bg-blender/20 text-blender'}`}
                >
                  <IconoCubo className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-white/45">
                    {curso.titulo} · Módulo {modulo.numero} · {tituloCorto(modulo.titulo)}
                  </span>
                  <span className="block truncate font-bold text-white">{bloque.title ?? leccion.title}</span>
                  <span className="mt-2 block h-1.5 overflow-hidden bg-white/10" aria-hidden="true">
                    <span className={`block h-full ${hecha ? 'bg-emerald-400' : 'bg-blender'}`} style={{ width: `${avance}%` }} />
                  </span>
                  <span className="mt-1.5 block text-xs text-white/55">{texto}</span>
                </span>
              </a>
              <HabilidadesEnCurso habilidades={habilidades} />
            </li>
          );
        })}
      </ul>
      <VerTodo abierto={todo} ocultos={filas.length - visibles.length} texto="Ver todos los talleres y proyectos" alCambiar={setTodo} />
    </Seccion>
  );
}

export default BlenderPanel;
