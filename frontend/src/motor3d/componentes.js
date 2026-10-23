// Componentes A-Frame del Motor Web de Amatista. Se registran una vez con registrarMotor(AFRAME)
// y funcionan en las lecciones, en el Estudio y en la página que el alumno descarga (ahí este
// archivo viaja dentro del HTML, por eso solo importa archivos del propio motor).
//
//   am-entorno     terreno low poly, cielo, agua y piezas repartidas (una malla instanciada por pieza)
//   am-generar     copias de una forma en fila, rejilla, círculo, espiral o al azar (instanciadas)
//   am-arrastrable el objeto se mueve con el ratón, el dedo o el láser del visor, apoyado en el suelo
//   am-tocable     el objeto responde a un clic o toque (evento am-toque)
//   am-zona        un círculo en el suelo que sabe qué objetos tiene dentro (evento am-zona-cambio)
//   am-reto        revisa un reto (motor3d/retos.js) y celebra al cumplirse (evento am-reto-cumplido)
//   am-orbita      cámara que gira alrededor de la escena con arrastrar, rueda o pellizco
//   am-caminar     caminar con W A S D o flechas sobre el terreno (y mantener pulsado en el celular)
//   am-flotar      flota y gira despacio (sin el costo del componente animation)
//   am-mano        agarra objetos arrastrables con el láser del control de VR
//   am-rendimiento ajusta la resolución en vivo según los cuadros por segundo
//
// El sistema am-interaccion reúne los eventos del puntero (un solo raycaster para todo) y
// ofrece foto(): dónde está cada objeto, cuáles se tocaron y dónde están las zonas.
import { colorDeAltura, datosEntorno, generarPatron } from './entorno';
import { ajustarResolucion, elegirCalidad, senalesDelNavegador } from './calidad';
import { evaluarReto, textoReto } from './retos';

export const VERSION_MOTOR = '1.0.0';

