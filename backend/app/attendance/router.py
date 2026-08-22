from fastapi import APIRouter, Depends, status
from typing import List, Dict, Any

from app.attendance.schemas import AttendanceResponse
from app.attendance.service import AttendanceService
from app.core.deps import (
    require_employee,
    require_hr_or_admin,
    get_attendance_repository
)
from app.repositories.attendance_repo import AttendanceRepository

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

@router.post("/check-in", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def check_in(
    current_user: Dict[str, Any] = Depends(require_employee),
    repo: AttendanceRepository = Depends(get_attendance_repository)
):
    employee_id = current_user["employee_id"]
    return AttendanceService.check_in(employee_id, repo)

@router.post("/check-out", response_model=AttendanceResponse)
def check_out(
    current_user: Dict[str, Any] = Depends(require_employee),
    repo: AttendanceRepository = Depends(get_attendance_repository)
):
    employee_id = current_user["employee_id"]
    return AttendanceService.check_out(employee_id, repo)

@router.get("/me", response_model=List[AttendanceResponse])
def get_my_attendance_history(
    current_user: Dict[str, Any] = Depends(require_employee),
    repo: AttendanceRepository = Depends(get_attendance_repository)
):
    employee_id = current_user["employee_id"]
    return AttendanceService.get_my_attendance_history(employee_id, repo)

@router.get("/me/today", response_model=AttendanceResponse)
def get_my_today_attendance(
    current_user: Dict[str, Any] = Depends(require_employee),
    repo: AttendanceRepository = Depends(get_attendance_repository)
):
    employee_id = current_user["employee_id"]
    return AttendanceService.get_today_attendance(employee_id, repo)

@router.get("", response_model=List[AttendanceResponse])
def get_all_attendance(
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    repo: AttendanceRepository = Depends(get_attendance_repository)
):
    return AttendanceService.get_all_attendance(repo)

@router.get("/{employee_id}", response_model=List[AttendanceResponse])
def get_employee_attendance(
    employee_id: str,
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    repo: AttendanceRepository = Depends(get_attendance_repository)
):
    return AttendanceService.get_employee_attendance(employee_id, repo)
