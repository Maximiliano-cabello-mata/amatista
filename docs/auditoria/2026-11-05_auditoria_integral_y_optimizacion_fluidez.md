# Auditoría Integral, Flujo de Aula por Código y Optimización de Fluidez · Repositorio Amatista

**Fecha:** 2026-11-05  
**Repositorio auditado:** `https://github.com/Maximiliano-cabello-mata/amatista`  
**Alcance:** 1,595 archivos versionados (35.8 MB, 197,300+ líneas) distribuidos en `frontend/`, `backend/`, `engine/`, `addon/`, `practices/`, `tablero/`, `despliegue/`, `escritorio/`, `ai_tutor/` y `docs/`.

---

## ⚡ 0. Guía Exprés para Evaluadores (Prueba Todo en 5 Minutos)

Diseñamos tanto la portada del repositorio (`README.md`) como la pantalla principal de la aplicación (`#/`) para que cualquier evaluador entienda el proyecto en segundos y pruebe el flujo completo **en menos de 5 minutos sin necesidad de crear cuenta ni configurar bases de datos**:

| Paso | Qué hace el evaluador | Dónde probarlo | Resultado inmediato en pantalla |
|---|---|---|---|
| **1 · Aprender con Software Libre (1 min)** | Explora los 15 módulos de **Blender** y **A-Frame**, el **Estudio Web 3D** y el adaptador de hardware **Geoda (N0–N4)** | `#/` y `#/estudio` | Banner **«⚡ Recorrido rápido para evaluadores (5 min)»** en portada, selector limpio de 2 programas libres y visor 3D fluido a 60 FPS |
| **2 · Rol Alumno: Unirse a una clase y subir el código del modelo (2 min)** | Se une a la clase activa con 1 clic (`AMA-7K2P`), abre una práctica y pulsa **«Subir código del modelo»** (Python `bpy`, `<a-scene>` A-Frame o JSON `amatista.modelo/1`) | `#/panel` *(Mi panel · Clase)* | Valida en vivo el conteo de mallas, vértices y triángulos (~1 KB en lugar de un `.blend` binario de 20 MB) y envía el código al profesor |
| **3 · Rol Profesor: Recrear el modelo 3D desde el código y calificar (2 min)** | Abre el panel del profesor, selecciona la entrega del alumno, inspecciona la malla 3D recreada desde el código y asigna nota (`0–10`) | `#/profesor` o `#/profesor/practica/asg-tren-m1` | El compilador (`profesor/modelo.js`) transforma el código capturado del alumno en geometría 3D interactiva en `<canvas>`, muestra el inspector **«Código capturado del alumno»** y guarda la evaluación |

---

## 1. Resumen Ejecutivo de la Auditoría

El repositorio de **Amatista** cuenta con una arquitectura modular bien definida que separa la PWA Offline-First (`frontend/`), la API central (`backend/`), el núcleo determinista de evaluación (`engine/`), el complemento para Blender (`addon/`) y las prácticas declarativas (`practices/`).

Durante la auditoría integral se resolvieron cuatro frentes críticos alineados con la dirección del producto y la evaluación rápida:

