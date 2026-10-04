# AMATISTA ENGINE  
## Motor educativo declarativo para Blender

**Proyecto:** Amatista  
**Componente:** Amatista Engine  
**Estado:** Diseño conceptual y arquitectónico inicial  
**Fecha:** 3 de octubre de 2026  
**Responsable del proyecto:** Maximiliano Cabello Mata

---

# 1. Definición

**Amatista Engine** será el motor educativo encargado de diseñar, interpretar, ejecutar, supervisar y evaluar prácticas realizadas dentro de Blender.

Su objetivo principal es evitar que cada práctica tenga que ser programada individualmente.

El principio central del proyecto será:

> **El motor se programa; las prácticas se describen.**

Una nueva práctica no debería requerir modificar el código fuente del add-on ni crear una nueva clase Python específica.

En condiciones normales, una práctica será definida mediante información declarativa que describa:

- qué debe realizar el alumno;
- qué habilidades utiliza;
- qué objetos o resultados se esperan;
- qué herramientas corresponden al nivel;
- qué condiciones deben comprobarse;
- qué errores pueden detectarse;
- qué pistas pueden mostrarse;
- cómo se calcula el progreso;
- cuándo se considera terminada.

Amatista Engine interpretará esa definición y construirá automáticamente la experiencia educativa dentro de Blender.

---

# 2. Amatista Engine no será una IA

Esta primera arquitectura será completamente determinista.

No dependerá de:

- modelos de lenguaje;
- redes neuronales;
- generación automática mediante IA;
- análisis probabilístico;
- servicios externos de inteligencia artificial.

Su funcionamiento se basará en:

**reglas + eventos + propiedades de Blender + validadores + relaciones + estados + plantillas educativas.**

La IA podrá estudiarse en una etapa posterior como una capa complementaria.

Amatista Engine debe funcionar correctamente sin IA.

---

# 3. Problema que resuelve

Sin un motor general, cada práctica podría terminar necesitando código específico.

Por ejemplo:

```python
if existe_mesa():
    ...

if tiene_cuatro_patas():
    ...

if archivo_guardado():
    ...
```

Después sería necesario programar otra lógica para una silla, otra para una habitación y otra para cada actividad futura.

Ese modelo no escala.

Amatista Engine cambia esta arquitectura.

Un desarrollador implementará una sola vez capacidades genéricas como:

```text
object.exists
role.count
object.position
object.dimension
modifier.exists
file.saved
material.exists
transform.applied
```

Después las prácticas simplemente reutilizarán esas capacidades.

Por ejemplo:

```json
{
  "validator": "role.count",
  "role": "pata",
  "equals": 4
}
```

El código para contar objetos se escribe una vez.

Cientos de prácticas podrán utilizarlo.

---

# 4. Un motor, tres modos

Amatista no tendrá un motor para desarrolladores y otro para alumnos.

Existirá **un solo núcleo llamado Amatista Engine**.

Sobre él funcionarán tres modos.

| Modo | Función |
|---|---|
| **Author** | Diseñar, configurar, etiquetar y validar prácticas |
| **Preview** | Simular exactamente la experiencia de un alumno |
| **Student** | Ejecutar la práctica publicada y registrar aprendizaje |

Conceptualmente:

```text
                         AMATISTA ENGINE
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
            AUTHOR            PREVIEW           STUDENT
              │                 │                 │
       Crear práctica      Probar práctica     Realizar práctica
       Etiquetar escena    Simular alumno      Recibir instrucciones
       Crear objetivos     Ver errores         Recibir pistas
       Añadir reglas       Ver progreso        Ser evaluado
              │                 │                 │
              └─────────────────┼─────────────────┘
                                │
                             BLENDER
```

Los tres modos utilizarán:

- el mismo sistema de validadores;
- el mismo motor de progreso;
- el mismo formato de prácticas;
- las mismas reglas;
- las mismas definiciones de herramientas.

Esto evita duplicar código.

---

# 5. Amatista Author

**Amatista Author** será la interfaz destinada a desarrolladores y posteriormente a autores avanzados de contenido.

No constituye otro motor.

