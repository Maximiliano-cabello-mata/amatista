# 07 · Guía paso a paso y acompañamiento (etapa 2)

> **Motor 4:** la guía se muestra como la misión de una ruta (una a la vez, con sus teclas que se encienden y sus herramientas iluminadas) y ya no abre un diálogo por cada paso. Ver [15_experiencia_del_alumno.md](15_experiencia_del_alumno.md).

En la etapa 1 el motor respondía «Dimensión Z fuera de rango». En la etapa 2 responde como un profesor sentado al lado: **qué** hacer ahora, **con qué teclas**, **dónde** mirar en la escena y, si hace falta, **lo hace contigo**. Nada de esto cambia cómo se evalúa ni lo que guarda Oracle: la guía se calcula a partir del mismo `EvaluationReport`.

Código: [`engine/amatista_engine/guide/`](../../../engine/amatista_engine/guide/) (Python puro) y, en el add-on, [`guia.py`](../../../addon/amatista_blender/guia.py), [`interfaz/hud.py`](../../../addon/amatista_blender/interfaz/hud.py) y [`interfaz/visor3d.py`](../../../addon/amatista_blender/interfaz/visor3d.py). Pruebas: [`engine/tests/test_guia.py`](../../../engine/tests/test_guia.py) y la parte «etapa 2» de [`addon/tests/en_blender.py`](../../../addon/tests/en_blender.py).

![Tarjeta del acompañante y guía dibujada en la vista 3D](../etapas/img/vista3d_guia.svg)

## Las dos piezas

```python
from amatista_engine import create_default_engine
from amatista_engine.guide import Companion

motor = create_default_engine()
reporte = motor.evaluate(practica, escena)
guia = motor.guide(practica, escena, reporte)          # qué hacer ahora (Guidance)
avisos = Companion().observe(practica, reporte, now=t)  # si hay que decir algo (Intervention)
```

| Pieza | Pregunta que responde | Resultado |
|---|---|---|
| **Entrenador** (`coach.py`, `build_guidance`) | ¿Qué tiene que hacer el alumno en el paso actual y cómo se lo muestro? | `Guidance` |
| **Acompañante** (`companion.py`, `Companion`) | ¿Es momento de decir algo? ¿Felicitar, avisar, ofrecer ayuda? | lista de `Intervention` |

## `Guidance`: la guía del paso actual

| Campo | Qué es | Ejemplo (mesa, cubierta demasiado gruesa) |
|---|---|---|
| `target_id`, `title` | El paso actual. | `grosor`, «Hazla delgada» |
| `step_number`, `step_total` | Posición entre los pasos obligatorios. | 2 de 6 |
| `feedback` | Qué pasa ahora, en palabras simples y con números redondos. | «Tu cubierta mide 2 de alto; tiene que quedar entre 0.05 y 0.3.» |
| `tone` | `animo`, `cerca`, `logrado`, `ojo`. Define el color de la tarjeta. | `animo` |
| `why` | El porqué del paso (lo escribe el autor en `guide.why`, si no, el `tip`). | «Una mesa real tiene la tabla delgada…» |
| `instructions` | 1 a 4 pasos cortos, cada uno con sus teclas. | «Selecciona “Cubierta”» · «Escala solo en Z» `S` `Z` · «Escribe 0.1» `0.1` `Enter` |
| `highlights` | Objetos a resaltar: `bien` (verde), `corregir` (naranja), `candidato` (neón tenue). | Cubierta en naranja: «Aplánala» |
| `cues` | Señales dibujadas en la escena (abajo). | regla en Z con el rango verde |
| `action` | Lo que hace **Hazlo conmigo** (`GuideAction`). | `scale`, eje `z`, valor `0.1`, objeto `Cubierta` |
| `completed` | Práctica terminada. | `false` |

`guidance_to_dict()` la convierte en JSON (para depurar, para el modo autor o para una futura vista web).

### Señales en la escena (`VisualCue`)

