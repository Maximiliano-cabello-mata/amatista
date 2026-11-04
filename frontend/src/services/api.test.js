import { describe, expect, it } from 'vitest';
import { API_DEL_DOMINIO, apiPorDefecto, prepararCuerpo } from './api.js';

describe('apiPorDefecto', () => {
  it('en el dominio oficial usa su API con HTTPS', () => {
    expect(apiPorDefecto('amatista-3d.tech')).toBe('https://api.amatista-3d.tech');
    expect(apiPorDefecto('www.amatista-3d.tech')).toBe(API_DEL_DOMINIO);
  });

  it('en la computadora, sin VITE_API_URL, usa la API local', () => {
    expect(apiPorDefecto('localhost')).toBe('http://localhost:8000');
    expect(apiPorDefecto('127.0.0.1')).toBe('http://localhost:8000');
  });

  it('un dominio parecido no se confunde con el oficial', () => {
    expect(apiPorDefecto('amatista-3d.tech.ejemplo.com')).not.toBe(API_DEL_DOMINIO);
    expect(apiPorDefecto('falso-amatista-3d.tech')).not.toBe(API_DEL_DOMINIO);
  });
});

describe('prepararCuerpo', () => {
  it('comprime con gzip los lotes grandes y se puede recuperar igual', async () => {
    const texto = JSON.stringify({ eventos: Array.from({ length: 100 }, (_, i) => ({ id: `e-${i}`, tipo: 'lesson_completed' })) });
    const { cuerpo, comprimido, bytes } = await prepararCuerpo(texto, true);
    expect(comprimido).toBe(true);
    expect(bytes).toBeLessThan(texto.length / 5);
    const flujo = new Blob([cuerpo]).stream().pipeThrough(new DecompressionStream('gzip'));
    expect(await new Response(flujo).text()).toBe(texto);
  });

  it('deja tal cual lo pequeño o lo que no se pidió comprimir', async () => {
    expect((await prepararCuerpo('{"a":1}', true)).comprimido).toBe(false);
    const grande = 'x'.repeat(2000);
    expect(await prepararCuerpo(grande, false)).toEqual({ cuerpo: grande, comprimido: false, bytes: 2000 });
  });
});
