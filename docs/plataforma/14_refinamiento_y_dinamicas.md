# Refinamiento de la plataforma y dinámicas v4.3 (30 de octubre de 2026)

Pedido del creador, después de practicar varios días en la plataforma: «el motor de Blender no es nada intuitivo», «a la hora de abrir Blender no lo abre», «los botones aún no están muy claros, hay botones muy pequeños (por ejemplo, para ver el curso básico o intermedio)» y «que Amatista sea parte de Blender, no un add-on cualquiera». También: investigar y mejorar los gráficos, agregar dinámicas nuevas y pulir lo que ya hay. Tareas T-132 a T-136.

## 1. Lo que se encontró

| Dónde | Qué le pasa a un alumno nuevo | Causa |
|---|---|---|
| Lección › «Abrir en Blender» | Con Blender cerrado no pasa nada: «Tu Blender no respondió». | La orden solo llega a un Blender **ya abierto** (el enlace en vivo late cada 5 s). Nadie arrancaba Blender. |
| Blender › add-on | No encuentra Amatista: «pulsa N › pestaña Amatista». | Todo vivía en la barra lateral, que viene cerrada y que un principiante no sabe abrir. |
| Curso › niveles | Las tarjetas de nivel se ven como pestañas chicas: «Disponible» en 10 px. | Etiquetas de máquina (monoespaciada, mayúsculas, 10 px) en lugar de botones. |
| Camino, curso, lección | «ABRIR ▸», «JUGAR ▶», «VER LECCIONES ▾»: texto, no botones. | 227 etiquetas `font-mono text-[9-11px] uppercase` y ningún componente de botón común. |
| Barra superior | «CURSOS · MI PANEL» en 12 px monoespaciada. | El mismo estilo de etiqueta para navegar. |

## 2. «Abrir en Blender» abre Blender (add-on 5.4)

- El instalador (`addon/herramientas/instalador/instalar_en_blender.py`) y el add-on al arrancar registran el enlace **`amatista://`** para el Blender del alumno: Windows (clave en `HKCU\Software\Classes\amatista`, con `blender-launcher.exe` para no abrir la consola), macOS (la app «Amatista para Blender» en `~/Applications`, hecha con `osacompile`) y Linux (`~/.local/share/applications/amatista-blender.desktop`, con Flatpak y Snap). Código: `addon/amatista_blender/protocolo.py`.
- La plataforma primero manda la orden por el enlace en vivo. Si **ningún Blender abierto la recibió**, abre `amatista://practica/<id>`, `amatista://taller/<id>?actividad=<id>`, `amatista://isla` o `amatista://recorrido/<id>` (`frontend/src/services/lanzador.js`). El sistema arranca Blender con `-- --amatista <dirección>` y el add-on abre la actividad al arrancar (`integracion.py › orden_de_inicio`).
- Mientras tanto la lección muestra **«Abriendo Blender…»** y pregunta por el enlace cada 3 s hasta verlo en línea (`blender/useLanzador.js`). A los 25 s sin Blender, **«¿No se abrió Blender?»** con los dos arreglos: instalar el 5.4 o abrir Blender y elegir Amatista › «Reparar “Abrir en Blender”». Componente `components/blender/AvisoLanzador.jsx`.
- La página Blender suma **«¿Ya instalaste? Pruébalo»** con «Abrir Blender ahora».
- **Seguridad**: cualquier página puede pedir un `amatista://`. La dirección solo elige **qué actividad** abrir, con ids `[A-Za-z0-9._:-]`; nunca rutas de archivo ni código (`addon/tests/test_protocolo.py`). El peor caso es que una página ajena abra Blender en una práctica de Amatista.

## 3. Amatista dentro de Blender (add-on 5.4)

Detalle en `docs/motor/referencia/18_amatista_dentro_de_blender.md`. En resumen, Amatista aparece donde el alumno ya mira:

