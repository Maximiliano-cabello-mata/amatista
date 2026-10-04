# Tablero de Amatista

> Se genera solo con cada push: **no se edita a mano**. Las tareas se crean en
> [`tablero/tareas.yml`](tablero/tareas.yml) y se mueven con los commits
> ([cómo](tablero/README.md)).

Último commit: 2026-10-04 03:31 · `main` en `09db8d9`

**Etapa: Reestructuración** (desde el 2026-10-03) · [plan](docs/reestructuracion/00_plan_maestro.md) · [tablero anterior](tablero/historico/2026-10-03_v2_KANBAN.md)

## 🗺️ Roadmap

| Versión | Meta | Objetivo | Avance |
|---|---|---|---|
| **v2.2.0** | Piloto | Cerrar la v2.2 y abrir el piloto del 8 de octubre sin ampliar el alcance (servicio, HTTPS, SMTP, pruebas y seguridad). | ▰▱▱▱▱▱▱▱▱▱ 2/24 |
| **v3.0.0** | Reestructuración | Niveles, habilidades, versiones de Blender y herramientas de autor en Oracle; documentación y tablero nuevos. | ▰▰▰▱▱▱▱▱▱▱ 3/11 |
| **v3.1.0** | Mi primer espacio 3D | Primera entrega de contenido por niveles (lecciones 01–11 de la propuesta) con fichas, rúbrica y versión verificada. | ▱▱▱▱▱▱▱▱▱▱ 0/5 |
| **v3.2.0** | Laboratorio 3D | Visor GLB en las lecciones, escena de ejemplo y lección 12 (exportar y comprobar). | ▱▱▱▱▱▱▱▱▱▱ 0/3 |
| **v3.3.0** | Add-on de Blender | Add-on conectado a la plataforma (vincular cuenta, panel de lección, comprobaciones y verificaciones). | ▱▱▱▱▱▱▱▱▱▱ 0/7 |
| **v3.4.0** | Especialidades y tutor | Primera rama del nivel 5 y tutor IA dentro de las lecciones. | ▱▱▱▱▱▱▱▱▱▱ 0/2 |

Versiones publicadas (tags): `v2.2.0-alpha.1` · `v2.0.1` · `v2.0.0` · `v1.0.0` · `v0.1.0`

## 📌 Kanban

