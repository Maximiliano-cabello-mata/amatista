# Bitácora · 10 de octubre de 2026 · Herramientas gráficas y diseño CSS

Pedido de Maximiliano (10 oct, 01:40Z): investigar herramientas gráficas nuevas para la plataforma, filtrar lo que sirve y lo que no, crear las que no existan o sean muy aisladas, con enfoque de optimización (la plataforma debe funcionar en las peores condiciones) sin descuidar el diseño, y actualizar el diseño CSS.

## Cómo se hizo

- Se partió de la investigación anterior (`docs/plataforma/07_herramientas_graficas.md`, 9 oct) y del compendio de herramientas visuales, para no repetirlos.
- En vez de confiar en los pesos publicados, se instalaron 17 librerías en limpio y se midió lo que de verdad descargaría un alumno (esbuild + gzip -9). Resultado en §8 de ese documento: de 1.2 KB (ThumbHash) a 1.5 MB (Mermaid); `<model-viewer>` pesa 301 KB, no ~250.
- Faltaban dos herramientas que ninguna librería cubre para enseñar Blender en el navegador: tocar una malla como en el Modo Edición y leer un árbol de nodos. Se crearon en SVG propio.

## Lo nuevo

- **Visor de malla** (`mesh_viewer`, 5.3 KB): primitivas de Blender con sus mismas cuentas, selección por vértices, aristas o caras (1, 2, 3), sólido o alambre (Z), gizmo de ejes y panel de estadísticas. Sin WebGL.
- **Diagrama de nodos** (`node_graph`, 2.9 KB): colores de nodo y de conector de Blender, acomodo automático y «Recorrer el flujo».
- **Imagen ligera**: espacio reservado, relleno facetado, «Reintentar» sin conexión y «Ver imagen» con ahorro de datos.
- **Diseño CSS**: fichas de diseño, fuentes de respaldo con las medidas de las nuestras, texto sin huérfanas, esqueleto de carga, alto contraste, colores forzados e impresión. La paleta y la identidad low poly no cambian.
- En el curso: visor de malla en «Objeto o Edición» (Principiante m2) y diagrama de nodos en «Tres controles del Principled BSDF» (Principiante-Intermedio m1).

## Pruebas

- PWA: 208 pruebas de vitest (18 nuevas: cuentas de Blender, caras hacia afuera, visibilidad, acomodo de nodos, ciclos), lint y build.
- Backend: 381 pruebas (validación de los dos bloques nuevos) y los 10 módulos validan.
- Revisado en Chromium a 380 px y 1000 px: cubo, toroide, esfera en alambre, diagrama e imagen que falla; sin errores en consola.

## Pendiente para el usuario

- Revisar el PR y dar el OK para fusionarlo.
- Decidir T-097: visor del modelo del alumno con `<model-viewer>` (301 KB, con materiales) o con el visor de malla (unos KB, sin materiales).
- Probar el visor de malla en un teléfono real (arrastrar y tocar).
