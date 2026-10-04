# 03 · Add-on de Blender conectado a Amatista

Guía técnica para construir el add-on: qué hace y qué no, cómo se conecta con la plataforma, cómo se organiza el código y en qué orden se construye. Es el diseño de la fase E del [plan maestro](00_plan_maestro.md), escrito antes del código.

> **4 de octubre de 2026: ya está construido** (rama del rediseño de Amatista Engine). La documentación vigente es
> [`docs/motor/`](../motor/README.md); la [sección 11](#11-lo-que-cambió-al-construirlo) resume en qué se apartó
> la construcción de este diseño. Lo demás se conserva como registro de las decisiones.

> Verificar contra la documentación oficial de Blender de la versión principal elegida (T-038) antes de
> escribir código: la API de Python (`bpy`) cambia entre versiones. Lo de aquí corresponde a Blender 4.2 o
> posterior (plataforma de extensiones); la sección 3 dice qué cambia si la versión principal fuera anterior.

## 1. Propósito y límites

Lo que hace (propuesta, sección 8):

- Muestra **dentro de Blender** la lección que el alumno tiene abierta en la plataforma: objetivo, pasos, pistas opcionales y criterios de comprobación.
- Hace **comprobaciones locales opcionales** («¿existe la mesa?», «¿tiene 4 patas?», «¿guardaste el archivo?») y le dice al alumno qué falta, sin bloquearlo.
- Permite **volver a la plataforma** (abre la lección en el navegador) y, si el alumno quiere, envía el resultado de las comprobaciones como evidencia de progreso.
- Para el equipo: registra **verificaciones** de compatibilidad (versión de Blender, sistema, resultado) en la matriz.

Lo que no hace:

- No es requisito: **el primer recorrido se completa sin add-on**.
- No reemplaza la comprensión: una comprobación técnica (existe un modificador) no prueba aprendizaje; la habilidad pasa a «autónoma» con variación, explicación o transferencia (rúbrica D y E).
- **No ejecuta código que venga del servidor.** Las comprobaciones son declarativas (sección 6). La visión 3D Lab mencionaba «enviar scripts de Python desde la nube»: ese punto queda descartado por seguridad (un servidor comprometido podría ejecutar cualquier cosa en la computadora del alumno).
- No sube el archivo `.blend` por defecto (privacidad y espacio; nada de binarios en Oracle).

## 2. Arquitectura

```
┌─────────────────────────── Computadora del alumno ───────────────────────────┐
│ Blender                                                                       │
│  └─ Add-on «Amatista»                                                         │
│      ├─ Panel lateral (Vista 3D › N › Amatista): lección, pasos, comprobar    │
│      ├─ Comprobaciones locales (Python puro sobre datos de la escena)         │
│      └─ Cliente HTTP (urllib, en un hilo; resultados con bpy.app.timers)      │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │ HTTPS · Authorization: Bearer <token del add-on>
┌───────────────────────────────▼───────────────────────────────────────────────┐
│ API Amatista (FastAPI)                                                        │
│  /api/addon/v1/…  (nuevo, T-050)    /api/progreso (existe)                    │
│  /api/blender/versiones (existe)    /api/blender/verificaciones (existe)      │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────────────────────┐
│ Oracle: SESIONES (dispositivo = blender-addon), LECCIONES (ficha y            │
│ comprobaciones), PROGRESO_LECCIONES, HABILIDADES_ALUMNO, VERIFICACIONES_…     │
└───────────────────────────────────────────────────────────────────────────────┘
```

Principios: el add-on funciona sin conexión con la última lección descargada; toda llamada de red tiene tiempo límite y nunca congela la interfaz de Blender; los contratos son tolerantes (campos nuevos se ignoran), igual que entre la PWA y la API.

## 3. Empaquetado según la versión de Blender

| Versión principal | Formato | Archivo de metadatos | Instalación |
|---|---|---|---|
| 4.2 o posterior (recomendado) | **Extensión** | `blender_manifest.toml` | Arrastrar el `.zip` o *Preferencias › Obtener extensiones › Instalar desde disco* |
| Anterior a 4.2 | Add-on clásico | `bl_info` en `__init__.py` | *Preferencias › Complementos › Instalar* |

Si se soportan las dos, se mantienen los dos metadatos (el manifiesto manda en 4.2+). Las extensiones deben respetar **`bpy.app.online_access`**: si el usuario desactivó el acceso a internet en Blender, el add-on no se conecta y lo dice.

**Licencia:** un add-on usa `bpy`, que es GPL; el add-on debe publicarse con una licencia compatible con GPL (por ejemplo `GPL-3.0-or-later`). Eso aplica a la carpeta del add-on, no a la PWA ni al backend. El repositorio todavía no define licencia (README): decidirlo es parte de T-051.

## 4. Estructura del código

```
addon/amatista_blender/
├── blender_manifest.toml
├── __init__.py            # register()/unregister(); nada pesado al importar
├── preferencias.py        # AddonPreferences: URL de la API, cuenta vinculada
├── propiedades.py         # PropertyGroup en WindowManager: lección cargada, estado
├── cliente.py             # HTTP con urllib (sin dependencias externas), hilos y caché
├── operadores.py          # vincular, cargar lección, comprobar, enviar, abrir en la plataforma
├── paneles.py             # panel de la barra lateral de la Vista 3D
├── comprobaciones/
│   ├── __init__.py        # registro de tipos de comprobación
│   ├── escena.py          # lee la escena y produce datos simples (dicts)
│   └── reglas.py          # Python PURO: reglas sobre esos datos (se prueba sin Blender)
└── tests/
    ├── test_reglas.py     # pytest normal
    └── en_blender.py      # blender --background --factory-startup --python tests/en_blender.py
```

La separación `escena.py` (toca `bpy`) / `reglas.py` (no toca `bpy`) es la decisión más importante: casi toda la lógica se prueba con `pytest` en CI sin instalar Blender.

### 4.1 Manifiesto (4.2+)

```toml
schema_version = "1.0.0"
id = "amatista"
version = "0.1.0"
name = "Amatista"
tagline = "Lecciones y comprobaciones de Amatista dentro de Blender"
maintainer = "Maximiliano Cabello Mata"
type = "add-on"
blender_version_min = "X.Y.0"        # la versión principal (T-038)
license = ["SPDX:GPL-3.0-or-later"]

[permissions]
network = "Descargar lecciones y enviar el progreso a Amatista"
```

### 4.2 Registro, preferencias y panel

```python
# __init__.py
import bpy
from . import operadores, paneles, preferencias, propiedades

CLASES = (
    preferencias.PreferenciasAmatista,
    propiedades.EstadoAmatista,
    operadores.AMATISTA_OT_vincular,
    operadores.AMATISTA_OT_cargar_leccion,
    operadores.AMATISTA_OT_comprobar,
    operadores.AMATISTA_OT_abrir_plataforma,
    paneles.AMATISTA_PT_leccion,
)


def register():
    for clase in CLASES:
        bpy.utils.register_class(clase)
    bpy.types.WindowManager.amatista = bpy.props.PointerProperty(type=propiedades.EstadoAmatista)


def unregister():
    del bpy.types.WindowManager.amatista
    for clase in reversed(CLASES):
        bpy.utils.unregister_class(clase)
```

```python
# preferencias.py
import bpy


class PreferenciasAmatista(bpy.types.AddonPreferences):
    bl_idname = __package__  # en una extensión es "bl_ext.<repositorio>.amatista"

    url_api: bpy.props.StringProperty(name="Servidor", default="https://api.amatista.example")
    token: bpy.props.StringProperty(name="Token", subtype="PASSWORD")  # ver sección 5
    cuenta: bpy.props.StringProperty(name="Cuenta vinculada")

    def draw(self, context):
        self.layout.prop(self, "url_api")
        fila = self.layout.row()
        fila.label(text=self.cuenta or "Sin vincular")
        fila.operator("amatista.vincular", text="Vincular con mi cuenta")
```

```python
# paneles.py
import bpy


class AMATISTA_PT_leccion(bpy.types.Panel):
    bl_label = "Amatista"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Amatista"

    def draw(self, context):
        estado = context.window_manager.amatista
        col = self.layout.column()
        if not estado.leccion_id:
            col.operator("amatista.cargar_leccion", text="Cargar mi lección actual")
            return
        col.label(text=estado.titulo)
        col.label(text=f"Objetivo: {estado.objetivo}", icon="INFO")
        col.label(text=f"Verificada en Blender {estado.verificada_en or '—'}")
        col.operator("amatista.comprobar", icon="CHECKMARK")
        for linea in estado.resultado.splitlines():
            col.label(text=linea)
        col.operator("amatista.abrir_plataforma", icon="URL")
```

### 4.3 Red sin congelar Blender

`bpy` no es seguro entre hilos: el hilo solo hace la petición HTTP; el resultado se aplica en el hilo principal con un temporizador.

```python
# cliente.py (resumen)
import json
import queue
import threading
import urllib.request

import bpy

_resultados = queue.Queue()


def pedir(url, token, al_terminar, datos=None, segundos=10):
    """GET (o POST si hay datos) en segundo plano; al_terminar(respuesta, error) corre en el hilo principal."""
    if not bpy.app.online_access:
        al_terminar(None, "El acceso a internet está desactivado en Preferencias › Sistema.")
        return

    def trabajo():
        try:
            cuerpo = json.dumps(datos).encode() if datos is not None else None
            peticion = urllib.request.Request(url, data=cuerpo, method="POST" if cuerpo else "GET")
            peticion.add_header("Authorization", f"Bearer {token}")
            peticion.add_header("Content-Type", "application/json")
            peticion.add_header("X-Amatista-Addon", "0.1.0")
            with urllib.request.urlopen(peticion, timeout=segundos) as respuesta:
                _resultados.put((al_terminar, json.loads(respuesta.read()), None))
        except Exception as error:  # se informa al alumno; nunca se rompe Blender
            _resultados.put((al_terminar, None, str(error)))

    threading.Thread(target=trabajo, daemon=True).start()
    if not bpy.app.timers.is_registered(_entregar):
        bpy.app.timers.register(_entregar, first_interval=0.2)


def _entregar():
    while not _resultados.empty():
        al_terminar, respuesta, error = _resultados.get()
        al_terminar(respuesta, error)
    return 0.2 if threading.active_count() > 1 else None  # None detiene el temporizador
```

## 5. Vincular la cuenta (sin escribir la contraseña en Blender)

Flujo de «código de dispositivo», como en las televisiones:

1. El add-on pide `POST /api/addon/v1/vinculos` → recibe `{codigo: "K7Q-2MF", vinculo_id, expira_en}`.
2. Muestra el código y abre `https://<pwa>/#/vincular` en el navegador.
3. El alumno, con su sesión iniciada en la PWA, escribe el código y confirma.
4. El add-on consulta `GET /api/addon/v1/vinculos/{vinculo_id}` cada 3 s (máx. 5 min) hasta recibir `{token, cuenta}`.

El token es una fila de `SESIONES` con `dispositivo = 'blender-addon <versión>'`: el backend ya guarda solo su hash, ya permite cerrar sesiones («cerrar todas») y ya las purga. Lo único nuevo es la tabla de vínculos pendientes (código hasheado, usuario que confirmó, expiración de 10 minutos), en un script `007` de T-050.

El token se guarda en las preferencias del add-on (`userpref.blend`, en texto plano en la computadora del alumno). Mitigaciones: alcance limitado (solo rutas `/api/addon/v1` y progreso, nunca administración), revocable desde la PWA, expiración como el resto de sesiones.

## 6. Comprobaciones locales declarativas

El servidor no manda código; manda **datos** que el add-on interpreta con reglas propias. En el JSON de la lección (campo opcional nuevo, lo valida `validacion.py` en T-052):

```json
"comprobacionesAddon": [
  {"id": "c1", "tipo": "objeto_existe", "nombre": "Mesa", "mensaje": "Crea un objeto llamado Mesa"},
  {"id": "c2", "tipo": "cuenta_objetos", "tipoObjeto": "MESH", "coleccion": "Mesa", "minimo": 5},
  {"id": "c3", "tipo": "modificador", "objeto": "Cubierta", "modificador": "BEVEL", "opcional": true},
  {"id": "c4", "tipo": "dimension", "objeto": "Cubierta", "eje": "z", "entre": [0.02, 0.1]},
  {"id": "c5", "tipo": "archivo_guardado"}
]
```

```python
# comprobaciones/escena.py — único lugar que lee bpy
import bpy


def foto_de_la_escena():
    return {
        "guardado": bool(bpy.data.filepath) and not bpy.data.is_dirty,
        "version": bpy.app.version_string,
        "objetos": [
            {
                "nombre": o.name,
                "tipo": o.type,
                "colecciones": [c.name for c in o.users_collection],
                "modificadores": [m.type for m in getattr(o, "modifiers", [])],
                "dimensiones": tuple(o.dimensions),
            }
            for o in bpy.context.scene.objects
        ],
    }
```

```python
# comprobaciones/reglas.py — Python puro, se prueba con pytest
def evaluar(comprobaciones, foto):
    """[(id, cumple, mensaje)]; un tipo desconocido se informa, no rompe."""
    resultados = []
    for c in comprobaciones:
        regla = REGLAS.get(c.get("tipo"))
        if regla is None:
            resultados.append((c.get("id"), None, "Esta comprobación necesita una versión más nueva del add-on"))
            continue
        resultados.append((c["id"], regla(c, foto), c.get("mensaje", "")))
    return resultados


def _objeto(foto, nombre):
    return next((o for o in foto["objetos"] if o["nombre"] == nombre), None)


REGLAS = {
    "objeto_existe": lambda c, f: _objeto(f, c["nombre"]) is not None,
    "archivo_guardado": lambda c, f: f["guardado"],
    "modificador": lambda c, f: c["modificador"] in (_objeto(f, c["objeto"]) or {}).get("modificadores", []),
    "cuenta_objetos": lambda c, f: sum(
        o["tipo"] == c.get("tipoObjeto", o["tipo"]) and (not c.get("coleccion") or c["coleccion"] in o["colecciones"])
        for o in f["objetos"]
    ) >= c.get("minimo", 1),
}
```

Reglas de diseño: los nombres de objetos son una convención de la lección (la lección los pide); una comprobación «opcional» nunca aparece como error; el resultado se muestra como lista de lo que falta, con la pista de la lección.

## 7. Contrato de API v1 para el add-on (T-050)

| Método y ruta | Uso | Estado |
|---|---|---|
| `POST /api/addon/v1/vinculos` · `GET /api/addon/v1/vinculos/{id}` · `POST /api/addon/v1/vinculos/{id}/confirmar` (desde la PWA) | Vincular la cuenta | Nuevo |
| `GET /api/addon/v1/estado` | Versión mínima del add-on, versión principal de Blender, si el servicio está disponible | Nuevo (usa `VERSIONES_BLENDER`) |
| `GET /api/addon/v1/leccion-actual` | La última lección abierta por el alumno (de `EVENTOS_APRENDIZAJE`) | Nuevo |
| `GET /api/addon/v1/lecciones/{curso}/{leccion}` | Ficha, pasos en texto y `comprobacionesAddon` (sin bloques web) | Nuevo |
| `POST /api/progreso` | Marcar actividad completada, igual que la PWA | Existe |
| `POST /api/addon/v1/comprobaciones` | Resultado de comprobar: evento `activity_submitted` y, si corresponde, habilidad `con_guia`/`con_pistas` | Nuevo (T-042 + T-052) |
| `GET /api/blender/versiones` | Avisar si la versión del alumno no está verificada | Existe |
| `POST /api/blender/verificaciones` (solo profesor/admin) | Registrar una verificación desde Blender | Existe |

Todas devuelven errores en español con `detail`, como el resto de la API. Cabecera `X-Amatista-Addon: <versión>` en cada petición para métricas y para avisar actualizaciones.

## 8. Pruebas y calidad

| Nivel | Cómo | Dónde |
|---|---|---|
| Reglas | `pytest addon/amatista_blender/tests/test_reglas.py` | CI de siempre (sin Blender) |
| Dentro de Blender | `blender --background --factory-startup --python addon/amatista_blender/tests/en_blender.py` (instala, registra, crea una escena de prueba, corre `foto_de_la_escena` + `evaluar`, desregistra) | Local; en CI, descargando la versión principal |
| Paquete | `blender --command extension validate` y `blender --command extension build` (4.2+) | Local y CI |
| Contrato | Pruebas de la API `/api/addon/v1` en `backend/tests/` | CI |
| Compatibilidad | Cada versión verificada se registra en la matriz (`VERIFICACIONES_BLENDER.VERSION_ADDON`) | Manual, con evidencia |

## 9. Orden de construcción (fase E)

| Paso | Tarea | Demostración mínima para aceptarlo |
|---|---|---|
| E1 | T-050 Contrato de API v1 y vinculación | Pruebas del backend: vincular, token del add-on sin acceso a administración, revocar |
| E2 | T-051 Esqueleto del add-on | Instala en la versión principal, muestra la lección actual y abre la plataforma; sin conexión muestra la última descargada |
| E3 | T-052 Comprobaciones de una lección | La lección 03 de «Mi primer espacio 3D» tiene `comprobacionesAddon` y el add-on dice qué falta |
| E4 | T-053 Verificaciones desde Blender | Un profesor registra una verificación con versión de Blender, sistema y versión del add-on |
| E5 | T-013 Publicación del MVP | Paquete validado, guía de instalación para alumnos y registro en el CHANGELOG |

Un incremento por vez; cada uno debe seguir funcionando sin el siguiente (regla del [centro de dirección](../../PROYECTO.md)).

## 10. Decisiones abiertas del add-on

- Versión mínima de Blender (depende de T-038).
- Distribución: zip en el repositorio y releases de GitHub, o publicación en extensions.blender.org (exige licencia GPL y revisión).
- Licencia de la carpeta del add-on y del resto del repositorio.
- Alcance de la evidencia: solo resultados de comprobaciones, o también una captura (`bpy.ops.render.opengl` o una captura de la ventana) subida a un almacenamiento de archivos, nunca a Oracle.

## 11. Lo que cambió al construirlo

| Diseño (arriba) | Construido (4 oct 2026) | Por qué |
|---|---|---|
| `comprobacionesAddon` dentro del JSON de la lección | Prácticas propias en `amatista.practice/1` (`practices/`, tablas `PRACTICAS` y `PRACTICA_VERSIONES`) y un bloque de lección `blender_practice` que las enlaza | Las prácticas tienen versiones, pistas, roles y un autor en Blender; la lección solo dice cuál usar |
| Reglas propias del add-on (`comprobaciones/reglas.py`) | El motor `engine/amatista_engine` (Python puro) vendido dentro del `.zip` | El mismo motor corre en el add-on y en el servidor |
| `POST /comprobaciones` con el resultado | `POST /intentos` con la foto de la escena: **el servidor vuelve a evaluar** y guarda su propio resultado | El resultado no depende de lo que diga el cliente |
| `GET /vinculos/{id}` | `POST /vinculos/{id}/estado` con un secreto que solo conoce el add-on | Nadie puede canjear un código ajeno conociendo solo el id |
| `GET /leccion-actual` | `GET /practica-actual` (la lección marca la práctica con **Abrir en Blender**) | La unidad que abre Blender es la práctica |
| Distribución: zip en el repositorio o releases | La API arma el paquete al vuelo, con instalador por sistema y vínculo de un solo uso; también un repositorio de extensiones (`index.json`) | Sin binarios en git; el alumno no copia URLs ni códigos |
| Licencia por decidir | `addon/` es GPL-3.0-or-later (obligado por `bpy`, en el manifiesto). El resto del repositorio sigue sin licencia | — |
| Evidencia: ¿captura? | Solo datos de la escena (nombres, medidas, roles, materiales, modificadores, archivo guardado). Ningún archivo ni imagen | Privacidad y espacio |
| Pruebas dentro de Blender descargando la versión principal | `bpy` de PyPI en CI (job `addon-blender`) | Rápido y reproducible |

Sigue abierto: la versión principal del curso (T-038; el add-on exige 4.2 como mínimo) y publicar en extensions.blender.org. Probar el instalador en Windows y macOS reales es T-056.
