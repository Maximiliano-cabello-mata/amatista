# 17 · Primeros pasos en Blender (add-on 5.1)

> **Add-on 5.2 (11 oct, T-112):** las diez paradas pasan a **«Conoce Amatista Motor»**, tres prácticas que explican todo el add-on (`pestana`, `vista`, `taller`), y se empiezan desde la página Blender de la plataforma en vez de una lección. Lo vigente: `docs/plataforma/11_recorrido_y_fusion.md`. Este documento queda como historia del 5.1.

El add-on 5.1 enseña Blender y Amatista **dentro de Blender** antes del primer taller, y lo hace conectado con la lección «Tus primeros pasos en Blender» del curso «Primeros pasos con Amatista» (`docs/plataforma/10_primeros_pasos_y_recursos.md`).

El motor de los talleres (Amatista Taller, motor 5) **no cambia**: el recorrido es una pieza aparte que solo toca la bienvenida, la pestaña Amatista, la tarjeta de la vista 3D y el enlace.

## Archivos

| Archivo | Qué hace |
|---|---|
| `addon/amatista_blender/recorrido_pasos.py` | Las 10 paradas y lo que viaja a la plataforma. Sin `bpy` (pytest: `addon/tests/test_recorrido.py`). |
| `addon/amatista_blender/recorrido.py` | La escena, las comprobaciones, el operador `amatista.recorrido`, el panel y el vigilante (cada 0,4 s). |
| `interfaz/hud.py` | La tarjeta de Bip en la vista 3D mientras dura el recorrido (tema `estacion`). |
| `interfaz/paneles.py` | La invitación o la parada de ahora, arriba de la pestaña Amatista (solo modo alumno). |
| `interfaz/dialogos.py` | La bienvenida ofrece «Empezar los primeros pasos (5 min)». |
| `enlace.py` | Cada latido lleva `detalle.recorrido`; cumple la orden `recorrido`. |

## Las paradas

| # | Parada | Se marca sola cuando… |
|---|---|---|
| 1 | Hola, soy Amatista | (explica; «Siguiente») |
| 2 | Tu pestaña Amatista | la barra lateral (N) está abierta |
| 3 | Conecta tu cuenta | hay cuenta vinculada (opcional: se puede seguir sin ella) |
| 4 | Mira alrededor | la vista giró más de unos 20° |
| 5 | Elige el cubo | el cubo de práctica está elegido y activo |
| 6 | Muévelo | el cubo se movió más de 0,3 m |
| 7 | La tarjeta de la vista 3D | (explica) |
| 8 | Si te atoras | (explica las pistas y «Mírame») |
| 9 | Tu Blender y la plataforma, en vivo | (explica el latido y las órdenes) |
| 10 | ¡Listo para tu primer taller! | «Terminar» |

Al cumplir una parada aparece «¡Eso es!» y a los 1,4 s pasa sola a la siguiente. No se puede avanzar una parada que se comprueba sin hacerla (salvo la cuenta).

El recorrido usa su propia escena, «Amatista · Primeros pasos», con un cubo; al terminar o salir, Blender vuelve a la escena que tenía. Terminar (o «Ya lo conozco») guarda `recorrido_hecho` en las preferencias para no volver a ofrecerlo; desde la lección se puede repetir.

## Lo que ve la plataforma

`detalle.recorrido` (modelo `RecorridoVivo` en `backend/api/enlace.py`): `activo`, `hecho`, `paso`, `total`, `titulo`, `texto`, `hacer`, `teclas` y `pasos: [{titulo, ok}]`. Siempre va en el latido, así la plataforma sabe que el add-on es 5.1 o más nuevo. El servidor lo guarda en `ADDON_ENLACES.DETALLE` (Oracle 010/011): **no hace falta SQL nuevo**.

Órdenes desde la lección: `{"tipo": "recorrido", "accion": "empezar" | "siguiente" | "anterior" | "salir"}`. «Siguiente» en la última parada lo termina.

## Pruebas

- `pytest addon/tests/test_recorrido.py`: paradas, límites del servidor, avance y estado público.
- `python addon/tests/en_blender.py` › `probar_recorrido`: empezar con el operador, la escena y el cubo, elegir y mover que se comprueban solos, terminar y el latido.
- Pendiente: probarlo en Blender con ventana (orbitar y abrir la barra N solo se comprueban con una ventana real).