| `kind` | Qué dibuja el add-on | Datos |
|---|---|---|
| `ruler` | Regla junto al objeto: naranja lo que mide ahora, verde el tramo pedido. | `object`, `axis`, `current`, `min`, `max` |
| `plane` | Plano translúcido amatista (por ejemplo, la cara de abajo de la cubierta: ahí deben tocar las patas). | `z`, `min_xy`, `max_xy` |
| `ghosts` | Cajas fantasma neón donde falta una pieza (las patas que faltan, en las esquinas libres). | `boxes: [{center, size}]` |
| `arrow` | Flecha hacia arriba o abajo sobre el objeto que hay que mover. | `object`, `direction` |

Cada señal puede traer `label`, que se dibuja como una pastilla de texto sobre la escena («Baja 0.25»).

### Acciones de «Hazlo conmigo» (`GuideAction`)

| `kind` | Qué hace el add-on |
|---|---|
| `add_cube` | Agrega un cubo (`Shift A › Malla › Cubo`). |
| `assign_role` | Asigna el rol al objeto candidato. |
| `duplicate` | Selecciona la pieza y arranca **Duplicar** (`Shift D`); el alumno la deja con el ratón. |
| `scale`, `move`, `rotate` | Selecciona el objeto, lo encuadra y arranca la herramienta de Blender **restringida al eje**. El alumno termina con el ratón o escribiendo el número que muestra la tarjeta. |
| `apply_scale` | Abre el menú *Aplicar* (`Ctrl A`) para elegir «Escala». |
| `save` | Guarda (o abre *Guardar como* si el archivo aún no tiene nombre). |
| `focus` | Selecciona y encuadra el objeto. |
| `add_primitive` *(v3)* | Agrega la primitiva que falta (cubo, cilindro, esfera…) y, si el paso lo pide, le pone el rol. |
| `add_modifier` *(v3)* | Agrega el modificador al objeto (Espejo, Subdivisión, Array…) con la pestaña Modificadores abierta. |
| `open_tab` *(v3)* | Abre una pestaña de Propiedades (`MODIFIER`, `MATERIAL`, `RENDER`, `DATA`…). |
| `edit_mode`, `object_mode` *(v3)* | Entra a Modo Edición o vuelve a Modo Objeto. |
| `merge_by_distance` *(v3)* | Fusiona los vértices encimados (lo ofrece el vigilante de malla limpia). |
| `apply_all` *(v3)* | Aplica rotación y escala del objeto (lo usan los `fix` de los vigilantes). |
| `add_light`, `add_camera`, `align_camera` *(v3)* | Agrega una luz (por ejemplo de área), agrega o activa una cámara, o la alinea con la vista. |
| `set_engine`, `render` *(v3)* | Cambia el motor de render (Eevee, Cycles…) o hace el render (F12). |
| `insert_keyframe` *(v3)* | Inserta un fotograma clave en la propiedad y el eje que pide el paso. |
| `new_material` *(v3)* | Crea un material nuevo en el objeto. |
| `clear_scene` *(v3)* | Vacía la escena de inicio. |
| `show_example` *(3.5)* | Abre el ejemplo resuelto en su propia escena ([14](14_ejemplo_y_revision.md)). |

La lista completa está en `GuideAction` (`engine/amatista_engine/guide/models.py`) y cada acción la cumple `addon/amatista_blender/guia.py`. Un vigilante o un objetivo con `fix` puede pedir cualquiera de estas acciones con su propia etiqueta.

La herramienta se arranca en modo interactivo a propósito: el alumno **hace** el gesto, no lo ve hecho. En Blender sin interfaz (pruebas) la acción aplica directamente el valor sugerido.

## Entrenadores por validador

