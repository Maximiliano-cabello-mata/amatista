// Validaciones de los formularios de cuenta (las mismas reglas que el
// servidor en api/auth.py). Devuelven el mensaje de error o null.
const PATRON_CORREO = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
const PATRON_TELEFONO = /^[0-9+()\-.\s]+$/;

export function validarCorreo(valor) {
  const correo = (valor ?? '').trim();
  if (!correo) return 'Escribe tu correo.';
  if (correo.length > 100 || !PATRON_CORREO.test(correo)) return 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
  return null;
}

export function validarPasswordNueva(valor) {
  const password = valor ?? '';
  if (password.length < 8 || password.length > 128) return 'La contraseña debe tener entre 8 y 128 caracteres.';
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) return 'La contraseña debe incluir al menos una letra y un número.';
  return null;
}

export function validarPassword(valor) {
  return valor ? null : 'Escribe tu contraseña.';
}

export function validarNombre(valor) {
  const nombre = (valor ?? '').trim();
  if (!nombre) return 'Escribe tu nombre.';
  if (nombre.length > 150) return 'El nombre admite como máximo 150 caracteres.';
  return null;
}

export function validarTelefono(valor) {
  const telefono = (valor ?? '').trim();
  if (!telefono) return null; // opcional
  if (telefono.length > 25 || !PATRON_TELEFONO.test(telefono) || !/\d/.test(telefono)) {
    return 'El teléfono admite hasta 25 caracteres: números, espacios, +, -, ( y ).';
  }
  return null;
}

export const limpiarCodigo = (valor) => (valor ?? '').replace(/\D/g, '');

export function validarCodigo(valor) {
  return limpiarCodigo(valor).length === 6 ? null : 'El código tiene 6 dígitos.';
}

// {campo: validador} + valores → {campo: mensaje} solo con los que fallan.
export function validar(reglas, valores) {
  const errores = {};
  for (const [campo, regla] of Object.entries(reglas)) {
    const error = regla(valores[campo]);
    if (error) errores[campo] = error;
  }
  return errores;
}
