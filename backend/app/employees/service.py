from fastapi import HTTPException, status
from typing import List, Optional, Dict, Any

from app.employees.schemas import EmployeeResponse, EmployeeUpdate, EmployeeUpdateAdmin
from app.repositories.employee_repo import EmployeeRepository
from app.repositories.payroll_repo import PayrollRepository

class EmployeeService:
    @staticmethod
    def _enrich_employee(emp: Dict[str, Any], payroll_repo: PayrollRepository) -> Dict[str, Any]:
        """Helper to combine employee profile with basic salary from payroll."""
        employee_id = emp["employee_id"]
        payroll = payroll_repo.get_by_employee_id(employee_id)
        salary = payroll.get("basic_salary", 0.0) if payroll else 0.0
        
        enriched = dict(emp)
        enriched["salary"] = salary
        return enriched

    @classmethod
    def get_profile(cls, employee_id: str, emp_repo: EmployeeRepository, payroll_repo: PayrollRepository) -> EmployeeResponse:
        emp = emp_repo.get_by_id(employee_id)
        if not emp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        
        enriched = cls._enrich_employee(emp, payroll_repo)
        return EmployeeResponse(**enriched)

    @classmethod
    def get_all(cls, skip: int, limit: int, emp_repo: EmployeeRepository, payroll_repo: PayrollRepository) -> List[EmployeeResponse]:
        employees = emp_repo.get_all(skip=skip, limit=limit)
        enriched_list = []
        for emp in employees:
            enriched = cls._enrich_employee(emp, payroll_repo)
            enriched_list.append(EmployeeResponse(**enriched))
        return enriched_list

    @classmethod
    def update_profile(cls, employee_id: str, update_data: EmployeeUpdate, emp_repo: EmployeeRepository, payroll_repo: PayrollRepository) -> EmployeeResponse:
        emp = emp_repo.get_by_id(employee_id)
        if not emp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        
        # Only allow updating phone and address
        update_dict = update_data.model_dump(exclude_unset=True)
        # Drop profile_picture if we just store it in-memory as part of the profile
        updated_emp = emp_repo.update(employee_id, update_dict)
        
        enriched = cls._enrich_employee(updated_emp, payroll_repo)
        return EmployeeResponse(**enriched)

    @classmethod
    def update_profile_admin(cls, employee_id: str, update_data: EmployeeUpdateAdmin, emp_repo: EmployeeRepository, payroll_repo: PayrollRepository) -> EmployeeResponse:
        emp = emp_repo.get_by_id(employee_id)
        if not emp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        
        update_dict = update_data.model_dump(exclude_unset=True)
        updated_emp = emp_repo.update(employee_id, update_dict)
        
        enriched = cls._enrich_employee(updated_emp, payroll_repo)
        return EmployeeResponse(**enriched)

    @staticmethod
    def delete_employee(employee_id: str, emp_repo: EmployeeRepository) -> bool:
        emp = emp_repo.get_by_id(employee_id)
        if not emp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        return emp_repo.delete(employee_id)
