"""Broker account management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from backend.database import get_db
from backend.models import User, BrokerAccount
from backend.auth import get_current_user

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


# Schemas
class MT5Credentials(BaseModel):
    login: int
    password: str
    server: str


class BinanceCredentials(BaseModel):
    api_key: str
    api_secret: str
    testnet: bool = False


class CreateAccountRequest(BaseModel):
    broker_type: str  # 'mt5' or 'binance'
    name: str
    credentials: dict


class UpdateAccountRequest(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    credentials: Optional[dict] = None


class AccountResponse(BaseModel):
    id: int
    broker_type: str
    name: str
    is_active: bool
    created_at: str


@router.get("", response_model=list[AccountResponse])
def list_accounts(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List user's broker accounts."""
    accounts = db.query(BrokerAccount).filter(
        BrokerAccount.user_id == user.id
    ).all()
    
    return [a.to_dict() for a in accounts]


@router.post("", response_model=AccountResponse)
def create_account(
    req: CreateAccountRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Add a new broker account."""
    # Validate broker_type
    if req.broker_type not in ["mt5", "binance"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="broker_type must be 'mt5' or 'binance'",
        )
    
    # Create account
    account = BrokerAccount(
        user_id=user.id,
        broker_type=req.broker_type,
        name=req.name,
        credentials=req.credentials,
        is_active=True,
    )
    
    db.add(account)
    db.commit()
    db.refresh(account)
    
    return account.to_dict()


@router.get("/{account_id}")
def get_account(
    account_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get account details."""
    account = db.query(BrokerAccount).filter(
        BrokerAccount.id == account_id,
        BrokerAccount.user_id == user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )
    
    return {
        **account.to_dict(),
        "credentials": account.credentials,  # Include for editing
    }


@router.put("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: int,
    req: UpdateAccountRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update account settings."""
    account = db.query(BrokerAccount).filter(
        BrokerAccount.id == account_id,
        BrokerAccount.user_id == user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )
    
    if req.name is not None:
        account.name = req.name
    
    if req.is_active is not None:
        account.is_active = req.is_active
    
    if req.credentials is not None:
        account.credentials = req.credentials
    
    db.commit()
    db.refresh(account)
    
    return account.to_dict()


@router.delete("/{account_id}")
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete a broker account."""
    account = db.query(BrokerAccount).filter(
        BrokerAccount.id == account_id,
        BrokerAccount.user_id == user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )
    
    db.delete(account)
    db.commit()
    
    return {"status": "ok", "message": "Account deleted"}


@router.post("/{account_id}/test")
def test_account(
    account_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Test broker account connection."""
    account = db.query(BrokerAccount).filter(
        BrokerAccount.id == account_id,
        BrokerAccount.user_id == user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )
    
    # TODO: Implement actual broker connection test
    # This would instantiate the appropriate broker adapter and try to connect
    
    return {
        "status": "ok",
        "message": f"Connection test for {account.broker_type} account '{account.name}'",
        "note": "Actual broker connection test not yet implemented",
    }
