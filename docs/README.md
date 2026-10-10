# Documentación de Amatista

Toda la documentación del proyecto, ordenada por secciones. Cada sección dice para quién es y por dónde empezar.

Actualizado: 10 de octubre de 2026 (`main` con los PR #25, #26 y #27 fusionados). Etapa vigente: **v3 «Reestructuración»**, con la integración de la plataforma y Blender en desarrollo.

> **¿Primera vez?** Lee el [README de la raíz](../README.md), luego la [cronología](historia/01_cronologia.md) y el [mapa del repositorio](manual-del-codigo/01_mapa_del_repositorio.md). Si vas a programar, sigue con el [manual del desarrollador](desarrollador/README.md).

## Secciones

| # | Sección | Para quién | Empieza por |
|---|---|---|---|
| 1 | [Historia del proyecto](#1-historia-del-proyecto) | Quien quiere saber cómo llegamos aquí | [Cronología exacta](historia/01_cronologia.md) |
| 2 | [La plataforma](#2-la-plataforma) | Quien diseña cursos o usa la plataforma | [Mapa por rol](plataforma/01_mapa_de_la_plataforma.md) · [Cursos](cursos/README.md) |
| 3 | [Amatista Engine](#3-amatista-engine-y-add-on-de-blender) | Quien crea prácticas de Blender | [Amatista Engine](motor/README.md) |
| 4 | [Manual del código](#4-manual-del-código) | Quien lee o modifica el código | [Mapa del repositorio](manual-del-codigo/01_mapa_del_repositorio.md) |
| 5 | [Manual del desarrollador](#5-manual-del-desarrollador) | Quien programa, prueba y entrega | [Tu primer día](desarrollador/README.md) |
| 6 | [Base de datos](#6-base-de-datos) | Quien toca Oracle o los modelos | [Esquema SQL](base-de-datos/esquema.md) |
| 7 | [Herramientas de la plataforma](#7-herramientas-de-la-plataforma) | Quien quiere saber de qué está hecha | [Herramientas](herramientas-de-la-plataforma.md) |
| 8 | [Operación y despliegue](#8-operación-y-despliegue) | Quien mantiene el servidor | [Plan de despliegue](despliegue/2026-10-05_plan_de_despliegue.md) |
| 9 | [Dirección y decisiones](#9-dirección-y-decisiones) | Quien decide qué sigue | [Plan maestro v3](reestructuracion/00_plan_maestro.md) |
| 10 | [Registros](#10-registros-bitácora-e-incidencias) | Quien busca qué pasó en una sesión o una falla | [Última bitácora](bitacora/2026-10-09_el_ejemplo_manda.md) |

Fuera de `docs/`: [PROYECTO.md](../PROYECTO.md) (prioridades y forma de trabajo), [KANBAN.md](../KANBAN.md) (tablero generado), [CHANGELOG.md](../CHANGELOG.md) (versiones) y los README de cada componente: [frontend](../frontend/README.md), [backend](../backend/README.md), [engine](../engine/README.md), [addon](../addon/README.md), [practices](../practices/README.md), [tablero](../tablero/README.md).

---

## 1. Historia del proyecto

Carpeta [`historia/`](historia/README.md).

- [Cronología exacta](historia/01_cronologia.md): commit por commit, PR por PR, con hora, desde el 27 de septiembre.
- [Ideas y cómo se implementaron](historia/02_ideas_y_como_se_implementaron.md): cada idea, su origen, su estado y dónde quedó en el código.
- [La plataforma en cada versión](historia/03_la_plataforma_en_cada_version.md): cómo se veía y qué hacía Amatista en cada tag, revisando el código de los commits antiguos.
- [Archivo histórico hasta hoy](historia/04_archivo_historico_hasta_hoy.md): resumen general de la evolución, cambios de versión e ideas.

## 2. La plataforma

Carpeta [`plataforma/`](plataforma/README.md): estructura fija Cursos · Mi panel · Admin.

- [Mapa de la plataforma por rol](plataforma/01_mapa_de_la_plataforma.md)
- [Módulos con práctica de Blender al final](plataforma/02_modulos_y_practica.md)
- [Etiquetas y gráficos](plataforma/03_etiquetas_y_graficos.md)
- [Las 20 herramientas de enseñanza](plataforma/04_herramientas_de_ensenanza.md)
- [Panel de administración](plataforma/05_panel_de_administracion.md)
- [Módulo 3 de Blender: modelado con precisión](plataforma/06_modulo_3_modelado_precision.md) (historia: borrador del curso v2)
- [Herramientas gráficas](plataforma/07_herramientas_graficas.md)
- [Auditoría educativa (9 oct)](plataforma/08_auditoria_educativa_2026-10-09.md)

### Cursos

Carpeta [`cursos/`](cursos/README.md): los cuatro cursos de Blender (Principiante, Principiante-Intermedio e Intermedio publicados; Avanzado bloqueado), la [ruta de aprendizaje](cursos/03_ruta_de_aprendizaje_blender.md), cómo el [plan de estudios](cursos/plan_de_estudios_blender.txt) se volvió módulos y prácticas, y cómo agregar uno.

## 3. Amatista Engine y add-on de Blender

Carpeta [`motor/`](motor/README.md).

- Etapas: [1 · evalúa](motor/etapas/etapa-1.md) · [2 · acompaña paso a paso](motor/etapas/etapa-2.md) · [3 · enseña (motor v3, add-on 3.0)](motor/etapas/etapa-3.md) · [3.3 · modelo de referencia](motor/referencia/10_modelo_de_referencia.md) · [3.4 · reconocer figuras](motor/referencia/11_reconocer_figuras.md) · [3.5 · el ejemplo manda](motor/referencia/14_ejemplo_y_revision.md)
- Referencia: [arquitectura](motor/referencia/01_arquitectura.md) · [formato de práctica](motor/referencia/02_formato_de_practica.md) · [add-on](motor/referencia/03_addon.md) · [instalación del alumno](motor/referencia/04_instalacion_alumno.md) · [API](motor/referencia/05_api.md) · [modo desarrollador](motor/referencia/06_modo_desarrollador.md) · [guía y acompañamiento](motor/referencia/07_guia_y_acompanamiento.md) · [prácticas v3 y herramientas de autor](motor/referencia/08_practicas_v3_y_herramientas.md) · [validadores](motor/referencia/09_validadores.md) · [modelo de referencia](motor/referencia/10_modelo_de_referencia.md) · [reconocer figuras](motor/referencia/11_reconocer_figuras.md) · [la plataforma maneja Blender](motor/referencia/12_plataforma_y_blender.md) · [instructor y silueta](motor/referencia/13_instructor_y_silueta.md) · [el ejemplo y la revisión](motor/referencia/14_ejemplo_y_revision.md)
- [Especificaciones originales](motor/especificaciones/) (historia: el concepto antes del código)

## 4. Manual del código

Carpeta [`manual-del-codigo/`](manual-del-codigo/README.md): el código explicado como manual de uso, con recetas para los cambios típicos.

- [01 · Mapa del repositorio](manual-del-codigo/01_mapa_del_repositorio.md)
- [02 · Frontend (PWA)](manual-del-codigo/02_frontend.md)
- [03 · Backend (API)](manual-del-codigo/03_backend.md)
- [04 · Motor, add-on y prácticas](manual-del-codigo/04_motor_addon_y_practicas.md)

## 5. Manual del desarrollador

Carpeta [`desarrollador/`](desarrollador/README.md): todas las herramientas del desarrollador y cómo usarlas.

- [Tu primer día y tabla de todas las herramientas](desarrollador/README.md)
- [01 · Entorno local](desarrollador/01_entorno_local.md)
- [02 · Herramientas de línea de comandos](desarrollador/02_herramientas_de_linea_de_comandos.md)
- [03 · Herramientas dentro de la plataforma](desarrollador/03_herramientas_dentro_de_la_plataforma.md)
- [04 · Pruebas y CI](desarrollador/04_pruebas_y_ci.md)
- [05 · Flujo de trabajo](desarrollador/05_flujo_de_trabajo.md)
- Guías de origen: [convención de commits](guias/2026-09-27_convencion_commits.txt) · [versiones y tablero](guias/2026-10-01_versiones-y-tablero.txt) · [cómo se usa el tablero](../tablero/README.md)

## 6. Base de datos

Carpeta [`base-de-datos/`](base-de-datos/README.md).

- [Resumen y orden de los scripts](base-de-datos/README.md)
- [Esquema SQL completo](base-de-datos/esquema.md): diagrama entidad-relación, cada tabla y columna, vistas, paquete `AMATISTA_AUTOR`
- [Esquema consolidado (solo referencia)](base-de-datos/esquema_completo.sql)
- **Motor v3**: [rediseño y optimización](base-de-datos/01_rediseno_v3.md) · [aplicar 008 y 009](base-de-datos/02_manual_008_009.md) · [migrar a otra base](base-de-datos/03_migracion.md) · [esquema PostgreSQL](base-de-datos/esquema_postgresql.sql)
- Los scripts reales: [`backend/sql/`](../backend/sql/LEEME.txt)

## 7. Herramientas de la plataforma

- [Herramientas que usa la plataforma](herramientas-de-la-plataforma.md): React, Vite, Tailwind, FastAPI, Oracle, Blender, Caddy, GitHub Actions… para qué sirve cada una y dónde está.

## 8. Operación y despliegue

- **[Plan de despliegue (5 de octubre)](despliegue/2026-10-05_plan_de_despliegue.md)**: el orden de trabajo desde hoy hasta HTTPS, por fases y sin tocar la VM antes del piloto.
- [Auditoría de seguridad](seguridad/01_auditoria_2026-10-05.md), [protección del código del add-on](seguridad/02_proteccion_del_codigo.md) e [informe de rendimiento](rendimiento/2026-10-05_informe.md).
- [Dominio amatista-3d.me con Cloudflare](despliegue/2026-10-04_dominio_amatista-3d.md): DNS, certificados, PWA en Pages, API detrás del proxy y apéndice Fly.io. Registro de la compra: [dominio y SSL](despliegue/2026-10-04_dominio_y_dns-v2.md).
- [Despliegue en OCI](despliegue/2026-10-04_despliegue_oci.md): VM, servicio systemd, HTTPS con Caddy, PWA, SMTP y actualizaciones.
- [Oracle paso a paso (002–004)](despliegue/2026-10-02_oracle_paso_a_paso.md) y [manual de Oracle (005–007)](reestructuracion/02_manual_oracle.md); [aplicar 008 y 009](base-de-datos/02_manual_008_009.md), 010 y 011 ([correcciones 3.5.1](despliegue/2026-10-09_correcciones_3_5_1.md); orden en [`backend/sql/LEEME.txt`](../backend/sql/LEEME.txt))
- Archivos: [`despliegue/`](../despliegue/)

## 9. Dirección y decisiones

- **Plan vigente**: [reestructuración v3](reestructuracion/README.md): [plan maestro](reestructuracion/00_plan_maestro.md) · [modelo de contenido](reestructuracion/01_modelo_de_contenido.md) · [manual de Oracle](reestructuracion/02_manual_oracle.md) · [diseño del add-on](reestructuracion/03_addon_blender.md) (historia)
- **Lanzamiento**: [plan de lanzamiento](planeacion/2026-10-01_plan_lanzamiento.txt) (piloto 8 oct, beta 15 oct)
- **Arquitectura** (decisiones fechadas): [general](arquitectura/2026-09-27_arquitectura_general.txt) · [backend y BD](arquitectura/2026-09-27_backend_y_base_de_datos.txt) · [recomendaciones](arquitectura/2026-09-27_recomendaciones_arquitectura.txt) · [mapa conceptual](arquitectura/2026-09-27_mindmap.png) · [identidad visual](arquitectura/2026-09-28_identidad_visual_interfaz.txt) · [formato de lecciones](arquitectura/2026-09-29_formato-lecciones.txt) · [optimización de BD y autenticación](arquitectura/2026-10-01_optimizacion_bd_autenticacion_y_escalabilidad.txt) · [contrato técnico v2.2](arquitectura/2026-10-02_contrato_tecnico_plataforma.md) · [la Fórmula Amatista](arquitectura/2026-10-02_formula_modulos.txt)
- **Investigación y propuesta del add-on de enseñanza**: [Amatista Taller](investigacion/2026-10-10_addon_de_ensenanza/README.md) (2026-10-10: cómo enseñan otros add-ons, auditoría de las 18 prácticas, datos y simulación)
- **Propuestas** (no son compromisos): [contenido por niveles](propuestas/2026-10-03_propuesta_contenido_blender.txt) · [3D Lab](propuestas/2026-09-27_amatista_3d_lab.txt) · [motor generativo 3D](propuestas/2026-09-27_motor_generativo_3d.txt)

## 10. Registros: bitácora e incidencias

- **Bitácora** ([`bitacora/`](bitacora/)), de la más reciente a la más antigua:
  - 10 oct: [renovación del repositorio](bitacora/2026-10-10_renovacion_del_repositorio.md)
  - 9 oct: [la plataforma maneja Blender (motor 3.4)](bitacora/2026-10-09_plataforma_y_blender_integrados.md) · [Blender como instructor (motor 3.5)](bitacora/2026-10-09_blender_como_instructor.md) · [el ejemplo manda (motor 3.5)](bitacora/2026-10-09_el_ejemplo_manda.md)
  - 5 oct: [seguridad, rendimiento y Motor 3.3](bitacora/2026-10-05_seguridad_rendimiento_motor.md) · [temáticas y Motor 3.2](bitacora/2026-10-05_temas_y_motor_3_2.md)
  - 4 oct: [motor v3, plan de estudios, base de datos y dominio](bitacora/2026-10-04_motor_v3_plan_de_estudios.md) · [curso de Blender unificado y ruta de aprendizaje](bitacora/2026-10-04_curso_unificado.md) · [documentación completa](bitacora/2026-10-04_documentacion_completa.md) · [motor etapa 2 y plataforma por módulos](bitacora/2026-10-04_motor_etapa_2_y_plataforma.md) · [Amatista Engine](bitacora/2026-10-04_amatista_engine.md)
  - 3 oct: [estado y reestructuración](bitacora/2026-10-03_estado_y_reestructuracion.md) · [bitácora técnica del servidor](bitacora/2026-10-03_bitacora_tecnica_v3_servidor.md)
  - 2 oct: [cierre del día](bitacora/2026-10-02_cierre_del_dia.txt) · [ramas y cronología](bitacora/2026-10-02_ramas_y_cronologia.txt) · [estado de la plataforma unificada](bitacora/2026-10-02_estado_plataforma_unificada.txt)
  - 29 sep: [lecciones y progreso](bitacora/2026-09-29_lecciones-y-progreso.txt)
  - 27 sep: [investigación y desarrollo](bitacora/2026-09-27_investigacion_desarrollo.txt) · [reporte App Shell](bitacora/2026-09-27_reporte_app_shell.txt) · [resumen inicial](bitacora/2026-09-27_resumen.txt)
- **Incidencias**: [registro de incidencias](incidencias/README.md) (índice de INC-001 en adelante, con cada archivo).

---

## Estado de cada documento

**Vigente**: describe lo que hay hoy y se mantiene al día. **Historia**: registro fechado que no se corrige; la última columna dice dónde está lo actual.

| Documento | Estado | Dónde está lo actual |
|---|---|---|
| `historia/`, `manual-del-codigo/`, `desarrollador/`, `base-de-datos/`, `herramientas-de-la-plataforma.md` | Vigente (nuevos el 4 oct) | — |
| `despliegue/2026-10-04_despliegue_oci.md` | Vigente (nuevo el 4 oct; cierra la parte de despliegue de T-031) | — |
| `plataforma/` (01 a 05 y 07) | Vigente | — |
| `plataforma/06_modulo_3_modelado_precision.md` | Historia: borrador del módulo 3 de la v2 | `cursos/` |
| `motor/` (etapas 1 a 3 y referencia 01 a 14) | Vigente | — |
| `cursos/` (cursos y plan de estudios de Blender) | Vigente (nuevo el 4 oct) | — |
| `motor/especificaciones/` | Historia: el concepto original del motor | `motor/referencia/` |
| `reestructuracion/00_plan_maestro.md` | Vigente (tabla «Dónde estamos» al 9 oct) | — |
| `reestructuracion/01_modelo_de_contenido.md` | Vigente: fase B, sin empezar | — |
| `reestructuracion/02_manual_oracle.md` | Vigente (estado de producción al 4 oct; §10 para 007) | — |
| `reestructuracion/03_addon_blender.md` | Historia: diseño previo al código | `motor/` |
| `arquitectura/2026-09-29_formato-lecciones.txt` | Vigente con nota del 4 oct | Bloques nuevos en `plataforma/04` |
| `arquitectura/2026-10-02_formula_modulos.txt` | Vigente con nota del 4 oct | Práctica al final en `plataforma/02` |
| `arquitectura/2026-10-02_contrato_tecnico_plataforma.md` | Vigente para la v2.2, con nota | `manual-del-codigo/03_backend.md` |
| `arquitectura/2026-09-27_*` y `2026-09-28_*` | Historia: arquitectura inicial e identidad visual | `README.md` de la raíz, `herramientas-de-la-plataforma.md` y `plataforma/03` |
| `arquitectura/2026-10-01_optimizacion_*` | Historia: diseño de 002 a 004 | `base-de-datos/` |
| `despliegue/2026-10-02_oracle_paso_a_paso.md` | Vigente para 002 a 004 | `reestructuracion/02_manual_oracle.md` para 005 a 007 |
| `planeacion/2026-10-01_plan_lanzamiento.txt` | Vigente: piloto del 8 oct y beta | Tareas en el tablero (versión `v2.2.0`) |
| `guias/` | Vigente; resumidas en `desarrollador/05` | — |
| `propuestas/` | Propuestas: no son compromisos | Estado de cada idea en `historia/02` |
| `bitacora/` e `incidencias/` | Historia | El último registro arriba |

## Reglas de la documentación

- Los documentos fechados se nombran `AAAA-MM-DD_tema` y no se corrigen: cuando algo cambia se escribe uno nuevo o se actualiza el documento vigente de su sección.
- Los documentos vigentes llevan «Actualizado: fecha (main en commit)» al inicio.
- Cada sección tiene su `README.md` con el índice; este archivo los reúne.
- Las rutas `docs/...` aparecen en comentarios del código (panel de administración, add-on, scripts SQL): **no se mueven carpetas existentes** sin actualizar esas referencias en el mismo PR.
- Un cambio que hace falso un documento lo corrige en el mismo PR.
