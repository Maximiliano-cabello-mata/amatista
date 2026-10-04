# Tablero de Amatista

> Se genera solo con cada push: **no se edita a mano**. Las tareas se crean en
> [`tablero/tareas.yml`](tablero/tareas.yml) y se mueven con los commits
> ([cómo](tablero/README.md)).

Último commit: 2026-10-04 21:53 · `main` en `139ad0e`

**Etapa: Reestructuración** (desde el 2026-10-03) · [plan](docs/reestructuracion/00_plan_maestro.md) · [tablero anterior](tablero/historico/2026-10-03_v2_KANBAN.md)

## 🗺️ Roadmap

| Versión | Meta | Objetivo | Avance |
|---|---|---|---|
| **v2.2.0** | Piloto | Cerrar la v2.2 y abrir el piloto del 8 de octubre sin ampliar el alcance (servicio, HTTPS, SMTP, pruebas y seguridad). | ▰▰▰▰▱▱▱▱▱▱ 10/24 |
| **v3.0.0** | Reestructuración | Niveles, habilidades, versiones de Blender y herramientas de autor en Oracle; documentación y tablero nuevos. | ▰▰▰▰▱▱▱▱▱▱ 5/12 |
| **v3.1.0** | Mi primer espacio 3D | Primera entrega de contenido por niveles (lecciones 01–11 de la propuesta) con fichas, rúbrica y versión verificada. | ▱▱▱▱▱▱▱▱▱▱ 0/5 |
| **v3.2.0** | Laboratorio 3D | Visor GLB en las lecciones, escena de ejemplo y lección 12 (exportar y comprobar). | ▱▱▱▱▱▱▱▱▱▱ 0/3 |
| **v3.3.0** | Add-on de Blender | Add-on conectado a la plataforma (vincular cuenta, panel de lección, comprobaciones y verificaciones). | ▰▰▰▰▰▱▱▱▱▱ 5/10 |
| **v3.4.0** | Especialidades y tutor | Primera rama del nivel 5 y tutor IA dentro de las lecciones. | ▱▱▱▱▱▱▱▱▱▱ 0/3 |

Versiones publicadas (tags): `v2.2.0-alpha.1` · `v2.0.1` · `v2.0.0` · `v1.0.0` · `v0.1.0`

## 📌 Kanban

