// src/services/lanzador.js
// «Abrir en Blender» con Blender cerrado (add-on 5.4): el enlace amatista://.
// El instalador registra amatista:// en el sistema (addon/amatista_blender/protocolo.py);
// el sistema arranca Blender con la dirección y el add-on abre la actividad. Si Blender ya
// está abierto no hace falta: la orden llega por el enlace en vivo (services/blender.js).
//
//   amatista://abrir · amatista://practica/<id> · amatista://taller/<id>?actividad=<id>
//   amatista://isla · amatista://recorrido/<pestana|vista|taller>

export const ESQUEMA = 'amatista';
const parte = (valor) => encodeURIComponent(String(valor));

// La dirección para una orden del enlace (los mismos tipos que POST /ordenes).
export function urlBlender(tipo, datos = {}) {
  if (tipo === 'abrir_practica' && datos.practica_id) return `${ESQUEMA}://practica/${parte(datos.practica_id)}`;
  if (tipo === 'taller_abrir' && datos.taller) {
    return `${ESQUEMA}://taller/${parte(datos.taller)}${datos.actividad ? `?actividad=${parte(datos.actividad)}` : ''}`;
  }
  if (tipo === 'isla') return `${ESQUEMA}://isla`;
  if (tipo === 'recorrido') return `${ESQUEMA}://recorrido${datos.recorrido ? `/${parte(datos.recorrido)}` : ''}`;
  return `${ESQUEMA}://abrir`;
}

// ¿Hay que arrancar Blender? Sí cuando el servidor aceptó la orden pero ningún Blender abierto la
// recibió (entregada: false, abierta_en_blender: false) o el servidor no tiene el enlace en vivo.
export function hayQueLanzar(respuesta) {
  if (!respuesta?.ok) return false;
  const datos = respuesta.datos ?? {};
  return !(datos.entregada || datos.abierta_en_blender);
}

// Pide al sistema que abra la dirección. Firefox muestra una página de error si nadie la recibe
// cuando se navega la ventana: ahí va en un iframe oculto. Devuelve la dirección usada.
export function abrirEnlace(url, { documento = globalThis.document, agente = globalThis.navigator?.userAgent ?? '' } = {}) {
  if (!documento) return url;
  if (/firefox/i.test(agente)) {
    const marco = documento.createElement('iframe');
    marco.style.display = 'none';
    marco.src = url;
    documento.body.appendChild(marco);
    setTimeout(() => marco.remove(), 4000);
  } else {
    documento.location.href = url;
  }
  return url;
}
