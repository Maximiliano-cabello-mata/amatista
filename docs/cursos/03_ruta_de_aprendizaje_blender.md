# Ruta de aprendizaje de Blender en Amatista

El plan de estudios propio de Amatista para aprender Blender, de cero a intermedio, sin abrumarse. Explica qué aprende el alumno en cada nivel, en qué orden y por qué está armado así. Para quien diseña contenido, da clases o quiere saber qué viene después.

Actualizado: 4 de octubre de 2026 · versión de la plataforma 3.2

## Índice

1. [La idea en una frase](#1-la-idea-en-una-frase)
2. [Seis reglas de diseño](#2-seis-reglas-de-diseño)
3. [El ritmo de un módulo](#3-el-ritmo-de-un-módulo)
4. [Los cuatro niveles](#4-los-cuatro-niveles)
5. [Nivel 1 · Principiante: jugar con piezas](#5-nivel-1--principiante-jugar-con-piezas)
6. [Nivel 2 · Principiante-Intermedio: dar vida](#6-nivel-2--principiante-intermedio-dar-vida)
7. [Nivel 3 · Intermedio: trabajar como en un estudio](#7-nivel-3--intermedio-trabajar-como-en-un-estudio)
8. [Nivel 4 · Avanzado (bloqueado)](#8-nivel-4--avanzado-bloqueado)
9. [Cómo cambia el tono de un nivel a otro](#9-cómo-cambia-el-tono-de-un-nivel-a-otro)
10. [Todo lo de Blender queda registrado](#10-todo-lo-de-blender-queda-registrado)
11. [Lo que viene: el laboratorio](#11-lo-que-viene-el-laboratorio)

---

## 1. La idea en una frase

**Primero haces algo divertido con muy pocas herramientas; después entiendes por qué funciona; al final lo usas en un proyecto que puedes enseñar.** Cada nivel agrega pocas cosas nuevas y reutiliza lo anterior, así que Blender nunca aparece entero de golpe.

## 2. Seis reglas de diseño

| Regla | De dónde viene | Cómo se nota en Amatista |
|---|---|---|
| **Pocas cosas nuevas a la vez** | Carga cognitiva: la memoria de trabajo maneja unas 4 piezas nuevas. | Cada módulo enseña de 3 a 5 teclas o paneles, no más. Lo demás de Blender ni se menciona. |
| **Tocar antes de estudiar** | Aprendizaje activo: lo que se hace con las manos se recuerda mejor. | En cada módulo hay una **exploración en Blender** de unos minutos justo después del gancho, antes de la teoría con detalle. |
| **Intercalar teoría y práctica** | Práctica intercalada y codificación dual (imagen + acción). | El mapa del módulo alterna: teoría · En Blender · teoría · En Blender (cierre) · jefe final. |
| **Recordar es aprender** | Práctica de recuperación (*testing effect*). | Preguntas en línea, emparejar, ordenar y el **jefe final**: cada acierto le quita vida. |
| **Volver a lo de antes** | Repaso espaciado. | Las píldoras con pregunta entran al repaso con cajas de Leitner (1, 3, 7, 14 y 30 días); las prácticas nuevas repasan piezas de las viejas (`review`). |
| **Un proyecto que da orgullo** | Motivación por logro y autonomía. | Cada módulo cierra con un objeto con nombre propio: un tren, una espada, una nave, un puente, una aldea, un diorama. |

## 3. El ritmo de un módulo

Todos los módulos de Blender tienen el mismo ritmo, para que el alumno sepa qué viene y no tenga que pensar en la plataforma:

| # | Paso | Dónde | Duración | Para qué |
|---|---|---|---|---|
| 1 | **Gancho** | Plataforma | 4 a 6 min | Una pregunta o un problema que despierta curiosidad («¿por qué el metal brilla?»). |
| 2 | **Exploración** | Blender, conectado | 3 a 6 min | Probar la herramienta nueva con las manos, sin presión. Pocos pasos, se registra. |
| 3 | **Teoría con detalle** | Plataforma | 6 a 10 min | Ahora sí, el porqué, con gráficos, tarjetas, emparejar y ordenar. |
| 4 | **Práctica de cierre** | Blender, conectado | 15 a 30 min | El proyecto del módulo, guiado paso a paso por el motor. |
| 5 | **Jefe final** | Plataforma | 5 min | Examen de 5 preguntas con aprobado en 80: cada acierto le baja vida al jefe del módulo. |

Cada módulo tiene además su **temática** (colores, ambientación y jefe propio) para que cada sesión se sienta distinta. La lista completa está en `frontend/src/components/temas/temas.js`.

## 4. Los cuatro niveles

```
Principiante ──► Principiante-Intermedio ──► Intermedio ──► Avanzado (bloqueado)
 jugar con piezas     dar vida (color, luz,       trabajar como      topología, UV,
 (tren, espada,       render, animación)          en un estudio      nodos y rig
  nave)                                           (medidas, orden,
                                                   portafolio)
```

| Nivel | Curso | Estado | Módulos | Tono |
|---|---|---|---|---|
| 1 | `blender_principiante` | Publicado | 3 | Juego y juguetes |
| 2 | `blender_principiante_intermedio` | Publicado | 3 | Creatividad: pintar, iluminar, animar |
| 3 | `blender_intermedio` | Publicado | 3 | Oficio: precisión, orden, portafolio |
| 4 | `blender_avanzado` | Bloqueado | 3 (planeados) | Técnico: necesita más teoría |

El orden se recomienda, no se impone: la plataforma muestra los cuatro niveles como ramas de la misma tarjeta «Blender».

## 5. Nivel 1 · Principiante: jugar con piezas

**Meta:** perderle el miedo a Blender. Al terminar, el alumno se mueve por la vista 3D, modela piezas sencillas y usa sus primeros modificadores.

| Módulo | Temática y jefe | Exploración en Blender | Proyecto de cierre | Lo nuevo |
|---|---|---|---|---|
| 1 · La interfaz y navegación 3D | El taller de juguetes · Robo-Tren Rebelde | Date una vuelta por la vista 3D | Arma un tren de juguete | Ejes, órbita y zoom, Shift+A, G, R, S, guardar |
| 2 · Modelado poligonal básico | La herrería · Gólem de Hierro | Entra al Modo Edición | Forja una espada low-poly | Tab, 1/2/3, extruir, corte de bucle, fusionar |
| 3 · Modificadores | El hangar espacial · Nave Nodriza Glitch | Tu primer modificador | Nave espacial simétrica | Espejo, Subdivisión, aplicar escala |

Por qué así: juguetes y objetos de fantasía bajan la presión («no tiene que ser realista») y dan resultados rápidos. Nada de materiales, luces ni render todavía.

## 6. Nivel 2 · Principiante-Intermedio: dar vida

**Meta:** que lo modelado se vea bien y se mueva. Reutiliza la nave del nivel 1, así que el alumno ve su propio trabajo mejorar.

| Módulo | Temática y jefe | Exploración en Blender | Proyecto de cierre | Lo nuevo |
|---|---|---|---|---|
| 1 · Materiales y sombreado | El estudio de pintura · La Mancha Gris | Tu primer material | Pinta tu nave | Principled BSDF: color, metálico, rugosidad, cristal |
| 2 · Iluminación y cámara | El set de cine · La Sombra del Apagón | Una luz, una cámara y F12 | Tres luces y tu primer render | Luz de área, tres puntos, cámara, EEVEE |
| 3 · Animación básica | El circo animado · El Payaso Congelado | Tus primeros fotogramas clave | La pelota que rebota | Fotogramas clave, línea de tiempo, aplastar y estirar |

Por qué así: es el nivel del «¡wow!»: primer render y primera animación. Sigue siendo lúdico, pero ya habla de oficios reales (pintor, director de foto, animador).

## 7. Nivel 3 · Intermedio: trabajar como en un estudio

**Meta:** pasar de «me salió» a «lo hice bien y lo puedo enseñar». Entra la seriedad: medidas exactas, escenas ordenadas y un render para el portafolio.

| Módulo | Temática y jefe | Exploración en Blender | Proyecto de cierre | Lo nuevo |
|---|---|---|---|---|
| 1 · Modelado con precisión | La aldea de precisión · El Arquitecto Torcido | Repite con Array | Un puente de madera | Panel N con medidas, Snap, Array, Bisel |
| 2 · Organiza tu escena | El archivo del cartógrafo · El Caos de los «Cube.047» | Ordena en colecciones | Una aldea ordenada | Nombres, colecciones, materiales compartidos |
| 3 · Render de portafolio | La galería · El Crítico Implacable | Tu primer render en Cycles | Tu diorama en la galería | Composición, Cycles, muestras, repaso de tres puntos |

Por qué así: son los hábitos que separan a un aficionado de alguien que puede trabajar en equipo. El diorama final reúne lo de los tres niveles (modelado, materiales, luz y render).

## 8. Nivel 4 · Avanzado (bloqueado)

Está en el mapa pero **bloqueado a propósito**: sus temas piden teoría que todavía no está escrita. Módulos planeados:

| Módulo | Teoría que falta antes de publicarlo |
|---|---|
| Topología y retopología | Flujo de bordes, quads contra triángulos, polos, por qué importa para deformar. |
| UV y texturas | Qué es un mapa UV, costuras, estirar y empaquetar, texturas por imagen. |
| Nodos y primer rig | Editor de nodos de sombreado, huesos, pesos y una pose sencilla. |

Para desbloquearlo: escribir esa teoría como lecciones, crear las prácticas con `engine/herramientas/practicas.py nueva`, pasarlas por `revisar` y `probar`, y cambiar el estado del curso en los cuatro lugares de [README §6](README.md#6-dónde-vive-cada-curso-en-el-código).

## 9. Cómo cambia el tono de un nivel a otro

| | Principiante | Principiante-Intermedio | Intermedio |
|---|---|---|---|
| Proyectos | Juguetes y fantasía | Tu nave, tu escena, tu pelota | Objetos «de cliente» con medidas |
| Prácticas | Cortas, con escena de inicio preparada | Parten de tu propio trabajo (la nave) | Más largas y repasan piezas de los niveles anteriores |
| Jefe final | Personaje gracioso | Personaje gracioso | Personaje más serio («El Crítico Implacable») |

## 10. Todo lo de Blender queda registrado

La plataforma **nunca supone** que el alumno está en Blender. Tanto la exploración corta como la práctica de cierre se hacen con el add-on conectado a su cuenta y no tienen botón de «marcar como hecha» (`allowManual: false`). El motor registra cada objetivo cumplido y la plataforma lo muestra en el mapa del curso y en «Tu Blender» de la página del curso.

## 11. Lo que viene: el laboratorio

Después de la ruta viene el **laboratorio**: un espacio libre para proponer retos abiertos sin guía paso a paso, usando lo aprendido. Queda anotado en el tablero; se diseña después de probar esta ruta con alumnos reales.