| 📋 Pendiente (27) | 🔨 En progreso (8) | 👀 Revisión (2) | ✅ Hecho (20) |
|---|---|---|---|
| **T-005** HTTPS en el backend para publicar en Cloudflare Pages<br><sub>v2.2.0 · api</sub> | **T-003** Desplegar el backend nuevo como servicio systemd<br><sub>v2.2.0 · api</sub> | **T-004** Usuario de aplicación en Oracle (dejar de usar ADMIN)<br><sub>v2.2.0 · db</sub> | **T-002** Ejecutar el esquema SQL nuevo en Oracle y pasar el diagnóstico<br><sub>v2.2.0 · db</sub> |
| **T-008** Proteger main (solo cambios por PR)<br><sub>v2.2.0 · repo</sub> | **T-028** Informe semanal de alumnos activos (meta 20 activos al 22 de octubre)<br><sub>v2.2.0 · lanzamiento</sub> | **T-031** Documentación de la v2.2 (base de datos, autenticación, panel y despliegue)<br><sub>v2.2.0 · repo</sub> | **T-006** Autenticación de alumnos (cuentas, confirmación, recuperación y fusión offline → cuenta)<br><sub>v2.2.0 · api</sub> |
| **T-023** Respaldo de Oracle y restauración ensayada en pruebas<br><sub>v2.2.0 · db</sub> | **T-029** Prueba de punta a punta en navegador (anónimo → cuenta → offline → admin publica → acople)<br><sub>v2.2.0 · lanzamiento</sub> |   | **T-014** Esquema incremental 002–004 (8 tablas, 20 GB) y diagnóstico ampliado<br><sub>v2.2.0 · db</sub> |
| **T-024** Publicar el frontend en Cloudflare Pages contra la API HTTPS<br><sub>v2.2.0 · pwa</sub> | **T-052** Comprobaciones locales de la lección 03 en el add-on<br><sub>v3.3.0 · blender</sub> |   | **T-015** Catálogo dinámico y progreso adaptable (acople, replaces, % recalculado)<br><sub>v2.2.0 · pwa</sub> |
| **T-025** Pruebas P01–P10 del plan de lanzamiento con evidencia<br><sub>v2.2.0 · lanzamiento</sub> | **T-055** Aplicar 007 en Oracle y publicar la práctica de la mesa y el módulo 2 (después del piloto)<br><sub>v3.3.0 · db</sub> |   | **T-016** Panel del alumno (nivel, racha, retos, actividad e insignias)<br><sub>v2.2.0 · pwa</sub> |
| **T-026** Piloto por invitación con 10 alumnos (8 de octubre, 18:00)<br><sub>v2.2.0 · lanzamiento</sub> | **T-056** Probar el paquete de instalación en Windows y macOS reales<br><sub>v3.3.0 · blender</sub> |   | **T-017** Eventos de aprendizaje y métricas de alumnos activos (API)<br><sub>v2.2.0 · api</sub> |
| **T-027** Beta pública con cohorte inicial de 30 cuentas (15 de octubre, 18:00)<br><sub>v2.2.0 · lanzamiento</sub> | **T-060** Guardar en Oracle las ayudas usadas en cada práctica (008 aditivo) y mostrarlas al profesor<br><sub>v3.4.0 · db</sub> |   | **T-019** Contenido administrable (API borrador → publicado, validación y CLI)<br><sub>v2.2.0 · contenido</sub> |
| **T-030** Revisión de seguridad e integridad (permisos, tokens, XSS en contenido, fusión y sincronización)<br><sub>v2.2.0 · api</sub> | **T-054** Primera rama del nivel 5 (por decidir; propuesta web y videojuegos)<br><sub>v3.4.0 · contenido</sub> |   | **T-021** Bloques interactivos en las lecciones (7 tipos nuevos)<br><sub>v2.2.0 · pwa</sub> |
| **T-032** Configurar SMTP y primer admin en el servidor (confirmación y recuperación por correo)<br><sub>v2.2.0 · api</sub> |   |   | **T-022** Aplicar la Fórmula Amatista al módulo 1 (bloques interactivos en los JSON)<br><sub>v2.2.0 · contenido</sub> |
| **T-038** Elegir y verificar la versión principal de Blender (LTS)<br><sub>v3.0.0 · contenido</sub> |   |   | **T-033** Importar el catálogo a Oracle (herramientas/contenido.py importar)<br><sub>v2.2.0 · contenido</sub> |
| **T-039** Inventario de lecciones existentes → niveles y fichas<br><sub>v3.0.0 · contenido</sub> |   |   | **T-034** Estructura de niveles, habilidades y versiones de Blender en código y esquema (005)<br><sub>v3.0.0 · db</sub> |
| **T-040** Lección modelo completa (10 pasos, recursos, rúbrica y verificación)<br><sub>v3.0.0 · contenido</sub> |   |   | **T-035** Ejecutar 005 y 006 en producción y sembrar los niveles<br><sub>v3.0.0 · db</sub> |
| **T-041** Mapa de niveles en la PWA y «Verificada en…» en cada lección<br><sub>v3.0.0 · pwa</sub> |   |   | **T-036** Herramientas de autor en Oracle (006, vistas y paquete AMATISTA_AUTOR)<br><sub>v3.0.0 · db</sub> |
| **T-042** Habilidades y rúbrica en la API y en el panel del alumno<br><sub>v3.0.0 · api</sub> |   |   | **T-037** Documentación de la reestructuración, bitácora y tablero nuevo<br><sub>v3.0.0 · repo</sub> |
| **T-043** Diagnóstico opcional de entrada que recomienda un nivel<br><sub>v3.0.0 · pwa</sub> |   |   | **T-061** Documentación completa por secciones (historia, manual del código, esquema SQL, manual del desarrollador y README)<br><sub>v3.0.0 · repo</sub> |
| **T-044** Editor del panel con ficha de lección y nivel del módulo<br><sub>v3.0.0 · pwa</sub> |   |   | **T-050** Contrato de API del add-on y vinculación de cuenta por código<br><sub>v3.3.0 · api</sub> |
| **T-009** Mi primer espacio 3D: lecciones 01–03 (entorno, navegar, seleccionar y transformar)<br><sub>v3.1.0 · contenido</sub> |   |   | **T-051** Esqueleto del add-on (manifiesto 4.2+, preferencias, panel de la lección)<br><sub>v3.3.0 · blender</sub> |
| **T-045** Mi primer espacio 3D: lecciones 04–05 (base de la habitación, guardar y recuperar)<br><sub>v3.1.0 · contenido</sub> |   |   | **T-053** Registrar verificaciones de versión desde Blender<br><sub>v3.3.0 · blender</sub> |
| **T-046** Mi primer espacio 3D: lecciones 06–07 (mesa y primera edición de malla)<br><sub>v3.1.0 · contenido</sub> |   |   | **T-057** Motor etapa 2: guía paso a paso, «Hazlo conmigo» y acompañante en el add-on<br><sub>v3.3.0 · blender</sub> |
| **T-047** Mi primer espacio 3D: lecciones 08–09 (lámpara, colores, cámara e iluminación)<br><sub>v3.1.0 · contenido</sub> |   |   | **T-058** Práctica de Blender al cierre de cada módulo, etiquetas y herramientas nuevas en la plataforma<br><sub>v3.3.0 · pwa</sub> |
| **T-048** Mi primer espacio 3D: lecciones 10–11 (error preparado, variante y rúbrica)<br><sub>v3.1.0 · contenido</sub> |   |   |   |
| **T-010** Módulo 2 de A-Frame (cargar modelos GLB)<br><sub>v3.2.0 · pwa</sub> |   |   |   |
| **T-011** Visor de modelos GLB en las lecciones<br><sub>v3.2.0 · pwa</sub> |   |   |   |
| **T-049** Laboratorio mínimo (escena de ejemplo, reinicio, avisos de recurso faltante) y lección 12<br><sub>v3.2.0 · pwa</sub> |   |   |   |
| **T-013** Add-on de Blender conectado con la plataforma (MVP publicado)<br><sub>v3.3.0 · blender</sub> |   |   |   |
| **T-059** Probar la guía de la etapa 2 en un Blender real con GPU y agregar capturas a la documentación<br><sub>v3.3.0 · blender</sub> |   |   |   |
| **T-012** Tutor IA con Ollama dentro de las lecciones<br><sub>v3.4.0 · ia</sub> |   |   |   |

