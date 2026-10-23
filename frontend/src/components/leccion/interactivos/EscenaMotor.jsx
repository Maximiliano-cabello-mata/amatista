// Escena del Motor Web de Amatista dentro de una lección (bloque motor_scene). Se carga bajo
// demanda: importa A-Frame y los componentes am-… (motor3d/index.js) solo cuando el bloque se ve.
// La escena se arma con la descripción del bloque (motor3d/escena.js) y cada 300 ms se lee su
// foto (dónde está cada objeto) para revisar los retos en la lección.
import '../../../motor3d';
import { useEffect, useRef } from 'react';
import { elegirCalidad, senalesDelNavegador } from '../../../motor3d/calidad';
import { ATRIBUTOS_ESCENA, entidadesEscena } from '../../../motor3d/escena';

function crear({ etiqueta, atributos, hijos = [] }) {
  const nodo = document.createElement(etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) nodo.setAttribute(nombre, valor);
  for (const hijo of hijos) nodo.appendChild(crear(hijo));
  return nodo;
}

function EscenaMotor({ escena, version = 0, alFoto, alEvento }) {
  const contenedor = useRef(null);
  const avisos = useRef({ alFoto, alEvento });
  useEffect(() => {
    avisos.current = { alFoto, alEvento };
  }, [alFoto, alEvento]);

  useEffect(() => {
    const calidad = elegirCalidad(senalesDelNavegador());
    const vr = Boolean(navigator.xr);
    const nodo = crear({
      etiqueta: 'a-scene',
      atributos: { embedded: '', ...ATRIBUTOS_ESCENA, 'vr-mode-ui': vr ? 'enabled: true' : 'enabled: false' },
      hijos: entidadesEscena(escena, { calidad: calidad.nivel, vr }),
    });
    nodo.style.width = '100%';
    nodo.style.height = '100%';
    const reenviar = (evento) => avisos.current.alEvento?.(evento.type, evento.detail);
    const eventos = ['am-reto-cumplido', 'am-soltar', 'am-toque'];
    for (const tipo of eventos) nodo.addEventListener(tipo, reenviar);
    contenedor.current.appendChild(nodo);
    const reloj = setInterval(() => {
      const sistema = nodo.systems?.['am-interaccion'];
      if (sistema && nodo.hasLoaded) avisos.current.alFoto?.(sistema.foto());
    }, 300);
    return () => {
      clearInterval(reloj);
      for (const tipo of eventos) nodo.removeEventListener(tipo, reenviar);
      nodo.remove();
    };
  }, [escena, version]);

  return <div ref={contenedor} className="absolute inset-0" />;
}

export default EscenaMotor;
