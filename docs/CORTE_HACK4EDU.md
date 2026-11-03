# Corte `hack4edu`: lo que ya tenemos y plan verificable hasta el viernes

- **Fecha del corte:** Martes 3 de noviembre de 2026
- **Tag oficial en Git:** `hack4edu`
- **Rama activa:** `claude/entender-y-verificar`
- **Horizonte del bloque `hack4edu`:** Martes 3 al Viernes 6 de noviembre de 2026

Este documento establece una **división clara y comprobable** en el repositorio entre:
1. **Lo que ya está construido, integrado y verificado con pruebas automáticas** hasta el tag `hack4edu`.
2. **Lo que se va a trabajar de aquí al viernes 6 de noviembre** bajo el frente `hack4edu`, con entregables acotados y criterios de verificación exactos.

---

## 1. Lo que YA TENEMOS al corte `hack4edu` (Comprobable hoy)

Todo lo listado en esta sección ya vive en el repositorio y puede comprobarse ejecutando los comandos de la tabla siguiente:

### 1.1 Comandos de verificación inmediata

| Pieza | Comando de comprobación | Estado verificado en el tag `hack4edu` |
|---|---|---|
| **Frontend (PWA + Facetas v4.4 + Portada viva)** | `cd frontend && npm run lint && npm test && npm run build` | **0 errores** de lint · **46 suites / 390 pruebas pasan** · Build PWA (87 recursos precacheados) y auditoría `revisar-publicacion.mjs` en verde |
| **Backend (FastAPI + Seguridad + Sincronización)** | `cd backend && python -m pytest -q` | **446 pruebas pasan** (`requirements.lock` congelado y reproducible) |
| **Motor 3D, Corazón 1.0 y Tablero** | `python -m pytest -q tablero engine/tests` | **594 pruebas pasan** en Python puro (sin requerir Blender abierto) |
| **Prácticas de Blender (58 ejercicios)** | `python -X utf8 herramientas/practicas.py probar` | **58 de 58 prácticas** pasan con su ejemplo resuelto (`99/100` alumnos simulados aprueban) |
| **Catálogo educativo (15 módulos)** | `python herramientas/contenido.py validar` | **15 de 15 módulos publicados** cumplen la Fórmula Amatista (5 lecciones + bloque interactivo + jefe) |

### 1.2 Qué incluye exactamente este corte

1. **Plataforma Web (PWA) y Sistema Visual «Facetas v4.4» (`frontend/`):**
   - **Portada guiada con vida propia (`Inicio.jsx` + `index.css`):**
     - **Cristal interactivo (`EmblemaHeroe`):** satélites de Blender y A-Frame en levitación desfasada; al tocar el cristal realiza un giro 3D con resorte, lanza chispas pixel-art multicolores y revela secretos de la plataforma.
     - **Mundos y mascotas por paso (`Escenario`, `Personaje`, `Jefe`):** cada paso del camino tiene su paisaje SVG animado, su mascota guía que **sigue el cursor con los ojos**, parpadea sola y al tocarla hace piruetas (`salto`, `giro`, `baile`, `voltereta`), suelta chispas y abre un globo con consejos de su mundo; la lección de examen muestra al jefe animado del módulo.
     - **Animaciones 100 % en GPU y modo accesible:** todas las animaciones continuas usan únicamente `transform` y `opacity`, auditadas por prueba automática en `frontend/src/components/estructura/facetas.test.js`, y se apagan solas en equipos modestos (`html.ligero`) o cuando el sistema pide `prefers-reduced-motion: reduce`.
   - **15 módulos publicados:** 9 de Blender (*Principiante*, *Principiante-Intermedio* e *Intermedio*) y 6 de A-Frame (*Inicial* e *Interactivo*).
   - **Estudio A-Frame (`#/estudio`) y Motor Web (`frontend/src/motor3d/`):** editor en vivo con plantillas, modelos GLB low-poly offline y escenas interactivas integradas en las lecciones.
   - **Compañero Goliat (`frontend/src/goliat/`), Avatares (`frontend/src/avatares/`) y Buzón (`frontend/src/buzon/`):** asistente por reglas sin depender de APIs externas de pago.
   - **Modo sin conexión y Ahorro de datos:** progreso guardado primero en el dispositivo y sincronización comprimida con gzip (`POST /api/sincronizar`).

2. **Motor de Evaluación y Corazón Amatista 1.0 (`engine/`, `addon/`, `practices/`):**
   - **Contrato estable `amatista.corazon/1` (`engine/amatista_engine/corazon/`):** director pedagógico, andamio por herramienta que se retira conforme el alumno domina cada acción y señales verificadas cada 0,5 s.
   - **Motor 7 «Guion»:** evaluación por resultado en la escena (43 validadores, 33 habilidades, 26 fichas de herramientas en `practices/blender/fichas.json`), reconocimiento geométrico (`figure.recognize`, `figure.silhouette`, `example.matches`).
   - **Add-on 7.1 para Blender (`addon/amatista_blender/`):** conexión en vivo con la lección, modo enfocado y plantillas de instalación.

3. **API y Base de Datos (`backend/`):**
   - API en FastAPI con autenticación, fusión de progreso anónimo a cuenta, panel de administración, auditoría de contenido, buzón, sincronización comprimida y soporte opcional para Sentry sin datos personales.
   - Esquema SQL de **24 tablas** (`backend/sql/001` a `013`) listo en código.

