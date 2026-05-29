"""APScheduler-based trading scheduler."""

import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from typing import Optional, Dict, List

from backend.config import settings
from backend.services.executor import execute_forex_cycle, execute_crypto_cycle

# Global scheduler instance
_scheduler: Optional[AsyncIOScheduler] = None

# Track user trading states
_trading_states: Dict[int, dict] = {}


def get_scheduler() -> AsyncIOScheduler:
    """Get or create the scheduler."""
    global _scheduler
    if _scheduler is None:
        _scheduler = AsyncIOScheduler()
    return _scheduler


def get_scheduler_status(user_id: int) -> dict:
    """Get trading status for a user."""
    state = _trading_states.get(user_id, {})
    
    scheduler = get_scheduler()
    jobs = scheduler.get_jobs()
    
    forex_job = next((j for j in jobs if j.id == f"forex_{user_id}"), None)
    crypto_job = next((j for j in jobs if j.id == f"crypto_{user_id}"), None)
    
    return {
        "enabled": state.get("enabled", False),
        "forex_running": forex_job is not None,
        "crypto_running": crypto_job is not None,
        "next_forex_run": str(forex_job.next_run_time) if forex_job else None,
        "next_crypto_run": str(crypto_job.next_run_time) if crypto_job else None,
        "settings": state.get("settings", {}),
    }


def start_trading(
    user_id: int,
    forex_pairs: List[str],
    crypto_pairs: List[str],
    risk_per_trade: float = 1.0,
    rr_ratio: float = 2.0,
) -> None:
    """Start auto-trading for a user."""
    scheduler = get_scheduler()
    
    # Store state
    _trading_states[user_id] = {
        "enabled": True,
        "settings": {
            "forex_pairs": forex_pairs or settings.forex_pairs_list,
            "crypto_pairs": crypto_pairs or settings.crypto_pairs_list,
            "risk_per_trade": risk_per_trade,
            "rr_ratio": rr_ratio,
        },
    }
    
    # Remove existing jobs if any
    stop_trading(user_id)
    
    # Add forex job (5 minute interval)
    scheduler.add_job(
        execute_forex_cycle,
        trigger=IntervalTrigger(minutes=settings.forex_interval_minutes),
        id=f"forex_{user_id}",
        args=[user_id],
        replace_existing=True,
    )
    
    # Add crypto job (2 minute interval)
    scheduler.add_job(
        execute_crypto_cycle,
        trigger=IntervalTrigger(minutes=settings.crypto_interval_minutes),
        id=f"crypto_{user_id}",
        args=[user_id],
        replace_existing=True,
    )
    
    print(f"Started auto-trading for user {user_id}")
    print(f"  Forex: {forex_pairs or settings.forex_pairs_list}")
    print(f"  Crypto: {crypto_pairs or settings.crypto_pairs_list}")


def stop_trading(user_id: int) -> None:
    """Stop auto-trading for a user."""
    scheduler = get_scheduler()
    
    # Remove jobs
    for job_id in [f"forex_{user_id}", f"crypto_{user_id}"]:
        try:
            scheduler.remove_job(job_id)
        except Exception:
            pass
    
    # Update state
    if user_id in _trading_states:
        _trading_states[user_id]["enabled"] = False
    
    print(f"Stopped auto-trading for user {user_id}")


def start_scheduler():
    """Start the global scheduler."""
    scheduler = get_scheduler()
    if not scheduler.running:
        scheduler.start()
        print("✓ Scheduler started")


def shutdown_scheduler():
    """Shutdown the scheduler."""
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown()
        _scheduler = None
        print("✓ Scheduler stopped")
