# Documentación de Amatista

Todos los documentos llevan su fecha de creación al inicio del nombre (`AAAA-MM-DD_tema.txt`),
así se ordenan solos dentro de cada carpeta. Los reportes fechados son historia: cuando cambia una
decisión se escribe un documento nuevo o se actualiza el de arquitectura correspondiente.

| Carpeta | Qué contiene | Empieza por |
|---|---|---|
| [`arquitectura/`](arquitectura/) | Decisiones técnicas vigentes: arquitectura, base de datos, formato de lecciones, la Fórmula, contrato técnico | [Contrato técnico v2.2](arquitectura/2026-10-02_contrato_tecnico_plataforma.md) |
| [`bitacora/`](bitacora/) | Qué pasó en cada sesión de trabajo y qué sigue | [Cierre del 2 de octubre](bitacora/2026-10-02_cierre_del_dia.txt) |
| [`incidencias/`](incidencias/) | Fallas diagnosticadas, su causa y su solución | [Registro de incidencias](incidencias/README.md) |
| [`planeacion/`](planeacion/) | Planes de lanzamiento y fechas | [Plan de lanzamiento](planeacion/2026-10-01_plan_lanzamiento.txt) |
| [`propuestas/`](propuestas/) | Ampliaciones futuras (3D Lab, motor generativo) | [Amatista 3D Lab](propuestas/2026-09-27_amatista_3d_lab.txt) |
| [`guias/`](guias/) | Cómo se trabaja en el repo: commits, versiones y tablero | [Convención de commits](guias/2026-09-27_convencion_commits.txt) |
| `despliegue/` | Guías para dejar el servidor listo (llega con el PR #9; falta la guía de OCI, T-031) | `2026-10-02_oracle_paso_a_paso.md` |

## Arquitectura

- [Arquitectura general](arquitectura/2026-09-27_arquitectura_general.txt)
- [Backend y base de datos](arquitectura/2026-09-27_backend_y_base_de_datos.txt)
- [Recomendaciones de arquitectura](arquitectura/2026-09-27_recomendaciones_arquitectura.txt)
- [Mapa conceptual](arquitectura/2026-09-27_mindmap.png)
- [Identidad visual](arquitectura/2026-09-28_identidad_visual_interfaz.txt)
- [Formato de lecciones](arquitectura/2026-09-29_formato-lecciones.txt)
- [Optimización de BD, autenticación y escalabilidad](arquitectura/2026-10-01_optimizacion_bd_autenticacion_y_escalabilidad.txt)
- [Contrato técnico de la plataforma unificada](arquitectura/2026-10-02_contrato_tecnico_plataforma.md)
- [La Fórmula Amatista](arquitectura/2026-10-02_formula_modulos.txt)

Faltan (tarea T-031): base de datos optimizada, autenticación y roles, panel y administración, y la guía de despliegue en OCI.
Mientras tanto: `backend/sql/LEEME.txt`, el encabezado de `backend/sql/002_*.sql` y el contrato técnico.

## Bitácora

- [Investigación y desarrollo](bitacora/2026-09-27_investigacion_desarrollo.txt) · [Reporte App Shell](bitacora/2026-09-27_reporte_app_shell.txt) · [Resumen inicial](bitacora/2026-09-27_resumen.txt)
- [Lecciones y progreso](bitacora/2026-09-29_lecciones-y-progreso.txt)
- [Estado de la plataforma unificada](bitacora/2026-10-02_estado_plataforma_unificada.txt)
- [Cierre del 2 de octubre](bitacora/2026-10-02_cierre_del_dia.txt)

## Guías del repositorio

- [Convención de commits](guias/2026-09-27_convencion_commits.txt)
- [Versiones (tags) y tablero Kanban](guias/2026-10-01_versiones-y-tablero.txt)
- [Cómo se usa el tablero](../tablero/README.md)
