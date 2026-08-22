from fastapi import HTTPException, status
from typing import Dict, Any

from app.auth.schemas import UserSignUp, UserSignIn
from app.core import security
from app.core.id_generator import generate_employee_id
from app.repositories.user_repo import UserRepository

class AuthService:
    @staticmethod
    def signup(signup_data: UserSignUp, repo: UserRepository) -> Dict[str, Any]:
        """
        Processes employee registration.
        Hashes password, automatically generates Employee ID, and saves to repository.
        """
        # 1. Check if user already exists
        existing_user = repo.get_by_email(signup_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An employee with this email is already registered"
            )

        # 2. Get next sequential counter and generate Employee ID
        counter = repo.get_next_counter()
        employee_id = generate_employee_id(counter)

        # 3. Hash password
        hashed_password = security.get_password_hash(signup_data.password)

        # 4. Prepare data for persistence
        user_record = {
            "employee_id": employee_id,
            "name": signup_data.name,
            "email": signup_data.email.lower().strip(),
            "phone": signup_data.phone,
            "company_name": signup_data.company_name,
            "role": signup_data.role.value,
            "hashed_password": hashed_password
        }

        # 5. Persist and return saved user
        return repo.create(user_record)

    @staticmethod
    def signin(signin_data: UserSignIn, repo: UserRepository) -> Dict[str, Any]:
        """
        Authenticates an employee.
        Verifies credentials and returns access token and user role.
        """
        # 1. Retrieve user
        user = repo.get_by_email(signin_data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 2. Verify password
        if not security.verify_password(signin_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 3. Generate access token using the user's email as the subject
        access_token = security.create_access_token(subject=user["email"])

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user["role"]
        }
