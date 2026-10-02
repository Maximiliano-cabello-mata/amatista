import { useState } from 'react';
import { useAuth } from '../../auth/contexto';
import { limpiarCodigo, validarCodigo, validarCorreo } from '../../auth/validacion';
import { rutas } from '../../rutas';
import { Alerta, BotonEnviar, Campo, CampoCodigo, CLASE_ENLACE, CodigoDesarrollo, PaginaCuenta } from './Formulario';
import { useFormulario } from './useFormulario';

const CLASE_BOTON_PRINCIPAL =
  'corte-poly-sm block bg-amatista px-6 py-3 text-center font-extrabold uppercase tracking-widest text-white hover:brightness-110';

function Confirmar({ consulta = {} }) {
  const { usuario, emailPendiente, codigoDev, confirmarCorreo, reenviarCodigo } = useAuth();
  // Con sesión el correo es el de la cuenta; sin sesión se escribe (o llega del registro).
  const correoFijo = usuario?.email ?? null;
  const formulario = useFormulario(
    { email: consulta.email ?? emailPendiente ?? '', codigo: '' },
    correoFijo ? { codigo: validarCodigo } : { email: validarCorreo, codigo: validarCodigo },
  );
  const { valores, cambiar, errores, error, setError, enviando, enviar } = formulario;
  const [confirmado, setConfirmado] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [reenviando, setReenviando] = useState(false);
  const correo = correoFijo ?? valores.email.trim();

  if (confirmado || usuario?.correo_confirmado) {
    return (
      <PaginaCuenta titulo={confirmado ? '¡Correo confirmado!' : 'Correo confirmado'}>
        <Alerta tipo="exito">Tu correo {correo && <strong>{correo}</strong>} ya está confirmado.</Alerta>
        <a
          href={usuario ? rutas.panel : `${rutas.entrar}?email=${encodeURIComponent(correo)}`}
          className={`mt-6 ${CLASE_BOTON_PRINCIPAL}`}
        >
          {usuario ? 'Ir a mi panel ▶' : 'Entrar ▶'}
        </a>
      </PaginaCuenta>
    );
  }

  const alEnviar = enviar(async ({ codigo }) => {
    const resultado = await confirmarCorreo(limpiarCodigo(codigo), correo);
    if (resultado.ok) setConfirmado(true);
    return resultado;
  });

  const reenviar = async () => {
    const problema = correoFijo ? null : validarCorreo(valores.email);
    if (problema) {
      setError(problema);
      return;
    }
    setReenviando(true);
    setAviso(null);
    setError(null);
    const resultado = await reenviarCodigo(correo);
    setReenviando(false);
    if (resultado.ok) setAviso('Si el correo está registrado y aún no se confirma, te enviamos un código nuevo.');
    else setError(resultado.error);
  };

  return (
    <PaginaCuenta
      titulo="Confirma tu correo"
      descripcion={
        correoFijo
          ? `Escribe el código de 6 dígitos que enviamos a ${correoFijo}. Vence en 15 minutos.`
          : 'Escribe tu correo y el código de 6 dígitos que te enviamos. Vence en 15 minutos.'
      }
      pie={
        usuario ? (
          <a href={rutas.panel} className={CLASE_ENLACE}>
            Hacerlo después ▸
          </a>
        ) : (
          <p>
            ¿Ya confirmaste?{' '}
            <a href={rutas.entrar} className={CLASE_ENLACE}>
              Entra aquí
            </a>
          </p>
        )
      }
    >
      <form noValidate onSubmit={alEnviar} className="grid gap-4">
        {!correoFijo && (
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
        )}
        <CampoCodigo valor={valores.codigo} alCambiar={cambiar('codigo')} error={errores.codigo} />
        <CodigoDesarrollo codigo={codigoDev} />
        <Alerta>{error}</Alerta>
        <Alerta tipo="info">{aviso}</Alerta>
        <BotonEnviar enviando={enviando} textoEnviando="Confirmando…">
          Confirmar correo ▶
        </BotonEnviar>
        <button
          type="button"
          onClick={reenviar}
          disabled={reenviando}
          className={`text-sm disabled:opacity-50 ${CLASE_ENLACE}`}
        >
          {reenviando ? 'Enviando código…' : '¿No te llegó? Enviar otro código'}
        </button>
      </form>
    </PaginaCuenta>
  );
}

export default Confirmar;
