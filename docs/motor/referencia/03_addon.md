# 03 · El add-on «Amatista» para Blender

Extensión de Blender 4.2+ en [`addon/amatista_blender/`](../../../addon/amatista_blender/). Se abre en **Vista 3D › barra lateral (N) › pestaña Amatista**. Versión actual: la del [`blender_manifest.toml`](../../../addon/amatista_blender/blender_manifest.toml). Licencia GPL-3.0-or-later (usa `bpy`); solo aplica a `addon/`.

## Modos

El selector de modo aparece arriba del panel cuando la cuenta es de profesor o admin, o cuando se activó **Modo desarrollador** en las preferencias.

| Modo | Para quién | Qué muestra |
|---|---|---|
| **Alumno** | todos | Cuenta, práctica abierta, tarjetas de pasos, pistas, roles y envío de progreso. |
| **Desarrollador** (Amatista Author) | profesores, admins, o quien active el modo | Borrador, Tagger (roles y etiquetas), Inspector, Constructor de objetivos, Validación y depurador, Exportar y publicar. **Vista previa como alumno** carga el borrador como si fuera una práctica publicada. Detalle en [06_modo_desarrollador.md](06_modo_desarrollador.md). |

## Paneles del modo Alumno

- **Amatista**: estado de la cuenta (vinculada o no, con el código para conectar), acceso en línea, **Abrir mi lección actual**, **Elegir otra práctica** y **Abrir la plataforma**.
- **Práctica**: título, barra de progreso y el bloque **Ahora** (etapa 2): el paso actual con lo que pasa, el porqué y las instrucciones con teclas; botones **Hazlo conmigo**, **Muéstrame**, **Comprobar** y **¿Cómo lo hago?** (en modo Silencioso, **Necesito una pista** como en la etapa 1) y **Enviar mi progreso**. Muestra si el progreso está sincronizado, pendiente o guardado sin conexión.
- **Asignar rol**: elige un rol de la práctica y aplícalo a los objetos seleccionados (o quítalo). El rol viaja con el objeto al duplicarlo.
- **Todos los pasos** (plegado): la lista de tarjetas con icono por estado (completado, actual, pendiente, bloqueado) y el mensaje de cada validador. En la etapa 1 era el panel principal «Objetivos»; ahora es una consulta.

Diálogos: **Bienvenida** (intro de la práctica), **Así se hace este paso** (porqué, qué pasa, cómo hacerlo con teclas; se abre solo al empezar cada paso en modo Acompañado), **¿Te ayudo con este paso?** (cuando el acompañante ve que el alumno lleva rato), **Necesito una pista** (revela el siguiente nivel), **¡Práctica completada!** (mensaje final y autonomía) y el aviso de **herramienta de otro nivel**.

En la **vista 3D**: la **tarjeta del acompañante** (paso N de M, progreso, qué hacer con teclas dibujadas y avisos que se desvanecen) y la **guía en la escena** (contornos verde/naranja/neón, regla, plano, piezas fantasma y flechas con etiquetas). Detalle en [07_guia_y_acompanamiento.md](07_guia_y_acompanamiento.md).

## Nombre del descargable: Amatista Motor 3.2

Desde la 3.2 el add-on se llama **Amatista Motor** (`name` en `blender_manifest.toml`). La plataforma lo descarga como `Amatista-Motor-3.2-<sistema>.zip`, con la carpeta «Amatista Motor 3.2» (instalador, `amatista-3.2.0.zip` y LEEME). El servidor arma el paquete al vuelo con el código que tiene, así que entrega siempre la versión de su copia del repositorio; `GET /api/addon/v1/estado` devuelve `nombre` y `version_addon`, y la página «Mi Blender» avisa si el servidor entrega una versión vieja.

## Temática por práctica (add-on 3.2)

Cada módulo tiene su mundo, igual que en la plataforma. La fuente es [`practices/blender/temas.json`](../../../practices/blender/temas.json) (schema `amatista.temas/1`), compartida con `frontend/src/components/temas/temas.js`; `construir.py` la empaqueta como `practicas/temas.json` y el catálogo de prácticas la ignora porque no es `amatista.practice/`.

- **Qué tema toca**: `temas.tema_de_practica(id)` busca el prefijo más largo de `practicas` (`blender.bp.m1.tren` → `blender.bp.m1` → **El taller de juguetes**). Lo que no está mapeado (por ejemplo la mesa archivada) usa **La cueva del cristal** (`cristal`). Sin `temas.json` el add-on sigue con un tema de respaldo.
- **Tarjeta de la vista 3D** (`hud.py`): franja con el color de acento del tema, su nombre, la mascota en pixel art (10×10, diseños originales) y la barra de progreso; si la práctica cierra el módulo, el **jefe final** («JEFE: ROBO-TREN REBELDE», y «¡JEFE VENCIDO!» al terminar). Encima, el **globo de la mascota** con el saludo, consejos y datos curiosos que cambian solos cada 12 s (un temporizador ligero pide un redibujado cada 3 s; no evalúa nada). Los avisos llevan la mascota. En modo Silencioso no hay globo. Paneles con esquinas redondeadas, esquina facetada, sombra suave y teclas con canto.
- **Paneles**: en *Practicar*, una tarjeta con el tema, su lema, el jefe final (si toca) y el mensaje de la mascota con **Otro dato** (`amatista.mascota_siguiente`); en *Mi curso*, el nombre del tema junto a cada módulo y el de la siguiente práctica. El diálogo de práctica completada celebra al jefe vencido.
- **Cielo de la vista 3D**: al abrir una práctica, `World.color` toma el color `cielo` del tema (convertido a lineal) y las vistas 3D en Sólido usan el fondo del mundo. El valor anterior se guarda en la escena (`amatista_cielo_previo`; si no había mundo se crea «Amatista · Cielo» y se anota en `amatista_mundo_creado`) y se restaura al cerrar la práctica o al desactivar el add-on. No se agregan ni quitan objetos (los validadores los cuentan) y la foto del motor no incluye el mundo: el tema no cambia ninguna evaluación.
- **Voz de la mascota**: el aviso «Escena lista» y el diálogo final hablan con la mascota del tema («Tuerca: Listo: …»).

