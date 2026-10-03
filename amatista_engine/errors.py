class AmatistaEngineError(Exception):
    """Error base de Amatista Engine."""


class InvalidPracticeError(AmatistaEngineError):
    """La práctica declarativa no es válida."""
