"""Closed trade model (trade history)."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base


class ClosedTrade(Base):
    """Completed trade for history and statistics."""
    
    __tablename__ = "closed_trades"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("broker_accounts.id"), nullable=False)
    
    # Trade details
    symbol = Column(String(50), nullable=False)
    side = Column(String(10), nullable=False)
    volume = Column(Float, nullable=False)
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=False)
    pnl = Column(Float, nullable=False)
    
    # Basket grouping
    basket_id = Column(String(100), nullable=True)
    
    # Timestamps
    closed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="closed_trades")
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "symbol": self.symbol,
            "side": self.side,
            "volume": self.volume,
            "entry_price": self.entry_price,
            "exit_price": self.exit_price,
            "pnl": self.pnl,
            "basket_id": self.basket_id,
            "closed_at": self.closed_at.isoformat() if self.closed_at else None,
        }
