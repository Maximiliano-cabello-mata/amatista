from typing import Iterable, Mapping

from .models import TargetDefinition, ValidationResult


def calculate_progress(
    targets: Iterable[TargetDefinition],
    results: Mapping[str, ValidationResult],
) -> float:
    targets = tuple(targets)
    total_weight = sum(max(0.0, target.weight) for target in targets)

    if total_weight <= 0:
        return 0.0

    earned = 0.0

    for target in targets:
        result = results.get(target.id)
        if result is not None and result.passed is True:
            earned += max(0.0, target.weight)

    return round((earned / total_weight) * 100.0, 2)
