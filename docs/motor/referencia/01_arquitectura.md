# 01 · Arquitectura

```
┌──────────────────── Computadora del alumno ────────────────────┐
│ Blender 4.2+                                                    │
│  └─ Extensión «Amatista» (addon/amatista_blender)               │
│      ├─ Paneles en Vista 3D › N › Amatista (tarjetas, diálogos) │
│      ├─ Captura de la escena → SceneState (solo datos)          │
│      ├─ Motor vendido dentro del .zip (_motor.py → engine/)     │
│      └─ Red en un hilo + cola sin conexión (red.py)             │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS · Bearer <sesión del add-on>
┌──────────────────────────────▼──────────────────────────────────┐
│ API FastAPI · /api/addon/v1 (backend/api/addon.py)              │
│  vínculos · prácticas · intentos · progreso · descargas         │
│  contenido/motor.py: el MISMO motor, importado desde engine/    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│ Oracle (007): ADDON_VINCULOS, PRACTICAS, PRACTICA_VERSIONES,    │
│ PROGRESO_PRACTICAS + lo existente: SESIONES, PROGRESO_LECCIONES,│
│ HABILIDADES_ALUMNO, EVENTOS, VERIFICACIONES_BLENDER             │
└─────────────────────────────────────────────────────────────────┘
        ▲
        │ /api/addon/v1 con la sesión normal
┌───────┴──────────── PWA ─────────────────────────────────────────┐
│ #/blender (descarga, compatibilidad, dispositivos, prácticas)   │
│ #/vincular?codigo=… · bloque de lección blender_practice        │
│ Panel › «Prácticas en Blender» · Admin › Prácticas              │
└─────────────────────────────────────────────────────────────────┘
```

## Decisiones

**Prácticas declarativas, nunca código del servidor.** Una práctica es un JSON (`amatista.practice/1`) que nombra validadores ya incluidos en el motor (`role.count`, `dimension.range`, `spatial.below`, `file.saved`…). El add-on nunca ejecuta Python que venga de la red. Agregar una capacidad nueva es agregar un validador al motor y publicar una versión nueva del add-on.

**El ejemplo manda (motor 3.5).** Cada práctica trae su ejemplo resuelto en código (`example.steps`). De ese ejemplo salen la escena esperada, la revisión automática aspecto por aspecto (`example.matches`), las instrucciones que lee el alumno, el ejemplo armado en Blender y la tarjeta de la lección. La plataforma, el add-on y el motor hablan del mismo resultado, y lo que se revisa ya no depende de que el autor recuerde escribir cada objetivo. Ver [14_ejemplo_y_revision.md](14_ejemplo_y_revision.md).

**Un motor, dos lugares.** El add-on evalúa en vivo para dar respuesta inmediata (sin red). Cuando manda un intento, envía la *foto* de la escena (nombres, tipos, roles, medidas, materiales, modificadores, si el archivo está guardado) y el servidor la vuelve a evaluar con el mismo motor y la misma versión de la práctica. Lo que guarda Oracle es lo que calculó el servidor, no lo que dijo el add-on. `snapshot.py` rechaza números no finitos o no numéricos.

**El motor no conoce Blender.** `engine/amatista_engine` es Python puro (3.11+). El único módulo que toca `bpy` es `amatista_engine/blender/adapter.py` (captura) y el add-on. Por eso las pruebas del motor corren con pytest normal y el backend lo importa sin Blender.

**Sesión propia del add-on.** Blender no ve la contraseña. Se conecta con un código (como un televisor) o con el vínculo de un solo uso que trae el paquete personal. La sesión resultante (`SESIONES.DISPOSITIVO` empieza con `blender-addon`) solo puede usar `/api/addon/` y `/api/blender/`; cualquier otra ruta responde 403. El alumno la ve y la cierra desde la página Blender.

**Versiones de práctica.** Cada subida crea una fila en `PRACTICA_VERSIONES` (definición compilada + huella). Subir nunca publica: `PRACTICAS.VERSION_PUBLICADA` solo cambia cuando un admin pulsa Publicar. Los alumnos reciben siempre la versión publicada; los intentos guardan la versión con la que se evaluaron.

**Progreso que no retrocede.** `PROGRESO_PRACTICAS` guarda una fila por alumno y práctica. Un intento peor no baja los objetivos ni el paso actual guardados. Al completar: se marca la lección enlazada (`progreso.guardar`), suben las habilidades de la práctica como mucho a «con_pistas» (la autonomía la confirma el proyecto del nivel, rúbrica D/E) y se anota `activity_submitted`.

**Sin binarios en el repositorio.** El `.zip` de la extensión y los paquetes con instalador se arman al vuelo (`addon/herramientas/construir.py`), con fechas fijas para que dos construcciones iguales den bytes iguales. Los públicos se guardan en memoria del proceso; los personales llevan un vínculo y nunca se cachean.

## Flujo del alumno

1. En **#/blender** elige su sistema (se detecta solo) y descarga `Amatista-<versión>-<sistema>.zip`. Con sesión abierta, el paquete trae un vínculo pre-confirmado (7 días, un uso).
2. Abre «Instalar Amatista»: busca Blender, comprueba que sea 4.2 o más nuevo y, si lo es, instala y activa la extensión con `blender --background`. Si no, avisa y no toca nada.
3. Abre Blender: el add-on canjea el vínculo y queda conectado; pide `GET /practica-actual` y abre la práctica que el alumno dejó abierta en su lección.
4. Mientras trabaja, cada cambio en la escena se reevalúa (con medio segundo de calma). Los intentos se envían solos unos segundos después de un cambio, o con **Enviar mi progreso**. Sin conexión se encolan y se envían al volver.
5. La lección (bloque `blender_practice`) consulta el progreso cada 6 s y muestra los pasos al día.

## Archivos clave

| Archivo | Responsabilidad |
|---|---|
| `engine/amatista_engine/engine.py` | Evalúa objetivos en orden, respeta `requires`, calcula progreso ponderado. |
| `engine/amatista_engine/practice/loader.py`, `compiler.py` | Valida y compila la práctica (errores en español, con la ruta del campo). |
| `engine/amatista_engine/ejemplo/` | El ejemplo resuelto: arma la escena esperada (`pasos.py`) y revisa la del alumno contra ella (`revision.py`); validador `example.matches`. |
| `engine/amatista_engine/pedagogy/` | Pistas por niveles, autonomía, grafo de habilidades. |
| `addon/amatista_blender/practicas.py` | Captura, evaluación en vivo, intentos, manejadores de Blender. |
| `addon/amatista_blender/cuenta.py`, `red.py` | Vínculo, sesión, red sin congelar Blender, cola sin conexión. |
| `addon/amatista_blender/interfaz/` | Estilo, tarjetas, diálogos y HUD en la vista 3D. |
| `addon/herramientas/construir.py` | Extensión `.zip`, paquetes por sistema, índice del repositorio de extensiones. |
| `backend/contenido/motor.py` | Puente del backend al motor y al constructor. |
| `backend/api/addon.py` | API completa del add-on ([05_api.md](05_api.md)). |