Es una capa de herramientas sobre Amatista Engine.

Permitirá trabajar dentro de Blender utilizando una escena real.

Un desarrollador podrá crear una escena de referencia y marcar elementos.

Ejemplo:

```text
Objeto Cube
→ rol: cubierta

Cube.001
→ rol: pata

Cube.002
→ rol: pata

Cube.003
→ rol: pata

Cube.004
→ rol: pata
```

Author podrá convertir esas decisiones en la definición de la práctica.

El desarrollador podrá visualizar:

```text
Práctica: blender.n1.mesa

Nivel: 1

Objetivos: 4
Habilidades: 3
Validadores: 5

✓ Schema válido
✓ Dependencias válidas
✓ Todos los validadores existen
✓ Pesos de progreso correctos

[Ejecutar]
[Previsualizar como alumno]
[Inspeccionar escena]
[Compilar]
```

La intención es que el desarrollador pueda construir la práctica visualmente y no dependa exclusivamente de escribir JSON manual.

---

# 6. Amatista Preview

Preview utilizará exactamente la misma práctica que utilizará el estudiante.

Permitirá comprobar:

- instrucciones;
- progresión;
- errores;
- pistas;
- restricciones;
- validadores;
- cálculo del progreso;
- comportamiento de la interfaz.

El desarrollador podrá activar herramientas adicionales de diagnóstico.

Ejemplo:

```text
DEBUG AMATISTA

Validator:
role.count

Esperado:
4

Detectado:
3

Estado:
FAILED

Objeto detectado:
Cube.001 → pata
Cube.002 → pata
Cube.003 → pata
```

Esta información nunca aparecerá en Student Mode.

---

# 7. Amatista Student

Student será la experiencia final del alumno.

La interfaz deberá ser sencilla.

Ejemplo:

```text
AMATISTA

Nivel 1
Construir una mesa

Paso 3 de 6

Objetivo:
Coloca las cuatro patas debajo
de la cubierta.

Progreso:
███████░░░ 70 %

✓ Cubierta
✓ Pata 1
✓ Pata 2
✓ Pata 3
✗ Falta una pata

[Necesito una pista]
[Comprobar nuevamente]
```

El alumno no verá:

- identificadores internos;
- código;
- validadores;
- JSON;
- información de debugging;
- configuración del motor.

---

# 8. Prácticas declarativas

Las prácticas serán datos interpretados por el motor.

El formato principal será JSON.

Ejemplo:

```json
{
  "schema": "amatista.practice/1",

  "id": "blender.n1.mesa",

  "title": "Construir una mesa",

  "level": 1,

  "skills": [
    "object.create",
    "transform.move",
    "transform.scale",
    "object.duplicate"
  ],

  "targets": [
    {
      "id": "cubierta",
      "validator": "role.count",
      "role": "cubierta",
      "equals": 1,
      "weight": 20
    },

    {
      "id": "patas",
      "validator": "role.count",
      "role": "pata",
      "equals": 4,
      "weight": 50
    },

    {
      "id": "guardar",
      "validator": "file.saved",
      "weight": 30
    }
  ]
}
```

La práctica describe el resultado.

No implementa el mecanismo para comprobarlo.

El mecanismo pertenece al motor.

---

# 9. Amatista Practice IR

No conviene que el runtime dependa directamente del formato utilizado por los desarrolladores.

Se propone utilizar una representación intermedia:

**Amatista Practice IR**

Flujo:

```text
JSON / Author / futura herramienta web
                │
                ▼
         Practice Compiler
                │
                ▼
        Amatista Practice IR
                │
                ▼
          Student Runtime
```

Esto permitirá cambiar posteriormente el editor o el formato de creación sin modificar el runtime.

Ejemplo de IR:

```json
{
  "schema": "amatista.practice.runtime/1",

  "practice": "blender.n1.mesa",

  "targets": [
    {
      "id": "target_001",
      "validator": "scene.role_count",
      "parameters": {
        "role": "pata",
        "equals": 4
      },
      "weight": 50
    }
  ]
}
```

---

# 10. Etiquetas educativas

