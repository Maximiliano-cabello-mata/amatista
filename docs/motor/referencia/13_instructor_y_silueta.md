# 13 · Blender como instructor (motor 3.5)

Pedido de Maximiliano (9 oct 2026): la plataforma y el add-on se seguían sintiendo desconectados. Una práctica como la espada no tenía un propósito claro, abrir una práctica nueva no limpiaba la anterior y el add-on imponía pasos en vez de guiar. El add-on debe ser un **instructor**: guía, corrige, señala qué detalle falta para que la figura se parezca a la de la plataforma y reconoce si la figura coincide con la que espera la práctica. La plataforma, como PWA, debe poder manejar Blender.

Hay cuatro cambios.

> **Después (mismo día):** la espada era solo un ejemplo. Lo que hacía falta era que **cualquier** práctica se revisara sola contra un ejemplo resuelto escrito en código. Eso es [14_ejemplo_y_revision.md](14_ejemplo_y_revision.md). La lista «Tu figura» pasó a ser «Comparado con el ejemplo» y abarca todos los aspectos de la práctica, no solo la figura.

## 1. Cada práctica en su propia escena

**Antes:** `practicas.activar` cargaba la práctica nueva en la escena abierta y la escena solo se vaciaba la primera vez. Por eso el tren aparecía dentro de la espada, y en las pruebas aparecía hasta la mesa de la práctica archivada. La prueba que lo reproduce está en `addon/tests/en_blender.py` › `probar_escena_por_practica`.

**Ahora** (`practicas._escena_para`), cada práctica abre en su propia escena de Blender:

| Situación | Escena |
|---|---|
| La escena actual nunca tuvo práctica (Blender recién abierto) | La misma: se quitan el cubo, la luz y la cámara de inicio, como antes |
| La escena ya es de esta práctica | La misma |
| La práctica continúa a la anterior (`starter.from_practice`: pinta la nave que modelaste, el diorama de tu aldea) | La misma, porque trabajas sobre lo que hiciste |
| Una práctica de autor que se está probando (borrador) | La misma |
| Cualquier otro caso | Se vuelve a la escena de esta práctica (la última en que trabajaste) o se crea «Amatista · <título>» vacía |

Nada se borra. Lo de la práctica anterior queda en su escena (selector de escenas, arriba a la derecha) y vuelve al abrirla otra vez. Un aviso lo dice: «Empiezas en una escena nueva. Lo de «Tren de juguete» quedó guardado en su escena». Las escenas guardan la práctica en las propiedades `amatista_practica` y `amatista_practica_en`, aunque la práctica se cierre.

**Empezar de nuevo** (botón «De nuevo» en Practicar, o desde la plataforma) crea una escena limpia para la misma práctica. La escena de antes queda en el archivo con «(anterior)» en el nombre.

## 2. La silueta: reconocer una figura hecha en una sola malla

`figure.recognize` (motor 3.4) reconoce figuras hechas con varias piezas. La espada del módulo 2 se modela en Modo Edición desde **un cubo**, y su caja envolvente solo dice que es larga. La silueta (`engine/amatista_engine/figures/silueta.py`) mira la forma como lo haría una persona:

1. **Medir** (`silueta_de_malla`). El add-on corta la malla en 32 rebanadas a lo largo de su eje más largo, en el mundo, y mide el ancho y el grueso de cada rebanada (las aristas que cruzan el plano de la rebanada dan el contorno). También lo hace en Modo Edición, leyendo con bmesh, y funciona en mallas de hasta 20,000 vértices. La silueta viaja en la foto de la escena (clave `si`) y el servidor repite la comparación.
2. **Partes del modelo** (`partes_del_modelo`). Cada pieza de `reference.parts` es un tramo de la silueta, en orden a lo largo del eje: Pomo, Mango, Guarda, Hoja y Punta.
3. **Repartir** (`_repartir`, programación dinámica). Decide qué rebanadas del alumno son cada parte, sin exigir que empiecen donde empiezan en el modelo: una hoja más corta sigue siendo la hoja. Prueba la figura con la punta hacia arriba y hacia abajo. Si una parte es muy distinta, todo lo demás se ve más ancho o más angosto en fracciones del largo. Por eso la escala real se calcula con los anchos y se vuelve a leer.
4. **Revisar cada parte** contra el modelo:

| Qué | Cuándo falla | Nivel |
|---|---|---|
| **Contraste** | Una parte que en el modelo es mucho más ancha que su vecina (la guarda) y en la malla mide casi lo mismo: «Falta la parte «Guarda»» | Todos (es lo que da sentido a la figura) |
| **Afilado** | Una parte que en el modelo se afila (la punta) y en la malla no: «La parte «Punta» no se afila» | Todos |
| **Largo, ancho y grueso** | Fuera de la holgura de la exigencia: ×2.5 (forma), ×2 (proporción), ×1.6 (cercana), ×1.3 (medidas), ×1.15 (exacta); el grueso tiene ×1.5 más de holgura | Del 1 al 3 se perdona una parte; en el 4 y el 5, ninguna |
| **Detalle** | Una parte que en el modelo sobresale un poco (el pomo) y en la malla no se nota | Nunca falla: el instructor la sugiere |
| **Tamaño real** | Niveles 4 y 5: el largo, comparado con el del modelo (±25 % o ±10 %) | 4 y 5 |

