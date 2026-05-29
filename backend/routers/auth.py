"""Authentication endpoints."""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User
from backend.auth import (
    create_access_token,
    get_password_hash,
    verify_password,
    get_current_user,
)
from backend.auth.google import verify_google_token
from backend.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# Schemas
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    id_token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    is_admin: bool


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register new user with email/password."""
    # Check if user exists
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create user
    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        name=req.name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create token
    token = create_access_token({"sub": str(user.id)})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.to_dict(),
    }


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Login with email/password."""
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    if not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended",
        )
    
    token = create_access_token({"sub": str(user.id)})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.to_dict(),
    }


@router.post("/google", response_model=TokenResponse)
def google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Login or register with Google OAuth."""
    try:
        google_info = verify_google_token(req.id_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )
    
    # Check for existing user by Google ID
    user = db.query(User).filter(User.google_id == google_info["google_id"]).first()
    
    if not user:
        # Check for existing user by email
        user = db.query(User).filter(User.email == google_info["email"]).first()
        
        if user:
            # Link Google to existing account
            user.google_id = google_info["google_id"]
            db.commit()
        else:
            # Create new user
            user = User(
                email=google_info["email"],
                google_id=google_info["google_id"],
                name=google_info["name"],
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended",
        )
    
    token = create_access_token({"sub": str(user.id)})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.to_dict(),
    }


@router.get("/me", response_model=dict)
def get_me(user: User = Depends(get_current_user)):
    """Get current user profile."""
    return user.to_dict()
