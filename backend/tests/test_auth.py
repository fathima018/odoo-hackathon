import sys
import os
from datetime import timedelta

# Ensure python knows where backend is to import app and main modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from fastapi import Depends

from main import app
from app.core import security, id_generator
from app.core.deps import get_current_user

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_repo():
    """Fixture to clear the global repository instance between tests."""
    from app.core.deps import _in_memory_repo
    _in_memory_repo._users_by_email.clear()
    _in_memory_repo._users_by_id.clear()
    _in_memory_repo._counter = 1
    return _in_memory_repo

# 1. Hashing and Verification Tests
def test_password_hashing():
    password = "SecurePassword123"
    hashed = security.get_password_hash(password)
    assert hashed != password
    assert security.verify_password(password, hashed) is True
    assert security.verify_password("wrongpassword", hashed) is False

# 2. Employee ID Generation Tests
def test_employee_id_generation():
    emp_id = id_generator.generate_employee_id(1)
    assert emp_id.startswith("EMP-")
    assert "-0001" in emp_id
    
    emp_id_2 = id_generator.generate_employee_id(123)
    assert "-0123" in emp_id_2

# 3. JWT creation/validation
def test_jwt_creation_validation():
    subject = "test@company.com"
    token = security.create_access_token(subject, expires_delta=timedelta(minutes=5))
    assert token is not None
    decoded = security.decode_access_token(token)
    assert decoded == subject

    # Test expired or invalid token
    invalid_token = token + "corrupted"
    assert security.decode_access_token(invalid_token) is None

# 4. Signup validation tests
def test_signup_validation():
    # Passwords do not match
    response = client.post("/api/auth/signup", json={
        "company_name": "NMIT Bangalore",
        "name": "Fathima",
        "email": "fathima@company.com",
        "phone": "9876543210",
        "role": "employee",
        "password": "Password123",
        "confirm_password": "DifferentPassword123"
    })
    assert response.status_code == 422
    assert "Passwords do not match" in response.text

    # Password complexity missing number
    response = client.post("/api/auth/signup", json={
        "company_name": "NMIT Bangalore",
        "name": "Fathima",
        "email": "fathima@company.com",
        "phone": "9876543210",
        "role": "employee",
        "password": "NoNumberPassword",
        "confirm_password": "NoNumberPassword"
    })
    assert response.status_code == 422
    assert "Password must contain at least one number" in response.text

    # Password complexity missing letter
    response = client.post("/api/auth/signup", json={
        "company_name": "NMIT Bangalore",
        "name": "Fathima",
        "email": "fathima@company.com",
        "phone": "9876543210",
        "role": "employee",
        "password": "1234567890",
        "confirm_password": "1234567890"
    })
    assert response.status_code == 422
    assert "Password must contain at least one letter" in response.text

    # Invalid role "admin" not permitted in signup schemas
    response = client.post("/api/auth/signup", json={
        "company_name": "NMIT Bangalore",
        "name": "Fathima",
        "email": "fathima@company.com",
        "phone": "9876543210",
        "role": "admin",
        "password": "Password123",
        "confirm_password": "Password123"
    })
    assert response.status_code == 422

# 5. Successful Signup and Signin tests
def test_successful_signup_and_signin():
    # Successful Signup
    signup_payload = {
        "company_name": "NMIT Bangalore",
        "name": "Fathima",
        "email": "fathima@company.com",
        "phone": "9876543210",
        "role": "employee",
        "password": "Password123",
        "confirm_password": "Password123"
    }
    response = client.post("/api/auth/signup", json=signup_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "fathima@company.com"
    assert "employee_id" in data
    assert "hashed_password" not in data  # Ensure security rule (no passwords exposed)

    # Duplicate signup check
    dup_response = client.post("/api/auth/signup", json=signup_payload)
    assert dup_response.status_code == 400
    assert "already registered" in dup_response.json()["detail"]

    # Successful Signin
    signin_payload = {
        "email": "fathima@company.com",
        "password": "Password123"
    }
    signin_response = client.post("/api/auth/signin", json=signin_payload)
    assert signin_response.status_code == 200
    token_data = signin_response.json()
    assert "access_token" in token_data
    assert token_data["role"] == "employee"

    # Verify invalid signin password
    bad_signin_payload = {
        "email": "fathima@company.com",
        "password": "WrongPassword123"
    }
    bad_signin_response = client.post("/api/auth/signin", json=bad_signin_payload)
    assert bad_signin_response.status_code == 401
    assert "Invalid email or password" in bad_signin_response.json()["detail"]

# 6. Current User Auth Dependency Test
def test_current_user_dependency():
    # Create user
    signup_payload = {
        "company_name": "NMIT Bangalore",
        "name": "Fathima",
        "email": "fathima@company.com",
        "phone": "9876543210",
        "role": "hr",
        "password": "Password123",
        "confirm_password": "Password123"
    }
    client.post("/api/auth/signup", json=signup_payload)

    # Get Token
    signin_payload = {"email": "fathima@company.com", "password": "Password123"}
    signin_response = client.post("/api/auth/signin", json=signin_payload)
    token = signin_response.json()["access_token"]

    # Define a dummy endpoint to test dependency
    @app.get("/api/test-current-user")
    def test_endpoint(current_user: dict = Depends(get_current_user)):
        return {"current_user_email": current_user["email"]}

    # Call with correct token
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/test-current-user", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["current_user_email"] == "fathima@company.com"

    # Call with bad token
    resp = client.get("/api/test-current-user", headers={"Authorization": "Bearer badtoken"})
    assert resp.status_code == 401
