import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { limpiarCodigo, validarCodigo, validarCorreo, validarPasswordNueva } from '../../auth/validacion';
import { navegar, rutas } from '../../rutas';
import {
  Alerta,
  BotonEnviar,
  Campo,
  CampoCodigo,
  CampoPassword,
  CLASE_ENLACE,
  CodigoDesarrollo,
  PaginaCuenta,
} from './Formulario';
import { useFormulario } from './useFormulario';

const AVISO_ENVIO = 'Si existe una cuenta con ese correo, te enviamos un código de 6 dígitos. Vence en 15 minutos.';

// Paso 1: pedir el código por correo.
function PedirCodigo({ emailInicial, alEnviarCodigo }) {
  const { recuperar } = useAuth();
  const { valores, cambiar, errores, error, enviando, enviar } = useFormulario(
    { email: emailInicial },
    { email: validarCorreo },
  );

  const alEnviar = enviar(async ({ email }) => {
    const resultado = await recuperar(email.trim());
    if (resultado.ok) alEnviarCodigo(email.trim(), resultado.datos?.codigo_dev ?? null);
    return resultado;
  });

  return (
    <form noValidate onSubmit={alEnviar} className="grid gap-4">
      <Campo
        etiqueta="Correo de tu cuenta"
        nombre="email"
        tipo="email"
        autoComplete="email"
        inputMode="email"
        valor={valores.email}
        alCambiar={cambiar('email')}
        error={errores.email}
        required
      />
      <Alerta>{error}</Alerta>
      <BotonEnviar enviando={enviando} textoEnviando="Enviando código…">
        Enviar código ▶
      </BotonEnviar>
    </form>
  );
}

// Paso 2: código + contraseña nueva. Al terminar se entra con la contraseña nueva.
function Restablecer({ email, codigoDev, alReenviar }) {
  const { restablecer, iniciarSesion } = useAuth();
  const { valores, cambiar, errores, error, enviando, enviar } = useFormulario(
    { codigo: '', password: '' },
    { codigo: validarCodigo, password: validarPasswordNueva },
  );
  const [aviso, setAviso] = useState(AVISO_ENVIO);
  const [listo, setListo] = useState(false);

  const alEnviar = enviar(async ({ codigo, password }) => {
    const resultado = await restablecer({ email, codigo: limpiarCodigo(codigo), password });
    if (!resultado.ok) return resultado;
    const entrada = await iniciarSesion({ email, password });
    if (entrada.ok) navegar(rutas.panel);
    else setListo(true);
    return { ok: true };
  });

  if (listo) {
    return (
      <>
        <Alerta tipo="exito">Listo: cambiaste tu contraseña. Ya puedes entrar con la nueva.</Alerta>
        <a
          href={`${rutas.entrar}?email=${encodeURIComponent(email)}`}
          className="corte-poly-sm destello mt-6 block bg-amatista px-6 py-3 text-center font-extrabold uppercase tracking-widest text-white hover:brightness-110"
        >
          Entrar ▶
        </a>
      </>
    );
  }

  return (
    <form noValidate onSubmit={alEnviar} className="grid gap-4">
      <Alerta tipo="info">{aviso}</Alerta>
      <p className="text-sm text-texto/70">
        Correo: <strong className="text-white">{email}</strong>
      </p>
      <CampoCodigo valor={valores.codigo} alCambiar={cambiar('codigo')} error={errores.codigo} />
      <CodigoDesarrollo codigo={codigoDev} />
      <CampoPassword
        etiqueta="Contraseña nueva"
        nombre="password"
        autoComplete="new-password"
        maxLength={128}
        valor={valores.password}
        alCambiar={cambiar('password')}
        error={errores.password}
        ayuda="Mínimo 8 caracteres, con al menos una letra y un número. Se cerrarán las sesiones abiertas en otros dispositivos."
        required
      />
      <Alerta>{error}</Alerta>
      <BotonEnviar enviando={enviando} textoEnviando="Guardando…">
        Cambiar contraseña ▶
      </BotonEnviar>
      <button
        type="button"
        onClick={async () => {
          setAviso('Enviando un código nuevo…');
          await alReenviar();
          setAviso(AVISO_ENVIO);
        }}
        className={`text-sm ${CLASE_ENLACE}`}
      >
        ¿No te llegó? Enviar otro código
      </button>
    </form>
  );
}

function Recuperar({ consulta = {} }) {
  const { recuperar } = useAuth();
  const [envio, setEnvio] = useState(null); // {email, codigoDev}

  const reenviar = async () => {
    const resultado = await recuperar(envio.email);
    if (resultado.ok) setEnvio({ ...envio, codigoDev: resultado.datos?.codigo_dev ?? null });
  };

  return (
    <PaginaCuenta
      titulo="Recuperar cuenta"
      descripcion={
        envio
          ? 'Escribe el código que te enviamos y elige una contraseña nueva.'
          : 'Te enviaremos un código a tu correo para elegir una contraseña nueva.'
      }
      pie={
        <p>
          ¿La recordaste?{' '}
          <a href={rutas.entrar} className={CLASE_ENLACE}>
            Entra aquí
          </a>
          {envio && (
            <>
              {' · '}
              <button type="button" onClick={() => setEnvio(null)} className={CLASE_ENLACE}>
                Usar otro correo
              </button>
            </>
          )}
        </p>
      }
    >
      {envio ? (
        <Restablecer key={envio.email} email={envio.email} codigoDev={envio.codigoDev} alReenviar={reenviar} />
      ) : (
        <PedirCodigo
          emailInicial={consulta.email ?? ''}
          alEnviarCodigo={(email, codigoDev) => setEnvio({ email, codigoDev })}
        />
      )}
    </PaginaCuenta>
  );
}

export default Recuperar;
