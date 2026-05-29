# Apex Auto-Trader

Standalone auto-trading web service for MT5 Forex and Binance Crypto.

## Features

- **Web-based control panel** — Start/stop auto-trading from anywhere
- **Dual broker support** — MT5 (Forex) + Binance (Crypto)
- **Smart signals** — ICT/SMC/Wyckoff analysis
- **Auto basket management** — Profit target auto-close
- **JWT + Google OAuth** — Secure authentication
- **Admin dashboard** — Manage users and monitor activity
- **PostgreSQL** — Reliable data persistence

## Quick Start

### 1. Setup Environment

```bash
copy .env.example .env
# Edit .env with your database and Google OAuth credentials
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
npm install
```

### 3. Initialize Database

```bash
python scripts/init_db.py
```

### 4. Start Development

```bash
# Terminal 1 - Backend
python backend/main.py

# Terminal 2 - Frontend
npm run dev
```

Open http://localhost:5173

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

## License

Proprietary - Apex Taurus
