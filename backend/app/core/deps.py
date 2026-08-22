from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Any

from app.core import security
from app.repositories.user_repo import UserRepository
from app.repositories.in_memory_user_repo import InMemoryUserRepository

from app.repositories.employee_repo import EmployeeRepository
from app.repositories.in_memory_employee_repo import InMemoryEmployeeRepository
from app.repositories.attendance_repo import AttendanceRepository
from app.repositories.in_memory_attendance_repo import InMemoryAttendanceRepository
from app.repositories.leave_repo import LeaveRepository
from app.repositories.in_memory_leave_repo import InMemoryLeaveRepository
from app.repositories.payroll_repo import PayrollRepository
from app.repositories.in_memory_payroll_repo import InMemoryPayrollRepository
from app.repositories.document_repo import DocumentRepository
from app.repositories.in_memory_document_repo import InMemoryDocumentRepository
from app.repositories.notification_repo import NotificationRepository
from app.repositories.in_memory_notification_repo import InMemoryNotificationRepository

# Global instances of in-memory repositories for the app session
_in_memory_repo = InMemoryUserRepository()
_employee_repo = InMemoryEmployeeRepository()
_attendance_repo = InMemoryAttendanceRepository()
_leave_repo = InMemoryLeaveRepository()
_payroll_repo = InMemoryPayrollRepository()
_document_repo = InMemoryDocumentRepository()
_notification_repo = InMemoryNotificationRepository()

def get_user_repository() -> UserRepository:
    """Dependency provider for UserRepository."""
    return _in_memory_repo

def get_employee_repository() -> EmployeeRepository:
    """Dependency provider for EmployeeRepository."""
    return _employee_repo

def get_attendance_repository() -> AttendanceRepository:
    """Dependency provider for AttendanceRepository."""
    return _attendance_repo

def get_leave_repository() -> LeaveRepository:
    """Dependency provider for LeaveRepository."""
    return _leave_repo

def get_payroll_repository() -> PayrollRepository:
    """Dependency provider for PayrollRepository."""
    return _payroll_repo

def get_document_repository() -> DocumentRepository:
    """Dependency provider for DocumentRepository."""
    return _document_repo

def get_notification_repository() -> NotificationRepository:
    """Dependency provider for NotificationRepository."""
    return _notification_repo

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

# Authorization helper dependencies
def require_employee(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Requires the user to be logged in with a valid role."""
    if current_user.get("role") not in ["employee", "hr", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    return current_user

def require_hr(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Requires the user to have the HR role."""
    if current_user.get("role") != "hr":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR can perform this action"
        )
    return current_user

def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Requires the user to have the Admin role."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Admin can perform this action"
        )
    return current_user

def require_hr_or_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Requires the user to have either the HR or Admin role."""
    if current_user.get("role") not in ["hr", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: HR or Admin role required"
        )
    return current_user
