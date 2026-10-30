# Bitácora · Refinamiento de la plataforma y Amatista Motor 5.4 (30 oct 2026)

**Pedido (Maximiliano, 00:24 UTC):** mantenimiento y refinamiento total. Al practicar estos días, el motor de Blender «no es nada intuitivo»; «Abrir Blender» desde la plataforma no lo abre; el add-on confunde a un principiante. Que Amatista se sienta parte de Blender, no una tarjeta ni un add-on cualquiera. En la plataforma: mejorar e investigar gráficos, agregar dinámicas nuevas, pulir lo que hay; botones más claros y grandes (por ejemplo, al elegir básico o intermedio), navegación más intuitiva y un refinamiento visual completo.

**Decisiones por defecto (reversibles):** el arreglo de «Abrir Blender» es un enlace del sistema (`amatista://`) y no un programa residente; el espacio de trabajo «Amatista» se activa solo, con opción para apagarlo; el refinamiento visual sigue «Facetas» (mismos colores y low poly) y cambia la forma de los botones, no la paleta; las dinámicas nuevas se eligieron por lo que prepara la práctica en Blender (teclas, medidas, revisar); sin SQL.

## Qué se hizo (un commit por tema, rama `claude/project-thread-nmryzr`)

1. **Add-on 5.4** (T-132, T-134): `protocolo.py` registra `amatista://` (Windows, macOS, Linux con Flatpak y Snap) desde el instalador y al arrancar; `integracion.py` pone el menú Amatista arriba, el botón Amatista en la cabecera de la vista 3D (despliega el taller sin la tecla N), la actividad en la barra de estado y el espacio de trabajo «Amatista».
2. **Plataforma** (T-132, T-135): la lección abre Blender con el enlace si ningún Blender abierto recibió la orden, espera a verlo y, si no se abre, explica cómo arreglarlo; botones Facetas 4.1 en lecciones, camino, curso, guía, panel y barra; tarjetas grandes para elegir nivel; etiquetas más legibles; sin «pulsa N».
3. **Dinámicas v4.3** (T-135): Entrena tus teclas, Ajusta el valor y Encuentra el error, validadas por el backend y puestas en cuatro lecciones (Blender Principiante 1 y 3, Intermedio 1, A-Frame 2).
4. **Docs y tablero**: `docs/plataforma/14_refinamiento_y_dinamicas.md` (hallazgos, investigación y reglas de botones), `docs/motor/referencia/18_amatista_dentro_de_blender.md`, guía de despliegue y T-132 a T-136.

## Causa de «Abrir Blender no lo abre»

La orden «abrir esta práctica» solo llegaba a un Blender **ya abierto** (el latido del enlace en vivo la recoge). Con Blender cerrado, el servidor respondía `entregada: false` y la lección decía «Tu Blender no respondió». Nadie arrancaba Blender.

## Pruebas

Backend 413, tablero + motor + add-on 575, add-on dentro de Blender 5.0.1 sin ventana sin fallas (con «Amatista dentro de Blender»), vitest 332, lint y build, contenido 15 archivos sin errores. En Chromium: elegir nivel, camino, página Blender y las tres dinámicas resueltas; sin desbordes a 390 px en portada, curso, Blender, las cuatro lecciones y Mi panel.

**No probado (no se puede en la nube):** que el navegador abra Blender en Windows, macOS y Linux reales (T-133) y cómo se ven el botón, el menú y el espacio con ventana (T-134).

## Pendiente del usuario

Confirmar la fusión del PR. Después, publicar según `docs/despliegue/2026-10-30_refinamiento_motor_5_4.md` (T-136), reinstalar el add-on 5.4 y probar «Abrir Blender ahora» en la página Blender.
