// src/nucleo/iaLocal.js
// Cliente del Tutor de IA Local con Circuit Breaker y fallback transparente a Goliat.

import { responder as responderGoliat } from '../goliat/cerebro';

const ESTADOS_CIRCUITO = {
  CERRADO: 'CERRADO',     // Funcionamiento normal, envía peticiones al servidor local
  ABIERTO: 'ABIERTO',     // Servidor caído o saturado: no espera timeout, fallback inmediato
  SEMIABIERTO: 'SEMIABIERTO', // Probando si el servidor revivió tras el tiempo de gracia
};

export class CircuitBreakerIA {
  constructor({
    url = typeof window !== 'undefined' ? (window.AMATISTA_IA_URL || 'http://localhost:8090') : 'http://localhost:8090',
    timeoutMs = 1200,
    umbralFallos = 3,
    tiempoReinicioMs = 30000,
  } = {}) {
    this.url = url;
    this.timeoutMs = timeoutMs;
    this.umbralFallos = umbralFallos;
    this.tiempoReinicioMs = tiempoReinicioMs;

    this.estado = ESTADOS_CIRCUITO.CERRADO;
    this.fallosConsecutivos = 0;
    this.ultimoFallo = 0;
  }

  estaDisponible() {
    if (this.estado === ESTADOS_CIRCUITO.ABIERTO) {
      if (Date.now() - this.ultimoFallo > this.tiempoReinicioMs) {
        this.estado = ESTADOS_CIRCUITO.SEMIABIERTO;
        return true;
      }
      return false;
    }
    return true;
  }

  registrarExito() {
    this.fallosConsecutivos = 0;
    this.estado = ESTADOS_CIRCUITO.CERRADO;
  }

  registrarFallo() {
    this.fallosConsecutivos += 1;
    this.ultimoFallo = Date.now();
    if (this.fallosConsecutivos >= this.umbralFallos) {
      this.estado = ESTADOS_CIRCUITO.ABIERTO;
    }
  }

  async consultar(pregunta, contexto = {}) {
    const inicio = Date.now();

    // Si el circuito está abierto o no hay URL, degradación inmediata en 0 ms
    if (!this.estaDisponible()) {
      const respGoliat = responderGoliat(pregunta, contexto);
      return {
        ...respGoliat,
        origen: 'goliat',
        latenciaMs: 0,
        circuito: this.estado,
      };
    }

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), this.timeoutMs) : null;

    try {
      const respuesta = await fetch(`${this.url}/consultar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta, contexto }),
        signal: controller?.signal,
      });

      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      const datos = await respuesta.json();
      this.registrarExito();

      return {
        texto: datos.texto || datos.respuesta,
        ficha: datos.ficha || null,
        zona: datos.zona || null,
        origen: 'ia-local',
        latenciaMs: Date.now() - inicio,
        circuito: ESTADOS_CIRCUITO.CERRADO,
      };
    } catch {
      this.registrarFallo();
      const respGoliat = responderGoliat(pregunta, contexto);
      return {
        ...respGoliat,
        origen: 'goliat',
        latenciaMs: Date.now() - inicio,
        circuito: this.estado,
      };
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
}

export const clienteIaLocal = new CircuitBreakerIA();
