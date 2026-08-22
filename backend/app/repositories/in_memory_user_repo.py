from typing import Optional, Dict, Any
from app.repositories.user_repo import UserRepository
from app.repositories import mock_db

class InMemoryUserRepository(UserRepository):
    @property
    def _users_by_email(self) -> Dict[str, Dict[str, Any]]:
        """Property provided for backward compatibility with existing tests."""
        return mock_db.users

    @property
    def _users_by_id(self) -> Dict[str, Dict[str, Any]]:
        """Property provided for backward compatibility with existing tests."""
        return mock_db.users

    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return mock_db.users.get(email.lower().strip())

    def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        for user in mock_db.users.values():
            if user.get("employee_id") == user_id:
                return user
        return None

    def create(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        email = user_data["email"].lower().strip()
        stored_data = dict(user_data)
        stored_data["email"] = email
        mock_db.users[email] = stored_data
        
        # Cross-module integration: Automatically initialize Employee Profile
        employee_id = stored_data["employee_id"]
        role = stored_data["role"]
        designation = "HR Specialist" if role == "hr" else "Software Engineer"
        
        employee_profile = {
            "employee_id": employee_id,
            "name": stored_data["name"],
            "email": email,
            "phone": stored_data["phone"],
            "company_name": stored_data["company_name"],
            "role": role,
            "address": "",
            "department": "General",
            "designation": designation,
            "joining_date": "2026-08-22",
            "is_active": True
        }
        mock_db.employees[employee_id] = employee_profile
        
        # Cross-module integration: Automatically initialize Payroll
        payroll_record = {
            "employee_id": employee_id,
            "basic_salary": 0.0,
            "allowances": 0.0,
            "deductions": 0.0,
            "gross_salary": 0.0,
            "net_salary": 0.0,
            "pay_period": "Monthly"
        }
        mock_db.payroll[employee_id] = payroll_record
        
        return stored_data

    def get_next_counter(self) -> int:
        return len(mock_db.users) + 1
