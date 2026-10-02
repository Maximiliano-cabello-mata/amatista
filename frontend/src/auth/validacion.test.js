import { describe, expect, it } from 'vitest';
import {
  limpiarCodigo,
  validar,
  validarCodigo,
  validarCorreo,
  validarNombre,
  validarPasswordNueva,
  validarTelefono,
} from './validacion';

describe('validaciones de cuenta', () => {
  it('correo', () => {
    expect(validarCorreo('ana@escuela.mx')).toBeNull();
    expect(validarCorreo('  ana@escuela.mx ')).toBeNull();
    expect(validarCorreo('')).toMatch(/Escribe tu correo/);
    expect(validarCorreo('ana@escuela')).toMatch(/correo válido/);
  });

  it('contraseña nueva: 8-128 con letra y número', () => {
    expect(validarPasswordNueva('amatista1')).toBeNull();
    expect(validarPasswordNueva('ñandú2026')).toBeNull();
    expect(validarPasswordNueva('corta1')).toMatch(/entre 8 y 128/);
    expect(validarPasswordNueva('sololetras')).toMatch(/letra y un número/);
    expect(validarPasswordNueva('12345678')).toMatch(/letra y un número/);
  });

  it('nombre y teléfono', () => {
    expect(validarNombre('Ana')).toBeNull();
    expect(validarNombre('   ')).toMatch(/nombre/);
    expect(validarTelefono('')).toBeNull();
    expect(validarTelefono('+52 (55) 1234-5678')).toBeNull();
    expect(validarTelefono('llámame')).toMatch(/teléfono/);
  });

  it('código de 6 dígitos', () => {
    expect(validarCodigo('123 456')).toBeNull();
    expect(limpiarCodigo('12-34-56')).toBe('123456');
    expect(validarCodigo('12345')).toMatch(/6 dígitos/);
  });

  it('validar devuelve solo los campos con error', () => {
    expect(validar({ email: validarCorreo, nombre: validarNombre }, { email: 'x', nombre: 'Ana' })).toEqual({
      email: expect.any(String),
    });
  });
});
