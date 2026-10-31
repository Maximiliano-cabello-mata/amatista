# Amatista Motor 7 «Guion»: avanza con lo que hay en tu escena

31 de octubre de 2026 · add-on 7.0.0 · tareas T-176 a T-179 · **sin SQL** (el siguiente libre sigue siendo 013).

Lo pidió el creador al probar el 6.2:

> El motor siempre habla de una herramienta que brilla a la izquierda y ninguna brilla. Las instrucciones son vagas, los paneles y los cuadros se encimaban y no había señales correctas. Si el alumno ya terminó la práctica (el tren), no avanza hasta que la herramienta de la izquierda esté bien. Que funcione sincronizado, que de verdad enseñe desde la interfaz de Blender. Y yo, como administrador, no tengo por qué llevar progreso: que todo empiece de cero cada que entro.

## 1. Qué estaba mal (comprobado en Blender sin ventana)

| # | Falla | Dónde | Qué sentía el alumno |
| --- | --- | --- | --- |
| 1 | **«La herramienta que brilla a la izquierda»** era un texto fijo de la pista «Con qué» (`taller/ayudas.py`), dicho aunque nada brillara: el brillo dibujaba un borde alrededor de la barra entera, el modo enfocado **escondía la barra de herramientas** (`enfoque.py`) y Agregar o Guardar no viven en esa barra. | `ayudas.py`, `enfoque.py`, `brillo.py` | «¿Cuál brilla? No veo nada.» |
| 2 | **La instrucción era el lema del proyecto** («Tu tren llega a la estación de la isla.») en cada paso, mientras el motor revisaba otra cosa (las ruedas). | `taller/sesion.py` | «¿Qué tengo que hacer ahora?» |
| 3 | **Una compuerta escondida**: el objetivo automático «ejemplo» (ver el modelo de muestra) era obligatorio y quedaba al final; con todo el tren hecho, la práctica no se cerraba. | `practice/loader.py` | «Ya lo terminé y no avanza.» |
| 4 | **Pistas que no ayudan**: «va un poco más adelante», «le falta altura», y al tercer nivel «Aquí no hay más pistas: tú puedes». | `validators/shape.py`, `ayudas.py` | «¿Cuánto es un poco?» |
| 5 | **Varias voces a la vez**: tarjeta, HUD, brillo, ficha y panel del taller hablaban de cosas distintas, y la tarjeta de abajo se tapaba con «Ajustar última operación». | `interfaz/turno.py`, `taller/vista/` | «Hay demasiados cuadros.» |
| 6 | **No se revisaba a tiempo**: guardar el archivo o deshacer no volvía a evaluar hasta el siguiente cambio en la escena. | `practicas.py` | «Ya guardé y sigue diciendo que guarde.» |

## 2. Las simulaciones

`addon/tests/simular_alumnos.py` arma el tren en Blender sin ventana con 100 alumnos sintéticos (semilla 2026): cada uno con su orden, sus proporciones, sus errores típicos (ruedas sueltas, chimenea flotando, vagones separados, sin aplicar escala, sin nombre) y su forma de pedir pistas. Un «profesor» con rúbrica dice si el tren está aceptable, y un seguidor obedece las pistas como lo haría un alumno.

```
python addon/tests/simular_alumnos.py --motor 6 --n 100 --semilla 2026 --salida s6.json   # main (6.2)
python addon/tests/simular_alumnos.py --motor 7 --n 100 --semilla 2026 --salida s7.json   # esta rama
```

| De 100 alumnos | Motor 6.2 | Motor 7 |
| --- | ---: | ---: |
| Terminan el tren | **24** | **99** |
| Leen «brilla a la izquierda» sin que nada brille | 76 | 0 |
| La instrucción no coincide con lo que se revisa | 82 (605 veces) | 0 |
| Instrucción vaga (el lema en vez de un paso) | 100 (1259 veces) | 0 |
| Agotan las pistas sin saber qué hacer | 76 | 0 |
| El profesor lo acepta y Amatista no avanza | 15 | 0 |

El único del motor 7 que no termina (semilla 2089) pone las ruedas en el eje Y; recibió las pistas correctas («"Cylinder.006" está separado de "Vagón": acércalo con G…», con la pieza seleccionada y Mover elegida) y el seguidor de la simulación no sabe girarlas. La superposición de paneles no se puede medir sin pantalla: se resolvió por diseño (punto 5) y se revisa en la prueba con ventana.

## 3. El guion (motor, Python puro)

`engine/amatista_engine/guion/`, probado en `engine/tests/test_guion.py`.

