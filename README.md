# Apex Auto-Trader

Standalone auto-trading web service for MT5 Forex and Binance Crypto.

## Features

- **Web-based control panel** — Start/stop auto-trading from anywhere
- **CLI mode** — Run without web server, no database required
- **Dual broker support** — MT5 (Forex) + Binance (Crypto)
- **Smart signals** — ICT/SMC/Wyckoff analysis
- **Auto basket management** — Profit target auto-close
- **JWT + Google OAuth** — Secure authentication
- **Admin dashboard** — Manage users and monitor activity
- **PostgreSQL** — Reliable data persistence (optional for CLI)

## Quick Start

### Web Mode

```bash
copy .env.example .env
pip install -r requirements.txt
npm install
python scripts/init_db.py

# Terminal 1 - Backend
python backend/main.py

# Terminal 2 - Frontend
npm run dev
```

Open http://localhost:5173

### CLI Mode (No Database, No Web Server)

```bash
# Signal mode (analysis only)
python cli.py --mode forex --pairs EURUSD=X,GBPUSD=X

# Dry run
python cli.py --mode forex --pairs EURUSD=X --dry-run

# Live forex with MT5
python cli.py --mode forex --pairs EURUSD=X,GBPUSD=X \
    --mt5-login 123456 --mt5-password "pass" --mt5-server "Broker-Server"

# Live crypto with Binance
python cli.py --mode crypto --pairs BTCUSDT,ETHUSDT \
    --binance-key "YOUR_KEY" --binance-secret "YOUR_SECRET"
```

## Deployment

### Backend (Railway)
1. Create PostgreSQL database
2. Deploy from GitHub
3. Set environment variables
4. Run `python scripts/init_db.py`

### Frontend (Vercel)
1. Connect GitHub repo
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_URL` environment variable

## Architecture

```
Frontend (React + Vite)  ──API──>  Backend (FastAPI)
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
               PostgreSQL         Scheduler          Brokers
                                    (APSched)      (MT5/Binance)
```

Or use CLI mode directly without the web layer.

## License

Proprietary - Apex Taurus
