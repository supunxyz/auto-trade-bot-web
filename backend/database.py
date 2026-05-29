"""SQLAlchemy database engine and session management."""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.config import settings

# Create engine
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db() -> Session:
    """Get a database session."""
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


def init_database():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")


def check_connection() -> bool:
    """Check database connectivity."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False