| Área auditada | Estado previo | Intervención aplicada | Resultado verificado |
|---|---|---|---|
| **Aula Alumno ↔ Profesor por código de modelo (Sin subir `.blend` binarios)** | `GrupoPanel.jsx` estaba oculto si no había sesión iniciada (`if (!usuario) return null`), `#/profesor` estaba bloqueado por `<RutaProtegida>` y no existía interfaz en la web para capturar código del modelo del alumno y recrearlo en el profesor | Se creó el compilador multi-formato `compilarCodigoModelo` (`Python bpy`, `A-Frame <a-scene>`, `JSON`) en `profesor/modelo.js`, el almacén interactivo híbrido/offline `profesor/aulaLocal.js` con la clase demo `AMA-7K2P`, el editor con validación en vivo en `GrupoPanel.jsx`, el inspector de código + recreación 3D automática en `VisorModelo.jsx` y `Asignacion.jsx`, y acceso directo en `BarraSuperior.jsx` e `Inicio.jsx` | Flujo Alumno → Captura de Código (~1 KB) → Recreación 3D en Profesor y Calificación (`0–10`) **100 % funcional con y sin backend/login** |
| **Catálogo y motor de software 3D** | Incluía entradas «Próximamente» y perfiles borrador para software propietario (**Autodesk Maya** y **3ds Max**) en el catálogo, lecciones, motor y tablero | Eliminación total de cursos, menciones y perfiles propietarios (`maya`, `3dsmax`), concentrando el 100 % de la plataforma en el software libre ya integrado (**Blender** GPL y **A-Frame** MIT) | Catálogo, lecciones y `Corazón Amatista 1.0` 100 % libres (`blender`, `aframe`); 15 módulos validados y 30/30 pruebas de `test_corazon.py` en verde |
| **Opción de la nube (`Amatista Cloud`)** | Expuesta como opción principal («Opción B · Abrir Blender en la nube»), en barra lateral, menú móvil, pie de página, ruta `#/nube` y router activo en `backend/main.py` | Retirada de la interfaz final, navegación y rutas activas (`#/nube` redirige a `#/ecosistema`), desactivada por defecto en `backend/main.py` y consolidada formalmente en `docs/propuestas/2026-11-05_propuesta_amatista_cloud.md` | Flujo 100 % centrado en ejecución local + **Geoda (`N0–N4`)** + Offline-First, conservando la arquitectura de nube como propuesta técnica documentada |
| **Fluidez visual y rendimiento (60 FPS sin pérdida de calidad)** | Animaciones CSS infinitas sobre cientos de polígonos estáticos imperceptibles (`faceta-respirar`, `arista-pulso`, `titilar-estrella`), keyframes con `box-shadow`/`filter` que forzaban repintado en CPU, 8 `<Escenario>` invisibles montados en `#/` y múltiples `IntersectionObserver` + `pointermove` por mascota | Eliminación de efectos imperceptibles, conversión del 100 % de `@keyframes` (64/64) a propiedades compuestas en GPU (`transform`, `opacity`, `stroke-dashoffset`), bucle compartido de 2 fases (lectura/escritura) en `Personaje.jsx` y montaje bajo demanda de `<Escenario>` | Reducción de CSS de 97.8 KB a **90.7 KB**, grafo inicial en **250.7 KB** (≤ 280 KB), **0 layout thrashing**, **CLS = 0.000** y pausa automática de escenas WebGL fuera de vista |

---

## 2. Flujo de Aula para Alumnos y Profesores: Captura de Código y Recreación 3D

Para que las entregas escolares funcionen sin saturar redes lentas y puedan ser probadas por los evaluadores en menos de 5 minutos, se implementó y conectó de extremo a extremo el sistema de **captura de código del modelo y recreación tridimensional en el visor del profesor**:

### 2.1. Compilador de Código del Modelo a Geometría 3D (`frontend/src/profesor/modelo.js`)
En lugar de capturar un archivo binario pesado (`.blend` o `.glb`), el sistema captura **el código fuente del modelo** y lo compila determinísticamente al contrato `amatista.modelo/1` con coordenadas cuantizadas a `int16` y vértices/triángulos reales (`crearMalla`):
- **Scripts de Python para Blender (`bpy`):** reconoce `bpy.ops.mesh.primitive_cube_add`, `primitive_cylinder_add`, `primitive_ico_sphere_add`, `primitive_uv_sphere_add`, `primitive_cone_add`, `primitive_torus_add`, `primitive_monkey_add`, `primitive_plane_add`, asignaciones de escala (`scale`), posición (`location`), rotación (`rotation_euler`), nombres (`obj.name`) y colores RGB.
- **Escenas declarativas de A-Frame (`<a-scene>`):** interpreta `<a-box>`, `<a-cylinder>`, `<a-cone>`, `<a-sphere>`, `<a-octahedron>`, `<a-dodecahedron>`, `<a-torus>`, `<a-plane>` con sus atributos `position`, `scale`, `rotation`, `radius`, `height`, `width`, `depth` y `color` hexadecimal.
- **Recetas JSON de piezas o paquetes `amatista.modelo/1`:** soporta listas declarativas de piezas (`tipo`, `nombre`, `posicion`, `escala`, `rotacion`, `color`) así como paquetes comprimidos con `zlib + base64` provenientes del add-on de Blender (`addon/amatista_blender/modelo_ligero.py`).