El motor no debe depender únicamente del nombre de los objetos.

Blender puede producir nombres como:

```text
Cube
Cube.001
Cube.002
```

Eso es demasiado frágil para una plataforma educativa.

Amatista introducirá **roles educativos**.

Ejemplo:

```text
Cube
amatista_role = cubierta

Cube.001
amatista_role = pata
```

Internamente Blender puede almacenar:

```python
objeto["amatista_role"] = "pata"
```

Entonces los validadores preguntarán:

```text
¿Cuántos objetos tienen el rol "pata"?
```

en lugar de:

```text
¿Existe Cube.004?
```

Esto permitirá que los estudiantes puedan nombrar sus objetos libremente.

---

# 11. Detección automática de roles

En algunas prácticas el motor podrá proponer roles utilizando reglas deterministas.

Por ejemplo:

Una pata podría definirse como:

```text
MESH
+
forma vertical
+
situada debajo de cubierta
+
dimensiones dentro de determinado rango
```

Si existen cuatro objetos que cumplen esas características, Amatista puede clasificarlos provisionalmente como:

```text
role_candidate = pata
```

Esto no requiere inteligencia artificial.

Se basa en propiedades geométricas y relaciones espaciales.

La clasificación automática deberá utilizar niveles de confianza deterministas y permitir al autor corregirla durante Author Mode.

---

# 12. Motor de validadores

Los validadores constituyen una de las piezas centrales del Engine.

Cada validador representa una capacidad reutilizable.

Ejemplos:

```text
object.exists
object.count

role.exists
role.count

object.position
object.rotation
object.dimension

modifier.exists

material.exists

collection.contains

mesh.vertex_count

mesh.face_count

transform.scale_applied

file.saved

file.named

scene.camera_exists

scene.light_exists
```

Una nueva práctica utilizará validadores existentes.

Solo será necesario modificar Amatista Engine cuando aparezca una nueva capacidad general que todavía no pueda comprobar.

Ejemplo:

Una práctica nueva de silla:

```text
Código nuevo:
NO
```

Una práctica nueva de habitación:

```text
Código nuevo:
NO
```

Primera práctica que necesite comprobar UV:

```text
Código nuevo:
quizá crear validator uv.exists
```

Después cualquier práctica podrá reutilizarlo.

---

# 13. Registro de herramientas

Amatista tendrá un catálogo central de herramientas de Blender.

Ejemplo:

```json
{
  "id": "transform.move",
  "name": "Mover",
  "shortcut": "G",
  "minimumLevel": 1,
  "category": "transform",
  "description": "Cambia la posición de un objeto."
}
```

Una práctica podrá declarar:

```json
{
  "allowedTools": [
    "transform.move",
    "transform.scale",
    "object.duplicate"
  ]
}
```

El motor conoce automáticamente:

- nombre;
- atajo;
- explicación;
- nivel;
- categoría;
- ejemplos;
- errores frecuentes.

No es necesario repetir esas explicaciones dentro de cada práctica.

---

# 14. Herramientas por nivel

Amatista Engine podrá controlar pedagógicamente qué herramientas corresponden a cada etapa.

Existirán inicialmente tres comportamientos:

```text
ALLOW
WARN
BLOCK
```

**ALLOW**

La herramienta pertenece a la práctica o al nivel.

**WARN**

Puede utilizarse, pero el sistema informa que todavía no corresponde al contenido estudiado.

**BLOCK**

Se utiliza únicamente cuando una actividad necesite impedir expresamente una operación determinada.

La estrategia predeterminada será **advertir, no bloquear**.

Ejemplo:

```text
Detectamos que utilizaste Boolean.

Boolean pertenece al Nivel 3.

Esta práctica busca que resuelvas el ejercicio
utilizando las herramientas fundamentales
del Nivel 1.

[Entendido]
[¿Qué es Boolean?]
```

El objetivo es educativo, no convertir Blender en un entorno cerrado.

---

# 15. Motor de observación

El motor necesitará observar Blender mediante `bpy`.

La integración con Blender estará concentrada en una capa específica.

Ejemplo:

