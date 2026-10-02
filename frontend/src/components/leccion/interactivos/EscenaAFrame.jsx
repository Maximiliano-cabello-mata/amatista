// Escena 3D del explorador (scene_explorer). Se carga bajo demanda: este
// módulo importa A-Frame (~1.3 MB) y solo se pide cuando el bloque se ve.
import 'aframe';
import { useEffect, useRef } from 'react';
import { geometriaDe } from './logica';

const GRADOS = Math.PI / 180;

function crear(etiqueta, atributos) {
  const nodo = document.createElement(etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) nodo.setAttribute(nombre, valor);
  return nodo;
}

function EscenaAFrame({ primitiva, valores }) {
  const contenedor = useRef(null);
  const objeto = useRef(null);
  const velocidad = useRef(0);
  const arrastre = useRef(null);

  // Una sola escena por bloque, creada a mano (como VistaAFrame): React solo
  // actualiza los atributos de la figura.
  useEffect(() => {
    const escena = crear('a-scene', {
      embedded: '',
      background: 'color: #121212',
      'vr-mode-ui': 'enabled: false',
      'loading-screen': 'enabled: false',
      'device-orientation-permission-ui': 'enabled: false',
    });
    escena.style.width = '100%';
    escena.style.height = '100%';
    const figura = crear('a-entity', { position: '0 0 0' });
    escena.append(
      crear('a-entity', {
        camera: '',
        position: '0 0.4 3.4',
        rotation: '-6 0 0',
        'look-controls': 'enabled: false',
        'wasd-controls': 'enabled: false',
      }),
      crear('a-entity', { light: 'type: ambient; color: #ffffff; intensity: 0.55' }),
      crear('a-entity', { light: 'type: directional; color: #ffffff; intensity: 1.6', position: '-2 3 2' }),
      crear('a-entity', { light: 'type: point; color: #00E5FF; intensity: 6; distance: 12', position: '2.6 -0.6 1.2' }),
      crear('a-entity', {
        geometry: 'primitive: cylinder; radius: 1.6; height: 0.08; segmentsRadial: 6',
        material: 'color: #1E1E1E; roughness: 1; flatShading: true',
        position: '0 -1.35 0',
      }),
      figura,
    );
    contenedor.current.appendChild(escena);
    objeto.current = figura;

    let anterior = performance.now();
    let cuadro = requestAnimationFrame(function girar(ahora) {
      const segundos = Math.min(0.1, (ahora - anterior) / 1000);
      anterior = ahora;
      if (figura.object3D && !arrastre.current) figura.object3D.rotation.y += velocidad.current * GRADOS * segundos;
      cuadro = requestAnimationFrame(girar);
    });

    return () => {
      cancelAnimationFrame(cuadro);
      escena.remove();
      objeto.current = null;
    };
  }, []);

  useEffect(() => {
    const figura = objeto.current;
    if (!figura) return;
    const escala = Number(valores.scale) || 1;
    figura.setAttribute('geometry', geometriaDe(primitiva, valores.segments));
    // flatShading: cada cara se ve plana, como en el estilo low poly.
    figura.setAttribute('material', {
      color: valores.color,
      wireframe: Boolean(valores.wireframe),
      metalness: Number(valores.metalness) || 0,
      roughness: Number(valores.roughness ?? 0.6),
      flatShading: true,
    });
    figura.setAttribute('scale', `${escala} ${escala} ${escala}`);
    velocidad.current = Number(valores.rotationSpeed) || 0;
  }, [primitiva, valores]);

  // Arrastrar en horizontal gira la figura (en vertical la página sigue desplazándose).
  const presionar = (evento) => {
    arrastre.current = { x: evento.clientX };
    evento.currentTarget.setPointerCapture?.(evento.pointerId);
  };
  const moverPuntero = (evento) => {
    const figura = objeto.current;
    if (!arrastre.current || !figura?.object3D) return;
    figura.object3D.rotation.y += (evento.clientX - arrastre.current.x) * 0.012;
    arrastre.current = { x: evento.clientX };
  };
  const soltar = () => {
    arrastre.current = null;
  };

  return (
    <div
      ref={contenedor}
      onPointerDown={presionar}
      onPointerMove={moverPuntero}
      onPointerUp={soltar}
      onPointerCancel={soltar}
      className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
    />
  );
}

export default EscenaAFrame;
