# Etapa 3 · El motor que enseña (motor v3, add-on 3.0)

Qué cambió en Amatista Engine y en el add-on con el motor v3: Blender se ve y se usa como una plataforma educativa, la teoría aparece dentro de Blender en el momento justo, y crear una práctica nueva lleva minutos. Para quien diseña cursos o programa prácticas.

Actualizado: 4 de octubre de 2026 (rama `claude/motor-v3-plan-estudios-ankwl7`)

## Índice

1. [En una frase](#1-en-una-frase)
2. [Lo que ve el alumno](#2-lo-que-ve-el-alumno)
3. [Lo que hace el motor](#3-lo-que-hace-el-motor)
4. [Lo que tiene el desarrollador](#4-lo-que-tiene-el-desarrollador)
5. [El plan de estudios implementado](#5-el-plan-de-estudios-implementado)
6. [Lo que se archivó](#6-lo-que-se-archivó)
7. [Cómo se probó](#7-cómo-se-probó)
8. [Pendiente](#8-pendiente)

---

## 1. En una frase

Las etapas 1 y 2 evaluaban y acompañaban **una** práctica. La etapa 3 convierte el add-on en un **curso**: mapa de cursos con módulos que se desbloquean, teoría en píldoras con repaso espaciado, vigilantes que pausan el progreso cuando algo se rompe, escenas de inicio preparadas, y herramientas para que un desarrollador escriba y pruebe prácticas sin abrir Blender.

## 2. Lo que ve el alumno

El panel de Amatista (N › Amatista) tiene tres pestañas:

| Pestaña | Qué hay |
|---|---|
| **Aprender** | La teoría de la práctica abierta en tarjetas: título, idea en ≤ 280 caracteres, teclas en grande, «Muéstrame dónde está» (abre la pestaña de Propiedades de la que habla) y «¿Lo entendí?» con una pregunta de una sola respuesta. |
| **Practicar** | La práctica: ruta del curso (curso › módulo), el paso actual con su guía, «Teoría: …» para volver a la píldora del momento, la tarjeta de **pausa** si un vigilante detuvo el progreso (con el botón para arreglarlo), y «Siguiente práctica» al terminar. Sin práctica abierta, muestra el mapa del curso. |
| **Mi curso** | El mapa: los cursos de la ruta con sus módulos, cuáles están completos, cuál sigue y cuáles están bloqueados. Dentro de un curso los módulos van en orden; un curso no se bloquea por el anterior (quien ya sabe lo básico puede empezar en Principiante-Intermedio: solo se recomienda el orden). |

En la vista 3D (HUD):

- una franja **TEORÍA** con la píldora del momento y sus teclas;
- un aviso naranja **PROGRESO EN PAUSA** cuando un vigilante lo detiene.

Al abrir una práctica:

1. Amatista prepara la escena de inicio. Quita el cubo, la luz y la cámara por defecto si nadie los tocó, y arma lo que la práctica necesita (la nave del curso anterior, un estudio de fotos o una pelota sobre el piso). Todo se deshace con Ctrl+Z.
2. Si toca, hace hasta 3 preguntas de **repaso** de prácticas anteriores (cajas de Leitner: 1, 3, 7, 14 y 30 días).
3. Abre la píldora principal.

Al terminar, la ventana de felicitación ofrece **Siguiente práctica**.

## 3. Lo que hace el motor

| Pieza | Dónde | Qué hace |
|---|---|---|
| Formato `amatista.practice/2` | `engine/amatista_engine/practice/` | Agrega a la v1: `pills`, `guards`, `review`, `course`, `starter` e `intro`/`completion`. Las prácticas v1 siguen cargando. |
| Píldoras | `pedagogy/pills.py` | Decide qué píldora mostrar según el disparo: `start`, `target`, `mode`, `selection`, `tool`, `guard` o `complete`. La de mayor prioridad es la principal. |
| Vigilantes (`guards`) | `engine.py` | Validadores que, si fallan, **pausan** el progreso: el porcentaje no sube hasta arreglarlo, y la guía ofrece la acción `fix` («Fusionar por distancia conmigo»). |
| Repaso espaciado | `pedagogy/spaced.py` | Leitner de 5 cajas. Una píldora con pregunta entra al repaso cuando el alumno la lee. |
| Plan de estudios | `curriculum.py` | Formato `amatista.curriculum/1` (`practices/blender/cursos.json`): cursos, requisitos y módulos, y qué está desbloqueado. |
| Validadores | `validators/` | 35. Nuevos para el plan: modificadores (`modifier.configured`), una mitad para el espejo (`mesh.one_side`), materiales (`material.distinct`, `material.matches` con metal, rugosidad y transparencia), luces (`scene.light_exists`, `light.three_point`), cámara (`camera.active`, `camera.frames`), render (`render.engine`, `render.done`) y animación (`animation.keyframes`, `animation.varies` con rebote y aplastado). Catálogo: [09_validadores.md](../referencia/09_validadores.md). |
| Mensajes | `validators/base.py`, `mesh.py`, `animation.py` | En español natural: singular y plural correctos, nombres de modificadores traducidos y el nombre del objeto del alumno. |

## 4. Lo que tiene el desarrollador

| Herramienta | Uso |
|---|---|
| `python engine/herramientas/practicas.py nueva <id> --plantilla modelado --curso blender_principiante --modulo 2` | Crea `practica.json` y `pruebas.json` desde una de 7 plantillas (`vacia`, `ensamblar`, `modelado`, `modificadores`, `materiales`, `iluminacion`, `animacion`). |
| `practicas.py revisar [rutas]` | Compila y revisa la pedagogía: objetivos sin título o sin pistas, práctica sin píldoras o sin píldora de inicio, vigilantes sin `fix` o sin mensaje, roles sin usar, imágenes de píldoras que faltan y prácticas sin `pruebas.json`. |
| `practicas.py probar [rutas] [--detalle]` | Corre los casos de `pruebas.json`: escenas descritas en JSON (cubos, cilindros, modificadores, materiales, luces, cámaras, keyframes, archivo guardado) y lo que se espera (completada, paso actual, acción, píldoras, pausa, mensaje). |
| `practicas.py simular <ruta> [--escena foto.json]` | Muestra paso a paso lo que vería el alumno. |
| `practicas.py validadores [--md archivo]` | Catálogo de validadores, en pantalla o en Markdown. |
| `practicas.py plan [--completadas id …]` | El mapa del plan de estudios y qué se desbloquea. También revisa que cada módulo apunte a una práctica que existe, con su curso y módulo correctos. |
| Add-on › modo Desarrollador › **Teoría y pruebas** | Agrega píldoras a la práctica abierta y guarda la escena actual como caso de prueba (texto `amatista_pruebas.json` en Blender). |
| Add-on › nuevo borrador | Con plantilla, curso y módulo. |

Referencia completa: [08_practicas_v3_y_herramientas.md](../referencia/08_practicas_v3_y_herramientas.md).

## 5. El plan de estudios implementado

Del archivo [`plan_de_estudios_blender.txt`](../../cursos/plan_de_estudios_blender.txt), en dos cursos de tres módulos:

| Curso | Módulo | Práctica (id) | Proyecto | Casos |
|---|---|---|---|---|
| Principiante | 1 · Interfaz y navegación 3D | `blender.bp.m1.tren` | Tren de juguete | 4 |
| Principiante | 2 · Modelado poligonal básico | `blender.bp.m2.espada` | Espada (o taza) low-poly | 5 |
| Principiante | 3 · Modificadores | `blender.bp.m3.nave` | Nave simétrica | 6 |
| Principiante-Intermedio | 1 · Materiales y sombreado | `blender.bpi.m1.pinta-nave` | Pinta tu nave | 4 |
| Principiante-Intermedio | 2 · Iluminación y cámara | `blender.bpi.m2.tres-puntos` | Tres luces y tu primer render | 6 |
| Principiante-Intermedio | 3 · Animación básica | `blender.bpi.m3.pelota` | La pelota que rebota | 4 |

Total: 29 casos de prueba. Cada módulo tiene además su teoría en la plataforma (4 lecciones: gancho, explora, práctica y jefe). Detalle por curso: [docs/cursos/](../../cursos/README.md).

## 6. Lo que se archivó

Se movió, no se borró:

| Qué | Antes | Ahora |
|---|---|---|
| Prácticas v1/v2 (mesa, podio, table) | `practices/blender/level_1/`, `practices/sandbox/` | `practices/archivo/v2/` (solo visibles en modo Desarrollador) |
| Módulos 1 a 3 del curso `blender` | `frontend/src/data/modulos/blender-modulo-*.json` | `frontend/src/data/modulos/archivo/` con estado `archivado` |
| Curso `blender` en Oracle | publicado | `archivado` con `sql/009` (después del piloto); el progreso se conserva |

## 7. Cómo se probó

| Suite | Resultado |
|---|---|
| `engine/tests` | 74 pruebas |
| `practicas.py probar` | 29 casos de las 6 prácticas |
| `addon/tests` (pytest) | 9 |
| `addon/tests/en_blender.py` en Blender **4.2.0** y **5.0.1** | Mapa, escenas de inicio, píldoras, repaso, vigilante y arreglo, materiales, motor de render, cámara y render, keyframes, plantillas y caso de prueba del autor |
| `backend/tests` | 289 |
| `frontend` (vitest, eslint, build) | 161 pruebas |

## 8. Pendiente

- Probar el add-on 3.0 con alumnos reales (después del piloto de la v2.2).
- Cursos Intermedio y Avanzado (están en el mapa como «próximamente»).
- Repaso espaciado sincronizado con el servidor ([base de datos §4](../../base-de-datos/01_rediseno_v3.md#4-qué-se-revisó-y-qué-se-decidió-no-hacer)).
- Imágenes o GIF reales en las píldoras (hoy hay ilustraciones SVG en dos prácticas e íconos en el resto).
