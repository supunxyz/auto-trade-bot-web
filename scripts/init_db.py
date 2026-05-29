"""Initialize database and seed admin user."""

import sys
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from backend.database import SessionLocal, init_database, engine
from backend.models import User
from backend.auth import get_password_hash
from backend.config import settings


def seed_admin():
    """Create admin user if not exists."""
    db = SessionLocal()
    
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == settings.admin_email).first()
        
        if not admin:
            print(f"Creating admin user: {settings.admin_email}")
            
            admin = User(
                email=settings.admin_email,
                password_hash=get_password_hash(settings.admin_password),
                name="Administrator",
                is_admin=True,
                is_active=True,
            )
            
            db.add(admin)
            db.commit()
            print("✓ Admin user created")
        else:
            print("✓ Admin user already exists")
            
    except Exception as e:
        print(f"Error seeding admin: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """Initialize database."""
    print("Initializing database...")
    
    # Create tables
    init_database()
    
    # Seed admin
    seed_admin()
    
    print("✓ Database initialization complete")


if __name__ == "__main__":
    main()
