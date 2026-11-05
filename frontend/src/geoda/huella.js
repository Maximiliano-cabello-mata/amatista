// Detectar: la huella técnica del equipo desde el navegador (sin datos personales).
// El navegador no dice la versión de OpenGL de escritorio ni la memoria de vídeo: Geoda lo marca como
// «confianza media o baja» y la persona puede corregir su equipo a mano.
import { tipoDeGpu } from './niveles';

export function nombreGpu(ventana = window) {
  try {
    const lienzo = ventana.document.createElement('canvas');
    const gl = lienzo.getContext('webgl2') || lienzo.getContext('webgl');
    if (!gl) return { nombre: '', webgl2: false };
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const nombre = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return { nombre: String(nombre ?? ''), webgl2: typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext };
  } catch {
    return { nombre: '', webgl2: false };
  }
}

export function detectarHuella(ventana = window) {
  const nav = ventana.navigator ?? {};
  const agente = nav.userAgent ?? '';
  const movil = Boolean(nav.userAgentData?.mobile) || /android|iphone|ipad|ipod|mobile|CrOS/i.test(agente);
  const so = nav.userAgentData?.platform || (/windows/i.test(agente) ? 'Windows' : /mac os/i.test(agente) ? 'macOS' : /CrOS/.test(agente) ? 'ChromeOS' : /android/i.test(agente) ? 'Android' : /linux/i.test(agente) ? 'Linux' : '');
  const { nombre, webgl2 } = nombreGpu(ventana);
  return {
    movil,
    so,
    // deviceMemory redondea y se topa en 8 GB: «8» quiere decir «8 o más».
    ramGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : undefined,
    nucleos: nav.hardwareConcurrency,
    gpu: { nombre, tipo: tipoDeGpu(nombre) },
    webgl2,
  };
}