## 📚 Contenido

> Sale de `frontend/src/data/modulos/*.json` (campo `estado` de cada módulo). Flujo:
> 📝 borrador → 👀 revision → ✅ publicado. Solo lo publicado llega a los alumnos
> ([la Fórmula](docs/arquitectura/2026-10-02_formula_modulos.txt)).

📝 borrador (1) → 👀 revision (1) → ✅ publicado (2)

| Curso | Módulo | Título | Estado | Lecciones | Bloques interactivos | Fórmula |
|---|---|---|---|---|---|---|
| aframe | 1 | La Web en 3D (Tus primeros pasos en A-Frame) | ✅ publicado | 3 | 5 | — |
| blender | 1 | El mundo 3D y la magia de Blender (Teoría esencial) | ✅ publicado | 4 | 6 | — |
| blender | 2 | Interfaz y navegación | 👀 revision | 3 | 6 | 3/5 |
| blender | 3 | Modelado con precisión | 📝 borrador | 5 | 5 | 5/5 |

## 🧾 Detalle por versión

### v2.2.0 · Piloto

- [x] **T-002** Ejecutar el esquema SQL nuevo en Oracle y pasar el diagnóstico · _hecho_ — commits: `3374d51` (2026-10-02), `a45d80c` (2026-10-02), `53dec44` (2026-10-03)
  - 🔎 Evidencia: 002 y 003 ejecutados en la VM el 2 de octubre (docs/incidencias/2026-10-02_despliegue-sql-v2.2-en-produccion.txt, INC-010)
