// Estudio A-Frame (#/estudio): plantillas para empezar, piezas para insertar
// y la página completa que se descarga. Funciones puras: pruebas en plantillas.test.js.
// Las escenas usan los modelos de public/modelos/ (scripts/modelos.mjs), así
// funcionan sin conexión.

export const VERSION_AFRAME = '1.7.0';
export const CLAVE_ESTUDIO = 'amatista:estudio';
export const MAX_CODIGO = 20000;

export const PLANTILLAS = [
  {
    id: 'vacia',
    nombre: 'Escena vacía',
    texto: 'Un suelo, un cielo y una luz: el punto de partida.',
    codigo: `<a-scene background="color: #1b1530">
  <a-plane rotation="-90 0 0" width="10" height="10" color="#3a2f55"></a-plane>
  <a-light type="ambient" intensity="0.5"></a-light>
  <a-light type="directional" position="-2 4 2" intensity="0.9"></a-light>

  <!-- Agrega tus objetos aquí -->
  <a-box position="0 0.5 -3" color="#9B59B6"></a-box>
</a-scene>`,
  },
  {
    id: 'galeria',
    nombre: 'Galería de modelos',
    texto: 'Tres modelos GLB sobre pedestales, con su cartel.',
    codigo: `<a-scene background="color: #101018">
  <a-assets>
    <a-asset-item id="cristal" src="/modelos/cristal.glb"></a-asset-item>
    <a-asset-item id="arbol" src="/modelos/arbol.glb"></a-asset-item>
    <a-asset-item id="casa" src="/modelos/casa.glb"></a-asset-item>
  </a-assets>

  <a-plane rotation="-90 0 0" width="12" height="12" color="#1e1e1e"></a-plane>
  <a-light type="hemisphere" color="#ffffff" ground-color="#101018" intensity="0.9"></a-light>
  <a-light type="spot" position="0 5 -1" angle="50" intensity="1.4" target="#centro"></a-light>

  <a-entity position="-2 0 -4">
    <a-cylinder radius="0.6" height="0.4" color="#2b2b30" position="0 0.2 0"></a-cylinder>
    <a-entity gltf-model="#arbol" position="0 0.4 0"></a-entity>
  </a-entity>
  <a-entity id="centro" position="0 0 -4.5">
    <a-cylinder radius="0.6" height="0.4" color="#2b2b30" position="0 0.2 0"></a-cylinder>
    <a-entity gltf-model="#cristal" position="0 0.4 0"
      animation="property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear"></a-entity>
  </a-entity>
  <a-entity position="2 0 -4">
    <a-cylinder radius="0.6" height="0.4" color="#2b2b30" position="0 0.2 0"></a-cylinder>
    <a-entity gltf-model="#casa" position="0 0.4 0" scale="0.8 0.8 0.8"></a-entity>
  </a-entity>

  <a-text value="Mi galería low poly" align="center" position="0 2.6 -4.5" width="6" color="#C39BD3"></a-text>
</a-scene>`,
  },
  {
    id: 'sistema-solar',
    nombre: 'Sistema solar',
    texto: 'Jerarquía y animación: los planetas giran porque giran sus padres.',
    codigo: `<a-scene background="color: #05040a">
  <a-light type="ambient" intensity="0.25"></a-light>
  <a-light type="point" position="0 1.6 -5" intensity="2" distance="20"></a-light>

  <!-- El sol -->
  <a-sphere position="0 1.6 -5" radius="0.6" color="#F5792A"
    material="emissive: #F5792A; emissiveIntensity: 0.8"></a-sphere>

  <!-- Cada órbita es un padre invisible que gira; el planeta es su hijo -->
  <a-entity position="0 1.6 -5" animation="property: rotation; to: 0 360 0; loop: true; dur: 6000; easing: linear">
    <a-sphere position="1.4 0 0" radius="0.15" color="#00E5FF"></a-sphere>
  </a-entity>
  <a-entity position="0 1.6 -5" animation="property: rotation; to: 0 360 0; loop: true; dur: 11000; easing: linear">
    <a-sphere position="2.3 0 0" radius="0.25" color="#9B59B6"></a-sphere>
  </a-entity>
</a-scene>`,
  },
  {
    id: 'interactiva',
    nombre: 'Botón que reacciona',
    texto: 'Cursor del ratón, clic y animaciones que arrancan con un evento.',
    codigo: `<a-scene cursor="rayOrigin: mouse" raycaster="objects: .clicable" background="color: #121212">
  <a-plane rotation="-90 0 0" width="8" height="8" color="#262629"></a-plane>
  <a-light type="ambient" intensity="0.6"></a-light>
  <a-light type="directional" position="1 3 2" intensity="0.8"></a-light>

  <!-- Pasa el ratón: crece. Haz clic: gira y cambia de color -->
  <a-box class="clicable" position="0 0.75 -3" color="#9B59B6"
    animation__entrar="property: scale; to: 1.2 1.2 1.2; dur: 200; startEvents: mouseenter"
    animation__salir="property: scale; to: 1 1 1; dur: 200; startEvents: mouseleave"
    animation__clic="property: rotation; from: 0 0 0; to: 0 360 0; dur: 900; startEvents: click"
    animation__color="property: material.color; from: #9B59B6; to: #00E5FF; dur: 900; dir: alternate; startEvents: click"></a-box>

  <a-text value="Haz clic en el cubo" align="center" position="0 2 -3" color="#E0E0E0"></a-text>
</a-scene>`,
  },
  {
    id: 'bosque',
    nombre: 'Bosque con niebla',
    texto: 'Un mismo modelo repetido, niebla y luz cálida de atardecer.',
    codigo: `<a-scene fog="type: linear; color: #2a1b3d; near: 4; far: 18" background="color: #2a1b3d">
  <a-assets>
    <a-asset-item id="arbol" src="/modelos/arbol.glb"></a-asset-item>
  </a-assets>
  <a-plane rotation="-90 0 0" width="40" height="40" color="#1f3326"></a-plane>
  <a-light type="hemisphere" color="#ffd7a8" ground-color="#2a1b3d" intensity="0.9"></a-light>

  <a-entity gltf-model="#arbol" position="-2 0 -4"></a-entity>
  <a-entity gltf-model="#arbol" position="1.5 0 -5" scale="1.3 1.3 1.3"></a-entity>
  <a-entity gltf-model="#arbol" position="-0.5 0 -7" rotation="0 40 0"></a-entity>
  <a-entity gltf-model="#arbol" position="3 0 -8" scale="0.8 0.8 0.8"></a-entity>
  <a-entity gltf-model="#arbol" position="-3.5 0 -9" scale="1.5 1.5 1.5"></a-entity>
</a-scene>`,
  },
];