| 📋 Pendiente (28) | 🔨 En progreso (9) | 👀 Revisión (10) | ✅ Hecho (5) |
|---|---|---|---|
| **T-003** Desplegar el backend nuevo como servicio systemd<br><sub>v2.2.0 · api</sub> | **T-028** Informe semanal de alumnos activos (meta 20 activos al 22 de octubre)<br><sub>v2.2.0 · lanzamiento</sub> | **T-004** Usuario de aplicación en Oracle (dejar de usar ADMIN)<br><sub>v2.2.0 · db</sub> | **T-002** Ejecutar el esquema SQL nuevo en Oracle y pasar el diagnóstico<br><sub>v2.2.0 · db</sub> |
| **T-005** HTTPS en el backend para publicar en Cloudflare Pages<br><sub>v2.2.0 · api</sub> | **T-029** Prueba de punta a punta en navegador (anónimo → cuenta → offline → admin publica → acople)<br><sub>v2.2.0 · lanzamiento</sub> | **T-006** Autenticación de alumnos (cuentas, confirmación, recuperación y fusión offline → cuenta)<br><sub>v2.2.0 · api</sub> | **T-033** Importar el catálogo a Oracle (herramientas/contenido.py importar)<br><sub>v2.2.0 · contenido</sub> |
| **T-008** Proteger main (solo cambios por PR)<br><sub>v2.2.0 · repo</sub> | **T-031** Documentación de la v2.2 (base de datos, autenticación, panel y despliegue)<br><sub>v2.2.0 · repo</sub> | **T-014** Esquema incremental 002–004 (8 tablas, 20 GB) y diagnóstico ampliado<br><sub>v2.2.0 · db</sub> | **T-034** Estructura de niveles, habilidades y versiones de Blender en código y esquema (005)<br><sub>v3.0.0 · db</sub> |
| **T-023** Respaldo de Oracle y restauración ensayada en pruebas<br><sub>v2.2.0 · db</sub> | **T-051** Esqueleto del add-on (manifiesto 4.2+, preferencias, panel de la lección)<br><sub>v3.3.0 · blender</sub> | **T-015** Catálogo dinámico y progreso adaptable (acople, replaces, % recalculado)<br><sub>v2.2.0 · pwa</sub> | **T-036** Herramientas de autor en Oracle (006, vistas y paquete AMATISTA_AUTOR)<br><sub>v3.0.0 · db</sub> |
| **T-024** Publicar el frontend en Cloudflare Pages contra la API HTTPS<br><sub>v2.2.0 · pwa</sub> | **T-052** Comprobaciones locales de la lección 03 en el add-on<br><sub>v3.3.0 · blender</sub> | **T-016** Panel del alumno (nivel, racha, retos, actividad e insignias)<br><sub>v2.2.0 · pwa</sub> | **T-037** Documentación de la reestructuración, bitácora y tablero nuevo<br><sub>v3.0.0 · repo</sub> |
| **T-025** Pruebas P01–P10 del plan de lanzamiento con evidencia<br><sub>v2.2.0 · lanzamiento</sub> | **T-053** Registrar verificaciones de versión desde Blender<br><sub>v3.3.0 · blender</sub> | **T-017** Eventos de aprendizaje y métricas de alumnos activos (API)<br><sub>v2.2.0 · api</sub> |   |
| **T-026** Piloto por invitación con 10 alumnos (8 de octubre, 18:00)<br><sub>v2.2.0 · lanzamiento</sub> | **T-055** Aplicar 007 en Oracle y publicar la práctica de la mesa y el módulo 2 (después del piloto)<br><sub>v3.3.0 · db</sub> | **T-019** Contenido administrable (API borrador → publicado, validación y CLI)<br><sub>v2.2.0 · contenido</sub> |   |
| **T-027** Beta pública con cohorte inicial de 30 cuentas (15 de octubre, 18:00)<br><sub>v2.2.0 · lanzamiento</sub> | **T-056** Probar el paquete de instalación en Windows y macOS reales<br><sub>v3.3.0 · blender</sub> | **T-021** Bloques interactivos en las lecciones (7 tipos nuevos)<br><sub>v2.2.0 · pwa</sub> |   |
| **T-030** Revisión de seguridad e integridad (permisos, tokens, XSS en contenido, fusión y sincronización)<br><sub>v2.2.0 · api</sub> | **T-054** Primera rama del nivel 5 (por decidir; propuesta web y videojuegos)<br><sub>v3.4.0 · contenido</sub> | **T-022** Aplicar la Fórmula Amatista al módulo 1 (bloques interactivos en los JSON)<br><sub>v2.2.0 · contenido</sub> |   |
| **T-032** Configurar SMTP y primer admin en el servidor (confirmación y recuperación por correo)<br><sub>v2.2.0 · api</sub> |   | **T-050** Contrato de API del add-on y vinculación de cuenta por código<br><sub>v3.3.0 · api</sub> |   |
| **T-035** Ejecutar 005 y 006 en producción y sembrar los niveles<br><sub>v3.0.0 · db</sub> |   |   |   |
| **T-038** Elegir y verificar la versión principal de Blender (LTS)<br><sub>v3.0.0 · contenido</sub> |   |   |   |
| **T-039** Inventario de lecciones existentes → niveles y fichas<br><sub>v3.0.0 · contenido</sub> |   |   |   |
| **T-040** Lección modelo completa (10 pasos, recursos, rúbrica y verificación)<br><sub>v3.0.0 · contenido</sub> |   |   |   |
| **T-041** Mapa de niveles en la PWA y «Verificada en…» en cada lección<br><sub>v3.0.0 · pwa</sub> |   |   |   |
| **T-042** Habilidades y rúbrica en la API y en el panel del alumno<br><sub>v3.0.0 · api</sub> |   |   |   |
| **T-043** Diagnóstico opcional de entrada que recomienda un nivel<br><sub>v3.0.0 · pwa</sub> |   |   |   |
| **T-044** Editor del panel con ficha de lección y nivel del módulo<br><sub>v3.0.0 · pwa</sub> |   |   |   |
| **T-009** Mi primer espacio 3D: lecciones 01–03 (entorno, navegar, seleccionar y transformar)<br><sub>v3.1.0 · contenido</sub> |   |   |   |
| **T-045** Mi primer espacio 3D: lecciones 04–05 (base de la habitación, guardar y recuperar)<br><sub>v3.1.0 · contenido</sub> |   |   |   |
| **T-046** Mi primer espacio 3D: lecciones 06–07 (mesa y primera edición de malla)<br><sub>v3.1.0 · contenido</sub> |   |   |   |
| **T-047** Mi primer espacio 3D: lecciones 08–09 (lámpara, colores, cámara e iluminación)<br><sub>v3.1.0 · contenido</sub> |   |   |   |
| **T-048** Mi primer espacio 3D: lecciones 10–11 (error preparado, variante y rúbrica)<br><sub>v3.1.0 · contenido</sub> |   |   |   |
| **T-010** Módulo 2 de A-Frame (cargar modelos GLB)<br><sub>v3.2.0 · pwa</sub> |   |   |   |
| **T-011** Visor de modelos GLB en las lecciones<br><sub>v3.2.0 · pwa</sub> |   |   |   |
| **T-049** Laboratorio mínimo (escena de ejemplo, reinicio, avisos de recurso faltante) y lección 12<br><sub>v3.2.0 · pwa</sub> |   |   |   |
| **T-013** Add-on de Blender conectado con la plataforma (MVP publicado)<br><sub>v3.3.0 · blender</sub> |   |   |   |
| **T-012** Tutor IA con Ollama dentro de las lecciones<br><sub>v3.4.0 · ia</sub> |   |   |   |

