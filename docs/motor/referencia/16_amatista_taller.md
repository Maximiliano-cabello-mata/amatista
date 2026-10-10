# 16 · Amatista Taller (motor 5, add-on 5.0)

Amatista Taller es la reestructuración del motor y del add-on que propuso la investigación [«Un add-on que enseñe»](../../investigacion/2026-10-10_addon_de_ensenanza/README.md). Antes la unidad era la práctica: un proyecto largo con misiones. Ahora la unidad es la **habilidad** (agregar una forma, mover en un eje, extruir, poner un material…). El motor sabe qué sabe hacer cada alumno, no solo qué práctica terminó, y Blender, la plataforma y el servidor trabajan sobre el mismo plan.

## 1. El ciclo de cada habilidad

```
Mira → Hazlo conmigo → Hazlo tú → Úsalo → Recuérdalo
```

| Paso | Qué hace el alumno | Ayuda |
|---|---|---|
| **Mira** | Amatista hace la habilidad en su vista 3D con las teclas en pantalla (30 a 60 s). Una vez por habilidad. | — |
| **Hazlo conmigo** | La hace él dentro de un **molde** translúcido, con la herramienta iluminada. | teclas a un clic (habilidad nueva) o a pedido |
| **Hazlo tú** | Otra variación corta, sin molde y sin teclas. | «qué falta» y «con qué» |
| **Úsalo** | El proyecto del módulo (la práctica de siempre: el tren, la espada…), que queda en **Mi isla**. | molde del proyecto en los niveles 1 y 2 |
| **Recuérdalo** | Un reto de un minuto días después, sin ayuda. Opcional: nunca bloquea. | solo «qué falta» |

Se aprende una habilidad a la vez, en el orden del taller. Queda **lista** cuando se hace sola y al menos una vez salió sin ninguna ayuda; lo que ya está listo no se vuelve a pedir. Cuando todas las habilidades del taller se hacen solas se abre el proyecto, y al terminarlo, el reto del módulo (sin molde).

Código: `engine/amatista_engine/taller/` (Python puro). `planear()` devuelve el `Plan` del taller: `actual` (la actividad de ahora), `siguientes` (hasta 3), cada habilidad con su fase, `repasos` vencidos y `puede_probar`.

## 2. El modelo del alumno (`taller/modelo.py`)

Por habilidad y alumno se guarda P(L), la probabilidad de que la sepa, con el rastreo bayesiano del conocimiento (BKT) más dos ajustes de la investigación:

- **La ayuda cuenta.** Acertar con el molde o con la pista 1 o 2 sube la probabilidad de adivinar (G + 0.10 por el molde, + 0.08 por pista, hasta 0.5). Acertar después de ver las teclas o «Mírame» solo suma la oportunidad de aprender (la mitad), no la evidencia de que ya sabe.
- **Lo que no se repasa se olvida.** P(L) baja con los días y baja más despacio cuanto más alta es su caja de Leitner (1, 3, 7, 14 y 30 días). Un repaso bien hecho sin ayuda sube de caja; uno fallido la devuelve a la 1.

| P(L) | Fase | Qué toca |
|---|---|---|
| < 0.3 | nueva | Mira y Hazlo conmigo (teclas a un clic) |
| 0.3 a 0.7 | acompañada | Hazlo conmigo (teclas tras intentarlo) |
| 0.7 a 0.95 | sola | Hazlo tú |
| ≥ 0.95 | dominada | pasa al calendario de repaso |

Parámetros por defecto `L0 0.10 · T 0.12 · G 0.15 · S 0.10 · olvido 0.05`; cada habilidad puede traer los suyos en `bkt`.

**Camino rápido**: «¿Ya sabes esto? Demuéstralo» abre un reto sin ayuda de una habilidad que todavía no se practicó. Dos bien hechos la llevan a 0.9 y se salta su guía. **Saltar** una actividad cuenta como intento sin terminar; dos saltos seguidos de la misma habilidad pasan a otra del taller.

## 3. Las pistas con freno (`taller/ayudas.py`)

1. **Qué falta**, dicho sobre el modelo («la rueda todavía flota»).
2. **Con qué**: la herramienta se ilumina en la barra, sin la secuencia.
3. **Cómo**: las teclas. Antes hay que intentarlo 20 segundos o fallar una vez (el freno), salvo en una habilidad nueva.
4. **Mírame**: la demostración de esa pieza.

Sube de a un escalón y nunca hace el paso por el alumno. El techo depende de la fase: hasta «Mírame» en nueva y acompañada, hasta «Con qué» en sola, solo «Qué falta» en retos y repasos. Sin avance en 90 s o con tres deshacer seguidos, Amatista **ofrece** el siguiente escalón.

## 4. El molde (`taller/molde.py`)

En «Hazlo conmigo» (niveles 1 y 2) cada pieza del modelo se dibuja translúcida en su lugar. El revisor decide su estado, y el mensaje habla del modelo y nunca da números:

