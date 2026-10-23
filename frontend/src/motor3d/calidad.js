// Calidad del Motor Web según el equipo: la PWA corre en celulares modestos, computadoras de
// escuela sin GPU y visores de VR. Se elige al empezar y am-rendimiento la ajusta en vivo
// (baja la resolución si los cuadros por segundo caen). Funciones puras: pruebas en motor3d.test.js.
//
// señales: {nucleos, memoria (GB), ahorroDatos, ligero (modo ligero de Amatista), movil, dpr}.
export function elegirCalidad({ nucleos = 4, memoria = 4, ahorroDatos = false, ligero = false, movil = false, dpr = 1 } = {}) {
  let puntos = 0;
  if (nucleos >= 8) puntos += 2;
  else if (nucleos >= 4) puntos += 1;
  if (memoria >= 8) puntos += 2;
  else if (memoria >= 4) puntos += 1;
  if (movil) puntos -= 1;
  const nivel = ligero || ahorroDatos || puntos <= 1 ? 'baja' : puntos >= 4 ? 'alta' : 'media';
  const techo = { baja: 1, media: 1.5, alta: 2 }[nivel];
  return {
    nivel,
    // La resolución nunca pasa de lo que da la pantalla ni del techo del nivel.
    pixelRatio: Math.min(Math.max(1, dpr), techo),
    pixelRatioMinimo: nivel === 'baja' ? 0.6 : 0.75,
    antialias: nivel === 'alta',
    densidad: { baja: 0.5, media: 0.8, alta: 1 }[nivel],
  };
}

// Señales del navegador (solo en el navegador; en pruebas se pasan a mano).
export function senalesDelNavegador(ventana = typeof window === 'undefined' ? null : window) {
  if (!ventana) return {};
  const nav = ventana.navigator ?? {};
  return {
    nucleos: nav.hardwareConcurrency ?? 4,
    memoria: nav.deviceMemory ?? 4,
    ahorroDatos: Boolean(nav.connection?.saveData),
    ligero: Boolean(ventana.document?.documentElement?.classList?.contains('ligero')),
    movil: /Android|iPhone|iPad|Mobile/i.test(nav.userAgent ?? ''),
    dpr: ventana.devicePixelRatio ?? 1,
  };
}

// Ajuste en vivo: con el promedio de milisegundos por cuadro decide la nueva resolución.
export function ajustarResolucion(actual, msPorCuadro, { minimo = 0.75, maximo = 2 } = {}) {
  if (msPorCuadro > 24) return Math.max(minimo, Math.round((actual - 0.15) * 100) / 100);
  if (msPorCuadro < 15 && actual < maximo) return Math.min(maximo, Math.round((actual + 0.1) * 100) / 100);
  return actual;
}
