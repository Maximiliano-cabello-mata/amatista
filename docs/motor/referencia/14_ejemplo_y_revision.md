# 14 · El ejemplo manda: revisión autónoma de cualquier práctica (motor 3.5)

Pedido de Maximiliano (9 oct 2026): «la espada es un ejemplo; lo que se necesita es que el motor tenga un sistema autónomo que realmente revise lo que se está realizando en cualquier práctica, teniendo en código un ejemplo claro de lo que se espera, con el enfoque de PWA».

## Qué estaba mal planteado

Hasta el motor 3.4, lo que se revisaba dependía de qué objetivos escribió el autor a mano, uno por uno. Eso traía tres problemas:

1. **Nada decía qué es una práctica resuelta.** El alumno veía una imagen de referencia (en algunas prácticas) y una lista de pasos. Los pasos podían cumplirse sin que el resultado se pareciera a lo que pedía la lección, porque cada uno miraba una sola cosa.
2. **La revisión no era pareja.** El tren y la aldea revisaban la figura; la pelota, la nave pintada o los tres puntos de luz solo contaban cosas (hay una animación, hay un material). Si el autor olvidaba un objetivo, esa parte no se revisaba.
3. **La plataforma, Blender y el motor no hablaban del mismo resultado.** La lección describía una cosa, el add-on pedía otra y el motor revisaba una tercera.

## El nuevo enfoque

**Cada práctica trae su ejemplo resuelto, escrito en código.** Es la única descripción de lo que se espera, y de ella sale todo lo demás:

| De un solo ejemplo… | …sale |
|---|---|
| La escena esperada | El motor arma con los pasos la escena que dejaría el ejemplo (`ejemplo/pasos.py` › `escena_esperada`). |
| La revisión | El motor compara la escena del alumno con la esperada, aspecto por aspecto (`ejemplo/revision.py`). Nadie escribe a mano qué revisar. |
| Las instrucciones | Cada paso se lee como una instrucción con sus teclas (`describir`): «Agrega una esfera «Pelota» (Shift + A › Malla › Esfera UV).» |
| El ejemplo en Blender | El add-on lo arma en su propia escena con «Ver el ejemplo» (`addon/amatista_blender/ejemplo.py`). |
| El ejemplo en la plataforma | La lección muestra la tarjeta «El ejemplo resuelto» con los pasos, qué compara Amatista y el código («Ver en código»). |

Las 18 prácticas del plan de estudios tienen ya su ejemplo. CI comprueba que **el ejemplo complete su propia práctica** (si el ejemplo no aprueba, la práctica está mal escrita) y que una escena vacía no coincida.

## El bloque `example`

```json
"example": {
  "title": "Pelota que rebota",
  "description": "La pelota cae, toca el piso en el fotograma 12, se aplasta y vuelve a subir en el 24.",
  "steps": [
    {"esfera": {"nombre": "Pelota", "loc": [0, 0, 4]}},
    {"plano": {"nombre": "Piso"}},
    {"animar": {"objeto": "Pelota", "propiedad": "location", "eje": "z", "claves": [[1, 4], [12, 0.85], [24, 4]]}},
    {"animar": {"objeto": "Pelota", "propiedad": "scale", "eje": "z", "claves": [[1, 1], [12, 0.75], [24, 1]]}},
    {"guardado": {"archivo": "mi_pelota.blend"}}
  ],
  "check": ["animacion", "archivo"]
}
```

| Campo | Qué es |
|---|---|
| `title`, `description` | Lo que lee el alumno sobre el ejemplo (en la lección y en Blender). |
| `steps` | La solución, hasta 120 pasos, en el mismo idioma que los casos de `pruebas.json` («construir»): `cubo`, `cilindro`, `esfera`, `plano`, `cono`, `malla`, `referencia`, `luz`, `camara`, `modificador`, `material`, `animar`, `coleccion`, `rol`, `motor`, `renders`, `guardado`… Ver [08_practicas_v3_y_herramientas.md](08_practicas_v3_y_herramientas.md). |
| `check` | *(opcional)* Qué aspectos revisar. Sin `check`, se revisan **todos los que tiene el ejemplo**. Sirve cuando la práctica ya revisa la figura con su propio objetivo (la nave: `malla`, `modificadores`, `archivo`). |

