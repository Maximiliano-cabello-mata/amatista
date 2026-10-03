from typing import Callable, Dict, Iterable, Optional

from .models import SceneState, TargetDefinition, ValidationResult

ValidatorFunction = Callable[
    [TargetDefinition, SceneState],
    ValidationResult,
]


class ValidatorRegistry:
    """Registro de capacidades reutilizables del motor."""

    def __init__(self) -> None:
        self._validators: Dict[str, ValidatorFunction] = {}

    def register(self, validator_id: str, function: ValidatorFunction) -> None:
        if not validator_id:
            raise ValueError("validator_id no puede estar vacío")

        if validator_id in self._validators:
            raise ValueError(f"Validador duplicado: {validator_id}")

        self._validators[validator_id] = function

    def get(self, validator_id: str) -> Optional[ValidatorFunction]:
        return self._validators.get(validator_id)

    def ids(self) -> Iterable[str]:
        return tuple(sorted(self._validators))
