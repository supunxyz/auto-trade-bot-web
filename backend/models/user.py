"""User model."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from backend.database import Base


class User(Base):
    """User account model."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # NULL for Google-only
    google_id = Column(String(120), unique=True, nullable=True)
    name = Column(String(120), nullable=False)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    accounts = relationship("BrokerAccount", back_populates="user", cascade="all, delete-orphan")
    open_positions = relationship("OpenPosition", back_populates="user", cascade="all, delete-orphan")
    closed_trades = relationship("ClosedTrade", back_populates="user", cascade="all, delete-orphan")
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "is_admin": self.is_admin,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