Cada problema trae su arreglo con las teclas y el eje de la malla del alumno. Por ejemplo: «Falta la parte «Guarda»: en el modelo es mucho más ancha que «Mango» y en tu malla miden casi lo mismo. Con Ctrl + R haz un corte donde va y escala ese anillo hacia los lados (S, X)».

```json
{"id": "silueta", "title": "Forja la silueta: guarda, hoja y punta", "validator": "figure.silhouette",
 "params": {"type": "MESH"}, "weight": 45, "requires": ["alargar"]}
```

El cargador inyecta las piezas, el nivel y el título desde `reference`, como en `figure.recognize`. Mira la malla más larga, y si hay más de una pide unirlas con Ctrl + J. Desde 3.5.1 una foto sin silueta no aprueba la comprobación: pide actualizar el complemento o simplificar la malla y volver a comprobar. Cada evaluación tarda entre 13 y 25 ms.

## 3. La espada, con propósito

La práctica `blender.bp.m2.espada` (versión 3) sigue la lección del módulo 2 y la imagen del modelo:

1. **Empieza con un cubo** (`object.count`). Toda la espada sale de ahí.
2. **Alarga el cubo con E** (`shape.proportion` en cualquier eje, al menos 3 veces su ancho). Su «Hazlo conmigo» entra a Modo Edición, gracias al `fix` propio del objetivo, que antes solo existía en los vigilantes.
3. **Forja la silueta: guarda, hoja y punta** (`figure.silhouette`), con la lista «Tu figura».
4. **Que siga siendo low-poly** (como máximo 250 vértices).
5. **Guarda tu espada** (`mi_espada.blend`).

Desaparecieron la alternativa «o una taza», el rol «modelo» que había que asignar a mano y los pasos que solo contaban caras y vértices. La práctica nueva tiene una píldora «Afilar la punta», y en modo enfocado Shift+A muestra solo el cubo (las piezas unidas de un modelo se modelan desde un cubo).

## 4. El instructor: la lista «Comparado con el ejemplo» y la plataforma en vivo

`figure.silhouette` y `figure.recognize` devuelven `details.checklist`, una lista de `{texto, ok, estado, consejo}`. Por ejemplo, en el tren: «Rueda: bien», «Chimenea: falta (Shift + A › Malla › Cilindro)» y las relaciones rotas.

- **En Blender**: el panel **Comparado con el ejemplo** en Practicar (en esta entrega se llamaba «Tu figura»; ver la nota del principio) muestra cada punto con ✓, ! o una bombilla (detalle), agrupado por aspecto, y deja abiertos los dos primeros consejos. La guía del paso usa el primer pendiente, con sus teclas.
- **En la plataforma**: el latido (`POST /api/addon/v1/enlace`) lleva un `detalle` con el paso, el mensaje del instructor, la lista, el modo de Blender, las pistas que quedan y el «Hazlo conmigo». La lección lo muestra en la tarjeta **Ahora en Blender**, que se refresca cada 3 s mientras Blender está en esa práctica. Desde 3.5.1 el servidor guarda el último detalle en `ADDON_ENLACES.DETALLE` (011), junto con el estado de la práctica. Todos los procesos consultan la misma fila; el detalle deja de mostrarse a los 25 segundos sin latido.
- **Órdenes nuevas** (`POST /api/addon/v1/ordenes`): `comprobar`, `pista`, `hazlo_conmigo`, `guardar` y `reiniciar`. `reiniciar` exige `confirmar: true`, y la lección pregunta antes. Llevan `practica_id` y Blender solo las cumple si sigue en esa práctica. `guardar` usa el archivo abierto o, si es nuevo, `Documentos/Amatista/mi_espada.blend`, sin pisar uno que ya exista.

3.5.0 no cambió Oracle. Para 3.5.1 se requiere 011: añade `DETALLE` a `ADDON_ENLACES`. Las órdenes siguen usando `ORDEN` (010).

## Pruebas

- `engine/tests/test_silueta.py` (16 casos): medir, partes en orden, la espada completa, sin guarda (en todos los niveles), punta cuadrada, al revés y acostada, sin pomo (detalle), exigencia por nivel, tamaño en el nivel 5, la foto, la práctica y la velocidad.
- `practices/blender/principiante/m2-espada/pruebas.json` (8 casos).
- `backend/tests/test_enlace.py`: el detalle en vivo, sus límites, las órdenes nuevas y la confirmación de «empezar de nuevo».
- `addon/tests/en_blender.py`: `probar_escena_por_practica` (el fallo reproducido) y `probar_motor_35` (silueta medida en Blender y en Modo Edición, la lista «Tu figura», el latido con el detalle y las órdenes de la plataforma, incluidos «empezar de nuevo» y «Hazlo conmigo»).
- `frontend/src/blender/logica.test.js` › «el instructor en vivo».