- **Menú Amatista** en la barra de arriba, junto a Archivo · Editar · Render · Ventana · Ayuda.
- **Botón Amatista** en la cabecera de la vista 3D con lo que toca ahora («Amatista · Hazlo conmigo · 2 de 5»); al pulsarlo se despliega el taller completo, sin la tecla N.
- **Barra de estado**: la actividad de ahora, como Blender muestra los atajos de la herramienta.
- **Espacio de trabajo «Amatista»**: una pestaña junto a Layout, Modeling… Al abrir una práctica o un taller, Blender pasa a ella con la barra lateral ya abierta en Amatista. Se apaga en Preferencias.

## 4. Botones que se ven como botones (Facetas 4.1)

Reglas nuevas del sistema «Facetas» (`frontend/src/index.css`, sección «v4.1 · Facetas: botones»):

1. **Un botón se ve como botón**: fondo, borde, esquina cortada y **44 px de alto mínimo** (52 px el grande, 36 px el chico). Nada de acciones escritas como etiqueta.
2. **Texto en frase y en Outfit**, no en mayúsculas monoespaciadas: «Empezar», «Ver el curso», «Siguiente lección».
3. **La flecha avanza** al pasar el ratón (`.boton__flecha`): dice «esto te lleva a otro lugar». Hacia abajo, despliega.
4. **Una acción principal por bloque**, con el color de lo que hace: `boton--primario` (neón, seguir el camino), `boton--amatista` (lecciones, cuenta), `boton--blender` (todo lo que pasa en Blender), `boton--secundario` y `boton--fantasma` (lo opcional).
5. Las clases viven en `@layer components`: una clase de Tailwind puede ajustar un botón puntual sin pelear con la especificidad.

Aplicado en: `BOTON_PRINCIPAL` / `BOTON_SECUNDARIO` de todas las actividades, el camino de Inicio (cada paso con «Ver lecciones» y su acción), el curso (la lección que toca dice «Empezar» como botón; «Conectar Blender»; «¿Dudas? Ayuda»), la lección («Completar lección», «Anterior: …», «Ir a la actividad pendiente»), el recorrido guiado, la guía, Mi panel y la barra superior (**Cursos · Mi panel** en 15 px con la página actual subrayada por la gema).

**Elegir nivel**: cada nivel es una tarjeta grande (`.nivel-tarjeta`) con su número, el nombre, **para quién es** («Nunca abriste Blender: empiezas aquí»), la barra de avance y «Estás aquí», «Ver nivel ▸» o «Pronto». Encima, «Elige tu nivel · empieza por el 1 si nunca usaste el programa».

**Legibilidad**: las etiquetas de 9 y 10 px pasan a 10 y 11 px, y las mayúsculas monoespaciadas abren menos el espaciado (0,12 em en lugar de 0,1 em… 0,3 em).

## 5. Investigación: qué gráficos y dinámicas sirven a un principiante

Lo que dicen los estudios de enseñanza de software y de aprendizaje motor, y qué se hizo con cada idea:

| Idea | Qué dice | En Amatista |
|---|---|---|
| **Práctica de recuperación** (testing effect) | Recordar activamente fija más que releer. | Ya estaba (preguntas, ordenar, emparejar). Las dinámicas nuevas piden **hacer**, no elegir. |
| **Ensayo del gesto** (aprendizaje motor) | Repetir la secuencia de teclas antes de la tarea real baja la carga: el alumno ya no busca la tecla, piensa en el modelo. | **Entrena tus teclas** (`shortcut_drill`): secuencias como G › X o R › Z con un cubo que reacciona. |
| **Retroalimentación direccional** | «Te falta / te pasaste» enseña más que «mal», y no regala la respuesta. | **Ajusta el valor** (`transform_challenge`): el campo del panel N con un molde translúcido. |
| **Aprender de errores ajenos** (erroneous examples) | Encontrar el error en el trabajo de otro, con su explicación, prepara para revisar el propio y evita el miedo a equivocarse. | **Encuentra el error** (`spot_error`): la receta de otro alumno con pasos mal hechos. |
| **Ejemplos resueltos y desvanecimiento** | Primero ver, luego hacer con ayuda, luego solo. | Ya lo hace el Taller (Mira → Hazlo conmigo → Hazlo tú). |
| **Continuidad visual** | Que lo que ves en la lección se vea igual en el programa reduce el salto. | El cubo de las dinámicas usa los colores de ejes de Blender (X rojo, Y verde, Z azul), el sombreado sólido y el mismo **molde punteado** que el add-on dibuja en Blender. |

