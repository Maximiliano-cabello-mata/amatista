// Geoda en la plataforma (cliente): del equipo al nivel N0–N4 y al plan reversible.
// Mismas reglas que el cerebro de Geoda en G7B (amatista-g7b-etl › geoda/niveles.py y FICHAS_TECNICAS 3.1):
//   N0 celular, tableta o Chromebook · N1 sin OpenGL 4.3 o < 8 GB · N2 gráfica integrada capaz
//   N3 dedicada de 4 a < 12 GB · N4 dedicada de 12 GB o más. Cuenta el más bajo; sin datos, no inventa.
export const NIVELES = ['N0', 'N1', 'N2', 'N3', 'N4'];
export const OPENGL_BLENDER_ACTUAL = 4.3;

const DEDICADAS = /(geforce|rtx|gtx|quadro|radeon rx|radeon pro|arc a\d)/i;
const INTEGRADAS = /(intel|uhd|iris|hd graphics|vega|apple|mali|adreno|powervr|llvmpipe|swiftshader|videocore)/i;

export function tipoDeGpu(nombre = '') {
  if (DEDICADAS.test(nombre)) return 'dedicada';
  if (INTEGRADAS.test(nombre)) return 'integrada';
  return 'desconocida';
}

const menor = (...niveles) => niveles.reduce((a, b) => (NIVELES.indexOf(a) <= NIVELES.indexOf(b) ? a : b));

// huella: { movil, so, ramGb, gpu: { nombre, tipo, vramGb }, opengl, webgl2 }
export function clasificar(huella = {}) {
  const motivos = [];
  if (huella.movil || /android|ios|ipados|chrome ?os/i.test(huella.so ?? '')) {
    return { nivel: 'N0', confianza: 'alta', motivos: ['Móvil, tableta o Chromebook: Blender de escritorio no corre ahí'] };
  }
  let faltan = 0;
  const gpu = huella.gpu ?? {};
  const tipo = gpu.tipo ?? tipoDeGpu(gpu.nombre);
  let porGpu;
  if (tipo === 'dedicada') {
    const vram = gpu.vramGb ?? 0;
    if (!vram) {
      motivos.push('Gráfica dedicada sin dato de memoria de vídeo: se asume N3');
      porGpu = 'N3';
      faltan += 1;
    } else if (vram >= 12) {
      motivos.push(`Gráfica dedicada con ${vram} GB de memoria de vídeo`);
      porGpu = 'N4';
    } else if (vram >= 4) {
      motivos.push(`Gráfica dedicada con ${vram} GB de memoria de vídeo`);
      porGpu = 'N3';
    } else {
      motivos.push(`Gráfica dedicada con solo ${vram} GB de memoria de vídeo`);
      porGpu = (huella.opengl ?? 0) >= OPENGL_BLENDER_ACTUAL ? 'N2' : 'N1';
    }
  } else if (typeof huella.opengl === 'number') {
    porGpu = huella.opengl >= OPENGL_BLENDER_ACTUAL ? 'N2' : 'N1';
    motivos.push(porGpu === 'N2' ? `Gráfica integrada con OpenGL ${huella.opengl}` : `OpenGL ${huella.opengl}: no alcanza el ${OPENGL_BLENDER_ACTUAL} que pide el Blender actual`);
  } else {
    porGpu = 'N2';
    faltan += 1;
    motivos.push(gpu.nombre ? `Gráfica ${tipo === 'integrada' ? 'integrada' : ''} (${gpu.nombre}); sin dato de OpenGL, se asume capaz`.replace('  ', ' ') : 'Sin dato de la gráfica: se asume integrada capaz');
  }
  let porRam = 'N4';
  if (typeof huella.ramGb !== 'number') faltan += 1;
  else if (huella.ramGb < 8) {
    porRam = 'N1';
    motivos.push(`${huella.ramGb} GB de memoria: menos de 8`);
  }
  const nivel = menor(porGpu, porRam);
  if (porGpu !== porRam && nivel === porRam) motivos.push('Cuenta el más bajo: la memoria limita');
  return { nivel, confianza: faltan === 0 ? 'alta' : faltan === 1 ? 'media' : 'baja', motivos };
}
