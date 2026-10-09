# 11 · Reconocer figuras (motor 3.4)

Hasta el motor 3.3 el alumno tenía que decirle a Amatista qué era cada pieza («esta es una rueda») y `figure.resembles` comparaba medidas con ±35 %. Eso tenía dos problemas: el alumno pasaba tiempo en la pestaña Amatista en vez de modelar, y una figura podía cumplir las medidas sin tener sentido (las ruedas de un solo lado, la chimenea flotando).

`figure.recognize` reconoce la figura como lo haría una persona: por sus partes simples **y** por cómo se relacionan (reconocimiento por componentes, Biederman 1987). El código vive en [`engine/amatista_engine/figures/reconocer.py`](../../../engine/amatista_engine/figures/reconocer.py) y el validador en [`validators/recognize.py`](../../../engine/amatista_engine/validators/recognize.py).

## Las tres preguntas

1. **¿Qué es cada pieza?** (`inferir_roles`). Cada malla sin rol toma el rol de la pieza del modelo que más se le parece: misma familia de primitiva (cubo, cilindro, esfera…) y proporciones parecidas, sin importar el tamaño. Una pieza mucho más chica o más grande que todas las del modelo (más de 4 veces) es un **adorno**. Los roles que el alumno puso a mano se respetan.
2. **¿Tiene sentido?** (`relaciones_del_modelo` y `revisar`). Del modelo se deducen solas las relaciones:

   | Relación | Qué pide | Crítica |
   |---|---|---|
   | `suelo` | la pieza toca el suelo (ruedas, patas) | sí |
   | `encima` | va apoyada sobre otra (chimenea sobre la locomotora) | sí |
   | `toca` | dos grupos se tocan (vagones unidos) | no |
   | `lados` | un grupo se reparte a los dos lados (ruedas a izquierda y derecha) | sí |
   | `flota` | nada queda en el aire (si el modelo no tiene piezas flotando) | sí |

   Una relación **crítica** rota no pasa en ningún nivel: es lo que hace que la figura «no tenga sentido». Las demás bajan el porcentaje.
3. **¿Qué figura es?** (`identificar`). Si la forma no se parece y hay al menos tres mallas, se compara con la [biblioteca](../../../engine/amatista_engine/figures/biblioteca.json) (mesa, silla, casa, torre, coche, muñeco de nieve, tren): «Tu figura se parece más a «Mesa» (82 %) que a Tren de juguete (31 %)».

## Exigencia por nivel

`params.level` (lo pone el cargador con el nivel de la práctica) elige el perfil; `reference.strictness` lo fija a mano.

| Nivel | Perfil | Medidas | Parecido mínimo | Escala real |
|---|---|---|---|---|
| 1 | `forma` | ±60 % | 55 % | libre |
| 2 | `proporcion` | ±45 % | 65 % | libre |
| 3 | `cercana` | ±35 % (o la `tolerance` del modelo) | 70 % | libre |
| 4 | `medidas` | ±20 % | 80 % | ±25 % del tamaño del modelo |
| 5 | `exacta` | ±10 % | 88 % | ±10 % |

Al nivel 1 le basta una forma identificable: una chimenea exagerada sigue siendo un tren. Desde el 2 cuenta la proporción y en el 4 y 5 el tamaño en metros («Tu figura mide cerca de 6.4 m de largo y el modelo 4.0 m: en este nivel las medidas cuentan, redúcela con S»).

**Libertad creativa:** los adornos (un faro, una bandera) no restan y el mensaje lo dice («Tus 2 piezas de adorno no cuentan»).

## En la práctica

```json
{"id": "figura", "title": "Amatista reconoce tu tren", "validator": "figure.recognize", "params": {}, "weight": 20}
```

El cargador inyecta las piezas del modelo, el nivel, el título y las etiquetas desde `reference`; al volver a escribir la práctica no se guardan en el objetivo. Campos nuevos de `reference`:

- `strictness`: `forma`, `proporcion`, `cercana`, `medidas` o `exacta` (vacío = según el nivel).
- `autoRoles`: `true`/`false`. Sin el campo, el motor deduce roles solo en las prácticas que tienen un `figure.recognize`. Con roles deducidos, los demás objetivos (`role.count`, `spatial.on_top`…) también se cumplen sin poner roles, y la guía deja de pedir «asígnale el rol».

`EvaluationReport.inferred_roles` lleva lo deducido; el add-on lo muestra en el panel de roles («Rueda (por su forma)», «Adorno»).

Motor 3.5: el resultado trae `details.checklist`, la lista del instructor con cada pieza del modelo («Chimenea: falta», con la primitiva que hay que agregar) y las relaciones rotas. Para figuras hechas en **una sola malla** (la espada) está `figure.silhouette`: [13_instructor_y_silueta.md](13_instructor_y_silueta.md).

Usan `figure.recognize` como objetivo propio: el tren y el muñeco de nieve (principiante, módulo 1) y el puente (intermedio, módulo 1). Desde el motor 3.5, además, toda práctica cuyo ejemplo resuelto use el paso `referencia` revisa la figura con `figure.recognize` (o con la silueta si las piezas están unidas) dentro de «Tu práctica coincide con el ejemplo»: la aldea, la nave, el diorama… Ver [14_ejemplo_y_revision.md](14_ejemplo_y_revision.md). `figure.resembles` sigue disponible, aunque ninguna práctica del plan lo usa ya.

## Pruebas

- [`engine/tests/test_reconocer.py`](../../../engine/tests/test_reconocer.py): 33 casos (niveles, con y sin roles, figuras sin sentido que no pasan en ningún nivel, mensajes, adornos, escala real, identificación y biblioteca).
- `pruebas.json` del tren: sin roles, con adornos y con la chimenea flotando.
- Cada evaluación tarda 2 a 3.5 ms: alcanza para revisar en vivo en Blender.
