import json
from pathlib import Path
from typing import Any, Dict

from ..errors import InvalidPracticeError
from ..models import PracticeDefinition, TargetDefinition

SUPPORTED_SCHEMA = "amatista.practice/1"


def _text(data: Dict[str, Any], key: str) -> str:
    value = data.get(key)

    if not isinstance(value, str) or not value.strip():
        raise InvalidPracticeError(f"'{key}' debe ser texto no vacío")

    return value.strip()


def parse_practice(data: Dict[str, Any]) -> PracticeDefinition:
    if not isinstance(data, dict):
        raise InvalidPracticeError("La práctica debe ser un objeto JSON")

    schema = _text(data, "schema")

    if schema != SUPPORTED_SCHEMA:
        raise InvalidPracticeError(
            f"Schema no soportado: {schema}. Esperado: {SUPPORTED_SCHEMA}"
        )

    practice_id = _text(data, "id")
    title = _text(data, "title")

    level = data.get("level")

    if not isinstance(level, int) or level < 1:
        raise InvalidPracticeError("'level' debe ser entero >= 1")

    raw_targets = data.get("targets")

    if not isinstance(raw_targets, list) or not raw_targets:
        raise InvalidPracticeError(
            "'targets' debe contener al menos un objetivo"
        )

    targets = []
    ids = set()

    for index, raw in enumerate(raw_targets):
        if not isinstance(raw, dict):
            raise InvalidPracticeError(
                f"targets[{index}] debe ser un objeto"
            )

        target_id = _text(raw, "id")

        if target_id in ids:
            raise InvalidPracticeError(
                f"Objetivo duplicado: {target_id}"
            )

        ids.add(target_id)

        validator = _text(raw, "validator")
        params = raw.get("params", {})

        if not isinstance(params, dict):
            raise InvalidPracticeError(
                f"targets[{index}].params debe ser un objeto"
            )

        weight = raw.get("weight", 1.0)

        if not isinstance(weight, (int, float)) or weight < 0:
            raise InvalidPracticeError(
                f"targets[{index}].weight debe ser >= 0"
            )

        targets.append(
            TargetDefinition(
                id=target_id,
                validator=validator,
                params=dict(params),
                weight=float(weight),
                title=str(raw.get("title", "")).strip(),
            )
        )

    if sum(target.weight for target in targets) <= 0:
        raise InvalidPracticeError(
            "La suma total de pesos debe ser mayor que cero"
        )

    return PracticeDefinition(
        schema=schema,
        id=practice_id,
        title=title,
        level=level,
        targets=tuple(targets),
    )


def load_practice(path: str | Path) -> PracticeDefinition:
    path = Path(path)

    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise InvalidPracticeError(
            f"No existe la práctica: {path}"
        ) from exc
    except json.JSONDecodeError as exc:
        raise InvalidPracticeError(
            f"JSON inválido: línea {exc.lineno}, columna {exc.colno}"
        ) from exc

    return parse_practice(raw)
