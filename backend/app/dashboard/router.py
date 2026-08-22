from fastapi import APIRouter, Depends
from typing import Dict, Any

from app.dashboard.schemas import EmployeeDashboardResponse, AdminDashboardResponse
from app.dashboard.service import DashboardService
from app.core.deps import (
    require_employee,
    require_hr_or_admin,
    get_employee_repository,
    get_attendance_repository,
    get_leave_repository,
    get_payroll_repository,
    get_notification_repository
)
from app.repositories.employee_repo import EmployeeRepository
from app.repositories.attendance_repo import AttendanceRepository
from app.repositories.leave_repo import LeaveRepository
from app.repositories.payroll_repo import PayrollRepository
from app.repositories.notification_repo import NotificationRepository

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/employee", response_model=EmployeeDashboardResponse)
def get_employee_dashboard(
    current_user: Dict[str, Any] = Depends(require_employee),
    emp_repo: EmployeeRepository = Depends(get_employee_repository),
    att_repo: AttendanceRepository = Depends(get_attendance_repository),
    leave_repo: LeaveRepository = Depends(get_leave_repository),
    payroll_repo: PayrollRepository = Depends(get_payroll_repository),
    notify_repo: NotificationRepository = Depends(get_notification_repository)
):
    employee_id = current_user["employee_id"]
    return DashboardService.get_employee_dashboard(
        employee_id, emp_repo, att_repo, leave_repo, payroll_repo, notify_repo
    )

@router.get("/admin", response_model=AdminDashboardResponse)
def get_admin_dashboard(
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    emp_repo: EmployeeRepository = Depends(get_employee_repository),
    att_repo: AttendanceRepository = Depends(get_attendance_repository),
    leave_repo: LeaveRepository = Depends(get_leave_repository),
    payroll_repo: PayrollRepository = Depends(get_payroll_repository),
    notify_repo: NotificationRepository = Depends(get_notification_repository)
):
    return DashboardService.get_admin_dashboard(
        emp_repo, att_repo, leave_repo, payroll_repo, notify_repo
    )
