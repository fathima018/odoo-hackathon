from fastapi import APIRouter, Depends, status

from app.auth.schemas import UserSignUp, UserSignIn, UserResponse, TokenResponse
from app.auth.service import AuthService
from app.core.deps import get_user_repository
from app.repositories.user_repo import UserRepository

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(
    signup_data: UserSignUp,
    repo: UserRepository = Depends(get_user_repository)
):
    """
    Register a new employee. Supports 'employee' and 'hr' roles.
    Generates a unique Employee ID automatically.
    """
    return AuthService.signup(signup_data, repo)

@router.post("/signin", response_model=TokenResponse)
def signin(
    signin_data: UserSignIn,
    repo: UserRepository = Depends(get_user_repository)
):
    """
    Sign in with email and password to receive a JWT access token.
    """
    return AuthService.signin(signin_data, repo)
