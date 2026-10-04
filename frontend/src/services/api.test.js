import { describe, expect, it } from 'vitest';
import { API_DEL_DOMINIO, apiPorDefecto } from './api.js';

describe('apiPorDefecto', () => {
  it('en el dominio oficial usa su API con HTTPS', () => {
    expect(apiPorDefecto('amatista-3d.me')).toBe('https://api.amatista-3d.me');
    expect(apiPorDefecto('www.amatista-3d.me')).toBe(API_DEL_DOMINIO);
  });

  it('en la computadora del desarrollador usa el backend local', () => {
    expect(apiPorDefecto('localhost')).toBe('http://localhost:8000');
    expect(apiPorDefecto('127.0.0.1')).toBe('http://localhost:8000');
  });

  it('un dominio parecido no se confunde con el oficial', () => {
    expect(apiPorDefecto('amatista-3d.me.ejemplo.com')).not.toBe(API_DEL_DOMINIO);
    expect(apiPorDefecto('falso-amatista-3d.me')).not.toBe(API_DEL_DOMINIO);
  });
});
