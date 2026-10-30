import { createContext, useContext } from 'react';

export const ContextoAvatar = createContext(null);

// {avatar (id o null), esCreador, elegir(id) → {ok, local?, error?}}.
// Sin <AvatarProvider> (pruebas, páginas sueltas) devuelve un avatar vacío.
const SIN_AVATAR = { avatar: null, esCreador: false, elegir: async () => ({ ok: false }) };

export function useAvatar() {
  return useContext(ContextoAvatar) ?? SIN_AVATAR;
}