```python
def capture_scene():
    return {
        "objects": [
            {
                "name": obj.name,
                "type": obj.type,
                "position": list(obj.location),
                "rotation": list(obj.rotation_euler),
                "scale": list(obj.scale),
                "dimensions": list(obj.dimensions)
            }
            for obj in bpy.context.scene.objects
        ]
    }
```

Después el Engine trabajará con datos normales de Python.

Arquitectura:

```text
BLENDER
   │
  bpy
   │
   ▼
Scene Adapter
   │
   ▼
Estado estándar
   │
   ▼
Amatista Engine
```

La mayoría del motor no deberá importar `bpy`.

---

# 16. Arquitectura orientada a eventos

Amatista Engine no analizará toda la escena continuamente.

No se pretende ejecutar una evaluación completa 60 veces por segundo.

El motor utilizará eventos.

Ejemplo:

```text
Objeto movido
        │
        ▼
OBJECT_TRANSFORM
        │
        ▼
Reevaluar únicamente validadores
relacionados con transformaciones
```

Otro ejemplo:

```text
Modificador añadido
       │
       ▼
OBJECT_MODIFIER
       │
       ▼
Reevaluar modifier.exists
```

Cada validador podrá declarar qué eventos lo invalidan.

Ejemplo conceptual:

```json
{
  "validator": "object.position",
  "watch": [
    "OBJECT_TRANSFORM"
  ]
}
```

Esto permitirá reducir significativamente el consumo de recursos.

---

# 17. Motor de progreso

El progreso será calculado por objetivos.

Cada objetivo podrá tener un peso.

Ejemplo:

```text
Cubierta       20 %
Patas          40 %
Organización   20 %
Guardado       20 %
```

Si el estudiante completa:

```text
Cubierta       ✓
Patas          ✓
Organización   ✗
Guardado       ✓
```

el motor calcula:

```text
20 + 40 + 0 + 20 = 80 %
```

El autor no tendrá que programar ese cálculo.

---

# 18. Progreso no significa aprendizaje

Amatista distinguirá entre:

**progreso de actividad**

y

**dominio de habilidad**.

Completar técnicamente todos los objetivos no significa automáticamente dominar una habilidad.

El motor podrá producir evidencia.

Ejemplo:

```json
{
  "skill": "transform.scale",

  "practice": "blender.n1.mesa",

  "targetsCompleted": 5,

  "targetsTotal": 5,

  "hintsUsed": 2,

  "corrections": 1
}
```

Después Amatista podrá clasificar el desempeño como:

```text
con guía
con pistas
autónomo
```

en coherencia con `HABILIDADES_ALUMNO`.

---

# 19. Medición de autonomía

Amatista Engine podrá registrar cuánto apoyo necesitó el estudiante.

Ejemplo:

```text
Alumno A

Objetivos: 5/5
Pistas: 0
Correcciones guiadas: 0

→ evidencia de autonomía
```

Otro caso:

```text
Alumno B

Objetivos: 5/5
Pistas: 2
Correcciones guiadas: 1

→ completado con pistas
```

Este sistema ofrece información educativa mucho más valiosa que únicamente:

```text
Actividad completada: sí/no
```

---

# 20. Sistema de pistas progresivas

Las pistas podrán tener niveles.

Ejemplo de un error de escala:

**Pista 1**

```text
Revisa el grosor de la cubierta.
```

**Pista 2**

```text
Puedes modificar solamente su altura.
```

**Pista 3**

```text
Selecciona la cubierta y utiliza Scale
restringido al eje Z.
```

**Pista 4**

```text
Selecciona la cubierta → S → Z.
```

El motor registra hasta qué nivel necesitó llegar el alumno.

Esto permite medir el grado de ayuda utilizado.

---

# 21. Motor de diálogos

Los diálogos educativos serán definidos mediante eventos y condiciones.

Ejemplo:

```json
{
  "trigger": "dimension_out_of_range",

  "dialog": {
    "title": "La cubierta parece demasiado gruesa",
    "message": "Puedes modificar solamente su altura utilizando Scale en el eje Z.",
    "tool": "transform.scale"
  }
}
```

