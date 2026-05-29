"""Application configuration from environment variables."""

import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment."""
    
    # Database
    database_url: str = "postgresql://user:pass@localhost:5432/apex_auto_trader"
    
    # JWT
    jwt_secret: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    
    # Google OAuth
    google_client_id: str = ""
    
    # Admin
    admin_email: str = "admin@apextrader.com"
    admin_password: str = "admin123"
    
    # Server
    backend_port: int = 8000
    frontend_url: str = "http://localhost:5173"
    
    # Trading
    default_forex_pairs: str = "EURUSD=X,GBPUSD=X,USDJPY=X,XAUUSD=X"
    default_crypto_pairs: str = "BTCUSDT,ETHUSDT"
    forex_interval_minutes: int = 5
    crypto_interval_minutes: int = 2
    default_risk_per_trade: float = 1.0
    default_rr_ratio: float = 2.0
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"
    
    @property
    def forex_pairs_list(self) -> list[str]:
        return [p.strip() for p in self.default_forex_pairs.split(",") if p.strip()]
    
    @property
    def crypto_pairs_list(self) -> list[str]:
        return [p.strip() for p in self.default_crypto_pairs.split(",") if p.strip()]


# Global settings instance
settings = Settings()

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
