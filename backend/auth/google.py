"""Google OAuth verification."""

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from backend.config import settings


def verify_google_token(token: str) -> dict:
    """Verify Google ID token and return user info.
    
    Returns:
        dict with 'sub' (Google ID), 'email', 'name', 'picture'
    
    Raises:
        ValueError: If token is invalid
    """
    try:
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            settings.google_client_id
        )
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Invalid issuer')
        
        return {
            "google_id": idinfo['sub'],
            "email": idinfo.get('email'),
            "name": idinfo.get('name', idinfo.get('email', 'Unknown')),
            "picture": idinfo.get('picture'),
        }
    except Exception as e:
        raise ValueError(f"Google token verification failed: {e}")
