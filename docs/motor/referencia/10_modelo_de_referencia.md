# Modelo de referencia y figuras con sentido (motor 3.3)

Desde el 5 de octubre de 2026 cada práctica puede traer su **modelo de referencia**: la figura terminada descrita en piezas simples. Con él, el motor:

1. **Enseña cómo se debe ver**: una imagen renderizada (`referencia.jpg`) y un plano con tres vistas y medidas aproximadas (`plano.svg`), en la lección de la plataforma y en el panel del add-on («Así se debe ver»).
2. **Califica que la figura tenga sentido** con el validador `figure.resembles`: compara la forma completa del alumno con el modelo, **con medidas parecidas, no exactas**.

Motivo (pedido de Max): prácticas como el tren pedían medidas muy exactas y aceptaban figuras sin sentido (ruedas en el techo, vagones apilados). Ahora el alumno tiene libertad en las medidas y el motor revisa que la figura sea la de la práctica.

## El bloque `reference`

```json
"reference": {
  "title": "Tren de juguete",
  "description": "Locomotora roja con chimenea y un vagón azul… Las medidas son una guía: ±35 % está bien.",
  "tolerance": 0.35,
  "parts": [
    {"primitive": "cube", "role": "vagon", "name": "Locomotora", "size": [2.2, 1.2, 1.1], "location": [1.25, 0, 0.9], "color": "#c0392b"},
    {"primitive": "cylinder", "role": "rueda", "size": [0.7, 0.7, 0.18], "location": [1.9, 0.62, 0.35], "rotation": [90, 0, 0]}
  ],
  "camera": {"location": [6.5, -7.5, 4.2], "target": [0, 0, 0.8]}
}
```

| Campo | Qué es |
|---|---|
| `title`, `description` | Lo que lee el alumno junto a la imagen. La descripción dice qué importa y cuánta libertad hay. |
| `tolerance` | Margen de las medidas: `0.35` = ±35 %. Por defecto 0.35. |
| `parts` | Hasta 60 piezas (abajo). |
| `objects` | Opciones de render por nombre de pieza: `array` (`count`, `axis`, `gap`), `bevel`, `subsurf`, `smooth`, `wire`. Solo cambian la imagen; para calificar cuenta la caja del objeto con sus modificadores (igual que `bound_box` en Blender). |
| `camera` | `location` y `target` de la cámara del render. |
| `flexible` | Grupos donde la **cantidad es libre** (por ejemplo `["pilar"]` en el puente: 2 o 4 pilares están bien). Solo cuentan las piezas emparejadas. |
| `lights` | Luces del render (la práctica de tres puntos las muestra). |

Cada pieza:

| Campo | Qué es |
|---|---|
| `primitive` | `cube`, `cylinder`, `sphere`, `icosphere`, `cone`, `torus` o `plane`. |
| `size`, `location`, `rotation` | Medidas en metros (caja total), centro, giro en grados. |
| `role` | El rol que el alumno le pone en la pestaña Amatista. Las piezas se agrupan por rol (o por primitiva si no tienen). |
| `name` | El nombre de la pieza: sale en la imagen, en las instrucciones del ejemplo (`describir`) y en la lista de `figure.silhouette`, que nombra cada parte de la figura. |
| `color`, `material` | Solo para la imagen. |
| `segments` | Los lados de un cilindro o un cono (un entero hasta 256; sin el campo, el valor por defecto). Sale en la imagen y `figure.silhouette` lo usa para armar la malla de la pieza. |
| `join` | Piezas con el mismo `join` se unen en un solo objeto (como Ctrl+J). Una figura de piezas unidas se compara por su silueta con `figure.silhouette` ([13](13_instructor_y_silueta.md)), no caja por caja. |
| `compare` | `false` = decoración: sale en la imagen pero no se califica. |

## Cómo califica `figure.resembles`

> Motor 3.4: las prácticas nuevas usan `figure.recognize` ([11_reconocer_figuras.md](11_reconocer_figuras.md)), que no necesita roles, revisa que la figura tenga sentido y exige según el nivel. `figure.resembles` sigue igual para las prácticas que ya lo usan.


