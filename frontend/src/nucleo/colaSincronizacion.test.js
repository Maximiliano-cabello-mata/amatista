import { describe, it, expect } from 'vitest';
import { crearColaSincronizacion, fusionarOperacion } from './colaSincronizacion';

describe('colaSincronizacion.js - Patrón Outbox y compactación', () => {
  it('compacta múltiples actualizaciones sobre la misma clave', () => {
    const op1 = { clave: 'leccion:m1-l1', datos: { paso: 1, xp: 10 } };
    const op2 = { clave: 'leccion:m1-l1', datos: { paso: 3, xp: 30 } };

    const fusionada = fusionarOperacion(op1, op2);
    expect(fusionada.compactadas).toBe(2);
    expect(fusionada.datos.paso).toBe(3);
    expect(fusionada.datos.xp).toBe(30);
  });

  it('encola y deduplica operaciones en la cola', () => {
    const cola = crearColaSincronizacion();
    cola.encolar({ clave: 'leccion:m1-l1', datos: { paso: 1, xp: 10 } });
    cola.encolar({ clave: 'leccion:m1-l1', datos: { paso: 2, xp: 20 } });
    cola.encolar({ clave: 'insignia:forja-cobre', datos: { id: 'cobre' } });

    expect(cola.tamano()).toBe(2);

    const ops = cola.listar();
    const l1 = ops.find((o) => o.clave === 'leccion:m1-l1');
    expect(l1.compactadas).toBe(2);
    expect(l1.datos.paso).toBe(2);
  });

  it('permite obtener lotes y confirmar operaciones enviadas', () => {
    const cola = crearColaSincronizacion();
    cola.encolar({ clave: 'op-1', datos: {} });
    cola.encolar({ clave: 'op-2', datos: {} });
    cola.encolar({ clave: 'op-3', datos: {} });

    const lote = cola.obtenerLote(2);
    expect(lote.length).toBe(2);
    expect(lote.map((o) => o.clave)).toEqual(['op-1', 'op-2']);

    cola.confirmarLote(['op-1', 'op-2']);
    expect(cola.tamano()).toBe(1);
    expect(cola.listar()[0].clave).toBe('op-3');
  });
});
