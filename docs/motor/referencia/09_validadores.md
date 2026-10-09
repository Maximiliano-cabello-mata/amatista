# Catálogo de validadores

Generado con `python engine/herramientas/practicas.py validadores --md` (Amatista Engine 3.4.0). No se edita a mano: cambia la descripción en `engine/amatista_engine/validators/builtin.py` y vuelve a generarlo.

Los validadores que aceptan **selector** (`role`, `name`, `name_prefix`, `type`, `tag`, `collection`, `primitive`) se aplican a los objetos que cumplen todos los criterios; sin selector, a todos.

## Animación

### `animation.keyframes` — Fotogramas clave

El objeto tiene al menos N fotogramas clave en una propiedad y un eje.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `property` | text | Propiedad (location, rotation_euler, scale) |  | `location` |
| `axis` | axis | Eje |  | `z` |
| `min` | int | Mínimo |  | `2` |

Se vuelve a revisar con: OBJECT_DATA, OBJECT_TRANSFORM.

### `animation.varies` — La animación cambia

Los valores cambian en el tiempo: diferencia mínima, punto más bajo/alto y rebote.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `property` | text | Propiedad |  | `location` |
| `axis` | axis | Eje |  | `z` |
| `min_delta` | float | Cambio mínimo |  |  |
| `low_max` | float | El más bajo llega a |  |  |
| `high_min` | float | El más alto llega a |  |  |
| `bounce` | bool | Rebota |  |  |
| `ground` | bool | Toca el suelo |  |  |
| `tolerance` | float | Tolerancia |  | `0.15` |

Se vuelve a revisar con: OBJECT_DATA, OBJECT_TRANSFORM.

## Archivo

### `file.named` — Nombre del archivo

El nombre del .blend incluye un texto.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `contains` | text | Contiene | sí |  |

Se vuelve a revisar con: FILE_SAVED.

### `file.saved` — Archivo guardado

El .blend está guardado y sin cambios pendientes.

Se vuelve a revisar con: FILE_SAVED, OBJECT_DATA.

## Escena

### `camera.active` — Cámara activa

La escena tiene una cámara activa (la que usa F12).

Se vuelve a revisar con: OBJECT_ADDED, OBJECT_DATA.

### `camera.frames` — Encuadre

La cámara mira al modelo (selector o todas las mallas).

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `margin` | float | Margen del encuadre |  | `1.0` |

Se vuelve a revisar con: OBJECT_ADDED, OBJECT_TRANSFORM, OBJECT_DATA.

### `light.three_point` — Iluminación de tres puntos

Principal y relleno delante (uno a cada lado) y contraluz detrás, vistos desde la cámara.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `fill_weaker` | bool | El relleno es más suave |  | `True` |

Se vuelve a revisar con: OBJECT_ADDED, OBJECT_TRANSFORM, OBJECT_DATA.

### `render.done` — Render hecho (F12)

El alumno ya hizo al menos un render final con F12.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `min` | int | Renders mínimos |  | `1` |

Se vuelve a revisar con: OBJECT_DATA.

### `render.engine` — Motor de render

El motor de render es EEVEE, Cycles o Workbench.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `engine` | text | Motor (EEVEE, CYCLES) |  | `EEVEE` |

Se vuelve a revisar con: OBJECT_DATA.

### `scene.camera_exists` — Cámara

La escena tiene cámara.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `equals` | int | Exactamente |  |  |
| `min` | int | Mínimo |  |  |
| `max` | int | Máximo |  |  |

Se vuelve a revisar con: OBJECT_ADDED.

### `scene.light_exists` — Luz

La escena tiene luces (de un tipo, si se indica: AREA, SUN, POINT, SPOT).

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `equals` | int | Exactamente |  |  |
| `min` | int | Mínimo |  |  |
| `max` | int | Máximo |  |  |
| `light_type` | light_type | Tipo de luz |  |  |

Se vuelve a revisar con: OBJECT_ADDED, OBJECT_DATA.

## Forma

### `figure.recognize` — Amatista reconoce la figura

