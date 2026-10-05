# Archivo histórico de la plataforma (hasta hoy)

Resumen en lenguaje simple de cómo empezó Amatista, cuántas veces cambió y en qué se convirtió al 5 de octubre de 2026.

Actualizado: 5 de octubre de 2026 (main en `34ed82d`).

## 1) La idea inicial vs. lo que es hoy

| Momento | Qué era |
|---|---|
| Inicio (27 sep 2026) | Un prototipo técnico: App Shell con React + Vite + Tailwind y visor A-Frame. |
| Hoy (5 oct 2026) | Una plataforma educativa de Blender + A-Frame con cuentas y roles, panel de administración, motor de prácticas (Amatista Engine), add-on de Blender (Amatista Motor), auditoría de seguridad, pruebas de rendimiento y plan de despliegue por fases. |

## 2) ¿Qué está haciendo hoy la plataforma?

- Enseña por módulos y prácticas guiadas (teoría en web + práctica en Blender).
- Lleva progreso del alumno (web y prácticas del add-on).
- Permite operación por roles (alumno, profesor, admin).
- Publica y administra contenido desde panel/API.
- Evalúa prácticas con el motor y validadores (incluye referencias de cómo debe verse).
- Ya tiene trabajo reciente en seguridad, rendimiento y experiencia visual por módulo.

## 3) ¿Cuántas veces cambió?

### Cambios por versión

Tomando los cortes de versión del `CHANGELOG.md` y tags preparados:

- **12 cambios de versión en total**:
  - **4 versiones base**: `v0.1.0`, `v1.0.0`, `v2.0.0`, `v2.0.1`.
  - **8 pre-lanzamientos**: `v2.2.0-alpha.1`, `v2.2.0-alpha.2`, `v3.0.0-alpha.1` a `v3.0.0-alpha.8`.

### Cambios por etapa de producto

En términos de rumbo del producto, hubo **11 saltos de etapa**:
prototipo → integración → plataforma educativa → repositorio oficial → plataforma unificada → reestructuración v3 → engine etapa 1 → engine etapa 2 → motor v3/currículo unificado → temáticas + motor 3.2 → seguridad/rendimiento + motor 3.3.

## 4) ¿Cuántas ideas surgieron?

Según `docs/historia/02_ideas_y_como_se_implementaron.md`:

- **153 ideas** en total.
- **85 implementadas**.
- **30 parciales**.
- **28 pendientes**.
- **10 descartadas o reemplazadas**.

## 5) Línea rápida de evolución (inicio → hoy)

1. **27 sep:** nace el prototipo (`v0.1.0`).
2. **28 sep:** integración real React + FastAPI + Oracle (`v1.0.0`).
3. **29 sep:** se vuelve plataforma educativa con progreso (`v2.0.0`).
4. **1 oct:** pasa al repositorio oficial (`v2.0.1`) y comienza la plataforma unificada.
5. **1–3 oct:** llegan cuentas/roles, panel admin, reestructuración v3 y motor de prácticas con add-on.
6. **4 oct:** se consolida la documentación y el plan técnico.
7. **5 oct:** mejoras fuertes de seguridad, rendimiento, motor 3.3 y experiencia temática por módulo (`v3.0.0-alpha.8` propuesto).

## 6) Conclusión corta

Amatista pasó de un prototipo de interfaz a una plataforma educativa completa con motor propio de prácticas en Blender.  
Hoy la idea original (aprender 3D de forma práctica) se mantiene, pero con alcance más grande: operación real, seguimiento del alumno, herramientas de autor, validación técnica, y preparación de despliegue para piloto y beta.