El cargador inyecta en cada objetivo `figure.resembles` las piezas, la tolerancia, los grupos flexibles y los nombres de los roles; en el JSON basta `"params": {}`.

1. **Escala libre.** La figura del alumno y la del modelo se miden relativas a su lado más largo: un tren el doble de grande está bien. Si es más de `scale_range` veces (2.5) más grande o más chico que el modelo, pide escalarlo.
2. **Orientación libre.** Prueba 8 orientaciones (girada en Z y en espejo) y se queda con la mejor: el tren puede ir hacia X o hacia Y.
3. **Pieza por pieza.** Cada pieza del modelo se empareja con la del alumno más parecida de su grupo. Su puntaje multiplica *medidas* (error en escala logarítmica, dentro de la tolerancia = 1) por *lugar* (cada pieza se puede correr ~9 % del largo de la figura con tolerancia 0.35).
4. **Total** = 85 % piezas (mitad promedio, mitad el peor grupo, para que un grupo mal puesto no se esconda en el promedio) + 15 % proporción general. Si falta un grupo entero, el total es 0.
5. Aprueba con `min_score` (0.7 por defecto).

El mensaje al alumno nombra el peor problema: falta un rol, sobran o faltan piezas, la proporción general, una medida, una pieza girada (mismas medidas en otro orden) o fuera de lugar.

Otros validadores nuevos:

- `spatial.on_top`: una pieza apoyada encima de otra (base a la altura de la tapa, centro sobre la huella). Los techos de la aldea.
- `dimension.approx`: una medida con margen relativo, en vez de un valor exacto.

## Generar la imagen y el plano

```bash
pip install bpy                     # Blender como módulo de Python (sin ventana)
python engine/herramientas/referencias.py                 # todas las prácticas con «reference»
python engine/herramientas/referencias.py --sin-render    # solo plano.svg y el índice
python engine/herramientas/referencias.py --muestras 48   # render con más calidad
```

Construye cada modelo en Blender y lo evalúa con el propio motor: imprime cuántos objetos armó, el progreso que saca el modelo solo y los objetivos que le faltan. Además comprueba que el modelo pase la revisión de la figura y avisa si no: usa el primer validador de figura que tenga la práctica, en este orden: `figure.recognize`, `figure.silhouette` y `figure.resembles` (este último queda por compatibilidad; ninguna práctica del plan lo usa). Si la práctica no tiene ninguno, mira el aspecto «La figura» de la revisión contra el ejemplo resuelto. Solo imprime «sin «figura»» cuando tampoco hay ese aspecto. Después renderiza `referencia.jpg` (800×500, Cycles) y dibuja `plano.svg`. Actualiza `practices/blender/referencias.json`. Los JSON se escriben con `engine/herramientas/formato_json.py` para que los diffs sean cortos.

## Pruebas

- `engine/tests/test_figura.py` (19 pruebas): el modelo exacto, medidas ±8 %, el tren girado y más grande aprueban; ruedas en el techo, vagones apilados, ocho ruedas de un solo lado y piezas faltantes no.
- `pruebas.json` de cada práctica: casos «Sin sentido» que deben reprobar. `python engine/herramientas/practicas.py probar <carpeta de la práctica>` los corre, y prueba además que el ejemplo resuelto complete la práctica (96 casos en las 18 prácticas: 78 de `pruebas.json` y los 18 ejemplos).
- `addon/tests/en_blender.py`: el panel muestra la imagen dentro de Blender.

## Prácticas con modelo

13 de las 18 prácticas traen modelo de referencia. Desde el motor 3.5 el modelo no es solo una imagen de guía: si el ejemplo resuelto de la práctica usa el paso `referencia`, la figura del modelo se revisa sola dentro de «Tu práctica coincide con el ejemplo» ([14_ejemplo_y_revision.md](14_ejemplo_y_revision.md)). `reference.strictness` fija la exigencia (la aldea usa `forma`).
