from .models import (
    EvaluationReport,
    PracticeDefinition,
    SceneState,
    ValidationResult,
)
from .progress import calculate_progress
from .registry import ValidatorRegistry


class AmatistaEngine:
    """Núcleo del motor.

    No conoce Blender, interfaz, API, usuarios ni base de datos.
    """

    def __init__(self, registry: ValidatorRegistry) -> None:
        self.registry = registry

    def evaluate(
        self,
        practice: PracticeDefinition,
        scene: SceneState,
    ) -> EvaluationReport:
        results = []

        for target in practice.targets:
            validator = self.registry.get(target.validator)

            if validator is None:
                result = ValidationResult(
                    target_id=target.id,
                    validator=target.validator,
                    passed=None,
                    message=(
                        "Amatista Engine no conoce todavía el validador "
                        f"'{target.validator}'."
                    ),
                    details={"reason": "unknown_validator"},
                )
            else:
                try:
                    result = validator(target, scene)
                except Exception as exc:
                    result = ValidationResult(
                        target_id=target.id,
                        validator=target.validator,
                        passed=None,
                        message=f"Error interno del validador: {exc}",
                        details={"reason": "validator_error"},
                    )

            results.append(result)

        by_id = {result.target_id: result for result in results}
        progress = calculate_progress(practice.targets, by_id)

        completed = bool(practice.targets) and all(
            result.passed is True for result in results
        )

        return EvaluationReport(
            practice_id=practice.id,
            practice_title=practice.title,
            progress=progress,
            completed=completed,
            results=tuple(results),
        )
