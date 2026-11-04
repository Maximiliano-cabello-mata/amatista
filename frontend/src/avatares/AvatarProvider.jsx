// El personaje de la cuenta. Con sesión lo guarda el servidor (/api/perfil,
// tabla PERFILES del script 013) y aquí queda una copia para que la barra lo
// pinte al instante y sin conexión. Si el servidor todavía no tiene el 013, la
// elección se queda en este dispositivo.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/contexto';
import { guardarAvatar, obtenerPerfil } from '../services/api';
import { IDS_AVATARES } from './catalogo';
import { ContextoAvatar } from './contexto';

const clave = (usuario) => `amatista.avatar.${usuario?.id ?? 'local'}`;

function leerCopia(usuario) {
  try {
    const guardado = JSON.parse(window.localStorage.getItem(clave(usuario)));
    return guardado && typeof guardado === 'object' ? guardado : null;
  } catch {
    return null;
  }
}

function guardarCopia(usuario, valor) {
  try {
    window.localStorage.setItem(clave(usuario), JSON.stringify(valor));
  } catch {
    // Sin almacenamiento (modo privado): el avatar vive solo en esta visita.
  }
}

function AvatarProvider({ children }) {
  const { usuario, token } = useAuth();
  const [estado, setEstado] = useState(() => ({ ...(leerCopia(usuario) ?? {}), dueno: usuario?.id }));

  // Cambió la cuenta: primero la copia local y luego lo que diga el servidor.
  const dueno = usuario?.id;
  if (estado.dueno !== dueno) setEstado({ ...(leerCopia(usuario) ?? {}), dueno });

  useEffect(() => {
    if (!token || !usuario) return undefined;
    let vigente = true;
    obtenerPerfil(token).then((respuesta) => {
      if (!vigente) return;
      if (!respuesta.ok) return;
      const valor = { avatar: respuesta.datos.avatar ?? null, esCreador: Boolean(respuesta.datos.es_creador) };
      guardarCopia(usuario, valor);
      setEstado({ dueno: usuario.id, ...valor });
    });
    return () => {
      vigente = false;
    };
  }, [token, usuario]);

  const elegir = useCallback(
    async (id) => {
      if (!IDS_AVATARES.has(id)) return { ok: false, error: 'Ese personaje no existe.' };
      const anterior = estado;
      const nuevo = { ...estado, avatar: id };
      setEstado(nuevo);
      guardarCopia(usuario, { avatar: id, esCreador: Boolean(estado.esCreador) });
      if (!token) return { ok: true, local: true };
      const respuesta = await guardarAvatar(token, id);
      if (respuesta.ok) return { ok: true };
      // 503: el servidor aún no tiene el script 013; se queda en este dispositivo.
      if (respuesta.status === 503 || respuesta.status === 0) return { ok: true, local: true };
      setEstado(anterior);
      guardarCopia(usuario, { avatar: anterior.avatar ?? null, esCreador: Boolean(anterior.esCreador) });
      return { ok: false, error: respuesta.error };
    },
    [estado, token, usuario],
  );

  const valor = useMemo(
    () => ({ avatar: estado.avatar ?? null, esCreador: Boolean(estado.esCreador), elegir }),
    [estado, elegir],
  );
  return <ContextoAvatar.Provider value={valor}>{children}</ContextoAvatar.Provider>;
}

export default AvatarProvider;
