# Etapa 1 · El motor que evalúa (3 y 4 de octubre de 2026)

**Estado:** cerrada. En `main` desde el PR #13 (commit de fusión `ec849d8`, 3 oct 2026 19:16 hora local), rama `claude/amatista-engine-x71veq` (borrar desde la computadora del usuario).
**Versiones al cierre:** motor `amatista_engine` 0.2.0 · add-on «Amatista» 0.2.0 · formato `amatista.practice/1` · Oracle `007`.

Este documento cuenta qué se construyó, en qué orden, qué se decidió y qué quedó pendiente. La referencia técnica vigente (que ya incluye la etapa 2) está en [`../referencia/`](../referencia/).

## De dónde venimos

El 3 de octubre por la tarde llegó al repositorio, subido a mano («Add files via upload», commits `9eb1f86` y `161d85a`), un prototipo del motor: un paquete `amatista_engine/` en la raíz con `engine.py`, `models.py`, un `adapter.py` para Blender, un validador de archivo guardado y un `ascii_check.py` que probaba todo desde la consola de Blender 5.1.1 (Python 3.13). Venía con dos especificaciones, guardadas tal cual en [`../especificaciones/`](../especificaciones/):

- [Concepto de Amatista Engine](../especificaciones/2026-10-03_amatista_engine_concepto.md): el alumno practica en Blender y Amatista revisa la escena.
- [Motor de Desarrollo v0.1](../especificaciones/2026-10-03_motor_de_desarrollo_v0.1.md): el desarrollador arma una práctica visualmente (etiquetas, objetivos) sin programarla.

El pedido de Maximiliano (3 oct, 23:53) fue ordenar y documentar el motor, hacer un add-on práctico con modo desarrollador, un paquete descargable que se instale solo y compruebe la versión de Blender, conectar Blender con la plataforma, registrar progreso y prácticas en Oracle y poner una primera práctica dentro de los módulos.

## Qué se construyó (en orden de commits)

| Commit | Qué entró |
|---|---|
| `9abf1fd` | **Motor reorganizado** en `engine/amatista_engine/`: modelos inmutables, cargador y compilador de prácticas con errores en español y ruta del campo, 18 validadores registrados, evaluación ordenada con `requires` y pesos, pistas por niveles, autonomía, grafo de habilidades, catálogo de herramientas. El prototipo sigue importable (compatibilidad con `ascii_check.py`). |
| `914f033` | **Add-on** Blender 4.2+ (extensión con `blender_manifest.toml`): modos Alumno, Vista previa y Author; paneles con tarjetas, diálogos (bienvenida, pista, completada, herramienta de otro nivel), tarjeta HUD en la vista 3D, Tagger, Inspector, Constructor de objetivos, Validación y Exportar. Evalúa en vivo con 0.4 s de calma tras cada cambio. |
| `ee51067` | **Constructor** `addon/herramientas/construir.py`: el `.zip` de la extensión (con copia del motor dentro) y paquetes por sistema (Windows `.bat`, macOS `.command`, Linux `.sh`) que buscan Blender, comprueban la versión mínima 4.2 e instalan con `blender --background`. Bytes reproducibles (fechas fijas). |
| `32371fc` | **Oracle 007** (`backend/sql/007_motor_practicas.sql`, aditivo e idempotente): `ADDON_VINCULOS`, `PRACTICAS`, `PRACTICA_VERSIONES`, `PROGRESO_PRACTICAS` (18 tablas en total). **API** `/api/addon/v1`: vínculo por código o enlace de un uso, sesión propia del add-on (solo `/api/addon/` y `/api/blender/`), prácticas, intentos (el servidor reevalúa la foto con el mismo motor), progreso que no retrocede, descargas. |
| `46294cf` | **Plataforma**: página `#/blender` (descarga, compatibilidad, dispositivos), `#/vincular`, bloque de lección `blender_practice` (consulta el progreso cada 6 s), tarjeta en el panel del alumno, **Admin › Prácticas** (versiones y publicar) y el módulo 2 de Blender con la práctica de la mesa (`estado: revision`). |
| `96502b1`, `9c85396`, `d7dba28` | Documentación `docs/motor/` (seis documentos, hoy en `referencia/`), manual de Oracle §10, bitácora del 4 de octubre, CHANGELOG y tareas T-055/T-056. 007 probado en Oracle 23ai real. |