Reconoce la figura del modelo de referencia sin roles: deduce qué es cada pieza por su forma, revisa que las piezas se apoyen, se toquen y vayan a los lados como en el modelo, que nada flote y dice qué figura parece. La exigencia sube con el nivel (forma identificable en el 1, medidas exactas en el 5); las piezas de adorno no restan.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `strictness` | text | Exigencia (forma, proporcion, cercana, medidas, exacta; vacío = la del nivel) |  |  |
| `min_score` | float | Parecido mínimo (0 a 1; vacío = el de la exigencia) |  |  |
| `parts` | reference | Piezas del modelo (de «reference») |  |  |
| `labels` | reference | Nombres de los roles (de «roles») |  |  |
| `flexible` | reference | Grupos con cantidad libre (de «reference») |  |  |
| `level` | reference | Nivel de la práctica (de «level») |  |  |
| `title` | reference | Nombre de la figura (de «reference.title») |  |  |

Se vuelve a revisar con: OBJECT_TRANSFORM, OBJECT_ADDED, ROLE_CHANGED, OBJECT_DATA.

### `figure.resembles` — La figura se parece al modelo

Compara la figura con el modelo de referencia de la práctica («reference»): mismas piezas, tamaños y lugares parecidos (±tolerancia) y proporciones de la figura. No pide medidas exactas; acepta la figura más grande o chica, girada o en espejo.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `tolerance` | float | Holgura de medidas (0.35 = ±35 %) |  | `0.35` |
| `min_score` | float | Parecido mínimo (0 a 1) |  | `0.7` |
| `scale_range` | float | Veces más grande o chica permitido |  | `2.5` |
| `parts` | reference | Piezas del modelo (de «reference») |  |  |
| `labels` | reference | Nombres de los roles (de «roles») |  |  |
| `flexible` | reference | Grupos con cantidad libre (de «reference») |  |  |

Se vuelve a revisar con: OBJECT_TRANSFORM, OBJECT_ADDED, ROLE_CHANGED, OBJECT_DATA.

### `shape.proportion` — Proporción

El objeto mide en un eje al menos N veces su otra medida mayor (alargado).

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `axis` | axis | Eje |  | `z` |
| `min_ratio` | float | Veces como mínimo |  | `2.0` |
| `max_ratio` | float | Veces como máximo |  |  |

Se vuelve a revisar con: OBJECT_TRANSFORM, OBJECT_ADDED, ROLE_CHANGED, OBJECT_DATA.

### `shape.thinnest_axis` — Eje más delgado

El lado más delgado del objeto está en un eje (x, y, z u horizontal): ruedas de pie, tablas planas.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `axis` | text | Eje (x, y, z, horizontal) |  | `horizontal` |
| `max_ratio` | float | Delgadez máxima |  | `0.6` |

Se vuelve a revisar con: OBJECT_TRANSFORM, OBJECT_ADDED, ROLE_CHANGED, OBJECT_DATA.

## Lógica

### `logic.any` — Una de varias opciones

Pasa si se cumple cualquiera de las opciones (cada una es un validador con sus parámetros).

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `options` | options | Opciones | sí |  |

Se vuelve a revisar con: OBJECT_ADDED, OBJECT_TRANSFORM, OBJECT_MODIFIER, OBJECT_DATA, FILE_SAVED, ROLE_CHANGED.

## Malla

### `mesh.face_count` — Caras

Cantidad de caras de la malla.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `equals` | int | Exactamente |  |  |
| `min` | int | Mínimo |  |  |
| `max` | int | Máximo |  |  |

Se vuelve a revisar con: OBJECT_DATA.

### `mesh.no_duplicates` — Malla sin vértices encimados

No hay vértices duplicados (E y cancelar). Úsalo como vigilante con el arreglo merge_by_distance.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `max` | int | Máximo permitido |  | `0` |

Se vuelve a revisar con: OBJECT_DATA.

### `mesh.one_side` — Solo una mitad

La malla base vive de un solo lado del eje: el modificador Espejo dibuja la otra mitad.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `axis` | axis | Eje |  | `x` |
| `side` | text | Lado (negative, positive, any) |  |  |
| `tolerance` | int | Vértices de tolerancia |  | `0` |

