// #/admin/herramientas: catálogo de herramientas de enseñanza (bloques de
// lección) agrupadas por para qué sirven, con una vista previa real de cada
// una (el ejemplo que da el servidor) y su JSON listo para copiar.
// Documentación: docs/plataforma/04_herramientas_de_ensenanza.md.
import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { Boton, CargandoAdmin, ErrorAdmin, Pastilla, Tarjeta } from '../../components/admin/ui';
import { useDatosAdmin } from '../../components/admin/useDatosAdmin';
import { IconoNuevo } from '../../components/etiquetas/IconosEtiqueta';
import BloqueContenido from '../../components/leccion/BloqueContenido';
import { agruparHerramientas, HERRAMIENTAS, NOMBRES_FORMULA, nombreHerramienta } from '../../data/herramientas';
import { rutas } from '../../rutas';
import { obtenerPlantillas } from '../../services/admin';

function Detalle({ tipo, ejemplo }) {
  const [verJson, setVerJson] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const info = HERRAMIENTAS[tipo] ?? {};
  const json = JSON.stringify(ejemplo ?? { type: tipo }, null, 2);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopiado(true);
    } catch {
      setVerJson(true);
    }
  };

  return (
    <Tarjeta
      etiqueta={tipo}
      titulo={nombreHerramienta(tipo)}
      accion={
        <span className="flex flex-wrap gap-2">
          <Boton chico onClick={() => setVerJson((v) => !v)}>
            {verJson ? 'Ver vista previa' : 'Ver JSON'}
          </Boton>
          <Boton chico variante="neon" onClick={copiar}>
            {copiado ? 'Copiado' : 'Copiar JSON'}
          </Boton>
        </span>
      }
    >
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-widest text-white/45">Para qué</dt>
          <dd className="mt-1 text-white/80">{info.paraQue ?? '—'}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-widest text-white/45">Cuándo usarla</dt>
          <dd className="mt-1 text-white/80">{info.cuando ?? '—'}</dd>
        </div>
      </dl>
      {info.formula?.length > 0 && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/55">
          Encaja en:
          {info.formula.map((paso) => (
            <Pastilla key={paso} tono="bg-amatista/20 text-amatista-claro">
              {NOMBRES_FORMULA[paso] ?? paso}
            </Pastilla>
          ))}
        </p>
      )}
      <div className="mt-5">
        {verJson ? (
          <pre className="corte-poly-sm max-h-[32rem] overflow-auto bg-base/80 p-4 font-mono text-xs leading-relaxed text-white/80">{json}</pre>
        ) : (
          <div className="corte-poly border border-white/10 bg-base/60 p-4 sm:p-6">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">Así lo ve el alumno (ejemplo)</p>
            <BloqueContenido key={tipo} bloque={ejemplo ?? { type: tipo }} alCompletar={() => {}} />
          </div>
        )}
      </div>
    </Tarjeta>
  );
}

function Herramientas() {
  const { token } = useAuth();
  const plantillas = useDatosAdmin(() => obtenerPlantillas(token), token);
  const [elegida, setElegida] = useState(null);

  if (!plantillas.respuesta) return <CargandoAdmin texto="Cargando herramientas…" />;
  if (!plantillas.respuesta.ok) return <ErrorAdmin respuesta={plantillas.respuesta} alReintentar={plantillas.recargar} />;

  const bloques = plantillas.datos.bloques ?? {};
  const grupos = agruparHerramientas(Object.keys(bloques));
  const actual = elegida && bloques[elegida] !== undefined ? elegida : grupos[0]?.tipos[0];

  return (
    <div className="grid gap-6">
      <p className="max-w-3xl text-sm text-white/65">
        Estas son las piezas con las que se arma una lección. Elige una para ver para qué sirve y cómo la ve el alumno. Para usarla,
        abre una lección en <a href={rutas.adminContenido} className="text-neon hover:underline">Módulos</a> y agrégala desde «Agregar
        bloque». Cada módulo termina con su práctica en Blender (solo el examen puede ir después).
      </p>
      <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          {grupos.map((grupo) => (
            <section key={grupo.id} aria-labelledby={`herr-${grupo.id}`}>
              <h2 id={`herr-${grupo.id}`} className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon">
                {grupo.nombre}
              </h2>
              {grupo.detalle && <p className="mt-0.5 text-xs text-white/45">{grupo.detalle}</p>}
              <ul className="mt-2 grid gap-1">
                {grupo.tipos.map((tipo) => (
                  <li key={tipo}>
                    <button
                      type="button"
                      onClick={() => setElegida(tipo)}
                      aria-pressed={tipo === actual}
                      className={`corte-poly-sm flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition ${
                        tipo === actual ? 'bg-amatista text-white' : 'bg-white/5 text-white/75 hover:bg-white/10 hover:text-neon'
                      }`}
                    >
                      {nombreHerramienta(tipo)}
                      {HERRAMIENTAS[tipo]?.nueva && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-neon">
                          <IconoNuevo className="h-3 w-3" />
                          Nueva
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        {actual && <Detalle tipo={actual} ejemplo={bloques[actual]} />}
      </div>
    </div>
  );
}

export default Herramientas;
