from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, Optional

from app.reports.schemas import AttendanceReportResponse, LeaveReportResponse, PayrollReportResponse
from app.reports.service import ReportService
from app.core.deps import (
    require_hr_or_admin,
    get_employee_repository,
    get_attendance_repository,
    get_leave_repository,
    get_payroll_repository
)
from app.repositories.employee_repo import EmployeeRepository
from app.repositories.attendance_repo import AttendanceRepository
from app.repositories.leave_repo import LeaveRepository
from app.repositories.payroll_repo import PayrollRepository

router = APIRouter(prefix="/api/reports", tags=["Reports/Analytics"])

@router.get("/attendance", response_model=AttendanceReportResponse)
def get_attendance_report(
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    department: Optional[str] = Query(None, description="Department name filter"),
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    emp_repo: EmployeeRepository = Depends(get_employee_repository),
    att_repo: AttendanceRepository = Depends(get_attendance_repository)
):
    return ReportService.get_attendance_report(
        start_date, end_date, department, emp_repo, att_repo
    )

@router.get("/leaves", response_model=LeaveReportResponse)
def get_leaves_report(
    leave_type: Optional[str] = Query(None, description="Leave type filter"),
    department: Optional[str] = Query(None, description="Department filter"),
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    emp_repo: EmployeeRepository = Depends(get_employee_repository),
    leave_repo: LeaveRepository = Depends(get_leave_repository)
):
    return ReportService.get_leave_report(
        leave_type, department, emp_repo, leave_repo
    )

@router.get("/payroll", response_model=PayrollReportResponse)
def get_payroll_report(
    department: Optional[str] = Query(None, description="Department filter"),
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    emp_repo: EmployeeRepository = Depends(get_employee_repository),
    payroll_repo: PayrollRepository = Depends(get_payroll_repository)
):
    return ReportService.get_payroll_report(
        department, emp_repo, payroll_repo
    )