## Cuándo evalúa

- Cada cambio en objetos, mallas, materiales o colecciones marca la escena como «sucia»; un temporizador la reevalúa cuando lleva 0.4 s sin cambios (si **Comprobar mientras trabajo** está activo).
- Al guardar y al abrir un archivo también reevalúa.
- `file.saved` cuenta el archivo como guardado si no hubo cambios del alumno desde el último guardado, aunque las propiedades internas de Amatista hayan marcado el archivo como modificado.

## Red y sin conexión

- Toda llamada corre en un hilo con tiempo límite; el resultado vuelve a Blender con `bpy.app.timers`. Blender nunca se congela esperando a la red.
- Respeta **Permitir acceso en línea** de Blender (`bpy.app.online_access`); si está apagado, el panel lo dice y ofrece activarlo.
- Los intentos que no se pueden enviar se guardan en una cola en la carpeta de datos de la extensión y se envían al volver la conexión (o con **Enviar mi progreso**).
- Con **Enviar mi progreso automáticamente** activo, el intento sale unos segundos después del último cambio.

## Preferencias

*Editar › Preferencias › Complementos › Amatista*: Servidor y Plataforma (vacío = las del paquete descargado), cuenta vinculada, Modo desarrollador, Comprobar mientras trabajo, Enviar mi progreso automáticamente, Tarjeta en la vista 3D, Avisar herramientas de otro nivel y la caja **Acompañamiento** (Acompañado / Solo tarjeta / Silencioso, Mostrar en la vista 3D, Explicarme cada paso nuevo, Ofrecer ayuda tras N cambios o S segundos). El token se guarda oculto en las preferencias de Blender y se borra con **Desvincular esta computadora**.

## Estructura

| Archivo | Qué hace |
|---|---|
| `__init__.py` | Registro y orden de los módulos. |
| `_motor.py` | Carga el motor: la copia incluida en el `.zip` o, en desarrollo, `engine/` del repositorio. |
| `config.json` | Servidor, plataforma y canal. El constructor lo reescribe con las URL de la plataforma que generó el paquete. |
| `ajustes.py` | Preferencias y `es_desarrollador()`. |
| `estado.py` | Propiedades de escena y ventana (práctica abierta, borrador del autor, modo). |
| `cuenta.py`, `red.py` | Vínculo, sesión, cliente HTTP y cola. |
| `practicas.py` | Captura, evaluación, pistas, intentos y manejadores de Blender. |
| `temas.py` | *(3.2)* Temática por módulo leída de `temas.json`: tema de una práctica, colores, mensajes de la mascota y su dibujo en pixel art. Python puro (sin `bpy`). |
| `escenarios.py` | Escenas de inicio de las prácticas y, desde la 3.2, el cielo del tema (`aplicar_ambiente` / `restaurar_ambiente`). |
| `guia.py` | *(etapa 2)* Guía y acompañante de la sesión: avisos, diálogos automáticos, «Hazlo conmigo» y registro de ayudas. |
| `operadores.py`, `desarrollo.py`, `autor.py` | Acciones del modo Alumno y del modo Desarrollador. |
| `interfaz/` | `estilo.py` (colores, iconos, escala, teclas), `paneles.py`, `dialogos.py`, `hud.py` (tarjeta del acompañante), `visor3d.py` (guía dibujada en la escena). |
| `iconos/` | PNG generados con `addon/herramientas/generar_iconos.py`. |

## Pruebas

- `addon/tests/test_construir.py` (pytest, sin Blender): extensión, paquetes por sistema, índice del repositorio, `.bat` con CRLF, lanzadores ejecutables, bytes reproducibles.
- `addon/tests/test_temas.py` (pytest, sin Blender): carga de `temas.json` (repositorio y paquete), tema por prefijo y de respaldo, colores, rotación de mensajes de la mascota y dibujos 10×10.
- `addon/tests/en_blender.py`: dentro de Blender sin interfaz. Activa el add-on desde la carpeta `addon/` con `addon_utils.enable` (no instala el `.zip`; el `.zip` lo prueban `addon/tests/` con pytest), registra, abre la práctica de la mesa, construye la mesa con `bpy`, comprueba 100 %, prueba el modo autor y dibuja todos los paneles. Etapa 2: agrega un cubo, asigna el rol y escala con «Hazlo conmigo», comprueba las ayudas registradas, los avisos y dibuja la guía 3D con un `gpu` simulado. 3.2: el tema del tren, el cielo que se pinta al abrir y se restaura al cerrar (también sin mundo), que el mundo no entra en la foto y que paneles y tarjeta se dibujan con un tema activo. En CI corre con `bpy==5.0.1` de PyPI (job `addon-blender`).
