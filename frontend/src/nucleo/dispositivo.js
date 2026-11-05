// src/nucleo/dispositivo.js
// Núcleo PWA Universal: Detección y perfilado adaptativo del hardware del alumno.
// Ajusta dinámicamente presupuestos 3D (DPR, FPS, texturas) y concurrencia de red.

export function evaluarNivelHardware({ memoria = 4, nucleos = 4, ahorroDatos = false, red = '4g', bateriaBaja = false } = {}) {
  if (ahorroDatos || red === '2g' || memoria <= 2 || nucleos <= 2) {
    return 'N0'; // Netbook escolar / gama de entrada
  }
  if (bateriaBaja || red === '3g' || memoria <= 4 || nucleos <= 4) {
    return 'N1'; // Móvil / equipo con recursos restringidos
  }
  if (memoria >= 16 && nucleos >= 8) {
    return 'N4'; // Estación de trabajo / CAD
  }
  return 'N2'; // Dispositivo estándar / Tableta / Visor WebXR
}

export function calcularPresupuestoRendimiento({ nivel = 'N2', esXR = false, enLinea = true } = {}) {
  switch (nivel) {
    case 'N0':
      return {
        dprMaximo: 1.0,
        fpsObjetivo: 30,
        texturasMax: 512,
        concurrenciaRed: enLinea ? 1 : 0,
        loteSync: 10,
        modoLigero: true,
        sombrasHabilitadas: false,
        modoIA: 'hibrido-ahorro',
      };
    case 'N1':
      return {
        dprMaximo: 1.0,
        fpsObjetivo: 30,
        texturasMax: 512,
        concurrenciaRed: enLinea ? 2 : 0,
        loteSync: 25,
        modoLigero: true,
        sombrasHabilitadas: false,
        modoIA: 'hibrido-ahorro',
      };
    case 'N4':
      return {
        dprMaximo: 2.0,
        fpsObjetivo: 120,
        texturasMax: 1024,
        concurrenciaRed: enLinea ? 4 : 0,
        loteSync: 100,
        modoLigero: false,
        sombrasHabilitadas: true,
        modoIA: 'servidor-local',
      };
    case 'N2':
    default:
      return {
        dprMaximo: 1.5,
        fpsObjetivo: esXR ? 72 : 60,
        texturasMax: 1024,
        concurrenciaRed: enLinea ? 4 : 0,
        loteSync: 50,
        modoLigero: false,
        sombrasHabilitadas: !esXR,
        modoIA: enLinea ? 'servidor-local' : 'local-navegador',
      };
  }
}

export function perfilarDispositivo(ventana = typeof window !== 'undefined' ? window : {}) {
  const nav = ventana.navigator || {};
  const conexion = nav.connection || {};
  const enLinea = typeof nav.onLine === 'boolean' ? nav.onLine : true;
  const red = (conexion.effectiveType || '4g').toLowerCase();
  const ahorroDatos = Boolean(conexion.saveData);
  const memoria = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 4;
  const nucleos = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 4;

  const nivel = evaluarNivelHardware({ memoria, nucleos, ahorroDatos, red });
  const esXR = Boolean(nav.xr);
  const presupuesto = calcularPresupuestoRendimiento({ nivel, esXR, enLinea });

  return {
    nivel,
    memoriaGb: memoria,
    nucleos,
    tipoRed: enLinea ? red : 'offline',
    enLinea,
    ahorroDatos,
    ...presupuesto,
  };
}
