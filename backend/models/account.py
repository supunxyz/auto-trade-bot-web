"""Broker account model."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base


class BrokerAccount(Base):
    """Broker account credentials and settings."""
    
    __tablename__ = "broker_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    broker_type = Column(String(20), nullable=False)  # 'mt5' or 'binance'
    name = Column(String(100), nullable=False)
    credentials = Column(JSON, nullable=False)  # Encrypted credentials
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="accounts")
    open_positions = relationship("OpenPosition", back_populates="account", cascade="all, delete-orphan")
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "broker_type": self.broker_type,
            "name": self.name,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
