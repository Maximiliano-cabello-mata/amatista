# Amatista Engine
## Motor de Desarrollo — Especificación v0.1

**Proyecto:** Amatista  
**Componente:** Amatista Engine  
**Subcomponente:** Development Engine / Author  
**Estado:** Diseño previo a implementación  
**Base comprobada:** Blender 5.1.1 + Python 3.13.9

---

# 1. Objetivo

El Motor de Desarrollo será el conjunto de herramientas utilizadas para **crear prácticas educativas dentro de Blender sin programar cada práctica manualmente**.

El desarrollador deberá poder construir una escena, seleccionar objetos, asignarles significado educativo, definir objetivos y comprobar inmediatamente cómo interpretaría Amatista esa escena.

La idea fundamental será:

> El desarrollador describe la práctica visualmente; Amatista Engine genera su estructura educativa.

---

# 2. Qué hará el Motor de Desarrollo

El desarrollador podrá:

- crear o abrir una escena de Blender;
- seleccionar objetos;
- asignar etiquetas educativas;
- definir roles;
- registrar herramientas necesarias;
- definir objetivos;
- asociar validadores;
- añadir mensajes;
- añadir consejos;
- crear pistas progresivas;
- establecer dependencias entre objetivos;
- definir pesos de progreso;
- comprobar la práctica;
- simular errores;
- visualizar qué detecta Amatista;
- compilar la práctica;
- exportarla a JSON;
- posteriormente previsualizarla como alumno.

El desarrollador no deberá escribir código Python para cada práctica.

---

# 3. Primera arquitectura

```text
BLENDER
   │
   ▼
AMATISTA DEVELOPMENT ENGINE
   │
   ├── Inspector
   ├── Tagger
   ├── Objective Builder
   ├── Validator Builder
   ├── Hint Builder
   ├── Tool Registry
   ├── Practice Graph
   ├── Debugger
   └── Compiler
            │
            ▼
      practice.json
            │
            ▼
      AMATISTA ENGINE
```

---

# 4. Estructura propuesta

El add-on evolucionará hacia:

```text
addon/
└── amatista_blender/
    │
    ├── blender_manifest.toml
    ├── __init__.py
    │
    ├── blender/
    │   ├── scene_adapter.py
    │   ├── object_adapter.py
    │   └── events.py
    │
    ├── developer/
    │   ├── inspector.py
    │   ├── tagger.py
    │   ├── objectives.py
    │   ├── validators.py
    │   ├── hints.py
    │   ├── tools.py
    │   ├── graph.py
    │   ├── debugger.py
    │   ├── compiler.py
    │   └── export.py
    │
    ├── properties/
    │   ├── developer_state.py
    │   └── practice_state.py
    │
    ├── operators/
    │   └── developer.py
    │
    └── ui/
        └── developer_panel.py
```

No crearemos todo de golpe.

La implementación será incremental.

---

# 5. Inspector

El **Inspector** será la herramienta utilizada para mostrar qué entiende Amatista de la escena actual.

Ejemplo:

```text
AMATISTA INSPECTOR

Objeto seleccionado:
Cube.003

Tipo:
MESH

Rol:
pata

Dimensiones:
X 0.20
Y 0.20
Z 1.80

Posición:
X -0.8
Y 0.5
Z 0.9

Modificadores:
BEVEL

Etiquetas:
pata
estructura

Validadores aplicables:
✓ role.count
✓ dimension.range
✓ object.position
✓ modifier.exists
```

El Inspector será principalmente una herramienta de diagnóstico.

No modifica automáticamente la práctica.

---

# 6. Sistema de etiquetas

Las etiquetas serán una de las piezas fundamentales.

Actualmente comprobamos:

```text
amatista_role = pata
```

La estructura evolucionará.

Un objeto podrá contener propiedades como:

```text
amatista.role
amatista.tags
amatista.ignore
amatista.reference
```

Ejemplo conceptual:

```json
{
  "role": "pata",
  "tags": [
    "estructura",
    "mesa"
  ]
}
```

En Blender podrá almacenarse internamente mediante Custom Properties.

Ejemplo:

