import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { validarNombre, validarPassword, validarPasswordNueva, validarTelefono } from '../../auth/validacion';
import EstadoGuardado from '../../components/EstadoGuardado';
import { useProgreso } from '../../progreso/contexto';
import { navegar, rutaEntrar, rutas } from '../../rutas';
import { Alerta, BotonEnviar, Campo, CampoPassword, CLASE_ENLACE, PaginaCuenta } from './Formulario';
import { useFormulario } from './useFormulario';

const ROLES = { alumno: 'Alumno', profesor: 'Profesor', admin: 'Administrador' };

const fecha = (iso) =>
  iso ? new Date(iso).toLocaleString('es', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function Seccion({ id, titulo, children }) {
  return (
    <section aria-labelledby={id} className="corte-poly border border-white/10 bg-superficie/95 p-6 sm:p-7">
      <h2 id={id} className="text-xl font-extrabold text-white">
        {titulo}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EditarDatos({ usuario }) {
  const { actualizarPerfil } = useAuth();
  const { valores, cambiar, errores, error, enviando, enviar } = useFormulario(
    { nombre: usuario.nombre ?? '', telefono: usuario.telefono ?? '' },
    { nombre: validarNombre, telefono: validarTelefono },
  );
  const [guardado, setGuardado] = useState(false);

  const alEnviar = enviar(async ({ nombre, telefono }) => {
    setGuardado(false);
    // Teléfono vacío lo borra.
    const resultado = await actualizarPerfil({ nombre: nombre.trim(), telefono: telefono.trim() || null });
    if (resultado.ok) setGuardado(true);
    return resultado;
  });

  return (
    <form noValidate onSubmit={alEnviar} className="grid gap-4">
      <Campo etiqueta="Nombre" nombre="nombre" autoComplete="name" maxLength={150} valor={valores.nombre} alCambiar={cambiar('nombre')} error={errores.nombre} required />
      <Campo
        etiqueta="Teléfono (opcional)"
        nombre="telefono"
        tipo="tel"
        autoComplete="tel"
        inputMode="tel"
        maxLength={25}
        valor={valores.telefono}
        alCambiar={cambiar('telefono')}
        error={errores.telefono}
      />
      <Alerta>{error}</Alerta>
      {guardado && <Alerta tipo="exito">Datos guardados.</Alerta>}
      <BotonEnviar enviando={enviando} textoEnviando="Guardando…">
        Guardar cambios
      </BotonEnviar>
    </form>
  );
}

function CambiarPassword() {
  const { cambiarPassword } = useAuth();
  const { valores, setValores, cambiar, errores, error, enviando, enviar } = useFormulario(
    { actual: '', nueva: '' },
    { actual: validarPassword, nueva: validarPasswordNueva },
  );
  const [listo, setListo] = useState(false);

  const alEnviar = enviar(async ({ actual, nueva }) => {
    setListo(false);
    const resultado = await cambiarPassword({ actual, nueva });
    if (resultado.ok) {
      setListo(true);
      setValores({ actual: '', nueva: '' });
    }
    return resultado;
  });

  return (
    <form noValidate onSubmit={alEnviar} className="grid gap-4">
      <CampoPassword etiqueta="Contraseña actual" nombre="actual" autoComplete="current-password" valor={valores.actual} alCambiar={cambiar('actual')} error={errores.actual} required />
      <CampoPassword
        etiqueta="Contraseña nueva"
        nombre="nueva"
        autoComplete="new-password"
        maxLength={128}
        valor={valores.nueva}
        alCambiar={cambiar('nueva')}
        error={errores.nueva}
        ayuda="Mínimo 8 caracteres, con al menos una letra y un número. Se cerrarán tus sesiones en otros dispositivos."
        required
      />
      <Alerta>{error}</Alerta>
      {listo && <Alerta tipo="exito">Contraseña actualizada. Las demás sesiones se cerraron.</Alerta>}
      <BotonEnviar enviando={enviando} textoEnviando="Guardando…" variante="secundario">
        Cambiar contraseña
      </BotonEnviar>
    </form>
  );
}

function Sincronizacion() {
  const { sincronizacion, sincronizarAhora, progreso, xp, nivel } = useProgreso();
  const [aviso, setAviso] = useState(null);
  const completadas = Object.values(progreso.lecciones).filter((registro) => registro.completada).length;

  return (
    <>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {[
          ['Lecciones', completadas],
          ['XP', xp],
          ['Nivel', `${nivel.nivel} · ${nivel.titulo}`],
          ['Insignias', Object.keys(progreso.insignias).length],
        ].map(([etiqueta, valor]) => (
          <div key={etiqueta} className="corte-poly-sm bg-base/60 px-3 py-2">
            <dt className="font-mono text-[11px] uppercase tracking-widest text-white/45">{etiqueta}</dt>
            <dd className="font-bold text-white">{valor}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 grid gap-1 text-sm text-texto/75">
        <p>
          Cambios pendientes de enviar: <strong className="text-white">{sincronizacion.pendientes}</strong>
        </p>
        <p>
          Última sincronización: <strong className="text-white">{fecha(sincronizacion.ultima)}</strong>
        </p>
      </div>
      <EstadoGuardado className="mt-4" />
      <button
        type="button"
        onClick={() => {
          const resultado = sincronizarAhora();
          setAviso(resultado.ok ? 'Sincronizando…' : resultado.error);
        }}
        className="corte-poly-sm mt-4 border border-white/10 bg-white/5 px-5 py-2.5 font-bold uppercase tracking-widest text-white/85 hover:bg-white/10"
      >
        Sincronizar ahora ↻
      </button>
      {aviso && (
        <p role="status" className="mt-2 text-sm text-neon">
          {aviso}
        </p>
      )}
    </>
  );
}

function CerrarSesiones() {
  const { cerrarSesion, cerrarTodas } = useAuth();
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const salir = async () => {
    await cerrarSesion();
    navegar(rutas.inicio);
  };

  const salirDeTodas = async () => {
    setEnviando(true);
    setError(null);
    const resultado = await cerrarTodas();
    setEnviando(false);
    if (resultado.ok) navegar(rutas.inicio);
    else setError(resultado.error);
  };

  return (
    <div className="grid gap-3">
      <p className="text-sm text-texto/75">
        Tu progreso sigue guardado en tu cuenta. En este dispositivo volverás al progreso sin cuenta.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={salir}
          className="corte-poly-sm bg-amatista px-5 py-2.5 font-bold uppercase tracking-widest text-white hover:brightness-110"
        >
          Cerrar sesión
        </button>
        {!confirmando ? (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="corte-poly-sm border border-red-400/40 px-5 py-2.5 font-bold uppercase tracking-widest text-red-300 hover:bg-red-400/10"
          >
            Cerrar en todos los dispositivos
          </button>
        ) : (
          <div className="corte-poly-sm grid gap-2 border border-red-400/40 bg-red-400/5 p-3" role="group" aria-label="Confirmar cierre de todas las sesiones">
            <p className="text-sm text-red-200">¿Cerrar la sesión en todos tus dispositivos, incluido este?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={salirDeTodas}
                disabled={enviando}
                className="corte-poly-sm bg-red-500/80 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-50"
              >
                {enviando ? 'Cerrando…' : 'Sí, cerrar todas'}
              </button>
              <button type="button" onClick={() => setConfirmando(false)} className="px-4 py-2 text-sm text-white/70 hover:text-white">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
      <Alerta>{error}</Alerta>
    </div>
  );
}

function Perfil() {
  const { usuario, listo } = useAuth();

  if (!listo) return null;

  if (!usuario) {
    return (
      <PaginaCuenta titulo="Tu perfil" descripcion="Entra con tu cuenta para ver y editar tus datos.">
        <a
          href={rutaEntrar(rutas.perfil)}
          className="corte-poly-sm block bg-amatista px-6 py-3 text-center font-extrabold uppercase tracking-widest text-white hover:brightness-110"
        >
          Entrar ▶
        </a>
        <p className="mt-4 text-center text-sm text-texto/70">
          ¿Sin cuenta?{' '}
          <a href={rutas.registro} className={CLASE_ENLACE}>
            Crea una gratis
          </a>
        </p>
      </PaginaCuenta>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <header className="animar-entrar mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">Tu cuenta</p>
        <h1 className="text-4xl font-extrabold text-white">{usuario.nombre || 'Perfil'}</h1>
      </header>

      <div className="grid gap-6">
        <Seccion id="perfil-datos" titulo="Datos de la cuenta">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-widest text-white/45">Correo</dt>
              <dd className="break-all text-white">
                {usuario.email}{' '}
                {usuario.correo_confirmado ? (
                  <span className="text-emerald-300">✓ confirmado</span>
                ) : (
                  <a href={rutas.confirmar} className={CLASE_ENLACE}>
                    Confirmar correo ▸
                  </a>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-widest text-white/45">Rol</dt>
              <dd className="text-white">{ROLES[usuario.rol] ?? usuario.rol}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-widest text-white/45">Teléfono</dt>
              <dd className="text-white">{usuario.telefono || '—'}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-widest text-white/45">Cuenta creada</dt>
              <dd className="text-white">{fecha(usuario.creado_en)}</dd>
            </div>
          </dl>
        </Seccion>

        <Seccion id="perfil-editar" titulo="Editar datos">
          <EditarDatos key={usuario.id} usuario={usuario} />
        </Seccion>

        <Seccion id="perfil-sincronizacion" titulo="Progreso y sincronización">
          <Sincronizacion />
        </Seccion>

        <Seccion id="perfil-password" titulo="Contraseña">
          <CambiarPassword />
        </Seccion>

        <Seccion id="perfil-sesion" titulo="Sesión">
          <CerrarSesiones />
        </Seccion>
      </div>
    </main>
  );
}

export default Perfil;
