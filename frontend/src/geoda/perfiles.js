// Perfiles de ajustes por nivel (contrato g7b.perfil/1). Reglas base de FICHAS_TECNICAS 3.1 mientras no llegue
// el perfiles.json medido por G7B; cuando llegue, `elegir` prefiere lo medido (confiable > provisional > base).
export const AJUSTES = {
  minimo: { subdivisionVista: 0, simplify: true, muestras: 4, resolucionPct: 50 },
  ligero: { subdivisionVista: 1, simplify: true, muestras: 16, resolucionPct: 75 },
  completo: { subdivisionVista: 2, simplify: false, muestras: 64, resolucionPct: 100 },
};

export const BASE = {
  N0: { programa: 'editor_web', version: null, perfil: 'minimo', motor: 'webgl2', nota: 'Blender de escritorio no corre aquí: Estudio A-Frame y lecciones en el navegador' },
  N1: { programa: 'blender', version: '3.6', perfil: 'minimo', motor: 'workbench', nota: 'Blender 3.6 LTS: el actual pide OpenGL 4.3' },
  N2: { programa: 'blender', version: '4.5', perfil: 'ligero', motor: 'eevee', nota: 'Blender LTS actual con perfil ligero' },
  N3: { programa: 'blender', version: '4.5', perfil: 'completo', motor: 'eevee', nota: 'Blender completo; EEVEE fluido' },
  N4: { programa: 'blender', version: '4.5', perfil: 'completo', motor: 'cycles_gpu', nota: 'Cycles en GPU y escenas pesadas' },
};

export function perfilBase(nivel) {
  const b = BASE[nivel] ?? BASE.N2;
  return { nivel, ...b, ajustes: { ...AJUSTES[b.perfil] }, estado: 'base', evidencia: { mediciones: 0, equipos: 0 } };
}

const RANGO = { confiable: 0, provisional: 1, base: 2 };

// documento: perfiles.json de G7B (opcional). Sin él, la regla base.
export function elegir(nivel, documento) {
  const candidatos = (documento?.perfiles ?? []).filter((p) => p.nivel === nivel && AJUSTES[p.perfil]);
  candidatos.sort((a, b) => (RANGO[a.estado] ?? 3) - (RANGO[b.estado] ?? 3));
  if (!candidatos.length) return perfilBase(nivel);
  const p = candidatos[0];
  return { ...perfilBase(nivel), ...p, ajustes: { ...AJUSTES[p.perfil], ...(p.ajustes ?? {}) } };
}
