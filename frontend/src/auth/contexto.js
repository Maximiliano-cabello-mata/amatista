import { createContext, useContext } from 'react';

export const ContextoAuth = createContext(null);

// {usuario|null, token|null, listo, esAdmin, esProfesor (profesor o admin),
//  registrar(datos), iniciarSesion(datos), cerrarSesion(), cerrarTodas(), confirmarCorreo(codigo, email?),
//  reenviarCodigo(email?), recuperar(email), restablecer({email, codigo, password}),
//  actualizarPerfil({nombre?, telefono?}), cambiarPassword({actual, nueva}), verificarSesion(),
//  idLocal, emailPendiente, codigoDev, sesionVencida}.
// Cada acción devuelve {ok, error?, datos?} (y `status` cuando falla).
export function useAuth() {
  const valor = useContext(ContextoAuth);
  if (!valor) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return valor;
}
