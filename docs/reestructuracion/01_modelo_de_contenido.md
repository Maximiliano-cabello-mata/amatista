# 01 · Modelo de contenido de la v3

Cómo se organiza el contenido de Amatista a partir de la reestructuración y dónde vive cada dato. Complementa el [formato de lecciones](../arquitectura/2026-09-29_formato-lecciones.txt) y [la Fórmula Amatista](../arquitectura/2026-10-02_formula_modulos.txt), que siguen vigentes.

## 1. Jerarquía

```
Curso (CURSOS)                         blender
└── Nivel (NIVELES)                    blender-n1 «Desde cero» … blender-n5-web
    └── Módulo (MODULOS.NIVEL_ID)      mod_teoria_001
        └── Lección (LECCIONES)        les_001 … (JSON completo en CONTENIDO)
            └── Actividad              bloques interactivos dentro de la lección
```

| Concepto | Id | Regla |
|---|---|---|
| Curso | `blender`, `aframe` | Sin cambios |
| Nivel | `<curso>-n<1..5>[-<rama>]` | El 1 al 4, uno por curso; el 5, uno por rama (`blender-n5-web`). Nace en borrador; publicarlo lo hace visible en el catálogo |
| Módulo | `mod_…` | `nivel_id` opcional. Un módulo sin nivel (los anteriores a la v3) sigue visible igual que antes |
| Lección | `les_…` | Inmutable una vez publicada (el progreso se guarda con él). Sustituir = lección nueva con `replaces` |

**Tres cosas distintas que se llaman «nivel»:**

| En el código | Qué es |
|---|---|
| `niveles`, `nivel_id`, tabla `NIVELES` | El nivel de la ruta del curso (esta reestructuración) |
| `nivel` en el progreso de la PWA (`BarraSuperior.jsx`) | El nivel de experiencia del alumno (XP, gamificación) |
| `curso.nivel` («Principiante», «Intermedio») | Etiqueta antigua del curso en la tarjeta del catálogo |

## 2. Los cinco niveles de Blender

Están en `backend/contenido/plantillas.py` (`NIVELES_BLENDER`) y se crean en la base con `python herramientas/contenido.py sembrar-niveles` (también al `importar`). Nunca se sobrescriben: lo que se edite después en el panel o en Oracle se conserva.

| Id | Nivel | Proyecto de cierre |
|---|---|---|
| `blender-n1` | 1 · Desde cero | Habitación sencilla con primitivas |
| `blender-n2` | 2 · Básico con conocimientos previos | Mesa con lámpara estilizada |
| `blender-n3` | 3 · Consolidación y autonomía | Rincón de estudio propio desde una referencia |
| `blender-n4` | 4 · Intermedio | Conjunto de objetos coherentes en una escena |
| `blender-n5-web` · `-animacion` · `-producto` · `-procedural` | 5 · Avanzado por especialidad | Por definir con cada rama (decisión pendiente) |

El perfil y el criterio de salida de cada uno son los de la propuesta (sección 3). El módulo 1 actual («El mundo 3D y la magia de Blender») queda en el Nivel 1.

## 3. Ficha de la lección

Cada lección puede llevar un objeto `ficha` en su JSON. Es **opcional** para que nada de lo publicado deje de validar; el mapa del curso señala las fichas incompletas.

```json
"ficha": {
  "objetivo": "Crear una cubierta y cuatro patas con proporciones coherentes.",
  "habilidades": ["bl-extruir", "bl-proporciones"],
  "prerrequisitos": ["les_n1_navegar"],
  "blender": { "verificadaEn": "4.2", "notas": "En 4.1 el menú Add está en otro lugar." },
  "edicion": "1.0",
  "practica": { "archivo": "mesa_inicial.blend", "evidencia": "Archivo editable y captura" },
  "comprobacion": ["Piezas completas", "Colocación coherente", "Archivo guardado"],
  "offline": true
}
```

| Campo | Validación (`contenido/validacion.py`) | Cuenta para «ficha completa» |
|---|---|---|
| `objetivo` | Texto, máx. 300 | Sí (no vacío) |
| `habilidades` | Lista de ids, máx. 8 | Sí (al menos una) |
| `prerrequisitos` | Lista de ids de lecciones, máx. 20 | No |
| `blender.verificadaEn` | `4.2` o `4.2.3` | Sí, en cursos de Blender |
| `blender.notas` | Texto, máx. 500 | No |
| `edicion` | Versión del contenido (texto corto) | No |
| `practica.archivo` / `evidencia` | Texto, máx. 300 | No |
| `comprobacion` | Lista de textos no vacíos | Sí (al menos uno) |
| `offline` | true / false; true solo si se probó sin conexión | No |

Los textos pueden quedar vacíos mientras se escribe la lección; publicar no exige ficha completa (decisión para no bloquear el contenido actual). Cuando la fase B termine, el criterio de publicación de lecciones nuevas puede endurecerse.

## 4. Estructura mínima de una lección (10 pasos)

`leccion_estructurada()` en Python, `nueva-leccion` en la CLI y `amatista_autor.nueva_leccion` en Oracle crean el mismo esqueleto (una prueba compara los títulos):

| # | Paso | Bloque |
|---|---|---|
| 1 | Objetivo | `callout` (dato) |
| 2 | Antes de empezar (prerrequisitos y versión verificada) | `markdown_text` |
| 3 | Resultado esperado | `markdown_text` (+ agrega un `image`) |
| 4 | Conceptos clave | `markdown_text` |
| 5 | Práctica guiada | `markdown_text` |
| 6 | Tu variante (transferencia) | `callout` (reto) |
| 7 | Errores frecuentes y pistas | `markdown_text` |
| 8 | Comprueba tu trabajo | `markdown_text` |
| 9 | Guarda tu evidencia | `markdown_text` |
| 10 | Repaso | `markdown_text` |

