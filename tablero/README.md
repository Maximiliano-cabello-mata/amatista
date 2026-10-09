# Tablero Kanban de Amatista

El tablero vive en [`KANBAN.md`](../KANBAN.md) y combina cuatro ideas:

- **Roadmap**: las próximas versiones (`v2.1.0`, `v2.2.0`…) con su objetivo y su avance.
- **Kanban**: cada tarea pasa por Pendiente → En progreso → Revisión → Hecho.
- **Contenido**: el estado de cada módulo de los cursos (borrador → revisión → publicado).
- **Git-driven**: las tarjetas y los módulos se mueven solos según los commits. Nadie arrastra tarjetas a mano.

## Metodología en una línea

Planear en [`tareas.yml`](tareas.yml) → trabajar en una rama mencionando `T-xxx` → cerrar con
`cierra T-xxx` cuando el criterio de aceptación se cumplió → el merge a `main` la pasa a Hecho.
El contenido sigue su propio flujo en los JSON de los módulos y el tablero lo refleja solo.

## Cómo se usa

1. **Crear una tarea**: agrégala en [`tareas.yml`](tareas.yml) con el siguiente id libre (hoy `T-093`), su versión y su área. Opcional: `estado` (estado mínimo puesto a mano, para lo que ocurre fuera de git, como un script ejecutado en Oracle), `depende_de`, `aceptacion`, `evidencia`, `bloqueo`. Los tres últimos aparecen como notas debajo de la tarea en el detalle por versión de `KANBAN.md`.
2. **Trabajar en ella**: menciona su id en el commit y la tarjeta se mueve sola.

| En el mensaje del commit | La tarjeta pasa a |
|---|---|
| `feat(pwa): visor GLB inicial T-011` | 🔨 En progreso |
| `revision T-011` | 👀 Revisión |
| `cierra T-011` (o `closes`, `fix`, `resuelve`), en una rama de trabajo | 👀 Revisión (espera el merge) |
| `cierra T-011`, ya en `main` | ✅ Hecho |
| `reabre T-011` | 📋 Pendiente |

El id puede ir en el título o en el cuerpo del commit, y sirve igual `T-11` que `T-011`.
Ejemplo completo:

```
feat(db): crear usuario de aplicación en oracle

cierra T-004
```

Usa `cierra T-xxx` solo cuando la tarea cumple su criterio (`aceptacion`). Si un cambio prepara
algo que todavía requiere una acción humana (ejecutar un script en Oracle, configurar el
servidor), menciona el id sin `cierra`: la tarjeta queda En progreso hasta que alguien lo haga.

## Flujo de contenido

La sección **📚 Contenido** del tablero se genera de `frontend/src/data/modulos/*.json`. Por cada
módulo muestra curso, número, título, estado, lecciones, bloques interactivos y cuántos pasos de la
[Fórmula Amatista](../docs/arquitectura/2026-10-02_formula_modulos.txt) cubre (campo `formula`
de cada lección).

| `estado` del módulo | Significado | Lo ven los alumnos |
|---|---|---|
| `borrador` | En construcción (por ejemplo, recién creado con `nuevo-modulo`) | No: aparece como «Próximamente» |
| `revision` | Listo para que otra persona (o tú, al día siguiente) lo revise | No (en la base se guarda como borrador) |
| `publicado` | Validado y aprobado | Sí |
| `archivado` | Retirado sin borrar el progreso de nadie | No |
| sin `estado` | JSON anterior a la v2.2 | Sí (se toma como publicado) |

Para mover un módulo basta cambiar su `estado` en el JSON y hacer commit; antes de publicarlo,
`cd backend && python herramientas/contenido.py validar` debe terminar sin errores (CI lo exige).
El contenido que se edita en el panel de administración vive en la base de datos; para que
también aparezca aquí, expórtalo con
`python herramientas/contenido.py exportar <modulo_id> ../frontend/src/data/modulos/<curso>-modulo-<n>.json`
y haz commit del JSON.

## Etapas e histórico

Cada etapa del proyecto tiene su tablero. Al cambiar de etapa:

1. Copiar `tareas.yml` y el `KANBAN.md` publicado en `main` a [`historico/`](historico/) con la fecha (`AAAA-MM-DD_v2_tareas.yml`, `AAAA-MM-DD_v2_KANBAN.md`). El contenido no se edita después; solo se agrega al principio un bloque de revisión con el estado real al cierre (así se hizo con el de la v2 el 4 de octubre).
2. Reescribir `tareas.yml` con el bloque `etapa` (nombre, fecha, plan, enlace al histórico) y el roadmap nuevo. Las tareas abiertas conservan su id; las cerradas quedan solo en el histórico y se listan en `etapa.archivadas` para que sus commits viejos no salgan como desconocidos.

| Etapa | Desde | Histórico |
|---|---|---|
| v2 «Plataforma unificada» | 1 oct 2026 | [tareas](historico/2026-10-03_v2_tareas.yml) · [tablero](historico/2026-10-03_v2_KANBAN.md) |
| v3 «Reestructuración» (actual) | 3 oct 2026 | [plan](../docs/reestructuracion/00_plan_maestro.md) |

## Cómo funciona

- [`actualizar.py`](actualizar.py) lee los commits de **todas las ramas** y calcula el estado de cada tarea. No guarda estado: si un commit se equivoca, el siguiente lo corrige.
- El workflow [`.github/workflows/tablero.yml`](../.github/workflows/tablero.yml) lo ejecuta con cada push y publica `KANBAN.md` en `main`. Las otras ramas nunca tocan ese archivo, así que no hay conflictos de merge.
- Las versiones publicadas salen de los tags `v*`.

Para verlo en tu computadora: `pip install pyyaml && python tablero/actualizar.py`.
Pruebas del generador: `python -m pytest -q tablero` (también corren en CI).

## Requisitos en GitHub

- Settings → Actions → General → Workflow permissions: **Read and write permissions**.
- Si proteges `main` con reglas que impiden pushes directos o exigen commits firmados, permite que GitHub Actions haga bypass. Si no, el workflow genera el tablero pero no puede publicarlo.
