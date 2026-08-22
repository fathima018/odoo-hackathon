from enum import Enum
import re
from pydantic import BaseModel, EmailStr, Field, field_validator, ValidationInfo

class UserRole(str, Enum):
    EMPLOYEE = "employee"
    HR = "hr"
    ADMIN = "admin"

class SignupRole(str, Enum):
    EMPLOYEE = "employee"
    HR = "hr"

class UserSignUp(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    role: SignupRole = Field(SignupRole.EMPLOYEE, description="Requested role (employee or hr)")
    password: str = Field(..., min_length=8)
    confirm_password: str

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info: ValidationInfo) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v

class UserSignIn(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

class UserResponse(BaseModel):
    employee_id: str
    name: str
    email: str
    phone: str
    company_name: str
    role: str