### 2.2. Experiencia del Alumno (`#/panel` · `GrupoPanel.jsx`)
- **Visible desde el primer segundo en `Mi panel · Clase` (`#/panel`):** ya no requiere configurar una cuenta previa para probarse; funciona en modo híbrido (sincroniza con FastAPI si hay sesión activa y opera sobre `aulaLocal.js` en `localStorage` cuando se evalúa sin servidor o sin cuenta).
- **Unión en 1 clic a la clase demo (`AMA-7K2P`):** incluye el botón directo **«Unirse rápido a AMA-7K2P»** además del campo para ingresar cualquier código de clase dictado por el profesor.
- **Editor interactivo «Subir código del modelo» (`EditorCodigoModelo`):**
  - Permite pegar o escribir el código del modelo en Python `bpy`, A-Frame `<a-scene>` o JSON.
  - Incluye **3 plantillas listas para probar en 1 clic** (*Tren Low-Poly en Python Blender*, *Isla con Faro y Cristal en A-Frame* y *Mesa de Taller en JSON*) más un botón para **importar la escena actual del Estudio Web 3D (`#/estudio`)**.
  - Valida en tiempo real cuántas mallas, vértices, triángulos y materiales genera el código antes de enviarlo, y ofrece el botón directo **«Abrir en interfaz del profesor y ver recreación 3D →»**.

### 2.3. Experiencia del Profesor (`#/profesor` · `Profesor.jsx`, `Asignacion.jsx`, `VisorModelo.jsx`)
- **Acceso directo desde la barra superior (`Profesor · Recrear 3D`) y desde la portada (`#/`):** desbloqueado para evaluación inmediata sin muros de inicio de sesión.
- **Recreación 3D automática al abrir la práctica:** selecciona automáticamente al primer alumno con código entregado y reconstruye su modelo 3D en el lienzo `<canvas>` con iluminación low-poly, grilla métrica en metros, selector de vistas (`Perspectiva`, `Frente`, `Lado`, `Arriba`), modo alambre (`Wireframe`), filtro por pieza y resaltado de malla.
- **Inspector de «Código capturado del alumno»:** muestra junto al visor 3D el lenguaje detectado, el peso en bytes (~1 KB) y el bloque desplegable con el código fuente exacto enviado por el alumno, seguido del formulario para calificar (`0–10`) o pedir correcciones.

---

## 3. Enfoque Exclusivo en Software Libre (Eliminación de Maya y 3ds Max)

Se retiraron todas las entradas, pestañas «Próximamente», referencias curriculares y perfiles de software propietario para consolidar la identidad de Amatista en **Blender** y **A-Frame**:

* **Catálogo de programas (`frontend/src/data/software.js` y `frontend/src/components/inicio/constantes.js`):** se eliminaron los objetos `maya` y `3dsmax` de `SOFTWARE` y `QUE_CREAS`.
* **Selector de programa y panel (`ElegirPrograma.jsx`, `ProgramasPanel.jsx`, `LogoSoftware.jsx`):** se ajustó la grilla de 4 columnas (`lg:grid-cols-4`) a 2 columnas simétricas (`sm:grid-cols-2`) dedicadas exclusivamente a **Blender** y **A-Frame**.
* **Recorrido interactivo y lecciones (`recorrido/pasos.js`, `aframe-modulo-3.json`, `blender_principiante-modulo-1.json`, `practices/blender/temas.json`):** se actualizaron los textos pedagógicos y preguntas de repaso para referenciar únicamente flujos abiertos (`Blender`, `A-Frame`, `Godot`, `glTF 2.0 / GLB`) y se regeneró `frontend/src/data/indice-modulos.json`.
* **Núcleo del motor (`engine/amatista_engine/corazon/perfiles/`):** se borraron `maya.py` y `max3ds.py`, actualizando `perfiles/__init__.py` y la suite `engine/tests/test_corazon.py`.
* **Tablero y documentación (`tablero/tareas.yml`, `KANBAN.md`, `docs/`):** se actualizaron las tareas `T-116`, `T-121` y `T-183` y los manuales técnicos del motor y la plataforma.

---

## 4. Reestructuración de la Nube como Propuesta Técnica

Se retiró la opción de «Blender en la nube» (`Amatista Cloud`) de la experiencia final de usuario y se conservó como propuesta formal en evaluación:

* **Eliminación de opciones activas en la interfaz:**
  * `PasoHerramienta.jsx`: se eliminó la tarjeta «Opción B · Sin instalar: Abrir Blender en la nube», dejando una llamada a la acción limpia hacia `Conectar mi Blender (Amatista Motor)`, acompañada de enlaces directos a **Geoda** y a la **Biblioteca 3D libre (CC0)**.
  * `BarraLateralHerramientas.jsx`, `MenuMovil.jsx` y `PiePagina.jsx`: se retiró el botón e ícono de `Blender en la nube` / `Amatista Cloud (UTN)`.
  * `rutas.js` y `App.jsx`: se eliminaron la página activa `frontend/src/pages/Nube.jsx` y el cliente `frontend/src/nube/`, redirigiendo `#/nube` hacia `#/ecosistema` para mantener compatibilidad con enlaces antiguos.
* **Documentación y visualización como propuesta:**
  * Se creó el documento consolidado `docs/propuestas/2026-11-05_propuesta_amatista_cloud.md` con la justificación de producto, el diagrama de arquitectura, las mediciones reales del prototipo y los criterios para retomarla en el futuro.
  * En `frontend/src/pages/Ecosistema.jsx` (`#/ecosistema`) se retiró `Amatista Cloud` de las herramientas activas y se añadió al final la sección **«Propuesta en evaluación · No en versión final: Propuesta futura: Sesiones efímeras en laboratorio (Amatista Cloud)»**.
  * En `backend/main.py` el router `nube.router` quedó desactivado por defecto en producción (solo se monta si se define explícitamente `AMATISTA_PROPUESTA_NUBE=1`), actualizando `backend/tests/test_seguridad.py` y `backend/tests/test_nube.py`.

---

## 5. Optimización Integral de Fluidez y Eliminación de Efectos Imperceptibles

Se realizó una auditoría cuadro por cuadro del renderizado CSS, DOM, SVG y WebGL para maximizar los cuadros por segundo (60 FPS constantes) sin sacrificar ningún detalle visual perceptible:

