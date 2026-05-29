#!/usr/bin/env python3
"""Apex Auto-Trader - Minimal CLI Version

A command-line trading bot for MT5 (Forex) and Binance (Crypto).
No database required. No web server. Just pure trading.

Usage:
    python cli.py --mode forex --pairs EURUSD,GBPUSD --interval 300
    python cli.py --mode crypto --pairs BTCUSDT,ETHUSDT --interval 120
"""

import sys
import time
import json
import argparse
import signal
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Optional

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from backend.brokers import MT5Adapter, BinanceAdapter, BrokerError
from backend.signals.forex import generate_forex_signal, TradeSignal
from backend.signals.crypto import generate_crypto_signal, CryptoSignal


# ============================================================================
# CLI Configuration
# ============================================================================

@dataclass
class CLIConfig:
    """CLI configuration."""
    mode: str  # 'forex' or 'crypto'
    pairs: list[str]
    interval: int  # seconds
    confidence: float
    risk_percent: float
    dry_run: bool
    mt5_login: Optional[int] = None
    mt5_password: Optional[str] = None
    mt5_server: Optional[str] = None
    mt5_path: Optional[str] = None
    binance_api_key: Optional[str] = None
    binance_api_secret: Optional[str] = None
    binance_testnet: bool = True


# ============================================================================
# Signal Display
# ============================================================================

def print_signal(signal: TradeSignal | CryptoSignal) -> None:
    """Print a trading signal."""
    emoji = "📊"
    if signal.direction == "BUY":
        emoji = "🟢 BUY"
    elif signal.direction == "SELL":
        emoji = "🔴 SELL"
    else:
        emoji = "⚪ NO TRADE"
    
    print(f"\n  {emoji} {signal.pair}")
    print(f"     Confidence: {signal.confidence:.1%}")
    if signal.entry:
        print(f"     Entry:      {signal.entry}")
    if signal.stop_loss:
        print(f"     Stop Loss:  {signal.stop_loss}")
    if signal.take_profit:
        print(f"     Take Profit:{signal.take_profit}")
    if signal.reason:
        print(f"     Reason:     {signal.reason}")


# ============================================================================
# Broker Adapters
# ============================================================================

def get_mt5_adapter(config: CLIConfig) -> MT5Adapter:
    """Create MT5 adapter from config."""
    if not all([config.mt5_login, config.mt5_password, config.mt5_server]):
        raise ValueError("MT5 requires login, password, and server")
    
    credentials = {
        "login": config.mt5_login,
        "password": config.mt5_password,
        "server": config.mt5_server,
        "path": config.mt5_path,
    }
    return MT5Adapter(credentials)


def get_binance_adapter(config: CLIConfig) -> BinanceAdapter:
    """Create Binance adapter from config."""
    if not all([config.binance_api_key, config.binance_api_secret]):
        raise ValueError("Binance requires api_key and api_secret")
    
    credentials = {
        "api_key": config.binance_api_key,
        "api_secret": config.binance_api_secret,
        "testnet": config.binance_testnet,
    }
    return BinanceAdapter(credentials)


# ============================================================================
# Trading Logic
# ============================================================================

def execute_forex_trade(adapter: MT5Adapter, pair: str, signal: TradeSignal, dry_run: bool) -> Optional[dict]:
    """Execute a forex trade."""
    if dry_run:
        print(f"   [DRY RUN] Would execute {signal.direction} on {pair}")
        return {"ticket": "DRY_RUN", "entry_price": signal.entry}
    
    try:
        adapter.connect()
        
        # Minimum lot size for most brokers
        volume = 0.01
        
        result = adapter.place_market_order(
            symbol=pair,
            side=signal.direction,
            volume=volume,
            stop_loss=signal.stop_loss,
            take_profit=signal.take_profit,
            comment=f"cli_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
        )
        
        adapter.disconnect()
        
        return {
            "ticket": result.ticket,
            "symbol": result.symbol,
            "side": result.side,
            "entry_price": result.entry_price,
            "volume": result.volume,
        }
        
    except BrokerError as e:
        print(f"   ✗ Trade failed: {e}")
        return None
    except Exception as e:
        print(f"   ✗ Unexpected error: {e}")
        return None


def execute_crypto_trade(adapter: BinanceAdapter, pair: str, signal: CryptoSignal, dry_run: bool) -> Optional[dict]:
    """Execute a crypto trade."""
    if dry_run:
        print(f"   [DRY RUN] Would execute {signal.direction} on {pair}")
        return {"ticket": "DRY_RUN", "entry_price": signal.entry}
    
    try:
        adapter.connect()
        
        # Small position for crypto
        volume = 0.001 if "BTC" in pair else 0.01
        
        result = adapter.place_market_order(
            symbol=pair,
            side=signal.direction,
            volume=volume,
            stop_loss=signal.stop_loss,
            take_profit=signal.take_profit,
        )
        
        adapter.disconnect()
        
        return {
            "ticket": result.ticket,
            "symbol": result.symbol,
            "side": result.side,
            "entry_price": result.entry_price,
            "volume": result.volume,
        }
        
    except BrokerError as e:
        print(f"   ✗ Trade failed: {e}")
        return None
    except Exception as e:
        print(f"   ✗ Unexpected error: {e}")
        return None