Se vuelve a revisar con: OBJECT_DATA.

### `mesh.vertex_count` — Vértices

Cantidad de vértices de la malla.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `equals` | int | Exactamente |  |  |
| `min` | int | Mínimo |  |  |
| `max` | int | Máximo |  |  |

Se vuelve a revisar con: OBJECT_DATA.

### `modifier.configured` — Modificador configurado

Modificador con sus ajustes: eje del espejo, niveles de subdivisión y encendido.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `modifier` | modifier | Modificador | sí |  |
| `axis` | axis | Eje del espejo |  |  |
| `only_axis` | bool | Solo ese eje |  |  |
| `min_levels` | int | Niveles mínimos |  |  |
| `max_levels` | int | Niveles máximos |  |  |
| `enabled` | bool | Encendido |  | `True` |

Se vuelve a revisar con: OBJECT_MODIFIER.

### `modifier.exists` — Modificador

Los objetos tienen un modificador (BEVEL, MIRROR, ARRAY...).

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `modifier` | modifier | Modificador | sí |  |

Se vuelve a revisar con: OBJECT_MODIFIER.

## Materiales

### `material.distinct` — Materiales distintos

Cantidad de materiales distintos que pintan caras (equals, min, max).

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `equals` | int | Exactamente |  |  |
| `min` | int | Mínimo |  |  |
| `max` | int | Máximo |  |  |

Se vuelve a revisar con: OBJECT_DATA.

### `material.exists` — Material

Los objetos tienen material asignado.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `material` | text | Nombre del material contiene |  |  |

Se vuelve a revisar con: OBJECT_DATA.

### `material.matches` — Material con propiedades

Hay materiales con Metálico, Rugosidad, Transmisión o Alfa en un rango (metal brillante, vidrio…).

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `metallic_min` | float | Metálico mínimo |  |  |
| `metallic_max` | float | Metálico máximo |  |  |
| `roughness_min` | float | Rugosidad mínima |  |  |
| `roughness_max` | float | Rugosidad máxima |  |  |
| `transmission_min` | float | Transmisión mínima |  |  |
| `alpha_max` | float | Alfa máximo |  |  |
| `count` | int | Cuántos materiales |  | `1` |
| `label` | text | Nombre para el alumno |  |  |

Se vuelve a revisar con: OBJECT_DATA.

## Objetos

### `object.count` — Cantidad de objetos

Cuenta los objetos que cumplen el selector.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `equals` | int | Exactamente |  |  |
| `min` | int | Mínimo |  |  |
| `max` | int | Máximo |  |  |

Se vuelve a revisar con: OBJECT_ADDED, ROLE_CHANGED.

### `object.exists` — Objeto existe

Hay al menos un objeto que cumple el selector.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |

Se vuelve a revisar con: OBJECT_ADDED, ROLE_CHANGED.

## Organización

### `collection.contains` — Colección

Una colección contiene objetos (opcionalmente de un rol).

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `collection` | collection | Colección | sí |  |
| `role` | role | Rol |  |  |
| `equals` | int | Exactamente |  |  |
| `min` | int | Mínimo |  |  |
| `max` | int | Máximo |  |  |

Se vuelve a revisar con: OBJECT_ADDED, OBJECT_DATA, ROLE_CHANGED.

## Relaciones

### `spatial.below` — Debajo de

Los objetos quedan debajo de otro (por ejemplo, patas bajo la cubierta).

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `reference_role` | role | Rol de referencia | sí |  |
| `tolerance` | float | Tolerancia |  | `0.02` |

Se vuelve a revisar con: OBJECT_TRANSFORM, OBJECT_ADDED, ROLE_CHANGED, OBJECT_DATA.

### `spatial.grounded` — Apoyado en el suelo

La parte más baja del objeto queda a una altura (0 = el suelo).

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `height` | float | Altura |  | `0.0` |
| `tolerance` | float | Tolerancia |  | `0.05` |

