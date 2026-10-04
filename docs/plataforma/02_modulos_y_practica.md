# 02 · Módulos con práctica en Blender

## La regla

**Primero el módulo, luego la práctica.** Cada módulo de Blender termina con una práctica dentro de Blender que pone en juego lo que enseñaron sus lecciones. Después de la práctica solo puede ir el examen del módulo (el «Jefe final» de la Fórmula).

```
Gancho → Explora → Práctica → Reto → [ Práctica en Blender ] → Examen
└──────────── lecciones del módulo ──────┘   └ estación ┘        └ insignia
```

- La práctica es una **lección normal** que contiene un bloque `blender_practice` (ver [04](04_herramientas_de_ensenanza.md#práctica-en-blender-blender_practice)). No hay tabla nueva ni campo nuevo en Oracle.
- El servidor rechaza un módulo en el que una lección (que no sea examen ni otra práctica) va después de la práctica: «… va después de la práctica en Blender (lessons[i]): la práctica cierra el módulo, muévela al final (solo el examen puede ir después)». Lo valida `validar_modulo` en `backend/contenido/validacion.py`, así que aplica igual al importar un JSON, al reordenar en el panel y en la CLI.
- El desbloqueo no cambió: las lecciones se abren en orden, así que la práctica se abre cuando el alumno termina la lección anterior.
- Un módulo **sin** práctica sigue siendo válido (los cursos de A-Frame, por ejemplo). En el panel de administración se marca con la etiqueta «Sin práctica en Blender» para que se note.

## Cómo lo ve el alumno

![Un módulo con su ruta y su estación de Blender](img/modulo_ruta.svg)

En el mapa del curso (`#/curso/<curso>`), cada módulo muestra:

1. **Encabezado con etiquetas**: nivel, duración, «Incluye práctica en Blender» y «Nuevo · N» si hay lecciones nuevas ([03](03_etiquetas_y_graficos.md)).
2. **La ruta del módulo** (`components/modulo/RutaModulo.jsx`): un nodo por lección con el ícono de su tipo (verde hecha, neón con pulso la actual, gris pendiente) y, al final, un nodo más grande con el cubo de Blender en naranja. Sin progreso (en el panel de administración) muestra solo la estructura.
3. **Las lecciones**, cada una con su etiqueta de tipo (Lectura, Interactiva, Video, Código, Examen).
4. **La estación de Blender** (`components/modulo/EstacionBlender.jsx`) después de las lecciones, con tres estados:

| Estado | Cuándo | Qué dice |
|---|---|---|
| Bloqueada | Faltan lecciones del módulo. | «Termina las N lecciones del módulo para abrirla.» |
| Abierta | Todas las lecciones previas hechas. | «Ya terminaste las lecciones: ahora llévalo a Blender. Amatista te guía paso a paso.» Botón **Practicar ▶** con pulso. |
| Hecha | La práctica está completada. | «¡Práctica completada en Blender!» Botón **Repasar**. |

5. **El examen** (si existe), después de la estación.

### Dentro de la práctica

La lección de práctica muestra la tarjeta del bloque `blender_practice` (`components/leccion/interactivos/PracticaBlender.jsx`):

- Título, duración, los pasos que pide la práctica y un recuadro **Con guía paso a paso** que explica que Amatista acompaña dentro de Blender (etapa 2 del motor).
- **Prepara tu Blender** (`blender/PrepararBlender.jsx`), solo si la cuenta no tiene ninguna computadora conectada:
  1. **Instala Amatista**: descarga el paquete del sistema detectado (Windows, macOS o Linux).
  2. **Abre Blender**: el instalador ya dejó el add-on activo.
  3. **¿Te muestra un código?**: escribirlo ahí mismo conecta la computadora.

  Con una computadora conectada, todo esto se pliega en «Tu Blender está conectado».
- El avance de la práctica (pasos cumplidos, porcentaje) se actualiza solo mientras el alumno trabaja en Blender.

### En el panel del alumno

La tarjeta **Tus prácticas en Blender** (`components/panel/BlenderPanel.jsx`) lista la práctica de cada módulo publicado con su estado y un enlace a la lección; abajo, el acceso a **Mi Blender**.

## Cómo se arma un módulo con práctica

1. Crear el módulo con la Fórmula en **Admin › Módulos** (genera Gancho, Explora, Práctica, Reto y Jefe final).
2. Escribir las lecciones con las herramientas de [04](04_herramientas_de_ensenanza.md). Antes de la práctica conviene un **Paso a paso** y unos **Atajos de teclado** con las teclas que pedirá Blender.
3. Crear o elegir la práctica del motor (`practices/…json`, o desde Amatista Author) y publicarla en **Admin › Prácticas de Blender**.
4. Agregar una lección con el bloque **Práctica en Blender** (`blender_practice`) que apunte al id de la práctica (por ejemplo `blender.n1.mesa`) y **dejarla al final**, antes del examen.
5. Validar y publicar. Si la práctica quedó en otro lugar, el validador dice cuál lección moverla.

Ejemplo real: [`frontend/src/data/modulos/blender-modulo-2.json`](../../frontend/src/data/modulos/blender-modulo-2.json) (en revisión), que cierra con «Construir una mesa».

## Código

| Archivo | Qué hace |
|---|---|
| `frontend/src/modulos/practica.js` | Funciones puras: `esPracticaBlender`, `practicaDelModulo`, `partesDelModulo` (antes / práctica / después), `estadoPractica`, `practicasDelCatalogo`. Pruebas en `practica.test.js`. |
| `frontend/src/pages/Curso.jsx` | El mapa del módulo: etiquetas, ruta, lecciones, estación y examen. |
| `frontend/src/components/modulo/` | `RutaModulo.jsx`, `EstacionBlender.jsx`. |
| `frontend/src/blender/PrepararBlender.jsx` | Los tres pasos para conectar Blender dentro de la práctica. |
| `backend/contenido/validacion.py` | `es_practica_blender` y la regla de orden en `validar_modulo`. |
| `backend/api/contenido.py` | El árbol del panel marca cada lección con `practica_blender`. |
