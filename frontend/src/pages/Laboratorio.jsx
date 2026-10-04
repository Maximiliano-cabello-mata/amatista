// Diagnóstico técnico (#/laboratorio), solo para profesores y administradores:
// estado del backend y de Oracle, cuenta, catálogo y sincronización de este
// dispositivo, y una escena A-Frame para comprobar que el visor 3D funciona.
// No aparece en la navegación de los alumnos; se abre desde Admin › Estado.
// Se carga bajo demanda, así A-Frame no pesa en la pantalla de inicio.
import 'aframe';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/contexto';
import { useCatalogo } from '../catalogo/contexto';
import { useProgreso } from '../progreso/contexto';
import { rutas } from '../rutas';
import { API_URL, consultarSalud } from '../services/api';

// Estado de la cuenta, del catálogo y de la sincronización (diagnóstico).
function Diagnostico() {
  const { usuario } = useAuth();
  const { origen, version, actualizar } = useCatalogo();
  const { progreso, sincronizacion, sincronizarAhora } = useProgreso();
  const [aviso, setAviso] = useState(null);

  const probar = async (accion, exito) => {
    setAviso('Probando…');
    const resultado = await accion();
    setAviso(resultado.ok ? exito : resultado.error);
  };

  return (
    <div className="border-b border-white/10 pb-4 text-xs text-gray-400">
      <h2 className="mb-2 text-sm font-semibold text-amatista-claro">Diagnóstico</h2>
      <p>
        Cuenta: <span className="text-white">{usuario ? `${usuario.email} (${usuario.rol})` : 'sin sesión (anónimo)'}</span>
      </p>
      <p className="truncate">
        Id local: <span className="text-white">{progreso.cuentaId ?? progreso.alumnoId}</span>
      </p>
      <p>
        Catálogo: <span className="text-white">{origen === 'servidor' ? `servidor · ${version}` : 'empaquetado en la app'}</span>
      </p>
      <p>
        Pendientes: <span className="text-white">{sincronizacion.pendientes}</span> · eventos:{' '}
        <span className="text-white">{sincronizacion.eventosPendientes}</span>
      </p>
      {sincronizacion.error && <p className="text-red-400">{sincronizacion.error}</p>}
      <div className="mt-3 grid gap-2">
        <button
          type="button"
          onClick={() => probar(sincronizarAhora, 'Sincronización enviada.')}
          className="corte-poly-sm w-full bg-white/10 py-2 text-xs font-bold text-white hover:bg-white/20"
        >
          Sincronizar ahora
        </button>
        <button
          type="button"
          onClick={() => probar(actualizar, 'Catálogo al día.')}
          className="corte-poly-sm w-full bg-white/10 py-2 text-xs font-bold text-white hover:bg-white/20"
        >
          Actualizar catálogo
        </button>
      </div>
      {aviso && (
        <p className="mt-2 text-neon" role="status">
          {aviso}
        </p>
      )}
    </div>
  );
}

function Laboratorio() {
  const { esProfesor } = useAuth();
  const [salud, setSalud] = useState(null);

  useEffect(() => {
    consultarSalud().then(setSalud);
  }, []);

  let status = "Conectando...";
  if (salud) {
    if (!salud.backend) status = "Backend: sin respuesta";
    else status = salud.baseDatos ? `Base de datos: conectada (${salud.detalle})` : "Backend activo · base de datos con error";
  }
  const online = Boolean(salud?.baseDatos);

  if (!esProfesor) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-extrabold text-white">Esta página es para el equipo de Amatista</h1>
        <p className="mt-2 text-sm text-white/60">Tus cursos y tu avance están en tu panel.</p>
        <a href={rutas.inicio} className="corte-poly-sm mt-6 inline-block bg-amatista px-5 py-2.5 text-sm font-bold text-white hover:brightness-110">
          Ir a mis cursos
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <a href={rutas.adminSistema} className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-neon">
            ◂ Volver al panel
          </a>
          <h1 className="mt-1 text-2xl font-extrabold text-white">Diagnóstico técnico</h1>
        </div>
        <span
          role="status"
          className={`corte-poly-sm border px-3 py-1.5 font-mono text-xs uppercase tracking-wider ${
            online
              ? "border-amatista/50 bg-amatista/20 text-amatista-claro"
              : "border-red-500/50 bg-red-500/20 text-red-400"
          }`}
        >
          {status}
        </span>
      </div>

      <p className="font-mono text-xs text-white/40">
        Backend: {API_URL}
        {salud?.detalle && !salud.baseDatos && <span className="block text-red-400">{salud.detalle}</span>}
      </p>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="corte-poly flex flex-col gap-4 bg-superficie p-4 lg:w-1/4">
          <Diagnostico />
        </aside>

        <section className="corte-poly relative h-[60vh] flex-1 overflow-hidden bg-black">
          <div className="absolute left-4 top-4 z-10 border border-white/10 bg-base/80 px-3 py-1 font-mono text-sm text-neon">
            Prueba del visor A-Frame
          </div>
          <a-scene embedded style={{ height: "100%", width: "100%" }}>
            <a-box position="-1 0.5 -3" rotation="0 45 0" color="#9B59B6"></a-box>
            <a-sphere position="0 1.25 -5" radius="1.25" color="#00E5FF"></a-sphere>
            <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFFFFF"></a-cylinder>
            <a-plane position="0 0 -4" rotation="-90 0 0" width="10" height="10" color="#1E1E1E"></a-plane>
            <a-sky color="#121212"></a-sky>
          </a-scene>
        </section>
      </div>
    </main>
  );
}

export default Laboratorio;