```python
obj["amatista_role"] = "pata"
```

Más adelante podremos utilizar:

```python
obj["amatista_tags"] = "estructura,mesa"
```

---

# 7. Roles y etiquetas no son lo mismo

Un **rol** representa qué función cumple un objeto dentro de la práctica.

Ejemplos:

```text
cubierta
pata
pared
puerta
ventana
lampara
camara_principal
```

Una **etiqueta** describe características adicionales.

Ejemplos:

```text
estructura
decoracion
obligatorio
opcional
referencia
interactivo
```

Por ejemplo:

```text
Objeto: Cube.003

rol:
pata

tags:
estructura
obligatorio
mesa
```

---

# 8. Tagger

El **Tagger** será la primera herramienta visual que desarrollaremos.

Conceptualmente:

```text
AMATISTA TAGGER

Objeto:
Cube.003

Rol:
[ pata               ▼ ]

Etiquetas:
[x] estructura
[x] obligatorio
[ ] decoracion

[ Asignar ]

[ Quitar etiquetas ]
```

Internamente deberá utilizar funciones reutilizables:

```text
assign_role()
get_role()
remove_role()

add_tag()
remove_tag()
get_tags()
```

La interfaz no deberá manipular directamente Custom Properties.

Toda modificación pasará por estas funciones.

---

# 9. Catálogo de roles

Los roles podrán venir de la propia práctica.

Ejemplo:

```json
{
  "roles": {
    "cubierta": {
      "label": "Cubierta"
    },

    "pata": {
      "label": "Pata"
    }
  }
}
```

Así el Tagger podrá mostrar automáticamente:

```text
Cubierta
Pata
```

en lugar de obligar a escribir texto libre.

Esto evitará errores como:

```text
pata
Pata
patas
pataa
```

---

# 10. Objectives Builder

Después del sistema de etiquetas construiremos el **Objective Builder**.

Permitirá crear objetivos educativos.

Ejemplo:

```text
NUEVO OBJETIVO

Nombre:
Crear cuatro patas

Tipo:
[ Cantidad por rol ▼ ]

Rol:
[ pata ▼ ]

Cantidad:
4

Peso:
40 %

[ Crear objetivo ]
```

Esto generará:

```json
{
  "id": "crear_patas",
  "validator": "role.count",
  "params": {
    "role": "pata",
    "equals": 4
  },
  "weight": 40
}
```

El desarrollador no necesita saber cómo funciona `role.count`.

---

# 11. Catálogo de objetivos

Amatista podrá ofrecer plantillas.

Ejemplos:

```text
Objeto existe
Cantidad de objetos
Dimensión
Posición
Rotación
Escala
Modificador
Material
Colección
Archivo guardado
Cámara
Luz
```

Cada plantilla corresponde internamente a un validador.

---

# 12. Validator Builder

Para desarrolladores avanzados existirá un nivel inferior.

Ejemplo:

```text
VALIDATOR

Tipo:
dimension.range

Aplicar a:
role = cubierta

Eje:
Z

Mínimo:
0.05

Máximo:
0.30
```

Esto permite controlar directamente parámetros del motor.

---

# 13. Sistema de consejos

Cada objetivo podrá tener un **consejo inicial**.

Ejemplo:

```text
Consejo:

"Observa primero las proporciones de una mesa real."
```

Los consejos no necesariamente aparecen después de un error.

Pueden aparecer antes o durante la actividad.

---

# 14. Sistema de pistas

Cada objetivo podrá contener varias pistas.

Ejemplo:

```text
Pista 1:
Revisa cuántos soportes tiene tu mesa.

Pista 2:
La cubierta necesita cuatro puntos de apoyo.

Pista 3:
Puedes duplicar una pata con Shift+D.

Pista 4:
Selecciona una pata -> Shift+D.
```

La estructura podría ser:

```json
{
  "hints": [
    {
      "level": 1,
      "text": "Revisa cuantos soportes tiene tu mesa."
    },
    {
      "level": 2,
      "text": "La cubierta necesita cuatro puntos de apoyo."
    }
  ]
}
```

