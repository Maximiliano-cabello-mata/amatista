# Corte `hack4edu`: estado comparativo (`amatista` + `amatista-g7b-etl`) y plan hasta el viernes

- **Fecha del corte:** Martes 3 de noviembre de 2026
- **Tag oficial en Git:** `hack4edu`
- **Repositorios auditados y comparados:**
  - Plataforma y motor educativo: [`Maximiliano-cabello-mata/amatista`](https://github.com/Maximiliano-cabello-mata/amatista) (rama `claude/entender-y-verificar`)
  - Motor de datos, telemetría y perfiles: [`Maximiliano-cabello-mata/amatista-g7b-etl`](https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl) (`main` + 9 ramas activas)
- **Horizonte del bloque `hack4edu`:** Martes 3 al Viernes 6 de noviembre de 2026

Este documento establece una **división clara y comprobable** entre:
1. **Lo que ya tenemos construido y verificado hoy** en `amatista`.
2. **Lo que ya existe en el repositorio hermano `amatista-g7b-etl`** (`main` y ramas abiertas) y cómo se compara pieza por pieza con `amatista`.
3. **Lo que se va a trabajar de aquí al viernes 6 de noviembre** bajo el frente `hack4edu` para cerrar el puente entre ambos repositorios.

---

## 1. Lo que YA TENEMOS en `amatista` al corte `hack4edu`

### 1.1 Comandos de verificación inmediata en `amatista`

| Pieza | Comando de comprobación | Estado verificado en el tag `hack4edu` |
|---|---|---|
| **Frontend (PWA + Facetas v4.4 + Portada viva)** | `cd frontend && npm run lint && npm test && npm run build` | **0 errores** de lint · **46 suites / 390 pruebas pasan** · Build PWA (87 recursos precacheados) y auditoría `revisar-publicacion.mjs` en verde |
| **Backend (FastAPI + Seguridad + Sincronización)** | `cd backend && python -m pytest -q` | **446 pruebas pasan** (`requirements.lock` congelado y reproducible) |
| **Motor 3D, Corazón 1.0 y Tablero** | `python -m pytest -q tablero engine/tests` | **594 pruebas pasan** en Python puro (sin requerir Blender abierto) |
| **Prácticas de Blender (58 ejercicios)** | `python -X utf8 herramientas/practicas.py probar` | **58 de 58 prácticas** pasan con su ejemplo resuelto (`99/100` alumnos simulados aprueban) |
| **Catálogo educativo (15 módulos)** | `python herramientas/contenido.py validar` | **15 de 15 módulos publicados** cumplen la Fórmula Amatista (5 lecciones + bloque interactivo + jefe) |

### 1.2 Qué incluye exactamente `amatista` en este corte

1. **Plataforma Web (PWA) y Sistema Visual «Facetas v4.4» (`frontend/`):**
   - **Portada guiada con vida propia (`Inicio.jsx` + `index.css`):**
     - **Cristal interactivo (`EmblemaHeroe`):** satélites de Blender y A-Frame en levitación desfasada; al tocar el cristal realiza un giro 3D con resorte, lanza chispas pixel-art multicolores y revela secretos de la plataforma.
     - **Mundos y mascotas por paso (`Escenario`, `Personaje`, `Jefe`):** cada paso del camino tiene su paisaje SVG animado, su mascota guía que **sigue el cursor con los ojos**, parpadea sola y al tocarla hace piruetas (`salto`, `giro`, `baile`, `voltereta`), suelta chispas y abre un globo con consejos de su mundo; la lección de examen muestra al jefe animado del módulo.
     - **Animaciones 100 % en GPU y modo accesible:** todas las animaciones continuas usan únicamente `transform` y `opacity`, auditadas por prueba automática en `frontend/src/components/estructura/facetas.test.js`, y se apagan solas en equipos modestos (`html.ligero`) o cuando el sistema pide `prefers-reduced-motion: reduce`.
   - **15 módulos publicados:** 9 de Blender (*Principiante*, *Principiante-Intermedio* e *Intermedio*) y 6 de A-Frame (*Inicial* e *Interactivo*).
   - **Estudio A-Frame (`#/estudio`), Motor Web (`frontend/src/motor3d/`), Goliat (`frontend/src/goliat/`), Avatares y Buzón.**
   - **Modo sin conexión y Ahorro de datos:** progreso local primero y sincronización comprimida con gzip (`POST /api/sincronizar`).
2. **Motor de Evaluación y Corazón Amatista 1.0 (`engine/`, `addon/`, `practices/`):**
   - **Contrato estable `amatista.corazon/1` (`engine/amatista_engine/corazon/`):** director pedagógico, andamio por herramienta, señales verificadas cada 0,5 s y puntos de extensión (`observadores`, `andamio`, `pistas`, `turno`) listos para conectar telemetría y perfiles.
   - **Motor 7 «Guion» y Add-on 7.1:** 43 validadores, 33 habilidades, 26 fichas de herramientas (`practices/blender/fichas.json`) y 58 prácticas verificadas.
3. **API y Base de Datos (`backend/`):**
   - 24 tablas SQL (`001` a `013`), cola de red en el add-on (`addon/amatista_blender/red.py`) y observabilidad con Sentry sin datos personales.

---

## 2. Comparativa con `amatista-g7b-etl`: qué tiene ya G7B y qué falta cruzar

Al inspeccionar el repositorio hermano [`amatista-g7b-etl`](https://github.com/Maximiliano-cabello-mata/amatista-g7b-etl) (tanto su rama `main` como sus 9 ramas de trabajo), este es el estado real lado a lado:

### 2.1 Estado real de `amatista-g7b-etl` al 3 de noviembre de 2026

| Rama en `amatista-g7b-etl` | Commit / Evidencia | Qué ya está construido en G7B | Estado |
|---|---|---|---|
| **`main`** | `3aad461` / `f36e03c` | **Primera integración real de extremo a extremo (2-nov-2026):** `Zyte -> Azure Bronce -> Embudo -> Azure Plata -> MongoDB Atlas`. Importó **2,353 registros** de `blender_docs` y publicó **987 documentos nuevos** en `conocimiento_3d.documentos`. Incluye `sonda/g7b_sonda.py` v0. | **En `main` y probado en nube real** |
| **`claude/project-thread-pgechg`** (PR #4) | `b01bc6b`, `5c66106`, `e9fa65a` | **Data Warehouse (`g7b_almacen`):** descarga de Blender Open Data (CC0), cubo dimensional en **DuckDB** (`cubo.py`), generación de **`perfiles.json` v0 (`g7b.perfil/1` para `N0`–`N4`)**, compuerta de calidad (`calidad.py`) y orquestador por fases (`orquesta.py`, `latido.yml`). | **Código y 49 pruebas listos · Falta fusionar a `main`** |
| **`chatgpt/g7b-publicacion-segura-colab-…`** (PR #5) | `155f73d` .. `d6a106d` | **Publicación versionada tras compuerta:** solo promueve a `publicado/actual.json` (con hashes SHA-256) cuando la compuerta de calidad aprueba; incluye laboratorio Colab reproducible. | **Código listo · Falta fusionar a `main`** |
| **`chatgpt/prueba-blender-azure-aislada-…` y `duckdb-azure-aislado-…`** (PR #6 y #7) | `bfdc7a8` .. `7aea045` | **Prueba real de Blender en Actions -> Azure y primer `cubo.duckdb` real en Azure** (7 hechos verificados con SHA-256 en prefijo aislado). | **Probado en Azure · Falta fusionar a `main`** |
| **`chatgpt/tablero-g7b-html-…`** (PR #8) | `1ad7ca6` .. `7cfafb0` | **Tablero HTML offline (`g7b` dashboard):** generador estático desde DuckDB y JSON aprobado, sin filtrar datos de dispositivos. | **Código y pruebas listos · Falta fusionar a `main`** |
| **`chatgpt/g7b-arquitectura-privada-ofertas-…`** (PR #9) | `bb583cf` .. `c6d1257` | **Infraestructura Azure v3 (`WorkloadProfiles`):** Container Apps Job con identidad administrada (sin SAS), OIDC desde GitHub y catálogo de 82 ofertas (`infra/ofertas/catalogo.json`). | **Desplegado en Azure · Falta fusionar a `main`** |
| **`claude/peaceful-tesla-ctqaps`** | `c76bdd2`, `26dd867`, `69430af` | **Geodar Radar (`python -m geodar`) y `PLAN_MAESTRO.md`:** captura unificada de foros Discourse, versiones en GitHub y APIs JSON (Poly Haven, ambientCG, extensiones de Blender, caniuse). | **Código y pruebas listos · Falta fusionar a `main`** |
| **`docs/observaciones-documentacion-g7b-2026-11-02` y `analisis/deepnote-g7b`** | `2894cf0`, `b7c8a11` (hoy 3-nov) | **Auditoría de calidad de los 987 documentos** (detectó pérdida de tablas/enlaces en Sphinx y duplicación de texto) y cuaderno **Deepnote** (`01_explorar_documentacion.ipynb`) para auditar el lote. | **Listos en ramas de análisis/docs** |

### 2.2 Matriz de cruce: `amatista-g7b-etl` vs. `amatista`

| Pieza del puente `Amatista ↔ G7B` | ¿Qué tiene ya `amatista-g7b-etl`? | ¿Qué tiene hoy `amatista` (tag `hack4edu`)? | Brecha exacta a cerrar |
|---|---|---|---|
| **1. Niveles de equipo (`N0` a `N4`) y `perfiles.json` (`g7b.perfil/1`)** | `g7b_almacen/perfiles.py` ya genera `perfiles.json` v0 y `sonda/g7b_sonda.py` ya lee la huella de hardware (`CPU`, `GPU`, `RAM`, `SO`). | El Corazón tiene perfiles por programa (`blender.py`, `aframe.py`) y ramas (`practices/ramas/`), pero **no incluye aún `perfiles.json` de hardware ni el detector `N0`–`N4` en el add-on**. | Incorporar `perfiles.json` v0 y el detector de nivel `N0`–`N4` en el add-on (`T-188`) con opción de aplicar y revertir en un clic. |
| **2. Caché de G7B en el servidor (`G7B_CACHE` y `/api/g7b/v1/...`)** | Las ramas #5–#8 ya producen `publicado/actual.json` con hashes SHA-256 y `resumen.json`. | El último script SQL es `013_avatares_y_buzon.sql`. **Aún no existen `014_g7b.sql` (`G7B_CACHE`) ni las rutas `/api/g7b/v1/recomendacion` en `backend/api/`**. | Crear `014_g7b.sql` (`T-196`) y el endpoint con caché local/respaldo estático (`T-197`, `T-198`) para que el add-on y la PWA consulten a Amatista sin depender de que G7B esté encendido. |
| **3. Recomendaciones al alumno en la PWA (`Mi panel`)** | El esquema de recomendación por nivel (`N0`–`N4`), versión LTS de Blender y resolución de texturas (`1K`/`2K`/`4K`) ya está definido en `FICHAS_TECNICAS.md` y `PLAN_MAESTRO.md`. | `frontend/src/lib/rendimiento.js` detecta si el navegador requiere modo `ligero`, pero **`Mi panel` (`Panel.jsx`) aún no muestra recomendaciones de equipo (`N0`–`N4`)**. | Añadir en `Mi panel` la tarjeta de recomendación según el nivel del equipo y el avance del alumno (`T-192`). |
| **4. Telemetría de prácticas con consentimiento (`g7b.evento/1`)** | G7B ya define el contrato de entrada anónimo y las compuertas que rechazan datos con identificadores personales. | `engine/amatista_engine/corazon/extensiones.py` ya tiene el gancho `observadores` y `addon/amatista_blender/red.py` ya tiene la cola offline `pendientes.json`. | Conectar la extensión observadora con aviso de consentimiento explícito (`T-187`, `T-189`) y exportar desde la API solo agregados de `>= 5` equipos (`T-190`). |
| **5. Conocimiento 3D para Goliat y catálogos CC0** | MongoDB Atlas ya tiene **987 documentos** del manual de Blender y la rama `geodar` ya consulta Poly Haven y ambientCG. | `frontend/src/goliat/cerebro.js` responde por reglas locales. | Mantener las reglas locales como base sin conexión y usar los catálogos/fragmentos curados como respaldo (`T-193`). |

---

## 3. Lo que SE VA A TRABAJAR hasta el viernes (`hack4edu` · 4 al 6 de noviembre)

Con ambos repositorios comparados, el trabajo de aquí al viernes se divide en **tres bloques diarios verificables**:

### Bloque 1 · Miércoles 4 de noviembre: Consolidación de `G7B` en `main` y Cierre de Producción de `Amatista`

| Repo | Qué se va a hacer | Cómo se comprueba (Criterio de cierre) |
|---|---|---|
| **`amatista-g7b-etl`** | 1. Integrar en orden las ramas abiertas (`#4` Warehouse DuckDB + `perfiles.json` → `#5` publicación segura → `#6`/`#7` pruebas en Azure → `#8` tablero HTML → `geodar`).<br>2. Rotar la SAS temporal o dejar únicamente identidad administrada en los Jobs de Azure. | `pytest -q` en `amatista-g7b-etl/main` pasa las **102+ pruebas** y genera un artefacto `perfiles.json` v0 (`g7b.perfil/1`) firmado con SHA-256. |
| **`amatista` (Producción)** | 1. Aplicar en Oracle Cloud los scripts pendientes (`007` a `013`) y usar `AMATISTA_APP` (`T-004`, `T-149`).<br>2. Actualizar el backend en la VM (`despliegue/actualizar.sh`), cerrar el puerto `8000` directo en OCI (`T-130`) y publicar la PWA con **Facetas v4.4** en Cloudflare Workers (`T-128`). | `python backend/diagnostico_oracle.py` en verde con 24 tablas; `https://amatista-3d.tech` y `https://api.amatista-3d.tech/api/salud` responden `200 OK`. |

### Bloque 2 · Jueves 5 de noviembre: Puente de Código `G7B ↔ Amatista` y Validación en Blender Real

| Repo | Qué se va a hacer | Cómo se comprueba (Criterio de cierre) |
|---|---|---|
| **`amatista` (`engine/` + `addon/` + `backend/`)** | 1. **Perfiles `N0`–`N4` (`T-188`):** incluir `perfiles.json` v0 de G7B en el add-on y el detector de nivel de equipo (`N0` a `N4`), reversible en un clic.<br>2. **Caché y Endpoint G7B (`T-196`, `T-198`):** crear `backend/sql/014_g7b.sql` (`G7B_CACHE`) y la ruta `GET /api/g7b/v1/recomendacion` que responde desde caché o desde el respaldo local sin depender de que G7B esté arriba. | Pruebas nuevas en `backend/tests/` y `engine/tests/` verificando `GET /api/g7b/v1/recomendacion` (sin guardar PII) y la selección de perfil `N0`–`N4`. |
| **`amatista` (Escritorio con ventana real)** | Probar en Blender con ventana real el protocolo `amatista://` (`T-133`), las 3 prácticas de «Conoce Amatista Motor» (`T-113`), el faro, las fichas, el Corazón cada 0,5 s (`T-143`, `T-172`, `T-178`, `T-182`) y el botón «Ajustar a mi equipo» con `perfiles.json`. | Bitácora en `docs/bitacora/` con capturas de la sesión real en Blender completando el Módulo 1 con un perfil aplicado. |

### Bloque 3 · Viernes 6 de noviembre: Recomendaciones en `Mi panel`, Consentimiento y Cierre Hack4Edu

| Repo | Qué se va a hacer | Cómo se comprueba (Criterio de cierre) |
|---|---|---|
| **`amatista` (`frontend/` + `engine/`)** | 1. **Consentimiento y Observador (`T-187`, `T-189`):** aviso de privacidad/consentimiento explícito y extensión observadora del Corazón (apagada por defecto si no hay consentimiento).<br>2. **Recomendaciones en `Mi panel` (`T-192`):** mostrar en `Mi panel` el nivel detectado/elegido (`N0`–`N4`), la versión de Blender recomendada y los ajustes óptimos para estudiar sin trabas en equipos modestos. | Pruebas unitarias en `vitest` y `pytest` en verde; ningún evento de diagnóstico sale si el consentimiento está apagado. |
| **Ambos repos (`amatista` + `amatista-g7b-etl`)** | Ensayo completo del recorrido de demostración **Hack4Edu** (Portada viva → Elección de ruta → Recomendación por equipo `N0`–`N4` de G7B → Lección interactiva → Práctica en Blender / Estudio A-Frame → Progreso offline/sincronizado) y tag de cierre del viernes. | Las suites de pruebas de ambos repositorios en verde y guion de demostración reproducible en 5 minutos. |

---

## 4. Cómo consultar este corte en Git en cualquier momento

```bash
# Ver el estado exacto del código en el corte inicial de hack4edu:
git show hack4edu --stat

# Ver todos los commits trabajados a partir del corte hack4edu hasta el viernes:
git log hack4edu..HEAD --oneline

# Comparar exactamente qué archivos cambiaron desde el corte hack4edu:
git diff hack4edu..HEAD --stat
```
