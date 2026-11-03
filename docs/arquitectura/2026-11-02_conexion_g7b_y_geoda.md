# Conexión de Amatista con G7B y Geoda

Fecha: 2026-11-02. Cómo se conecta Amatista con su proyecto hermano **G7B** (medición y datos) y cómo vive **Geoda** (el kernel que adapta las herramientas al equipo) dentro del add-on. Es la mitad de Amatista del [plan maestro de G7B](https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl/blob/main/docs/PLAN_MAESTRO.md), que tiene el camino completo, las ofertas del Developer Pack y los tiempos. Contexto: [propuesta del centro 3D](../propuestas/2026-11-01_centro_3d_y_g7b.md).

## 1. Quién hace qué

| Pieza | Responsabilidad | Datos de personas |
|---|---|---|
| **Amatista** (API en Oracle, PWA en Cloudflare, add-on) | Enseña y recomienda. Guarda en caché lo que publica G7B y agrega los eventos de las prácticas | **Sí, y solo aquí** |
| **Geoda** (módulo `geoda` del add-on, junto al Corazón) | En el equipo del alumno: detecta, pide la recomendación, decide, aplica con deshacer, mide y reporta | No sale nada personal del equipo |
| **G7B** (repo `amatista-g7b-etl`) | Mide el mundo y publica perfiles, recomendaciones, catálogos y el modelo de costos | **Nunca** |

```text
 G7B publica ──► API de G7B (Heroku) / copia en GitHub Pages
                      │  cada 6 h, con hashes verificados
                      ▼
 Amatista: tabla G7B_CACHE (Oracle) ──► GET /api/g7b/v1/recomendacion ──► add-on (Geoda) y PWA
                                                                              │
 Amatista: eventos de práctica (rutas que ya existen) ◄──────── evento ───────┘
                      │  agregados, ≥5 equipos, sin cuentas
                      ▼
 GET /api/g7b/v1/agregados (con token) ──► G7B los trae cada día ──► mejora sus perfiles
```

**Regla de oro:** Amatista **nunca depende de que G7B esté arriba.** Trabaja con su caché y, si no hay caché, con el `perfiles.json` incluido en el add-on.

## 2. Lo que se construye en Amatista

### 2.1 Script de Oracle `014_g7b.sql` (aditivo)

```sql
CREATE TABLE G7B_CACHE (
  CLAVE        VARCHAR2(80)  PRIMARY KEY,   -- 'manifiesto', 'perfiles', 'texturas', 'herramientas', 'modelo_costos'
  VERSION      VARCHAR2(80)  NOT NULL,      -- la versión publicada por G7B
  SHA256       VARCHAR2(64)  NOT NULL,      -- verificado contra el manifiesto
  CONTENIDO    CLOB          CHECK (CONTENIDO IS JSON),
  ACTUALIZADO  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL
);
```

Los eventos de las prácticas ya se guardan con las rutas de `eventos` y `sincronizar`. Solo se agregan los campos técnicos: `nivel_equipo`, `perfil_g7b`, `fps_mediana` y `version_g7b`. **No se agrega nada personal.**

### 2.2 Sincronización (servidor)

- `backend/herramientas/g7b_sincronizar.py`:
  1. baja el manifiesto `g7b.publicacion/1` de `G7B_API_URL` (o de Pages si la API no responde);
  2. comprueba que `calidad_aprobada` sea verdadero;
  3. baja cada archivo y **verifica su SHA-256**;
  4. guarda la copia en `G7B_CACHE`.

  Si algo no cuadra, conserva la copia anterior.
- `despliegue/amatista-g7b.service` + `amatista-g7b.timer`: cada 6 h.
- Admin › Estado muestra la versión de G7B en caché y su antigüedad.

### 2.3 Rutas nuevas (`backend/api/g7b.py`)

