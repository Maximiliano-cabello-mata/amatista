import { observarVisibilidad } from './visibilidad';

export function observarEscena(escena, contenedor, cambiar = () => {}) {
  let visible = false;
  let activa;
  const actualizar = () => {
    // Una sesión inmersiva puede seguir visible dentro del visor WebXR.
    const siguiente = visible || Boolean(escena.renderer?.xr.isPresenting);
    if (!escena.renderStarted || siguiente === activa) return;
    activa = siguiente;
    if (activa) {
      escena.timer?.update();
      escena.play();
      escena.renderer.setAnimationLoop(escena.render);
    } else {
      escena.pause();
      escena.renderer.setAnimationLoop(null);
    }
    cambiar(activa);
  };
  const detener = observarVisibilidad(contenedor, (valor) => {
    visible = valor;
    actualizar();
  });
  escena.addEventListener('renderstart', actualizar);
  escena.addEventListener('enter-vr', actualizar);
  escena.addEventListener('exit-vr', actualizar);
  return () => {
    detener();
    escena.removeEventListener('renderstart', actualizar);
    escena.removeEventListener('enter-vr', actualizar);
    escena.removeEventListener('exit-vr', actualizar);
    escena.renderer?.setAnimationLoop(null);
    cambiar(false);
  };
}
