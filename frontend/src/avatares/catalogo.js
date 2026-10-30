// Personajes que cada cuenta puede elegir (Perfil › Tu personaje). Todos
// originales y en low poly, como Goliat. El backend acepta los mismos ids
// (backend/api/perfil.py › AVATARES; test_buzon.py lo comprueba).
// «pavo_real» es el personaje del creador de Amatista: solo su cuenta lo usa.
export const AVATARES = [
  { id: 'zorro', nombre: 'Zorro', frase: 'Astuto y curioso.', fondo: '#3a1f12' },
  { id: 'buho', nombre: 'Búho', frase: 'Observa antes de modelar.', fondo: '#2a2018' },
  { id: 'ajolote', nombre: 'Ajolote', frase: 'Se regenera de cada error.', fondo: '#3a1a2a' },
  { id: 'colibri', nombre: 'Colibrí', frase: 'Rápido y preciso.', fondo: '#10291f' },
  { id: 'lobo', nombre: 'Lobo', frase: 'Aprende en manada.', fondo: '#1b2129' },
  { id: 'gato', nombre: 'Gato', frase: 'Siempre cae de pie.', fondo: '#24222a' },
  { id: 'tortuga', nombre: 'Tortuga', frase: 'Lento, pero termina.', fondo: '#15261a' },
  { id: 'jaguar', nombre: 'Jaguar', frase: 'Fuerza y paciencia.', fondo: '#2e2310' },
];

export const AVATAR_CREADOR = { id: 'pavo_real', nombre: 'Pavo real', frase: 'El creador de Amatista.', fondo: '#2a1030' };

export const IDS_AVATARES = new Set([...AVATARES.map((a) => a.id), AVATAR_CREADOR.id]);

export function datosAvatar(id) {
  if (id === AVATAR_CREADOR.id) return AVATAR_CREADOR;
  return AVATARES.find((a) => a.id === id) ?? null;
}

// Los que puede elegir una cuenta: el pavo real solo aparece para el creador.
export const avataresPara = ({ esCreador = false } = {}) => (esCreador ? [AVATAR_CREADOR, ...AVATARES] : AVATARES);
