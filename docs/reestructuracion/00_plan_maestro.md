# Amatista 3 · Plan maestro de la reestructuración

Fecha: 3 de octubre de 2026 · Etapa: **v3 «Reestructuración»** · Tag inicial propuesto: `v3.0.0-alpha.1`
Fuente: [propuesta de contenido de Maximiliano](../propuestas/2026-10-03_propuesta_contenido_blender.txt) (3/10/2026).

Este documento dice **qué cambia, en qué orden y cómo se sabe que cada paso quedó hecho**. El detalle vive en:

| Documento | Responde |
|---|---|
| [01 · Modelo de contenido](01_modelo_de_contenido.md) | Cómo se organiza un curso: niveles, ficha de lección, habilidades, rúbrica y versiones de Blender |
| [02 · Manual de Oracle](02_manual_oracle.md) | Qué ejecutar en Oracle, en qué orden, cómo verificarlo y cómo crear lecciones desde Database Actions |
| [03 · Add-on de Blender](03_addon_blender.md) | Cómo se construye el add-on conectado a la plataforma, de la arquitectura al empaquetado |
| [Bitácora del 3 de octubre](../bitacora/2026-10-03_estado_y_reestructuracion.md) | Todo lo realizado hasta hoy y el punto de partida de la v3 |
| [Tablero](../../KANBAN.md) y [tareas](../../tablero/tareas.yml) | Estado de cada tarea (el tablero v2 quedó archivado en [`tablero/historico/`](../../tablero/historico/)) |

## 1. Qué es la reestructuración (y qué no es)

Es una **ampliación** de la plataforma que ya funciona, no una reescritura. Lo que hay (cuentas, progreso offline, panel de administración, contenido administrable, Oracle con 8 tablas) se conserva y sigue sirviendo al piloto del 8 de octubre. Lo nuevo se suma encima:

1. **Un curso, cinco niveles.** Jerarquía curso › nivel › módulo › lección › actividad. Cada nivel termina en un proyecto y una revisión de habilidades. El nivel 5 se divide en ramas (web y videojuegos, animación, producto, procedimientos).
2. **Versiones de Blender separadas del contenido y del add-on.** Cada lección declara «Verificada en…», y una matriz de compatibilidad registra quién probó qué, dónde y con qué resultado.
3. **Evaluación por habilidades.** Avance, experiencia (XP) y habilidades se muestran por separado; la rúbrica A–E evalúa el proyecto de cada nivel.
4. **Add-on de Blender conectado a la plataforma.** Primero se diseña (este paquete de documentos); se construye por incrementos después de que el recorrido sin add-on funcione.

Reglas que no cambian: migraciones solo aditivas (nunca se borran usuarios ni progreso), los ids publicados no cambian, nada se publica sin pasar la validación del backend, y una tarea se cierra con evidencia.

## 2. Lo que ya quedó hecho en esta entrega (PR de la reestructuración)

| Pieza | Dónde | Estado |
|---|---|---|
| Esquema Oracle de la v3: `NIVELES`, `MODULOS.NIVEL_ID`, `HABILIDADES`, `HABILIDADES_ALUMNO`, `EVALUACIONES_RUBRICA`, `VERSIONES_BLENDER`, `VERIFICACIONES_BLENDER` | [`backend/sql/005_niveles_habilidades_versiones.sql`](../../backend/sql/005_niveles_habilidades_versiones.sql) | Probado en Oracle 23ai (contenedor): 001→006 en una pasada, repetido sin errores, con y sin `AMATISTA_APP` |
| Herramientas de autor en Oracle: vistas `V_AMATISTA_MAPA`, `V_AMATISTA_FICHAS_INCOMPLETAS`, `V_AMATISTA_COMPATIBILIDAD` y paquete `AMATISTA_AUTOR` | [`backend/sql/006_herramientas_autor.sql`](../../backend/sql/006_herramientas_autor.sql) | Probado en el mismo contenedor |
| Modelos, diagnóstico y pruebas de esquema alineados | `backend/database/modelos.py`, `backend/diagnostico_oracle.py`, `backend/tests/test_esquema.py` | 236 pruebas pasan |
| Ficha de lección opcional (objetivo, habilidades, versión verificada, comprobación…) validada | `backend/contenido/validacion.py` | Las lecciones anteriores siguen validando |
| API: niveles, mapa del curso, versiones de Blender y matriz | `backend/api/niveles.py`, `backend/api/blender.py`; el catálogo agrega `niveles` y `nivel_id` | Campos nuevos: la PWA actual los ignora |
| CLI: `nueva-leccion`, `mapa`, `sembrar-niveles`, `nuevo-modulo --nivel` | `backend/herramientas/contenido.py` | `importar` también crea los niveles de Blender |
| El módulo 1 de Blender pertenece al Nivel 1 | `frontend/src/data/modulos/blender-modulo-1.json` (`"nivel": "blender-n1"`) | Sin cambios para el alumno |
| Documentación de la etapa, bitácora, tablero nuevo y tablero v2 archivado | `docs/reestructuracion/`, `tablero/` | Este documento |

