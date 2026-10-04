# 02 · Formato de práctica: `amatista.practice/1`

> **Motor v3:** las prácticas nuevas usan `amatista.practice/2` (píldoras, vigilantes, escena de inicio y curso) y se crean y prueban con `engine/herramientas/practicas.py`. Ver [prácticas v3 y herramientas de autor](08_practicas_v3_y_herramientas.md). Este documento sigue valiendo para todo lo que la v2 no cambió.

Una práctica es un JSON declarativo. El motor la valida al cargarla (`engine/amatista_engine/practice/loader.py`) y explica cada error en español con la ruta del campo («targets[2].params.min debe ser un número»). Ejemplo completo: [`practices/archivo/v2/mesa.json`](../../../practices/archivo/v2/mesa.json).

## Práctica

| Campo | Obligatorio | Qué es |
|---|---|---|
| `schema` | sí | Siempre `"amatista.practice/1"`. |
| `id` | sí | Minúsculas, números, `.`, `-`, `_` (hasta 80). Convención: `blender.n<nivel>.<tema>`, por ejemplo `blender.n1.mesa`. |
| `version` | sí | Entero. Lo sube el autor; Oracle además numera cada subida en `PRACTICA_VERSIONES`. |
| `title` | sí | Título que ve el alumno. |
| `level` | sí | 1 a 5 (los niveles del curso). El cargador da error si falta. |
| `description`, `intro`, `completion` | no | Textos: tarjeta del catálogo, bienvenida y mensaje final. Máximo 600 caracteres cada uno. |
| `estimatedMinutes` | no | Duración estimada. |
| `blender` | no | `{"min": "4.2"}`: versión mínima para esta práctica. |
| `skills` | no | Ids de `HABILIDADES` que la práctica entrena (suben a «con_pistas» al completarla). |
| `roles` | no | `{id: {label, description}}`: lo que el alumno puede decirle a Amatista que es cada objeto. |
| `tags` | no | Etiquetas libres para el catálogo. |
| `tools` | no | `{allowed: [...], warn: [...]}`: herramientas esperadas y las que generan un aviso (no bloquean). Catálogo en `engine/amatista_engine/tools/catalogo.json`. |
| `targets` | sí | Los objetivos, en el orden en que se enseñan (máximo 40). |

## Objetivo (`targets[]`)

| Campo | Qué es |
|---|---|
| `id` | Único dentro de la práctica. |
| `title` | El paso que ve el alumno («Agrega cuatro patas»). |
| `validator` | Uno de los validadores de la tabla de abajo. Si el add-on no lo conoce, el objetivo queda «necesita actualizar el add-on» y nunca falla en silencio. |
| `params` | Parámetros del validador. |
| `weight` | Peso en el porcentaje (por defecto 1). Los obligatorios deben sumar más que 0. |
| `requires` | Ids de objetivos que deben cumplirse antes; mientras tanto este queda «bloqueado». |
| `optional` | `true`: suma como extra pero no hace falta para completar. |
| `tip` | Consejo corto que siempre se ve en la tarjeta del paso. |
| `hints` | De 1 a 6 pistas, de la más general al paso a paso. Se revelan de una en una con **Necesito una pista**; llegar a la tercera cuenta como «con guía». |
| `messages` | `{pass, fail}`: textos propios para cumplido / no cumplido. |
| `watch` | Eventos que reevalúan este objetivo (por defecto los del validador). |
| `guide` | *(etapa 2, opcional)* `{why, steps}`: el porqué del paso y hasta 8 pasos (`"texto"` o `{"text", "keys": [hasta 6 teclas]}`) que reemplazan las instrucciones que genera el motor. Ver [07_guia_y_acompanamiento.md](07_guia_y_acompanamiento.md). |

## Validadores incluidos

Los parámetros de selector, comunes a los que eligen objetos: `role`, `name`, `name_prefix`, `type`. Los de cantidad: `equals`, `min`, `max`. Los de rango: `axis` (`x`, `y`, `z`), `min`, `max`.

| Id | Etiqueta en el constructor | Parámetros |
|---|---|---|
| `object.exists` | Objeto existe | selector |
| `object.count` | Cantidad de objetos | selector + cantidad |
| `role.exists` | Rol asignado | `role` |
| `role.count` | Cantidad por rol | `role` + cantidad |
| `dimension.range` | Dimensión | selector + rango |
| `object.position` | Posición | selector + rango |
| `object.rotation` | Rotación | selector + rango (en grados) |
| `transform.scale_applied` | Escala aplicada | selector |
| `spatial.below` | Debajo de | selector + `reference_role`, `tolerance` (0.02) |
| `mesh.vertex_count`, `mesh.face_count` | Vértices, Caras | selector + cantidad |
| `modifier.exists` | Modificador | selector + `modifier` (`BEVEL`, `MIRROR`, `ARRAY`…) |
| `material.exists` | Material | selector + `material` (el nombre contiene) |
| `collection.contains` | Colección | `collection`, `role` + cantidad |
| `scene.camera_exists`, `scene.light_exists` | Cámara, Luz | cantidad |
| `file.saved` | Archivo guardado | — (guardado y sin cambios desde entonces) |
| `file.named` | Nombre del archivo | `contains` |

La lista exacta con tipos y valores por defecto es el código: `engine/amatista_engine/validators/builtin.py` (el constructor de objetivos del modo desarrollador la lee de ahí). Agregar uno = una función + un registro; ninguna práctica necesita código propio.

## Ejemplo mínimo

```json
{
  "schema": "amatista.practice/1",
  "id": "blender.n1.cubo",
  "version": 1,
  "title": "Un cubo delgado",
  "roles": {"tabla": {"label": "Tabla"}},
  "targets": [
    {"id": "tabla", "title": "Marca la tabla", "validator": "role.count",
     "params": {"role": "tabla", "equals": 1}, "weight": 1,
     "hints": ["Selecciona el cubo y asígnale el rol Tabla."]},
    {"id": "delgada", "title": "Hazla delgada", "validator": "dimension.range",
     "params": {"role": "tabla", "axis": "z", "min": 0.05, "max": 0.3},
     "requires": ["tabla"], "weight": 1}
  ]
}
```

## Cómo se calcula

- **Progreso**: suma de pesos cumplidos / suma de pesos obligatorios (0 a 100).
- **Paso actual**: el primer objetivo obligatorio no cumplido y no bloqueado.
- **Completada**: todos los obligatorios cumplidos.
- **Guía** (etapa 2): para el paso actual, el motor arma qué hacer, con qué teclas, qué resaltar y qué acción ofrece «Hazlo conmigo» (`motor.guide(...)`, [07](07_guia_y_acompanamiento.md)). No cambia el progreso.
- **Autonomía** al completar (`pedagogy/skills.py`): `autonoma` sin pistas ni correcciones; `con_pistas` si usó pistas; `con_guia` si llegó al paso a paso o usó **Hazlo conmigo** en algún paso (Muéstrame cuenta como una pista). El servidor nunca sube una habilidad a «autónoma» solo por una práctica.

## Compatibilidad

Todos los campos agregados después del prototipo v0.1 son opcionales (también `guide`, de la etapa 2): [`practices/archivo/v2/table.json`](../../../practices/archivo/v2/table.json) (el formato original) sigue cargando. Las funciones del prototipo (`validators/builtin.file_saved` y compañía) siguen importables para el `ascii_check.py` original.