El desarrollador podrá añadir, quitar y ordenar pistas.

---

# 15. Mensajes de error

Cada objetivo podrá utilizar mensajes automáticos del Engine.

Ejemplo:

```text
Tienes 3/4 patas.
Falta 1.
```

Pero el desarrollador podrá reemplazarlos.

Ejemplo:

```text
"Tu mesa tiene solamente tres soportes.
Revisa qué zona todavía necesita apoyo."
```

Así tendremos:

```text
mensaje generado
        o
mensaje personalizado
```

---

# 16. Herramientas educativas

La práctica podrá especificar herramientas.

Ejemplo:

```text
Mover
Escalar
Duplicar
```

El Motor de Desarrollo utilizará un catálogo central:

```text
transform.move
transform.scale
object.duplicate
```

Cada herramienta tendrá:

```text
nombre
atajo
descripción
nivel mínimo
categoría
consejo
errores comunes
```

Ejemplo:

```json
{
  "id": "transform.move",
  "name": "Mover",
  "shortcut": "G",
  "minimumLevel": 1
}
```

---

# 17. Herramientas permitidas

La práctica podrá declarar:

```text
Permitidas:
Mover
Rotar
Escalar
Duplicar
```

También:

```text
Advertir:
Boolean
Sculpt
Geometry Nodes
```

No se pretende bloquear Blender completamente.

La filosofía será educativa.

---

# 18. Grafo de práctica

Los objetivos no tendrán que ser solamente una lista.

Podrán depender unos de otros.

Ejemplo:

```text
Crear cubierta
      │
      ▼
Crear patas
      │
      ▼
Organizar escena
      │
      ▼
Guardar
```

El desarrollador podrá declarar:

```text
crear_patas
requiere:
crear_cubierta
```

La representación será:

```json
{
  "id": "crear_patas",
  "requires": [
    "crear_cubierta"
  ]
}
```

---

# 19. Practice Debugger

El Debugger será fundamental.

Debe responder preguntas como:

```text
¿Qué está detectando Amatista?

¿Por qué falló este objetivo?

¿Qué objetos utilizó el validador?

¿Qué valor esperaba?

¿Qué valor encontró?
```

Ejemplo:

```text
DEBUG

Objetivo:
crear_patas

Validator:
role.count

Rol:
pata

Esperado:
4

Encontrado:
3

Objetos:
Cube.001
Cube.002
Cube.003

Resultado:
FAIL
```

---

# 20. Live Validation

Una función importante será comprobar la práctica mientras se diseña.

El desarrollador podrá pulsar:

```text
[ Validar práctica ]
```

y recibir:

```text
✓ Cubierta
✗ Patas 3/4
✓ Dimensiones
✓ Archivo guardado

Progreso simulado:
60 %
```

Es exactamente la tecnología que ya funciona en nuestro prototipo actual.

---

# 21. Practice Compiler

Cuando la práctica esté preparada:

```text
AUTHOR DATA
     │
     ▼
Practice Compiler
     │
     ▼
amatista.practice/1
```

El compilador comprobará:

```text
schema válido
roles existentes
validadores conocidos
IDs únicos
dependencias válidas
sin ciclos
pesos correctos
herramientas registradas
```

Si existe un error:

```text
No se puede compilar.

Objetivo:
crear_patas

Error:
Hace referencia al rol "pierna",
pero ese rol no existe.
```

---

# 22. Exportación

Inicialmente exportaremos:

```text
practice.json
```

Ejemplo:

```text
practices/
└── sandbox/
    └── table/
        └── practice.json
```

Posteriormente podremos añadir:

```text
starter.blend
reference.blend
thumbnail.png
```

---

# 23. Practice Package

A largo plazo una práctica podrá convertirse en un paquete:

```text
table/
├── practice.json
├── starter.blend
├── thumbnail.png
└── media/
```

Pero el JSON seguirá siendo el núcleo.

---

# 24. Estado interno del Motor de Desarrollo

Durante edición tendremos algo similar a:

```text
DeveloperState

practice_loaded
practice_path
selected_object
selected_role
selected_target
validation_results
dirty
debug_enabled
```

