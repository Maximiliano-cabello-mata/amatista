# Tablero de Amatista

> Se genera solo con cada push: **no se edita a mano**. Las tareas se crean en
> [`tablero/tareas.yml`](tablero/tareas.yml) y se mueven con los commits
> ([cómo](tablero/README.md)).

Último commit: 2026-10-02 05:23 · `main` en `a671848`

## 🗺️ Roadmap

| Versión | Meta | Objetivo | Avance |
|---|---|---|---|
| **v2.1.0** | Oracle en producción | El progreso de los alumnos se guarda en Oracle desde el servidor. | ▰▰▱▱▱▱▱▱▱▱ 1/5 |
| **v2.2.0** | Plataforma unificada | Cuentas con roles, panel del alumno, panel de administración, contenido administrable, lecciones interactivas y lanzamiento de la beta. | ▱▱▱▱▱▱▱▱▱▱ 0/18 |
| **v2.3.0** | Módulo 2 | Segundo módulo de Blender y de A-Frame. | ▱▱▱▱▱▱▱▱▱▱ 0/2 |
| **v3.0.0** | Amatista 3D Lab | Modelos GLB, tutor IA y puente con Blender (ver docs/propuestas). | ▱▱▱▱▱▱▱▱▱▱ 0/3 |

Versiones publicadas (tags): `v2.2.0-alpha.1` · `v2.0.1` · `v2.0.0` · `v1.0.0` · `v0.1.0`

## 📌 Kanban

| 📋 Pendiente (13) | 🔨 En progreso (1) | 👀 Revisión (13) | ✅ Hecho (1) |
|---|---|---|---|
| **T-003** Desplegar el backend nuevo como servicio systemd<br><sub>v2.1.0 · api</sub> | **T-028** Informe semanal de alumnos activos (meta 20 activos al 22 de octubre)<br><sub>v2.2.0 · lanzamiento</sub> | **T-002** Ejecutar el esquema SQL nuevo en Oracle y pasar el diagnóstico<br><sub>v2.1.0 · db</sub> | **T-001** Publicar los tags de versión (herramientas/crear-tags.sh)<br><sub>v2.1.0 · repo</sub> |
| **T-005** HTTPS en el backend para publicar en Cloudflare Pages<br><sub>v2.1.0 · api</sub> |   | **T-004** Usuario de aplicación en Oracle (dejar de usar ADMIN)<br><sub>v2.1.0 · db</sub> |   |
| **T-008** Proteger main (solo cambios por PR)<br><sub>v2.2.0 · repo</sub> |   | **T-006** Autenticación de alumnos (cuentas, confirmación, recuperación y fusión offline → cuenta)<br><sub>v2.2.0 · api</sub> |   |
| **T-009** Módulo 2 de Blender (interfaz y navegación)<br><sub>v2.3.0 · pwa</sub> |   | **T-007** CI en GitHub Actions (lint, build y pytest)<br><sub>v2.2.0 · repo</sub> |   |
| **T-010** Módulo 2 de A-Frame (cargar modelos GLB)<br><sub>v2.3.0 · pwa</sub> |   | **T-014** Esquema incremental 002–004 (8 tablas, 20 GB) y diagnóstico ampliado<br><sub>v2.2.0 · db</sub> |   |
| **T-011** Visor de modelos GLB en las lecciones<br><sub>v3.0.0 · pwa</sub> |   | **T-015** Catálogo dinámico y progreso adaptable (acople, replaces, % recalculado)<br><sub>v2.2.0 · pwa</sub> |   |
| **T-012** Tutor IA con Ollama dentro de las lecciones<br><sub>v3.0.0 · ia</sub> |   | **T-016** Panel del alumno (nivel, racha, retos, actividad e insignias)<br><sub>v2.2.0 · pwa</sub> |   |
| **T-013** Add-on de Blender conectado con la plataforma<br><sub>v3.0.0 · pwa</sub> |   | **T-017** Eventos de aprendizaje y métricas de alumnos activos (API)<br><sub>v2.2.0 · api</sub> |   |
| **T-023** Respaldo de Oracle y restauración ensayada en pruebas<br><sub>v2.2.0 · db</sub> |   | **T-018** Panel de administración en la PWA (resumen, métricas y usuarios)<br><sub>v2.2.0 · pwa</sub> |   |
| **T-024** Publicar el frontend en Cloudflare Pages contra la API HTTPS<br><sub>v2.2.0 · pwa</sub> |   | **T-019** Contenido administrable (API borrador → publicado, validación y CLI)<br><sub>v2.2.0 · contenido</sub> |   |
| **T-025** Pruebas P01–P10 del plan de lanzamiento con evidencia<br><sub>v2.2.0 · lanzamiento</sub> |   | **T-020** Gestor de contenido en el panel de administración (editor de lecciones)<br><sub>v2.2.0 · pwa</sub> |   |
| **T-026** Piloto por invitación con 10 alumnos (8 de octubre, 18:00)<br><sub>v2.2.0 · lanzamiento</sub> |   | **T-021** Bloques interactivos en las lecciones (7 tipos nuevos)<br><sub>v2.2.0 · pwa</sub> |   |
| **T-027** Beta pública con cohorte inicial de 30 cuentas (15 de octubre, 18:00)<br><sub>v2.2.0 · lanzamiento</sub> |   | **T-022** Aplicar la Fórmula Amatista al módulo 1 (bloques interactivos en los JSON)<br><sub>v2.2.0 · contenido</sub> |   |