# ============================================================================
# Main Trading Loop
# ============================================================================

running = True

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully."""
    global running
    print("\n\n🛑 Stopping trading bot...")
    running = False


def run_forex_loop(config: CLIConfig) -> None:
    """Run forex trading loop."""
    global running
    
    print("\n📈 Starting FOREX Trading")
    print(f"   Pairs:     {', '.join(config.pairs)}")
    print(f"   Interval:  {config.interval} seconds")
    print(f"   Min Conf:  {config.confidence:.0%}")
    print(f"   Mode:      {'DRY RUN' if config.dry_run else 'LIVE'}")
    print("-" * 50)
    
    adapter = get_mt5_adapter(config)
    trades_executed = 0
    cycles = 0
    
    while running:
        cycles += 1
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Cycle #{cycles}")
        
        for pair in config.pairs:
            if not running:
                break
                
            signal = generate_forex_signal(pair)
            print_signal(signal)
            
            if signal.direction == "NO TRADE":
                continue
            
            if signal.confidence < config.confidence:
                print(f"   ⚠️ Confidence too low ({signal.confidence:.1%}), skipping")
                continue
            
            result = execute_forex_trade(adapter, pair, signal, config.dry_run)
            
            if result:
                trades_executed += 1
                print(f"   ✓ Trade executed: Ticket #{result['ticket']}")
                print(f"   💰 Entry: {result['entry_price']}")
                # Only trade one pair per cycle (best opportunity)
                break
        
        if running:
            print(f"\n⏳ Waiting {config.interval}s... (Press Ctrl+C to stop)")
            try:
                time.sleep(config.interval)
            except KeyboardInterrupt:
                break
    
    print(f"\n📊 Summary: {cycles} cycles, {trades_executed} trades executed")


def run_crypto_loop(config: CLIConfig) -> None:
    """Run crypto trading loop."""
    global running
    
    print("\n₿ Starting CRYPTO Trading")
    print(f"   Pairs:     {', '.join(config.pairs)}")
    print(f"   Interval:  {config.interval} seconds")
    print(f"   Min Conf:  {config.confidence:.0%}")
    print(f"   Mode:      {'DRY RUN' if config.dry_run else 'LIVE'}")
    print(f"   Testnet:   {'Yes' if config.binance_testnet else 'No (LIVE MONEY!)'}")
    print("-" * 50)
    
    adapter = get_binance_adapter(config)
    trades_executed = 0
    cycles = 0
    
    while running:
        cycles += 1
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Cycle #{cycles}")
        
        for pair in config.pairs:
            if not running:
                break
                
            signal = generate_crypto_signal(pair)
            print_signal(signal)
            
            if signal.direction == "NO TRADE":
                continue
            
            if signal.confidence < config.confidence:
                print(f"   ⚠️ Confidence too low ({signal.confidence:.1%}), skipping")
                continue
            
            result = execute_crypto_trade(adapter, pair, signal, config.dry_run)
            
            if result:
                trades_executed += 1
                print(f"   ✓ Trade executed: Ticket #{result['ticket']}")
                print(f"   💰 Entry: {result['entry_price']}")
                # Only trade one pair per cycle
                break
        
        if running:
            print(f"\n⏳ Waiting {config.interval}s... (Press Ctrl+C to stop)")
            try:
                time.sleep(config.interval)
            except KeyboardInterrupt:
                break
    
    print(f"\n📊 Summary: {cycles} cycles, {trades_executed} trades executed")


# ============================================================================
# Signal Mode (No Broker)
# ============================================================================

def run_signal_mode(config: CLIConfig) -> None:
    """Run in signal-only mode (no broker connection)."""
    global running
    
    print("\n📊 SIGNAL MODE (No Trading)")
    print(f"   Pairs:     {', '.join(config.pairs)}")
    print(f"   Interval:  {config.interval} seconds")
    print(f"   Min Conf:  {config.confidence:.0%}")
    print("-" * 50)
    
    cycles = 0
    
    while running:
        cycles += 1
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Cycle #{cycles}")
        
        for pair in config.pairs:
            if not running:
                break
            
            if config.mode == "forex":
                signal = generate_forex_signal(pair)
            else:
                signal = generate_crypto_signal(pair)
            
            print_signal(signal)
            
            if signal.direction != "NO TRADE" and signal.confidence >= config.confidence:
                print(f"   📡 SIGNAL ALERT: {signal.direction} {pair} @ {signal.confidence:.0%}")
        
        if running:
            print(f"\n⏳ Waiting {config.interval}s... (Press Ctrl+C to stop)")
            try:
                time.sleep(config.interval)
            except KeyboardInterrupt:
                break
    
    print(f"\n📊 Summary: {cycles} cycles completed")


# ============================================================================
# Main Entry
# ============================================================================

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Apex Auto-Trader CLI - Minimal trading bot",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Signal mode (no trading, just analysis)
  python cli.py --mode forex --pairs EURUSD,GBPUSD,XAUUSD

  # Dry run (shows what would trade without executing)
  python cli.py --mode forex --pairs EURUSD --dry-run

  # Live forex trading with MT5
  python cli.py --mode forex --pairs EURUSD,GBPUSD \\
      --mt5-login 123456 --mt5-password "pass" --mt5-server "Broker-Server"

  # Live crypto trading with Binance
  python cli.py --mode crypto --pairs BTCUSDT,ETHUSDT \\
      --binance-key "YOUR_KEY" --binance-secret "YOUR_SECRET" --binance-live
        """
    )
    
    parser.add_argument(
        "--mode", "-m",
        choices=["forex", "crypto"],
        default="forex",
        help="Trading mode (default: forex)"
    )
    parser.add_argument(
        "--pairs", "-p",
        default="EURUSD=X,GBPUSD=X,XAUUSD=X",
        help="Comma-separated pairs (default: EURUSD=X,GBPUSD=X,XAUUSD=X)"
    )
    parser.add_argument(
        "--interval", "-i",
        type=int,
        default=300,
        help="Cycle interval in seconds (default: 300 = 5 min)"
    )
    parser.add_argument(
        "--confidence", "-c",
        type=float,
        default=0.65,
        help="Minimum signal confidence 0.0-1.0 (default: 0.65)"
    )
    parser.add_argument(
        "--dry-run", "-d",
        action="store_true",
        help="Show signals without executing trades"
    )
    
    # MT5 options
    mt5_group = parser.add_argument_group("MT5 (Forex) Options")
    mt5_group.add_argument("--mt5-login", type=int, help="MT5 account login")
    mt5_group.add_argument("--mt5-password", help="MT5 account password")
    mt5_group.add_argument("--mt5-server", help="MT5 broker server name")
    mt5_group.add_argument("--mt5-path", help="MT5 terminal path (optional)")
    
    # Binance options
    binance_group = parser.add_argument_group("Binance (Crypto) Options")
    binance_group.add_argument("--binance-key", help="Binance API key")
    binance_group.add_argument("--binance-secret", help="Binance API secret")
    binance_group.add_argument("--binance-live", action="store_true", help="Use live Binance (default: testnet)")
    
    args = parser.parse_args()
    
    # Build config
    config = CLIConfig(
        mode=args.mode,
        pairs=[p.strip() for p in args.pairs.split(",") if p.strip()],
        interval=args.interval,
        confidence=args.confidence,
        risk_percent=1.0,
        dry_run=args.dry_run,
        mt5_login=args.mt5_login,
        mt5_password=args.mt5_password,
        mt5_server=args.mt5_server,
        mt5_path=args.mt5_path,
        binance_api_key=args.binance_key,
        binance_api_secret=args.binance_secret,
        binance_testnet=not args.binance_live,
    )
    
    # Validate
    if not config.dry_run:
        if config.mode == "forex":
            if not all([config.mt5_login, config.mt5_password, config.mt5_server]):
                print("Error: MT5 trading requires --mt5-login, --mt5-password, --mt5-server")
                print("Use --dry-run to test without credentials")
                sys.exit(1)
        elif config.mode == "crypto":
            if not all([config.binance_api_key, config.binance_api_secret]):
                print("Error: Binance trading requires --binance-key and --binance-secret")
                print("Use --dry-run to test without credentials")
                sys.exit(1)
    
    # Setup signal handler
    signal.signal(signal.SIGINT, signal_handler)
    
    # Print header
    print("=" * 50)
    print("  APEX AUTO-TRADER CLI")
    print("  Minimal Command-Line Trading Bot")
    print("=" * 50)
    
    try:
        if config.dry_run or (config.mode == "forex" and not config.mt5_login) or (config.mode == "crypto" and not config.binance_api_key):
            run_signal_mode(config)
        elif config.mode == "forex":
            run_forex_loop(config)
        else:
            run_crypto_loop(config)
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n💥 Fatal error: {e}")
        sys.exit(1)
    
    print("\n✅ Trading session ended")


if __name__ == "__main__":
    main()
