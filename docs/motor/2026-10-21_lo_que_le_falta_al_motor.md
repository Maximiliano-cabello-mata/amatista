# Lo que le falta al motor de Blender (revisión del 21 de octubre de 2026)

Pedido del creador: «al motor de Blender aún le falta algo; no sabría describir qué, tal vez lo puedas identificar tú». Esta revisión mira el motor (`engine/amatista_engine/`, ~32 000 líneas con el add-on), el add-on (`addon/amatista_blender/`, 5.2.0), las prácticas (`practices/blender/`), las lecciones y el tablero. No se probó Blender con ventana: lo que sigue sale del código, de las pruebas y de lo que el tablero marca como pendiente.

## Resumen en una línea

El motor está bien construido por dentro, pero **nunca se ha usado de verdad**: casi todo lo que el alumno siente (la tarjeta, el molde, las pistas, el ritmo) no se ha probado con una persona en Blender con ventana, y encima conviven cuatro generaciones de interfaz. Lo que «falta» es sobre todo **validación con alumnos y una sola forma de hacer las cosas**, no más funciones.

## Hallazgos, de más a menos importante

### 1. Ninguna práctica se ha comprobado con una persona en Blender con ventana

- T-102 (Amatista Taller) y T-113 («Conoce Amatista Motor») siguen pendientes. Motor 4.0 y 5.0 se fusionaron **antes** de esa prueba (lo dice la bitácora del 10 de octubre).
- Las **45 lecciones** de Blender tienen `ficha.blender.verificadaEn: null`: ninguna dice en qué versión de Blender se comprobó.
- Las pruebas automáticas (553 de motor y add-on, `en_blender.py` sin ventana) prueban la lógica, no la experiencia: no ven si la tarjeta tapa la vista, si el molde se dibuja, si «Mira» va demasiado rápido o si un clic cae fuera del botón.

**Qué hacer:** una sesión grabada de 30 minutos con un alumno que nunca abrió Blender, haciendo el módulo 1 de Principiante. Anotar cada duda y cada lugar donde se atasca. Esa lista vale más que cualquier función nueva. Después, poner `verificadaEn` en cada lección probada.

### 2. Cuatro generaciones de interfaz conviven en el add-on

En `addon/amatista_blender/` siguen vivas la guía paso a paso (motor 2, `guia.py`), la misión con su tarjeta (motor 4, `mision.py`, con la vista `_clasico`), el modo enfoque (`enfoque.py`), el recorrido (`recorrido.py`) y el Taller (motor 5, `taller/`). Cada capa tuvo sentido en su momento, pero para el alumno significa que la misma acción («qué hago ahora») puede aparecer en lugares distintos según la práctica.

**Qué hacer:** decidir que el **Taller** es la única forma de practicar y migrar a él lo que todavía usa la guía o la misión; dejar lo demás solo para el modo desarrollador. Menos paneles, un solo lugar para «lo que sigue».

### 3. Los nombres de los menús no siguen el idioma de Blender

Las instrucciones nombran menús en español («Agregar › Malla», «Agregar › Bisel»), pero el add-on no lee el idioma de la interfaz de Blender (`bpy.context.preferences.view.language`), y Blender se instala en inglés por defecto. Un alumno con Blender en inglés lee «Agregar» y en pantalla ve «Add». Los atajos (Shift + A, G, R, S) sí funcionan igual en cualquier idioma.

**Qué hacer:** que el add-on detecte el idioma y muestre el nombre del menú tal como aparece en pantalla (o los dos: «Agregar (Add) › Malla (Mesh)»), y que las lecciones de la plataforma usen la misma regla.

### 4. El motor ya es casi multiplataforma, y no se está aprovechando

Solo un archivo importa `bpy`: `engine/amatista_engine/blender/adapter.py`. Todo lo demás (validadores, reconocimiento de figuras, el modelo del alumno del Taller, pistas, repaso, la revisión del servidor) trabaja con la «foto» de la escena (`snapshot.py`, `SceneState`). Eso significa que **un adaptador para Maya (`maya.cmds`) o para 3ds Max (`pymxs`) que produzca la misma foto reutilizaría el 90 % del motor**, incluida la evaluación en el servidor.

**Qué hacer:** cuando llegue Maya o 3ds Max, empezar por ese adaptador y no por un motor nuevo. Vale la pena documentar ya el contrato de la foto como «formato de escena de Amatista» independiente de Blender.

### 5. Huecos del plan de estudios frente a los validadores

- No hay validadores de **UV ni de texturas** (ningún archivo del motor menciona `uv_layers`): por eso el nivel Avanzado («UV y texturas») sigue bloqueado.
- La animación se comprueba con fotogramas clave (`an` en la foto), pero no hay nada de **rigging** ni de curvas de animación más allá de valores por fotograma.
- No hay una práctica que **exporte a glTF/GLB**, que es justo el puente con el curso de A-Frame (módulo 3, «De tu programa 3D a la web»). Un validador «el archivo .glb existe, pesa menos de X y tiene Y arriba» uniría los dos cursos.

### 6. Seis prácticas «explora» sin imagen de referencia

Ya anotado el 5 de octubre y todavía abierto: intermedio m2–m3 y principiante-intermedio m1–m3. Esas prácticas no tienen el «así se debe ver», que es lo que más orienta al alumno principiante. (Pasaron a `practices/archivo/` con el Taller, pero el criterio sigue valiendo para sus equivalentes.)

### 7. La conexión depende de un backend en HTTP

El enlace en vivo plataforma ↔ Blender va contra la API de producción, que sigue en HTTP (riesgo P-01 de la auditoría). Mientras sea así, el código de vinculación y el latido viajan sin cifrar.

## Lo que está bien y conviene no tocar

- Separación motor / adaptador / add-on: limpia y probada.
- El servidor vuelve a evaluar cada práctica con el mismo motor: el progreso no lo decide el cliente.
- Tolerancia por nivel (medidas indulgentes para principiantes), pistas con freno y el modelo del alumno por habilidad: son ideas sólidas de enseñanza; lo que falta es verlas funcionar con personas.

## Tareas propuestas en el tablero

- **T-121** Adaptador del motor para un segundo programa (Maya o 3ds Max) sobre la misma foto de escena.
- **T-122** El add-on muestra los menús en el idioma de la interfaz de Blender.
- La prueba con un alumno ya está en **T-102** y **T-113**.
