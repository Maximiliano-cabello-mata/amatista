# Tablero de Amatista

> Se genera solo con cada push: **no se edita a mano**. Las tareas se crean en
> [`tablero/tareas.yml`](tablero/tareas.yml) y se mueven con los commits
> ([cómo](tablero/README.md)).

Último commit: 2026-10-01 18:58 · `main` en `71bdbb1`

## 🗺️ Roadmap

| Versión | Meta | Objetivo | Avance |
|---|---|---|---|
| **v2.1.0** | Oracle en producción | El progreso de los alumnos se guarda en Oracle desde el servidor. | ▰▰▱▱▱▱▱▱▱▱ 1/5 |
| **v2.2.0** | Cuentas y calidad | Alumnos con cuenta propia y CI que revise cada cambio. | ▱▱▱▱▱▱▱▱▱▱ 0/3 |
| **v2.3.0** | Módulo 2 | Segundo módulo de Blender y de A-Frame. | ▱▱▱▱▱▱▱▱▱▱ 0/2 |
| **v3.0.0** | Amatista 3D Lab | Modelos GLB, tutor IA y puente con Blender (ver docs/propuestas). | ▱▱▱▱▱▱▱▱▱▱ 0/3 |

Versiones publicadas (tags): `v2.0.1` · `v2.0.0` · `v1.0.0` · `v0.1.0`

## 📌 Kanban

| 📋 Pendiente (12) | 🔨 En progreso (0) | 👀 Revisión (0) | ✅ Hecho (1) |
|---|---|---|---|
| **T-002** Ejecutar el esquema SQL nuevo en Oracle y pasar el diagnóstico<br><sub>v2.1.0 · db</sub> |   |   | **T-001** Publicar los tags de versión (herramientas/crear-tags.sh)<br><sub>v2.1.0 · repo</sub> |
| **T-003** Desplegar el backend nuevo como servicio systemd<br><sub>v2.1.0 · api</sub> |   |   |   |
| **T-004** Usuario de aplicación en Oracle (dejar de usar ADMIN)<br><sub>v2.1.0 · db</sub> |   |   |   |
| **T-005** HTTPS en el backend para publicar en Cloudflare Pages<br><sub>v2.1.0 · api</sub> |   |   |   |
| **T-006** Autenticación de alumnos<br><sub>v2.2.0 · api</sub> |   |   |   |
| **T-007** CI en GitHub Actions (lint, build y pytest)<br><sub>v2.2.0 · repo</sub> |   |   |   |
| **T-008** Proteger main (solo cambios por PR)<br><sub>v2.2.0 · repo</sub> |   |   |   |
| **T-009** Módulo 2 de Blender (interfaz y navegación)<br><sub>v2.3.0 · pwa</sub> |   |   |   |
| **T-010** Módulo 2 de A-Frame (cargar modelos GLB)<br><sub>v2.3.0 · pwa</sub> |   |   |   |
| **T-011** Visor de modelos GLB en las lecciones<br><sub>v3.0.0 · pwa</sub> |   |   |   |
| **T-012** Tutor IA con Ollama dentro de las lecciones<br><sub>v3.0.0 · ia</sub> |   |   |   |
| **T-013** Add-on de Blender conectado con la plataforma<br><sub>v3.0.0 · pwa</sub> |   |   |   |

## 🧾 Detalle por versión

### v2.1.0 · Oracle en producción

- [x] **T-001** Publicar los tags de versión (herramientas/crear-tags.sh) · _hecho_ — commits: `9b95f9f` (2026-10-01), `57c063b` (2026-10-01)
- [ ] **T-002** Ejecutar el esquema SQL nuevo en Oracle y pasar el diagnóstico · _pendiente_
- [ ] **T-003** Desplegar el backend nuevo como servicio systemd · _pendiente_
- [ ] **T-004** Usuario de aplicación en Oracle (dejar de usar ADMIN) · _pendiente_ — commits: `8384012` (2026-10-01)
- [ ] **T-005** HTTPS en el backend para publicar en Cloudflare Pages · _pendiente_

### v2.2.0 · Cuentas y calidad

- [ ] **T-006** Autenticación de alumnos · _pendiente_
- [ ] **T-007** CI en GitHub Actions (lint, build y pytest) · _pendiente_
- [ ] **T-008** Proteger main (solo cambios por PR) · _pendiente_

### v2.3.0 · Módulo 2

- [ ] **T-009** Módulo 2 de Blender (interfaz y navegación) · _pendiente_
- [ ] **T-010** Módulo 2 de A-Frame (cargar modelos GLB) · _pendiente_

### v3.0.0 · Amatista 3D Lab

- [ ] **T-011** Visor de modelos GLB en las lecciones · _pendiente_
- [ ] **T-012** Tutor IA con Ollama dentro de las lecciones · _pendiente_
- [ ] **T-013** Add-on de Blender conectado con la plataforma · _pendiente_
