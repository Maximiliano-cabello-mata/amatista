from .engine import AmatistaEngine
from .registry import ValidatorRegistry
from .validators.builtin import register_builtin_validators


def create_default_engine() -> AmatistaEngine:
    registry = ValidatorRegistry()
    register_builtin_validators(registry)
    return AmatistaEngine(registry)
