# Bitácora · Amatista Motor 6 y Blender Amatista (30 oct 2026)

**Pedido (Maximiliano, después de publicar el 5.4):** una actualización mayor del add-on. Varias versiones instaladas «se cruzan entre ellas», las tarjetas se enciman, no hay una ruta ni una conexión clara con la plataforma, el motor acepta cosas sin sentido y «Mira cómo lo hace» hace cosas de otras prácticas. Que sea autosanable, que la plataforma guíe («de nada me sirve que avancen en Blender exclusivamente»), tarjetas que sean una referencia y no un estorbo, herramientas que brillen sin regalar la respuesta, la plataforma de acuerdo con la guía de aprendizaje y un «Blender Amatista» que se sienta una sola cosa desde que se descarga. Versión 6.

**Decisión del usuario (tarjeta, 02:13 UTC):** «Blender Amatista sin recompilar»: plantilla de aplicación en lugar de un fork de Blender en C/C++.

**Decisiones por defecto (reversibles):** la copia que gana es la de versión mayor (a igual versión, la extensión) y las demás se apagan, no se borran; la exploración prueba las dos primeras habilidades del taller con «Mira» y un «Hazlo conmigo»; con la cuenta conectada Blender no deja elegir módulos y sin cuenta sigue funcionando solo; la tarjeta se achica a los 5 s sin novedades; el brillo señala dónde está la herramienta, nunca el valor; holguras del molde más estrictas solo en los niveles 1 a 3; los colores de Blender Amatista se devuelven al salir de la plantilla. Sin SQL.

## Qué se hizo (rama `claude/project-thread-nmryzr`)

1. **Motor** (T-137, T-138): `taller/etapas.py` (la etapa de la lección), `taller/demo.py › pasos_de_actividad` (la demostración con las piezas de la actividad y el gesto de la habilidad) y `taller/molde.py` (holguras, firmas de vértices, `revuelto`).
2. **Add-on 6.0** (T-137 a T-139): `saneamiento.py`, `interfaz/turno.py`, `taller/vista/brillo.py`, la tarjeta compacta, la etapa y «Volver a la plataforma» en `taller/sesion.py`, `blender_amatista.py` y `plantilla_amatista/` (pantalla de inicio generada con `addon/herramientas/generar_splash.py`), el enlace que abre Blender Amatista y el acceso directo; el instalador apaga el add-on clásico.
3. **Servidor y plataforma** (T-138): la orden `taller_abrir` y el latido llevan la etapa; el validador exige exploración antes que práctica; la lección de exploración se completa al probar sus habilidades; los 9 módulos de Blender con la exploración y el taller en la práctica.
4. **Docs y tablero**: `docs/motor/referencia/19_motor_6.md`, la ruta de aprendizaje y los cursos al día, guía `docs/despliegue/2026-10-30_motor_6.md`, T-137 a T-141.

## Causas encontradas

- **Copias cruzadas**: el add-on clásico y la extensión encendidos a la vez registran cada uno sus manejadores, menús y temporizadores.
- **Tarjetas encimadas**: la del recorrido y la del taller se dibujaban cada una por su cuenta.
- **«Mira» ajeno**: se reproducía la demostración genérica de la habilidad («Caja» y «Lata» para una actividad que pide un cono).
- **Acepta sin sentido**: holgura de 1,8 veces en el nivel 1, mallas desconocidas que llenaban cualquier pieza y moldes llenados con montones de piezas.
- **Sin ruta**: la exploración (3 a 6 min según la guía) abría el taller entero y solo se completaba al abrirse el proyecto; Blender ofrecía «Otros módulos».

## Pruebas

Motor 525 y add-on 66, add-on dentro de Blender 5.0.1 sin ventana sin fallas (con la sección «Motor 6»: etapa de punta a punta, ruta con cuenta, tarjeta compacta, brillo, molde revuelto, plantilla y colores, autosanación), backend 415, vitest 336, lint y build.

**No probado (no se puede en la nube):** cómo se ven la pantalla de inicio, los colores, el brillo y la tarjeta compacta con ventana, y el acceso directo en Windows, macOS y Linux (T-139); dos versiones instaladas a la vez en una computadora real (T-140).

## Pendiente del usuario

Confirmar la fusión del PR. Después, publicar según `docs/despliegue/2026-10-30_motor_6.md` (T-141), instalar el 6.0 y abrir «Blender Amatista».
