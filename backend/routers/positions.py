"""Position management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from backend.database import get_db
from backend.models import User, OpenPosition, ClosedTrade, BrokerAccount
from backend.auth import get_current_user

router = APIRouter(prefix="/api/positions", tags=["Positions"])


@router.get("/open")
def list_open_positions(
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List current open positions."""
    query = db.query(OpenPosition).filter(OpenPosition.user_id == user.id)
    
    if account_id:
        query = query.filter(OpenPosition.account_id == account_id)
    
    positions = query.order_by(OpenPosition.opened_at.desc()).all()
    
    # Calculate running P&L (simplified - would need live prices)
    result = []
    for pos in positions:
        data = pos.to_dict()
        data["running_pnl"] = 0.0  # Would calculate from current price
        data["account_name"] = pos.account.name if pos.account else None
        result.append(data)
    
    return {
        "count": len(result),
        "positions": result,
    }


@router.get("/history")
def get_trade_history(
    account_id: Optional[int] = None,
    symbol: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get closed trade history."""
    query = db.query(ClosedTrade).filter(ClosedTrade.user_id == user.id)
    
    if account_id:
        query = query.filter(ClosedTrade.account_id == account_id)
    
    if symbol:
        query = query.filter(ClosedTrade.symbol == symbol)
    
    total = query.count()
    
    trades = query.order_by(
        ClosedTrade.closed_at.desc()
    ).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "trades": [t.to_dict() for t in trades],
    }


@router.get("/stats")
def get_position_stats(
    days: int = 30,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get trading statistics."""
    from datetime import datetime, timedelta
    
    since = datetime.utcnow() - timedelta(days=days)
    
    # Basic stats
    total_trades = db.query(ClosedTrade).filter(
        ClosedTrade.user_id == user.id,
        ClosedTrade.closed_at >= since
    ).count()
    
    winning_trades = db.query(ClosedTrade).filter(
        ClosedTrade.user_id == user.id,
        ClosedTrade.closed_at >= since,
        ClosedTrade.pnl > 0
    ).count()
    
    losing_trades = db.query(ClosedTrade).filter(
        ClosedTrade.user_id == user.id,
        ClosedTrade.closed_at >= since,
        ClosedTrade.pnl < 0
    ).count()
    
    total_pnl = db.query(func.sum(ClosedTrade.pnl)).filter(
        ClosedTrade.user_id == user.id,
        ClosedTrade.closed_at >= since
    ).scalar() or 0
    
    # By symbol
    by_symbol = db.query(
        ClosedTrade.symbol,
        func.count(ClosedTrade.id).label("count"),
        func.sum(ClosedTrade.pnl).label("pnl")
    ).filter(
        ClosedTrade.user_id == user.id,
        ClosedTrade.closed_at >= since
    ).group_by(ClosedTrade.symbol).all()
    
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
    
    return {
        "period_days": days,
        "total_trades": total_trades,
        "winning_trades": winning_trades,
        "losing_trades": losing_trades,
        "breakeven_trades": total_trades - winning_trades - losing_trades,
        "win_rate": round(win_rate, 2),
        "total_pnl": round(float(total_pnl), 2),
        "by_symbol": [
            {"symbol": s.symbol, "trades": s.count, "pnl": round(float(s.pnl or 0), 2)}
            for s in by_symbol
        ],
        "current_open": db.query(OpenPosition).filter(
            OpenPosition.user_id == user.id
        ).count(),
    }
