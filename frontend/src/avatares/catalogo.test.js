import { describe, expect, it } from 'vitest';
import { ANIMALES } from './animales';
import { AVATAR_CREADOR, AVATARES, avataresPara, datosAvatar, IDS_AVATARES } from './catalogo';

describe('catálogo de avatares', () => {
  it('cada avatar tiene su busto low poly', () => {
    AVATARES.forEach((a) => expect(ANIMALES[a.id]?.length).toBeGreaterThan(5));
  });

  it('el pavo real solo se ofrece a la cuenta del creador', () => {
    expect(avataresPara().map((a) => a.id)).not.toContain(AVATAR_CREADOR.id);
    expect(avataresPara({ esCreador: true })[0].id).toBe(AVATAR_CREADOR.id);
    expect(IDS_AVATARES.has('pavo_real')).toBe(true);
  });

  it('un id desconocido no tiene datos (se usa la inicial)', () => {
    expect(datosAvatar('dragon')).toBeNull();
    expect(datosAvatar(null)).toBeNull();
    expect(datosAvatar('zorro').nombre).toBeTruthy();
  });
});
