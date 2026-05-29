"""Signal generation engines."""

from backend.signals.forex import generate_forex_signal
from backend.signals.crypto import generate_crypto_signal

__all__ = ["generate_forex_signal", "generate_crypto_signal"]
