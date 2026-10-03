from dataclasses import dataclass, field
from typing import Any, Dict, Optional, Tuple


@dataclass(frozen=True)
class SceneObject:
    name: str
    object_type: str
    roles: Tuple[str, ...] = ()
    location: Tuple[float, float, float] = (0.0, 0.0, 0.0)
    rotation: Tuple[float, float, float] = (0.0, 0.0, 0.0)
    scale: Tuple[float, float, float] = (1.0, 1.0, 1.0)
    dimensions: Tuple[float, float, float] = (0.0, 0.0, 0.0)
    modifiers: Tuple[str, ...] = ()


@dataclass(frozen=True)
class SceneState:
    blender_version: str
    file_path: str
    file_saved: bool
    objects: Tuple[SceneObject, ...] = ()

    def objects_with_role(self, role: str) -> Tuple[SceneObject, ...]:
        return tuple(obj for obj in self.objects if role in obj.roles)

    def object_by_name(self, name: str) -> Optional[SceneObject]:
        return next((obj for obj in self.objects if obj.name == name), None)


@dataclass(frozen=True)
class TargetDefinition:
    id: str
    validator: str
    params: Dict[str, Any] = field(default_factory=dict)
    weight: float = 1.0
    title: str = ""


@dataclass(frozen=True)
class PracticeDefinition:
    schema: str
    id: str
    title: str
    level: int
    targets: Tuple[TargetDefinition, ...]


@dataclass(frozen=True)
class ValidationResult:
    target_id: str
    validator: str
    passed: Optional[bool]
    message: str
    details: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class EvaluationReport:
    practice_id: str
    practice_title: str
    progress: float
    completed: bool
    results: Tuple[ValidationResult, ...]