El runtime podrá mostrar:

```text
AMATISTA

La cubierta parece demasiado gruesa.

Puedes reducir solamente su altura
utilizando Scale sobre el eje Z.

S → Z

[Muéstrame cómo]
[Intentaré hacerlo]
```

Los textos generales podrán provenir de plantillas del motor.

Los autores podrán personalizarlos cuando sea necesario.

---

# 22. Generación automática de mensajes

El motor podrá generar información básica sin que el autor escriba cada variante.

Si una regla declara:

```json
{
  "role": "pata",
  "equals": 4
}
```

el motor puede producir automáticamente:

```text
0 / 4 patas
Todavía no has creado las patas.
```

Después:

```text
2 / 4 patas
Tienes dos patas. Te faltan dos.
```

Después:

```text
4 / 4 patas
Objetivo completado.
```

Esto se realizará mediante plantillas deterministas.

No requiere IA.

---

# 23. Grafo de práctica

Las prácticas podrán representarse internamente como un grafo.

Ejemplo:

```text
INICIO
  │
  ▼
Crear cubierta
  │
  ▼
Crear patas
  │
  ├── error ──► pista
  │              │
  └──────────────┘
  │
  ▼
Organizar objetos
  │
  ▼
Guardar
  │
  ▼
COMPLETADA
```

Una tarea podrá depender de otra.

Ejemplo:

```json
{
  "id": "colocar_patas",
  "requires": [
    "crear_cubierta"
  ]
}
```

El motor calculará automáticamente qué objetivo debe presentarse como actual.

---

# 24. Motor de instrucciones

A partir del grafo y los objetivos, Amatista podrá construir automáticamente la navegación educativa.

Por ejemplo:

```text
PASO 1 DE 4
Crear la cubierta.

PASO 2 DE 4
Añadir las patas.

PASO 3 DE 4
Organizar la escena.

PASO 4 DE 4
Guardar el archivo.
```

Una práctica podrá personalizar instrucciones cuando sea necesario, pero no tendrá que programar el flujo.

---

# 25. Evidencia enviada a Amatista

El runtime no deberá subir automáticamente el archivo `.blend`.

Tampoco enviará toda la escena.

Generará un resumen educativo.

Ejemplo:

```json
{
  "practice": "blender.n1.mesa",

  "progress": 100,

  "targets": [
    {
      "id": "cubierta",
      "completed": true
    },
    {
      "id": "patas",
      "completed": true
    }
  ],

  "hintsUsed": 1,

  "errorsCorrected": 2,

  "toolsUsed": [
    "transform.move",
    "transform.scale",
    "object.duplicate"
  ]
}
```

Cuando se implemente la conexión, este resultado podrá enviarse a Amatista mediante FastAPI.

---

# 26. Funcionamiento sin conexión

El motor deberá funcionar localmente.

La práctica descargada podrá mantenerse en caché.

Arquitectura futura:

```text
AMATISTA
   │
   ▼
descargar práctica
   │
   ▼
BLENDER
   │
   ├── Engine
   ├── Practice Runtime
   └── caché local
```

Si desaparece Internet:

```text
Práctica continúa funcionando.
```

Cuando vuelva la conexión:

```text
Resultados pendientes
        ↓
     sincronizar
        ↓
      Amatista
```

---

# 27. Componentes técnicos propuestos

La estructura preliminar podrá evolucionar hacia:

```text
engine/
└── amatista_engine/
    │
    ├── core/
    │   ├── runtime.py
    │   ├── state.py
    │   ├── events.py
    │   └── graph.py
    │
    ├── practice/
    │   ├── schema.py
    │   ├── loader.py
    │   ├── compiler.py
    │   └── ir.py
    │
    ├── validators/
    │   ├── objects.py
    │   ├── roles.py
    │   ├── transforms.py
    │   ├── mesh.py
    │   ├── modifiers.py
    │   ├── materials.py
    │   └── files.py
    │
    ├── pedagogy/
    │   ├── progress.py
    │   ├── skills.py
    │   ├── hints.py
    │   ├── feedback.py
    │   └── levels.py
    │
    ├── tools/
    │   └── registry.py
    │
    └── blender/
        ├── observer.py
        ├── adapter.py
        └── events.py
```