### La primera práctica: «Construir una mesa» (`blender.n1.mesa`)

[`practices/blender/level_1/mesa.json`](../../../practices/blender/level_1/mesa.json), seis objetivos obligatorios y uno opcional:

1. **Crea la cubierta** (`role.count` cubierta = 1).
2. **Hazla delgada** (`dimension.range` Z entre 0.05 y 0.3).
3. **Agrega cuatro patas** (`role.count` pata = 4).
4. **Coloca las patas debajo** (`spatial.below` de la cubierta, tolerancia 0.02).
5. **Dales una altura de mesa** (`dimension.range` Z de las patas entre 0.4 y 1.2).
6. **Guarda tu archivo** (`file.saved`).
7. *(opcional)* **Extra: dale color a la cubierta** (`material.exists`).

## Decisiones que se tomaron

- **Prácticas declarativas.** Una práctica es JSON que nombra validadores incluidos; el add-on nunca ejecuta código que llegue de la red.
- **Un motor, dos lugares.** El add-on evalúa en vivo; el servidor reevalúa la foto de la escena y Oracle guarda lo que calculó el servidor.
- **El motor no conoce Blender.** Python puro: pruebas con pytest normal y el backend lo importa sin Blender. Solo `blender/adapter.py` y el add-on tocan `bpy`.
- **Sesión propia del add-on**, vinculada con código (como un televisor). Blender nunca ve la contraseña.
- **Subir no es publicar.** Cada subida crea una versión; solo un admin publica.
- **Progreso que no retrocede**; al completar, las habilidades suben como mucho a «con_pistas».
- **Sin binarios en el repositorio**: paquetes armados al vuelo.
- **Blender 4.2 como mínimo** (primera versión con extensiones). La versión principal del curso sigue abierta (T-038).

## Pruebas al cierre

- Backend: 257 pruebas (pytest, SQLite).
- Motor, add-on y tablero: 36 pruebas (pytest).
- El add-on dentro de `bpy` 5.0.1 de PyPI: activa el add-on desde `addon/` con `addon_utils.enable`, construye la mesa con `bpy` y llega al 100 % (job de CI `addon-blender`).
- Frontend: 148 pruebas (vitest), lint y build.
- Oracle 23ai real en contenedor: scripts 001→007, 007 repetido sin errores, 18 tablas, importar y publicar la práctica y recorrido completo del add-on contra esa base.

## Lo que la etapa 1 dejaba corto

Lo dijo el propio usuario al pedir la etapa 2: el motor «todavía está muy básico». En concreto:

- La respuesta era un veredicto: «Cube: dimensión Z = 2.00 fuera de [0.05, 0.30]». Decía **que** estaba mal, no **cómo** arreglarlo.
- Para saber qué hacer había que mirar la lista de objetivos (la «tabla») en la barra lateral, no la escena.
- Las pistas eran texto fijo escrito por el autor; si no había pistas, no había ayuda.
- Nada señalaba en la vista 3D qué objeto estaba mal o dónde faltaba una pieza.
- El tono era de exigencia: comprobar, fallar, volver a comprobar.

Eso es lo que resuelve la [etapa 2](etapa-2.md).

## Pendientes heredados

| Tarea | Qué falta |
|---|---|
| T-055 | Ejecutar 007 en la base de producción después del piloto (manual de Oracle, §10). |
| T-056 | Probar el instalador en Windows y macOS reales. |
| T-038 | Elegir la versión principal de Blender del curso. |