El esqueleto usa solo bloques de lectura para que valide desde el primer momento. Al escribir la lección se agregan los bloques interactivos de la Fórmula donde ayuden (`ordering` para los pasos, `hotspots` sobre una captura anotada, `quiz_inline` para comprobar). La Fórmula (gancho → explora → práctica → reto → jefe) sigue organizando el **módulo**; los 10 pasos organizan **cada lección**.

## 5. Habilidades, rúbrica y progreso

| Qué | Tabla | Valores |
|---|---|---|
| Habilidad observable del curso | `HABILIDADES` (id `bl-…`, nivel opcional) | — |
| Estado de una habilidad por alumno | `HABILIDADES_ALUMNO` | `sin_practicar` → `con_guia` → `con_pistas` → `autonoma` |
| Rúbrica del proyecto de un nivel | `EVALUACIONES_RUBRICA` (alumno, nivel, criterio) | Criterios A–E; logro `pendiente` · `con_ayuda` · `autonomo` |

Criterios A–E (sección 9 de la propuesta): A cumple el objetivo · B aplica las herramientas pertinentes · C organiza y guarda una entrega revisable · D identifica y corrige un problema · E explica una decisión o adapta el resultado.

La PWA mostrará por separado **avance** (lecciones completadas, ya existe), **experiencia** (XP, racha, insignias; ya existe) y **habilidades** (nuevo, T-042). La API de alumno para habilidades y rúbrica es T-042: las tablas ya existen para que esa tarea no necesite otra migración.

## 6. Tres versiones independientes

| Versión | Dónde vive | Ejemplo |
|---|---|---|
| Software (Blender) | `VERSIONES_BLENDER` + `ficha.blender.verificadaEn` | 4.2 |
| Contenido | `LECCIONES.VERSION` (sube con cada edición) y `ficha.edicion` (la edición pedagógica) | v7 · edición 1.0 |
| Add-on | `VERIFICACIONES_BLENDER.VERSION_ADDON` y el manifiesto del add-on | 0.1.0 |

Categorías de una versión de Blender: `principal` (solo una; al marcar otra, la anterior pasa a `compatible`), `compatible`, `sin_verificar`, `retirada`. La matriz de compatibilidad guarda cada prueba con sistema operativo, versión de la lección probada, versión del add-on, resultado (`verificada`, `con_diferencias`, `falla`), diferencias, evidencia, responsable y fecha. Si la lección cambia después de la prueba, la matriz la marca como «repetir».

Antes de cambiar la versión principal: probar apertura de archivos, ejercicios representativos, exportaciones y funciones del add-on; registrar las pruebas; conservar la edición anterior para quienes ya la usan (propuesta, sección 5).

## 7. Dónde se edita cada cosa

| Quiero… | Panel (`#/admin`) | API | CLI (`backend/`) | Oracle (`006`) |
|---|---|---|---|---|
| Crear los 5 niveles de Blender | — | `POST /api/contenido/niveles/sembrar` | `contenido.py sembrar-niveles` | `amatista_autor.guardar_nivel` |
| Publicar un nivel | (T-044) | `PUT /api/contenido/niveles/{id}` | — | `amatista_autor.publicar_nivel` |
| Poner un módulo en un nivel | (T-044) | `PUT /api/contenido/modulos/{id}` `{nivel_id}` | `"nivel"` en el JSON + `importar` | `amatista_autor.asignar_nivel` |
| Lección nueva con los 10 pasos | Editor (pegando el esqueleto) | `POST /api/contenido/lecciones` | `contenido.py nueva-leccion` | `amatista_autor.nueva_leccion` |
| Llenar la ficha | Editor JSON (T-044 la hará formulario) | `PUT /api/contenido/lecciones/…` | Editar el JSON | `amatista_autor.guardar_ficha` |
| Ver qué falta | — | `GET /api/contenido/mapa/{curso}` | `contenido.py mapa` | `V_AMATISTA_FICHAS_INCOMPLETAS` |
| Registrar una versión de Blender | — | `PUT /api/blender/versiones/{v}` | — | `amatista_autor.guardar_version_blender` |
| Anotar una prueba | — | `POST /api/blender/verificaciones` | — | `amatista_autor.registrar_verificacion` |
| Publicar lecciones | Panel | `POST …/publicar` | `importar` con `"estado": "publicado"` | **No** (a propósito: publicar valida) |

## 8. Producción y validación del contenido

Flujo de la propuesta (sección 12): diseñar → redactar → producir recursos → ejecutar la práctica → revisar → probar con alumnos → publicar. En el repositorio:

1. `contenido.py nuevo-modulo blender 2 "Navegación" --nivel blender-n1`
2. `contenido.py nueva-leccion …/blender-modulo-2.json les_n1_navegar "Navegar sin mover los objetos" --objetivo "…"`
3. Escribir, llenar la ficha, `contenido.py validar` y `contenido.py mapa blender`.
4. Ejecutar la práctica en la versión declarada y registrar la verificación.
5. Cambiar `estado` a `publicado`, commit con la tarea, `importar` en el servidor.

Recursos gráficos (sección 7 de la propuesta): cada imagen con texto alternativo, autoría y versión de Blender; nada de binarios en la base (las imágenes viven en `frontend/public/` o en un almacenamiento de archivos).
