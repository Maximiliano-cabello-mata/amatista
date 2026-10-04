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
- **Práctica**: tarjeta con título, barra de progreso, el paso actual con su consejo y los botones **Comprobar**, **Necesito una pista** y **Enviar mi progreso**. Muestra si el progreso está sincronizado, pendiente o guardado sin conexión.
- **Objetivos**: lista de tarjetas con icono por estado (completado, actual, pendiente, bloqueado) y el mensaje de cada validador.
- **Asignar rol**: elige un rol de la práctica y aplícalo a los objetos seleccionados (o quítalo). El rol viaja con el objeto al duplicarlo.

Diálogos: **Bienvenida** (intro de la práctica), **Necesito una pista** (revela el siguiente nivel; avisa cuando ya se vieron todas), **¡Práctica completada!** (mensaje final y autonomía) y el aviso de **herramienta de otro nivel**. La **tarjeta en la vista 3D** (HUD) muestra el paso actual y el porcentaje sin abrir la barra lateral; se apaga en preferencias.

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

*Editar › Preferencias › Complementos › Amatista*: Servidor y Plataforma (vacío = las del paquete descargado), cuenta vinculada, Modo desarrollador, Comprobar mientras trabajo, Enviar mi progreso automáticamente, Tarjeta en la vista 3D, Avisar herramientas de otro nivel. El token se guarda oculto en las preferencias de Blender y se borra con **Desvincular esta computadora**.

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
| `operadores.py`, `desarrollo.py`, `autor.py` | Acciones del modo Alumno y del modo Desarrollador. |
| `interfaz/` | `estilo.py` (colores, iconos, escala), `paneles.py`, `dialogos.py`, `hud.py`. |
| `iconos/` | PNG generados con `addon/herramientas/generar_iconos.py`. |

## Pruebas

- `addon/tests/test_construir.py` (pytest, sin Blender): extensión, paquetes por sistema, índice del repositorio, `.bat` con CRLF, lanzadores ejecutables, bytes reproducibles.
- `addon/tests/en_blender.py`: dentro de Blender sin interfaz. Instala el `.zip` como extensión, registra, abre la práctica de la mesa, construye la mesa con `bpy`, comprueba 100 %, prueba el modo autor y dibuja todos los paneles. En CI corre con `bpy==5.0.1` de PyPI (job `addon-blender`).