export function registrarMotor(AFRAME) {
  if (!AFRAME || AFRAME.components['am-entorno']) return false;
  const THREE = AFRAME.THREE;
  const ARRIBA = new THREE.Vector3(0, 1, 0);
  const cache = new Map();
  // Geometrías y materiales compartidos: cien cajas iguales usan una sola geometría.
  const compartido = (clave, crear) => {
    if (!cache.has(clave)) cache.set(clave, crear());
    return cache.get(clave);
  };
  const materialPlano = (color, extra = {}) =>
    compartido(`lambert:${color}:${JSON.stringify(extra)}`, () => new THREE.MeshLambertMaterial({ color, flatShading: true, ...extra }));

  const GEOMETRIAS = {
    caja: () => new THREE.BoxGeometry(1, 1, 1),
    esfera: () => new THREE.SphereGeometry(0.5, 10, 7),
    cilindro: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
    cono: () => new THREE.ConeGeometry(0.5, 1, 8),
    toro: () => new THREE.TorusGeometry(0.4, 0.14, 6, 14),
    cristal: () => new THREE.OctahedronGeometry(0.55, 0),
    plano: () => new THREE.BoxGeometry(1, 0.1, 1),
  };
  const ALTO_FORMA = { caja: 1, esfera: 1, cilindro: 1, cono: 1, toro: 0.28, cristal: 1.1, plano: 0.1 };
  const geometria = (forma) => compartido(`geo:${forma}`, GEOMETRIAS[forma] ?? GEOMETRIAS.caja);

  // Piezas del entorno: partes [geometría, color, [x, y, z], [sx, sy, sz]]; «estirar» = edificio.
  const PARTES = {
    arbol: [
      [() => new THREE.CylinderGeometry(0.12, 0.17, 0.8, 5), '#6b4a2f', [0, 0.4, 0], [1, 1, 1]],
      [() => new THREE.IcosahedronGeometry(0.7, 0), '#4f9a3f', [0, 1.3, 0], [1, 1, 1]],
    ],
    pino: [
      [() => new THREE.CylinderGeometry(0.1, 0.14, 0.6, 5), '#5a3d26', [0, 0.3, 0], [1, 1, 1]],
      [() => new THREE.ConeGeometry(0.65, 1.3, 6), '#2f6b3a', [0, 1.1, 0], [1, 1, 1]],
      [() => new THREE.ConeGeometry(0.45, 0.95, 6), '#3b8048', [0, 1.75, 0], [1, 1, 1]],
    ],
    palmera: [
      [() => new THREE.CylinderGeometry(0.09, 0.14, 2.2, 5), '#a07a4a', [0, 1.1, 0], [1, 1, 1]],
      [() => new THREE.ConeGeometry(0.95, 0.45, 6), '#3f9a4a', [0, 2.3, 0], [1, 1, 1]],
    ],
    roca: [[() => new THREE.DodecahedronGeometry(0.5, 0), '#8a8796', [0, 0.18, 0], [1, 0.7, 1]]],
    flor: [
      [() => new THREE.CylinderGeometry(0.02, 0.02, 0.4, 3), '#4c8a3c', [0, 0.2, 0], [1, 1, 1]],
      [() => new THREE.OctahedronGeometry(0.12, 0), '#ff7eb6', [0, 0.45, 0], [1, 1, 1]],
    ],
    hongo: [
      [() => new THREE.CylinderGeometry(0.06, 0.08, 0.3, 5), '#efe3c8', [0, 0.15, 0], [1, 1, 1]],
      [() => new THREE.ConeGeometry(0.25, 0.18, 7), '#d9453b', [0, 0.38, 0], [1, 1, 1]],
    ],
    cactus: [
      [() => new THREE.CylinderGeometry(0.22, 0.25, 1.6, 6), '#3f8f4a', [0, 0.8, 0], [1, 1, 1]],
      [() => new THREE.CylinderGeometry(0.12, 0.12, 0.6, 5), '#3f8f4a', [0.35, 1.0, 0], [1, 1, 1]],
    ],
    cristal: [[() => new THREE.OctahedronGeometry(0.4, 0), '#b57edc', [0, 0.6, 0], [0.6, 1.6, 0.6]]],
    edificio: [[() => new THREE.BoxGeometry(1.6, 1, 1.6), '#5b5f7a', [0, 0.5, 0], [1, 1, 1], true]],
  };
  const COLORES_EDIFICIO = ['#5b5f7a', '#6c6f8c', '#7d6c8f', '#4b4f66', '#8a7a9c'];

  const leerPosicion = (el, destino = new THREE.Vector3()) => el.object3D.getWorldPosition(destino);
  const entidadDe = (objeto) => {
    let actual = objeto;
    while (actual && !actual.el) actual = actual.parent;
    return actual?.el ?? null;
  };

  // --- Sistema de interacción ---------------------------------------------------------------
  AFRAME.registerSystem('am-interaccion', {
    init() {
      this.arrastrables = new Set();
      this.tocables = new Set();
      this.zonas = new Set();
      this.orbita = null;
      this.terreno = null;
      this.tocados = new Set();
      this.punteros = new Map();
      this.raycaster = new THREE.Raycaster();
      this.ndc = new THREE.Vector2();
      this.plano = new THREE.Plane();
      this.punto = new THREE.Vector3();
      this.desfase = new THREE.Vector3();
      this.arrastre = null;
      this.candidato = null;
      this.encima = null;
      const conectar = () => this.conectar();
      if (this.el.canvas) conectar();
      else this.el.addEventListener('render-target-loaded', conectar, { once: true });
    },

    conectar() {
      const canvas = this.el.canvas;
      this.canvas = canvas;
      canvas.style.touchAction = 'none';
      this.manejadores = {
        pointerdown: (e) => this.presionar(e),
        pointermove: (e) => this.mover(e),
        pointerup: (e) => this.soltar(e),
        pointercancel: (e) => this.soltar(e),
        pointerleave: () => this.salir(),
        wheel: (e) => this.rueda(e),
      };
      for (const [evento, fn] of Object.entries(this.manejadores)) canvas.addEventListener(evento, fn, { capture: true, passive: evento !== 'wheel' });
    },

    remove() {
      if (!this.canvas || !this.manejadores) return;
      for (const [evento, fn] of Object.entries(this.manejadores)) this.canvas.removeEventListener(evento, fn, { capture: true });
    },

    // Altura del suelo en (x, z): el terreno del entorno o 0.
    alturaSuelo(x, z) {
      return this.terreno ? this.terreno.altura(x, z) : 0;
    },

    limite() {
      return this.terreno ? this.terreno.tamano / 2 - 1 : 40;
    },

    apuntar(e) {
      const rect = this.canvas.getBoundingClientRect();
      this.ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      this.raycaster.setFromCamera(this.ndc, this.el.camera);
    },

    golpear() {
      const candidatos = [...this.arrastrables, ...this.tocables].filter((el) => el.object3D.visible);
      if (!candidatos.length) return null;
      const impactos = this.raycaster.intersectObjects(candidatos.map((el) => el.object3D), true);
      for (const impacto of impactos) {
        let el = entidadDe(impacto.object);
        while (el && !this.arrastrables.has(el) && !this.tocables.has(el)) el = el.parentEl;
        if (el) return { el, punto: impacto.point };
      }
      return null;
    },

    resaltar(el) {
      if (this.encima === el) return;
      const tono = (entidad, hex) =>
        entidad?.object3D.traverse((o) => {
          if (o.material?.emissive) o.material.emissive.setHex(hex);
        });
      tono(this.encima, 0x000000);
      tono(el, 0x2a1840);
      this.encima = el;
      this.canvas.style.cursor = el ? (this.arrastrables.has(el) ? 'grab' : 'pointer') : this.orbita ? 'move' : '';
    },

    presionar(e) {
      if (!this.el.camera) return;
      this.punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.punteros.size === 2) {
        this.arrastre = null;
        this.pellizco = this.distanciaPunteros();
        return;
      }
      this.apuntar(e);
      const golpe = this.golpear();
      this.inicio = { x: e.clientX, y: e.clientY, t: performance.now() };
      this.candidato = golpe?.el ?? null;
      if (golpe && this.arrastrables.has(golpe.el)) {
        const el = golpe.el;
        const pos = el.object3D.position;
        this.plano.set(ARRIBA, -pos.y);
        this.raycaster.ray.intersectPlane(this.plano, this.punto);
        this.desfase.copy(pos).sub(this.punto);
        this.arrastre = { el, inicio: pos.clone() };
        this.canvas.setPointerCapture?.(e.pointerId);
        this.canvas.style.cursor = 'grabbing';
        el.object3D.scale.multiplyScalar(1.06);
        el.emit('am-agarrar');
        e.stopImmediatePropagation();
      }
    },

    mover(e) {
      if (this.punteros.has(e.pointerId)) {
        const previo = this.punteros.get(e.pointerId);
        this.punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.punteros.size === 2 && this.pellizco) {
          const ahora = this.distanciaPunteros();
          this.orbita?.acercar(this.pellizco / Math.max(1, ahora));
          this.pellizco = ahora;
          return;
        }
        if (this.arrastre) {
          this.apuntar(e);
          if (!this.raycaster.ray.intersectPlane(this.plano, this.punto)) return;
          const el = this.arrastre.el;
          const datos = el.components['am-arrastrable'].data;
          let x = this.punto.x + this.desfase.x;
          let z = this.punto.z + this.desfase.z;
          if (datos.rejilla > 0) {
            x = Math.round(x / datos.rejilla) * datos.rejilla;
            z = Math.round(z / datos.rejilla) * datos.rejilla;
          }
          const limite = datos.limite > 0 ? datos.limite : this.limite();
          x = Math.max(-limite, Math.min(limite, x));
          z = Math.max(-limite, Math.min(limite, z));
          const y = datos.suelo ? this.alturaSuelo(x, z) + datos.base : el.object3D.position.y;
          el.object3D.position.set(x, y, z);
          el.emit('am-arrastrando', { x, y, z });
          e.stopImmediatePropagation();
          return;
        }
        if (this.orbita && previo && !this.candidato) this.orbita.girar(e.clientX - previo.x, e.clientY - previo.y);
        return;
      }
      // Sin botón pulsado: resaltar lo que se puede tocar (una vez por cuadro como mucho).
      if (this.pendiente || e.pointerType === 'touch') return;
      this.pendiente = true;
      requestAnimationFrame(() => {
        this.pendiente = false;
        if (!this.el.camera) return;
        this.apuntar(e);
        this.resaltar(this.golpear()?.el ?? null);
      });
    },

    soltar(e) {
      this.punteros.delete(e.pointerId);
      if (this.punteros.size < 2) this.pellizco = null;
      const quieto = this.inicio && Math.hypot(e.clientX - this.inicio.x, e.clientY - this.inicio.y) < 8;
      if (this.arrastre) {
        const { el } = this.arrastre;
        el.object3D.scale.multiplyScalar(1 / 1.06);
        this.arrastre = null;
        this.canvas.style.cursor = 'grab';
        const p = el.object3D.position;
        el.emit('am-soltar', { x: p.x, y: p.y, z: p.z });
      }
      if (quieto && this.candidato && this.tocables.has(this.candidato)) this.tocar(this.candidato);
      this.candidato = null;
      this.inicio = null;
    },

    salir() {
      this.resaltar(null);
    },

    tocar(el) {
      this.tocados.add(el);
      el.components['am-tocable']?.rebotar();
      el.emit('am-toque');
    },

    rueda(e) {
      if (!this.orbita) return;
      e.preventDefault();
      this.orbita.acercar(e.deltaY > 0 ? 1.1 : 0.9);
    },

    distanciaPunteros() {
      const [a, b] = [...this.punteros.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    },

    // Agarrar y soltar desde fuera (am-mano, VR).
    acomodar(el, x, z) {
      const datos = el.components['am-arrastrable']?.data;
      if (!datos) return;
      const limite = datos.limite > 0 ? datos.limite : this.limite();
      const cx = Math.max(-limite, Math.min(limite, x));
      const cz = Math.max(-limite, Math.min(limite, z));
      el.object3D.position.set(cx, (datos.suelo ? this.alturaSuelo(cx, cz) : el.object3D.position.y - datos.base) + datos.base, cz);
    },

    // Al llegar el terreno, todo lo arrastrable se apoya en él.
    asentar() {
      for (const el of this.arrastrables) {
        const p = el.object3D.position;
        this.acomodar(el, p.x, p.z);
      }
      for (const zona of this.zonas) zona.components['am-zona']?.asentar();
    },

    // Foto de la escena para los retos (motor3d/retos.js).
    foto() {
      const objetos = {};
      const v = new THREE.Vector3();
      for (const el of this.el.querySelectorAll('[id]')) {
        if (!el.object3D || this.zonas.has(el)) continue;
        leerPosicion(el, v);
        objetos[el.id] = { x: v.x, y: v.y - this.alturaSuelo(v.x, v.z) - (el.components['am-arrastrable']?.data.base ?? 0), z: v.z, tocado: this.tocados.has(el) };
      }
      const zonas = {};
      for (const el of this.zonas) {
        leerPosicion(el, v);
        zonas[el.id] = { x: v.x, z: v.z, radio: el.components['am-zona'].data.radio };
      }
      return { objetos, zonas };
    },
  });

  const sistema = (el) => el.sceneEl.systems['am-interaccion'];

  // Una cámara que llega después de que la escena cargó no se activa sola (A-Frame deja la que
  // inyectó): el motor la activa al aparecer.
  const activarCamara = (el) => {
    const activar = () => el.sceneEl.systems.camera?.setActiveCamera(el);
    if (el.components.camera) activar();
    else el.addEventListener('componentinitialized', function alIniciar(e) {
      if (e.detail.name !== 'camera') return;
      el.removeEventListener('componentinitialized', alIniciar);
      activar();
    });
  };

  // --- Objetos que se mueven o se tocan -----------------------------------------------------
  AFRAME.registerComponent('am-arrastrable', {
    schema: { base: { type: 'number', default: 0.5 }, rejilla: { type: 'number', default: 0 }, suelo: { type: 'boolean', default: true }, limite: { type: 'number', default: 0 } },
    init() {
      sistema(this.el).arrastrables.add(this.el);
    },
    remove() {
      sistema(this.el).arrastrables.delete(this.el);
    },
  });

  AFRAME.registerComponent('am-tocable', {
    init() {
      sistema(this.el).tocables.add(this.el);
      this.rebote = 0;
    },
    remove() {
      sistema(this.el).tocables.delete(this.el);
    },
    rebotar() {
      this.rebote = 1;
      this.escala = this.escala ?? this.el.object3D.scale.clone();
    },
    tick(_t, dt) {
      if (this.rebote <= 0) return;
      this.rebote = Math.max(0, this.rebote - dt / 350);
      const f = 1 + Math.sin(this.rebote * Math.PI) * 0.18;
      this.el.object3D.scale.copy(this.escala).multiplyScalar(f);
    },
  });

  AFRAME.registerComponent('am-flotar', {
    schema: { altura: { type: 'number', default: 0.15 }, velocidad: { type: 'number', default: 1 }, giro: { type: 'number', default: 30 } },
    init() {
      this.base = null;
      this.fase = Math.random() * Math.PI * 2;
    },
    tick(t, dt) {
      const o = this.el.object3D;
      if (sistema(this.el).arrastre?.el === this.el) {
        this.base = null;
        return;
      }
      if (this.base === null) this.base = o.position.y;
      o.position.y = this.base + Math.sin(t / 1000 * this.data.velocidad * 2 + this.fase) * this.data.altura;
      o.rotation.y += THREE.MathUtils.degToRad(this.data.giro) * (dt / 1000);
    },
  });

  // --- Zonas ------------------------------------------------------------------------------
  AFRAME.registerComponent('am-zona', {
    schema: { radio: { type: 'number', default: 1 }, color: { type: 'color', default: '#00E5FF' }, acepta: { type: 'string', default: '' } },
    init() {
      sistema(this.el).zonas.add(this.el);
      this.ocupantes = [];
      this.espera = 0;
      this.construir();
    },
    update(previo) {
      if (previo && previo.radio !== undefined && (previo.radio !== this.data.radio || previo.color !== this.data.color)) this.construir();
    },
    construir() {
      if (this.grupo) this.el.removeObject3D('zona');
      const { radio, color } = this.data;
      const grupo = new THREE.Group();
      this.anillo = new THREE.Mesh(new THREE.RingGeometry(radio * 0.84, radio, 6 * Math.max(4, Math.round(radio * 4))), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
      this.relleno = new THREE.Mesh(new THREE.CircleGeometry(radio * 0.84, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false }));
      this.pared = new THREE.Mesh(new THREE.CylinderGeometry(radio, radio, 0.5, 24, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }));
      this.anillo.rotation.x = -Math.PI / 2;
      this.relleno.rotation.x = -Math.PI / 2;
      this.anillo.position.y = 0.03;
      this.relleno.position.y = 0.02;
      this.pared.position.y = 0.25;
      grupo.add(this.relleno, this.anillo, this.pared);
      this.grupo = grupo;
      this.el.setObject3D('zona', grupo);
      this.asentar();
    },
    asentar() {
      const p = this.el.object3D.position;
      p.y = sistema(this.el).alturaSuelo(p.x, p.z);
    },
    remove() {
      sistema(this.el).zonas.delete(this.el);
      this.el.removeObject3D('zona');
    },
    tick(t, dt) {
      this.anillo.material.opacity = 0.65 + Math.sin(t / 400) * 0.25;
      this.espera -= dt;
      if (this.espera > 0) return;
      this.espera = 200;
      const s = sistema(this.el);
      const centro = this.el.object3D.position;
      const dentro = [...s.arrastrables]
        .filter((el) => (!this.data.acepta || el.matches(this.data.acepta)) && Math.hypot(el.object3D.position.x - centro.x, el.object3D.position.z - centro.z) <= this.data.radio)
        .map((el) => el.id);
      if (dentro.join(',') === this.ocupantes.join(',')) return;
      this.ocupantes = dentro;
      const ocupada = dentro.length > 0;
      const color = new THREE.Color(ocupada ? '#2ECC71' : this.data.color);
      for (const malla of [this.anillo, this.relleno, this.pared]) malla.material.color.copy(color);
      this.el.emit('am-zona-cambio', { ocupantes: dentro });
    },
  });

  // --- Entorno generado -------------------------------------------------------------------
  AFRAME.registerComponent('am-entorno', {
    schema: {
      tipo: { type: 'string', default: 'pradera' },
      semilla: { type: 'string', default: '1' },
      tamano: { type: 'number', default: 40 },
      densidad: { type: 'number', default: 0.5 },
      calidad: { type: 'string', default: '' },
      niebla: { type: 'boolean', default: true },
    },
    update() {
      this.limpiar();
      const calidad = this.data.calidad || elegirCalidad(senalesDelNavegador()).nivel;
      const semilla = /^\d+$/.test(this.data.semilla) ? Number(this.data.semilla) : this.data.semilla;
      const claro = Math.max(4, Math.min(10, this.data.tamano * 0.2));
      const { preset, terreno, piezas, nivelAgua } = datosEntorno({ tipo: this.data.tipo, semilla, tamano: this.data.tamano, densidad: this.data.densidad, claro, calidad });
      const grupo = new THREE.Group();
      grupo.add(this.mallaTerreno(preset, terreno), this.cielo(preset, terreno.tamano));
      if (nivelAgua !== null) {
        const agua = new THREE.Mesh(new THREE.PlaneGeometry(terreno.tamano * 3, terreno.tamano * 3), new THREE.MeshLambertMaterial({ color: preset.agua, transparent: true, opacity: 0.82 }));
        agua.rotation.x = -Math.PI / 2;
        agua.position.y = nivelAgua;
        grupo.add(agua);
      }
      if (preset.estrellas) grupo.add(this.estrellas(semilla, terreno.tamano));
      if (preset.rejilla) {
        const rejilla = new THREE.GridHelper(terreno.tamano, terreno.tamano, 0x6c4a8a, 0x3a2f4a);
        rejilla.position.y = 0.01;
        grupo.add(rejilla);
      }
      for (const malla of this.piezas(piezas)) grupo.add(malla);
      this.el.setObject3D('entorno', grupo);
      const escena = this.el.sceneEl;
      if (this.data.niebla && preset.niebla) escena.object3D.fog = new THREE.Fog(preset.niebla, terreno.tamano * 0.3, terreno.tamano * 1.1);
      escena.object3D.background = new THREE.Color(preset.cielo[1]);
      const s = sistema(this.el);
      s.terreno = { altura: terreno.altura, tamano: terreno.tamano };
      s.asentar();
      this.el.emit('am-terreno-listo', { tipo: this.data.tipo, piezas: piezas.length });
    },
    mallaTerreno(preset, terreno) {
      const { resolucion: res, tamano, alturas } = terreno;
      const paso = tamano / res;
      const mitad = tamano / 2;
      const posiciones = new Float32Array(res * res * 6 * 3);
      const colores = new Float32Array(res * res * 6 * 3);
      const color = new THREE.Color();
      let k = 0;
      const vertice = (i, j) => [-mitad + i * paso, alturas[j * (res + 1) + i], -mitad + j * paso];
      const triangulo = (a, b, c) => {
        color.set(colorDeAltura(preset.suelo, (a[1] + b[1] + c[1]) / 3, preset.relieve));
        for (const v of [a, b, c]) {
          posiciones.set(v, k * 3);
          colores.set([color.r, color.g, color.b], k * 3);
          k += 1;
        }
      };
      for (let j = 0; j < res; j += 1) {
        for (let i = 0; i < res; i += 1) {
          const a = vertice(i, j);
          const b = vertice(i + 1, j);
          const c = vertice(i, j + 1);
          const d = vertice(i + 1, j + 1);
          triangulo(a, c, b);
          triangulo(b, c, d);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colores, 3));
      geo.computeVertexNormals();
      return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    },
    cielo(preset, tamano) {
      const geo = new THREE.SphereGeometry(tamano * 1.4, 16, 10);
      const arriba = new THREE.Color(preset.cielo[0]);
      const horizonte = new THREE.Color(preset.cielo[1]);
      const colores = [];
      const posicion = geo.getAttribute('position');
      const c = new THREE.Color();
      for (let i = 0; i < posicion.count; i += 1) {
        const t = Math.max(0, posicion.getY(i) / (tamano * 1.4));
        c.copy(horizonte).lerp(arriba, Math.pow(t, 0.6));
        colores.push(c.r, c.g, c.b);
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colores, 3));
      return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    },
    estrellas(semilla, tamano) {
      const puntos = [];
      let s = Number(semilla) || 7;
      const azar = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 500; i += 1) {
        const a = azar() * Math.PI * 2;
        const b = azar() * Math.PI * 0.48;
        const r = tamano * 1.3;
        puntos.push(Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r + 2, Math.sin(a) * Math.cos(b) * r);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(puntos, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, fog: false }));
    },
    piezas(lista) {
      const porTipo = new Map();
      for (const pieza of lista) {
        if (!porTipo.has(pieza.tipo)) porTipo.set(pieza.tipo, []);
        porTipo.get(pieza.tipo).push(pieza);
      }
      const mallas = [];
      const m = new THREE.Matrix4();
      const parte = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const color = new THREE.Color();
      for (const [tipo, piezas] of porTipo) {
        for (const [crear, hex, desplazar, escalar, estirar] of PARTES[tipo] ?? []) {
          const malla = new THREE.InstancedMesh(compartido(`pieza:${tipo}:${hex}:${desplazar}`, crear), materialPlano(estirar ? '#ffffff' : hex), piezas.length);
          piezas.forEach((p, i) => {
            const alto = estirar ? p.escala * 3 : 1;
            q.setFromAxisAngle(ARRIBA, p.giro);
            m.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(p.escala, p.escala, p.escala));
            parte.compose(new THREE.Vector3(desplazar[0], desplazar[1] * alto, desplazar[2]), new THREE.Quaternion(), new THREE.Vector3(escalar[0], escalar[1] * alto, escalar[2]));
            malla.setMatrixAt(i, m.multiply(parte));
            if (estirar) malla.setColorAt(i, color.set(COLORES_EDIFICIO[i % COLORES_EDIFICIO.length]));
          });
          malla.instanceMatrix.needsUpdate = true;
          mallas.push(malla);
        }
      }
      return mallas;
    },
    limpiar() {
      if (this.el.getObject3D('entorno')) this.el.removeObject3D('entorno');
    },
    remove() {
      this.limpiar();
      const s = sistema(this.el);
      if (s) s.terreno = null;
      this.el.sceneEl.object3D.fog = null;
    },
  });

  // --- Generar copias en un patrón ------------------------------------------------------------
  AFRAME.registerComponent('am-generar', {
    schema: {
      forma: { type: 'string', default: 'caja' },
      patron: { type: 'string', default: 'circulo' },
      cantidad: { type: 'int', default: 8 },
      radio: { type: 'number', default: 4 },
      separacion: { type: 'number', default: 1.5 },
      escala: { type: 'number', default: 1 },
      color: { type: 'color', default: '#9B59B6' },
      semilla: { type: 'string', default: '1' },
      variar: { type: 'number', default: 0 },
    },
    init() {
      this.alListo = () => this.update();
      this.el.sceneEl.addEventListener('am-terreno-listo', this.alListo);
    },
    update() {
      const d = this.data;
      const puntos = generarPatron({ ...d, semilla: /^\d+$/.test(d.semilla) ? Number(d.semilla) : d.semilla });
      const malla = new THREE.InstancedMesh(geometria(d.forma), new THREE.MeshStandardMaterial({ color: d.color, flatShading: true, roughness: 0.75 }), puntos.length);
      const s = sistema(this.el);
      const origen = this.el.object3D.position;
      const alto = (ALTO_FORMA[d.forma] ?? 1) * d.escala;
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      puntos.forEach((p, i) => {
        const e = d.escala * p.escala;
        q.setFromAxisAngle(ARRIBA, p.giro);
        const y = s.alturaSuelo(origen.x + p.x, origen.z + p.z) - origen.y + (alto * p.escala) / 2;
        malla.setMatrixAt(i, m.compose(new THREE.Vector3(p.x, y, p.z), q, new THREE.Vector3(e, e, e)));
      });
      malla.instanceMatrix.needsUpdate = true;
      this.el.setObject3D('generar', malla);
    },
    remove() {
      this.el.sceneEl.removeEventListener('am-terreno-listo', this.alListo);
      this.el.removeObject3D('generar');
    },
  });

  // --- Cámaras ---------------------------------------------------------------------------------
  AFRAME.registerComponent('am-orbita', {
    schema: {
      distancia: { type: 'number', default: 9 },
      minimo: { type: 'number', default: 3 },
      maximo: { type: 'number', default: 40 },
      objetivo: { type: 'vec3', default: { x: 0, y: 0.6, z: 0 } },
      inclinacion: { type: 'number', default: 32 },
      giro: { type: 'number', default: 25 },
    },
    init() {
      this.distancia = this.data.distancia;
      this.polar = THREE.MathUtils.degToRad(90 - this.data.inclinacion);
      this.azimut = THREE.MathUtils.degToRad(this.data.giro);
      this.objetivo = new THREE.Vector3();
      sistema(this.el).orbita = this;
      activarCamara(this.el);
      this.aplicar();
    },
    remove() {
      const s = sistema(this.el);
      if (s.orbita === this) s.orbita = null;
    },
    girar(dx, dy) {
      this.azimut -= dx * 0.007;
      this.polar = Math.min(THREE.MathUtils.degToRad(85), Math.max(THREE.MathUtils.degToRad(12), this.polar - dy * 0.006));
      this.aplicar();
    },
    acercar(factor) {
      this.distancia = Math.min(this.data.maximo, Math.max(this.data.minimo, this.distancia * factor));
      this.aplicar();
    },
    aplicar() {
      const { x, y, z } = this.data.objetivo;
      this.objetivo.set(x, y, z);
      const r = this.distancia;
      this.el.object3D.position.set(x + r * Math.sin(this.polar) * Math.sin(this.azimut), y + r * Math.cos(this.polar), z + r * Math.sin(this.polar) * Math.cos(this.azimut));
      // La entidad no es una cámara de three: se orienta como cámara (su -Z mira al objetivo).
      this.mirar = this.mirar ?? new THREE.Matrix4();
      this.mirar.lookAt(this.el.object3D.position, this.objetivo, ARRIBA);
      this.el.object3D.quaternion.setFromRotationMatrix(this.mirar);
    },
  });

  AFRAME.registerComponent('am-caminar', {
    schema: { velocidad: { type: 'number', default: 3 } },
    init() {
      this.teclas = new Set();
      this.adelante = false;
      this.alTeclear = (e) => {
        const tecla = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(tecla)) {
          if (e.type === 'keydown') this.teclas.add(tecla);
          else this.teclas.delete(tecla);
        }
      };
      // En el celular: mantener el dedo quieto medio segundo camina hacia adelante.
      this.alPresionar = (e) => {
        if (e.pointerType !== 'touch') return;
        clearTimeout(this.reloj);
        this.reloj = setTimeout(() => (this.adelante = true), 450);
      };
      this.alSoltar = () => {
        clearTimeout(this.reloj);
        this.adelante = false;
      };
      window.addEventListener('keydown', this.alTeclear);
      window.addEventListener('keyup', this.alTeclear);
      this.el.sceneEl.addEventListener('pointerdown', this.alPresionar);
      window.addEventListener('pointerup', this.alSoltar);
      this.direccion = new THREE.Vector3();
      const camara = this.el.querySelector('[camera]');
      if (camara) activarCamara(camara);
    },
    remove() {
      window.removeEventListener('keydown', this.alTeclear);
      window.removeEventListener('keyup', this.alTeclear);
      this.el.sceneEl.removeEventListener('pointerdown', this.alPresionar);
      window.removeEventListener('pointerup', this.alSoltar);
    },
    tick(_t, dt) {
      const camara = this.el.sceneEl.camera;
      const s = sistema(this.el);
      const t = this.teclas;
      const frente = (t.has('w') || t.has('arrowup') || this.adelante ? 1 : 0) - (t.has('s') || t.has('arrowdown') ? 1 : 0);
      const lado = (t.has('d') || t.has('arrowright') ? 1 : 0) - (t.has('a') || t.has('arrowleft') ? 1 : 0);
      const p = this.el.object3D.position;
      if ((frente || lado) && camara) {
        camara.getWorldDirection(this.direccion);
        this.direccion.y = 0;
        this.direccion.normalize();
        const paso = this.data.velocidad * (dt / 1000);
        p.x += (this.direccion.x * frente - this.direccion.z * lado) * paso;
        p.z += (this.direccion.z * frente + this.direccion.x * lado) * paso;
        const limite = s.limite();
        p.x = Math.max(-limite, Math.min(limite, p.x));
        p.z = Math.max(-limite, Math.min(limite, p.z));
      }
      p.y = s.alturaSuelo(p.x, p.z);
    },
  });

  // --- Realidad virtual: agarrar con el láser -------------------------------------------------
  AFRAME.registerComponent('am-mano', {
    init() {
      this.agarrado = null;
      this.origen = new THREE.Vector3();
      this.dir = new THREE.Vector3();
      this.agarrar = () => {
        const tocados = this.el.components.raycaster?.intersectedEls ?? [];
        const s = sistema(this.el);
        const el = tocados.find((e) => s.arrastrables.has(e) || s.tocables.has(e));
        if (!el) return;
        if (s.tocables.has(el) && !s.arrastrables.has(el)) {
          s.tocar(el);
          return;
        }
        this.el.object3D.getWorldPosition(this.origen);
        this.distancia = this.origen.distanceTo(el.object3D.position);
        this.agarrado = el;
        el.emit('am-agarrar');
      };
      this.soltarlo = () => {
        if (!this.agarrado) return;
        const p = this.agarrado.object3D.position;
        this.agarrado.emit('am-soltar', { x: p.x, y: p.y, z: p.z });
        this.agarrado = null;
      };
      for (const evento of ['triggerdown', 'gripdown']) this.el.addEventListener(evento, this.agarrar);
      for (const evento of ['triggerup', 'gripup']) this.el.addEventListener(evento, this.soltarlo);
    },
    remove() {
      for (const evento of ['triggerdown', 'gripdown']) this.el.removeEventListener(evento, this.agarrar);
      for (const evento of ['triggerup', 'gripup']) this.el.removeEventListener(evento, this.soltarlo);
    },
    tick() {
      if (!this.agarrado) return;
      this.el.object3D.getWorldPosition(this.origen);
      this.el.object3D.getWorldDirection(this.dir).negate();
      const punto = this.origen.clone().addScaledVector(this.dir, this.distancia);
      sistema(this.el).acomodar(this.agarrado, punto.x, punto.z);
    },
  });

  // --- Retos y celebración --------------------------------------------------------------------
  AFRAME.registerComponent('am-reto', {
    multiple: true,
    schema: {
      tipo: { type: 'string', default: 'en_zona' },
      objeto: { type: 'string', default: '' },
      objetos: { type: 'array', default: [] },
      zona: { type: 'string', default: '' },
      de: { type: 'string', default: '' },
      distancia: { type: 'number', default: 1 },
      minimo: { type: 'number', default: 1 },
      texto: { type: 'string', default: '' },
    },
    init() {
      this.cumplido = false;
      this.espera = 0;
    },
    tick(_t, dt) {
      this.espera -= dt;
      if (this.espera > 0) return;
      this.espera = 300;
      const ahora = evaluarReto(this.data, sistema(this.el).foto());
      if (ahora && !this.cumplido) {
        this.cumplido = true;
        const idDestino = (this.data.zona || this.data.objeto || '').replace(/^#/, '');
        const destino = idDestino ? this.el.sceneEl.querySelector(`#${CSS.escape(idDestino)}`) : null;
        celebrar(this.el.sceneEl, destino ? destino.object3D.position : new THREE.Vector3());
        this.el.sceneEl.emit('am-reto-cumplido', { id: this.id, texto: textoReto(this.data) });
      } else if (!ahora && this.cumplido) {
        this.cumplido = false;
        this.el.sceneEl.emit('am-reto-perdido', { id: this.id });
      }
    },
  });

  // Una lluvia corta de cristales (una sola malla instanciada) donde se cumplió el reto.
  function celebrar(escena, centro) {
    if (escena.ownerDocument?.documentElement.classList.contains('ligero')) return;
    const n = 28;
    const malla = new THREE.InstancedMesh(geometria('cristal'), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true }), n);
    const colores = ['#9B59B6', '#00E5FF', '#F1C40F', '#2ECC71'];
    const particulas = Array.from({ length: n }, (_, i) => {
      malla.setColorAt(i, new THREE.Color(colores[i % colores.length]));
      const a = (i / n) * Math.PI * 2;
      return { p: new THREE.Vector3(centro.x, centro.y + 0.4, centro.z), v: new THREE.Vector3(Math.cos(a) * 2.2, 4 + (i % 5) * 0.6, Math.sin(a) * 2.2) };
    });
    escena.object3D.add(malla);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Vector3(0.18, 0.18, 0.18);
    let vida = 1.3;
    let anterior = performance.now();
    const paso = (ahora) => {
      const dt = Math.min(0.05, (ahora - anterior) / 1000);
      anterior = ahora;
      vida -= dt;
      particulas.forEach((part, i) => {
        part.v.y -= 9 * dt;
        part.p.addScaledVector(part.v, dt);
        malla.setMatrixAt(i, m.compose(part.p, q, e));
      });
      malla.instanceMatrix.needsUpdate = true;
      malla.material.opacity = Math.max(0, vida / 1.3);
      if (vida > 0) requestAnimationFrame(paso);
      else {
        escena.object3D.remove(malla);
        malla.material.dispose();
      }
    };
    requestAnimationFrame(paso);
  }

  // --- Rendimiento ---------------------------------------------------------------------------
  AFRAME.registerComponent('am-rendimiento', {
    init() {
      const calidad = elegirCalidad(senalesDelNavegador());
      this.calidad = calidad;
      this.ratio = calidad.pixelRatio;
      this.suma = 0;
      this.cuadros = 0;
      const aplicar = () => this.el.renderer?.setPixelRatio(this.ratio);
      if (this.el.renderer) aplicar();
      else this.el.addEventListener('render-target-loaded', aplicar, { once: true });
    },
    tick(_t, dt) {
      if (!dt || this.el.is('vr-mode')) return;
      this.suma += dt;
      this.cuadros += 1;
      if (this.suma < 2000) return;
      const nuevo = ajustarResolucion(this.ratio, this.suma / this.cuadros, { minimo: this.calidad.pixelRatioMinimo, maximo: this.calidad.pixelRatio });
      this.suma = 0;
      this.cuadros = 0;
      if (nuevo !== this.ratio) {
        this.ratio = nuevo;
        this.el.renderer.setPixelRatio(nuevo);
      }
    },
  });

  return true;
}