Pasos nuevos para el ejemplo:

- `{"referencia": {}}` arma la figura del modelo de referencia ([10](10_modelo_de_referencia.md)) con sus piezas. Así el tren, el muñeco, el puente o la espada no repiten sus piezas.
- `{"coleccion": {"nombre": "Casas", "objetos": ["Casa 1", "Casa 2"]}}` junta objetos en una colección.
- `material` acepta `piezas`: el material va solo en esas piezas de una malla unida (la cabina de la nave, los motores).
- Las primitivas aceptan `vertices` (se modeló en Modo Edición) y `mitad` (`"x+"`, `"x-"`…: queda solo una mitad, como con el Espejo).

El cargador lo valida al leer la práctica: pasos desconocidos, objetos que no existen o un `referencia` sin `reference` dan un error con la ruta del campo.

## El objetivo «Tu práctica coincide con el ejemplo»

El cargador agrega al final de la ruta el objetivo `ejemplo` (o `coincide-con-el-ejemplo` si ese id ya existe), con el validador `example.matches` y peso 15. No se escribe en el JSON y `dump_practice` no lo exporta.

Un autor también puede ponerlo en medio de la ruta, solo con algunos aspectos:

```json
{"id": "luces-listas", "title": "Las tres luces", "validator": "example.matches",
 "params": {"aspects": ["luces"]}, "requires": ["camara"]}
```

Si la práctica ya tiene un `example.matches` sin `aspects`, no se agrega otro.

## Cómo revisa, aspecto por aspecto

Un aspecto se revisa **solo si el ejemplo lo tiene**. La pelota no revisa materiales y la nave pintada no revisa animación.

| Aspecto | Qué busca en tu escena | Cómo cambia con el nivel |
|---|---|---|
| **La figura** | Si el ejemplo usa `referencia`, la figura del modelo con `figure.recognize` ([11](11_reconocer_figuras.md)) o, si sus piezas están unidas, con la silueta ([13](13_instructor_y_silueta.md)). Si no, las mallas del ejemplo, por primitiva. | La exigencia del nivel: forma (1-2), proporción (3), medidas (4), exacta (5). |
| **La malla** | Trabajo en Modo Edición: más vértices que la primitiva; solo una mitad cuando el ejemplo la recorta para el Espejo. | Igual en todos. |
| **Modificadores** | Los mismos tipos. Espejo en los mismos ejes; Subdivisión con al menos sus niveles. | Del 1 al 3 basta un objeto; en el 4 y el 5, en tantos objetos como el ejemplo. |
| **Materiales** | Cada material por su rasgo (metálico, vidrio, pulido, rugoso), uno a uno, y que se distingan entre sí. | El color cuenta en los niveles 4 y 5. |
| **Colecciones** | Los objetos agrupados como en el ejemplo. | El nombre es libre hasta el nivel 3. |
| **Luces** | Las luces del ejemplo por tipo. | En los niveles 1 y 2, si tienes las luces pero de otro tipo, es un detalle. |
| **Cámara** | Una cámara activa que mire al modelo. | Igual en todos. |
| **Animación** | Las mismas propiedades animadas en el mismo eje, con sus claves y un recorrido parecido. | Niveles 1 y 2: 2 claves y 35 % del recorrido; desde el 3, todas las claves y 50 %. |
| **Render** | El motor de render (si el ejemplo lo cambia) y el render hecho (F12). | Igual en todos. |
| **Archivo** | Guardado con la palabra del nombre del ejemplo («pelota» en `mi_pelota.blend`). | Igual en todos. |

Lo que es libre hasta el nivel 3: los nombres de los objetos, el lugar, el tamaño y los colores. Lo que no es libre: lo que da sentido a la práctica.

Cada punto de la lista es `{texto, ok, estado, consejo, aspecto}`:

- `Bien`: cumplido.
- `Falta`: no está; el aspecto no pasa.
- `Revisar`: está, pero no como en el ejemplo.
- `Detalle`: lo perdona tu nivel; el instructor lo sugiere y no bloquea.

El consejo dice cómo hacerlo, con sus teclas. El mensaje del objetivo nombra el primer aspecto pendiente («Animación: anima la Escala Z de tu pelota…»). Cuando todo coincide, dice «Tu práctica coincide con el ejemplo (5 de 5)». En `details` van `score`, `checklist`, `level`, `strictness` y `aspects` (`[{id, nombre, ok}]`).

El servidor repite la revisión con la misma foto de la escena, como con todos los validadores ([01](01_arquitectura.md)).

## En Blender

- **«El ejemplo resuelto»** (Practicar): la descripción, los pasos numerados y el botón **Verlo en Blender**.
- **«Ver el ejemplo»** arma el ejemplo en su propia escena, «Ejemplo · <título>», con bmesh y `bpy.data`, sin operadores. Tu escena no se toca. La escena del ejemplo tiene una tarjeta «Estás viendo el ejemplo resuelto» con **Volver a mi práctica**. El motor no evalúa esa escena: no cuenta como tuya.
- **«Comparado con el ejemplo»**: la lista de la revisión, agrupada por aspecto, con ✓, ! o una bombilla, y los dos primeros consejos abiertos.
- La guía del paso usa el primer punto pendiente, con sus teclas, y ofrece abrir el ejemplo.

## En la plataforma (PWA)

- La lección muestra **El ejemplo resuelto** junto al modelo de referencia: los pasos, «Amatista compara: …» con los aspectos, y **Ver en código** con el JSON del ejemplo.
- La tarjeta **Ahora en Blender** muestra la lista agrupada por aspecto. Mientras Blender muestra el ejemplo, avisa y solo ofrece «Volver a mi práctica».
- Órdenes nuevas: `ver_ejemplo` y `volver_practica` (`POST /api/addon/v1/ordenes`). `GET /practicas/{id}` devuelve `ejemplo` con `{titulo, descripcion, pasos, revisa, codigo}`. El latido lleva `aspecto` en cada punto de la lista y `modo: "EJEMPLO"` mientras se ve el ejemplo ([05](05_api.md)).

Sin cambios en Oracle.

## Escribir el ejemplo de una práctica nueva

1. Arma la solución en `pruebas.json` como un caso que aprueba. Esos mismos pasos son el ejemplo.
2. Cópialos a `example.steps` y escribe `title` y `description`.
3. Corre `python engine/herramientas/practicas.py probar <carpeta>`. Además de los casos de `pruebas.json`, prueba que el ejemplo complete la práctica (en las 18 prácticas: 95 casos).
4. Abre la práctica en Blender y pulsa **Ver el ejemplo** para ver que se arme como esperas.

## Pruebas

- `engine/tests/test_ejemplo.py`: en las 18 prácticas, el ejemplo completa su práctica, una escena vacía no coincide y el ejemplo se lee como instrucciones. Además, cada aspecto por separado (materiales, animación, luces en los niveles 2 y 3, cámara, Espejo y niveles, colecciones en los niveles 3 y 4, archivo, malla, figura sin modelo), el ida y vuelta de `dump_practice`, ejemplos mal escritos y el entrenador.
- `backend/tests/test_ejemplo.py`: la lección trae el ejemplo resuelto, la plataforma abre y cierra el ejemplo en Blender, y la lista llega agrupada por aspecto.
- `addon/tests/en_blender.py` › `probar_ejemplo`: en 8 prácticas, «Ver el ejemplo» arma su escena, el motor no la evalúa, los aspectos pasan con la captura de Blender, el latido dice EJEMPLO y «Volver» regresa a tu escena. También las órdenes de la plataforma.
- `frontend/src/blender/logica.test.js`: la lista por aspecto y los controles mientras se ve el ejemplo.

Límite conocido: si el `.blend` ya tiene una colección con el nombre de la del ejemplo, Blender le pone `.001` («Casas.001»). Solo cambia el nombre que se ve.