## 📚 Contenido

> Sale de `frontend/src/data/modulos/*.json` (campo `estado` de cada módulo). Flujo:
> 📝 borrador → 👀 revision → ✅ publicado. Solo lo publicado llega a los alumnos
> ([la Fórmula](docs/arquitectura/2026-10-02_formula_modulos.txt)).

📝 borrador (0) → 👀 revision (1) → ✅ publicado (2)

| Curso | Módulo | Título | Estado | Lecciones | Bloques interactivos | Fórmula |
|---|---|---|---|---|---|---|
| aframe | 1 | La Web en 3D (Tus primeros pasos en A-Frame) | ✅ publicado | 3 | 5 | — |
| blender | 1 | El mundo 3D y la magia de Blender (Teoría esencial) | ✅ publicado | 4 | 6 | — |
| blender | 2 | Interfaz y navegación | 👀 revision | 3 | 6 | 3/5 |

## 🧾 Detalle por versión

### v2.2.0 · Piloto

- [x] **T-002** Ejecutar el esquema SQL nuevo en Oracle y pasar el diagnóstico · _hecho_ — commits: `3374d51` (2026-10-02), `a45d80c` (2026-10-02), `53dec44` (2026-10-03)
- [ ] **T-003** Desplegar el backend nuevo como servicio systemd · _pendiente_
- [ ] **T-004** Usuario de aplicación en Oracle (dejar de usar ADMIN) · _revision_ — commits: `8384012` (2026-10-01), `30348e0` (2026-10-02)
- [ ] **T-005** HTTPS en el backend para publicar en Cloudflare Pages · _pendiente_
- [ ] **T-006** Autenticación de alumnos (cuentas, confirmación, recuperación y fusión offline → cuenta) · _revision_ — commits: `b2a0eb0` (2026-10-02)
- [ ] **T-008** Proteger main (solo cambios por PR) · _pendiente_
- [ ] **T-014** Esquema incremental 002–004 (8 tablas, 20 GB) y diagnóstico ampliado · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-015** Catálogo dinámico y progreso adaptable (acople, replaces, % recalculado) · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-016** Panel del alumno (nivel, racha, retos, actividad e insignias) · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-017** Eventos de aprendizaje y métricas de alumnos activos (API) · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-019** Contenido administrable (API borrador → publicado, validación y CLI) · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-021** Bloques interactivos en las lecciones (7 tipos nuevos) · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-022** Aplicar la Fórmula Amatista al módulo 1 (bloques interactivos en los JSON) · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-023** Respaldo de Oracle y restauración ensayada en pruebas · _pendiente_
- [ ] **T-024** Publicar el frontend en Cloudflare Pages contra la API HTTPS · _pendiente_
- [ ] **T-025** Pruebas P01–P10 del plan de lanzamiento con evidencia · _pendiente_
- [ ] **T-026** Piloto por invitación con 10 alumnos (8 de octubre, 18:00) · _pendiente_
- [ ] **T-027** Beta pública con cohorte inicial de 30 cuentas (15 de octubre, 18:00) · _pendiente_
- [ ] **T-028** Informe semanal de alumnos activos (meta 20 activos al 22 de octubre) · _en-progreso_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-029** Prueba de punta a punta en navegador (anónimo → cuenta → offline → admin publica → acople) · _en-progreso_ — commits: `8157ace` (2026-10-02), `a45d80c` (2026-10-02)
- [ ] **T-030** Revisión de seguridad e integridad (permisos, tokens, XSS en contenido, fusión y sincronización) · _pendiente_
- [ ] **T-031** Documentación de la v2.2 (base de datos, autenticación, panel y despliegue) · _en-progreso_ — commits: `c01f296` (2026-10-02), `54edda8` (2026-10-02)
- [ ] **T-032** Configurar SMTP y primer admin en el servidor (confirmación y recuperación por correo) · _pendiente_
- [x] **T-033** Importar el catálogo a Oracle (herramientas/contenido.py importar) · _hecho_ — commits: `8157ace` (2026-10-02), `a45d80c` (2026-10-02), `53dec44` (2026-10-03)

