import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreakerIA } from './iaLocal';

describe('iaLocal.js - Circuit Breaker y degradación transparente a Goliat', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('degrada inmediatamente a Goliat si el servidor falla o no responde', async () => {
    // Simula fallo de red en fetch
    global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    const breaker = new CircuitBreakerIA({ url: 'http://servidor-inexistente:8090', umbralFallos: 2 });
    const respuesta = await breaker.consultar('¿Cómo extruyo en Blender?');

    expect(respuesta.origen).toBe('goliat');
    expect(respuesta.texto).toBeDefined();
  });

  it('abre el circuito tras alcanzar el umbral de fallos y responde sin esperar fetch', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Down'));

    const breaker = new CircuitBreakerIA({ umbralFallos: 2 });
    await breaker.consultar('error 1');
    await breaker.consultar('error 2');

    expect(breaker.estado).toBe('ABIERTO');

    // Con circuito abierto, fetch ni siquiera debe ser invocado
    global.fetch.mockClear();
    const rapida = await breaker.consultar('error 3');

    expect(global.fetch).not.toHaveBeenCalled();
    expect(rapida.origen).toBe('goliat');
    expect(rapida.circuito).toBe('ABIERTO');
  });

  it('devuelve respuesta del servidor si este responde exitosamente', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        texto: 'Usa E para extruir caras en Modo Edición.',
        ficha: 'mesh.extrude',
        zona: 'herramientas',
      }),
    });

    const breaker = new CircuitBreakerIA({ umbralFallos: 2 });
    const respuesta = await breaker.consultar('¿Cómo extruyo?');

    expect(respuesta.origen).toBe('ia-local');
    expect(respuesta.ficha).toBe('mesh.extrude');
    expect(respuesta.texto).toContain('Usa E');
    expect(breaker.estado).toBe('CERRADO');
  });
});