| Estado | Color en Blender | Cuándo |
|---|---|---|
| vacía | azul | todavía no hay nada |
| la que toca | ámbar (respira) | la siguiente pieza vacía o casi |
| llena | verde | una pieza del alumno con la misma forma la ocupa |
| casi | ámbar | la forma es la correcta pero está girada, le falta o le sobra tamaño, o va en otro lugar |
| equivocada | coral | hay algo en su lugar, pero es otra forma |

Holgura por nivel (sobre el tamaño de la pieza):

| Nivel | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Tamaño (veces) | 1.8 | 1.6 | 1.4 | 1.2 | 1.1 |
| Lugar | 1.0 | 0.8 | 0.6 | 0.45 | 0.3 |

Modo `molde`: importan el lugar y el tamaño. Modo `libre` (Hazlo tú, retos y repasos): la figura se acomoda sola (se centra, se apoya en el suelo, se prueba girada de a 90° y, hasta el nivel 3, se lleva al tamaño del modelo); importan la forma de cada pieza, sus proporciones y cómo se acomodan entre sí. En «Hazlo tú» con piezas de inicio solo se dibuja la **marca** (la huella en el suelo). El validador `taller.molde` usa este revisor para aprobar.

## 5. El catálogo `amatista.skill/1`

`practices/blender/habilidades.json`: 33 habilidades con 62 variaciones y 9 talleres (uno por módulo de Blender). `engine/tests/test_taller_catalogo.py` resuelve cada variación con su solución y revisa que cada habilidad tenga demo, reto y repaso.

```json
{
  "schema": "amatista.skill/1", "ruta": "blender", "titulo": "Habilidades de Blender",
  "habilidades": [{
    "id": "bl-mover", "titulo": "Mover y mirar", "nivel": 1,
    "que": "G mueve la pieza; X, Y o Z la dejan ir en un solo eje. Mira de frente (1) o desde arriba (7) para acertar.",
    "teclas": ["G", "X|Y|Z", "1|3|7"],
    "como": "G y luego el eje; mueve el ratón y confirma con clic.",
    "herramientas": ["transform.move", "view.numpad", "view.navigate"],
    "requiere": ["bl-agregar-primitivas"],
    "demo": {"pasos": [{"agregar": {"...": "..."}, "texto": "La caja flota"}, {"mover": {"objeto": "Caja", "eje": "z", "a": [0, 0, 1]}}]},
    "variaciones": [{
      "id": "baja", "pide": "La caja flota: bájala hasta que toque el suelo.", "minutos": 1,
      "molde": [{"primitive": "cube", "size": [2, 2, 2], "location": [0, 0, 1], "name": "Caja"}],
      "inicio": {"objetos": [{"primitive": "cube", "size": [2, 2, 2], "location": [0, 0, 3.5], "name": "Caja"}]}
    }],
    "reto": {"id": "torre", "pide": "Sin ayuda: apila la pelota encima de la caja.", "piezas": ["..."], "inicio": {"...": "..."}},
    "repaso": {"id": "al-suelo", "pide": "Un minuto: baja la caja al suelo.", "piezas": ["..."]}
  }],
  "talleres": [{
    "id": "blender.bp.m1", "curso": "blender_principiante", "modulo": 1, "nivel": 1,
    "titulo": "La interfaz y navegación 3D", "leccion": "bp1_blender",
    "habilidades": ["bl-agregar-primitivas", "bl-mover", "bl-escalar-eje", "bl-rotar", "bl-duplicar", "bl-guardar-archivo"],
    "proyecto": "blender.bp.m1.tren", "reto": {"id": "vehiculo", "pide": "...", "objetivos": ["..."]},
    "repasa": [],
    "isla": {"pieza": "La estación y el tren", "texto": "Tu tren llega a la estación de la isla.", "lugar": [-7, -4], "color": "#c0392b"}
  }]
}
```

- `pide` es una frase de hasta 25 palabras; `que` y `como` aparecen en la lección y en las pistas.
- `repasa` lista habilidades de talleres anteriores que este módulo vuelve a pedir (entran en «Recuérdalo»).
- El taller se enlaza al plan de estudios con `taller` en `practices/blender/cursos.json` (`ModuleEntry.taller`); `amatista-engine curriculo` revisa que curso, módulo y proyecto coincidan.

**Actividades**: cada una tiene un id que la vuelve a armar en cualquier lado: `mira:bl-mover`, `conmigo:bl-mover:baja` y `tu:bl-mover:<variación>`, `prueba:bl-mover`, `repaso:bl-mover:al-suelo`, `proyecto:blender.bp.m1` y `reto:blender.bp.m1`. Las que se revisan se convierten al vuelo en una práctica `amatista.practice/2` (`practica_de_actividad`) que evalúa el motor de siempre.

