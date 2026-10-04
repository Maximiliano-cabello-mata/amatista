# Documentación de Amatista

Todos los documentos llevan su fecha de creación al inicio del nombre (`AAAA-MM-DD_tema.txt`),
así se ordenan solos dentro de cada carpeta. Los reportes fechados son historia: cuando cambia una
decisión se escribe un documento nuevo o se actualiza el de arquitectura correspondiente.

**Etapa vigente: v3 «Reestructuración».** Empieza por [`reestructuracion/`](reestructuracion/README.md): plan maestro, modelo de
contenido por niveles, manual de Oracle y guía del add-on de Blender.

| Carpeta | Qué contiene | Empieza por |
|---|---|---|
| [`plataforma/`](plataforma/) | La plataforma v3.1: qué ve cada rol, módulos con práctica en Blender, etiquetas, herramientas de enseñanza y panel de administración | [Plataforma](plataforma/README.md) |
| [`motor/`](motor/) | Amatista Engine: etapas (1 evalúa, 2 acompaña) y referencia técnica del motor y el add-on | [Amatista Engine](motor/README.md) |
| [`reestructuracion/`](reestructuracion/) | La etapa v3: niveles, versiones de Blender, habilidades, herramientas de autor y add-on | [Plan maestro](reestructuracion/00_plan_maestro.md) |
| [`arquitectura/`](arquitectura/) | Decisiones técnicas vigentes: arquitectura, base de datos, formato de lecciones, la Fórmula, contrato técnico | [Contrato técnico v2.2](arquitectura/2026-10-02_contrato_tecnico_plataforma.md) |
| [`bitacora/`](bitacora/) | Qué pasó en cada sesión de trabajo y qué sigue | [4 de octubre: motor etapa 2 y plataforma](bitacora/2026-10-04_motor_etapa_2_y_plataforma.md) |
| [`incidencias/`](incidencias/) | Fallas diagnosticadas, su causa y su solución | [Registro de incidencias](incidencias/README.md) |
| [`planeacion/`](planeacion/) | Planes de lanzamiento y fechas | [Plan de lanzamiento](planeacion/2026-10-01_plan_lanzamiento.txt) |
| [`propuestas/`](propuestas/) | Propuestas y ampliaciones (contenido por niveles, 3D Lab, motor generativo) | [Propuesta de contenido y ruta de Blender](propuestas/2026-10-03_propuesta_contenido_blender.txt) |
| [`guias/`](guias/) | Cómo se trabaja en el repo: commits, versiones y tablero | [Convención de commits](guias/2026-09-27_convencion_commits.txt) |
| [`despliegue/`](despliegue/) | Guías para dejar el servidor listo (falta la guía de OCI, T-031) | [Oracle paso a paso (v2.2)](despliegue/2026-10-02_oracle_paso_a_paso.md); para la v3, el [manual de Oracle](reestructuracion/02_manual_oracle.md) |

## Estado de cada documento (revisión del 4 de octubre de 2026)

Se revisaron uno por uno. **Vigente**: describe lo que hay hoy y se mantiene al día. **Historia**: registro fechado que no se corrige; la última columna dice dónde está lo actual.

| Documento | Estado | Dónde está lo actual |
|---|---|---|
| `plataforma/` (01 a 05) | Vigente | — |
| `motor/` (etapas y referencia 01 a 07) | Vigente | — |
| `motor/especificaciones/` | Historia: el concepto original del motor | `motor/referencia/` |
| `reestructuracion/00_plan_maestro.md` | Vigente (tabla «Dónde estamos» al 4 oct) | — |
| `reestructuracion/01_modelo_de_contenido.md` | Vigente: fase B, sin empezar | — |
| `reestructuracion/02_manual_oracle.md` | Vigente (estado de producción al 4 oct; §10 para 007) | — |
| `reestructuracion/03_addon_blender.md` | Historia: diseño previo al código | `motor/` |
| `arquitectura/2026-09-29_formato-lecciones.txt` | Vigente con nota del 4 oct | Bloques nuevos en `plataforma/04` |
| `arquitectura/2026-10-02_formula_modulos.txt` | Vigente con nota del 4 oct | Práctica al final en `plataforma/02` |
| `arquitectura/2026-10-02_contrato_tecnico_plataforma.md` | Vigente para la v2.2, con nota | `reestructuracion/` y `motor/` para lo posterior |
| `arquitectura/2026-09-27_*` y `2026-09-28_*` | Historia: arquitectura inicial e identidad visual | `README.md` de la raíz y `plataforma/03` |
| `arquitectura/2026-10-01_optimizacion_*` | Historia: diseño de 002 a 004 | `backend/sql/LEEME.txt` |
| `despliegue/2026-10-02_oracle_paso_a_paso.md` | Vigente para 002 a 004 | `reestructuracion/02_manual_oracle.md` para 005 a 007 |
| `planeacion/2026-10-01_plan_lanzamiento.txt` | Vigente: piloto del 8 oct y beta | Tareas en el tablero (versión `v2.2.0`) |
| `guias/` | Vigente | — |
| `propuestas/` | Propuestas: no son compromisos | La de niveles ya entró al plan maestro |
| `bitacora/` e `incidencias/` | Historia | El último registro arriba |

## Reestructuración (v3, vigente)

- [Plan maestro](reestructuracion/00_plan_maestro.md)
- [Modelo de contenido](reestructuracion/01_modelo_de_contenido.md)
- [Manual de Oracle](reestructuracion/02_manual_oracle.md)
- [Add-on de Blender](reestructuracion/03_addon_blender.md)
- [Propuesta de contenido (fuente)](propuestas/2026-10-03_propuesta_contenido_blender.txt)

## Plataforma y motor (v3.1)

- [Plataforma](plataforma/README.md): [mapa por rol](plataforma/01_mapa_de_la_plataforma.md) · [módulos con práctica en Blender](plataforma/02_modulos_y_practica.md) · [etiquetas y gráficos](plataforma/03_etiquetas_y_graficos.md) · [herramientas de enseñanza](plataforma/04_herramientas_de_ensenanza.md) · [panel de administración](plataforma/05_panel_de_administracion.md)
- [Amatista Engine](motor/README.md): [etapa 1](motor/etapas/etapa-1.md) · [etapa 2](motor/etapas/etapa-2.md) · [guía y acompañamiento](motor/referencia/07_guia_y_acompanamiento.md)

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
- [Cierre del 2 de octubre](bitacora/2026-10-02_cierre_del_dia.txt) · [Ramas y cronología](bitacora/2026-10-02_ramas_y_cronologia.txt)
- [3 de octubre: todo lo realizado y arranque de la reestructuración](bitacora/2026-10-03_estado_y_reestructuracion.md) · [Bitácora técnica del servidor](bitacora/2026-10-03_bitacora_tecnica_v3_servidor.md)
- [4 de octubre: Amatista Engine](bitacora/2026-10-04_amatista_engine.md) · [Motor etapa 2 y plataforma por módulos](bitacora/2026-10-04_motor_etapa_2_y_plataforma.md)

## Guías del repositorio

- [Convención de commits](guias/2026-09-27_convencion_commits.txt)
- [Versiones (tags) y tablero Kanban](guias/2026-10-01_versiones-y-tablero.txt)
- [Cómo se usa el tablero](../tablero/README.md) · [Tableros archivados](../tablero/historico/)
