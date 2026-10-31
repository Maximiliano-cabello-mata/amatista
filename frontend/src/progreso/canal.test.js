import { describe, expect, it } from 'vitest';
import { comoEnviar, trasRespuesta } from './canal';

const AHORA = Date.parse('2026-10-30T12:00:00Z');

describe('canal de sincronización', () => {
  it('la primera vez prueba /api/sincronizar sin comprimir', () => {
    expect(comoEnviar(null, AHORA)).toEqual({ ruta: 'unico', comprimir: false });
  });

  it('si el servidor respondió, comprime desde el siguiente envío', () => {
    const canal = trasRespuesta(null, { status: 200, comprimido: false }, AHORA);
    expect(comoEnviar(canal, AHORA)).toEqual({ ruta: 'unico', comprimir: true });
  });

  it('con un backend anterior usa las rutas de siempre y vuelve a probar al día siguiente', () => {
    const canal = trasRespuesta(null, { status: 404, comprimido: false }, AHORA);
    expect(comoEnviar(canal, AHORA + 60_000)).toEqual({ ruta: 'legado' });
    expect(comoEnviar(canal, AHORA + 25 * 60 * 60 * 1000).ruta).toBe('unico');
  });

  it('si algo en el camino rechaza el gzip, sigue sin comprimir', () => {
    const gzip = { modo: 'gzip', revisado: AHORA };
    expect(comoEnviar(trasRespuesta(gzip, { status: 415, comprimido: true }, AHORA), AHORA)).toEqual({
      ruta: 'unico',
      comprimir: false,
    });
  });

  it('un fallo de red o del servidor no cambia el canal', () => {
    const gzip = { modo: 'gzip', revisado: AHORA };
    expect(trasRespuesta(gzip, { status: 0, comprimido: true }, AHORA)).toBe(gzip);
    expect(trasRespuesta(gzip, { status: 503, comprimido: true }, AHORA)).toBe(gzip);
  });
});