| Validador | Qué dice y qué muestra |
|---|---|
| `role.count`, `role.exists` | Sin objetos: propone agregar un cubo. Con un objeto sin rol que parece servir: lo marca como candidato («¿Es la cubierta?») y ofrece asignarle el rol. Si faltan piezas: «Llevas 1 de 4, faltan 3», fantasmas en las esquinas libres y la acción Duplicar. |
| `dimension.range` | Medida actual, rango pedido, **factor de escala redondo** (`S` `Z` `0.1`) y regla. |
| `object.position` | Cuánto mover y hacia dónde (`G` `Z` `-0.25`), con flecha. |
| `object.rotation` | Cuántos grados girar (`R` `Z` `90`). |
| `spatial.below` | Qué pieza atraviesa o flota, plano de referencia, flecha y **la distancia exacta** para dejarla tocando. |
| `transform.scale_applied` | Por qué importa y `Ctrl A › Escala`. |
| `file.saved`, `file.named` | `Ctrl S`, y qué nombre poner. |
| `material.exists`, `modifier.exists` | Dónde está el panel (Propiedades › Material / Modificadores) y qué agregar. |
| `logic.any` | Guía con el entrenador de la primera opción. |
| `object.count`, `shape.thinnest_axis`, `shape.proportion` *(v3)* | Qué pieza sobra o falta (con «Agregar … conmigo»), cuál hay que girar o estirar y con qué factor. |
| `spatial.grounded`, `spatial.touching` *(v3)* | Cuánto bajar la pieza hasta el suelo o moverla hasta que toque a la otra. |
| `mesh.no_duplicates`, `mesh.one_side` *(v3)* | Fusionar por distancia; entrar a Modo Edición para dejar solo una mitad. |
| `modifier.configured` *(v3)* | Agregar el modificador o abrir Modificadores para ajustar ejes y niveles. |
| `material.distinct`, `material.matches` *(v3)* | Crear un material nuevo o abrir la pestaña Material para cambiar su rasgo. |
| `light.three_point`, `camera.active`, `camera.frames` *(v3)* | Qué luz falta (con «Agregar una luz de área conmigo»), agregar o activar la cámara y alinearla con la vista. |
| `render.engine`, `render.done` *(v3)* | Cambiar el motor de render; hacer el render con F12. |
| `animation.keyframes`, `animation.varies` *(v3)* | Insertar el fotograma clave que falta en la propiedad y el eje que pide el paso. |
| `figure.silhouette` *(3.5)* | La primera parte pendiente de la lista del instructor, con su tecla; el resto queda en la lista ([13](13_instructor_y_silueta.md)). |
| `example.matches` *(3.5)* | El primer punto pendiente de «Comparado con el ejemplo», con sus teclas; nombra los demás aspectos pendientes y ofrece «Ver el ejemplo resuelto». |
| cualquier otro | Guía genérica: el mensaje del validador, el `tip` y los objetos a revisar (por ejemplo `figure.recognize`, cuyo mensaje ya dice qué pieza falta). Un error dentro de un entrenador nunca rompe la evaluación: cae en la guía genérica. |

Los entrenadores de la etapa 2 están en `engine/amatista_engine/guide/coach.py` (`ENTRENADORES`) y los del motor v3 en adelante en `coach_v3.py` (`ENTRENADORES_V3`).

Los números que se proponen son **redondos y dentro del rango** (`objetivo_amable`, `factor_amable`, `delta_amable`): «escribe 0.1», nunca «escribe 0.0734».

## La guía escrita por el autor (`guide` en el objetivo)

Opcional y aditivo en `amatista.practice/1` (las prácticas sin `guide` siguen funcionando igual):

```json
{"id": "grosor", "title": "Hazla delgada", "validator": "dimension.range", "params": {"role": "cubierta", "axis": "z", "min": 0.05, "max": 0.3},
 "guide": {
   "why": "Una mesa real tiene la tabla delgada: si es muy gruesa, parece un bloque.",
   "steps": ["Selecciona la cubierta", {"text": "Escala solo en Z", "keys": ["S", "Z"]}, {"text": "Escribe 0.1", "keys": ["0.1", "Enter"]}]
 }}
```

- `why`: el porqué, en una o dos frases. Se ve en la misión de la barra lateral y en «Así se hace este paso».
- `steps`: hasta 8 pasos; cada uno es un texto o `{text, keys}` con hasta 6 teclas. Si están, **reemplazan** las instrucciones generadas; la acción, los resaltados y las señales siguen siendo los calculados.