**Lo que no cambia todavía:** la PWA no muestra niveles ni habilidades; el alumno ve lo mismo que hoy. Eso es la fase B.

## 3. Fases y orden de ejecución

Una fase empieza cuando la anterior tiene evidencia. Las tareas viven en el [tablero](../../tablero/tareas.yml); aquí solo va el orden.

### Fase 0 · Piloto v2.2 (hasta el 8 de octubre) — no se interrumpe

El piloto usa lo que ya está en producción. La reestructuración **no se despliega en el servidor antes del piloto** salvo que Maximiliano lo decida: el código nuevo necesita el script 005 en Oracle (ver [manual](02_manual_oracle.md), sección 2).
Tareas: T-003, T-005, T-023…T-032 (las abiertas de la v2.2 pasaron al tablero nuevo con su mismo id).

### Fase A · Estructura (v3.0.0-alpha.1) — esta entrega

| Paso | Tarea | Evidencia para cerrarla |
|---|---|---|
| A1 | T-034 Estructura de niveles en código y esquema | PR fusionado; pruebas en CI; 005 probado en Oracle |
| A2 | T-036 Herramientas de autor en Oracle (006) | PR fusionado; paquete `VALID` en Oracle |
| A3 | T-037 Documentación de la reestructuración | Este paquete de documentos fusionado |
| A4 | T-035 Ejecutar 005 y 006 en producción | `diagnostico_oracle.py` dice «✓ Las tablas coinciden»; `importar` crea los 8 niveles |
| A5 | T-038 Elegir y verificar la versión principal de Blender | Fila `principal` en `VERSIONES_BLENDER` con nota de soporte oficial consultado |

### Fase B · El alumno ve la ruta (v3.0.0)

| Paso | Tarea | Resultado |
|---|---|---|
| B1 | T-039 Inventario de lecciones existentes → niveles | Cada módulo tiene `nivel` y cada lección su ficha (`contenido.py mapa` en 100 % para lo publicado) |
| B2 | T-044 Editor del panel: ficha y nivel | El admin llena la ficha sin tocar JSON |
| B3 | T-041 Mapa de niveles en la PWA | El catálogo muestra niveles; cada lección dice «Verificada en…» |
| B4 | T-042 Habilidades y rúbrica en la API y en el panel del alumno | Avance, XP y habilidades por separado |
| B5 | T-043 Diagnóstico opcional de entrada | Recomienda un nivel; el alumno puede elegir otro |
| B6 | T-040 Lección modelo completa | Una lección con los 10 pasos, recursos, rúbrica y verificación registrada |

### Fase C · «Mi primer espacio 3D» (v3.1.0)

La primera entrega de contenido de la propuesta (sección 10): lecciones 01–11 del Nivel 1 y parte del 2. T-009 (renombrada), T-045…T-048. Aceptación: las condiciones de la sección 10 de la propuesta, observadas con una persona principiante y otra con experiencia básica.

