"""Crypto signal generation engine."""

import random
from typing import Optional
from dataclasses import dataclass


@dataclass
class CryptoSignal:
    """Generated crypto trading signal."""
    pair: str
    direction: str  # 'BUY', 'SELL', or 'NO TRADE'
    confidence: float  # 0.0 to 1.0
    entry: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    reason: str = ""


def generate_crypto_signal(pair: str, account_balance: float = 10000) -> CryptoSignal:
    """Generate a trading signal for a crypto pair.
    
    This is a simplified implementation. In production, this would:
    - Load crypto market data
    - Run technical analysis
    - Check volume and volatility
    """
    confidence = random.uniform(0.3, 0.95)
    
    # Random direction for demo
    direction_random = random.random()
    if direction_random < 0.45:
        direction = "BUY"
    elif direction_random < 0.9:
        direction = "SELL"
    else:
        direction = "NO TRADE"
        return CryptoSignal(
            pair=pair,
            direction=direction,
            confidence=confidence,
            reason="Market conditions not favorable",
        )
    
    # Generate price levels (simplified for crypto)
    is_btc = "BTC" in pair
    is_eth = "ETH" in pair
    
    if is_btc:
        base_price = random.uniform(40000, 70000)
    elif is_eth:
        base_price = random.uniform(2000, 4000)
    else:
        base_price = random.uniform(1, 500)
    
    # Crypto has wider stops due to volatility
    if direction == "BUY":
        entry = base_price
        stop_loss = entry * 0.98  # 2% stop
        take_profit = entry * 1.06  # 6% target (3:1 R:R)
    else:
        entry = base_price
        stop_loss = entry * 1.02  # 2% stop
        take_profit = entry * 0.94  # 6% target
    
    return CryptoSignal(
        pair=pair,
        direction=direction,
        confidence=confidence,
        entry=round(entry, 2),
        stop_loss=round(stop_loss, 2),
        take_profit=round(take_profit, 2),
        reason=f"{'Bullish' if direction == 'BUY' else 'Bearish'} momentum on {pair}",
    )


def analyze_crypto_pairs(pairs: list[str]) -> list[CryptoSignal]:
    """Analyze multiple crypto pairs and return signals."""
    signals = []
    for pair in pairs:
        signal = generate_crypto_signal(pair)
        if signal.direction != "NO TRADE":
            signals.append(signal)
    return signals