Por qué no se agregaron más tipos de gráfico: la plataforma ya tiene 20 bloques visuales (pipeline, capas, línea de tiempo, nodos, visor de malla, gizmo, demo con control, recorrido de pantalla, simulador de la vista…). Lo que faltaba eran **dinámicas que se resuelven haciendo**, cerca de lo que el alumno hará después en Blender.

## 6. Las tres dinámicas nuevas

Todas se cargan bajo demanda (no pesan en la primera carga), funcionan con teclado, ratón y dedo, y las valida el servidor (`backend/contenido/validacion.py`). Lógica sin React en `frontend/src/components/leccion/dinamicas.js` (pruebas en `dinamicas.test.js`), vista compartida en `CuboVista.jsx`.

### Entrena tus teclas · `shortcut_drill`

```json
{"type": "shortcut_drill", "id": "teclas_bp1", "title": "…", "text": "…",
 "drills": [{"prompt": "Muévelo solo en el eje X", "keys": ["G", "X"], "explanation": "…"}]}
```

- De 1 a 8 ejercicios; cada uno con 1 a 6 teclas en orden. Teclas: una letra o número, o `Tab`, `Espacio`, `Esc`, `Enter`, `Delete`, `F2`, `F3`, `F12`, flechas…, con `Shift+`, `Ctrl+` o `Alt+` delante.
- El alumno hace clic en la vista y teclea; una tecla equivocada sacude la vista y vuelve a la primera. `Tab` solo se atrapa cuando es la que toca (si no, sigue moviendo el foco) y `Esc` sale. Sin teclado, «Sin teclado (táctil)» muestra las teclas como botones.
- El cubo hace lo de Blender: G mueve, R gira, S escala (con eje si viene X, Y o Z), Tab muestra los vértices y Shift+A agrega otro cubo.
- Se resuelve al terminar; es perfecta sin teclas equivocadas. Distinto del «Pruébate» de los atajos (una tecla suelta, no cuenta como actividad).
- En: `bp1_explora` (Blender Principiante, módulo 1).

### Ajusta el valor · `transform_challenge`

```json
{"type": "transform_challenge", "id": "valor_bi1_tabla", "property": "rotation", "axis": "Z",
 "target": 90, "step": 5, "tolerance": 2.5, "explanation": "…"}
```

- `property`: `location` (m, −3 a 3), `rotation` (°, −180 a 180) o `scale` (0,2 a 3); `min`, `max`, `step` y `tolerance` opcionales (tolerancia por defecto: medio paso). El servidor rechaza una meta fuera del campo o igual al valor inicial.
- El panel imita N › Elemento: etiqueta, eje de color, campo numérico y deslizador. «Comprobar» dice «Te falta: sube el valor», «Te pasaste» o «¡Justo en el molde!». Perfecta si sale en 1 o 2 intentos.
- En: `bi1_explora` (Blender Intermedio, módulo 1): el pilar a 1,5 m en X y la tabla girada 90° en Z.

### Encuentra el error · `spot_error`

```json
{"type": "spot_error", "id": "error_bp3", "steps": [
  {"text": "…", "explanation": "…"},
  {"text": "…", "wrong": true, "explanation": "…"}]}
```

- De 3 a 10 pasos, al menos uno mal y uno bien; la explicación es obligatoria en los pasos mal hechos. Al revisar, cada paso muestra ✓ o ✗ y por qué. Perfecta si marcó exactamente los malos.
- En: `bp3_explora` (la nave que salió chueca: Espejo sin aplicar la escala, Subdivisión con 6 niveles) y `af2_practica` de A-Frame (la mesa en centímetros y el color «café»): sirve para cualquier programa.

## 7. Pendiente

- Probar el enlace `amatista://` en un Windows, un Mac y un Linux reales (T-133): la app de macOS se arma con `osacompile` y no se puede probar en la nube.
- Probar el botón Amatista, el menú, la barra de estado y el espacio con Blender con ventana (T-134; junto con T-102 y T-113).
- Llevar las tres dinámicas a más módulos (T-135).