- **`pasos.py`**: los objetivos de la práctica en orden (respetando `requires`) se vuelven **pasos** con un verbo: «Agrega 8 cilindros y llámalos «Rueda»», «Estira cada vagón a lo largo…». Si el `tip` no dice qué hacer, se arma la frase desde el validador. Los objetivos opcionales no son pasos.
- **`avance.py`**: un paso está hecho **si su objetivo pasa en la escena**, sin importar el orden ni la herramienta que usaste. El paso actual es el primero que falta; `por_que` es el mensaje real del validador. Detecta lo recién hecho y lo que se deshizo.
- **`pistas.py`**: tres pistas siempre del paso actual: **¿Qué falta?** (el mensaje del validador), **¿Dónde está?** (el lugar real de la herramienta) y **¿Cómo se hace?** (los pasos y las teclas).
- **`donde.py`**: una tabla con el lugar real de cada herramienta: barra de herramientas (Mover, Rotar, Escalar…), menú (Agregar en la cabecera de la vista 3D, Objeto), pestaña de Propiedades (Material, Modificadores), ventana (Guardar como, arriba de todo; F12) o tecla. Ninguna frase dice «brilla».
- Mensajes con números en lugar de «un poco»: ««Vagón» todavía es corto en X (1.2 veces su ancho (Y)): estíralo con S y luego X hasta pasar de N veces.»
- El objetivo «ejemplo» es opcional cuando hay otros objetivos (`practice/loader.py`).

## 4. En Blender (add-on 7.0)

`addon/amatista_blender/guion/`.

- **Sincronizado**: se revisa 0,15 s después de cada cambio en la escena (`depsgraph_update_post`), al guardar (`save_post`), al deshacer o rehacer y al abrir un archivo. El paso avanza solo con el resultado; deshacer lo regresa.
- **Una sola voz** (`interfaz/turno.py` › `GUION`): con el guion activo se callan la tarjeta, el HUD, el brillo y la ficha; el panel del taller cede su lugar. Quedan dos cosas:
  - la **banda** (`banda.py`): arriba al centro de la vista 3D, entre la barra de herramientas y la barra lateral, sin botones: paso N de M, qué hacer y por qué falta;
  - el panel **N › Amatista › Paso a paso** (`panel.py`), con botones nativos de Blender: las tres pistas, «Abrir «Guardar como»» con el nombre sugerido, «Mírame hacerlo» y la lista de pasos con ✓.
- **Señales honestas** (`senalar.py`): «¿Dónde está?» muestra la barra de herramientas y **deja elegida** la herramienta (Blender pinta su botón); el texto dice «Te dejé elegida «Mover»: es el botón resaltado…» **solo después de comprobar** que quedó elegida. Para un menú lo abre junto al ratón; para Material o Modificadores abre esa pestaña de Propiedades; «¿Qué falta?» selecciona las piezas nombradas en el mensaje.
- El modo enfocado ya no esconde la barra de herramientas.
- El molde de las actividades cortas del taller se sigue dibujando; en los proyectos (el tren) no estorba.
- El latido manda el paso actual (`titulo`, `objetivo`, `numero`, `total`) para que la plataforma muestre lo mismo.
- Preferencia **«Guion paso a paso»** (encendida por defecto) para volver al taller del motor 6 si hace falta.

## 5. El administrador practica sin progreso

Toda cuenta con rol `admin` prueba las prácticas como un alumno nuevo, las veces que quiera:

- **Add-on**: `ajustes.sin_progreso()`. El avance del taller y del aprendizaje vive en memoria y empieza de cero en cada sesión; no se guarda en el equipo ni se manda al servidor. El panel lo dice («Cuenta de administrador: esto no se guarda en tu progreso»).
- **Backend** (`api/dependencias.py` › `sin_progreso`): `POST /api/progreso`, `/api/sincronizar`, `/api/addon/v1/intentos` y `/habilidades/intentos` responden `sin_progreso: true` sin guardar nada (los intentos se evalúan igual, para probar); `GET /api/progreso`, `/mi-progreso`, `/habilidades` y `/talleres` vuelven vacíos. Probado en `backend/tests/test_sin_progreso.py`.
- **Plataforma** (`progreso/reglas.js` › `esSinProgreso`): al entrar se borra el progreso guardado en el equipo para esa cuenta, el progreso anónimo del equipo no se une a ella, y lo que haga vive en memoria hasta recargar o volver a entrar.

## 6. Pruebas

| Qué | Dónde |
| --- | --- |
| Guion en Python puro | `engine/tests/test_guion.py` (10 pruebas) |
| Guion en Blender sin ventana: el tren paso a paso, señales, guardar, deshacer, banda y panel, actividad corta y administrador | `addon/tests/en_blender.py` › `probar_motor7` |
| Que no vuelva el «brilla a la izquierda», ni la barra escondida | `addon/tests/test_addon_motor7.py` |
| 100 alumnos simulados | `addon/tests/simular_alumnos.py` |
| Administrador sin progreso (API) | `backend/tests/test_sin_progreso.py` |

Falta la prueba con ventana (T-178) y el despliegue (T-179): guía en `docs/despliegue/2026-10-31_motor_7.md`.
