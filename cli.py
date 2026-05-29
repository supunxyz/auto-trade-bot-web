#!/usr/bin/env python3
"""Apex Auto-Trader CLI - Complete Standalone Version

Full-featured command-line trading bot with:
- Account management (login/save credentials)
- Trade history logging
- Local configuration storage
- Signal analysis and auto-trading

Usage:
    python cli.py                    # Interactive menu
    python cli.py trade --mode forex  # Start trading
    python cli.py account add         # Add broker account
"""

import sys
import os
import time
import json
import hashlib
import getpass
import argparse
import signal as signal_module
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Optional, Dict, List, Any, Union

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from backend.brokers import MT5Adapter, BinanceAdapter, BrokerError
from backend.signals.forex import generate_forex_signal, TradeSignal
from backend.signals.crypto import generate_crypto_signal, CryptoSignal


# ============================================================================
# Constants & Paths
# ============================================================================

APP_NAME = "Apex Auto-Trader CLI"
APP_VERSION = "2.0.0"

CLI_DIR = Path.home() / ".apex_trader"
ACCOUNTS_FILE = CLI_DIR / "accounts.json"
CONFIG_FILE = CLI_DIR / "config.json"
HISTORY_FILE = CLI_DIR / "trade_history.json"
LOG_FILE = CLI_DIR / "trading.log"

# Ensure directories exist
CLI_DIR.mkdir(exist_ok=True)


# ============================================================================
# Data Classes
# ============================================================================

@dataclass
class Account:
    """Broker account stored locally."""
    id: str
    name: str
    broker_type: str  # 'mt5' or 'binance'
    credentials: Dict[str, Any]
    is_active: bool = True
    created_at: str = ""
    
    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()


@dataclass
class TradeRecord:
    """Recorded trade for local history."""
    id: str
    timestamp: str
    broker_type: str
    account_name: str
    symbol: str
    side: str
    volume: float
    entry_price: float
    stop_loss: Optional[float]
    take_profit: Optional[float]
    ticket: str
    status: str = "open"  # open, closed, error
    close_price: Optional[float] = None
    profit: Optional[float] = None
    close_time: Optional[str] = None
    notes: str = ""


@dataclass
class TradingConfig:
    """Trading configuration."""
    mode: str = "forex"
    pairs: List[str] = None
    interval: int = 300
    confidence: float = 0.65
    risk_percent: float = 1.0
    dry_run: bool = False
    max_trades_per_cycle: int = 1
    auto_close_on_tp_sl: bool = True
    
    def __post_init__(self):
        if self.pairs is None:
            self.pairs = ["EURUSD=X", "GBPUSD=X", "XAUUSD=X"]


# ============================================================================
# Storage / Persistence
# ============================================================================