Se vuelve a revisar con: OBJECT_TRANSFORM, OBJECT_ADDED, ROLE_CHANGED, OBJECT_DATA.

### `spatial.on_top` — Encima de

Cada objeto descansa encima de uno de referencia (un techo sobre su casa), no a un lado.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `reference_role` | role | Rol de referencia |  |  |
| `reference` | text | Nombre de referencia |  |  |
| `reference_primitive` | primitive | Primitiva de referencia |  |  |
| `tolerance` | float | Holgura (parte de la altura del objeto) |  | `0.25` |

Se vuelve a revisar con: OBJECT_TRANSFORM, OBJECT_ADDED, ROLE_CHANGED, OBJECT_DATA.

### `spatial.touching` — Toca a

Cada objeto toca (por su caja) al menos un objeto de referencia: piezas ensambladas.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `reference_role` | role | Rol de referencia |  |  |
| `reference` | text | Nombre de referencia |  |  |
| `reference_primitive` | primitive | Primitiva de referencia |  |  |
| `tolerance` | float | Tolerancia |  | `0.05` |

Se vuelve a revisar con: OBJECT_TRANSFORM, OBJECT_ADDED, ROLE_CHANGED, OBJECT_DATA.

## Roles

### `role.count` — Cantidad por rol

Cantidad de objetos con un rol (exactamente, mínimo o máximo).

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol | sí |  |
| `equals` | int | Exactamente |  |  |
| `min` | int | Mínimo |  |  |
| `max` | int | Máximo |  |  |

Se vuelve a revisar con: OBJECT_ADDED, ROLE_CHANGED.

### `role.exists` — Rol asignado

Algún objeto tiene el rol educativo.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol | sí |  |

Se vuelve a revisar con: OBJECT_ADDED, ROLE_CHANGED.

## Transformaciones

### `dimension.approx` — Medida aproximada

Una medida queda CERCA de un valor (±tolerancia), en un eje o en su lado más largo o más corto.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `axis` | text | Eje (x, y, z, largest, smallest) |  | `largest` |
| `value` | float | Valor aproximado | sí |  |
| `tolerance` | float | Holgura (0.35 = ±35 %) |  | `0.35` |

Se vuelve a revisar con: OBJECT_TRANSFORM, OBJECT_ADDED, ROLE_CHANGED, OBJECT_DATA.

### `dimension.range` — Dimensión

La medida en un eje queda entre un mínimo y un máximo.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `axis` | axis | Eje |  | `z` |
| `min` | float | Mínimo |  |  |
| `max` | float | Máximo |  |  |

Se vuelve a revisar con: OBJECT_TRANSFORM, OBJECT_ADDED, ROLE_CHANGED, OBJECT_DATA.

### `object.position` — Posición

La ubicación en un eje queda entre un mínimo y un máximo.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `axis` | axis | Eje |  | `z` |
| `min` | float | Mínimo |  |  |
| `max` | float | Máximo |  |  |

Se vuelve a revisar con: OBJECT_TRANSFORM, OBJECT_ADDED, ROLE_CHANGED.

### `object.rotation` — Rotación

El giro (en grados) en un eje queda entre un mínimo y un máximo.

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |
| `axis` | axis | Eje |  | `z` |
| `min` | float | Mínimo |  |  |
| `max` | float | Máximo |  |  |

Se vuelve a revisar con: OBJECT_TRANSFORM, OBJECT_ADDED, ROLE_CHANGED.

### `transform.scale_applied` — Escala aplicada

La escala del objeto es 1 en los tres ejes (Ctrl+A › Escala).

| Parámetro | Tipo | Qué es | Obligatorio | Por defecto |
|---|---|---|---|---|
| `role` | role | Rol |  |  |
| `name` | text | Nombre exacto |  |  |
| `name_prefix` | text | Nombre empieza con |  |  |
| `type` | object_type | Tipo de objeto |  |  |
| `primitive` | primitive | Primitiva (cube, cylinder…) |  |  |

Se vuelve a revisar con: OBJECT_TRANSFORM, OBJECT_ADDED, ROLE_CHANGED.
