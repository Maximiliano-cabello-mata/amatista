# Bitácora · 11 de octubre de 2026 · Primeros pasos con Amatista y recursos gráficos nuevos

Pedido de Maximiliano (11 oct, 04:03Z): un módulo instructivo (no un asistente) que enseñe cómo funciona toda la plataforma mediante los primeros pasos en Blender y los primeros cursos, y cómo se relaciona el add-on con la plataforma; una conexión real entre la plataforma y el add-on; actualizar los recursos gráficos de las lecciones (tarjetas, teoría, CSS), más interactivo, con recursos nuevos que se intercalen porque se repiten. Que la plataforma y el add-on expliquen qué hacer, cómo funciona el add-on, cómo se conectan y para qué.

## Cómo se hizo

- Se construyó sobre la guía `#/guia` (PR #33), Amatista Taller (PR #32) y las herramientas gráficas (PR #29), sin duplicarlos.
- Un módulo 0 no es válido (el orden de un módulo empieza en 1), así que la introducción es un **curso** propio, `primeros_pasos`, dentro de la ruta Blender y antes de Principiante. Para no mover a quien ya avanzaba, solo es el «nivel en curso» de quien no tiene lecciones hechas en otro nivel.
- La conexión real usa lo que ya existía: el latido de 5 s y las órdenes de la plataforma, con el detalle en `ADDON_ENLACES.DETALLE`. Por eso no hace falta SQL.
- Se cambió solo lo del add-on que toca la bienvenida, la pestaña, la tarjeta y el enlace; el motor de los talleres queda igual.

## Lo nuevo

- **Curso «Primeros pasos con Amatista»**: tu mapa de Amatista, así se vive una lección, el add-on dentro de Blender, cómo se hablan, tus primeros pasos en Blender (en vivo) y el jefe final. Tema «estación» con la guía Bip (original) en la plataforma y en Blender.
- **Add-on 5.1**: diez paradas dentro de Blender que se marcan solas, tarjeta de Bip en la vista 3D, invitación en la pestaña Amatista y en la bienvenida, y el recorrido en cada latido. Desde la lección: empezar, siguiente, anterior y salir.
- **Siete bloques nuevos** (SVG y CSS) e intercalado de 20 de ellos en los 9 módulos de Blender, para que cada lección «explora» tenga algo distinto de tarjetas y pregunta.
- **CSS v3.7**: bloques que entran al hacer scroll, barra de lectura, teoría con hexágonos y acento; apagado en modo ligero y con movimiento reducido.

## Pruebas

- Backend: 392 pruebas (detalle del recorrido, orden y los bloques nuevos); 11 módulos validan sin errores.
- Add-on y motor: 551 pruebas de pytest (6 nuevas del recorrido) y `en_blender.py` en Blender 5.1.0 sin ventana con las 12 comprobaciones nuevas del recorrido. La única falla («Live Validation: 60 %») también sale en `main` con Blender 5.1 y no viene de este cambio; CI usa 5.0.1.
- PWA: 277 pruebas de vitest (20 nuevas), lint y build. Capturas en Chromium a 1280 px y 390 px en `/mnt/project-files/plataforma/2026-10-11_primeros_pasos/`, sin errores en consola.

## Pendiente para el usuario

- Revisar el PR y dar el OK para fusionarlo.
- Probar los primeros pasos en Blender con ventana con la lección abierta (T-109).
- En la VM: actualizar el backend, importar el contenido, publicar la PWA y reinstalar Amatista Motor 5.1 (`docs/despliegue/2026-10-11_primeros_pasos_motor_5_1.md`).
