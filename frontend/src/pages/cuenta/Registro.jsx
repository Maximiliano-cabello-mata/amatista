import { useAuth } from '../../auth/contexto';
import { validarCorreo, validarNombre, validarPasswordNueva, validarTelefono } from '../../auth/validacion';
import { useProgreso } from '../../progreso/contexto';
import { navegar, rutas } from '../../rutas';
import { Alerta, BotonEnviar, Campo, CampoPassword, CLASE_ENLACE, PaginaCuenta } from './Formulario';
import { useFormulario } from './useFormulario';

function Registro({ consulta = {} }) {
  const { usuario, registrar } = useAuth();
  const { xp, progreso } = useProgreso();
  const formulario = useFormulario(
    { nombre: '', email: consulta.email ?? '', password: '', telefono: '' },
    { nombre: validarNombre, email: validarCorreo, password: validarPasswordNueva, telefono: validarTelefono },
  );
  const { valores, cambiar, errores, error, enviando, enviar } = formulario;
  const lecciones = Object.values(progreso.lecciones).filter((registro) => registro.completada).length;

  if (usuario) {
    return (
      <PaginaCuenta titulo="Ya tienes cuenta">
        <p className="text-texto/80">
          Entraste como <strong className="text-white">{usuario.nombre || usuario.email}</strong>.
        </p>
        <a href={rutas.panel} className="corte-poly-sm destello mt-6 block bg-amatista px-6 py-3 text-center font-extrabold uppercase tracking-widest text-white hover:brightness-110">
          Ir a mi panel ▶
        </a>
      </PaginaCuenta>
    );
  }

  const alEnviar = enviar(async ({ nombre, email, password, telefono }) => {
    const datos = { nombre: nombre.trim(), email: email.trim(), password };
    if (telefono.trim()) datos.telefono = telefono.trim();
    const resultado = await registrar(datos);
    if (resultado.ok) {
      // Con o sin sesión abierta, el siguiente paso es confirmar el correo.
      navegar(`${rutas.confirmar}?email=${encodeURIComponent(datos.email)}`);
    }
    return resultado;
  });

  return (
    <PaginaCuenta
      titulo="Crear cuenta"
      descripcion="Guarda tu avance en la nube y continúa en cualquier dispositivo."
      pie={
        <p>
          ¿Ya tienes cuenta?{' '}
          <a href={rutas.entrar} className={CLASE_ENLACE}>
            Entra aquí
          </a>
        </p>
      }
    >
      <Alerta tipo="info">
        El progreso de este dispositivo se conserva: se une a tu nueva cuenta
        {lecciones > 0 ? ` (${lecciones} ${lecciones === 1 ? 'lección' : 'lecciones'} · ${xp} XP).` : '.'}
      </Alerta>
      <form noValidate onSubmit={alEnviar} className="mt-5 grid gap-4">
        <Campo
          etiqueta="Nombre"
          nombre="nombre"
          autoComplete="name"
          maxLength={150}
          valor={valores.nombre}
          alCambiar={cambiar('nombre')}
          error={errores.nombre}
          required
        />
        <Campo
          etiqueta="Correo"
          nombre="email"
          tipo="email"
          autoComplete="email"
          inputMode="email"
          maxLength={100}
          valor={valores.email}
          alCambiar={cambiar('email')}
          error={errores.email}
          ayuda="Te enviaremos un código de 6 dígitos para confirmarlo."
          required
        />
        <CampoPassword
          etiqueta="Contraseña"
          nombre="password"
          autoComplete="new-password"
          maxLength={128}
          valor={valores.password}
          alCambiar={cambiar('password')}
          error={errores.password}
          ayuda="Mínimo 8 caracteres, con al menos una letra y un número."
          required
        />
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
        <Alerta>
          {error}
          {error && /ya existe/i.test(error) && (
            <>
              {' '}
              <a href={`${rutas.entrar}?email=${encodeURIComponent(valores.email.trim())}`} className={CLASE_ENLACE}>
                Entrar
              </a>{' '}
              ·{' '}
              <a href={`${rutas.recuperar}?email=${encodeURIComponent(valores.email.trim())}`} className={CLASE_ENLACE}>
                Recuperar contraseña
              </a>
            </>
          )}
        </Alerta>
        <BotonEnviar enviando={enviando} textoEnviando="Creando cuenta…">
          Crear cuenta ▶
        </BotonEnviar>
      </form>
    </PaginaCuenta>
  );
}

export default Registro;