class LocalStorage:
    """Simple JSON file storage."""
    
    @staticmethod
    def load_accounts() -> List[Account]:
        """Load saved accounts."""
        if not ACCOUNTS_FILE.exists():
            return []
        try:
            with open(ACCOUNTS_FILE, 'r') as f:
                data = json.load(f)
                return [Account(**acc) for acc in data.get('accounts', [])]
        except Exception:
            return []
    
    @staticmethod
    def save_accounts(accounts: List[Account]) -> None:
        """Save accounts to file."""
        data = {
            'accounts': [asdict(acc) for acc in accounts],
            'updated_at': datetime.now().isoformat()
        }
        with open(ACCOUNTS_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    
    @staticmethod
    def load_config() -> TradingConfig:
        """Load trading config."""
        if not CONFIG_FILE.exists():
            return TradingConfig()
        try:
            with open(CONFIG_FILE, 'r') as f:
                data = json.load(f)
                return TradingConfig(**data)
        except Exception:
            return TradingConfig()
    
    @staticmethod
    def save_config(config: TradingConfig) -> None:
        """Save trading config."""
        with open(CONFIG_FILE, 'w') as f:
            json.dump(asdict(config), f, indent=2)
    
    @staticmethod
    def log_trade(record: TradeRecord) -> None:
        """Log a trade to history."""
        history = []
        if HISTORY_FILE.exists():
            try:
                with open(HISTORY_FILE, 'r') as f:
                    history = json.load(f)
            except Exception:
                pass
        
        history.append(asdict(record))
        
        with open(HISTORY_FILE, 'w') as f:
            json.dump(history, f, indent=2)
    
    @staticmethod
    def get_trade_history(limit: int = 100) -> List[Dict]:
        """Get recent trade history."""
        if not HISTORY_FILE.exists():
            return []
        try:
            with open(HISTORY_FILE, 'r') as f:
                history = json.load(f)
                return history[-limit:]
        except Exception:
            return []
    
    @staticmethod
    def write_log(message: str) -> None:
        """Write to log file."""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        with open(LOG_FILE, 'a') as f:
            f.write(f"[{timestamp}] {message}\n")


# ============================================================================
# Account Manager
# ============================================================================

class AccountManager:
    """Manage broker accounts."""
    
    def __init__(self):
        self.storage = LocalStorage()
        self.accounts = self.storage.load_accounts()
    
    def list_accounts(self) -> None:
        """Display all accounts."""
        print("\n📋 Saved Accounts:")
        print("-" * 60)
        
        if not self.accounts:
            print("   No accounts saved yet.")
            print("   Use 'python cli.py account add' to add one.")
            return
        
        for i, acc in enumerate(self.accounts, 1):
            status = "✅ Active" if acc.is_active else "⏸️  Inactive"
            broker_emoji = "📈" if acc.broker_type == "mt5" else "₿"
            print(f"   {i}. {broker_emoji} {acc.name}")
            print(f"      Type: {acc.broker_type.upper()} | {status}")
            print(f"      Created: {acc.created_at[:10]}")
            print()
    
    def add_account(self) -> None:
        """Interactive add account."""
        print("\n➕ Add New Account")
        print("-" * 40)
        
        print("\nSelect broker type:")
        print("   1. MetaTrader 5 (Forex)")
        print("   2. Binance (Crypto)")
        
        choice = input("\nChoice (1/2): ").strip()
        
        if choice == "1":
            self._add_mt5_account()
        elif choice == "2":
            self._add_binance_account()
        else:
            print("❌ Invalid choice")
    
    def _add_mt5_account(self) -> None:
        """Add MT5 account."""
        print("\n📈 MT5 Account Setup")
        
        name = input("Account name (e.g., MyForexAccount): ").strip()
        if not name:
            print("❌ Name required")
            return
        
        try:
            login = int(input("MT5 Login ID: ").strip())
        except ValueError:
            print("❌ Login must be a number")
            return
        
        password = getpass.getpass("MT5 Password: ")
        server = input("MT5 Server (e.g., BrokerName-Server): ").strip()
        path = input("MT5 Terminal path (optional, press Enter to skip): ").strip()
        
        account = Account(
            id=hashlib.md5(f"{name}{login}".encode()).hexdigest()[:8],
            name=name,
            broker_type="mt5",
            credentials={
                "login": login,
                "password": password,
                "server": server,
                "path": path if path else None
            }
        )
        
        self.accounts.append(account)
        self.storage.save_accounts(self.accounts)
        print(f"\n✅ Account '{name}' saved successfully!")
    
    def _add_binance_account(self) -> None:
        """Add Binance account."""
        print("\n₿ Binance Account Setup")
        
        name = input("Account name (e.g., MyBinance): ").strip()
        if not name:
            print("❌ Name required")
            return
        
        api_key = input("Binance API Key: ").strip()
        api_secret = input("Binance API Secret: ").strip()
        
        print("\nAccount type:")
        print("   1. Testnet (paper trading)")
        print("   2. Live (real money)")
        testnet_choice = input("Choice (1/2): ").strip()
        testnet = testnet_choice == "1"
        
        account = Account(
            id=hashlib.md5(f"{name}{api_key[:10]}".encode()).hexdigest()[:8],
            name=name,
            broker_type="binance",
            credentials={
                "api_key": api_key,
                "api_secret": api_secret,
                "testnet": testnet
            }
        )
        
        self.accounts.append(account)
        self.storage.save_accounts(self.accounts)
        print(f"\n✅ Account '{name}' saved successfully!")
        if testnet:
            print("   Mode: Testnet (safe for testing)")
        else:
            print("   ⚠️  Mode: LIVE - Real money will be used!")
    
    def delete_account(self) -> None:
        """Delete an account."""
        self.list_accounts()
        
        if not self.accounts:
            return
        
        try:
            idx = int(input("\nEnter number to delete: ")) - 1
            if 0 <= idx < len(self.accounts):
                acc = self.accounts.pop(idx)
                self.storage.save_accounts(self.accounts)
                print(f"✅ Account '{acc.name}' deleted")
            else:
                print("❌ Invalid number")
        except ValueError:
            print("❌ Please enter a number")
    
    def get_active_account(self, broker_type: str) -> Optional[Account]:
        """Get first active account of type."""
        for acc in self.accounts:
            if acc.broker_type == broker_type and acc.is_active:
                return acc
        return None
    
    def toggle_account(self) -> None:
        """Toggle account active/inactive."""
        self.list_accounts()
        
        if not self.accounts:
            return
        
        try:
            idx = int(input("\nEnter number to toggle: ")) - 1
            if 0 <= idx < len(self.accounts):
                acc = self.accounts[idx]
                acc.is_active = not acc.is_active
                self.storage.save_accounts(self.accounts)
                status = "activated" if acc.is_active else "deactivated"
                print(f"✅ Account '{acc.name}' {status}")
            else:
                print("❌ Invalid number")
        except ValueError:
            print("❌ Please enter a number")


# ============================================================================
# Trading Engine
# ============================================================================

class TradingEngine:
    """Main trading engine."""
    
    def __init__(self):
        self.storage = LocalStorage()
        self.account_manager = AccountManager()
        self.config = self.storage.load_config()
        self.running = False
        signal_module.signal(signal_module.SIGINT, self._signal_handler)
    
    def _signal_handler(self, sig, frame):
        """Handle Ctrl+C."""
        print("\n\n🛑 Stopping trading bot...")
        self.running = False
    
    def _get_adapter(self, account: Account):
        """Create broker adapter from account."""
        if account.broker_type == "mt5":
            return MT5Adapter(account.credentials)
        elif account.broker_type == "binance":
            return BinanceAdapter(account.credentials)
        raise ValueError(f"Unknown broker type: {account.broker_type}")
    
    def _execute_trade(self, account: Account, pair: str, signal: Union[TradeSignal, CryptoSignal]) -> Optional[TradeRecord]:
        """Execute a single trade."""
        adapter = self._get_adapter(account)
        
        try:
            adapter.connect()
            
            # Determine volume
            if account.broker_type == "mt5":
                volume = 0.01
            else:
                volume = 0.001 if "BTC" in pair else 0.01
            
            result = adapter.place_market_order(
                symbol=pair,
                side=signal.direction,
                volume=volume,
                stop_loss=signal.stop_loss,
                take_profit=signal.take_profit,
                comment=f"cli_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            )
            
            adapter.disconnect()
            
            record = TradeRecord(
                id=hashlib.md5(f"{result.ticket}{datetime.now()}".encode()).hexdigest()[:12],
                timestamp=datetime.now().isoformat(),
                broker_type=account.broker_type,
                account_name=account.name,
                symbol=pair,
                side=signal.direction,
                volume=volume,
                entry_price=result.entry_price,
                stop_loss=signal.stop_loss,
                take_profit=signal.take_profit,
                ticket=str(result.ticket),
                status="open"
            )
            
            self.storage.log_trade(record)
            self.storage.write_log(f"TRADE OPENED: {pair} {signal.direction} @ {result.entry_price}")
            
            return record
            
        except BrokerError as e:
            print(f"   ✗ Broker error: {e}")
            self.storage.write_log(f"ERROR: Trade failed for {pair}: {e}")
            return None
        except Exception as e:
            print(f"   ✗ Error: {e}")
            self.storage.write_log(f"ERROR: {e}")
            return None
    
    def _check_and_update_positions(self, account: Account) -> None:
        """Check open positions and update status."""
        try:
            adapter = self._get_adapter(account)
            adapter.connect()
            positions = adapter.get_open_positions()
            adapter.disconnect()
            
            history = self.storage.get_trade_history(1000)
            current_tickets = {p.get('ticket') or p.get('id') for p in positions}
            
            # Update closed positions
            for trade in history:
                if trade['status'] == 'open' and trade['ticket'] not in current_tickets:
                    trade['status'] = 'closed'
                    trade['close_time'] = datetime.now().isoformat()
                    # Would need actual close price from broker
            
        except Exception as e:
            print(f"   ⚠️ Could not check positions: {e}")
    
    def run_trading(self, mode: Optional[str] = None, dry_run: bool = False) -> None:
        """Run the main trading loop."""
        self.running = True
        
        # Use provided mode or config mode
        trading_mode = mode or self.config.mode
        
        # Get account
        account = self.account_manager.get_active_account(trading_mode)
        if not account and not dry_run:
            print(f"\n❌ No active {trading_mode} account found!")
            print("   Add an account first:")
            print(f"   python cli.py account add")
            return
        
        # Print header
        print("\n" + "=" * 60)
        print(f"  {APP_NAME} v{APP_VERSION}")
        print("=" * 60)
        
        print(f"\n📊 Trading Configuration:")
        print(f"   Mode:      {trading_mode.upper()}")
        print(f"   Pairs:     {', '.join(self.config.pairs)}")
        print(f"   Interval:  {self.config.interval} seconds")
        print(f"   Min Conf:  {self.config.confidence:.0%}")
        print(f"   Type:      {'DRY RUN' if dry_run else 'LIVE'}")
        
        if account:
            broker_emoji = "📈" if account.broker_type == "mt5" else "₿"
            print(f"   Account:   {broker_emoji} {account.name}")
        
        print("-" * 60)
        print("\n⏳ Press Ctrl+C to stop\n")
        
        trades_count = 0
        cycles = 0
        
        while self.running:
            cycles += 1
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Cycle #{cycles}")
            
            # Check positions periodically
            if account and cycles % 5 == 0:
                self._check_and_update_positions(account)
            
            # Generate signals and trade
            traded_this_cycle = False
            
            for pair in self.config.pairs:
                if not self.running or traded_this_cycle:
                    break
                
                # Generate signal
                if trading_mode == "forex":
                    signal = generate_forex_signal(pair)
                else:
                    signal = generate_crypto_signal(pair)
                
                # Display signal
                self._print_signal(signal)
                
                # Check if tradeable
                if signal.direction == "NO TRADE":
                    continue
                
                if signal.confidence < self.config.confidence:
                    print(f"   ⚠️ Confidence too low ({signal.confidence:.1%})")
                    continue
                
                # Execute or simulate
                if dry_run:
                    print(f"   [DRY RUN] Would execute {signal.direction} {pair}")
                    self.storage.write_log(f"DRY RUN: {pair} {signal.direction} @ {signal.confidence:.1%}")
                else:
                    record = self._execute_trade(account, pair, signal)
                    if record:
                        trades_count += 1
                        print(f"   ✅ Trade #{record.ticket} executed!")
                        traded_this_cycle = True
            
            # Wait for next cycle
            if self.running:
                try:
                    time.sleep(self.config.interval)
                except KeyboardInterrupt:
                    break
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TRADING SESSION SUMMARY")
        print("=" * 60)
        print(f"   Cycles completed: {cycles}")
        print(f"   Trades executed:  {trades_count}")
        print(f"   Log file:        {LOG_FILE}")
        print(f"   History file:    {HISTORY_FILE}")
        print("=" * 60)
    
    def _print_signal(self, signal: Union[TradeSignal, CryptoSignal]) -> None:
        """Pretty print signal."""
        if signal.direction == "BUY":
            emoji, color = "🟢 BUY", ""
        elif signal.direction == "SELL":
            emoji, color = "🔴 SELL", ""
        else:
            emoji, color = "⚪ NO TRADE", ""
        
        print(f"\n   {emoji} {signal.pair}")
        
        if signal.direction != "NO TRADE":
            print(f"      Confidence: {signal.confidence:.1%}")
            print(f"      Entry:      {signal.entry}")
            print(f"      Stop Loss:  {signal.stop_loss}")
            print(f"      Take Profit:{signal.take_profit}")
    
    def show_stats(self) -> None:
        """Show trading statistics."""
        history = self.storage.get_trade_history(1000)
        
        print("\n📊 Trading Statistics")
        print("-" * 60)
        
        if not history:
            print("   No trades recorded yet.")
            return
        
        total_trades = len(history)
        open_trades = sum(1 for t in history if t['status'] == 'open')
        closed_trades = sum(1 for t in history if t['status'] == 'closed')
        profits = [t.get('profit', 0) for t in history if t.get('profit')]
        
        print(f"   Total Trades:  {total_trades}")
        print(f"   Open:          {open_trades}")
        print(f"   Closed:        {closed_trades}")
        
        if profits:
            total_profit = sum(profits)
            avg_profit = total_profit / len(profits)
            winning = sum(1 for p in profits if p > 0)
            win_rate = winning / len(profits) * 100
            
            print(f"   Total P&L:     {total_profit:+.2f}")
            print(f"   Avg Trade:     {avg_profit:+.2f}")
            print(f"   Win Rate:      {win_rate:.1f}%")
        
        print(f"\n   Recent Trades:")
        for t in history[-5:]:
            status_emoji = "🟢" if t['status'] == 'open' else "⚪"
            profit_str = f" ({t.get('profit', 0):+.2f})" if t.get('profit') else ""
            print(f"   {status_emoji} {t['timestamp'][:16]} | {t['side']} {t['symbol']}{profit_str}")
        
        print(f"\n   Full history: {HISTORY_FILE}")
    
    def configure(self) -> None:
        """Interactive configuration."""
        print("\n⚙️  Trading Configuration")
        print("-" * 40)
        
        print(f"\nCurrent settings:")
        print(f"   Mode:     {self.config.mode}")
        print(f"   Pairs:    {', '.join(self.config.pairs)}")
        print(f"   Interval: {self.config.interval}s")
        print(f"   Confidence: {self.config.confidence:.0%}")
        
        print("\nEnter new values (press Enter to keep current):")
        
        mode = input(f"Mode (forex/crypto) [{self.config.mode}]: ").strip()
        if mode in ["forex", "crypto"]:
            self.config.mode = mode
        
        pairs = input(f"Pairs (comma-separated) [{','.join(self.config.pairs)}]: ").strip()
        if pairs:
            self.config.pairs = [p.strip() for p in pairs.split(",") if p.strip()]
        
        try:
            interval = input(f"Interval in seconds [{self.config.interval}]: ").strip()
            if interval:
                self.config.interval = int(interval)
        except ValueError:
            print("⚠️ Invalid interval, keeping current")
        
        try:
            conf = input(f"Min confidence 0.0-1.0 [{self.config.confidence}]: ").strip()
            if conf:
                self.config.confidence = float(conf)
        except ValueError:
            print("⚠️ Invalid confidence, keeping current")
        
        self.storage.save_config(self.config)
        print("\n✅ Configuration saved!")


# ============================================================================
# Signal Mode
# ============================================================================

def run_signal_only(config: TradingConfig) -> None:
    """Run signal analysis without trading."""
    print("\n📊 SIGNAL ANALYSIS MODE (No Trading)")
    print("-" * 60)
    print(f"   Pairs:     {', '.join(config.pairs)}")
    print(f"   Mode:      {config.mode}")
    print(f"   Interval:  {config.interval}s")
    print(f"   Min Conf:  {config.confidence:.0%}")
    print("-" * 60)
    print("\n⏳ Press Ctrl+C to stop\n")
    
    running = True
    
    def handler(sig, frame):
        global running
        running = False
    
    signal_module.signal(signal_module.SIGINT, handler)
    cycles = 0
    
    while running:
        cycles += 1
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Cycle #{cycles}")
        
        for pair in config.pairs:
            if not running:
                break
            
            if config.mode == "forex":
                signal = generate_forex_signal(pair)
            else:
                signal = generate_crypto_signal(pair)
            
            if signal.direction == "BUY":
                emoji = "🟢 BUY"
            elif signal.direction == "SELL":
                emoji = "🔴 SELL"
            else:
                emoji = "⚪ NO TRADE"
            
            alert = "📡 ALERT!" if signal.confidence >= config.confidence and signal.direction != "NO TRADE" else ""
            
            print(f"   {emoji} {pair} | Conf: {signal.confidence:.1%} {alert}")
        
        if running:
            try:
                time.sleep(config.interval)
            except KeyboardInterrupt:
                break
    
    print(f"\n✅ {cycles} cycles completed")


# ============================================================================
# Main Entry Point
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description=f"{APP_NAME} v{APP_VERSION} - Standalone CLI Trading Bot",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Commands:
  python cli.py                    # Interactive menu
  python cli.py trade              # Start trading with saved config
  python cli.py account            # Account management
  python cli.py signal             # Signal analysis mode
  python cli.py stats              # Show trading statistics
  python cli.py config             # Configure settings

Examples:
  # Interactive mode
  python cli.py

  # Quick start with signals only
  python cli.py signal --mode forex --pairs EURUSD=X

  # Start trading (requires account setup)
  python cli.py trade --mode forex --dry-run
        """
    )
    
    parser.add_argument(
        "command",
        nargs="?",
        choices=["trade", "account", "signal", "stats", "config"],
        help="Command to run (default: interactive menu)"
    )
    
    # Trading options
    parser.add_argument("--mode", "-m", choices=["forex", "crypto"], help="Trading mode")
    parser.add_argument("--pairs", "-p", help="Comma-separated pairs")
    parser.add_argument("--interval", "-i", type=int, help="Interval in seconds")
    parser.add_argument("--confidence", "-c", type=float, help="Min confidence 0.0-1.0")
    parser.add_argument("--dry-run", "-d", action="store_true", help="Simulate without trading")
    
    # Account subcommands
    parser.add_argument("--add", action="store_true", help="Add account (with 'account' command)")
    parser.add_argument("--list", action="store_true", help="List accounts (with 'account' command)")
    parser.add_argument("--delete", action="store_true", help="Delete account (with 'account' command)")
    parser.add_argument("--toggle", action="store_true", help="Toggle account active/inactive")
    
    args = parser.parse_args()
    
    # Load storage
    storage = LocalStorage()
    config = storage.load_config()
    
    # Override config with command line args
    if args.mode:
        config.mode = args.mode
    if args.pairs:
        config.pairs = [p.strip() for p in args.pairs.split(",") if p.strip()]
    if args.interval:
        config.interval = args.interval
    if args.confidence:
        config.confidence = args.confidence
    if args.dry_run:
        config.dry_run = True
    
    # Handle commands
    if args.command == "account":
        manager = AccountManager()
        if args.add:
            manager.add_account()
        elif args.delete:
            manager.delete_account()
        elif args.toggle:
            manager.toggle_account()
        else:
            manager.list_accounts()
    
    elif args.command == "trade":
        engine = TradingEngine()
        engine.config = config
        engine.run_trading(mode=config.mode, dry_run=config.dry_run)
    
    elif args.command == "signal":
        run_signal_only(config)
    
    elif args.command == "stats":
        engine = TradingEngine()
        engine.show_stats()
    
    elif args.command == "config":
        engine = TradingEngine()
        engine.configure()
    
    else:
        # Interactive menu
        interactive_menu()


def interactive_menu():
    """Show interactive menu."""
    engine = TradingEngine()
    manager = AccountManager()
    
    while True:
        print("\n" + "=" * 60)
        print(f"  {APP_NAME} v{APP_VERSION}")
        print("=" * 60)
        print("\n   1. 📈 Start Trading")
        print("   2. 📊 Signal Analysis (no trading)")
        print("   3. 👤 Account Management")
        print("   4. 📋 Trading Statistics")
        print("   5. ⚙️  Configuration")
        print("   6. 📁 View Log Files")
        print("   7. ❌ Exit")
        print("-" * 60)
        
        choice = input("Select option (1-7): ").strip()
        
        if choice == "1":
            print("\n   a. Forex (MT5)")
            print("   b. Crypto (Binance)")
            print("   c. Back")
            sub = input("\nChoice: ").strip().lower()
            
            if sub == "a":
                engine.run_trading(mode="forex", dry_run=False)
            elif sub == "b":
                engine.run_trading(mode="crypto", dry_run=False)
        
        elif choice == "2":
            run_signal_only(engine.config)
        
        elif choice == "3":
            print("\n   a. List Accounts")
            print("   b. Add Account")
            print("   c. Delete Account")
            print("   d. Toggle Active/Inactive")
            print("   e. Back")
            sub = input("\nChoice: ").strip().lower()
            
            if sub == "a":
                manager.list_accounts()
            elif sub == "b":
                manager.add_account()
            elif sub == "c":
                manager.delete_account()
            elif sub == "d":
                manager.toggle_account()
        
        elif choice == "4":
            engine.show_stats()
        
        elif choice == "5":
            engine.configure()
        
        elif choice == "6":
            print(f"\n📁 Data Directory: {CLI_DIR}")
            print(f"   Accounts:  {ACCOUNTS_FILE}")
            print(f"   Config:    {CONFIG_FILE}")
            print(f"   History:   {HISTORY_FILE}")
            print(f"   Log:       {LOG_FILE}")
        
        elif choice == "7":
            print("\n👋 Goodbye!")
            break


if __name__ == "__main__":
    main()
