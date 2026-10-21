# Bitácora · Plataforma 3D multiplataforma y accesible (21 oct 2026)

**Pedido (Maximiliano, 06:04 UTC):** Blender no es el centro de Amatista: es una plataforma de educación 3D (modelado, diseño, animación) que enseña A-Frame y Blender, y después Maya y 3ds Max. Mucho más contenido de A-Frame con prácticas útiles; quitar la sección exclusiva de Blender de la barra (solo Mi panel, Administración…); todo el contenido centralizado y accesible desde el inicio, sin scroll infinito ni bajar para encontrar los módulos; lavado de cara y accesibilidad para todos; e identificar qué le falta al motor de Blender.

**Decisiones por defecto (reversibles):** «Frame» se leyó como A-Frame (el curso `aframe` ya existía con un módulo); evolucionar el diseño «Facetas» con la misma paleta y las mismas mascotas; Maya y 3ds Max como «Próximamente» sin contenido; sin SQL nuevo; la página Blender se conserva, fuera de la barra.

## Qué se hizo

1. **Catálogo multiplataforma** (`data/software.js`, `catalogo/indice.js`): programas (Blender, A-Frame, Maya, 3ds Max) y seis disciplinas; cada módulo lleva sus disciplinas.
2. **Explorar** (`#/explorar`): todo en una página, con buscador sin acentos, filtros que quedan en la dirección, índice lateral y tarjetas de módulo con sus lecciones a un clic.
3. **Barra Inicio · Explorar · Mi panel** (· Admin) con lupa; portada multiplataforma con el mapa del contenido; Mi panel con «Tu avance en cada programa»; pie con los programas y sus herramientas; recorrido con una parada en Explorar (11 paradas).
4. **Estudio A-Frame** (`#/estudio`): editor con vista en vivo, cinco plantillas, piezas, descarga de la página; tres modelos GLB low poly propios generados sin dependencias.
5. **Curso de A-Frame** con 4 módulos nuevos (20 lecciones): escena, modelos GLB y texturas, animación e interacción, WebXR; cada uno con reto revisado y jefe final; cuatro temáticas con mascota nueva (Taco, Glib, Muelle, Nébula).
6. **Accesibilidad**: «Saltar al contenido», `aria-pressed`, `aria-live`, anclas con margen para la barra.
7. **Revisión del motor de Blender** (`docs/motor/2026-10-21_lo_que_le_falta_al_motor.md`): lo que falta es probarlo con alumnos y quedarse con una sola interfaz (el Taller); además, menús en el idioma de Blender, validadores de UV/texturas/glTF y el adaptador para un segundo programa.

## Errores encontrados y corregidos en el camino

- La vista A-Frame armaba todas las etiquetas antes de agregarlas, así `gltf-model="#id"` no encontraba sus `a-assets`: ahora se agregan en orden.
- La vista ignoraba `fog`, `cursor` y `raycaster` de la escena del alumno: ahora se copian.
- El nombre «Orbi» ya existía: la mascota de la órbita se llama Nébula.

## Pruebas

Vitest 301, backend 395, motor y add-on 553, contenido 14 archivos sin errores, lint y build sin avisos. En Chromium: los cinco retos de A-Frame (la solución pasa y el código inicial falla), las plantillas del Estudio con modelos, niebla y clic, e Inicio, Explorar, Estudio, curso, lección y Mi panel a 1366 y 390 px sin desbordes ni errores.

## Pendiente del usuario

Importar los módulos y publicar la PWA (`docs/despliegue/2026-10-21_multiplataforma.md`, T-119). Lo de siempre: tags y ramas viejas desde la computadora, T-113 en Blender con ventana, HTTPS de la API.
