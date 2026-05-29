"""Abstract broker adapter interface."""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict
from dataclasses import dataclass


class BrokerError(Exception):
    """Broker operation error."""
    pass


@dataclass
class OrderResult:
    """Result of a placed order."""
    ticket: str
    symbol: str
    side: str
    volume: float
    entry_price: float
    stop_loss: Optional[float]
    take_profit: Optional[float]


class BrokerAdapter(ABC):
    """Abstract base class for broker adapters."""
    
    @abstractmethod
    def connect(self) -> None:
        """Connect to broker."""
        pass
    
    @abstractmethod
    def disconnect(self) -> None:
        """Disconnect from broker."""
        pass
    
    @abstractmethod
    def ping(self) -> Dict:
        """Check connection and return account info."""
        pass
    
    @abstractmethod
    def get_price(self, symbol: str) -> float:
        """Get current price for symbol."""
        pass
    
    @abstractmethod
    def place_market_order(
        self,
        symbol: str,
        side: str,
        volume: float,
        stop_loss: Optional[float] = None,
        take_profit: Optional[float] = None,
        comment: str = "",
    ) -> OrderResult:
        """Place a market order."""
        pass
    
    @abstractmethod
    def close_position(self, ticket: str) -> bool:
        """Close an open position."""
        pass
    
    @abstractmethod
    def get_open_positions(self) -> List[Dict]:
        """Get list of open positions from broker."""
        pass
