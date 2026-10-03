# Amatista Engine — Starter v0.1

Primer núcleo funcional del motor educativo declarativo de Amatista.

## Qué hace ya

- Carga una práctica desde JSON.
- Valida la estructura mínima de la práctica.
- Registra validadores reutilizables.
- Evalúa un estado de escena normalizado.
- Calcula progreso ponderado.
- Genera un reporte de evaluación.
- Mantiene Blender separado del núcleo.

## Qué NO hace todavía

- No tiene interfaz.
- No tiene Author/Preview/Student.
- No se conecta a FastAPI ni Oracle.
- No usa IA.
- No depende todavía de `bpy` en el núcleo.

## Probarlo

Desde esta carpeta:

```bash
python demo.py
```

También puedes ejecutar:

```bash
python -m unittest discover -s tests -v
```

La primera arquitectura es:

```text
practice.json
    ↓
Practice Loader
    ↓
Amatista Engine
    ↓
Validator Registry
    ↓
Scene State
    ↓
Evaluation Report
```