| Ruta | Quién la usa | Qué hace |
|---|---|---|
| `GET /api/g7b/v1/recomendacion?nivel=&blender=&so=` | Add-on (Geoda) y PWA | Responde **desde la caché**: perfil, versión de Blender, texturas y herramientas para ese nivel. La consulta no se guarda con la cuenta |
| `GET /api/g7b/v1/modelo-costos` | Add-on (Geoda) | El modelo de costos vigente (archivo pequeño) |
| `GET /api/g7b/v1/agregados?desde=` | Solo G7B, con `Authorization: Bearer <AMATISTA_G7B_TOKEN>` | Eventos agregados por nivel, perfil, práctica y semana. **Solo celdas con 5 equipos o más.** Sin cuenta, correo, IP ni nombre de equipo |

### 2.4 Geoda en el add-on (`addon/amatista_blender/geoda/`)

1. **Detectar:** huella técnica (CPU, GPU, RAM, SO, versión de Blender) y un nivel N0–N4 calculado **en el equipo**, con las reglas de `perfiles.json`.
2. **Pedir:** `GET /api/g7b/v1/recomendacion` por `red.py`, que ya usa hilos, tiempo límite, cola y `bpy.app.online_access`. Sin red, usa la copia incluida.
3. **Decidir:** el modelo de costos local estima si la práctica cabe en el equipo con ese perfil.
4. **Aplicar:** el perfil (subdivisión, simplificar, muestras, resolución...) con **botón de deshacer**. El encendido es gradual (ConfigCat), y el servidor lo decide.
5. **Medir:** fps de la vista 3D durante la práctica (mediana).
6. **Reportar:** el evento técnico sale por la cola que ya existe (`pendientes.json`), con la cuenta del alumno **solo dentro de Amatista**. Hacia G7B solo sale agregado (2.3).

## 3. Ofertas del Developer Pack que van en Amatista

| Oferta | Uso en Amatista | Cuándo |
|---|---|---|
| **ConfigCat** | Bandera `g7b_perfiles` con % de alumnos; botón de apagado inmediato | Con Geoda (fase 6) |
| **Sentry** | Ya integrado (`observabilidad.py`). Se agrega un *Cron Monitor* para `amatista-g7b.timer` | Fase 4 |
| **SimpleAnalytics** | Estadísticas de la PWA sin cookies ni datos personales | Ya |
| **Testmail** | Probar los correos (registro, recuperación, avisos) en CI | Ya |
| **POEditor** | Traducción de la PWA y del add-on (español → inglés) | Con el centro 3D |
| **Pageclip** | Formulario "inscribe tu laboratorio" sin servidor | Con la estadía |
| **Stripe** (modo de prueba) | Preparar la futura tienda de modelos | Capa final del centro 3D |
| **Icons8 / IconScout** | Íconos del centro 3D | Con el centro 3D |
| **Bootstrap Studio** | Página de aterrizaje del centro 3D | Con el centro 3D |
| **AstraSecurity** | Escaneo de seguridad de `amatista-3d.tech` | Ya |
| **Doppler** | Proyecto `amatista` con `AMATISTA_G7B_TOKEN` (el **mismo** valor que en G7B) y `G7B_API_URL` | Fase 4 |

## 4. Orden

| Paso | Qué | Tarea | Depende de |
|---|---|---|---|
| 0 | Aviso de privacidad y consentimiento | T-187 | — |
| 1 | `014_g7b.sql` en Oracle | T-196 | — |
| 2 | `g7b_sincronizar.py` + temporizador | T-197 | API de G7B o Pages (plan maestro, fases 2 y 4) |
| 3 | `api/g7b.py` (recomendación y modelo) | T-198 | Paso 2 |
| 4 | Eventos con consentimiento y exportación agregada | T-189, T-190 | Paso 0 |
| 5 | Nivel y perfil en el add-on, y luego `geoda/` + ConfigCat | T-188, T-199 | Pasos 3 y 4 |
| 6 | Experimento de la estadía | T-186, T-191 | Paso 5 |

Todas están en la versión **v3.5.0 · Centro 3D con G7B** del tablero (T-186 a T-199).
