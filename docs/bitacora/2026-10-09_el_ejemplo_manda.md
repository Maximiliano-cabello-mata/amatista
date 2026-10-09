# Bitácora · 9 de octubre de 2026 (noche) · El ejemplo manda (Amatista Motor 3.5)

Pedido de Maximiliano (9 oct, 17:36Z), después del primer borrador del PR #25:

> «la de la espada es un ejemplo; lo que se necesita es que el motor tenga un sistema autónomo que realmente revise lo que se está realizando en cualquier práctica, teniendo por ejemplo en código un ejemplo claro de lo que se espera en la práctica, con el enfoque de PWA; revisa la documentación y cambia lo que plantea mal este motor y sigue un nuevo enfoque».

## Lo que estaba mal planteado

- Lo que se revisaba dependía de qué objetivos escribió el autor a mano. La espada, el tren y el puente revisaban la figura; la pelota, la nave pintada o los tres puntos de luz solo contaban cosas («hay una animación», «hay un material»).
- Nada decía qué es una práctica resuelta: ni el motor, ni el add-on, ni la lección hablaban del mismo resultado.
- La documentación presentaba la revisión de la figura como algo solo de algunas prácticas, y el motor 3.5 como un arreglo de la espada.

## El nuevo enfoque

**Cada práctica trae su ejemplo resuelto en código** (`example.steps`), y de él sale todo: la escena esperada, la revisión, las instrucciones, el ejemplo en Blender y la tarjeta de la lección.

- `engine/amatista_engine/ejemplo/`: `pasos.py` arma la escena esperada y describe cada paso con sus teclas; `revision.py` compara la escena del alumno aspecto por aspecto (figura o silueta, malla, modificadores, materiales, colecciones, luces, cámara, animación, render y archivo), solo en lo que el ejemplo tiene y con exigencia según el nivel.
- Validador `example.matches`: el cargador lo agrega al final de toda práctica con ejemplo («Tu práctica coincide con el ejemplo», peso 15).
- Las 18 prácticas tienen su ejemplo. CI comprueba que cada ejemplo complete su propia práctica y que una escena vacía no coincida (`practicas.py probar`: 95 casos).
- Add-on: «Ver el ejemplo» lo arma en su propia escena («Ejemplo · <título>») sin tocar la del alumno, y «Volver a mi práctica» regresa. La lista «Comparado con el ejemplo» se agrupa por aspecto.
- Plataforma: la lección muestra «El ejemplo resuelto» (pasos, qué compara Amatista y el código), «Ahora en Blender» agrupa la lista por aspecto, y hay órdenes nuevas `ver_ejemplo` y `volver_practica`.
- Arreglos encontrados en el camino: la silueta elegía el piso en vez de la espada (`mejor_malla`), la lista de `figure.recognize` contaba piezas sin rol como faltantes (muñeco de nieve) y la aldea pasó a exigencia `forma`.
- Documentación: nuevo `docs/motor/referencia/14_ejemplo_y_revision.md`; corregidos README, 01, 02, 03, 05, 08, 10, 11 y 13; `09_validadores.md` regenerado (41 validadores).

Sin cambios en Oracle.

## Pruebas

- Motor y add-on (pytest): 296 pruebas. Las 18 prácticas: 95 casos.
- Add-on dentro de Blender 5.0.1: «Ver el ejemplo» en 8 prácticas, con los aspectos aprobados sobre la captura real de Blender, el latido en modo EJEMPLO y las órdenes de la plataforma. Los 18 ejemplos armados en Blender pasan su revisión.
- Backend: pruebas nuevas del ejemplo en la lección y en el enlace.
- Frontend: 194 pruebas de vitest, lint y build.

## Pendiente para el usuario

- Revisar el PR #25 y dar el OK para fusionarlo.
- Probar en tu Blender con ventana: abrir una práctica, pulsar «Ver el ejemplo», mirar la lista «Comparado con el ejemplo» y volver a tu práctica.
- Después del piloto: reinstalar Amatista Motor 3.5 (T-092; sin SQL nuevo).
