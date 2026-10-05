# Historia del proyecto

Cómo llegó Amatista hasta aquí: cuándo pasó cada cosa, de dónde salió cada idea y cómo se veía la plataforma en cada versión. Para quien quiera entender el proyecto completo o retomar una decisión antigua.

Actualizado: 5 de octubre de 2026 (main en `34ed82d`).

| # | Documento | Qué responde |
|---|---|---|
| 01 | [Cronología exacta](01_cronologia.md) | Qué se hizo, cuándo, quién y en qué orden: commit por commit, PR por PR, con hora |
| 02 | [Ideas y cómo se implementaron](02_ideas_y_como_se_implementaron.md) | Todas las ideas que surgieron, de dónde salieron, si se hicieron, cómo y qué falta |
| 03 | [La plataforma en cada versión](03_la_plataforma_en_cada_version.md) | Revisión del código de los commits antiguos: qué pantallas, funciones, datos y herramientas había en cada versión |
| 04 | [Archivo histórico hasta hoy](04_archivo_historico_hasta_hoy.md) | Resumen ejecutivo: qué es hoy la plataforma, cuántas veces cambió y cuántas ideas surgieron |

## Las etapas en una línea

| Etapa | Fechas | Qué cambió | Tag |
|---|---|---|---|
| Prototipo | 27 sep | Monorepo, App Shell y visor A-Frame | `v0.1.0` |
| Integración | 27–28 sep | React → FastAPI → Oracle | `v1.0.0` |
| Plataforma educativa | 28–29 sep | Identidad low poly, Módulo 1, progreso offline, backend en el repo | `v2.0.0` |
| Repositorio oficial | 1 oct | Firma SSH y repo `Maximiliano-cabello-mata/amatista` | `v2.0.1` |
| Plataforma unificada | 1–2 oct | Cuentas, roles, Oracle 20 GB, lecciones interactivas, paneles, CI, tablero | `v2.2.0-alpha.1`, `alpha.2` |
| Reestructuración | 3 oct | Niveles, habilidades, versiones de Blender, herramientas de autor | `v3.0.0-alpha.1` |
| Amatista Engine | 3 oct | Motor de prácticas, add-on de Blender, Oracle 007 | `v3.0.0-alpha.2` |
| Motor etapa 2 y módulos | 3 oct | Guía paso a paso, práctica al cierre de cada módulo, navegación fija | `v3.0.0-alpha.3` |
| Documentación completa | 4 oct | Historia, manuales, esquema SQL, README nuevo | `v3.0.0-alpha.4` |

## Otras fuentes históricas

- [Bitácora](../bitacora/): el registro de cada sesión de trabajo, sin corregir.
- [Incidencias](../incidencias/README.md): cada falla, su causa y su solución.
- [CHANGELOG.md](../../CHANGELOG.md): qué trajo cada versión.
- [Tablero de la v2 archivado](../../tablero/historico/2026-10-03_v2_KANBAN.md): cómo terminó cada tarea de la etapa anterior.
- El propio git: `git log v2.0.1` (historial original) y `git log main`.
