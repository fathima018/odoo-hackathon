from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Any

from app.core import security
from app.repositories.user_repo import UserRepository
from app.repositories.in_memory_user_repo import InMemoryUserRepository

# Global instance of InMemoryUserRepository for the app session
_in_memory_repo = InMemoryUserRepository()

def get_user_repository() -> UserRepository:
    """Dependency provider for UserRepository."""
    return _in_memory_repo

# OAuth2 scheme to extract token from the Authorization header (Bearer token)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/signin", auto_error=False)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    repo: UserRepository = Depends(get_user_repository)
) -> Dict[str, Any]:
    """FastAPI dependency to retrieve the current user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    email = security.decode_access_token(token)
    if email is None:
        raise credentials_exception

    user = repo.get_by_email(email)
    if user is None:
        raise credentials_exception

    return user