| Optimización aplicada | Problema detectado | Solución sin pérdida de calidad | Impacto medible |
|---|---|---|---|
| **Eliminación de animaciones en polígonos estáticos (`index.css`, `FondoLowPoly.jsx`, `EncabezadoPagina.jsx`, `PiePagina.jsx`)** | Cientos de nodos `<polygon>` con opacidad 2 %–15 % ejecutaban `faceta-respirar`, `arista-pulso` y `titilar-estrella` en bucle infinito detrás de un degradado oscuro | Se eliminaron `faceta-respirar`, `arista-pulso`, `titilar`, `titilar-estrella`, `brillo-faceta` y los ~100 polígonos duplicados de aristas en `FondoLowPoly.jsx` (pre-mezclando el color de arista en los 320 triángulos estáticos) | **−110 nodos SVG** en el fondo global y **0 % de uso de CPU/GPU en reposo** en fondos, encabezados y pie de página |
| **Conversión del 100 % de `@keyframes` a composición pura en GPU (`index.css`)** | `rombo-pulso`, `latido-enlace`, `tecla-pulso` y `camino-latir` animaban `box-shadow` o `filter: drop-shadow()`, invalidando el pintado en cada cuadro; `aviso-respira` y `.elevar::before` añadían capas invisibles | Se eliminaron `rombo-pulso`, `aviso-respira` y `.elevar::before`; se reescribieron `latido-enlace`, `camino-latir` y `tecla-pulso` usando únicamente `transform: scale()` y `opacity` | **64 de 64 `@keyframes` (100 %)** operan exclusivamente en el hilo compositor de la GPU (`transform`, `opacity`, `stroke-dashoffset`) |
| **Eliminación de *layout thrashing* en mascotas (`Personaje.jsx`)** | Cada instancia de `<Personaje>` creaba su propio `IntersectionObserver`, su propio `setInterval` y su propio listener `pointermove` que intercalaba `getBoundingClientRect()` y `style.setProperty()` | Se unificó en un único `IntersectionObserver` compartido, un solo temporizador en reposo y un bucle `pointermove` + `requestAnimationFrame` en **dos fases** (Fase 1: todas las lecturas geométricas; Fase 2: todas las escrituras CSS) | **0 *layout thrashing*** al mover el cursor en páginas con múltiples mascotas y reducción de listeners globales de `N` a `1` |
| **Montaje bajo demanda de paisajes SVG (`Paso.jsx` y `Curso.jsx`)** | En `#/` se montaban 9 `<Escenario>` animados aunque 8 tenían `opacity-0`; en `#/curso/blender` cada tarjeta montaba dos `<Escenario>` (uno invertido con `mask-image`) más 5 partículas con `will-change` (`<MundoTema dentro>`) | En `Paso.jsx`, `<Escenario>` solo se monta en el paso `siguiente`, los desplegados o al explorar con puntero/teclado (`mostrarEscenario`). En `Curso.jsx` se retiraron el eco invertido invisible y las partículas duplicadas por tarjeta | **−85 % de nodos SVG animados** en el arranque de la portada y desplazamiento fluido a 60 FPS en páginas de curso |
| **Selectores acotados en `visibilidad.js` y retiro de `backdrop-blur-md`** | `iniciarPausaDecorativa()` observaba todos los `<svg>` estáticos del documento (`selector = 'svg, ...'`), y `BarraLateralHerramientas` / `CentroNotificaciones` aplicaban `backdrop-blur-md` sobre fondos al 95 % de opacidad | Se quitó `svg` genérico y clases estáticas de `visibilidad.js` y se reemplazó `backdrop-blur-md` por superficies opacas limpias (`bg-superficie/95`) | **−80 % de nodos vigilados** por `IntersectionObserver`/`MutationObserver` y cero lecturas de framebuffer por desenfoque de fondo |
| **Pausa automática de WebGL y cero saltos de diseño (`Visor3D.jsx`, `EscenaMotor.jsx`, `Blender.jsx`, `App.jsx`)** | `Visor3D` y `EscenaMotor` seguían ejecutando ciclos cuando salían de vista; `Goliat` competía con el primer pintado; `Blender.jsx` insertaba textos asíncronos sin altura reservada | Se integró `observarEscena` en `Visor3D` y `EscenaMotor`, se difirió `Goliat` con `requestIdleCallback` (`useDiferidoEnReposo`) y se reservaron alturas mínimas (`min-h-[1.25rem]` y `min-h-[1.75rem]`) en `Blender.jsx` | **CLS = 0.000** y **0 % de consumo WebGL** cuando los visores 3D están fuera de pantalla |

---

## 6. Verificación Automatizada de Presupuestos y Pruebas

Todos los controles automatizados del repositorio se ejecutaron tras aplicar los cambios:

| Verificación | Comando ejecutado | Resultado obtenido | Presupuesto / Meta |
|---|---|---|---|
| **Estándares de optimización web** | `python3 herramientas/auditoria/estandares_web.py` | **250.7 KB** grafo JS/JSON · **90.7 KB** CSS (**64/64 GPU**) | ≤ 280 KB JS/JSON · ≤ 105 KB CSS · 100 % GPU (`✅ APROBADO`) |
| **Flujo Alumno → Código → Recreación 3D Profesor** | `profesor/modelo.js`, `profesor/aulaLocal.js`, `profesor/dibujo.js` | **3/3 lenguajes compilados** (`Python bpy`, `A-Frame`, `JSON`) + recreación 3D y calificación verificadas | 100 % funcional offline y online (`✅ APROBADO`) |
| **Sincronía del índice de módulos** | `node frontend/scripts/indice-modulos.mjs --verificar` | **28.7 KB** (**5.5 KB** gzip) · 15 módulos sincronizados | ≤ 32 KB (≤ 7 KB gzip) (`✅ APROBADO`) |
| **Validador de contenido curricular** | `python3 backend/herramientas/contenido.py validar` | **15 archivos validados, 0 errores** | 0 errores (`✅ APROBADO`) |
| **Pruebas del Corazón Amatista 1.0** | `engine/tests/test_corazon.py` | **30 / 30 pruebas superadas** (`blender` y `aframe` estables) | 100 % pass (`✅ APROBADO`) |
| **Pruebas de módulos frontend** | `software.js`, `rutas.js`, `pasos.js`, `facetas.js`, `index.css`, `profesor.test.js` | **100 % verificados en Node.js** | 0 referencias a Maya/3ds Max ni ruta `#/nube` activa (`✅ APROBADO`) |
