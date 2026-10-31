import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { iniciarSentry, limpiar } from './sentry';
import * as sentrySdk from './sentrySdk';

vi.mock('./sentrySdk', () => ({
  init: vi.fn(),
  getClient: vi.fn(() => ({})),
}));

describe('Sentry en la PWA', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('no carga el SDK sin DSN y explica por qué en el diagnóstico', async () => {
    expect(await iniciarSentry('')).toBe(false);
    expect(window.__AMATISTA_SENTRY_ESTADO__).toBe('sin-dsn');
    expect(sentrySdk.init).not.toHaveBeenCalled();
  });

  it('se inicializa con DSN y marca el estado activo', async () => {
    const dsn = 'https://publickey@o0.ingest.sentry.io/123';
    expect(await iniciarSentry(dsn)).toBe(true);
    expect(sentrySdk.init).toHaveBeenCalledWith(expect.objectContaining({
      dsn,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      beforeSend: limpiar,
    }));
    expect(window.__AMATISTA_SENTRY_ESTADO__).toBe('activo');
  });

  it('detecta un DSN que no pudo crear cliente sin mostrarlo', async () => {
    vi.mocked(sentrySdk.getClient).mockReturnValueOnce(null);
    expect(await iniciarSentry('https://publickey@o0.ingest.sentry.io/123')).toBe(false);
    expect(window.__AMATISTA_SENTRY_ESTADO__).toBe('sin-cliente');
  });

  it('informa del fallo de inicialización sin bloquear la PWA', async () => {
    vi.mocked(sentrySdk.init).mockImplementationOnce(() => { throw new Error('falla controlada'); });
    expect(await iniciarSentry('https://publickey@o0.ingest.sentry.io/123')).toBe(false);
    expect(window.__AMATISTA_SENTRY_ESTADO__).toBe('fallo');
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