La interfaz del add-on puede mantenerse separada:

```text
addon/
└── amatista_blender/
    ├── ui/
    ├── operators/
    ├── author/
    ├── preview/
    └── student/
```

---

# 28. Lenguaje y tecnologías

El núcleo utilizará:

```text
Python
```

por tres razones principales:

Blender utiliza Python mediante `bpy`.

FastAPI ya utiliza Python.

Las reglas y validadores pueden probarse fácilmente mediante `pytest`.

Las prácticas utilizarán principalmente:

```text
JSON
```

El JSON funcionará como formato declarativo.

Python podrá utilizarse posteriormente para crear una DSL orientada a desarrolladores, pero su resultado deberá convertirse a Practice IR.

Nunca se enviará Python arbitrario desde el servidor para ejecutarlo en los equipos de los estudiantes.

---

# 29. Seguridad

Una regla arquitectónica será:

> **Las prácticas contienen datos, no código remoto ejecutable.**

La plataforma podrá enviar:

```json
{
  "validator": "role.count",
  "role": "pata",
  "equals": 4
}
```

No podrá enviar:

```python
import bpy
bpy.ops....
```

y solicitar que el alumno lo ejecute.

Todos los validadores disponibles deberán estar registrados previamente en el motor.

Si una práctica solicita:

```text
validator.xyz
```

y la versión instalada del Engine no conoce ese validador:

```text
Esta práctica necesita una versión más reciente de Amatista Engine.
```

No se ejecutará código desconocido.

---

# 30. Consumo de recursos

Amatista Engine deberá diseñarse como un sistema ligero.

No utilizará procesamiento continuo de imágenes ni modelos de IA.

La mayor parte de sus operaciones serán:

- leer propiedades;
- comparar números;
- contar objetos;
- comprobar relaciones;
- consultar modificadores;
- actualizar estados;
- mostrar interfaz.

El sistema de eventos evitará reevaluaciones innecesarias.

La evaluación completa podrá realizarse:

```text
al cambiar algo relevante
```

o:

```text
cuando el alumno pulse Comprobar
```

según cada tipo de práctica.

---

# 31. Distribución

Inicialmente Amatista Engine permanecerá dentro del repositorio principal.

Propuesta:

```text
amatista/
├── engine/
├── addon/
├── practices/
├── backend/
└── frontend/
```

No se abrirá otro repositorio en esta etapa.

Cuando el motor alcance estabilidad suficiente se podrá evaluar convertirlo en un paquete independiente.

El add-on para alumnos podrá distribuirse posteriormente mediante:

```text
GitHub Releases
```

como un `.zip` instalable.

---

# 32. Prácticas dentro del ecosistema del Engine

Durante desarrollo podrán existir en:

```text
practices/
└── blender/
    ├── level_1/
    ├── level_2/
    ├── level_3/
    ├── level_4/
    └── level_5/
```

Ejemplo:

```text
level_1/
├── navigation.json
├── transforms.json
├── table.json
└── first_room.json
```

Estas prácticas podrán ejecutarse directamente en Author y Preview.

Cuando exista integración con Amatista, las versiones publicadas podrán entregarse mediante la API.

---

# 33. Filosofía de desarrollo

Amatista Engine seguirá varias reglas.

**Regla 1**

Una nueva práctica normal no requiere modificar el Engine.

**Regla 2**

Se modifica el Engine solamente cuando aparece una capacidad general nueva.

**Regla 3**

La lógica de Blender debe mantenerse separada de la lógica educativa.

**Regla 4**

Las prácticas contienen datos declarativos.

**Regla 5**

Author, Preview y Student utilizan el mismo runtime.

**Regla 6**

La experiencia básica funciona sin conexión.

**Regla 7**

La IA no es requisito para ninguna capacidad fundamental.

---

# 34. Ejemplo completo de flujo

Un desarrollador crea:

```text
Construir una mesa
```

En Author Mode marca:

