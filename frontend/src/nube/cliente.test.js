import { describe, expect, it } from 'vitest';
import { entrar, guardarToken, leerToken, minutosRestantes, olvidarTokens } from './cliente';

function almacenEnMemoria() {
  const datos = new Map();
  return {
    get length() { return datos.size; },
    key: (i) => [...datos.keys()][i] ?? null,
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: (k, v) => datos.set(k, String(v)),
    removeItem: (k) => datos.delete(k),
  };
}

function documentoFalso() {
  const enviados = [];
  const crear = (tipo) => {
    const nodo = { tipo, hijos: [], appendChild(h) { this.hijos.push(h); }, remove() { this.quitado = true; } };
    if (tipo === 'form') nodo.submit = () => enviados.push(nodo);
    return nodo;
  };
  return { enviados, createElement: crear, body: { appendChild() {} } };
}

describe('Amatista Cloud (cliente)', () => {
  it('cuenta los minutos que quedan de la hora', () => {
    const ahora = Date.parse('2026-11-04T10:00:00Z');
    expect(minutosRestantes({ expira_en: '2026-11-04T11:00:00Z' }, ahora)).toBe(60);
    expect(minutosRestantes({ expira_en: '2026-11-04T10:00:30Z' }, ahora)).toBe(0);
    expect(minutosRestantes({ expira_en: '2026-11-04T09:00:00Z' }, ahora)).toBe(0);
    expect(minutosRestantes(null, ahora)).toBe(0);
  });

  it('guarda el token solo mientras la sesión no vence', () => {
    const almacen = almacenEnMemoria();
    guardarToken({ id: 'nube-a', token: 'secreto', expira_en: new Date(Date.now() + 3600_000).toISOString() }, almacen);
    expect(leerToken('nube-a', almacen)).toBe('secreto');
    guardarToken({ id: 'nube-b', token: 'viejo', expira_en: new Date(Date.now() - 1000).toISOString() }, almacen);
    expect(leerToken('nube-b', almacen)).toBeNull();
    almacen.setItem('otra-cosa', 'se queda');
    olvidarTokens(almacen);
    expect(leerToken('nube-a', almacen)).toBeNull();
    expect(almacen.getItem('otra-cosa')).toBe('se queda');
  });

  it('entra con un formulario POST: el token nunca va en la URL', () => {
    const documento = documentoFalso();
    entrar({ id: 'nube-a', entrada: 'https://nodo-casa.amatista-3d.tech/entrar' }, 'secreto', { documento });
    const [formulario] = documento.enviados;
    expect(formulario).toMatchObject({ method: 'POST', action: 'https://nodo-casa.amatista-3d.tech/entrar', target: '_blank', quitado: true });
    expect(formulario.action).not.toContain('secreto');
    expect(Object.fromEntries(formulario.hijos.map((c) => [c.name, c.value]))).toEqual({ sesion: 'nube-a', token: 'secreto' });
    expect(formulario.hijos.every((c) => c.type === 'hidden')).toBe(true);
  });
});
