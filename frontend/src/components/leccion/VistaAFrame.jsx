// Vista 3D en vivo del código del alumno. Se carga bajo demanda con A-Frame y el Motor Web
// de Amatista (los componentes am-… funcionan en el Estudio y en los retos de código).
import '../../motor3d';
import { useEffect, useMemo, useRef } from 'react';

const ETIQUETA_AFRAME = /^a-[a-z0-9-]+$/;
// Atributos de <a-scene> que sí se copian (el cielo de color, la niebla y el cursor del
// ratón para los clics). El resto de la escena la controla la vista.
const ATRIBUTOS_ESCENA = ['background', 'fog', 'cursor', 'raycaster'];

// Lee el código sin ejecutarlo (DOMParser crea un documento inerte) y se queda
// solo con las entidades que están dentro de <a-scene>.
function analizarEscena(codigo) {
  const documento = new DOMParser().parseFromString(codigo, 'text/html');
  const escena = documento.querySelector('a-scene');
  if (!escena) {
    return { error: 'No encontré la etiqueta <a-scene>. Todo lo 3D debe ir dentro de ella.' };
  }
  const entidades = [...escena.children].filter((hijo) => ETIQUETA_AFRAME.test(hijo.localName));
  if (!entidades.length) {
    return { error: 'Tu <a-scene> está vacía. Agrega una primitiva, por ejemplo <a-box>.' };
  }
  const atributos = ATRIBUTOS_ESCENA.filter((nombre) => escena.hasAttribute(nombre)).map((nombre) => [nombre, escena.getAttribute(nombre)]);
  return { entidades, atributos };
}

// Copia segura: solo etiquetas <a-…> y ningún atributo "on…" (eventos).
function copiarSeguro(nodo) {
  const copia = document.createElement(nodo.localName);
  for (const { name, value } of nodo.attributes) {
    if (!name.startsWith('on')) copia.setAttribute(name, value);
  }
  for (const hijo of nodo.children) {
    if (ETIQUETA_AFRAME.test(hijo.localName)) copia.appendChild(copiarSeguro(hijo));
  }
  return copia;
}

function VistaAFrame({ ejecucion }) {
  const contenedor = useRef(null);
  const escena = useRef(null);
  const analisis = useMemo(() => analizarEscena(ejecucion.codigo), [ejecucion]);

  // Una sola escena por vista: al ejecutar de nuevo solo cambian sus entidades
  // (crear una escena por ejecución agotaría los contextos WebGL del navegador).
  useEffect(() => {
    const nueva = document.createElement('a-scene');
    nueva.setAttribute('embedded', '');
    nueva.style.width = '100%';
    nueva.style.height = '100%';
    contenedor.current.appendChild(nueva);
    escena.current = nueva;
    return () => {
      nueva.remove();
      escena.current = null;
    };
  }, []);

  useEffect(() => {
    if (!analisis.entidades || !escena.current) return;
    const actual = escena.current;
    // Cada copia entra a la escena antes de crear la siguiente: así `gltf-model="#id"`
    // encuentra el <a-asset-item> de <a-assets>, que va primero.
    const nodos = analisis.entidades.map((entidad) => actual.appendChild(copiarSeguro(entidad)));
    analisis.atributos.forEach(([nombre, valor]) => actual.setAttribute(nombre, valor));
    return () => {
      nodos.forEach((nodo) => nodo.remove());
      analisis.atributos.forEach(([nombre]) => actual.removeAttribute(nombre));
    };
  }, [analisis]);

  return (
    <div className="mt-4">
      <div ref={contenedor} className="relative aspect-video w-full overflow-hidden bg-black" />
      {analisis.error && (
        <p role="alert" className="mt-3 font-mono text-sm text-red-400">
          {analisis.error}
        </p>
      )}
    </div>
  );
}

export default VistaAFrame;
