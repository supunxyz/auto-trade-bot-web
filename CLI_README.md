# Apex Auto-Trader CLI

Minimal command-line trading bot. No database. No web server. Just trading.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Signal mode (analysis only, no trades)
python cli.py --mode forex --pairs EURUSD=X,GBPUSD=X

# Dry run (see what would trade)
python cli.py --mode forex --pairs EURUSD=X --dry-run

# Live forex with MT5
python cli.py --mode forex --pairs EURUSD=X,GBPUSD=X \
    --mt5-login 123456 \
    --mt5-password "your_password" \
    --mt5-server "Broker-Server"

# Live crypto with Binance
python cli.py --mode crypto --pairs BTCUSDT,ETHUSDT \
    --binance-key "YOUR_API_KEY" \
    --binance-secret "YOUR_SECRET"
```

## Options

| Option | Description |
|--------|-------------|
| `--mode` | `forex` or `crypto` |
| `--pairs` | Comma-separated pairs |
| `--interval` | Cycle interval in seconds (default: 300) |
| `--confidence` | Minimum confidence 0.0-1.0 (default: 0.65) |
| `--dry-run` | Simulate without executing |

## MT5 Credentials

- `--mt5-login` - Account number
- `--mt5-password` - Account password
- `--mt5-server` - Broker server name
- `--mt5-path` - Terminal path (optional)

## Binance Credentials

- `--binance-key` - API key
- `--binance-secret` - API secret
- `--binance-live` - Use live (default: testnet)

## Stop the Bot

Press `Ctrl+C` to stop gracefully.