## El acompañante (`Companion`)

Observa cada evaluación y decide cuándo hablar. Guarda su memoria en `state` (un diccionario serializable).

| Intervención | Cuándo | Cómo se ve en Blender (modo «Acompañado») |
|---|---|---|
| `nuevo_paso` | Empieza un paso que el alumno no había visto. | Diálogo «Paso N: …» con el porqué, las teclas y los botones **Hazlo conmigo**, **Muéstrame** y **Pista**. |
| `paso_logrado` | Un objetivo pasa a cumplido. | Aviso verde que se desvanece («¡Listo! Ya tienes la cubierta»). |
| `mejorando` | La distancia al objetivo bajó al menos 15 %. | Aviso «¡Vas mejor!». |
| `retroceso` | Algo que ya estaba bien dejó de cumplirse. | Aviso naranja «Ojo: … ya no se cumple». |
| `ofrecer_ayuda` | 4 cambios sin mejorar o 120 s en el mismo paso (ajustable). Una vez por paso. | Diálogo «¿Te ayudo con este paso?» con Hazlo conmigo, Explícame qué hacer, Muéstrame dónde y Dame una pista (o seguir a su manera). |
| `practica_completa` | Se cumplen todos los obligatorios. | El diálogo de felicitación de siempre. |

La **distancia** (`distance(result)`) es cuánto falta: unidades fuera del rango, piezas que faltan, objetos que fallan. Sirve para decir «vas mejor» sin conocer cada validador.

## En el add-on

- **Tarjeta del acompañante** (HUD, esquina de la vista 3D): «PASO 2 DE 6», barra de progreso, título, lo que pasa ahora con el color del tono, hasta 4 instrucciones con **teclas dibujadas** y el pie «Hazlo conmigo en la pestaña Amatista». Los avisos del acompañante aparecen encima y se desvanecen en 5 s.
- **Guía en la escena** (`visor3d.py`): contornos de caja por tipo de resaltado, fantasmas, plano, regla y flecha (POST_VIEW) y las pastillas de texto proyectadas (POST_PIXEL). No modifica la escena ni se guarda en el `.blend`.
- **Panel Práctica**: bloque «Ahora» con la misma guía, botones **Comprobar** y **¿Cómo lo hago?**; «Todos los pasos» queda plegado (ya no hace falta mirar la tabla).
- **Diálogos**: `amatista.explicar_paso` y `amatista.ofrecer_ayuda`. Operadores `amatista.hazlo_conmigo` y `amatista.mostrarme` (selecciona, encuadra y resalta sin hacer nada).

### Preferencias (*Complementos › Amatista › Acompañamiento*)

| Preferencia | Valores | Por defecto |
|---|---|---|
| Acompañamiento | **Acompañado** (diálogos y avisos), **Solo tarjeta** (avisos sin diálogos), **Silencioso** (como la etapa 1: Comprobar y Pista) | Acompañado |
| Mostrar en la vista 3D | resaltados y señales | sí |
| Un diálogo por cada misión | *(motor 4)* además de la tarjeta, un diálogo al empezar cada misión | no |
| Animaciones | *(motor 4)* la tarjeta entra, celebra y la tecla que toca respira | sí |
| Dejarme lista la herramienta | *(motor 4)* niveles 1 y 2: elige la herramienta de la misión en la barra T | sí |
| Ofrecer ayuda tras | 2 a 20 cambios | 4 |
| o tras (segundos) | 30 a 900 | 120 |

### La ayuda cuenta para la autonomía

Usar **Hazlo conmigo** en un paso lo deja como «con guía» (equivale a ver la tercera pista); **Muéstrame** cuenta como una pista. El intento enviado al servidor lleva además `ayudas: {hazlo_conmigo, mostrarme, explicar}` como dato informativo: el servidor lo ignora hoy y no hizo falta tocar Oracle.
