# 12 · La plataforma maneja Blender (motor 3.4)

Antes la plataforma y Blender se hablaban solo al vincular la cuenta y al enviar un intento: eran dos programas separados. El estudio completo (debilidades, cómo lo resuelven otras plataformas y el plan) está en [`especificaciones/2026-10-09_plataforma_y_blender_integrados.md`](../especificaciones/2026-10-09_plataforma_y_blender_integrados.md).

## Enlace en vivo

```
Blender (add-on)                                  Plataforma
   │  POST /api/addon/v1/enlace cada 5 s              │
   │  {practica_id, paso, progreso, enfocado,         │
   │   version_addon, version_blender, orden_hecha}   │
   │ ───────────────────────────────────────────────► │  ADDON_ENLACES (una fila por sesión de Blender)
   │ ◄─────────────────────────────────────────────── │  {orden, ajustes, intervalo}
   │                                                  │
   │                       GET /api/addon/v1/enlace   │ ◄── la lección: «Tu Blender está en esta práctica (40 %)»
   │                       POST /api/addon/v1/ordenes │ ◄── «Abrir en Blender», «Enfocar», «Ver todo»
   │                       PUT /api/addon/v1/ajustes  │ ◄── Mi Blender › «Cómo se ve Blender»
```

- **Órdenes** (`abrir_practica`, `enfocar`, `ver_todo`, `actualizar`; desde el motor 3.5 también `comprobar`, `pista`, `hazlo_conmigo`, `guardar` y `reiniciar`, ver [13_instructor_y_silueta.md](13_instructor_y_silueta.md)): se guardan en la fila del Blender abierto y se repiten en cada latido hasta que el add-on manda `orden_hecha` con su id. Un latido perdido no pierde la orden; una orden repetida se cumple una sola vez. Caducan a los 10 minutos.
- **Abrir en Blender** desde la lección deja la orden si hay un Blender abierto y responde `abierta_en_blender: true`: la práctica aparece sola en Blender, en la pestaña Amatista › Practicar.
- **Ajustes** (`ADDON_AJUSTES`): `enfoque` (`auto`, `siempre`, `nunca`), `acompanamiento` (`acompanado`, `tarjeta`, `silencioso`), `avisos_herramientas` y `tarjeta_3d`. La plataforma manda sobre las preferencias de Blender; solo la plataforma los cambia (el add-on recibe 403).
- **En línea** = último latido hace menos de 25 s. Las filas de más de 2 días se borran al consultar.
- **Sin 010** el servidor responde `enlace: false` y todo sigue como antes (el add-on late cada 60 s, la lección no muestra el estado y «Mi Blender» explica que las opciones se eligen en Blender).

Código: [`backend/api/enlace.py`](../../../backend/api/enlace.py), [`addon/amatista_blender/enlace.py`](../../../addon/amatista_blender/enlace.py), [`frontend/src/blender/logica.js`](../../../frontend/src/blender/logica.js) (`estadoBlender`). Oracle: [`backend/sql/010_enlace_blender.sql`](../../../backend/sql/010_enlace_blender.sql).

## Modo enfocado

Blender completo abruma a quien empieza. Como las «ruedas de entrenamiento» de los programas de diseño y el enmascarado de los tutoriales de Unity, el modo enfocado ([`enfoque.py`](../../../addon/amatista_blender/enfoque.py)) esconde lo que la práctica no usa:

- Se ocultan la barra de herramientas (T) y la de ajustes de la herramienta; la barra lateral queda abierta en la pestaña Amatista.
- La cabecera de la vista 3D muestra solo **Vista** y **Agregar** (y **Seleccionar** en modo edición), más «Ver todo Blender».
- **Agregar** (Shift+A) muestra solo las piezas del modelo de referencia (en el tren: cubo y cilindro), y luz o cámara si la práctica las usa.
- Por defecto (`auto`) se enfoca en los niveles 1 y 2.

Nada se borra: lo que había en cada vista se guarda en el propio Screen (propiedad `amatista_enfoque`), así que «Ver todo Blender», cerrar la práctica, abrir otro `.blend` o desinstalar el add-on lo devuelven como estaba. Si el dibujo enfocado de un menú falla, Blender dibuja su menú normal.

## Tus herramientas

Panel nuevo en Practicar ([`interfaz/herramientas.py`](../../../addon/amatista_blender/interfaz/herramientas.py)): las herramientas de la práctica (`tools.allowed`), con las del paso actual primero y marcadas. Cada una tiene:

- **Usar** (▶): la arranca como si el alumno pulsara su tecla (herramienta activa, operador, menú, panel o pestaña de Propiedades). Si necesita un objeto seleccionado, lo dice.
- **¿Cómo se usa?** (?): diálogo con la descripción, las teclas dibujadas, los pasos numerados, el error típico y «Probar ahora».

Los textos viven en el catálogo del motor ([`tools/catalogo.json`](../../../engine/amatista_engine/tools/catalogo.json): `keys`, `howto`, `mistake`, `action`); `ToolRegistry.for_step` decide cuáles usa el paso por las teclas de la guía y el texto del consejo. Toda herramienta que una práctica permite debe tener `howto`, `mistake` y `action` ([`engine/tests/test_herramientas_enfoque.py`](../../../engine/tests/test_herramientas_enfoque.py)).

## Pruebas

- `backend/tests/test_enlace.py` (11 casos, incluido el servidor sin 010).
- `engine/tests/test_herramientas_enfoque.py`.
- `addon/tests/en_blender.py` › `probar_motor_34`: enfoque al abrir el tren, menús filtrados y devueltos, «Usar», órdenes de la plataforma, ajustes de «Mi Blender», tren sin roles reconocido y desregistro limpio.
- `frontend/src/blender/logica.test.js` › «enlace en vivo con Blender».