## 📚 Contenido

> Sale de `frontend/src/data/modulos/*.json` (campo `estado` de cada módulo). Flujo:
> 📝 borrador → 👀 revision → ✅ publicado. Solo lo publicado llega a los alumnos
> ([la Fórmula](docs/arquitectura/2026-10-02_formula_modulos.txt)).

📝 borrador (0) → 👀 revision (0) → ✅ publicado (2)

| Curso | Módulo | Título | Estado | Lecciones | Bloques interactivos | Fórmula |
|---|---|---|---|---|---|---|
| aframe | 1 | La Web en 3D (Tus primeros pasos en A-Frame) | ✅ publicado | 3 | 5 | — |
| blender | 1 | El mundo 3D y la magia de Blender (Teoría esencial) | ✅ publicado | 4 | 6 | — |

## 🧾 Detalle por versión

### v2.1.0 · Oracle en producción

- [x] **T-001** Publicar los tags de versión (herramientas/crear-tags.sh) · _hecho_ — commits: `9b95f9f` (2026-10-01), `57c063b` (2026-10-01)
- [ ] **T-002** Ejecutar el esquema SQL nuevo en Oracle y pasar el diagnóstico · _revision_ — commits: `30348e0` (2026-10-02), `4fc9068` (2026-10-02)
- [ ] **T-003** Desplegar el backend nuevo como servicio systemd · _pendiente_
- [ ] **T-004** Usuario de aplicación en Oracle (dejar de usar ADMIN) · _revision_ — commits: `8384012` (2026-10-01), `30348e0` (2026-10-02)
- [ ] **T-005** HTTPS en el backend para publicar en Cloudflare Pages · _pendiente_

### v2.2.0 · Plataforma unificada

- [ ] **T-006** Autenticación de alumnos (cuentas, confirmación, recuperación y fusión offline → cuenta) · _revision_ — commits: `b2a0eb0` (2026-10-02)
- [ ] **T-007** CI en GitHub Actions (lint, build y pytest) · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-008** Proteger main (solo cambios por PR) · _pendiente_
- [ ] **T-014** Esquema incremental 002–004 (8 tablas, 20 GB) y diagnóstico ampliado · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-015** Catálogo dinámico y progreso adaptable (acople, replaces, % recalculado) · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-016** Panel del alumno (nivel, racha, retos, actividad e insignias) · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-017** Eventos de aprendizaje y métricas de alumnos activos (API) · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-018** Panel de administración en la PWA (resumen, métricas y usuarios) · _revision_ — commits: `cd7c7bc` (2026-10-02), `9171822` (2026-10-02)
- [ ] **T-019** Contenido administrable (API borrador → publicado, validación y CLI) · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-020** Gestor de contenido en el panel de administración (editor de lecciones) · _revision_ — commits: `cd7c7bc` (2026-10-02), `9171822` (2026-10-02)
- [ ] **T-021** Bloques interactivos en las lecciones (7 tipos nuevos) · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-022** Aplicar la Fórmula Amatista al módulo 1 (bloques interactivos en los JSON) · _revision_ — commits: `cd7c7bc` (2026-10-02)
- [ ] **T-023** Respaldo de Oracle y restauración ensayada en pruebas · _pendiente_
- [ ] **T-024** Publicar el frontend en Cloudflare Pages contra la API HTTPS · _pendiente_
- [ ] **T-025** Pruebas P01–P10 del plan de lanzamiento con evidencia · _pendiente_
- [ ] **T-026** Piloto por invitación con 10 alumnos (8 de octubre, 18:00) · _pendiente_
- [ ] **T-027** Beta pública con cohorte inicial de 30 cuentas (15 de octubre, 18:00) · _pendiente_
- [ ] **T-028** Informe semanal de alumnos activos (meta 20 activos al 22 de octubre) · _en-progreso_ — commits: `cd7c7bc` (2026-10-02)

### v2.3.0 · Módulo 2

- [ ] **T-009** Módulo 2 de Blender (interfaz y navegación) · _pendiente_
- [ ] **T-010** Módulo 2 de A-Frame (cargar modelos GLB) · _pendiente_

### v3.0.0 · Amatista 3D Lab

- [ ] **T-011** Visor de modelos GLB en las lecciones · _pendiente_
- [ ] **T-012** Tutor IA con Ollama dentro de las lecciones · _pendiente_
- [ ] **T-013** Add-on de Blender conectado con la plataforma · _pendiente_