No mezclaremos esto con el futuro estado del alumno.

---

# 25. Primer panel

La primera interfaz del Motor de Desarrollo debería ser deliberadamente pequeña.

```text
AMATISTA ENGINE
DEVELOPER

Objeto:
Cube

Rol actual:
Sin rol

[ Asignar rol ]

--------------------

Práctica:
table.json

Objetivos:
4

[ Validar práctica ]

Progreso simulado:
25 %

[ Ver diagnóstico ]
```

No intentaremos construir todo Author todavía.

---

# 26. Primeras funciones reales

La primera versión del Motor de Desarrollo debe implementar únicamente:

```text
assign_role()
get_role()
remove_role()

add_tag()
get_tags()
remove_tag()

inspect_object()

validate_current_scene()
```

Después construiremos la interfaz.

---

# 27. Orden de implementación

## DEV-01 — Sistema de roles

```text
assign_role
get_role
remove_role
```

Prueba:

```text
seleccionar Cube
↓
asignar pata
↓
Engine detecta pata
```

---

## DEV-02 — Sistema de etiquetas

```text
add_tag
remove_tag
get_tags
```

---

## DEV-03 — Inspector

Mostrar:

```text
nombre
tipo
rol
tags
transformaciones
dimensiones
modificadores
```

---

## DEV-04 — Panel Developer

Interfaz inicial en:

```text
3D View
→ N
→ Amatista
```

---

## DEV-05 — Validación desde panel

Botón:

```text
[ Validate Practice ]
```

Debe ejecutar el Engine existente.

---

## DEV-06 — Objective Builder

Crear objetivos sin editar JSON manualmente.

---

## DEV-07 — Pistas y consejos

Editor simple de:

```text
hint 1
hint 2
hint 3
```

---

## DEV-08 — Grafo

Dependencias entre objetivos.

---

## DEV-09 — Compiler

Generación definitiva de:

```text
practice.json
```

---

# 28. Primera meta funcional

La primera meta del Motor de Desarrollo será esta:

El desarrollador abre Blender.

Selecciona un cubo.

Abre:

```text
N -> Amatista
```

Ve:

```text
Objeto:
Cube

Rol:
[ pata ▼ ]

[ Assign ]
```

Presiona Assign.

El objeto pasa a contener:

```text
amatista_role = pata
```

Después pulsa:

```text
Validate Practice
```

Y el panel responde:

```text
Patas:
1 / 4

Progreso:
0 %
```

Duplica el objeto.

El motor empieza a detectar:

```text
2 / 4
3 / 4
4 / 4
```

Sin cambiar código.

Ese será nuestro siguiente gran hito.

---

# 29. Regla arquitectónica

Toda interfaz debe llamar a funciones del Motor de Desarrollo.

Incorrecto:

```text
UI
→ modificar directamente obj["amatista_role"]
```

Correcto:

```text
UI
→ Tagger.assign_role()
→ Blender Custom Property
```

Esto permitirá cambiar posteriormente cómo almacenamos los datos sin rehacer la interfaz.

---

# 30. Separación final

```text
                  BLENDER

                     │

              Developer UI
                     │
                     ▼
             Development Engine
          ┌──────────┼──────────┐
          │          │          │
       Tagger    Objectives   Inspector
          │          │          │
          └──────────┼──────────┘
                     ▼
               Amatista Engine
                     │
              Validator Engine
                     │
                Scene Adapter
                     │
                    bpy
```

---

# 31. Principio del Motor de Desarrollo

> **El desarrollador no programa una práctica. Construye su significado educativo utilizando Blender y Amatista Engine.**

El JSON será un resultado del proceso de autoría, no necesariamente el lugar donde el desarrollador tenga que trabajar permanentemente.

---

# 32. Próximo desarrollo

El primer código que debe escribirse después de esta especificación será únicamente el componente:

# **Amatista Tagger**

con las funciones:

```text
assign_role()
get_role()
remove_role()

add_tag()
remove_tag()
get_tags()

inspect_object()
```

Una vez comprobado, construiremos encima el primer panel de desarrollo.