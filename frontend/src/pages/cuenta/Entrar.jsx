import { useAuth } from '../../auth/contexto';
import { validarCorreo, validarPassword } from '../../auth/validacion';
import { destinoTrasEntrar, navegar, rutas } from '../../rutas';
import { Alerta, BotonEnviar, Campo, CampoPassword, CLASE_ENLACE, PaginaCuenta } from './Formulario';
import { useFormulario } from './useFormulario';

const conCorreo = (ruta, email) => (email ? `${ruta}?email=${encodeURIComponent(email.trim())}` : ruta);

function Entrar({ consulta = {} }) {
  const { usuario, iniciarSesion, cerrarSesion } = useAuth();
  const formulario = useFormulario(
    { email: consulta.email ?? '', password: '' },
    { email: validarCorreo, password: validarPassword },
  );
  const { valores, cambiar, errores, error, enviando, enviar } = formulario;
  const destino = destinoTrasEntrar(consulta);

  if (usuario) {
    return (
      <PaginaCuenta titulo="Ya entraste">
        <p className="text-texto/80">
          Estás usando la cuenta de <strong className="text-white">{usuario.nombre || usuario.email}</strong>.
        </p>
        <div className="mt-6 grid gap-3">
          <a href={destino} className="corte-poly-sm block bg-amatista px-6 py-3 text-center font-extrabold uppercase tracking-widest text-white hover:brightness-110">
            Continuar ▶
          </a>
          <button
            type="button"
            onClick={cerrarSesion}
            className="corte-poly-sm border border-white/10 bg-white/5 px-6 py-3 font-bold uppercase tracking-widest text-white/80 hover:bg-white/10"
          >
            Entrar con otra cuenta
          </button>
        </div>
      </PaginaCuenta>
    );
  }

  const alEnviar = enviar(async ({ email, password }) => {
    const resultado = await iniciarSesion({ email: email.trim(), password });
    if (resultado.ok) navegar(destino);
    return resultado;
  });

  return (
    <PaginaCuenta
      titulo="Entrar"
      descripcion="Entra para guardar tu progreso en tu cuenta y continuar en cualquier dispositivo."
      pie={
        <>
          <p>
            ¿Aún no tienes cuenta?{' '}
            <a href={conCorreo(rutas.registro, valores.email)} className={CLASE_ENLACE}>
              Crea una gratis
            </a>
          </p>
          <p>
            ¿Ya tienes un código?{' '}
            <a href={conCorreo(rutas.confirmar, valores.email)} className={CLASE_ENLACE}>
              Confirma tu correo
            </a>
          </p>
        </>
      }
    >
      <form noValidate onSubmit={alEnviar} className="grid gap-4">
        <Campo
          etiqueta="Correo"
          nombre="email"
          tipo="email"
          autoComplete="email"
          inputMode="email"
          valor={valores.email}
          alCambiar={cambiar('email')}
          error={errores.email}
          required
        />
        <CampoPassword
          etiqueta="Contraseña"
          nombre="password"
          autoComplete="current-password"
          valor={valores.password}
          alCambiar={cambiar('password')}
          error={errores.password}
          required
        />
        <Alerta>
          {error}
          {error && /confirma tu correo/i.test(error) && (
            <>
              {' '}
              <a href={conCorreo(rutas.confirmar, valores.email)} className={CLASE_ENLACE}>
                Escribir el código
              </a>
            </>
          )}
        </Alerta>
        <BotonEnviar enviando={enviando} textoEnviando="Entrando…">
          Entrar ▶
        </BotonEnviar>
        <a href={conCorreo(rutas.recuperar, valores.email)} className={`text-center text-sm ${CLASE_ENLACE}`}>
          ¿Olvidaste tu contraseña?
        </a>
      </form>
    </PaginaCuenta>
  );
}

export default Entrar;
