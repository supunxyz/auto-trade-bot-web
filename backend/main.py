"""Apex Auto-Trader FastAPI application."""

import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database import init_database, check_connection
from backend.services.scheduler import start_scheduler, shutdown_scheduler
from backend.routers import auth, admin, accounts, trading, positions


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    print("=" * 50)
    print("Apex Auto-Trader Starting...")
    print("=" * 50)
    
    # Check database
    if check_connection():
        print("✓ Database connected")
        init_database()
    else:
        print("✗ Database connection failed")
        sys.exit(1)
    
    # Seed admin user
    from scripts.init_db import seed_admin
    seed_admin()
    
    # Start scheduler
    start_scheduler()
    
    print("=" * 50)
    print(f"API ready at http://0.0.0.0:{settings.backend_port}")
    print("=" * 50)
    
    yield
    
    # Shutdown
    print("Shutting down...")
    shutdown_scheduler()
    print("✓ Shutdown complete")


# Create app
app = FastAPI(
    title="Apex Auto-Trader API",
    description="Automated trading service for MT5 and Binance",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(accounts.router)
app.include_router(trading.router)
app.include_router(positions.router)


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "apex-auto-trader"}


@app.get("/")
def root():
    """Root redirect to health."""
    return {"message": "Apex Auto-Trader API", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=settings.backend_port,
        reload=True,
    )
