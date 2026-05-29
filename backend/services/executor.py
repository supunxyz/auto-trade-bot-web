"""Trade execution logic."""

from datetime import datetime
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import User, BrokerAccount, OpenPosition
from backend.brokers import MT5Adapter, BinanceAdapter, BrokerError
from backend.signals import generate_forex_signal, generate_crypto_signal
from backend.services.basket import register_basket
from backend.config import settings


def _get_db() -> Session:
    """Get database session."""
    return SessionLocal()


def execute_forex_cycle(user_id: int) -> None:
    """Execute one forex trading cycle for a user."""
    db = _get_db()
    
    try:
        # Get user and settings
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"User {user_id} not found")
            return
        
        # Get MT5 account
        account = db.query(BrokerAccount).filter(
            BrokerAccount.user_id == user_id,
            BrokerAccount.broker_type == "mt5",
            BrokerAccount.is_active == True
        ).first()
        
        if not account:
            print(f"No active MT5 account for user {user_id}")
            return
        
        # Generate signals for configured pairs
        pairs = settings.forex_pairs_list
        
        for pair in pairs:
            signal = generate_forex_signal(pair)
            
            if signal.direction == "NO TRADE":
                continue
            
            if signal.confidence < 0.65:
                print(f"Signal confidence too low: {signal.confidence}")
                continue
            
            # Execute trade
            try:
                adapter = MT5Adapter(account.credentials)
                adapter.connect()
                
                # Calculate volume based on risk
                # Simplified - would use actual account balance
                volume = 0.01  # Minimum lot
                
                result = adapter.place_market_order(
                    symbol=pair,
                    side=signal.direction,
                    volume=volume,
                    stop_loss=signal.stop_loss,
                    take_profit=signal.take_profit,
                    comment=f"auto_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                )
                
                # Save to database
                position = OpenPosition(
                    user_id=user_id,
                    account_id=account.id,
                    broker_ticket=result.ticket,
                    symbol=pair,
                    side=signal.direction,
                    volume=volume,
                    entry_price=result.entry_price,
                    stop_loss=signal.stop_loss,
                    take_profit=signal.take_profit,
                )
                db.add(position)
                db.commit()
                
                print(f"Executed {signal.direction} {pair} @ {result.entry_price}")
                
                adapter.disconnect()
                
                # Only trade one pair per cycle (best opportunity)
                break
                
            except BrokerError as e:
                print(f"Trade failed for {pair}: {e}")
                continue
            except Exception as e:
                print(f"Unexpected error: {e}")
                continue
                
    finally:
        db.close()


def execute_crypto_cycle(user_id: int) -> None:
    """Execute one crypto trading cycle for a user."""
    db = _get_db()
    
    try:
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"User {user_id} not found")
            return
        
        # Get Binance account
        account = db.query(BrokerAccount).filter(
            BrokerAccount.user_id == user_id,
            BrokerAccount.broker_type == "binance",
            BrokerAccount.is_active == True
        ).first()
        
        if not account:
            print(f"No active Binance account for user {user_id}")
            return
        
        # Generate signals
        pairs = settings.crypto_pairs_list
        
        for pair in pairs:
            signal = generate_crypto_signal(pair)
            
            if signal.direction == "NO TRADE":
                continue
            
            if signal.confidence < 0.65:
                continue
            
            # Execute trade
            try:
                adapter = BinanceAdapter(account.credentials)
                adapter.connect()
                
                # Calculate position size (simplified)
                volume = 0.001  # Minimum for BTC
                
                result = adapter.place_market_order(
                    symbol=pair,
                    side=signal.direction,
                    volume=volume,
                    stop_loss=signal.stop_loss,
                    take_profit=signal.take_profit,
                )
                
                # Save to database
                position = OpenPosition(
                    user_id=user_id,
                    account_id=account.id,
                    broker_ticket=result.ticket,
                    symbol=pair,
                    side=signal.direction,
                    volume=volume,
                    entry_price=result.entry_price,
                    stop_loss=signal.stop_loss,
                    take_profit=signal.take_profit,
                )
                db.add(position)
                db.commit()
                
                print(f"Executed {signal.direction} {pair} @ {result.entry_price}")
                
                adapter.disconnect()
                
                # Only trade one pair per cycle
                break
                
            except BrokerError as e:
                print(f"Trade failed for {pair}: {e}")
                continue
            except Exception as e:
                print(f"Unexpected error: {e}")
                continue
                
    finally:
        db.close()
