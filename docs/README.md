# Documentación de Amatista

**Plataforma pública:** [https://amatista-3d.tech](https://amatista-3d.tech) · **API:** [https://api.amatista-3d.tech](https://api.amatista-3d.tech) · **[Despliegue vigente documentado (Workers + OCI)](despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md)**. El despliegue del antiguo dominio `.me` y la propuesta de Pages son históricos.

Toda la documentación del proyecto, ordenada por secciones. Cada sección dice para quién es y por dónde empezar.

Estado del código: **2 de noviembre de 2026** (`main` en `99d6ea2`). Etapa vigente: **v3 «Reestructuración» y Centro 3D (v3.5.0)**, con **Corazón Amatista 1.0**, **Amatista Motor 7.1 «Guion»**, Goliat, avatares y buzón (`sql/013`), sincronización para escuelas con pocos datos, Sentry opcional y diseño «Facetas» 4.1 en el código.

> **¿Primera vez?** Lee el [README de la raíz](../README.md), luego la [cronología](historia/01_cronologia.md) y el [mapa del repositorio](manual-del-codigo/01_mapa_del_repositorio.md). Si vas a programar, sigue con el [manual del desarrollador](desarrollador/README.md).

## Secciones

| # | Sección | Para quién | Empieza por |
|---|---|---|---|
| 1 | [Historia del proyecto](#1-historia-del-proyecto) | Quien quiere saber cómo llegamos aquí | [Cronología exacta](historia/01_cronologia.md) |
| 2 | [La plataforma](#2-la-plataforma) | Quien diseña cursos o usa la plataforma | [Mapa por rol](plataforma/01_mapa_de_la_plataforma.md) · [Cursos](cursos/README.md) |
| 3 | [Amatista Engine](#3-amatista-engine-y-add-on-de-blender) | Quien crea prácticas de Blender o ramas del Corazón | [Corazón Amatista](motor/referencia/23_corazon.md) · [Amatista Engine](motor/README.md) |
| 4 | [Manual del código](#4-manual-del-código) | Quien lee o modifica el código | [Mapa del repositorio](manual-del-codigo/01_mapa_del_repositorio.md) |
| 5 | [Manual del desarrollador](#5-manual-del-desarrollador) | Quien programa, prueba y entrega | [Tu primer día](desarrollador/README.md) |
| 6 | [Base de datos](#6-base-de-datos) | Quien toca Oracle o los modelos | [Esquema SQL](base-de-datos/esquema.md) |
| 7 | [Herramientas de la plataforma](#7-herramientas-de-la-plataforma) | Quien quiere saber de qué está hecha | [Herramientas](herramientas-de-la-plataforma.md) |
| 8 | [Operación y despliegue](#8-operación-y-despliegue) | Quien mantiene el servidor | [Despliegue público .tech](despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md) |
| 9 | [Dirección y decisiones](#9-dirección-y-decisiones) | Quien decide qué sigue | [Centro 3D y G7B](propuestas/2026-11-01_centro_3d_y_g7b.md) · [Plan maestro v3](reestructuracion/00_plan_maestro.md) |
| 10 | [Registros](#10-registros-bitácora-e-incidencias) | Quien busca qué pasó en una sesión o una falla | [Última bitácora (1 nov)](bitacora/2026-11-01_g7b_y_centro_3d.md) |

Fuera de `docs/`: [PROYECTO.md](../PROYECTO.md) (prioridades y forma de trabajo), [KANBAN.md](../KANBAN.md) (tablero generado), [CHANGELOG.md](../CHANGELOG.md) (versiones) y los README de cada componente: [frontend](../frontend/README.md), [backend](../backend/README.md), [engine](../engine/README.md), [addon](../addon/README.md), [practices](../practices/README.md), [tablero](../tablero/README.md).

## 1. Historia del proyecto

Carpeta [`historia/`](historia/README.md).

- [Cronología exacta](historia/01_cronologia.md): commit por commit, PR por PR, con hora, desde el 27 de septiembre.
- [Ideas y cómo se implementaron](historia/02_ideas_y_como_se_implementaron.md): cada idea, su origen, su estado y dónde quedó en el código.
- [La plataforma en cada versión](historia/03_la_plataforma_en_cada_version.md): cómo se veía y qué hacía Amatista en cada tag.
- [Archivo histórico hasta hoy](historia/04_archivo_historico_hasta_hoy.md): resumen general de la evolución, cambios de versión e ideas.

## 2. La plataforma

Carpeta [`plataforma/`](plataforma/README.md).

- [Mapa de la plataforma por rol](plataforma/01_mapa_de_la_plataforma.md)
- [Módulos con práctica de Blender al final](plataforma/02_modulos_y_practica.md)
- [Etiquetas y gráficos](plataforma/03_etiquetas_y_graficos.md)
- [Las herramientas de enseñanza](plataforma/04_herramientas_de_ensenanza.md)
- [Panel de administración](plataforma/05_panel_de_administracion.md)
- [Módulo 3 de Blender: modelado con precisión](plataforma/06_modulo_3_modelado_precision.md) (historia: borrador del curso v2)
- [Herramientas gráficas](plataforma/07_herramientas_graficas.md)
- [Auditoría educativa (9 oct)](plataforma/08_auditoria_educativa_2026-10-09.md)
- [Guía, vista de alumno y auditoría (10 oct)](plataforma/09_guia_vista_y_auditoria.md)
- [Primeros pasos y recursos gráficos (11 oct)](plataforma/10_primeros_pasos_y_recursos.md)
- [Recorrido guiado, página Blender y «Conoce Amatista Motor» (11 oct)](plataforma/11_recorrido_y_fusion.md)
- [Plataforma multiplataforma y accesible: Estudio A-Frame (21 oct)](plataforma/12_multiplataforma_y_accesible.md)
- [Camino guiado, recursos gráficos v4.2 y Motor Web (23 oct)](plataforma/13_camino_graficos_y_motor_web.md)
- [Refinamiento, botones Facetas 4.1 y dinámicas v4.3 (30 oct)](plataforma/14_refinamiento_y_dinamicas.md)
- [Goliat, el compañero de Amatista (30 oct)](plataforma/15_goliat.md)
- [Interfaz libre, avatares y buzón del creador (30 oct)](plataforma/16_avatares_y_buzon.md)
- [PWA para escuelas con pocos datos (31 oct)](plataforma/17_pocos_datos.md)
- [Diseño «Facetas» (CSS v4.0)](diseno/2026-10-11_sistema_facetas.md)
- [Auditoría completa del 11 de octubre](auditoria/2026-10-11_auditoria_completa.md)

### Cursos

Carpeta [`cursos/`](cursos/README.md): los cuatro cursos de Blender (Principiante, Principiante-Intermedio e Intermedio publicados; Avanzado bloqueado), la [ruta de aprendizaje](cursos/03_ruta_de_aprendizaje_blender.md) y cómo el [plan de estudios](cursos/plan_de_estudios_blender.txt) se volvió módulos y prácticas.

## 3. Amatista Engine y add-on de Blender

Carpeta [`motor/`](motor/README.md).

- **[El Corazón Amatista: el motor estable con adaptadores, extensiones y ramas](motor/referencia/23_corazon.md)** (vigente, 7.1) · **[Amatista Motor 7 «Guion»](motor/referencia/22_motor_7.md)** · [Amatista Motor 6.2: acompañar según el ánimo, volver a tu práctica e instaladores .exe/.deb](motor/referencia/21_motor_6_2.md) · [Amatista Motor 6.1: Blender como extensión de la plataforma y fichas](motor/referencia/20_motor_6_1.md) · [Amatista Motor 6 y Blender Amatista](motor/referencia/19_motor_6.md) · [Amatista dentro de Blender (add-on 5.4)](motor/referencia/18_amatista_dentro_de_blender.md) · [Primeros pasos en Blender](motor/referencia/17_primeros_pasos_en_blender.md) · [Amatista Taller (motor 5)](motor/referencia/16_amatista_taller.md) · [experiencia del alumno (motor 4)](motor/referencia/15_experiencia_del_alumno.md).
- Etapas iniciales: [1 · evalúa](motor/etapas/etapa-1.md) · [2 · acompaña paso a paso](motor/etapas/etapa-2.md) · [3 · enseña (motor v3)](motor/etapas/etapa-3.md) · [3.3 · modelo de referencia](motor/referencia/10_modelo_de_referencia.md) · [3.4 · reconocer figuras](motor/referencia/11_reconocer_figuras.md) · [3.5 · el ejemplo manda](motor/referencia/14_ejemplo_y_revision.md).
- Referencia base: [arquitectura](motor/referencia/01_arquitectura.md) · [formato de práctica](motor/referencia/02_formato_de_practica.md) · [add-on](motor/referencia/03_addon.md) · [instalación del alumno](motor/referencia/04_instalacion_alumno.md) · [API](motor/referencia/05_api.md) · [modo desarrollador](motor/referencia/06_modo_desarrollador.md) · [guía y acompañamiento](motor/referencia/07_guia_y_acompanamiento.md) · [prácticas v3 y herramientas de autor](motor/referencia/08_practicas_v3_y_herramientas.md) · [validadores](motor/referencia/09_validadores.md) · [la plataforma maneja Blender](motor/referencia/12_plataforma_y_blender.md) · [instructor y silueta](motor/referencia/13_instructor_y_silueta.md).

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
- [Esquema SQL completo](base-de-datos/esquema.md): diagrama entidad-relación, tablas, vistas y paquete `AMATISTA_AUTOR`
- [Esquema consolidado (solo referencia)](base-de-datos/esquema_completo.sql)
- **Motor v3 y portabilidad**: [rediseño y optimización](base-de-datos/01_rediseno_v3.md) · [aplicar 008 y 009](base-de-datos/02_manual_008_009.md) · [migrar a otra base](base-de-datos/03_migracion.md) · [esquema PostgreSQL](base-de-datos/esquema_postgresql.sql)
- Los scripts reales (`001` a `013`, 24 tablas): [`backend/sql/LEEME.txt`](../backend/sql/LEEME.txt)

## 7. Herramientas de la plataforma

- [Herramientas que usa la plataforma](herramientas-de-la-plataforma.md): React, Vite, Tailwind, FastAPI, Oracle, Blender, Caddy, Cloudflare Workers, GitHub Actions… para qué sirve cada una y dónde está.

## 8. Operación y despliegue

- **[Sentry opcional (31 oct)](despliegue/2026-10-31_sentry.md)** (T-184/T-185) · **[Motor 7 «Guion» (31 oct)](despliegue/2026-10-31_motor_7.md)** (T-179) · **[Motor 6.2 e instaladores firmados (31 oct)](despliegue/2026-10-31_motor_6_2.md)** (T-175).
- **[Motor 6.1 (30 oct)](despliegue/2026-10-30_motor_6_1.md)** (T-145) · **[Motor 6 y Blender Amatista (30 oct)](despliegue/2026-10-30_motor_6.md)** (T-141) · **[Refinamiento y Motor 5.4 (30 oct)](despliegue/2026-10-30_refinamiento_motor_5_4.md)** (T-136).
- **[Despliegue público realizado en `amatista-3d.tech` (29 oct)](despliegue/2026-10-29_despliegue_publico_amatista_3d_tech.md)** y **[Cloudflare Workers Builds](despliegue/2026-10-29_cloudflare_workers_builds.md)**.
- [Camino guiado y Motor Web (23 oct)](despliegue/2026-10-23_camino_y_motor_web.md) · [Plataforma multiplataforma (21 oct)](despliegue/2026-10-21_multiplataforma.md) · [Auditoría, Motor 5.2 y Facetas (11 oct)](despliegue/2026-10-11_auditoria_y_motor_5_2.md) · [Amatista Taller y SQL 012 (10 oct)](despliegue/2026-10-10_amatista_taller_motor_5.md).
- [Plan de despliegue general (5 oct)](despliegue/2026-10-05_plan_de_despliegue.md) · [Auditoría de seguridad](seguridad/01_auditoria_2026-10-05.md) · [Protección del código del add-on](seguridad/02_proteccion_del_codigo.md) · [Informe de rendimiento](rendimiento/2026-10-05_informe.md).
- [Despliegue en OCI](despliegue/2026-10-04_despliegue_oci.md) · [Oracle paso a paso (002–004)](despliegue/2026-10-02_oracle_paso_a_paso.md) · [Manual de Oracle (005–007)](reestructuracion/02_manual_oracle.md).

## 9. Dirección y decisiones

- **Centro 3D y G7B (v3.5.0)**: [propuesta del Centro 3D y proyecto de estadía con G7B](propuestas/2026-11-01_centro_3d_y_g7b.md).
- **Plan de reestructuración v3**: [reestructuración v3](reestructuracion/README.md) ([plan maestro](reestructuracion/00_plan_maestro.md) · [modelo de contenido](reestructuracion/01_modelo_de_contenido.md) · [manual de Oracle](reestructuracion/02_manual_oracle.md)).
- **Investigación del add-on de enseñanza**: [Amatista Taller](investigacion/2026-10-10_addon_de_ensenanza/README.md).
- **Arquitectura**: [general](arquitectura/2026-09-27_arquitectura_general.txt) · [backend y BD](arquitectura/2026-09-27_backend_y_base_de_datos.txt) · [identidad visual](arquitectura/2026-09-28_identidad_visual_interfaz.txt) · [formato de lecciones](arquitectura/2026-09-29_formato-lecciones.txt) · [contrato técnico v2.2](arquitectura/2026-10-02_contrato_tecnico_plataforma.md) · [la Fórmula Amatista](arquitectura/2026-10-02_formula_modulos.txt).

## 10. Registros: bitácora e incidencias

- **Bitácora** ([`bitacora/`](bitacora/)), de la más reciente a la más antigua:
  - 1 nov: [G7B y Amatista como centro 3D](bitacora/2026-11-01_g7b_y_centro_3d.md)
  - 31 oct: [El Corazón Amatista](bitacora/2026-10-31_corazon_amatista.md) · [Amatista Motor 7 «Guion»](bitacora/2026-10-31_motor_7_guion.md) · [Amatista Motor 6.2: acompañar e instaladores](bitacora/2026-10-31_motor_6_2_acompanar_e_instaladores.md)
  - 30 oct: [Avatares y buzón del creador](bitacora/2026-10-30_avatares_y_buzon.md) · [Goliat](bitacora/2026-10-30_goliat.md) · [Motor 6.1: fichas y Blender que sigue a la plataforma](bitacora/2026-10-30_motor_6_1_fichas.md) · [Motor 6 y Blender Amatista](bitacora/2026-10-30_motor_6_blender_amatista.md) · [Refinamiento y Motor 5.4](bitacora/2026-10-30_refinamiento_y_motor_5_4.md)
  - 23 oct: [Camino guiado, gráficos y Motor Web](bitacora/2026-10-23_camino_graficos_y_motor_web.md)
  - 21 oct: [Plataforma multiplataforma](bitacora/2026-10-21_plataforma_multiplataforma.md)
  - 18 oct: [Revisión documental del PR #36](bitacora/2026-10-18_revision_documental_pr_36.md)
  - 11 oct: [Auditoría, orden y fusión del PR #35](bitacora/2026-10-11_auditoria_y_orden.md) · [Primeros pasos y recursos](bitacora/2026-10-11_primeros_pasos_y_recursos.md)
  - 10 oct: [Renovación del repositorio](bitacora/2026-10-10_renovacion_del_repositorio.md) · [Amatista Taller Motor 5](bitacora/2026-10-10_amatista_taller_motor_5.md) · [Guía de alumnos y vista admin](bitacora/2026-10-10_guia_alumnos_y_vista_admin.md) · [Herramientas gráficas](bitacora/2026-10-10_herramientas_graficas.md)
  - 27 sep a 9 oct: registros fundacionales en [`bitacora/`](bitacora/).
- **Incidencias**: [registro de incidencias](incidencias/README.md) (índice de INC-001 en adelante).