- [ ] **T-003** Desplegar el backend nuevo como servicio systemd · _en-progreso_
  - ⏸️ Espera: Comprobar que arranca sola tras reiniciar la VM y decidir si se instala despliegue/amatista-api.service o se adopta el nombre amatista-backend
  - 🔎 Evidencia: La VM corre la API como servicio systemd con la unidad que ya tenía, amatista-backend (docs/bitacora/2026-10-03_bitacora_tecnica_v3_servidor.md §20); actualizar.sh la detecta sola
- [ ] **T-004** Usuario de aplicación en Oracle (dejar de usar ADMIN) · _revision_ — commits: `8384012` (2026-10-01), `30348e0` (2026-10-02)
  - ⏸️ Espera: El script 004 está listo y probado, pero producción sigue con el usuario ADMIN (3 oct). Ejecutar 004 y cambiar DB_USER en el servidor
- [ ] **T-005** HTTPS en el backend para publicar en Cloudflare Pages · _pendiente_
- [x] **T-006** Autenticación de alumnos (cuentas, confirmación, recuperación y fusión offline → cuenta) · _hecho_ — commits: `b2a0eb0` (2026-10-02)
  - 🔎 Evidencia: En main desde el 2 oct (PR #4, #6 y #7)
- [ ] **T-008** Proteger main (solo cambios por PR) · _pendiente_
- [x] **T-014** Esquema incremental 002–004 (8 tablas, 20 GB) y diagnóstico ampliado · _hecho_ — commits: `cd7c7bc` (2026-10-02)
  - 🔎 Evidencia: En main (cd7c7bc); 002 y 003 en producción desde el 2 oct (INC-010). 004 sigue en T-004
- [x] **T-015** Catálogo dinámico y progreso adaptable (acople, replaces, % recalculado) · _hecho_ — commits: `cd7c7bc` (2026-10-02)
  - 🔎 Evidencia: En main desde el 2 oct (cd7c7bc)
- [x] **T-016** Panel del alumno (nivel, racha, retos, actividad e insignias) · _hecho_ — commits: `cd7c7bc` (2026-10-02)
  - 🔎 Evidencia: En main desde el 2 oct (cd7c7bc)
- [x] **T-017** Eventos de aprendizaje y métricas de alumnos activos (API) · _hecho_ — commits: `cd7c7bc` (2026-10-02)
  - 🔎 Evidencia: En main desde el 2 oct (cd7c7bc)
- [x] **T-019** Contenido administrable (API borrador → publicado, validación y CLI) · _hecho_ — commits: `cd7c7bc` (2026-10-02)
  - 🔎 Evidencia: En main desde el 2 oct (cd7c7bc); catálogo importado en producción (T-033)
- [x] **T-021** Bloques interactivos en las lecciones (7 tipos nuevos) · _hecho_ — commits: `cd7c7bc` (2026-10-02)
  - 🔎 Evidencia: En main desde el 2 oct (cd7c7bc); la v3.1 suma 3 bloques más (docs/plataforma/04_herramientas_de_ensenanza.md)
- [x] **T-022** Aplicar la Fórmula Amatista al módulo 1 (bloques interactivos en los JSON) · _hecho_ — commits: `cd7c7bc` (2026-10-02)
  - 🔎 Evidencia: En main desde el 2 oct (cd7c7bc); contenido.py validar en CI
  - 🎯 Listo cuando: python herramientas/contenido.py validar sin errores; Una interacción cada ~2 bloques de texto en cada lección
- [ ] **T-023** Respaldo de Oracle y restauración ensayada en pruebas · _pendiente_
  - 🎯 Listo cuando: Restauración en menos de 2 horas, respaldo diario (plan, sección 6)
- [ ] **T-024** Publicar el frontend en Cloudflare Pages contra la API HTTPS · _pendiente_
  - 🎯 Listo cuando: VITE_API_URL con https, sin contenido mixto ni errores CORS; Rutas profundas, recarga y actualización del service worker sin perder progreso
- [ ] **T-025** Pruebas P01–P10 del plan de lanzamiento con evidencia · _pendiente_
  - 🎯 Listo cuando: Cada prueba con fecha, commit, ambiente, dispositivo, esperado, real y evidencia
- [ ] **T-026** Piloto por invitación con 10 alumnos (8 de octubre, 18:00) · _pendiente_
  - 🎯 Listo cuando: Decisión de apertura el 7 de octubre; 7 activaciones como meta
- [ ] **T-027** Beta pública con cohorte inicial de 30 cuentas (15 de octubre, 18:00) · _pendiente_
  - 🎯 Listo cuando: Cero defectos que expongan datos, pierdan progreso o impidan estudiar; 5 alumnos reales completan el flujo y 48 h del piloto sin fallos críticos
- [ ] **T-028** Informe semanal de alumnos activos (meta 20 activos al 22 de octubre) · _en-progreso_ — commits: `cd7c7bc` (2026-10-02)
  - ⏸️ Espera: Empieza con la beta (T-027); el commit que la movió solo preparó las métricas
- [ ] **T-029** Prueba de punta a punta en navegador (anónimo → cuenta → offline → admin publica → acople) · _en-progreso_ — commits: `8157ace` (2026-10-02), `a45d80c` (2026-10-02)
  - 🎯 Listo cuando: Recorrido de la sección 2.3 de la bitácora del 2/10 con capturas en 390 px y 1280 px
- [ ] **T-030** Revisión de seguridad e integridad (permisos, tokens, XSS en contenido, fusión y sincronización) · _pendiente_
  - 🎯 Listo cuando: Hallazgos registrados en docs/incidencias/ y corregidos o con decisión escrita
- [ ] **T-031** Documentación de la v2.2 (base de datos, autenticación, panel y despliegue) · _revision_ — commits: `c01f296` (2026-10-02), `54edda8` (2026-10-02), `ffe3543` (2026-10-04)
  - 🔎 Evidencia: 4 oct: docs/base-de-datos/ (esquema completo), docs/manual-del-codigo/03_backend.md (autenticación y roles), docs/plataforma/05_panel_de_administracion.md y docs/despliegue/2026-10-04_despliegue_oci.md
  - 🎯 Listo cuando: Los documentos pendientes de docs/README.md existen y están enlazados (incluida la guía de despliegue en OCI, que quedó en docs/despliegue/2026-10-04_despliegue_oci.md)
- [ ] **T-032** Configurar SMTP y primer admin en el servidor (confirmación y recuperación por correo) · _pendiente_
  - 🎯 Listo cuando: Registro con AMATISTA_REQUIERE_CONFIRMACION=1 recibe el código por correo
- [x] **T-033** Importar el catálogo a Oracle (herramientas/contenido.py importar) · _hecho_ — commits: `8157ace` (2026-10-02), `a45d80c` (2026-10-02), `53dec44` (2026-10-03)
  - 🎯 Listo cuando: GET /api/contenido/catalogo en producción devuelve los 2 módulos publicados

### v3.0.0 · Reestructuración

- [x] **T-034** Estructura de niveles, habilidades y versiones de Blender en código y esquema (005) · _hecho_ — commits: `486f5b5` (2026-10-03), `53dec44` (2026-10-03)
  - 🎯 Listo cuando: Pruebas en CI; 005 probado en Oracle sin perder filas de la v2.2
- [x] **T-035** Ejecutar 005 y 006 en producción y sembrar los niveles · _hecho_
  - 🔎 Evidencia: 005 y 006 ejecutados en producción el 3 oct: 14 tablas, 8 niveles de Blender en borrador (docs/bitacora/2026-10-03_bitacora_tecnica_v3_servidor.md §14–§22)
  - 🎯 Listo cuando: diagnostico_oracle.py dice «Las tablas coinciden» (14 tablas); importar crea los 8 niveles de Blender (docs/reestructuracion/02_manual_oracle.md)
- [x] **T-036** Herramientas de autor en Oracle (006, vistas y paquete AMATISTA_AUTOR) · _hecho_ — commits: `486f5b5` (2026-10-03)
  - 🎯 Listo cuando: Paquete VALID en Oracle; nueva_leccion crea los mismos 10 pasos que la CLI
- [x] **T-037** Documentación de la reestructuración, bitácora y tablero nuevo · _hecho_ — commits: `53dec44` (2026-10-03)
- [x] **T-061** Documentación completa por secciones (historia, manual del código, esquema SQL, manual del desarrollador y README) · _hecho_ — commits: `ffe3543` (2026-10-04)
  - 🔎 Evidencia: docs/README.md (índice por secciones), docs/historia/, docs/manual-del-codigo/, docs/base-de-datos/, docs/desarrollador/, docs/herramientas-de-la-plataforma.md y README.md
- [ ] **T-038** Elegir y verificar la versión principal de Blender (LTS) · _pendiente_
  - ⏸️ Espera: Decisión de Maximiliano pendiente (versión LTS principal); hasta entonces VERSIONES_BLENDER queda vacía en producción
  - 🎯 Listo cuando: Una fila principal en VERSIONES_BLENDER con nota del soporte oficial consultado
- [ ] **T-039** Inventario de lecciones existentes → niveles y fichas · _pendiente_
  - 🎯 Listo cuando: Cada módulo con nivel; contenido.py mapa al 100 % en lo publicado
- [ ] **T-040** Lección modelo completa (10 pasos, recursos, rúbrica y verificación) · _pendiente_
- [ ] **T-041** Mapa de niveles en la PWA y «Verificada en…» en cada lección · _pendiente_
- [ ] **T-042** Habilidades y rúbrica en la API y en el panel del alumno · _pendiente_
  - 🎯 Listo cuando: El alumno ve avance, experiencia y habilidades por separado
- [ ] **T-043** Diagnóstico opcional de entrada que recomienda un nivel · _pendiente_
- [ ] **T-044** Editor del panel con ficha de lección y nivel del módulo · _pendiente_
  - 🎯 Listo cuando: El admin llena la ficha y asigna nivel sin tocar JSON

### v3.1.0 · Mi primer espacio 3D

- [ ] **T-009** Mi primer espacio 3D: lecciones 01–03 (entorno, navegar, seleccionar y transformar) · _pendiente_
- [ ] **T-045** Mi primer espacio 3D: lecciones 04–05 (base de la habitación, guardar y recuperar) · _pendiente_
- [ ] **T-046** Mi primer espacio 3D: lecciones 06–07 (mesa y primera edición de malla) · _pendiente_
- [ ] **T-047** Mi primer espacio 3D: lecciones 08–09 (lámpara, colores, cámara e iluminación) · _pendiente_
- [ ] **T-048** Mi primer espacio 3D: lecciones 10–11 (error preparado, variante y rúbrica) · _pendiente_
  - 🎯 Listo cuando: Condiciones de la sección 10 de la propuesta, observadas con una persona principiante y otra con experiencia básica

### v3.2.0 · Laboratorio 3D

- [ ] **T-010** Módulo 2 de A-Frame (cargar modelos GLB) · _pendiente_
- [ ] **T-011** Visor de modelos GLB en las lecciones · _pendiente_
- [ ] **T-049** Laboratorio mínimo (escena de ejemplo, reinicio, avisos de recurso faltante) y lección 12 · _pendiente_

### v3.3.0 · Add-on de Blender

- [x] **T-050** Contrato de API del add-on y vinculación de cuenta por código · _hecho_ — commits: `96502b1` (2026-10-04)
  - 🔎 Evidencia: API /api/addon/v1 y vínculo por código en main (PR #13, ec849d8); docs/motor/referencia/05_api.md
- [x] **T-051** Esqueleto del add-on (manifiesto 4.2+, preferencias, panel de la lección) · _hecho_ — commits: `96502b1` (2026-10-04)
  - 🔎 Evidencia: Extensión 4.2+ con preferencias y paneles en main (PR #13); etapa 2 en PR #14
- [ ] **T-052** Comprobaciones locales de la lección 03 en el add-on · _en-progreso_ — commits: `96502b1` (2026-10-04)
  - ⏸️ Espera: El motor ya evalúa la práctica de la mesa; faltan las comprobaciones de la lección 03 de «Mi primer espacio 3D», que todavía no existe (T-009)
- [x] **T-053** Registrar verificaciones de versión desde Blender · _hecho_ — commits: `96502b1` (2026-10-04)
  - 🔎 Evidencia: Amatista Author › Registrar verificación envía POST /api/blender/verificaciones (PR #13)
- [ ] **T-013** Add-on de Blender conectado con la plataforma (MVP publicado) · _pendiente_
  - ⏸️ Espera: Código listo (PR #13 y #14); se publica cuando 007 esté en producción (T-055) y el instalador se pruebe en equipos reales (T-056)
- [ ] **T-055** Aplicar 007 en Oracle y publicar la práctica de la mesa y el módulo 2 (después del piloto) · _en-progreso_ — commits: `96502b1` (2026-10-04)
  - ⏸️ Espera: Después del piloto del 8 de octubre
  - 🎯 Listo cuando: 007 ejecutado en Database Actions, diagnóstico sin faltantes, práctica blender.n1.mesa publicada y módulo 2 importado (docs/reestructuracion/02_manual_oracle.md, sección 10)
- [ ] **T-056** Probar el paquete de instalación en Windows y macOS reales · _en-progreso_ — commits: `96502b1` (2026-10-04)
  - ⏸️ Espera: Necesita una computadora Windows y una Mac con Blender 4.2 o más nuevo
  - 🎯 Listo cuando: El instalador encuentra Blender, avisa si es anterior a 4.2 y deja el add-on activo en un Windows y un macOS reales (docs/motor/referencia/04_instalacion_alumno.md)
- [x] **T-057** Motor etapa 2: guía paso a paso, «Hazlo conmigo» y acompañante en el add-on · _hecho_ — commits: `81a17ff` (2026-10-04), `0017a46` (2026-10-04)
  - 🔎 Evidencia: docs/motor/etapas/etapa-2.md y docs/motor/referencia/07_guia_y_acompanamiento.md; engine/tests/test_guia.py y addon/tests/en_blender.py
- [x] **T-058** Práctica de Blender al cierre de cada módulo, etiquetas y herramientas nuevas en la plataforma · _hecho_ — commits: `0017a46` (2026-10-04)
  - 🔎 Evidencia: docs/plataforma/ (mapa, módulos con práctica, etiquetas, herramientas y panel de administración)
- [ ] **T-059** Probar la guía de la etapa 2 en un Blender real con GPU y agregar capturas a la documentación · _pendiente_
  - 🎯 Listo cuando: Recorrido de la mesa en modo Acompañado en Windows o macOS: tarjeta, guía 3D, «Hazlo conmigo» y diálogos se ven bien; capturas reales en docs/motor/etapas/img/

### v3.4.0 · Especialidades y tutor

- [ ] **T-060** Guardar en Oracle las ayudas usadas en cada práctica (008 aditivo) y mostrarlas al profesor · _en-progreso_ — commits: `81a17ff` (2026-10-04)
  - 🎯 Listo cuando: Script 008 idempotente, el intento guarda «ayudas» y el panel muestra cuántas veces cada alumno usó «Hazlo conmigo» o «Muéstrame»
- [ ] **T-054** Primera rama del nivel 5 (por decidir; propuesta web y videojuegos) · _en-progreso_ — commits: `53dec44` (2026-10-03)
  - ⏸️ Espera: Decisión pendiente (propuesta: web y videojuegos); el commit que la movió solo la documentó
- [ ] **T-012** Tutor IA con Ollama dentro de las lecciones · _pendiente_
