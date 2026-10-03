from typing import Any, Dict, Optional

from ..models import SceneState, TargetDefinition, ValidationResult
from ..registry import ValidatorRegistry


def _result(
    target: TargetDefinition,
    passed: bool,
    message: str,
    details: Optional[Dict[str, Any]] = None,
) -> ValidationResult:
    return ValidationResult(
        target_id=target.id,
        validator=target.validator,
        passed=passed,
        message=message,
        details=details or {},
    )


def file_saved(
    target: TargetDefinition,
    scene: SceneState,
) -> ValidationResult:
    return _result(
        target,
        scene.file_saved,
        (
            "El archivo está guardado."
            if scene.file_saved
            else "Guarda el archivo antes de continuar."
        ),
        {"file_path": scene.file_path},
    )


def object_exists(
    target: TargetDefinition,
    scene: SceneState,
) -> ValidationResult:
    name = str(target.params.get("name", "")).strip()

    if not name:
        raise ValueError("object.exists requiere params.name")

    found = scene.object_by_name(name) is not None

    return _result(
        target,
        found,
        (
            f"Encontramos el objeto '{name}'."
            if found
            else f"No encontramos el objeto '{name}'."
        ),
        {"name": name},
    )


def role_count(
    target: TargetDefinition,
    scene: SceneState,
) -> ValidationResult:
    role = str(target.params.get("role", "")).strip()
    expected = int(target.params.get("equals", 1))

    if not role:
        raise ValueError("role.count requiere params.role")

    if expected < 0:
        raise ValueError("role.count requiere equals >= 0")

    objects = scene.objects_with_role(role)
    found = len(objects)
    passed = found == expected

    if passed:
        message = f"Objetivo completado: {found}/{expected} '{role}'."
    elif found < expected:
        message = (
            f"Tienes {found}/{expected} '{role}'. "
            f"Faltan {expected - found}."
        )
    else:
        message = (
            f"Tienes {found}/{expected} '{role}'. "
            f"Hay {found - expected} de más."
        )

    return _result(
        target,
        passed,
        message,
        {
            "role": role,
            "expected": expected,
            "found": found,
            "objects": [obj.name for obj in objects],
        },
    )


def dimension_range(
    target: TargetDefinition,
    scene: SceneState,
) -> ValidationResult:
    role = str(target.params.get("role", "")).strip()
    axis = str(target.params.get("axis", "z")).lower()
    minimum = float(target.params.get("min", float("-inf")))
    maximum = float(target.params.get("max", float("inf")))

    axis_index = {"x": 0, "y": 1, "z": 2}.get(axis)

    if axis_index is None:
        raise ValueError("dimension.range requiere axis x, y o z")

    if not role:
        raise ValueError("dimension.range requiere params.role")

    objects = scene.objects_with_role(role)

    if not objects:
        return _result(
            target,
            False,
            f"No hay objetos con rol '{role}'.",
            {"role": role},
        )

    failed = []

    for obj in objects:
        value = obj.dimensions[axis_index]
        if not minimum <= value <= maximum:
            failed.append({
                "object": obj.name,
                "value": value,
            })

    return _result(
        target,
        not failed,
        (
            f"Las dimensiones de '{role}' son correctas."
            if not failed
            else f"{len(failed)} objeto(s) '{role}' están fuera del rango."
        ),
        {
            "role": role,
            "axis": axis,
            "min": minimum,
            "max": maximum,
            "failed": failed,
        },
    )


def register_builtin_validators(registry: ValidatorRegistry) -> None:
    registry.register("file.saved", file_saved)
    registry.register("object.exists", object_exists)
    registry.register("role.count", role_count)
    registry.register("dimension.range", dimension_range)
