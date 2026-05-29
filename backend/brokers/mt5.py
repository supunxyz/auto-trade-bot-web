"""MetaTrader 5 broker adapter."""

import threading
from typing import Optional
from backend.brokers.base import BrokerAdapter, BrokerError, OrderResult

# Thread lock for MT5 singleton
_MT5_LOCK = threading.RLock()

# Symbol aliases for different brokers
_SYMBOL_ALIASES = {
    "XAUUSD": ["XAUUSD", "GOLD", "XAU/USD"],
    "XAGUSD": ["XAGUSD", "SILVER"],
    "WTIUSD": ["WTIUSD", "USOIL", "OIL", "OILUSD"],
    "BTCUSD": ["BTCUSD", "BITCOIN"],
    "ETHUSD": ["ETHUSD", "ETHEREUM"],
}


class MT5Adapter(BrokerAdapter):
    """MetaTrader 5 adapter using MetaTrader5 Python package."""
    
    def __init__(self, credentials: dict):
        self.credentials = credentials
        self._connected = False
        self._symbol_cache = {}
        
        # Try import MT5
        try:
            import MetaTrader5 as mt5
            self._mt5 = mt5
        except ImportError:
            raise BrokerError("MetaTrader5 package not installed")
    
    def connect(self) -> None:
        """Initialize MT5 and login."""
        with _MT5_LOCK:
            # Initialize
            path = self.credentials.get("path")
            ok = self._mt5.initialize(path) if path else self._mt5.initialize()
            
            if not ok:
                err = self._mt5.last_error()
                raise BrokerError(f"MT5 initialize failed: {err}")
            
            # Login
            login = int(self.credentials["login"])
            password = str(self.credentials["password"])
            server = str(self.credentials["server"])
            
            if not self._mt5.login(login=login, password=password, server=server):
                err = self._mt5.last_error()
                self._mt5.shutdown()
                raise BrokerError(f"MT5 login failed: {err}")
            
            self._connected = True
    
    def disconnect(self) -> None:
        """Shutdown MT5."""
        if self._connected:
            with _MT5_LOCK:
                self._mt5.shutdown()
                self._connected = False
    
    def ping(self) -> dict:
        """Get account info."""
        with _MT5_LOCK:
            info = self._mt5.account_info()
        
        if info is None:
            raise BrokerError("Failed to get account info")
        
        return {
            "login": info.login,
            "server": info.server,
            "name": info.name,
            "currency": info.currency,
            "balance": info.balance,
            "equity": info.equity,
            "margin_free": info.margin_free,
            "leverage": info.leverage,
        }
    
    def _normalize_symbol(self, symbol: str) -> str:
        """Convert symbol to broker's format."""
        # Check cache
        if symbol in self._symbol_cache:
            return self._symbol_cache[symbol]
        
        # Clean symbol name
        base = symbol.replace("=X", "").replace("=F", "").upper()
        
        # Try direct lookup
        with _MT5_LOCK:
            if self._mt5.symbol_info(symbol) is not None:
                self._symbol_cache[symbol] = symbol
                return symbol
            
            # Try aliases
            candidates = _SYMBOL_ALIASES.get(base, [base])
            for cand in candidates:
                if self._mt5.symbol_info(cand) is not None:
                    self._symbol_cache[symbol] = cand
                    return cand
                
                # Try with suffixes
                for suffix in ["", "m", ".r", ".pro"]:
                    full = cand + suffix
                    if self._mt5.symbol_info(full) is not None:
                        self._symbol_cache[symbol] = full
                        return full
        
        raise BrokerError(f"Symbol {symbol} not found on broker")
    
    def get_price(self, symbol: str) -> float:
        """Get current price."""
        broker_symbol = self._normalize_symbol(symbol)
        
        with _MT5_LOCK:
            if not self._mt5.symbol_select(broker_symbol, True):
                raise BrokerError(f"Cannot select symbol {broker_symbol}")
            
            tick = self._mt5.symbol_info_tick(broker_symbol)
            if tick is None:
                raise BrokerError(f"No tick data for {broker_symbol}")
        
        return (tick.bid + tick.ask) / 2.0
    
    def place_market_order(
        self,
        symbol: str,
        side: str,
        volume: float,
        stop_loss: Optional[float] = None,
        take_profit: Optional[float] = None,
        comment: str = "",
    ) -> OrderResult:
        """Place market order."""
        broker_symbol = self._normalize_symbol(symbol)
        
        # Build order request
        order_type = self._mt5.ORDER_TYPE_BUY if side == "BUY" else self._mt5.ORDER_TYPE_SELL
        
        request = {
            "action": self._mt5.TRADE_ACTION_DEAL,
            "symbol": broker_symbol,
            "volume": float(volume),
            "type": order_type,
            "deviation": 10,
            "comment": comment,
        }
        
        if stop_loss:
            request["sl"] = float(stop_loss)
        if take_profit:
            request["tp"] = float(take_profit)
        
        with _MT5_LOCK:
            result = self._mt5.order_send(request)
        
        if result is None:
            raise BrokerError(f"Order failed: {self._mt5.last_error()}")
        
        if result.retcode != 10009 and result.retcode != 10008:
            raise BrokerError(f"Order failed: {result.retcode} - {result.comment}")
        
        return OrderResult(
            ticket=str(result.order),
            symbol=symbol,
            side=side,
            volume=volume,
            entry_price=result.price,
            stop_loss=stop_loss,
            take_profit=take_profit,
        )
    
    def close_position(self, ticket: str) -> bool:
        """Close position by ticket."""
        with _MT5_LOCK:
            position = self._mt5.positions_get(ticket=int(ticket))
            if not position:
                return False
            
            pos = position[0]
            
            # Determine close order type
            close_type = self._mt5.ORDER_TYPE_SELL if pos.type == 0 else self._mt5.ORDER_TYPE_BUY
            
            request = {
                "action": self._mt5.TRADE_ACTION_DEAL,
                "symbol": pos.symbol,
                "volume": pos.volume,
                "type": close_type,
                "position": pos.ticket,
                "deviation": 10,
            }
            
            result = self._mt5.order_send(request)
        
        return result is not None and (result.retcode == 10009 or result.retcode == 10008)
    
    def get_open_positions(self) -> list[dict]:
        """Get open positions from broker."""
        with _MT5_LOCK:
            positions = self._mt5.positions_get()
        
        return [
            {
                "ticket": str(p.ticket),
                "symbol": p.symbol,
                "side": "BUY" if p.type == 0 else "SELL",
                "volume": p.volume,
                "entry_price": p.price_open,
                "current_price": p.price_current,
                "profit": p.profit,
                "swap": p.swap,
            }
            for p in (positions or [])
        ]
