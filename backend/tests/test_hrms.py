import sys
import os
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

# Ensure python knows where backend is to import app and main modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_mock_db():
    """Fixture to clear all tables in mock_db between tests."""
    from app.repositories import mock_db
    mock_db.users.clear()
    mock_db.employees.clear()
    mock_db.attendance.clear()
    mock_db.leaves.clear()
    mock_db.payroll.clear()
    mock_db.documents.clear()
    mock_db.notifications.clear()
    
    # Also clean the user counter
    from app.core.deps import _in_memory_repo
    _in_memory_repo._counter = 1

def register_and_login(email: str, password: str, role: str = "employee") -> str:
    # Helper to register and return a JWT access token
    signup_payload = {
        "company_name": "TestCorp",
        "name": "Test User",
        "email": email,
        "phone": "1234567890",
        "role": role,
        "password": password,
        "confirm_password": password
    }
    client.post("/api/auth/signup", json=signup_payload)
    
    signin_response = client.post("/api/auth/signin", json={
        "email": email,
        "password": password
    })
    return signin_response.json()["access_token"]

# ==================== 1. EMPLOYEE PROFILE TESTS ====================
def test_employee_profile_workflow():
    emp_token = register_and_login("emp@test.com", "Password123", "employee")
    hr_token = register_and_login("hr@test.com", "Password123", "hr")
    
    # 1. View own profile
    headers = {"Authorization": f"Bearer {emp_token}"}
    response = client.get("/api/employees/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "emp@test.com"
    assert data["role"] == "employee"
    assert data["salary"] == 0.0
    
    # 2. Update allowed personal fields
    response = client.put("/api/employees/me", headers=headers, json={
        "phone": "9999999999",
        "address": "123 Main St"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["phone"] == "9999999999"
    assert data["address"] == "123 Main St"
    
    # 3. HR/Admin can view employee's profile
    emp_id = data["employee_id"]
    hr_headers = {"Authorization": f"Bearer {hr_token}"}
    response = client.get(f"/api/employees/{emp_id}", headers=hr_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "emp@test.com"
    
    # 4. HR/Admin can update employee fields
    response = client.put(f"/api/employees/{emp_id}", headers=hr_headers, json={
        "department": "Engineering",
        "designation": "Staff Engineer"
    })
    assert response.status_code == 200
    assert response.json()["department"] == "Engineering"
    assert response.json()["designation"] == "Staff Engineer"

# ==================== 2. ATTENDANCE TESTS ====================
def test_attendance_workflow():
    emp_token = register_and_login("emp@test.com", "Password123", "employee")
    headers = {"Authorization": f"Bearer {emp_token}"}
    
    # 1. Check in
    response = client.post("/api/attendance/check-in", headers=headers)
    assert response.status_code == 201
    assert response.json()["status"] == "PRESENT"
    
    # 2. Duplicate check-in fails
    response = client.post("/api/attendance/check-in", headers=headers)
    assert response.status_code == 400
    assert "Already checked in" in response.json()["detail"]
    
    # 3. Check out
    response = client.post("/api/attendance/check-out", headers=headers)
    assert response.status_code == 200
    assert response.json()["check_out"] is not None

# ==================== 3. LEAVE TESTS ====================
def test_leave_workflow():
    emp_token = register_and_login("emp@test.com", "Password123", "employee")
    hr_token = register_and_login("hr@test.com", "Password123", "hr")
    emp_headers = {"Authorization": f"Bearer {emp_token}"}
    hr_headers = {"Authorization": f"Bearer {hr_token}"}
    
    # 1. Apply for leave
    leave_payload = {
        "start_date": "2026-09-01",
        "end_date": "2026-09-05",
        "leave_type": "PAID",
        "remarks": "Vacation trip"
    }
    response = client.post("/api/leaves", headers=emp_headers, json=leave_payload)
    assert response.status_code == 201
    leave_id = response.json()["leave_id"]
    
    # 2. Prevent overlapping leave request
    response = client.post("/api/leaves", headers=emp_headers, json=leave_payload)
    assert response.status_code == 400
    
    # 3. Invalid dates validation
    invalid_payload = dict(leave_payload)
    invalid_payload["start_date"] = "2026-09-10"
    invalid_payload["end_date"] = "2026-09-05" # start > end
    response = client.post("/api/leaves", headers=emp_headers, json=invalid_payload)
    assert response.status_code == 422
    
    # 4. Approve leave
    response = client.put(f"/api/leaves/{leave_id}/approve", headers=hr_headers, json={"comment": "Approved!"})
    assert response.status_code == 200
    assert response.json()["status"] == "APPROVED"
    
    # 5. Check if attendance records were created as LEAVE
    response = client.get("/api/attendance/me", headers=emp_headers)
    assert response.status_code == 200
    records = response.json()
    assert len(records) == 5
    assert all(r["status"] == "LEAVE" for r in records)

# ==================== 4. PAYROLL TESTS ====================
def test_payroll_workflow():
    emp_token = register_and_login("emp@test.com", "Password123", "employee")
    hr_token = register_and_login("hr@test.com", "Password123", "hr")
    emp_headers = {"Authorization": f"Bearer {emp_token}"}
    hr_headers = {"Authorization": f"Bearer {hr_token}"}
    
    # Get employee_id
    me_resp = client.get("/api/employees/me", headers=emp_headers)
    emp_id = me_resp.json()["employee_id"]
    
    # 1. View own payroll (should be 0.0 initially)
    response = client.get("/api/payroll/me", headers=emp_headers)
    assert response.status_code == 200
    assert response.json()["basic_salary"] == 0.0
    
    # 2. Employee cannot update payroll
    response = client.put(f"/api/payroll/{emp_id}", headers=emp_headers, json={"basic_salary": 5000})
    assert response.status_code in [401, 403]
    
    # 3. HR can update payroll
    response = client.put(f"/api/payroll/{emp_id}", headers=hr_headers, json={
        "basic_salary": 6000.0,
        "allowances": 1500.0,
        "deductions": 500.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["basic_salary"] == 6000.0
    assert data["gross_salary"] == 7500.0
    assert data["net_salary"] == 7000.0

# ==================== 5. DOCUMENT TESTS ====================
def test_documents_workflow():
    emp_token = register_and_login("emp@test.com", "Password123", "employee")
    emp_headers = {"Authorization": f"Bearer {emp_token}"}
    
    # Create test dummy file
    filename = "test_resume.pdf"
    file_content = b"Dummy PDF content"
    
    # Upload document
    response = client.post(
        "/api/documents/upload",
        headers=emp_headers,
        data={"document_type": "RESUME"},
        files={"file": (filename, file_content, "application/pdf")}
    )
    assert response.status_code == 201
    doc_id = response.json()["document_id"]
    
    # Download document
    response = client.get(f"/api/documents/{doc_id}/download", headers=emp_headers)
    assert response.status_code == 200
    assert response.content == file_content
    
    # Delete document
    response = client.delete(f"/api/documents/{doc_id}", headers=emp_headers)
    assert response.status_code == 204

# ==================== 6. DASHBOARDS AND REPORTS TESTS ====================
def test_dashboards_and_reports_workflow():
    emp_token = register_and_login("emp@test.com", "Password123", "employee")
    hr_token = register_and_login("hr@test.com", "Password123", "hr")
    emp_headers = {"Authorization": f"Bearer {emp_token}"}
    hr_headers = {"Authorization": f"Bearer {hr_token}"}
    
    # 1. View employee dashboard
    response = client.get("/api/dashboard/employee", headers=emp_headers)
    assert response.status_code == 200
    assert "profile_summary" in response.json()
    assert "remaining_leaves" in response.json()
    
    # 2. View admin dashboard
    response = client.get("/api/dashboard/admin", headers=hr_headers)
    assert response.status_code == 200
    assert response.json()["total_employees"] == 2
    
    # 3. View reports
    response = client.get("/api/reports/payroll", headers=hr_headers)
    assert response.status_code == 200
    assert response.json()["total_employees"] == 2
    
    # 4. Normal employee cannot view reports
    response = client.get("/api/reports/payroll", headers=emp_headers)
    assert response.status_code in [401, 403]
