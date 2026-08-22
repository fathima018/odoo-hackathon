from fastapi import APIRouter, Depends, Query, status
from typing import List, Dict, Any

from app.employees.schemas import EmployeeResponse, EmployeeUpdate, EmployeeUpdateAdmin
from app.employees.service import EmployeeService
from app.core.deps import (
    get_current_user,
    require_employee,
    require_hr_or_admin,
    get_employee_repository,
    get_payroll_repository
)
from app.repositories.employee_repo import EmployeeRepository
from app.repositories.payroll_repo import PayrollRepository

router = APIRouter(prefix="/api/employees", tags=["Employees"])

@router.get("/me", response_model=EmployeeResponse)
def get_my_profile(
    current_user: Dict[str, Any] = Depends(require_employee),
    emp_repo: EmployeeRepository = Depends(get_employee_repository),
    payroll_repo: PayrollRepository = Depends(get_payroll_repository)
):
    employee_id = current_user["employee_id"]
    return EmployeeService.get_profile(employee_id, emp_repo, payroll_repo)

@router.put("/me", response_model=EmployeeResponse)
def update_my_profile(
    update_data: EmployeeUpdate,
    current_user: Dict[str, Any] = Depends(require_employee),
    emp_repo: EmployeeRepository = Depends(get_employee_repository),
    payroll_repo: PayrollRepository = Depends(get_payroll_repository)
):
    employee_id = current_user["employee_id"]
    return EmployeeService.update_profile(employee_id, update_data, emp_repo, payroll_repo)

@router.get("", response_model=List[EmployeeResponse])
def get_all_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    emp_repo: EmployeeRepository = Depends(get_employee_repository),
    payroll_repo: PayrollRepository = Depends(get_payroll_repository)
):
    return EmployeeService.get_all(skip, limit, emp_repo, payroll_repo)

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee_by_id(
    employee_id: str,
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    emp_repo: EmployeeRepository = Depends(get_employee_repository),
    payroll_repo: PayrollRepository = Depends(get_payroll_repository)
):
    return EmployeeService.get_profile(employee_id, emp_repo, payroll_repo)

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee_by_admin(
    employee_id: str,
    update_data: EmployeeUpdateAdmin,
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    emp_repo: EmployeeRepository = Depends(get_employee_repository),
    payroll_repo: PayrollRepository = Depends(get_payroll_repository)
):
    return EmployeeService.update_profile_admin(employee_id, update_data, emp_repo, payroll_repo)

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee_by_admin(
    employee_id: str,
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    emp_repo: EmployeeRepository = Depends(get_employee_repository)
):
    EmployeeService.delete_employee(employee_id, emp_repo)
    return None
