import { describe, expect, it } from 'vitest';
import { iniciarSentry, limpiar } from './sentry';

describe('Sentry en la PWA', () => {
  it('no se activa sin DSN', async () => {
    expect(await iniciarSentry('')).toBe(false);
  });

  it('quita los datos personales del evento', () => {
    const limpio = limpiar({
      user: { email: 'alumno@x.cl', ip_address: '1.2.3.4' },
      request: {
        url: 'https://amatista-3d.tech/recuperar?correo=alumno@x.cl',
        cookies: { a: 'b' },
        data: { contrasena: 'x' },
        headers: { Authorization: 'Bearer t', 'X-Sesion-Id': 's', 'User-Agent': 'Firefox' },
      },
    });
    expect(limpio.user).toBeUndefined();
    expect(limpio.request.url).toBe('https://amatista-3d.tech/recuperar');
    expect(limpio.request.cookies).toBeUndefined();
    expect(limpio.request.data).toBeUndefined();
    expect(limpio.request.headers).toEqual({ 'User-Agent': 'Firefox' });
  });
});