4. **Portabilidad Windows / macOS / Linux:**
   - Resueltas las colisiones de nombres en sistemas de archivos insensibles a mayúsculas (`atajosLogica.js`, `personajeLogica.js`).
   - Configurado `.gitattributes` para preservar finales de línea `LF` en scripts y `tzdata` en el backend para zonas horarias en Windows.

---

## 2. Lo que SE VA A TRABAJAR hasta el viernes (`hack4edu` · 4 al 6 de noviembre)

Todo el trabajo posterior al tag `hack4edu` se divide en **tres bloques diarios**, sin abrir frentes nuevos fuera de esta lista.

### Bloque 1 · Miércoles 4 de noviembre: Cierre de Producción y Base de Datos (`api.amatista-3d.tech` y `amatista-3d.tech`)

| ID / Frente | Qué se va a hacer | Cómo se comprueba (Criterio de cierre) |
|---|---|---|
| **BD Oracle (`T-004`, `T-149`)** | Respaldar con `migrar.py exportar`, aplicar en producción los scripts SQL pendientes (`007` a `013`) y cambiar la conexión del servicio al usuario de menor privilegio `AMATISTA_APP`. | `python backend/diagnostico_oracle.py` reporta las 24 tablas activas conectando como `AMATISTA_APP`. |
| **API y Seguridad (`T-130`, `T-161`, `T-179`)** | Actualizar el backend en la VM con `despliegue/actualizar.sh` (activando `/api/sincronizar`, Motor 7.1 y buzón) y cerrar el puerto `8000` directo en la Security List de OCI. | `https://api.amatista-3d.tech/api/salud` responde `200 OK` por HTTPS y el puerto `:8000` externo queda inaccesible. |
| **PWA en vivo (`T-128`)** | Publicar en Cloudflare Workers el build de la PWA con **Facetas v4.4** y las interacciones nuevas de la portada. | `https://amatista-3d.tech` sirve el camino guiado con las mascotas interactivas, el cristal con chispas y el modo ahorro de datos. |

### Bloque 2 · Jueves 5 de noviembre: Validación en Blender Real con Ventana y Recorrido de Usuario

| ID / Frente | Qué se va a hacer | Cómo se comprueba (Criterio de cierre) |
|---|---|---|
| **Recorrido inicial (`T-113`, `T-133`)** | Probar en una sesión real de escritorio con ventana el protocolo `amatista://` («Abrir en Blender» desde la lección) y las 3 prácticas de «Conoce Amatista Motor». | Las 3 prácticas de bienvenida se abren desde el navegador en Blender y marcan avance en vivo sin errores en consola. |
| **Motor 7 y Corazón en ventana (`T-143`, `T-172`, `T-178`, `T-182`)** | Verificar visualmente las fichas en la vista 3D, el faro sobre la pieza activa, la banda superior sin solapamientos y las señales cada 0,5 s del Corazón (`Señálalo otra vez`). | Bitácora fechada en `docs/bitacora/` con capturas reales de la ventana de Blender completando el Módulo 1 de principio a fin. |
| **Ajustes finos de experiencia** | Corregir cualquier roce de textos, tiempos de espera o enfoque de ventana detectado durante la prueba real con Blender abierto. | `pytest` del motor/add-on y `npm test` siguen al 100 % tras los ajustes. |

### Bloque 3 · Viernes 6 de noviembre: Entregable Hack4Edu (Adaptación por Equipo `N0`–`N4` y Demo de Punta a Punta)

| ID / Frente | Qué se va a hacer | Cómo se comprueba (Criterio de cierre) |
|---|---|---|
| **Consentimiento y Privacidad (`T-187`)** | Incorporar el aviso claro y opcional de consentimiento antes de cualquier medición de equipo o eventos de práctica para el experimento educativo. | Prueba unitaria y vista verificable donde ningún dato de diagnóstico se envía si el alumno no acepta explícitamente. |
| **Perfiles de Equipo `N0` a `N4` (`T-188`, `T-192`)** | Conectar la detección de nivel del equipo (`N0` a `N4`) con `perfiles.json` y mostrar en **Mi panel** la recomendación de perfil y prácticas según el dispositivo del alumno. | En dispositivos modestos o simulando `N1`/`N2`, **Mi panel** muestra la recomendación adaptada y sus pruebas pasan en `vitest` y `pytest`. |
| **Guion y Cierre Hack4Edu** | Ensayar el recorrido completo de demostración para **Hack4Edu** (Portada viva → Elección de ruta → Lección interactiva → Práctica en Blender / Estudio A-Frame → Progreso offline/sincronizado → Recomendación por equipo) y etiquetar el cierre de la semana. | Las 4 suites de pruebas en verde y tag de cierre publicado en el repositorio. |

---

## 3. Cómo consultar este corte en Git en cualquier momento

```bash
# Ver el estado exacto del código en el corte inicial de hack4edu:
git show hack4edu --stat

# Ver todos los commits trabajados a partir del corte hack4edu hasta el viernes:
git log hack4edu..HEAD --oneline

# Comparar exactamente qué archivos cambiaron desde el corte hack4edu:
git diff hack4edu..HEAD --stat
```
