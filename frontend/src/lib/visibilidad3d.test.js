import { afterEach, describe, expect, it, vi } from 'vitest';
import { observarEscena } from './visibilidad3d';

afterEach(() => vi.unstubAllGlobals());

function preparar() {
  let interseccion;
  const desconectar = vi.fn();
  class Observador {
    constructor(callback) { interseccion = callback; }
    observe() {}
    disconnect() { desconectar(); }
  }
  const documento = new EventTarget();
  documento.hidden = false;
  vi.stubGlobal('document', documento);
  vi.stubGlobal('window', { IntersectionObserver: Observador });
  vi.stubGlobal('IntersectionObserver', Observador);
  const escena = Object.assign(new EventTarget(), {
    renderStarted: false,
    renderer: { xr: { isPresenting: false }, setAnimationLoop: vi.fn() },
    timer: { update: vi.fn() },
    render: vi.fn(), play: vi.fn(), pause: vi.fn(),
  });
  const cambiar = vi.fn();
  const detener = observarEscena(escena, {}, cambiar);
  return { escena, documento, cambiar, detener, desconectar,
    mostrar: (visible) => interseccion([{ isIntersecting: visible }]),
    iniciar: () => { escena.renderStarted = true; escena.dispatchEvent(new Event('renderstart')); },
  };
}

describe('escenas visibles', () => {
  it('espera al renderer, detiene cuadros fuera de vista y reanuda una sola vez', () => {
    const p = preparar();
    p.mostrar(true);
    expect(p.escena.play).not.toHaveBeenCalled();
    p.iniciar();
    expect(p.escena.renderer.setAnimationLoop).toHaveBeenLastCalledWith(p.escena.render);
    p.mostrar(false);
    expect(p.escena.renderer.setAnimationLoop).toHaveBeenLastCalledWith(null);
    p.mostrar(true);
    p.mostrar(true);
    expect(p.escena.play).toHaveBeenCalledTimes(2);
    p.detener();
    expect(p.desconectar).toHaveBeenCalledOnce();
    expect(p.cambiar).toHaveBeenLastCalledWith(false);
    p.escena.dispatchEvent(new Event('renderstart'));
    expect(p.escena.play).toHaveBeenCalledTimes(2);
  });

  it('pausa una pestaña oculta pero mantiene una sesión inmersiva', () => {
    const p = preparar();
    p.mostrar(true);
    p.iniciar();
    p.documento.hidden = true;
    p.documento.dispatchEvent(new Event('visibilitychange'));
    expect(p.escena.renderer.setAnimationLoop).toHaveBeenLastCalledWith(null);
    p.escena.renderer.xr.isPresenting = true;
    p.escena.dispatchEvent(new Event('enter-vr'));
    expect(p.escena.renderer.setAnimationLoop).toHaveBeenLastCalledWith(p.escena.render);
    p.escena.renderer.xr.isPresenting = false;
    p.escena.dispatchEvent(new Event('exit-vr'));
    expect(p.escena.renderer.setAnimationLoop).toHaveBeenLastCalledWith(null);
    p.detener();
  });
});
