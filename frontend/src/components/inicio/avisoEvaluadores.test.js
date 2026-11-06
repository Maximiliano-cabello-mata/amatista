import { describe, expect, it } from 'vitest';
import { avisoVigente, CLAVE_AVISO_EVALUADORES, debeMostrarAviso, fechaCiudadMexico, marcarAvisoVisto } from './avisoEvaluadores';

function almacenamientoFalso() {
  const datos = new Map();
  return {
    getItem: (clave) => datos.get(clave) ?? null,
    setItem: (clave, valor) => datos.set(clave, valor),
  };
}

describe('aviso temporal de evaluadores', () => {
  it('respeta el comienzo y fin en Ciudad de México', () => {
    expect(avisoVigente(new Date('2026-11-05T05:59:59Z'))).toBe(false);
    expect(avisoVigente(new Date('2026-11-05T06:00:00Z'))).toBe(true);
    expect(avisoVigente(new Date('2026-11-07T05:59:59Z'))).toBe(true);
    expect(avisoVigente(new Date('2026-11-07T06:00:00Z'))).toBe(false);
    expect(fechaCiudadMexico(new Date('2026-11-07T06:00:00Z'))).toBe('2026-11-07');
  });

  it('solo se presenta una vez por navegador durante la ventana', () => {
    const almacenamiento = almacenamientoFalso();
    const ahora = new Date('2026-11-06T18:00:00Z');
    expect(debeMostrarAviso(ahora, almacenamiento)).toBe(true);
    marcarAvisoVisto(almacenamiento);
    expect(almacenamiento.getItem(CLAVE_AVISO_EVALUADORES)).toBe('visto');
    expect(debeMostrarAviso(ahora, almacenamiento)).toBe(false);
  });

  it('no aparece después de la fecha incluso en un navegador nuevo', () => {
    expect(debeMostrarAviso(new Date('2026-11-08T12:00:00Z'), almacenamientoFalso())).toBe(false);
  });
});
