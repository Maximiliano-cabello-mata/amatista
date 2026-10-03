from pathlib import Path

from amatista_engine import create_default_engine
from amatista_engine.models import SceneObject, SceneState
from amatista_engine.practice import load_practice


BASE = Path(__file__).parent

practice = load_practice(
    BASE / "practices" / "sandbox" / "table.json"
)

scene = SceneState(
    blender_version="5.1-demo",
    file_path="mesa.blend",
    file_saved=True,
    objects=(
        SceneObject(
            name="Cubierta",
            object_type="MESH",
            roles=("cubierta",),
            dimensions=(2.0, 1.0, 0.15),
        ),
        SceneObject(name="Pata01", object_type="MESH", roles=("pata",)),
        SceneObject(name="Pata02", object_type="MESH", roles=("pata",)),
        SceneObject(name="Pata03", object_type="MESH", roles=("pata",)),
    ),
)

engine = create_default_engine()
report = engine.evaluate(practice, scene)

print(f"Práctica: {report.practice_title}")
print(f"Progreso: {report.progress}%")
print(f"Completada: {report.completed}")
print()

for result in report.results:
    icon = "✓" if result.passed else "✗" if result.passed is False else "?"
    print(f"{icon} {result.target_id}: {result.message}")