```text
1 cubierta
4 patas
```

Selecciona habilidades:

```text
crear objetos
mover
escalar
duplicar
```

Define:

```text
Nivel 1
```

Amatista Compiler genera la práctica.

Preview ejecuta exactamente esa definición.

El desarrollador comprueba:

```text
✓ detecta cubierta
✓ detecta patas
✓ muestra errores
✓ muestra pistas
✓ calcula progreso
```

Se publica.

El alumno descarga la misma práctica.

Student Runtime comienza:

```text
Paso 1
Crear cubierta.
```

El alumno trabaja.

Amatista observa Blender.

Cuando crea correctamente la cubierta:

```text
✓ Objetivo 1 completado.
```

Cuando crea solamente tres patas:

```text
3 / 4
Te falta una pata.
```

Si solicita ayuda:

```text
Pista 1
Revisa cuántos soportes tiene la mesa.
```

Completa la actividad.

Engine genera:

```json
{
  "practice": "blender.n1.mesa",
  "progress": 100,
  "hintsUsed": 1,
  "result": "completed"
}
```

Cuando exista conexión con la plataforma, esa evidencia se sincroniza con Amatista.

---

# 35. Qué no pertenece todavía a Amatista Engine

Para proteger el alcance inicial, quedan fuera:

```text
Tutor mediante IA
generación 3D mediante prompts
corrección mediante visión artificial
generación automática de prácticas mediante IA
ejecución remota de Python
análisis automático de archivos mediante modelos externos
```

Estas posibilidades podrán investigarse posteriormente.

No forman parte del núcleo inicial.

---

# 36. MVP propuesto

La primera versión de Amatista Engine debería demostrar únicamente el concepto fundamental.

Una práctica:

```text
Construir una mesa.
```

El Engine deberá ser capaz de:

```text
cargar práctica JSON
interpretarla
observar Blender
detectar roles
ejecutar validadores
mostrar progreso
mostrar errores
mostrar pistas
terminar la práctica
generar resultado
```

Author deberá permitir:

```text
abrir práctica
inspeccionar su definición
ejecutarla
previsualizar Student Mode
```

No será necesario conectar todavía FastAPI u Oracle.

---

# 37. Primera prueba de arquitectura

La primera práctica deberá comprobar al menos:

```text
objeto existente
cantidad de objetos
dimensiones
posición
archivo guardado
```

También deberá probar:

```text
progreso ponderado
una pista progresiva
una herramienta fuera de nivel
un error corregido
```

Si todo funciona utilizando únicamente configuración JSON, se habrá demostrado el concepto central de Amatista Engine.

---

# 38. Dirección futura

Una vez estable el núcleo:

```text
Amatista Engine
       │
       ├── más validadores
       ├── más herramientas
       ├── más prácticas
       ├── integración con Amatista
       ├── sincronización
       ├── habilidades
       ├── rúbricas
       └── compatibilidad Blender
```

Posteriormente podrán desarrollarse sistemas más avanzados encima del mismo núcleo.

La arquitectura debe permitir crecer sin reemplazar el motor.

---

# 39. Identidad del componente

A partir de este documento el nombre de trabajo será:

# **Amatista Engine**

Puede describirse como:

> **Amatista Engine es un motor educativo declarativo para Blender que permite diseñar, ejecutar y evaluar prácticas interactivas mediante reglas reutilizables, observación local de la escena, progreso estructurado, pistas y validaciones, sin tener que programar individualmente cada lección.**

Sus tres superficies serán:

```text
Amatista Author
Amatista Preview
Amatista Student
```

Todas construidas encima de:

```text
Amatista Engine
```

---

# 40. Principio rector

La arquitectura completa deberá proteger una idea:

> **El desarrollador diseña la experiencia; Amatista Engine se encarga de ejecutarla.**

El contenido educativo deberá crecer principalmente mediante nuevas prácticas.

El código del motor crecerá principalmente mediante nuevas capacidades reutilizables.

Esta separación permitirá que Amatista pueda desarrollar decenas o cientos de prácticas sin convertir cada actividad en un nuevo proyecto de programación.