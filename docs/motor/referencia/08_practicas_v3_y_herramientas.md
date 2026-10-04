# Prácticas v3 y herramientas de autor

Referencia del formato `amatista.practice/2`, del plan de estudios (`amatista.curriculum/1`), de los casos de prueba (`amatista.practice-tests/1`) y de las herramientas para escribirlos. Para quien crea o mantiene prácticas.

Actualizado: 4 de octubre de 2026 · Contexto: [etapa 3](../etapas/etapa-3.md) · Lo que no cambió de la v1: [formato de práctica](02_formato_de_practica.md)

## Índice

1. [Dónde vive cada cosa](#1-dónde-vive-cada-cosa)
2. [Crear una práctica en 6 pasos](#2-crear-una-práctica-en-6-pasos)
3. [Formato amatista.practice/2](#3-formato-amatistapractice2)
4. [Píldoras de teoría (pills)](#4-píldoras-de-teoría-pills)
5. [Vigilantes (guards)](#5-vigilantes-guards)
6. [Escena de inicio (starter)](#6-escena-de-inicio-starter)
7. [Plan de estudios: cursos.json](#7-plan-de-estudios-cursosjson)
8. [Casos de prueba: pruebas.json](#8-casos-de-prueba-pruebasjson)
9. [La terminal: practicas.py](#9-la-terminal-practicaspy)
10. [Dentro de Blender: modo Desarrollador](#10-dentro-de-blender-modo-desarrollador)
11. [Publicar](#11-publicar)

---

## 1. Dónde vive cada cosa

```
practices/
├─ blender/
│  ├─ cursos.json                       plan de estudios (amatista.curriculum/1)
│  ├─ principiante/
│  │  ├─ m1-tren/       practica.json   pruebas.json
│  │  ├─ m2-espada/     practica.json   pruebas.json
│  │  └─ m3-nave/       practica.json   pruebas.json
│  └─ principiante-intermedio/
│     ├─ m1-pinta-nave/ practica.json   pruebas.json
│     ├─ m2-tres-puntos/practica.json   pruebas.json   tres-puntos.svg
│     └─ m3-pelota/     practica.json   pruebas.json   rebote.svg
└─ archivo/v2/          mesa.json, podio.json, table.json (archivadas)
```

- El add-on lleva `practica.json`, `cursos.json` y las imágenes (`.svg`, `.png`). Los `pruebas.json` no viajan (`addon/herramientas/construir.py`).
- El backend registra en Oracle solo los archivos con `"schema": "amatista.practice/…"` (`backend/contenido/motor.py`).
- Ids: `blender.<curso>.<módulo>.<nombre>`, con `bp` = Principiante y `bpi` = Principiante-Intermedio. El id nunca cambia: el progreso se guarda con él.

## 2. Crear una práctica en 6 pasos

```bash
cd engine/herramientas
python practicas.py nueva blender.bp.m4.casa --plantilla modelado --curso blender_principiante --modulo 4 --titulo "Una casa"
#   → practices/blender/principiante/m4-casa/practica.json y pruebas.json
# 1. Escribe objetivos, pistas y píldoras en practica.json
python practicas.py revisar ../../practices/blender/principiante/m4-casa/
# 2. Escribe los casos (escena vacía, a medias, error típico, solución) en pruebas.json
python practicas.py probar ../../practices/blender/principiante/m4-casa/ --detalle
# 3. Mira lo que vería el alumno
python practicas.py simular ../../practices/blender/principiante/m4-casa/practica.json
# 4. Agrega el módulo a practices/blender/cursos.json y revisa el mapa
python practicas.py plan
# 5. Pruébala en Blender (modo Desarrollador › Abrir practice.json)
# 6. Agrega la lección bpN_practica con el bloque blender_practice y publica (§11)
```

## 3. Formato amatista.practice/2

Todo lo de la v1 sigue igual (`targets`, `roles`, `tools`, `hints`, `guide`…). La v2 agrega:

| Campo | Tipo | Para qué |
|---|---|---|
| `schema` | `"amatista.practice/2"` | Activa los campos nuevos. Las prácticas `/1` siguen cargando. |
| `intro` | texto | Lo que el alumno lee al abrir la práctica. |
| `completion` | texto | Lo que lee al terminar (por ejemplo, qué se desbloquea). |
| `course` | `{id, module, lesson, next}` | Curso y módulo al que pertenece, lección de la plataforma donde vive (`bp2_practica`) y la práctica que sigue (botón «Siguiente práctica»). |
| `review` | `["<práctica>#<píldora>", …]` | Píldoras de prácticas anteriores que entran al repaso espaciado al abrir esta. |
| `pills` | lista | Teoría dentro de Blender (§4). |
| `guards` | lista | Vigilantes que pausan el progreso (§5). |
| `starter` | objeto | Escena de inicio (§6). |

## 4. Píldoras de teoría (pills)

```json
{
  "id": "extruir",
  "title": "E: saca caras nuevas",
  "text": "Selecciona una cara y pulsa E: sale una cara nueva que mueves con el ratón.",
  "keys": ["E"],
  "visual": "keys",
  "trigger": {"on": "target", "target": "forma"},
  "once": true,
  "check": {"question": "¿Qué tecla extruye?", "options": ["E", "R", "M"], "answer": 0}
}
```

| Campo | Regla |
|---|---|
| `text` | Una idea, ≤ 280 caracteres. Sin párrafos: si necesitas más, son dos píldoras. |
| `keys` | Las teclas que se dibujan en grande (HUD y tarjeta). |
| `visual` | `axes`, `keys`, `mode`, `tab:<PESTAÑA>` (abre esa pestaña de Propiedades: `MODIFIER`, `MATERIAL`, `RENDER`, `OUTPUT`, `DATA`, `OBJECT`, `WORLD`, `SCENE`) o `image:<archivo>` (en la carpeta de la práctica; `revisar` falla si no existe). |
| `trigger.on` | `start` (al abrir), `target` (al llegar a ese objetivo), `mode` (al entrar a un modo, por ejemplo `EDIT`), `selection`, `tool`, `guard` (cuando ese vigilante pausa) o `complete`. |
| `once` | `false` para que vuelva a salir cada vez (útil en `guard`). |
| `check` | Pregunta de una respuesta. Si existe, la píldora entra al **repaso espaciado** cuando el alumno la lee (cajas de 1, 3, 7, 14 y 30 días; máximo 3 preguntas al abrir una práctica). |

## 5. Vigilantes (guards)

Un vigilante es un validador que debe cumplirse **siempre**. Si falla, el progreso queda en pausa (no sube) y la guía ofrece arreglarlo.

```json
{
  "id": "malla-limpia",
  "title": "Malla sin vértices encimados",
  "validator": "mesh.no_duplicates",
  "params": {},
  "fix": {"action": "merge_by_distance", "label": "Fusionar por distancia conmigo"},
  "tip": "En Edición: A (todo), M › Por distancia.",
  "messages": {"fail": "Detectamos caras encimadas… Tu progreso queda en pausa hasta limpiarlas."}
}
```

Acciones de `fix` (las hace el add-on con «Hazlo conmigo»): `merge_by_distance`, `apply_scale`, `apply_all`, `edit_mode`, `object_mode`, `open_tab`, `focus` y `save`. Sin `fix`, el alumno ve el problema pero no el botón (`revisar` lo avisa).

## 6. Escena de inicio (starter)

```json
"starter": {"scene": "empty", "from_practice": "blender.bp.m3.nave", "build": "nave_basica"}
```

| Campo | Valores |
|---|---|
| `scene` | `keep` (no toca nada) o `empty` (quita el cubo, la luz y la cámara de inicio **solo si nadie los tocó**). |
| `build` | `nave_basica` (media nave con Espejo y Subdivisión), `estudio_foto` (piso y modelo, sin luces ni cámara, motor Workbench) o `pelota_y_suelo` (esfera a 4 m, piso, cámara, sol, fotogramas 1 a 48). Viven en `addon/amatista_blender/escenarios.py`. |
| `from_practice` | La práctica cuyo resultado se reutiliza. La escena armada es el plan B para quien no tiene su archivo. |

Se prepara una vez por práctica (marca `amatista_preparado` en la escena) y Ctrl+Z la deshace. Para un constructor nuevo: agrega la función a `escenarios.py`, regístrala en `CONSTRUCTORES` y cúbrela en `addon/tests/en_blender.py`.

## 7. Plan de estudios: cursos.json

```json
{
  "schema": "amatista.curriculum/1",
  "route": "blender",
  "courses": [
    {"id": "blender_principiante", "title": "Blender Principiante", "status": "disponible",
     "modules": [{"number": 1, "title": "La interfaz y navegación 3D", "practice": "blender.bp.m1.tren", "project": "Tren de juguete"}]},
    {"id": "blender_principiante_intermedio", "requires": "blender_principiante", "status": "disponible", "modules": []},
    {"id": "blender_intermedio", "requires": "blender_principiante_intermedio", "status": "proximamente", "modules": []}
  ]
}
```

- Dentro de un curso los módulos van en orden: el primero sin terminar está disponible y los siguientes, bloqueados. `requires` **recomienda** el orden entre cursos pero no bloquea: quien ya sabe lo básico puede empezar en Principiante-Intermedio (`engine/amatista_engine/curriculum.py`, `unlock_state`). En modo Desarrollador todo está abierto.
- `status: proximamente` aparece en el mapa, bloqueado y sin módulos.
- `practicas.py plan` revisa que cada `practice` exista y que su `course.id` y `course.module` coincidan con el lugar donde está en el plan.
- Los mismos ids de curso están en `frontend/src/data/cursos.js`, en `backend/contenido/plantillas.py` (`CURSOS_BASE`) y en Oracle (`CURSOS`, con `RUTA` y `REQUISITO_ID` desde `sql/008`).

## 8. Casos de prueba: pruebas.json

```json
{
  "schema": "amatista.practice-tests/1",
  "practica": "blender.bp.m2.espada",
  "casos": [
    {"nombre": "Escena de inicio", "construir": [{"inicial": true}],
     "espera": {"completada": false, "actual": "modelo", "accion": "assign_role", "pildoras": ["modos"]}},
    {"nombre": "E y cancelar: pausa",
     "construir": [{"cubo": {"nombre": "Espada", "dims": [0.4, 0.15, 3], "rol": "modelo", "vertices": 32, "caras": 30, "encimados": 4}}],
     "espera": {"pausa": "malla-limpia", "accion": "merge_by_distance", "mensaje_contiene": "encimadas"}}
  ]
}
```

**Pasos de `construir`** (cada uno es un objeto con una sola clave): `inicial`, `cubo`, `cilindro`, `esfera`, `plano`, `cono`, `malla`, `luz`, `camara`, `modificador`, `material`, `animar`, `rol`, `mover`, `quitar`, `modo`, `seleccionar`, `motor`, `renders` y `guardado`. Sus parámetros son los del constructor `Escena` de `engine/amatista_engine/testing.py`.

**Lo que se puede esperar** (`espera`): `completada`, `actual` (id del objetivo en curso), `accion` (la de «Hazlo conmigo»), `pildoras` (las que deben estar activas), `pausa` (id del vigilante), `mensaje_contiene`, `progreso_min` y `progreso_max`.

Mínimo recomendado por práctica: escena vacía, un punto intermedio, el error típico (con su vigilante) y la solución.

Desde Blender, el modo Desarrollador guarda la escena actual como caso (§10). También sirve una foto exportada desde el add-on con `practicas.py simular --escena`.

## 9. La terminal: practicas.py

`engine/herramientas/practicas.py` (no necesita Blender):

| Comando | Qué hace | Sale con error si… |
|---|---|---|
| `nueva <id> [--plantilla P] [--titulo T] [--curso C] [--modulo N] [--carpeta D]` | Crea `practica.json` y `pruebas.json`. Plantillas: `vacia`, `ensamblar`, `modelado`, `modificadores`, `materiales`, `iluminacion`, `animacion`. | la carpeta ya existe |
| `revisar [rutas]` | Compila y muestra errores y avisos de pedagogía. Sin rutas, revisa todo `practices/blender/`. | hay errores (no avisos) |
| `probar [rutas] [--detalle]` | Corre los casos de `pruebas.json`. | falla un caso |
| `simular <ruta> [--escena archivo]` | Lo que vería el alumno paso a paso. | — |
| `validadores [--md archivo]` | Catálogo de los 35 validadores con sus parámetros ([09_validadores.md](09_validadores.md) se genera así). | — |
| `plan [--completadas id …]` | El mapa del plan y qué queda desbloqueado. | una práctica del plan no existe o no coincide |

Las pruebas del motor (`engine/tests/test_v3_*.py`) corren `revisar`, `probar` y `plan` sobre las prácticas reales: CI falla si una práctica se rompe.

## 10. Dentro de Blender: modo Desarrollador

En N › Amatista, con el modo Desarrollador:

- **Nuevo borrador**: elige plantilla, curso y módulo.
- **Teoría y pruebas** (panel nuevo):
  - agrega una píldora a la práctica abierta (título, texto, teclas, disparo y objetivo);
  - guarda la escena actual como caso de prueba en el texto `amatista_pruebas.json` del `.blend`, para copiarlo a `pruebas.json`.
- Las prácticas archivadas (`archivo/`) y las de `sandbox` solo aparecen en este modo.

El resto (roles, objetivos, subir al servidor) sigue como en [modo desarrollador](06_modo_desarrollador.md).

## 11. Publicar

1. `practicas.py revisar` y `probar` sin errores, y `cd engine && python -m pytest -q`.
2. En la plataforma, la lección `bpN_practica` del módulo con el bloque `blender_practice` ([módulos con práctica](../../plataforma/02_modulos_y_practica.md)).
3. En el servidor: `python herramientas/contenido.py practicas --publicar` (desde `backend/`), o *Admin › Prácticas de Blender › Registrar las del repositorio*.
4. Cambiar una práctica publicada = subir `version` y volver a registrar.
