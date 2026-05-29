"""Auto-trading control endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List
from backend.database import get_db
from backend.models import User
from backend.auth import get_current_user
from backend.services.scheduler import get_scheduler_status, start_trading, stop_trading

router = APIRouter(prefix="/api/trading", tags=["Trading"])


# Schemas
class TradingSettings(BaseModel):
    enabled: bool = False
    forex_pairs: List[str] = []
    crypto_pairs: List[str] = []
    risk_per_trade: float = 1.0
    rr_ratio: float = 2.0


class TradingStatus(BaseModel):
    enabled: bool
    forex_running: bool
    crypto_running: bool
    next_forex_run: Optional[str]
    next_crypto_run: Optional[str]
    settings: dict


@router.get("/status", response_model=TradingStatus)
def get_status(user: User = Depends(get_current_user)):
    """Get auto-trading status for current user."""
    status_info = get_scheduler_status(user.id)
    
    return {
        "enabled": status_info.get("enabled", False),
        "forex_running": status_info.get("forex_running", False),
        "crypto_running": status_info.get("crypto_running", False),
        "next_forex_run": status_info.get("next_forex_run"),
        "next_crypto_run": status_info.get("next_crypto_run"),
        "settings": status_info.get("settings", {}),
    }


@router.post("/start")
def start_auto_trading(
    settings: TradingSettings,
    user: User = Depends(get_current_user)
):
    """Start auto-trading with given settings."""
    try:
        start_trading(
            user_id=user.id,
            forex_pairs=settings.forex_pairs,
            crypto_pairs=settings.crypto_pairs,
            risk_per_trade=settings.risk_per_trade,
            rr_ratio=settings.rr_ratio,
        )
        
        return {
            "status": "ok",
            "message": "Auto-trading started",
            "settings": settings.dict(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start trading: {str(e)}",
        )


@router.post("/stop")
def stop_auto_trading(user: User = Depends(get_current_user)):
    """Stop auto-trading."""
    try:
        stop_trading(user.id)
        
        return {
            "status": "ok",
            "message": "Auto-trading stopped",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to stop trading: {str(e)}",
        )


@router.put("/settings")
def update_settings(
    settings: TradingSettings,
    user: User = Depends(get_current_user)
):
    """Update trading settings."""
    # TODO: Store settings in database
    
    return {
        "status": "ok",
        "message": "Settings updated",
        "settings": settings.dict(),
    }
