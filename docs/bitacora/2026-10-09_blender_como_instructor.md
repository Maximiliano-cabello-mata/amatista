# Bitácora · 9 de octubre de 2026 (tarde) · Blender como instructor (Amatista Motor 3.5)

Pedido de Maximiliano (9 oct, después de fusionar el PR #24):

> «se sigue teniendo muy clara esa desconexión entre plataforma y el addon; las prácticas como la de la espada simplemente no tienen sentido; deben tener un sentido claro y un propósito y que se haga lo que se propone en la plataforma, que siga una ruta clara; el addon debe tener una conexión más clara con la plataforma y mejor implementada; por ejemplo, cuando quiero iniciar una nueva práctica no se borra lo de la anterior; pensemos en el addon como instructor, no un sistema que impone sino que te guía y te corrige y que señale cómo puede hacer que tu práctica tenga los detalles o como está planteado en la plataforma; que el addon pueda identificar si la figura tiene coincidencia con lo que espera la práctica; la plataforma como PWA puede manipular en su totalidad Blender.»

## Lo que se encontró

1. **La práctica anterior no se borraba.** El fallo se reprodujo en `addon/tests/en_blender.py`: al abrir la espada después del tren, en la escena estaban la locomotora y hasta la mesa de la práctica archivada. `practicas.activar` reutilizaba la escena abierta y solo la vaciaba la primera vez (`escenarios.preparar`).
2. **La espada no tenía propósito.** Aceptaba «una espada o una taza», pedía asignar a mano el rol «Modelo» y sus pasos solo contaban caras y vértices (18 caras, 20 vértices). Cualquier barra larga con un corte pasaba. La lección de la plataforma enseña otra cosa: extruir la hoja con E, separar la guarda con Ctrl + R y limpiar con M.
3. **El motor no podía reconocer una figura hecha en una sola malla.** `figure.recognize` compara piezas separadas, y de una malla solo se veía la caja envolvente.
4. **La plataforma veía el progreso, pero no lo que el instructor decía en Blender**, y solo podía abrir prácticas y enfocar.

## Lo que se hizo

- **Una escena por práctica** (`practicas._escena_para`). Abrir otra práctica cambia a su escena o crea una vacía, y nada se borra: lo anterior queda en su escena y vuelve al reabrirla. Las prácticas que continúan a otra (`starter.from_practice`: pinta tu nave, el diorama de tu aldea) se quedan en la misma escena. Al diorama se le agregó `from_practice: blender.bi.m2.aldea`. El botón **De nuevo** abre la práctica en una escena limpia y deja la anterior como «(anterior)».
- **La silueta** (`engine/amatista_engine/figures/silueta.py`, validador `figure.silhouette`). La malla se corta en rebanadas a lo largo y se compara, parte por parte, con el modelo: Pomo, Mango, Guarda, Hoja y Punta. La guarda que no sobresale y la punta que no se afila fallan en todos los niveles. Las medidas se exigen según el nivel, y un detalle que falta (el pomo) se sugiere sin bloquear. Cada problema dice la tecla y el eje que lo arreglan.
- **La espada, rehecha** (versión 3). Los pasos son: empieza con un cubo, alárgalo con E, forja la silueta, que siga siendo low-poly y guárdala. Ya no hay taza ni rol «Modelo», y tiene una píldora nueva para afilar la punta. Los objetivos pueden traer su propio `fix` («Hazlo conmigo» entra a Modo Edición).
- **La lista del instructor** (`details.checklist` en `figure.silhouette` y `figure.recognize`): el panel **Tu figura** en Blender y la tarjeta **Ahora en Blender** en la lección.
- **La plataforma maneja la práctica.** El latido lleva lo que dice el instructor, y hay órdenes nuevas: comprobar, pista, «Hazlo conmigo», guardar y empezar de nuevo (este último con confirmación). Sin cambios en Oracle.

Referencia: `docs/motor/referencia/13_instructor_y_silueta.md`.

## Pruebas

- Motor y tablero: 233 pruebas (16 nuevas de la silueta), y las 18 prácticas pasan sus `pruebas.json` (la espada, 8 casos nuevos).
- Backend: 330 pruebas (4 nuevas del enlace).
- Add-on dentro de Blender 5.0.1: todas las revisiones en verde, con el fallo de la escena reproducido y arreglado, la silueta medida en Blender (también en Modo Edición) y las órdenes de la plataforma.
- Frontend: 192 pruebas de vitest, lint y build.

## Pendiente para el usuario

- Revisar y fusionar el PR (no se fusiona sin tu OK).
- Después del piloto, con el despliegue de la fase 1: reinstalar **Amatista Motor 3.5** (no hay SQL nuevo; 010 sigue pendiente, T-087).
- Probar en tu Blender con ventana: abrir el tren, luego la espada (debe empezar vacía), forjar la espada desde un cubo y mirar la lista «Tu figura» en Blender y en la lección.
- La nave (módulo 3) todavía cuenta caras en «Alas y cabina» y pide el rol a mano. Queda en el tablero (T-091) para darle el mismo trato.
