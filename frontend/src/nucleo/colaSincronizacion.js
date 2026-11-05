// src/nucleo/colaSincronizacion.js
// Cola Transaccional Offline-First (Patrón Outbox).
// Deduplica y compacta operaciones locales antes de enviarlas por red en lotes.

export function fusionarOperacion(existente, nueva) {
  if (!existente) {
    return {
      ...nueva,
      compactadas: 1,
      primerTimestamp: nueva.timestamp || Date.now(),
      ultimoTimestamp: nueva.timestamp || Date.now(),
    };
  }

  // Fusión inteligente según el tipo de entidad
  const datosFusionados = { ...existente.datos, ...nueva.datos };

  // Si tiene XP o pasos numéricos, conserva el valor más alto
  if (typeof existente.datos?.paso === 'number' && typeof nueva.datos?.paso === 'number') {
    datosFusionados.paso = Math.max(existente.datos.paso, nueva.datos.paso);
  }
  if (typeof existente.datos?.xp === 'number' && typeof nueva.datos?.xp === 'number') {
    datosFusionados.xp = Math.max(existente.datos.xp, nueva.datos.xp);
  }

  return {
    ...existente,
    ...nueva,
    datos: datosFusionados,
    compactadas: (existente.compactadas || 1) + 1,
    primerTimestamp: existente.primerTimestamp || existente.timestamp,
    ultimoTimestamp: nueva.timestamp || Date.now(),
  };
}

export function crearColaSincronizacion({ almacenamientoInicial = [] } = {}) {
  let cola = [...almacenamientoInicial];

  return {
    encolar(operacion) {
      if (!operacion || !operacion.clave) throw new Error('Operación inválida: falta clave.');
      const indice = cola.findIndex((op) => op.clave === operacion.clave);
      if (indice >= 0) {
        cola[indice] = fusionarOperacion(cola[indice], operacion);
      } else {
        cola.push(fusionarOperacion(null, operacion));
      }
      return this.tamano();
    },

    obtenerLote(limite = 50) {
      return cola.slice(0, Math.max(1, limite));
    },

    confirmarLote(clavesConfirmadas = []) {
      const conjunto = new Set(clavesConfirmadas);
      cola = cola.filter((op) => !conjunto.has(op.clave));
      return cola.length;
    },

    vaciar() {
      cola = [];
    },

    tamano() {
      return cola.length;
    },

    listar() {
      return [...cola];
    },
  };
}
