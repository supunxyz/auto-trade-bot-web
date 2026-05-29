"""Binance Futures adapter."""

from typing import Optional
from backend.brokers.base import BrokerAdapter, BrokerError, OrderResult


class BinanceAdapter(BrokerAdapter):
    """Binance Futures adapter using python-binance."""
    
    def __init__(self, credentials: dict):
        self.credentials = credentials
        self._connected = False
        self._client = None
        
        try:
            from binance.client import Client
            self._Client = Client
        except ImportError:
            raise BrokerError("python-binance package not installed")
    
    def connect(self) -> None:
        """Initialize Binance client."""
        api_key = self.credentials.get("api_key")
        api_secret = self.credentials.get("api_secret")
        testnet = self.credentials.get("testnet", False)
        
        if not api_key or not api_secret:
            raise BrokerError("API key and secret required")
        
        self._client = self._Client(api_key, api_secret, testnet=testnet)
        
        # Test connection
        try:
            self._client.futures_account()
            self._connected = True
        except Exception as e:
            raise BrokerError(f"Binance connection failed: {e}")
    
    def disconnect(self) -> None:
        """Close connection."""
        self._connected = False
        self._client = None
    
    def ping(self) -> dict:
        """Get account info."""
        if not self._client:
            raise BrokerError("Not connected")
        
        try:
            account = self._client.futures_account()
            
            return {
                "account_type": account.get("accountType"),
                "balance": float(account.get("totalWalletBalance", 0)),
                "equity": float(account.get("totalMarginBalance", 0)),
                "available": float(account.get("availableBalance", 0)),
            }
        except Exception as e:
            raise BrokerError(f"Failed to get account info: {e}")
    
    def _normalize_symbol(self, symbol: str) -> str:
        """Convert symbol to Binance format."""
        # Remove common suffixes and add USDT if needed
        clean = symbol.replace("=X", "").replace("=F", "").replace("/", "")
        
        if not clean.endswith("USDT") and not clean.endswith("USD"):
            clean = clean + "USDT"
        
        return clean.upper()
    
    def get_price(self, symbol: str) -> float:
        """Get current price."""
        if not self._client:
            raise BrokerError("Not connected")
        
        try:
            ticker = self._client.futures_symbol_ticker(
                symbol=self._normalize_symbol(symbol)
            )
            return float(ticker["price"])
        except Exception as e:
            raise BrokerError(f"Failed to get price: {e}")
    
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
        if not self._client:
            raise BrokerError("Not connected")
        
        binance_symbol = self._normalize_symbol(symbol)
        binance_side = "BUY" if side == "BUY" else "SELL"
        
        try:
            # Place order
            order = self._client.futures_create_order(
                symbol=binance_symbol,
                side=binance_side,
                type="MARKET",
                quantity=volume,
                newClientOrderId=comment[:32] if comment else None,
            )
            
            # Get filled price
            fills = order.get("fills", [])
            if fills:
                avg_price = sum(
                    float(f["price"]) * float(f["qty"]) for f in fills
                ) / sum(float(f["qty"]) for f in fills)
            else:
                # Get current price
                avg_price = self.get_price(symbol)
            
            # Set stop loss if provided
            if stop_loss:
                sl_side = "SELL" if side == "BUY" else "BUY"
                try:
                    self._client.futures_create_order(
                        symbol=binance_symbol,
                        side=sl_side,
                        type="STOP_MARKET",
                        stopPrice=stop_loss,
                        closePosition=True,
                    )
                except Exception as e:
                    print(f"Warning: Failed to set SL: {e}")
            
            # Set take profit if provided
            if take_profit:
                tp_side = "SELL" if side == "BUY" else "BUY"
                try:
                    self._client.futures_create_order(
                        symbol=binance_symbol,
                        side=tp_side,
                        type="TAKE_PROFIT_MARKET",
                        stopPrice=take_profit,
                        closePosition=True,
                    )
                except Exception as e:
                    print(f"Warning: Failed to set TP: {e}")
            
            return OrderResult(
                ticket=str(order["orderId"]),
                symbol=symbol,
                side=side,
                volume=volume,
                entry_price=avg_price,
                stop_loss=stop_loss,
                take_profit=take_profit,
            )
            
        except Exception as e:
            raise BrokerError(f"Order failed: {e}")
    
    def close_position(self, ticket: str) -> bool:
        """Close position."""
        # Binance doesn't use tickets - positions are by symbol
        # This would need symbol info to close
        return False
    
    def get_open_positions(self) -> list[dict]:
        """Get open positions."""
        if not self._client:
            raise BrokerError("Not connected")
        
        try:
            positions = self._client.futures_position_information()
            
            return [
                {
                    "symbol": p["symbol"],
                    "side": "BUY" if float(p["positionAmt"]) > 0 else "SELL",
                    "volume": abs(float(p["positionAmt"])),
                    "entry_price": float(p["entryPrice"]),
                    "current_price": float(p["markPrice"]),
                    "profit": float(p["unRealizedProfit"]),
                }
                for p in positions
                if float(p["positionAmt"]) != 0
            ]
        except Exception as e:
            raise BrokerError(f"Failed to get positions: {e}")