### Fase D · Laboratorio y GLB (v3.2.0)

T-010, T-011 y T-049: visor GLB, escena de ejemplo con reinicio, avisos cuando falta un recurso. La lección 12 (exportar y comprobar en el laboratorio) entra aquí.

### Fase E · Add-on de Blender (v3.3.0)

T-013 (MVP), T-050…T-053, en el orden de la [guía del add-on](03_addon_blender.md), sección 9: contrato de API → vincular cuenta → panel de la lección → comprobaciones locales → registrar verificaciones. **El primer recorrido debe poder completarse sin add-on.**

### Fase F · Especialidades y tutor (v3.4.0 en adelante)

T-054 (primera rama del nivel 5, pendiente de decisión) y T-012 (tutor IA).

## 4. Versiones y tags

- La etapa se llama **«Reestructuración»** y abre la serie **v3**. Según la [guía de versiones](../guias/2026-10-01_versiones-y-tablero.txt) un cambio de fase del producto es versión MAYOR.
- `v3.0.0-alpha.1` marca el commit de `main` donde quedó fusionada esta entrega. Lo crea Maximiliano desde su PC (la nube no puede publicar tags, INC-009):

```bash
git switch main && git pull
git tag -s v3.0.0-alpha.1 -m "v3.0.0-alpha.1 — Reestructuración: niveles, versiones de Blender y herramientas de autor"
git push origin v3.0.0-alpha.1
```

- `v2.2.0-alpha.2` sigue pendiente de publicar con `bash herramientas/crear-tags.sh && git push origin v2.2.0-alpha.2`.
- `v3.0.0` (sin sufijo) se publica al terminar la fase B; `v3.1.0` con «Mi primer espacio 3D», y así sucesivamente.
- Versionado de contenido y de add-on, aparte del de la plataforma: ver [modelo de contenido](01_modelo_de_contenido.md), sección 6.

## 5. Riesgos y cómo se controlan

| Riesgo | Control |
|---|---|
| Desplegar el backend nuevo sin 005 en Oracle | `/api/contenido/catalogo` respondería 503. El manual pone 005 **antes** de `actualizar.sh`; el diagnóstico recomienda 005 cuando falta. La PWA conserva su catálogo empaquetado mientras tanto |
| Romper el piloto | No se despliega antes del 8/10 sin decisión explícita; todos los campos del catálogo son nuevos y opcionales |
| Inventar la versión de Blender o datos de mercado | `VERSIONES_BLENDER` nace vacía; T-038 exige la nota del soporte oficial consultado |
| El add-on crece antes que el contenido | Fase E después de C; el recorrido sin add-on es requisito |
| Confundir «nivel» del curso con el nivel de XP | En código: `niveles`/`nivel_id` (ruta del curso) frente a `nivel` de XP (gamificación) y `curso.nivel` (etiqueta «Principiante»). Ver modelo de contenido, sección 1 |

## 6. Decisiones pendientes (sección 13 de la propuesta)

No se inventan; cada una tiene tarea o queda registrada aquí hasta que exista evidencia.

| Decisión | Dónde se resuelve |
|---|---|
| Versión principal de Blender (LTS) y versiones adicionales a verificar | T-038 |
| Sistemas operativos y dispositivos del primer grupo | Observación del piloto (T-026) |
| Duración estimada de cada módulo | Prácticas reales de la fase C |
| Formato de entrega de evidencias y alcance de la revisión humana | T-042 |
| Alcance mínimo del visor y del add-on | T-049 y T-050 |
| Especialidad avanzada que se desarrolla primero (propuesta: web y videojuegos) | T-054 |

## 7. Cómo se trabaja en esta etapa

El flujo del [centro de dirección](../../PROYECTO.md) no cambia: una tarea en ejecución, rama corta desde `main`, commits que mencionan la tarea, `cierra T-xxx` solo con el criterio cumplido, PR con evidencia y confirmación de Maximiliano antes de fusionar. Solo existe `main` y una rama de trabajo a la vez.
