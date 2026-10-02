import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConexion } from '../hooks/useConexion';
import { guardar, leer } from '../lib/almacen';
import * as api from '../services/api';
import { CLAVE_ANONIMO } from '../progreso/estado';
import { ContextoAuth } from './contexto';

const CLAVE = 'sesion';

// Sesión guardada en el dispositivo: {token, usuario, idLocal}. idLocal es el
// id anónimo que se mandó al entrar (el servidor fusionó su progreso con la
// cuenta); ProgresoProvider lo usa para unir y reiniciar el progreso anónimo local.
const SIN_SESION = { token: null, usuario: null, idLocal: null };

const resultado = (respuesta) =>
  respuesta.ok ? { ok: true, datos: respuesta.datos } : { ok: false, error: respuesta.error, status: respuesta.status };

function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(SIN_SESION);
  const [listo, setListo] = useState(false);
  // Correo de una cuenta recién creada que aún no confirma (para la página Confirmar).
  const [emailPendiente, setEmailPendiente] = useState(null);
  // Solo en desarrollo (AMATISTA_MOSTRAR_CODIGOS=1): el servidor devuelve el código.
  const [codigoDev, setCodigoDev] = useState(null);
  const [sesionVencida, setSesionVencida] = useState(false);
  const enLinea = useConexion();
  const validado = useRef(null);

  const cambiarSesion = useCallback((nueva) => {
    setSesion(nueva);
    guardar(CLAVE, nueva);
  }, []);

  // 1. Sesión guardada: sin conexión se conserva tal cual (offline-first).
  useEffect(() => {
    let activo = true;
    leer(CLAVE).then((guardada) => {
      if (!activo) return;
      if (guardada?.token && guardada?.usuario?.id) {
        setSesion({ token: guardada.token, usuario: guardada.usuario, idLocal: guardada.idLocal ?? null });
      }
      setListo(true);
    });
    return () => {
      activo = false;
    };
  }, []);

  // Comprueba el token con /yo: 401 → la sesión venció o se cerró en otro dispositivo.
  const verificarSesion = useCallback(async () => {
    const token = sesion.token;
    if (!token) return { ok: false, error: 'No has iniciado sesión.' };
    const respuesta = await api.obtenerYo(token);
    if (respuesta.ok && respuesta.datos?.id) {
      setSesion((actual) => {
        if (actual.token !== token) return actual;
        const nueva = { ...actual, usuario: respuesta.datos };
        guardar(CLAVE, nueva);
        return nueva;
      });
    } else if (respuesta.status === 401) {
      setSesion((actual) => {
        if (actual.token !== token) return actual;
        guardar(CLAVE, SIN_SESION);
        return SIN_SESION;
      });
      setSesionVencida(true);
    }
    return resultado(respuesta);
  }, [sesion.token]);

  // 2. Al abrir la app (y al recuperar la conexión) se valida una vez por token.
  useEffect(() => {
    if (!listo || !sesion.token || !enLinea || !api.sincronizacionDisponible()) return;
    if (validado.current === sesion.token) return;
    validado.current = sesion.token;
    verificarSesion().then((r) => {
      // Error de red: se vuelve a intentar al recuperar la conexión.
      if (!r.ok && r.status !== 401) validado.current = null;
    });
  }, [listo, sesion.token, enLinea, verificarSesion]);

  // El id anónimo del dispositivo viaja como usuario_local_id para que el
  // servidor una (o convierta) ese progreso con la cuenta.
  const entrarCon = useCallback(
    async (llamar, datos) => {
      const anonimo = await leer(CLAVE_ANONIMO);
      const idLocal = typeof anonimo?.alumnoId === 'string' ? anonimo.alumnoId : null;
      const respuesta = await llamar({ ...datos, ...(idLocal ? { usuario_local_id: idLocal } : {}) });
      if (respuesta.ok && respuesta.datos?.token && respuesta.datos?.usuario?.id) {
        validado.current = respuesta.datos.token;
        setSesionVencida(false);
        cambiarSesion({ token: respuesta.datos.token, usuario: respuesta.datos.usuario, idLocal });
      }
      return resultado(respuesta);
    },
    [cambiarSesion],
  );

  const registrar = useCallback(
    async (datos) => {
      const r = await entrarCon(api.registrar, datos);
      if (r.ok && !r.datos?.usuario?.correo_confirmado) setEmailPendiente(r.datos?.usuario?.email ?? datos.email);
      if (r.ok) setCodigoDev(r.datos?.codigo_dev ?? null);
      return r;
    },
    [entrarCon],
  );

  const iniciarSesion = useCallback(
    async (datos) => {
      const r = await entrarCon(api.iniciarSesion, datos);
      // 403: el servidor exige confirmar el correo antes de entrar.
      if (!r.ok && r.status === 403) setEmailPendiente(datos.email);
      return r;
    },
    [entrarCon],
  );

  // Cerrar sesión funciona sin conexión: el aviso al servidor es de cortesía.
  const cerrarSesion = useCallback(async () => {
    const token = sesion.token;
    validado.current = null;
    cambiarSesion(SIN_SESION);
    setSesionVencida(false);
    if (token) await api.cerrarSesion(token);
    return { ok: true };
  }, [sesion.token, cambiarSesion]);

  const cerrarTodas = useCallback(async () => {
    if (!sesion.token) return { ok: false, error: 'No has iniciado sesión.' };
    const r = resultado(await api.cerrarTodas(sesion.token));
    if (r.ok) {
      validado.current = null;
      cambiarSesion(SIN_SESION);
    }
    return r;
  }, [sesion.token, cambiarSesion]);

  const actualizarUsuario = useCallback(
    (usuario, token) =>
      setSesion((actual) => {
        if (!usuario?.id || actual.usuario?.id !== usuario.id || (token && actual.token !== token)) return actual;
        const nueva = { ...actual, usuario };
        guardar(CLAVE, nueva);
        return nueva;
      }),
    [],
  );

  const correoDe = useCallback(
    (email) => (email || sesion.usuario?.email || emailPendiente || '').trim(),
    [sesion.usuario, emailPendiente],
  );

  const confirmarCorreo = useCallback(
    async (codigo, email) => {
      const correo = correoDe(email);
      if (!correo) return { ok: false, error: 'Escribe el correo de tu cuenta.' };
      const r = resultado(await api.confirmarCorreo(correo, String(codigo).replace(/\D/g, '')));
      if (r.ok) {
        actualizarUsuario(r.datos?.usuario);
        setEmailPendiente(null);
        setCodigoDev(null);
      }
      return r;
    },
    [correoDe, actualizarUsuario],
  );

  const reenviarCodigo = useCallback(
    async (email) => {
      const correo = correoDe(email);
      if (!correo) return { ok: false, error: 'Escribe el correo de tu cuenta.' };
      const r = resultado(await api.reenviarCodigo(correo));
      if (r.ok) setCodigoDev(r.datos?.codigo_dev ?? null);
      return r;
    },
    [correoDe],
  );

  const recuperar = useCallback(async (email) => resultado(await api.recuperarCuenta(email.trim())), []);

  // Restablecer cierra todas las sesiones de esa cuenta en el servidor.
  const restablecer = useCallback(
    async (datos) => {
      const r = resultado(await api.restablecerPassword({ ...datos, email: datos.email.trim() }));
      if (r.ok && sesion.usuario?.email && sesion.usuario.email === datos.email.trim().toLowerCase()) {
        validado.current = null;
        cambiarSesion(SIN_SESION);
      }
      return r;
    },
    [sesion.usuario, cambiarSesion],
  );

  const actualizarPerfil = useCallback(
    async (datos) => {
      if (!sesion.token) return { ok: false, error: 'Inicia sesión para editar tu perfil.' };
      const r = resultado(await api.actualizarYo(sesion.token, datos));
      if (r.ok) actualizarUsuario(r.datos, sesion.token);
      return r;
    },
    [sesion.token, actualizarUsuario],
  );

  const cambiarPassword = useCallback(
    async (datos) => {
      if (!sesion.token) return { ok: false, error: 'Inicia sesión para cambiar tu contraseña.' };
      return resultado(await api.cambiarPassword(sesion.token, datos));
    },
    [sesion.token],
  );

  const valor = useMemo(() => {
    const rol = sesion.usuario?.rol;
    return {
      usuario: sesion.usuario,
      token: sesion.token,
      idLocal: sesion.idLocal,
      listo,
      esAdmin: rol === 'admin',
      esProfesor: rol === 'profesor' || rol === 'admin',
      emailPendiente,
      codigoDev,
      sesionVencida,
      registrar,
      iniciarSesion,
      cerrarSesion,
      cerrarTodas,
      confirmarCorreo,
      reenviarCodigo,
      recuperar,
      restablecer,
      actualizarPerfil,
      cambiarPassword,
      verificarSesion,
    };
  }, [
    sesion,
    listo,
    emailPendiente,
    codigoDev,
    sesionVencida,
    registrar,
    iniciarSesion,
    cerrarSesion,
    cerrarTodas,
    confirmarCorreo,
    reenviarCodigo,
    recuperar,
    restablecer,
    actualizarPerfil,
    cambiarPassword,
    verificarSesion,
  ]);

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>;
}

export default AuthProvider;