### v3.0.0 · Reestructuración

- [x] **T-034** Estructura de niveles, habilidades y versiones de Blender en código y esquema (005) · _hecho_ — commits: `486f5b5` (2026-10-03), `53dec44` (2026-10-03)
- [ ] **T-035** Ejecutar 005 y 006 en producción y sembrar los niveles · _pendiente_
- [x] **T-036** Herramientas de autor en Oracle (006, vistas y paquete AMATISTA_AUTOR) · _hecho_ — commits: `486f5b5` (2026-10-03)
- [x] **T-037** Documentación de la reestructuración, bitácora y tablero nuevo · _hecho_ — commits: `53dec44` (2026-10-03)
- [ ] **T-038** Elegir y verificar la versión principal de Blender (LTS) · _pendiente_
- [ ] **T-039** Inventario de lecciones existentes → niveles y fichas · _pendiente_
- [ ] **T-040** Lección modelo completa (10 pasos, recursos, rúbrica y verificación) · _pendiente_
- [ ] **T-041** Mapa de niveles en la PWA y «Verificada en…» en cada lección · _pendiente_
- [ ] **T-042** Habilidades y rúbrica en la API y en el panel del alumno · _pendiente_
- [ ] **T-043** Diagnóstico opcional de entrada que recomienda un nivel · _pendiente_
- [ ] **T-044** Editor del panel con ficha de lección y nivel del módulo · _pendiente_

### v3.1.0 · Mi primer espacio 3D

- [ ] **T-009** Mi primer espacio 3D: lecciones 01–03 (entorno, navegar, seleccionar y transformar) · _pendiente_
- [ ] **T-045** Mi primer espacio 3D: lecciones 04–05 (base de la habitación, guardar y recuperar) · _pendiente_
- [ ] **T-046** Mi primer espacio 3D: lecciones 06–07 (mesa y primera edición de malla) · _pendiente_
- [ ] **T-047** Mi primer espacio 3D: lecciones 08–09 (lámpara, colores, cámara e iluminación) · _pendiente_
- [ ] **T-048** Mi primer espacio 3D: lecciones 10–11 (error preparado, variante y rúbrica) · _pendiente_

### v3.2.0 · Laboratorio 3D

- [ ] **T-010** Módulo 2 de A-Frame (cargar modelos GLB) · _pendiente_
- [ ] **T-011** Visor de modelos GLB en las lecciones · _pendiente_
- [ ] **T-049** Laboratorio mínimo (escena de ejemplo, reinicio, avisos de recurso faltante) y lección 12 · _pendiente_

### v3.3.0 · Add-on de Blender

- [ ] **T-050** Contrato de API del add-on y vinculación de cuenta por código · _revision_ — commits: `96502b1` (2026-10-04)
- [ ] **T-051** Esqueleto del add-on (manifiesto 4.2+, preferencias, panel de la lección) · _en-progreso_ — commits: `96502b1` (2026-10-04)
- [ ] **T-052** Comprobaciones locales de la lección 03 en el add-on · _en-progreso_ — commits: `96502b1` (2026-10-04)
- [ ] **T-053** Registrar verificaciones de versión desde Blender · _en-progreso_ — commits: `96502b1` (2026-10-04)
- [ ] **T-013** Add-on de Blender conectado con la plataforma (MVP publicado) · _pendiente_
- [ ] **T-055** Aplicar 007 en Oracle y publicar la práctica de la mesa y el módulo 2 (después del piloto) · _en-progreso_ — commits: `96502b1` (2026-10-04)
- [ ] **T-056** Probar el paquete de instalación en Windows y macOS reales · _en-progreso_ — commits: `96502b1` (2026-10-04)

### v3.4.0 · Especialidades y tutor

- [ ] **T-054** Primera rama del nivel 5 (por decidir; propuesta web y videojuegos) · _en-progreso_ — commits: `53dec44` (2026-10-03)
- [ ] **T-012** Tutor IA con Ollama dentro de las lecciones · _pendiente_
