"""Open position model."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base


class OpenPosition(Base):
    """Currently open trading position."""
    
    __tablename__ = "open_positions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("broker_accounts.id"), nullable=False)
    
    # Broker info
    broker_ticket = Column(String(50), nullable=False)
    symbol = Column(String(50), nullable=False)
    side = Column(String(10), nullable=False)  # 'BUY' or 'SELL'
    
    # Trade details
    volume = Column(Float, nullable=False)
    entry_price = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    
    # Basket grouping
    basket_id = Column(String(100), nullable=True)
    
    # Timestamps
    opened_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="open_positions")
    account = relationship("BrokerAccount", back_populates="open_positions")
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "account_id": self.account_id,
            "broker_ticket": self.broker_ticket,
            "symbol": self.symbol,
            "side": self.side,
            "volume": self.volume,
            "entry_price": self.entry_price,
            "stop_loss": self.stop_loss,
            "take_profit": self.take_profit,
            "basket_id": self.basket_id,
            "opened_at": self.opened_at.isoformat() if self.opened_at else None,
        }
