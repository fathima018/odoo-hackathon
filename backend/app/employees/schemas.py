from pydantic import BaseModel, EmailStr
from typing import Optional

class EmployeeResponse(BaseModel):
    employee_id: str
    name: str
    email: EmailStr
    phone: str
    company_name: str
    role: str
    address: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[str] = None
    salary: Optional[float] = 0.0
    is_active: bool

class EmployeeUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None  # to meet the "edit profile picture" requirement

class EmployeeUpdateAdmin(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
