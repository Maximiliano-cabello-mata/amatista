# Bitácora · 3 de octubre de 2026 · Estado del proyecto y arranque de la reestructuración

**En tres líneas**

- **Hecho hasta hoy:** la plataforma v2.2 (cuentas, progreso offline, panel del alumno y de administración, contenido administrable, Oracle con 8 tablas) está en `main` y en producción con 002 y 003 aplicados.
- **Hoy:** empieza la etapa v3 «Reestructuración»: niveles, versiones de Blender, habilidades y herramientas de autor en Oracle, probadas contra un Oracle real; documentación y tablero nuevos.
- **Siguiente:** confirmar el PR, ejecutar 005 y 006 en Oracle (no afecta al piloto) y crear el tag `v3.0.0-alpha.1` desde la PC.

## 1. Todo lo realizado hasta hoy

| Fecha | Versión | Qué quedó |
|---|---|---|
| 27 sep | `v0.1.0` Prototipo | Monorepo, App Shell (React, Tailwind, visor A-Frame), primera arquitectura FastAPI + Oracle, CORS, ORA-01400 resuelto |
| 28 sep | `v1.0.0` Integración | React → FastAPI → Oracle funcionando, documentación por carpetas y fechas, CHANGELOG |
| 29 sep | `v2.0.0` Plataforma educativa | Identidad low poly, PWA offline, Módulo 1 de Blender y A-Frame, progreso local, backend en el repositorio |
| 1 oct | `v2.0.1` Repositorio oficial | Migración a `Maximiliano-cabello-mata/amatista`, firma SSH, tags por fases, tablero Kanban dirigido por commits (PR #1–#3) |
| 1 oct | `v2.2.0-alpha.1` | Cuentas, Oracle para 20 GB, progreso adaptable, contenido administrable, lecciones interactivas, panel del alumno |
| 2 oct | (`v2.2.0-alpha.2` preparado) | Autenticación completa (PR #4, #6, #7), panel de administración (PR #8), correcciones de Oracle y guía paso a paso, cierre del día, ramas unificadas (PR #11). 207 pruebas |
| 2 oct (servidor) | — | En la VM: remoto corregido al repositorio oficial, 002 y 003 ejecutados en Oracle 23.26 (8 tablas OK, 4 MB de 20 GB), catálogo importado, `/api/salud` con `"motor":"oracle"`. Detalle: [incidencia INC-010](../incidencias/2026-10-02_despliegue-sql-v2.2-en-produccion.txt) |
| 3 oct | v3 en curso | Esta entrega (sección 2) |

Ramas en GitHub al empezar: `main`, `claude/project-thread-bpfcse` (ya contenida en `main`, por borrar desde la PC) y la rama de esta entrega.

## 2. Lo que se hizo hoy

Pedido de Maximiliano: ampliar Amatista (no empezar de cero) con cursos por niveles, versiones de Blender y un add-on conectado; un plan completo; un manual de lo que hay que hacer en Oracle; herramientas en Oracle que faciliten crear lecciones; reorganizar y documentar todo; guardar el tablero anterior y crear uno nuevo; y un tag nuevo que marque la reestructuración. Fuente: [propuesta de contenido](../propuestas/2026-10-03_propuesta_contenido_blender.txt).

Defaults elegidos donde el pedido no lo precisaba: ampliación con migraciones aditivas que conservan usuarios y progreso; el tablero v2 se archiva tal cual y se crea uno nuevo; el tag propuesto es `v3.0.0-alpha.1` («Reestructuración»), coherente con la regla MAYOR = cambio de fase; las decisiones de la sección 13 de la propuesta quedan como pendientes, sin inventarlas.

| Entregable | Dónde |
|---|---|
| Plan maestro (fases A–F, riesgos, decisiones pendientes) | [docs/reestructuracion/00_plan_maestro.md](../reestructuracion/00_plan_maestro.md) |
| Modelo de contenido (niveles, ficha, 10 pasos, habilidades, rúbrica, versiones) | [01_modelo_de_contenido.md](../reestructuracion/01_modelo_de_contenido.md) |
| Manual de Oracle (orden, verificación, recetas de autor, problemas) | [02_manual_oracle.md](../reestructuracion/02_manual_oracle.md) |
| Guía del add-on de Blender (arquitectura, código, contrato, pruebas, orden) | [03_addon_blender.md](../reestructuracion/03_addon_blender.md) |
| Script 005 (6 tablas + `MODULOS.NIVEL_ID`) y 006 (vistas + paquete `AMATISTA_AUTOR`) | `backend/sql/` |
| API de niveles, mapa, versiones de Blender y matriz; ficha validada; CLI `nueva-leccion`, `mapa`, `sembrar-niveles` | `backend/` |
| Tablero v2 archivado y tablero v3 nuevo | `tablero/historico/`, `tablero/tareas.yml` |
| `INCIDENCIAS.txt` de la raíz movido a `docs/incidencias/` como INC-010; INC-005/006 marcadas como resueltas (002 corregido ya corre en producción) | `docs/incidencias/` |

**Evidencia:** 236 pruebas del backend en verde (SQLite). En Oracle 23ai (contenedor): base con datos de la v2.2 + 005 + 006 (dos veces) sin perder filas; base vacía 001→006 en una pasada; 004 con `AMATISTA_APP`; el backend de `main` funciona con 005 aplicado; el backend nuevo sirve niveles, mapa, versiones, verificaciones y catálogo; todos los procedimientos del paquete y sus errores. Tres errores de Oracle encontrados y corregidos antes de entregar (INC-011).

## 3. Pendiente

| Quién | Qué |
|---|---|
| Maximiliano | Revisar y confirmar el PR de la reestructuración |
| Maximiliano (VM / Database Actions) | 005 y 006 (se pueden ejecutar ya; no afectan al piloto) → después del piloto, `actualizar.sh` e `importar` (manual, pasos 5–8) |
| Maximiliano (PC) | Tags `v2.2.0-alpha.2` (pendiente de ayer) y `v3.0.0-alpha.1` tras fusionar; borrar `claude/project-thread-bpfcse` |
| Piloto (8 oct) | T-003 servicio, T-005 HTTPS, T-032 SMTP, T-029 prueba de punta a punta, T-030 seguridad: siguen igual en el tablero nuevo |
| Fase B | T-038 versión principal de Blender, T-039 inventario → niveles, T-044 ficha en el editor, T-041 niveles en la PWA |
