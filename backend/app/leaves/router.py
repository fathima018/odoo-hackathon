from fastapi import APIRouter, Depends, status, HTTPException
from typing import List, Dict, Any

from app.leaves.schemas import LeaveCreate, LeaveReview, LeaveResponse
from app.leaves.service import LeaveService
from app.core.deps import (
    require_employee,
    require_hr_or_admin,
    get_leave_repository,
    get_attendance_repository,
    get_notification_repository
)
from app.repositories.leave_repo import LeaveRepository
from app.repositories.attendance_repo import AttendanceRepository
from app.repositories.notification_repo import NotificationRepository

router = APIRouter(prefix="/api/leaves", tags=["Leaves"])

@router.post("", response_model=LeaveResponse, status_code=status.HTTP_201_CREATED)
def apply_leave(
    leave_data: LeaveCreate,
    current_user: Dict[str, Any] = Depends(require_employee),
    leave_repo: LeaveRepository = Depends(get_leave_repository),
    notify_repo: NotificationRepository = Depends(get_notification_repository)
):
    employee_id = current_user["employee_id"]
    return LeaveService.apply_leave(employee_id, leave_data, leave_repo, notify_repo)

@router.get("/me", response_model=List[LeaveResponse])
def get_my_leaves(
    current_user: Dict[str, Any] = Depends(require_employee),
    leave_repo: LeaveRepository = Depends(get_leave_repository)
):
    employee_id = current_user["employee_id"]
    return LeaveService.get_my_leaves(employee_id, leave_repo)

@router.get("", response_model=List[LeaveResponse])
def get_all_leaves(
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    leave_repo: LeaveRepository = Depends(get_leave_repository)
):
    return LeaveService.get_all_leaves(leave_repo)

@router.get("/{leave_id}", response_model=LeaveResponse)
def get_leave_by_id(
    leave_id: str,
    current_user: Dict[str, Any] = Depends(require_employee),
    leave_repo: LeaveRepository = Depends(get_leave_repository)
):
    # Retrieve leave and check ownership unless user is HR/Admin
    leave = LeaveService.get_leave_by_id(leave_id, leave_repo)
    if current_user["role"] not in ["hr", "admin"] and leave.employee_id != current_user["employee_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this leave request"
        )
    return leave

@router.delete("/{leave_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_leave(
    leave_id: str,
    current_user: Dict[str, Any] = Depends(require_employee),
    leave_repo: LeaveRepository = Depends(get_leave_repository)
):
    employee_id = current_user["employee_id"]
    LeaveService.delete_leave(leave_id, employee_id, leave_repo)
    return None

@router.put("/{leave_id}/approve", response_model=LeaveResponse)
def approve_leave(
    leave_id: str,
    review_data: LeaveReview,
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    leave_repo: LeaveRepository = Depends(get_leave_repository),
    attendance_repo: AttendanceRepository = Depends(get_attendance_repository),
    notify_repo: NotificationRepository = Depends(get_notification_repository)
):
    reviewer_id = current_user["employee_id"]
    return LeaveService.approve_leave(
        leave_id, reviewer_id, review_data, leave_repo, attendance_repo, notify_repo
    )

@router.put("/{leave_id}/reject", response_model=LeaveResponse)
def reject_leave(
    leave_id: str,
    review_data: LeaveReview,
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    leave_repo: LeaveRepository = Depends(get_leave_repository),
    notify_repo: NotificationRepository = Depends(get_notification_repository)
):
    reviewer_id = current_user["employee_id"]
    return LeaveService.reject_leave(leave_id, reviewer_id, review_data, leave_repo, notify_repo)
