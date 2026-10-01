# Tablero Kanban de Amatista

El tablero vive en [`KANBAN.md`](../KANBAN.md) y combina tres ideas:

- **Roadmap**: las próximas versiones (`v2.1.0`, `v2.2.0`…) con su objetivo y su avance.
- **Kanban**: cada tarea pasa por Pendiente → En progreso → Revisión → Hecho.
- **Git-driven**: las tarjetas se mueven solas según los commits. Nadie arrastra tarjetas a mano.

## Cómo se usa

1. **Crear una tarea**: agrégala en [`tareas.yml`](tareas.yml) con un id nuevo (`T-014`), su versión y su área.
2. **Trabajar en ella**: menciona su id en el commit y la tarjeta se mueve sola.

| En el mensaje del commit | La tarjeta pasa a |
|---|---|
| `feat(pwa): visor GLB inicial T-011` | 🔨 En progreso |
| `revision T-011` | 👀 Revisión |
| `cierra T-011` (o `closes`, `fix`, `resuelve`), en `dev` | 👀 Revisión (espera el merge) |
| `cierra T-011`, ya en `main` | ✅ Hecho |
| `reabre T-011` | 📋 Pendiente |

El id puede ir en el título o en el cuerpo del commit, y sirve igual `T-11` que `T-011`.
Ejemplo completo:

```
feat(db): crear usuario de aplicación en oracle

cierra T-004
```

## Cómo funciona

- [`actualizar.py`](actualizar.py) lee los commits de **todas las ramas** y calcula el estado de cada tarea. No guarda estado: si un commit se equivoca, el siguiente lo corrige.
- El workflow [`.github/workflows/tablero.yml`](../.github/workflows/tablero.yml) lo ejecuta con cada push y publica `KANBAN.md` en `main`. Las otras ramas nunca tocan ese archivo, así que no hay conflictos de merge.
- Las versiones publicadas salen de los tags `v*`.

Para verlo en tu computadora: `pip install pyyaml && python tablero/actualizar.py`.

## Requisitos en GitHub

- Settings → Actions → General → Workflow permissions: **Read and write permissions**.
- Si proteges `main` con reglas que impiden pushes directos o exigen commits firmados, permite que GitHub Actions haga bypass. Si no, el workflow genera el tablero pero no puede publicarlo.
