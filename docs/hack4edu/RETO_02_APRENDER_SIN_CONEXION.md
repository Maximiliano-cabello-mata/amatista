> **Nota del cierre:** este dossier es un antecedente técnico. Las afirmaciones de disponibilidad total, latencia de 0 ms, porcentajes de ahorro y funcionamiento universal no se certifican en este cierre. Para el alcance comprobado y las limitaciones, consultar el [acta](cierre/ACTA.md).

# Reto 02 · Aprender sin conexión

> **Hack4Edu 2026** · Desafío Tecnológico y Pedagógico de Inclusión Digital  
> *«¿Cómo ofrecer una experiencia de aprendizaje digital de calidad cuando Internet es lento, caro o simplemente no existe?»*  
> **Plataforma:** [Amatista 3D](https://amatista-3d.tech) · **Estado:** En producción y verificado en pruebas unitarias e integración.

---

## 1. Declaración del Desafío y Enfoque de Amatista

El aprendizaje de disciplinas técnicas modernas —como el modelado 3D, la computación espacial, el diseño interactivo y la WebXR— suele asumir una infraestructura ideal: ordenadores de gama alta con GPU dedicada y conexiones de banda ancha de fibra óptica ilimitadas. En las aulas y hogares de comunidades vulnerables de Iberoamérica, esta suposición excluye sistemáticamente a millones de estudiantes:

1. **Aulas rurales y periféricas sin acceso a Internet (0 KB/s):** La conectividad en el aula es inexistente o se interrumpe durante días.
2. **Conexiones móviles costosas o inestables (2G / 3G / prepago limitado):** Los estudiantes y familias dependen de paquetes de datos de coste elevado donde cada megabyte cuenta.
3. **Dispositivos escolares heterogéneos y modestos:** Desde netbooks educativas con procesadores Intel Celeron o Atom de 2 GB de RAM, hasta teléfonos inteligentes de gama de entrada o tabletas compartidas.
4. **Falta de asistencia docente continua:** Dificultad para recibir tutoría personalizada y retroalimentación técnica inmediata sin depender de servicios en la nube pública.

**Amatista** resuelve este desafío mediante un diseño **Offline-First Radical**: la plataforma no es un sitio web que «intenta tolerar la desconexión», sino un entorno de aprendizaje 3D y WebXR diseñado para **funcionar de forma completa, autónoma y resiliente sin conexión**, ofreciendo además inteligencia artificial generativa y diagnóstica ejecutada en el propio servidor local del centro educativo.

---

## 2. Las 5 Capas de la Arquitectura Offline-First

Amatista estructura su resiliencia en cinco capas independientes pero coordinadas:

```
┌────────────────────────────────────────────────────────────────────────┐
│  CAPA 5 · DOMINIO PEDAGÓGICO OFFLINE (BKT + Notificaciones Duolingo)    │
├────────────────────────────────────────────────────────────────────────┤
│  CAPA 4 · IA LOCAL EN SERVIDOR DE AULA (RAG 8090 + Ollama Confinado)   │
├────────────────────────────────────────────────────────────────────────┤
│  CAPA 3 · PERFILADO Y ADAPTACIÓN DE EQUIPOS (N0–N4 · Geoda Kernel)    │
├────────────────────────────────────────────────────────────────────────┤
│  CAPA 2 · COLA TRANSACCIONAL OUTBOX (IndexedDB + Fusión de Lotes Gzip) │
├────────────────────────────────────────────────────────────────────────┤
│  CAPA 1 · SERVICE WORKER & GRAFO MINIMALISTA (252 KB precacheados)    │
└────────────────────────────────────────────────────────────────────────┘
```

### Capa 1: Service Worker y Grafo Estático Universal (≤ 280 KB)
- **Carga inicial garantizada:** Gracias a una auditoría estricta de dependencias y empaquetado con Vite, el grafo JavaScript inicial de Amatista ocupa únicamente **252,6 KB** (repartidos en 54 módulos estables), cumpliendo holgadamente el presupuesto estricto de ≤ 280 KB exigido por el estándar de optimización web del proyecto.
- **Índice de módulos comprimido:** El catálogo completo de los 15 cursos y módulos educativos (9 de Blender y 6 de A-Frame WebXR) se descarga en un único índice optimizado de **5,5 KB gzip**.
- **Caché bajo demanda de recursos 3D:** El `Service Worker` intercepta todas las peticiones a texturas PBR, modelos GLB low-poly de la Biblioteca CC0 (`#/biblioteca`) y componentes visuales, persistiendo cada recurso en `CacheStorage` e `IndexedDB`. Una vez visitado un recurso, queda disponible para siempre sin consumir un solo byte adicional.

### Capa 2: Cola Transaccional Outbox Pattern (`colaSincronizacion.js`)
- **Persistencia atómica en IndexedDB:** Todo avance, resolución de ejercicios, insignias y puntos de experiencia (XP) se registran de forma síncrona en el almacenamiento local del navegador del alumno (`IndexedDB`).
- **Compactación y deduplicación de escrituras:** Si el estudiante practica repetidamente una lección (por ejemplo, avanza del paso 1 al paso 5 en «Extruir caras»), la cola *Outbox* no encola 5 peticiones HTTP separadas. Fusiona todas las mutaciones sobre la misma entidad en un único registro consolidado en el cliente.
- **Sincronización por lotes comprimidos en ráfaga:** Al detectar que el dispositivo recupera acceso a Internet (mediante `navigator.onLine` y el detector `lib/red.js`), el cliente envía un único lote consolidado con cabecera `Content-Encoding: gzip` hacia el endpoint `POST /api/sincronizar`. Esto reduce entre un **80 % y un 90 %** el tráfico de red respecto a una arquitectura REST tradicional.

### Capa 3: Perfilado de Hardware y Adaptación Dinámica N0–N4 (`Geoda`)
- **Inspección no invasiva del hardware:** El módulo `frontend/src/nucleo/dispositivo.js` y el kernel `Geoda` (`#/geoda`) evalúan en el cliente las capacidades del equipo: núcleos de CPU (`navigator.hardwareConcurrency`), memoria estimada (`navigator.deviceMemory`), tarjeta gráfica mediante WebGL (`WEBGL_debug_renderer_info`), tipo de conexión de red y estado de la batería.
- **Matriz de adaptación N0–N4:**
  - **N0 (Móvil / Tableta / Chromebook):** Activa el modo ligero, restringe texturas a 512 px, fija el DPR del lienzo a 1,0× y redirige las prácticas al Estudio Web 3D (`#/estudio`) en lugar de requerir Blender de escritorio.
  - **N1 (Ordenador escolar modesto / Celeron / < 8 GB RAM):** Deshabilita efectos costosos, activa `html.ligero` (desactiva sombras y filtros CSS pesados), fija 30 FPS objetivo y genera un script Python para Blender con simplificación de subdivisiones.
  - **N2 (Gráfica integrada moderna / 8–16 GB RAM):** Calidad equilibrada a 60 FPS, DPR de 1,5× y texturas de 1024 px.
  - **N3–N4 (GPU dedicada 4 GB a 12+ GB VRAM):** Calidad completa con texturas PBR de 1K a 2K, iluminación dinámica y hasta 120 FPS.
- **Protección de batería:** Si el dispositivo móvil o portátil tiene menos del 20 % de batería o está en ahorro energético, el motor reduce automáticamente la tasa de refresco a 30 FPS y suspende la previsualización WebGL cuando la pestaña pasa a segundo plano.

### Capa 4: Microservicio de IA Local en Servidor de Aula (`ai_tutor`)
- **Tutoría inteligente sin depender de OpenAI ni Google Cloud:** Para centros educativos sin salida a Internet pero con una red local de aula (LAN cableada o router Wi-Fi sin WAN), Amatista incluye el contenedor `ia-tutor:8090` y `ollama:11434`.
- **RAG Local de alta velocidad:** El microservicio indexa en memoria las 26 fichas oficiales de herramientas de Blender (`practices/blender/fichas.json`). Ante dudas del estudiante o análisis de geometrías erróneas (vértices encimados, escala no aplicada), responde en **< 5 ms** mediante recuperación semántica local.
- **LLM Local Confinado:** El modelo local `qwen2.5-coder:3b` se ejecuta sobre Ollama dentro de la red Docker interna `red_interna_ia` (`internal: true`). El contenedor carece de acceso a la interfaz WAN, garantizando que ninguna consulta ni dato del estudiante salga del aula.
- **Circuit Breaker con degradación a 0 ms:** Si el servidor local del aula se apaga o no está presente, el cliente detecta el fallo en menos de 1500 ms y conmuta automáticamente a **Goliat** (`frontend/src/goliat/cerebro.js`), el asistente determinista en JavaScript puro que corre en el navegador del alumno con latencia cero.

### Capa 5: Modelo Cognitivo y Pedagogía Offline
- **Bayesian Knowledge Tracing (BKT) en local:** La estimación de maestría de las 33 habilidades del catálogo (`practices/blender/habilidades.json`) se calcula tanto en el cliente como en el backend. El progreso del estudiante se modela con parámetros de aprendizaje \(P(L_0)\), tránsito \(P(T)\), desliz \(P(S)\) y adivinanza \(P(G)\) sin requerir evaluación remota.
- **Asistente Goliat:** Acompañante low-poly en el navegador que detecta patrones de frustración (múltiples intentos fallidos en la misma actividad) y propone pausas activas, atajos nemotécnicos o caminos alternativos de autoría.
- **Notificaciones inteligentes de hábitos (estilo Duolingo):** Motor client-side (`motorNotificaciones.js`) que alerta sobre el estado de la racha diaria, insignias a un paso o desafíos de taller, manteniendo la motivación sin depender de notificaciones push de terceros.
- **Buzón asíncrono (`#/buzon`):** Canal de comunicación diferida donde los alumnos guardan consultas para el docente durante el periodo sin red, sincronizándose automáticamente cuando haya conexión.

---

## 3. Demostración en los 4 Escenarios Escolares Reales

### Escenario 1: Centro Educativo sin Internet (0 KB/s · 100 % Offline-First)
- **Problema:** Una escuela rural no dispone de acometida de fibra óptica ni cobertura móvil.
- **Solución Amatista:**
  - El alumno o docente instala la PWA de Amatista una sola vez (o la abre desde un lápiz de memoria USB / servidor local con la aplicación de escritorio portátil de 301 MB).
  - La aplicación funciona de principio a fin de forma autónoma.
  - El estudiante cursa los 9 módulos de Blender y 6 de A-Frame WebXR.
  - Los modelos 3D se visualizan en el visor WebXR y el asistente Goliat resuelve dudas de atajos y errores comunes en 0 ms.
  - Toda la actividad queda registrada en IndexedDB con integridad transaccional.

### Escenario 2: Conexión Móvil Lenta o Cara (2G / 3G / Prepago)
- **Problema:** El estudiante se conecta en casa compartiendo datos móviles de un teléfono prepago, donde las descargas continuas agotan el saldo familiar.
- **Solución Amatista:**
  - El módulo `lib/red.js` detecta la conexión lenta (`slow-2g`, `2g`, `3g`) o la cabecera `Save-Data` del navegador.
  - La cola *Outbox* suspende las llamadas individuales a la API.
  - Al completar la sesión de estudio, se genera un único payload comprimido en gzip que envía todas las lecciones y ejercicios en una única transacción de apenas unos pocos kilobytes.
  - Se ahorra más del 85 % de datos respecto a un LMS convencional.

### Escenario 3: Inteligencia Artificial en el Servidor Local del Aula
- **Problema:** El centro educativo dispone de un ordenador servidor en la sala de informática, pero no cuenta con presupuesto para pagar suscripciones de API de IA comercial ni ancho de banda suficiente para que 30 alumnos consulten simultáneamente a la nube.
- **Solución Amatista:**
  - El profesor ejecuta `make up` en el servidor del aula.
  - Se levantan los contenedores Docker orquestados: `pwa:8080`, `api:8000`, `ia-tutor:8090` y `ollama:11434`.
  - Los ordenadores y móviles de los alumnos se conectan por la red Wi-Fi local del aula al servidor.
  - El microservicio `ia-tutor` atiende las dudas de modelado 3D de los 30 alumnos en paralelo con RAG local y el modelo LLM `qwen2.5-coder:3b`, sin enviar un solo paquete a Internet.
  - Los datos permanecen estrictamente confinados en el servidor del colegio.

### Escenario 4: Seguimiento Docente, Adaptación de Ordenadores N0–N4 y Acompañamiento
- **Problema:** La sala de informática cuenta con equipos donados de distintas épocas: algunos con Windows 7/10 y 2 GB de RAM, otros con Linux y gráficas integradas antiguas que fallan al abrir Blender 4.0+.
- **Solución Amatista:**
  - El estudiante abre `#/geoda`: la herramienta detecta la configuración en segundos y le indica exactamente qué versión de Blender es compatible con su equipo (por ejemplo, Blender 3.6 LTS o 4.2).
  - Con un clic, descarga un script de configuración reversible que activa la simplificación de mallas y ajusta la memoria en Blender.
  - La interfaz de Amatista activa su perfil ligero (`html.ligero`), garantizando 60 FPS estables.
  - El profesor consulta en el panel de administración el avance por habilidades BKT de cada alumno y responde los mensajes acumulados en el Buzón.

---

## 4. Estándares Éticos, Privacidad y Soberanía Tecnológica

1. **Privacidad de menores garantizada:** Amatista no almacena datos biométricos, identificadores publicitarios ni direcciones IP en sus eventos pedagógicos. La analítica de errores y rendimiento con Sentry está anonimizada por diseño (`backend/observabilidad.py`).
2. **Soberanía de datos del alumno:** El estudiante es el dueño absoluto de su información. El avance se almacena en el cliente y puede exportarse o sincronizarse a demanda.
3. **Contenedores reforzados (Hardening):** El microservicio `ia-tutor` y la API corren sobre usuarios sin privilegios de root (`amatista:amatista`, UID `10001`), con directiva `no-new-privileges: true` y sistema de ficheros de solo lectura (`read_only: true`).
4. **Licenciamiento y cultura libre:** El add-on de Blender se distribuye bajo GPL-3.0 y todos los modelos y texturas de la biblioteca cuentan con licencia Creative Commons Zero (CC0), permitiendo su uso y redistribución sin restricciones legales ni económicas.

---

## 5. Resumen de Pruebas y Evidencia Comprobable

El correcto funcionamiento de toda la arquitectura offline-first y los motores locales está verificado mediante una batería automatizada de pruebas:

| Componente | Pruebas | Comando de comprobación |
|---|---|---|
| **Núcleo PWA & Outbox** | 54 suites / 418 pruebas Vitest | `cd frontend && npm test` |
| **Lint & Calidad de Código** | 0 errores / 0 advertencias ESLint | `cd frontend && npm run lint` |
| **Auditoría de Presupuesto Web** | 252.6 KB ≤ 280 KB / Rugosidad 90/90 | `python herramientas/auditoria/estandares_web.py` |
| **Motor de IA Local & RAG** | 15 pruebas unitarias e integración | `pytest ai_tutor/` |
| **Seguridad de la API & Permisos** | 473 pruebas Pytest en verde | `pytest backend/tests/` |
| **Prácticas de Blender & Motor** | 58/58 casos resueltos en Python puro | `python engine/herramientas/practicas.py probar` |

Amatista demuestra que una educación tecnológica de vanguardia en 3D e inteligencia artificial no exige infraestructuras privativas ni conexión continua: con ingeniería rigurosa, estándares abiertos y vocación de inclusión, **es posible aprender al máximo nivel sin conexión**.