// Piezas que se insertan donde está el cursor (justo antes de </a-scene> si no hay cursor).
export const PIEZAS = [
  { id: 'caja', nombre: 'Caja', codigo: '<a-box position="0 0.5 -3" color="#00E5FF"></a-box>' },
  { id: 'esfera', nombre: 'Esfera', codigo: '<a-sphere position="0 1 -3" radius="0.5" color="#F5792A"></a-sphere>' },
  { id: 'texto', nombre: 'Texto', codigo: '<a-text value="Hola" align="center" position="0 2 -3" color="#FFFFFF"></a-text>' },
  { id: 'luz', nombre: 'Luz', codigo: '<a-light type="point" position="0 3 -2" intensity="1.2"></a-light>' },
  {
    id: 'giro',
    nombre: 'Animación',
    codigo: '<a-box position="0 1 -3" color="#9B59B6" animation="property: rotation; to: 0 360 0; loop: true; dur: 4000; easing: linear"></a-box>',
  },
  { id: 'modelo', nombre: 'Modelo GLB', codigo: '<a-entity gltf-model="url(/modelos/cristal.glb)" position="0 0 -3"></a-entity>' },
];

// Inserta `pieza` en `codigo` en la posición `cursor` (o antes de </a-scene>).
// Devuelve {codigo, cursor} con el cursor al final de lo insertado.
export function insertarPieza(codigo, pieza, cursor = null) {
  const enCursor = Number.isInteger(cursor) && cursor >= 0 && cursor <= codigo.length;
  const cierre = codigo.lastIndexOf('</a-scene>');
  const posicion = enCursor ? cursor : cierre >= 0 ? cierre : codigo.length;
  const antes = codigo.slice(0, posicion);
  // Antes de </a-scene> va con la sangría de los hijos de la escena.
  const sangria = enCursor ? '' : '  ';
  const salto = antes.length && !antes.endsWith('\n') ? '\n' : '';
  const texto = `${salto}${sangria}${pieza}\n`;
  return { codigo: antes + texto + codigo.slice(posicion), cursor: posicion + texto.length };
}

// Página HTML completa, lista para abrir con doble clic o subir a cualquier hosting.
export function paginaCompleta(codigo, titulo = 'Mi escena A-Frame') {
  const seguro = String(titulo).replace(/[<>&"]/g, '');
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${seguro}</title>
    <script src="https://aframe.io/releases/${VERSION_AFRAME}/aframe.min.js"></script>
  </head>
  <body>
    <!-- Hecho en el Estudio A-Frame de Amatista. Si usas modelos de /modelos/, copia también esos archivos. -->
${codigo
  .split('\n')
  .map((linea) => `    ${linea}`)
  .join('\n')}
  </body>
</html>
`;
}

// Lo guardado en este navegador: texto o null si no hay nada válido.
export function codigoGuardado(valor) {
  return typeof valor === 'string' && valor.trim() && valor.length <= MAX_CODIGO ? valor : null;
}