## 6. En Blender (add-on 5.0, `addon/amatista_blender/taller/`)

- **N › Amatista** muestra lo mínimo: el taller con «N de M habilidades listas», la actividad de ahora, «Continuar», «Pausa», «Pista», los repasos, «Mi isla» y «Abrir la plataforma». «¿Ya sabes esto? Demuéstralo» y «Otros módulos» quedan cerrados. Las pestañas del motor 4 siguen en el modo desarrollador y la vista previa.
- **La tarjeta** (`vista/tarjeta.py`), abajo al centro de la vista 3D: qué paso del ciclo es, qué hacer, lo que dice el molde, las teclas solo si se pidieron y hasta tres botones que se tocan con el ratón (un gizmo invisible por botón). Durante «Mira» las teclas salen grandes, al estilo screencast. Respeta «Animaciones» de las preferencias.
- **El molde** (`vista/molde.py`) se dibuja con gpu, sin crear objetos: el revisor nunca lo ve.
- **Una escena por actividad**: las actividades cortas pasan en «Amatista · Taller», que se vacía al empezar la siguiente. El proyecto abre su propia escena con su sincronización de siempre, y el trabajo del alumno nunca se toca.
- **Mi isla** (`isla.py`): al terminar un proyecto, sus mallas se guardan en `isla/<taller>.blend` y «Mi isla» arma la escena «Amatista · Mi isla» con cada pieza en su lugar. Se arma solo cuando el alumno la abre.
- **Sin conexión** (`datos.py`): `avance_taller_<cuenta>.json` en la carpeta del usuario guarda el modelo del alumno, lo terminado y la cola de intentos. Con cuenta vinculada, los intentos se mandan de a 50 y el estado que responde el servidor manda sobre el local.

## 7. En la plataforma

- La lección `*_blender` de cada módulo usa el bloque **`blender_taller`**: `{"type": "blender_taller", "id": "taller_1", "taller": "blender.bp.m1", "title": "…"}`. Muestra el ciclo, «Lo que sigue», las habilidades con su fase y, con Blender enlazado, **«Ahora en tu Blender»**: la actividad, el estado de la pieza, la pista y los botones que tienen sentido en ese momento (tres como máximo).
- En la lección del proyecto va con `"vista": "proyecto"`: una tarjeta corta con la pieza de la isla y el reto del módulo.
- La página del curso muestra **Tu isla** con un lugar por taller.
- Cada taller va una sola vez por módulo (`backend/contenido/validacion.py`).
- **Enlace en vivo**: órdenes `taller_abrir` (con `taller` y `actividad`), `taller_continuar`, `taller_pausa`, `taller_pista`, `taller_mirame`, `taller_probar` y `taller_repaso` (con `habilidad`), e `isla`. El latido de Blender trae `detalle.taller` (actividad, pieza, llenas de total, mensaje, pista, estado, habilidades y repasos), con límites de tamaño en `backend/api/enlace.py`.

## 8. En el servidor

| Ruta (`/api/addon/v1`) | Qué hace |
|---|---|
| `GET /habilidades` | El modelo del alumno, lo terminado y la hora del servidor. |
| `POST /habilidades/intentos` | Hasta 50 intentos. El servidor vuelve a calcular el modelo con el mismo motor; si el intento trae la foto de la escena, la revisa él y ese resultado cuenta. Un reenvío no cuenta dos veces. |
| `GET /talleres` | Un resumen por taller (curso, isla, habilidades listas). |
| `GET /talleres/{taller}` | El plan: la actividad de ahora, cada habilidad con su fase y los repasos. `?elegida=` para practicar otra. |

Oracle **012** (`backend/sql/012_taller.sql`) agrega 10 columnas anulables a `HABILIDADES_ALUMNO` (dominio, intentos, aciertos, sin ayuda, caja, próximo repaso…) y crea `TALLERES_ALUMNO`. Sin 012 las lecturas responden vacío con `"guardado": false` y los intentos reciben 503, así que el add-on los guarda y los vuelve a mandar. Al arrancar, el backend registra las 33 habilidades en `HABILIDADES`. Pasos de producción: [guía de actualización](../../despliegue/2026-10-10_amatista_taller_motor_5.md).

## 9. Pruebas

- `engine/tests/test_taller.py` y `test_taller_catalogo.py`: modelo del alumno, escalera, molde, plan y las 33 habilidades con su solución.
- `backend/tests/test_taller.py`: intentos revisados por el servidor, reenvíos, rechazos con motivo, plan, sin 012, órdenes, detalle en vivo y el bloque `blender_taller`.
- `frontend/src/blender/taller.test.js`: el ciclo, los botones según el estado y la isla.
- `addon/tests/en_blender.py`: el taller completo en Blender 5.0.1 sin ventana.

Falta probar en Blender con ventana: los clics de la tarjeta, el dibujo del molde y el tiempo de «Mira».
