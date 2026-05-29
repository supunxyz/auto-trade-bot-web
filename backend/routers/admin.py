"""Admin dashboard endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, BrokerAccount, OpenPosition, ClosedTrade
from backend.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class UserListItem(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    created_at: str
    account_count: int


class UserDetail(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    is_admin: bool
    created_at: str
    accounts: list
    stats: dict


class PlatformStats(BaseModel):
    total_users: int
    active_users: int
    total_accounts: int
    total_positions: int
    total_trades: int
    total_pnl: float


@router.get("/users", response_model=list[UserListItem])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """List all users with account counts."""
    users = db.query(User).offset(skip).limit(limit).all()
    
    result = []
    for user in users:
        account_count = db.query(BrokerAccount).filter(
            BrokerAccount.user_id == user.id
        ).count()
        
        result.append({
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "account_count": account_count,
        })
    
    return result


@router.get("/users/{user_id}", response_model=UserDetail)
def get_user_detail(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Get detailed user info including accounts and stats."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Get accounts
    accounts = db.query(BrokerAccount).filter(
        BrokerAccount.user_id == user.id
    ).all()
    
    # Get stats
    position_count = db.query(OpenPosition).filter(
        OpenPosition.user_id == user.id
    ).count()
    
    trade_stats = db.query(
        func.count(ClosedTrade.id).label("count"),
        func.sum(ClosedTrade.pnl).label("pnl")
    ).filter(ClosedTrade.user_id == user.id).first()
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "accounts": [a.to_dict() for a in accounts],
        "stats": {
            "open_positions": position_count,
            "closed_trades": trade_stats.count or 0,
            "total_pnl": float(trade_stats.pnl or 0),
        }
    }


@router.post("/users/{user_id}/suspend")
def suspend_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Suspend a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot suspend yourself",
        )
    
    user.is_active = False
    db.commit()
    
    return {"status": "ok", "message": f"User {user.email} suspended"}


@router.post("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Reactivate a suspended user account."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user.is_active = True
    db.commit()
    
    return {"status": "ok", "message": f"User {user.email} activated"}


@router.get("/stats", response_model=PlatformStats)
def get_platform_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Get platform-wide statistics."""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_accounts = db.query(BrokerAccount).count()
    total_positions = db.query(OpenPosition).count()
    total_trades = db.query(ClosedTrade).count()
    
    pnl_result = db.query(func.sum(ClosedTrade.pnl)).scalar()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_accounts": total_accounts,
        "total_positions": total_positions,
        "total_trades": total_trades,
        "total_pnl": float(pnl_result or 0),
    }
