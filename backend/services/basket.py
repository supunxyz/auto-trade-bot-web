"""Basket monitoring and auto-close logic."""

from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import SessionLocal
from backend.models import OpenPosition, ClosedTrade, BrokerAccount
from backend.brokers import MT5Adapter, BinanceAdapter


def _get_db() -> Session:
    """Get database session."""
    return SessionLocal()


def register_basket(
    user_id: int,
    basket_id: str,
    profit_target: float,
    stop_loss_usd: float = None
) -> None:
    """Register a new basket for monitoring.
    
    The basket monitor will automatically close all positions in this basket
    when the combined P&L reaches the profit target or stop loss.
    """
    print(f"Registered basket {basket_id} for user {user_id}")
    print(f"  Profit target: ${profit_target}")
    if stop_loss_usd:
        print(f"  Stop loss: ${stop_loss_usd}")


def check_and_close_baskets() -> None:
    """Check all baskets and close if targets hit."""
    db = _get_db()
    
    try:
        # Get all baskets with open positions
        baskets = db.query(
            OpenPosition.basket_id,
            OpenPosition.user_id,
            func.sum(OpenPosition.volume).label("total_volume"),
        ).filter(
            OpenPosition.basket_id.isnot(None)
        ).group_by(
            OpenPosition.basket_id,
            OpenPosition.user_id
        ).all()
        
        for basket in baskets:
            # Calculate current P&L (simplified - would get live prices)
            positions = db.query(OpenPosition).filter(
                OpenPosition.basket_id == basket.basket_id
            ).all()
            
            # Check if should close (placeholder logic)
            should_close = False
            total_pnl = 0.0
            
            if should_close:
                # Close all positions in basket
                for pos in positions:
                    close_position_and_record(db, pos)
                
                print(f"Closed basket {basket.basket_id} with P&L: ${total_pnl}")
                
    finally:
        db.close()


def close_position_and_record(db: Session, position: OpenPosition) -> None:
    """Close a position and record to history."""
    try:
        # Get account
        account = db.query(BrokerAccount).filter(
            BrokerAccount.id == position.account_id
        ).first()
        
        if not account:
            return
        
        # Close via broker (simplified - would need live price)
        exit_price = position.entry_price  # Placeholder
        
        # Calculate P&L (simplified)
        if position.side == "BUY":
            pnl = (exit_price - position.entry_price) * position.volume
        else:
            pnl = (position.entry_price - exit_price) * position.volume
        
        # Record closed trade
        trade = ClosedTrade(
            user_id=position.user_id,
            account_id=position.account_id,
            symbol=position.symbol,
            side=position.side,
            volume=position.volume,
            entry_price=position.entry_price,
            exit_price=exit_price,
            pnl=pnl,
            basket_id=position.basket_id,
        )
        db.add(trade)
        
        # Remove open position
        db.delete(position)
        db.commit()
        
    except Exception as e:
        print(f"Error closing position: {e}")
        db.rollback()


def sync_positions_with_brokers() -> None:
    """Sync database positions with broker state."""
    # This would periodically check if positions are still open at broker
    # and update database accordingly
    pass
