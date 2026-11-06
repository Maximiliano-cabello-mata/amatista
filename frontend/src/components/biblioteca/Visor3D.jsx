// Visor 3D de la biblioteca: un modelo o una animación (.glb) con la cámara orbital del Motor Web.
// Se carga bajo demanda (A-Frame ~1.3 MB, que el service worker guarda tras la primera vez).
import '../../motor3d';
import { useEffect, useRef } from 'react';
import { observarEscena } from '../../lib/visibilidad3d';

const AFRAME = window.AFRAME;

// Acerca o aleja la cámara orbital según el tamaño del modelo, para que siempre llene el visor.
function encuadrar(escena, modelo) {
  const THREE = window.THREE;
  const camara = escena?.querySelector('[am-orbita]');
  if (!THREE || !modelo || !camara) return;
  const caja = new THREE.Box3().setFromObject(modelo);
  if (caja.isEmpty()) return;
  const centro = caja.getCenter(new THREE.Vector3());
  const radio = caja.getSize(new THREE.Vector3()).length() / 2;
  const orbita = camara.components['am-orbita'];
  if (!orbita) return;
  // am-orbita no tiene update(): se ajusta su estado y se vuelve a colocar la cámara.
  orbita.data.objetivo = { x: centro.x, y: centro.y, z: centro.z };
  orbita.distancia = Math.min(orbita.data.maximo, Math.max(orbita.data.minimo, radio * 2.6));
  orbita.aplicar();
}
if (AFRAME && !AFRAME.components['am-animacion']) {
  // Reproduce en bucle todas las animaciones que traiga el glTF (A-Frame no trae un mezclador).
  AFRAME.registerComponent('am-animacion', {
    init() {
      this.mezclador = null;
      this.el.addEventListener('model-loaded', () => {
        const modelo = this.el.getObject3D('mesh');
        encuadrar(this.el.sceneEl, modelo);
        const clips = modelo?.animations ?? [];
        if (!clips.length) return;
        this.mezclador = new window.THREE.AnimationMixer(modelo);
        clips.forEach((clip) => this.mezclador.clipAction(clip).play());
      });
    },
    tick(_, delta) {
      this.mezclador?.update((delta || 16) / 1000);
    },
  });
}

export default function Visor3D({ url, nombre }) {
  const caja = useRef(null);
  useEffect(() => {
    const nodo = caja.current;
    if (!nodo) return undefined;
    // Escena creada a mano (como EscenaAFrame): React no la vuelve a dibujar.
    const escena = document.createElement('a-scene');
    escena.setAttribute('embedded', '');
    escena.setAttribute('renderer', 'antialias: true; colorManagement: true');
    escena.setAttribute('vr-mode-ui', 'enabled: false');
    escena.setAttribute('background', 'color: #16131c');
    escena.innerHTML = `
      <a-entity light="type: hemisphere; color: #ffffff; groundColor: #3d1f52; intensity: 1.1"></a-entity>
      <a-entity light="type: directional; intensity: 1.2" position="2 4 3"></a-entity>
      <a-circle radius="2.2" rotation="-90 0 0" color="#221c2b"></a-circle>
      <a-entity gltf-model="url(${url})" am-animacion></a-entity>
      <a-entity camera am-orbita="distancia: 5; minimo: 1; objetivo: 0 0.9 0; inclinacion: 22"></a-entity>`;
    nodo.appendChild(escena);
    const detener = observarEscena(escena, nodo);
    return () => {
      detener();
      escena.parentNode?.removeChild(escena);
    };
  }, [url]);
  return <div ref={caja} className="h-72 w-full overflow-hidden sm:h-96" role="img" aria-label={`Vista 3D de ${nombre}. Arrastra para girarla.`} />;
}
