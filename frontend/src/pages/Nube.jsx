// Amatista Cloud (#/nube): una hora de Blender en la nube, desde el navegador, para cuentas de la UTN.
// Las sesiones corren en los nodos (la VM de Oracle y ordenadores del equipo) que coordina la API
// (backend/api/nube.py). Guía: docs/nube/README.md.
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/contexto';
import Pagina from '../components/estructura/Pagina';
import TituloSeccion from '../components/estructura/TituloSeccion';
import { entrar, estadoNube, guardarToken, leerToken, minutosRestantes, pedirSesion, renovarToken, sesionActual, terminarSesion } from '../nube/cliente';
import { rutaEntrar, rutas } from '../rutas';
import { pedirJSON } from '../services/api';

function Cifra({ valor, etiqueta }) {
  return (
    <div className="corte-poly-sm border border-white/10 bg-base/60 px-4 py-3">
      <dd className="text-2xl font-extrabold text-white">{valor}</dd>
      <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-texto/60">{etiqueta}</dt>
    </div>
  );
}

function Nodos({ token }) {
  const [panel, setPanel] = useState(null);
  useEffect(() => {
    let vivo = true;
    const leer = () => pedirJSON('/api/nube/v1/admin', { token }).then((r) => vivo && r.ok && setPanel(r.datos));
    leer();
    const reloj = setInterval(leer, 10000);
    return () => {
      vivo = false;
      clearInterval(reloj);
    };
  }, [token]);
  if (!panel) return null;
  return (
    <section aria-labelledby="nube-nodos" className="mt-12">
      <TituloSeccion id="nube-nodos" antetitulo="Solo para el equipo" titulo="Nodos y sesiones" descripcion="Se actualiza cada 10 segundos." />
      <div className="corte-poly mt-4 overflow-x-auto border border-white/10 bg-superficie/90">
        <table className="w-full text-left text-sm">
          <thead className="font-mono text-[11px] uppercase tracking-[0.2em] text-texto/60">
            <tr><th className="p-3">Nodo</th><th className="p-3">Estado</th><th className="p-3">Lugares</th><th className="p-3">Equipo</th></tr>
          </thead>
          <tbody>
            {panel.nodos.map((n) => (
              <tr key={n.nombre} className="border-t border-white/5">
                <td className="p-3 font-semibold text-white">{n.nombre}</td>
                <td className="p-3">{n.vivo ? <span className="text-emerald-300">En línea</span> : <span className="text-white/50">Sin señal</span>}</td>
                <td className="p-3">{n.ocupadas} de {n.capacidad}</td>
                <td className="p-3 text-texto/70">{n.arquitectura} · {n.nucleos} hilos · {n.ram_gb} GB{n.carga != null ? ` · carga ${n.carga}` : ''}</td>
              </tr>
            ))}
            {panel.nodos.length === 0 && <tr><td className="p-3 text-texto/70" colSpan={4}>Ningún nodo se ha anunciado todavía.</td></tr>}
          </tbody>
        </table>
      </div>
      {panel.vivas.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-texto/80">
          {panel.vivas.map((s) => (
            <li key={s.id}>{s.correo} · {s.nodo} · {s.estado} · quedan {Math.floor(s.segundos_restantes / 60)} min</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Nube() {
  const { usuario, token, esAdmin } = useAuth();
  const [estado, setEstado] = useState(null);
  const [sesion, setSesion] = useState(null);
  const [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [, setReloj] = useState(0);

  const consultar = useCallback(
    () => Promise.all([estadoNube(token), token ? sesionActual(token) : Promise.resolve(null)]),
    [token],
  );
  const aplicar = useCallback(([e, s]) => {
    if (e.ok) setEstado(e.datos);
    else setAviso(e.error || 'No se pudo consultar Amatista Cloud.');
    if (s?.ok) setSesion(s.datos.sesion);
  }, []);
  const actualizar = useCallback(() => consultar().then(aplicar), [consultar, aplicar]);

  useEffect(() => {
    let vivo = true;
    consultar().then((r) => vivo && aplicar(r));
    return () => {
      vivo = false;
    };
  }, [consultar, aplicar]);

  // Mientras se prepara se pregunta seguido; con la sesión lista, cada 30 s para el reloj.
  useEffect(() => {
    const cada = sesion?.estado === 'asignada' ? 2000 : sesion ? 30000 : 20000;
    const reloj = setInterval(() => {
      setReloj((n) => n + 1);
      actualizar();
    }, cada);
    return () => clearInterval(reloj);
  }, [sesion, actualizar]);

  const pedir = async () => {
    setOcupado(true);
    setAviso('');
    const r = await pedirSesion(token);
    setOcupado(false);
    if (!r.ok) {
      setAviso(r.error);
      actualizar();
      return;
    }
    guardarToken(r.datos);
    setSesion(r.datos);
  };

  const abrir = async () => {
    let clave = leerToken(sesion.id);
    if (!clave) {
      // Otro dispositivo o se borró el navegador: token nuevo (el anterior deja de servir).
      const r = await renovarToken(token, sesion.id);
      if (!r.ok) {
        setAviso(r.error);
        return;
      }
      guardarToken(r.datos);
      clave = r.datos.token;
    }
    entrar(sesion, clave);
  };

  const terminar = async () => {
    if (!window.confirm('¿Terminar la sesión? Lo que no hayas descargado de «Archivos» se borra.')) return;
    await terminarSesion(token, sesion.id);
    setSesion(null);
    actualizar();
  };

  const minutos = minutosRestantes(sesion);

  return (
    <Pagina
      ancho="contenido"
      migas={[{ texto: 'Cursos', href: rutas.inicio }, { texto: 'Amatista Cloud' }]}
      encabezado={{
        antetitulo: 'Amatista Cloud · UTN',
        titulo: 'Blender en la nube, desde cualquier ordenador',
        descripcion: 'Una hora de Blender en un equipo más potente que el del laboratorio, desde el navegador y sin instalar nada. Para cuentas de la UTN.',
      }}
    >
      <section aria-labelledby="nube-ahora" className="mt-8">
        <TituloSeccion id="nube-ahora" antetitulo="1 · Ahora mismo" titulo={estado ? (estado.libres === 1 ? '1 lugar libre' : `${estado.libres} lugares libres`) : 'Consultando…'}
          descripcion={estado ? (estado.nodos ? `En ${estado.nodos} ${estado.nodos === 1 ? 'equipo' : 'equipos'} con ${estado.capacidad} lugares en total.` : 'Ningún equipo de Amatista Cloud está encendido en este momento.') : ''} />
        {estado && (
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <Cifra valor={`${estado.minutos} min`} etiqueta="Por sesión" />
            <Cifra valor={esAdmin ? 'Sin límite' : usuario ? `${estado.usadas_hoy} de ${estado.por_dia}` : estado.por_dia} etiqueta={usuario ? 'Tus sesiones hoy' : 'Sesiones al día'} />
            <Cifra valor={estado.dominios.map((d) => '@' + d).join(' ')} etiqueta="Cuentas permitidas" />
          </dl>
        )}
      </section>

      <section aria-labelledby="nube-sesion" className="mt-10">
        <TituloSeccion id="nube-sesion" antetitulo="2 · Tu sesión" titulo={sesion ? (sesion.estado === 'lista' ? 'Tu Blender está listo' : 'Preparando tu escritorio…') : 'Abre tu Blender'} />
        <div className="corte-poly mt-4 border border-white/10 bg-superficie/90 p-6">
          {!usuario && (
            <>
              <p className="text-texto/85">Entra con tu cuenta de la UTN para usar Amatista Cloud.</p>
              <a href={rutaEntrar(rutas.nube)} className="boton boton--grande mt-4 inline-block">Entrar con mi cuenta</a>
            </>
          )}
          {usuario && estado?.motivo && !sesion && <p className="text-amber-200">{estado.motivo}</p>}
          {usuario && estado?.puede && !sesion && (
            <>
              <p className="text-texto/85">Se abre un escritorio con Blender solo para ti durante {estado.minutos} minutos. Cuando esté listo, entras con un clic.</p>
              <button type="button" onClick={pedir} disabled={ocupado || !estado.libres || (!esAdmin && estado.usadas_hoy >= estado.por_dia)}
                className="boton boton--grande mt-4 disabled:opacity-40">
                {ocupado ? 'Pidiendo tu lugar…' : 'Abrir mi Blender en la nube'}
              </button>
            </>
          )}
          {sesion?.estado === 'asignada' && (
            <p className="animate-pulse text-texto/85">Estamos encendiendo tu escritorio en el equipo «{sesion.nodo}». Tarda unos segundos…</p>
          )}
          {sesion?.estado === 'lista' && (
            <>
              <p className="text-texto/85">
                Quedan <strong className="text-white">{minutos} minutos</strong>. Guarda en la carpeta <strong>Proyectos</strong> y descarga tus archivos antes de que termine: al cerrar, el escritorio se borra.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={abrir} className="boton boton--grande">Entrar a Blender</button>
                <a href={sesion.archivos} target="_blank" rel="noopener noreferrer" className="boton boton--grande boton--secundario">Mis archivos</a>
                <button type="button" onClick={terminar} className="boton boton--grande boton--secundario">Terminar sesión</button>
              </div>
              <p className="mt-3 text-xs text-texto/60">«Mis archivos» funciona después de entrar a Blender una vez desde este navegador.</p>
            </>
          )}
          {aviso && <p role="alert" className="mt-4 text-amber-200">{aviso}</p>}
        </div>
      </section>

      <section aria-labelledby="nube-reglas" className="mt-10">
        <TituloSeccion id="nube-reglas" antetitulo="3 · Reglas" titulo="Para aprender, no para renderizar" />
        <ul className="mt-4 grid gap-3 text-sm text-texto/85 sm:grid-cols-2">
          <li className="corte-poly-sm border border-white/10 bg-base/60 p-4"><strong className="text-white">Una hora por sesión</strong> y {estado?.por_dia ?? 2} sesiones al día. El acceso vence con la hora: así alcanza para todo el grupo.</li>
          <li className="corte-poly-sm border border-white/10 bg-base/60 p-4"><strong className="text-white">Solo tú entras</strong> a tu escritorio: tu token vale para esa sesión y nada más.</li>
          <li className="corte-poly-sm border border-white/10 bg-base/60 p-4"><strong className="text-white">Sin internet adentro</strong>: Blender trabaja con lo que subas en «Mis archivos» (hasta 100 MB por archivo).</li>
          <li className="corte-poly-sm border border-white/10 bg-base/60 p-4"><strong className="text-white">Renders de hasta 1280×720</strong> y sin animaciones completas: el equipo se comparte. Si nadie se conecta en 15 minutos, la sesión se cierra.</li>
        </ul>
      </section>

      <section aria-labelledby="nube-como" className="mt-10">
        <TituloSeccion id="nube-como" antetitulo="4 · Cómo funciona" titulo="La nube de Oracle y los equipos del laboratorio, juntos" />
        <p className="mt-3 text-texto/85">
          Amatista Cloud reparte cada sesión en el equipo con más lugar libre: la nube de Oracle o un ordenador del equipo de Amatista que presta sus núcleos. Cada escritorio corre aislado, con su propio procesador y memoria, y con el perfil de <a href={rutas.geoda} className="text-neon hover:underline">Geoda</a> para equipos sin tarjeta gráfica.
        </p>
        <p className="mt-3 text-sm text-texto/70">
          ¿Prefieres tu propio ordenador? <a href={rutas.geoda} className="text-neon hover:underline">Geoda</a> te dice qué Blender instalar y <a href={rutas.biblioteca} className="text-neon hover:underline">la biblioteca</a> tiene texturas y modelos libres para tus prácticas.
        </p>
      </section>

      {esAdmin && token && <Nodos token={token} />}
    </Pagina>
  );
}
