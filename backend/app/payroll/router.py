from fastapi import APIRouter, Depends, status
from typing import List, Dict, Any

from app.payroll.schemas import PayrollResponse, PayrollCreate, PayrollUpdate
from app.payroll.service import PayrollService
from app.core.deps import (
    require_employee,
    require_hr_or_admin,
    get_payroll_repository,
    get_notification_repository
)
from app.repositories.payroll_repo import PayrollRepository
from app.repositories.notification_repo import NotificationRepository

router = APIRouter(prefix="/api/payroll", tags=["Payroll"])

@router.get("/me", response_model=PayrollResponse)
def get_my_payroll(
    current_user: Dict[str, Any] = Depends(require_employee),
    repo: PayrollRepository = Depends(get_payroll_repository)
):
    employee_id = current_user["employee_id"]
    return PayrollService.get_payroll(employee_id, repo)

@router.get("", response_model=List[PayrollResponse])
def get_all_payrolls(
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    repo: PayrollRepository = Depends(get_payroll_repository)
):
    return PayrollService.get_all_payrolls(repo)

@router.get("/{employee_id}", response_model=PayrollResponse)
def get_employee_payroll(
    employee_id: str,
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    repo: PayrollRepository = Depends(get_payroll_repository)
):
    return PayrollService.get_payroll(employee_id, repo)

@router.post("/{employee_id}", response_model=PayrollResponse, status_code=status.HTTP_201_CREATED)
def create_employee_payroll(
    employee_id: str,
    data: PayrollCreate,
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    repo: PayrollRepository = Depends(get_payroll_repository)
):
    return PayrollService.create_payroll(employee_id, data, repo)

@router.put("/{employee_id}", response_model=PayrollResponse)
def update_employee_payroll(
    employee_id: str,
    data: PayrollUpdate,
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    repo: PayrollRepository = Depends(get_payroll_repository),
    notify_repo: NotificationRepository = Depends(get_notification_repository)
):
    return PayrollService.update_payroll(employee_id, data, repo, notify_repo)
