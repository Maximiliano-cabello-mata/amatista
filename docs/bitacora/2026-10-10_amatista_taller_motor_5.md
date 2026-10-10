# Bitácora · 10 de octubre de 2026 · Amatista Taller (motor 5, add-on 5.0)

Pedido de Maximiliano (10 oct, 16:44Z): con lo aprendido y los datos analizados en la investigación «Un add-on que enseñe» (PR #31), crear una versión del add-on que sea una reestructuración completa, en sintonía con la plataforma, y cambiar también cómo se desarrollan las lecciones en la interfaz. «Todo hazlo»: la fase 0 de medir antes de cambiar quedó reemplazada por construirlo entero.

## Qué cambió

- **La unidad es la habilidad, no la práctica.** 33 habilidades con 62 variaciones de 1 a 3 minutos y 9 talleres, uno por módulo (`practices/blender/habilidades.json`, `amatista.skill/1`). Cada habilidad pasa por **Mira → Hazlo conmigo → Hazlo tú → Úsalo → Recuérdalo**.
- **Un modelo del alumno** (BKT con olvido, el mismo que se ajustó con ASSISTments y Cognitive Tutor en la investigación) decide qué toca. La ayuda cuenta: acertar después de ver las teclas casi no sube el dominio. Lo que no se repasa se olvida, con repasos de un minuto a 1, 3, 7, 14 y 30 días que nunca bloquean.
- **En Blender**: la tarjeta en la vista 3D con botones que se tocan, «Mira» con las teclas en pantalla, el **molde** translúcido que se pinta pieza por pieza y habla sin números, la escalera de **pistas con freno** (qué falta, con qué, cómo, mírame), «Demuéstralo» para saltar lo que ya se sabe, «Saltar», un panel N mínimo y **Mi isla**. Cada actividad empieza en una escena limpia; el proyecto (el tren, la espada…) sigue siendo la práctica de siempre y se abre como «Úsalo».
- **En la plataforma**: la lección de Blender de cada módulo ahora es el **taller**: el ciclo, lo que sigue, las habilidades con su fase y, con Blender enlazado, lo que el alumno está haciendo en vivo con un máximo de tres botones (Continuar, Pista, Mírame, Pausa). La lección del proyecto muestra su pieza de la isla y el reto; la página del curso muestra **Tu isla**. Las prácticas «explora» se archivaron.
- **En el servidor**: el modelo se vuelve a calcular con el mismo motor y se revisa la foto de la escena de cada intento, así que lo que queda en Oracle lo decide el servidor. Oracle **012** (siguiente libre 013). Sin 012 nada se rompe: el add-on guarda el avance y lo envía después.

## Decisiones tomadas por defecto

- El molde solo aparece en los niveles 1 y 2 (la investigación advierte que más arriba vuelve a ser copia mecánica).
- Las pestañas del motor 4 se conservan para el modo desarrollador y la vista previa; el alumno ve solo el taller.
- La versión del add-on pasa a 5.0.0 y la del motor a 5.0.0: cambia la forma de aprender, no solo la interfaz.

## Pruebas

- Backend: 385. Motor y add-on (pytest): 545. Tablero: 8. Contenido: 10 módulos sin errores.
- Add-on dentro de Blender 5.0.1 sin ventana: RESULTADO OK (el taller completo, del primer «Mira» al tren y Mi isla).
- PWA: 237 pruebas de vitest, lint y build.
- De punta a punta con el backend real en SQLite, la PWA en el navegador y un Blender simulado por el enlace en vivo: la lección mostró la actividad, la pieza, la pista y los botones en vivo, y el curso mostró Tu isla (escritorio y 390 px).

## Pendiente

- **El usuario**: probar en Blender con ventana (T-102) los clics de la tarjeta, el dibujo del molde y el tiempo de «Mira», y dar el OK para fusionar. No se fusiona sin ese OK.
- Después de fusionar y probar: ejecutar 012 en Oracle e instalar el add-on 5.0 (T-101, `docs/despliegue/2026-10-10_amatista_taller_motor_5.md`).
- Reajustar los parámetros del modelo del alumno con los intentos reales de Amatista cuando haya suficientes.
