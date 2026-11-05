// Los grupos del profesor: crear uno (trae su código) y entrar a cada uno.
import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { Boton, CampoAdmin, CargandoAdmin, ErrorAdmin, Mensaje, Pastilla, Vacio } from '../../components/admin/ui';
import { useDatosAdmin } from '../../components/admin/useDatosAdmin';
import { codigoDictado } from '../../profesor/logica';
import { rutas } from '../../rutas';
import { crearGrupo, listarGrupos } from '../../services/evaluacion';

const CAMPO = 'corte-poly-sm w-full border border-white/10 bg-base/70 px-3 py-2.5 text-white placeholder:text-white/30 focus:border-neon focus:outline-none';

function NuevoGrupo({ alCrear }) {
  const { token } = useAuth();
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState({ enviando: false, error: null });

  const enviar = async (evento) => {
    evento.preventDefault();
    setEstado({ enviando: true, error: null });
    const respuesta = await crearGrupo(token, nombre);
    if (!respuesta.ok) {
      setEstado({ enviando: false, error: respuesta.error });
      return;
    }
    setNombre('');
    setEstado({ enviando: false, error: null });
    alCrear(respuesta.datos);
  };

  return (
    <form onSubmit={enviar} className="corte-poly border border-white/10 bg-superficie/95 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <CampoAdmin etiqueta="Nuevo grupo" ayuda="Por ejemplo «3.º B · tarde» o «Taller de los sábados»." className="flex-1">
          {({ id, describe }) => (
            <input id={id} aria-describedby={describe} className={CAMPO} value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={120} required minLength={2} placeholder="Nombre del grupo" />
          )}
        </CampoAdmin>
        <Boton type="submit" variante="primario" disabled={estado.enviando || nombre.trim().length < 2}>
          {estado.enviando ? 'Creando…' : 'Crear grupo'}
        </Boton>
      </div>
      <Mensaje tono="error" className="mt-3">{estado.error}</Mensaje>
    </form>
  );
}

function TarjetaGrupo({ grupo, nuevo }) {
  return (
    <a
      href={rutas.profesorGrupo(grupo.id)}
      className={`corte-poly group block border bg-superficie/95 p-5 transition hover:border-neon ${nuevo ? 'border-neon' : 'border-white/10'} ${grupo.archivado ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-lg font-extrabold text-white group-hover:text-neon">{grupo.nombre}</h3>
        {grupo.archivado ? <Pastilla>Archivado</Pastilla> : grupo.por_evaluar > 0 && <Pastilla tono="bg-neon/10 text-neon">{grupo.por_evaluar} por evaluar</Pastilla>}
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-white/45">Código para unirse</p>
      <p className="font-mono text-2xl font-extrabold tracking-[0.2em] text-amatista-claro" aria-label={`Código ${codigoDictado(grupo.codigo)}`}>
        {grupo.codigo}
      </p>
      <p className="mt-3 text-sm text-white/60">
        {grupo.alumnos} {grupo.alumnos === 1 ? 'alumno' : 'alumnos'} · {grupo.practicas} {grupo.practicas === 1 ? 'práctica' : 'prácticas'}
      </p>
    </a>
  );
}

function Grupos() {
  const { token } = useAuth();
  const { respuesta, cargando, recargar, modificar } = useDatosAdmin(() => listarGrupos(token), token);
  const [nuevo, setNuevo] = useState(null);
  const grupos = respuesta?.ok ? respuesta.datos : [];
  const activos = grupos.filter((g) => !g.archivado);
  const archivados = grupos.filter((g) => g.archivado);

  return (
    <div className="space-y-6">
      <NuevoGrupo
        alCrear={(grupo) => {
          setNuevo(grupo.id);
          modificar((lista) => [grupo, ...(lista ?? [])]);
        }}
      />
      {nuevo && (
        <Mensaje tono="exito">
          Grupo creado. Dicta el código a tus alumnos: lo escriben en <strong>Mi panel › Mi grupo</strong> (necesitan una cuenta con correo).
        </Mensaje>
      )}
      <ErrorAdmin respuesta={respuesta} alReintentar={recargar} />
      {cargando && !respuesta ? (
        <CargandoAdmin texto="Cargando tus grupos…" />
      ) : respuesta?.ok && grupos.length === 0 ? (
        <Vacio titulo="Todavía no tienes grupos.">Crea uno arriba; cada grupo trae un código para que tus alumnos se unan.</Vacio>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activos.map((g) => <TarjetaGrupo key={g.id} grupo={g} nuevo={g.id === nuevo} />)}
          </div>
          {archivados.length > 0 && (
            <details className="text-sm text-white/60">
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-widest">Archivados ({archivados.length})</summary>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {archivados.map((g) => <TarjetaGrupo key={g.id} grupo={g} />)}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}

export default Grupos;
